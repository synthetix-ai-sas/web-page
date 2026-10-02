# AGENTS.md

Instructions for any AI coding agent working in this repository.

## Context

Marketing/corporate site for Synthetix AI (synthetixaisas.com), built with
Astro 7 and deployed on Vercel (via `@astrojs/vercel`). Bilingual: Spanish
is the default locale (unprefixed routes), English lives under `/en`.
Includes a contact form backed by a server API route that sends email via
Resend, and a blog backed by Astro Content Collections.

**Site map (ES canonical slug → EN slug):**

| Section | ES route | EN route | Notes |
|---|---|---|---|
| Home | `/` | `/en/` | |
| Servicios | `/servicios` | `/en/services` | 3 offerings: desarrollo+nube, agentes de IA, consultoría de procesos |
| Industrias | `/industrias` | `/en/industries` | 9 industry cards, plain nav link (no dropdown) |
| Productos | `/productos` | `/en/products` | 2 placeholder products |
| Nosotros | `/nosotros` | `/en/about` | How we work, Mission/Vision, Team, FAQ |
| Blog | `/blog` (+ `/blog/<id>`) | `/en/blog` (+ `/en/blog/<id>`) | Content Collections, see below |
| Contacto | `/contacto` | `/en/contact` | Form posts to `/api/contact` |
| Privacidad / Términos | `/privacidad`, `/terminos` | `/en/privacy`, `/en/terms` | |

Carreras and Casos de Éxito sections existed previously and were removed
(along with their nav/footer links and translations) — do not resurrect
them from memory or old docs without the user asking first.

## Validation

Every command below has been run and passes. Run all of them before
considering a change complete.

| Check | Command |
|---|---|
| Install | `pnpm install` |
| Build | `pnpm run build` |
| Type/template check | `pnpm exec astro check` |

There is no test suite and no lint script configured.

