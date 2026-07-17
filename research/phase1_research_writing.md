# Phase 1 Research / Academic / Writing Tools — Incumbent Signal

**Date:** 2026-07-16
**Method:** Direct `webfetch` of incumbent pricing pages, GitHub repo/search pages, Wikipedia, and product homepages.
**Hard Constraint 4 (kill rule):** If 4+ actively-maintained open-source substitutes already do the free version of the paywalled feature, the candidate is **KILLED**.

## Fetch-failure disclosure (honesty note)

The following sources could NOT be retrieved and are **not** cited as evidence:
- **Reddit** — all attempted Reddit URLs returned `Transport error` or a "Please wait for verification" wall (r/GradSchool, r/PhD, r/LaTeX search, and the JSON search endpoint). Reddit signal is therefore **absent** from this report.
- **AlternativeTo** — `alternativeto.net/software/{grammarly,overleaf}` returned **HTTP 403 (Forbidden)**. Not used.
- **Mendeley.com** — reference-manager and guides pages require sign-in/cookies ("Internal Mendeley Error … sign you in"). Pricing not directly fetched; Elsevier ownership/lock-in sourced from Wikipedia instead.
- **Consensus** — `/pricing/` loaded but did **not** surface concrete dollar tiers in extracted text; `/home/plans/` and the premium-launch blog returned 404/403. Paid tier confirmed to exist; exact price **not verified**.
- **SciSpace** — `/pricing` loaded (shows monthly/yearly, "Save 40%", "Premium", "For Teams") but concrete dollar tiers were **not** in the extracted text; `/scispace-premium` returned 404.
- **OpenDraft** — the URL `federicodponte/opendraft` 404'd; the correct repo is `federicodeponte/opendraft` (verified via GitHub search).

No stats or links below are fabricated; every quote is from a fetched page.

---

## SUMMARY VERDICT TABLE

| # | Incumbent | Paywalled pain (verified) | Actively-maintained open substitutes | Verdict |
|---|-----------|---------------------------|--------------------------------------|---------|
| 1 | Elicit | Pro $49/mo; free = "limited usage" on Research Agent/Reports | Fragmented, small (<400★ each), none polished/hosted | **OPEN** |
| 2 | SciSpace/Typeset | Premium subscription (monthly/yearly; $ not extracted) | Same fragmented lit-review space; OpenDraft= drafting only | **OPEN** |
| 3 | Consensus | Paid Individual/Team/Enterprise tiers ($ not extracted) | No polished open "AI paper-search w/ consensus summaries" | **OPEN** |
| 4 | Litmaps | Free=100 articles/1 map, no alerts/collab; Pro $10/mo | No dedicated open literature-mapping/visualization tool found | **OPEN** |
| 5 | Grammarly | Pro $12/mo (tone, rewrite, plagiarism, AI-detect) | LanguageTool 14.7k★ covers basic grammar; AI-Pro features not open | **PARTIAL KILL** |
| 6 | Overleaf | Free=1 collaborator, 24h history; Std $16.60/Pro $33.25/mo | overleaf/overleaf CE 17.9k★ AGPL = open Overleaf itself | **KILLED** |
| 7 | QuillBot | Free=125-word paraphrase/2 modes; Prem $4.17/mo annual | Open paraphrase repos all tiny/stale (top 94★, 2021) | **OPEN** |
| 8 | Mathpix | Snip Pro from $4.99/mo; API pay-as-you-go | pix2tex 16.5k★ = strong single eqn OCR; only 1 dominant, no breadth | **OPEN (thin)** |
| 9 | Mendeley | Elsevier-owned, proprietary, lock-in/privacy | 8+ open ref managers (Zotero, JabRef, BibDesk…) | **KILLED** |
| 10 | Turnitin | Institutional-only, no individual access, false positives | Plagiarism DB: none; AI-detectors: 2-3 research-grade; bypass-tools abound | **OPEN** |

**KILLED: Overleaf, Mendeley.** **Partial kill: Grammarly (basic tier).** **Still open: Elicit, SciSpace, Consensus, Litmaps, QuillBot, Mathpix, Turnitin.**

---

