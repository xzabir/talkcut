---
name: webcodecs-frame-accurate-cut
description: Guide to implementing video cuts using WebCodecs. MVP uses keyframe-boundary snapping (2-5s granularity). GOP-aware decode-trim-re-encode is deferred to Phase 2.
---

# WebCodecs Frame-Accurate Cut

## Risk 5 Resolution: Option (a) — Keyframe-Boundary-Only for MVP

This decision was recorded before Phase 4 dispatch. The MVP **does not** implement GOP-aware decode-trim-re-encode. Instead:

- **MVP (v1):** Cuts snap to the nearest keyframe boundary in the source stream. Granularity is 2-5 seconds (typical GOP size). The exporter decodes source video frame-by-frame, drops entire GOPs that fall completely within cut regions, keeps GOPs that fall outside, and re-encodes kept frames to VP9/Opus in WebM.
- **Phase 2 (post-MVP):** GOP-aware smart cutting — decode the surrounding GOP, trim unwanted frames at the exact boundary, re-encode only the affected GOP. This will enable frame-accurate cuts.

## Feature Descoping for MVP (v1)

The following PRD features are **descoped** to match 2-5s keyframe granularity:

| PRD Feature | v1 Behavior | v2 (Phase 2) Behavior |
|---|---|---|
| "Delete a filler word" (um, uh, like) | Descoped. Replaced by "delete a clause/pause" — user deletes sentence-level or pause-level regions only. Bulk filler-word scan is still present but the resulting cuts snap to keyframe boundaries, so individual filler-word removal within a dense sentence will not produce precise cuts. | Frame-accurate filler word removal after GOP-aware re-encoding is implemented. |
| "Trim silence" | Works, but silence regions shorter than ~2s may not produce a distinct cut if the surrounding GOPs span the silence. Threshold should default to 2s in the UI, with a note that shorter gaps may not trim precisely. | Frame-accurate silence trimming. |
| "Delete text → cut video" | Works for sentence-level and clause-level deletions (cuts snap to nearest keyframe). Fine word-level deletions within a sentence will produce cuts at the nearest keyframe, which may be visibly imprecise. | Frame-accurate word-level deletions. |

## MVP Implementation: Keyframe-Boundary Snapping

1. **Source Decoding:** Initialize a `VideoDecoder` with the source codec configuration extracted from the input file. Feed encoded chunks from the source stream into the decoder. Receive `VideoFrame` objects.

2. **Keyframe Detection:** Track which decoded frames are keyframes (I-frames). `EncodedVideoChunk.type === "key"` indicates a keyframe chunk. Map each keyframe to its timestamp in the source timeline.

3. **Cut List → Keyframe Snapping:**
   - For each cut region `{start, end}` in the cut list:
     - Snap `start` to the nearest keyframe **at or before** the cut start (conservative: don't cut before the user's intended start).
     - Snap `end` to the nearest keyframe **at or after** the cut end (conservative: don't leave unwanted content).
   - Merge overlapping or adjacent snapped regions.
   - The resulting snapped cut list is what the encoder uses.

4. **Frame Routing:**
   - Iterate through decoded frames in presentation order.
   - For each frame, check its timestamp against the snapped cut regions.
   - If the frame's timestamp falls within any snapped cut region: **drop** the frame (do not pass to encoder).
   - If outside all cut regions: **pass** to the `VideoEncoder`.

5. **Encoding:** Configure a `VideoEncoder` for VP9 (WebM-compatible). Feed kept `VideoFrame` objects in order. Collect encoded chunks and mux with Opus audio into a WebM container.

6. **Audio Handling:** Decode the source audio track via `AudioDecoder` (Opus or AAC depending on source). Apply the **same** snapped cut regions to audio frames to maintain A/V sync. Re-encode audio to Opus.

## Phase 4 / Phase 5 Dependency

- **Phase 4 (Cut Engine)** exposes the cut list data structure and UI for marking regions for deletion. The UI **must** inform the user that cuts are accurate to ~2-5 seconds (keyframe granularity), not frame-accurate. This limitation notice must be visible in the cut preview and export UI.
- **Phase 5 (Export)** implements this keyframe-snapping pipeline. Phase 4 cannot be marked complete until Phase 5's exporter is proven to handle the cut list accurately with keyframe snapping.
- The phase-gatekeeper enforces: Phase 4 exit criteria includes UI disclosure of 2-5s accuracy. Phase 5 exit criteria includes verification that exported cuts match the snapped (not original) cut list.

## Exit Criteria

1. Video exported with requested regions skipped (snapped to nearest keyframes).
2. A/V sync is maintained through all cut boundaries in the exported file.
3. Export completes in roughly real-time or faster on modern hardware.
4. The exported WebM plays correctly in an independent player (not just TalkCut's own viewer).
5. The Phase 4 UI accurately communicates the 2-5s granularity limitation to the user.

## Non-Goals (MVP)

- Mid-GOP decode/trim/re-encode (deferred to Phase 2).
- Frame-accurate cuts (deferred to Phase 2).
- MP4 export (WebM/VP9/Opus only).
- Firefox/Safari export support (WebCodecs encode is Chrome-only).

## Non-Goals (Permanent)

- Server-side processing. All encoding runs locally in the browser.
- Insert/replace operations (editing is delete-only per PRD).
