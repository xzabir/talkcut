---
name: whisper-word-timestamp-parsing
description: Guide to parsing output from whisper.cpp into TalkCut's expected timestamp format.
---
# Whisper Word Timestamp Parsing

1. **Format Requirements:** TalkCut expects an array of objects: `[{word: "hello", start: 0.5, end: 1.0}, ...]`.
2. **Whisper Output:** Ensure the WASM module is configured to emit word-level timestamps (not just segment-level).
3. **Data Transformation:** Map the raw Whisper token output to the TalkCut object format, stripping leading/trailing spaces from words where appropriate but maintaining punctuation.
4. **Exit criteria:** A clean, valid JSON array of word-level timestamp objects ready for UI rendering.
