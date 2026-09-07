/**
 * Single source of truth for the ES↔EN slug map for translated routes.
 *
 * Keys are the canonical (Spanish, default-locale) route slugs. Values are
 * the English slugs served under `/en/`. Consumed by `localizePath()` /
 * `switchLangPath()` in `src/i18n/utils.ts`, by the 8 on-demand redirect
 * stub pages at `src/pages/en/<spanish-slug>/index.astro` (301s from the
 * old `/en/<spanish-slug>` paths), and by the sitemap filter in
 * `astro.config.mjs` that excludes those stubs, so none of the three can
 * drift apart.
 */
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

/** Reverse of `slugMap`: English slug -> Spanish slug. */
export const reverseSlugMap: Record<string, string> = Object.fromEntries(
  Object.entries(slugMap).map(([es, en]) => [en, es])
);
