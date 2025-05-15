import { test, expect } from "@playwright/test";
import {
  clerkSetup,
  setupClerkTestingToken,
  clerk,
} from "@clerk/testing/playwright";
import * as dotenv from "dotenv";
import { postMockApi } from '../utils/postMockApi';

// Load environment variables
dotenv.config();

// Set reasonable timeout
test.setTimeout(60000);

test.describe('Post Creation', () => {
  test('user can create and view a post', async ({ page }) => {
    // Setup and authentication
    await clerkSetup({ frontendApiUrl: process.env.CLERK_FRONTEND_API });
    await setupClerkTestingToken({ page });

    // Sign in
    await page.goto('/');
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "password",
        password: process.env.TEST_USER1_PASSWORD,
        identifier: process.env.TEST_USER1_EMAIL
      }
    });

    // Setup API mocks
    await postMockApi(page);

    // Wait for home page after login
    await page.waitForURL('**/home', { timeout: 10000 });

    // Navigate to create post page
    await page.goto('/new');

    // Check for form elements
    const formVisible = await page.waitForSelector('input[type="text"]', {
      timeout: 5000,
      state: 'visible'
    }).then(() => true).catch(() => false);

    if (!formVisible) {
      await page.screenshot({ path: 'form-not-found.png' });
      throw new Error("Create post form not found");
    }

    // Fill form fields
    await page.fill('input[type="text"]', 'Test Post Title');
    await page.fill('textarea', 'Test content for automated test.');

    // Upload image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('input[type="file"]');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: Buffer.from([
        // Minimal valid PNG file bytes
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
        0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
        0x54, 0x08, 0xD7, 0x63, 0x60, 0x00, 0x00, 0x00,
        0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
        0x42, 0x60, 0x82
      ])
    });

    // Select genre
    await page.waitForSelector('.genre-tag');
    await page.click('.genre-tag:first-child');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify redirect and post creation
    await page.waitForURL('**/home', { timeout: 10000 });

    // Verify post appears in list
    await page.waitForSelector('.post-card', { timeout: 5000 });

    // Test complete
    expect(page.url()).toContain('/home');

    // Clean up
    await clerk.signOut({ page }).catch(() => {});
  });
});