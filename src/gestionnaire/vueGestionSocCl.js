// $(document).ready(function() {

//     // Rendu <-> Main
//     
//     let o = this;
//     let articlesGest = articleGest = grpesGest = undefined;
//     let uniqueDescArt, uniqueCodeArt, isGrpeGest = false;


//     // retirer les résultats au clic sur le bouton X de la barre de recherche
//     $('input[type=search]').on('search', function() {
//         o.articleGest = undefined;
//         $('#rechArtGest').val('')
//         $('.supp-res-rech').remove();
//         $("#rechArtGest").removeClass('is-valid');
//         update(-1);
//     });

//     // envoi de la modale chagrgement des groupes
//     $('#tous-articles').on('click', () => {
//         viderFormArt();
//         require('electron').window.api.send('debut-chrg');
//         if ($('#groupes-nouvArt-gest').val().trim() == '') {
//             $('#groupe-art-gest').attr("disabled", false);
//         } else {
//             $('#groupe-art-gest').val('');
//             $('#groupe-art-gest').attr("disabled", true);
//         }
//         update(-1);
//         // chargement des articles et groupes
//         window.api.send('envoi-chg-grp');
//     });
//     // retour de la modale pour choisir un groupe
//     window.api.receive('retour-chg-grp', (arg) => {
//         require('electron').window.api.send('fin-chrg');
//         o.grpesGest = arg.rep;
//         // I CHOISIR ARTICLE et II CHOISR GRPE
//         o.isGrpeGest = Array.isArray(o.grpesGest) && o.grpesGest.length > 0;

//         // II
//         if (o.isGrpeGest) {
//             // vider les options
//             $('#groupe-art-gest').empty();
//             // info options
//             $('#groupe-art-gest').append($('<option value="">Choisissez&nbsp;son&nbsp;groupe</option>'));
//         } else {
//             // vider les options
//             $('#groupe-art-gest').empty();
//             // info options
//             $('#groupe-art-gest').append($('<option value="">Pas&nbsp;de&nbsp;groupes&nbsp;disponibles</option>'));
//         }

//         // Art groupés (I et II)
//         if (o.isGrpeGest) {
//             for (let i = 0; i < o.grpesGest.length; i++) {
//                 // tableau des groupes
//                 for (let j = 0; j < o.grpesGest[i].length; j++) {
//                     if (j == 0) {
//                         // charger les groupes
//                         $('#groupe-art-gest').append($("<option value=" + i + ">" + o.grpesGest[i][j].art_groupe.split(' ').join('&nbsp;') + "</option>"));
//                     }
//                 }
//             }
//         }
//     })

//     // retour liste articles
//     window.api.receive('retour-rech-article', (arg) => {

//         if (arg.val == 0) {
//             // ok afficher la table des réponses s'il y a quelque chose
//             rep = arg.rep;
//             o.articlesGest = rep;

//             $('#bloc-rech-art-gest').append(`
//     <div class="table-responsive supp-res-rech mt-4">
//     <table class="table table-hover table-sm" id="table-art-res-rech-gest">
//         <thead>
//             <tr>
//                 <th class="th-sm table-noBorder-top">Nom</th>
//                 <th class="th-sm table-noBorder-top">Code de l'article</th>
//                 <th class="th-sm table-noBorder-top text-right">Prix</th>
//                 <th class="table-noBorder-top d-none">ID</th>
//             </tr>
//         </thead>
//         <tbody id='res-rech-tr-g'>
//             <tr class="btn-perso tableRechArtGest" data-toggle="tooltip" title="Choisir cet article">
//                 <td class="table-noBorder-top MmLigne">${rep[0].art_descript}</td>
//                 <td class="table-noBorder-top MmLigne"> ${rep[0].art_code}</td>   
//                 <td class="table-noBorder-top MmLigne text-right">${rep[0].art_prix} EUR</td>   
//                 <td class="table-noBorder-top MmLigne d-none">${rep[0]._id}</td>                
//             </tr>    
//     `);
//             for (let i = 1; i < rep.length; i++) {
//                 $('#res-rech-tr-g').append(`                
//                 <tr class="btn-perso supp-res-rech tableRechArtGest" data-toggle="tooltip" title="Choisir cet article">
//                     <td class="MmLigne">${rep[i].art_descript}</td>
//                     <td class="MmLigne"> ${rep[i].art_code}</td>   
//                     <td class="MmLigne text-right">${rep[i].art_prix} EUR</td>    
//                     <td class="table-noBorder-top MmLigne d-none">${rep[i]._id}</td>               
//                 </tr>                     
//         `);
//             }
//             $('#bloc-rech-art-gest').append(`
//          </tbody>
//         </table>
//         </div>
//         `);
//             // màj tooltip
//             $(function() {
//                 $('[data-toggle="tooltip"]').tooltip({
//                     delay: {
//                         show: 999,
//                         hide: 0
//                     },
//                     animation: true,
//                     html: true,
//                     trigger: 'hover',
//                 });
//             });
//             // écouteur de sélection d'un article
//             $('#table-art-res-rech-gest tr.tableRechArtGest').mousedown(function() {
//                 $("[data-toggle='tooltip']").tooltip('hide');

