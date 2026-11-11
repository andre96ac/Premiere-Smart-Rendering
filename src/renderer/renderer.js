const version = document.getElementById("version");

const xmlPath = document.getElementById("xmlPath");
const outputPath = document.getElementById("outputPath");
const xmlDropZone = document.getElementById("xmlDropZone");

const enableLog = document.getElementById("enableLog");
const overWriteFiles = document.getElementById("overWriteFiles");
const separateSequences = document.getElementById("separateSequences");
const concurrencySlider = document.getElementById("maxConcurrencyProcesses");
const concurrencyValue = document.getElementById("concurrencyValue");
const createSubfolderCheckbox = document.getElementById("createSubfolder");
const subfolderNameInput = document.getElementById("subfolderName");

// ProgressBar
const progressContainer = document.getElementById("progressContainer");
const progressFill = document.getElementById("progressFill");
const progressPercentage = document.getElementById("progressPercentage");
const progressText = document.getElementById("progressText");


// Modal warning
const warningModal = document.getElementById("warningModal");
const cancelWarning = document.getElementById("cancelWarning");
const confirmWarning = document.getElementById("confirmWarning");

const startButton = document.getElementById("startRendering");
const status = document.getElementById("status");

version.textContent = `Electron ${window.electronAPI.getVersion()}`;


//ABILITA L'AUTORIDIMENSIONAMENTO (DISABILITARE PER DEBUG)
const enableAutoResizing = true

window.electronAPI.onRenderProgress((progress) => {

    progressContainer.hidden = false;

    progressFill.style.width = `${progress.percentage}%`;
    progressPercentage.textContent = `${progress.percentage}%`;

    progressText.textContent =
        `Clip completate: ${progress.completed} / ${progress.total}`;

});

function updateStartButton() {
    startButton.disabled =
        !xmlPath.value || !outputPath.value;
}

function resizeWindowToFitContent() {
    const container = document.querySelector(".container");

    const width = container.scrollWidth;
    const height = container.scrollHeight;

    window.electronAPI.resizeWindow(width, height);
}

function getFolderPath(filePath) {
  return filePath.replace(/[\\/][^\\/]*$/, "");
}


function applyXmlPath(filePath) {
    xmlPath.value = filePath;
    outputPath.value = getFolderPath(filePath);

    status.textContent = "File XML selezionato";

    updateStartButton();
}

document.getElementById("selectXml").addEventListener("click", async () => {
    try {
        const selectedPath = await window.electronAPI.selectXml();

        if (selectedPath) {
            applyXmlPath(selectedPath)
        }

        updateStartButton();
    } catch (error) {
        status.textContent = `Errore: ${error.message}`;
    }
});


//#region drag&drop

let dragCounter = 0;

function containsFiles(event) {
    return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}


// Impedisce al browser di aprire il file trascinato
// anche quando viene rilasciato fuori dalla zona XML.

window.addEventListener("dragover", (event) => {
    if (containsFiles(event)) {
        event.preventDefault();
    }
});

window.addEventListener("drop", (event) => {
    if (containsFiles(event)) {
        event.preventDefault();
    }
});


// Entrata nella zona XML

xmlDropZone.addEventListener("dragenter", (event) => {
    if (!containsFiles(event)) return;

    event.preventDefault();

    dragCounter++;

    xmlDropZone.classList.add("drag-over");
});


// Movimento sopra la zona XML

xmlDropZone.addEventListener("dragover", (event) => {
    if (!containsFiles(event)) return;

    event.preventDefault();

    event.dataTransfer.dropEffect = "copy";
});


// Uscita dalla zona XML

xmlDropZone.addEventListener("dragleave", (event) => {
    if (!containsFiles(event)) return;

    event.preventDefault();

    dragCounter = Math.max(0, dragCounter - 1);

    if (dragCounter === 0) {
        xmlDropZone.classList.remove("drag-over");
    }
});


// Rilascio del file

xmlDropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    event.stopPropagation();

    dragCounter = 0;

    xmlDropZone.classList.remove("drag-over");

    const files = Array.from(event.dataTransfer?.files ?? []);

    // Accettiamo un solo file
    if (files.length !== 1) {
        status.textContent = "Trascina un solo file XML alla volta.";
        return;
    }

    const file = files[0];

    // Controllo estensione
    if (!file.name.toLowerCase().endsWith(".xml")) {
        status.textContent = "Il file selezionato non è un XML.";
        return;
    }

    try {
        const filePath = window.electronAPI.getPathForFile(file);

        if (!filePath) {
            status.textContent = "Impossibile recuperare il percorso del file.";
            return;
        }

        // Imposta XML e cartella di destinazione
        applyXmlPath(filePath);

    } catch (error) {
        console.error("Errore durante il drag & drop:", error);
        status.textContent = `Errore durante il caricamento: ${error.message}`;
    }
});

//#endregion

document.getElementById("selectOutput").addEventListener("click", async () => {
    try {
        const selectedPath = await window.electronAPI.selectOutput();

        if (selectedPath) {
            outputPath.value = selectedPath;
            status.textContent = "Cartella di destinazione selezionata";
        }

        updateStartButton();
    } catch (error) {
        status.textContent = `Errore: ${error.message}`;
    }
});

startButton.addEventListener("click", async () => {
    const options = {
        xmlPath: xmlPath.value,
        outputPath: outputPath.value,
        enableLog: enableLog.checked,
        overWriteFiles: overWriteFiles.checked,
        separateSequences: separateSequences.checked,
        maxConcurrencyProcesses: Number(concurrencySlider.value),
        subFolderName: createSubfolderCheckbox.checked? subfolderNameInput.value.trim() : ""
    };

    startButton.disabled = true;
    status.textContent = "Rendering in corso...";


    progressContainer.hidden = false;
    progressFill.style.width = "0%";
    progressPercentage.textContent = "0%";
    progressText.textContent = "Preparazione rendering...";

    try {
        await window.electronAPI.startRendering(options);

        progressFill.style.width = "100%";
        progressPercentage.textContent = "100%";
        status.textContent = "Rendering completato!";

    } catch (error) {
        status.textContent = `Errore durante il rendering: ${error.message}`;
    } finally {
        updateStartButton();
    }
});

concurrencyValue.textContent = concurrencySlider.value;
concurrencySlider.addEventListener("input", () => {
    concurrencyValue.textContent = concurrencySlider.value;
});



createSubfolderCheckbox.addEventListener("change", () => {
  if (!createSubfolderCheckbox.checked) {
    warningModal.hidden = false;
    return;
  }

  subfolderNameInput.disabled = false;
});

cancelWarning.addEventListener("click", () => {
  createSubfolderCheckbox.checked = true;
  warningModal.hidden = true;
  subfolderNameInput.disabled = false;
});

confirmWarning.addEventListener("click", () => {
  warningModal.hidden = true;
  subfolderNameInput.disabled = true;
});

warningModal.addEventListener("click", (event) => {
  if (event.target === warningModal) {
    createSubfolderCheckbox.checked = true;
    warningModal.hidden = true;
    subfolderNameInput.disabled = false;
  }
});

updateStartButton();

const container = document.querySelector(".container");

const resizeObserver = new ResizeObserver(() => {
    if(enableAutoResizing){
        resizeWindowToFitContent();
    }
});

resizeObserver.observe(container);
