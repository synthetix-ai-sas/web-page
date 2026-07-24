# i18n Follow-ups: SEO cross-language tags, auto-detect, bilingual 404

## Context

The ES/EN bilingual foundation is already built and working: `src/i18n/ui.ts` holds
the full translation dictionary, every page has an `/en/` mirror
(`src/pages/en/**`), `src/i18n/utils.ts` provides `useTranslations`,
`localizePath`, and `switchLangPath`, and `Navbar.astro` has a working ES/EN
switcher pill. `pnpm build` compiles all 14 pages cleanly.

This spec covers three additive follow-ups the user asked to continue with:

1. Cross-language SEO tags (hreflang / canonical / og:locale)
2. Automatic language detection with a silent redirect on first visit
3. A bilingual 404 page

Site stays `output: "static"` (no adapter, no SSR) — all three features are
achievable client-side or at build time, consistent with the project's
deliberately light stack (no new dependencies).

## 1. Cross-language SEO tags

**`astro.config.mjs`**: add `site: 'https://synthetix.ai'` with a comment
marking it as a placeholder to replace once the real production domain is
chosen. `site` is required for Astro to resolve absolute URLs.

**`src/layouts/Layout.astro`**: in `<head>`, add:

- `<link rel="canonical" href={...}>` — absolute URL of the current page in
  the current language.
- `<link rel="alternate" hreflang="es" href={...}>` and
  `hreflang="en"` — absolute URLs of the ES and EN equivalents of the current
  page, built via the existing `switchLangPath` helper.
- `<link rel="alternate" hreflang="x-default" href={...}>` — points at the ES
  URL, since `es` is `defaultLang`.
- `<meta property="og:locale" content="es_ES">` (or `en_US`) for the current
  language, plus `<meta property="og:locale:alternate" content="...">` for
  the other one.

No new i18n logic — this is wiring existing `switchLangPath`/`localizePath`
output into meta tags, using `Astro.site` + `Astro.url.pathname` to build
absolute URLs.

## 2. Automatic language detection

Pure client-side, no server code:

- Inline script in `Layout.astro` (runs on `astro:page-load` alongside the
  existing scroll-reveal script, so it re-runs correctly across View
  Transition navigations — but the redirect check should only act once per
  session/visit, guarded by the stored preference so it doesn't loop).
- Logic: read `localStorage.getItem('sx-lang')`.
  - If a preference is stored, do nothing (respect it).
  - If not stored, and `navigator.language` starts with `en`, and the
    current path is not already under `/en`, redirect once via
    `location.replace(switchLangPath(currentPath, 'en'))`.
  - If not stored and browser language is not English, do nothing (ES is
    already the default, no redirect needed) — but still don't write
    anything to `localStorage` yet, so a later language change in the
    browser can still be picked up... **decision**: do NOT write a
    preference automatically just from detection — only writes happen from
    an explicit user action (see below). This keeps the check cheap
    (one `localStorage.getItem`, no `.setItem` on every load) and correct
    (a visitor who never touches the switcher keeps getting matched to
    their current browser language on each fresh visit, which is the
    desired behavior — "silent redirect", not "redirect once ever").
- `Navbar.astro`: the ES/EN switcher links get a `click` handler that calls
  `localStorage.setItem('sx-lang', <lang>)` before navigating, so a manual
  choice always sticks and is never overridden by auto-detect again.

## 3. Bilingual 404 page

- Single `src/pages/404.astro` at the project root (Vercel static hosting
  serves one root `404.html` regardless of the requested path's prefix, so
  per-folder 404s aren't viable here).
- Page renders both an ES block and an EN block (full 404 content: heading,
  message, link home) styled with the existing design system components
  (`Layout`, `Button`, etc.) — `Layout` needs *a* `lang` prop, so the page
  defaults it to `'es'` for the shell (`<html lang>`, nav/footer chrome) and
  only the swappable body content differs between the two blocks.
- Inline script toggles visibility between the two blocks based on, in
  priority order: (1) `window.location.pathname` starting with `/en`, (2)
  stored `sx-lang` preference, (3) `navigator.language` — same precedence as
  the auto-detect logic in #2, applied once on load (no redirect here, just
  content selection, since the 404 page is often reached from a genuinely
  broken/mistyped URL where redirecting further would compound the
  confusion).

## Testing

- `pnpm build` continues to produce all pages without errors.
- Manual check: view page source for hreflang/canonical tags on both an ES
  and EN page.
- Manual check in browser devtools: override `navigator.language`, clear
  `localStorage`, confirm redirect fires once from `/` to `/en/` and not
  from `/en/` itself; confirm it stops firing after visiting the switcher.
- Manual check: visit a nonexistent path under `/` and under `/en/`, confirm
  the 404 page shows the right language content in each case.
