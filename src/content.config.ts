import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const baseSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  pubDate: z.date().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  draft: z.boolean().optional(),
  slug: z.string().optional(),
});

const docsCollection = defineCollection({
  loader: glob({ 
    pattern: "{en,es}/**/*.md", 
    base: "./src/content",
    generateId: ({ entry }) => entry,
  }),
  schema: baseSchema,
});

const blogCollection = defineCollection({
  loader: glob({ 
    pattern: "**/*.md", 
    base: "./src/content/blog",
    generateId: ({ entry }) => entry,
  }),
  schema: baseSchema.extend({
    type: z.literal('blog').default('blog'),
    author: z.string().optional(),
  }),
});

export const collections = {
  'docs': docsCollection,
  'blog': blogCollection,
};
