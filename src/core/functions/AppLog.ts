import { createWriteStream, WriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";


// type LogType = 'err' | 'log' | 'warn';

enum LogType{
    err = 'ERROR',
    log = 'DEBUG',
    warn = "WARNING"
}


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

    private _enableLogging: boolean = true;

    //#endregion


    //#region PRIVATES

    private _getMsgPrefix(type: LogType){
        return `${new Date().toLocaleString()} - ${type} - `
    }


    private _logOnFile(msg: string | Object, type: LogType){
        const finalMsg = typeof(msg) == 'object'? JSON.stringify(msg) : msg;
        if(this._inited){
            this._baseLogFileStream?.write(`${this._getMsgPrefix(type)}${finalMsg}`);
            this._baseLogFileStream?.write('\n')
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

    //#endregion




    //#region PUBLIC

    public async init(logFolder: string, enableLog: boolean){

        this._logFolder = logFolder;
        if(!!this._logFolder && this._logFolder.length > 0){
            await mkdir(logFolder, {recursive: true})
            this._baseLogFileStream = createWriteStream(path.join(
                        this._logFolder,
                        this._baseLogFileName
                    ), {flags: 'a'});
        }
        this._enableLogging = enableLog;

    }

    public end(){
        if(this._inited)
        this._baseLogFileStream?.end();
        this._baseLogFileStream = undefined;
    }


    public log(msg:string | Object){
        if(this._enableLogging){
            this._logOnConsole(msg, LogType.log)
            this._logOnFile(msg, LogType.log)
        }
        
    }
    public warn(msg:string | Object){
        if(this._enableLogging){
            this._logOnConsole(msg, LogType.warn)
            this._logOnFile(msg, LogType.warn)
        }
        
    }
    public err(msg:string | Object, error?: Error){
        if(this._enableLogging){
            this._logOnConsole(msg, LogType.err, error)
            this._logOnFile(msg, LogType.err)
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



    //#endregion

    


}
