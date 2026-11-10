import {
    app,
    BrowserWindow,
    ipcMain,
    dialog,
    Menu
} from "electron";

import path from "node:path";
import { fileURLToPath } from "node:url";
import { access } from "node:fs/promises";

import { runCore } from "../../dist/core/runCore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//abilita o disabilita il menù per debug.
const enableMenu = false;

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 850,
        height: 700,
        useContentSize: true,
        title: "Premiere Smart Rendering",
        icon: path.join(app.getAppPath(), "resources", "appIcon.ico"),

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

    if(!enableMenu){
        Menu.setApplicationMenu(null);
    }
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

ipcMain.handle("start-rendering", async (event, options) => {
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

    const finalOutputFolder = options.subFolderName? path.join(options.outputPath, options.subFolderName) : options.outputPath;

    const config = {
        premiereXmlPath: options.xmlPath,
        outputFolder: finalOutputFolder,
        enableLog: options.enableLog,
        overWriteFiles: options.overWriteFiles,
        separateSequences: options.separateSequences,
        ffmpegExePath,
        logFilesPath: path.join(
            finalOutputFolder,
            "premiere-smart-rendering-log"
        ),
        maxConcurrencyProcesses: options.maxConcurrencyProcesses
    };


    await runCore(config, (completed, total) => {
        if (!event.sender.isDestroyed()) {
            event.sender.send("render-progress", {
                completed,
                total,
                percentage: total > 0
                    ? Math.round((completed / total) * 100)
                    : 100
            });
        }

    }); 

    return { success: true };
});


ipcMain.on("resize-window", (event, dimensions) => {
    const window = BrowserWindow.fromWebContents(event.sender);

    if (!window) return;

    const { width, height } = dimensions;

    if (
        !Number.isFinite(width) ||
        !Number.isFinite(height) ||
        width <= 0 ||
        height <= 0 ||
        !window || window.isDestroyed() || 
        window.webContents.isDevToolsOpened()
    ) return;


    window.setContentSize(
        Math.ceil(width),
        Math.ceil(height)
    );
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