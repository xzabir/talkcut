---
name: brand-identity-system
description: Brand naming, color systems, typography, voice, and positioning. Use when creating or refining a brand identity for a product or company.
---

# Brand Identity System

## Naming Framework

### Criteria for a Good Name
- 1-3 syllables, easy to pronounce
- 5-8 characters ideal
- No negative meanings in major languages (check English, Spanish, Mandarin, Hindi, Arabic, Japanese)
- Available as .com, .io, .app, or .dev (at least one)
- Not trademarked in the same category
- Works as a verb ("just [name] it")

### Naming Patterns
- **Portmanteau**: Stripe +ipe, Notion +tion, Linear +ear
- **Latin/Greek root**: Vercel (from "verse"), Figma (from "figure")
- **Real word**: Linear, Raycast, Arc
- **Invented**: Vercel, Roam, Spline
- **Compound**: GitHub, YouTube, Notion

### Linguistic Check
Before finalizing, check:
- Google search: does the name return irrelevant/competing results?
- Domain availability: .com, .io, .app, .dev
- Social handles: Twitter, GitHub, Instagram
- App stores: not already taken
- Trademark: USPTO and EU IPO basic search

## Color System

### Dark Theme Palette (recommended for dev tools)
```css
:root {
  /* Backgrounds — layered for depth */
  --bg-canvas: #0d1117;      /* deepest */
  --bg-surface: #161b22;     /* panels */
  --bg-overlay: #1c2128;     /* hover */
  --bg-elevated: #22272e;    /* modals */

  /* Text — 3 levels */
  --text-primary: #e6edf3;
  --text-secondary: #7d8590;
  --text-tertiary: #6e7681;

  /* Accents — 1 primary + 1 semantic set */
  --accent: #5e60ce;         /* indigo — premium, trustworthy */
  --accent-hover: #6c6ef2;
  --accent-subtle: rgba(94, 96, 206, 0.12);

  --success: #2ea043;
  --danger: #f85149;
  --warning: #d29922;

  /* Borders */
  --border-default: #30363d;
  --border-muted: #21262d;
}
```

### Accent Color Psychology
| Color | Feeling | Used by |
|-------|---------|---------|
| Indigo | Premium, trustworthy | Linear, Stripe |
| Green | Growth, money | Vercel, GitHub |
| Orange | Energy, creativity | SoundCloud, HackerRank |
| Red | Bold, urgent | YouTube, Pinterest |
| Cyan | Tech, clean | Linear, Raycast |

## Typography

### Recommended Font Stack
```css
--font-display: 'Inter', system-ui, sans-serif;     /* Headlines */
--font-body: 'Inter', system-ui, sans-serif;         /* Body */
--font-mono: 'JetBrains Mono', 'SF Mono', monospace; /* Code */
```

### Type Scale (1.250 ratio)
```
xs:   12px / 1.5
sm:   14px / 1.5
base: 16px / 1.6
lg:   20px / 1.4
xl:   25px / 1.3
2xl:  31px / 1.2
3xl:  39px / 1.1
4xl:  49px / 1.05
5xl:  61px / 1.0
```

## Brand Voice

### Voice Adjectives (pick 3)
For a developer tool: **precise, confident, warm**
For a creative tool: **bold, playful, honest**
For an enterprise tool: **clear, reliable, human**

### Voice Rules
- Active voice, always
- Short sentences (15 words max)
- No jargon in marketing copy
- No exclamation marks (exception: 1 per page max)
- Never "powerful", "seamless", "revolutionary"
- "You" not "users", "we" not "the company"
