---
name: av-sync-verification
description: Guide to verifying audio/video sync during WebCodecs processing.
---
# A/V Sync Verification

1. **Timestamp alignment:** When skipping frames or audio data due to cuts, ensure the `timestamp` property of the subsequent `VideoFrame` and `AudioData` objects are offset by the exact duration of the skipped region.
2. **Buffer management:** Keep track of the accumulated "deleted time" and subtract it from the original timestamps of all frames/audio after a cut.
3. **Exit criteria:** An exported video plays with perfectly synchronized audio and video, even after multiple cuts.
