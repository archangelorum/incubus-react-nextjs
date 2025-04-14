import { test, expect } from '@playwright/test';

test.describe('Marketplace', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the marketplace page
    await page.goto('/en/marketplace');
    
    // Wait for the page to load
    await page.waitForLoadState('load');
  });

  test('should display marketplace listings', async ({ page }) => {
    // Check if marketplace items are displayed
    const marketplaceItems = page.locator('.marketplace-item-card');
    const itemCount = await marketplaceItems.count();
    
    // There should be at least one item or a message about no items
    const hasItems = itemCount > 0;
    const hasNoItemsMessage = await page.locator('text=/no items found/i').count() > 0;
    
    expect(hasItems || hasNoItemsMessage).toBeTruthy();
    
    if (hasItems) {
      // Check if the first item has the expected elements
      const firstItem = marketplaceItems.first();
      await expect(firstItem.locator('img')).toBeVisible(); // Item image
      await expect(firstItem.locator('.item-title')).toBeVisible(); // Item title
      await expect(firstItem.locator('.item-price')).toBeVisible(); // Item price
    }
  });

  test('should filter marketplace items', async ({ page }) => {
    // Check if filters are displayed
    const filters = page.locator('.marketplace-filters');
    const hasFilters = await filters.count() > 0;
    
    if (hasFilters) {
      // Get the initial count of marketplace items
      const initialCount = await page.locator('.marketplace-item-card').count();
      
      // Apply a filter (e.g., item type)
      await page.locator('.filter-option').first().click();
      
      // Wait for the page to update
      await page.waitForLoadState('load');
      
      // Check if the URL contains the filter parameter
      await expect(page).toHaveURL(/type=/);
      
      // Check if the item count has changed or remained the same
      const filteredCount = await page.locator('.marketplace-item-card').count();
      
      // We can't predict exactly how many items will be shown after filtering
      // But we can verify that filtering had some effect or that items are still displayed
      const hasFilteredItems = filteredCount > 0;
      const hasNoFilteredItemsMessage = await page.locator('text=/no items found/i').count() > 0;
      
      expect(hasFilteredItems || hasNoFilteredItemsMessage).toBeTruthy();
    }
  });

  test('should sort marketplace items', async ({ page }) => {
    // Check if sort dropdown is displayed
    const sortDropdown = page.locator('.sort-select');
    const hasSortDropdown = await sortDropdown.count() > 0;
    
    if (hasSortDropdown) {
      // Open the sort dropdown
      await sortDropdown.click();
      
      // Select a sort option (e.g., "Price: Low to High")
      await page.getByRole('option', { name: /price.*low/i }).click();
      
      // Wait for the page to update
      await page.waitForLoadState('load');
      
      // Check if the URL contains the sort parameter
      await expect(page).toHaveURL(/sort=price.*order=asc/);
      
      // The actual order would require checking the DOM or API responses
    }
  });

  test('should navigate to item details when clicking on an item', async ({ page }) => {
    // Check if there are marketplace items
    const marketplaceItems = page.locator('.marketplace-item-card');
    const itemCount = await marketplaceItems.count();
    
    if (itemCount > 0) {
      // Get the title of the first item
      const firstItemTitle = await marketplaceItems.first().locator('.item-title').textContent();
      
      // Click on the first item
      await marketplaceItems.first().click();
      
      // Check if we're on the item details page
      await expect(page).toHaveURL(/\/en\/marketplace\/[\w-]+/);
      
      // Check if the item title on the details page matches the one we clicked
      if (firstItemTitle) {
        await expect(page.locator('h1')).toContainText(firstItemTitle);
      }
    }
  });

  test('should handle price range filter', async ({ page }) => {
    // Check if price range filter is displayed
    const minPriceInput = page.locator('input[name="minPrice"]');
    const maxPriceInput = page.locator('input[name="maxPrice"]');
    
    const hasPriceFilter = (await minPriceInput.count() > 0) && (await maxPriceInput.count() > 0);
    
    if (hasPriceFilter) {
      // Set price range
      await minPriceInput.fill('10');
      await maxPriceInput.fill('100');
      
      // Apply the filter
      await page.getByRole('button', { name: /apply/i }).click();
      
      // Wait for the page to update
      await page.waitForLoadState('load');
      
      // Check if the URL contains the price parameters
      await expect(page).toHaveURL(/minPrice=10.*maxPrice=100/);
      
      // Check if items are displayed or a "no items found" message is shown
      const hasItems = await page.locator('.marketplace-item-card').count() > 0;
      const hasNoItemsMessage = await page.locator('text=/no items found/i').count() > 0;
      
      expect(hasItems || hasNoItemsMessage).toBeTruthy();
    }
  });

  test('should handle search functionality', async ({ page }) => {
    // Check if search input is displayed
    const searchInput = page.getByPlaceholder(/search/i);
    const hasSearchInput = await searchInput.count() > 0;
    
    if (hasSearchInput) {
      // Enter a search term
      await searchInput.fill('rare');
      await searchInput.press('Enter');
      
      // Wait for the page to update
      await page.waitForLoadState('load');
      
      // Check if the URL contains the search parameter
      await expect(page).toHaveURL(/search=rare/);
      
      // Check if items are displayed or a "no items found" message is shown
      const hasItems = await page.locator('.marketplace-item-card').count() > 0;
      const hasNoItemsMessage = await page.locator('text=/no items found/i').count() > 0;
      
      expect(hasItems || hasNoItemsMessage).toBeTruthy();
    }
  });

  test('should handle pagination', async ({ page }) => {
    // Check if pagination is displayed
    const pagination = page.locator('.pagination');
    const hasPagination = await pagination.count() > 0;
    
    if (hasPagination) {
      // Check if there's a next page button
      const nextPageButton = pagination.locator('.next-page');
      const hasNextPageButton = await nextPageButton.count() > 0;
      
      if (hasNextPageButton) {
        // Get the current page items for comparison
        const initialItems = await page.locator('.marketplace-item-card').count();
        
        // Click the next page button
        await nextPageButton.click();
        
        // Wait for the page to update
        await page.waitForLoadState('load');
        
        // Check if the URL contains the page parameter
        await expect(page).toHaveURL(/page=2/);
        
        // Check if items are displayed on the second page
        const secondPageItems = await page.locator('.marketplace-item-card').count();
        expect(secondPageItems).toBeGreaterThan(0);
      }
    }
  });

  test('should handle responsive design', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if the page layout adapts to mobile
    const marketplaceItems = page.locator('.marketplace-item-card');
    const itemCount = await marketplaceItems.count();
    
    if (itemCount >= 2) {
      // Get the bounding boxes of the first two items
      const firstItemBounds = await marketplaceItems.first().boundingBox();
      const secondItemBounds = await marketplaceItems.nth(1).boundingBox();
      
      if (firstItemBounds && secondItemBounds) {
        // On mobile, items should be stacked vertically
        // This means the second item's top should be below the first item's bottom
        expect(secondItemBounds.y).toBeGreaterThan(firstItemBounds.y + firstItemBounds.height);
      }
    }
    
    // Test on desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Check if the page layout adapts to desktop
    if (itemCount >= 2) {
      // Get the bounding boxes of the first two items
      const firstItemBounds = await marketplaceItems.first().boundingBox();
      const secondItemBounds = await marketplaceItems.nth(1).boundingBox();
      
      if (firstItemBounds && secondItemBounds) {
        // On desktop, items might be side by side or stacked
        // We can check if they have different x-coordinates (side by side)
        // or if the second item is below the first (stacked)
        const sideBySide = secondItemBounds.x > firstItemBounds.x;
        const stacked = secondItemBounds.y > firstItemBounds.y + firstItemBounds.height;
        
        expect(sideBySide || stacked).toBeTruthy();
      }
    }
  });
});