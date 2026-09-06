# SEO Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the site's technical SEO gaps — wrong production domain, no robots.txt/sitemap, duplicate generic meta descriptions, no Open Graph/Twitter cards, no structured data — per the approved spec at `docs/superpowers/specs/2026-09-06-seo-improvements-design.md`.

**Architecture:** Pure Astro/content changes, no new dependencies besides `@astrojs/sitemap`. All new copy (meta descriptions) is added to the existing `src/i18n/ui.ts` dictionary and threaded through the existing `<Layout description={...}>` prop. Open Graph/Twitter/JSON-LD are added directly to `src/layouts/Layout.astro`, derived from props already computed there (`title`, `description`, `canonicalHref`).

**Tech Stack:** Astro 7, TypeScript, `@astrojs/sitemap`, pnpm.

## Global Constraints

- Production domain is `https://www.synthetixaisas.com` — fixed for all builds, including Vercel previews (per spec section 1).
- All new meta descriptions must use plain, benefit-oriented language with no technical jargon (no "pipeline", "arquitectura de sistemas", "agentes" as a selling point) — the marketing plan's buyer persona is a non-technical PyME owner/manager who expects simple language (per spec section 3 and later user guidance).
- JSON-LD must NOT include a `sameAs` field — the footer's social links are still placeholders (`href="#"`), and declaring fake profile URLs would be worse than omitting them (per spec section 5).
- OG/Twitter image uses the existing `src/assets/logo-lockup.png` (316×133px) — a stand-in until a dedicated 1200×630 banner exists (per spec section 4). Do not create or source a new image.
- No test framework exists in this repo (no test script in `package.json`). Verification is done via `pnpm astro check` (type-checking) and `pnpm build` + inspecting the built output in `dist/client/`.

---

### Task 1: Fix the production domain

**Files:**
- Modify: `astro.config.mjs`

**Interfaces:**
- Produces: `Astro.site` resolves to `https://www.synthetixaisas.com` everywhere in the codebase (used by `Layout.astro` for canonical/hreflang, and by the sitemap integration added in Task 3).

- [ ] **Step 1: Update the `site` value**

In `astro.config.mjs`, replace:

```js
// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // Placeholder domain — swap for the real production domain once it's chosen.
  // Required so hreflang/canonical/og:url tags can resolve absolute URLs.
  site: 'https://synthetix.ai',

  adapter: vercel(),
});
```

with:

```js
// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.synthetixaisas.com',

  adapter: vercel(),
});
```

- [ ] **Step 2: Verify the build picks it up**

Run: `pnpm build`
Expected: build succeeds; open `dist/client/index.html` and confirm `<link rel="canonical" href="https://www.synthetixaisas.com/">` is present (not `synthetix.ai`).

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs
git commit -m "fix: set real production domain for canonical/hreflang URLs"
```

---

### Task 2: Add robots.txt

**Files:**
- Create: `public/robots.txt`

**Interfaces:**
- Produces: `/robots.txt` served as a static file at the site root, referencing the sitemap URL that Task 3 will generate.

- [ ] **Step 1: Create the file**

```
User-agent: *
Allow: /

