import { Page } from '@playwright/test';

/**
 * Mock API responses for the RealDeal application
 */
export async function postMockApi(page: Page) {
  // Mock user exists endpoint (critical for ProfileGate)
  await page.route('**/api/users/exists/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(true)
    });
  });

  // Mock genres endpoint
  await page.route('**/api/genres', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Art', description: 'Visual arts and paintings' },
        { id: 2, name: 'Music', description: 'Musical instruments and performances' },
        { id: 3, name: 'Technology', description: 'Tech gadgets and innovations' }
      ])
    });
  });

  // Mock post creation endpoint
  await page.route('**/api/posts/create', (route) => {
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: `post_${Date.now()}`,
        title: 'Test Post',
        content: 'Test content',
        images: [{ id: `img_${Date.now()}`, position: 0, url: 'https://example.com/test-image.jpg' }],
        createdAt: new Date().toISOString(),
        genres: [{ id: 1, name: 'Art' }]
      })
    });
  });

  // Mock posts listing endpoint
  await page.route('**/api/posts/all**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        content: [{
          id: `post_test_${Date.now()}`,
          userId: 'user_test123',
          username: 'testuser',
          title: 'Test Post',
          content: 'This is a test post created by automation.',
          images: [{ id: 'img_1', position: 0, url: 'https://example.com/test-image.jpg' }],
          createdAt: new Date().toISOString(),
          likesCount: 0,
          starsCount: 0,
          liked: false,
          starred: false,
          genres: [{ id: 1, name: 'Art' }],
          level: 1
        }],
        totalPages: 1,
        number: 0
      })
    });
  });
}