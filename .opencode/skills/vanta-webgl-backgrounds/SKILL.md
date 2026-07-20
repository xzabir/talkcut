---
name: vanta-webgl-backgrounds
description: Vanta.js animated WebGL backgrounds for web pages. Use when adding animated 3D backgrounds (NET, WAVES, BIRDS, FOG, HALO, RINGS, DOTS). Library: https://github.com/tengbao/vanta
---

# Vanta WebGL Backgrounds

## Installation

```bash
npm install vanta three
```

## React Component

```tsx
import { useEffect, useRef } from 'react';
import VANTA from 'vanta/src/vanta.net';
import * as THREE from 'three';

function VantaBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);

  useEffect(() => {
    if (!ref.current) return;

    effectRef.current = VANTA({
      el: ref.current,
      THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1,
      scaleMobile: 1,
      color: 0x5e60ce,
      backgroundColor: 0x0d1117,
      points: 10,
      maxDistance: 23,
      spacing: 16,
    });

    return () => {
      effectRef.current?.destroy();
    };
  }, []);

  return <div ref={ref} style={{ position: 'absolute', inset: 0, zIndex: -1 }} />;
}
```

## Effects Reference

### NET (recommended for tech products)
```ts
VANTA.NET({
  el: target,
  THREE,
  color: 0x5e60ce,         // line color
  backgroundColor: 0x0d1117,
  points: 10,              // number of points
  maxDistance: 23,         // max line length
  spacing: 16,             // grid spacing
  showDots: true,
})
```

### WAVES (calm, fluid)
```ts
VANTA.WAVES({
  el: target,
  THREE,
  color: 0x1a1a2e,
  color2: 0x5e60ce,
  backgroundColor: 0x0d1117,
  shininess: 30,
  waveHeight: 15,
  waveSpeed: 0.5,
  zoom: 0.65,
})
```

### HALO (glowing, premium)
```ts
VANTA.HALO({
  el: target,
  THREE,
  baseColor: 0x1a1a2e,
  color1: 0x5e60ce,
  color2: 0x0d1117,
  size: 1,
  speed: 1,
})
```

### FOG (atmospheric)
```ts
VANTA.FOG({
  el: target,
  THREE,
  highlightColor: 0x5e60ce,
  midtoneColor: 0x161b22,
  lowcolorColor: 0x0d1117,
  speed: 1,
  zoom: 0.8,
})
```

### DOTS (playful, connected)
```ts
VANTA.DOTS({
  el: target,
  THREE,
  color: 0x5e60ce,
  color2: 0x6c6ef2,
  backgroundColor: 0x0d1117,
  size: 3,
  spacing: 35,
  showLines: true,
})
```

### RINGS (minimal, geometric)
```ts
VANTA.RINGS({
  el: target,
  THREE,
  color: 0x5e60ce,
  backgroundColor: 0x0d1117,
  backgroundAlpha: 0.8,
  size: 1,
})
```

## Performance Tips

- Set `z-index: -1` on the Vanta container so it doesn't block clicks
- Use `position: fixed` for full-page background
- Reduce `points`/`spacing` on mobile for better FPS
- Always call `.destroy()` on unmount
- Check `prefers-reduced-motion` and skip Vanta if true

## Reduced Motion Fallback

```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Static gradient background instead
  return <div style={{ background: 'linear-gradient(135deg, #0d1117, #161b22)' }} />;
}
```
