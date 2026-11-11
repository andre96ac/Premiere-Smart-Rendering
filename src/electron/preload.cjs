const { contextBridge, ipcRenderer, webUtils  } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    getVersion: () => process.versions.electron,

    selectXml: () => ipcRenderer.invoke("select-xml"),
    selectOutput: () => ipcRenderer.invoke("select-output"),

    startRendering: (options) => ipcRenderer.invoke("start-rendering", options),

    resizeWindow: (width, height) => ipcRenderer.send("resize-window", { width, height }),
    onRenderProgress: (callback) => {
        const listener = (_event, progress) => callback(progress);

        ipcRenderer.on("render-progress", listener);

        return () => {
            ipcRenderer.removeListener("render-progress", listener);
        };
    },

    getPathForFile: (file) => webUtils.getPathForFile(file),


});