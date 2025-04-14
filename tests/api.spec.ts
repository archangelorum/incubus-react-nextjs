import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  // Base URL for API requests
  const apiBaseUrl = '/api';

  test('GET /api/games should return a list of games', async ({ request }) => {
    // Make a request to the games API
    const response = await request.get(`${apiBaseUrl}/games`);
    
    // Check if the response is successful
    expect(response.status()).toBe(200);
    
    // Check if the response is JSON
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
    
    // Parse the response body
    const body = await response.json();
    
    // Check if the response has the expected structure
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBeTruthy();
    
    // Check if the games have the expected properties
    if (body.data.length > 0) {
      const firstGame = body.data[0];
      expect(firstGame).toHaveProperty('id');
      expect(firstGame).toHaveProperty('title');
      expect(firstGame).toHaveProperty('slug');
    }
  });

  test('GET /api/games with filters should return filtered games', async ({ request }) => {
    // Make a request to the games API with filters
    const response = await request.get(`${apiBaseUrl}/games?sort=basePrice&order=asc&limit=5`);
    
    // Check if the response is successful
    expect(response.status()).toBe(200);
    
    // Parse the response body
    const body = await response.json();
    
    // Check if the response has the expected structure
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBeTruthy();
    
    // Check if the limit parameter is respected
    expect(body.data.length).toBeLessThanOrEqual(5);
    
    // If there are multiple games, check if they are sorted by price
    if (body.data.length > 1) {
      const firstGamePrice = Number(body.data[0].basePrice);
      const secondGamePrice = Number(body.data[1].basePrice);
      
      // Prices should be in ascending order
      expect(firstGamePrice).toBeLessThanOrEqual(secondGamePrice);
    }
  });

  test('GET /api/games/:id should return a specific game', async ({ request, page }) => {
    // First, get a game ID from the games list
    const gamesResponse = await request.get(`${apiBaseUrl}/games`);
    const gamesBody = await gamesResponse.json();
    
    if (gamesBody.data.length > 0) {
      const gameId = gamesBody.data[0].id;
      
      // Make a request to get the specific game
      const response = await request.get(`${apiBaseUrl}/games/${gameId}`);
      
      // Check if the response is successful
      expect(response.status()).toBe(200);
      
      // Parse the response body
      const body = await response.json();
      
      // Check if the response has the expected structure
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('id', gameId);
      expect(body.data).toHaveProperty('title');
      expect(body.data).toHaveProperty('slug');
    } else {
      // Skip the test if no games are available
      test.skip();
    }
  });

  test('GET /api/games/:id with invalid ID should return 404', async ({ request }) => {
    // Make a request with an invalid game ID
    const response = await request.get(`${apiBaseUrl}/games/invalid-id`);
    
    // Check if the response is a 404
    expect(response.status()).toBe(404);
    
    // Parse the response body
    const body = await response.json();
    
    // Check if the response has an error message
    expect(body).toHaveProperty('error');
  });

  test('GET /api/genres should return a list of genres', async ({ request }) => {
    // Make a request to the genres API
    const response = await request.get(`${apiBaseUrl}/genres`);
    
    // Check if the response is successful
    expect(response.status()).toBe(200);
    
    // Parse the response body
    const body = await response.json();
    
    // Check if the response has the expected structure
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBeTruthy();
    
    // Check if the genres have the expected properties
    if (body.data.length > 0) {
      const firstGenre = body.data[0];
      expect(firstGenre).toHaveProperty('id');
      expect(firstGenre).toHaveProperty('name');
      expect(firstGenre).toHaveProperty('slug');
    }
  });

  test('GET /api/tags should return a list of tags', async ({ request }) => {
    // Make a request to the tags API
    const response = await request.get(`${apiBaseUrl}/tags`);
    
    // Check if the response is successful
    expect(response.status()).toBe(200);
    
    // Parse the response body
    const body = await response.json();
    
    // Check if the response has the expected structure
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBeTruthy();
    
    // Check if the tags have the expected properties
    if (body.data.length > 0) {
      const firstTag = body.data[0];
      expect(firstTag).toHaveProperty('id');
      expect(firstTag).toHaveProperty('name');
      expect(firstTag).toHaveProperty('slug');
    }
  });

  test('GET /api/publishers should return a list of publishers', async ({ request }) => {
    // Make a request to the publishers API
    const response = await request.get(`${apiBaseUrl}/publishers`);
    
    // Check if the response is successful
    expect(response.status()).toBe(200);
    
    // Parse the response body
    const body = await response.json();
    
    // Check if the response has the expected structure
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBeTruthy();
    
    // Check if the publishers have the expected properties
    if (body.data.length > 0) {
      const firstPublisher = body.data[0];
      expect(firstPublisher).toHaveProperty('id');
      expect(firstPublisher).toHaveProperty('name');
      expect(firstPublisher).toHaveProperty('slug');
    }
  });

  test('GET /api/marketplace should return a list of marketplace items', async ({ request }) => {
    // Make a request to the marketplace API
    const response = await request.get(`${apiBaseUrl}/marketplace`);
    
    // Check if the response is successful
    expect(response.status()).toBe(200);
    
    // Parse the response body
    const body = await response.json();
    
    // Check if the response has the expected structure
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBeTruthy();
    
    // Check if the marketplace items have the expected properties
    if (body.data.length > 0) {
      const firstItem = body.data[0];
      expect(firstItem).toHaveProperty('id');
      expect(firstItem).toHaveProperty('price');
    }
  });

  test('GET /api/marketplace with filters should return filtered items', async ({ request }) => {
    // Make a request to the marketplace API with filters
    const response = await request.get(`${apiBaseUrl}/marketplace?sort=price&order=asc&limit=5`);
    
    // Check if the response is successful
    expect(response.status()).toBe(200);
    
    // Parse the response body
    const body = await response.json();
    
    // Check if the response has the expected structure
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBeTruthy();
    
    // Check if the limit parameter is respected
    expect(body.data.length).toBeLessThanOrEqual(5);
    
    // If there are multiple items, check if they are sorted by price
    if (body.data.length > 1) {
      const firstItemPrice = body.data[0].price;
      const secondItemPrice = body.data[1].price;
      
      // Prices should be in ascending order
      expect(firstItemPrice).toBeLessThanOrEqual(secondItemPrice);
    }
  });

  test('GET /api/organizations should return a list of organizations', async ({ request }) => {
    // Make a request to the organizations API
    const response = await request.get(`${apiBaseUrl}/organizations`);
    
    // Check if the response is successful
    expect(response.status()).toBe(200);
    
    // Parse the response body
    const body = await response.json();
    
    // Check if the response has the expected structure
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBeTruthy();
    
    // Check if the organizations have the expected properties
    if (body.data.length > 0) {
      const firstOrg = body.data[0];
      expect(firstOrg).toHaveProperty('id');
      expect(firstOrg).toHaveProperty('name');
    }
  });

  test('GET /api/blockchains should return a list of blockchains', async ({ request }) => {
    // Make a request to the blockchains API
    const response = await request.get(`${apiBaseUrl}/blockchains`);
    
    // Check if the response is successful
    expect(response.status()).toBe(200);
    
    // Parse the response body
    const body = await response.json();
    
    // Check if the response has the expected structure
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBeTruthy();
    
    // Check if the blockchains have the expected properties
    if (body.data.length > 0) {
      const firstBlockchain = body.data[0];
      expect(firstBlockchain).toHaveProperty('id');
      expect(firstBlockchain).toHaveProperty('name');
    }
  });

  test('API should handle invalid endpoints gracefully', async ({ request }) => {
    // Make a request to an invalid endpoint
    const response = await request.get(`${apiBaseUrl}/invalid-endpoint`);
    
    // Check if the response is a 404
    expect(response.status()).toBe(404);
    
    // Parse the response body
    const body = await response.json();
    
    // Check if the response has an error message
    expect(body).toHaveProperty('error');
  });

  test('API should handle invalid query parameters gracefully', async ({ request }) => {
    // Make a request with invalid query parameters
    const response = await request.get(`${apiBaseUrl}/games?sort=invalid&order=invalid&limit=invalid`);
    
    // The API should either return a 400 Bad Request or handle the invalid parameters gracefully
    // and return a 200 OK with default values
    
    // If the API returns a 400 Bad Request
    if (response.status() === 400) {
      const body = await response.json();
      expect(body).toHaveProperty('error');
    } 
    // If the API handles invalid parameters gracefully
    else {
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBeTruthy();
    }
  });

  test('API should handle rate limiting', async ({ request }) => {
    // Make multiple requests in quick succession to test rate limiting
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(request.get(`${apiBaseUrl}/games`));
    }
    
    // Wait for all requests to complete
    const responses = await Promise.all(promises);
    
    // Check if any of the responses indicate rate limiting
    const rateLimited = responses.some(response => response.status() === 429);
    
    // If rate limiting is implemented, at least some requests should be rate limited
    // If not, all requests should be successful
    if (rateLimited) {
      console.log('Rate limiting is implemented');
    } else {
      // All requests should be successful
      for (const response of responses) {
        expect(response.status()).toBe(200);
      }
    }
  });

  test('API responses should have appropriate caching headers', async ({ request }) => {
    // Make a request to the games API
    const response = await request.get(`${apiBaseUrl}/games`);
    
    // Check if the response has caching headers
    const cacheControl = response.headers()['cache-control'];
    
    // If caching is implemented, the Cache-Control header should be present
    if (cacheControl) {
      console.log(`Cache-Control header: ${cacheControl}`);
      
      // The header should contain directives like max-age, public/private, etc.
      expect(cacheControl).toMatch(/max-age=|public|private|no-cache|no-store/);
    } else {
      console.log('No Cache-Control header found');
    }
  });

  test('API should validate request parameters', async ({ request }) => {
    // Make a request with an out-of-range limit parameter
    const response = await request.get(`${apiBaseUrl}/games?limit=1000`);
    
    // The API should either return a 400 Bad Request or cap the limit to a reasonable value
    
    // If the API returns a 400 Bad Request
    if (response.status() === 400) {
      const body = await response.json();
      expect(body).toHaveProperty('error');
    } 
    // If the API caps the limit
    else {
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBeTruthy();
      
      // The number of items should be less than the requested limit
      expect(body.data.length).toBeLessThan(1000);
    }
  });
});