## 1. Elicit — elicit.com

**Paywalled/frustrating limitation (verified):** Free tier = "Limited usage for Research Agent and Research Reports." Pro is **$49/mo** ($588/yr) — *not* the ~$10/mo in the brief — unlocking systematic-review screening (5,000 papers), 20-column extractions, 135 data sources, 10 alerts, custom extractions, explanations, API access. Scale $169/mo adds collaboration/figures/200 sources.

**Evidence (fetched):**
- https://elicit.com/pricing — *"Basic, For casual exploration, Free … Limited usage for Research Agent and Research Reports"*; *"Pro, For systematic reviews, $49 … Standard usage for Research Agent, Research Reports, and Systematic Literature Reviews … API access."*
- https://github.com/search?q=literature+review+ai&type=repositories — 845 results; top items are small/personal: `khoj-ai/openpaper` (381★, "workbench for managing your research library … Use an AI assistant", updated 3 days ago), `drshahizan/SLR-FC` (151★, Obsidian-based SLR), `PouriaRouzrokh/LatteReview` (116★, "low-code Python package … automate systematic literature"), `htlin222/meta-pipe` (108★, "Claude Code-powered … meta-analysis automation").

**Open-source substitutes:** Multiple emerging but **all small/fragmented and CLI- or script-level**, none a polished hosted search+synthesis over 125M papers with verified sources. Count of *actively-maintained, polished, end-to-end products*: **0** (well under 4).

**Candidate proof point (if pursued):** "An open, hosted AI literature-review assistant that searches a real paper corpus (e.g. OpenAlex/semantic-scholar APIs), returns answers with **verified citations** grounded in fetched full text — closing the gap between Elicit's paywalled Research Agent and the fragmented CLI tools." Differentiator vs OpenDraft (drafting) = **search/discovery/synthesis with source-grounding**.

**Verdict: OPEN** (not killed — no 4+ mature substitutes; the niche is fragmented scripts).

---

## 2. SciSpace / Typeset — typeset.io

**Paywalled/frustrating limitation (verified):** Has a Premium subscription ("Simple and transparent pricing … Monthly/Yearly … Save 40% … For Teams"). Concrete dollar tiers **not extracted** (page rendered testimonials/labels, not numbers in the text). Tool suite confirmed: Literature Review, Chat with PDF, Paraphraser, AI Detector, Citation Generator, AI Writer, Extract Data.

**Evidence (fetched):**
- https://www.typeset.io/pricing — *"Simple and transparent pricing … Monthly Yearly . Save 40% … For Teams"*; nav confirms tools: *"Literature Review, Chat with PDF, Paraphraser, AI Detector, Citation Generator."*
- https://github.com/federicodeponte/opendraft — 322★, updated 4 days ago: *"Free & open-source AI research-paper writer: 19 agents draft 20k-word academic papers in ~10 min with citations verified against CrossRef."* (Covers **drafting**, not search/discovery.)

**Open-source substitutes:** OpenDraft (322★, active) covers the *writing/drafting* half. The *search/discovery/synthesis* half has only the same fragmented lit-review tools as Elicit. Polished end-to-end open product: **0**.

**Candidate proof point:** Same as Elicit — an open search→synthesize→draft pipeline; OpenDraft already owns "draft with verified citations", so the **open gap is upstream**: discovery + synthesis + verified-source grounding.

**Verdict: OPEN** (drafting is partially served by OpenDraft; search/discovery/synthesis still open).

---

## 3. Consensus — consensus.app

**Paywalled/frustrating limitation (verified):** Paid tiers exist ("Individual", "Team and Enterprise", "Upgrade to streamline your research"). Exact prices **not extracted** (pricing page did not surface numbers; sub-pages 404/403). Value prop = AI search over peer-reviewed papers returning summaries + study-design identification.

**Evidence (fetched):**
- https://consensus.app/pricing/ — *"Pricing … 1. Individual 2. Team and Enterprise … Upgrade to streamline your research with all Consensus has to offer."* Testimonials: *"Consensus helps me gather real, peer-reviewed sources … identifying their study designs … essential to my dissertation workflow."*
- (No dedicated open substitute fetched. GitHub lit-review search (§1) shows no "AI paper search returning consensus + study-design" polished product.)

