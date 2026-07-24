# i18n Follow-ups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add cross-language SEO tags, silent browser-language auto-detection, and a bilingual 404 page on top of the already-working ES/EN bilingual site.

**Architecture:** Three additive, client-side/build-time features layered onto the existing `src/i18n/utils.ts` helpers (`useTranslations`, `localizePath`, `switchLangPath`) and `src/i18n/ui.ts` dictionary. No server/adapter change — the site stays `output: "static"`. A new small module, `src/i18n/detect.ts`, centralizes the `localStorage`-backed language-preference logic shared by the auto-redirect script, the Navbar switcher, and the 404 page.

**Tech Stack:** Astro 7 (`.astro` components, TS frontmatter, inline `<script type="module">`), no new dependencies.

## Global Constraints

- No new dependencies. Do not add a test runner, HTTP client, or any package not already in `package.json` — ask first if one seems needed (per project CLAUDE.md).
- This project has **no test runner configured** (`package.json` has only the `astro` CLI) and **is not a git repository**. Per the approved spec's own Testing section, verification for every task is `pnpm build` + a manual browser/devtools check — there are no "write a failing test" steps in this plan, and no git commit steps (nothing to commit to).
- Design tokens live in `src/styles/global.css` — don't hardcode new colors/spacing; reuse existing CSS variables and components (`Button`, `Card`, etc.) as the rest of the site does.
- `site: 'https://synthetix.ai'` in `astro.config.mjs` is a **placeholder** domain (no production domain chosen yet, per user) — it's isolated to one line so it's a one-line swap later.
- Follow the existing i18n patterns exactly: `Lang` = `'es' | 'en'`, `defaultLang = 'es'`, translation keys added to **both** `es` and `en` blocks in `src/i18n/ui.ts`, page copy always goes through `t('key')`, never hardcoded strings in page components.

---

### Task 1: Cross-language SEO tags (canonical, hreflang, og:locale)

**Files:**
- Modify: `astro.config.mjs`
- Modify: `src/layouts/Layout.astro`

**Interfaces:**
- Consumes: `switchLangPath(path: string, targetLang: Lang): string` from `src/i18n/utils.ts` (already exists, unchanged).
- Produces: nothing new consumed by later tasks — this task is self-contained.

- [ ] **Step 1: Set the production `site` URL in `astro.config.mjs`**

Replace the full file contents:

```js
// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Placeholder domain — swap for the real production domain once it's chosen.
  // Required so hreflang/canonical/og:url tags can resolve absolute URLs.
  site: 'https://synthetix.ai',
});
```

- [ ] **Step 2: Add computed URL/locale values to `Layout.astro`'s frontmatter**

In `src/layouts/Layout.astro`, replace the frontmatter block:

```astro
---
import { ClientRouter } from 'astro:transitions';
import '../styles/global.css';
import Navbar from '../components/Navbar.astro';
import Footer from '../components/Footer.astro';
import { useTranslations, type Lang } from '../i18n/utils';

interface Props {
  title: string;
  lang: Lang;
  description?: string;
}
const { title, lang } = Astro.props;
const t = useTranslations(lang);
const description = Astro.props.description ?? t('footer.tagline');
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

- [ ] **Step 3: Add the tags to `<head>`**

Replace:

```astro
    <meta name="description" content={description} />
    <title>{title} — Synthetix AI</title>

    <!-- Design-system type families: Montserrat (display), Inter (body/UI), JetBrains Mono (code/data) -->
```

with:

```astro
    <meta name="description" content={description} />
    <title>{title} — Synthetix AI</title>

    <link rel="canonical" href={canonicalHref} />
    <link rel="alternate" hreflang="es" href={esHref} />
    <link rel="alternate" hreflang="en" href={enHref} />
    <link rel="alternate" hreflang="x-default" href={esHref} />
    <meta property="og:locale" content={ogLocale[lang]} />
    <meta property="og:locale:alternate" content={ogLocale[lang === 'es' ? 'en' : 'es']} />

    <!-- Design-system type families: Montserrat (display), Inter (body/UI), JetBrains Mono (code/data) -->
