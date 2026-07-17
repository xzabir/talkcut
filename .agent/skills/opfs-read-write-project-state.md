---
name: opfs-read-write-project-state
description: Guide to persisting TalkCut project state to Origin Private File System.
---
# OPFS Read/Write Project State

1. **API Access:** Use `navigator.storage.getDirectory()` to access the OPFS root.
2. **File Handling:** Create files for video source, transcript JSON, and cut list JSON.
3. **Streams:** Use `createWritable()` for saving data and `getFile()` followed by standard File/Blob reading for loading.
4. **Exit criteria:** Application state (transcript, cut list, video) survives a full page reload without internet.
