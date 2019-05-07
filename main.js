const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

const iconPath = path.join(__dirname, '/ressources/app/icon.png');

let mainWindow = null;
let appIcon = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadFile('./app/html/index.html');
    mainWindow.toggleDevTools();

    /*
    mainWindow.on('minimize',function(event){
        event.preventDefault();
        mainWindow.hide();
    });
    
    mainWindow.on('close', function (event) {
        if(!app.isQuiting){
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });*/
}



/* Close and open event */
app.on('ready', function() {
    createWindow()
    /*
    appIcon = new Tray(iconPath);

    var contextMenu = Menu.buildFromTemplate([
        {
            label: "Open window",
            click: createWindow
        },
        {
            label: "Quit", click: function() {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);
    appIcon.setToolTip('RSS reader to keep the database up to date');
    appIcon.setContextMenu(contextMenu);
    */
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});