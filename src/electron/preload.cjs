const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    getVersion: () => process.versions.electron,

    selectXml: () => ipcRenderer.invoke("select-xml"),
    selectOutput: () => ipcRenderer.invoke("select-output"),

    startRendering: (options) =>
        ipcRenderer.invoke("start-rendering", options)
});