Sitemap: https://www.synthetixaisas.com/sitemap-index.xml
```

- [ ] **Step 2: Verify it's copied into the build output**

Run: `pnpm build`
Expected: `dist/client/robots.txt` exists and contains the same content (Astro copies everything under `public/` verbatim).

- [ ] **Step 3: Commit**

```bash
git add public/robots.txt
git commit -m "feat: add robots.txt"
```

---

### Task 3: Add sitemap generation

**Files:**
- Modify: `package.json` (new dependency, via pnpm)
- Modify: `astro.config.mjs`

**Interfaces:**
- Consumes: `Astro.site` from Task 1.
- Produces: `dist/client/sitemap-index.xml` and `dist/client/sitemap-0.xml` at build time, listing every static page except `404`.

- [ ] **Step 1: Install the integration**

Run: `pnpm add @astrojs/sitemap`
Expected: `@astrojs/sitemap` appears under `dependencies` in `package.json` and `pnpm-lock.yaml` updates.

- [ ] **Step 2: Register the integration**

In `astro.config.mjs`, replace:

```js
// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.synthetixaisas.com',

  adapter: vercel(),
});
```

with:

```js
// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.synthetixaisas.com',

  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],

  adapter: vercel(),
});
```

- [ ] **Step 3: Verify the sitemap is generated**

Run: `pnpm build`
Expected: `dist/client/sitemap-index.xml` and `dist/client/sitemap-0.xml` exist. Open `dist/client/sitemap-0.xml` and confirm it lists URLs like `https://www.synthetixaisas.com/` and `https://www.synthetixaisas.com/en/` but NOT anything containing `/404`.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml astro.config.mjs
git commit -m "feat: generate sitemap.xml via @astrojs/sitemap"
```

---

### Task 4: Add per-page meta descriptions to the i18n dictionary

**Files:**
- Modify: `src/i18n/ui.ts`

**Interfaces:**
- Produces: 9 new `UiKey` string keys (one per page), each present in both `ui.es` and `ui.en`, ready to be consumed via `t('<page>.meta.description')`. Keys: `home.meta.description`, `sv.meta.description`, `ind.meta.description`, `about.meta.description`, `cases.meta.description`, `car.meta.description`, `contact.meta.description`, `legal.privacy.meta.description`, `legal.terms.meta.description`.

- [ ] **Step 1: Add the Spanish descriptions**

In `src/i18n/ui.ts`, in the `es` block, insert one line directly after each `*.meta.title` line:

After `'home.meta.title': 'Desarrollo de Sistemas de IA',` (line 58) add:
```ts
    'home.meta.description': 'Desarrollamos software y soluciones de inteligencia artificial para empresas — de la idea a un sistema que funciona, explicado en lenguaje simple.',
```

After `'sv.meta.title': 'Servicios',` (line 123) add:
```ts
    'sv.meta.description': 'Software a la medida, automatización con inteligencia artificial y equipos dedicados para tu empresa — servicios claros, sin tecnicismos innecesarios.',
```

After `'ind.meta.title': 'Industrias',` (line 153) add:
```ts
    'ind.meta.description': 'Soluciones de software e inteligencia artificial para salud, finanzas, logística, construcción y más — adaptadas a los retos reales de cada sector.',
```

After `'about.meta.title': 'Nosotros',` (line 170) add:
```ts
    'about.meta.description': 'Conoce al equipo detrás de Synthetix AI: más de una década desarrollando software e inteligencia artificial para empresas, con un trato cercano y transparente.',
```

After `'cases.meta.title': 'Casos de Éxito',` (line 195) add:
```ts
    'cases.meta.description': 'Casos reales de software e inteligencia artificial que hemos construido para nuestros clientes — resultados concretos, no promesas genéricas.',
```

After `'car.meta.title': 'Carreras',` (line 213) add:
```ts
    'car.meta.description': 'Únete a Synthetix AI: buscamos ingenieros y arquitectos para construir software e inteligencia artificial junto a un equipo remoto en Colombia.',
```

After `'contact.meta.title': 'Contacto',` (line 225) add:
```ts
    'contact.meta.description': 'Cuéntanos qué necesita tu empresa — un ingeniero de Synthetix AI te responde en menos de 24 horas para hablar de tu proyecto.',
```

After `'legal.privacy.meta.title': 'Política de Privacidad',` (line 252) add:
```ts
    'legal.privacy.meta.description': 'Política de privacidad de Synthetix AI S.A.S.: cómo recolectamos, usamos y protegemos tus datos personales, conforme a la ley colombiana.',
```

After `'legal.terms.meta.title': 'Términos de Servicio',` (line 273) add:
```ts
    'legal.terms.meta.description': 'Términos de servicio de Synthetix AI S.A.S.: condiciones de uso de este sitio web y de la información sobre nuestros servicios.',
```

- [ ] **Step 2: Add the English descriptions**

In the `en` block, insert one line directly after each `*.meta.title` line:

After `'home.meta.title': 'AI Systems Development',` (line 349) add:
```ts
    'home.meta.description': 'We build software and AI solutions for growing businesses — from idea to working system, explained in plain language, not jargon.',
```

After `'sv.meta.title': 'Services',` (line 413) add:
```ts
    'sv.meta.description': 'Custom software, AI automation, and dedicated teams for your business — clear services built around results, not technical buzzwords.',
```

After `'ind.meta.title': 'Industries',` (line 443) add:
```ts
    'ind.meta.description': "Software and AI solutions for healthcare, finance, logistics, construction, and more — tailored to each industry's real challenges.",
