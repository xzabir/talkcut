# Kage Video Editor - Design System Specification

## 1. Aesthetic Overview: Silhouette Double Exposure
The Kage brand aesthetic is rooted in the "Silhouette double exposure type design" concept. It merges the mystery and starkness of pitch-black silhouettes with the vibrant, dynamic energy of video content bleeding through the typography and primary shapes. This creates a deeply cinematic, Awwwards-winning visual experience that immediately communicates "cutting-edge video editing."

- **Core Vibe:** Cinematic, stark, dynamic, and professional.
- **Visual Motif:** Bold typography and stark geometric shapes acting as clipping masks for vibrant, moving video elements (double exposure). High contrast is paramount.

## 2. Color Palette
The color system relies heavily on absolute darks to create the silhouette effect, punctuated by cinematic accents that mimic film grades.

### Primary Colors (The Silhouette)
- **Void Black:** `#050505` - Used for primary backgrounds and large structural elements.
- **Onyx:** `#121212` - Used for elevated cards, floating panels, and subtle depth.

### Accent Colors (The Exposure)
- **Cinematic Teal:** `#00E5FF` - Primary action color, used for primary buttons, active states, and energetic highlights.
- **Neon Crimson:** `#FF2A55` - Secondary accent, used for destructive actions, recording indicators, and vibrant contrasts against the teal.
- **Film Grain White:** `#F5F5F7` - Used for primary UI text and essential icons.
- **Muted Silver:** `#8E8E93` - Used for secondary text, disabled states, and borders.

## 3. Typography
Typography is central to the double exposure effect. We need massive, structural display fonts for masking, paired with ultra-clean UI fonts.

### Display Typeface: **Clash Display** or **Tungsten**
- **Weight:** Bold / Black
- **Usage:** Hero headlines, giant background typography, acting as SVG clipping masks for background videos. It must be thick enough to show the "exposure" inside the letters.

### UI Typeface: **Inter** or **SF Pro Display**
- **Weight:** Regular, Medium, Semi-Bold
- **Usage:** All standard UI elements, buttons, menus, and body copy. Provides maximum legibility against the stark backgrounds.

## 4. Micro-interactions
Motion in Kage should feel like a high-end film transition.

- **The Reveal (Hover):** Hovering over large text or silhouette blocks smoothly transitions the opacity of the masked video from 0% (solid color) to 100% (video playing inside the shape) over `400ms` with an `ease-out-expo` curve.
- **Magnetic Components:** Core interactive elements (buttons, tool icons) feature a subtle magnetic pull on cursor approach, standard in premium Awwwards sites.
- **Page Transitions:** Fluid, sweeping wipes or iris transitions reminiscent of classic film cuts, utilizing solid Void Black overlays.
- **Button Press:** A crisp, snappy scale-down (`0.95`) with a glowing box-shadow bloom in the Cinematic Teal accent.

## 5. Component Layout Structure (Skiper UI Inspired)
Leveraging modern structural libraries like Skiper UI, the layout prioritizes content and canvas over cluttered toolbars.

### Grid & Spacing
- **Layout Model:** CSS Grid-based Bento Box configurations for dashboards; sleek, floating sidebars for the editing workspace.
- **Spacing System:** 8pt grid system. Generous padding (`32px` - `64px`) in marketing sections to emphasize the massive double exposure typography.

### Core Components
- **The Canvas (Editor):** Edge-to-edge workspace. Toolbars are minimized and float over the canvas with deep backdrop blurs (`backdrop-filter: blur(24px)`).
- **Navigation:** Floating pill-shaped header navigation. Stark, minimal, with active states indicated by a subtle Cinematic Teal dot.
- **Cards & Panels:** Dark Onyx backgrounds with ultra-thin `1px` borders in `rgba(255,255,255,0.05)`. Sharp corners or very subtle rounding (`4px`) to maintain a serious, professional edge.
- **Buttons:** Solid Void Black with a Cinematic Teal border. On hover, the button fills with the Cinematic Teal, and text inverts to black.

## 6. Implementation Notes
- Use `mix-blend-mode: screen` or `css clip-path` / `-webkit-background-clip: text` for the double exposure typography effects.
- Ensure all videos used in the double exposure masks are heavily color-graded to match the Teal/Crimson accent palette.
- Rely on WebGL or advanced CSS animations for buttery smooth 60fps micro-interactions.
