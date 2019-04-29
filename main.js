const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow;

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

    mainWindow.on('closed', () => {
        win = null
    });
}
/* Close and open event */
app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

/* Communication with renderer (icp) */
/**
 * Keep it on side
 */
ipcMain.on('create-popup-htmlextractor', (event, arg) => {
    let htmlextractor = new BrowserWindow({
        width: 800,
        height: 600,
        parent: mainWindow,
        webPreferences: {
            nodeIntegration: true
        }
    });
    htmlextractor.on('close', function() {win = null});
    
    htmlextractor.loadFile('./app/html/HTMLextractor.html');
    htmlextractor.toggleDevTools();
    
    htmlextractor.show();

    htmlextractor.webContents.once('dom-ready', () => {
        htmlextractor.webContents.send('target-url', arg);
    });
})