# Premiere Smart Rendering — Documento tecnico

**Versione:** 2.0

**Data:** 30 ottobre 2026

**Stato:** Core CLI implementato. Parsing XML di Premiere Pro, conversione dei percorsi, calcolo dei segmenti, configurazione JSON e invocazione di FFmpeg sono presenti nel codice. La validazione della configurazione, la gestione robusta degli errori e la verifica automatica dei file generati richiedono ulteriori sviluppi.

---

## 1. Obiettivo del progetto

Premiere Smart Rendering è un programma per Windows progettato per estrarre automaticamente i segmenti utilizzati in un progetto Adobe Premiere Pro, generando un file video separato per ogni clip individuata nell'XML esportato da Premiere.

L'elaborazione video viene eseguita tramite FFmpeg, utilizzando la modalità stream copy per evitare la ricodifica dei flussi audio e video.

L'obiettivo è ottenere segmenti utilizzabili nei flussi di lavoro di post-produzione, mantenendo la qualità dei flussi codificati originali ed evitando di dover esportare manualmente ogni singolo taglio da Premiere.

Il programma è attualmente organizzato come applicazione CLI basata su TypeScript e Node.js.

### Funzionalità presenti

- Lettura di un file XML esportato da Premiere Pro.
- Parsing XML tramite `fast-xml-parser`.
- Identificazione delle sequenze e delle tracce video.
- Raccolta delle clip presenti nelle tracce video.
- Recupero dei percorsi dei media dalle informazioni XML.
- Conversione degli URL `file://` in percorsi utilizzabili da Windows.
- Calcolo del tempo iniziale e della durata di ciascun segmento.
- Generazione di nomi di output con indice progressivo per nome di file.
- Creazione opzionale di sottocartelle per sequenza.
- Configurazione tramite file JSON.
- Invocazione di FFmpeg mediante `spawn()`.
- Gestione della sovrascrittura o dello skip dei file già esistenti.
- Salvataggio opzionale dei dati XML analizzati in formato JSON.
- Elaborazione sequenziale delle clip.

### Funzionalità ancora da consolidare

- Validazione effettiva della configurazione.
- Gestione dettagliata degli errori di filesystem e dei processi esterni.
- Verifica automatica dei file generati tramite FFprobe.
- Validazione sistematica della precisione dei tagli.
- Gestione di nomi di sequenza e file contenenti caratteri problematici.
- Report finale dei segmenti completati, saltati e falliti.
- Gestione dell'interruzione dell'elaborazione.
- Distribuzione autonoma per Windows senza dipendenze esterne da installare manualmente.

---

## 2. Ambiente e tecnologie

### 2.1 Software e librerie

| Componente | Utilizzo |
|---|---|
| Sistema operativo di riferimento | Windows |
| Adobe Premiere Pro | Software di montaggio da cui proviene l'XML |
| TypeScript | Linguaggio del progetto |
| Node.js | Runtime |
| FFmpeg | Estrazione dei segmenti video |
| fast-xml-parser | Parsing dell'XML |
| `node:fs/promises` | Lettura e scrittura dei file e operazioni sul filesystem |
| `node:child_process` | Avvio di FFmpeg tramite `spawn()` |
| `node:url` | Conversione degli URL file in percorsi locali |

La presenza e le versioni esatte delle dipendenze devono essere confermate consultando il `package.json` completo, non incluso nel materiale analizzato.

### 2.2 Moduli ES

Il codice utilizza import ES Modules e specifica l'estensione `.js` negli import locali, per esempio:

```typescript
import { runFfmpeg } from "./functions/ffmpeg.js";
import type { Clip } from "./types/types.js";
```

Questa convenzione è coerente con un progetto TypeScript compilato per un ambiente Node.js che utilizza moduli ES.

La configurazione completa del compilatore non è disponibile nel materiale analizzato.

---

## 3. Struttura del progetto

La struttura dei sorgenti e gli elementi visibili nell'albero del progetto sono i seguenti:

```text
Premiere Smart Rendering/
├── dist/
│   ├── functions/
│   ├── types/
│   ├── appConfig.json
│   ├── main.d.ts
│   ├── main.d.ts.map
│   ├── main.js
│   ├── main.js.map
│   ├── types.d.ts
│   ├── types.d.ts.map
│   ├── types.js
│   └── types.js.map
├── doc/
│   ├── appunti-progetto.md
│   └── comandi-ffmpeg.md
├── log/
│   └── data.json
├── node_modules/
├── src/
│   ├── functions/
│   │   ├── appConfig.ts
│   │   ├── convertUrlToPath.ts
│   │   ├── ffmpeg.ts
│   │   ├── parseXml.ts
│   │   └── utils.ts
│   ├── types/
│   │   ├── types.ts
│   │   └── xmlPremiereFile.ts
│   ├── appConfig.json
│   └── main.ts
├── .gitignore
├── package-lock.json
├── package.json
├── readme.md
└── tsconfig.json
```

**Nota:** lo ZIP contiene esclusivamente la cartella `src/`. Gli altri elementi sono riportati sulla base dello screenshot. Non è stato possibile verificarne il contenuto interno, né confermare che tutti i file compilati in `dist/` corrispondano esattamente ai sorgenti attuali.

### 3.1 `src/main.ts`

Punto d'ingresso dell'applicazione.

Responsabilità:

