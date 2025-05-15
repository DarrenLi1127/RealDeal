import { test, expect } from '@playwright/test';
import { mockApi } from '../utils/mockApi';

test.beforeEach(async ({ page }) => {
  await mockApi(page);
  await page.goto('/home');
});

test('top-nav links route correctly', async ({ page }) => {
  await page.getByRole('link', { name: 'My Posts' }).click();
  await expect(page).toHaveURL(/\/my-posts$/);

  await page.getByRole('link', { name: 'Liked Posts' }).click();
  await expect(page).toHaveURL(/\/liked-posts$/);

  await page.getByRole('link', { name: 'Starred Posts' }).click();
  await expect(page).toHaveURL(/\/starred-posts$/);
});
