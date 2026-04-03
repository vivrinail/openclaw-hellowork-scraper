const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 250,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('popup.html');
  mainWindow.setMenu(null);
}

app.whenReady().then(createWindow);

// Écouter la recherche envoyée depuis le popup
ipcMain.on('start-scraper', (event, searchTerm) => {
  console.log(`Recherche reçue: ${searchTerm}`);
  // On ferme le popup une fois la recherche envoyée
  if (mainWindow) mainWindow.close();
  // On pourrait ici lancer le scraper, mais pour simplifier on va juste passer le terme au script principal
  // Dans une vraie app electron, tout serait dans le même process
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
