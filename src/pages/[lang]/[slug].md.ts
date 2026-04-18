import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export async function getStaticPaths() {
  const enPosts = await getCollection('en');
  const esPosts = await getCollection('es');

  const enPaths = enPosts.map((post) => ({
    params: { lang: 'en', slug: post.data.slug },
    props: { post },
  }));

  const esPaths = esPosts.map((post) => ({
    params: { lang: 'es', slug: post.data.slug },
    props: { post },
  }));

  return [...enPaths, ...esPaths];
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props;
  
  return new Response(post.body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
};
