import { test, expect } from '@playwright/test';

test.describe('Error Handling and Edge Cases', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    // Navigate to a non-existent page
    await page.goto('/en/non-existent-page');
    
    // Check if a 404 page is displayed
    // This assumes your 404 page has some specific text or element
    await expect(page.locator('body')).toContainText(/not found|404/i);
    
    // Check if the 404 page has navigation elements to help users
    await expect(page.locator('a')).toBeVisible(); // Should have at least one link
  });

  test('should handle non-existent game slug gracefully', async ({ page }) => {
    // Navigate to a non-existent game detail page
    await page.goto('/en/games/non-existent-game-slug');
    
    // Check if an appropriate error message is displayed
    await expect(page.locator('body')).toContainText(/not found|doesn't exist|no longer available/i);
  });

  test('should handle loading states for game grid', async ({ page }) => {
    // Navigate to the games page with network throttling to observe loading states
    await page.route('**/api/games**', async route => {
      // Delay the API response to simulate slow network
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    await page.goto('/en/games');
    
    // Check if loading state is displayed before data loads
    await expect(page.locator('.animate-pulse')).toBeVisible();
    
    // Wait for the actual content to load
    await page.waitForSelector('[data-testid="game-card"]', { state: 'visible' });
    
    // Check if loading state is replaced with actual content
    await expect(page.locator('[data-testid="game-card"]')).toBeVisible();
  });

  test('should handle empty search results gracefully', async ({ page }) => {
    // Navigate to the games page
    await page.goto('/en/games');
    
    // Perform a search that's unlikely to return results
    const searchInput = page.getByPlaceholder(/search/i);
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('xyznonexistentgamexyz');
      await searchInput.press('Enter');
      
      // Wait for the page to update
      await page.waitForLoadState('load');
      
      // Check if an appropriate "no results" message is displayed
      await expect(page.locator('text=/no games found|no results/i')).toBeVisible();
    }
  });

  test('should handle browser back/forward navigation correctly', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/en');
    
    // Navigate to the games page
    await page.getByText(/games/i).first().click();
    await expect(page).toHaveURL(/\/en\/games/);
    
    // Navigate to the marketplace page
    await page.getByText(/marketplace/i).first().click();
    await expect(page).toHaveURL(/\/en\/marketplace/);
    
    // Go back to the games page
    await page.goBack();
    await expect(page).toHaveURL(/\/en\/games/);
    
    // Go forward to the marketplace page
    await page.goForward();
    await expect(page).toHaveURL(/\/en\/marketplace/);
  });

  test('should handle page refresh without losing state', async ({ page }) => {
    // Navigate to the games page
    await page.goto('/en/games');
    
    // Apply a filter or sort
    const sortDropdown = page.getByRole('button', { name: /sort/i });
    
    if (await sortDropdown.count() > 0) {
      await sortDropdown.click();
      await page.getByRole('option', { name: /price.*low/i }).click();
      
      // Wait for the page to update
      await page.waitForLoadState('load');
      
      // Check if the URL contains the sort parameter
      await expect(page).toHaveURL(/sort=price.*order=asc/);
      
      // Refresh the page
      await page.reload();
      
      // Check if the sort parameter is preserved
      await expect(page).toHaveURL(/sort=price.*order=asc/);
    }
  });

  test('should handle invalid URL parameters gracefully', async ({ page }) => {
    // Navigate to the games page with invalid parameters
    await page.goto('/en/games?sort=invalid&order=invalid&page=abc');
    
    // The page should still load without errors
    await page.waitForSelector('[data-testid="game-card"]', { state: 'visible' });
    
    // Check if game cards are displayed
    await expect(page.locator('[data-testid="game-card"]')).toBeVisible();
  });

  test('should handle extreme viewport sizes', async ({ page }) => {
    // Test with an extremely small viewport
    await page.setViewportSize({ width: 280, height: 653 });
    
    // Navigate to the home page
    await page.goto('/en');
    
    // The page should still be usable
    await expect(page.locator('body')).not.toHaveClass(/overflow-hidden/);
    
    // Test with an extremely large viewport
    await page.setViewportSize({ width: 2560, height: 1440 });
    
    // Navigate to the home page
    await page.goto('/en');
    
    // The page should still be usable and not have excessive whitespace
    await expect(page.locator('body')).not.toHaveClass(/overflow-hidden/);
  });

  test('should handle rapid navigation between pages', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/en');
    
    // Perform rapid navigation between pages
    await page.getByText(/games/i).first().click();
    
    // Don't wait for full page load, immediately click another link
    await page.getByText(/marketplace/i).first().click();
    
    // Don't wait for full page load, immediately click another link
    await page.getByText(/profile/i).first().click();
    
    // Wait for the final page to load
    await page.waitForLoadState('load');
    
    // Check if we ended up on the profile page
    await expect(page).toHaveURL(/\/en\/profile/);
    
    // The page should be functional
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate a network error for API requests
    await page.route('**/api/games**', route => route.abort('failed'));
    
    // Navigate to the games page
    await page.goto('/en/games');
    
    // Check if an appropriate error message is displayed
    await expect(page.locator('text=/failed to load|error|try again/i')).toBeVisible();
  });

  test('should handle slow network connections', async ({ page }) => {
    // Simulate a slow network connection
    await page.route('**/*', async route => {
      // Delay all requests by 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    // Navigate to the games page
    await page.goto('/en/games');
    
    // Check if loading states are displayed
    await expect(page.locator('.animate-pulse, .loading-spinner')).toBeVisible();
    
    // Wait for the content to eventually load
    await page.waitForSelector('[data-testid="game-card"]', { state: 'visible', timeout: 10000 });
    
    // Check if the content loaded successfully
    await expect(page.locator('[data-testid="game-card"]')).toBeVisible();
  });

  test('should handle focus management for keyboard navigation', async ({ page }) => {
    // Navigate to the games page
    await page.goto('/en/games');
    
    // Press Tab to focus on the first interactive element
    await page.keyboard.press('Tab');
    
    // Check if an element has focus
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).not.toBe('BODY');
    
    // Continue tabbing through the page
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check if focus is moving to different elements
    const newFocusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(newFocusedElement).not.toBe('BODY');
  });

  test('should handle internationalization edge cases', async ({ page }) => {
    // Test with a language that might have longer text (German often has longer words)
    await page.goto('/fr/games');
    
    // Check if the layout still works with potentially longer text
    await expect(page.locator('[data-testid="game-card"]')).toBeVisible();
    
    // Test with a language that might have right-to-left text
    // Note: This assumes Arabic is supported in your app
    if ((await page.locator('html[lang="arb"]').count()) > 0) {
      await page.goto('/arb/games');
      
      // Check if the layout still works with RTL text
      await expect(page.locator('[data-testid="game-card"]')).toBeVisible();
    }
  });
});