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

### Added

- Delete-text-to-cut workflow: select words by click/drag/shift-click, press
  Delete to mark them as cut regions. This is the core transcript-driven
  editing paradigm that was missing in v0.1.
- Word selection with visual highlight and selected count display.
- Edit mode toggle: single-click selects, double-click enters edit mode for
  correcting transcription errors. Visual mode indicator (Select/Edit).
- Transcript search (find words in the transcript).
- Cut visualization in transcript: words inside cut regions show strikethrough
  and reduced opacity.
- MP4/H264 export via FFmpeg.wasm fallback for Firefox/Safari and as a user-
  selectable format alongside WebM.
- Export format selector UI (WebM vs MP4).
- Toast notification system for success/error/info feedback.
- Centralized state store for app-wide state management.
- Resizable sidebar with drag handle (300-600px range).
- Footer status bar with real-time time, word count, and cut count.
- Transcription ETA display and cancel button.
- Ctrl+S keyboard shortcut for save, Ctrl+E for export tab.
- Select-all / deselect-all buttons for filler and silence scan results.
- Cuts panel summary showing total cuts and time removed.
- Project name display in header.
- Responsive layout for narrow screens.
- Stall detection in export pipeline with 20s timeout.
- Audio resampling to 48kHz before Opus encoding to prevent encoder hangs.

### Fixed

- Export muxer timestamp error: first chunk timestamp was non-zero, causing
  WebM muxer to reject all subsequent chunks and stall the export indefinitely.
  Now the first frame's timestamp is tracked and subtracted from all subsequent
  video and audio timestamps.
- Export panel not detecting cuts: switching to the Export tab now refreshes
  the cut summary. The panel also refreshes when cut regions change.
- Audio encoder flush hanging: the Opus encoder was configured for 48kHz but
  received audio at the original sample rate. Now audio is resampled to 48kHz
  before encoding.
- Video frame capture stalling in headless/low-power environments: added
  ended/paused event listeners and a per-segment stall timer.
- Stylesheet accumulation: component-injected `<style>` elements consolidated
  into the main stylesheet.

### Changed

- Complete UI redesign with modern minimal aesthetic (Linear/Figma-inspired).
  New color system (indigo accent, dark surface tones), Inter font, consistent
  spacing and radius tokens.
- Transcript panel: words default to non-editable (contenteditable=false).
  Double-click enters edit mode for a single word. This prevents accidental
  edits and makes the selection-to-cut workflow the primary interaction.
- Keyboard shortcuts updated: Delete/Backspace cuts selected words, Ctrl+A
  selects all, Arrow keys navigate with optional Shift to extend selection.
- Cuts panel: accuracy notice only shows when cuts exist. Scan results default
  to all-selected with explicit add button.
- Export panel: format-specific button labels. Summary updates on tab switch.
- Waveform: mirrored waveform rendering and playhead dot indicator.

### Removed

- Per-component `<style>` element injection (styles consolidated into
  `src/style.css`).
- Fragile transcript sync-on-deletion behavior that created false cuts when
  words were edited.
