// optimiser avec le cache via l'API de V8
require('v8-compile-cache');

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { request } = require("@octokit/request");
const fs = require('fs');
const cle = { _Hatclic_id_Capsa_Yq3t6w9z: '4t7w!z%CmYq3t6w9SgVkYp3saNdRgUkXF-J@NcRf$C&F)J@Mv9y$B&E)2s5v8y/BjXn2r5u8QfTjWnZr' };


// Warning listeners
process.setMaxListeners(0);

// connexion et chargement auto 
var Datastore = require('nedb'),
    db = new Datastore({ filename: app.getPath('appData') + '/' + app.getName() + '/Capsa.db', autoload: true, timestampData: true });

// clé d'authentification du fichier chargé
db.findOne(cle, function(err, doc) {
    // créer si init
    if (doc == null) {
        db.insert(cle, function(err, newDoc) { // Callback is optional
        });
    }
});


// classes
const YlSplash = require('./gestionnaire/outils/winsplash');
const YlCharg = require('./gestionnaire/outils/winCharg');
const YlChargEnCours = require('./gestionnaire/outils/winChargEnCours');
const YlMsg = require('./gestionnaire/outils/message');
const YlMsgInterface = require('./gestionnaire/outils/message-interface');
const YlDate = require('./gestionnaire/outils/date');
const YlRegion = require('./gestionnaire/outils/region');
const YlDonnees = require('./gestionnaire/outils/donnees');
const reg = new YlRegion();

// init.
let mainWindow = null;
let chargWindow = null;
let chargWindowEnCours = null;
let msg = null;
let date = new YlDate();
let donnees = new YlDonnees();
let docEdite = { societe: {}, client: {}, document: {} };
const message = new YlMsgInterface; // peut remplacer msg sans saisie
let urlUpdate = null;


/// DÉBUT SQUIRREL EVENT POUR DÉSINSTALLATION COMPLÈTE
if (require('electron-squirrel-startup')) return;
// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
};

function handleSquirrelEvent() {
    if (process.argv.length === 1) {
        return false;
    }
    const ChildProcess = require('child_process');
    const path = require('path');
    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);
    const spawn = function(command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, { detached: true });
        } catch (error) {}

        return spawnedProcess;
    };
    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    };
    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus
            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);
            setTimeout(app.quit, 1000);
            return true;
        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers
            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);
            setTimeout(app.quit, 1000);
            return true;
        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated
            app.quit();
            return true;
    };
};
/// FIN SQUIRREL EVENT