```

- [ ] **Step 4: Build and verify**

Run: `pnpm build`
Expected: `14 page(s) built` with no errors (same as before this change — this task doesn't add or remove pages).

- [ ] **Step 5: Manual verification of the tags**

Using the Grep tool (or `Select-String` in PowerShell), confirm:
- `dist/index.html` contains `rel="canonical"` with an `href` ending in `/` (the ES root), and `hreflang="en"` with an `href` ending in `/en/`.
- `dist/en/servicios/index.html` contains `rel="canonical"` with an `href` ending in `/en/servicios/`, and `hreflang="es"` with an `href` ending in `/servicios/`.
- Both files contain `hreflang="x-default"`.
- `dist/index.html` contains `content="es_ES"` for `og:locale` and `content="en_US"` for `og:locale:alternate`; `dist/en/index.html` has them swapped.

---

### Task 2: Language-detection module + silent auto-redirect

**Files:**
- Create: `src/i18n/detect.ts`
- Modify: `src/layouts/Layout.astro`

**Interfaces:**
- Consumes: `Lang`, `defaultLang` from `src/i18n/ui.ts`; `switchLangPath` from `src/i18n/utils.ts`.
- Produces (for Task 3 and Task 4 to consume):
  - `getStoredLang(): Lang | null`
  - `setStoredLang(lang: Lang): void`
  - `browserLang(): Lang`
  - `resolveDisplayLang(): Lang`

- [ ] **Step 1: Create `src/i18n/detect.ts`**

```ts
import type { Lang } from './ui';

const STORAGE_KEY = 'sx-lang';

function isLang(value: string | null): value is Lang {
  return value === 'es' || value === 'en';
}

/** Returns the visitor's stored language preference, if any. */
export function getStoredLang(): Lang | null {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isLang(stored) ? stored : null;
}

/** Persists an explicit language choice so auto-detection never overrides it. */
export function setStoredLang(lang: Lang): void {
  window.localStorage.setItem(STORAGE_KEY, lang);
}

/** Best-guess language from the browser's language settings. Only 'es'/'en' are supported. */
export function browserLang(): Lang {
  return navigator.language.toLowerCase().startsWith('en') ? 'en' : 'es';
}

/**
 * Resolves which language to display for the current page, in priority order:
 * URL prefix (if already under /en), then stored preference, then browser language.
 * Used by pages that render both languages at once (e.g. the 404 page) to pick
 * which block to show — unlike the auto-redirect in Layout.astro, this never navigates.
 */
export function resolveDisplayLang(): Lang {
  if (window.location.pathname.startsWith('/en')) return 'en';
  return getStoredLang() ?? browserLang();
}
```

- [ ] **Step 2: Wire the silent redirect into `Layout.astro`**

In `src/layouts/Layout.astro`, replace:

```astro
    <script>
      // Scroll-reveal for elements marked [data-reveal], per motion spec:
      // fade + translateY, no bounce, 320ms.
      function initReveal() {
        const els = document.querySelectorAll('[data-reveal]');
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.15 }
        );
        els.forEach((el) => io.observe(el));
      }
      document.addEventListener('astro:page-load', initReveal);
    </script>
```

with:

```astro
    <script>
      // Scroll-reveal for elements marked [data-reveal], per motion spec:
      // fade + translateY, no bounce, 320ms.
      function initReveal() {
        const els = document.querySelectorAll('[data-reveal]');
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.15 }
        );
        els.forEach((el) => io.observe(el));
      }
      document.addEventListener('astro:page-load', initReveal);
    </script>

    <script>
      // Silent redirect: if the visitor has no stored language preference and
      // their browser reports English, send them to the /en equivalent of the
      // current page. Never overrides an explicit choice (see Navbar.astro).
      import { getStoredLang, browserLang } from '../i18n/detect';
      import { switchLangPath } from '../i18n/utils';

      function autoDetectLanguage() {
        const path = window.location.pathname;
        if (path.startsWith('/en')) return;
        if (getStoredLang()) return;
        if (browserLang() === 'en') {
          window.location.replace(switchLangPath(path, 'en'));
        }
      }
      document.addEventListener('astro:page-load', autoDetectLanguage);
    </script>
