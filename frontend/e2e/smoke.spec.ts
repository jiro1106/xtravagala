import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('landing page renders main sections', async ({ page }) => {
    await page.goto('/');
    // Header brand
    await expect(page.getByRole('banner').getByText('Xtravagala')).toBeVisible();
    // Hero CTA button somewhere on the landing page
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Footer
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });

  test('events page lists events from Supabase', async ({ page }) => {
    await page.goto('/events');
    // At least one event card should render — every card contains a heading with title.
    // Use a generous timeout: first query against Supabase from a cold dev start.
    await expect(page.getByRole('link', { name: /view event|view details|^view/i }).first().or(page.locator('article, [class*="EventCard"]').first())).toBeVisible({ timeout: 12_000 });
  });

  test('destinations page lists cities', async ({ page }) => {
    await page.goto('/destinations');
    // City cards include the city name as a heading
    await expect(page.getByText(/manila|cebu|makati|bgc/i).first()).toBeVisible({ timeout: 12_000 });
  });

  test('clicking an event card opens the detail page', async ({ page }) => {
    await page.goto('/events');
    // Wait for cards then click the first one
    const firstCard = page.locator('a[href^="/events/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 12_000 });
    await firstCard.click();
    await expect(page).toHaveURL(/\/events\/[a-f0-9-]{8,}/);
    // Detail page should have the event title as an h1 and a "Reserve a spot" / RSVP button area
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
