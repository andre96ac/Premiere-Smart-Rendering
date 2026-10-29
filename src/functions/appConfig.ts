import { readFile } from "node:fs/promises";
import type { AppConfig } from "../types/types.js";


export async function loadConfig(configPath:string): Promise<AppConfig>{

    const data = await readFile(configPath, "utf-8");
    const config = JSON.parse(data); 

    if(!isValid(config)){
        throw new Error(`ERRORE - Configurazione non valida, controllare ${configPath}`)
    }

    return config as AppConfig;
}


function isValid(config: object):boolean{
    // TODO
    return true
}