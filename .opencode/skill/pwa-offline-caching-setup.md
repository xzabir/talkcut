---
name: pwa-offline-caching-setup
description: Guide to configuring PWA service worker and manifest for TalkCut.
---
# PWA Offline Caching Setup

1. **Manifest:** Create `manifest.json` with correct icons, name ("TalkCut"), and display mode ("standalone").
2. **Service Worker Registration:** Register the service worker on app load.
3. **Caching Strategy:**
   - Cache app shell (HTML, CSS, JS) using Network First or Stale-While-Revalidate.
   - Cache WASM models (ggml-tiny.en.bin) heavily (Cache First) since they are large and static.
4. **Exit criteria:** App can be installed to desktop and loads fully when offline.
