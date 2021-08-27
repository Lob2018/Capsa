$(document).ready(function() {

    // Rendu <-> Main

    let docs, isListeDocs;
    isListeDocs = false;
    let o = this;

    const btnSuiv = document.getElementById('pagin__btn-suiv');
    const btnPrec = document.getElementById('pagin__btn-prec');
    const dateDebut = document.getElementsByName('fact-ann-date-rech')[0];

    btnPrec.addEventListener("click", function() {
        if (btnPrec.classList.contains('disabled')) return
        o.pagination.page -= 1;
        window.api.send('envoi-chg-fact', o.pagination);
    }, true);
    btnSuiv.addEventListener("click", function() {
        if (btnSuiv.classList.contains('disabled')) return;
        o.pagination.page += 1;
        window.api.send('envoi-chg-fact', o.pagination);
    }, true);
    dateDebut.addEventListener("input", function() {
        if (this.value) {
            o.pagination.date = this.value;
            o.pagination.page = 0;
            window.api.send('envoi-chg-fact', o.pagination);
        }
    }, true);



    // basculer en facture en cas d'abandon
    $('.modale-docs').on('hidden.bs.modal', function(e) {
        if (docEdite.document.facDev_type == 2) {} else {
            window.api.send('debut-chrg');
            // maj document en cours vers facture
            window.api.send('envoi-document-rect-fact', '0');
        }
    })

    // basculer de : 0 Facture > 1 Devis > 2 Facture rectificative
    $('#doc-facDev-type').mousedown(function(event) {
        window.api.send('debut-chrg');
        message.forceClose();
        if (docEdite.document.facDev_type == 0) {
            // maj document en cours vers devis
            window.api.send('envoi-document-rect-fact', '1');
        } else if (docEdite.document.facDev_type == 1) {
            // toggle modale
            $('.modale-docs').modal('toggle');
            // chargement des factures pouvant être annulées
            if (o.pagination === undefined) {
                o.pagination = { societe: docEdite.document.facDev_id_soc, page: 0, longueur: 20, date: document.getElementsByName('fact-ann-date-rech')[0].value };
            }
            window.api.send('envoi-chg-fact', o.pagination);
        } else {
            // maj document en cours vers facture
            window.api.send('envoi-document-rect-fact', '0');
        }
    });
    // retour de la modale pour choisir une facture pour cette société
    window.api.receive('retour-chg-fact', (arg) => {

        // Cacher les tooltips Bootstrap
        $('[data-toggle="tooltip"], .tooltip').tooltip("hide");

        window.api.send('fin-chrg');

        o.docs = arg.rep;
        o.cl = arg.rep0;
        o.isListeDocs = Array.isArray(o.docs) && o.docs.length > 0;
        if (o.isListeDocs) {
            // console.log(o.docs)
            // console.log(o.pagination)

            // vider le tableau
            document.getElementById('res-rech-fact-annulee').innerHTML = '';
            // Afficher bouton précédentes ? 
            if (o.pagination.page == 0) {
                if (btnPrec.classList.contains('disabled')) {} else {
                    btnPrec.classList.add('disabled');
                }
            } else {
                if (btnPrec.classList.contains('disabled')) {
                    btnPrec.classList.remove('disabled');
                }
            }
            // Afficher bouton suivantes ?
            if (o.docs.length > (
                    o.pagination.page == 0 ? o.pagination.longueur * 1 :
                    o.pagination.longueur * o.pagination.page
                )) {
                if (btnSuiv.classList.contains('disabled')) {
                    btnSuiv.classList.remove('disabled');
                }
            } else {
                if (btnSuiv.classList.contains('disabled')) {} else {
                    btnSuiv.classList.add('disabled');
                }
            }

            // // Définir la date de début
            // document.getElementsByName('fact-ann-date-rech')[0].value = o.docs[0].date.annee + '-' + o.docs[0].date.mois + '-' + o.docs[0].date.jour;

            // Màj du DOM
            let tBody = document.getElementById('res-rech-fact-annulee');
            for (let i = 0; i < o.docs.length - 1; i++) {
                const ligne = o.docs[i];
                let ligneEl = tBody.insertRow(i);
                ligneEl.classList.add('suppLignArt');
                ligneEl.setAttribute("data-toggle", "tooltip");
                ligneEl.setAttribute("title", "");
                ligneEl.setAttribute("data-original-title", "Annuler cette facture");
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
                clEl.innerHTML = (o.cl[i].soc_denom);
                let htEl = ligneEl.insertCell(4);
                htEl.classList.add('table-noBorder-top', 'MmLigne', 'text-right');
                htEl.innerHTML = (ligne.facDev_HT + '€');
                let ttcEl = ligneEl.insertCell(5);
                ttcEl.classList.add('table-noBorder-top', 'MmLigne', 'text-right');
                ttcEl.innerHTML = (ligne.facDev_TTC + '€');

                // Click sur la ligne
                ligneEl.id = 'fact-annule-' + i + o.pagination.page;
                $('#' + ligneEl.id).click(function() {
                    o.id = ligne.facDev_num;
                    try { chargWindow.cacher(); } catch (e) {}
                    // maj document en cours type et FR_num
                    window.api.send('envoi-document-rect-fact', o.id);
                    // toggle modale
                    $('.modale-docs').modal('toggle');
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
            document.getElementById('res-rech-fact-annulee').innerHTML = '';
            btnPrec.classList.add('disabled');
            btnSuiv.classList.add('disabled');

        }
    })




    /**
     * FORMS
     */

    // retour de la maj du document avec la facture annulée
    window.api.receive('retour-document-rect-fact', (arg) => {
        try { chargWindow.cacher(); } catch (e) {}
        if (arg.val == 0) {
            docEdite = arg.rep;
            afficher();
        }
    });

    // envoi du formulaire facture existante
    $("#docs-existant").submit(function(event) {
        try { chargWindow.cacher(); } catch (e) {}
        // maj document en cours type et FR_num
        window.api.send('envoi-document-rect-fact', o.id);
    });
});