- Caricamento della configurazione.
- Lettura dell'XML di Premiere.
- Salvataggio opzionale dei dati XML in JSON.
- Parsing delle sequenze e generazione dell'array di clip.
- Elaborazione sequenziale delle clip tramite FFmpeg.
- Gestione degli errori non intercettati dal flusso principale.

### 3.2 `src/functions/appConfig.ts`

Contiene la funzione `loadConfig()`, che legge il file JSON di configurazione, ne effettua il parsing e richiama la funzione di validazione.

La validazione è attualmente incompleta.

### 3.3 `src/functions/convertUrlToPath.ts`

Contiene `convertUrlToPath()`, che converte gli URL dei file multimediali esportati da Premiere in percorsi utilizzabili dal filesystem locale.

### 3.4 `src/functions/parseXml.ts`

Contiene le funzioni `loadXml()` e `parseXml()`.

Si occupa di leggere l'XML, convertirlo in oggetti TypeScript, raccogliere le clip dalle sequenze e costruire l'array utilizzato dal processo di estrazione.

### 3.5 `src/functions/ffmpeg.ts`

Contiene `_runFfmpeg()` e `runFfmpeg()`.

Gestisce la costruzione degli argomenti FFmpeg, il controllo dei file di destinazione e l'esecuzione del processo esterno.

### 3.6 `src/functions/utils.ts`

Raccoglie le funzioni di supporto:

- Conversione dei frame in secondi.
- Calcolo della durata di una clip.
- Generazione del percorso di output.
- Controllo dell'esistenza di file e cartelle.
- Creazione delle cartelle delle sequenze.
- Salvataggio dei dati in JSON.
- Ricerca del percorso di un media nell'XML.

### 3.7 `src/types/types.ts`

Contiene i tipi principali utilizzati dall'applicazione:

- `Clip`
- `FfmpegResult`
- `AppConfig`

### 3.8 `src/types/xmlPremiereFile.ts`

Contiene le interfacce TypeScript che descrivono la struttura dell'XML esportato da Premiere, inclusi progetto, sequenze, tracce, clip e informazioni sui media.

### 3.9 `src/appConfig.json`

File di configurazione dell'applicazione.

Contiene i percorsi di input e output, il percorso dell'eseguibile FFmpeg e le opzioni di elaborazione.

---

## 4. Architettura e flusso di esecuzione

L'applicazione è organizzata in moduli funzionali, con un punto d'ingresso centrale e funzioni di supporto separate.

Il flusso attuale è:

```text
Avvio dell'applicazione
        |
        v
main.ts
        |
        v
Caricamento configurazione
loadConfig()
        |
        v
Lettura XML Premiere
loadXml()
        |
        +----------------------+
        |                      |
        v                      v
Salvataggio JSON          Parsing XML
se enableLog              parseXml()
                               |
                               v
                     Array di oggetti Clip
                               |
                               v
                    Elaborazione sequenziale
                               |
                               v
                         runFfmpeg()
                               |
                               v
                     Controllo file esistente
                               |
                               v
                         spawn(FFmpeg)
                               |
                               v
                     Generazione del segmento
```

### 4.1 Inizializzazione

La funzione `init()` in `main.ts` carica la configurazione da:

```text
./dist/appConfig.json
```

Il percorso è relativo alla directory di lavoro del processo, non viene ricavato automaticamente dalla posizione del file JavaScript.

La configurazione viene quindi passata a `main()`.

### 4.2 Elaborazione principale

La funzione `main()` esegue nell'ordine:

1. Lettura dell'XML mediante `loadXml()`.
2. Salvataggio dei dati analizzati, se `enableLog` è attivo.
3. Parsing delle sequenze e delle clip mediante `parseXml()`.
4. Elaborazione sequenziale di ogni elemento tramite `runFfmpeg()`.

Il ciclo principale utilizza `for...of` con `await`, evitando di avviare tutte le estrazioni contemporaneamente.

### 4.3 Gestione degli errori

L'inizializzazione viene avviata con una catena di Promise:

```typescript
init()
  .then(config => main(config))
  .catch(err => console.warn(err));
```

Gli errori che raggiungono il livello superiore vengono stampati tramite `console.warn()`.

Non è attualmente presente un sistema centralizzato di classificazione degli errori o un report finale strutturato.

---

## 5. Configurazione dell'applicazione

La configurazione è memorizzata in `src/appConfig.json` e viene letta durante l'inizializzazione.

Il contenuto attuale è:

```json
{
  "enableLog": true,
  "premiereXmlPath": "C:\\Users\\Andrea\\Desktop\\test transcodifica original\\test transcodifica.xml",
  "outputFolder": "C:\\Users\\Andrea\\Desktop\\tst ffmpeg",
  "ffmpegExePath": "D:\\Programmi\\FFmpeg\\ffmpeg.exe",
  "logFilesPath": "./log",
  "overWriteFiles": true,
  "separateSequences": true
}
```

I percorsi riportati sono quelli presenti nel sorgente analizzato e devono essere adattati all'ambiente in cui viene eseguita l'applicazione.

### 5.1 Parametri

