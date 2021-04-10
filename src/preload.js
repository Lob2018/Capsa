const {
    contextBridge,
    ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = ["envoi-rech-articles-presents", "envoi-rech-societes-presentes", "envoi-rech-clients-presents", "debut-chrg", "fin-chrg", "envoi-afficher-doc", "envoi-supprimer-doc", "envoi-creer-doc", "envoi-numero", "envoi-redimensionner", "envoi-imprimer-facture-pdf", "envoi-code-article-gest", "envoi-description-article-gest", "envoi-rech-article-gest", "envoi-chg-grp-gest", "envoi-gest-supp-art", "envoi-maj-art", "envoi-sauvegarde-bdd", "envoi-chg-art+grp", "envoi-chg-grp", "envoi-description-article", "envoi-code-article", "envoi-enreg-nouv-art", "envoi-enreg-nouv-soc", "envoi-enreg-nouv-cl", "envoi-document-maj-art-ex", "envoi-document-maj-soc-ex", "envoi-document-maj-cl-ex", "envoi-document-rect-fact", "envoi-supp-ligne", "envoi-chg-societes", "envoi-chg-clients", "envoi-chg-fact", "envoi-nom-societe", "envoi-rech-societe", "envoi-rech-client", "envoi-rech-article", "envoi-maj", "envoi-maj-dispo"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            let validChannels = ["retour-rech-articles-presents", "retour-rech-societes-presentes", "retour-rech-clients-presents", "retour-supprimer-doc", "retour-afficher-doc", "retour-creer-doc", "retour-numero", "retour-redimensionner", "retour-imprimer-facture-pdf", "retour-code-article-gest", "retour-description-article-gest", "retour-rech-article-gest", "retour-chg-grp-gest", "retour-gest-supp-art", "retour-maj-art", "retour-sauvegarde-bdd", "retour-chg-art+grp", "retour-chg-grp", "retour-desc-art", "retour-code-art", "retour-enreg-nouv-art", "retour-enreg-nouv-soc", "retour-enreg-nouv-cl", "retour-document-maj-art-ex", "retour-document-maj-soc-ex", "retour-document-maj-cl-ex", "retour-document-rect-fact", "retour-supp-ligne", "retour-chg-societes", "retour-chg-clients", "retour-chg-fact", "retour-nom-societe", "retour-rech-societe", "retour-rech-client", "retour-rech-article", "retour-maj-dispo"];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
);