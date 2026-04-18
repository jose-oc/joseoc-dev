import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  tags: z.array(z.string()),
  category: z.string(),
  language: z.enum(['en', 'es']),
  draft: z.boolean().optional().default(false),
  slug: z.string(),
  relatedSlug: z.string().optional(),
});

const en = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/en" }),
  schema: blogSchema,
});

const es = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/es" }),
  schema: blogSchema,
});

export const collections = { en, es };