async function createWindow() {
    // fenetre principale
    mainWindow = new BrowserWindow({
        show: false,
        webPreferences: {
            worldSafeExecuteJavaScript: true,
            nodeIntegration: false, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            enableRemoteModule: false, // turn off remote
            preload: path.join(__dirname, "preload.js") // use a preload script
        },
        icon: __dirname + '/img/CAPSA.ico',
        backgroundColor: '#343a40',
    });
    // cacher le menu de la fenetre
    mainWindow.setMenu(null);
    mainWindow.minimize();

    // constructeur de msg
    msg = new YlMsg(mainWindow);

    // début fenêtre preparation
    chargWindow = new YlCharg(mainWindow);
    // début fenêtre chargement en cours
    chargWindowEnCours = new YlChargEnCours(mainWindow);

    // DEV
    mainWindow.setAlwaysOnTop(true, 'screen');
    mainWindow.show();
    mainWindow.maximize();
    mainWindow.setAlwaysOnTop(false, 'screen');
    mainWindow.webContents.openDevTools();
    // charger la vue principale
    mainWindow.loadFile(__dirname + '/index.html');


    // // PROD
    // // splash screen
    // let splash = new YlSplash(mainWindow);
    // // charger la vue principale
    // setTimeout(function() {
    //     splash.retirer();
    //     mainWindow.loadFile(__dirname + '/index.html');
    //     mainWindow.maximize();
    //     mainWindow.setAlwaysOnTop(true, 'screen');
    //     mainWindow.show();
    //     mainWindow.setAlwaysOnTop(false, 'screen');
    // }, 1234);


    // indexer les descriptions d'articles
    db.ensureIndex({ fieldName: 'art_descript', unique: true, sparse: true }, function(e) {
        if (e) {
            msg.warning(e);
        }
    });
    // indexer les groupes d'articles
    db.ensureIndex({ fieldName: 'art_groupe', sparse: true }, function(e) {
        if (e) {
            msg.warning(e);
        }
    });

    // debut de chargement dom (si trop long)
    ipcMain.on('debut-chrg', async function(event) {
        if (docEdite.document.facDev_lignes === undefined) {} else if (Object.keys(docEdite.document.facDev_lignes).length > 70) {
            try { chargWindowEnCours.montrer(); } catch (e) {}
        }
    });
    // fin de chargement dom
    ipcMain.on('fin-chrg', async function(event) {
        try { chargWindowEnCours.cacher(); } catch (e) {}
    })

    // nouveau + autres màj - afficher le document (init.)
    ipcMain.on('envoi-afficher-doc', async function(event) {
        // récupérer le document encours
        let retour = await docEnCours();
        // msg si avertissement ou erreur
        if (retour.val == 0) {
            let ok = true;
            if ((Object.keys(docEdite.societe).length === 0 && docEdite.societe.constructor === Object) &&
                (Object.keys(docEdite.client).length === 0 && docEdite.client.constructor === Object) &&
                (Object.keys(docEdite.document).length === 0 && docEdite.document.constructor === Object)) { ok = false }
            if (ok) {
                // trouver société
                if (docEdite.document.facDev_id_soc == null) {} else {
                    retour = await socEnCours(docEdite.document.facDev_id_soc);
                }
                // trouver client
                if (docEdite.document.facDev_id_cl == null) {} else {
                    retour = await clEnCours(docEdite.document.facDev_id_cl);
                }
                retour.rep = docEdite;
                // afficher chargement en cours ?
                if (docEdite.document.facDev_lignes === undefined) {} else if (Object.keys(docEdite.document.facDev_lignes).length > 70) {
                    try { chargWindowEnCours.montrer(); } catch (e) {}
                }
                mainWindow.webContents.send('retour-afficher-doc', retour);
            } // créer le document si besoin
            else {
                retourII = await docCreerEnCours()
                    // msg si avertissement ou erreur
                if (retourII.val == 0) {
                    retour.rep = docEdite;
                    mainWindow.webContents.send('retour-afficher-doc', retour);
                } else {
                    msg.warning(retourII.rep);
                }
            }
        } else {
            msg.warning(retour.rep);
        }
    });
    // nouveau - supprimer document
    ipcMain.on('envoi-supprimer-doc', async function(event) {
        let retour = await docVider();
        // msg si avertissement ou erreur
        if (retour.val == 0) {} else {
            msg.warning(retour.rep);
        }
        mainWindow.webContents.send('retour-supprimer-doc', retour);
    })

    ipcMain.on('envoi-creer-doc', async function(event) {
        // recréer le document en cours d'édition en base
        let retour = await docCreerEnCours();
        // msg si avertissement ou erreur
        if (retour.val == 0) {} else {
            msg.warning(retour.rep);
        }
        retour.rep = docEdite;
        mainWindow.webContents.send('retour-creer-doc', retour);
    })

    // enregistrer - numéro de facture
    ipcMain.on('envoi-numero', async function(event, infos) {
        let retour = await numero();
        // msg si avertissement ou erreur
        if (retour.val == 0) {
            docEdite.document.facDev_HT = infos.ht;
            docEdite.document.facDev_TTC = infos.ttc;
            docEdite.document.facDev_FR_num = infos.facDev_FR_num;
            docEdite.document.facDev_TVAs = infos.facDev_TVAs;
            let retourII = await majDocEnr();
            // msg si avertissement ou erreur
            if (retourII.val == 0) {
                // passer la facture réctifiée en annulée
                if (docEdite.document.facDev_FR_num == null) {} else {
                    let retour = await majDocANN(docEdite.document.facDev_FR_num);
                    // msg si avertissement ou erreur
                    if (retour.val == 0) {} else {
                        msg.warning(retour.rep);
                    }
                }
            } else {
                msg.warning(retourII.rep);
            }
        } else {
            msg.warning(retour.rep);
        }
        retour.rep = docEdite;
        mainWindow.webContents.send('retour-numero', retour);
    });
    // enregistrer - redimensionner
    ipcMain.on('envoi-redimensionner', async function(event) {
        let retour = await redimensionner();
        mainWindow.minimize();
        try {
            chargWindow.montrer();
        } catch (e) {
            r = e;
        }
        mainWindow.webContents.send('retour-redimensionner', retour);
    });
    // enregistrer - impression puis mail
    ipcMain.on('envoi-imprimer-facture-pdf', async function(event, courriel) {
        let retour = await imprimerFact();
        // restaurer la taille de la fenêtre
        mainWindow.restore();
        // continuer si la fenêtre de chargement a été fermée
        try {
            chargWindow.cacher();
        } catch (e) {}
        // msg si avertissement ou erreur
        if (retour == 0) {
            // Proposer de préparer un mail
            msg.questionCourriel().then(function(reponse) {
                if (reponse == 0) {
                    try {
                        if (new URL(courriel).protocol !== 'mailto:') {} else {
                            shell.openExternal(
                                courriel
                            );
                        }
                    } catch (e) {
                        msg.info("Seule une adresse de courriel valide est autorisée");
                    }
                }
            });
        } else {
            if (retour == 1) {} else
                msg.warning(retour);
        }
        mainWindow.webContents.send('retour-imprimer-facture-pdf', retour);
    });


    // gestion articles - code d'article unique
    ipcMain.on('envoi-code-article-gest', async function(event, code) {
        let retour = await codeUnique(code);
        // msg si avertissement ou erreur
        if (retour.val == 2) {
            msg.warning(retour.rep);
        }
        mainWindow.webContents.send('retour-code-art-gest', retour);
    });
    // gestion articles - description d'article unique
    ipcMain.on('envoi-description-article-gest', async function(event, description) {
        let retour = await descriptionUnique(description);
        // msg si avertissement ou erreur
        if (retour.val == 2) {
            msg.warning(retour.rep);
        }
        mainWindow.webContents.send('retour-desc-art-gest', retour);
    });
    // gestion articles - rechercher article par nom
    ipcMain.on('envoi-rech-article-gest', async function(event, nom) {
        let retour = await rechArt(nom);
        // msg si avertissement ou erreur
        if (retour.val == 2) {
            msg.warning(retour.rep);
        }
        mainWindow.webContents.send('retour-rech-article-gest', retour);
    });
    // gestion articles - chargement des groupes
    ipcMain.on('envoi-chg-grp-gest', async function(event) {
        let retour = await lireArticlesGrpTrieDesc();
        // msg si avertissement ou erreur
        if (retour.val == 1) {
            msg.warning(retour.rep);
        }
        mainWindow.webContents.send('retour-chg-grp-gest', retour);
    });
    // gestion articles - supp article
    ipcMain.on('envoi-gest-supp-art', async function(event, id) {
        // vérifier s'il est utilisé
        let retour = await artUtilise(id);
        // msg si avertissement ou erreur
        if (retour.val == 0) {
            // suppression de l'article
            let retourII = await suppArt(id);
            // msg si avertissement ou erreur
            if (retourII.val == 0) {} else {
                msg.warning(retourII.rep);
            }
        } else if (retour.val == 2) {
            msg.warning(retour.rep);
        } else {
            msg.info("L'article n'a pas été supprimé, car il est utilisé dans une ou plusieurs factures.");
        }
        mainWindow.webContents.send('retour-gest-supp-art', retour);
    });
    // gestion articles - màj article
    ipcMain.on('envoi-maj-art', async function(event, article) {
        article.art_prix = reg.virgule(article.art_prix);
        article.art_tva = reg.virgule(article.art_tva);

        let retour = await majArticle(article);
        // msg si avertissement ou erreur
        if (retour.val == 0) {} else {
            msg.warning(retour.rep);
        }
        retour.rep = docEdite;
        mainWindow.webContents.send('retour-maj-art', retour);
    });


    // données - sauvegarder bdd
    ipcMain.on('envoi-sauvegarde-bdd', async function(event) {
        let retour = await backupBDD();
        // msg si avertissement ou erreur
        if (retour == 0) {} else if (retour == -1) {
            msg.warningTxt("Le logiciel n'importe que les fichiers Capsa avec l'extension .db.");
        } else {
            msg.warning(retour);
        }
    })

    // facture/devis article - au moins un article
    ipcMain.on('envoi-rech-articles-presents', async function(event) {
        let retour = await trouverArticle();
        // msg si avertissement ou erreur
        if (retour.val == 1) {
            msg.warning(retour.rep);
        }
        mainWindow.webContents.send('retour-rech-articles-presents', retour);
    });

    // facture/devis article - chargement des articles et groupes
    ipcMain.on('envoi-chg-art+grp', async function(event) {
        let retour = await articlesEtGrp();
        // msg si avertissement ou erreur
        if (retour.val0 == 1) {
            msg.warning(retour.rep0);
        }
        if (retour.val1 == 1) {
            msg.warning(retour.rep1);
        }
        mainWindow.webContents.send('retour-chg-art+grp', retour);
    });
    // facture/devis article - chargement des groupes
    ipcMain.on('envoi-chg-grp', async function(event) {
        let retour = await lireArticlesGrpTrieDesc();
        // msg si avertissement ou erreur
        if (retour.val == 1) {
            msg.warning(retour.rep);
        }
        mainWindow.webContents.send('retour-chg-grp', retour);
    });
    // facture/devis article - description d'article unique
    ipcMain.on('envoi-description-article', async function(event, description) {
        let retour = await descriptionUnique(description);
        // msg si avertissement ou erreur
        if (retour.val == 2) {
            msg.warning(retour.rep);
        }
        mainWindow.webContents.send('retour-desc-art', retour);
    });
    // facture/devis article - code d'article unique
    ipcMain.on('envoi-code-article', async function(event, code) {
        let retour = await codeUnique(code);
        // msg si avertissement ou erreur
        if (retour.val == 2) {
            msg.warning(retour.rep);
        }
        mainWindow.webContents.send('retour-code-art', retour);
    });
    // facture/devis article - nouvel article
    ipcMain.on('envoi-enreg-nouv-art', async function(event, article) {
        article.art_prix = reg.virgule(article.art_prix);
        article.art_tva = reg.virgule(article.art_tva);
        article.art_remise = reg.virgule(article.art_remise);

        let retour = await enregistrerNouvelArticle(article);
        // msg si avertissement ou erreur
        if (retour.val == 0) {
            let ligne = {
                fD_art_id: retour.rep._id,
                fD_art_descript: retour.rep.art_descript,
                fD_art_code: retour.rep.art_code,
                fD_art_prix: retour.rep.art_prix,
                fD_art_qte: retour.req.art_qte,
                fD_art_remise: retour.req.art_remise,
                fD_art_tva: retour.req.art_tva
            }
            let retourII = await majDocArtEx(ligne);
            // msg si avertissement ou erreur
            if (retourII.val == 0) {} else {
                msg.warning(retourII.rep);
            }
        } else {
            msg.warning(retour.rep);
        }

        retour.rep = docEdite;
        mainWindow.webContents.send('retour-enreg-nouv-art', retour);
    });
    // facture/devis article - nouvelle société
    ipcMain.on('envoi-enreg-nouv-soc', async function(event, soc) {
        soc.soc_tva = reg.virgule(soc.soc_tva);
        let retour = await enregistrerNouvelleSociete(soc);
        // msg si avertissement ou erreur
        if (retour.val == 0) {
            // màj la société du document 
            let retourII = await majDocSoc(docEdite.societe);
            // msg si avertissement ou erreur
            if (retourII.val == 0) {} else {
                msg.warning(retourII.rep);
            }
        } else {
            msg.warning(retour.rep);
        }
        retour.rep = docEdite;
        mainWindow.webContents.send('retour-enreg-nouv-soc', retour);
    });
    // facture/devis article - nouveau client
    ipcMain.on('envoi-enreg-nouv-cl', async function(event, cl) {
        let retour = await enregistrerNouveauClient(cl);
        // msg si avertissement ou erreur
        if (retour.val == 0) {
            // màj client du document 
            let retourII = await majDocCl(docEdite.client);
            // msg si avertissement ou erreur
            if (retourII.val == 0) {} else {
                msg.warning(retourII.rep);
            }
        } else {
            msg.warning(retour.rep);
        }
        retour.rep = docEdite;
        mainWindow.webContents.send('retour-enreg-nouv-cl', retour);
    });
    // facture/devis article - maj document (art)
    ipcMain.on('envoi-document-maj-art-ex', async function(event, fD) {
        // saisie vers base
        fD.ligne.fD_art_remise = reg.virgule(fD.ligne.fD_art_remise);

        let retour = await majDocArtEx(fD.ligne);
        // msg si avertissement ou erreur
        if (retour.val == 0) {
            // màj du stock
            let retourII = await majStock(fD.ligne.fD_art_id, fD.stock);
            if (retourII.val == 0) {} else {
                msg.warning(retourII.rep);
            }
        } else {
            msg.warning(retour.rep);
        }
        retour.rep = docEdite;
        mainWindow.webContents.send('retour-document-maj-art-ex', retour);
    });
    // facture/devis article - maj document (soc)
    ipcMain.on('envoi-document-maj-soc-ex', async function(event, soc) {
        let retour = await majDocSoc(soc);
        // msg si avertissement ou erreur
        if (retour.val == 0) {} else {
            msg.warning(retour.rep);
        }
        retour.rep = docEdite;
        mainWindow.webContents.send('retour-document-maj-soc-ex', retour);
    });
    // facture/devis article - maj document (cl)
    ipcMain.on('envoi-document-maj-cl-ex', async function(event, cl) {
        let retour = await majDocCl(cl);
        // msg si avertissement ou erreur
        if (retour.val == 0) {} else {
            msg.warning(retour.rep);
        }
        retour.rep = docEdite;
        mainWindow.webContents.send('retour-document-maj-cl-ex', retour);
    });
    // facture/devis article - rectification de facture
    ipcMain.on('envoi-document-rect-fact', async function(event, numFR) {
        let retour = await majDocFR(numFR);
        // msg si avertissement ou erreur
        if (retour.val == 0) {} else {
            msg.warning(retour.rep);
        }
        retour.rep = docEdite;
        mainWindow.webContents.send('retour-document-rect-fact', retour);
    });


    // facture/devis article - supp article
    ipcMain.on('envoi-supp-ligne', async function(event, obj) {
        // màj lignes
        let retour = await majDocArtSupp(obj.facDev_lignes);
        // msg si avertissement ou erreur
        if (retour.val == 0) {} else {
            msg.warning(retour.rep);
        }
        // màj du stock (lecture)
        let retourII = await lireStock(obj.id);
        // msg si avertissement ou erreur
        if (retourII.val == 0) {
            // stock récupéré
            let stock = (Number(retourII.rep) + Number(obj.qte)) + '';
            let retourIII = await majStock(obj.id, stock);
            if (retourIII.val == 0) { /*stock màj*/ } else {
                msg.warning(retourIII.rep);
            }
        } else {
            msg.warning(retourII.rep);
        }
        mainWindow.webContents.send('retour-supp-ligne', retour);
    });

    // facture/devis article - au moins une societe
    ipcMain.on('envoi-rech-societes-presentes', async function(event) {
        let retour = await trouverSociete();
        // msg si avertissement ou erreur
        if (retour.val == 1) {
            msg.warning(retour.rep);
        }
        mainWindow.webContents.send('retour-rech-societes-presentes', retour);
    });

    // facture/devis article - chargement des sociétés
    ipcMain.on('envoi-chg-societes', async function(event) {
        let retour = await lireSocietes();
        // msg si avertissement ou erreur
        if (retour.val == 1) {
            msg.warning(retour.rep);
        }
        mainWindow.webContents.send('retour-chg-societes', retour);
    });
    // facture/devis article - chargement des clients
    ipcMain.on('envoi-chg-clients', async function(event) {
        let retour = await lireClients();
        // msg si avertissement ou erreur
        if (retour.val == 1) {
            msg.warning(retour.rep);
        }
        mainWindow.webContents.send('retour-chg-clients', retour);
    });

    // facture/devis article - au moins un client
    ipcMain.on('envoi-rech-clients-presents', async function(event) {
        let retour = await trouverClient();
        // msg si avertissement ou erreur
        if (retour.val == 1) {
            msg.warning(retour.rep);
        }
        mainWindow.webContents.send('retour-rech-clients-presents', retour);
    });

    // facture/devis article - chargement des factures
    ipcMain.on('envoi-chg-fact', async function(event) {
        let retour = await lireFactures();
        // msg si avertissement ou erreur
        if (retour.val == 1) {
            msg.warning(retour.rep);
        } else {
            // récupérer les clients
            retour.rep0 = [];
            for (let i = 0; i < retour.rep.length; i++) {
                let retourII = await lireClient(retour.rep[i].facDev_id_cl);
                // msg si avertissement ou erreur
                if (retourII.val == 1) {} else {
                    retour.rep0.push(retourII.rep);
                }
            }
        }
        mainWindow.webContents.send('retour-chg-fact', retour);
    });
    // facture/devis article - nom de société unique
    ipcMain.on('envoi-nom-societe', async function(event, description) {
        let retour = await nomUnique(description);
        // msg si avertissement ou erreur
        if (retour.val == 2) {
            msg.warning(retour.rep);
        }
        mainWindow.webContents.send('retour-nom-societe', retour);
    });
    // facture/devis article - rechercher société par nom
    ipcMain.on('envoi-rech-societe', async function(event, nom) {
        let retour = await rechSoc(nom);
        // msg si avertissement ou erreur
        if (retour.val == 2) {
            msg.warning(retour.rep);
        }
        mainWindow.webContents.send('retour-rech-societe', retour);
    });
    // facture/devis article - rechercher client par nom
    ipcMain.on('envoi-rech-client', async function(event, nom) {
        let retour = await rechCl(nom);
        // msg si avertissement ou erreur
        if (retour.val == 2) {
            msg.warning(retour.rep);
        }
        mainWindow.webContents.send('retour-rech-client', retour);
    });
    // facture/devis article - rechercher article par nom
    ipcMain.on('envoi-rech-article', async function(event, nom) {
        let retour = await rechArt(nom);
        // msg si avertissement ou erreur
        if (retour.val == 2) {
            msg.warning(retour.rep);
        }
        mainWindow.webContents.send('retour-rech-article', retour);
    });



    /// Début mise à jour Github
    ipcMain.on('envoi-maj', function() {
        if (urlUpdate.startsWith('https://github.com/Lob2018/Capsa/releases/download/')) shell.openExternal(urlUpdate);
    });
    // maj disponible ?
    ipcMain.on('envoi-maj-dispo', async function(event) {
        let code;
        let retour;
        try {
            retour = await request('GET /repos/{owner}/{repo}/releases', {
                owner: 'Lob2018',
                repo: 'Capsa'
            })
            urlUpdate = retour.data[0].assets[0].browser_download_url;
            code = 0;
        } catch (e) {
            retour = e;
            code = 1;
        } finally {
            data = { 'val': code, 'version': app.getVersion(), 'rep': retour }
            mainWindow.webContents.send('retour-maj-dispo', data);
        }
    });
    /// Fin mise à jour Github


};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});


