
import {
    app,
    BrowserWindow,
    ipcMain,
    dialog
} from "electron";

import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 850,
        height: 700,
        minWidth: 700,
        minHeight: 600,
        title: "Premiere Smart Rendering",

        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });

    mainWindow.loadFile(
        path.join(__dirname, "../renderer/index.html")
    );
}

ipcMain.handle("select-xml", async () => {
    const result = await dialog.showOpenDialog({
        title: "Seleziona XML di Premiere",
        filters: [
            { name: "XML", extensions: ["xml"] }
        ],
        properties: ["openFile"]
    });

    return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("select-output", async () => {
    const result = await dialog.showOpenDialog({
        title: "Seleziona cartella di destinazione",
        properties: ["openDirectory", "createDirectory"]
    });

    return result.canceled ? null : result.filePaths[0];
});

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
