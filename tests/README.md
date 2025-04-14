# End-to-End Tests with Playwright

This directory contains comprehensive end-to-end tests for the Incubus web application using Playwright.

## Test Coverage

The tests cover the following areas:

1. **Navigation and Routing** (`navigation.spec.ts`)
   - Basic navigation between pages
   - Internationalization and locale handling
   - URL structure and parameters

2. **Games Listing Page** (`games-listing.spec.ts`)
   - Game grid display
   - Filtering and sorting functionality
   - Search functionality

3. **Game Detail Page** (`game-detail.spec.ts`)
   - Game information display
   - Screenshots and media
   - Reviews and related games

4. **UI Components** (`ui-components.spec.ts`)
   - Game card component
   - Pagination
   - Header and footer
   - Responsive design

5. **Marketplace** (`marketplace.spec.ts`)
   - Marketplace listings
   - Filtering and sorting
   - Item details

6. **Error Handling and Edge Cases** (`error-handling.spec.ts`)
   - 404 pages
   - Loading states
   - Network errors
   - Browser navigation

7. **Performance** (`performance.spec.ts`)
   - Page load times
   - Core Web Vitals
   - Interaction responsiveness

8. **Accessibility** (`accessibility.spec.ts`)
   - WCAG compliance
   - Keyboard navigation
   - Screen reader support
   - Color contrast

## Setup and Installation

1. Make sure you have Node.js installed (version 16 or higher)
2. Install dependencies:

```bash
npm install
```

3. For accessibility tests, install the additional dependency:

```bash
npm install --save-dev @axe-core/playwright
```

## Running Tests

### Run all tests

```bash
npx playwright test
```

### Run a specific test file

```bash
npx playwright test tests/navigation.spec.ts
```

### Run tests in UI mode

```bash
npx playwright test --ui
```

### Run tests in a specific browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run tests in debug mode

```bash
npx playwright test --debug
```

## Test Configuration

The test configuration is defined in `playwright.config.ts` in the root directory. It includes:

- Browser configurations
- Timeout settings
- Parallelization options
- Reporter settings
- Web server configuration

## Best Practices

1. **Data Independence**: Tests should not depend on specific data being present in the application. They should either create the data they need or be flexible enough to work with whatever data is available.

2. **Isolation**: Each test should be independent and not rely on the state from previous tests.

3. **Waiting Strategies**: Use appropriate waiting strategies (`waitForSelector`, `waitForLoadState`, etc.) instead of arbitrary timeouts.

4. **Assertions**: Use clear and specific assertions that verify the expected behavior.

5. **Selectors**: Use data-testid attributes for test-specific selectors to make tests more resilient to UI changes.

6. **Error Messages**: Provide meaningful error messages for failed assertions to make debugging easier.

## Handling Internationalization

The application uses next-intl for internationalization, with routes prefixed by locale (e.g., `/en/games`, `/fr/games`). Tests account for this by:

1. Always including the locale in URLs
2. Testing different locales where appropriate
3. Using locale-independent selectors where possible

## Continuous Integration

These tests are designed to run in CI environments. The configuration includes:

- Retry logic for flaky tests
- Parallel execution for faster results
- HTML reports for easy analysis
- Screenshot capture on failure

## Troubleshooting

If tests are failing, check the following:

1. Is the application running on the expected URL?
2. Are there any network issues or API failures?
3. Have there been UI changes that might break selectors?
4. Are there timing issues that might require different waiting strategies?

For more detailed debugging, use the `--debug` flag or check the HTML reports generated after test runs.