```

- [ ] **Step 3: Build and verify**

Run: `pnpm build`
Expected: `14 page(s) built` with no errors.

- [ ] **Step 4: Manual verification of the redirect**

Run `pnpm preview` (or `astro dev --background` per CLAUDE.md), open the site in a browser, open devtools console, and run:

```js
localStorage.clear();
Object.defineProperty(window.navigator, 'language', { get: () => 'en-US' });
```

Then navigate to `/` (reload the tab, not a soft navigation, so the override is in effect from load). Expected: the browser lands on `/en/`.

Next, still with the English override active, run `localStorage.setItem('sx-lang', 'es')` and reload `/`. Expected: it stays on `/`, no redirect (stored preference is respected).

---

### Task 3: Persist explicit language choice from the Navbar switcher

**Files:**
- Modify: `src/components/Navbar.astro`

**Interfaces:**
- Consumes: `setStoredLang(lang: Lang): void` from `src/i18n/detect.ts` (Task 2).

- [ ] **Step 1: Tag each switcher link with its language**

In `src/components/Navbar.astro`, replace:

```astro
      <div class="sx-lang" role="group" aria-label="Idioma / Language">
        {(Object.keys(languages) as Lang[]).map((l) => (
          <a
            href={switchLangPath(currentPath, l)}
            class:list={['sx-lang__btn', { 'is-active': l === lang }]}
            aria-current={l === lang ? 'true' : undefined}
          >{languages[l]}</a>
        ))}
      </div>
```

with:

```astro
      <div class="sx-lang" role="group" aria-label="Idioma / Language">
        {(Object.keys(languages) as Lang[]).map((l) => (
          <a
            href={switchLangPath(currentPath, l)}
            data-lang={l}
            class:list={['sx-lang__btn', { 'is-active': l === lang }]}
            aria-current={l === lang ? 'true' : undefined}
          >{languages[l]}</a>
        ))}
      </div>
```

- [ ] **Step 2: Add the click handler**

Replace:

```astro
<script>
  const burger = document.getElementById('sx-burger');
  const menu = document.getElementById('sx-mobile-menu');
  burger?.addEventListener('click', () => {
    menu?.classList.toggle('is-open');
    burger.classList.toggle('is-open');
  });
</script>
```

with:

```astro
<script>
  const burger = document.getElementById('sx-burger');
  const menu = document.getElementById('sx-mobile-menu');
  burger?.addEventListener('click', () => {
    menu?.classList.toggle('is-open');
    burger.classList.toggle('is-open');
  });
</script>

<script>
  // Persist an explicit language choice so Layout's auto-redirect never
  // overrides a deliberate click on the ES/EN switcher.
  import { setStoredLang } from '../i18n/detect';
  import type { Lang } from '../i18n/utils';

  function initLangSwitcher() {
    document.querySelectorAll<HTMLAnchorElement>('.sx-lang__btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const chosen = btn.dataset.lang;
        if (chosen === 'es' || chosen === 'en') setStoredLang(chosen as Lang);
      });
    });
  }
  document.addEventListener('astro:page-load', initLangSwitcher);
</script>
```

- [ ] **Step 3: Build and verify**

Run: `pnpm build`
Expected: `14 page(s) built` with no errors.

- [ ] **Step 4: Manual verification**

In the browser with devtools open, click the "EN" pill in the nav. In the Application/Storage tab, confirm `localStorage` now has `sx-lang: en`. Click "ES", confirm it updates to `sx-lang: es`.

---

### Task 4: Bilingual 404 page

**Files:**
- Modify: `src/i18n/ui.ts`
- Create: `src/pages/404.astro`

**Interfaces:**
- Consumes: `resolveDisplayLang(): Lang` from `src/i18n/detect.ts` (Task 2); `useTranslations`, `type Lang` from `src/i18n/utils.ts`; `Layout` and `Button` components.

- [ ] **Step 1: Add 404 copy keys to the `es` block of `src/i18n/ui.ts`**

Replace:

```ts
    'contact.form.submit': 'Enviar mensaje',
  },
