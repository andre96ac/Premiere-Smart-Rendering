import type { Clip } from "../types/types.js"
import { readFile } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";
import type { Sequence, SequenceClipItem, VideoTrack, XmlPremiereFile } from "../types/xmlPremiereFile.js";
import { convertUrlToPath } from "./convertUrlToPath.js";
import { calcDurationSeconds, calcStartSeconds, saveJson } from "./utils.js";


export async function loadXml(path: string, logJson: boolean = false): Promise<XmlPremiereFile>{
    try{
        const xmlData = await readFile(path, "utf8");
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            parseAttributeValue: false,
            trimValues: true,
        });

        const parsedXml: XmlPremiereFile = parser.parse(xmlData);
        if(logJson){
            saveJson(parsedXml);
        }
        
        return parsedXml;
    } catch(e){
        throw new Error(`ERRORE - FILE XML NON TROVATO`, {cause: e});
    }
    

}

export function parseXml(xmlData: XmlPremiereFile): Clip[]{


    //oggetto che mi conta quante clip ci sono per ogni file con nome uguale
    const clipFileCount: Record<string, number> = {}

    //oggetto che si segna il primo percorso che trova per ogni clip, visto che nei riferimenti successivi i percorsi non ci sono
    const clipFilePath: Record<string, string> = {}

    if(!xmlData || !xmlData.xmeml || !xmlData.xmeml.project || !xmlData.xmeml.project.children){
        throw new Error("ERRORE - FILE XML INCOMPLETO O CORROTTO. Verificare di aver esportato l'xml completo del progetto, e non della singola sequenza");
    }
    
    // TODO gestire più sequenze
    const sequence: Sequence = xmlData.xmeml.project.children.sequence 
    if(!sequence){
        throw new Error("ERRORE - IL FILE XML NON CONTIENE SEQUENZE");
    }

    // TODO gestire traccia singola
    const videoTracks: VideoTrack[] = sequence.media.video.track 

    const clipItems: SequenceClipItem[] = [];


    //mi creo un elenco mettendo insieme le clip di tutte le tracce
    videoTracks.forEach(track => !!track.clipitem? clipItems.push(...track.clipitem) : {})




    console.log(`Analisi progetto completata. Rilevate ${videoTracks.length} tracce, ${clipItems.length} clip`)

    
    const result: Clip[] = clipItems.map(el => {  
        const fileName = el.name;


        // controllo se il file è già presente in clipFileCount, se lo è aumento il contatore, altrimenti lo inserisco
        if(clipFileCount[fileName] !== undefined){
            clipFileCount[fileName]++;
        }
        else{
            clipFileCount[fileName] = 1;
        }


        //recupero il fileUrl dalla clip e lo salvo nel registro, oppure vado a recuperarlo dal registro
        const tempFileUrl = el.file?.pathurl;
        if(!!tempFileUrl && !clipFilePath[fileName]){
            clipFilePath[fileName] = tempFileUrl;
        }
        const finalUrl = clipFilePath[fileName];


        if (
                el.in === undefined || 
                el.out === undefined || 
                el.rate?.timebase === undefined || 
                el.name === undefined || 
                finalUrl === undefined
            ) {
            throw new Error(`Dati clip non validi o incompleti per l'elemento: ${el.name ?? 'Sconosciuto'}`);
        }

        return {
            startFrame: el.in, 
            endframe: el.out, 
            fpsTimeBase: el.rate.timebase, 
            fileName: el.name, 
            filePath: convertUrlToPath(finalUrl),
            startSeconds: calcStartSeconds(el.in, el.rate.timebase),
            durationSeconds: calcDurationSeconds(el.in, el.out, el.rate.timebase),
            clipCountForFile: clipFileCount[el.name] ?? 1
        }
    })


    return result;

}