| Parametro | Tipo | Descrizione |
|---|---|---|
| `enableLog` | `boolean` | Abilita il salvataggio dei dati XML elaborati in JSON. |
| `premiereXmlPath` | `string` | Percorso del file XML esportato da Premiere. |
| `outputFolder` | `string` | Cartella di destinazione dei segmenti. |
| `ffmpegExePath` | `string` | Percorso dell'eseguibile FFmpeg. |
| `logFilesPath` | `string` | Cartella in cui salvare i dati di log JSON. |
| `overWriteFiles` | `boolean` | Determina se sovrascrivere i file già esistenti. |
| `separateSequences` | `boolean` | Determina se creare sottocartelle distinte per le sequenze. |

### 5.2 Caricamento e validazione

La funzione `loadConfig()`:

1. Legge il file tramite `readFile()`.
2. Converte il contenuto JSON in un oggetto.
3. Richiama `isValid()`.
4. Restituisce l'oggetto come `AppConfig`.

La funzione `isValid()` restituisce attualmente sempre `true`.

Di conseguenza, il programma non verifica realmente:

- La presenza dei campi obbligatori.
- Il tipo dei valori.
- La correttezza dei percorsi.
- L'esistenza dell'XML.
- La disponibilità dell'eseguibile FFmpeg.
- La validità delle opzioni booleane.

Questa funzione è un punto prioritario da completare.

### 5.3 Percorso di caricamento

Il percorso `./dist/appConfig.json` presuppone che il file si trovi nella cartella attesa rispetto alla directory di lavoro.

Il file sorgente `src/appConfig.json` e quello atteso in `dist/appConfig.json` devono essere mantenuti sincronizzati.

La procedura con cui il file JSON viene copiato nella directory di distribuzione deve essere verificata nella configurazione di build, non inclusa nello ZIP.

---

## 6. Lettura e parsing dell'XML di Premiere

Il modulo `parseXml.ts` implementa due funzioni distinte:

- `loadXml(path)`
- `parseXml(xmlData)`

### 6.1 Caricamento dell'XML

La funzione `loadXml()` legge il file in UTF-8 e utilizza `fast-xml-parser`.

La configurazione del parser è:

```typescript
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseAttributeValue: false,
  trimValues: true,
  isArray: (tagName, jPath, isLeafNode, isAttribute) =>
    xmlPathForceArray.includes(jPath.toString())
});
```

Gli attributi XML vengono conservati con il prefisso `@_`.

I valori degli attributi non vengono convertiti automaticamente in numeri o booleani.

### 6.2 Elementi forzati ad array

La funzione imposta esplicitamente come array i seguenti percorsi:

```text
xmeml.project.children.sequence
xmeml.project.children.sequence.media.video.track
xmeml.project.children.sequence.media.video.track.clipitem
```

Questo permette di gestire in modo uniforme le sequenze, le tracce video e gli elementi `clipitem`, anche quando nell'XML è presente un solo elemento.

Gli altri elementi ripetuti non inclusi in questa lista dipendono dal comportamento predefinito del parser.

### 6.3 Gestione degli errori di lettura

La funzione intercetta gli errori e genera un nuovo errore con il messaggio:

```text
ERRORE - FILE XML NON TROVATO
```

Il messaggio viene utilizzato anche per altri eventuali errori verificatisi durante la lettura o il parsing.

Sarebbe opportuno distinguere tra file inesistente, problemi di accesso e XML non valido.

### 6.4 Verifica della struttura

`parseXml()` verifica la presenza della struttura principale:

```text
xmeml
└── project
    └── children
        ├── sequence
        └── clip
```

Se la struttura è incompleta, genera un errore che invita a verificare l'esportazione dell'XML completo del progetto.

Se non sono presenti sequenze, genera un errore specifico.

### 6.5 Raccolta delle clip

Per ogni sequenza, il parser:

1. Legge le tracce video.
2. Raccoglie gli elementi `clipitem` presenti in ciascuna traccia.
3. Mantiene il nome della sequenza associato alle clip.
4. Conta le sequenze, le tracce video e le clip raccolte.
5. Trasforma ogni elemento in un oggetto `Clip`.

Viene stampato un riepilogo simile al seguente:

```text
Analisi progetto completata. Rilevate N sequenze, N tracce, N clip
```

**Limitazione importante:** il codice raccoglie le clip dalle tracce video. Non esegue una raccolta indipendente delle tracce audio né una ricostruzione completa della timeline audiovisiva.

La selezione delle clip da estrarre si basa quindi sugli elementi `clipitem` presenti nelle tracce video dell'XML.

### 6.6 Recupero dei percorsi dei media

Il percorso del file sorgente viene cercato in due modi.

**Primo tentativo:** viene letto da:

```text
sequence.media.video.track.clipitem.file.pathurl
```

**Secondo tentativo:** se il percorso non è presente e non è già stato registrato, viene invocata `findFilePath()` per cercarlo nell'elenco dei clip del progetto.

Il risultato viene memorizzato in `clipFilePath`, un registro indicizzato tramite nome del file.

Questo consente di riutilizzare il percorso quando lo stesso nome ricompare in altri elementi XML.

Il codice usa il nome del file come chiave del registro. Se progetti diversi contengono media distinti con lo stesso nome, questa strategia può associare un percorso non corretto. È opportuno valutare l'utilizzo degli identificativi dei media definiti nell'XML.

### 6.7 Dati obbligatori della clip

Prima di costruire l'oggetto `Clip`, il codice verifica la presenza di:

- `in`
- `out`
- `rate.timebase`
- `name`
- Percorso del file sorgente

Se uno di questi dati manca, viene generato un errore.

