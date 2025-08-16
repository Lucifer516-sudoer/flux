const { contextBridge, ipcRenderer } = require('electron');

// We are exposing a controlled API to the renderer process.
// The frontend can access this object at `window.api`.
contextBridge.exposeInMainWorld('api', {
  // Example function: send a message to the main process and get a reply
  ping: () => ipcRenderer.invoke('ping'),

  // We will add our database functions here, for example:
  // getTrades: (filters) => ipcRenderer.invoke('get-trades', filters),
  // addTrade: (trade) => ipcRenderer.invoke('add-trade', trade),
  // deleteTrade: (id) => ipcRenderer.invoke('delete-trade', id),
  // updateTrade: (trade) => ipcRenderer.invoke('update-trade', trade),
});

// We also need to listen for events from the main process if necessary.
// For example, if the main process needs to send a message to the renderer
// without a prior request from the renderer.
// ipcRenderer.on('main-event', (event, data) => {
//   // Do something with the event data
// });
