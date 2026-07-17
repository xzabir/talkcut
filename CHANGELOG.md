# Changelog

All notable changes to TalkCut will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-07-17

### Added

- Vite + TypeScript PWA shell with offline service worker.
- HTML5 video player with drag-and-drop file input (MP4, MOV, MKV).
- Audio waveform visualization with playback head and cut-region shading.
- OPFS-based project persistence for video, transcript, and cut list.
- Simulated Web Worker transcription pipeline with real audio extraction
  (Web Audio API resampling to 16 kHz) and word-level timestamp output.
- Synced transcript UI: editable words, playback highlighting, click-to-seek,
  keyboard navigation, and forced timestamp realignment.
- Cut engine: delete-only editing, filler-word detection, silence trimming,
  undo/redo stack, and cut-region visualization on the waveform.
- WebCodecs export pipeline: decode, keyframe-snapped cut routing, VP9/Opus
  re-encode, inline WebM muxer, and A/V sync offset correction.
- Chrome-only export detection with graceful fallback messaging.
- Model manager UI, keyboard shortcut help overlay, and GitHub Pages CI/CD.
- README, CONTRIBUTING guide, landing page, and standard OSS files.

### Known Limitations

- Transcription uses a simulated engine; real whisper.cpp/WASM integration is
  planned for the next release.
- Export is supported only on Chromium-based browsers (WebCodecs encode).
- Cuts are accurate to keyframe boundaries (~2-5 s), not frame-accurate.
- Editing is delete-only; no insert, replace, or multi-track support.
- English transcription only at this release.
- WebM/VP9/Opus output only; no MP4 export.

## [Unreleased]

- whisper.cpp WASM integration with tiny/small/medium model support.
- Frame-accurate GOP-aware cutting.
- Firefox and Safari export fallbacks.
- Localization for non-English transcription.