```

with:

```ts
    'contact.form.submit': 'Enviar mensaje',

    // ---- 404 ----
    '404.eyebrow': 'Error 404',
    '404.title': 'Página no encontrada',
    '404.lead': 'La página que buscas no existe o fue movida.',
    '404.cta': 'Volver al inicio',
  },
```

- [ ] **Step 2: Add the matching keys to the `en` block**

Replace:

```ts
    'contact.form.submit': 'Send message',
  },
} as const;
```

with:

```ts
    'contact.form.submit': 'Send message',

    // ---- 404 ----
    '404.eyebrow': '404 Error',
    '404.title': 'Page not found',
    '404.lead': "The page you're looking for doesn't exist or has moved.",
    '404.cta': 'Back to home',
  },
} as const;
```

- [ ] **Step 3: Create `src/pages/404.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import Button from '../components/Button.astro';
import { useTranslations } from '../i18n/utils';

const tEs = useTranslations('es');
const tEn = useTranslations('en');
---
<Layout title={tEs('404.title')} lang="es">
  <section class="not-found grain-surface">
    <div class="container">
      <div data-lang-block="es">
        <span class="eyebrow">{tEs('404.eyebrow')}</span>
        <h1>{tEs('404.title')}</h1>
        <p class="lead">{tEs('404.lead')}</p>
        <Button href="/">{tEs('404.cta')}</Button>
      </div>
      <div data-lang-block="en" hidden>
        <span class="eyebrow">{tEn('404.eyebrow')}</span>
        <h1>{tEn('404.title')}</h1>
        <p class="lead">{tEn('404.lead')}</p>
        <Button href="/en/">{tEn('404.cta')}</Button>
      </div>
    </div>
  </section>
</Layout>

<script>
  // The site is fully static, so the deployed 404.html is served for any
  // unmatched path under either /  or /en — this script picks which
  // language block to show based on the actual URL the visitor hit.
  import { resolveDisplayLang } from '../i18n/detect';

  const lang = resolveDisplayLang();
  document.documentElement.lang = lang;
  document.querySelector('[data-lang-block="es"]')?.toggleAttribute('hidden', lang !== 'es');
  document.querySelector('[data-lang-block="en"]')?.toggleAttribute('hidden', lang !== 'en');
</script>

<style>
  .not-found { padding-top: var(--sx-space-24); padding-bottom: var(--sx-space-24); text-align: center; }
  .not-found .container { max-width: 480px; }
  .not-found .lead { margin: var(--sx-space-4) 0 var(--sx-space-8); }
</style>
```

- [ ] **Step 4: Build and verify**

Run: `pnpm build`
Expected: `15 page(s) built` (14 existing + `/404/index.html` or `/404.html` — confirm the exact output path in the build log) with no errors.

- [ ] **Step 5: Manual verification**

Run `pnpm preview`, then in the browser visit a nonexistent path directly, e.g. `http://localhost:4321/nope` — expected: Spanish 404 content ("Página no encontrada"), with the button linking to `/`. Then visit `http://localhost:4321/en/nope` — expected: English 404 content ("Page not found"), button linking to `/en/`.

Also confirm via devtools that `document.documentElement.lang` matches the visible block (`"es"` or `"en"`) on each.

---

### Task 5: Fix inconsistent tablet-breakpoint collapse on two 3-item grids