**Node version:** this project requires Node `>=22.12.0` (pinned in
`package.json`'s `engines`). Astro 7 refuses to run at all on older Node
and fails immediately with "Node.js vX is not supported by Astro!" on
every command above. If you hit that, switch the active Node version
(e.g. `nvm use 22`) before doing anything else — it is not a project bug.

## Unverified

- `pnpm exec astro check` currently exits 1 with 2 pre-existing type
  errors (unrelated to normal feature work): `src/components/Input.astro:17`
  and `src/components/pages/ContactoPage.astro:88`. The command itself
  works; the codebase is not currently clean against it. (The
  `ContactoPage.astro` line number drifts as unrelated content is added
  above it — same error, same cause, not a new issue. A third pre-existing
  error in `IndustriasPage.astro` was fixed as a side effect of removing
  a stale `id` prop during the Industrias nav rework — don't be surprised
  the count dropped from 3 to 2.)

## Conventions

- **Page pattern:** every route is a thin wrapper at
  `src/pages/<slug>/index.astro` (and its `src/pages/en/<slug>/index.astro`
  mirror) that imports and renders one component from
  `src/components/pages/<Name>Page.astro`, passing `lang="es"` or
  `lang="en"`. All real markup/logic lives in the `*Page.astro` component,
  never in the page file.
- **Structure:** pages live in `src/pages/`; English routes are mirrored
  under `src/pages/en/`. Shared UI in `src/components/`, page-level
  compositions in `src/components/pages/`. Layouts in `src/layouts/`.
  Translations in `src/i18n/`. Global styles in `src/styles/global.css`.
- **i18n system** (`src/i18n/`):
  - `ui.ts` — a flat `{ es: {...}, en: {...} }` key→string dictionary.
    Every user-facing string goes through `t('some.key')`
    (`useTranslations(lang)`), never hardcoded text in markup. Keep the ES
    and EN blocks mirrored key-for-key; `UiKey` is derived from the ES
    block's keys.
  - `routes.ts` — `slugMap`: ES slug → EN slug, for the handful of routes
    whose English slug differs from Spanish (`servicios`→`services`,
    etc.). Routes with an identical slug in both languages (e.g. `blog`,
    `contacto`→`contact` is in the map, but something like `/blog` doesn't
    need an entry) don't need a `slugMap` entry — `localizePath`/
    `switchLangPath` pass unmapped segments through unchanged.
  - `utils.ts` — `localizePath(path, lang)` builds a correct internal link
    for a given locale (always use this instead of hand-building a path);
    `switchLangPath(currentPath, targetLang)` maps the current URL to its
    other-locale equivalent, used by the language switcher.
  - `detect.ts` — browser-language detection + a stored explicit-choice
    flag, used by `Layout.astro`'s language banner.
- **Pages with no reliable cross-locale URL** (e.g. a blog post that may
  not have a same-slug translation): pass `Layout`'s optional
  `langAlternates={{ es, en }}` prop (threaded down to `Navbar` too) to
  override the default `switchLangPath`-based ES/EN link. It only drives
  the Navbar switcher/banner target (and the hreflang targets on pages
  that emit hreflang); canonical and og:url always come from the page's
  own URL (`Astro.url.pathname`, trailing slash ensured). Pages with no
  translation pair also pass the optional `noAlternates` prop so no
  hreflang or og:locale:alternate is emitted — see `BlogPostPage.astro`
  for the pattern (it points both to the blog index instead of a guessed,
  possibly-404 same-slug path).
- **Blog / Content Collections** (`src/content.config.ts`):
  - Two independent collections, `blog-es` and `blog-en`, each loaded via
    `glob({ pattern: '**/*.md', base: './src/content/blog-{es,en}' })` —
    not one collection with a `lang` field. Posts in one language do not
    need a matching post in the other; they publish independently.
  - Schema per post: `title`, `description`, `pubDate` (coerced to
    `Date`), `author` (defaults to `'Synthetix AI'`), `tags` (string
    array), `heroImage` (optional plain string path — **not** the
    `image()` schema helper / `astro:assets` `<Image>`, since this repo
    has no `sharp` dependency installed; keep using plain `<img src=...>`
    like the rest of the codebase), `draft` (boolean, excluded from
    listings via `getCollection(name, ({data}) => !data.draft)`).
  - Routes: `src/pages/blog/index.astro` (+ `en` mirror) for the listing,
    `src/pages/blog/[...id].astro` (+ `en` mirror) for individual posts,
    resolved via `getStaticPaths` over the collection.
- **API routes:** server endpoints under `src/pages/api/` (e.g.
  `contact.ts`), following Astro's file-based API route convention.
- **Avatar is photo-ready:** `src/components/Avatar.astro` accepts an
  optional `photo?: ImageMetadata` prop; when omitted it falls back to
  the existing initials-circle placeholder. Team members in
  `NosotrosPage.astro` currently pass no photo (initials only) — adding a
  real photo later is a one-line change per person once an image asset
  exists (`import` it, pass as `photo={...}`).
- **Package manager:** `pnpm` (pinned via `packageManager` in package.json,
  `pnpm-workspace.yaml` present) — do not use `npm`/`yarn`.
- **Type checking:** `tsconfig.json` extends `astro/tsconfigs/strict`.
- **No new runtime dependencies without discussion:** this repo
  deliberately has no CMS, no `sharp`/`astro:assets` image pipeline, and
  no UI/icon library — social and industry icons, for example, are
  hand-authored inline SVGs matching the existing hero-icon style. Keep
  that pattern unless the user asks to add a dependency.

## Do not touch

- `dist/` — build output.
- `.astro/` — generated types.
- `.vercel/` — Vercel deployment output/config.
- `node_modules/`.
- `Identidad Visual/`, `screens/` — brand assets and scratch screenshots,
  gitignored.
- `docs/*` except `docs/superpowers/` — private source material (legal,
  brand brief, design PDFs); only `docs/superpowers/` is version-controlled.
- `.env`, `.env.production` — real secrets; only `.env.example` is tracked.

## Notes

- Dev server: `astro dev --background` (see prior AGENTS.md guidance),
  managed with `astro dev stop` / `astro dev status` / `astro dev logs`.
- Contact form (`src/pages/api/contact.ts`) requires `RESEND_API_KEY` and
  `CONTACT_FROM_EMAIL` env vars to send email; see `.env.example`. Fields
  collected: name, email, phone (optional), company (optional), message —
  keep `legal.privacy.s2.body` in `ui.ts` in sync if the field set changes.
- Design docs for past work live in `docs/superpowers/specs/` and
  `docs/superpowers/plans/` (dated filenames) — check there for the
  reasoning behind recent structural changes (e.g. the blog's content
  model, the Carreras/Casos de Éxito removal) before re-deriving it from
  scratch.
- Footer social links (`src/components/Footer.astro`) point at the real
  accounts (Facebook, Instagram, LinkedIn, TikTok) — don't revert them to
  placeholder `#` hrefs.
