import { test, expect } from '@playwright/test';
import { mockApi } from '../utils/mockApi';

test.describe('first-time registration flow', () => {
  test('user chooses username then lands on /home', async ({ page }) => {
    await mockApi(page);

    // Pretend the Clerk session is already established.
    // We just open the registration URL directly.
    await page.goto('/register');

    // UI taken from Profile.tsx ✓ :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
    await page.getByLabel('Username').fill('playwrightUser');
    await page.getByRole('button', { name: /complete registration/i }).click();

    // fake API returns ok → profile shows success banner
    await expect(page.getByText(/welcome to real deal/i)).toBeVisible();

    // after redirect we end up on /home
    await expect(page).toHaveURL(/\/home$/);
  });
});
