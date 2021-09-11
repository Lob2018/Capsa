$(document).ready(function() {

    // Rendu <-> Main

    let o = this;
    let socClsGest = socClGest = undefined;
    let uniqueNomSocCl = false;

    // retirer les résultats au clic sur le bouton X de la barre de recherche
    $('input[type=search]').on('search', function() {
        o.socClGest = undefined;
        $('#rechSocClGest').val('')
        $('.supp-res-rech').remove();
        $("#rechSocClGest").removeClass('is-valid');
        update(-1);
    });

    // envoi de la modale
    $('#societes-clients').on('click', () => {
        viderFormSocCl();
        update(-1);
    });



    // retour liste socCl
    window.api.receive('retour-rech-socCl-gest', (arg) => {

        if (arg.val == 0) {
            // ok afficher la table des réponses s'il y a quelque chose
            rep = arg.rep;
            o.socClsGest = rep;

            $('#bloc-rech-socCl-gest').append(`
            <div class="table-responsive supp-res-rech mt-4">
            <table class="table table-hover table-sm" id="table-socCl-res-rech-gest">
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
                <tbody id='res-rech-tr-g'>
                    <tr class="btn-perso tableRechSocClGest" data-toggle="tooltip" title="Choisir cet article">                      
                        <td class="table-noBorder-top MmLigne">${rep[0].soc_denom}</td>
                        <td class="table-noBorder-top MmLigne">${rep[0].soc_adr_l1}</td>
                        <td class="table-noBorder-top MmLigne">${rep[0].soc_adr_l2==null?'':rep[0].soc_adr_l2}</td>                      
                        <td class="table-noBorder-top MmLigne">${rep[0].soc_adr_l3}</td>
                        <td class="table-noBorder-top MmLigne">${/d/g.test(rep[0].soc_siret)?'':rep[0].soc_siret}</td>
                        <td class="table-noBorder-top MmLigne d-none">${rep[0]._id}</td>
                    </tr>    
            `);
            for (let i = 1; i < rep.length; i++) {
                $('#res-rech-tr-g').append(`                
                        <tr class="btn-perso supp-res-rech tableRechSocClGest" data-toggle="tooltip" title="Choisir cet article">
                        <td class="MmLigne">${rep[i].soc_denom}</td>
                        <td class="MmLigne">${rep[i].soc_adr_l1}</td>
                        <td class="MmLigne">${rep[i].soc_adr_l2==null?'':rep[i].soc_adr_l2}</td>                      
                        <td class="MmLigne">${rep[i].soc_adr_l3}</td>
                        <td class="MmLigne">${/d/g.test(rep[i].soc_siret)?'':rep[i].soc_siret}</td>
                        <td class="MmLigne d-none">${rep[i]._id}</td>              
                        </tr>                     
                `);
            }
            $('#bloc-rech-socCl-gest').append(`
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
            $(function() {
                $('[data-toggle="tooltip-inner"]').tooltip({
                    delay: {
                        show: 999,
                        hide: 0
                    },
                    animation: true,
                    html: true,
                    trigger: 'hover',
                });
            });
            // écouteur de sélection d'un article
            $('#table-socCl-res-rech-gest tr.tableRechSocClGest').mousedown(function() {
                $("[data-toggle='tooltip']").tooltip('hide');
                $("#rechSocClGest").blur();
                let s_id = ($(this).find("td:eq(5)").text());
                for (let i = 0; i < o.socClsGest.length; i++) {
                    if (o.socClsGest[i]._id == s_id) {
                        o.socClGest = o.socClsGest[i];
                        o.uniqueNomSocCl = true;
                    }
                }
            });
            // écouteur de fin de sélection d'un article
            $('#table-socCl-res-rech-gest tr.tableRechSocClGest').mouseup(function() {
                // vider les résultats et afficher le choix                        
                $('.supp-res-rech').remove();
                // remplir avec la sélection
                $('#rechSocClGest').val(o.socClGest.soc_denom);
                $("#rechSocClGest").addClass('is-valid');
                // pré-rempli les champs de modification
                update(0);
            });

        } else {
            // nok retirer la table des réponses
            $('.supp-res-rech').remove();
        }
    });

    // envoi recherche nom socCl
    $("#rechSocClGest").on('change paste keyup', function(event) {
        // retirer valid invalid
        $("#rechSocClGest").removeClass('is-valid');
        $("#rechSocClGest").removeClass('is-invalid');
        // supprimer le tableau des résultats
        $('.supp-res-rech').remove();
        // vider la valeur stockée
        o.socClGest = undefined;
        // vider les champs pré-remplis
        update(-1);
        if ($('#rechSocClGest').val().trim().toUpperCase() == '') {} else {
            window.api.send('envoi-rech-socCl-gest', $('#rechSocClGest').val().trim().toUpperCase());
        }
    });


    // retour denom unique
    window.api.receive('retour-nom-socCl', (arg) => {
        if ((o.socClGest.soc_denom == $('#denom-nouv-socCl-gest').val().trim().toUpperCase()) || arg.val == 0) {
            o.uniqueNomSocCl = true;
            $("#denom-nouv-socCl-gest").removeClass('is-invalid');
        } else {
            o.uniqueNomSocCl = false;
            $("#invalid-nom-gest").text('Cette dénomination existe (modifiée le ' + arg.last + ')');
            $("#denom-nouv-socCl-gest").addClass('is-invalid');
        }
    });
    // envoi denom unique
    $("#denom-nouv-socCl-gest").on('change paste keyup', function(event) {
        window.api.send('envoi-nom-socCl', $('#denom-nouv-socCl-gest').val().trim().toUpperCase());
    });



    /**
     * FORMS
     */

    // retour supprimer
    window.api.receive('retour-gest-supp-socCl', (arg) => {
        o.socClGest = undefined;
        $('#rechSocClGest').val('')
        $('.supp-res-rech').remove();
    });

    // envoi du formulaire supprimer
    $("#socCl-existant-gest").submit(function(event) {
        if (o.socClGest == undefined) {
            $("#rechSocClGest").val('');
            $("#invalid-socClRech-gest").text('Vous devez sélectionner un nom existant');
            $("#rechSocClGest").addClass('is-invalid');
        } else {
            $('.modale-socCl-gest').modal('toggle');
            // suppression s'il n'est pas utilisé
            window.api.send('envoi-gest-supp-socCl', o.socClGest._id);
        }
    });


    /**
     * Mettre à jour le document en cours
     */
    // retour afficher le document
    window.api.receive('retour-afficher-doc', (arg) => {
        if (arg.val == 0) {
            docEdite = arg.rep
            afficher();
        }
    });
    // retour du formulaire modifier
    window.api.receive('retour-maj-socCl', (arg) => {
        if (arg.val == 0) {
            // afficher document (en création ou vide)
            window.api.send('envoi-afficher-doc');
        }
    });
    /**
     * Fin mettre à jour le document en cours
     */

    // envoi du formulaire -> modifier
    $("#nouv-socCl-gest").submit(function(event) {
        if (o.uniqueNomSocCl) {
            let socCL = {
                _id: o.socClGest._id,
                soc_denom: $('#denom-nouv-socCl-gest').val().trim().toUpperCase(),
                soc_adr_l1: $('#adrl1-nouv-socCl-gest').val().trim().toUpperCase(),
                soc_adr_l2: $('#adrl2-nouv-socCl-gest').val() == '' ? null : $('#adrl2-nouv-socCl-gest').val(),
                soc_adr_l3: $('#adrl3-nouv-socCl-gest').val().trim().toUpperCase(),
                soc_fax: $('#fax-nouv-socCl-gest').val() == '' ? null : $('#fax-nouv-socCl-gest').val(),
                soc_tel1: $('#tel1-nouv-socCl-gest').val() == '' ? null : $('#tel1-nouv-socCl-gest').val(),
                soc_tel2: $('#tel2-nouv-socCl-gest').val() == '' ? null : $('#tel2-nouv-socCl-gest').val(),
                soc_courriel: $('#courriel-nouv-socCl-gest').val() == '' ? null : $('#courriel-nouv-socCl-gest').val(),
                soc_siret: $('#siret-nouv-socCl-gest').val() == '' ? "En cours d'attribution" : $('#siret-nouv-socCl-gest').val(),
                soc_descript: $('#descript-nouv-socCl-gest').val() == '' ? null : $('#descript-nouv-socCl-gest').val(),
                soc_form_jur: $('#jur-nouv-socCl-gest').val() == '' ? null : $('#jur-nouv-socCl-gest').val(),
                soc_tva: $('#tva-nouv-socCl-gest').val() == '' ? null : $('#tva-nouv-socCl-gest').val()
            };
            window.api.send('envoi-maj-socCl', socCL);
            // Basculer la modale
            $('.modale-socCl-gest').modal('toggle');
        } else event.preventDefault();
    });

    function viderFormSocCl() {

        o.socClGest = undefined;
        $("#rechSocClGest").removeClass('is-valid');
        $("#rechSocClGest").removeClass('is-invalid');

        $("#denom-nouv-socCl-gest").removeClass('is-invalid');

        $('#rechSocClGest').val('');
        $('.supp-res-rech').remove();

        $('#socCl-existant-gest')[0].reset();
        $('#nouv-socCl-gest')[0].reset();
    }

    // mettre à jour la modale -1 vide et 0 charge
    function update(i) {
        // ok sinon nok
        if (i == 0) {
            $('#nouv-socCl-gest')[0].reset();
            $("#nouv-socCl-gest input").prop("disabled", false);
            $("#nouv-socCl-gest textarea").prop("disabled", false);

            $('#gest-socCl-modifier').attr("disabled", false);
            $('#gest-socCl-supprimer').attr("disabled", false);
            // màj des champs
            $('#denom-nouv-socCl-gest').val(o.socClGest.soc_denom);
            $('#descript-nouv-socCl-gest').val(o.socClGest.soc_descript);
            $('#adrl1-nouv-socCl-gest').val(o.socClGest.soc_adr_l1);
            $('#adrl2-nouv-socCl-gest').val(o.socClGest.soc_adr_l2);
            $('#adrl3-nouv-socCl-gest').val(o.socClGest.soc_adr_l3);
            $('#jur-nouv-socCl-gest').val(o.socClGest.soc_form_jur);
            // siret absent ?
            o.socClGest.soc_siret == "En cours d'attribution" ? $('#siret-nouv-socCl-gest').val('') :
                $('#siret-nouv-socCl-gest').val(o.socClGest.soc_siret);
            // client pas TVA
            if (o.socClGest.soc_tva == null) {
                $('#tva-nouv-socCl-gest').val(o.socClGest.soc_tva);
            } else {
                $('#tva-nouv-socCl-gest').val(strToFloat(o.socClGest.soc_tva));
            }

            if (o.socClGest.soc_type == -1) $('#tva-nouv-socCl-gest').attr("disabled", true);

            $('#courriel-nouv-socCl-gest').val(o.socClGest.soc_courriel);
            $('#fax-nouv-socCl-gest').val(o.socClGest.soc_fax);
            $('#tel1-nouv-socCl-gest').val(o.socClGest.soc_tel1);
            $('#tel2-nouv-socCl-gest').val(o.socClGest.soc_tel2);
        } else {
            $('#nouv-socCl-gest')[0].reset();
            $("#nouv-socCl-gest input").prop("disabled", true);
            $("#nouv-socCl-gest textarea").prop("disabled", true);
            $('#gest-socCl-modifier').attr("disabled", true);
            $('#gest-socCl-supprimer').attr("disabled", true);
        }
    }
});