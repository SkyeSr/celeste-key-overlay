const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 150,
    icon: path.join(__dirname, 'assets/icon.ico'),
    autoHideMenuBar: true,
    resizable: false,
    transparent: false,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('index.html');

  const pythonPath = path.join(__dirname, '.venv', 'Scripts', 'python.exe');

  const python = spawn(pythonPath, [path.join(__dirname, 'key_listener.py')]);

  python.stdout.on('data', (data) => {
    const messages = data.toString().split('\n').filter(Boolean);
    messages.forEach((msg) => {
      try {
        const parsed = JSON.parse(msg);
        mainWindow.webContents.send('key-event', parsed);
      } catch (e) {
        console.error('Invalid JSON from Python:', msg);
      }
    });
  });

  python.stderr.on('data', (data) => {
    console.error(`Python error: ${data}`);
  });

  python.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
  });

  // Right click for changing keybinds
  mainWindow.webContents.on('context-menu', () => {
    const menu = Menu.buildFromTemplate([
      {
        label: 'Edit Keybinds',
        click: () => {
          createKeybindEditor();
        },
      },
    ]);
    menu.popup();
  });

}

function createKeybindEditor() {
  const editorWindow = new BrowserWindow({
    width: 650,
    height: 847,
    title: "Edit Keybinds",
    autoHideMenuBar: true,
    resizable: true,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  editorWindow.loadFile('editor.html');
}

// Save edited bindings
ipcMain.on('save-keybinds', (event, bindings) => {
  const filePath = path.join(__dirname, 'keyBinds.json');
  fs.writeFile(filePath, JSON.stringify(bindings, null, 2), (err) => {
    if (err) {
      console.error('Error saving keyBinds:', err);
    } else {
      console.log('Keybinds saved!');
      if (mainWindow) {
        mainWindow.webContents.send('reload-keybinds', bindings);
      }
    }
  });
});


app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});