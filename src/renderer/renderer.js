const version = document.getElementById("version");

const xmlPath = document.getElementById("xmlPath");
const outputPath = document.getElementById("outputPath");

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

document.getElementById("selectXml").addEventListener("click", async () => {
    try {
        const selectedPath = await window.electronAPI.selectXml();

        if (selectedPath) {
            xmlPath.value = selectedPath;
            outputPath.value = getFolderPath(selectedPath);
            status.textContent = "File XML selezionato";
        }

        updateStartButton();
    } catch (error) {
        status.textContent = `Errore: ${error.message}`;
    }
});

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
