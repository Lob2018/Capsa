$(document).ready(function() {
    // Rendu <-> Main
    

    // sauvegarder BDD
    $('#sauvegarde-bdd').on('click', () => {
        let elBdd = document.getElementById('sauvegarde-bdd');
        elBdd.classList.remove("clic");
        elBdd.offsetWidth;
        elBdd.classList.add("clic");
        window.api.send('envoi-sauvegarde-bdd');
    })
});