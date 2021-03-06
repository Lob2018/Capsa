$(document).ready(function() {
    // Rendu <-> Main

    // màj !
    window.api.receive('retour-maj-dispo', (arg) => {
        let majIco = document.getElementById('maj');
        let p = majIco.parentElement;
        if (arg.val == 0) {
            if (arg.rep.data[0].tag_name == undefined) {
                p.style.display = 'none';
            } else {
                if (arg.version == arg.rep.data[0].tag_name.replace('v', '')) {
                    p.style.display = 'none';
                } else {
                    p.style.display = 'inline-block';
                    majIco.classList.remove("majEffet");
                    majIco.offsetWidth;
                    majIco.classList.add("majEffet");
                }
            }
        } else {
            // erreur ou pb connexion
            p.style.display = 'none';
        }
    })

    // vérifier si màj
    window.api.send('envoi-maj-dispo');

    //  télécharger la màj
    $('#maj').on('click', () => {
        let winEl = document.getElementById('maj');
        winEl.classList.remove("clic");
        winEl.offsetWidth;
        winEl.classList.add("clic");
        window.api.send('envoi-maj');
    })
});