// nouveau - afficher le document
function docEnCours() {
    return new Promise(function(retour) {
        db.find({ facDev_creation: true }).exec(function(e, docs) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                let ok = Array.isArray(docs) && docs.length > 0;
                if (ok) {
                    // stocker le document (facture/devis/rectif) dans main.
                    docEdite.document = docs[0];
                }
                retour({ val: 0, rep: docEdite });
            }
        });
    });
};
// récupérer la société du document en cours
function socEnCours(id) {
    return new Promise(function(retour) {
        db.find({ _id: id }).exec(function(e, soc) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                // stocker societe dans main.
                docEdite.societe = soc[0];
                retour({ val: 0, rep: soc });
            }
        });
    });
}
// récupérer le client du document en cours
function clEnCours(id) {
    return new Promise(function(retour) {
        db.find({ _id: id }).exec(function(e, cl) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                // stocker client dans main.
                docEdite.client = cl[0];
                docEdite.document.facDev_id_cl = id;
                retour({ val: 0, rep: cl });
            }
        });
    });
}
// nouveau - créer le document en base
function docCreerEnCours() {
    return new Promise(function(retour) {
        let ok = true;
        if (docEdite.societe._id == undefined || docEdite.societe._id == null) ok = false;

        let facDev = {
            facDev_type: '0',
            facDev_creation: true,
            facDev_num: null,
            facDev_id_soc: ok ? docEdite.societe._id : null,
            facDev_id_cl: null,
            facDev_lignes: [],
            facDev_HT: '0,00',
            facDev_TTC: '0,00',
            facDev_FR_num: null
        };
        db.insert(facDev, function(e, doc) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                docEdite = {
                    societe: ok ? docEdite.societe : {},
                    client: {},
                    document: doc
                };
                retour({ val: 0, rep: doc });
            }
        });
    });
};
// nouveau - vider le document
function docVider() {
    return new Promise(function(retour) {
        let ok = true;
        if (docEdite.societe._id == undefined || docEdite.societe._id == null) ok = false;
        db.update({ facDev_creation: true }, {
            $set: {
                facDev_type: '0',
                facDev_creation: true,
                facDev_num: null,
                facDev_id_soc: ok ? docEdite.societe._id : null,
                facDev_id_cl: null,
                facDev_lignes: [],
                facDev_HT: '0,00',
                facDev_TTC: '0,00',
                facDev_FR_num: null
            }
        }, { multi: true }, function(e, numRemoved) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                docEdite = {
                    societe: ok ? docEdite.societe : {},
                    client: {},
                    document: {
                        facDev_type: '0',
                        facDev_creation: true,
                        facDev_num: null,
                        facDev_id_soc: null,
                        facDev_id_cl: null,
                        facDev_lignes: [],
                        facDev_HT: '0,00',
                        facDev_TTC: '0,00',
                        facDev_FR_num: null
                    }
                };
                retour({ val: 0, rep: docEdite });
            }
        });
    });
}

