import { loadXml, parseXml } from "./functions/parseXml.js";

// TODO Parametrizzare tutto
const xmlPath = "C:\\Users\\Andrea\\Desktop\\20261025_VID1897.xml"
const outputPath = "C:\\Users\\Andrea\\Desktop\\tst ffmpeg"


async function main(){
    const data = await loadXml(xmlPath);
    // console.log(JSON.stringify(data));
    console.log(parseXml(data));

}


main().catch(err => {console.log(err)})
