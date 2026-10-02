# Site sections revamp: remove Carreras/Casos, add Productos + Blog, enrich Nosotros

## Context

Marketing site (Astro 7, bilingual ES/EN mirrored routes, no CMS/backend
beyond the Resend-powered contact form). Four changes, agreed with the user
in brainstorming:

1. Remove the Carreras and Casos de Éxito sections entirely.
2. Add a new Productos page.
3. Add a new bilingual Blog, backed by Astro Content Collections.
4. Enrich the Nosotros team section with per-person photo (placeholder for
   now), role, and bio.

Scope is this repo only; no external services, no CMS. Placeholder content
is used wherever real content (product details, team photos/bios) isn't
available yet — all placeholders live in clearly-named, easy-to-edit spots
(`ui.ts` keys, content collection files) so swapping in real content later
doesn't require touching logic.

## A. Remove Carreras and Casos de Éxito

Delete:

- `src/pages/carreras/index.astro`
- `src/pages/casos-de-exito/index.astro`
- `src/pages/en/careers/index.astro`
- `src/pages/en/case-studies/index.astro`
- `src/pages/en/carreras/index.astro` (legacy redirect stub)
- `src/pages/en/casos-de-exito/index.astro` (legacy redirect stub)
- `src/components/pages/CarrerasPage.astro`
- `src/components/pages/CasosPage.astro`

Edit:

- `src/i18n/routes.ts` — remove the `carreras` and `casos-de-exito` entries
  from `slugMap`. `astro.config.mjs`'s `oldEnSlugPaths` is derived from
  `Object.keys(slugMap)` at build time, so it automatically drops the two
  removed stub paths — no edit needed there.
- `src/components/Navbar.astro` — remove the `nav.careers` and `nav.cases`
  top-level nav entries.
- `src/components/Footer.astro` — remove the Carreras and Casos de Éxito
  links from the "Compañía" column.
- `src/layouts/Layout.astro` — remove the `carreras` and `casos-de-exito`
  entries from `breadcrumbLabelKeys` (BreadcrumbList JSON-LD derives labels
  from this map; stale entries would just never match once the routes are
  gone, but keep it clean).
- `src/i18n/ui.ts` — remove now-unused keys in both `es` and `en` blocks:
  `nav.careers`, `nav.cases`, all `cases.*` keys, all `car.*` keys.

Confirmed: `HomePage.astro` has no references to either section, so no
changes needed there.

## B. Productos page

New page at `/productos` (ES, canonical) and `/en/products` (EN). Same
visual pattern as `IndustriasPage.astro`: hero + card grid + closing CTA.
No dropdown in the nav (matches Industrias/Nosotros top-level link
behavior minus the dropdown — simplest is a plain link like Carreras/Casos
used to be).

Files:

- `src/components/pages/ProductosPage.astro` — new, modeled on
  `IndustriasPage.astro`. Local array of 2 placeholder products:
  `{ name: UiKey; desc: UiKey }`, rendered as `Card`s in a 2-column grid
  (the existing `.industry-grid`-style CSS, adapted).
- `src/pages/productos/index.astro` — thin wrapper rendering
  `<ProductosPage lang="es" />` (matches the pattern of every other ES page
  file).
- `src/pages/en/products/index.astro` — thin wrapper rendering
  `<ProductosPage lang="en" />`.

Edits:

- `src/i18n/routes.ts` — add `productos: 'products'` to `slugMap`.
- `src/components/Navbar.astro` — add a `{ label: t('nav.products'), href:
  localizePath('/productos', lang) }` entry (no `children`), positioned
  after Industrias and before Nosotros.
- `src/components/Footer.astro` — add a Productos link in the "Servicios"
  column.
- `src/layouts/Layout.astro` — add `productos: 'nav.products'` to
  `breadcrumbLabelKeys`.