La verifica è limitata alla presenza dei valori: non controlla ancora che siano numerici, finiti o coerenti tra loro.

---

## 7. Conversione degli URL in percorsi Windows

Premiere può esportare i percorsi dei file multimediali nel formato URI.

Esempio:

```text
file://localhost/Z%3a/FIGHTTANK/VIDEO/20261024%20-%20Val%20Cavanata/SONY%20CUPPI/20261025_VID1929.MP4
```

Percorso Windows corrispondente:

```text
Z:\FIGHTTANK\VIDEO\20261024 - Val Cavanata\SONY CUPPI\20261025_VID1929.MP4
```

### 7.1 Implementazione

La funzione `convertUrlToPath()` utilizza la funzione nativa `fileURLToPath()` di Node.js.

```typescript
import { fileURLToPath } from "url";

export function convertUrlToPath(fileUrl: string): string {
  let cleanUrl = fileUrl.replace(
    /^file:\/\/localhost\//i,
    "file:///"
  );

  const windowsPath = fileURLToPath(cleanUrl);

  return windowsPath;
}
```

Prima della conversione, la funzione normalizza il prefisso `file://localhost/`, evitando che venga interpretato come un percorso di rete UNC.

La decodifica delle sequenze percent-encoded, come `%20`, viene gestita dalla funzione nativa.

### 7.2 Limiti da verificare

L'implementazione è destinata ai percorsi locali Windows utilizzati dal progetto.

Devono essere verificati separatamente:

- Percorsi UNC.
- URI con autorità diverse da `localhost`.
- URI malformati.
- Percorsi contenenti caratteri particolari.
- Comportamento su sistemi operativi diversi da Windows.

La funzione non verifica che il file convertito esista effettivamente sul disco.

---

## 8. Modello dati delle clip

Il tipo `Clip`, definito in `src/types/types.ts`, rappresenta il singolo segmento da elaborare.

```typescript
export type Clip = {
  startFrame: number;
  endframe: number;
  fpsTimeBase: number;
  fileName: string;
  filePath: string;
  startSeconds: number;
  durationSeconds: number;
  clipCountForFile: number;
  sequenceName: string;
};
```

### 8.1 Significato dei campi

| Campo | Descrizione |
|---|---|
| `startFrame` | Valore del punto `in` letto dall'elemento XML. |
| `endframe` | Valore del punto `out` letto dall'elemento XML. |
| `fpsTimeBase` | Base temporale `rate.timebase` della clip. |
| `fileName` | Nome del file sorgente. |
| `filePath` | Percorso locale del file sorgente. |
| `startSeconds` | Tempo iniziale calcolato in secondi. |
| `durationSeconds` | Durata calcolata in secondi. |
| `clipCountForFile` | Contatore progressivo associato al nome del file. |
| `sequenceName` | Nome della sequenza di Premiere da cui proviene la clip. |

### 8.2 Calcolo del tempo iniziale

Il tempo iniziale viene calcolato da `calcStartSeconds()`:

```typescript
export function calcStartSeconds(
  frameIn: number,
  timeBase: number
): number {
  return frameIn / timeBase;
}
```

La formula implementata è:

\[
t_{\text{start}} = \frac{F_{\text{in}}}{T}
\]

dove:

- \(F_{\text{in}}\) è il valore del campo `in`.
- \(T\) è `rate.timebase`.

### 8.3 Calcolo della durata

La durata viene calcolata da `calcDurationSeconds()`:

```typescript
export function calcDurationSeconds(
  frameIn: number,
  frameOut: number,
  timeBase: number
): number {
  return (frameOut - frameIn) / timeBase;
}
```

La formula è:

\[
t_{\text{duration}} =
\frac{F_{\text{out}} - F_{\text{in}}}{T}
\]

Questi calcoli utilizzano il valore `timebase` dell'elemento XML.

**Attenzione:** il codice non utilizza il campo `ntsc` per ricostruire una base temporale razionale come \(60000/1001\). Se l'XML utilizza una base temporale nominale con indicazione NTSC, il calcolo può non rappresentare esattamente il tempo reale.

La corretta interpretazione dei punti `in` e `out`, della base temporale e delle convenzioni temporali di Premiere deve essere verificata sui file reali.

---

## 9. Generazione dei nomi e organizzazione dell'output

La funzione `calcFinalFileName()` genera il percorso finale di ciascun segmento.

Il nome viene costruito usando:

- Nome del file sorgente.
- Indice progressivo della clip.
- Estensione originale.
- Eventuale nome della sequenza.

Esempio:

```text
20261025_VID1929-1.MP4
20261025_VID1929-2.MP4
20261025_VID1929-3.MP4
```

Il contatore `clipCountForFile` viene incrementato quando il parser incontra un'altra clip con lo stesso nome.

### 9.1 Cartella unica

Se `separateSequences` è `false`, i segmenti vengono destinati direttamente alla cartella di output:

```text
outputFolder/
├── video-1.MP4
├── video-2.MP4
└── video-3.MP4
```

### 9.2 Cartelle separate per sequenza

Se `separateSequences` è `true`, il programma crea una sottocartella per la sequenza:

```text
outputFolder/
├── Sequenza A/
│   ├── video-1.MP4
│   └── video-2.MP4
└── Sequenza B/
    ├── video-1.MP4
    └── video-2.MP4
```

