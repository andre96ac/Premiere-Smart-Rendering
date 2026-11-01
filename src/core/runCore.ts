import { AppLog } from "./functions/AppLog.js";
import { runFfmpeg } from "./functions/ffmpeg.js";
import { loadXml, parseXml } from "./functions/parseXml.js";
import type { AppConfig } from "./types/types.js";

import pkg from '../../package.json' with { type: 'json' };
import { calcFinalFileName } from "./functions/utils.js";


export async function runCore(config: AppConfig) {

    await AppLog.instance.init(config.logFilesPath, config.enableLog);

    AppLog.instance.log(`###### PREMIERE SMART RENDERING V.${pkg.version} BY ${pkg.author} ######`)
    AppLog.instance.log(`Avvio taglio progetto ${config.premiereXmlPath}...`)

    const data = await loadXml(config.premiereXmlPath);


    await AppLog.instance.saveDataOnFile(data, 'data.json');
    
    const clips = parseXml(data);

    await AppLog.instance.saveDataOnFile(clips, 'converted-data.json');
    
    let idx = 1;

    for (const clip of clips) {
        AppLog.instance.log(`${idx} di ${clips.length} - Taglio della clip ${calcFinalFileName(clip)}`)
        try{
            
            await runFfmpeg(
                config.ffmpegExePath,
                config.outputFolder,
                clip,
                config.overWriteFiles,
                config.separateSequences
            );
        }
        catch (e){
            const error: Error = e as Error;
            AppLog.instance.err(error.message, error)
        }
        idx++;
    }

    AppLog.instance.log(`Taglio progetto ${config.premiereXmlPath} terminato`)

    AppLog.instance.end();
}