import { AppLog } from "./functions/AppLog.js";
import { runFfmpeg } from "./functions/ffmpeg.js";
import { loadXml, parseXml } from "./functions/parseXml.js";
import type { AppConfig } from "./types/types.js";

import pkg from '../../package.json' with { type: 'json' };
import { validateConfig } from "./functions/appConfig.js";
import { createMainProgectDir } from "./functions/utils.js";


export async function runCore(config: AppConfig) {

    try{

        await AppLog.instance.init(config.logFilesPath, config.enableLog);
    
        AppLog.instance.log(`###### PREMIERE SMART RENDERING V.${pkg.version} BY ${pkg.author} ######`)
        AppLog.instance.log(`Avvio taglio progetto "${config.premiereXmlPath}"...`)
    
        validateConfig(config);
    
        const data = await loadXml(config.premiereXmlPath);
    
    
        await AppLog.instance.saveDataOnFile(data, 'data.json');
        
        const clips = parseXml(data);
    
        await AppLog.instance.saveDataOnFile(clips, 'converted-data.json');

        await createMainProgectDir(config.outputFolder);
        
        await runFfmpeg(clips, config);
    
        AppLog.instance.log(`Taglio progetto "${config.premiereXmlPath}" terminato`)
    
        AppLog.instance.end();
    } catch(e){
        const error = e as Error;
        AppLog.instance.err(error instanceof Error ? error.message : error)
        throw e;
    }

}


