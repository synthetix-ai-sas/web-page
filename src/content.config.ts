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
