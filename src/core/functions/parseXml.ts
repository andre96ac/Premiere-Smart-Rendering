import type { Clip } from "../types/types.js"
import { readFile } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";
import type { Sequence, SequenceClipItem, VideoTrack, XmlPremiereFile } from "../types/xmlPremiereFile.js";
import { convertUrlToPath } from "./convertUrlToPath.js";
import { calcDurationSeconds, calcStartSeconds, findFilePath, getFpsTimebase } from "./utils.js";
import { AppLog } from "./AppLog.js";


export async function loadXml(path: string): Promise<XmlPremiereFile>{
    try{

        const xmlPathForceArray: string[] = [
            "xmeml.project.children.sequence",
            "xmeml.project.children.sequence.media.video.track",
            "xmeml.project.children.sequence.media.video.track.clipitem",
            "xmeml.project.children.clip"
        ]


        const xmlData = await readFile(path, "utf8");
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            parseAttributeValue: false,
            trimValues: true,
            isArray: (tagName, jPath, isLeafNode, isAttribute) => xmlPathForceArray.includes(jPath.toString())
        });

        const parsedXml: XmlPremiereFile = parser.parse(xmlData);
       
        
        return parsedXml;
    } catch(e){
        throw new Error(`Impossibile caricare o interpretare il file XML: ${path}`, { cause: e });
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
    
    const sequences: Sequence[] = xmlData.xmeml.project.children.sequence 
    if(!sequences || sequences.length <= 0){
        throw new Error("ERRORE - IL FILE XML NON CONTIENE SEQUENZE");
    }

    const clipItemsSequence: {sequenceName: string, clipItems: SequenceClipItem[]}[] = [];
    let trackCount = 0;
    let clipCount = 0;

    sequences.forEach(sequence => {

        const videoTracks: VideoTrack[] = sequence.media.video.track 
    
        const clipItems: SequenceClipItem[] = [];
    
    
        //mi creo un elenco mettendo insieme le clip di tutte le tracce
        videoTracks.forEach(track => {
            trackCount ++;
            !!track.clipitem? clipItems.push(...track.clipitem) : {}
        })
        clipItemsSequence.push({sequenceName: sequence.name, clipItems: clipItems});
        clipCount += clipItems.length; 
    })





    AppLog.instance.log(`Analisi progetto completata. Rilevate ${clipItemsSequence.length} sequenze, ${trackCount} tracce, ${clipCount} clip`)


    
    const result: Clip[] = [];
    
    
    clipItemsSequence.forEach(sequence => {  

        const partialResult: Clip[] = sequence.clipItems.map(el => {
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
            //Il file non è ne in children>sequence>clip, ne nel registro, forse è nell'oggetto children>clip>
            else if(!tempFileUrl && !clipFilePath[fileName]){
                //gestiamo il caso in cui il fileurl non è contenuto nell'oggetto sequence, ma solo nell'oggetto clip. (e non è nel registro)
                clipFilePath[fileName] = findFilePath(fileName, xmlData);
            }
            const finalUrl = clipFilePath[fileName];
            const finalTimeBase = getFpsTimebase(el.rate?.timebase, el.rate.ntsc)


            if (
                    el.in === undefined || 
                    el.out === undefined || 
                    finalTimeBase === undefined || 
                    el.name === undefined || 
                    finalUrl === undefined ||
                    el.in >= el.out
                ) {
                throw new Error(`Dati clip non validi o incompleti per l'elemento: ${el.name ?? 'Sconosciuto'}`);
            }

            return {
                startFrame: el.in, 
                endframe: el.out, 
                fpsTimeBase: finalTimeBase, 
                fileName: el.name, 
                filePath: convertUrlToPath(finalUrl),
                startSeconds: calcStartSeconds(el.in, finalTimeBase),
                durationSeconds: calcDurationSeconds(el.in, el.out, finalTimeBase),
                clipCountForFile: clipFileCount[el.name] ?? 1,
                sequenceName: sequence.sequenceName
            }
        })

        result.push(...partialResult);
    })


    AppLog.instance.log("Creazione dataset completata, vedi converted-data.json per i dettagli");


    return result;

}
