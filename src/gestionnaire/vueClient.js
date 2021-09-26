$(document).ready(function() {

    // Rendu <-> Main

    let clients = client = undefined;
    let uniqueNom = false;
    let o = this;

    // retirer les résultats au clic sur le bouton X de la barre de recherche
    $('input[type=search]').on('search', function() {
        o.client = undefined;
        $('#rechCl').val('')
        $('.supp-res-rech').remove();
    });

    // Afficher ou pas la recherche
    window.api.receive('retour-rech-clients-presents', (arg) => {
        if (arg.rep == null) {
            $('#rechCl').attr("disabled", true);
        } else $('#rechCl').attr("disabled", false);
    });
    // Afficher ou pas la recherche
    $('.modale-client').on('show.bs.modal', function(e) {
        // Bloquer l'édition si document existant
        if (docEdite.document.facDev_num) {
            $('#nouveau').click();
            setTimeout(function() { $('.modale-client .btnFermer').click(); }, 333);
        } else {
            // Vérifier s'il y a un client
            window.api.send('envoi-rech-clients-presents');
        }
    });

    // vider en cas d'abandon
    $('.modale-client').on('hidden.bs.modal', function(e) {
        o.client = undefined;
        $("#denom-nouv-cl").removeClass('is-invalid');
        $('#rechCl').val('')
        $('.supp-res-rech').remove();
        $('#client-existant')[0].reset();
        $('#nouveau-client')[0].reset();
    });

    // retour liste clients
    window.api.receive('retour-rech-client', (arg) => {
        if (arg.val == 0) {
            // ok afficher la table des réponses s'il y a quelque chose
            rep = arg.rep;
            o.clients = rep;

            $('#bloc-rech-cl').append(`
        <div class="table-responsive supp-res-rech mt-4">
        <table class="table table-hover table-sm" id="table-cl-res-rech">
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
                <tr class="btn-perso tableRechCl" data-toggle="tooltip" title="Choisir ce client">
                    <td class="table-noBorder-top MmLigne">${rep[0].soc_denom}</td>
                    <td class="table-noBorder-top MmLigne">${rep[0].soc_adr_l1}</td>
                    <td class="table-noBorder-top MmLigne">${rep[0].soc_adr_l2==null?'':rep[0].soc_adr_l2}</td>                      
                    <td class="table-noBorder-top MmLigne">${rep[0].soc_adr_l3}</td>
                    <td class="table-noBorder-top MmLigne">${/d/g.test(rep[0].soc_siret)?'':rep[0].soc_siret}</td>
                    <td class="table-noBorder-top MmLigne d-none">${rep[0]._id}</td>
                </tr>    
        `);
            for (let i = 1; i < rep.length; i++) {
                $('#res-rech-tr').append(`                
                    <tr class="btn-perso supp-res-rech tableRechCl" data-toggle="tooltip" title="Choisir ce client">
                        <td class="MmLigne">${rep[i].soc_denom}</td>
                        <td class="MmLigne">${rep[i].soc_adr_l1}</td>
                        <td class="MmLigne">${rep[i].soc_adr_l2==null?'':rep[i].soc_adr_l2}</td>                      
                        <td class="MmLigne">${rep[i].soc_adr_l3}</td>
                        <td class="MmLigne">${/d/g.test(rep[i].soc_siret)?'':rep[i].soc_siret}</td>
                        <td class="MmLigne d-none">${rep[i]._id}</td>
                    </tr>                     
            `);
            }
            $('#bloc-rech-cl').append(`
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
            $('#table-cl-res-rech tr.tableRechCl').mousedown(function() {
                $("#rechCl").blur();
                let s_id = ($(this).find("td:eq(5)").text());
                for (let i = 0; i < o.clients.length; i++) {
                    if (o.clients[i]._id == s_id) {
                        o.client = o.clients[i];
                        $("#client-existant").submit();
                    }
                }
            });

        } else {
            // nok retirer la table des réponses
            $('.supp-res-rech').remove();
        }
    });
    // envoi recherche nom société
    $("#rechCl").on('change paste keyup', function(event) {
        // supprimer le tableau des résultats
        $('.supp-res-rech').remove();
        if ($('#rechCl').val().trim().toUpperCase() == '') {} else {
            window.api.send('envoi-rech-client', $('#rechCl').val().trim().toUpperCase());
        }
    });







    // retour nom unique
    window.api.receive('retour-nom-societe', (arg) => {
        if (arg.val == 0) {
            o.uniqueNom = true;
            $("#denom-nouv-cl").removeClass('is-invalid');
        } else {
            o.uniqueNom = false;
            $("#invalid-nom-cl").text('Ce nom de société existe (modifié le ' + arg.last + ')');
            $("#denom-nouv-cl").addClass('is-invalid');
        }
    });
    // envoi nom unique
    $("#denom-nouv-cl").on('change paste keyup', function(event) {
        window.api.send('envoi-nom-societe', $('#denom-nouv-cl').val().trim().toUpperCase());
    });

    /**
     * FORMS
     */

    // retour de la maj du document avec le client existant
    window.api.receive('retour-document-maj-cl-ex', (arg) => {
        o.client = undefined;
        $('#rechCl').val('')
        $('.supp-res-rech').remove();
        if (arg.val == 0) {
            docEdite = arg.rep
            afficher();
        }
    });

    // envoi du formulaire client existant
    $("#client-existant").submit(function(event) {
        if (o.client == undefined) {} else {
            // Basculer la modale + chargement en cours
            $('.modale-client').modal('toggle');
            window.api.send('debut-chrg');
            // maj document en cours
            window.api.send('envoi-document-maj-cl-ex', o.client);
        }
    });




    // retour du formulaire nouveau client
    window.api.receive('retour-enreg-nouv-cl', (arg) => {
        if (arg.val == 0) {
            //ok
            docEdite = arg.rep
            afficher();
        }
    });
    // envoi du formulaire nouveau client
    $("#nouveau-client").submit(function(event) {
        if (o.uniqueNom) {
            // Basculer la modale + chargement en cours
            $('.modale-client').modal('toggle');
            window.api.send('debut-chrg');
            let client = {
                soc_type: -1,
                soc_denom: $('#denom-nouv-cl').val().trim().toUpperCase(),
                soc_adr_l1: $('#adrl1-nouv-cl').val().trim().toUpperCase(),
                soc_adr_l2: $('#adrl2-nouv-cl').val() == '' ? null : $('#adrl2-nouv-cl').val(),
                soc_adr_l3: $('#adrl3-nouv-cl').val().trim().toUpperCase(),
                soc_courriel: $('#courriel-nouv-cl').val() == '' ? null : $('#courriel-nouv-cl').val(),
                soc_tel1: $('#tel1-nouv-cl').val() == '' ? null : $('#tel1-nouv-cl').val(),
                soc_tel2: $('#tel2-nouv-cl').val() == '' ? null : $('#tel2-nouv-cl').val(),
                soc_fax: $('#fax-nouv-cl').val() == '' ? null : $('#fax-nouv-cl').val(),
                soc_siret: $('#siret-nouv-cl').val() == '' ? "En cours d'attribution" : $('#siret-nouv-cl').val(),
                soc_descript: $('#descript-nouv-cl').val() == '' ? null : $('#descript-nouv-cl').val(),
                soc_form_jur: $('#jur-nouv-cl').val() == '' ? null : $('#jur-nouv-cl').val(),
                soc_tva: null,
            };
            window.api.send('envoi-enreg-nouv-cl', client);
        } else event.preventDefault();
    });
});