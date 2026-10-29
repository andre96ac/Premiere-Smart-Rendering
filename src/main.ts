import { runFfmpeg } from "./functions/ffmpeg.js";
import { loadXml, parseXml } from "./functions/parseXml.js";
import { saveJson } from "./functions/utils.js";
import type { AppConfig } from "./types/types.js";

import _appConfig from "./appConfig.json" with {type: "json"};
import { loadConfig } from "./functions/appConfig.js";



async function init(): Promise<AppConfig>{
    const configUrl = "./dist/appConfig.json";
    const config: AppConfig = await loadConfig(configUrl)
    return config
}

async function main(appConfig: AppConfig){
    const data = await loadXml(appConfig.premiereXmlPath);

     if(appConfig.enableLog){
        saveJson(data, appConfig.logFilesPath);
    }

    const finalData = parseXml(data);

    for (const clip of finalData) {
        await runFfmpeg(appConfig.ffmpegExePath, appConfig.outputFolder, clip, appConfig.overWriteFiles, appConfig.separateSequences);
    }

  

}

init()
.then(config => main(config))
.catch(err => console.warn(err))

