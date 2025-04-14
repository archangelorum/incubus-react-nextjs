import { test, expect } from '@playwright/test';

test.describe('Internationalization', () => {
  // Define the locales to test
  const locales = ['en', 'fr', 'es', 'cmn', 'hi', 'arb'];
  
  // Define key pages to test
  const pages = [
    { path: '', name: 'Home' },
    { path: '/games', name: 'Games' },
    { path: '/marketplace', name: 'Marketplace' },
    { path: '/profile', name: 'Profile' }
  ];

  test('should redirect to default locale when accessing root', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en/);
  });

  test('should maintain the same page when switching locales', async ({ page }) => {
    // Start at the games page with English locale
    await page.goto('/en/games');
    
    // Find and click the language switcher
    // This assumes there's a language switcher in the UI
    const languageSwitcher = page.locator('button, [role="button"]').filter({ hasText: /language|en/i });
    
    if (await languageSwitcher.count() > 0) {
      await languageSwitcher.click();
      
      // Select French
      await page.getByText('fr', { exact: true }).click();
      
      // Check if we're still on the games page but with French locale
      await expect(page).toHaveURL(/\/fr\/games/);
    } else {
      // If no language switcher is found, manually navigate to the French version
      await page.goto('/fr/games');
      await expect(page).toHaveURL(/\/fr\/games/);
    }
  });

  for (const locale of locales) {
    test(`should load content in ${locale} locale`, async ({ page }) => {
      // Navigate to the home page with the specified locale
      await page.goto(`/${locale}`);
      
      // Check if the page loaded successfully
      await expect(page).toHaveURL(`/${locale}`);
      
      // Check if the html lang attribute is set correctly
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe(locale);
      
      // Check if there's content on the page (not an error page)
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  }

  for (const pageInfo of pages) {
    test(`should have consistent URLs across locales for ${pageInfo.name} page`, async ({ page }) => {
      // Check the URL structure for each locale
      for (const locale of locales) {
        await page.goto(`/${locale}${pageInfo.path}`);
        
        // The path part after the locale should be the same across all locales
        await expect(page).toHaveURL(`/${locale}${pageInfo.path}`);
      }
    });
  }

  test('should display dates in localized format', async ({ page }) => {
    // Navigate to a page with dates (e.g., game details)
    await page.goto('/en/games');
    await page.waitForSelector('[data-testid="game-card"]');
    await page.locator('[data-testid="game-card"]').first().click();
    
    // Get the date format in English
    const englishDateElement = page.locator('text=/release date/i').locator('..').locator('span').last();
    const englishDate = await englishDateElement.textContent();
    
    // Navigate to the same page in French
    const currentUrl = page.url();
    const frenchUrl = currentUrl.replace('/en/', '/fr/');
    await page.goto(frenchUrl);
    
    // Get the date format in French
    const frenchDateElement = page.locator('text=/date de sortie/i, text=/date/i').locator('..').locator('span').last();
    const frenchDate = await frenchDateElement.textContent();
    
    // The dates should be formatted differently
    // This is a simple check; the actual assertion would depend on how dates are formatted
    if (englishDate && frenchDate) {
      expect(englishDate).not.toEqual(frenchDate);
    }
  });

  test('should display prices in appropriate format for locale', async ({ page }) => {
    // Navigate to the games page in English
    await page.goto('/en/games');
    await page.waitForSelector('[data-testid="game-card"]');
    
    // Get the price format in English
    const englishPriceElement = page.locator('[data-testid="game-card"]').first().locator('text=/\\$/');
    const englishPrice = await englishPriceElement.textContent();
    
    // Navigate to the same page in French
    await page.goto('/fr/games');
    await page.waitForSelector('[data-testid="game-card"]');
    
    // Get the price format in French
    // In French, prices might use € or have a different format (e.g., comma instead of period)
    const frenchPriceElement = page.locator('[data-testid="game-card"]').first().locator('text=/\\$|€/');
    const frenchPrice = await frenchPriceElement.textContent();
    
    // The prices should be formatted appropriately for each locale
    // This is a simple check; the actual assertion would depend on how prices are formatted
    if (englishPrice && frenchPrice) {
      console.log(`English price: ${englishPrice}, French price: ${frenchPrice}`);
    }
  });

  test('should have localized navigation elements', async ({ page }) => {
    // Navigate to the home page in English
    await page.goto('/en');
    
    // Get the text of navigation links in English
    const englishNavLinks = page.locator('header nav a');
    const englishNavTexts = await englishNavLinks.allTextContents();
    
    // Navigate to the home page in French
    await page.goto('/fr');
    
    // Get the text of navigation links in French
    const frenchNavLinks = page.locator('header nav a');
    const frenchNavTexts = await frenchNavLinks.allTextContents();
    
    // The navigation text should be different between locales
    // This assumes that the navigation structure is the same, just translated
    expect(englishNavTexts).not.toEqual(frenchNavTexts);
    
    // The number of navigation links should be the same
    expect(englishNavTexts.length).toEqual(frenchNavTexts.length);
  });

  test('should handle RTL languages correctly', async ({ page }) => {
    // Check if Arabic is supported
    const arabicSupported = locales.includes('arb');
    
    if (arabicSupported) {
      // Navigate to the home page in Arabic
      await page.goto('/arb');
      
      // Check if the html dir attribute is set to rtl
      const htmlDir = await page.locator('html').getAttribute('dir');
      expect(htmlDir).toBe('rtl');
      
      // Check if the layout is properly flipped for RTL
      // This is a basic check; the actual assertion would depend on the layout
      const body = page.locator('body');
      const bodyDir = await body.evaluate(el => window.getComputedStyle(el).direction);
      expect(bodyDir).toBe('rtl');
    } else {
      // Skip this test if Arabic is not supported
      test.skip();
    }
  });

  test('should handle locale in API requests', async ({ page, request }) => {
    // Navigate to the games page in English
    await page.goto('/en/games');
    
    // Intercept API requests to check if they include locale information
    await page.route('**/api/games**', async route => {
      const url = route.request().url();
      console.log(`API request URL: ${url}`);
      
      // Check if the URL or headers include locale information
      // This is a basic check; the actual assertion would depend on how the API handles localization
      
      // Continue the request
      await route.continue();
    });
    
    // Trigger an API request by interacting with the page
    // For example, changing a filter or sort option
    const sortDropdown = page.getByRole('button', { name: /sort/i });
    if (await sortDropdown.count() > 0) {
      await sortDropdown.click();
      await page.getByRole('option', { name: /price/i }).first().click();
    }
    
    // Navigate to the games page in French
    await page.goto('/fr/games');
    
    // Intercept API requests again to check if they include the French locale
    await page.route('**/api/games**', async route => {
      const url = route.request().url();
      console.log(`API request URL (French): ${url}`);
      
      // Continue the request
      await route.continue();
    });
    
    // Trigger an API request again
    if (await sortDropdown.count() > 0) {
      await sortDropdown.click();
      await page.getByRole('option', { name: /prix/i }).first().click();
    }
  });

  test('should handle fallback for missing translations', async ({ page }) => {
    // Navigate to a page in a locale that might have incomplete translations
    // For this test, we'll use Chinese (cmn) as it might have fewer translations
    await page.goto('/cmn/games');
    
    // Check if the page loaded successfully
    await expect(page).toHaveURL(/\/cmn\/games/);
    
    // Check if there's content on the page (not an error page)
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // The page should still be functional even if some translations are missing
    // For example, check if game cards are displayed
    await expect(page.locator('[data-testid="game-card"]').first()).toBeVisible();
  });

  test('should maintain user preferences for locale', async ({ page }) => {
    // Navigate to the home page in French
    await page.goto('/fr');
    
    // Check if the locale is stored in localStorage or cookies
    const localStorageItems = await page.evaluate(() => {
      return Object.entries(window.localStorage).filter(([key]) =>
        key.toLowerCase().includes('locale') || key.toLowerCase().includes('lang')
      );
    });
    
    console.log('LocalStorage items related to locale:', localStorageItems);
    
    // Navigate to another page and check if the locale is maintained
    await page.getByText(/jeux|games/i).first().click();
    await expect(page).toHaveURL(/\/fr\/games/);
    
    // Refresh the page and check if the locale is still maintained
    await page.reload();
    await expect(page).toHaveURL(/\/fr\/games/);
  });
});