// enregistrer - numéroter
function numero() {
    let t = am = '';
    am = date.getAnMo();

    // devis ?
    if (docEdite.document.facDev_type == '1') {
        t = 'D-';
        return new Promise(function(retour) {
            db.find({ facDev_type: '1', facDev_creation: false }).sort({ createdAt: -1 }).limit(1).exec(function(e, docs) {
                if (e) {
                    retour({ val: 1, rep: e });
                } else {
                    if (Array.isArray(docs) && docs.length > 0) {
                        docEdite.document.facDev_num = t + am + ajNumFact(docs[0].facDev_num, am);
                    } else {
                        docEdite.document.facDev_num = t + am + '-1';
                    }
                    retour({ val: 0, rep: docEdite });
                }
            });
        });
    } else {
        if (docEdite.document.facDev_type == '-1') { t = 'FERR-' } else if (docEdite.document.facDev_type == '0') { t = 'F-' } else t = 'FR-';
        return new Promise(function(retour) {
            db.find({ $or: [{ facDev_type: '-1' }, { facDev_type: '0' }, { facDev_type: '2' }], facDev_creation: false }).sort({ createdAt: -1 }).limit(1).exec(function(e, docs) {
                if (e) {
                    retour({ val: 1, rep: e });
                } else {
                    if (Array.isArray(docs) && docs.length > 0) {
                        docEdite.document.facDev_num = t + am + ajNumFact(docs[0].facDev_num, am);
                    } else {
                        docEdite.document.facDev_num = t + am + '-1';
                    }
                    retour({ val: 0, rep: docEdite });
                }
            });
        });
    }
}
// enregistrer - imprimer une facture
function imprimerFact() {
    return new Promise(function(retour) {
        // imprime fenetre en pdf
        mainWindow.webContents.printToPDF({}).then(data => {
            dialog.showSaveDialog({
                // chemin et nom fichier
                defaultPath: app.getPath('desktop') + '/' + docEdite.document.facDev_num + '.pdf',
            }).then((result) => {
                // ecriture
                let ret = 1;
                try {
                    fs.writeFileSync(result.filePath, data, 'utf-8');
                    ret = 0;
                } catch (e) {
                    // abandon
                    if (e.startsWith('Error: ENOENT: no such file or directory, open')) {} // Erreur                    
                    else ret = e;
                } finally {
                    retour(ret);
                }
            }).catch(function(e) {
                retour(e);
            });
        });
    });
};
// enregistrer - redimensionner + mettre à jour societe par defaut
function redimensionner() {
    return new Promise(function(retour) {
        // redimensionner la fenêtre pour l'impression
        mainWindow.maximize();
        // màj societe par défaut
        db.update({ _id: docEdite.societe._id }, {
            $set: { soc_type: 1 }
        }, { multi: true }, function(e, numRemoved) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                docEdite.societe.soc_type = '1';
                retour({ val: 0, rep: numRemoved });
            };
        });
    });
};

