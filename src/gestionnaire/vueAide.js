$(document).ready(function() {
    // Rendu <-> Main

    //  Afficher l'aide
    $('#aide').on('click', () => {
        let winEl = document.getElementById('aide');
        winEl.classList.remove("clic");
        winEl.offsetWidth;
        winEl.classList.add("clic");
        window.api.send('envoi-aide');
    })
});