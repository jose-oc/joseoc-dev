// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeMermaid from 'rehype-mermaid';
import remarkGithubAlerts from 'remark-github-alerts';
import { visit } from 'unist-util-visit';

function remarkHiddenText() {
  return (tree) => {
    visit(tree, (node, index, parent) => {
      if (node.type === 'text' || node.type === 'code' || node.type === 'inlineCode') {
        const regex = /%%[\s\S]*?%%/g;
        if (regex.test(node.value)) {
          node.value = node.value.replace(regex, '');
        }
      }
    });
  };
}

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
    remarkPlugins: [remarkGithubAlerts, remarkHiddenText],
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
  site: 'https://joseoc.dev',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});