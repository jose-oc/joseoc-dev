// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeMermaid from 'rehype-mermaid';
import remarkGithubAlerts from 'remark-github-alerts';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  markdown: {
    syntaxHighlight: {
      type: 'shiki',
      excludeLangs: ['mermaid'],
    },
    remarkPlugins: [remarkGithubAlerts],
    rehypePlugins: [
      [rehypeMermaid, { 
        strategy: 'inline-svg',
        mermaidConfig: {
          theme: 'neutral'
        }
      }]
    ]
  },

  integrations: [mdx(), sitemap()],
  site: 'https://example.com', // Replace with actual domain
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});