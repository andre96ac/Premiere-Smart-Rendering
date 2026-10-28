import { loadXml, parseXml } from "./functions/parseXml.js";


const path = "C:\\Users\\Andrea\\Desktop\\20261025_VID1897.xml"
loadXml(path).then(data => {console.log(parseXml(data))})

