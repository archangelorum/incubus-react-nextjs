import { test, expect } from '@playwright/test';

test.describe('Navigation and Routing', () => {
  test('should redirect to default locale (en) when accessing root', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en/);
  });

  test('should navigate between pages with locale preserved', async ({ page }) => {
    // Start at the home page with English locale
    await page.goto('/en');
    
    // Navigate to games page
    await page.getByText(/games/i).first().click();
    await expect(page).toHaveURL(/\/en\/games/);
    
    // Navigate to marketplace
    await page.getByText(/marketplace/i).first().click();
    await expect(page).toHaveURL(/\/en\/marketplace/);
  });

  test('should handle different locales correctly', async ({ page }) => {
    // Test English locale
    await page.goto('/en/games');
    await expect(page.locator('h1')).toContainText('Games', { ignoreCase: true });
    
    // Test French locale
    await page.goto('/fr/games');
    // Even with French locale, the URL path remains 'games' (not 'jeux')
    // But the content should be in French
    await expect(page).toHaveURL(/\/fr\/games/);
    
    // Test Spanish locale
    await page.goto('/es/games');
    await expect(page).toHaveURL(/\/es\/games/);
  });

  test('should handle 404 pages correctly', async ({ page }) => {
    // Access a non-existent page
    await page.goto('/en/non-existent-page');
    
    // Check if we get a proper 404 page
    // This assumes your 404 page has some specific text or element
    await expect(page.locator('body')).toContainText(/not found|404/i);
  });

  test('should navigate to game details page', async ({ page }) => {
    // Start at the games page
    await page.goto('/en/games');
    
    // Wait for game cards to be visible
    await page.waitForSelector('[data-testid="game-card"]');
    
    // Click on the first game card
    await page.locator('[data-testid="game-card"]').first().click();
    
    // Verify we're on a game detail page
    await expect(page).toHaveURL(/\/en\/games\/[\w-]+/);
    
    // Verify the game title is displayed
    await expect(page.locator('[data-testid="game-title"]')).toBeVisible();
  });
});