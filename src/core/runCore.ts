import { AppLog } from "./functions/AppLog.js";
import { runFfmpeg } from "./functions/ffmpeg.js";
import { loadXml, parseXml } from "./functions/parseXml.js";
import type { AppConfig } from "./types/types.js";

import pkg from '../../package.json' with { type: 'json' };


export async function runCore(config: AppConfig) {

    await AppLog.instance.init(config.logFilesPath, config.enableLog);

    AppLog.instance.log(`###### PREMIERE SMART RENDERING V.${pkg.version} BY ${pkg.author} ######`)
    AppLog.instance.log(`Avvio taglio progetto ${config.premiereXmlPath}...`)

    const data = await loadXml(config.premiereXmlPath);


    await AppLog.instance.saveDataOnFile(data, 'data.json');
    
    const clips = parseXml(data);

    await AppLog.instance.saveDataOnFile(clips, 'converted-data.json');
    
    await runFfmpeg(clips, config);

    AppLog.instance.log(`Taglio progetto ${config.premiereXmlPath} terminato`)

    AppLog.instance.end();
}