L'esempio illustra l'organizzazione prevista; i nomi effettivi dipendono dai dati dell'XML.

La creazione della sottocartella avviene tramite `createSequenceDir()`, che utilizza `mkdir()` con l'opzione `recursive: true`.

### 9.3 Limitazioni nella generazione dei nomi

La funzione divide il nome sorgente usando il carattere `.` e ricompone le parti senza separatori.

Per un nome come:

```text
ripresa.test.MP4
```

il risultato può perdere il punto interno al nome.

È consigliabile utilizzare le funzioni del modulo `node:path`, in particolare `parse()` e `join()`, per separare correttamente nome ed estensione e costruire i percorsi.

È inoltre necessario verificare la gestione di:

- Nomi di sequenza non validi per Windows.
- Caratteri riservati nei nomi dei file.
- Clip con lo stesso nome presenti in sequenze differenti.
- Possibili collisioni tra nomi di output.

---

## 10. Invocazione di FFmpeg

Il modulo `ffmpeg.ts` contiene due funzioni:

- `_runFfmpeg()`: funzione interna che avvia il processo e gestisce il risultato.
- `runFfmpeg()`: funzione pubblica che prepara l'estrazione della clip.

### 10.1 Costruzione degli argomenti

Il comando generato segue questa struttura:

```text
ffmpeg
  -hide_banner
  -y oppure -n
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

L'array degli argomenti viene costruito nel codice:

```typescript
const args = [
  "-hide_banner",
  argOverwrite,
  "-i", clip.filePath,
  "-ss", String(clip.startSeconds),
  "-t", String(clip.durationSeconds),
  "-map", "0:v:0",
  "-map", "0:a?",
  "-map_metadata", "0",
  "-c", "copy",
  "-avoid_negative_ts", "make_zero",
  "-movflags", "+faststart",
  finalFileName,
];
```

L'uso di un array di argomenti separati evita di dover costruire un'unica stringa di comando con virgolette e spazi gestiti manualmente.

### 10.2 Mappatura dei flussi

Gli argomenti:

```text
-map 0:v:0
-map 0:a?
```

selezionano il primo flusso video e, se disponibile, i flussi audio.

La mappatura dell'audio è opzionale: l'assenza di audio non dovrebbe impedire l'elaborazione per questo motivo.

La selezione del video è invece obbligatoria. Un input privo di flusso video adatto può causare un errore di FFmpeg.

### 10.3 Stream copy

L'opzione:

```text
-c copy
```

copia i flussi senza ricodificarli.

Questo approccio evita il costo computazionale della ricodifica e mantiene i dati dei campioni codificati originali nei pacchetti copiati.

Non garantisce, però, che il taglio avvenga esattamente sul frame richiesto.

La precisione dipende anche dalla struttura del flusso, dai punti di accesso, dai timestamp e dal comportamento di FFmpeg.

### 10.4 Altre opzioni

| Opzione | Funzione |
|---|---|
| `-hide_banner` | Nasconde il banner iniziale di FFmpeg. |
| `-y` | Consente la sovrascrittura degli output. |
| `-n` | Impedisce la sovrascrittura degli output. |
| `-map_metadata 0` | Richiede la copia dei metadati dal primo input. |
| `-avoid_negative_ts make_zero` | Interviene sui timestamp negativi per portarli a zero. |
| `-movflags +faststart` | Sposta i metadati necessari all'avvio progressivo del contenitore MP4. |

La copia dei metadati non equivale alla conservazione di tutte le informazioni proprietarie presenti nell'originale.

### 10.5 Avvio del processo

La funzione `_runFfmpeg()` usa `spawn()`:

```typescript
const process = spawn(ffmpegPath, args, {
  windowsHide: true,
  stdio: ["ignore", "ignore", "pipe"],
});
```

Il processo:

- Non apre una finestra console separata su Windows.
- Non utilizza lo standard input.
- Ignora lo standard output.
- Raccoglie lo standard error.

L'evento `error` provoca il rifiuto della Promise.

L'evento `close` determina il risultato:

- Codice `0`: Promise risolta con `exitCode` e `stderr`.
- Codice diverso da `0`, oppure codice nullo: Promise rifiutata con un errore che include il codice e lo standard error raccolto.

### 10.6 Risultato dell'esecuzione

Il tipo `FfmpegResult` è definito come:

```typescript
export type FfmpegResult = {
  exitCode: number;
  stderr: string;
};
```

La funzione restituisce questo oggetto quando l'operazione termina con successo o quando un file esistente viene saltato.

**Limitazione:** nel codice attuale, `stderr` viene accumulato in memoria e non viene stampato progressivamente nel terminale. Non è implementato un sistema di log persistente specifico per ogni processo FFmpeg.

---

## 11. Gestione dei file esistenti

La funzione `runFfmpeg()` controlla se il percorso di output esiste tramite `existOnFileSystem()`.

Il comportamento dipende dal parametro `overWriteFiles`.

### 11.1 Sovrascrittura abilitata

Se `overWriteFiles` è `true`:

- Se il file non esiste, viene avviato FFmpeg con `-y`.
- Se il file esiste, viene stampato un warning e FFmpeg viene comunque avviato con `-y`.

### 11.2 Sovrascrittura disabilitata

Se `overWriteFiles` è `false`:

- Se il file non esiste, viene avviato FFmpeg con `-n`.
- Se il file esiste, viene stampato un warning e l'estrazione viene saltata.

Nel caso di skip, la funzione restituisce:

```typescript
{
  exitCode: 0,
  stderr: ""
}
```

Questo risultato non distingue uno skip da una vera estrazione completata.

### 11.3 Limiti attuali

La funzione `existOnFileSystem()` utilizza `access()` e restituisce `false` per qualsiasi errore intercettato.

Questo significa che un errore di accesso o un altro problema del filesystem può essere interpretato come assenza del file.

La gestione dovrebbe distinguere almeno:

- File inesistente.
- File esistente.
- Permessi insufficienti.
- Directory non disponibile.
- Errore di accesso al filesystem.

La verifica dell'esistenza e il successivo avvio di FFmpeg non costituiscono un'operazione atomica. L'opzione `-n` offre una protezione aggiuntiva contro la sovrascrittura accidentale quando la sovrascrittura è disabilitata.

### 11.4 Creazione delle cartelle

`createSequenceDir()` crea la cartella della sequenza soltanto quando `separateSequences` è attivo.

La cartella base `outputFolder` non viene creata esplicitamente quando `separateSequences` è disattivato.

È quindi necessario assicurarsi che la cartella di output esista oppure implementare la creazione automatica della directory base.

---

## 12. Log e salvataggio dei dati

La funzione `saveJson()` permette di salvare i dati in formato JSON.

La funzione:

1. Crea la directory di log con `mkdir(..., { recursive: true })`.
2. Costruisce il percorso del file.
3. Serializza gli oggetti tramite `JSON.stringify()`.
4. Scrive il contenuto sul disco.

Il nome predefinito è:

```text
data.json
```

Nel file di configurazione attuale:

```json
{
  "enableLog": true,
  "logFilesPath": "./log"
}
```

Quando `enableLog` è attivo, `main()` salva il risultato restituito da `loadXml()` prima di chiamare `parseXml()`.

Il log rappresenta quindi l'oggetto ottenuto dal parsing XML, non il report finale delle estrazioni.

### Limitazioni

- La serializzazione non utilizza una formattazione indentata.
- Il file viene riscritto a ogni esecuzione.
- Non è presente un report strutturato degli esiti FFmpeg.
- Non vengono registrati in un report separato tutti i segmenti completati, saltati o falliti.
- La funzione costruisce il percorso usando una barra inversa esplicita, anziché `path.join()`.

Per XML molto grandi, il salvataggio dell'intero oggetto può richiedere spazio su disco e memoria aggiuntivi.

---

## 13. Metadati, codec e compatibilità con Premiere

L'approccio attuale utilizza stream copy e richiede a FFmpeg di copiare i metadati dal flusso di input.

Questo non implica che il file risultante sia equivalente all'originale sotto ogni aspetto.

In particolare, la documentazione precedente riportava differenze tra gli originali Sony e i segmenti generati da FFmpeg:

- Differenze nel brand del contenitore MP4.
- Assenza della traccia dati proprietaria Sony `rtmd`.
- Differenze nel riconoscimento automatico dello spazio colore da parte di Premiere Pro.

Questi aspetti devono essere considerati come problemi noti da verificare con i file generati dalla versione attuale.

La conservazione dei flussi codificati non garantisce la conservazione di tutte le tracce ausiliarie, dei metadati proprietari o delle informazioni utilizzate dal software di montaggio per identificare il materiale originale.

### Raccomandazioni operative

- Conservare gli originali Sony.
- Considerare i segmenti generati come derivati di lavoro.
- Verificare il riconoscimento di S-Log3/S-Gamut3.Cine in Premiere.
- Controllare separatamente timecode, metadati di ripresa e sincronizzazione.
- Confrontare codec, profondità colore, risoluzione e frame rate tra originale e segmento.

Non è stata eseguita una nuova verifica sperimentale di questi aspetti sul codice e sui file multimediali attuali.

---

## 14. Precisione dei tagli e frame rate

La precisione dei tagli dipende dalla corretta interpretazione dei punti temporali presenti nell'XML e dal comportamento di FFmpeg in modalità stream copy.

Il codice attuale usa:

```typescript
startSeconds: calcStartSeconds(el.in, el.rate.timebase),
durationSeconds: calcDurationSeconds(
  el.in,
  el.out,
  el.rate.timebase
)
```

I valori vengono quindi convertiti in secondi prima dell'invocazione di FFmpeg.

### 14.1 Limiti della conversione

La conversione:

\[
t = \frac{F}{T}
\]

è corretta soltanto se `F` e `T` rappresentano le grandezze temporali attese.

Nei progetti Premiere possono essere presenti basi temporali con indicazione NTSC e valori di timebase nominali. Il codice attuale non utilizza il campo `ntsc` nella conversione.

Per esempio, un frame rate reale di circa 59,94 fps può essere rappresentato dalla frazione:

\[
\frac{60000}{1001}
\]

anziché da 60 fps esatti.

È necessario verificare se i valori `in`, `out` e `rate.timebase` utilizzati per le clip rappresentino correttamente i punti di taglio nel formato XML esportato.

### 14.2 Stream copy e confini dei segmenti

L'uso di `-c copy` non garantisce il taglio esatto su qualsiasi frame.

I confini ottenuti possono dipendere dai pacchetti disponibili, dai punti di accesso del flusso e dai timestamp.

Per validare l'implementazione è opportuno confrontare i risultati su più clip, con posizioni iniziali e durate differenti, verificando i frame e i timestamp dei file generati.

---

## 15. Tipi dell'XML di Premiere

Il file `src/types/xmlPremiereFile.ts` contiene le interfacce utilizzate per descrivere la struttura XML.

Tra i principali tipi definiti figurano:

- `XmlPremiereFile`
- `Xmeml`
- `Project`
- `ProjectChildren`
- `Sequence`
- `SequenceMedia`
- `SequenceVideo`
- `VideoTrack`
- `AudioTrack`
- `SequenceClipItem`
- `MediaFile`
- `FrameRate`
- `Timecode`
- `Sourcetrack`
- `ClipLink`

Sono inoltre presenti tipi per le informazioni relative a codec, caratteristiche video, audio, etichette e metadati.

La presenza di queste interfacce permette di documentare e tipizzare molte parti della struttura XML, ma non garantisce che ogni variante di XML esportato da Premiere sia coperta.

Il parser utilizza una conversione statica del risultato di `fast-xml-parser` in `XmlPremiereFile`. Questa assegnazione TypeScript non costituisce una validazione strutturale a runtime.

Le interfacce e il parser devono quindi essere mantenuti coerenti con gli XML effettivamente utilizzati.

---

## 16. Stato attuale e limitazioni note

La seguente tabella riassume lo stato ricavabile dai sorgenti analizzati.

| Area | Stato |
|---|---|
| Lettura XML | Implementata |
| Parsing XML | Implementato |
| Raccolta delle clip dalle tracce video | Implementata |
| Recupero dei percorsi media | Implementato |
| Conversione URI in percorsi locali | Implementata |
| Calcolo di start e durata | Implementato, da validare sui frame rate reali |
| Generazione dei nomi di output | Implementata, con limiti nella gestione dei nomi |
| Creazione delle sottocartelle per sequenza | Implementata |
| Invocazione di FFmpeg | Implementata |
| Stream copy | Implementata |
| Sovrascrittura e skip dei file esistenti | Implementati |
| Salvataggio JSON | Implementato |
| Validazione della configurazione | Non implementata effettivamente |
| Verifica automatica con FFprobe | Non presente nei sorgenti analizzati |
| Report finale delle estrazioni | Non presente |
| Log dettagliato e persistente di FFmpeg | Non presente |
| Gestione robusta delle interruzioni | Non presente |
| GUI | Non presente nei sorgenti analizzati |
| Packaging autonomo Windows | Da verificare e sviluppare |

---

## 17. Problemi tecnici da affrontare

### 17.1 Validazione della configurazione

Completare `isValid()` affinché controlli i tipi dei campi, la loro presenza e la correttezza dei valori.

Verificare i percorsi di input, output e FFmpeg prima di iniziare l'elaborazione.

### 17.2 Interpretazione dei tempi

Verificare la relazione tra `in`, `out`, `rate.timebase` e `rate.ntsc`.

Valutare un modello temporale che eviti conversioni premature e mantenga la precisione necessaria fino alla costruzione degli argomenti FFmpeg.

### 17.3 Identificazione dei media

Il registro dei percorsi utilizza `fileName` come chiave.

Valutare l'uso di identificativi più affidabili dell'XML, evitando che due media diversi con lo stesso nome vengano confusi.

### 17.4 Gestione dei percorsi

Utilizzare `node:path` per generare percorsi di output in modo robusto.

Verificare il trattamento di directory mancanti, percorsi non accessibili, nomi di sequenza non validi e percorsi di rete.

### 17.5 Nomi dei file

Correggere la gestione delle estensioni in `calcFinalFileName()`.

Definire una strategia per evitare collisioni tra clip provenienti da sequenze diverse e per gestire i caratteri non ammessi nei nomi Windows.

### 17.6 Gestione degli errori

Distinguere gli errori di lettura XML, parsing, filesystem, configurazione e FFmpeg.

Valutare se un errore relativo a una singola clip debba interrompere l'intero lotto oppure permettere di proseguire con le successive.

### 17.7 Verifica dei risultati

Integrare FFprobe per controllare i file generati e confrontare i risultati con i parametri attesi.

Un codice di uscita pari a zero non è sufficiente, da solo, a garantire che il taglio ottenuto sia corretto rispetto alla timeline.

---

## 18. Verifica dei file generati

Nel codice analizzato non è presente un'integrazione con FFprobe.

Per il controllo manuale dei file è possibile utilizzare:

```cmd
ffprobe -v error -show_streams -show_format -of json "FILE.MP4"
```

I controlli da automatizzare includono:

- Esistenza del file di destinazione.
- Codice di uscita del processo FFmpeg.
- Presenza del flusso video.
- Presenza dell'audio quando previsto.
- Codec audio e video.
- Risoluzione e profondità colore.
- Frame rate.
- Durata del contenitore.
- Timestamp e numero di frame, quando attendibili.
- Metadati attesi.
- Coerenza tra durata richiesta e durata ottenuta.

Per verificare realmente la precisione dei tagli sarà necessario confrontare i segmenti con i punti di taglio originali, tenendo conto delle limitazioni dello stream copy.

---

## 19. Interfaccia e modalità di utilizzo

L'interfaccia attuale è testuale e la configurazione viene letta da un file JSON.

Non è presente, nei sorgenti analizzati, un'interfaccia grafica per selezionare i file.

### 19.1 Procedura prevista

1. Preparare il file XML esportato da Premiere.
2. Impostare `premiereXmlPath` nel file di configurazione.
3. Impostare `outputFolder`.
4. Specificare `ffmpegExePath`.
5. Configurare `enableLog`, `overWriteFiles` e `separateSequences`.
6. Avviare l'applicazione tramite il comando previsto dal progetto.
7. Consultare il terminale per gli eventuali messaggi e warning.

I comandi effettivi di build e avvio devono essere confermati consultando `package.json`, non incluso nello ZIP.

### 19.2 Miglioramenti futuri

La CLI può essere estesa per:

- Accettare i percorsi come argomenti.
- Consentire la selezione interattiva dell'XML.
- Mostrare il progresso delle estrazioni.
- Gestire gli errori per singola clip.
- Generare un report JSON finale.
- Consentire di interrompere l'elaborazione in modo controllato.

Una futura GUI Windows potrà riutilizzare il core esistente, mantenendo separata la logica di elaborazione dall'interfaccia.

---

## 20. Distribuzione futura

L'obiettivo futuro è distribuire un'applicazione Windows che possa essere eseguita senza richiedere all'utente finale di installare manualmente Node.js.

La strategia di distribuzione non è verificabile dai soli sorgenti ricevuti.

Le attività previste comprendono:

- Compilazione dei sorgenti TypeScript.
- Inclusione delle dipendenze JavaScript necessarie.
- Copia del file di configurazione nella posizione attesa.
- Distribuzione di FFmpeg e, quando integrato, FFprobe.
- Gestione dei percorsi degli eseguibili.
- Verifica delle licenze della build FFmpeg utilizzata.
- Test su un computer privo dell'ambiente di sviluppo.

Una distribuzione portatile contenente il runtime, il codice compilato e gli eseguibili necessari può essere valutata prima di realizzare un installer completo.

---

## 21. Roadmap consigliata

Le seguenti attività sono proposte di sviluppo, non funzionalità già implementate.

1. **Validazione della configurazione**
   - Implementare `isValid()`.
   - Controllare i percorsi e i tipi dei parametri.

2. **Consolidamento del parsing XML**
   - Verificare gli XML con una o più sequenze.
   - Verificare tracce vuote e clip prive di alcuni campi.
   - Rendere più robusto il recupero dei percorsi.

3. **Precisione dei tempi**
   - Validare `in`, `out`, `timebase` e `ntsc`.
   - Testare tagli in posizioni differenti.
   - Confrontare i frame attesi e quelli ottenuti.

4. **Gestione dei percorsi e dei nomi**
   - Utilizzare `node:path`.
   - Gestire estensioni, caratteri non validi e collisioni.
   - Verificare la creazione delle cartelle di output.

5. **Robustezza di FFmpeg**
   - Distinguere gli errori di avvio dagli errori di elaborazione.
   - Definire il comportamento in caso di errore di una clip.
   - Valutare la gestione dell'interruzione del processo.

6. **Verifica automatica**
   - Integrare FFprobe.
   - Controllare i flussi e i metadati dei segmenti.
   - Validare la durata dei risultati.

7. **Report finale**
   - Registrare clip completate, saltate e fallite.
   - Produrre un riepilogo leggibile e un eventuale JSON.

8. **Test su un lotto reale**
   - Elaborare decine di clip.
   - Verificare la correttezza dei nomi e dei percorsi.
   - Controllare i risultati in Premiere Pro.

9. **Packaging Windows**
   - Stabilizzare la CLI.
   - Definire la distribuzione del runtime e di FFmpeg.
   - Testare su un computer senza Node.js installato.

10. **Eventuale interfaccia grafica**
    - Progettare la GUI solo dopo aver stabilizzato il core.

---

## 22. Contesto per riprendere lo sviluppo

Premiere Smart Rendering è un progetto TypeScript/Node.js che estrae segmenti da un progetto Adobe Premiere Pro attraverso il parsing dell'XML e l'invocazione di FFmpeg.

Il codice è organizzato in `src/functions/` e `src/types/`, con `src/main.ts` come punto d'ingresso.

Il flusso attuale legge la configurazione da JSON, carica l'XML, raccoglie le clip dalle tracce video, converte i percorsi dei media e costruisce un array di oggetti `Clip`.

Per ogni clip viene calcolato il tempo iniziale e la durata a partire dai valori `in`, `out` e `rate.timebase` dell'XML.

Le clip vengono elaborate sequenzialmente. FFmpeg viene avviato tramite `spawn()` e utilizza stream copy per evitare la ricodifica dei flussi audio e video.

La configurazione permette di scegliere la cartella di output, l'eseguibile FFmpeg, il salvataggio dei dati JSON, la sovrascrittura dei file e la creazione di sottocartelle per sequenza.

Le principali aree da consolidare sono la validazione della configurazione, l'interpretazione precisa dei frame, la robustezza della gestione dei percorsi e degli errori, la verifica dei file generati e la produzione di un report finale.

**Quando si riprende il lavoro, partire sempre dal codice effettivamente presente nel progetto**, evitando di riscrivere funzioni già implementate senza averne prima verificato il comportamento.

La priorità è consolidare il core CLI e rendere verificabili la correttezza dei tagli, la gestione dei file e la compatibilità dei segmenti generati con il flusso di lavoro di Premiere Pro.