import { test, expect } from '@playwright/test';

test.describe('Zoom Lightbox', () => {
  test('should open lightbox when clicking on a Mermaid diagram', async ({ page }) => {
    // Go to a page with a Mermaid diagram
    await page.goto('/docs/splitting-aws-route53-hosted-zone-into-delegated-subdomains');
    
    // Wait for the Mermaid diagram to be rendered
    const mermaidSvg = page.locator('svg[id^="mermaid-"]').first();
    await expect(mermaidSvg).toBeVisible();
    
    // Click on the diagram
    await mermaidSvg.click();
    
    // Check if the modal is visible
    const modal = page.locator('.mermaid-modal');
    await expect(modal).toBeVisible();
    
    // Check if the modal contains an SVG
    const modalSvg = modal.locator('svg');
    await expect(modalSvg).toBeVisible();
    
    // Click on the modal to close it
    await modal.click();
    
    // Check if the modal is gone
    await expect(modal).not.toBeVisible();
  });

  test('should open lightbox when clicking on an image in a blog post', async ({ page }) => {
    // Go to a blog post or doc with images
    await page.goto('/docs/macos-setup-guide/secrets-and-environment-management');
    
    // Wait for an image
    const image = page.locator('.prose img').first();
    await expect(image).toBeVisible();
    
    // Click on the image
    await image.click();
    
    // Check if the modal is visible
    const modal = page.locator('.mermaid-modal');
    await expect(modal).toBeVisible();
    
    // Check if the modal contains an image
    const modalImg = modal.locator('img');
    await expect(modalImg).toBeVisible();
    
    // Press Escape to close
    await page.keyboard.press('Escape');
    
    // Check if the modal is gone
    await expect(modal).not.toBeVisible();
  });
});
