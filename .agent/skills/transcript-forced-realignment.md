---
name: transcript-forced-realignment
description: Guide to realigning timestamps when a user edits text in the transcript.
---
# Transcript Forced Realignment

When a user corrects a word in the transcript (e.g., changes "there" to "their"), the underlying timestamp must remain attached to the edited word.

1. **Text Correction:** If the user changes spelling but the word count remains the same, keep the original start/end timestamps for that word token.
2. **Word Split/Merge (Placeholder):** For the MVP, merging or splitting words (e.g., changing "gonna" to "going to") is either disabled or approximated by interpolating the original timestamp span across the new word tokens linearly.
3. **Exit criteria:** Editing a word does not break playback sync or cause the word to lose its click-to-seek functionality.
