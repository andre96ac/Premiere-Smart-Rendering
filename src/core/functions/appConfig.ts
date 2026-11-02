import { readFile } from "node:fs/promises";
import { appConfigStructure, type AppConfig } from "../types/types.js";


export async function loadConfig(configPath:string): Promise<AppConfig>{

    const data = await readFile(configPath, "utf-8");
    const config = JSON.parse(data); 

    if(!isValid(config)){
        throw new Error(`ERRORE - Configurazione non valida, controllare ${configPath}`)
    }

    return config as AppConfig;
}

export function validateConfig(config: AppConfig){
    if(!isValid(config)){
        throw new Error("Configurazione non valida");
    }
}


function isValid(config: object):boolean{
        if (typeof config !== "object" || config === null || Array.isArray(config)) {
        return false;
    }

    const candidate = config as Record<string, unknown>;

   

    // Verifica che tutti i campi stringa siano presenti e non vuoti
    for (const field of appConfigStructure.stringFields) {
        if (
            typeof candidate[field] !== "string" ||
            candidate[field].trim().length === 0
        ) {
            return false;
        }
    }

    // Verifica che tutti i campi booleani abbiano il tipo corretto
    for (const field of appConfigStructure.booleanFields) {
        if (typeof candidate[field] !== "boolean") {
            return false;
        }
    }

    for (const field of appConfigStructure.numberFields){
        if(typeof candidate[field] !== 'number'){
            return false;
        }
    }

    return true;
}