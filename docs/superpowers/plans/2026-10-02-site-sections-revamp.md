# Site Sections Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the Carreras and Casos de Éxito sections, add a new Productos page, add a bilingual Blog backed by Astro Content Collections, and enrich the Nosotros team section with per-person photo/role/bio — across both the ES (default) and EN (`/en`) route trees.

**Architecture:** This is a content-and-routing change to an existing Astro 7 static site, not a new subsystem split into services. Every new user-facing page follows the project's existing ES/EN mirrored-page convention (a thin `src/pages/.../index.astro` wrapper rendering a `src/components/pages/*Page.astro` component that takes `lang` as a prop), and every piece of UI copy goes through the `t()` translator backed by `src/i18n/ui.ts` — never hardcoded strings. The one new piece of infrastructure is Astro's Content Layer API (`defineCollection` + `glob()` loader) for the blog, since that's the one place static per-page arrays don't fit (an open-ended, growing set of posts).

**Tech Stack:** Astro 7.1.3, TypeScript (`astro/tsconfigs/strict`), pnpm, no test framework (per `AGENTS.md`) — verification is `pnpm run build` + `pnpm exec astro check` plus inspecting build output / the dev server.

**Spec:** `docs/superpowers/specs/2026-10-02-site-sections-revamp-design.md`

## Global Constraints

