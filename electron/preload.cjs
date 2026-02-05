const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    sendNotification: (notification) => ipcRenderer.send('show-notification', notification),
    restoreWindow: () => ipcRenderer.send('restore-window'),
    saveData: (data) => ipcRenderer.invoke('save-data', data),
    loadData: () => ipcRenderer.invoke('load-data'),
    getDataPath: () => ipcRenderer.invoke('get-data-path'),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    setCustomDataPath: (path) => ipcRenderer.invoke('set-custom-data-path', path)
});