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
  overWriteFiles: boolean,
 separateSequences: boolean
  premiereXmlPath: string,
  outputFolder: string,
  ffmpegExePath: string,
  logFilesPath: string,
  maxConcurrencyProcesses: number
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
      "logFilesPath"
  ],
  numberFields: [
    "maxConcurrencyProcesses"
  ]
} as const;