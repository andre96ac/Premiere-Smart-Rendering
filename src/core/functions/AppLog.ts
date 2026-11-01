import { createWriteStream, WriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";


type LogType = 'err' | 'log' | 'warn';


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

    private _enableLogging: boolean = false;

    //#endregion


    //#region PRIVATES


    private _logOnFile(msg: string | Object, type: LogType){
        const finalMsg = typeof(msg) == 'object'? JSON.stringify(msg) : msg;
        if(this._inited){
             switch(type){
                case 'err':
                    this._baseLogFileStream?.write(`ERROR - ${finalMsg}`);
                    break;
                case 'log':
                    this._baseLogFileStream?.write(`LOG - ${finalMsg}`);
                    break;
                case 'warn':
                    this._baseLogFileStream?.write(`WARNING - ${finalMsg}`);
                    break;
            }
            this._baseLogFileStream?.write('\n')
        }

    }

    private _logOnConsole(msg: string | Object, type: LogType, e?: Error){
        if(this._enableLogging){
            switch(type){
                case 'err':
                    console.error(`ERROR - `, msg);
                    if(!!e){
                        console.error(e);
                    }
                    break;
                case 'log':
                    console.log(`LOG - `, msg);
                    break;
                case 'warn':
                    console.warn(`WARNING - `, msg);
                    break;
            }
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
    }


    public log(msg:string | Object){
        this._logOnConsole(msg, 'log')
        this._logOnFile(msg, 'log')
        
    }
    public warn(msg:string | Object){
        this._logOnConsole(msg, 'warn')
        this._logOnFile(msg, 'warn')
        
    }
    public err(msg:string | Object, error?: Error){
        this._logOnConsole(msg, 'err', error)
        this._logOnFile(msg, 'err')

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
        
        const logPath = path.join(
                        this._logFolder?? '',
                        fileName
                    )
    
        let finalJson: string = typeof(myData) == 'object'? JSON.stringify(myData) : myData;
        await writeFile(logPath, finalJson);
     
    }



    //#endregion

    


}
