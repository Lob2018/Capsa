const { app, BrowserWindow } = require('electron');

class YlChargEnCours {
    constructor(mainWindow) {
        //Charge
        this.winCharg = new BrowserWindow({
            webPreferences: {
                worldSafeExecuteJavaScript: true,
                nodeIntegration: false, // is default value after Electron v5
                contextIsolation: true, // protect against prototype pollution
                enableRemoteModule: false, // turn off remote
            },
            show: false,
            width: 250,
            height: 150,
            frame: false,
            icon: __dirname + '/../../img/CAPSA.ico',
            backgroundColor: '#343a40',
            parent: mainWindow
        });
        this.winCharg.loadFile(__dirname + '/../../img/chargement.gif');
        this.winCharg.hide();
        this.winCharg.setMenu(null);
    }
    cacher() {
        this.winCharg.hide();
    }
    montrer() {
        this.winCharg.show();
    }
    fermer() {
        this.winCharg.close();
    }
}

module.exports = YlChargEnCours;