import { test, expect } from '@playwright/test';
import { mockApi } from '../utils/mockApi';
import { Buffer } from 'buffer';

test('user can open the create-post page and submit the form', async ({ page }) => {
  await mockApi(page);
  await page.goto('/new');

  // title/content inputs come from CreatePost.tsx
  await page.getByLabel('Title').fill('Playwright Test Post');
  await page.getByLabel('Content').fill('This post was created by an automated E2E test.');

  // pick first genre checkbox (you may have a dropdown instead)
  const firstGenre = page.locator('input[type=checkbox]').first();
  if (await firstGenre.count()) await firstGenre.check();

  // upload image (Playwright auto-fills a fake file)
  await page.setInputFiles('input[type=file]', {
    name: 'image.png',
    mimeType: 'image/png',
    buffer: Buffer.from([137, 80, 78, 71]),
  });

  await page.getByRole('button', { name: /publish/i }).click();

  // confirmation toast or redirect
  await expect(page.getByText(/post created/i)).toBeVisible();
});
