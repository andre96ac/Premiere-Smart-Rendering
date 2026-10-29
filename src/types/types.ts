export type Clip = {
    startFrame: number,
    endframe: number,
    fpsTimeBase: number,
    fileName: string, 
    filePath: string,
    startSeconds: number,
    durationSeconds: number,
    clipCountForFile: number,
    sequenceName: string
}


export type FfmpegResult = {
  exitCode: number;
  stderr: string;
};


export type AppConfig = {
  enableLog: boolean,
  premiereXmlPath: string,
  outputFolder: string,
  ffmpegExePath: string,
  logFilesPath: string,
   overWriteFiles: boolean,
  separateSequences: boolean
}