import { test, expect } from '@playwright/test';

const E2E_PREFIX = '[E2E]';

function uniqueTitle(label: string) {
  return `${E2E_PREFIX} ${label} ${Date.now()}`;
}

test.describe('host dashboard + event CRUD', () => {
  test('dashboard renders with KPI cards and events table', async ({ page }) => {
    await page.goto('/host/dashboard');
    await expect(page).toHaveURL(/\/host\/dashboard$/);
    await expect(page.getByRole('heading', { level: 1, name: /dashboard/i })).toBeVisible();

    // 4 KPI cards
    await expect(page.getByText(/total events/i)).toBeVisible();
    await expect(page.getByText(/^published$/i)).toBeVisible();
    await expect(page.getByText(/^drafts$/i)).toBeVisible();
    await expect(page.getByText(/total rsvps/i)).toBeVisible();

    // Sidebar nav present
    await expect(page.getByRole('link', { name: /^my events$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /^new event$/i })).toBeVisible();
  });

  test('host can create a draft event, publish it, see it live, and delete it', async ({ page }) => {
    test.slow(); // generous time budget for multi-step flow

    const title = uniqueTitle('Test Event');

    // 1. Open the editor
    await page.goto('/host/dashboard');
    await page.getByRole('button', { name: /^create event$/i }).click();
    await expect(page).toHaveURL(/\/host\/events\/new$/);

    // 2. Fill the form (skip cover upload)
    await page.getByLabel(/^title$/i).fill(title);
    await page.getByLabel(/^description$/i).fill('Created by Playwright. Safe to delete.');
    await page.getByLabel(/^city$/i).selectOption({ index: 1 });
    await page.getByLabel(/^category$/i).selectOption({ index: 1 });

    // Start: tomorrow at 19:00 local
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    await page.getByLabel(/starts/i).fill(`${yyyy}-${mm}-${dd}T19:00`);

    await page.getByLabel(/price/i).fill('500');

    // 3. Save as draft
    await page.getByRole('button', { name: /^save as draft$/i }).click();
    await expect(page).toHaveURL(/\/host\/dashboard$/, { timeout: 10_000 });

    // 4. The new draft shows up in the events table
    const row = page.locator('div').filter({ hasText: title }).first();
    await expect(row).toBeVisible({ timeout: 8_000 });

    // 5. Publish via row action
    // The title <p> has overflow:hidden + ellipsis + nowrap inside a minmax(0, 1fr)
    // column, so we scope by xpath from the text node (works even when the <p>'s
    // bounding box collapses on narrow viewports).
    const titleRow = page.locator(':text("' + title + '")').locator('xpath=ancestor::*[contains(@style, "grid-template-columns")][1]');
    await titleRow.scrollIntoViewIfNeeded();
    await titleRow.getByRole('button', { name: /^publish$/i }).click();

    // After refetch, the same row now shows "Unpublish"
    await expect(
      page.locator(':text("' + title + '")').locator('xpath=ancestor::*[contains(@style, "grid-template-columns")][1]').getByRole('button', { name: /^unpublish$/i }),
    ).toBeVisible({ timeout: 8_000 });

    // 6. Open public /events page and find our event
    const page2 = await page.context().newPage();
    await page2.goto('/events');
    await expect(page2.getByText(title)).toBeVisible({ timeout: 12_000 });
    await page2.close();

    // 7. Clean up: delete the event via the row's delete button
    page.on('dialog', (d) => d.accept()); // accept the window.confirm
    const liveRow = page.locator(':text("' + title + '")').locator('xpath=ancestor::*[contains(@style, "grid-template-columns")][1]');
    await liveRow.getByRole('button', { name: /delete event/i }).click();

    // Row disappears
    await expect(page.getByText(title)).toHaveCount(0, { timeout: 8_000 });
  });

  test('"My profile" link in sidebar navigates to /profile', async ({ page }) => {
    await page.goto('/host/dashboard');
    await page.getByRole('link', { name: /^my profile$/i }).click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole('heading', { name: /my profile/i })).toBeVisible();
  });
});

test.describe('host event cleanup', () => {
  // Belt-and-suspenders: nuke any leftover [E2E] events from earlier flaky runs.
  test('clean up leftover [E2E] events', async ({ page }) => {
    await page.goto('/host/dashboard');
    page.on('dialog', (d) => d.accept());

    // Keep deleting rows whose title starts with [E2E] until none are left.
    for (let i = 0; i < 10; i++) {
      const target = page.getByText(/^\[E2E\]/).first();
      if (await target.count() === 0) break;
      const row = target.locator('xpath=ancestor::*[contains(@style, "grid-template-columns")][1]');
      await row.getByRole('button', { name: /delete event/i }).click();
      // wait for the row to disappear before next iteration
      await expect(target).toHaveCount(0, { timeout: 6_000 }).catch(() => {});
    }
  });
});
