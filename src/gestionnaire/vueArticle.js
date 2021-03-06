$(document).ready(function() {

    // Rendu <-> Main

    let grpes, qteEx, isGrpe;
    let articles = article = undefined;
    let uniqueDesc = uniqueCode = isGrpe = false;
    let o = this;


    // retirer les résultats au clic sur le bouton X de la barre de recherche
    $('input[type=search]').on('search', function() {
        o.article = undefined;
        $('#rechArt').val('')
        $('.supp-res-rech').remove();
        $("#rechArt").removeClass('is-valid');
    });

    // envoi de la modale chargement des groupes
    $('#ajoutArticle').on('click', () => {
        viderFormArt();
        window.api.send('debut-chrg');
        if ($('#groupe-nouv').val().trim() == '') {
            $('#groupe').attr("disabled", false);
        } else {
            $('#groupe').val('');
            $('#groupe').attr("disabled", true);
        }
        // chargement des articles et groupes
        window.api.send('envoi-chg-grp');
    });
    // retour de la modale pour choisir un groupe
    window.api.receive('retour-chg-grp', (arg) => {
        window.api.send('fin-chrg');
        o.grpes = arg.rep;
        // I CHOISIR ARTICLE et II CHOISR GRPE
        o.isGrpe = Array.isArray(o.grpes) && o.grpes.length > 0;

        // II
        if (o.isGrpe) {
            // vider les options
            $('#groupe').empty();
            // info options
            $('#groupe').append($('<option value="">Choisissez&nbsp;son&nbsp;groupe</option>'));
        } else {
            // vider les options
            $('#groupe').empty();
            // info options
            $('#groupe').append($('<option value="">Pas&nbsp;de&nbsp;groupes&nbsp;disponibles</option>'));
        }

        // Art groupés (I et II)
        if (o.isGrpe) {
            //console.log('#1' + JSON.stringify(o.grpes))
            for (let i = 0; i < o.grpes.length; i++) {
                // tableau des groupes
                for (let j = 0; j < o.grpes[i].length; j++) {
                    if (j == 0) {
                        // charger les groupes
                        $('#groupe').append($("<option value=" + i + ">" + o.grpes[i][j].art_groupe.split(' ').join('&nbsp;') + "</option>"));
                    }
                }
            }
        }
    })

    // retour liste articles
    window.api.receive('retour-rech-article', (arg) => {
        if (arg.val == 0) {
            // ok afficher la table des réponses s'il y a quelque chose
            rep = arg.rep;
            o.articles = rep;

            $('#bloc-rech-art').append(`
    <div class="table-responsive supp-res-rech mt-4">
    <table class="table table-hover table-sm" id="table-art-res-rech">
        <thead>
            <tr>
                <th class="th-sm table-noBorder-top">Nom</th>
                <th class="th-sm table-noBorder-top">Code de l'article</th>
                <th class="th-sm table-noBorder-top text-right">Prix</th>
                <th class="table-noBorder-top d-none">ID</th>
            </tr>
        </thead>
        <tbody id='res-rech-tr'>
            <tr class="btn-perso tableRechArt" data-toggle="tooltip" title="Choisir cet article">
                <td class="table-noBorder-top MmLigne">${rep[0].art_descript}</td>
                <td class="table-noBorder-top MmLigne"> ${rep[0].art_code}</td>   
                <td class="table-noBorder-top MmLigne text-right">${rep[0].art_prix} EUR</td>   
                <td class="table-noBorder-top MmLigne d-none">${rep[0]._id}</td>                
            </tr>    
    `);
            for (let i = 1; i < rep.length; i++) {
                $('#res-rech-tr').append(`                
                <tr class="btn-perso supp-res-rech tableRechArt" data-toggle="tooltip" title="Choisir cet article">
                    <td class="MmLigne">${rep[i].art_descript}</td>
                    <td class="MmLigne"> ${rep[i].art_code}</td>   
                    <td class="MmLigne text-right">${rep[i].art_prix} EUR</td>    
                    <td class="table-noBorder-top MmLigne d-none">${rep[i]._id}</td>               
                </tr>                     
        `);
            }
            $('#bloc-rech-art').append(`
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
            // écouteur de sélection d'un article
            $('#table-art-res-rech tr.tableRechArt').mousedown(function() {
                $("[data-toggle='tooltip']").tooltip('hide');

                $("#rechArt").blur();
                let s_id = ($(this).find("td:eq(3)").text());
                for (let i = 0; i < o.articles.length; i++) {
                    if (o.articles[i]._id == s_id) {
                        o.article = o.articles[i];
                    }
                }
                // maj stock
                $('#stock-ex').val(o.article.art_stock);
                o.article.art_stock == null ? o.qteEx = null : o.qteEx = parseInt(o.article.art_stock);
                // soustraire si qté et stock 
                if ($('#quantite-ex').val() == '' || o.qteEx == null) {} else {
                    let v = parseInt(o.qteEx) - parseInt($('#quantite-ex').val());
                    $('#stock-ex').val(Math.sign(v) == -1 ? 0 : v);
                }

            });
            // écouteur de fin de sélection d'un article
            $('#table-art-res-rech tr.tableRechArt').mouseup(function() {
                // vider les résultats et afficher le choix                        
                $('.supp-res-rech').remove();
                // remplir avec la sélection
                $('#rechArt').val(o.article.art_descript);
                $("#rechArt").addClass('is-valid');
            });

        } else {
            // nok retirer la table des réponses
            $('.supp-res-rech').remove();
        }
    });
    // envoi recherche nom art
    $("#rechArt").on('change paste keyup', function(event) {
        // retirer valid invalid
        $("#rechArt").removeClass('is-valid');
        $("#rechArt").removeClass('is-invalid');
        // supprimer le tableau des résultats
        $('.supp-res-rech').remove();
        // vider la valeur stockée
        o.article = undefined;
        if ($('#rechArt').val().trim().toUpperCase() == '') {} else {
            window.api.send('envoi-rech-article', $('#rechArt').val().trim().toUpperCase());
        }
    });


    // écouteur sel. article et màj stock
    $('#quantite-ex').on('change paste keyup', function() {
        // soustraire si qté et stock 
        if (o.qteEx == null) {} else {
            let v;
            if ($('#quantite-ex').val() == '') {
                v = parseInt(o.qteEx);
            } else v = parseInt(o.qteEx) - parseInt($('#quantite-ex').val());
            $('#stock-ex').val(Math.sign(v) == -1 ? 0 : v);
        }
    });

    // un seul groupe choisit
    $("#groupe-nouv").on('change paste keyup', function(event) {
        if ($('#groupe-nouv').val().trim() == '') {
            $('#groupe').attr("disabled", false);
        } else {
            $('#groupe').val('');
            $('#groupe').attr("disabled", true);
        }
    });

    // retour description unique
    window.api.receive('retour-desc-art', (arg) => {
        if (arg.val == 0) {
            o.uniqueDesc = true;
            $("#descript-nouv").removeClass('is-invalid');
        } else {
            o.uniqueDesc = false;
            $("#invalid-description").text('Cette description d\'article existe (modifiée le ' + arg.last + ')');
            $("#descript-nouv").addClass('is-invalid');
        }
    });
    // envoi description unique
    $("#descript-nouv").on('change paste keyup', function(event) {
        window.api.send('envoi-description-article', $('#descript-nouv').val().trim().toUpperCase());
    });

    // retour code d'article unique
    window.api.receive('retour-code-art', (arg) => {
        if (arg.val == 0) {
            o.uniqueCode = true;
            $("#code-nouv").removeClass('is-invalid');
        } else {
            o.uniqueCode = false;
            $("#invalid-code").text('Code article existant (modifié le ' + arg.last + ')');
            $("#code-nouv").addClass('is-invalid');
        }
    });
    // envoi code d'article unique
    $("#code-nouv").on('change paste keyup', function(event) {
        window.api.send('envoi-code-article', $('#code-nouv').val().trim().toUpperCase());
    });

    // retour suppression ligne avec mise à jour du stock
    window.api.receive('retour-supp-ligne', (arg) => {
        if (arg.val == 0) {
            afficher();
        }
    });

    /**
     * FORMS
     */

    // retour de la maj du document avec l'article existant
    window.api.receive('retour-document-maj-art-ex', (arg) => {
        o.article = undefined;
        $('#rechArt').val('')
        $('.supp-res-rech').remove();
        if (arg.val == 0) {
            docEdite = arg.rep
            afficher();
            scroll(1);
        }
    });

    // envoi du formulaire article existant
    $("#article-existant").submit(function(event) {
        // Comportement spécial pour le scroll
        event.preventDefault();
        if (o.article == undefined) {
            $("#rechArt").val('');
            $("#invalid-artRech").text('Vous devez sélectionner un article existant');
            $("#rechArt").addClass('is-invalid');
        } else {
            // Basculer la modale + chargement en cours
            window.api.send('debut-chrg');
            $('.modale-articles').modal('toggle');
            // maj document en cours
            window.api.send('envoi-document-maj-art-ex', {
                ligne: {
                    fD_art_id: o.article._id,
                    fD_art_descript: o.article.art_descript,
                    fD_art_code: o.article.art_code,
                    fD_art_prix: o.article.art_prix,
                    fD_art_qte: Number($('#quantite-ex').val()) + '',
                    fD_art_remise: $('#remise-ex').val() == '' ? null : $('#remise-ex').val(),
                    fD_art_tva: (o.article.art_tva == '') ? null : o.article.art_tva
                },
                stock: $('#stock-ex').val() == '' ? null : $('#stock-ex').val()
            });
        }
    });

    // retour du formulaire nouvel article
    window.api.receive('retour-enreg-nouv-art', (arg) => {
        if (arg.val == 0) {
            //ok
            docEdite = arg.rep
            afficher();
            scroll(1);
        }
    });
    // envoi du formulaire nouvel article
    $("#nouvel-article").submit(function(event) {
        // Comportement spécial pour le scroll
        event.preventDefault();
        if (o.uniqueCode && o.uniqueDesc) {
            // Basculer la modale + chargement en cours
            window.api.send('debut-chrg');
            $('.modale-articles').modal('toggle');
            let optSelVal, nouvGrp;
            if (o.isGrpe && $('#groupe option:selected').val() != '') {
                optSelVal = o.grpes[parseInt($('#groupe option:selected').val())][0].art_groupe;
            } else optSelVal = '';
            nouvGrp = htmlDecode($('#groupe-nouv').val().toUpperCase()).trim();

            // un seul groupe enregistré
            let grp;
            (optSelVal == '') ? grp = null: grp = optSelVal;
            if (grp == null) $('#groupe-nouv').val().trim() == '' ? grp = null : grp = nouvGrp;

            let article = {
                art_descript: $('#descript-nouv').val().trim().toUpperCase(),
                art_code: $('#code-nouv').val().trim().toUpperCase(),
                art_prix: $('#prix-nouv').val(),
                art_tva: $('#tva-nouv').val() == '' ? null : $('#tva-nouv').val(),
                art_qte: Number($('#quantite-nouv').val()) + '',
                art_remise: $('#remise-nouv').val() == '' ? null : $('#remise-nouv').val(),
                art_groupe: grp == null ? null : grp,
                art_stock: $('#stock-nouv').val() == '' ? null : Number($('#stock-nouv').val()) + ''
            };
            window.api.send('envoi-enreg-nouv-art', article);
        }
    });

    function htmlDecode(input) {
        var doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
    }

    function viderFormArt() {
        o.article = undefined;
        $("#rechArt").removeClass('is-valid');
        $("#rechArt").removeClass('is-invalid');
        $("#descript-nouv").removeClass('is-invalid');
        $("#code-nouv").removeClass('is-invalid');
        $('#rechArt').val('');
        $('.supp-res-rech').remove();
        $('#article-existant')[0].reset();
        $('#nouvel-article')[0].reset();
    }
});