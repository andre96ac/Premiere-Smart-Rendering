
import { spawn } from "node:child_process";
import type { Clip, FfmpegResult } from "../types/types.js";
import { calcFinalFileName, fileExists } from "./utils.js";


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


export async function runFfmpeg(ffmpegPath: string, outputFolder: string, clip: Clip, overwrite: boolean = true,): Promise<FfmpegResult>{

    // //caso stringhe
    // if(typeof(clip) == "string"){

    //     args = [
    //         "-hide_banner",
    //         "-y",
    //         "-i", outputFolder,
    //         "-ss", String(startSeconds),
    //         "-t", String(durationSeconds),
    //         "-map", "0:v:0",
    //         "-map", "0:a?",
    //         "-map_metadata", "0",
    //         "-c", "copy",
    //         "-avoid_negative_ts", "make_zero",
    //         "-movflags", "+faststart",
    //         clip,
    //     ];
    // }


    //caso oggetto clip

        const finalFileName = calcFinalFileName(outputFolder, clip);
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

        const fileExist = await(fileExists(finalFileName));
        if(!fileExist){
            return _runFfmpeg(args, ffmpegPath)
        }
        else{
            if(overwrite){
                console.warn(`ATTENZIONE: file ${finalFileName} già presente... VERRA' SOVRASCRITTO`);
                return _runFfmpeg(args, ffmpegPath)
            }
            else{
                console.warn(`ATTENZIONE: file ${finalFileName} già presente... VERRA' SKIPPATO`);
                return {
                        exitCode: 0,
                        stderr: '',
                        };
            }
        }

}

