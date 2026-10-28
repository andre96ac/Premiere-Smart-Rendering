
export function calcStartSeconds(frameIn: number, timeBase: number): number{
    return frameIn/timeBase;
}

export function calcDurationSeconds(frameIn: number, frameOut:number, timeBase: number): number{
    return (frameOut - frameIn) / timeBase;
}