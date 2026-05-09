import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const isProd = import.meta.env.PROD;
  const docs = await getCollection('docs', (entry) => isProd ? !entry.data.draft : true);
  const blogs = await getCollection('blog', (entry) => isProd ? !entry.data.draft : true);
  
  const allContent = [...docs, ...blogs];

  return allContent.map((doc) => {
    const parts = doc.id.split('/');
    const lang = parts[0];
    
    // Fallback to filename if no frontmatter slug is defined
    const fallbackSlug = parts.slice(1).join('/').replace(/\.mdx?$/, '');
    const slug = doc.data.slug || fallbackSlug;
    
    return {
      params: { lang, slug },
      props: { doc },
    };
  });
}

export async function GET({ props }) {
  const { doc } = props;
  return new Response(doc.body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
