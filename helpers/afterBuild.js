
import {
    rename,
    rm,
    access
} from "node:fs/promises";

import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const releaseDir = path.resolve("release");

const sourceDir = path.join(releaseDir, "win-unpacked");
const targetDir = path.join(releaseDir, "Premiere Smart Rendering");

const zipPath = path.join(
    releaseDir,
    "Premiere Smart Rendering - Portable.zip"
);

async function main() {

    // Verifica che la build esista
    await access(sourceDir);

    // Rimuove eventuali risultati precedenti
    await rm(targetDir, { recursive: true, force: true });
    await rm(zipPath, { force: true });

    // Rinomina la cartella
    await rename(sourceDir, targetDir);

    console.log("Cartella rinominata.");

    // Crea lo ZIP
    await execFileAsync("powershell.exe", [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        `Compress-Archive -LiteralPath '${targetDir}' -DestinationPath '${zipPath}' -CompressionLevel Optimal`
    ]);

    console.log("Archivio ZIP creato.");
}

main().catch(error => {
    console.error("Errore durante la preparazione del portable:", error);
    process.exitCode = 1;
});