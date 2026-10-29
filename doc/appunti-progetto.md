# Premiere Smart Cut — Documento tecnico

**Versione:** 1.0  
**Data:** 29 ottobre 2026  
**Stato:** Core in sviluppo, parsing XML e invocazione FFmpeg funzionanti.

## 1. Obiettivo del progetto

Realizzare un programma Windows che estragga automaticamente i segmenti utili dai video montati in Adobe Premiere Pro, eliminando le parti inutilizzate senza ricodificare il video.

Il programma deve:

- Leggere un XML esportato da Premiere Pro.
- Identificare i segmenti utilizzati nella sequenza.
- Recuperare sorgente, punti IN/OUT e informazioni temporali.
- Convertire i percorsi URI dell'XML in percorsi Windows.
- Invocare FFmpeg per creare un file per ogni taglio.
- Preservare la qualità originale tramite stream copy.
- Verificare i file generati.
- Evitare sovrascritture accidentali e gestire gli errori.
- Essere eventualmente distribuito come applicazione Windows senza richiedere Node.js installato.

## 2. Ambiente di lavoro

### Software

- Sistema operativo: Windows.
- Adobe Premiere Pro 2024.4.
- Linguaggio: TypeScript.
- Runtime: Node.js.
- Elaborazione video: FFmpeg.
- Verifica dei media: FFprobe.
- Parsing XML: `fast-xml-parser`.
- Moduli: ES Modules, con `module: "NodeNext"` e `moduleResolution: "NodeNext"`.

### Caratteristiche dei video sorgente

Telecamera: Sony A7 IV.

- Codec: H.264 / AVC, profilo High 4:2:2 Intra.
- Contenitore: MP4, brand `XAVC`.
- Risoluzione: 3840 × 2160.
- Frame rate: 60000/1001, circa 59,94 fps.
- Profondità colore: 10 bit.
- Chroma subsampling: 4:2:2.
- Formato pixel: `yuv422p10le`.
- Profilo colore: Sony S-Log3 / S-Gamut3.Cine.
- Audio: PCM 16 bit, 48 kHz, stereo.
- Traccia dati Sony aggiuntiva: `rtmd`.

## 3. Struttura prevista del progetto

```text
premiere-smart-cut/
├── src/
│   ├── index.ts
│   ├── types/
│   │   └── segment.ts
│   └── core/
│       ├── readXml.ts
│       ├── processSegment.ts
│       └── runFfmpeg.ts
├── package.json
├── tsconfig.json
└── dist/
```

La struttura può essere ampliata in seguito. La priorità è mantenere il core indipendente dall'interfaccia utente, così da poterlo riutilizzare in una futura GUI Electron.

## 4. Configurazione TypeScript

Configurazione di riferimento per `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "declaration": true,
    "verbatimModuleSyntax": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

Nel `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

Dipendenze principali:

```bash
npm install fast-xml-parser
npm install --save-dev typescript @types/node
```

Con `NodeNext`, gli import locali nel codice TypeScript utilizzano l'estensione `.js`, anche se i sorgenti sono file `.ts`.

Esempio:

```typescript
import { readXml } from "./core/readXml.js";
import type { Segment } from "./types/segment.js";
```

Per i moduli Node nativi, utilizzare import espliciti come:

```typescript
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
```

## 5. Parsing dell'XML

L'XML viene letto tramite `node:fs/promises` e convertito in un oggetto JavaScript con `fast-xml-parser`.

Esempio di configurazione:

```typescript
import { readFile } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";

export async function readXml(
  filePath: string
): Promise<unknown> {
  const xmlContent = await readFile(filePath, "utf8");

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseAttributeValue: false,
    trimValues: true,
  });

  return parser.parse(xmlContent);
}
```

Il parsing è già stato implementato nel progetto. È stato inoltre creato un array di oggetti che contiene i dati necessari per ogni taglio.

**Attenzione:** gli elementi XML ripetuti possono essere rappresentati come array, mentre quelli presenti una sola volta possono essere rappresentati come oggetti singoli. Il parser dei segmenti deve gestire entrambe le situazioni.

È inoltre fondamentale distinguere:

- Posizione del clip nella timeline.
- Punto IN nella sorgente.
- Punto OUT nella sorgente.
- Durata del segmento.

Non bisogna presumere che i valori `start` ed `end` rappresentino sempre i punti di taglio nella sorgente. Il significato esatto dipende dal formato XML e dalla struttura del progetto Premiere.

## 6. Percorsi URI dell'XML

Premiere può esportare i percorsi dei file nel formato URI.

Esempio:

```text
file://localhost/Z%3a/FIGHTTANK/VIDEO/20261024%20-%20Val%20Cavanata/SONY%20CUPPI/20261025_VID1929.MP4
```

Percorso Windows corrispondente:

