const { app, BrowserWindow } = require('electron');
class YlSplash {
    constructor(mainWindow) {
        //Splash
        this.splashWindow = new BrowserWindow({
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
        this.splashWindow.loadFile(__dirname + '/../../img/splash.jpg');
        this.splashWindow.setAlwaysOnTop(true, 'screen');
        this.splashWindow.show();
    }
    retirer() {
        this.splashWindow.hide();
    }
}
module.exports = YlSplash;