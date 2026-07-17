# TalkCut — Final Decision Package

**Product name:** TalkCut  
**Tagline:** Edit video by editing the transcript. Nothing leaves your browser.  
**Decision:** Build. Phase 1 starts immediately with 1 senior engineer.

---

## 1. Product Requirements Document

### The Incumbent

**Descript** — $16–50/mo, AI credit metering on top of subscription, $550M valuation, used by NYT/Spotify/Marvel/NPR. The only credible transcript-based video editor on the market. Competitors (Riverside, Captions, Opus Clip) each win one layer of the stack; Descript owns the core paradigm. Scores 9.1/10 on ThePlanetTools (May 2026 review).

### The Complaint (with evidence)

1. **Stability.** Reddit, Jul 7 2026: "Descript keeps crashing on me and it is making me crazy! I can't export anything as it says my computer has no space which is not true... it's making me SO FRUSTRATED!" — Descript support confirmed a server-side bug: [r/podcasting thread](https://old.reddit.com/r/podcasting/comments/1uq5u3w/descript_alternatives/)
2. **Credit economics.** ThePlanetTools (May 2026): "credit economics on Hobbyist and the Business per-seat pricing are the only meaningful frictions." Hobbyist gives 400 credits/month. Studio Sound on a 60-min episode costs ~600 credits — you can't run it once without overage. Creator (800 credits) covers ~5 weekly Studio Sound sessions. Auto top-up is $20 for 600 extra credits. The meter is always running.
3. **Free tier is a demo, not a tool.** 60 min transcription, 720p watermark-locked export, 100 one-time AI credits. You can't ship anything real on it.
4. **Desktop-only.** Native app required. No full browser workflow. The web beta exists but is secondary.
5. **Multiple users report "love-hate relationship."** They need the transcript-based editing paradigm and resent the cost, credit anxiety, and reliability.

### The Proof Point

**No watermark, no subscription, no install, no API keys. Open a URL, upload a video, edit the transcript, download the cut. Video never leaves the user's machine. All processing is local — transcription, decoding, cutting, re-encoding. Works offline after first load as a PWA.**

### Why This Is Greenfield in Open Source

Existing open-source projects in this space:

| Project | Stars | Status | Why it's not a substitute |
|---|---|---|---|
| BBC react-transcript-editor | 620 | Last release Jun 2021, effectively abandoned | React component library, not a full app. No video editing, no export. "Work in progress" that never completed. |
| autoEdit_2 (BBC/Pietro) | 454 | Abandoned since Mar 2024 | Electron app, not browser-based. Requires a server for transcription. Last commit ~2 years ago. |
| texideo | 5 | Tiny project | Python server required, not a browser SPA. |
| montage-ai | 37 | Tiny project | Python/Docker, not browser-based. |
| ellmos-ai | 4 | Tiny project | Claude Code agent wrapper, not a standalone tool. |
| OpenCut | ~73.6k | Active but different paradigm | CapCut-style timeline editing, not transcript-based editing. |

**None of these are browser-based transcript-first video editors.** This category is genuinely empty in open source.

### Target User

Podcasters, video journalists, course creators, and anyone producing talking-head video who wants to remove filler words, tighten pauses, and clean up takes without learning a timeline editor. The user who currently pays Descript $24/mo (Creator plan) and resents every credit tick.

Secondary: journalists and legal professionals who cannot send source video to a third-party server for compliance reasons. Privacy-first positioning is a defensible wedge.

### MVP Scope (what ships)

1. **Upload & transcribe.** Drag-drop MP4/MOV/MKV. Whisper.cpp compiled to WASM, runs in a Web Worker. Ship a tiny English model (~40MB). Offer small (~240MB) and medium (~1.5GB) as optional downloads. Transcription produces word-level timestamps.
2. **Transcript display with playback sync.** Transcript rendered as editable text. As video plays, the current word highlights. Click a word → video seeks to that timestamp. BBC proved this UX 5 years ago in react-transcript-editor.
3. **Delete text → cut video.** Select a sentence or word range, press delete. That segment is marked for removal in the cut list. Multiple disjoint deletions accumulate.
4. **Bulk filler word removal.** One-click scan for "um," "uh," "you know," "like," "I mean," and long pauses. Preview each removal, apply all.
5. **Trim silence.** Adjustable threshold (e.g., remove all silence longer than 0.5s). Works from word-level timestamps — gaps between words > threshold get trimmed.
6. **Export trimmed video.** Decode source, skip cut segments, re-encode to VP9 + Opus in WebM via WebCodecs. Chrome-only at MVP (Firefox/Safari lack WebCodecs encode support).
7. **Undo/redo.** Full undo stack for all transcript edits and cut operations.
8. **OPFS project storage.** Save project state (transcript, cut list, source file reference) to the Origin Private File System. Restore on next visit. No server, no login.

### Non-Goals for MVP

- AI voice cloning (Overdub-style)
- AI audio enhancement (Studio Sound-style)
- Screen recording
- Multi-track editing
- Collaborative/cloud features
- Mobile support
- Insert/replace audio/video segments (editing is **delete-only** — you can only remove, not add or replace)
- Firefox/Safari support
- MP4 export (WebM only)
- Non-English transcription (English-only for MVP; Whisper models for other languages are a phase 2 item)

---

## 2. Build Plan

### Phase 1: Scaffold & Playback (Weeks 1–3)
**Delivers:** A PWA shell that loads a video, plays it, and shows a waveform. No transcription yet.

- Vite + React + TypeScript project setup
- PWA manifest, service worker for offline caching
- Drag-drop file input, video playback with HTML5 `<video>`
- OPFS integration for persisting uploaded video
- Basic waveform visualization (peaks.js or custom canvas)
- CI/CD (GitHub Actions, deploy to GitHub Pages)

**Exit criteria:** URL loads, video plays, video persists across page refreshes, waveform renders.

### Phase 2: Transcription Engine (Weeks 4–7)
**Delivers:** WASM Whisper running in a Web Worker, producing word-level timestamps from uploaded video.

- Compile whisper.cpp to WASM with Emscripten
- Ship tiny English model (~40MB ggml-tiny.en.bin) bundled in the app
- Web Worker wrapper: receives audio buffer, returns `[{word, start, end}]`
- Audio extraction from video via Web Audio API (decode audio track from video file)
- Loading UX: model download progress bar, transcription progress bar with time estimate
- Fallback: if WASM Whisper fails or is too slow, show a "try with a smaller file" error state
- Small model (~240MB ggml-small.en.bin) as optional download for better accuracy

**Exit criteria:** Upload a 2-minute talking-head video, click Transcribe, get word-level timestamps in under 2 minutes on a mid-range laptop. Model downloads are cached to OPFS.

### Phase 3: Transcript UI & Sync (Weeks 8–11)
**Delivers:** Editable transcript synced to video playback. The core Descript-replacement UX.

- Transcript component: word-level rendering with playback highlight
- Click-to-seek: clicking any word seeks the video to that timestamp
- Editable text: corrections to the transcript update timestamps (approximate re-alignment)
- Speaker diarization placeholder (single speaker for MVP; "Speaker 1," "Speaker 2" labels in phase 4)
- Keyboard shortcuts: space to play/pause, arrow keys to navigate words, escape to stop

**Exit criteria:** Transcribe a video, see the transcript, watch words highlight as video plays, click words to seek. Editing a word in the transcript updates the display.

### Phase 4: Cut Engine (Weeks 12–16)
**Delivers:** Delete text → cut video. Bulk filler word removal. Trim silence.

- Cut list data structure: `[{start, end, type: "delete"|"silence"|"filler"}]`
- "Delete selection" operation: marks a transcript range for removal, updates cut list
- Filler word scanner: regex/pattern match against transcript, return candidate removals
- Silence detector: analyze word timestamps for gaps > threshold, return candidate trims
- Preview mode: video plays with cut markers visible (e.g., shaded regions on waveform)
- Cut list persistence in OPFS alongside project
- Undo/redo for all operations

**Exit criteria:** Upload a video with filler words and long pauses. Delete a sentence → cut list updates. Bulk-remove filler words → preview each. Trim silence above 1s threshold. Cut list is saved and restored.

### Phase 5: Export (Weeks 17–21)
**Delivers:** Re-encode video without cut segments, download as WebM.

- WebCodecs decode pipeline: read source video frame by frame
- Apply cut list: skip frames in deleted ranges
- WebCodecs encode pipeline: re-encode to VP9 + Opus in WebM container
- Progress UI during export (frame count, estimated time)
- Audio/video sync verification through cuts (this is the hard part)
- Download trigger (File System Access API or fallback `<a>` download)
- GOP boundary handling: cuts at non-keyframe boundaries require decoding the surrounding GOP, trimming frames, and re-encoding

**Exit criteria:** Upload a 2-minute video, delete 3 segments, export. Playback confirms cuts are accurate and A/V stays in sync. Export completes in roughly real-time or faster on modern hardware.

### Phase 6: Polish & Launch (Weeks 22–24)
**Delivers:** Usable product with documentation, landing page, and community presence.

- Loading states, error states, empty states for every screen
- Keyboard shortcut cheat sheet (overlay, `?` key)
- Undo/redo stack visualization
- Model manager: download/delete Whisper models, see which is active
- README with GIF demo, setup instructions, contributor guide
- Landing page (GitHub Pages): one-click demo, "edit a sample video" CTA
- Hacker News launch post draft
- r/podcasting, r/VideoEditing, r/selfhosted cross-post plan
- Issue templates, contribution guidelines, code of conduct

---

## 3. README Opening

> **TalkCut is the open-source Descript alternative.** [Descript](https://descript.com) lets you edit video by editing the transcript — but costs $24/mo, burns AI credits on basic operations, and runs as a desktop app that [crashes mid-export](https://old.reddit.com/r/podcasting/comments/1uq5u3w/descript_alternatives/). TalkCut does the same thing, in the browser, for free.
>
> No watermark. No subscription. No login. No API keys. Your video never leaves your machine — transcription, editing, and export all run locally. Upload a video, edit the transcript, download the cut.
>
> **TalkCut — edit video by editing the transcript. Nothing leaves your browser.**

---

## 4. Honest Risk Assessment

### Risk 1 (HIGH): Descript ships a genuinely generous free tier
Descript's current free tier is a demo — 60 min transcription, 720p watermarked export, 100 one-time AI credits. If they raise this to 2–3 watermark-free hours/month plus basic export, the "it's too expensive" complaint collapses for the majority of hobbyist users. TalkCut still wins on privacy (local processing), unlimited usage (no transcription quotas or credit meters), hackability (MIT license), and offline capability. But the addressable market shrinks significantly — from "everyone frustrated by Descript pricing" to "privacy-conscious creators, journalists, and tinkerers."

**Mitigation:** Position TalkCut from day one as a privacy-first, offline-capable tool. The journalists-and-lawyers wedge is real and Descript cannot compete on it — their architecture requires server-side transcription. Lead with "your video never leaves your machine" in every piece of copy. If Descript improves their free tier, we still have a defensible niche.

### Risk 2 (HIGH): WASM Whisper transcription speed kills the experience
Descript's server-side GPU inference transcribes a 60-minute episode in under 5 minutes. WASM Whisper (tiny model) takes 5–20 minutes for a 10-minute video on mid-range hardware. A user who opens TalkCut, uploads a 30-minute podcast, and sees "Transcribing... 45 minutes remaining" will close the tab and pay for Descript.

**Mitigation:** (a) Ship the tiny model as default, ~40MB, optimized for speed. Accuracy is worse but good enough for editing — the user is cutting filler words and pauses, not publishing the transcript. (b) Surface the model size/accuracy tradeoff clearly: "Tiny model: faster, less accurate. Small model: slower, more accurate. Download it once." (c) Consider WebGPU acceleration for Whisper in Phase 2 if the WASM speed is truly unacceptable. (d) Be upfront in the README: "Transcription runs locally on your machine, not in a datacenter. A 10-minute video takes ~5-20 minutes depending on your hardware." Set expectations.

### Risk 3 (MEDIUM): OpenCut or another project pivots to transcript-based editing
OpenCut (73.6k stars) has the community and contributor momentum. If they add transcript-based editing as a mode, they ship with existing brand recognition, contributors, and users. However, transcript-based editing requires fundamentally different architecture from timeline editing — different data model, different UI, different rendering pipeline. It's not a feature flag. It's more likely they stay focused on CapCut-style timeline editing.

**Mitigation:** TalkCut's timeline advantage is 4–6 months with 2–3 engineers. The window is narrow. Ship fast, build community fast, and make the transcript-first paradigm the identity — don't try to also be a timeline editor.

### Risk 4 (MEDIUM): Chrome-only at launch excludes the target audience
Firefox and Safari together are ~35% of desktop browser share, and Safari is disproportionately used by Mac creative pros — precisely the podcasters and video creators TalkCut targets. A "Chrome only" launch means telling a significant chunk of the target audience to switch browsers.

**Mitigation:** (a) Ship a prominent "Works on Chrome and Edge" notice with a technical explanation (WebCodecs encode support). (b) Track Firefox [Bug 1781980](https://bugzilla.mozilla.org/show_bug.cgi?id=1781980) (WebCodecs encode) and ship Firefox support the day it lands. (c) Investigate FFmpeg.wasm as a Safari/Firefox fallback for export in Phase 2, accepting slower encode times. (d) For transcription and editing — the core UX before export — Firefox and Safari work fine. The Chrome-only constraint applies only to the export step. Users can edit on any browser and export on Chrome.

### Risk 5 (LOW): Frame-accurate GOP cutting is harder than estimated
WebCodecs requires cutting at keyframe boundaries. Cutting mid-GOP requires decoding the entire GOP, trimming the unwanted frames, and re-encoding — which is CPU-intensive and introduces quality loss. A/V sync drift through multiple cuts is a real bug surface.

**Mitigation:** (a) Scope MVP to keyframe-boundary cuts only. This means cuts are accurate to ~2-5 seconds (typical GOP size), not frame-accurate. This is fine for podcast/talking-head editing — users are cutting sentences and pauses, not individual frames. (b) Document the limitation clearly. (c) GOP-aware smart cutting (decode-surrounding-GOP-and-re-encode) is Phase 2.

### Risk 6 (LOW): We missed a competitor in our landscaping
An open-source Descript alternative might exist under a name or in a community we didn't search. The landscape scan covered GitHub (English search terms), Reddit, and Hacker News. A Chinese-language project on Gitee, a private beta with a waitlist, or a research project hosted on a university GitLab could exist.

**Mitigation:** The first week of Phase 1 includes a deeper landscape scan with broader search terms ("browser video editor transcript," "local transcription video editor," "WASM whisper video editor"). If a credible competitor surfaces, reassess before writing code.

---

## Appendix A: Competitive moat summary

| Dimension | Descript | TalkCut |
|---|---|---|
| Price | $24–50/mo + credit overage | Free |
| Watermark | Free tier: yes, 720p | Never |
| Transcription quota | 10–40 hrs/mo | Unlimited (hardware-bound) |
| AI credit meter | Yes, runs out mid-workflow | None |
| Offline | Desktop app only | Full PWA, works offline |
| Privacy | Server-side transcription | All local, nothing leaves browser |
| Browser-based | Web beta, secondary | Primary, only mode |
| Open source | No | MIT |
| Hackable/extensible | No | Yes |
| AI voice cloning | Overdub (Lyrebird) | No (non-goal) |
| AI audio enhancement | Studio Sound | No (non-goal) |
| Multi-track | Yes | No (non-goal) |
| Export formats | MP4, GIF, social | WebM (Chrome) |

---

## Appendix B: Target launch metrics (aspirational, not committed)

- GitHub stars at 30 days: 2,000+
- Hacker News front page: Yes/No (binary — we submit and see)
- r/podcasting post: 200+ upvotes
- First external contributor PR within 60 days
- "I switched from Descript" testimonial within 90 days
- No crash reports related to export (unlike Descript)

---

**Decision:** Build TalkCut. Start Phase 1 with 1 senior engineer. Re-evaluate at Week 7 (after transcription engine is working on real hardware) — if WASM Whisper is unacceptably slow on mid-range laptops, pivot to a WebGPU-accelerated path or reconsider the WASM approach. Do not add scope. Export-only delete operations. Chrome-only at launch. Ship it.