- Package manager is `pnpm` only — never `npm`/`yarn` (pinned via `packageManager` in `package.json`).
- `trailingSlash: 'always'` (astro.config.mjs) — every internal link must go through `localizePath()` (or `switchLangPath()`), never a hand-built path string, so the trailing slash and ES↔EN slug translation stay correct.
- All user-facing copy goes through `src/i18n/ui.ts` keys via `t('some.key')` — no hardcoded ES/EN strings in component markup.
- Every new route ships in both locales: a Spanish page under `src/pages/...` and its English mirror under `src/pages/en/...`.
- No new npm dependencies. In particular: no `astro:assets` `<Image>` component and no `sharp` (not installed; this repo's existing images are plain `<img src={imported.src}>`), and no external CMS (Content Collections only, per the approved spec).
- Placeholder content (Productos' 2 products, the team roles/bios, the seed blog posts) must read as deliberately generic placeholder copy — never invent specific-sounding facts (e.g. a fake job title or a fake client result) that could later be mistaken for something real.
- Validation per `AGENTS.md`: `pnpm run build` and `pnpm exec astro check` must both be run before considering any task done. `astro check` has 3 pre-existing, unrelated failures (`src/components/Input.astro:17`, `src/components/pages/ContactoPage.astro:85`, `src/components/pages/IndustriasPage.astro:37`) — these are expected and must not grow in number; no task in this plan touches those files.

---

### Task 1: Remove Carreras and Casos de Éxito

**Files:**
- Delete: `src/pages/carreras/index.astro`
- Delete: `src/pages/casos-de-exito/index.astro`
- Delete: `src/pages/en/careers/index.astro`
- Delete: `src/pages/en/case-studies/index.astro`
- Delete: `src/pages/en/carreras/index.astro`
- Delete: `src/pages/en/casos-de-exito/index.astro`
- Delete: `src/components/pages/CarrerasPage.astro`
- Delete: `src/components/pages/CasosPage.astro`
- Modify: `src/i18n/routes.ts`
- Modify: `src/components/Navbar.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/layouts/Layout.astro`
- Modify: `src/i18n/ui.ts`

**Interfaces:**
- Produces: `slugMap` (in `src/i18n/routes.ts`) with the `carreras` and `casos-de-exito` entries removed — Task 2 and Task 4 both add their own new entries/non-entries to this same object, so this task must land first.

- [ ] **Step 1: Delete the old pages and components**

```bash
git rm src/pages/carreras/index.astro \
       src/pages/casos-de-exito/index.astro \
       src/pages/en/careers/index.astro \
       src/pages/en/case-studies/index.astro \
       src/pages/en/carreras/index.astro \
       src/pages/en/casos-de-exito/index.astro \
       src/components/pages/CarrerasPage.astro \
       src/components/pages/CasosPage.astro
```

- [ ] **Step 2: Remove the two slugMap entries**

In `src/i18n/routes.ts`, change:

```ts
export const slugMap: Record<string, string> = {
  servicios: 'services',
  industrias: 'industries',
  nosotros: 'about',
  'casos-de-exito': 'case-studies',
  carreras: 'careers',
  contacto: 'contact',
  privacidad: 'privacy',
  terminos: 'terms',
};
```

to:

```ts
export const slugMap: Record<string, string> = {
  servicios: 'services',
  industrias: 'industries',
  nosotros: 'about',
  contacto: 'contact',
  privacidad: 'privacy',
  terminos: 'terms',
};
```

- [ ] **Step 3: Remove the nav entries in Navbar.astro**

In `src/components/Navbar.astro`, change:

```ts
  { label: t('nav.careers'), href: localizePath('/carreras', lang) },
  { label: t('nav.cases'), href: localizePath('/casos-de-exito', lang) },
];
```

to:

```ts
];
```

(i.e. delete those two lines; the `nav` array now ends after the Nosotros entry's closing `},`).

- [ ] **Step 4: Remove the footer links**

In `src/components/Footer.astro`, change:

```astro
    <div class="sx-footer__col">
      <h4>{t('footer.col.company')}</h4>
      <a href={localizePath('/nosotros', lang)}>{t('nav.about')}</a>
      <a href={localizePath('/carreras', lang)}>{t('nav.careers')}</a>
      <a href={localizePath('/casos-de-exito', lang)}>{t('nav.cases')}</a>
      <a href={localizePath('/nosotros#faq', lang)}>{t('nav.about.faq')}</a>
    </div>
```

to:

```astro
    <div class="sx-footer__col">
      <h4>{t('footer.col.company')}</h4>
      <a href={localizePath('/nosotros', lang)}>{t('nav.about')}</a>
      <a href={localizePath('/nosotros#faq', lang)}>{t('nav.about.faq')}</a>
    </div>
```

- [ ] **Step 5: Remove the breadcrumb label entries**

In `src/layouts/Layout.astro`, change:

```ts
const breadcrumbLabelKeys: Partial<Record<string, Parameters<typeof t>[0]>> = {
  servicios: 'nav.services',
  industrias: 'nav.industries',
  nosotros: 'nav.about',
  carreras: 'nav.careers',
  'casos-de-exito': 'nav.cases',
  contacto: 'footer.col.contact',
  privacidad: 'footer.privacy',
  terminos: 'footer.terms',
};
```

to:

```ts
const breadcrumbLabelKeys: Partial<Record<string, Parameters<typeof t>[0]>> = {
  servicios: 'nav.services',
  industrias: 'nav.industries',
  nosotros: 'nav.about',
  contacto: 'footer.col.contact',
  privacidad: 'footer.privacy',
  terminos: 'footer.terms',
};
```

- [ ] **Step 6: Remove the now-unused translation keys**

In `src/i18n/ui.ts`, in the **`es`** block, remove these two lines from the `---- Nav ----` section:

```ts
    'nav.careers': 'Carreras',
    'nav.cases': 'Casos de Éxito',
```

then remove the entire `---- Casos de Éxito ----` block (from the comment line through the last `cases.6.result` line):

```ts
    // ---- Casos de Éxito ----
    'cases.meta.title': 'Casos de Éxito en IA: Salud y PropTech',
    'cases.meta.description': 'Casos reales de software e inteligencia artificial que hemos construido para nuestros clientes — resultados concretos, no promesas genéricas.',
    'cases.eyebrow': 'Nuestro Trabajo',
    'cases.title': 'Sistemas reales, resultados reales',
    'cases.lead': 'Una muestra de la arquitectura de IA que hemos construido para nuestros clientes.',
    'cases.1.title': 'Asistente Clínico con IA para Emergencias',
    'cases.1.result': 'Reduce el tiempo de triage y apoya decisiones clínicas en tiempo real.',
    'cases.2.title': 'Plataforma de Analítica Inmobiliaria con IA',
    'cases.2.result': 'Centraliza datos de mercado para decisiones de inversión más rápidas.',
    'cases.3.title': 'Predicción de Tránsito en Tiempo Real',
    'cases.3.result': 'Anticipa la congestión vial con modelos que se actualizan en vivo.',
    'cases.4.title': 'Transformación Agéntica para Plataforma de Supply Chain',
    'cases.4.result': 'Automatiza procesos operativos clave y libera al equipo para tareas de mayor valor.',
    'cases.5.title': 'Transformación de Desarrollo Agéntico',
    'cases.5.result': 'Acelera los ciclos de entrega del equipo de ingeniería sin sacrificar calidad.',
    'cases.6.title': 'Equipo Dedicado para Software Contable',
    'cases.6.result': 'Un equipo extendido que escala el producto sin fricciones de contratación.',

```

and the entire `---- Carreras ----` block:

```ts
    // ---- Carreras ----
    'car.meta.title': 'Carreras: Ingeniería y Arquitectura de IA',
    'car.meta.description': 'Únete a Synthetix AI: buscamos ingenieros y arquitectos para construir software e inteligencia artificial junto a un equipo remoto en Colombia.',
    'car.eyebrow': 'Carreras',
    'car.title': 'Construye sistemas de IA con nosotros',
    'car.lead': 'Buscamos ingenieros y arquitectos que quieran definir cómo se construye software en la era de los agentes.',
    'car.role1.title': 'Ingeniero de Software Senior',
    'car.role2.title': 'Arquitecto de Soluciones de IA',
    'car.role3.title': 'Gerente de Proyecto Técnico',
    'car.location': 'Remoto · Medellín',
    'car.fulltime': 'Tiempo completo',
    'car.apply': 'Aplicar',

```

Then do the mirror-image removal in the **`en`** block: delete

```ts
    'nav.careers': 'Careers',
    'nav.cases': 'Case Studies',
```

the `---- Case Studies ----` block:

```ts
    // ---- Case Studies ----
    'cases.meta.title': 'AI Case Studies: Healthcare and Logistics',
    'cases.meta.description': 'Real software and AI projects we have built for clients in healthcare, logistics, and PropTech — concrete results, not generic promises.',
    'cases.eyebrow': 'Our Work',
    'cases.title': 'Real systems, real results',
    'cases.lead': 'A sample of the AI architecture we have built for our clients.',
    'cases.1.title': 'AI Clinical Assistant for Emergency Care',
    'cases.1.result': 'Cuts triage time and supports clinical decisions in real time.',
    'cases.2.title': 'AI Real Estate Analytics Platform',
    'cases.2.result': 'Centralizes market data for faster investment decisions.',
    'cases.3.title': 'Real-Time Traffic Prediction',
    'cases.3.result': 'Anticipates road congestion with models that update live.',
    'cases.4.title': 'Agentic Transformation for a Supply Chain Platform',
    'cases.4.result': 'Automates key operational processes, freeing the team for higher-value work.',
    'cases.5.title': 'Agentic Development Transformation',
    'cases.5.result': 'Speeds up the engineering team’s delivery cycles without sacrificing quality.',
    'cases.6.title': 'Dedicated Team for Accounting Software',
    'cases.6.result': 'An extended team that scales the product without hiring friction.',

```

and the `---- Careers ----` block:

```ts
    // ---- Careers ----
    'car.meta.title': 'Remote AI Engineering Jobs in Colombia',
    'car.meta.description': "Join Synthetix AI: we're hiring engineers and architects to build software and AI alongside a remote team based in Colombia.",
    'car.eyebrow': 'Careers',
    'car.title': 'Build AI systems with us',
    'car.lead': 'We’re looking for engineers and architects who want to define how software gets built in the age of agents.',
    'car.role1.title': 'Senior Software Engineer',
    'car.role2.title': 'AI Solutions Architect',
    'car.role3.title': 'Technical Project Manager',
    'car.location': 'Remote · Medellín',
    'car.fulltime': 'Full-time',
    'car.apply': 'Apply',

```

- [ ] **Step 7: Verify**

```bash
pnpm exec astro check
pnpm run build
```

Expected: `astro check` reports exactly the same 3 pre-existing errors (no new ones, no errors about missing `CarrerasPage`/`CasosPage`/removed keys). `pnpm run build` succeeds. Then confirm the old routes are gone and nothing links to them:

```bash
test ! -d dist/carreras && test ! -d dist/casos-de-exito && test ! -d dist/en/careers && test ! -d dist/en/case-studies && echo "OK: old routes absent"
grep -rl "carreras\|casos-de-exito\|nav.careers\|nav.cases" dist --include="*.html" || echo "OK: no leftover links"
```

Expected: both `echo "OK"` lines print; the `grep` line finds nothing (its own `|| echo` only fires because `grep -rl` exits non-zero on no matches).

- [ ] **Step 8: Commit**

```bash
git add src/i18n/routes.ts src/components/Navbar.astro src/components/Footer.astro src/layouts/Layout.astro src/i18n/ui.ts
git commit -m "feat: remove Carreras and Casos de Éxito sections"
```

---

### Task 2: Add the Productos page

**Files:**
- Create: `src/components/pages/ProductosPage.astro`
- Create: `src/pages/productos/index.astro`
- Create: `src/pages/en/products/index.astro`
- Modify: `src/i18n/routes.ts`
- Modify: `src/components/Navbar.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/layouts/Layout.astro`
- Modify: `src/i18n/ui.ts`

**Interfaces:**
- Consumes: `slugMap: Record<string, string>` from `src/i18n/routes.ts` (post-Task-1 shape), `localizePath`/`useTranslations` from `src/i18n/utils.ts`, `Card`/`Button` components, `Layout` component — all unchanged existing interfaces.
- Produces: `/productos` and `/en/products` routes; new `UiKey`s `nav.products`, `prod.meta.title`, `prod.meta.description`, `prod.eyebrow`, `prod.title`, `prod.lead`, `prod.1.name`, `prod.1.desc`, `prod.2.name`, `prod.2.desc`, `prod.cta.title`, `prod.cta.lead`.

- [ ] **Step 1: Add the slugMap entry**

In `src/i18n/routes.ts`:

```ts
export const slugMap: Record<string, string> = {
  servicios: 'services',
  industrias: 'industries',
  nosotros: 'about',
  productos: 'products',
  contacto: 'contact',
  privacidad: 'privacy',
  terminos: 'terms',
};
```

- [ ] **Step 2: Add the ui.ts keys**

In `src/i18n/ui.ts`, **`es`** block: add `'nav.products': 'Productos',` right after `'nav.industries.all': 'Ver todas →',` and before `'nav.about': 'Nosotros',`. Then add a new section right after the `---- Industrias ----` block (after its last line, `'ind.cta.lead': 'Construimos arquitectura de IA a la medida de cualquier sector.',`) and before `---- Nosotros ----`:

```ts

    // ---- Productos ----
    'prod.meta.title': 'Productos de IA para tu Negocio',
    'prod.meta.description': 'Conoce los productos de inteligencia artificial que construimos en Synthetix AI — soluciones listas para integrarse a tu operación.',
    'prod.eyebrow': 'Productos',
    'prod.title': 'Productos que aceleran tu operación',
    'prod.lead': 'Más allá de proyectos a la medida, construimos productos propios que resuelven problemas recurrentes de nuestros clientes.',
    'prod.1.name': 'Producto Uno',
    'prod.1.desc': 'Descripción breve del primer producto — este texto es un placeholder, reemplázalo con el contenido real cuando esté listo.',
    'prod.2.name': 'Producto Dos',
    'prod.2.desc': 'Descripción breve del segundo producto — este texto es un placeholder, reemplázalo con el contenido real cuando esté listo.',
    'prod.cta.title': '¿Quieres saber más?',
    'prod.cta.lead': 'Hablemos de cómo estos productos pueden integrarse a tu operación.',
```

In the **`en`** block: add `'nav.products': 'Products',` right after `'nav.industries.all': 'View all →',` and before `'nav.about': 'About Us',`. Then add, after the `---- Industries ----` block's last line (`'ind.cta.lead': 'We build AI architecture tailored to any sector.',`) and before `---- About ----`:

```ts

    // ---- Products ----
    'prod.meta.title': 'AI Products for Your Business',
    'prod.meta.description': 'Meet the AI products we build at Synthetix AI — solutions ready to integrate into your operation.',
    'prod.eyebrow': 'Products',
    'prod.title': 'Products that accelerate your operation',
    'prod.lead': 'Beyond custom projects, we build our own products that solve recurring problems for our clients.',
    'prod.1.name': 'Product One',
    'prod.1.desc': 'Short description of the first product — this is placeholder text, replace it with real content once it’s ready.',
    'prod.2.name': 'Product Two',
    'prod.2.desc': 'Short description of the second product — this is placeholder text, replace it with real content once it’s ready.',
    'prod.cta.title': 'Want to know more?',
    'prod.cta.lead': 'Let’s talk about how these products can fit into your operation.',
```

- [ ] **Step 3: Create the ProductosPage component**

Create `src/components/pages/ProductosPage.astro`:

```astro
---
import Layout from '../../layouts/Layout.astro';
import Card from '../Card.astro';
import Button from '../Button.astro';
import { useTranslations, localizePath, type Lang, type UiKey } from '../../i18n/utils';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
const t = useTranslations(lang);

const products: { name: UiKey; desc: UiKey }[] = [
  { name: 'prod.1.name', desc: 'prod.1.desc' },
  { name: 'prod.2.name', desc: 'prod.2.desc' },
];
---
<Layout title={t('prod.meta.title')} description={t('prod.meta.description')} lang={lang}>
  <section>
    <div class="container">
      <span class="eyebrow">{t('prod.eyebrow')}</span>
      <h1>{t('prod.title')}</h1>
      <p class="lead">{t('prod.lead')}</p>
    </div>
  </section>

  <section class="grain-surface">
    <div class="container product-grid">
      {products.map((p) => (
        <Card data-reveal>
          <h3>{t(p.name)}</h3>
          <p>{t(p.desc)}</p>
        </Card>
      ))}
    </div>
  </section>

  <section class="cta-final grain-surface">
    <div class="container cta-final__inner" data-reveal>
      <hr class="divider cta-final__rule" />
      <h2>{t('prod.cta.title')}</h2>
      <p>{t('prod.cta.lead')}</p>
      <Button href={localizePath('/contacto', lang)}>{t('nav.cta')}</Button>
    </div>
  </section>
</Layout>

<style>
  .lead { max-width: 560px; font-size: 18px; }
  .product-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sx-space-6);
  }
  .cta-final { text-align: center; }
  .cta-final__inner { max-width: 560px; margin: 0 auto; }
  .cta-final__rule { width: 72px; margin: 0 auto var(--sx-space-6); }
  @media (max-width: 560px) { .product-grid { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 4: Create the page wrappers**

Create `src/pages/productos/index.astro`:

```astro
---
import ProductosPage from '../../components/pages/ProductosPage.astro';
---
<ProductosPage lang="es" />
```

Create `src/pages/en/products/index.astro`:

```astro
---
import ProductosPage from '../../../components/pages/ProductosPage.astro';
---
<ProductosPage lang="en" />
```

- [ ] **Step 5: Add the nav entry**

In `src/components/Navbar.astro`, change:

```ts
  {
    label: t('nav.industries'),
    href: localizePath('/industrias', lang),
    children: [
      { label: t('ind.finanzas'), href: localizePath('/industrias#finanzas', lang) },
      { label: t('ind.salud'), href: localizePath('/industrias#salud', lang) },
      { label: t('ind.logistica'), href: localizePath('/industrias#logistica', lang) },
      { label: t('nav.industries.all'), href: localizePath('/industrias', lang) },
    ],
  },
  {
    label: t('nav.about'),
```

to:

```ts
  {
    label: t('nav.industries'),
    href: localizePath('/industrias', lang),
    children: [
      { label: t('ind.finanzas'), href: localizePath('/industrias#finanzas', lang) },
      { label: t('ind.salud'), href: localizePath('/industrias#salud', lang) },
      { label: t('ind.logistica'), href: localizePath('/industrias#logistica', lang) },
      { label: t('nav.industries.all'), href: localizePath('/industrias', lang) },
    ],
  },
  { label: t('nav.products'), href: localizePath('/productos', lang) },
  {
    label: t('nav.about'),
```

- [ ] **Step 6: Add the footer link**

In `src/components/Footer.astro`, change:

```astro
    <div class="sx-footer__col">
      <h4>{t('footer.col.services')}</h4>
      <a href={localizePath('/servicios#desarrollo', lang)}>{t('nav.services.dev')}</a>
      <a href={localizePath('/servicios#agentes', lang)}>{t('nav.services.agents')}</a>
      <a href={localizePath('/servicios#vibe-to-production', lang)}>{t('nav.services.vibe')}</a>
      <a href={localizePath('/servicios', lang)}>{t('footer.services.all')}</a>
    </div>
```

to:

```astro
    <div class="sx-footer__col">
      <h4>{t('footer.col.services')}</h4>
      <a href={localizePath('/servicios#desarrollo', lang)}>{t('nav.services.dev')}</a>
      <a href={localizePath('/servicios#agentes', lang)}>{t('nav.services.agents')}</a>
      <a href={localizePath('/servicios#vibe-to-production', lang)}>{t('nav.services.vibe')}</a>
      <a href={localizePath('/servicios', lang)}>{t('footer.services.all')}</a>
      <a href={localizePath('/productos', lang)}>{t('nav.products')}</a>
    </div>
```

- [ ] **Step 7: Add the breadcrumb label entry**

In `src/layouts/Layout.astro`, change:

```ts
const breadcrumbLabelKeys: Partial<Record<string, Parameters<typeof t>[0]>> = {
  servicios: 'nav.services',
  industrias: 'nav.industries',
  nosotros: 'nav.about',
  contacto: 'footer.col.contact',
  privacidad: 'footer.privacy',
  terminos: 'footer.terms',
};
```

to:

```ts
const breadcrumbLabelKeys: Partial<Record<string, Parameters<typeof t>[0]>> = {
  servicios: 'nav.services',
  industrias: 'nav.industries',
  productos: 'nav.products',
  nosotros: 'nav.about',
  contacto: 'footer.col.contact',
  privacidad: 'footer.privacy',
  terminos: 'footer.terms',
};
```

- [ ] **Step 8: Verify**

```bash
pnpm exec astro check
pnpm run build
grep -o '<h1>[^<]*</h1>' dist/productos/index.html
grep -o '<h1>[^<]*</h1>' dist/en/products/index.html
```

Expected: `astro check` shows only the same 3 pre-existing errors. Build succeeds. The two `grep` lines print `<h1>Productos que aceleran tu operación</h1>` and `<h1>Products that accelerate your operation</h1>` respectively.

- [ ] **Step 9: Commit**

```bash
git add src/i18n/routes.ts src/i18n/ui.ts src/components/pages/ProductosPage.astro src/pages/productos/index.astro src/pages/en/products/index.astro src/components/Navbar.astro src/components/Footer.astro src/layouts/Layout.astro
git commit -m "feat: add Productos page"
```

---

### Task 3: Blog content model and seed posts

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/blog-es/arquitectura-sistemas-de-ia.md`
- Create: `src/content/blog-es/notas-sprint-transformacion.md` (draft)
- Create: `src/content/blog-en/ai-systems-architecture.md`
- Create: `src/content/blog-en/transformation-sprint-notes.md` (draft)

**Interfaces:**
- Produces: two collections, `'blog-es'` and `'blog-en'`, each entry typed as `{ id: string; data: { title: string; description: string; pubDate: Date; author: string; tags: string[]; heroImage?: string; draft: boolean } }` (Zod schema below). Task 4 and Task 5 both query these by name.

- [ ] **Step 1: Define the collections**

Create `src/content.config.ts`:

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

- [ ] **Step 2: Add the Spanish seed posts**

Create `src/content/blog-es/arquitectura-sistemas-de-ia.md`:

```markdown
---
title: "Cómo pensamos la arquitectura de sistemas de IA"
description: "Por qué empezamos cada proyecto por los requisitos y el pipeline, no por el modelo de IA que vamos a usar."
pubDate: 2026-09-15
tags: ["arquitectura", "ia"]
---

Cuando un equipo nos busca para construir un sistema de IA, la primera pregunta casi nunca es "¿qué modelo usamos?". Es "¿qué necesita ser verdad para que esto funcione en producción?".

Esa diferencia importa. Un prototipo que responde bien en una demo y un sistema que sostiene usuarios reales son dos cosas distintas — y la brecha entre ambos casi siempre está en el pipeline: cómo se valida la salida del modelo, cómo se observa en producción, y qué pasa cuando falla.

Por eso nuestro proceso empieza por la definición del sistema: fuentes de datos, lineamientos de UI/UX y alcance inicial, antes de tocar una sola línea de código de integración con un modelo. Esto no es burocracia — es lo que nos permite entregar por hitos verificables en lugar de prometer un resultado y esperar que funcione.

En próximos artículos vamos a entrar en más detalle sobre cómo configuramos pipelines de CI/CD listos para IA y cómo medimos si un sistema realmente está listo para producción.
```

Create `src/content/blog-es/notas-sprint-transformacion.md` (draft, not yet published):

```markdown
---
title: "Notas de un sprint de transformación"
description: "Apuntes internos sobre cómo estructuramos un sprint de transformación para un cliente — todavía en edición."
pubDate: 2026-09-28
tags: ["proceso"]
draft: true
---

Borrador — este artículo todavía está en revisión interna antes de publicarse.
```

- [ ] **Step 3: Add the English seed posts**

Create `src/content/blog-en/ai-systems-architecture.md`:

```markdown
---
title: "How we think about AI systems architecture"
description: "Why we start every project with requirements and the pipeline, not with which AI model we'll use."
pubDate: 2026-09-15
tags: ["architecture", "ai"]
---

When a team comes to us to build an AI system, the first question is almost never "which model should we use?". It's "what has to be true for this to hold up in production?".

That difference matters. A prototype that looks great in a demo and a system that holds up under real users are two different things — and the gap between them almost always lives in the pipeline: how the model's output gets validated, how it's observed in production, and what happens when it fails.

That's why our process starts with system definition: data sources, UI/UX guidelines, and initial scope, before a single line of model-integration code gets written. That's not bureaucracy — it's what lets us deliver through verifiable milestones instead of promising a result and hoping it works.

In future posts we'll go deeper into how we set up AI-ready CI/CD pipelines and how we measure whether a system is actually production-ready.
```

Create `src/content/blog-en/transformation-sprint-notes.md` (draft, not yet published):

```markdown
---
title: "Notes from a transformation sprint"
description: "Internal notes on how we structure a transformation sprint for a client — still being edited."
pubDate: 2026-09-28
tags: ["process"]
draft: true
---

Draft — this article is still under internal review before publishing.
```

- [ ] **Step 4: Generate content types and verify**

```bash
pnpm exec astro sync
pnpm exec astro check
pnpm run build
```

Expected: `astro sync` completes without error (confirms both collections parse against `blogSchema` — an invalid date or a missing required field would fail here). `astro check` still shows only the 3 pre-existing errors. `pnpm run build` still succeeds (no page consumes the collections yet, so this just confirms the config itself doesn't break the build).

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/content/blog-es src/content/blog-en
git commit -m "feat: add blog content collections with seed posts"
```

---

### Task 4: Blog listing pages (ES + EN)

**Files:**
- Create: `src/components/pages/BlogPage.astro`
- Create: `src/pages/blog/index.astro`
- Create: `src/pages/en/blog/index.astro`
- Modify: `src/components/Navbar.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/layouts/Layout.astro`
- Modify: `src/i18n/ui.ts`

**Interfaces:**
- Consumes: `getCollection` from `astro:content` against the `'blog-es'`/`'blog-en'` collections defined in Task 3 (fields: `title`, `description`, `pubDate: Date`, `author`, `heroImage?`, `draft`).
- Produces: `/blog` and `/en/blog` routes; new `UiKey`s `nav.blog`, `blog.meta.title`, `blog.meta.description`, `blog.eyebrow`, `blog.title`, `blog.lead`, `blog.readMore`, `blog.empty`.

- [ ] **Step 1: Add the ui.ts keys**

In `src/i18n/ui.ts`, **`es`** block: add `'nav.blog': 'Blog',` right after the `'nav.about.faq'` line and before `'nav.cta'`. Then add a new section after the `---- Nosotros: Equipo ----` block's last line (`'about.team.role': 'Cofundador',`) — i.e. right before the closing `},` of the `es` object:

```ts

    // ---- Blog ----
    'blog.meta.title': 'Blog de Synthetix AI',
    'blog.meta.description': 'Artículos sobre desarrollo de software, arquitectura de IA y agentes autónomos, escritos por el equipo de Synthetix AI.',
    'blog.eyebrow': 'Blog',
    'blog.title': 'Ideas sobre IA y arquitectura de software',
    'blog.lead': 'Notas del equipo sobre lo que estamos construyendo y aprendiendo.',
    'blog.readMore': 'Leer más →',
    'blog.empty': 'Todavía no hay artículos publicados. Vuelve pronto.',
```

In the **`en`** block: add `'nav.blog': 'Blog',` right after `'nav.about.faq': 'FAQ',` and before `'nav.cta'`. Then add, after the `---- Nosotros: Team ----` block's last line (`'about.team.role': 'Co-Founder',`), right before the closing `},` of the `en` object:

```ts

    // ---- Blog ----
    'blog.meta.title': 'Synthetix AI Blog',
    'blog.meta.description': 'Articles on software development, AI architecture, and autonomous agents, written by the Synthetix AI team.',
    'blog.eyebrow': 'Blog',
    'blog.title': 'Ideas on AI and software architecture',
    'blog.lead': 'Notes from the team on what we’re building and learning.',
    'blog.readMore': 'Read more →',
    'blog.empty': 'No articles published yet. Check back soon.',
```

- [ ] **Step 2: Create the BlogPage listing component**

Create `src/components/pages/BlogPage.astro`:

```astro
---
import Layout from '../../layouts/Layout.astro';
import Card from '../Card.astro';
import { useTranslations, localizePath, type Lang } from '../../i18n/utils';
import { getCollection } from 'astro:content';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
const t = useTranslations(lang);

const collectionName = lang === 'es' ? 'blog-es' : 'blog-en';
const posts = (await getCollection(collectionName, ({ data }) => !data.draft)).sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);

const dateFormatter = new Intl.DateTimeFormat(lang === 'es' ? 'es-CO' : 'en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
---
<Layout title={t('blog.meta.title')} description={t('blog.meta.description')} lang={lang}>
  <section>
    <div class="container">
      <span class="eyebrow">{t('blog.eyebrow')}</span>
      <h1>{t('blog.title')}</h1>
      <p class="lead">{t('blog.lead')}</p>
    </div>
  </section>

  <section class="grain-surface">
    <div class="container">
      {posts.length === 0 ? (
        <p>{t('blog.empty')}</p>
      ) : (
        <div class="blog-grid">
          {posts.map((post) => (
            <a href={localizePath(`/blog/${post.id}`, lang)} class="blog-card-link" data-reveal>
              <Card>
                <>
                  {post.data.heroImage && (
                    <img class="blog-card__image" src={post.data.heroImage} alt="" />
                  )}
                  <h3>{post.data.title}</h3>
                  <p class="blog-card__date">{dateFormatter.format(post.data.pubDate)}</p>
                  <p>{post.data.description}</p>
                  <span class="blog-card__readmore">{t('blog.readMore')}</span>
                </>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  </section>
</Layout>

<style>
  .lead { max-width: 560px; font-size: 18px; }
  .blog-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--sx-space-6);
  }
  .blog-card-link { display: block; color: inherit; text-decoration: none; }
  .blog-card__image {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-radius: var(--sx-radius-md);
    margin-bottom: var(--sx-space-4);
  }
  .blog-card__date {
    color: var(--sx-slate-400);
    font-size: var(--fs-sm);
  }
  .blog-card__readmore {
    display: inline-block;
    margin-top: var(--sx-space-2);
    color: var(--sx-tech-cyan);
    font-weight: 600;
    font-size: var(--fs-sm);
  }
  @media (max-width: 900px) {
    .blog-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 560px) {
    .blog-grid { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 3: Create the page wrappers**

Create `src/pages/blog/index.astro`:

```astro
---
import BlogPage from '../../components/pages/BlogPage.astro';
---
<BlogPage lang="es" />
```

Create `src/pages/en/blog/index.astro`:

```astro
---
import BlogPage from '../../../components/pages/BlogPage.astro';
---
<BlogPage lang="en" />
```

- [ ] **Step 4: Add the nav entry**

In `src/components/Navbar.astro`, change (continuing from Task 2's edit):

```ts
  {
    label: t('nav.about'),
    href: localizePath('/nosotros', lang),
    children: [
      { label: t('nav.about.how'), href: localizePath('/nosotros#como-trabajamos', lang) },
      { label: t('nav.about.faq'), href: localizePath('/nosotros#faq', lang) },
    ],
  },
];
```

to:

```ts
  {
    label: t('nav.about'),
    href: localizePath('/nosotros', lang),
    children: [
      { label: t('nav.about.how'), href: localizePath('/nosotros#como-trabajamos', lang) },
      { label: t('nav.about.faq'), href: localizePath('/nosotros#faq', lang) },
    ],
  },
  { label: t('nav.blog'), href: localizePath('/blog', lang) },
];
```

- [ ] **Step 5: Add the footer link**

In `src/components/Footer.astro`, change (continuing from Task 1's edit):

```astro
    <div class="sx-footer__col">
      <h4>{t('footer.col.company')}</h4>
      <a href={localizePath('/nosotros', lang)}>{t('nav.about')}</a>
      <a href={localizePath('/nosotros#faq', lang)}>{t('nav.about.faq')}</a>
    </div>
```

to:

```astro
    <div class="sx-footer__col">
      <h4>{t('footer.col.company')}</h4>
      <a href={localizePath('/nosotros', lang)}>{t('nav.about')}</a>
      <a href={localizePath('/blog', lang)}>{t('nav.blog')}</a>
      <a href={localizePath('/nosotros#faq', lang)}>{t('nav.about.faq')}</a>
    </div>
```

- [ ] **Step 6: Add the breadcrumb label entry**

In `src/layouts/Layout.astro`, change (continuing from Task 2's edit):

```ts
const breadcrumbLabelKeys: Partial<Record<string, Parameters<typeof t>[0]>> = {
  servicios: 'nav.services',
  industrias: 'nav.industries',
  productos: 'nav.products',
  nosotros: 'nav.about',
  contacto: 'footer.col.contact',
  privacidad: 'footer.privacy',
  terminos: 'footer.terms',
};
```

to:

```ts
const breadcrumbLabelKeys: Partial<Record<string, Parameters<typeof t>[0]>> = {
  servicios: 'nav.services',
  industrias: 'nav.industries',
  productos: 'nav.products',
  nosotros: 'nav.about',
  blog: 'nav.blog',
  contacto: 'footer.col.contact',
  privacidad: 'footer.privacy',
  terminos: 'footer.terms',
};
```

- [ ] **Step 7: Verify**

```bash
pnpm exec astro check
pnpm run build
grep -o '<h3>[^<]*</h3>' dist/blog/index.html
grep -o '<h3>[^<]*</h3>' dist/en/blog/index.html
```

Expected: `astro check` shows only the 3 pre-existing errors. Build succeeds. The ES grep prints `<h3>Cómo pensamos la arquitectura de sistemas de IA</h3>` (only the one published post — the draft must not appear). The EN grep prints `<h3>How we think about AI systems architecture</h3>` (same: only the published one).

- [ ] **Step 8: Commit**

```bash
git add src/i18n/ui.ts src/components/pages/BlogPage.astro src/pages/blog/index.astro src/pages/en/blog/index.astro src/components/Navbar.astro src/components/Footer.astro src/layouts/Layout.astro
git commit -m "feat: add blog listing pages"
```

---

### Task 5: Blog post detail pages (ES + EN) with cross-language fallback

**Files:**
- Create: `src/components/pages/BlogPostPage.astro`
- Create: `src/pages/blog/[...id].astro`
- Create: `src/pages/en/blog/[...id].astro`
- Modify: `src/layouts/Layout.astro`
- Modify: `src/components/Navbar.astro`

**Interfaces:**
- Consumes: `render(entry)` and `CollectionEntry<'blog-es' | 'blog-en'>` from `astro:content`; `Layout` and `Navbar`'s existing props.
- Produces: `/blog/<id>` and `/en/blog/<id>` routes for every non-draft entry in each collection. Adds an optional prop `langAlternates?: { es: string; en: string }` to both `Layout.astro` and `Navbar.astro` — when present, it overrides the computed ES/EN link targets (canonical/hreflang tags, the language banner, and the Navbar language switcher) instead of the default same-path `switchLangPath()` translation. Any future page with no reliable cross-locale URL counterpart can reuse this same prop.

- [ ] **Step 1: Add `langAlternates` support to Layout.astro**

In `src/layouts/Layout.astro`, change:

```ts
interface Props {
  title: string;
  lang: Lang;
  description?: string;
  /** Path (or absolute URL) to the Open Graph / Twitter card image. Defaults
   * to the site-wide 1200x630 interim OG image. */
  ogImage?: string;
}
const { title, lang, ogImage = '/og-image.png' } = Astro.props;
const t = useTranslations(lang);
const description = Astro.props.description ?? t('footer.tagline');

const currentPath = Astro.url.pathname;
const esHref = new URL(switchLangPath(currentPath, 'es'), Astro.site).toString();
const enHref = new URL(switchLangPath(currentPath, 'en'), Astro.site).toString();
const canonicalHref = lang === 'es' ? esHref : enHref;
```

to:

```ts
interface Props {
  title: string;
  lang: Lang;
  description?: string;
  /** Path (or absolute URL) to the Open Graph / Twitter card image. Defaults
   * to the site-wide 1200x630 interim OG image. */
  ogImage?: string;
  /** Overrides the ES/EN alternate link targets (canonical/hreflang tags,
   * the language banner, and the Navbar language switcher) for pages whose
   * current URL has no real counterpart in the other locale — e.g. a blog
   * post that only exists in one language. Both values must already be
   * localized paths (built with `localizePath`). */
  langAlternates?: { es: string; en: string };
}
const { title, lang, ogImage = '/og-image.png', langAlternates } = Astro.props;
const t = useTranslations(lang);
const description = Astro.props.description ?? t('footer.tagline');

const currentPath = Astro.url.pathname;
const esHref = new URL(langAlternates?.es ?? switchLangPath(currentPath, 'es'), Astro.site).toString();
const enHref = new URL(langAlternates?.en ?? switchLangPath(currentPath, 'en'), Astro.site).toString();
const canonicalHref = lang === 'es' ? esHref : enHref;
```

Then change:

```ts
const otherLang: Lang = lang === 'es' ? 'en' : 'es';
const tOther = useTranslations(otherLang);
const langBannerHref = switchLangPath(currentPath, otherLang);
```

to:

```ts
const otherLang: Lang = lang === 'es' ? 'en' : 'es';
const tOther = useTranslations(otherLang);
const langBannerHref = langAlternates ? langAlternates[otherLang] : switchLangPath(currentPath, otherLang);
```

Then change the `<Navbar lang={lang} />` call to:

```astro
    <Navbar lang={lang} langAlternates={langAlternates} />
```

- [ ] **Step 2: Add `langAlternates` support to Navbar.astro**

In `src/components/Navbar.astro`, change:

```ts
interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
```

to:

```ts
interface Props {
  lang: Lang;
  langAlternates?: { es: string; en: string };
}
const { lang, langAlternates } = Astro.props;
```

Then change:

```astro
        {(Object.keys(languages) as Lang[]).map((l) => (
          <a
            href={switchLangPath(currentPath, l)}
            data-lang={l}
            class:list={['sx-lang__btn', { 'is-active': l === lang }]}
            aria-current={l === lang ? 'true' : undefined}
          >{languages[l]}</a>
        ))}
```

to:

```astro
        {(Object.keys(languages) as Lang[]).map((l) => (
          <a
            href={langAlternates ? langAlternates[l] : switchLangPath(currentPath, l)}
            data-lang={l}
            class:list={['sx-lang__btn', { 'is-active': l === lang }]}
            aria-current={l === lang ? 'true' : undefined}
          >{languages[l]}</a>
        ))}
```

- [ ] **Step 3: Create the BlogPostPage detail component**

Create `src/components/pages/BlogPostPage.astro`:

```astro
---
import Layout from '../../layouts/Layout.astro';
import { render, type CollectionEntry } from 'astro:content';
import { useTranslations, localizePath, type Lang } from '../../i18n/utils';

interface Props {
  lang: Lang;
  entry: CollectionEntry<'blog-es' | 'blog-en'>;
}
const { lang, entry } = Astro.props;
const t = useTranslations(lang);
const { Content } = await render(entry);

const dateFormatter = new Intl.DateTimeFormat(lang === 'es' ? 'es-CO' : 'en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

// This post's slug has no guaranteed counterpart in the other language, so
// the ES/EN switcher falls back to that language's blog index rather than
// attempting a same-slug translation (see Layout.astro's `langAlternates`).
const langAlternates = { es: localizePath('/blog', 'es'), en: localizePath('/blog', 'en') };
---
<Layout
  title={`${entry.data.title} — ${t('blog.eyebrow')}`}
  description={entry.data.description}
  lang={lang}
  langAlternates={langAlternates}
>
  <article>
    <div class="container">
      <span class="eyebrow">{t('blog.eyebrow')}</span>
      <h1>{entry.data.title}</h1>
      <p class="post-meta">{dateFormatter.format(entry.data.pubDate)} · {entry.data.author}</p>
      {entry.data.heroImage && (
        <img class="post-hero" src={entry.data.heroImage} alt="" />
      )}
      <div class="post-body">
        <Content />
      </div>
    </div>
  </article>
</Layout>

<style>
  .post-meta {
    color: var(--sx-slate-400);
    font-size: var(--fs-sm);
    margin-bottom: var(--sx-space-6);
  }
  .post-hero {
    width: 100%;
    max-height: 420px;
    object-fit: cover;
    border-radius: var(--sx-radius-lg);
    margin-bottom: var(--sx-space-8);
  }
  .post-body {
    max-width: 720px;
  }
  .post-body :global(h2) {
    margin-top: var(--sx-space-8);
  }
  .post-body :global(p) {
    margin-bottom: var(--sx-space-4);
  }
</style>
```

- [ ] **Step 4: Create the detail routes**

Create `src/pages/blog/[...id].astro`:

```astro
---
import { getCollection } from 'astro:content';
import BlogPostPage from '../../components/pages/BlogPostPage.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog-es', ({ data }) => !data.draft);
  return posts.map((entry) => ({
    params: { id: entry.id },
    props: { entry },
  }));
}

const { entry } = Astro.props;
---
<BlogPostPage lang="es" entry={entry} />
```

Create `src/pages/en/blog/[...id].astro`:

```astro
---
import { getCollection } from 'astro:content';
import BlogPostPage from '../../../components/pages/BlogPostPage.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog-en', ({ data }) => !data.draft);
  return posts.map((entry) => ({
    params: { id: entry.id },
    props: { entry },
  }));
}

const { entry } = Astro.props;
---
<BlogPostPage lang="en" entry={entry} />
```

- [ ] **Step 5: Verify**

```bash
pnpm exec astro check
pnpm run build
test -f dist/blog/arquitectura-sistemas-de-ia/index.html && echo "OK: ES post built"
test -f dist/en/blog/ai-systems-architecture/index.html && echo "OK: EN post built"
test ! -e dist/blog/notas-sprint-transformacion && echo "OK: ES draft not built"
test ! -e dist/en/blog/transformation-sprint-notes && echo "OK: EN draft not built"
grep -o 'class="sx-lang__btn"[^>]*href="[^"]*"' dist/blog/arquitectura-sistemas-de-ia/index.html
```

Expected: `astro check` shows only the 3 pre-existing errors. Build succeeds. All four `test`/`echo` lines print their `OK` message. The final `grep` (adjust attribute order if needed — the point is to inspect the rendered `sx-lang__btn` anchors) shows the EN language-switcher link pointing at `/en/blog/` (the blog index), not at a nonexistent `/en/blog/arquitectura-sistemas-de-ia/`.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/Layout.astro src/components/Navbar.astro src/components/pages/BlogPostPage.astro "src/pages/blog/[...id].astro" "src/pages/en/blog/[...id].astro"
git commit -m "feat: add blog post detail pages"
```

---

### Task 6: Avatar photo support

**Files:**
- Modify: `src/components/Avatar.astro`

**Interfaces:**
- Produces: `Avatar` props become `{ initials: string; photo?: ImageMetadata }` — Task 7's `NosotrosPage.astro` is the consumer (passes no `photo` for now, keeping today's initials look).

- [ ] **Step 1: Add the optional photo prop**

In `src/components/Avatar.astro`, change the whole file to:

```astro
---
interface Props {
  initials: string;
  photo?: ImageMetadata;
}
const { initials, photo } = Astro.props;
---
{photo ? (
  <img
    class="sx-avatar sx-avatar--photo"
    src={photo.src}
    width={photo.width}
    height={photo.height}
    alt=""
  />
) : (
  <div class="sx-avatar" aria-hidden="true">{initials}</div>
)}

<style>
  .sx-avatar {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--sx-gradient-cyan);
    color: #fff;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: var(--fs-h2);
    margin: 0 auto var(--sx-space-4);
  }
  .sx-avatar--photo {
    object-fit: cover;
    background: var(--sx-slate-800);
  }
</style>
```

- [ ] **Step 2: Verify**

```bash
pnpm exec astro check
pnpm run build
grep -o '<h1>[^<]*</h1>' dist/nosotros/index.html
```

Expected: `astro check` shows only the 3 pre-existing errors (no new error — `NosotrosPage.astro` still calls `<Avatar initials={member.initials} />` with no `photo`, which the new optional prop accepts unchanged). Build succeeds, and the Nosotros page still renders (confirms this change didn't break the existing page before Task 7 touches it).

- [ ] **Step 3: Commit**

```bash
git add src/components/Avatar.astro
git commit -m "feat: support an optional photo on Avatar, falling back to initials"
```

---

### Task 7: Nosotros team role, bio, and layout

**Files:**
- Modify: `src/components/pages/NosotrosPage.astro`
- Modify: `src/i18n/ui.ts`

**Interfaces:**
- Consumes: `Avatar` component's `{ initials; photo? }` props from Task 6.

- [ ] **Step 1: Replace the shared role key with per-person role/bio keys**

By this point in the plan, Task 4 has already inserted a `---- Blog ----`
section right after this line in both locale blocks, so target only the
`about.team.role` line itself (unique in each block) rather than the
surrounding block — the closing `},` of the object is no longer adjacent
to it.

In `src/i18n/ui.ts`, **`es`** block, change:

```ts
    'about.team.role': 'Cofundador',
```

to:

```ts
    'about.team.cristian.role': 'Equipo Fundador',
    'about.team.cristian.bio': 'Contribuye a la dirección técnica y de producto de Synthetix AI.',
    'about.team.sergio.role': 'Equipo Fundador',
    'about.team.sergio.bio': 'Contribuye a la dirección técnica y de producto de Synthetix AI.',
    'about.team.santiago.role': 'Equipo Fundador',
    'about.team.santiago.bio': 'Contribuye a la dirección técnica y de producto de Synthetix AI.',
    'about.team.mateo.role': 'Equipo Fundador',
    'about.team.mateo.bio': 'Contribuye a la dirección técnica y de producto de Synthetix AI.',
```

In the **`en`** block, change:

```ts
    'about.team.role': 'Co-Founder',
```

to:

```ts
    'about.team.cristian.role': 'Founding Team',
    'about.team.cristian.bio': 'Contributes to Synthetix AI’s technical and product direction.',
    'about.team.sergio.role': 'Founding Team',
    'about.team.sergio.bio': 'Contributes to Synthetix AI’s technical and product direction.',
    'about.team.santiago.role': 'Founding Team',
    'about.team.santiago.bio': 'Contributes to Synthetix AI’s technical and product direction.',
    'about.team.mateo.role': 'Founding Team',
    'about.team.mateo.bio': 'Contributes to Synthetix AI’s technical and product direction.',
```

- [ ] **Step 2: Update the team data and markup in NosotrosPage.astro**

In `src/components/pages/NosotrosPage.astro`, change:

```ts
const team = [
  { name: "Cristian Montes", initials: "CM" },
  { name: "Sergio Molina", initials: "SM" },
  { name: "Santiago Rentería", initials: "SR" },
  { name: "Mateo Rodríguez", initials: "MR" },
];
```

to:

```ts
const team: { name: string; initials: string; role: UiKey; bio: UiKey }[] = [
  { name: "Cristian Montes", initials: "CM", role: "about.team.cristian.role", bio: "about.team.cristian.bio" },
  { name: "Sergio Molina", initials: "SM", role: "about.team.sergio.role", bio: "about.team.sergio.bio" },
  { name: "Santiago Rentería", initials: "SR", role: "about.team.santiago.role", bio: "about.team.santiago.bio" },
  { name: "Mateo Rodríguez", initials: "MR", role: "about.team.mateo.role", bio: "about.team.mateo.bio" },
];
```

Then change:

```astro
      <div class="team-grid">
        {
          team.map((member) => (
            <div class="team-card" data-reveal>
              <Avatar initials={member.initials} />
              <h4>{member.name}</h4>
              <p class="team-role">{t("about.team.role")}</p>
            </div>
          ))
        }
      </div>
```

to:

```astro
      <div class="team-grid">
        {
          team.map((member) => (
            <div class="team-card" data-reveal>
              <Avatar initials={member.initials} />
              <h4>{member.name}</h4>
              <p class="team-role">{t(member.role)}</p>
              <p class="team-bio">{t(member.bio)}</p>
            </div>
          ))
        }
      </div>
```

- [ ] **Step 3: Update the team grid layout styles**

In the same file's `<style>` block, change:

```css
  .team-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--sx-space-6);
    text-align: center;
  }
  .team-card h4 {
    margin: var(--sx-space-2) 0 var(--sx-space-1);
  }
  .team-role {
    color: var(--sx-slate-400);
    font-size: var(--fs-sm);
    margin: 0;
  }
```

to:

```css
  .team-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sx-space-6);
    text-align: center;
  }
  .team-card h4 {
    margin: var(--sx-space-2) 0 var(--sx-space-1);
  }
  .team-role {
    color: var(--sx-slate-400);
    font-size: var(--fs-sm);
    margin: 0;
  }
  .team-bio {
    font-size: var(--fs-sm);
    margin: var(--sx-space-3) auto 0;
    max-width: 42ch;
  }
```

Then, since `.team-grid` is now `repeat(2, 1fr)` by default, remove the now-redundant override inside the `@media (max-width: 900px)` block. Change:

```css
  @media (max-width: 900px) {
    .grid-3 {
      grid-template-columns: 1fr 1fr;
    }
    .grid-3 > :last-child {
      grid-column: 1 / -1;
    }
    .team-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
```

to:

```css
  @media (max-width: 900px) {
    .grid-3 {
      grid-template-columns: 1fr 1fr;
    }
    .grid-3 > :last-child {
      grid-column: 1 / -1;
    }
  }
```

(leave the `@media (max-width: 560px)` block's `.team-grid { grid-template-columns: 1fr; }` untouched — mobile still collapses to one column).

- [ ] **Step 4: Verify**

```bash
pnpm exec astro check
pnpm run build
grep -o '<p class="team-role">[^<]*</p>' dist/nosotros/index.html
grep -o '<p class="team-bio">[^<]*</p>' dist/nosotros/index.html
grep -o '<p class="team-role">[^<]*</p>' dist/en/about/index.html
```

Expected: `astro check` shows only the 3 pre-existing errors. Build succeeds. The first `grep` prints four `Equipo Fundador` lines (one per team member). The second prints four bio paragraphs. The third (EN page) prints four `Founding Team` lines.

- [ ] **Step 5: Commit**

```bash
git add src/components/pages/NosotrosPage.astro src/i18n/ui.ts
git commit -m "feat: add per-person role and bio to the Nosotros team section"
```

---

### Task 8: Full-site verification

**Files:** none (verification only).

- [ ] **Step 1: Full build and type check**

```bash
pnpm install
pnpm run build
pnpm exec astro check
```

Expected: install succeeds with no changes (no new dependencies were added anywhere in this plan). Build succeeds. `astro check` reports exactly the 3 pre-existing errors listed in `AGENTS.md`'s Unverified section and nothing else.

- [ ] **Step 2: Confirm removed routes are gone and new routes exist**

```bash
test ! -d dist/carreras && test ! -d dist/casos-de-exito && test ! -d dist/en/careers && test ! -d dist/en/case-studies
test -f dist/productos/index.html && test -f dist/en/products/index.html
test -f dist/blog/index.html && test -f dist/en/blog/index.html
test -f dist/blog/arquitectura-sistemas-de-ia/index.html && test -f dist/en/blog/ai-systems-architecture/index.html
echo "OK: all route assertions passed"
```

Expected: `OK: all route assertions passed` prints (if any `test` fails, the `&&` chain stops and the final `echo` does not print — that's the failure signal).

- [ ] **Step 3: Manual smoke test in the dev server**

Per `CLAUDE.md`'s dev workflow:

```bash
astro dev --background
astro dev status
```

Then, with the dev server running, open each of these in a browser (or
inspect with `curl -s http://localhost:4321/<path>/`) and confirm:
- `/` and `/en/` — Navbar shows Servicios, Industrias, Productos, Nosotros, Blog (no Carreras/Casos de Éxito) on both locales.
- `/productos/` and `/en/products/` — page renders with the 2 placeholder product cards.
- `/blog/` and `/en/blog/` — listing shows exactly one card each (the published seed post; the draft is absent).
- `/blog/arquitectura-sistemas-de-ia/` and `/en/blog/ai-systems-architecture/` — post renders with hero eyebrow/date/author/body; the EN/ES switcher link (inspect the `sx-lang__btn` anchors) points at the other language's `/blog/` index, not a 404.
- `/nosotros/` and `/en/about/` — team section shows 2 columns, each card with name, role, and bio paragraph.
- Footer on any page — Servicios column includes Productos; Compañía column includes Blog, no longer includes Carreras/Casos de Éxito.

Stop the server when done:

```bash
astro dev stop
```

- [ ] **Step 4: No commit for this task** — it's verification-only; if any check fails, go back to the relevant task, fix, and re-commit there.