```text
Z:\FIGHTTANK\VIDEO\20261024 - Val Cavanata\SONY CUPPI\20261025_VID1929.MP4
```

Una possibile funzione di conversione:

```typescript
export function fileUriToWindowsPath(uri: string): string {
  const parsedUri = new URL(uri);

  if (parsedUri.protocol !== "file:") {
    throw new Error(`Protocollo non supportato: ${uri}`);
  }

  let path = decodeURIComponent(parsedUri.pathname);
  path = path.replace(/^\/([A-Za-z]):/, "$1:");
  path = path.replaceAll("/", "\\");

  return path;
}
```

Questa implementazione è adatta ai percorsi locali con lettera di unità, come quelli dell'esempio. Per supportare anche URI UNC, server di rete o altre varianti, sarà necessario estenderla e testarla.

## 7. Invocazione di FFmpeg

L'approccio scelto è `spawn()` da `node:child_process`, con un array di argomenti separati.

Esempio concettuale del comando di estrazione:

```text
ffmpeg
  -i INPUT.MP4
  -ss START
  -t DURATION
  -map 0:v:0
  -map 0:a?
  -map_metadata 0
  -c copy
  -avoid_negative_ts make_zero
  -movflags +faststart
  OUTPUT.MP4
```

Il comando riflette il workflow già testato. L'ordine degli argomenti, il calcolo di `START` e `DURATION` e il comportamento esatto ai confini dei segmenti devono rimanere coerenti con l'implementazione funzionante del progetto.

La modalità `-c copy` evita la ricodifica dei flussi audio e video, preservando la qualità dei campioni codificati.

### Funzione di esecuzione

La funzione `runFfmpeg()` utilizza `spawn()` e gestisce:

- Avvio del processo.
- Raccolta di `stderr`.
- Visualizzazione dell'output nel terminale.
- Errori di avvio.
- Codice di uscita del processo.

Per mostrare l'output senza perdere la diagnostica:

```typescript
const proc = spawn(ffmpegPath, args, {
  windowsHide: true,
  stdio: ["ignore", "ignore", "pipe"],
});

let stderr = "";

proc.stderr.setEncoding("utf8");

proc.stderr.on("data", (chunk: string) => {
  process.stderr.write(chunk);
  stderr += chunk;
});
```

La gestione completa deve inoltre attendere l'evento `close`, risolvere la Promise in caso di codice `0` e rifiutarla in caso di errore.

In seguito sarà opportuno evitare che `stderr` cresca senza limiti, salvando il log su file o conservando solo una porzione limitata della diagnostica.

## 8. Elaborazione sequenziale

L'array dei segmenti viene elaborato sequenzialmente con `for...of`:

```typescript
for (const segment of segments) {
  await cutSegment(segment);
}
```

Non utilizzare:

```typescript
segments.forEach(async (segment) => {
  await cutSegment(segment);
});
```

`forEach()` non attende le Promise delle callback. Nel secondo esempio, i processi FFmpeg possono partire contemporaneamente.

Per il primo prototipo, l'elaborazione sequenziale è preferibile perché i file sorgente sono molto grandi e si vuole controllare il carico sul disco.

## 9. Gestione dei file esistenti

La soluzione prevista è:

1. Controllare se il file di destinazione esiste.
2. Se esiste, stampare un warning e saltare il taglio.
3. Passare comunque `-n` a FFmpeg, così il processo non sovrascrive un file eventualmente creato nel frattempo.

Esempio:

```typescript
import { access } from "node:fs/promises";
import { constants } from "node:fs";

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
```

Prima di lanciare FFmpeg:

```typescript
if (await fileExists(outputPath)) {
  console.warn(`File già esistente, salto: ${outputPath}`);
  return;
}
```

La gestione definitiva dovrà distinguere file esistenti, errori di permessi, cartelle mancanti e altri errori del filesystem. Non tutti gli errori restituiti dal controllo di esistenza significano necessariamente che il file non esista.

## 10. Metadati Sony e spazio colore

Durante i test sono emerse differenze tra un originale Sony e un segmento generato da FFmpeg.

L'originale presenta:

- Brand contenitore `XAVC`.
- Traccia dati Sony `rtmd`.
- Tag timecode sulla traccia dati.
- Video H.264 4:2:2 Intra a 10 bit.

Il file generato da FFmpeg presenta:

- Brand contenitore `isom`.
- Solo flussi video e audio.
- Assenza della traccia dati `rtmd`.

Premiere Pro riconosce automaticamente S-Log3/S-Gamut3.Cine negli originali, ma non nei segmenti generati.

Il brand `isom` non implica una perdita di qualità video. Tuttavia, il contenitore risultante non è equivalente all'originale Sony per quanto riguarda i metadati e le tracce proprietarie.

La traccia `rtmd` non è stata ripristinata. L'approccio di copiarla con MP4Box è stato abbandonato.

Per il workflow attuale:

