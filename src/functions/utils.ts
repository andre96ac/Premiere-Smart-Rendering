import { access, constants, mkdir, writeFile } from "fs/promises";
import type { Clip } from "../types/types.js";
import path from "path";
import type { XmlPremiereFile } from "../types/xmlPremiereFile.js";


/**
 * converte il frame di taglio iniziale indicato sulla clip in una durata in secondi
 * @param frameIn frame
 * @param timeBase base temporale della sequenza (fps)
 * @returns 
 */
export function calcStartSeconds(frameIn: number, timeBase: number): number{
    return frameIn/timeBase;
}



/**
 * calcola la durata della clip da tagliare in secondi a partire da frame iniziale, finale, e base temporale
 * @param frameIn frame di taglio iniziale
 * @param frameOut frame di taglio finale
 * @param timeBase base temporale della sequenza (fps)
 * @returns 
 */
export function calcDurationSeconds(frameIn: number, frameOut:number, timeBase: number): number{
    return (frameOut - frameIn) / timeBase;
}


/**
 * calcola il nome + percorso finale di output per il file risultante (percorso \ nome - indice di taglio estensione)
 * @param outputFolder cartella di destinazione
 * @param clip oggetto clip
 * @returns 
 */
export function calcFinalFileName(outputFolder: string, clip: Clip): string{

    //togliamo estensione e teniamola a parte
    const splitFileName = clip.fileName.split('.');
    const extension = splitFileName.pop();
    const finalFileName = `${splitFileName.flat()}-${clip.clipCountForFile}.${extension}`;
    const finalPath = `${outputFolder}\\${finalFileName}`

    console.log("NOME DI OUTPUT CALCOLATO: "+ finalPath)
    return finalPath;
}

/**
 * controlla se un file esiste su disco
 * @param path percorso file incluso nome
 * @returns 
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}


/**
 * salva un json su file (x debug)
 * @param myJson json da salvare
 * @param logPath percorso incluso nome file
 */
export async function saveJson (myJson: object | string, logPath: string): Promise<void>{
  
  const logFolder = path.dirname(logPath);

  await mkdir(logFolder, {recursive: true})

  let finalJson: string = typeof(myJson) == 'object'? JSON.stringify(myJson) : myJson;
  await writeFile(logPath, finalJson);
 
}

/**
 * Trova il percorso del file, pescandolo dall'array clip dell'xmlpremierefile, anzichè dall'array di sequences (usata se nell'array di sequence il percorso non compare per motivi da verificare) 
 * @param fileName nome file da cercare
 * @param xmlData xml di premiere
 */
export function findFilePath(fileName: string, xmlData: XmlPremiereFile): string{
  
  const objClip = xmlData.xmeml.project.children.clip.find(el => el.name == fileName);
  const filePath = objClip?.media.video.track.clipitem.file.pathurl;
  if(!filePath){
    throw new Error(`ERRORE - PERCORSO FILE ${fileName} NON TROVATO NELL'XML`);
  }
  return filePath;
}