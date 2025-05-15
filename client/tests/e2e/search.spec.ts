import { test, expect } from '@playwright/test';
import { mockApi } from '../utils/mockApi';

test('global search bar navigates to results page', async ({ page }) => {
  await mockApi(page);
  await page.goto('/home');

  await page.getByPlaceholder('Search posts…').fill('music theory');
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/search\?q=music%20theory/);
  // results list comes from SearchResults.tsx
  await expect(page.getByRole('heading', { name: /results/i })).toBeVisible();
});