- Conservare sempre gli originali Sony.
- Considerare i segmenti FFmpeg come derivati di lavoro.
- Prevedere eventualmente l'assegnazione manuale o automatizzata dello spazio colore in Premiere.
- Verificare separatamente il timecode, i metadati di ripresa e la sincronizzazione.

Non è stato identificato un singolo campo documentato da Adobe che determini in tutti i casi il rilevamento automatico di S-Log3 nei file Sony.

## 11. Frame rate e precisione dei tagli

Il girato usa il frame rate:

```text
60000/1001 fps
```

equivalente a circa 59,94006 fps.

I punti di taglio provengono dall'XML e sono espressi in frame. Il progetto deve quindi mantenere gli indici di frame come numeri interi durante parsing e calcoli, evitando conversioni premature in valori decimali.

La conversione da frame a tempo può essere effettuata razionalmente:

```text
tempo = frame × 1001 / 60000
```

Tuttavia, questa conversione non garantisce da sola che `-c copy` possa tagliare esattamente a qualsiasi frame. Il taglio senza ricodifica è vincolato alla struttura dei pacchetti e ai punti di accesso del flusso.

Il workflow funzionante è stato verificato su un segmento, ma deve ancora essere validato sistematicamente su tagli con posizioni differenti.

## 12. Verifica dei risultati

Per verificare i file generati, usare FFprobe in formato JSON:

```cmd
ffprobe -v error -show_streams -show_format -of json "FILE.MP4"
```

I controlli automatici da implementare sono:

- Esistenza del file di destinazione.
- Codice di uscita di FFmpeg.
- Presenza del flusso video.
- Presenza dell'audio quando atteso.
- Codec, risoluzione e profondità colore.
- Frame rate.
- Durata e numero di frame, quando attendibili.
- Eventuali metadati attesi.
- Coerenza tra durata richiesta e durata ottenuta.

La durata dichiarata dal contenitore non deve essere considerata da sola una prova sufficiente della correttezza del taglio.

## 13. Interfaccia utente

Per il momento il programma rimane testuale.

La CLI deve consentire di:

- Specificare o selezionare il file XML.
- Specificare la cartella di output.
- Mostrare il numero di segmenti rilevati.
- Visualizzare il progresso e i log di FFmpeg.
- Segnalare i file saltati.
- Riassumere gli errori al termine.
- Eventualmente produrre un report JSON.

In una fase successiva si valuterà una GUI Windows con Electron.

Il core deve rimanere indipendente dall'interfaccia, così che le stesse funzioni possano essere invocate dalla CLI e dalla futura GUI.

## 14. Distribuzione futura

L'obiettivo finale è distribuire un'applicazione Windows che non richieda l'installazione di Node.js.

La strategia verrà valutata dopo aver stabilizzato il core:

- Bundle del runtime Node.js e del codice TypeScript compilato.
- Inclusione delle dipendenze JavaScript.
- Distribuzione di FFmpeg e FFprobe.
- Percorsi relativi all'applicazione per individuare gli eseguibili.
- Verifica delle licenze della build FFmpeg scelta.
- Test su un computer Windows senza ambiente di sviluppo.

Una cartella portatile contenente l'applicazione e gli eseguibili necessari può essere preferibile inizialmente a un singolo `.exe` monolitico.

## 15. Prossime attività

Ordine consigliato:

1. Consolidare il modello TypeScript dei segmenti.
2. Rendere robusta la conversione dei percorsi URI.
3. Verificare la corretta interpretazione dei frame IN/OUT dell'XML.
4. Stabilizzare la costruzione degli argomenti FFmpeg.
5. Gestire file esistenti, errori e interruzioni.
6. Integrare FFprobe per la verifica automatica.
7. Creare un report finale dei segmenti elaborati, saltati e falliti.
8. Testare un lotto di decine di segmenti.
9. Solo successivamente progettare la GUI e il packaging.

## 16. Contesto per una nuova conversazione

Il progetto è scritto in TypeScript/Node.js e il parsing dell'XML e l'invocazione di FFmpeg sono già funzionanti. Esiste un array di oggetti con i dati necessari per ogni taglio. L'elaborazione è sequenziale e il processo FFmpeg viene avviato tramite `spawn()`.

I segmenti vengono generati con stream copy, mantenendo il codec e senza ricodifica. È noto che i file risultanti non conservano la traccia proprietaria Sony `rtmd` e non vengono riconosciuti automaticamente da Premiere come S-Log3/S-Gamut3.Cine.

**Quando si riprende il lavoro, partire dal codice effettivamente presente nel progetto**, non ricostruire da zero le funzioni già implementate. Chiedere all'utente di condividere i file o gli estratti pertinenti prima di modificarli.

Priorità immediata: consolidare il core CLI e verificare in modo affidabile i tagli, la gestione degli errori e i metadati dei segmenti risultanti.