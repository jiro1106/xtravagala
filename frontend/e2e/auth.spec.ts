import { test, expect } from '@playwright/test';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in frontend/.env.local`);
  return v;
}

test.describe('authentication', () => {
  test('shows a friendly error on bad password', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('definitely-not-a-real-user@xtravagala.test');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrong-password-123');
    await page.getByRole('button', { name: /^sign in$/i }).click();
    // friendlyAuthError maps "invalid login credentials" → user-facing message
    await expect(
      page.getByText(/email or password is incorrect|invalid|incorrect/i),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('email/password login lands on home with avatar', async ({ page }) => {
    const email = requireEnv('E2E_ATTENDEE_EMAIL');
    const password = requireEnv('E2E_ATTENDEE_PASSWORD');

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: /^sign in$/i }).click();

    await expect(page).toHaveURL(/\/$/, { timeout: 10_000 });
    // Sign-in/Sign-up CTA pills disappear from the header once signed in
    await expect(page.locator('header').getByRole('link', { name: /^sign in$/i })).toHaveCount(0);
  });

  test('?next= preserves intended destination after login', async ({ page }) => {
    const email = requireEnv('E2E_ATTENDEE_EMAIL');
    const password = requireEnv('E2E_ATTENDEE_PASSWORD');

    // Hitting a protected route while signed out redirects to /login?next=...
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login\?next=/);

    await page.getByLabel('Email').fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: /^sign in$/i }).click();

    await expect(page).toHaveURL(/\/profile$/, { timeout: 10_000 });
  });

  test('sign-out reloads to home', async ({ page }) => {
    const email = requireEnv('E2E_ATTENDEE_EMAIL');
    const password = requireEnv('E2E_ATTENDEE_PASSWORD');

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 10_000 });

    // Open the avatar dropdown (the only element in the header with a chevron + name).
    // The button doesn't have a stable accessible name, so click the one inside the header
    // that contains the email/displayName text.
    const avatarButton = page.locator('header button').filter({ hasText: email.split('@')[0] }).first();
    await avatarButton.click({ trial: false });
    await page.getByRole('button', { name: /sign out/i }).click();

    // signOut() calls window.location.assign('/'), so we should land back on home
    // and the Sign in / Sign up CTAs should be visible again.
    await expect(page).toHaveURL(/\/$/, { timeout: 10_000 });
    await expect(page.locator('header').getByRole('link', { name: /^sign up$/i })).toBeVisible({ timeout: 5_000 });
  });
});
