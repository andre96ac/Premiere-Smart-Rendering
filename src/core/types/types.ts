export type Clip = {
    startFrame: number,
    endframe: number,
    fpsTimeBase: number,
    fileName: string, 
    filePath: string,
    startSeconds: number,
    endSeconds: number,
    durationSeconds: number,
    clipCountForFile: number,
    sequenceName: string,

}


export type CutResult = {
  exitCode: number;
  stderr: string;
};


export type AppConfig = {
  enableLog: boolean,
  overWriteFiles: boolean,
 separateSequences: boolean
  premiereXmlPath: string,
  outputFolder: string,
  ffmpegExePath: string,
  mp4BoxExePath: string,
  logFilesPath: string,
  maxConcurrencyProcesses: number,
  engine: Engine
}

export const appConfigStructure: {booleanFields: string[], stringFields: string[], numberFields: string[]} = {
  booleanFields: [  
      "enableLog",
      "overWriteFiles",
      "separateSequences"
  ],
  stringFields: [
      "premiereXmlPath",
      "outputFolder",
      "ffmpegExePath",
      "logFilesPath",
      "engine",
      "mp4BoxExePath"
  ],
  numberFields: [
    "maxConcurrencyProcesses"
  ]
} as const;

export enum Engine{
  MP4BOX = "mp4box",
  FFMPEG = "ffmpeg",
}


export enum LogType{
    err = 'ERROR',
    log = 'DEBUG',
    warn = "WARNING"
}
