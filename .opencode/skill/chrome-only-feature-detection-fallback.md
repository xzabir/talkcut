---
name: chrome-only-feature-detection-fallback
description: Guide to handling WebCodecs API availability (Chrome-only export for MVP).
---
# Chrome-only Feature Detection Fallback

1. **Feature Check:** Check for `window.VideoEncoder` and `window.VideoDecoder`.
2. **UI Fallback:** If unavailable (e.g., Firefox, Safari), disable the Export button.
3. **Messaging:** Display a clear message to the user explaining that export currently requires Chrome/Edge due to WebCodecs support.
4. **Exit criteria:** Non-Chrome users can use the app to transcribe and edit, but receive a graceful message when trying to export.
