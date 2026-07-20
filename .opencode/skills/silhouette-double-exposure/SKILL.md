---
name: silhouette-double-exposure
description: Silhouette double-exposure visual technique using SVG masks, CSS blend modes, and canvas compositing. Use when creating the specific double-exposure design where a silhouette is filled with secondary imagery.
---

# Silhouette Double Exposure

## Concept

Double exposure combines two visual layers:
1. **Silhouette**: A human profile or figure outline (the mask)
2. **Fill**: Secondary imagery (video frames, waveforms, text, code, gradients) visible only inside the silhouette

## Implementation Approaches

### 1. SVG Mask (best for web — crisp, scalable, animatable)

```tsx
function SilhouetteDoubleExposure() {
  return (
    <svg viewBox="0 0 400 500" className="silhouette">
      <defs>
        <mask id="profile-mask">
          {/* Human head profile silhouette */}
          <path
            d="M200,40 C240,40 275,75 280,130 C283,170 270,205 245,225
               L250,290 L260,400 L270,470 L130,470 L140,400 L150,290
               L155,225 C130,205 117,170 120,130 C125,75 160,40 200,40 Z"
            fill="white"
          />
        </mask>
      </defs>

      {/* Fill layer: only visible inside the mask */}
      <rect width="400" height="500" fill="#0d1117" />
      <g mask="url(#profile-mask)">
        {/* Video frame or gradient or text */}
        <rect width="400" height="500" fill="url(#gradient)" />
        {/* Or: <image href="video-frame.jpg" width="400" height="500" /> */}
      </g>

      {/* Optional: outline glow */}
      <path
        d="M200,40 C240,40 275,75 280,130 ..."
        fill="none"
        stroke="#5e60ce"
        strokeWidth="1"
        opacity="0.3"
      />
    </svg>
  );
}
```

### 2. CSS Blend Mode (simple, less control)

```css
.silhouette-wrapper {
  position: relative;
  width: 400px;
  height: 500px;
  background: #0d1117;
}

.silhouette-mask {
  /* Black silhouette on transparent background */
  -webkit-mask: url('silhouette.svg') center/contain no-repeat;
  mask: url('silhouette.svg') center/contain no-repeat;
}

.silhouette-fill {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #5e60ce, #6c6ef2);
  mix-blend-mode: screen;
}
```

### 3. Canvas Composite (for dynamic/video fills)

```ts
function drawSilhouette(canvas: HTMLCanvasElement, fillImage: CanvasImageSource) {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;

  // Clear
  ctx.clearRect(0, 0, w, h);

  // Draw silhouette shape
  ctx.fillStyle = '#000';
  ctx.beginPath();
  // Head profile path
  ctx.ellipse(w/2, h*0.25, w*0.15, h*0.18, 0, 0, Math.PI*2);
  ctx.fill();
  // Shoulders
  ctx.fillRect(w*0.25, h*0.4, w*0.5, h*0.6);
  ctx.fill();

  // Composite: only draw fill inside silhouette
  ctx.globalCompositeOperation = 'source-in';
  ctx.drawImage(fillImage, 0, 0, w, h);

  // Reset
  ctx.globalCompositeOperation = 'source-over';
}
```

### 4. Animated Gradient Fill (pure CSS, no images needed)

```tsx
function AnimatedSilhouette() {
  return (
    <div className="silhouette-container">
      <div className="silhouette-shape" />  {/* SVG mask */}
      <div className="silhouette-gradient" />  {/* Animated gradient */}
      <style>{`
        .silhouette-gradient {
          background: linear-gradient(135deg, #5e60ce, #6c6ef2, #2ea043, #5e60ce);
          background-size: 400% 400%;
          animation: gradient-shift 8s ease infinite;
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
```

## Silhouette Path Library

### Human Profile (side view)
```svg
<path d="M180,60 C220,60 255,90 260,145 C263,180 250,210 225,230
         L230,280 L240,350 L250,450 L110,450 L120,350 L130,280
         L135,230 C110,210 97,180 100,145 C105,90 140,60 180,60 Z" />
```

### Head Only (front view)
```svg
<ellipse cx="200" cy="150" rx="85" ry="110" />
```

### Abstract Blob (modern, non-figurative)
```svg
<path d="M200,80 C280,80 320,140 320,200 C320,280 280,340 200,340
         C120,340 80,280 80,200 C80,140 120,80 200,80 Z" />
```

## Design Principles

1. **High contrast**: The silhouette should be clearly visible against the background
2. **Animated fill**: Use video, moving gradients, or scrolling text as the fill — static fills are boring
3. **Subtle outline**: A 1px glow around the silhouette edge adds depth
4. **Negative space**: The silhouette should float in dark space, not touch edges
5. **Performance**: SVG masks are GPU-accelerated and perform well
6. **Responsive**: Use `viewBox` + `preserveAspectRatio` so it scales
