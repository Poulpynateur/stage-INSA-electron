const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

const iconPath = path.join(__dirname, '/ressources/images/icon.png');

let mainWindow = null;
let appIcon = null;

function showWindow() {
    if(mainWindow == null) {
        mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            show: false,
            webPreferences: {
                nodeIntegration: true
            }
        });
    
        mainWindow.loadFile('./app/src/index.html');
        mainWindow.toggleDevTools();

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
        });
    }
    else {
        mainWindow.show();
    }
}



/* Close and open event */
app.on('ready', function() {
    //Check for RSS feed every two hours

    appIcon = new Tray(iconPath);

    var contextMenu = Menu.buildFromTemplate([
        {
            label: "Quit", click: function() {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);
    appIcon.setToolTip('INSA RSS reader');
    appIcon.setContextMenu(contextMenu);
    appIcon.on('click', showWindow);

    showWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});