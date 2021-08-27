class YlDate {

    constructor() {
        this.mapJours = new Map([
            [0, "Dimanche"],
            [1, "Lundi"],
            [2, "Mardi"],
            [3, "Mercredi"],
            [4, "Jeudi"],
            [5, "Vendredi"],
            [6, "Samedi"]
        ]);
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
    }

    getAnnee() {
        let date = new Date();
        return date.getFullYear();
    };
    getMois() {
        let date = new Date();
        return ("0" + (date.getMonth() + 1)).slice(-2);
    };
    getJour() {
        let date = new Date();
        return date.getUTCDate();
    };
    getJourSem() {
        //Dim-Sam 0-6
        let date = new Date();
        return this.mapJours.get(date.getDay());
    };
    getHeures() {
        let date = new Date();
        return date.getHours();
    };
    getMinutes() {
        let date = new Date();
        return date.getMinutes();
    };
    getSecondes() {
        let date = new Date();
        return date.getSeconds();
    };
    getTsp() {
        return Date.now();
    };
    getAnMo() {
        let date = new Date();
        return date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2);
    };
    // Vendredi 23 Octobre 2020
    getDate() {
        let date = new Date();
        return this.mapJours.get(date.getDay()) + " " + date.getUTCDate() + " " + this.mapMois.get(date.getMonth() + 1) + " " + date.getFullYear();
    };
    // Le 23 Octobre 2020
    getDateDoc() {
        let date = new Date();
        return "Le " + (date.getUTCDate().toString() == 1 ? date.getUTCDate().toString() + 'er' : date.getUTCDate()) + " " + this.mapMois.get(date.getMonth() + 1) + " " + date.getFullYear();
    };
    // 2020-09-28T00:00:00.000Z -> OBJ jour mois annee
    formatToDateInput(d) {
        const date = new Date(d);
        let mois = date.getMonth() + 1;
        if (mois.toString().length == 1) mois = '0' + mois;
        return { jour: date.getUTCDate() + '', mois: mois + '', annee: date.getFullYear() + '' }
    };
    // 28/09/2020 à 17:14
    getDateExistante(d) {
        let date = new Date(d);
        return date.getUTCDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " à " + date.getHours() + ":" + (date.getMinutes().toString().length == 1 ? '0' + date.getMinutes().toString() : date.getMinutes());
    };
    // lundi 28 septembre 2020 à 17:14
    getDateExistanteXl(d) {
        let date = new Date(d);
        return this.mapJours.get(date.getDay()).toLowerCase() + " " + (date.getUTCDate().toString() == 1 ? date.getUTCDate().toString() + 'er' : date.getUTCDate()) + " " + this.mapMois.get(date.getMonth() + 1).toLowerCase() + " " + date.getFullYear() + " à " + date.getHours() + ":" + (date.getMinutes().toString().length == 1 ? '0' + date.getMinutes().toString() : date.getMinutes());
    };
    // 2021-07-15 -> 2021-07-15T00:00:00.000Z
    txtToDate(txt) {
        return new Date(txt);
    }


}
module.exports = YlDate;