// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import { slugMap } from './src/i18n/routes.js';

// H-1: the old /en/<spanish-slug> URLs are no longer real pages (the
// directories were renamed to English slugs — see src/i18n/routes.ts and
// src/pages/en/*). Each old slug still has a stub page
// (src/pages/en/<spanish-slug>/index.astro) that 301s on request to its
// new /en/<english-slug> home; those stubs are on-demand
// (`export const prerender = false`), not indexable content, so exclude
// them from the sitemap alongside /404. Derived from the same slug map the
// stub pages consume, so this list can't drift out of sync with them.
const oldEnSlugPaths = Object.keys(slugMap).map((esSlug) => `/en/${esSlug}`);

// https://astro.build/config
export default defineConfig({
  site: 'https://www.synthetixaisas.com',

  // Canonical/hreflang tags and the sitemap all emit trailing-slash URLs;
  // pin this so internal links (localizePath/switchLangPath) agree with them.
  trailingSlash: 'always',

  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/404') && !oldEnSlugPaths.some((path) => page.includes(path)),
    }),
  ],

  adapter: vercel(),
});
