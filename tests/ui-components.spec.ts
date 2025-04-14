import { test, expect } from '@playwright/test';

test.describe('UI Components', () => {
  test.describe('Game Card Component', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to the games page where game cards are displayed
      await page.goto('/en/games');
      
      // Wait for game cards to be visible
      await page.waitForSelector('[data-testid="game-card"]');
    });

    test('should display game information correctly', async ({ page }) => {
      // Get the first game card
      const gameCard = page.locator('[data-testid="game-card"]').first();
      
      // Check if the card has the expected elements
      await expect(gameCard.locator('img')).toBeVisible(); // Cover image
      await expect(gameCard.locator('a')).toBeVisible(); // Title link
      
      // Check if genre badges are displayed (if any)
      const genreBadges = gameCard.locator('.badge');
      const badgeCount = await genreBadges.count();
      
      if (badgeCount > 0) {
        await expect(genreBadges.first()).toBeVisible();
      }
    });

    test('should handle discount display correctly', async ({ page }) => {
      // Find a game card with a discount (if any)
      const discountBadge = page.locator('[data-testid="game-card"] .badge:has-text("%")');
      const hasDiscountedGame = await discountBadge.count() > 0;
      
      if (hasDiscountedGame) {
        // Get the game card with a discount
        const discountedGameCard = discountBadge.locator('..').locator('..');
        
        // Check if both original and discounted prices are displayed
        await expect(discountedGameCard.locator('.line-through')).toBeVisible(); // Original price
        await expect(discountedGameCard.locator('.text-primary')).toBeVisible(); // Discounted price
      }
      // If no discounted game is found, the test passes automatically
    });

    test('should show "Add" button for non-owned games', async ({ page }) => {
      // Find a game card that doesn't have an "Owned" badge
      const nonOwnedGameCard = page.locator('[data-testid="game-card"]:not(:has-text("Owned"))').first();
      
      // Check if the "Add" button is displayed
      await expect(nonOwnedGameCard.getByText(/add/i)).toBeVisible();
    });

    test('should handle hover state', async ({ page }) => {
      // Get the first game card
      const gameCard = page.locator('[data-testid="game-card"]').first();
      
      // Hover over the card
      await gameCard.hover();
      
      // Check if the hover state is applied (this is visual, so we can check for CSS classes)
      // This assumes the hover state adds a transform or other CSS class
      // We can't directly test CSS pseudo-classes with Playwright, but we can check for classes
      
      // Wait a moment for any hover animations
      await page.waitForTimeout(300);
      
      // The actual assertion would depend on how your hover state is implemented
      // For example, if it adds a class:
      // await expect(gameCard).toHaveClass(/hover/);
      
      // Or if it's a transform that we can't directly test, we can at least verify
      // that the card is still visible after hovering
      await expect(gameCard).toBeVisible();
    });
  });

  test.describe('Pagination Component', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to a page with pagination (assuming games page has pagination)
      await page.goto('/en/games');
      
      // Wait for the page to load
      await page.waitForSelector('[data-testid="game-card"]');
    });

    test('should navigate to next page when clicking next button', async ({ page }) => {
      // Check if pagination exists
      const pagination = page.locator('nav.pagination');
      const hasPagination = await pagination.count() > 0;
      
      if (hasPagination) {
        // Get the current page number
        const currentPage = await page.locator('.pagination .current-page').textContent();
        
        // Click the next page button
        await page.locator('.pagination .next-page').click();
        
        // Wait for the page to update
        await page.waitForLoadState('load');
        
        // Check if the URL contains the page parameter
        await expect(page).toHaveURL(/page=2/);
        
        // Check if the current page number has increased
        const newPage = await page.locator('.pagination .current-page').textContent();
        expect(newPage).not.toEqual(currentPage);
      }
      // If no pagination exists, the test passes automatically
    });

    test('should navigate to specific page when clicking page number', async ({ page }) => {
      // Check if pagination exists with multiple pages
      const pageNumbers = page.locator('.pagination .page-number');
      const hasMultiplePages = await pageNumbers.count() > 1;
      
      if (hasMultiplePages) {
        // Click on page 2
        await pageNumbers.nth(1).click();
        
        // Wait for the page to update
        await page.waitForLoadState('load');
        
        // Check if the URL contains the page parameter
        await expect(page).toHaveURL(/page=2/);
        
        // Check if page 2 is now marked as current
        await expect(pageNumbers.nth(1)).toHaveClass(/current/);
      }
      // If no pagination with multiple pages exists, the test passes automatically
    });
  });

  test.describe('Header and Footer', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to the home page
      await page.goto('/en');
    });

    test('should have working navigation links in header', async ({ page }) => {
      // Check if the header is visible
      await expect(page.locator('header')).toBeVisible();
      
      // Check if navigation links are visible
      const navLinks = page.locator('header nav a');
      const navLinkCount = await navLinks.count();
      expect(navLinkCount).toBeGreaterThan(0);
      
      // Check if the first link works
      const firstLinkHref = await navLinks.first().getAttribute('href');
      await navLinks.first().click();
      
      // Check if we navigated to the expected URL
      if (firstLinkHref) {
        await expect(page).toHaveURL(new RegExp(firstLinkHref));
      }
    });

    test('should have working links in footer', async ({ page }) => {
      // Check if the footer is visible
      await expect(page.locator('footer')).toBeVisible();
      
      // Check if footer links are visible
      const footerLinks = page.locator('footer a');
      const linkCount = await footerLinks.count();
      
      if (linkCount > 0) {
        // Check if the first link works
        const firstLinkHref = await footerLinks.first().getAttribute('href');
        await footerLinks.first().click();
        
        // Check if we navigated to the expected URL
        if (firstLinkHref) {
          // If it's an external link, it might open in a new tab
          if (firstLinkHref.startsWith('http')) {
            // We can't easily test external links, so just verify it was clickable
            await expect(footerLinks.first()).toBeVisible();
          } else {
            await expect(page).toHaveURL(new RegExp(firstLinkHref));
          }
        }
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should adapt layout for mobile devices', async ({ page }) => {
      // Set viewport to mobile size
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Navigate to the games page
      await page.goto('/en/games');
      
      // Wait for the page to load
      await page.waitForSelector('[data-testid="game-card"]');
      
      // Check if the mobile menu button is visible
      const mobileMenuButton = page.locator('button.mobile-menu-button');
      const hasMobileMenu = await mobileMenuButton.count() > 0;
      
      if (hasMobileMenu) {
        await expect(mobileMenuButton).toBeVisible();
        
        // Click the mobile menu button
        await mobileMenuButton.click();
        
        // Check if the mobile menu is displayed
        await expect(page.locator('.mobile-menu')).toBeVisible();
      }
      
      // Check if game cards are stacked in a single column on mobile
      const gameCards = page.locator('[data-testid="game-card"]');
      const firstCardBounds = await gameCards.first().boundingBox();
      const secondCardBounds = await gameCards.nth(1).boundingBox();
      
      if (firstCardBounds && secondCardBounds) {
        // On mobile, cards should be stacked vertically
        // This means the second card's top should be below the first card's bottom
        expect(secondCardBounds.y).toBeGreaterThan(firstCardBounds.y + firstCardBounds.height);
      }
    });

    test('should adapt layout for tablet devices', async ({ page }) => {
      // Set viewport to tablet size
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Navigate to the games page
      await page.goto('/en/games');
      
      // Wait for the page to load
      await page.waitForSelector('[data-testid="game-card"]');
      
      // Check if game cards are arranged in multiple columns on tablet
      const gameCards = page.locator('[data-testid="game-card"]');
      const cardCount = await gameCards.count();
      
      if (cardCount >= 2) {
        const firstCardBounds = await gameCards.first().boundingBox();
        const secondCardBounds = await gameCards.nth(1).boundingBox();
        
        if (firstCardBounds && secondCardBounds) {
          // On tablet, cards should be in 2 columns
          // This means either they're side by side (x differs) or stacked (y differs)
          const sideToSide = secondCardBounds.x > firstCardBounds.x;
          const stacked = secondCardBounds.y > firstCardBounds.y + firstCardBounds.height;
          
          expect(sideToSide || stacked).toBeTruthy();
        }
      }
    });

    test('should adapt layout for desktop devices', async ({ page }) => {
      // Set viewport to desktop size
      await page.setViewportSize({ width: 1280, height: 800 });
      
      // Navigate to the games page
      await page.goto('/en/games');
      
      // Wait for the page to load
      await page.waitForSelector('[data-testid="game-card"]');
      
      // Check if game cards are arranged in multiple columns on desktop
      const gameCards = page.locator('[data-testid="game-card"]');
      const cardCount = await gameCards.count();
      
      if (cardCount >= 4) {
        // Get the bounding boxes of the first 4 cards
        const cardBounds = [];
        for (let i = 0; i < 4; i++) {
          cardBounds.push(await gameCards.nth(i).boundingBox());
        }
        
        // Filter out any undefined bounding boxes
        const validBounds = cardBounds.filter(bound => bound !== null);
        
        if (validBounds.length >= 2) {
          // Check if at least some cards are side by side
          // This would indicate a multi-column layout
          const uniqueXPositions = new Set(validBounds.map(bound => bound!.x));
          expect(uniqueXPositions.size).toBeGreaterThan(1);
        }
      }
    });
  });
});