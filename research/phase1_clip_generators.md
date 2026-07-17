# Phase 1 Research: AI Viral Clip Generators & AI Captioning Tools

**Date:** July 16, 2026
**Researcher:** opencode (automated web research)
**Method:** Real webfetch evidence only. No fabricated URLs or claims.

---

## Incumbent 1: Submagic (submagic.co)

### 1. Name + URL
Submagic — https://www.submagic.co

### 2. Specific Paywalled/Frustrating Limitation
- **No free tier at all** — only a 3-video trial, then you must pay. No permanent free plan.
- **Watermark-free requires paid plan** — Starter plan at $19/month (billed monthly) is the cheapest way to remove watermarks.
- **Magic Clips (AI viral clip extraction from long videos) is a separate +$19/month add-on** on top of any plan — meaning the core "Opus Clip" feature costs minimum $38/month combined.
- **Strict video limits**: Starter allows only 15 videos/month, max 2 min duration each. Pro allows 40 videos/month, max 5 min.
- **AI Credits are scarce**: 3 credits on Starter, 6 on Pro, 15 on Business.

### 3. Evidence (fetched links)

1. **https://www.submagic.co/pricing** (fetched successfully)
   - Quote: "Try out with 3 free videos. No credit card required." — confirms no permanent free tier, only a trial.
   - Quote: "STARTER — $19/member/month — 15 videos (max. 2min) — No Watermark"
   - Quote: "Magic Clips +$19 per member/mo — Get viral clips from 10 long videos/month with AI." — the viral clip extraction feature is a paid add-on, not included in any base plan.

2. **https://old.reddit.com/r/AIAssisted/comments/1u87pfq/submagic_alternatives/** (fetched successfully, 29 days old, 10 comments)
   - Quote: "once I was shipping videos every week the subscription really began to sting"
   - Quote: "the output started feeling inconsistent and lacking quality over the last few months"

3. **https://old.reddit.com/r/passive_income/comments/1t2y7uu/i_quit_paying_30mo_for_ai_clip_tools_built_a_free/** (fetched successfully, 2 months old, 116 comments, 125 points)
   - Quote: "Tools like Opus Clip, Submagic, etc. all run $30-50/mo and most of them either watermark, cap your clips, or hide the 'no watermark' tier behind a $99 plan."

4. **https://old.reddit.com/r/VideoEditingTips/comments/1u7bt3z/submagic_alternatives_i_actually_ended_up_using/** (fetched successfully, 1 month old, 4 comments)
   - Quote: "the price stung once I was making videos regularly"

5. **https://old.reddit.com/r/BenchmarkAndBacklog/comments/1umerw9/my_list_of_tools_that_add_subtitles_automatically/** (fetched successfully, 12 days old)
   - Quote: "it's obviously paid and the trial has a watermark, so this is not your free option. And you gotta sign up, which is also smth I usually hate."

### 4. Existing Open-Source Substitutes

