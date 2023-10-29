// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
import { contextBridge, ipcRenderer } from "electron";

// Expose ipcRenderer to the client
contextBridge.exposeInMainWorld("ipcRenderer", {
    invoke: async (channel: string, ...args: any[]) => {
        /*let validChannels = ["nameOfClientChannel"]; // <-- Array of all ipcRenderer Channels used in the client
        if (validChannels.includes(channel)) {
            ipcRenderer.invoke(channel, ...args);
        }*/
        return await ipcRenderer.invoke(channel, ...args);
    },
    receive: (channel: string, func: (...args: any[]) => void | Promise<void>) => {
        /*let validChannels = ["nameOfElectronChannel"]; // <-- Array of all ipcMain Channels used in the electron
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender`
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }*/

        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
});
