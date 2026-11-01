import { runFfmpeg } from "./functions/ffmpeg.js";
import { loadXml, parseXml } from "./functions/parseXml.js";
import { saveJson } from "./functions/utils.js";
import type { AppConfig } from "./types/types.js";

import _appConfig from "./appConfig.json" with {type: "json"};
import { loadConfig } from "./functions/appConfig.js";
import { runCore } from "./runCore.js";
import { AppLog } from "./functions/AppLog.js";



async function init(): Promise<void>{
    const configUrl = "./dist/core/appConfig.json";
    const config = await loadConfig(configUrl);
    await runCore(config);
}

init().catch((error: Error) => {
    AppLog.instance.err("Application error:", error);
    process.exitCode = 1;
});
