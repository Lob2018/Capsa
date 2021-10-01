const { dialog } = require('electron');
class YlMsg {

    constructor(mainwindow) {
        this.mainwindow = mainwindow;
        this.msg = {
            type: 'info',
            buttons: ['Ok'],
            defaultId: 0,
            title: 'Capsa - Information',
            message: 'Votre numéro de facture/devis est automatiquement créé.',
            detail: 'Le format est ',
        }
        this.questCourriel = {
            type: 'question',
            buttons: ["Oui", "Non"],
            defaultId: 0,
            cancelId: -1,
            title: 'Capsa - Courriel',
            message: 'Préparer votre courriel au client ?',
            detail: '/!\\ Vous devrez insérer le document en pièce jointe.'
        }
        this.questImpExpD = {
            type: 'warning',
            buttons: ["Importer", "Exporter"],
            defaultId: 1,
            cancelId: -1,
            title: 'Capsa - Gestion des données Capsa',
            message: 'Importer ou exporter les données ?',
            detail: '\nL\'import de données supprime toutes les données du logiciel !\nSauvegardez donc avant d\'importer de nouvelles données.\n\nL\'importation entrainera un redémarrage du logiciel.'
        }
        this.questMoy = {
            type: 'question',
            buttons: ["Carte bancaire", "Espèces", "Chèque", "Virement bancaire"],
            defaultId: 0,
            cancelId: -1,
            title: 'Capsa - Moyen de paiement',
            message: 'Choisir le moyen de paiement utilisé : ',
        }
    }

    info() {
        this.onTop();
        return dialog.showMessageBox(this.mainwindow, this.msg).then((data) => {
            return data.response;
        });
    }

    info(w) {
        this.onTop();
        return dialog.showMessageBox(this.mainwindow, {
            type: 'info',
            buttons: ['Ok'],
            defaultId: 0,
            title: 'Capsa - Information',
            message: w,
        }).then((data) => {
            return data.response;
        });
    }

    questionCourriel() {
        this.onTop();
        return dialog.showMessageBox(this.mainwindow, this.questCourriel).then((data) => {
            return data.response;
        });
    }

    questionImpExpDatas() {
        this.onTop();
        return dialog.showMessageBox(this.mainwindow, this.questImpExpD).then((data) => {
            return data.response;
        });
    }


    questionMoyen() {
        this.onTop();
        return dialog.showMessageBox(this.mainwindow, this.questMoy).then((data) => {
            return data.response;
        });
    }

    warning(w) {
        this.onTop();
        return dialog.showMessageBox(this.mainwindow, {
            type: 'warning',
            buttons: ['Ok'],
            defaultId: 0,
            title: 'Capsa - Avertissement',
            message: 'Une action a été annulée,\nou demande votre attention.',
            detail: w.stack,
        }).then((data) => {
            return data.response;
        });
    }

    warningTxt(w) {
        this.onTop();
        return dialog.showMessageBox(this.mainwindow, {
            type: 'warning',
            buttons: ['Ok'],
            defaultId: 0,
            title: 'Capsa - Avertissement',
            message: 'Une action a été annulée,\nou demande votre attention.',
            detail: w,
        }).then((data) => {
            return data.response;
        });
    }

    erreur(e) {
        this.onTop();
        return dialog.showMessageBox(this.mainwindow, {
            type: 'error',
            buttons: ['Ok'],
            defaultId: 0,
            title: 'Capsa - Erreur',
            message: 'Une erreur est survenue.',
            detail: e.stack,
        }).then((data) => {
            return data.response;
        });
    }

    onTop() {
        this.mainwindow.setAlwaysOnTop(true, 'screen');
        this.mainwindow.setAlwaysOnTop(false, 'screen');
    }
}
module.exports = YlMsg;