# TalkCut

A browser-based, transcript-driven video editor. All media processing—transcription, editing, and export—runs locally in the user's browser. No server upload, no API key, and no cloud transcription are required.

[![CI](https://github.com/xzabir/talkcut/actions/workflows/ci.yml/badge.svg)](https://github.com/xzabir/talkcut/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-blue)](https://xzabir.github.io/talkcut)

## Abstract

TalkCut is a single-page web application that lets users edit talking-head video by editing the transcript. The pipeline is: (1) a media file is selected in the browser, (2) audio is extracted locally and passed to a Web Worker for speech recognition, (3) the resulting word-level timestamps drive an editable transcript panel synchronized to playback, and (4) user-selected deletions are exported through a WebCodecs re-encode into a WebM/VP9/Opus file. The current release uses a synthetic speech-recognition engine for end-to-end UI validation while the real whisper.cpp/WASM integration is finalized.

## Motivation

Existing transcript-driven video editors require server-side transcription and subscription pricing. Cloud processing raises privacy concerns for journalists and legal users, and network transfers limit usability for large files. TalkCut tests whether the same editing paradigm can be implemented entirely inside the browser using modern on-device APIs (WebCodecs, Web Audio, OPFS, Web Workers) and open models (whisper.cpp).

## Architecture

```mermaid
flowchart LR
    A[Media file] --> B[OPFS cache]
    B --> C[HTML5 video element]
    C --> D[Web Audio API<br/>downmix + resample to 16kHz]
    D --> E[Web Worker]
    E --> F[whisper.cpp / WASM<br/>synthetic engine in v0.1]
    F --> G[word-level timestamps]
    G --> H[Transcript model]
    H --> I[TranscriptPanel UI]
    I --> J[Cut list]
    J --> K[WebCodecs decode<br/>VP9 re-encode]
    K --> L[WebM muxer]
    L --> M[download .webm]
```

| Component | Technology | Notes |
|---|---|---|
| Build system | Vite 6, TypeScript 5.6 | Vanilla TypeScript; no React or framework runtime. |
| UI shell | DOM + CSS custom properties | Dark theme, responsive two-pane layout. |
| PWA | `vite-plugin-pwa` + custom SW | Offline-capable app shell; models cached after first download. |
| Video player | HTML5 `<video>` | Drag-and-drop MP4/MOV/MKV input. |
| Audio preprocessing | Web Audio API | Decodes source audio, downmixes to mono, resamples to 16 kHz. |
| Transcription | Web Worker + whisper.cpp/WASM | v0.1 uses a synthetic engine for UI validation. |
| Transcript UI | `contenteditable` word spans | Playback sync, click-to-seek, inline editing, forced realignment. |
| Cut model | `src/cut-manager.ts` | Delete-only regions with undo/redo (50-state stack). |
| Export | WebCodecs + inline WebM muxer | VP9 video, Opus audio, A/V sync offset correction. |
| Storage | OPFS | Video blob, transcript, and cut list persist across reloads. |

## Key Design Constraints

These are deliberate scope decisions for the v0.1 release, not temporary limitations:

- **Delete-only editing.** Segments can be removed from the transcript/video. No insert, replace, multi-track, or timeline-style rearrangement is supported.
- **Chrome/Edge only for export.** The WebCodecs `VideoEncoder` API is not available in Firefox or Safari at this release. Transcription and editing run on any modern browser; export requires a Chromium-based browser.
- **WebM/VP9/Opus output only.** No MP4, GIF, or social-format export is implemented.
- **English transcription only.** The whisper model bundle and UI are scoped to English. Additional languages are planned for a later release.
- **No AI features.** No voice cloning, AI audio enhancement, auto-captions, or generative editing.
- **Keyframe-boundary cuts (v0.1).** Cuts are snapped to the nearest keyframe in the source stream, giving ~2–5 s granularity. Frame-accurate GOP-aware cutting is planned for the next release.

## Benchmarks / Evaluation

All numbers are from the stated reference environment unless otherwise marked. Rows marked **pending** were not run during the v0.1 build and are reserved for the next release cycle.

| Benchmark | v0.1 result | Reference machine | Status |
|---|---|---|---|
| Synthetic transcription speed | ~0.5× real-time (audio duration × 0.5) | Any modern laptop | Measured, not representative of real whisper.cpp |
| whisper.cpp tiny model | — | mid-range laptop (8 cores, 16 GB RAM) | pending |
| whisper.cpp small model | — | mid-range laptop (8 cores, 16 GB RAM) | pending |
| Export time vs. clip length | — | Chrome, 8 cores, 16 GB RAM | pending |
| Memory footprint at export | — | Chrome, 16 GB RAM | pending |
| A/V sync drift after 5 cuts | — | Chrome | pending |

## Installation

```bash
git clone https://github.com/xzabir/talkcut.git
cd talkcut
npm install
npm run typecheck
npm run test
npm run build
npm run dev
```

Open `http://localhost:5173` in Chrome or Edge. Drag in a video, click **Transcribe**, edit the transcript, and export the cut.

## Comparison

| Tool | Price | Local processing | Browser | Export formats | Open source |
|---|---|---|---|---|---|
| Descript | $16–50/mo + credits | No | Web beta only | MP4, GIF, social | No |
| BBC react-transcript-editor | Free | No | Component only | None | Yes, abandoned |
| autoEdit_2 | Free | No | Electron | None | Yes, abandoned |
| OpenCut | Free | Partial | Desktop / web | MP4, etc. | Yes |
| TalkCut | Free | Yes | Yes | WebM | Yes (MIT) |

Sources: [Descript pricing](https://descript.com/pricing), [BBC react-transcript-editor](https://github.com/bbc/react-transcript-editor), [autoEdit_2](https://github.com/OpenNewsLabs/autoEdit_2), [OpenCut](https://github.com/OpenCut-app/OpenCut).

## Roadmap

| Phase | Status | Description |
|---|---|---|
| 1: Scaffold & playback | shipped | Vite PWA, video player, waveform, OPFS persistence. |
| 2: Transcription engine | partial | UI pipeline and audio extraction shipped; real whisper.cpp/WASM integration pending. |
| 3: Transcript UI & sync | shipped | Editable synced transcript, click-to-seek, forced realignment. |
| 4: Cut engine | shipped | Filler/silence detection, delete-only editing, undo/redo. |
| 5: Export | shipped | WebCodecs VP9/Opus WebM export with A/V sync correction. |
| 6: Polish & launch | shipped | README, CI/CD, GitHub Pages, keyboard shortcuts, model manager. |
| Post-v0.1: real whisper.cpp WASM | planned | Bundle ggml-tiny.en / ggml-small.en and replace synthetic engine. |
| Post-v0.1: frame-accurate cuts | planned | GOP-aware decode-trim-re-encode for precise boundaries. |
| Post-v0.1: Firefox/Safari export | planned | Track WebCodecs encode availability or provide FFmpeg.wasm fallback. |
| Post-v0.1: localization | planned | Non-English whisper models. |

## Citation

```bibtex
@software{talkcut2026,
  title = {TalkCut: Browser-based transcript-driven video editing},
  author = {TalkCut contributors},
  year = {2026},
  url = {https://github.com/xzabir/talkcut},
  note = {MIT License}
}
```

## License and Acknowledgments

TalkCut is released under the [MIT License](./LICENSE).

The project uses the WebCodecs API, the Web Audio API, and the Origin Private File System, all standardized by the W3C. Speech recognition is built against the whisper.cpp model format and will be bundled under whisper.cpp's MIT license once the WASM integration lands in the next release.

## Contributing and Security

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development conventions and [SECURITY.md](./SECURITY.md) for vulnerability reporting.
