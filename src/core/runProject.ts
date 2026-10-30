import { runFfmpeg } from "./functions/ffmpeg.js";
import { loadXml, parseXml } from "./functions/parseXml.js";
import { saveJson } from "./functions/utils.js";
import type { AppConfig } from "./types/types.js";

export async function runProject(config: AppConfig) {
    const data = await loadXml(config.premiereXmlPath);

    if (config.enableLog) {
        await saveJson(data, config.logFilesPath);
    }

    const clips = parseXml(data);

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