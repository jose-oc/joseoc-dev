import { getCollection } from 'astro:content';
import { getSidebarConfig } from '../config/sidebar';

export async function GET() {
  const isProd = import.meta.env.PROD;
  
  // Fetch docs and blogs collections
  const docs = await getCollection('docs', (entry) => isProd ? !entry.data.draft : true);
  const blogs = await getCollection('blog', (entry) => isProd ? !entry.data.draft : true);
  
  let content = `# Jose Ortiz\n\n`;
  content += `> IT Documentation, DevOps guides, and technical articles by Jose Ortiz.\n\n`;
  content += `This site hosts comprehensive setup guides, documentation, and how-tos for macOS configuration, Python, Git, Networking, Observability, and Authentication.\n\n`;
  
  // --- Section 1: Core Documentation (dynamic from Sidebar Config) ---
  const sidebarConfig = getSidebarConfig('en');
  
  for (const group of sidebarConfig.docs) {
    const groupItems = [];
    for (const item of group.items) {
      const matchedDoc = docs.find(d => {
        const parts = d.id.split('/');
        const lang = parts[0];
        if (lang !== 'en') return false;
        const dSlug = d.data.slug || parts.slice(1).join('/').replace(/\.mdx?$/, '');
        return dSlug === item.slug;
      });
      if (matchedDoc) {
        groupItems.push({
          label: item.label.replace(/^·\s*/, ''),
          slug: item.slug,
          description: matchedDoc.data.description || matchedDoc.data.title || ''
        });
      }
    }
    
    if (groupItems.length > 0) {
      content += `## ${group.label}\n\n`;
      for (const item of groupItems) {
        content += `- [${item.label}](https://www.joseoc.dev/raw/${item.slug}.md): ${item.description}\n`;
      }
      content += `\n`;
    }
  }
  
  // --- Section 2: Blog Posts ---
  const enBlogs = blogs
    .filter(b => b.id.startsWith('en/'))
    .map(b => {
      const parts = b.id.split('/');
      const bSlug = b.data.slug || parts.slice(1).join('/').replace(/\.mdx?$/, '');
      return {
        title: b.data.title,
        slug: bSlug,
        description: b.data.description || ''
      };
    });
    
  if (enBlogs.length > 0) {
    content += `## Blog Posts\n\n`;
    for (const post of enBlogs) {
      content += `- [${post.title}](https://www.joseoc.dev/raw/${post.slug}.md): ${post.description}\n`;
    }
    content += `\n`;
  }
  
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
