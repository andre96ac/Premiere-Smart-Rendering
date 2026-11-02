 <div align="center">

<img src="resources/icon.png" alt="Premiere Smart Rendering" width="150">

# PREMIERE SMART RENDERING

### Keep only what matters. Without re-encoding.

Extract and archive the footage you need, **saving disk space, preserving original quality and avoiding the processing time required by traditional transcoding.**

[Download](#-download-and-installation) · [Features](#-features) · [Usage](#workflow) · [Build](#️-development-and-build)
</div>

## 🎬 What is Premiere Smart Rendering?

When working on a video project, it is easy to accumulate hours of footage, even when only a small portion of the material is actually useful.

Premiere Smart Rendering allows you to extract individual video segments used in **Adobe Premiere Pro** sequences, turning them into independent files ready to be archived or reused.

Starting from an XML project exported from Premiere Pro, the application identifies the segments to keep and extracts them directly from the source files, without performing any re-encoding.

The result is a collection containing only the selected footage, with three key benefits:

- 💾 **Less disk space:** keeps only the useful portions instead of entire recordings.
- 🎥 **Original quality:** no generational quality loss caused by additional compression.
- ⚡ **Faster processing:** no lengthy rendering or transcoding times.

## ✨ Features

- **Footage trimming and selection:** select the portions you want directly in the Premiere Pro timeline.
- **Extraction without re-encoding:** direct copying of audio and video streams using FFmpeg (`-c copy`).
- **Automatic organization:** option to separate the output into dedicated subfolders for individual sequences.
- **File management:** choose the destination folder and control whether existing files can be overwritten.
- **Parallel processing:** configure the maximum number of concurrent FFmpeg processes.
- **Progress monitoring:** progress bar showing the number of completed clips.

*Technical note: direct stream copying does not necessarily guarantee frame-accurate cuts. Accuracy depends on the video structure and the position of keyframes.*

## 📥 Download and installation

### Using the application

You do not need to build the project to use the application.

1. Open the **GitHub Releases** section.
2. Download the version you want:
   - **Installer:** to install the application on Windows.
   - **Portable:** to use the application without installation.
3. Launch Premiere Smart Rendering.

### Workflow

1. Open your project in **Adobe Premiere Pro** and arrange the sequences with the portions of footage you want to keep.
2. Export the project in the XML format supported by the application.
3. Launch Premiere Smart Rendering and select the XML file.
4. Choose the destination folder and configure the extraction options.
5. Start processing and wait for it to complete.

The selected clips will be extracted and saved as independent files, without re-encoding.

## 🛠️ Development and build

### Requirements

- Node.js and npm
- FFmpeg

### Project setup

1. Place the FFmpeg executable in the `resources/ffmpeg` folder.

   On Windows: `resources/ffmpeg/ffmpeg.exe`
2. Install the dependencies from the project's root folder:

```bash
npm install
```

### Running the CLI version

Build and launch the command-line version:

```bash
npm run build
npm run start
```

### Running the GUI version

Launch the Electron desktop application in development mode:

```bash
npm run start:app
```

### Windows build

**Windows Installer:**

```bash
npm run dist:win
```

**Portable version:**

```bash
npm run dist:portable
```

<div align="center">

### Less disk space. Original quality. No waiting for rendering.

**PREMIERE SMART RENDERING**


</div>