// gestion articles - utlisé ?
function artUtilise(id) {
    return new Promise(function(retour) {
        db.findOne({ "facDev_lignes.fD_art_id": id }, function(e, doc) {
            if (e) {
                retour({ val: 2, rep: e });
            } else if (doc == null) {
                retour({ val: 0, rep: doc });
            } else {
                retour({ val: 1, rep: doc, last: date.getDateExistante(doc.updatedAt) });
            }
        });
    });
}
// gestion articles - supp article
function suppArt(id) {
    return new Promise(function(retour) {
        db.remove({ _id: id }, {}, function(e, numRemoved) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                retour({ val: 0, rep: numRemoved });
            }
        });
    });
}
// gestion articles - màj article
function majArticle(art) {
    return new Promise(function(retour) {
        db.update({ _id: art._id }, {
            $set: { art_descript: art.art_descript, art_code: art.art_code, art_prix: art.art_prix, art_groupe: art.art_groupe, art_stock: art.art_stock, art_tva: art.art_tva }
        }, { multi: false }, function(e, numRemoved) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                retour({ val: 0, rep: numRemoved });
            };
        });
    });
}

// données - backup et restore de la base complète
function backupBDD() {
    return new Promise(function(retour) {
        // Importer ou exporter les données
        msg.questionImpExpDatas().then(function(reponse) {
            if (reponse == 0) {
                // importer
                dialog.showOpenDialog({}).then((result) => {
                    let ret = 0;
                    if (result.filePaths[0].toUpperCase().split('.').pop() == 'DB') {
                        try {
                            // lire
                            fs.readFile(result.filePaths[0], 'utf-8', (e, data) => {
                                if (e) {
                                    retour(e);
                                } else {
                                    // tester si la cle est dans le fichier
                                    if (data.includes('{"_Hatclic_id_Capsa_Yq3t6w9z":"' + cle._Hatclic_id_Capsa_Yq3t6w9z + '"')) {
                                        // écrire
                                        try {
                                            fs.writeFileSync(app.getPath('appData') + '/' + app.getName() + '/Capsa.db', data, 'utf-8');
                                            app.relaunch();
                                            app.exit();
                                        } catch (e) {
                                            retour(e);
                                        }
                                    } else {
                                        msg.info('Le fichier n\'a pas été importé, car ce n\'est pas un fichier Capsa.');
                                        retour(0);
                                    }
                                }
                            });
                        } catch (e) {
                            if (typeof(ret) === 'object' && ret.code == "ERR_INVALID_ARG_TYPE") {
                                retour(0);
                            } else {
                                retour(e);
                            }
                        }
                    } else {
                        retour(-1);
                    }
                }).catch(function(e) {
                    if (e == "TypeError: Cannot read property 'toUpperCase' of undefined") {
                        retour(0);
                    } else retour(e);
                });
            } else if (reponse == 1) {
                // exporter
                fs.readFile(app.getPath('appData') + '/' + app.getName() + '/Capsa.db', 'utf-8', (e, data) => {
                    if (e) {
                        retour(e);
                    } else {
                        dialog.showSaveDialog({
                            // chemin et nom fichier
                            defaultPath: app.getPath('desktop') + '/Sauvegarde_Capsa.db',
                        }).then((result) => {
                            let ret = 0;
                            // ecriture
                            try {
                                fs.writeFileSync(result.filePath, data, 'utf-8');
                                let path = app.getPath('appData').replace(/\\/g, '\/');
                                msg.info('Même après une désinstallation complète de Capsa, toutes vos données resteront accessibles dans le dossier du logiciel :\n\n' +
                                    path + '/' + app.getName());
                            } catch (e) {
                                // Erreur ou abandon
                                if (e.code == 'ENOENT') {
                                    retour(0);
                                } else retour(e);
                            }
                        }).catch(function(e) {
                            retour(e);
                        });
                    }
                });
            } else {
                // annulation
                retour(0);
            }
        });
    });
}

