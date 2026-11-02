import {
    cp,
    rm,
    access
} from "node:fs/promises";

import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";


const buildName = "Premiere Smart Rendering - Portable";


const execFileAsync = promisify(execFile);

const releaseDir = path.resolve("release");

const sourceDir = path.join(releaseDir, "win-unpacked");
const targetDir = path.join(releaseDir, buildName);

const zipPath = path.join(
    releaseDir,
    `${buildName}.zip`
);

async function main() {

    await access(sourceDir);

    // Elimina i risultati precedenti
    await rm(targetDir, { recursive: true, force: true });
    await rm(zipPath, { force: true });

    // Copia la cartella
    await cp(sourceDir, targetDir, {
        recursive: true
    });

    console.log("Cartella copiata.");

    // Elimina la cartella originale
    await rm(sourceDir, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 1000
    });

    console.log("Cartella originale rimossa.");

    // Crea lo ZIP
    await execFileAsync("powershell.exe", [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        `Compress-Archive -LiteralPath '${targetDir}' -DestinationPath '${zipPath}' -CompressionLevel Optimal`
    ]);

    console.log("Archivio ZIP creato.");

    
    // Elimina la cartella rinominata
    await rm(targetDir, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 1000
    });

    console.log("Cartella rinominata rimossa");

}

main().catch(error => {
    console.error("Errore durante la preparazione del portable:", error);
    process.exitCode = 1;
});