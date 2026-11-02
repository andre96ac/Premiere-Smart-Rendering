const version = document.getElementById("version");

const xmlPath = document.getElementById("xmlPath");
const outputPath = document.getElementById("outputPath");

const enableLog = document.getElementById("enableLog");
const overWriteFiles = document.getElementById("overWriteFiles");
const separateSequences = document.getElementById("separateSequences");
const maxConcurrencyProcesses = document.getElementById("maxConcurrencyProcesses");

const startButton = document.getElementById("startRendering");
const status = document.getElementById("status");

version.textContent = `Electron ${window.electronAPI.getVersion()}`;

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

document.getElementById("selectXml").addEventListener("click", async () => {
    try {
        const selectedPath = await window.electronAPI.selectXml();

        if (selectedPath) {
            xmlPath.value = selectedPath;
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
        maxConcurrencyProcesses: Number(maxConcurrencyProcesses.value)
    };

    startButton.disabled = true;
    status.textContent = "Rendering in corso...";

    try {
        await window.electronAPI.startRendering(options);

        status.textContent = "Rendering completato!";
    } catch (error) {
        status.textContent = `Errore durante il rendering: ${error.message}`;
    } finally {
        updateStartButton();
    }
});

updateStartButton();
resizeWindowToFitContent();