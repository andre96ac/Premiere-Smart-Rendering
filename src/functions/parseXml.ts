import type { Clip } from "../types/types.js"
import { readFile } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";
import type { Sequence, SequenceClipItem, VideoTrack, XmlPremiereFile } from "../types/xmlPremiereFile.js";
import { convertUrlToPath } from "./convertUrlToPath.js";
import { calcDurationSeconds, calcStartSeconds } from "./utils.js";


export async function loadXml(path: string): Promise<XmlPremiereFile>{
 const xmlData = await readFile(path, "utf8");
 

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseAttributeValue: false,
    trimValues: true,
  });

 return <XmlPremiereFile>parser.parse(xmlData);
}

export function parseXml(xmlData: XmlPremiereFile): Clip[]{


    //#todo gestire più sequenze
    const sequence: Sequence = xmlData.xmeml.project.children.sequence 
    const videoTracks: VideoTrack[] = sequence.media.video.track 

    const clipItems: SequenceClipItem[] = [];

    videoTracks.forEach(track => !!track.clipitem? clipItems.push(...track.clipitem) : {})

    
    const result: Clip[] = clipItems.map(el => {  
        if (
                el.in === undefined || 
                el.out === undefined || 
                el.rate?.timebase === undefined || 
                el.name === undefined || 
                el.file?.pathurl === undefined
            ) {
            throw new Error(`Dati clip non validi o incompleti per l'elemento: ${el.name ?? 'Sconosciuto'}`);
        }

        return {
            startFrame: el.in, 
            endframe: el.out, 
            fpsTimeBase: el.rate.timebase, 
            fileName: el.name, 
            filePath: convertUrlToPath(el.file.pathurl),
            startSeconds: calcStartSeconds(el.in, el.rate.timebase),
            durationSeconds: calcDurationSeconds(el.in, el.out, el.rate.timebase)
        }
    })


    return result;

}