**Open-source substitutes:** None polished for the specific "AI search over papers → consensus answer + study-design tags" UX. **0** actively-maintained direct substitutes.

**Candidate proof point:** "Open AI research-search that returns a synthesized consensus answer with per-claim citations and study-design metadata, querying open corpora (OpenAlex/Semantic Scholar)."

**Verdict: OPEN** (no mature open equivalent; note pricing $ unverified).

---

## 4. Litmaps — litmaps.com

**Paywalled/frustrating limitation (verified):** Free = "Basic Search Up to 20 inputs", "2 Litmaps, 100 articles per Map", **no** Literature Alerts, **no** Collaboration. Pro = **$10/mo** (education; commercial more) = unlimited articles/Litmaps, advanced search, daily/configurable alerts. Team = collaboration.

**Evidence (fetched):**
- https://litmaps.com/pricing — Free: *"Basic Search Up to 20 inputs … 2 Litmaps 100 articles per Map … [Alerts] None … [Collaboration] None"*; Pro: *"$10 / month … Unlimited articles Unlimited Litmaps … Daily / Configurable [alerts]"*; Team: *"Team wide (unlimited)"* collaboration.
- https://github.com/search?q=literature+review+ai&type=repositories — no repo dedicated to interactive **citation-network visualization/mapping** (results are screening/extraction/drafting tools).

**Open-source substitutes:** No dedicated open literature-mapping/visualization tool found in fetches. **0** direct substitutes. (Zotero/obsidian-slr help organize but don't provide Litmaps' interactive seed-paper→network-growth visualization.)

**Candidate proof point:** "Open literature-map explorer: seed a paper, auto-grow a citation network from OpenAlex, interactive visualize + alert on new citing/cited works — free unlimited maps."

**Verdict: OPEN** (no mature open substitute for the visualization/mapping core).

---

## 5. Grammarly — grammarly.com

**Paywalled/frustrating limitation (verified):** Free = "Write without mistakes … See your writing tone … Generate text with 100 AI prompts." Pro = **$12/mo** adds: *"Rewrite full sentences with a click … Adjust your writing tone … Detect plagiarism and AI generated text … 2,000 AI prompts."* Privacy concern: cloud service that reads your text (mitigated only at Enterprise "BYOK" tier).

**Evidence (fetched):**
- https://www.grammarly.com/plans — Free: *"Write without mistakes … Generate text with 100 AI prompts"*; Pro $12: *"Rewrite full sentences … Adjust your writing tone … Detect plagiarism and AI generated text … 2,000 AI prompts/member/month."*
- https://github.com/languagetool-org/languagetool — **14.7k★**, LGPL-2.1, 82,021 commits, 59 releases: *"Style and Grammar Checker for 25+ Languages. It finds many errors that a simple spell checker cannot detect."* Self-hostable (Docker images listed). **This is the open-source core only — grammar/style/proofreading.**
- https://languagetool.org/ — confirms the **AI paraphraser is a (premium) website feature**, not the open core: *"LanguageTool now offers an A.I.-based paraphraser in addition to correction … Only the Premium version will show you all errors."* The open-source repo is described as "Style and Grammar Checker" (no AI tone/rephrase).

**Open-source substitutes (count):**
- Basic grammar/style checking: **LanguageTool (14.7k★, mature, self-hostable)** — 1 dominant mature tool. Not 4+, but it **fully covers Grammarly's free tier**.
- AI tone adjustment / full-sentence rewrite / plagiarism / AI-text detection (Grammarly **Pro**): open paraphrase repos are tiny/stale (see §7: top 94★, last updated 2021). **0 mature open substitutes** for the Pro feature set.

**Verdict: PARTIAL KILL.**
- **KILLED:** an open "free Grammarly" for basic grammar — LanguageTool already does this excellently and is self-hostable.
- **OPEN:** an open **Grammarly-Pro equivalent** — AI tone/rephrase + plagiarism + AI-detection in one privacy-first (local/self-hosted) assistant. LanguageTool's AI rephrase is closed/premium; no open tool bundles these. Candidate proof point: *"Local-first writing assistant combining LanguageTool's open grammar engine with on-device LLM rephrase/tone + optional similarity/AI-detection — no text leaves your machine."*

