import { access, constants, mkdir, writeFile } from "fs/promises";
import type { Clip } from "../types/types.js";
import path from "path";

export function calcStartSeconds(frameIn: number, timeBase: number): number{
    return frameIn/timeBase;
}

export function calcDurationSeconds(frameIn: number, frameOut:number, timeBase: number): number{
    return (frameOut - frameIn) / timeBase;
}

export function calcFinalFileName(outputFolder: string, clip: Clip): string{

    //togliamo estensione e teniamola a parte
    const splitFileName = clip.fileName.split('.');
    const extension = splitFileName.pop();
    const finalFileName = `${splitFileName.flat()}-${clip.clipCountForFile}.${extension}`;
    const finalPath = `${outputFolder}\\${finalFileName}`

    console.log("NOME DI OUTPUT CALCOLATO: "+ finalPath)
    return finalPath;
}


export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function saveJson (myJson: object | string, logPath: string = './log/generatedJSON.json'): Promise<void>{
  
  const logFolder = path.dirname(logPath);

  await mkdir(logFolder, {recursive: true})

  let finalJson: string = typeof(myJson) == 'object'? JSON.stringify(myJson) : myJson;
  await writeFile(logPath, finalJson);
 
}