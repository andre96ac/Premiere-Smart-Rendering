
const version = document.getElementById("version");

const xmlPath = document.getElementById("xmlPath");
const outputPath = document.getElementById("outputPath");

const startButton = document.getElementById("startRendering");
const status = document.getElementById("status");

version.textContent =
    `Electron ${window.electronAPI.getVersion()}`;

function updateStartButton() {
    startButton.disabled =
        !xmlPath.value || !outputPath.value;
}

document
    .getElementById("selectXml")
    .addEventListener("click", async () => {
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

document
    .getElementById("selectOutput")
    .addEventListener("click", async () => {
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

startButton.addEventListener("click", () => {
    status.textContent = "Rendering non ancora collegato";
});
