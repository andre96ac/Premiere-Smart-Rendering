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
    .addEventListener("click", () => {
        status.textContent = "Selezione XML non ancora collegata";
    });

document
    .getElementById("selectOutput")
    .addEventListener("click", () => {
        status.textContent = "Selezione cartella non ancora collegata";
    });

startButton.addEventListener("click", () => {
    status.textContent = "Rendering non ancora collegato";
});