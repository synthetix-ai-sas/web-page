# SEO Improvements — Design

## Context

The site (`Layout.astro`) already has canonical URLs, hreflang alternates, and `og:locale` tags. What's missing:

- Production `site` in `astro.config.mjs` is a placeholder (`https://synthetix.ai`), not the real domain.
- No `robots.txt`, no `sitemap.xml`.
- Every page falls back to the same generic meta description (`footer.tagline`) — no page passes its own `description` prop to `Layout`.
- No Open Graph / Twitter Card tags.
- No structured data (JSON-LD).

Heading structure (one `<h1>` per page) and image `alt` attributes were checked and are already correct — out of scope.

## 1. Production domain

Update `astro.config.mjs`:

```js
site: 'https://www.synthetixaisas.com',
```

This is fixed for all builds, including Vercel previews. Canonical/hreflang/sitemap/OG should always point at production regardless of which URL a build was generated from; Vercel already sends `x-robots-tag: noindex` on preview deployments, so there's no indexing risk from previews carrying a production canonical.

## 2. robots.txt + sitemap.xml

- Add `public/robots.txt`:
  ```
  User-agent: *
  Allow: /

  Sitemap: https://www.synthetixaisas.com/sitemap-index.xml
  ```
- Install `@astrojs/sitemap` and register it in `astro.config.mjs` integrations. It generates `sitemap-index.xml`/`sitemap-0.xml` at build time from the existing static routes — no manual maintenance as pages are added.

## 3. Unique meta descriptions per page

Add `<page>.meta.description` keys to `src/i18n/ui.ts` for both `es` and `en`, one per page: home, servicios, industrias, nosotros, casos-de-exito, carreras, contacto, privacidad, terminos (9 pages × 2 langs = 18 strings). Each is ~150–160 characters, written from that page's actual content — not filler.

Each `src/components/pages/*.astro` passes the new key to its `<Layout>`:

```astro
<Layout title={t('home.meta.title')} description={t('home.meta.description')} lang={lang}>
```

`Layout.astro`'s existing `description` prop/fallback logic is unchanged — pages that don't pass one still fall back to `footer.tagline` (there won't be any left after this, but the fallback stays as a safety net).

## 4. Open Graph + Twitter Cards

In `Layout.astro`'s `<head>`, derived from the existing `title`, `description`, and `canonicalHref` values already computed there — no new props needed:

```html
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Synthetix AI" />
<meta property="og:title" content={`${title} — Synthetix AI`} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonicalHref} />
<meta property="og:image" content={new URL(logoLockup.src, Astro.site).toString()} />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={`${title} — Synthetix AI`} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={new URL(logoLockup.src, Astro.site).toString()} />
```

Uses `src/assets/logo-lockup.png` as a stand-in social-share image until a dedicated 1200×630 banner exists.

## 5. Structured data (JSON-LD)

Add one `<script type="application/ld+json">` block in `Layout.astro` with an `Organization` schema, using real legal/contact data already present in the codebase (`src/i18n/ui.ts` privacy/terms strings):

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Synthetix AI",
  "legalName": "Synthetix AI S.A.S.",
  "taxID": "902069229-9",
  "url": "https://www.synthetixaisas.com",
  "logo": "<absolute logo-lockup.png URL>",
  "email": "contact@synthetixaisas.com",
  "telephone": "+57 314 806 7436",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Cra 21B # 55-25",
    "addressLocality": "Manizales",
    "addressRegion": "Caldas",
    "addressCountry": "CO"
  }
}
```

`sameAs` (social profile URLs) is deliberately omitted: the footer's LinkedIn/X/GitHub links are placeholders (`href="#"`), and declaring fake profile URLs to search engines would be worse than omitting the field. Add `sameAs` once real social URLs exist.

## Out of scope

- Dedicated OG banner image (1200×630) — using the existing logo for now, per user decision.
- `sameAs` social links — blocked on real URLs.
- Content/copy strategy, keyword research, performance/Core Web Vitals work.
- Per-page structured data beyond Organization (e.g., `BreadcrumbList`, `JobPosting` for `/carreras`) — not requested, can be a follow-up.