// facture/devis article - créer article
function enregistrerNouvelArticle(nouvDatas) {
    let larticle = {
        art_descript: nouvDatas.art_descript,
        art_code: nouvDatas.art_code,
        art_prix: nouvDatas.art_prix,
        art_tva: nouvDatas.art_tva,
        art_groupe: nouvDatas.art_groupe,
        art_stock: nouvDatas.art_stock
    };
    return new Promise(function(retour) {
        db.insert(larticle, function(e, doc) {
            if (e) {
                retour({ val: 1, rep: e, req: nouvDatas });
            } else {
                retour({ val: 0, rep: doc, req: nouvDatas });
            }
        });
    });
};
// facture/devis article - créer société
function enregistrerNouvelleSociete(soc) {
    return new Promise(function(retour) {
        db.insert(soc, function(e, doc) {
            if (e) {
                retour({ val: 1, rep: e, req: soc });
            } else {
                docEdite.societe = doc;
                docEdite.document.facDev_id_soc = doc._id;
                retour({ val: 0, rep: doc, req: soc });
            }
        });
    });
};
// facture/devis article - créer client
function enregistrerNouveauClient(cl) {
    return new Promise(function(retour) {
        db.insert(cl, function(e, doc) {
            if (e) {
                retour({ val: 1, rep: e, req: cl });
            } else {
                docEdite.client = doc;
                docEdite.document.facDev_id_cl = cl._id;
                retour({ val: 0, rep: doc, req: cl });
            }
        });
    });
};
// facture/devis article - maj du document (art)
function majDocArtEx(facDev) {
    // ajout de la ligne
    return new Promise(function(retour) {
        db.update({ facDev_creation: true }, {
            $push: { facDev_lignes: facDev }
        }, { multi: true }, function(e, numRemoved) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                docEdite.document.facDev_lignes.push(facDev);
                retour({ val: 0, rep: numRemoved });
            };
        });
    });
}
// facture/devis article - maj du document à l'enregistrement
function majDocEnr() {
    return new Promise(function(retour) {
        db.update({ facDev_creation: true }, {
            $set: { facDev_num: docEdite.document.facDev_num, facDev_HT: docEdite.document.facDev_HT, facDev_TTC: docEdite.document.facDev_TTC, facDev_FR_num: docEdite.document.facDev_FR_num, facDev_creation: false, facDev_TVAs: docEdite.document.facDev_TVAs }
        }, { multi: true }, function(e, numRemoved) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                docEdite.document.facDev_creation = false;
                retour({ val: 0, rep: docEdite });
            };
        });
    });
}

