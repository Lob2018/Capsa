$(document).ready(function() {

    // retour afficher le document
    window.api.receive('retour-afficher-doc', (arg) => {
        if (arg.val == 0) {
            docEdite = arg.rep
            afficher();
        } else {
            viderLesChamps();
        }
    });
    // retirer enregistrer
    let enregIco = document.getElementById('enregistrer');
    let p = enregIco.parentElement;
    p.style.display = 'none';
    // afficher document (en création ou vide)
    window.api.send('envoi-afficher-doc');


    // retour nouveau
    window.api.receive('retour-supprimer-doc', (arg) => {
        if (arg.val == 0) {
            docEdite = arg.rep
            afficher();
        } else {
            viderLesChamps();
        }
    });
    // envoi nouveau    
    $('#nouveau').on('click', () => {
        let elEnr = document.getElementById('nouveau');
        elEnr.classList.remove("clic");
        elEnr.offsetWidth;
        elEnr.classList.add("clic");
        // Suppression du document en cours dans la base
        window.api.send('envoi-supprimer-doc');
    });
    // Vider le document
    function viderLesChamps() {
        docEdite = {
            societe: {},
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

        $('#doc-soc-denom').html('VOTRE SOCIÉTÉ<i class="YlBtn1 fa fa-pencil fa-3x" id="societe" data-toggle="tooltip" title="Choisir votre société"></i>')
        $('#doc-soc-descript').text('')
        $('#doc-facDev-type').html('Facture<i class="YlBtn1 fa fa-pencil fa-3x" id="facDev" data-toggle="tooltip" title="Choisir le type de document :&nbsp;&nbsp;<br><li>Facture</li><li>Devis</li><li>Facture rectificative</li>"></i>')
            //$('#doc-facDev-type-rectif').html('Annule et remplace la facture<br> N°F-13-07-2020-999999')
        $('#doc-soc-siret').text('') //SIRET : 01234567890123
        $('#doc-facDev-date').text(getDateDoc())
            // numéro de facture du jour
        $('#doc-facDev-num').text('') //Facture N°F-13-07-2020-999999
        $('#doc-soc-adr-l1').text('')
        $('#doc-soc-adr-l2').text('')
        $('#doc-soc-adr-l3').text('')
        $('#doc-soc-tel2').text('') //'Tél. : ** ** ** ** **'
        $('#doc-soc-tel1').text('')
        $('#doc-soc-fax').text('') //'Fax : ** ** ** ** **'
        $('#doc-cl-denom').html('VOTRE CLIENT<i class="YlBtn1 fa fa-pencil fa-3x" id="client" data-toggle="tooltip" title="Choisir votre client"></i>')
        $('#doc-cl-adr-l1').text('')
        $('#doc-cl-adr-l2').text('')
        $('#doc-cl-adr-l3').text('')
        $('#doc-facDev-type-regl').text('Comptant') // À réception de la facture
        $('#doc-facDev-HT').text('0,00')
        $('#doc-facDev-TVA').text('0,00')
        $('#doc-facDev-TTC').text('0,00 EUR');
        // ne pas afficher enregistrer
        let enregIco = document.getElementById('enregistrer');
        let p = enregIco.parentElement;
        p.style.display = 'none';
    };
    // haut de page   
    $('#h2Page').on('click', () => {
        let elEnr = document.getElementById('h2Page');
        elEnr.classList.remove("clic");
        elEnr.offsetWidth;
        elEnr.classList.add("clic");
        scroll(0);
    });
    // bas de page   
    $('#b2Page').on('click', () => {
        let elEnr = document.getElementById('b2Page');
        elEnr.classList.remove("clic");
        elEnr.offsetWidth;
        elEnr.classList.add("clic");
        scroll(1);
    })

    function getDateDoc() {
        this.mapMois = new Map([
            [1, "janvier"],
            [2, "février"],
            [3, "mars"],
            [4, "avril"],
            [5, "mai"],
            [6, "juin"],
            [7, "juillet"],
            [8, "août"],
            [9, "septembre"],
            [10, "octobre"],
            [11, "novembre"],
            [12, "décembre"]
        ]);
        let date = new Date();
        return "Le " + (date.getUTCDate().toString() == 1 ? date.getUTCDate().toString() + 'er' : date.getUTCDate()) + " " + this.mapMois.get(date.getMonth() + 1) + " " + date.getFullYear();
    }
});







/**
 * NOTIFICATIONS
 //200 caractères max
        new Notification('Capsa', {
            body: 'Lorem Ipsum Dolor Sit Amet',
            urgency: 'low'
        })
 */