import { AppLog } from "./functions/AppLog.js";
import { runFfmpeg } from "./functions/ffmpeg.js";
import { loadXml, parseXml } from "./functions/parseXml.js";
import { saveJson } from "./functions/utils.js";
import type { AppConfig } from "./types/types.js";

export async function runProject(config: AppConfig) {



    await AppLog.instance.init(config.logFilesPath, config.enableLog);

    const data = await loadXml(config.premiereXmlPath);


    AppLog.instance.saveDataOnFile(data, 'data.json');
    
    const clips = parseXml(data);

    AppLog.instance.saveDataOnFile(clips, 'converted-data.json');
    
    for (const clip of clips) {
        await runFfmpeg(
            config.ffmpegExePath,
            config.outputFolder,
            clip,
            config.overWriteFiles,
            config.separateSequences
        );
    }
}