- `src/i18n/ui.ts` — new keys (es + en): `nav.products`,
  `prod.meta.title`, `prod.meta.description`, `prod.eyebrow`, `prod.title`,
  `prod.lead`, `prod.1.name`, `prod.1.desc`, `prod.2.name`, `prod.2.desc`,
  `prod.cta.title`, `prod.cta.lead` (CTA button reuses `nav.cta` text and
  links to `/contacto`, same as Industrias).

No new stub/redirect page is needed — `/productos` never existed before,
so there's no legacy URL to 301 from.

## C. Blog

### Content model

Astro Content Collections, one collection per language (not one collection
with a `lang` field) — this keeps the ES and EN post sets independent:
posts don't need a 1:1 translation pair, and each can publish on its own
schedule.

```
src/content/
  blog-es/
    *.md
  blog-en/
    *.md
```

`src/content.config.ts` (project root of content config as of Astro 5+'s
Content Layer API — not the legacy `src/content/config.ts`):

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  author: z.string().default('Synthetix AI'),
  tags: z.array(z.string()).default([]),
  heroImage: z.string().optional(),
  draft: z.boolean().default(false),
});

const blogEs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog-es' }),
  schema: blogSchema,
});

const blogEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog-en' }),
  schema: blogSchema,
});

export const collections = { 'blog-es': blogEs, 'blog-en': blogEn };
```

`heroImage` is a plain relative path string (not Astro's `image()` helper)
to keep the first version simple — optimized local images via
content-collection `image()` schemas require colocating images per entry
and add meaningful setup surface. If/when real photography is added, this
is the one field to upgrade to `image()`; everything else in this spec is
unaffected by that follow-up.

Each post is rendered with `getCollection` (listing/filtering/sorting) and
`render(entry)` (Astro 7's content API, imported from `astro:content`) for
the Markdown body on the detail page, same as any other Astro
content-collection consumer. The glob loader generates `entry.id` from the
filename (kebab-cased); routes use a `[...id]` rest parameter so a
slash-containing id (e.g. from a nested file path) still maps to a valid
URL.

### Pages

- `src/components/pages/BlogPage.astro` — listing. Props: `{ lang: Lang
  }`. Queries `blog-es` or `blog-en` by `lang`, filters out `draft: true`,
  sorts by `pubDate` descending, renders a card grid: hero image (if
  present) or a neutral placeholder block, title, formatted date,
  description, "read more" link to the post.
- `src/components/pages/BlogPostPage.astro` — detail. Props: `{ lang:
  Lang; entry: CollectionEntry<'blog-es' | 'blog-en'> }` (the owning
  `[...id].astro` resolves the entry via `getStaticPaths`, so a
  nonexistent id is simply never generated as a route and 404s naturally
  — no runtime "not found" branch needed inside the component). Calls
  `render(entry)` itself to get the `<Content />` component, then renders
  hero image, title, date, author, and the body.
- `src/pages/blog/index.astro` → `<BlogPage lang="es" />`
- `src/pages/blog/[...id].astro` → `getStaticPaths` over `blog-es`,
  renders `<BlogPostPage lang="es" entry={entry} />`
- `src/pages/en/blog/index.astro` → `<BlogPage lang="en" />`
- `src/pages/en/blog/[...id].astro` → `getStaticPaths` over `blog-en`,
  renders `<BlogPostPage lang="en" entry={entry} />`

### Language switcher on post pages

The site-wide ES/EN switcher (`switchLangPath` in `Layout.astro`/`Navbar`)
assumes a path-for-path translation via `slugMap`, which doesn't hold for
individual post slugs (an ES post and its EN counterpart, if any, may use
different slugs or not exist at all). For blog post pages specifically,
`BlogPostPage.astro` passes an override: the language switcher link target
becomes the other language's **blog index** (`/blog` ↔ `/en/blog`) rather
than attempting a same-slug translation. Listing pages keep the normal
`switchLangPath` behavior (ES `/blog` ↔ EN `/en/blog`, which already works
today since `blog` needs no slug-map entry — the segment is identical in
both languages).

### Nav/Footer

- `src/components/Navbar.astro` — add `{ label: t('nav.blog'), href:
  localizePath('/blog', lang) }`, after Nosotros.
- `src/components/Footer.astro` — add a Blog link in the "Compañía"
  column.
- `src/layouts/Layout.astro` — add `blog: 'nav.blog'` to
  `breadcrumbLabelKeys` (covers the listing page; individual post slugs
  under `/blog/<slug>` won't resolve to a breadcrumb label beyond "Blog",
  which is correct — no per-post breadcrumb entry is needed).

### New ui.ts keys

`nav.blog`, `blog.meta.title`, `blog.meta.description`, `blog.eyebrow`,
`blog.title`, `blog.lead`, `blog.readMore`, `blog.empty` (shown if a
locale's collection has zero published posts — not expected at launch
since we seed placeholder posts, but keeps the listing page safe).

### Seed content

Two placeholder posts in `blog-es/` and two in `blog-en/` (not required to
mirror each other 1:1), each with a short title/description/body, no
`heroImage` (validates the no-image path) — this exercises the full
pipeline (listing, detail, draft filtering via one post with `draft:
true`) without depending on real editorial content.

## D. Nosotros: team photo, role, bio

### `Avatar.astro`

Add an optional `photo` prop (an Astro `ImageMetadata`, i.e. the result of
`import photo from '...'`). When present, render a plain `<img src=
{photo.src} width={photo.width} height={photo.height}>` in place of the
initials circle — matching the rest of the codebase's existing image
convention (`logo-mark.png`/`logo-lockup.png` are imported and read via
`.src` on a plain `<img>`, not the `astro:assets` `<Image>` component; this
project has no `sharp` dependency installed, so introducing the optimized
`<Image>` pipeline is out of scope here). When `photo` is absent, keep
today's initials placeholder exactly as-is. Typing: `{ initials: string;
photo?: ImageMetadata }`, photo takes precedence when given.

### `NosotrosPage.astro`

Team array gains per-person keys instead of one shared `about.team.role`:

```ts
const team: { name: string; initials: string; role: UiKey; bio: UiKey }[] = [
  { name: 'Cristian Montes', initials: 'CM', role: 'about.team.cristian.role', bio: 'about.team.cristian.bio' },
  { name: 'Sergio Molina', initials: 'SM', role: 'about.team.sergio.role', bio: 'about.team.sergio.bio' },
  { name: 'Santiago Rentería', initials: 'SR', role: 'about.team.santiago.role', bio: 'about.team.santiago.bio' },
  { name: 'Mateo Rodríguez', initials: 'MR', role: 'about.team.mateo.role', bio: 'about.team.mateo.bio' },
];
```

No `photo` passed for any of the four yet (keeps today's initials look);
adding a real photo later is a one-line change per person once an image
asset exists.

Placeholder copy for role/bio is intentionally generic (not invented
specifics like fake titles) — e.g. role: "Equipo Fundador" / "Founding
Team", bio: one neutral sentence — clearly meant to be replaced once real
content is provided. The old shared `about.team.role` key is removed.

### Layout change

`.team-grid` moves from `repeat(4, 1fr)` to `repeat(2, 1fr)` on desktop (1
column stays on mobile) to leave room for the bio paragraph under each
card without feeling cramped. Each team card keeps the centered
avatar/photo, adds the per-person role (unchanged position) and a new bio
paragraph below it.

## Validation

Per `AGENTS.md`: `pnpm run build` and `pnpm exec astro check` after
implementation (the 3 pre-existing `astro check` errors listed there are
unrelated and expected to remain). Manually smoke-check in the dev server:
nav/footer links on both locales, `/productos` + `/en/products`, `/blog` +
`/en/blog` + one post detail page each, and the Nosotros team section.
