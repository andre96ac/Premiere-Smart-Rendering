import {
    app,
    BrowserWindow,
    ipcMain,
    dialog
} from "electron";

import path from "node:path";
import { fileURLToPath } from "node:url";
import { access } from "node:fs/promises";

import { runProject } from "../../dist/core/runProject.js";

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

ipcMain.handle("start-rendering", async (_event, options) => {
    if (
        !options ||
        typeof options.xmlPath !== "string" ||
        typeof options.outputPath !== "string" ||
        typeof options.enableLog !== "boolean" ||
        typeof options.overWriteFiles !== "boolean" ||
        typeof options.separateSequences !== "boolean"
    ) {
        throw new Error("Le opzioni di rendering non sono valide.");
    }

    const ffmpegExePath = app.isPackaged
        ? path.join(process.resourcesPath, "ffmpeg", "ffmpeg.exe")
        : path.join(app.getAppPath(), "resources", "ffmpeg", "ffmpeg.exe");

    try {
        await access(ffmpegExePath);
    } catch {
        throw new Error(
            `FFmpeg non trovato. Percorso previsto: ${ffmpegExePath}`
        );
    }

    const config = {
        premiereXmlPath: options.xmlPath,
        outputFolder: options.outputPath,
        enableLog: options.enableLog,
        overWriteFiles: options.overWriteFiles,
        separateSequences: options.separateSequences,
        ffmpegExePath,
        logFilesPath: path.join(
            options.outputPath,
            "premiere-smart-rendering-log"
        )
    };

    await runProject(config);

    return { success: true };
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