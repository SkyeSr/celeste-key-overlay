const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('keyEvents', {
  onKey: (callback) => ipcRenderer.on('key-event', (_, data) => callback(data)),
});

contextBridge.exposeInMainWorld('electronAPI', {
  saveKeyBinds: (bindings) => ipcRenderer.send('save-keybinds', bindings),
  onKeybindReload: (callback) => ipcRenderer.on('reload-keybinds', (_, data) => callback(data)),
});

