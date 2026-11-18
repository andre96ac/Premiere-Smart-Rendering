import { createWriteStream, WriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Engine } from "../types/types.js";
import { LogType } from "../types/types.js";


// type LogType = 'err' | 'log' | 'warn';



export class AppLog{


    //#region PROPERTIES
    private static _instance: AppLog;

    public static get instance(): AppLog{
        if(!this._instance){
            this._instance = new AppLog();
        }

        return this._instance;
    }

    private _logFolder: string | undefined;
    private get _inited(): boolean{
        return !!this._baseLogFileStream;
    }

    private _baseLogFileName: string = 'premiere-smart-rendering.log'
    private _baseLogFileStream: WriteStream | undefined;

    private _MainProcessLogFileName: string | undefined;
    private _mainProcessLogFileStream: WriteStream | undefined;

    private _enableLogging: boolean = true;

    //#endregion


    //#region PRIVATES

    private _getMsgPrefix(type: LogType){
        return `${new Date().toLocaleString()} - ${type} - `
    }


    private _logOnMainFile(msg: string | Object, type: LogType, err?: Error){
        const finalMsg = (typeof(msg) == 'object'? JSON.stringify(msg) : msg) + (!!err? ` - ${err.message}` : ``)
        if(this._inited){
            this._baseLogFileStream?.write(`${this._getMsgPrefix(type)}${finalMsg}\n`);
        }

    }
    
    private _logOnConsole(msg: string | Object, type: LogType, e?: Error){
        const finalMsg = `${this._getMsgPrefix(type)}${msg}`
        switch(type){
            case LogType.err:
                console.error(finalMsg);
                if(!!e){
                    console.error(e);
                }
                break;
            case LogType.log:
                console.log(finalMsg);
                break;
                case LogType.warn:
                    console.warn(finalMsg);
                    break;
                }
            }
            
            
    private _logOnMainProcessFile(msg: string | Object, type: LogType){
        const finalMsg = typeof(msg) == 'object'? JSON.stringify(msg) : msg;
        if(this._inited){
            this._mainProcessLogFileStream?.write(`${this._getMsgPrefix(type)}${finalMsg}\n`);
        }

    }


    //#endregion




    //#region PUBLIC

    public async init(logFolder: string, enableLog: boolean, engine: Engine){

        this._logFolder = logFolder;
        this._MainProcessLogFileName = `${engine}.log`
        if(!!this._logFolder && this._logFolder.length > 0){
            await mkdir(logFolder, {recursive: true})
            this._baseLogFileStream = createWriteStream(path.join(
                        this._logFolder,
                        this._baseLogFileName
                    ), {flags: 'a'}
            );
            this._mainProcessLogFileStream = createWriteStream(path.join(
                        this._logFolder,
                        this._MainProcessLogFileName
                    ), {flags: 'a'}
            );
        }
        this._enableLogging = enableLog;

    }

    public end(): Promise<PromiseSettledResult<void>[] | []>{

        
        const baseFileStream = this._baseLogFileStream;
        const mainProcessLogFileStream = this._mainProcessLogFileStream;

        if(this._inited){

            const promiseBaseFileClose: Promise<void> = new Promise((res, rej) => {
                this._baseLogFileStream = undefined; 
                baseFileStream?.end((err: Error | null) => {
                    if(!!err){
                        rej(err)
                    }
                    else{
                        res();
                    }
                });
            })
            const promiseFfmpegFileClose: Promise<void> = new Promise((res, rej) => {
                this._mainProcessLogFileStream = undefined; 
                mainProcessLogFileStream?.end((err: Error | null) => {
                    if(!!err){
                        rej(err)
                    }
                    else{
                        res();
                    }
                });
            })


            return Promise.allSettled([promiseBaseFileClose, promiseFfmpegFileClose])
        }
        else {
            return Promise.resolve([]);
        } 

    }


    public log(msg:string | Object){
        if(this._enableLogging){
            this._logOnConsole(msg, LogType.log)
            this._logOnMainFile(msg, LogType.log)
        }
        
    }
    public warn(msg:string | Object){
        if(this._enableLogging){
            this._logOnConsole(msg, LogType.warn)
            this._logOnMainFile(msg, LogType.warn)
        }
        
    }
    public err(msg:string | Object, error?: Error){
        if(this._enableLogging){
            this._logOnConsole(msg, LogType.err, error)
            this._logOnMainFile(msg, LogType.err, error)
        }

    }


    /**
     * salva dei dati su un file specificato.
     * @param myData json da salvare
     * @param logFolder percorso escluso nome file
     * @param fileName nome file
     */
    public async saveDataOnFile (myData: object | string, fileName: string): Promise<void>{
      
           
        if(!this._inited){
            this.warn(`Impossibile salvare il file ${fileName} - Log non inizializzati`)    
            return;
        }
        
        if(!this._enableLogging){
            return;
        }

        const logPath = path.join(
                        this._logFolder?? '',
                        fileName
                    )
    
        let finalJson: string = typeof(myData) == 'object'? JSON.stringify(myData) : myData;
        await writeFile(logPath, finalJson);
     
    }


    public appendDataOnMainProcessLog(msg: string, type: LogType){
        if(this._enableLogging){
            this._logOnMainProcessFile(msg, type)
        }
    }



    //#endregion

    


}
