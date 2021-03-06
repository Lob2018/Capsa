$(document).ready(function() {

    // Rendu <-> Main

    let docs, isListeDocs;
    isListeDocs = false;
    let o = this;

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

        if (docEdite.document.facDev_type == 0) {
            // maj document en cours vers devis
            window.api.send('envoi-document-rect-fact', '1');
        } else if (docEdite.document.facDev_type == 1) {
            // toggle modale
            $('.modale-docs').modal('toggle');
            // chargement des sociétés
            window.api.send('envoi-chg-fact');
        } else {
            // maj document en cours vers facture
            window.api.send('envoi-document-rect-fact', '0');
        }
    });
    // retour de la modale pour choisir une facture
    window.api.receive('retour-chg-fact', (arg) => {
        window.api.send('fin-chrg');

        o.docs = arg.rep;
        o.cl = arg.rep0;

        o.isListeDocs = Array.isArray(o.docs) && o.docs.length > 0;
        if (o.isListeDocs) {
            // vider les options
            $('#lstDocs').empty();
            // info options
            $('#lstDocs').append($('<option value="">Choisissez&nbsp;la&nbsp;facture&nbsp;à&nbsp;annuler</option>'));
            $('#annulFact').attr("disabled", false);
        } else {
            // vider les options
            $('#lstDocs').empty();
            // info options
            $('#lstDocs').append($('<option value="">Pas&nbsp;de&nbsp;factures&nbsp;disponibles</option>'));
            $('#annulFact').attr("disabled", true);
        }
        // affichage
        if (o.isListeDocs) {
            for (let i = 0; i < o.docs.length; i++) {
                // opt : date - denomClient - montant TTC
                $('#lstDocs').append($("<option selected value=" + o.docs[i].facDev_num + ">" + getDateExistante(o.docs[i].updatedAt) + "&nbsp;-&nbsp;" + o.cl[i].soc_denom.split(' ').join('&nbsp;') + "&nbsp;-&nbsp;Montant&nbsp;TTC&nbsp;:&nbsp" + o.docs[i].facDev_TTC + " EUR&nbsp;-&nbsp;N°" + o.docs[i].facDev_num + "</option>"));
            }
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
        let numFR = $('#lstDocs option:selected').val();
        // maj document en cours type et FR_num
        window.api.send('envoi-document-rect-fact', numFR);
    });


    function getDateExistante(d) {
        let date = new Date(d);
        return date.getUTCDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " à " + date.getHours() + ":" + (date.getMinutes().toString().length == 1 ? '0' + date.getMinutes().toString() : date.getMinutes());
    };
});