| # | Repo | Stars | Last Active | Does Paywalled Feature Free? |
|---|------|-------|-------------|------------------------------|
| 1 | [SamurAIGPT/AI-Youtube-Shorts-Generator](https://github.com/SamurAIGPT/AI-Youtube-Shorts-Generator) | 4.2k | ~24 days ago | YES — no watermarks, no clip caps, self-hostable. Explicitly markets as "open-source alternative to Opus Clip, Vidyo.ai, Klap & SubMagic." Local mode uses faster-whisper + ffmpeg + OpenAI/Gemini LLM. |
| 2 | [nicolaigaina/ai-video-captions](https://github.com/nicolaigaina/ai-video-captions) | 23 | ~Mar 27, 2026 | PARTIAL — does animated caption styles (Hormozi, MrBeast, Karaoke) like Submagic, no watermark, self-hosted Docker. Does NOT do clip extraction from long videos. |
| 3 | [awjames6875/clipforge](https://github.com/awjames6875/clipforge) | 0 | ~Feb 16, 2026 | CLAIMS to be "Open source Submagic alternative — auto-caption short-form videos with AI." Too new to assess (0 stars). |
| 4 | [PriyeshPandey2000/ai-video-clipper](https://github.com/PriyeshPandey2000/ai-video-clipper) | 2 | ~2 hours ago | CLAIMS "Open-source alternative to OpusClip, Descript & Submagic — runs fully local." Very new (2 stars) but actively developed. |

**Actively-maintained substitutes for Submagic specifically: 2** (SamurAIGPT and nicolaigaina). Others are too new to assess.

### 5. Candidate Proof Point
"Generates animated TikTok-style captions (Hormozi, MrBeast, Karaoke styles) on your videos, free, no watermark, runs in your browser with local Whisper transcription — no account, no credits, no upload."

---

## Incumbent 2: Opus Clip (opus.pro)

### 1. Name + URL
OpusClip — https://www.opus.pro

### 2. Specific Paywalled/Frustrating Limitation
- **Free tier has watermark on animated captions** — the feature people actually want (viral-style animated captions) is watermarked on free.
- **Exports expire after 3 days** on free tier — clips are not permanently downloadable.
- **Watermark-free export requires Starter at $15/month** — the free tier explicitly lacks "Watermark-free video export."
- **Free tier has regular processing speed only** — paid tiers get faster processing.

### 3. Evidence (fetched links)

1. **https://www.opus.pro/pricing** (fetched successfully)
   - Quote: Free tier — "Animated caption templates: With watermark"
   - Quote: Free tier — "Watermark-free video export: —" (dash = not included)
   - Quote: Free tier — "Export as MP4: 3-day limit; Up to 1080p rendered clips"
   - Quote: Free tier — "Media storage: Expires after 3 days"
   - Starter tier at $15/mo unlocks: "Watermark-free video export" and "Animated caption templates" (without watermark).

2. **https://old.reddit.com/r/VideoEditingTips/comments/1uhrj5i/opus_clip_is_getting_way_too_expensive_for_solo/** (fetched successfully, 18 days old, 5 comments)
   - Quote: "Opus Clip is getting way too expensive for solo creators. Are there any actual good alternatives that don't cost a fortune?"
   - Quote: "As a solo creator I don't have a team budget, so every subscription matters."

3. **https://old.reddit.com/r/SideProject/comments/1p6qiwa/i_built_an_opusclip_alternative_because_their/** (fetched successfully, 7 months old)
   - Quote: "I was tired of paying monthly subscriptions just to add captions to my videos. So I spent the last 3 months building my own AI editor."

4. **https://old.reddit.com/r/passive_income/comments/1t2y7uu/i_quit_paying_30mo_for_ai_clip_tools_built_a_free/** (fetched successfully, 2 months old, 125 points)
   - Quote: "Tools like Opus Clip, Submagic, etc. all run $30-50/mo and most of them either watermark, cap your clips, or hide the 'no watermark' tier behind a $99 plan."

### 4. Existing Open-Source Substitutes

| # | Repo | Stars | Last Active | Does Paywalled Feature Free? |
|---|------|-------|-------------|------------------------------|
| 1 | [SamurAIGPT/AI-Youtube-Shorts-Generator](https://github.com/SamurAIGPT/AI-Youtube-Shorts-Generator) | 4.2k | ~24 days ago | YES — viral clip extraction, no watermarks, no per-clip credits. Explicitly calls itself "open-source alternative to Opus Clip." Local mode with faster-whisper + ffmpeg + LLM. |
| 2 | [JayWebtech/autoshorts](https://github.com/JayWebtech/autoshorts) | 483 | ~14 days ago | YES — local-first desktop app (Tauri/Rust). Turns long video into 9:16 clips with AI viral ranking. Fully offline mode (Ollama + Whisper). Latest release v0.1.5 on Jul 1, 2026. |
| 3 | [Anil-matcha/ai-clipping-comfyui](https://github.com/Anil-matcha/ai-clipping-comfyui) | 36 | ~Jun 2, 2026 | YES — "Free open-source Opus Clip alternative for ComfyUI." AI video clipping nodes for ComfyUI. |
| 4 | [fralapo/clippyme](https://github.com/fralapo/clippyme) | 2 | ~3 days ago | YES — "Open-source, self-hosted Opus Clip alternative." Very new but actively developed. |
| 5 | [NaufalRizqullah/opensource-clipping](https://github.com/NaufalRizqullah/opensource-clipping) | 40 | ~15 hours ago | YES — AI auto-clipper with face-tracking, karaoke subtitles. Uses Gemini API. |
| 6 | [Upload-Post/skill-autoshorts](https://github.com/Upload-Post/skill-autoshorts) | 119 | ~May 2, 2026 | YES — Whisper + Gemini pipeline. |
| 7 | [divyaprakash0426/autoshorts](https://github.com/divyaprakash0426/autoshorts) | 191 | ~Feb 19, 2026 | YES — gameplay-focused viral clip extraction. Moderately maintained. |
| 8 | [SamurAIGPT/ai-clipping-generator](https://github.com/SamurAIGPT/ai-clipping-generator) | 43 | ~7 hours ago | YES — Next.js SaaS boilerplate for clip extraction. Very actively maintained. |

**Actively-maintained substitutes for Opus Clip: ~6-7** (several repos with commits in the last 3 months). This is the incumbent with the MOST open-source competition, but quality varies widely.

### 5. Candidate Proof Point
"Turns your long YouTube videos into ranked viral 9:16 shorts with AI highlight detection, Whisper transcription, and auto vertical cropping — free, no watermarks, no per-clip credits, runs on your machine."

---

## Incumbent 3: Vizard (vizard.ai)

### 1. Name + URL
Vizard — https://www.vizard.ai

### 2. Specific Paywalled/Frustrating Limitation
- **Free tier has watermark** — watermark removal requires paid Creator plan.
- **Free tier limited to 720p export** — 4K only on paid plans.
- **Free tier has 3-day storage** — videos expire after 3 days.
- **Free tier limited to 60 credits/month** (1 credit = 1 minute of video).
- **Free tier limited to 1GB upload size, 60 min upload length.**

### 3. Evidence (fetched links)

1. **https://www.vizard.ai/pricing** (fetched successfully)
   - Quote: Free plan — "Export videos in 720p", "3-day storage", "60 credits/month", "Upload video size: 1GB"
   - Quote: Creator plan heading — "Create high quality videos, no watermark" — confirming free tier HAS watermark.
   - Quote: Comparison table — Free: Watermark removal = ❌, Export quality = 720p, Video storage = 3 days.

2. **https://old.reddit.com/r/VideoEditingTips/comments/1uhrj5i/opus_clip_is_getting_way_too_expensive_for_solo/** (fetched successfully, 18 days old)
   - Quote: "I tested Vizard after seeing people mention it here. Not bad at all. But I still felt like I was spending extra time sorting through clips that weren't quite right." — confirms Vizard is in the consideration set but has quality issues.

### 4. Existing Open-Source Substitutes

Same repos as Opus Clip section apply (Vizard is a direct Opus Clip competitor with the same clip-extraction use case). The SamurAIGPT repo explicitly lists Vizard as a competitor it replaces.

| # | Repo | Stars | Last Active | Does Paywalled Feature Free? |
|---|------|-------|-------------|------------------------------|
| 1 | [SamurAIGPT/AI-Youtube-Shorts-Generator](https://github.com/SamurAIGPT/AI-Youtube-Shorts-Generator) | 4.2k | ~24 days ago | YES — no watermark, no credit limits. |
| 2 | [JayWebtech/autoshorts](https://github.com/JayWebtech/autoshorts) | 483 | ~14 days ago | YES — local-first, no watermark, no storage limits. |
| 3 | [fralapo/clippyme](https://github.com/fralapo/clippyme) | 2 | ~3 days ago | YES — self-hosted, no watermark. |

**Actively-maintained substitutes for Vizard: ~3-4** (same repos as Opus Clip, since they serve the same use case).

### 5. Candidate Proof Point
"Turns long videos into viral vertical clips with AI highlight detection — free, no watermark, no 3-day expiry, no credit limits, self-hosted with Docker."

---

## Incumbent 4: Munch (getmunch.com)

### 1. Name + URL
Munch / Munch Studio — https://www.getmunch.com

### 2. Specific Paywalled/Frustrating Limitation
- **Munch has pivoted from a clip extraction tool to "Munch Studio"**, a full social media marketing automation platform. The original clip extraction functionality appears to have been absorbed into a broader product.
- **Pricing page at /pricing returned only JavaScript-rendered content** — could not extract specific pricing tiers. The homepage shows "Get Started For Free" but no pricing details were visible.
- The product now focuses on "done-for-you social media" rather than standalone clip extraction.

### 3. Evidence (fetched links)

1. **https://www.getmunch.com/pricing** (fetched — returned homepage content due to JS rendering)
   - Quote: "The AI that does your social media marketing for you. Munch Studio's AI handles your social media presence for you, saving you time, money & energy."
   - Quote: "Drop your business website & watch what happens." — product has pivoted to website-based social media automation.
   - Note: Specific pricing tiers NOT visible — the page requires JavaScript to render pricing. This is itself a friction point.

2. **https://www.getmunch.com** (fetched — same content as pricing page)
   - Quote: "Run your social in 10 minutes a week." — confirms pivot from clip tool to social media management.
   - No pricing details, credit limits, or watermark policies were extractable.

### 4. Existing Open-Source Substitutes

Since Munch has pivoted away from being primarily a clip tool, the same open-source clip extraction repos apply (SamurAIGPT, JayWebtech/autoshorts, etc.).

### 5. Candidate Proof Point
"Extracts viral clips from your long videos and posts them to social media automatically — free, self-hosted, no monthly subscription, no watermark."

---

## Incumbent 5: Captions (captions.ai)

### 1. Name + URL
Captions (by Mirage/NOCAP) — https://www.captions.ai

### 2. Specific Paywalled/Frustrating Limitation
- **Free tier has only 1 caption template** (vs 100+ on paid plans) — the animated caption styles that make videos go viral are locked.
- **Free tier has ZERO AI usage credits** — all AI features (AI Edit, AI Creator, AI Ads, AI Skits, AI Twin, AI Translate, AI Lipdub, AI Shorts, etc.) are locked behind Max plan at $24.99/month.
- **Paid plans scale expensive fast**: Max $24.99/mo (500 credits), Scale 2x $69.99/mo, Scale 4x $139.99/mo, top tier $279.99/mo.
- **Credit-based system** means even paid users hit limits.

### 3. Evidence (fetched links)

1. **https://www.captions.ai/pricing** (fetched successfully)
   - Quote: Free tier — "Caption templates: 1" vs Max: "100+" and Scale: "100+"
   - Quote: Free tier — "AI usage credits: None" vs Max: "Medium (500 credits/month)"
   - Quote: "Is there a free version of Captions? Yes, there is a free version of Captions. It includes a more limited feature set than you'll get with our paid plans."
   - Quote: Max plan $24.99/mo, Scale 2x $69.99/mo, Scale 4x $139.99/mo, top $279.99/mo.

2. **https://old.reddit.com/r/InstagramMarketing/comments/1s64fdq/any_app_with_auto_caption_on_free_tier/** (fetched successfully, 3 months old, 27 comments)
   - Quote: "Are there any apps which give auto caption on the free tier without all the watermark?" — direct evidence of users searching for free auto-caption tools without watermarks.

3. **https://old.reddit.com/r/AIAssisted/comments/1u87pfq/submagic_alternatives/** (fetched successfully, 29 days old)
   - Quote: "Captions (captions ai) — The most 'Submagic-like' in feel. Auto-captioning is solid and there's a stack of AI tools built in. Clean and beginner-friendly — though pricing creeps up fast the moment you outgrow the entry tier."

### 4. Existing Open-Source Substitutes

| # | Repo | Stars | Last Active | Does Paywalled Feature Free? |
|---|------|-------|-------------|------------------------------|
| 1 | [nicolaigaina/ai-video-captions](https://github.com/nicolaigaina/ai-video-captions) | 23 | ~Mar 27, 2026 | YES — 6 animated caption styles (Hormozi, MrBeast, Karaoke, Minimal, Bounce, Classic), word-level animation, 100+ languages, no watermark, self-hosted Docker. Directly replaces the caption styling feature. |
| 2 | [MartinDelophy/ai-video-editor](https://github.com/MartinDelophy/ai-video-editor) | 40 | ~38 minutes ago | YES — local-first browser AI video editor with Whisper captions, ONNX voiceovers, talking avatars. Very actively maintained. |
| 3 | [JorianWoltjer/AutoCaptions](https://github.com/JorianWoltjer/AutoCaptions) | 67 | Sep 25, 2023 | STALE — last updated Sep 2023. Uses Whisper for Premiere Pro sequence export. Not actively maintained. |
| 4 | [begin0808/LiveCaption_Global](https://github.com/begin0808/LiveCaption_Global) | 31 | ~18 days ago | PARTIAL — real-time bilingual subtitles for browser video. Different use case (live captions, not post-production styling). |

**Actively-maintained substitutes for Captions.ai: 2** (nicolaigaina and MartinDelophy). The animated caption styling niche has limited open-source coverage.

### 5. Candidate Proof Point
"Adds trending animated subtitles to your video in 6 viral styles (Hormozi, MrBeast, Karaoke) with word-level animation and 100+ language support — free, no watermark, no account, self-hosted with Docker."

---

## Cross-Cutting Findings

### The "No Watermark" Pattern (STRONG signal)

Across ALL incumbents, the #1 complaint pattern is: **free tiers have watermarks, and watermark removal is the primary reason to upgrade.** This is not vague dislike — it is a specific, named paywalled feature that users repeatedly ask for free.

**Key Reddit quotes documenting this pattern:**

- r/passive_income (125 points, 116 comments): "Tools like Opus Clip, Submagic, etc. all run $30-50/mo and most of them either watermark, cap your clips, or hide the 'no watermark' tier behind a $99 plan."
- r/ReelShorts (7 points, 19 comments): "CapCut is paywalling auto-captions, here are the best 100% free alternatives I've found" — "It's getting harder to find truly free video tool without watermarks or $30/mo subscriptions."
- r/InstagramMarketing (2 points, 27 comments): "Are there any apps which give auto caption on the free tier without all the watermark?"
- r/SideProject (AetherCut post, 8 points, 42 comments): "The free tier always slaps a watermark on your export, killing the share loop. AI features are metered — Every caption you generate burns credits."
- r/contentcreation (3 points, 8 comments): "I kept running into paywalls on caption tools"

### Open-Source Landscape Summary

**Total unique open-source repos found across all searches: ~15+**
- GitHub search "auto clip viral": 94 results
- GitHub search "whisper caption video": 327 results
- GitHub search "submagic alternative": 3 results

**Actively maintained (commits within last 3 months): ~8-10 repos**

**Top 5 by traction:**
1. SamurAIGPT/AI-Youtube-Shorts-Generator — 4.2k stars, updated 24 days ago
2. JayWebtech/autoshorts — 483 stars, updated 14 days ago, desktop app with releases
3. divyaprakash0426/autoshorts — 191 stars, updated Feb 2026
4. shreesha345/AI-short-creator — 176 stars, updated Jun 2025 (semi-maintained)
5. Upload-Post/skill-autoshorts — 119 stars, updated May 2026

### The Gap: No Single Open-Source Tool Does BOTH Clip Extraction + Animated Caption Styles

The critical finding is that the open-source landscape is fragmented:
- **Clip extraction repos** (SamurAIGPT, JayWebtech, etc.) do viral moment detection and vertical cropping, but most do NOT produce Submagic-style animated word-by-word captions.
- **Caption styling repos** (nicolaigaina/ai-video-captions) do animated subtitle styling but do NOT extract clips from long videos.

No single open-source tool combines both workflows the way Submagic + Magic Clips or Opus Clip does (long video → viral clips with animated captions burned in, no watermark).

This is the whitespace for a new open-source project.

### Fetch Failures (honest reporting)

1. **AlternativeTo pages**: All attempts returned 403/404/500 errors.
   - https://alternativeto.net/software/submagic/ — 404
   - https://alternativeto.net/software/submagic — 403
   - https://alternativeto.net/software/opus-clip/ — 500
2. **Reddit (new.reddit.com)**: Blocked with "Please wait for verification" or transport errors.
   - https://www.reddit.com/search/?q=submagic+free+alternative — blocked
   - https://www.reddit.com/search/?q=opus+clip+free+alternative — transport error
3. **Reddit (old.reddit.com)**: Worked intermittently. Some search queries returned results, others returned transport errors.
   - "submagic free alternative" — transport error
   - "opus clip too expensive" — SUCCESS (key evidence found)
   - "submagic watermark" — SUCCESS (key evidence found)
   - "captions app watermark free" — SUCCESS (key evidence found)
   - "vizard free alternative" — transport error
   - Individual thread fetch — transport error
4. **Munch pricing**: JavaScript-rendered page, pricing tiers not extractable.