```

After `'about.meta.title': 'About Us',` (line 460) add:
```ts
    'about.meta.description': 'Meet the team behind Synthetix AI: over a decade building software and AI for businesses, with a close, transparent way of working.',
```

After `'cases.meta.title': 'Case Studies',` (line 485) add:
```ts
    'cases.meta.description': "Real software and AI projects we've built for our clients — concrete results, not generic promises.",
```

After `'car.meta.title': 'Careers',` (line 503) add:
```ts
    'car.meta.description': "Join Synthetix AI: we're hiring engineers and architects to build software and AI alongside a remote team based in Colombia.",
```

After `'contact.meta.title': 'Contact',` (line 515) add:
```ts
    'contact.meta.description': 'Tell us what your business needs — a Synthetix AI engineer replies within 24 hours to talk about your project.',
```

After `'legal.privacy.meta.title': 'Privacy Policy',` (line 542) add:
```ts
    'legal.privacy.meta.description': 'Synthetix AI S.A.S. privacy policy: how we collect, use, and protect your personal data under Colombian law.',
```

After `'legal.terms.meta.title': 'Terms of Service',` (line 563) add:
```ts
    'legal.terms.meta.description': 'Synthetix AI S.A.S. terms of service: the conditions for using this website and the information about our services.',
```

- [ ] **Step 3: Type-check**

Run: `pnpm astro check`
Expected: no errors. This confirms `ui.es` and `ui.en` are both still valid `as const` objects (no stray syntax from the inserted lines).

- [ ] **Step 4: Commit**

```bash
git add src/i18n/ui.ts
git commit -m "feat: add unique per-page meta descriptions (es/en)"
```

---

### Task 5: Wire the new descriptions into every page

**Files:**
- Modify: `src/components/pages/CarrerasPage.astro:15`
- Modify: `src/components/pages/CasosPage.astro:22`
- Modify: `src/components/pages/ContactoPage.astro:16`
- Modify: `src/components/pages/HomePage.astro:33`
- Modify: `src/components/pages/IndustriasPage.astro:25`
- Modify: `src/components/pages/NosotrosPage.astro:34`
- Modify: `src/components/pages/PrivacidadPage.astro:21`
- Modify: `src/components/pages/ServiciosPage.astro:46`
- Modify: `src/components/pages/TerminosPage.astro:22`

**Interfaces:**
- Consumes: the 9 `UiKey`s produced in Task 4.
- Produces: every `<Layout>` call now receives an explicit `description` prop, so `Layout.astro`'s `footer.tagline` fallback is no longer used by any page.

- [ ] **Step 1: Update each page's `<Layout>` call**

`CarrerasPage.astro:15` — replace:
```astro
<Layout title={t('car.meta.title')} lang={lang}>
```
with:
```astro
<Layout title={t('car.meta.title')} description={t('car.meta.description')} lang={lang}>
```

`CasosPage.astro:22` — replace:
```astro
<Layout title={t('cases.meta.title')} lang={lang}>
```
with:
```astro
<Layout title={t('cases.meta.title')} description={t('cases.meta.description')} lang={lang}>
```

`ContactoPage.astro:16` — replace:
```astro
<Layout title={t('contact.meta.title')} lang={lang}>
```
with:
```astro
<Layout title={t('contact.meta.title')} description={t('contact.meta.description')} lang={lang}>
```

`HomePage.astro:33` — replace:
```astro
<Layout title={t('home.meta.title')} lang={lang}>
```
with:
```astro
<Layout title={t('home.meta.title')} description={t('home.meta.description')} lang={lang}>
```

`IndustriasPage.astro:25` — replace:
```astro
<Layout title={t('ind.meta.title')} lang={lang}>
```
with:
```astro
<Layout title={t('ind.meta.title')} description={t('ind.meta.description')} lang={lang}>
```

`NosotrosPage.astro:34` — replace:
```astro
<Layout title={t("about.meta.title")} lang={lang}>
```
with:
```astro
<Layout title={t("about.meta.title")} description={t("about.meta.description")} lang={lang}>
```

`PrivacidadPage.astro:21` — replace:
```astro
<Layout title={t('legal.privacy.meta.title')} lang={lang}>
```
with:
```astro
<Layout title={t('legal.privacy.meta.title')} description={t('legal.privacy.meta.description')} lang={lang}>
```

`ServiciosPage.astro:46` — replace:
```astro
<Layout title={t('sv.meta.title')} lang={lang}>
```
with:
```astro
<Layout title={t('sv.meta.title')} description={t('sv.meta.description')} lang={lang}>
```

`TerminosPage.astro:22` — replace:
```astro
<Layout title={t('legal.terms.meta.title')} lang={lang}>
```
with:
```astro
<Layout title={t('legal.terms.meta.title')} description={t('legal.terms.meta.description')} lang={lang}>
```

- [ ] **Step 2: Type-check**

Run: `pnpm astro check`
Expected: no errors — confirms every `t('<key>.meta.description')` call matches a real `UiKey` from Task 4.

- [ ] **Step 3: Build and spot-check**

Run: `pnpm build`
Expected: in `dist/client/servicios/index.html` and `dist/client/casos-de-exito/index.html`, the `<meta name="description">` content differs between the two files (and neither equals the old generic tagline "Diseñamos e implementamos sistemas de IA que se integran a tu stack...").

- [ ] **Step 4: Commit**

```bash
git add src/components/pages/CarrerasPage.astro src/components/pages/CasosPage.astro src/components/pages/ContactoPage.astro src/components/pages/HomePage.astro src/components/pages/IndustriasPage.astro src/components/pages/NosotrosPage.astro src/components/pages/PrivacidadPage.astro src/components/pages/ServiciosPage.astro src/components/pages/TerminosPage.astro
git commit -m "feat: pass unique meta description into every page"
```

---

### Task 6: Add Open Graph and Twitter Card tags

**Files:**
- Modify: `src/layouts/Layout.astro`

**Interfaces:**
- Consumes: `title`, `description`, `canonicalHref` (already computed in `Layout.astro`'s frontmatter, lines 13-21).
- Produces: `ogImageHref` and `fullTitle` variables, reused by Task 7's JSON-LD block.

- [ ] **Step 1: Import the logo and compute the derived values**

In `src/layouts/Layout.astro`, replace the frontmatter block:

```astro
---
import { ClientRouter } from 'astro:transitions';
import '../styles/global.css';
import Navbar from '../components/Navbar.astro';
import Footer from '../components/Footer.astro';
import { useTranslations, switchLangPath, type Lang } from '../i18n/utils';

