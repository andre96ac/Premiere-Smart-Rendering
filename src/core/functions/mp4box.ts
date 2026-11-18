
import { spawn } from "node:child_process";
import { rename, rm } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join, parse } from "node:path";

import { LogType, type AppConfig, type Clip, type CutResult } from "../types/types.js";

import {
    calcFinalFileName,
    calcFinalFilePathName,
    createSequenceDir,
    existOnFileSystem,
    runConcurrent
} from "./utils.js";

import { AppLog } from "./AppLog.js";
import { createInterface } from "node:readline";
import type { Readable } from "node:stream";


/**
 * Esegue un singolo processo MP4Box.
 */
function _runMp4BoxSingle(
    args: string[],
    mp4BoxPath: string,
    logLabel: string
): Promise<CutResult> {

    return new Promise((resolve, reject) => {

        const child = spawn(mp4BoxPath, args, {
            windowsHide: true,
            stdio: ["ignore", "pipe", "pipe"],
        });

        let spawnError: Error | undefined;
        let settled = false;


        // Collega uno stream di MP4Box al file di log
        const attachOutputLogger = (
            stream: Readable | null,
            streamName: string
        ) => {

            if (!stream) return;

            stream.setEncoding("utf8");

            const reader = createInterface({
                input: stream,
                crlfDelay: Infinity
            });

            reader.on("line", (line: string) => {

                AppLog.instance.appendDataOnMainProcessLog(`[${logLabel}] [${streamName}] ${line}`, _getLogTypeFromLine(line));

            });

        };


        // Intercettiamo entrambi gli stream
        attachOutputLogger(child.stdout, "stdout");
        attachOutputLogger(child.stderr, "stderr");


        // Errore durante l'avvio del processo
        child.on("error", (error) => {

            spawnError = error;

            AppLog.instance.appendDataOnMainProcessLog(`[${logLabel}] [SPAWN ERROR] ${error.stack ?? error.message}`, LogType.err);

            if (!settled) {
                settled = true;
                reject(error);
            }

        });


        // Chiusura del processo
        child.on("close", (code, signal) => {

            AppLog.instance.appendDataOnMainProcessLog(`[${logLabel}] [PROCESS END] exitCode=${code}, signal=${signal ?? "none"}`, code == 0? LogType.log : LogType.err);

            if (spawnError || settled) return;

            if (code === 0) {

                settled = true;

                resolve({
                    exitCode: 0,
                    stderr: ""
                });

            } else {

                settled = true;

                reject(
                    new Error(
                        `MP4Box terminato con codice ${code}. ` +
                        `Consultare il log MP4Box per i dettagli: ${logLabel}`
                    )
                );

            }

        });

    });

}


/**
 * Esegue il taglio della clip passata e crea il nuovo file.
 *
 * Utilizza MP4Box con -splitf per rispettare l'intervallo
 * temporale richiesto tramite edit list.
 *
 * @param mp4BoxPath percorso eseguibile MP4Box
 * @param baseOutputFolder cartella di base in cui inserire il video tagliato
 * @param clip elemento clip
 * @param overwrite specifica se sovrascrivere o skippare file eventualmente presenti
 * @param separateSequences specifica se salvare i file in sottocartelle diverse per ogni sequenza
 */
