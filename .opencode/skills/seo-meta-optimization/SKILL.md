---
name: seo-meta-optimization
description: SEO meta tags, Open Graph, Twitter Cards, structured data, and social sharing optimization. Use when setting up SEO for a landing page or web app.
---

# SEO Meta Optimization

## Complete Meta Tag Set

```html
<head>
  <!-- Primary -->
  <title>Product Name — Tagline (50-60 chars)</title>
  <meta name="description" content="155 char description with action verb and keyword (150-160 chars)">
  <link rel="canonical" href="https://domain.com/">
  <meta name="robots" content="index, follow">

  <!-- Open Graph (Facebook, LinkedIn, etc.) -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://domain.com/">
  <meta property="og:title" content="Product Name — Tagline">
  <meta property="og:description" content="155 char description">
  <meta property="og:image" content="https://domain.com/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Product Name">
  <meta property="og:locale" content="en_US">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://domain.com/">
  <meta name="twitter:title" content="Product Name — Tagline">
  <meta name="twitter:description" content="155 char description">
  <meta name="twitter:image" content="https://domain.com/og-image.png">
  <meta name="twitter:creator" content="@handle">

  <!-- Theme -->
  <meta name="theme-color" content="#5e60ce">
  <meta name="color-scheme" content="dark">

  <!-- Icons -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.webmanifest">

  <!-- Fonts (preconnect for performance) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
</head>
```

## Structured Data (JSON-LD)

### Software Application
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Product Name",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Web",
  "description": "Product description",
  "url": "https://domain.com",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Organization",
    "name": "Author",
    "url": "https://github.com/author"
  }
}
</script>
```

### FAQ Page
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question text?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer text"
      }
    }
  ]
}
</script>
```

## robots.txt

```
User-agent: *
Allow: /
Sitemap: https://domain.com/sitemap.xml
```

## sitemap.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://domain.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

## OG Image Specs

- **Size**: 1200x630px
- **Format**: PNG (for compatibility) or JPG
- **Text**: Product name + tagline, readable at 200px width
- **Background**: Brand dark color
- **Logo**: Centered or top-left
- **File size**: < 300KB