---

## 6. Overleaf — overleaf.com

**Paywalled/frustrating limitation (verified):** Free = **1 collaborator per project**, "Basic compile timeout", history "previous 24 hours only", basic AI (5 uses/day). Standard = **$16.60/mo** (annual) = 10 collaborators, track changes, full history, advanced ref search. Pro = **$33.25/mo** = unlimited collaborators.

**Evidence (fetched):**
- https://www.overleaf.com/user/subscription/plans — Free: *"1 collaborator per project … Document history and version control — previous 24 hours only"*; Standard $16.60: *"10 collaborators per project … Track changes"*; Pro $33.25: *"Unlimited collaborators per project."*
- https://github.com/overleaf/overleaf — **17.9k★**, AGPL-3.0, 28,265 commits, actively maintained: *"An open-source online real-time collaborative LaTeX editor … you can also run your own local version."* Docker via Overleaf Toolkit. **Caution:** *"Community Edition is intended for use in environments where all users are trusted … not appropriate for scenarios where isolation of users is required due to Sandbox Compiles not being available."* **Tracked changes + sandbox compiles are Server Pro only.**
- https://github.com/search?q=latex+collaboration+self+hosted&type=repositories — only 2 results, both tiny (2★ and 0★; one is "TeXDock … built on Overleaf CE"). The open LaTeX-collab space **is** Overleaf CE.

**Open-source substitutes:** overleaf/overleaf CE **is the open-source Overleaf itself** — self-hosting removes the collaborator paywall entirely (unlimited collaborators, unlimited projects, full history). It is the single canonical, actively-maintained (17.9k★) substitute. Residual gaps are Server-Pro-gated by design: tracked changes, sandbox compiles (security for untrusted users), managed hosting.

**Verdict: KILLED.** A new "free Overleaf with unlimited collaborators" is redundant — the incumbent's own AGPL Community Edition already provides it via self-hosting. The only thin residual gap is **easy managed hosting + tracked-changes**, but that is Server Pro's commercial boundary and not a clean open-feature gap.

---

## 7. QuillBot — quillbot.com

**Paywalled/frustrating limitation (verified):** Free = paraphrase **up to 125 words**, **2 modes** (Standard/Fluency), humanize 125 words / 6 uses per day, summarize 1,200 words, 20 AI chats, 3 images/day, plagiarism n/a. Premium = **$4.17/mo billed annually** = unlimited paraphrasing, 9 modes + custom modes, advanced grammar, unlimited humanize, custom summaries (6,000 words), plagiarism 25,000 words/mo, unlimited AI detector.

**Evidence (fetched):**
- https://quillbot.com/premium — Free: *"Paraphrase up to 125 words … Paraphrase in 2 modes … Humanize up to 125 words, 6 uses/day … Summarize text 1,200 words"*; Premium $4.17/mo annual: *"Unlimited paraphrasing … 9 unique modes … Prevent accidental plagiarism 25,000 words/month."*
- https://github.com/search?q=paraphrase+tool&type=repositories — 322 results, **all tiny/stale**: `websymphony/paraphrasing-tool` (94★, updated **Nov 2021**), `RasaHQ/paraphraser` (87★, updated **Jan 2022**), `HealthyTechGuy/paraphrasingTool` (41★). No mature, actively-maintained open paraphraser.

