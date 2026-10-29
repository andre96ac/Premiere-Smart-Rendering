
import { spawn } from "node:child_process";
import type { Clip, FfmpegResult } from "../types/types.js";
import { calcFinalFileName } from "./utils.js";


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

export function runFfmpeg(ffmpegPath: string, sourcePath: string, outputPath:string, startSeconds: number, durationSeconds: number): Promise<FfmpegResult>
export function runFfmpeg(ffmpegPath: string, outputFolder: string, clip: Clip): Promise<FfmpegResult>


export function runFfmpeg(ffmpegPath: string, arg2: string, arg3: string | Clip, startSeconds?: number, durationSeconds?: number): Promise<FfmpegResult>{
    let args: string[];

    //caso stringhe
    if(typeof(arg3) == "string"){

        args = [
            "-hide_banner",
            "-y",
            "-i", arg2,
            "-ss", String(startSeconds),
            "-t", String(durationSeconds),
            "-map", "0:v:0",
            "-map", "0:a?",
            "-map_metadata", "0",
            "-c", "copy",
            "-avoid_negative_ts", "make_zero",
            "-movflags", "+faststart",
            arg3,
        ];
    }


    //caso oggetto clip
    else if(typeof(arg3) == "object"){

        
        args = [
            "-hide_banner",
            "-y",
            "-i", arg3.filePath,
            "-ss", String(arg3.startSeconds),
            "-t", String(arg3.durationSeconds),
            "-map", "0:v:0",
            "-map", "0:a?",
            "-map_metadata", "0",
            "-c", "copy",
            "-avoid_negative_ts", "make_zero",
            "-movflags", "+faststart",
            calcFinalFileName(arg2, arg3),
        ];
    }
    else{
        throw new Error(`Errore nella chiamata ad FFMPEG`);
    }

        return _runFfmpeg(args, ffmpegPath)

}

