import { test, expect } from '@playwright/test';

/**
 * This file serves as a template for creating new tests.
 * It includes examples of common testing patterns and best practices.
 */

// Use test.describe to group related tests
test.describe('Example Test Group', () => {
  // Use test.beforeEach for setup that should run before each test
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/en');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('load');
  });
  
  // Use test.afterEach for cleanup that should run after each test
  test.afterEach(async ({ page }) => {
    // Example cleanup: Clear localStorage
    await page.evaluate(() => localStorage.clear());
  });
  
  // Basic page navigation and assertion test
  test('should navigate to the games page', async ({ page }) => {
    // Click on the Games link in the navigation
    await page.getByText(/games/i).first().click();
    
    // Check if we've navigated to the games page
    await expect(page).toHaveURL(/\/en\/games/);
    
    // Check if the page title is correct
    await expect(page).toHaveTitle(/Games/);
    
    // Check if the main heading is visible
    await expect(page.locator('h1')).toContainText('Games');
  });
  
  // Example of testing a UI component
  test('should display game cards on the games page', async ({ page }) => {
    // Navigate to the games page
    await page.goto('/en/games');
    
    // Wait for game cards to be visible
    await page.waitForSelector('[data-testid="game-card"]');
    
    // Check if multiple game cards are displayed
    const gameCards = page.locator('[data-testid="game-card"]');
    const count = await gameCards.count();
    expect(count).toBeGreaterThan(0);
    
    // Check if each card has the expected elements
    const firstCard = gameCards.first();
    await expect(firstCard.locator('img')).toBeVisible(); // Cover image
    await expect(firstCard.locator('a')).toBeVisible(); // Title link
  });
  
  // Example of testing form submission
  test('should submit a search query', async ({ page }) => {
    // Navigate to the games page
    await page.goto('/en/games');
    
    // Find the search input
    const searchInput = page.getByPlaceholder(/search/i);
    
    // Enter a search term
    await searchInput.fill('adventure');
    await searchInput.press('Enter');
    
    // Wait for the page to update
    await page.waitForLoadState('load');
    
    // Check if the URL contains the search parameter
    await expect(page).toHaveURL(/search=adventure/);
    
    // Check if the search results are displayed
    await expect(page.locator('h1')).toContainText(/search results/i);
  });
  
  // Example of testing responsive design
  test('should adapt layout for different screen sizes', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if the mobile menu button is visible
    const mobileMenuButton = page.locator('button.mobile-menu-button');
    if (await mobileMenuButton.count() > 0) {
      await expect(mobileMenuButton).toBeVisible();
    }
    
    // Test on desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Check if the desktop navigation is visible
    await expect(page.locator('header nav')).toBeVisible();
  });
  
  // Example of testing with network interception
  test('should handle loading states and API responses', async ({ page }) => {
    // Intercept API requests to simulate slow network
    await page.route('**/api/games**', async route => {
      // Delay the API response by 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    // Navigate to the games page
    await page.goto('/en/games');
    
    // Check if loading state is displayed
    await expect(page.locator('.loading-spinner, .animate-pulse')).toBeVisible();
    
    // Wait for the content to load
    await page.waitForSelector('[data-testid="game-card"]', { state: 'visible' });
    
    // Check if the content loaded successfully
    await expect(page.locator('[data-testid="game-card"]')).toBeVisible();
  });
  
  // Example of testing accessibility
  test('should be accessible', async ({ page }) => {
    // Check if interactive elements are keyboard accessible
    await page.keyboard.press('Tab');
    
    // Check if an element has focus
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).not.toBe('BODY');
    
    // Check if images have alt text
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      
      // Images should have alt text (empty alt is acceptable for decorative images)
      expect(alt).not.toBeNull();
    }
  });
  
  // Example of testing internationalization
  test('should handle different locales', async ({ page }) => {
    // Navigate to the French version of the page
    await page.goto('/fr');
    
    // Check if the page loaded successfully
    await expect(page).toHaveURL(/\/fr/);
    
    // Check if the html lang attribute is set correctly
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('fr');
    
    // Navigate to the English version of the page
    await page.goto('/en');
    
    // Check if the page loaded successfully
    await expect(page).toHaveURL(/\/en/);
    
    // Check if the html lang attribute is set correctly
    const htmlLangEn = await page.locator('html').getAttribute('lang');
    expect(htmlLangEn).toBe('en');
  });
});

// Example of using test.describe.skip to skip a group of tests
test.describe.skip('Skipped Tests', () => {
  test('this test will be skipped', async ({ page }) => {
    // This test will not run
  });
});

// Example of using test.skip to skip a single test
test.skip('this individual test will be skipped', async ({ page }) => {
  // This test will not run
});

// Example of conditional test skipping
test('conditional skip example', async ({ page, browserName }) => {
  // Skip this test when running in Firefox
  test.skip(browserName === 'firefox', 'This test is not yet supported in Firefox');
  
  // The rest of the test will only run in non-Firefox browsers
  await page.goto('/en');
  await expect(page).toHaveURL(/\/en/);
});
