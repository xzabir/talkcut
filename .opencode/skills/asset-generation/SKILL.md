---
name: asset-generation
description: Generate SVG logos, favicons, OG images, and brand assets programmatically. Use when creating visual brand assets without external image editing tools.
---

# Asset Generation

## SVG Logo Generation

### Geometric Logo Pattern
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <!-- Abstract mark using geometric shapes -->
  <rect x="12" y="12" width="40" height="40" rx="12"
        fill="none" stroke="#5e60ce" stroke-width="3"/>
  <circle cx="32" cy="32" r="8" fill="#5e60ce"/>
  <line x1="32" y1="12" x2="32" y2="20" stroke="#5e60ce" stroke-width="3"/>
</svg>
```

### Text-Based Logo
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 48">
  <text x="0" y="36" font-family="Inter, sans-serif" font-size="36"
        font-weight="700" fill="#e6edf3">Product</text>
</svg>
```

## Favicon Generation

### SVG Favicon (modern browsers)
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#0d1117"/>
  <path d="M16,8 L24,16 L16,24 L8,16 Z" fill="#5e60ce"/>
</svg>
```

### PNG Favicon (use sharp or canvas)
```ts
import sharp from 'sharp';

// Generate 16x16, 32x32, 180x180, 512x512 from SVG
const sizes = [16, 32, 180, 512];
for (const size of sizes) {
  await sharp('logo.svg')
    .resize(size, size)
    .png()
    .toFile(`favicon-${size}.png`);
}
```

## OG Image Generation (HTML to Canvas)

```tsx
// Generate OG image as HTML, then screenshot with Playwright
function generateOGImage() {
  const html = `
    <div style="width:1200px;height:630px;background:#0d1117;
                display:flex;flex-direction:column;align-items:center;
                justify-content:center;font-family:Inter,sans-serif;">
      <div style="font-size:72px;font-weight:700;color:#e6edf3;">Product Name</div>
      <div style="font-size:28px;color:#7d8590;margin-top:16px;">Tagline here</div>
      <div style="margin-top:40px;padding:12px 32px;background:#5e60ce;
                  border-radius:12px;color:white;font-size:20px;">Free · Open Source</div>
    </div>
  `;
  // Render with Playwright and screenshot
}
```

## Web App Manifest

```json
{
  "name": "Product Name",
  "short_name": "Product",
  "description": "Description",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0d1117",
  "theme_color": "#5e60ce",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

## Social Preview (GitHub)

GitHub uses the following for social preview:
- File: `.github/social-preview.png`
- Size: 1280x640px
- Shown on: repo page, share cards, embed

Set via: GitHub repo → Settings → Social preview → Upload
