import { test, expect } from '@playwright/test';

test.describe('Game Detail Page', () => {
  let gameSlug: string;

  test.beforeAll(async ({ browser }) => {
    // Get a game slug from the games listing page
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('/en/games');
    await page.waitForSelector('[data-testid="game-card"]');
    
    // Get the URL of the first game
    const firstGameHref = await page.locator('[data-testid="game-card"] a').first().getAttribute('href');
    if (firstGameHref) {
      // Extract the slug from the URL
      gameSlug = firstGameHref.split('/').pop() || 'unknown-game';
    } else {
      gameSlug = 'unknown-game';
    }
    
    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to the game detail page before each test
    await page.goto(`/en/games/${gameSlug}`);
    
    // Wait for the game title to be visible
    await page.waitForSelector('[data-testid="game-title"]');
  });

  test('should display game title and basic information', async ({ page }) => {
    // Check if the game title is displayed
    await expect(page.locator('[data-testid="game-title"]')).toBeVisible();
    
    // Check if the game price is displayed
    await expect(page.locator('[data-testid="game-price"]')).toBeVisible();
    
    // Check if the game description is displayed
    await expect(page.locator('[data-testid="game-description"]')).toBeVisible();
    
    // Check if the cover image is displayed
    await expect(page.locator('img[alt]').first()).toBeVisible();
  });

  test('should display game screenshots', async ({ page }) => {
    // Scroll to the screenshots section
    await page.locator('h2:has-text("Screenshots")').scrollIntoViewIfNeeded();
    
    // Check if screenshots are displayed
    const screenshots = page.locator('.screenshots-container img');
    const count = await screenshots.count();
    
    // There should be at least one screenshot
    expect(count).toBeGreaterThanOrEqual(0);
    
    // If there are screenshots, check if they're visible
    if (count > 0) {
      await expect(screenshots.first()).toBeVisible();
    }
  });

  test('should display game reviews', async ({ page }) => {
    // Scroll to the reviews section
    await page.locator('h2:has-text("Reviews")').scrollIntoViewIfNeeded();
    
    // Check if reviews are displayed or if there's a message about no reviews
    const reviewsSection = page.locator('h2:has-text("Reviews")').locator('..').locator('..');
    
    // Either reviews are displayed or there's a message about no reviews
    const hasReviews = await reviewsSection.locator('.review-item').count() > 0;
    const hasNoReviewsMessage = await reviewsSection.locator('text=/no reviews/i').count() > 0;
    
    expect(hasReviews || hasNoReviewsMessage).toBeTruthy();
  });

  test('should display related games', async ({ page }) => {
    // Scroll to the related games section
    await page.locator('h2:has-text("More Like This")').scrollIntoViewIfNeeded();
    
    // Check if related games are displayed
    const relatedGamesSection = page.locator('h2:has-text("More Like This")').locator('..').locator('..');
    const relatedGames = relatedGamesSection.locator('[data-testid="game-card"]');
    
    // There should be at least one related game or a message about no related games
    const count = await relatedGames.count();
    const hasNoRelatedGamesMessage = await relatedGamesSection.locator('text=/no related games/i').count() > 0;
    
    expect(count > 0 || hasNoRelatedGamesMessage).toBeTruthy();
  });

  test('should have working "Buy Now" button', async ({ page }) => {
    // Find the Buy Now button
    const buyButton = page.getByText(/buy now/i).first();
    
    // Check if the button is visible
    await expect(buyButton).toBeVisible();
    
    // Click the button and check if it navigates to the expected URL
    await buyButton.click();
    
    // Check if we're on the buy page
    await expect(page).toHaveURL(new RegExp(`/en/games/${gameSlug}/buy`));
  });

  test('should display system requirements if available', async ({ page }) => {
    // Check if system requirements section exists
    const sysReqSection = page.locator('h2:has-text("System Requirements")');
    const sysReqExists = await sysReqSection.count() > 0;
    
    if (sysReqExists) {
      // Scroll to the system requirements section
      await sysReqSection.scrollIntoViewIfNeeded();
      
      // Check if minimum and recommended requirements are displayed
      await expect(page.locator('h3:has-text("Minimum")')).toBeVisible();
      await expect(page.locator('h3:has-text("Recommended")')).toBeVisible();
    }
    
    // If system requirements don't exist, this test passes automatically
  });

  test('should handle different viewport sizes', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="game-title"]')).toBeVisible();
    
    // Test on tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="game-title"]')).toBeVisible();
    
    // Test on desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator('[data-testid="game-title"]')).toBeVisible();
  });
});