import type { Clip } from "../types/types.js";

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