//                 $("#rechArtGest").blur();
//                 let s_id = ($(this).find("td:eq(3)").text());
//                 for (let i = 0; i < o.articlesGest.length; i++) {
//                     if (o.articlesGest[i]._id == s_id) {
//                         o.articleGest = o.articlesGest[i];
//                         o.uniqueCodeArt = o.uniqueDescArt = true;
//                     }
//                 }
//             });
//             // écouteur de fin de sélection d'un article
//             $('#table-art-res-rech-gest tr.tableRechArtGest').mouseup(function() {
//                 // vider les résultats et afficher le choix                        
//                 $('.supp-res-rech').remove();
//                 // remplir avec la sélection
//                 $('#rechArtGest').val(o.articleGest.art_descript);
//                 $("#rechArtGest").addClass('is-valid');
//                 // pré-rempli les champs de modification
//                 update(0);
//             });

//         } else {
//             // nok retirer la table des réponses
//             $('.supp-res-rech').remove();
//         }
//     });

//     // envoi recherche nom art
//     $("#rechArtGest").on('change paste keyup', function(event) {
//         // retirer valid invalid
//         $("#rechArtGest").removeClass('is-valid');
//         $("#rechArtGest").removeClass('is-invalid');
//         // supprimer le tableau des résultats
//         $('.supp-res-rech').remove();
//         // vider la valeur stockée
//         o.articleGest = undefined;
//         // vider les champs pré-remplis
//         update(-1);
//         if ($('#rechArtGest').val().trim().toUpperCase() == '') {} else {
//             window.api.send('envoi-rech-article', $('#rechArtGest').val().trim().toUpperCase());
//         }
//     });

//     // un seul groupe choisit
//     $("#groupes-nouvArt-gest").on('change paste keyup', function(event) {
//         if ($('#groupes-nouvArt-gest').val().trim() == '') {
//             $('#groupe-art-gest').attr("disabled", false);
//         } else {
//             $('#groupe-art-gest').val('');
//             $('#groupe-art-gest').attr("disabled", true);
//         }
//     });

//     // retour description unique
//     window.api.receive('retour-desc-art', (arg) => {
//         if ((o.articleGest.art_descript == $('#descript-nouvArt-gest').val().trim().toUpperCase()) || arg.val == 0) {
//             o.uniqueDescArt = true;
//             $("#descript-nouvArt-gest").removeClass('is-invalid');
//         } else {
//             o.uniqueDescArt = false;
//             $("#invalid-description-gest").text('Cette description d\'article existe (modifiée le ' + arg.last + ')');
//             $("#descript-nouvArt-gest").addClass('is-invalid');
//         }
//     });
//     // envoi description unique
//     $("#descript-nouvArt-gest").on('change paste keyup', function(event) {
//         window.api.send('envoi-description-article', $('#descript-nouvArt-gest').val().trim().toUpperCase());
//     });

//     // retour code d'article unique
//     window.api.receive('retour-code-art', (arg) => {
//         if ((o.articleGest.art_code == $('#code-nouvArt-gest').val().trim().toUpperCase()) || arg.val == 0) {
//             o.uniqueCodeArt = true;
//             $("#code-nouvArt-gest").removeClass('is-invalid');
//         } else {
//             o.uniqueCodeArt = false;
//             $("#invalid-code-gest").text('Code article existant (modifié le ' + arg.last + ')');
//             $("#code-nouvArt-gest").addClass('is-invalid');
//         }
//     });
//     // envoi code d'article unique
//     $("#code-nouvArt-gest").on('change paste keyup', function(event) {
//         window.api.send('envoi-code-article', $('#code-nouvArt-gest').val().trim().toUpperCase());
//     });


//     /**
//      * FORMS
//      */

//     // retour de la maj du document avec l'article existant
//     window.api.receive('retour-gest-supp-art', (arg) => {
//         o.articleGest = undefined;
//         $('#rechArtGest').val('')
//         $('.supp-res-rech').remove();
//     });

//     // envoi du formulaire supprimer article
//     $("#article-existant-gest").submit(function(event) {
//         if (o.articleGest == undefined) {
//             $("#rechArtGest").val('');
//             $("#invalid-artRech-gest").text('Vous devez sélectionner un article existant');
//             $("#rechArtGest").addClass('is-invalid');
//         } else {
//             $('.modale-articles-gest').modal('toggle');
//             // suppression de l'article s'il n'est pas utilisé
//             window.api.send('envoi-gest-supp-art', o.articleGest._id);
//         }
//     });

