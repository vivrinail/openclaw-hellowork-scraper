const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendSearch: (term) => ipcRenderer.send('start-scraper', term)
});
