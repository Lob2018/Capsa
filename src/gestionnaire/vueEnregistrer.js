$(document).ready(function() {
    // Rendu <-> Main

    String.prototype.splice = function(idx, rem, str) {
        return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
    };



    // retour création nouveau doc
    window.api.receive('retour-creer-doc', (arg) => {
        if (arg.val == 0) {
            docEdite = arg.rep
            afficher();
            scroll(0);
        } else {
            viderLesChamps();
        }
    });

    // retour imprimer
    window.api.receive('retour-imprimer-facture-pdf', (arg) => {
        // remettre le mode édition des lignes
        $('#factures-devis-articles').css("white-space", "normal");
        $("header").show();
        // $("footer").show();
        $(".YlPageNum").remove();
        $("body").addClass("body-margin-top");
        $("i").show();
        $("#switchFacDev").show();
        // Suppression du document en cours dans la base

        window.api.send('envoi-creer-doc');
    });
    // retour redimensionner
    window.api.receive('retour-redimensionner', (arg) => {
        $('header').hide();
        // $("footer").hide();
        $('body').removeClass('body-margin-top');
        $('i').hide();
        $('#switchFacDev').hide();

        // calcul du nbre de pages
        let page = 40.1635;
        let pxToCm = 0.026458;
        let tailleLesArticles = $('#factures-devis-articles').innerHeight() * pxToCm;
        let pgArtilces = tailleLesArticles / page;
        let redArticles = (pgArtilces * 41.983) - 1.4; // Testé jusqu'à de 4000 articles
        let contenuHeightCm = (document.documentElement.scrollHeight * pxToCm) - tailleLesArticles + redArticles;
        let nbP = parseInt(contenuHeightCm / page, 10) + 1;

        // ajout siret numero de facture et pages
        let s = docEdite.societe.soc_siret;
        let siret = 'SIRET : ' + s
        siret += '\xa0\xa0\xa0\xa0\xa0\xa0';

        let factDev;
        docEdite.document.facDev_type == 1 ? factDev = 'DEVIS' : factDev = 'FACTURE';
        let numFact = factDev + ' N°' + docEdite.document.facDev_num;
        // let numFact = 'DEVIS N°' + n;

        let i = 0;
        do {
            let pageNum = document.createElement("textarea");
            pageNum.rows = "2";
            let txt;
            i == 0 ? txt = '      PAGE ' + (i + 1) + '/' + nbP : txt = siret + numFact + '      PAGE ' + (i + 1) + '/' + nbP;
            if (txt.length > 124) {
                txt = txt.splice(124, 0, '\n');
            } else txt = txt.splice(0, 0, '\n');
            pageNum.value = txt;
            pageNum.classList.add("YlPageNum");
            let y = (page * (i + 1)) + '';
            pageNum.style.cssText = 'position:absolute;top:' + (y - 0.8) + 'cm;left: 50%;transform: translate(-50%, 0%);text-align: right;'
            document.body.prepend(pageNum);
            i = i + 1;
        } while (i < nbP);

        // Courriel
        let m, d, so, n, fr;
        d = $('#doc-facDev-date').text().substring(3);
        //date.getDateExistante(docEdite.document.updatedAt);
        docEdite.client.soc_courriel == ('' || undefined) ? m = '' : m = docEdite.client.soc_courriel
        so = docEdite.societe.soc_denom;
        docEdite.document.facDev_num == ('' || undefined) ? n = '' : n = docEdite.document.facDev_num
        docEdite.document.facDev_FR_num == ('' || undefined) ? fr = '' : fr = docEdite.document.facDev_FR_num


        if (docEdite.document.facDev_type == '0') {
            ob = so + ' - Votre facture';
            co = "%0D%0A%0D%0A  Madame, Monsieur, " +
                "%0D%0A%0D%0A%09  Suite à votre commande du " + d + ", nous vous adressons ci-joint votre facture N°" + n + ", d'un montant de " + $('#doc-facDev-TTC').text() +
                ".%0D%0A%0D%0A  Merci d'avoir choisi " + so + ", et à très bientôt.%0D%0A%0D%0A";
        } else if (docEdite.document.facDev_type == '1') {
            ob = so + ' - ' + 'Votre devis';
            co = "%0D%0A%0D%0A  Madame, Monsieur, " +
                "%0D%0A%0D%0A%09  Suite à notre dernière conversation du " + d + ", nous vous adressons ci-joint votre devis N°" + n + ", d'un montant de " + $('#doc-facDev-TTC').text() +
                ".%0D%0A%0D%0A  Merci d'avoir choisi " + so + ", et à très bientôt.%0D%0A%0D%0A";
        } else {
            ob = so + ' - ' + 'Votre facture rectificative'
            co = "%0D%0A%0D%0A  Madame, Monsieur, " +
                "%0D%0A%0D%0A%09    Après vérifications le " + d + ", nous vous adressons ci-joint votre facture rectificative N°" + n + ", d'un montant de " + $('#doc-facDev-TTC').text() + ", qui annule et remplace la facture N°" + fr +
                ".%0D%0A%0D%0A%09  Nous vous prions de bien vouloir nous excuser pour la gêne occasionnée, et restons à votre disposition pour toute information complémentaire qui pourrait vous être nécessaire" +
                ".%0D%0A%0D%0A  Merci d'avoir choisi " + so + ", et à très bientôt.%0D%0A%0D%0A";
        }
        let courriel = 'mailto:' + m + '?' + '&subject=' + ob + '&body=' + co;

        window.api.send('envoi-imprimer-facture-pdf', courriel);

    });


    // retour numero
    window.api.receive('retour-numero', (arg) => {
        if (arg.val == 0) {
            docEdite = arg.rep
            afficher();
            // màj moyen de paiement
            $('#doc-facDev-type-regl').html(arg.moyenP);
            // les mesures se font sur une ligne
            $('#factures-devis-articles').css("white-space", "nowrap");
            // redimenssionner la fenêtre pendant l'impression
            window.api.send('envoi-redimensionner');
        } else {
            viderLesChamps();
        }
    });


    // envoi enregistrer    
    $('#enregistrer').on('click', () => {
        // Cacher messages
        message.forceClose();

        let elEnr = document.getElementById('enregistrer');
        elEnr.classList.remove("clic");
        elEnr.offsetWidth;
        elEnr.classList.add("clic");
        window.api.send('envoi-numero', { ht: docEdite.document.facDev_HT, ttc: docEdite.document.facDev_TTC, facDev_FR_num: docEdite.document.facDev_FR_num, facDev_TVAs: docEdite.document.facDev_TVAs, facDev_mention: docEdite.societe.soc_mention, facDev_TVA: docEdite.societe.soc_tva });
    })




});