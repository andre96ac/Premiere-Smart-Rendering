
import { spawn } from "node:child_process";
import type { Clip, FfmpegResult } from "../types/types.js";
import { calcFinalFileName, createSequenceDir, existOnFileSystem } from "./utils.js";


function _runFfmpeg(
  args: string[],
  ffmpegPath = "ffmpeg"
): Promise<FfmpegResult> {
  return new Promise((resolve, reject) => {
    const process = spawn(ffmpegPath, args, {
      windowsHide: true,
      stdio: ["ignore", "ignore", "pipe"],
    });

    let stderr = "";

    process.stderr.setEncoding("utf8");
    process.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });

    process.on("error", (error) => {
      reject(error);
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve({
          exitCode: 0,
          stderr,
        });
      } else {
        reject(
          new Error(
            `FFmpeg terminato con codice ${code}.\n${stderr}`
          )
        );
      }
    });
  });
}

// export function runFfmpeg(ffmpegPath: string, sourcePath: string, outputPath:string, startSeconds: number, durationSeconds: number, overwrite?: boolean): Promise<FfmpegResult>
// export function runFfmpeg(ffmpegPath: string, outputFolder: string, clip: Clip, overwrite?: boolean): Promise<FfmpegResult>

/**
 * Esegue il taglio della clip passata e crea il nuovo file
 * @param ffmpegPath percorso eseguibile ffmpeg
 * @param baseOutputFolder cartella di base in cui inserire il video tagliato
 * @param clip elemnto clip
 * @param overwrite specifica se sovrascrivere o skippare file eventualmente presenti
 * @param separateSequences specifica se salvare i file in sottocartelle diverse per ogni sequenza
 * @returns 
 */
export async function runFfmpeg(ffmpegPath: string, baseOutputFolder: string, clip: Clip, overwrite: boolean = true, separateSequences: boolean): Promise<FfmpegResult>{


        if(separateSequences){
          //se siamo in modalità cartelle separate, creo prima la cartella
          await createSequenceDir(clip, baseOutputFolder);
        }

        const finalFileName = calcFinalFileName(baseOutputFolder, clip, separateSequences);
        const argOverwrite = overwrite? '-y' : '-n';
        const args = [
            "-hide_banner",
            argOverwrite,
            "-i", clip.filePath,
            "-ss", String(clip.startSeconds),
            "-t", String(clip.durationSeconds),
            "-map", "0:v:0",
            "-map", "0:a?",
            "-map_metadata", "0",
            "-c", "copy",
            "-avoid_negative_ts", "make_zero",
            "-movflags", "+faststart",
            finalFileName,
        ];

        const fileExist = await(existOnFileSystem(finalFileName));
        if(!fileExist){
            return _runFfmpeg(args, ffmpegPath)
        }
        else{
            if(overwrite){
                //TODO implementare classe log con scrittura file + terminale

                console.warn(`ATTENZIONE: file ${finalFileName} già presente... VERRA' SOVRASCRITTO`);
                return _runFfmpeg(args, ffmpegPath)
            }
            else{
                //TODO implementare classe log con scrittura file + terminale

                console.warn(`ATTENZIONE: file ${finalFileName} già presente... VERRA' SKIPPATO`);
                return {
                        exitCode: 0,
                        stderr: '',
                        };
            }
        }

}

