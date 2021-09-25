$(document).ready(function() {

    // Rendu <-> Main

    let societes = societe = undefined;
    let uniqueNom = false;
    let o = this;

    // retirer les résultats au clic sur le bouton X de la barre de recherche
    $('input[type=search]').on('search', function() {
        o.societe = undefined;
        $('#rechSoc').val('')
        $('.supp-res-rech').remove();
    });

    // Afficher ou pas la recherche
    window.api.receive('retour-rech-societes-presentes', (arg) => {
        if (arg.rep == null) {
            $('#rechSoc').attr("disabled", true);
        } else $('#rechSoc').attr("disabled", false);
    });
    // Afficher ou pas la recherche
    $('.modale-societe').on('show.bs.modal', function(e) {
        // Bloquer si besoin pour facture rectifiée
        // if ($('#doc-facDev-type-rectif').text().startsWith('Annule')) {
        //     setTimeout(function() { $('.modale-societe .btnFermer').click(); }, 333);
        // } else {          
        // } 
        // Vérifier s'il y a une société
        window.api.send('envoi-rech-societes-presentes');
    });

    // vider en cas d'abandon
    $('.modale-societe').on('hidden.bs.modal', function(e) {
        o.societe = undefined;
        $("#denom-nouv-soc").removeClass('is-invalid');
        $('#rechSoc').val('')
        $('.supp-res-rech').remove();
        $('#societe-existante')[0].reset();
        $('#nouvelle-societe')[0].reset();
    });

    // retour liste sociétés
    window.api.receive('retour-rech-societe', (arg) => {
        if (arg.val == 0) {
            // ok afficher la table des réponses s'il y a quelque chose
            rep = arg.rep;
            o.societes = rep;

            $('#bloc-rech-soc').append(`
            <div class="table-responsive supp-res-rech mt-4">
            <table class="table table-hover table-sm" id="table-soc-res-rech">
                <thead>
                    <tr>
                        <th class="th-sm table-noBorder-top">Nom</th>
                        <th class="th-sm table-noBorder-top">Adresse</th>
                        <th class="th-sm table-noBorder-top"></th>
                        <th class="th-sm table-noBorder-top">Ville</th>
                        <th class="th-sm table-noBorder-top">SIRET</th>
                        <th class="table-noBorder-top d-none">ID</th>
                    </tr>
                </thead>
                <tbody id='res-rech-tr'>
                    <tr class="btn-perso tableRechSoc" data-toggle="tooltip" title="Choisir cette société">
                        <td class="table-noBorder-top MmLigne">${rep[0].soc_denom}</td>
                        <td class="table-noBorder-top MmLigne">${rep[0].soc_adr_l1}</td>
                        <td class="table-noBorder-top MmLigne"> ${rep[0].soc_adr_l2==null?'':rep[0].soc_adr_l2}</td>                      
                        <td class="table-noBorder-top MmLigne">${rep[0].soc_adr_l3}</td>
                        <td class="table-noBorder-top MmLigne">${rep[0].soc_siret}</td>
                        <td class="table-noBorder-top MmLigne d-none">${rep[0]._id}</td>
                    </tr>    
            `);
            for (let i = 1; i < rep.length; i++) {
                $('#res-rech-tr').append(`                
                        <tr class="btn-perso supp-res-rech tableRechSoc" data-toggle="tooltip" title="Choisir cette société">
                            <td class="MmLigne">${rep[i].soc_denom}</td>
                            <td class="MmLigne">${rep[i].soc_adr_l1}</td>
                            <td class="MmLigne"> ${rep[i].soc_adr_l2==null?'':rep[i].soc_adr_l2}</td>                      
                            <td class="MmLigne">${rep[i].soc_adr_l3}</td>
                            <td class="MmLigne">${rep[i].soc_siret}</td>
                            <td class="MmLigne d-none">${rep[i]._id}</td>
                        </tr>                     
                `);
            }
            $('#bloc-rech-soc').append(`
                 </tbody>
                </table>
                </div>
                `);

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

            // écouteur de sélection d'une société
            $('#table-soc-res-rech tr.tableRechSoc').mousedown(function() {
                $("#rechSoc").blur();
                let s_id = ($(this).find("td:eq(5)").text());
                for (let i = 0; i < o.societes.length; i++) {
                    if (o.societes[i]._id == s_id) {
                        o.societe = o.societes[i];
                        $("#societe-existante").submit();
                    }
                }
            });

        } else {
            // nok retirer la table des réponses
            $('.supp-res-rech').remove();
        }
    });
    // envoi recherche nom société
    $("#rechSoc").on('change paste keyup', function(event) {
        // supprimer le tableau des résultats
        $('.supp-res-rech').remove();
        if ($('#rechSoc').val().trim().toUpperCase() == '') {} else {
            window.api.send('envoi-rech-societe', $('#rechSoc').val().trim().toUpperCase());
        }
    });





    // retour nom unique
    window.api.receive('retour-nom-societe', (arg) => {
        if (arg.val == 0) {
            o.uniqueNom = true;
            $("#denom-nouv-soc").removeClass('is-invalid');
        } else {
            o.uniqueNom = false;
            $("#invalid-nom").text('Ce nom de société existe (modifié le ' + arg.last + ')');
            $("#denom-nouv-soc").addClass('is-invalid');
        }
    });
    // envoi nom unique
    $("#denom-nouv-soc").on('change paste keyup', function(event) {
        window.api.send('envoi-nom-societe', $('#denom-nouv-soc').val().trim().toUpperCase());
    });



    /**
     * FORMS
     */

    // retour de la maj du document avec la société existante
    window.api.receive('retour-document-maj-soc-ex', (arg) => {
        o.societe = undefined;
        $('#rechSoc').val('')
        $('.supp-res-rech').remove();
        if (arg.val == 0) {
            docEdite = arg.rep
            afficher();
        }
    });

    // envoi du formulaire société existante
    $("#societe-existante").submit(function(event) {
        if (o.societe == undefined) {} else {
            // Basculer la modale + chargement en cours
            $('.modale-societe').modal('toggle');
            window.api.send('debut-chrg');
            // maj document en cours
            window.api.send('envoi-document-maj-soc-ex', o.societe);
        }
    });

    // retour du formulaire nouvelle société
    window.api.receive('retour-enreg-nouv-soc', (arg) => {
        if (arg.val == 0) {
            //ok
            docEdite = arg.rep
            afficher();
        }
    });
    // envoi du formulaire nouvelle société
    $("#nouvelle-societe").submit(function(event) {
        if (o.uniqueNom) {
            // Basculer la modale + chargement en cours
            $('.modale-societe').modal('toggle');
            window.api.send('debut-chrg');
            let societe = {
                soc_type: 0,
                soc_denom: $('#denom-nouv-soc').val().trim().toUpperCase(),
                soc_adr_l1: $('#adrl1-nouv-soc').val().trim().toUpperCase(),
                soc_adr_l2: $('#adrl2-nouv-soc').val() == '' ? null : $('#adrl2-nouv-soc').val(),
                soc_adr_l3: $('#adrl3-nouv-soc').val().trim().toUpperCase(),
                soc_courriel: $('#courriel-nouv-soc').val() == '' ? null : $('#courriel-nouv-soc').val(),
                soc_tel1: $('#tel1-nouv-soc').val() == '' ? null : $('#tel1-nouv-soc').val(),
                soc_tel2: $('#tel2-nouv-soc').val() == '' ? null : $('#tel2-nouv-soc').val(),
                soc_fax: $('#fax-nouv-soc').val() == '' ? null : $('#fax-nouv-soc').val(),
                soc_siret: $('#siret-nouv-soc').val() == '' ? "En cours d'attribution" : $('#siret-nouv-soc').val(),
                soc_descript: $('#descript-nouv-soc').val() == '' ? null : $('#descript-nouv-soc').val(),
                soc_form_jur: $('#jur-nouv-soc').val() == '' ? null : $('#jur-nouv-soc').val(),
                soc_tva: $('#tva-nouv-soc').val() == '' ? null : $('#tva-nouv-soc').val(),
            };
            window.api.send('envoi-enreg-nouv-soc', societe);
        } else event.preventDefault();
    });


});