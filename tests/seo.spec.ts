import { test, expect } from '@playwright/test';

// NOTE: This is a "smoke test" suite that checks representative pages of each type.
// It ensures that the global SEO logic in BaseLayout.astro is working correctly.
//
// If you want 100% coverage, you could modify this to read the generated sitemap.xml 
// and loop through all URLs, but that would make the tests significantly slower 
// to run as the site grows.
const pagesToTest = [
  '/',
  '/es',
  '/about',
  '/es/about',
  '/blog',
  '/es/blog',
  '/docs/macos-setup-guide',
  '/es/docs/macos-setup-guide',
  '/category/engineering',
  '/tag/macos',
];

test.describe('SEO Metadata Audits', () => {
  
  for (const path of pagesToTest) {
    test(`Page "${path}" should have essential SEO tags`, async ({ page }) => {
      await page.goto(path);
      
      // 1. Title tag
      const title = await page.title();
      expect(title.length).toBeGreaterThanOrEqual(4);
      
      // 2. Meta description
      const description = page.locator('meta[name="description"]');
      await expect(description).toBeAttached();
      await expect(description).toHaveAttribute('content', /.+/);
      const descContent = await description.getAttribute('content');
      expect(descContent?.length).toBeGreaterThan(10);
      
      // 3. Canonical tag
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toBeAttached();
      await expect(canonical).toHaveAttribute('href', /https:\/\/joseoc.dev.*/);
      
      // 4. Hreflang tags (must be absolute)
      const enTag = page.locator('link[hreflang="en"]');
      const esTag = page.locator('link[hreflang="es"]');
      await expect(enTag).toHaveAttribute('href', /https:\/\/joseoc.dev.*/);
      await expect(esTag).toHaveAttribute('href', /https:\/\/joseoc.dev.*/);

      // 5. LLM Optimization (Hidden markdown link)
      const markdownLink = page.locator('link[type="text/markdown"]');
      // For docs we expect the markdown link to be present
      if (path.includes('/docs/')) {
        await expect(markdownLink).toHaveAttribute('href', /.*\.md$/);
      }
    });
  }

  test('404 page should have noindex tag', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', 'noindex');
  });

});
