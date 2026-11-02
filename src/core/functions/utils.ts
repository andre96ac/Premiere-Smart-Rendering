import { access, constants, mkdir, writeFile } from "fs/promises";
import type { Clip } from "../types/types.js";
import path from "path";
import type { XmlPremiereFile } from "../types/xmlPremiereFile.js";
import { AppLog } from "./AppLog.js";


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


export function calcFinalFileName(clip: Clip): string{

    const splitFileName = clip.fileName.split('.');
    const extension = splitFileName.pop();
    return `${splitFileName.flat()}-${clip.clipCountForFile}.${extension}`;
}


/**
 * calcola il nome + percorso finale di output per il file risultante (percorso \ nome - indice di taglio estensione)
 * @param outputFolder cartella di destinazione
 * @param clip oggetto clip
 * @param includeSequenceFolder specifica se includere nel percorso finale anche la sottocartella con il nome della sequenza;
 * @returns 
 */
export function calcFinalFilePathName(outputFolder: string, clip: Clip, includeSequenceFolder: boolean): string{

    //togliamo estensione e teniamola a parte
    const finalFileName = calcFinalFileName(clip);
    return includeSequenceFolder? path.join(outputFolder,clip.sequenceName,finalFileName) : path.join(outputFolder,finalFileName);
}

/**
 * controlla se un file o directory esiste su disco
 * @param path percorso file incluso nome
 * @returns 
 */
export async function existOnFileSystem(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Crea su filesystem la cartella in cui inserire i video tagliati per la sequenza, solo se la cartella non esiste
 * @param clip 
 * @param baseOutputFolder 
 */
export async function createSequenceDir(clip: Clip, baseOutputFolder: string): Promise<void>{
  const pathToCreate = path.join(baseOutputFolder,clip.sequenceName);
  const pathAlreadyExistOnFs = await existOnFileSystem(pathToCreate)
  if(!pathAlreadyExistOnFs){
    await mkdir(pathToCreate, { recursive: true });
  }

}

/**
 * Crea la directory principale di output del progetto
 * @param baseOutputFolder percorso directory principale
 */
export async function createMainProgectDir(baseOutputFolder: string){
  const pathAlreadyExistOnFs = await existOnFileSystem(baseOutputFolder);
  if(!pathAlreadyExistOnFs){
    await mkdir(baseOutputFolder, { recursive: true });
  }
  
}


/**
 * salva un json su file (x debug)
 * @param myJson json da salvare
 * @param logFolder percorso escluso nome file
 * @param fileName nome file
 */
export async function saveJson (myJson: object | string, logFolder: string, fileName: string = 'data.json'): Promise<void>{
  

  await mkdir(logFolder, {recursive: true})

  const logPath = path.join(logFolder,fileName);
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





export async function runConcurrent<T>(
    items: T[],
    maxConcurrency: number,
    task: (item: T) => Promise<void>
): Promise<void> {

    if (!Number.isInteger(maxConcurrency) || maxConcurrency < 1) {
        throw new Error("maxConcurrency deve essere almeno 1");
    }

    let nextIndex = 0;

    async function worker(): Promise<void> {

        while (true) {

            const index = nextIndex++;

            if (index >= items.length) return;

            const item = items[index];

            try {
                if(!!item){
                  AppLog.instance.log(`${nextIndex} di ${items.length} - Taglio della clip "${calcFinalFileName(item as unknown as Clip)}"`);
                  await task(item);

                }

            } catch (error) {

              AppLog.instance.err(`Errore durante l'elaborazione della clip ${index + 1}:`, error instanceof Error ? error : new Error(String(error)));
            }
        }
    }

    const workers = Array.from(
        { length: Math.min(maxConcurrency, items.length) },
        () => worker()
    );

    await Promise.all(workers);
}