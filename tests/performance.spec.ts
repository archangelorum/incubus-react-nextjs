import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load the home page within acceptable time', async ({ page }) => {
    // Measure the time it takes to load the home page
    const startTime = Date.now();
    
    await page.goto('/en');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('load');
    
    const loadTime = Date.now() - startTime;
    console.log(`Home page load time: ${loadTime}ms`);
    
    // Assert that the page loads within an acceptable time (e.g., 5 seconds)
    // This threshold can be adjusted based on your application's requirements
    expect(loadTime).toBeLessThan(5000);
  });

  test('should load the games page within acceptable time', async ({ page }) => {
    // Measure the time it takes to load the games page
    const startTime = Date.now();
    
    await page.goto('/en/games');
    
    // Wait for the game cards to be visible
    await page.waitForSelector('[data-testid="game-card"]');
    
    const loadTime = Date.now() - startTime;
    console.log(`Games page load time: ${loadTime}ms`);
    
    // Assert that the page loads within an acceptable time
    expect(loadTime).toBeLessThan(5000);
  });

  test('should load game details page within acceptable time', async ({ page }) => {
    // First navigate to the games page to get a game slug
    await page.goto('/en/games');
    await page.waitForSelector('[data-testid="game-card"]');
    
    // Get the URL of the first game
    const firstGameHref = await page.locator('[data-testid="game-card"] a').first().getAttribute('href');
    
    if (firstGameHref) {
      // Measure the time it takes to load the game details page
      const startTime = Date.now();
      
      await page.goto(firstGameHref);
      
      // Wait for the game title to be visible
      await page.waitForSelector('[data-testid="game-title"]');
      
      const loadTime = Date.now() - startTime;
      console.log(`Game details page load time: ${loadTime}ms`);
      
      // Assert that the page loads within an acceptable time
      expect(loadTime).toBeLessThan(5000);
    } else {
      console.log('No games available to test');
      test.skip();
    }
  });

  test('should render game grid efficiently', async ({ page }) => {
    // Navigate to the games page
    await page.goto('/en/games');
    
    // Wait for the initial game cards to load
    await page.waitForSelector('[data-testid="game-card"]');
    
    // Measure the time it takes to scroll through the page
    const startTime = Date.now();
    
    // Scroll down the page to trigger any lazy loading
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Wait a moment for any lazy-loaded content to appear
    await page.waitForTimeout(1000);
    
    const scrollTime = Date.now() - startTime;
    console.log(`Scroll and render time: ${scrollTime}ms`);
    
    // Assert that scrolling and rendering happens within an acceptable time
    expect(scrollTime).toBeLessThan(2000);
  });

  test('should have acceptable First Contentful Paint', async ({ page }) => {
    // Create a promise that resolves when FCP is available
    const fcpPromise = page.evaluate(() => {
      return new Promise(resolve => {
        // Create a PerformanceObserver to monitor FCP
        const observer = new PerformanceObserver(list => {
          const entries = list.getEntries();
          for (const entry of entries) {
            if (entry.name === 'first-contentful-paint') {
              observer.disconnect();
              resolve(entry.startTime);
              break;
            }
          }
        });
        
        // Start observing paint entries
        observer.observe({ type: 'paint', buffered: true });
        
        // Fallback if FCP doesn't fire within 10 seconds
        setTimeout(() => resolve(null), 10000);
      });
    });
    
    // Navigate to the home page
    await page.goto('/en');
    
    // Get the FCP time
    const fcp = await fcpPromise;
    
    if (fcp !== null) {
      console.log(`First Contentful Paint: ${fcp}ms`);
      
      // Assert that FCP is within an acceptable range (e.g., 2 seconds)
      expect(Number(fcp)).toBeLessThan(2000);
    } else {
      console.log('Could not measure First Contentful Paint');
    }
  });

  test('should have acceptable Largest Contentful Paint', async ({ page }) => {
    // Create a promise that resolves when LCP is available
    const lcpPromise = page.evaluate(() => {
      return new Promise(resolve => {
        // Create a PerformanceObserver to monitor LCP
        const observer = new PerformanceObserver(list => {
          const entries = list.getEntries();
          // We're only interested in the last LCP value
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            observer.disconnect();
            resolve(lastEntry.startTime);
          }
        });
        
        // Start observing LCP entries
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Fallback if LCP doesn't fire within 10 seconds
        setTimeout(() => resolve(null), 10000);
      });
    });
    
    // Navigate to the home page
    await page.goto('/en');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('load');
    
    // Get the LCP time
    const lcp = await lcpPromise;
    
    if (lcp !== null) {
      console.log(`Largest Contentful Paint: ${lcp}ms`);
      
      // Assert that LCP is within an acceptable range (e.g., 2.5 seconds)
      expect(Number(lcp)).toBeLessThan(2500);
    } else {
      console.log('Could not measure Largest Contentful Paint');
    }
  });

  test('should have acceptable Cumulative Layout Shift', async ({ page }) => {
    // Create a promise that resolves when CLS is available
    const clsPromise = page.evaluate(() => {
      return new Promise(resolve => {
        let clsValue = 0;
        
        // Create a PerformanceObserver to monitor layout shifts
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            // Cast to any to access layout shift specific properties
            const layoutShiftEntry = entry as any;
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value;
            }
          }
        });
        
        // Start observing layout shift entries
        observer.observe({ type: 'layout-shift', buffered: true });
        
        // Resolve after 5 seconds to give time for layout shifts to occur
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 5000);
      });
    });
    
    // Navigate to the home page
    await page.goto('/en');
    
    // Scroll down to trigger any layout shifts
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Wait a moment for any layout shifts to occur
    await page.waitForTimeout(1000);
    
    // Get the CLS value
    const cls = await clsPromise;
    
    console.log(`Cumulative Layout Shift: ${cls}`);
    
    // Assert that CLS is within an acceptable range (e.g., 0.1)
    // 0.1 or less is considered "good" according to Core Web Vitals
    expect(Number(cls)).toBeLessThan(0.1);
  });

  test('should have acceptable Time to Interactive', async ({ page }) => {
    // Measure TTI using a simplified approach
    // True TTI measurement requires more complex logic, but this gives a rough estimate
    const ttiPromise = page.evaluate(() => {
      return new Promise(resolve => {
        // Wait for the load event
        if (document.readyState === 'complete') {
          // If already loaded, wait a bit more for JavaScript to execute
          setTimeout(() => resolve(performance.now()), 500);
        } else {
          // Otherwise wait for the load event
          window.addEventListener('load', () => {
            // Wait a bit more for JavaScript to execute
            setTimeout(() => resolve(performance.now()), 500);
          });
        }
      });
    });
    
    // Navigate to the home page
    await page.goto('/en');
    
    // Get the TTI time
    const tti = await ttiPromise;
    
    console.log(`Approximate Time to Interactive: ${tti}ms`);
    
    // Assert that TTI is within an acceptable range (e.g., 3.5 seconds)
    expect(Number(tti)).toBeLessThan(3500);
  });

  test('should respond quickly to user interactions', async ({ page }) => {
    // Navigate to the games page
    await page.goto('/en/games');
    
    // Wait for the game cards to be visible
    await page.waitForSelector('[data-testid="game-card"]');
    
    // Measure the time it takes to respond to a click
    const startTime = Date.now();
    
    // Click on the first game card
    await page.locator('[data-testid="game-card"]').first().click();
    
    // Wait for navigation to complete
    await page.waitForLoadState('load');
    
    const responseTime = Date.now() - startTime;
    console.log(`Response time to click: ${responseTime}ms`);
    
    // Assert that the response time is within an acceptable range
    expect(responseTime).toBeLessThan(3000);
  });

  test('should handle multiple rapid interactions efficiently', async ({ page }) => {
    // Navigate to the games page
    await page.goto('/en/games');
    
    // Wait for the game cards to be visible
    await page.waitForSelector('[data-testid="game-card"]');
    
    // Measure the time it takes to perform multiple interactions
    const startTime = Date.now();
    
    // Perform a series of rapid interactions
    // 1. Click a filter
    const filterOption = page.locator('.bg-secondary/10').first();
    if (await filterOption.count() > 0) {
      await filterOption.click();
      await page.waitForLoadState('load');
    }
    
    // 2. Change the sort order
    const sortDropdown = page.getByRole('button', { name: /sort/i });
    if (await sortDropdown.count() > 0) {
      await sortDropdown.click();
      await page.getByRole('option', { name: /price.*low/i }).click();
      await page.waitForLoadState('load');
    }
    
    // 3. Scroll down the page
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(500);
    
    const interactionTime = Date.now() - startTime;
    console.log(`Multiple interactions time: ${interactionTime}ms`);
    
    // Assert that the multiple interactions complete within an acceptable time
    expect(interactionTime).toBeLessThan(5000);
  });

  test('should load images efficiently', async ({ page }) => {
    // Navigate to the games page
    await page.goto('/en/games');
    
    // Wait for the game cards to be visible
    await page.waitForSelector('[data-testid="game-card"]');
    
    // Get all image elements
    const images = page.locator('[data-testid="game-card"] img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Check if images have width and height attributes (to prevent layout shifts)
      const firstImage = images.first();
      const hasWidth = await firstImage.getAttribute('width') !== null;
      const hasHeight = await firstImage.getAttribute('height') !== null;
      
      expect(hasWidth && hasHeight).toBeTruthy();
      
      // Check if images are lazy loaded
      const hasLazyLoading = await firstImage.getAttribute('loading') === 'lazy';
      
      // This is not a strict requirement, but a good practice
      if (!hasLazyLoading) {
        console.log('Warning: Images are not using lazy loading');
      }
    }
  });
});