**Open-source substitutes:** **0** actively-maintained mature open paraphrase/summarize/humanize products. (LanguageTool's AI paraphraser is closed/premium — see §5.)

**Candidate proof point:** *"Open, unlimited paraphrase/summarize/humanize tool using local LLMs — no 125-word cap, no subscription, text never leaves your machine."*

**Verdict: OPEN** (no mature open substitute; the free-tier word/mode caps are a clear pain point).

---

## 8. Mathpix — mathpix.com

**Paywalled/frustrating limitation (verified):** Snip has a Free tier (limited) and **Pro from $4.99/mo**; Convert API is pay-as-you-go **from $0.002/image**; Files API from $1.00/1k pages. Snip covers image→LaTeX/Markdown/MS Word, PDF conversion, tables, chemistry, handwriting.

**Evidence (fetched):**
- https://mathpix.com/pricing/all — *"Snip … Free / Pro from $4.99/mo"*; *"Convert API … Pay as you go From $0.002/image"*; *"Files API … From $1.00 / 1k pages."* Supports image→LaTeX, table→LaTeX/CSV, PDF→LaTeX, chemistry, handwriting.
- https://github.com/lukas-blecher/LaTeX-OCR — **16.5k★**, MIT, 324 commits, updated Jan 2025: *"pix2tex: Using a ViT to convert images of equations into LaTeX code."* CLI + GUI (`latexocr` screenshot→clipboard) + API + Docker. BLEU 0.88. **Actively maintained, does the core equation→LaTeX for free.**
- https://github.com/search?q=image+to+latex&type=repositories — 770 results; next-biggest `kingyiusuen/image-to-latex` (2.2k★, updated **Oct 2022 — stale**); rest are small/old.

**Open-source substitutes (count of actively-maintained doing the SAME thing):** Effectively **1 dominant** (pix2tex/LaTeX-OCR, 16.5k★). Not 4+. And pix2tex covers **equations only** — not Mathpix's breadth (PDF→LaTeX, tables, chemistry, handwriting, MS Word). So neither the "4+" kill rule nor full feature parity is met.

**Candidate proof point (thin):** *"Open OCR-to-LaTeX suite expanding pix2tex to PDF/tables/handwriting with a polished cross-platform Snip-style app."* **Caveat:** pix2tex already covers the single most common job (equation screenshots) for free, so the wedge is **breadth + UX**, not the core feature. Weakest of the OPEN candidates.

**Verdict: OPEN (thin)** — one strong open substitute covers the headline feature; gap is breadth/UX, not existence.

---

## 9. Mendeley — mendeley.com

**Paywalled/frustrating limitation (verified):** Proprietary, **Elsevier-owned** (acquired 2013, ~€50M / $65M), cloud-account required, lock-in/privacy concerns. 2018 incident: an update caused users to lose PDFs and annotations. Community viewed the Elsevier acquisition as "antithetical to Mendeley's open sharing model."

**Evidence (fetched):**
- https://en.wikipedia.org/wiki/Mendeley — *"acquired by the Dutch academic publishing company Elsevier in 2013 … License: Proprietary."* *"The sale … upset members of the scientific community who felt that the Mendeley's acquisition by Elsevier was antithetical to Mendeley's open sharing model."* David Dobbs (The New Yorker): Elsevier's reasons could be *"to acquire its user data and/or to 'destroy or co opt an open-science icon'."* Incident: *"In 2018, an update to Mendeley resulted in some users losing PDFs and annotations."* Wikipedia explicitly names **"Zotero – open access equivalent software tool."**
- https://www.zotero.org/ — *"free, easy-to-use tool to help you collect, organize, annotate, cite, and share research … open source and developed by an independent, nonprofit organization … no financial interest in your private information … share a Zotero library with as many people you like, at no cost … over 9,000 citation styles."*
- Wikipedia's reference-management template lists **8 open-source** managers: BibDesk, BibSonomy, JabRef, KBibTeX, Pybliographer, refer, Referencer, **Zotero**.

**Open-source substitutes:** **8 listed; 4+ actively maintained** (Zotero [dominant, nonprofit], JabRef, BibDesk, BibSonomy). They fully cover the free reference-manager feature set, without Elsevier lock-in.

**Verdict: KILLED (Hard Constraint 4).** 4+ actively-maintained open substitutes already do the free version; Zotero is the mature, privacy-respecting, nonprofit standard. No gap for a new open Mendeley.

---

## 10. Turnitin — turnitin.com

**Paywalled/frustrating limitation (verified):** **Institutional-only** — sold to 16,000+ institutions; "Contact Sales"; **no individual/student pricing**. Students are forced into it via their school and cannot self-check before submission. Products: Feedback Studio, Similarity, iThenticate, Gradescope, ExamSoft, new "Turnitin Clarity" (AI-detection). Pain points (from brief, consistent with institutional model): student resentment, false positives, no individual access.

**Evidence (fetched):**
- https://www.turnitin.com — *"Join more than 16,000 institutions who partner with Turnitin"*; all product pages route to "Contact Sales" (no individual buy). *"Check for AI writing, compare student work against the world's largest academic database."* New *"Turnitin Clarity … identify AI-generated writing."*
- https://github.com/search?q=plagiarism+detector&type=repositories — 2.4k results, **all tiny/student projects** (top `diogocabral/sherlock` 141★, updated Dec 2023; rest <50★, many stale). These are code-level similarity algorithms (n-gram/Smith-Waterman/minhash) — **no database-backed open plagiarism checker**. Turnitin's moat is the proprietary corpus.
- https://github.com/search?q=ai+text+detector&type=repositories — 1.5k results; a few **research-grade, maintained** AI-text detectors: `YuchuanTian/AIGC_text_detector` (448★, ICLR'24 Spotlight, updated Aug 2025), `Imalwayshere/Open-Detector` (234★, "BERT-based AI-generated academic text detection", updated Mar 2025), `distil-labs/distil-ai-slop-detector` (89★, "Detect AI-generated text locally in your browser", updated Feb 2025). **Not packaged as a student-facing self-check product.**
- **Student-resentment signal (verified):** multiple popular open "bypass Turnitin" humanizer repos: `lynote-ai/humanize-text` (1.5k★, updated 2 days ago, *"Bypass Turnitin, GPTZero, and …"*), `anasu1/text-humanizer` (492★, *"Bypasses the most of AI detectors"*), `harshaneel/humanize` (241★, *"Best static AI text humanizer"*).

**Open-source substitutes:**
- **Plagiarism (database similarity): 0 mature open substitutes** (no corpus). Hard to replicate (data moat).
- **AI-text detection: 2-3 actively-maintained research models** — not 4+ polished products, and not student-facing.

**Candidate proof point:** *"Open, student-facing pre-submission checker: transparent AI-detection (shows *why* text is flagged, calibrated for low false positives) using open detectors — plus optional self-similarity scan. Targets the unmet need created by institutional lock-in and false-positive anxiety."* **Caveat:** a real plagiarism *database* is a data-moat problem; the viable open wedge is **transparent AI-detection + explainability for students**, not database similarity.

**Verdict: OPEN** (institutional lock-in + false-positive resentment are real; open AI-detectors exist but aren't a polished student self-check product; plagiarism-DB angle is data-moat-bound).

---

## Cross-cutting notes for ideation

- **Strongest OPEN gaps (polished product missing, substitutes <4 and immature):**
  1. **Elicit/SciSpace/Consensus** — open hosted AI literature **search/discovery/synthesis with verified-source grounding** over open corpora (OpenAlex/Semantic Scholar). OpenDraft owns drafting; the upstream discovery/synthesis gap is real.
  2. **QuillBot** — open unlimited paraphrase/summarize/humanize via local LLMs (no mature open substitute; free tier is aggressively capped).
  3. **Litmaps** — open literature-network visualization/mapping + alerts (no dedicated open substitute found).
  4. **Grammarly-Pro feature set** — open AI tone/rephrase + plagiarism + AI-detection, local-first (LanguageTool covers only basic grammar; its AI rephrase is closed/premium).
  5. **Turnitin** — transparent, student-facing AI-detection self-check (resentment + lock-in evidenced by 1.5k★ bypass-tools).

- **KILLED (do not pursue as "free X"):** Overleaf (CE already open, 17.9k★), Mendeley (8+ open ref managers incl. Zotero).

- **Thin/wedge-only:** Mathpix (pix2tex 16.5k★ already covers equation OCR free; wedge is breadth/UX only).

- **Data-moat caveat:** Turnitin plagiarism-DB and Elicit-style "125M paper corpus" require a corpus; the open path is to build on **OpenAlex / Semantic Scholar / CrossRef / arXiv** (open APIs) rather than replicate proprietary databases.
