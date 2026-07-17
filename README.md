# TalkCut — Edit video by editing the transcript

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Status: Active](https://img.shields.io/badge/status-active-brightgreen.svg)](https://github.com/YOUR_USERNAME/talkcut)

**Nothing leaves your browser.**

---

> **TalkCut is the open-source Descript alternative.** [Descript](https://descript.com) lets you edit video by editing the transcript — but costs $24/mo, burns AI credits on basic operations, and runs as a desktop app that [crashes mid-export](https://old.reddit.com/r/podcasting/comments/1uq5u3w/descript_alternatives/). TalkCut does the same thing, in the browser, for free.
>
> No watermark. No subscription. No login. No API keys. Your video never leaves your machine — transcription, editing, and export all run locally. Upload a video, edit the transcript, download the cut.
>
> **TalkCut — edit video by editing the transcript. Nothing leaves your browser.**

## Features

- **Upload & Transcribe** — Drag and drop MP4, MOV, or MKV. Local Whisper transcription via WebAssembly produces word-level timestamps.
- **Transcript Sync** — Watch words highlight as the video plays. Click any word to seek to that timestamp.
- **Delete to Cut** — Select text in the transcript, press delete, and that segment is removed from the video. Pure delete-only editing — no insert or replace.
- **Filler Word Removal** — One-click scan for "um," "uh," "you know," "like," and "I mean." Preview each removal before applying.
- **Silence Trimming** — Remove pauses longer than an adjustable threshold using word-level timestamp gaps.
- **Export to WebM** — Re-encode your edited video to VP9 + Opus via the WebCodecs API. Downloads directly from the browser.

## Non-Goals

These are deliberate scope decisions for the MVP and will not change before launch:

- **Chrome/Edge only for export.** Firefox and Safari lack WebCodecs encode support. Transcription and editing work on any browser; only the final export step requires Chrome or Edge.
- **Delete-only editing.** You can remove segments from your video, but you cannot insert, replace, or rearrange clips. There is no timeline or multi-track editor.
- **WebM output only.** Export format is WebM (VP9 video, Opus audio). No MP4, no GIF, no social-media presets.
- **English only.** The bundled Whisper model supports English transcription. Non-English language models are a Phase 2 item.
- **No AI features.** No voice cloning (Overdub), no AI audio enhancement (Studio Sound), no AI-generated captions or summaries.

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/talkcut.git
cd talkcut
npm install
npm run dev
```

Open **Google Chrome** or **Microsoft Edge** and navigate to `http://localhost:5173`. Drag in a video, click **Transcribe**, edit the transcript, and export your cut.

## Architecture

| Layer | Technology |
|-------|-----------|
| **Build** | Vite, TypeScript |
| **UI** | Vanilla TypeScript (no framework), CSS custom properties |
| **PWA** | Service worker via `vite-plugin-pwa`, offline-capable after first load |
| **Transcription** | whisper.cpp compiled to WASM, runs in a Web Worker |
| **Video decode/encode** | WebCodecs API (VP9 + Opus → WebM container) |
| **Storage** | Origin Private File System (OPFS) — video files and project state persist locally, no server |

### Source file roles

| File | Purpose |
|------|---------|
| `src/main.ts` | Application shell, layout, keyboard shortcuts, project lifecycle |
| `src/player.ts` | Video playback, drag-and-drop file input, play/pause/seek |
| `src/waveform.ts` | Waveform visualization and seek-by-click |
| `src/transcription-worker.ts` | Web Worker that runs Whisper WASM inference |
| `src/transcription-service.ts` | Worker lifecycle, model loading, progress reporting |
| `src/transcribe-button.ts` | Transcription trigger UI and progress bar |
| `src/transcript-panel.ts` | Editable transcript display with playback sync highlighting |
| `src/audio-extractor.ts` | Extracts audio from video files via Web Audio API |
| `src/cut-manager.ts` | Cut list data model with undo/redo stack |
| `src/cuts-panel.ts` | Cut regions UI: filler/silence detection, manual delete |
| `src/export-panel.ts` | Export settings and progress UI |
| `src/exporter.ts` | WebCodecs decode → apply cuts → re-encode pipeline |
| `src/opfs.ts` | OPFS read/write for video blobs and project state |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup, architecture overview, and PR guidelines.

## Live Demo

**[Try TalkCut on GitHub Pages](https://YOUR_USERNAME.github.io/talkcut)**

## License

MIT © TalkCut contributors
