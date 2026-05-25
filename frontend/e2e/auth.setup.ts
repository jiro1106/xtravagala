import { test as setup, expect } from '@playwright/test';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ATTENDEE_FILE = resolve(__dirname, '.auth/attendee.json');
const HOST_FILE = resolve(__dirname, '.auth/host.json');

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in frontend/.env.local — see e2e/README.md`);
  return v;
}

async function signIn(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: /^sign in$/i }).click();
  // Successful login redirects to "/" and the Header renders the user dropdown button
  // containing the displayName (full_name or email). Wait for that as the readiness signal.
  await expect(page).toHaveURL(/\/$/, { timeout: 10_000 });
  // The user pill in the desktop header has the chevron + name; assert sign-in landed.
  await expect(page.locator('header').getByText(/sign in/i)).toHaveCount(0, { timeout: 5_000 });
}

setup('sign in as attendee', async ({ page }) => {
  const email = requireEnv('E2E_ATTENDEE_EMAIL');
  const password = requireEnv('E2E_ATTENDEE_PASSWORD');
  await signIn(page, email, password);
  await page.context().storageState({ path: ATTENDEE_FILE });
});

setup('sign in as host', async ({ page }) => {
  const email = requireEnv('E2E_HOST_EMAIL');
  const password = requireEnv('E2E_HOST_PASSWORD');
  await signIn(page, email, password);
  await page.context().storageState({ path: HOST_FILE });
});
