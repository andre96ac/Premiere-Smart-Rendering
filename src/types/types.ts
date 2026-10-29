export type Clip = {
    startFrame: number,
    endframe: number,
    fpsTimeBase: number,
    fileName: string, 
    filePath: string,
    startSeconds: number,
    durationSeconds: number,
    clipCountForFile: number
}


export type FfmpegResult = {
  exitCode: number;
  stderr: string;
};
