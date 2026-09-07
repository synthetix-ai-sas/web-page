# AGENTS.md

Instructions for any AI coding agent working in this repository.

## Context

Marketing/corporate site for Synthetix (synthetixaisas.com), built with
Astro 7 and deployed on Vercel. Bilingual (Spanish default, English under
`/en`). Includes a contact form backed by a server API route that sends
email via Resend.

## Validation

Every command below has been run and passes. Run all of them before
considering a change complete.

| Check | Command |
|---|---|
| Install | `pnpm install` |
| Build | `pnpm run build` |
| Type/template check | `pnpm exec astro check` |

There is no test suite and no lint script configured.

## Unverified

- `pnpm exec astro check` currently exits 1 with 3 pre-existing type errors
  (unrelated to this bootstrap): `src/components/Input.astro:17`,
  `src/components/pages/ContactoPage.astro:85`,
  `src/components/pages/IndustriasPage.astro:37`. The command itself works;
  the codebase is not currently clean against it. (Line number for
  `ContactoPage.astro` drifts as unrelated content is added above it —
  same error, same cause, not a new issue.)

## Conventions

- **Structure:** pages live in `src/pages/`; English routes are mirrored
  under `src/pages/en/`. Shared UI in `src/components/`, page-level
  compositions in `src/components/pages/`. Layouts in `src/layouts/`.
  Translations in `src/i18n/`. Global styles in `src/styles/global.css`.
- **API routes:** server endpoints under `src/pages/api/` (e.g.
  `contact.ts`), following Astro's file-based API route convention.
- **Package manager:** `pnpm` (pinned via `packageManager` in package.json,
  `pnpm-workspace.yaml` present) — do not use `npm`/`yarn`.
- **Type checking:** `tsconfig.json` extends `astro/tsconfigs/strict`.

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
  `CONTACT_FROM_EMAIL` env vars to send email; see `.env.example`.
