import { test, expect } from '@playwright/test';

test.describe('Games Listing Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the games page before each test
    await page.goto('/en/games');
    
    // Wait for the game grid to load
    await page.waitForSelector('[data-testid="game-card"]', { state: 'visible' });
  });

  test('should display game cards in a grid', async ({ page }) => {
    // Check if multiple game cards are displayed
    const gameCards = page.locator('[data-testid="game-card"]');
    const count = await gameCards.count();
    expect(count).toBeGreaterThan(0);
    
    // Check if each card has the expected elements
    const firstCard = gameCards.first();
    await expect(firstCard.locator('img')).toBeVisible(); // Cover image
    await expect(firstCard.locator('a')).toBeVisible(); // Title link
  });

  test('should filter games by genre', async ({ page }) => {
    // Get the initial count of game cards
    const initialCount = await page.locator('[data-testid="game-card"]').count();
    
    // Click on a genre filter (assuming there's at least one genre in the sidebar)
    await page.locator('.bg-secondary/10').first().click();
    
    // Wait for the page to update
    await page.waitForLoadState('load');
    
    // Check if the URL contains the genre parameter
    await expect(page).toHaveURL(/genre=/);
    
    // Check if the game count has changed or remained the same
    // We can't predict exactly how many games will be shown after filtering
    const filteredCount = await page.locator('[data-testid="game-card"]').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('should sort games using the sort dropdown', async ({ page }) => {
    // Open the sort dropdown
    await page.getByRole('button', { name: /sort/i }).click();
    
    // Select a different sort option (e.g., "Price: Low to High")
    await page.getByRole('option', { name: /price.*low/i }).click();
    
    // Wait for the page to update
    await page.waitForLoadState('load');
    
    // Check if the URL contains the sort parameter
    await expect(page).toHaveURL(/sort=price.*order=asc/);
    
    // The actual order would require checking the DOM or API responses
  });

  test('should filter games by price range', async ({ page }) => {
    // Find and interact with price range inputs
    // This assumes there are min and max price inputs in the filters
    const minPriceInput = page.getByLabel(/min price/i);
    const maxPriceInput = page.getByLabel(/max price/i);
    
    // Set price range
    await minPriceInput.fill('10');
    await maxPriceInput.fill('50');
    
    // Apply the filter (assuming there's an apply button)
    await page.getByRole('button', { name: /apply/i }).click();
    
    // Wait for the page to update
    await page.waitForLoadState('load');
    
    // Check if the URL contains the price parameters
    await expect(page).toHaveURL(/minPrice=10.*maxPrice=50/);
  });

  test('should show "No games found" message when no games match filters', async ({ page }) => {
    // Set an extremely high minimum price to ensure no games match
    const minPriceInput = page.getByLabel(/min price/i);
    await minPriceInput.fill('9999');
    
    // Apply the filter
    await page.getByRole('button', { name: /apply/i }).click();
    
    // Wait for the page to update
    await page.waitForLoadState('load');
    
    // Check for the "No games found" message
    await expect(page.locator('text=No games found')).toBeVisible();
  });

  test('should navigate to game details when clicking on a game card', async ({ page }) => {
    // Get the title of the first game
    const firstGameTitle = await page.locator('[data-testid="game-card"]').first().locator('a').textContent();
    
    // Click on the first game card
    await page.locator('[data-testid="game-card"]').first().click();
    
    // Check if we're on the game details page
    await expect(page).toHaveURL(/\/en\/games\/[\w-]+/);
    
    // Check if the game title on the details page matches the one we clicked
    if (firstGameTitle) {
      await expect(page.locator('[data-testid="game-title"]')).toContainText(firstGameTitle);
    }
  });

  test('should handle search functionality', async ({ page }) => {
    // Assuming there's a search input in the header or filters
    const searchInput = page.getByPlaceholder(/search/i);
    
    // Enter a search term
    await searchInput.fill('adventure');
    await searchInput.press('Enter');
    
    // Wait for the page to update
    await page.waitForLoadState('load');
    
    // Check if the URL contains the search parameter
    await expect(page).toHaveURL(/search=adventure/);
    
    // Check if the page heading reflects the search
    await expect(page.locator('h1')).toContainText(/search results/i);
  });
});