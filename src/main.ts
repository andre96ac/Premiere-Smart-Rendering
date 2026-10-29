import { runFfmpeg } from "./functions/ffmpeg.js";
import { loadXml, parseXml } from "./functions/parseXml.js";
import { calcFinalFileName } from "./functions/utils.js";

// TODO Parametrizzare tutto

// TODO Gestire xml non presente
const xmlPath = "C:\\Users\\Andrea\\Desktop\\test transcodifica original\\test transcodifica.xml"
// TODO gestire cartella inesistente (magari con scelata percorso tramite finestra di dialogo nativa in windows)
const outputFolder = "C:\\Users\\Andrea\\Desktop\\tst ffmpeg"
// TODO gestire ffmpeg e packetizzare con exe
const ffmpegPath = "D:\\Programmi\\FFmpeg\\ffmpeg.exe"


async function main(){
    const data = await loadXml(xmlPath);
    const finalData = parseXml(data);

    for (const clip of finalData) {
        await runFfmpeg(ffmpegPath, outputFolder, clip, false);
    }

  

}


main().catch(err => {console.log(err)})