interface Props {
  title: string;
  lang: Lang;
  description?: string;
}
const { title, lang } = Astro.props;
const t = useTranslations(lang);
const description = Astro.props.description ?? t('footer.tagline');

const currentPath = Astro.url.pathname;
const esHref = new URL(switchLangPath(currentPath, 'es'), Astro.site).toString();
const enHref = new URL(switchLangPath(currentPath, 'en'), Astro.site).toString();
const canonicalHref = lang === 'es' ? esHref : enHref;
const ogLocale = { es: 'es_ES', en: 'en_US' } as const satisfies Record<Lang, string>;
---
```

with:

```astro
---
import { ClientRouter } from 'astro:transitions';
import '../styles/global.css';
import Navbar from '../components/Navbar.astro';
import Footer from '../components/Footer.astro';
import { useTranslations, switchLangPath, type Lang } from '../i18n/utils';
import logoLockup from '../assets/logo-lockup.png';

interface Props {
  title: string;
  lang: Lang;
  description?: string;
}
const { title, lang } = Astro.props;
const t = useTranslations(lang);
const description = Astro.props.description ?? t('footer.tagline');

const currentPath = Astro.url.pathname;
const esHref = new URL(switchLangPath(currentPath, 'es'), Astro.site).toString();
const enHref = new URL(switchLangPath(currentPath, 'en'), Astro.site).toString();
const canonicalHref = lang === 'es' ? esHref : enHref;
const ogLocale = { es: 'es_ES', en: 'en_US' } as const satisfies Record<Lang, string>;

const fullTitle = `${title} — Synthetix AI`;
const ogImageHref = new URL(logoLockup.src, Astro.site).toString();
---
```

- [ ] **Step 2: Use `fullTitle` in `<title>` and add the OG/Twitter tags**

Replace:

```astro
    <meta name="description" content={description} />
    <title>{title} — Synthetix AI</title>

    <link rel="canonical" href={canonicalHref} />
    <link rel="alternate" hreflang="es" href={esHref} />
    <link rel="alternate" hreflang="en" href={enHref} />
    <link rel="alternate" hreflang="x-default" href={esHref} />
    <meta property="og:locale" content={ogLocale[lang]} />
    <meta property="og:locale:alternate" content={ogLocale[lang === 'es' ? 'en' : 'es']} />
