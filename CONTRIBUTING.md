# Contributing to TalkCut

Thanks for your interest in contributing. TalkCut is an open-source, browser-based transcript-first video editor. Everything runs locally — no servers, no API keys, no cloud services.

## Development Setup

```bash
git clone https://github.com/YOUR_USERNAME/talkcut.git
cd talkcut
npm install
npm run dev
```

Open **Chrome** or **Edge** at `http://localhost:5173`. The dev server supports hot module replacement for all TypeScript and CSS.

### Prerequisites

- **Node.js 20+**
- **Google Chrome** or **Microsoft Edge** (required for WebCodecs export; Firefox/Safari work for transcription and editing but cannot export)
- No other toolchain, SDK, or API key is required

### Build

```bash
npm run build     # TypeScript check + Vite production build → dist/
npm run preview   # Serve the production build locally
```

## Architecture Overview

TalkCut is a **vanilla TypeScript single-page application** built with Vite. There is no UI framework — DOM manipulation is direct, and state flows through explicit method calls and callbacks.

### Key source files

| File | Role |
|------|------|
| `src/main.ts` | App shell: layout, keyboard shortcuts (`Space`, arrows, `Ctrl+Z/Y`), tab switching, project save/restore lifecycle. Mounts all UI components after video load. |
| `src/player.ts` | Video element wrapper. Handles drag-and-drop file input, seeks to time, emits load event with `File` object. |
| `src/waveform.ts` | Canvas-based waveform renderer via peaks.js. Shows cut regions as shaded overlays. Click-to-seek. |
| `src/transcription-worker.ts` | Web Worker entry point. Receives audio buffer, runs whisper.cpp WASM inference, posts back `[{word, start, end}]` arrays. |
| `src/transcription-service.ts` | Manages the worker lifecycle: spawn, post audio, receive progress events, resolve transcription on completion. |
| `src/transcribe-button.ts` | Renders the "Transcribe" button and progress bar. Coordinates model download (from CDN to OPFS cache), audio extraction, and transcription. |
| `src/transcript-panel.ts` | Transcript display with per-word span rendering, current-word highlighting during playback, click-to-seek, and text editing with timestamp re-alignment. |
| `src/audio-extractor.ts` | Uses `AudioContext.decodeAudioData()` to extract PCM audio from uploaded video files. |
| `src/cut-manager.ts` | Central cut list model: `CutRegion[]` with add/remove/undo/redo. Emits change events consumed by waveform and export pipeline. |
| `src/cuts-panel.ts` | Sidebar panel for managing cuts: filler word scanner (regex-based), silence detector (timestamp gap analysis), manual selection delete, and per-cut preview/remove. |
| `src/export-panel.ts` | Export settings (quality, format), "Export" button wired to `exporter.ts`, progress bar with frame count. |
| `src/exporter.ts` | WebCodecs pipeline: `VideoDecoder` → skip frames in cut regions → `VideoEncoder` (VP9) + `AudioEncoder` (Opus) → mux to WebM blob. Also exports `isExportSupported()` for capability detection. |
| `src/opfs.ts` | Origin Private File System wrappers for persisting video blobs and JSON project state. Handles `navigator.storage.persist()` for durable storage. |
| `src/style.css` | Global stylesheet. Dark theme with CSS custom properties (`--bg-primary: #1a1a2e`, `--accent: #4f8cff`). |
| `src/types.ts` | Shared TypeScript interfaces: `ProjectState`, `TranscriptWord`, `CutRegion`, `TranscriptionProgress`, `ExportProgress`. |

### Data flow

```
User drops video → player.ts emits File
  → opfs.ts saves blob to OPFS
  → main.ts creates ProjectState
  → setupUI() mounts all panels

User clicks Transcribe → transcribe-button.ts
  → transcription-service.ts spawns Worker
  → transcription-worker.ts runs Whisper WASM
  → TranscriptWord[] written to ProjectState.transcript
  → transcript-panel.ts renders editable text

User deletes text / applies filler removal / trims silence
  → cut-manager.ts updates CutRegion[]
  → waveform.ts shows shaded cut regions
  → Change event triggers OPFS save

User clicks Export → export-panel.ts
  → exporter.ts: VideoDecoder → skip cuts → VideoEncoder + AudioEncoder
  → WebM blob → <a> download
```

## Phase-Based Development

TalkCut was built in six phases. When proposing new features, consider which phase they align with:

| Phase | Scope |
|-------|-------|
| **1. Scaffold & Playback** | Vite + PWA shell, video player, waveform, OPFS persistence |
| **2. Transcription Engine** | whisper.cpp WASM, Web Worker, model download/management |
| **3. Transcript UI & Sync** | Editable transcript, word highlighting, click-to-seek |
| **4. Cut Engine** | Cut list model, filler/silence detection, undo/redo |
| **5. Export** | WebCodecs VP9 + Opus → WebM, GOP-aware cutting |
| **6. Polish & Launch** | Documentation, landing page, error states, community presence |

## PR Guidelines

1. **Keep it small.** Target one feature or fix per PR. Large refactors across multiple files are harder to review.
2. **No external API dependencies.** TalkCut's core promise is that nothing leaves the browser. Do not introduce server-side components, cloud APIs, telemetry, or third-party services. Local-only processing is non-negotiable.
3. **Check browser compatibility.** Any new Web API must be feature-detected with a graceful fallback. Export requires WebCodecs (Chrome/Edge), but editing and transcription should degrade gracefully on other browsers.
4. **Follow existing conventions.** This is vanilla TypeScript — no frameworks. DOM manipulation is direct. Use CSS custom properties from `style.css` for theming. Keep keyboard shortcuts consistent with `main.ts`.
5. **Test manually.** There is no test suite yet. Describe what you tested and how in the PR description.
6. **Update types.** If you add or change a data structure, update `src/types.ts` and ensure strict TypeScript compilation passes (`npm run build`).

## License

By contributing, you agree that your contributions will be licensed under the MIT license.