export async function runMp4BoxSingle(
    mp4BoxPath: string,
    baseOutputFolder: string,
    clip: Clip,
    overwrite: boolean = true,
    separateSequences: boolean
): Promise<CutResult> {


    if (separateSequences) {

        // Se siamo in modalità cartelle separate, creo prima la cartella
        await createSequenceDir(clip, baseOutputFolder);

    }


    const finalFileName = calcFinalFilePathName(
        baseOutputFolder,
        clip,
        separateSequences
    );


    // Controllo validità dei tempi
    if (
        !Number.isFinite(clip.startSeconds) ||
        !Number.isFinite(clip.endSeconds) ||
        clip.startSeconds < 0 ||
        clip.endSeconds <= clip.startSeconds
    ) {

        throw new Error(
            `Intervallo temporale non valido per la clip "${calcFinalFileName(clip)}"`
        );

    }


    const splitRange =
        `${Number(clip.startSeconds.toFixed(6))}-${Number(clip.endSeconds.toFixed(6))}`;


    // Verifico se il file esiste già
    const fileExist = await existOnFileSystem(finalFileName);


    if (fileExist && !overwrite) {

        AppLog.instance.warn(
            `File "${finalFileName}" già presente... VERRA' SKIPPATO`
        );

        return {
            exitCode: 0,
            stderr: ""
        };

    }


    if (fileExist && overwrite) {

        AppLog.instance.warn(
            `File "${finalFileName}" già presente... VERRA' SOVRASCRITTO`
        );

    }


    // Creo un file temporaneo nella stessa cartella dell'output.
    // Mantengo l'estensione originale per consentire a MP4Box
    // di riconoscere correttamente il contenitore.
    const parsedPath = parse(finalFileName);

    const temporaryFileName = join(
        parsedPath.dir,
        `${parsedPath.name}.mp4box-${process.pid}-${randomUUID()}${parsedPath.ext}`
    );


    const args = [

        "-splitg", splitRange,
        "-out", temporaryFileName,
        clip.filePath
    ];


    try {

        const result = await _runMp4BoxSingle(
            args,
            mp4BoxPath,
            finalFileName
        );


        // Verifico che MP4Box abbia effettivamente creato il file
        const temporaryFileExists = await existOnFileSystem(temporaryFileName);

        if (!temporaryFileExists) {

            throw new Error(
                `MP4Box ha terminato senza errori ma non ha creato il file: ${temporaryFileName}`
            );

        }


        // Sostituisco l'eventuale output precedente solo dopo
        // aver completato correttamente il nuovo taglio.
        await rename(temporaryFileName, finalFileName);


        return result;

    }
    catch (error) {

        // Elimino l'eventuale file temporaneo incompleto
        await rm(temporaryFileName, { force: true }).catch(() => {});

        throw error;

    }

}


/**
 * Processa l'intero array di clip con MP4Box.
 *
 * Mantiene la stessa struttura e firma di runFfmpeg.
 *
 * @param clips array delle clip da elaborare
 * @param config configurazione applicazione
 * @param onProgress callback avanzamento elaborazione
 */
export async function runMp4Box(
    clips: Clip[],
    config: AppConfig,
    onProgress?: (completed: number, total: number) => void
): Promise<void> {


    let completed = 0;
    let started = 0;

    const total = clips.length;

    if (total === 0) {

        onProgress?.(0, 0);
        return;

    }


    // Percorso eseguibile letto dalla configurazione
    const mp4BoxPath = config.mp4BoxExePath;


    await runConcurrent(
        clips,
        config.maxConcurrencyProcesses,
        async (clip: Clip) => {

            const clipNumber = ++started;

            try {

                await runMp4BoxSingle(
                    mp4BoxPath,
                    config.outputFolder,
                    clip,
                    config.overWriteFiles,
                    config.separateSequences
                );

                AppLog.instance.log(
                    `${clipNumber} di ${total} - Clip "${calcFinalFileName(clip)}" elaborata correttamente!`
                );

            }
            catch (error) {

                AppLog.instance.err(
                    `${clipNumber} di ${total} - Errore durante il taglio della clip "${calcFinalFileName(clip)}"`,
                    error instanceof Error ? error : new Error(String(error))
                );

            }
            finally {

                completed++;
                onProgress?.(completed, total);

            }

        }
    );

}


function _getLogTypeFromLine(line: string): LogType {

       const normalized = line.toLowerCase();

    if (
        /\b(error|fatal|failed|failure)\b/.test(normalized) ||
        normalized.includes("operation not allowed") ||
        normalized.includes("not an mp4 file")
    ) {
        return LogType.err;
    }

    if (
        /\b(warning|warn)\b/.test(normalized)
    ) {
        return LogType.warn;
    }

    return LogType.log;
}