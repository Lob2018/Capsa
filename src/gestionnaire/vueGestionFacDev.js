$(document).ready(function() {

    // Rendu <-> Main

    let isListeDocs1;
    isListeDocs1 = false;
    let o1 = this;

    const btnSuiv1 = document.getElementById('pagin1__btn-suiv');
    const btnPrec1 = document.getElementById('pagin1__btn-prec');
    const dateDebut = document.getElementsByName('facDev-date-rech')[0];

    btnPrec1.addEventListener("click", function() {
        if (btnPrec1.classList.contains('disabled')) return
        o1.pagination1.page -= 1;
        window.api.send('envoi-chg-fact-devis', o1.pagination1);
    }, true);
    btnSuiv1.addEventListener("click", function() {
        if (btnSuiv1.classList.contains('disabled')) return;
        o1.pagination1.page += 1;
        window.api.send('envoi-chg-fact-devis', o1.pagination1);
    }, true);
    dateDebut.addEventListener("input", function() {
        if (this.value) {
            o1.pagination1.date = this.value;
            o1.pagination1.page = 0;
            window.api.send('envoi-chg-fact-devis', o1.pagination1);
        }
    }, true);




    $('#ttes-factures').mousedown(function(event) {
        window.api.send('debut-chrg');
        message.forceClose();
        // toggle modale
        $('.modale-facDev-gest').modal('toggle');

        // chargement des factures pouvant être annulées
        if (o1.pagination1 === undefined) {
            o1.pagination1 = { societe: docEdite.societe._id, page: 0, longueur: 20, date: document.getElementsByName('fact-ann-date-rech')[0].value };
        }
        o1.pagination1.societe = docEdite.societe._id;
        o1.pagination1.page = 0;
        /**
         * ici
         * Récupérer ttes factures+devis, et gérer affichage factures réctifiées, ajouter les devis 
         */
        window.api.send('envoi-chg-fact-devis', o1.pagination1);

    });
    // retour de la modale pour choisir une facture pour cette société
    window.api.receive('retour-chg-fact-devis', (arg) => {
        // Cacher les tooltips Bootstrap
        $('[data-toggle="tooltip"], .tooltip').tooltip("hide");

        window.api.send('fin-chrg');

        o1.docs = arg.rep;
        o1.cl = arg.rep0;
        o1.isListeDocs1 = Array.isArray(o1.docs) && o1.docs.length > 0;
        if (o1.isListeDocs1) {

            // vider le tableau
            document.getElementById('res-rech-facDev').innerHTML = '';
            // Afficher bouton précédentes ? 
            if (o1.pagination1.page == 0) {
                if (btnPrec1.classList.contains('disabled')) {} else {
                    btnPrec1.classList.add('disabled');
                }
            } else {
                if (btnPrec1.classList.contains('disabled')) {
                    btnPrec1.classList.remove('disabled');
                }
            }
            // Afficher bouton suivantes ?
            if (o1.docs.length > (
                    o1.pagination1.page == 0 ? o1.pagination1.longueur * 1 :
                    o1.pagination1.longueur * o1.pagination1.page
                )) {
                if (btnSuiv1.classList.contains('disabled')) {
                    btnSuiv1.classList.remove('disabled');
                }
            } else {
                if (btnSuiv1.classList.contains('disabled')) {} else {
                    btnSuiv1.classList.add('disabled');
                }
            }

            // // Définir la date de début
            // document.getElementsByName('fact-ann-date-rech')[0].value = o1.docs[0].date.annee + '-' + o1.docs[0].date.mois + '-' + o1.docs[0].date.jour;

            // Màj du DOM
            let tBody = document.getElementById('res-rech-facDev');
            for (let i = 0; i < o1.docs.length; i++) {
                const ligne = o1.docs[i];
                let ligneEl = tBody.insertRow(i);
                ligneEl.classList.add('modifierLigneFacDev');
                ligneEl.setAttribute("data-toggle", "tooltip");
                ligneEl.setAttribute("title", "");
                ligneEl.setAttribute("data-original-title", "Afficher ce document");
                let dateEl = ligneEl.insertCell(0);
                dateEl.classList.add('table-noBorder-top', 'MmLigne');
                dateEl.innerHTML = ligne.date.jour + '-' + ligne.date.mois + '-' + ligne.date.annee;
                let numEl = ligneEl.insertCell(1);
                numEl.classList.add('table-noBorder-top', 'MmLigne');
                numEl.innerHTML = ligne.facDev_num;
                let typeEl = ligneEl.insertCell(2);
                typeEl.classList.add('table-noBorder-top', 'MmLigne');
                switch (ligne.facDev_type) {
                    case '-1':
                        typeEl.innerHTML = "Fact. annulée";
                        break;
                    case '0':
                        typeEl.innerHTML = "Facture";
                        break;
                    case '1':
                        typeEl.innerHTML = "Devis";
                        break;
                    case '2':
                        typeEl.innerHTML = "Fact. rectifiée";
                        break;
                }
                let clEl = ligneEl.insertCell(3);
                clEl.classList.add('table-noBorder-top', 'MmLigne');
                clEl.innerHTML = (o1.cl[i].soc_denom);
                let htEl = ligneEl.insertCell(4);
                htEl.classList.add('table-noBorder-top', 'MmLigne', 'text-right');
                htEl.innerHTML = (ligne.facDev_HT + '€');
                let ttcEl = ligneEl.insertCell(5);
                ttcEl.classList.add('table-noBorder-top', 'MmLigne', 'text-right');
                ttcEl.innerHTML = (ligne.facDev_TTC + '€');

                // Click sur la ligne
                ligneEl.id = 'fact-' + i + o1.pagination1.page;
                $('#' + ligneEl.id).click(function() {
                    try { chargWindow.cacher(); } catch (e) {}
                    // Client
                    const client = o1.cl.filter((el) => { return el._id == ligne.facDev_id_cl })[0]
                        // Si il y a un client et un document, màj le document courant

                    if (client && ligne) {
                        docEdite.document = ligne;
                        docEdite.client = client;
                        // créer document (
                        window.api.send('envoi-majDocEnCours', ligne);
                    }
                    // toggle modale
                    $('.modale-facDev-gest').modal('toggle');
                    window.api.send('debut-chrg');
                })
            }

            // màj tooltip
            $(function() {
                $('[data-toggle="tooltip"]').tooltip({
                    delay: {
                        show: 999,
                        hide: 0
                    },
                    animation: true,
                    html: true,
                    trigger: 'hover',
                });
            });

        } else {
            document.getElementById('res-rech-facDev').innerHTML = '';
            btnPrec1.classList.add('disabled');
            btnSuiv1.classList.add('disabled');
        }
    })



    /**
     * Mettre à jour le document en cours
     */
    // retour afficher le document
    window.api.receive('retour-afficher-doc', (arg) => {
        if (arg.val == 0) {
            // màj date dernière modification et TVA sauvegardée
            docEdite.document.updatedAt = o1.updatedAt;
            if (docEdite.document.facDev_num) docEdite.societe.soc_tva = o1.tva;

            afficher();
        }
    });

    // retour du formulaire modifier
    window.api.receive('retour-majDocEnCours', (arg) => {
        if (arg.val == 0) {
            docEdite = arg.rep;
            // Sauvegarder la dernière date de modification et la TVA utilisée
            o1.updatedAt = docEdite.document.updatedAt;
            if (docEdite.document.facDev_num) o1.tva = docEdite.document.facDev_TVA;
            window.api.send('envoi-afficher-doc');
        }
    });
});