// facture/devis article - au moins un article
function trouverArticle() {
    return new Promise(function(retour) {
        db.findOne({ art_descript: { $exists: true } }).exec(function(e, docs) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                retour({ val: 0, rep: docs });
            }
        });
    });
}


// facture/devis article - maj du stock d'un article
function majStock(id, qte) {
    return new Promise(function(retour) {
        db.update({ _id: id }, {
            $set: { art_stock: qte }
        }, { multi: true }, function(e, numRemoved) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                retour({ val: 0, rep: numRemoved });
            };
        });
    });
}
// facture/devis article - supp ligne
function majDocArtSupp(lignes) {
    return new Promise(function(retour) {
        db.update({ facDev_creation: true }, {
            $set: { facDev_lignes: lignes }
        }, { multi: true }, function(e, numRemoved) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                docEdite.document.facDev_lignes = lignes;
                retour({ val: 0, rep: docEdite });
            };
        });
    });
};
// facture/devis article - lire le stock d'un article
function lireStock(id) {
    return new Promise(function(retour) {
        db.find({ _id: id }).exec(function(e, docs) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                retour({ val: 0, rep: docs[0].art_stock });
            }
        });
    });
}
// facture/devis article - description d'article unique
function descriptionUnique(description) {
    return new Promise(function(retour) {
        db.findOne({ art_descript: description }, function(e, doc) {
            if (e) {
                retour({ val: 2, rep: e });
            } else if (doc == null) {
                retour({ val: 0, rep: doc });
            } else {
                retour({ val: 1, rep: doc, last: date.getDateExistante(doc.updatedAt) });
            }
        });
    });
}
// facture/devis article - nom de société unique
function nomUnique(nom) {
    return new Promise(function(retour) {
        db.findOne({ soc_denom: nom }, function(e, doc) {
            if (e) {
                retour({ val: 2, rep: e });
            } else if (doc == null) {
                retour({ val: 0, rep: doc });
            } else {
                retour({ val: 1, rep: doc, last: date.getDateExistante(doc.updatedAt) });
            }
        });
    });
}
// facture/devis article - rechercher société par nom
function rechSoc(nom) {
    return new Promise(function(retour) {
        if (nom == '') retour({ val: 1, rep: null });
        else {
            n = new RegExp('^' + nom);
            db.find({
                soc_type: { $ne: -1 },
                soc_denom: { $regex: n }
            }, function(e, docs) {
                if (e) {
                    retour({ val: 2, rep: e });
                } else if (Array.isArray(docs) && docs.length > 0) {
                    retour({ val: 0, rep: docs });
                } else {
                    retour({ val: 1, rep: null });
                }
            });
        }
    });
}
// facture/devis article - rechercher client par nom
function rechCl(nom) {
    return new Promise(function(retour) {
        if (nom == '') retour({ val: 1, rep: null });
        else {
            n = new RegExp('^' + nom);
            db.find({
                soc_type: -1,
                soc_denom: { $regex: n }
            }, function(e, docs) {
                if (e) {
                    retour({ val: 2, rep: e });
                } else if (Array.isArray(docs) && docs.length > 0) {
                    retour({ val: 0, rep: docs });
                } else {
                    retour({ val: 1, rep: null });
                }
            });
        }
    });
}
// facture/devis article - rechercher article par nom
function rechArt(nom) {
    return new Promise(function(retour) {
        if (nom == '') retour({ val: 1, rep: null });
        else {
            n = new RegExp('^' + nom);
            db.find({
                art_descript: { $regex: n }
            }, function(e, docs) {
                if (e) {
                    retour({ val: 2, rep: e });
                } else if (Array.isArray(docs) && docs.length > 0) {
                    retour({ val: 0, rep: docs });
                } else {
                    retour({ val: 1, rep: null });
                }
            });
        }
    });
}
// facture/devis société - maj du document en 0:F 1:DEVIS ou si autre:FR
function majDocFR(numFR) {
    //facture ou devis, sinon facture rectificative
    if (numFR == '0' || numFR == '1') {
        return new Promise(function(retour) {
            db.update({ facDev_creation: true }, {
                $set: { facDev_type: numFR, facDev_FR_num: null }
            }, { multi: true }, function(e, numRemoved) {
                if (e) {
                    retour({ val: 1, rep: e });
                } else {
                    docEdite.document.facDev_type = numFR;
                    docEdite.document.facDev_FR_num = null;
                    retour({ val: 0, rep: numRemoved });
                };
            });
        });
    } else {
        // màj de l'id
        return new Promise(function(retour) {
            db.update({ facDev_creation: true }, {
                $set: { facDev_type: '2', facDev_FR_num: numFR }
            }, { multi: true }, function(e, numRemoved) {
                if (e) {
                    retour({ val: 1, rep: e });
                } else {
                    docEdite.document.facDev_type = '2';
                    docEdite.document.facDev_FR_num = numFR;
                    retour({ val: 0, rep: numRemoved });
                };
            });
        });
    }
}
// facture/devis société - maj du document réctifié en annulé
function majDocANN(n) {
    return new Promise(function(retour) {
        db.update({ facDev_num: n }, {
            $set: { facDev_type: '-1', facDev_FR_num: docEdite.document.facDev_num, facDev_num: reTypeNumFact('FERR', n) }
        }, { multi: true }, function(e, numRemoved) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                retour({ val: 0, rep: numRemoved });
            };
        });
    });
}
// facture/devis société - maj du document (soc)
function majDocSoc(soc) {
    // màj de l'id
    return new Promise(function(retour) {
        db.update({ facDev_creation: true }, {
            $set: { facDev_id_soc: soc._id }
        }, { multi: true }, function(e, numRemoved) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                docEdite.societe = soc;
                docEdite.document.facDev_id_soc = soc._id;
                retour({ val: 0, rep: numRemoved });
            };
        });
    });
}
// facture/devis société - maj du document (cl)
function majDocCl(cl) {
    // màj de l'id
    return new Promise(function(retour) {
        db.update({ facDev_creation: true }, {
            $set: { facDev_id_cl: cl._id }
        }, { multi: true }, function(e, numRemoved) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                docEdite.client = cl;
                docEdite.document.facDev_id_cl = cl._id;
                retour({ val: 0, rep: numRemoved });
            };
        });
    });
}
// facture/devis article - code d'article unique
function codeUnique(code) {
    return new Promise(function(retour) {
        db.findOne({ art_code: code }, function(e, doc) {
            if (e) {
                retour({ val: 2, rep: e });
            } else if (doc == null) {
                retour({ val: 0, rep: doc });
            } else {
                retour({ val: 1, rep: doc, last: date.getDateExistante(doc.updatedAt) });
            }
        });
    });
}
// facture/devis article - récupérer les articles groupés, et non groupés (A&B)
function articlesEtGrp() {
    return new Promise(async function(retour) {
        let artsGrpes = await lireArticlesGrpTrieDesc();
        let artsNnGrpes = await lireArticlesNnGrpTrieDesc();
        retour({ val0: artsGrpes.val, val1: artsNnGrpes.val, rep0: artsGrpes.rep, rep1: artsNnGrpes.rep });
    });
}
// (A)facture/devis article - récupérer les articles groupés, et triés par descriptions (ordre croissant)
function lireArticlesGrpTrieDesc() {
    return new Promise(function(retour) {
        // récupérer les articles groupés, et triés par ordre croissant
        db.find({ art_descript: { $exists: true }, $not: { art_groupe: null } }).sort({ art_groupe: 1 }).exec(function(e, docs) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                // distinct des groupes
                let donneesGrp = [];
                let grp = '';
                for (let i = 0; i < docs.length; i++) {
                    if (grp == docs[i].art_groupe) {} else {
                        // récupérer le tableau des objets du groupe, triés par descriptions
                        donneesGrp.push(
                            donnees.tabTrieParCle(
                                donnees.tabGrp(docs, docs[i].art_groupe), "art_descript")
                        );
                    }
                    grp = docs[i].art_groupe;
                }
                retour({ val: 0, rep: donneesGrp });
            }
        });
    });
}
// (B)facture/devis article - récupérer les articles non groupés, triés par descriptions (ordre croissant)
function lireArticlesNnGrpTrieDesc() {
    return new Promise(function(retour) {
        db.find({ art_groupe: null, art_descript: { $exists: true } }).sort({ art_descript: 1 }).exec(function(e, docs) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                retour({ val: 0, rep: docs });
            }
        });
    });
}
// facture/devis article - au moins une société
function trouverSociete() {
    return new Promise(function(retour) {
        db.findOne({ $or: [{ soc_type: 0 }, { soc_type: 1 }] }).exec(function(e, docs) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                retour({ val: 0, rep: docs });
            }
        });
    });
}
// facture/devis article - récupérer les sociétés
function lireSocietes() {
    return new Promise(function(retour) {
        db.find({ $or: [{ soc_type: 0 }, { soc_type: 1 }] }).sort({ updatedAt: -1 }).exec(function(e, docs) {
            // db.find({ soc_type: 0 }).sort({ updatedAt: -1 }).exec(function(e, docs) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                retour({ val: 0, rep: docs });
            }
        });
    });
}
// facture/devis article - au moins un client
function trouverClient() {
    return new Promise(function(retour) {
        db.findOne({ soc_type: -1 }).exec(function(e, docs) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                retour({ val: 0, rep: docs });
            }
        });
    });
}
// facture/devis article - récupérer les clients
function lireClients() {
    return new Promise(function(retour) {
        db.find({ soc_type: -1 }).exec(function(e, docs) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                retour({ val: 0, rep: docs });
            }
        });
    });
}
// facture/devis article - récupérer le client
function lireClient(id) {
    return new Promise(function(retour) {
        db.findOne({ _id: id }).exec(function(e, docs) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                retour({ val: 0, rep: docs });
            }
        });
    });
}
// facture/devis article - récupérer les factures
function lireFactures() {
    return new Promise(function(retour) {
        db.find({ $or: [{ facDev_type: '0' }, { facDev_type: '2' }], facDev_creation: false }).sort({ updatedAt: -1 }).exec(function(e, docs) {
            if (e) {
                retour({ val: 1, rep: e });
            } else {
                retour({ val: 0, rep: docs });
            }
        });
    });
}

// changer le type du numéro de facture F FERR FR
function reTypeNumFact(pre, str) {
    let ind = str.indexOf('-');
    str = str.substring(ind, str.length);
    return pre + str;
}
// Ajouter 1 au numéro de facture (ex. : F-2020-11-1, FR-2020-11-1 ou FERR-2020-11-1, retrournent -2) - repartir à 1 si nouvelle année (retournent -1)
function ajNumFact(str, am) {
    if (getNouvAnnee(str, am)) {
        return '-1';
    } else {
        let ind = str.lastIndexOf('-');
        str = str.substring(ind + 1, str.length);
        return '-' + (Number(str) + 1).toString();
    }
}
// Savoir si c'est une nouvelle année (dernier numéro de facture, année en cours).
function getNouvAnnee(str, am) {
    let r;
    Number(str.split("-")[1]) < Number(am.split('-')[0]) ? r = true : r = false;
    return r;
}