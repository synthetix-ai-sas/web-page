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