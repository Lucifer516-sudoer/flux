const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, 'preload.js'), // use a preload script
    },
  });

  // and load the index.html of the app.
  // win.loadFile('index.html');
  win.loadURL(
    isDev
      ? 'http://localhost:5173' // Vite dev server URL
      : `file://${path.join(__dirname, '../frontend/dist/index.html')}`
  );

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// ------------------- IPC Handlers -------------------

const db = require('./db');

// A simple ping-pong handler to confirm the IPC bridge is working.
ipcMain.handle('ping', () => 'pong');

// Get all trades
ipcMain.handle('get-trades', async () => {
  return db('trades').select('*').orderBy('close_datetime', 'asc');
});

// Add a new trade
ipcMain.handle('add-trade', async (event, trade) => {
  const [newTrade] = await db('trades').insert(trade).returning('*');
  return newTrade;
});

// Delete a trade
ipcMain.handle('delete-trade', async (event, id) => {
  await db('trades').where('id', id).del();
  return id;
});

// Update a trade
ipcMain.handle('update-trade', async (event, trade) => {
  const [updatedTrade] = await db('trades').where('id', trade.id).update(trade).returning('*');
  return updatedTrade;
});
