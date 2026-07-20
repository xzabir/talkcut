---
name: lenis-smooth-scroll
description: Lenis smooth scroll integration for React and vanilla JS. Use when adding smooth inertia-based scrolling to a web page. Library: https://github.com/darkroomengineering/lenis
---

# Lenis Smooth Scroll

## Installation

```bash
npm install lenis
```

## React Hook

```tsx
import { useEffect } from 'react';
import Lenis from 'lenis';

function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
}
```

## GSAP Integration

```ts
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);
```

## Anchor Link Navigation

```tsx
import Lenis from 'lenis';

const lenis = new Lenis();

// Smooth scroll to anchor
function scrollToId(id: string) {
  const el = document.querySelector(id);
  if (el) {
    lenis.scrollTo(el, {
      offset: -80, // navbar height
      duration: 1.5,
    });
  }
}

// Auto-handle all anchor links
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const href = link.getAttribute('href');
    if (href) scrollToId(href);
  });
});
```

## Configuration Reference

| Option | Default | Description |
|--------|---------|-------------|
| duration | 1.2 | Scroll duration in seconds |
| easing | easeOutExponential | Easing function |
| smoothWheel | true | Smooth wheel scrolling |
| smoothTouch | false | Smooth touch (usually off for mobile) |
| wheelMultiplier | 1 | Wheel scroll speed |
| touchMultiplier | 1 | Touch scroll speed |
| infinite | false | Infinite scroll |

## Reduced Motion

```ts
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Don't initialize Lenis — use native scroll
} else {
  const lenis = new Lenis();
}
```