**Context:** Reviewing responsive behavior across the site (CLAUDE.md's "revisar responsive fino en breakpoints intermedios" item) turned up one concrete, recurring gap: every "3-card grid" on the site steps 3 → 2 → 1 columns as the viewport narrows (`why-grid` in `HomePage.astro`, `industry-grid` in `IndustriasPage.astro`, `case-grid` in `CasosPage.astro`, all via a `900px` then `560px` breakpoint pair) — except two, which jump straight from 3 columns to 1 at `900px` with no 2-column step: `.hero__stats` (the 3 hero `StatCard`s) in `HomePage.astro`, and `.grid-3` (the 3 "Cómo trabajamos" steps) in `NosotrosPage.astro`. On tablet-width viewports (roughly 561–900px) this makes both sections stack unnecessarily tall compared to every other 3-item grid on the site. This is a CSS-only fix, unrelated to the i18n work in Tasks 1–4, folded into this plan per user request.

**Files:**
- Modify: `src/components/pages/HomePage.astro`
- Modify: `src/components/pages/NosotrosPage.astro`

**Interfaces:** None — pure CSS, no new props or exports.

- [ ] **Step 1: Give `.hero__stats` a 2-column tablet step**

In `src/components/pages/HomePage.astro`, replace:

```astro
  @media (max-width: 900px) {
    .hero__stats { grid-template-columns: 1fr; }
    .paths-grid { grid-template-columns: 1fr; }
    .why-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 560px) {
    .why-grid { grid-template-columns: 1fr; }
  }
```

with:

```astro
  @media (max-width: 900px) {
    .hero__stats { grid-template-columns: 1fr 1fr; }
    .hero__stats > :last-child { grid-column: 1 / -1; }
    .paths-grid { grid-template-columns: 1fr; }
    .why-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 560px) {
    .hero__stats { grid-template-columns: 1fr; }
    .why-grid { grid-template-columns: 1fr; }
  }
```

(The third stat card spans both columns at the 2-column step so it doesn't sit orphaned in a half-empty row.)

- [ ] **Step 2: Give `.grid-3` the same treatment**

In `src/components/pages/NosotrosPage.astro`, replace:

```astro
  @media (max-width: 900px) { .grid-3 { grid-template-columns: 1fr; } }
```

with:

```astro
  @media (max-width: 900px) {
    .grid-3 { grid-template-columns: 1fr 1fr; }
    .grid-3 > :last-child { grid-column: 1 / -1; }
  }
  @media (max-width: 560px) {
    .grid-3 { grid-template-columns: 1fr; }
  }
```

- [ ] **Step 3: Build and verify**

Run: `pnpm build`
Expected: `14 page(s) built` (or `15` if run after Task 4) with no errors.

- [ ] **Step 4: Manual verification**

With `pnpm preview` (or the running dev server) open in a browser, resize the window (or use devtools device toolbar) between 561px and 900px wide:
- On `/` (home), confirm the 3 hero stat cards show as 2 columns with the 3rd card spanning the full width below.
- On `/nosotros` (`#como-trabajamos`), confirm the 3 "Cómo trabajamos" cards show the same 2-then-full-width pattern.

Below 560px, confirm both grids collapse to a single column, matching `why-grid`/`industry-grid`/`case-grid` at the same width.

---

## Self-Review Notes

- **Spec coverage:** Task 1 → spec §1 (SEO tags). Tasks 2+3 → spec §2 (auto-detect: redirect logic in Task 2, persistence-on-click in Task 3, matching the spec's explicit split between detection and an explicit user action). Task 4 → spec §3 (bilingual 404, single root page per the Vercel-hosting constraint, same detection precedence). Task 5 is outside the original spec's scope (spec covered i18n only) — added directly per an explicit mid-session request to review responsive behavior; it's small and self-contained enough not to warrant a separate spec/brainstorm cycle.
- **Placeholder scan:** No TBD/TODO markers; the one intentional placeholder (`site` domain) is called out explicitly as a business decision, not a missing plan detail, and is a single line to change later.
- **Type consistency:** `Lang` type flows from `src/i18n/ui.ts` through `utils.ts` and the new `detect.ts` without redefinition. Function names (`getStoredLang`, `setStoredLang`, `browserLang`, `resolveDisplayLang`) are used identically in Tasks 2–4. `switchLangPath` and `useTranslations` signatures match their existing definitions in `src/i18n/utils.ts` — unchanged.
