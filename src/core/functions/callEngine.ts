import { type Clip, type AppConfig, Engine } from "../types/types.js";
import { AppLog } from "./AppLog.js";
import { runFfmpeg } from "./ffmpeg.js";
import { runMp4Box } from "./mp4box.js";

export function callEngine(clips: Clip[], config: AppConfig, onProgress?: (completed: number, total: number) => void): Promise<void> {


    switch (config.engine){
        case Engine.MP4BOX:
            AppLog.instance.log("Avvio taglio con MP4BOX")
            return runMp4Box(clips,config,onProgress)
            break;
            case Engine.FFMPEG:
            AppLog.instance.log("Avvio taglio con FFMPEG")
            return runFfmpeg(clips,config,onProgress)
            break;
        default:
            return Promise.reject("Motore di decodifica non suppportato")
    }


}
