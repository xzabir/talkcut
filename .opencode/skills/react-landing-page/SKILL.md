---
name: react-landing-page
description: React landing page architecture with Vite, TypeScript, and modern animation libraries. Use when building a marketing landing page with React.
---

# React Landing Page Architecture

## Tech Stack

```
React 19 + TypeScript + Vite
├── Framer Motion (component animations)
├── GSAP + ScrollTrigger (scroll-driven animations)
├── Lenis (smooth scroll)
├── Vanta.js + Three.js (WebGL backgrounds)
└── react-bits (UI components)
```

## Project Setup

```bash
npm create vite@latest landing -- --template react-ts
cd landing
npm install framer-motion gsap lenis vanta three react-bits
```

## File Structure

```
src/
├── main.tsx              # Entry point
├── App.tsx               # Page composition
├── sections/
│   ├── Hero.tsx          # Above-the-fold
│   ├── Features.tsx      # Feature grid
│   ├── HowItWorks.tsx    # Step-by-step
│   ├── Demo.tsx          # Video/screenshot demo
│   ├── Comparison.tsx    # vs competitors
│   ├── FAQ.tsx           # Accordion
│   └── CTA.tsx           # Final call to action
├── components/
│   ├── Navbar.tsx        # Sticky nav
│   ├── Footer.tsx        # Footer
│   ├── VantaBackground.tsx
│   ├── Silhouette.tsx
│   └── Button.tsx
├── hooks/
│   ├── useLenis.ts       # Smooth scroll
│   └── useReveal.ts      # Scroll reveal helper
├── styles/
│   └── global.css        # Design tokens
└── lib/
    └── constants.ts      # Content/copy
```

## App.tsx Pattern

```tsx
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Hero } from './sections/Hero';
import { Features } from './sections/Features';
import { HowItWorks } from './sections/HowItWorks';
import { Demo } from './sections/Demo';
import { Comparison } from './sections/Comparison';
import { FAQ } from './sections/FAQ';
import { CTA } from './sections/CTA';
import { useLenis } from './hooks/useLenis';

export default function App() {
  useLenis();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Demo />
        <Comparison />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
```

## Section Pattern

```tsx
import { motion } from 'framer-motion';
import { useRef } from 'react';

export function Features() {
  const ref = useRef<HTMLElement>(null);

  return (
    <section id="features" ref={ref} className="features-section">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Features headline
        </motion.h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="feature-card"
            >
              <f.icon />
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

## Build & Deploy

```bash
npm run build  # outputs to dist/
```

For GitHub Pages, set `base: './'` in vite.config.ts for relative paths.
