const { app, BrowserWindow } = require('electron');

class YlCharg {
    constructor(mainWindow) {
        //Charge
        this.winCharg = new BrowserWindow({
            webPreferences: {
                worldSafeExecuteJavaScript: true,
                nodeIntegration: false, // is default value after Electron v5
                contextIsolation: true, // protect against prototype pollution
                enableRemoteModule: false, // turn off remote
                nativeWindowOpen: true
            },
            show: false,
            width: 500,
            height: 300,
            frame: false,
            icon: __dirname + '/../../img/CAPSA.ico',
            backgroundColor: '#343a40',
            parent: mainWindow
        });
        this.winCharg.loadFile(__dirname + '/../../img/preparation.gif');
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

module.exports = YlCharg;