```

with:

```astro
    <meta name="description" content={description} />
    <title>{fullTitle}</title>

    <link rel="canonical" href={canonicalHref} />
    <link rel="alternate" hreflang="es" href={esHref} />
    <link rel="alternate" hreflang="en" href={enHref} />
    <link rel="alternate" hreflang="x-default" href={esHref} />
    <meta property="og:locale" content={ogLocale[lang]} />
    <meta property="og:locale:alternate" content={ogLocale[lang === 'es' ? 'en' : 'es']} />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Synthetix AI" />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonicalHref} />
    <meta property="og:image" content={ogImageHref} />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={fullTitle} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImageHref} />
```

- [ ] **Step 3: Build and verify**

Run: `pnpm build`
Expected: `dist/client/index.html` contains `<meta property="og:image" content="https://www.synthetixaisas.com/_astro/logo-lockup...">` (Astro fingerprints the asset filename) and `<meta name="twitter:card" content="summary_large_image">`.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: add Open Graph and Twitter Card tags"
```

---

### Task 7: Add JSON-LD Organization structured data

**Files:**
- Modify: `src/layouts/Layout.astro`

**Interfaces:**
- Consumes: `ogImageHref` from Task 6.

- [ ] **Step 1: Add the JSON-LD object to the frontmatter**

Append to the end of `Layout.astro`'s frontmatter block (right after the `ogImageHref` line added in Task 6):

```astro
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Synthetix AI',
  legalName: 'Synthetix AI S.A.S.',
  taxID: '902069229-9',
  url: 'https://www.synthetixaisas.com',
  logo: ogImageHref,
  email: 'contact@synthetixaisas.com',
  telephone: '+57 314 806 7436',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Cra 21B # 55-25',
    addressLocality: 'Manizales',
    addressRegion: 'Caldas',
    addressCountry: 'CO',
  },
};
```

- [ ] **Step 2: Render the script tag**

In the `<head>`, immediately before the closing `</head>` tag (right after the `<ClientRouter />` line), add:

```astro
    <script type="application/ld+json" set:html={JSON.stringify(organizationJsonLd)} />
```

- [ ] **Step 3: Build and verify**

Run: `pnpm build`
Expected: `dist/client/index.html` contains a `<script type="application/ld+json">` tag whose content is valid JSON with `"@type":"Organization"`, `"taxID":"902069229-9"`, and no `sameAs` key anywhere in it.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: add Organization JSON-LD structured data"
```

---

### Task 8: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full type-check**

Run: `pnpm astro check`
Expected: 0 errors, 0 warnings related to files touched in this plan.

- [ ] **Step 2: Full production build**

Run: `pnpm build`
Expected: build completes without errors.

- [ ] **Step 3: Checklist against the spec**

Confirm each of the following in the `dist/client/` output:
- [ ] `dist/client/robots.txt` exists and its `Sitemap:` line points to `https://www.synthetixaisas.com/sitemap-index.xml`.
- [ ] `dist/client/sitemap-index.xml` exists and `dist/client/sitemap-0.xml` lists both `/` and `/en/` variants, with no `/404` entry.
- [ ] `dist/client/index.html` and `dist/client/en/index.html` each have a `<link rel="canonical">` pointing at `https://www.synthetixaisas.com/...`.
- [ ] At least 3 different pages in `dist/client/` (e.g. `index.html`, `servicios/index.html`, `nosotros/index.html`) have distinct `<meta name="description">` values.
- [ ] `dist/client/index.html` has `og:type`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image`, and all four `twitter:*` tags.
- [ ] `dist/client/index.html` has one `<script type="application/ld+json">` with `@type: Organization` and no `sameAs`.

- [ ] **Step 4: Clean up the local build**

Run: `pnpm preview` (optional manual spin-up) or simply leave `dist/client/` as-is — it's gitignored and not committed.

No commit for this task — it's verification-only. If any checklist item fails, fix it in the relevant task above and re-commit there.
