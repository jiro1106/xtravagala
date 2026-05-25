import { test, expect } from '@playwright/test';

test.describe('route guards (signed out)', () => {
  test('/profile redirects to /login?next=/profile', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login\?next=%2Fprofile/);
  });

  test('/host/dashboard redirects to /host/login?next=...', async ({ page }) => {
    await page.goto('/host/dashboard');
    await expect(page).toHaveURL(/\/host\/login\?next=/);
  });

  test('/host/events/new redirects to /host/login?next=...', async ({ page }) => {
    await page.goto('/host/events/new');
    await expect(page).toHaveURL(/\/host\/login\?next=/);
  });

  test('/host/upgrade redirects to /login (RequireAuth, not RequireHost)', async ({ page }) => {
    await page.goto('/host/upgrade');
    await expect(page).toHaveURL(/\/login\?next=%2Fhost%2Fupgrade/);
  });
});
