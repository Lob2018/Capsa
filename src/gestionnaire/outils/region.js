class YlRegion {

    constructor() {
        this.region = 'FR';
    }

    // changer le séparateur décimal et afficher deux décimales 
    virgule(s) {
        if (s === null) return s;
        let n, o;
        n = parseFloat(s);
        o = n.toFixed(2);
        return o.replace('.', ',');
    }

}
module.exports = YlRegion;