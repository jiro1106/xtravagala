import { test, expect } from '@playwright/test';

test.describe('RSVP (signed in as attendee)', () => {
  test('attendee can toggle RSVP on an event detail page', async ({ page }) => {
    // Open the first event from the public events page
    await page.goto('/events');
    const firstCard = page.locator('a[href^="/events/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 12_000 });
    await firstCard.click();
    await expect(page).toHaveURL(/\/events\/[a-f0-9-]{8,}/);

    // The RSVP button reads either "I'm going" (not yet RSVPed) or "You're going ✓"
    const rsvpButton = page.getByRole('button', { name: /i'm going|you're going/i });
    await expect(rsvpButton).toBeVisible({ timeout: 8_000 });

    const initialLabel = (await rsvpButton.textContent())?.trim() ?? '';
    const wasGoing = /you're going/i.test(initialLabel);

    // Read the initial "N people going" count
    const countText = page.getByText(/\d+\s+(person|people)\s+going/i);
    await expect(countText).toBeVisible();
    const initialCount = parseInt(((await countText.textContent()) ?? '0').match(/\d+/)?.[0] ?? '0', 10);

    // Toggle once
    await rsvpButton.click();

    // Label flips
    if (wasGoing) {
      await expect(page.getByRole('button', { name: /i'm going/i })).toBeVisible({ timeout: 6_000 });
    } else {
      await expect(page.getByRole('button', { name: /you're going/i })).toBeVisible({ timeout: 6_000 });
    }

    // Count shifts by exactly 1 in the expected direction
    await expect.poll(async () => {
      const t = (await page.getByText(/\d+\s+(person|people)\s+going/i).textContent()) ?? '';
      return parseInt(t.match(/\d+/)?.[0] ?? '0', 10);
    }, { timeout: 6_000 }).toBe(wasGoing ? initialCount - 1 : initialCount + 1);

    // Toggle back so the test is idempotent across runs
    await page.getByRole('button', { name: /i'm going|you're going/i }).click();
    await expect.poll(async () => {
      const t = (await page.getByText(/\d+\s+(person|people)\s+going/i).textContent()) ?? '';
      return parseInt(t.match(/\d+/)?.[0] ?? '0', 10);
    }, { timeout: 6_000 }).toBe(initialCount);
  });
});
