import { runFfmpeg } from "./functions/ffmpeg.js";
import { loadXml, parseXml } from "./functions/parseXml.js";
import { saveJson } from "./functions/utils.js";

// TODO Parametrizzare tutto
const xmlPath = "C:\\Users\\Andrea\\Desktop\\test transcodifica original\\test transcodifica.xml"
// TODO gestire cartella inesistente (magari con scelata percorso tramite finestra di dialogo nativa in windows)
const outputFolder = "C:\\Users\\Andrea\\Desktop\\tst ffmpeg"
// TODO gestire ffmpeg e packetizzare con exe
const ffmpegPath = "D:\\Programmi\\FFmpeg\\ffmpeg.exe"
const logJsonPath = './log/generatedJSON.json'

const logJson: boolean = true;


async function main(){
    const data = await loadXml(xmlPath);

     if(logJson){
        saveJson(data, logJsonPath);
    }

    const finalData = parseXml(data);

    for (const clip of finalData) {
        // TODO inserire overwrite e separatesequences in oggetto configurazione
        await runFfmpeg(ffmpegPath, outputFolder, clip, true, true);
    }

  

}


main().catch(err => console.warn(err))
