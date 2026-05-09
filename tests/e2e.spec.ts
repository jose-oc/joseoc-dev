import { test, expect } from '@playwright/test';

test.describe('Routing and Navigation', () => {

  test('Home page serves root', async ({ page }) => {
    // Go to root
    await page.goto('/');
    await expect(page).toHaveURL(/.*\//);
    const heading = page.locator('main h1');
    await expect(heading).toBeVisible();
    await expect(heading).not.toContainText('404');
  });

  test('Docs link in header redirects to first documentation article', async ({ page }) => {
    await page.goto('/');
    // Click the "Docs" link in the header nav
    await page.click('nav >> text=Docs');
    // Wait for URL to update to the first doc slug (macos-setup-guide)
    await expect(page).toHaveURL(/.*\/docs\/macos-setup-guide/);
    const heading = page.locator('main h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Mac');
  });

  test('404 page is displayed for invalid routes', async ({ page }) => {
    const response = await page.goto('/invalid-fake-route');
    // Note: Astro dev server might return 404 status, or static might return 404.html
    expect(response?.status()).toBe(404);
    const heading = page.locator('h1').first();
    await expect(heading).toHaveText('404');
    await expect(page.locator('text=Page not found')).toBeVisible();
  });

});

test.describe('Language Switcher & SEO', () => {

  test('Language switcher toggles correctly while preserving the slug', async ({ page }) => {
    // Go to a specific English doc
    await page.goto('/docs/python-environment-direnv');
    
    // Find the language switcher (it currently displays "EN" and clicking switches to ES)
    const langSwitcher = page.locator('a[aria-label="Switch to Spanish"]');
    await expect(langSwitcher).toBeVisible();
    
    // Click to switch language
    await langSwitcher.click();
    
    // Verify the URL changed to /es/ but kept the same slug
    await expect(page).toHaveURL(/.*\/es\/docs\/python-environment-direnv/);
    
    // The language switcher should now display "ES" and aria-label should point back to English
    const englishSwitcher = page.locator('a[aria-label="Switch to English"]');
    await expect(englishSwitcher).toBeVisible();
  });

  test('SEO hreflang tags are generated for documentation pages', async ({ page }) => {
    await page.goto('/docs/python-environment-direnv');
    
    // Check that hreflang tags exist in the <head>
    const enTag = page.locator('link[hreflang="en"]');
    await expect(enTag).toHaveAttribute('href', '/docs/python-environment-direnv');

    const esTag = page.locator('link[hreflang="es"]');
    await expect(esTag).toHaveAttribute('href', '/es/docs/python-environment-direnv');
  });
});

test.describe('Taxonomy Routing', () => {

  test('Category links route to the correct category archive page', async ({ page }) => {
    // Go to an article that has a category defined
    await page.goto('/docs/macos-setup-guide');
    
    // Click the category link (which is uppercase in the UI due to CSS, but the DOM text is lowercase 'engineering')
    // We use a broader locator to find the link containing 'engineering'
    await page.click('a[href="/category/engineering"]');
    
    // Expect URL to be /category/engineering
    await expect(page).toHaveURL(/.*\/category\/engineering/);
    
    // Expect heading to contain the category name
    const heading = page.locator('main h1');
    await expect(heading).toContainText('engineering', { ignoreCase: true });
  });

  test('Tag links route to the correct tag archive page', async ({ page }) => {
    // Go to an article that has tags defined
    await page.goto('/docs/macos-setup-guide');
    
    // Click the #macos tag
    await page.click('a:has-text("#macos")');
    
    // Expect URL to be /tag/macos
    await expect(page).toHaveURL(/.*\/tag\/macos/);
    
    // Expect heading to contain Tag: #macos
    const heading = page.locator('main h1');
    await expect(heading).toContainText('#macos', { ignoreCase: true });
  });

});
