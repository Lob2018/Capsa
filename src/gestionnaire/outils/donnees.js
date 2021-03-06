class YlDonnees {

    constructor() {}


    // retourne un tableau trié à partir de la clé
    tabTrieParCle(array, key) {
        return array.sort(function(a, b) {
            var x = a[key];
            var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

    // retourne le tableau d'un groupe (utiliser &&)
    tabGrp(tab, grp) {
        return tab.filter(function(el) {
            return el.art_groupe == grp;
        });
    }


}
module.exports = YlDonnees;