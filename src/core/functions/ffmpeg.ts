
import { spawn } from "node:child_process";
import type { AppConfig, Clip, FfmpegResult } from "../types/types.js";
import { calcFinalFileName, calcFinalFilePathName, createSequenceDir, existOnFileSystem, runConcurrent } from "./utils.js";
import { AppLog } from "./AppLog.js";
import { createInterface } from "node:readline";
import type { Readable } from "node:stream";


// function _runFfmpegSingle(args: string[], ffmpegPath = "ffmpeg"): Promise<FfmpegResult> {
//   return new Promise((resolve, reject) => {
//     const process = spawn(ffmpegPath, args, {
//       windowsHide: true,
//       stdio: ["ignore", "ignore", "pipe"],
//     });

//     let stderr = "";

//     process.stderr.setEncoding("utf8");
//     process.stderr.on("data", (chunk: string) => {
//       stderr += chunk;
//     });

//     process.on("error", (error) => {
//       reject(error);
//     });

//     process.on("close", (code) => {
//       if (code === 0) {
//         resolve({
//           exitCode: 0,
//           stderr,
//         });
//       } else {
//         reject(
//           new Error(
//             `FFmpeg terminato con codice ${code}.\n${stderr}`
//           )
//         );
//       }
//     });
//   });
// }



function _runFfmpegSingle(
    args: string[],
    ffmpegPath = "ffmpeg",
    logLabel = "clip"
): Promise<FfmpegResult> {

    return new Promise((resolve, reject) => {

        const child = spawn(ffmpegPath, args, {
            windowsHide: true,
            stdio: ["ignore", "pipe", "pipe"],
        });

        let spawnError: Error | undefined;


        // Collega uno stream di FFmpeg al file di log
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

                AppLog.instance.appendDataOnFfmpegLog(
                    `[${logLabel}] [${streamName}] ${line}`
                );

            });

        };


        // Intercettiamo entrambi gli stream
        attachOutputLogger(child.stdout, "stdout");
        attachOutputLogger(child.stderr, "stderr");


        // Errore durante l'avvio del processo
        child.on("error", (error) => {

            spawnError = error;

            AppLog.instance.appendDataOnFfmpegLog(
                `[${logLabel}] [SPAWN ERROR] ${error.stack ?? error.message}`
            );

            reject(error);

        });


        // Chiusura del processo
        child.on("close", (code, signal) => {

            AppLog.instance.appendDataOnFfmpegLog(
                `[${logLabel}] [PROCESS END] exitCode=${code}, signal=${signal ?? "none"}`
            );

            if (spawnError) return;

            if (code === 0) {

                resolve({
                    exitCode: 0,
                    stderr: ""
                });

            } else {

                reject(
                    new Error(
                        `FFmpeg terminato con codice ${code}. ` +
                        `Consultare il log FFmpeg per i dettagli`
                    )
                );

            }

        });

    });

}


/**
 * Esegue il taglio della clip passata e crea il nuovo file
 * @param ffmpegPath percorso eseguibile ffmpeg
 * @param baseOutputFolder cartella di base in cui inserire il video tagliato
 * @param clip elemnto clip
 * @param overwrite specifica se sovrascrivere o skippare file eventualmente presenti
 * @param separateSequences specifica se salvare i file in sottocartelle diverse per ogni sequenza
 * @returns 
 */
export async function runFfmpegSingle(ffmpegPath: string, baseOutputFolder: string, clip: Clip, overwrite: boolean = true, separateSequences: boolean): Promise<FfmpegResult>{




        if(separateSequences){
          //se siamo in modalità cartelle separate, creo prima la cartella
          await createSequenceDir(clip, baseOutputFolder);
        }

        const finalFileName = calcFinalFilePathName(baseOutputFolder, clip, separateSequences);
        const argOverwrite = overwrite? '-y' : '-n';
        const args = [
            "-hide_banner",
            argOverwrite,
            "-ss", String(clip.startSeconds),
            "-i", clip.filePath,
            "-t", String(clip.durationSeconds),
            "-map", "0:v:0",
            "-map", "0:a?",
            "-map_metadata", "0",
            "-c", "copy",
            "-avoid_negative_ts", "make_zero",
            "-movflags", "+faststart",
            "-strict", "unofficial",
            finalFileName,
        ];

        const fileExist = await(existOnFileSystem(finalFileName));
        if(!fileExist){
            return _runFfmpegSingle(args, ffmpegPath)
        }
        else{
            if(overwrite){

                AppLog.instance.warn(`File "${finalFileName}" già presente... VERRA' SOVRASCRITTO`);
                return _runFfmpegSingle(args, ffmpegPath)
            }
            else{

                AppLog.instance.warn(`File "${finalFileName}" già presente... VERRA' SKIPPATO`);
                return {
                        exitCode: 0,
                        stderr: '',
                        };
            }
        }

}



/**
 * Processa l'intero array di clip con ffmpeg
 * @param clips 
 * @param config 
 */
export async function runFfmpeg(clips: Clip[], config: AppConfig, onProgress?: (completed: number, total: number) => void): Promise<void> {



  let completed = 0;
  const total = clips.length;

  if (total === 0) {
      onProgress?.(0, 0);
      return;
  }



  await runConcurrent(clips, config.maxConcurrencyProcesses, async (clip: Clip) => {

          try{
            await runFfmpegSingle(config.ffmpegExePath, config.outputFolder, clip, config.overWriteFiles, config.separateSequences);
            AppLog.instance.log(`${completed+1} di ${total} - Clip "${calcFinalFileName(clip)} Elaborata correttaente!"`);
          }
          catch(error){
            AppLog.instance.err(`${completed+1} di ${total} - Errore durante il taglio della clip "${calcFinalFileName(clip)}"`,error instanceof Error ? error : new Error(String(error)));
          }
          finally{
            completed++;
            onProgress?.(completed, total);
          }
      }
  );
}