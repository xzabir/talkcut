---
name: gsap-scroll-animations
description: GSAP ScrollTrigger timelines and scroll-driven animations. Use when building scroll-pinned sections, parallax effects, or scrub-triggered animations. Library: https://github.com/greensock/GSAP
---

# GSAP Scroll Animations

## Installation

```bash
npm install gsap
```

## React Hook

```tsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function useGsapAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animations here
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return containerRef;
}
```

## Core Patterns

### 1. Scroll-Pinned Hero
```ts
gsap.timeline({
  scrollTrigger: {
    trigger: ".hero",
    start: "top top",
    end: "+=100%",
    pin: true,
    scrub: 1,
  }
})
.to(".hero-title", { y: -100, opacity: 0, duration: 1 }, 0)
.to(".hero-subtitle", { y: -60, opacity: 0, duration: 1 }, 0.1)
.to(".hero-bg", { scale: 1.3, duration: 1 }, 0)
.to(".hero-cta", { y: -30, opacity: 0, duration: 0.5 }, 0.3);
```

### 2. Reveal on Scroll
```ts
gsap.utils.toArray('.reveal').forEach((el) => {
  gsap.from(el, {
    opacity: 0,
    y: 60,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      end: 'top 50%',
      scrub: 1,
    }
  });
});
```

### 3. Horizontal Scroll Section
```ts
const sections = gsap.utils.toArray('.horizontal-section');
gsap.to(sections, {
  xPercent: -100 * (sections.length - 1),
  ease: 'none',
  scrollTrigger: {
    trigger: '.horizontal-container',
    pin: true,
    scrub: 1,
    snap: 1 / (sections.length - 1),
    end: () => `+=${window.innerWidth * sections.length}`,
  }
});
```

### 4. Parallax Layers
```ts
gsap.utils.toArray('.parallax-layer').forEach((layer) => {
  const speed = parseFloat(layer.dataset.speed || '0.5');
  gsap.to(layer, {
    y: () => -window.innerHeight * speed,
    ease: 'none',
    scrollTrigger: {
      trigger: layer,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
    }
  });
});
```

### 5. Staggered Reveal
```ts
gsap.from('.feature-card', {
  opacity: 0,
  y: 50,
  duration: 0.6,
  stagger: 0.1,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '.features-grid',
    start: 'top 80%',
  }
});
```

### 6. Text Split Animation
```ts
// Split text into words
const text = document.querySelector('.hero-title');
const words = text.textContent.split(' ');
text.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(' ');

gsap.from('.word', {
  opacity: 0,
  y: 100,
  rotateX: -90,
  duration: 0.8,
  stagger: 0.05,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '.hero-title',
    start: 'top 80%',
  }
});
```

### 7. Counter Animation
```ts
gsap.to('.counter', {
  textContent: 100,
  duration: 2,
  ease: 'power2.out',
  snap: { textContent: 1 },
  scrollTrigger: {
    trigger: '.counter',
    start: 'top 80%',
  }
});
```

## Easing Reference

| Ease | Use for |
|------|---------|
| power2.out | Entrances, reveals |
| power3.inOut | Section transitions |
| power4.out | Dramatic entrances |
| expo.out | Fast start, slow end |
| none | Linear scrub |
| back.out(1.7) | Slight overshoot |

## Cleanup (React)

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    // all GSAP animations
  }, componentRef);

  return () => ctx.revert(); // kills all animations + ScrollTriggers
}, []);
```