//     // retour du formulaire nouvel article
//     window.api.receive('retour-maj-art', (arg) => {
//         if (arg.val == 0) {
//             //ok
//             afficher();
//         }
//     });
//     // envoi du formulaire nouvel article -> modifier
//     $("#nouvel-article-gest").submit(function(event) {
//         if (o.uniqueCodeArt && o.uniqueDescArt) {
//             let optSelVal, nouvGrp;
//             if (o.isGrpeGest && $('[name=gest-grp-article]').val() != '') {
//                 optSelVal = o.grpesGest[parseInt($('[name=gest-grp-article]').val())][0].art_groupe;
//             } else optSelVal = '';
//             nouvGrp = htmlDecode($('#groupes-nouvArt-gest').val().toUpperCase()).trim();

//             // un seul groupe enregistré
//             let grp;
//             (optSelVal == '') ? grp = null: grp = optSelVal;
//             if (grp == null) $('#groupes-nouvArt-gest').val().trim() == '' ? grp = null : grp = nouvGrp;

//             let article = {
//                 _id: o.articleGest._id,
//                 art_descript: $('#descript-nouvArt-gest').val().trim().toUpperCase(),
//                 art_code: $('#code-nouvArt-gest').val().trim().toUpperCase(),
//                 art_prix: $('#prix-nouvArt-gest').val(),
//                 art_tva: $('#tva-nouvArt-gest').val() == '' ? null : $('#tva-nouvArt-gest').val(),
//                 art_groupe: grp == null ? null : grp,
//                 art_stock: $('#stock-nouvArt-gest').val() == '' ? null : $('#stock-nouvArt-gest').val()
//             };
//             window.api.send('envoi-maj-art', article);
//             // Basculer la modale
//             $('.modale-articles-gest').modal('toggle');
//         } else event.preventDefault();

//     });

//     function htmlDecode(input) {
//         var doc = new DOMParser().parseFromString(input, "text/html");
//         return doc.documentElement.textContent;
//     }

//     function viderFormArt() {
//         o.articleGest = undefined;
//         $("#rechArtGest").removeClass('is-valid');
//         $("#rechArtGest").removeClass('is-invalid');
//         $("#descript-nouvArt-gest").removeClass('is-invalid');
//         $("#code-nouvArt-gest").removeClass('is-invalid');
//         $('#rechArtGest').val('');
//         $('.supp-res-rech').remove();
//         $('#article-existant-gest')[0].reset();
//         $('#nouvel-article-gest')[0].reset();
//     }

//     // mettre à jour la modale -1 vide et 0 charge avec le groupe correspondant
//     function update(i) {
//         // ok sinon nok
//         if (i == 0) {
//             $('#nouvel-article-gest')[0].reset();
//             $("#nouvel-article-gest input").prop("disabled", false);
//             $('#groupe-art-gest').attr("disabled", false);
//             $('#gest-art-modifier').attr("disabled", false);
//             $('#gest-art-supprimer').attr("disabled", false);
//             // màj des champs
//             $('#descript-nouvArt-gest').val(o.articleGest.art_descript)
//             $('#code-nouvArt-gest').val(o.articleGest.art_code)
//             o.articleGest.art_prix == null ? $('#prix-nouvArt-gest').val('') : $('#prix-nouvArt-gest').val(strToFloat(o.articleGest.art_prix))
//             o.articleGest.art_tva == null ? $('#tva-nouvArt-gest').val('') : $('#tva-nouvArt-gest').val(strToFloat(o.articleGest.art_tva))
//                 //group
//             if (o.articleGest.art_groupe == null) {} else {

//                 // sélectionner automatiquement le groupe
//                 for (let i = 0; i < o.grpesGest.length; i++) {
//                     // tableau des groupes
//                     for (let j = 0; j < o.grpesGest[i].length; j++) {
//                         if (j == 0) {
//                             // charger les groupes
//                             if (o.articleGest.art_groupe == o.grpesGest[i][j].art_groupe) {
//                                 $('[name=gest-grp-article]').val(i);
//                             }
//                         }
//                     }
//                 }
//             }
//             $('#stock-nouvArt-gest').val(o.articleGest.art_stock)
//         } else {
//             $('#nouvel-article-gest')[0].reset();
//             $("#nouvel-article-gest input").prop("disabled", true);
//             $('#groupe-art-gest').attr("disabled", true);
//             $('#gest-art-modifier').attr("disabled", true);
//             $('#gest-art-supprimer').attr("disabled", true);
//         }
//     }
// });