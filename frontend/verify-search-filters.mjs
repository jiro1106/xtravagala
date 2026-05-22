import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const results = [];
const pass = (label, detail = '') => results.push({ ok: true,  label, detail });
const fail = (label, detail = '') => results.push({ ok: false, label, detail });
const getPath = (page) => { const u = new URL(page.url()); return u.pathname + u.search; };

const SEARCH = 'input[placeholder="Search events, hosts, venues"]';
const LOC    = 'input[placeholder="Location"]';
const LB     = '[role="listbox"]';

async function goHome(page) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.locator(LOC).waitFor({ state: 'visible' });
  await page.waitForTimeout(200); // extra settle after navigation
}
async function submit(page) {
  await page.click('button[aria-label="Search"]');
  await page.waitForTimeout(400);
}
async function openLoc(page) {
  await page.locator(LOC).click();
  await page.waitForTimeout(200);
  await page.waitForSelector(`${LB} [role="option"]`, { state: 'visible', timeout: 6000 });
  await page.waitForTimeout(200);
}
async function selectCity(page, name) {
  await openLoc(page);
  await page.locator(`${LB} [role="option"]`).filter({ hasText: name }).first().click({ force: true });
  await page.waitForTimeout(300);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // 1. Empty query + default Manila
  await goHome(page);
  await submit(page);
  { const u = getPath(page);
    u === '/events?city=manila' ? pass('1. Empty query + default Manila', u) : fail('1. Empty query + default Manila', `got: ${u}`); }

  // 2. Query only + default Manila
  await goHome(page);
  await page.fill(SEARCH, 'jazz');
  await submit(page);
  { const u = getPath(page);
    u.includes('q=jazz') && u.includes('city=manila') ? pass('2. Query "jazz" + default Manila', u) : fail('2. Query "jazz" + default Manila', `got: ${u}`); }

  // 3. City only — Cebu
  await goHome(page);
  await selectCity(page, 'Cebu City');
  await submit(page);
  { const u = getPath(page);
    u === '/events?city=cebu' ? pass('3. City only: Cebu City', u) : fail('3. City only: Cebu City', `got: ${u}`); }

  // 4. Query + city — yoga + BGC
  await goHome(page);
  await page.fill(SEARCH, 'yoga');
  await selectCity(page, 'Bonifacio Global City');
  await submit(page);
  { const u = getPath(page);
    u.includes('q=yoga') && u.includes('city=bgc') ? pass('4. Query "yoga" + BGC', u) : fail('4. Query "yoga" + BGC', `got: ${u}`); }

  // 5. Filter city list by typing "baguio"
  await goHome(page);
  await openLoc(page);
  await page.fill(LOC, 'baguio');
  await page.waitForTimeout(250);
  await page.locator(`${LB} [role="option"]`).filter({ hasText: 'Baguio City' }).first().click({ force: true });
  await page.waitForTimeout(250);
  await submit(page);
  { const u = getPath(page);
    u === '/events?city=baguio' ? pass('5. Type "baguio" → Baguio City', u) : fail('5. Type "baguio" → Baguio City', `got: ${u}`); }

  // 6. Free-text location → no city param (stays at / since nothing to search)
  await goHome(page);
  await openLoc(page);
  await page.fill(LOC, 'Somewhere Random');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  await submit(page);
  { const u = getPath(page);
    !u.includes('city=') && !u.includes('nearby=') ? pass('6. Free-text location → no city param', u) : fail('6. Free-text location → no city param', `got: ${u}`); }

  // 7. Query + free-text location → q only
  await goHome(page);
  await page.fill(SEARCH, 'yoga');
  await openLoc(page);
  await page.fill(LOC, 'Random');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  await submit(page);
  { const u = getPath(page);
    u.includes('q=yoga') && !u.includes('city=') ? pass('7. Query "yoga" + free-text → q only', u) : fail('7. Query "yoga" + free-text → q only', `got: ${u}`); }

  // 8. Keyboard nav: 6× ↓ → Davao City
  // index: 0=GPS, 1=Manila, 2=BGC, 3=Makati, 4=Cebu, 5=Davao
  await goHome(page);
  await openLoc(page);
  for (let i = 0; i < 6; i++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(60); }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(350);
  await submit(page);
  { const u = getPath(page);
    u === '/events?city=davao' ? pass('8. Keyboard 6× ↓ → Davao City', u) : fail('8. Keyboard 6× ↓ → Davao City', `got: ${u}`); }

  // 9. Re-select: Makati → Iloilo
  await goHome(page);
  await selectCity(page, 'Makati City');
  await selectCity(page, 'Iloilo City');
  await submit(page);
  { const u = getPath(page);
    u === '/events?city=iloilo' ? pass('9. Re-select: Makati → Iloilo City', u) : fail('9. Re-select: Makati → Iloilo City', `got: ${u}`); }

  // 10. Enter on search: no matching event + Cebu selected
  await goHome(page);
  await selectCity(page, 'Cebu City');
  await page.fill(SEARCH, 'zzznomatch');
  await page.waitForTimeout(450);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  await page.locator(SEARCH).focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  { const u = getPath(page);
    u.includes('q=zzznomatch') && u.includes('city=cebu') ? pass('10. Enter "zzznomatch" + Cebu', u) : fail('10. Enter "zzznomatch" + Cebu', `got: ${u}`); }

  // 11. "No events found" message visible
  await goHome(page);
  await page.fill(SEARCH, 'xyzxyzxyz');
  await page.waitForTimeout(400);
  { const n = await page.locator('text=No events found for "xyzxyzxyz"').count();
    n > 0 ? pass('11. "No events found" message shown') : fail('11. "No events found" message shown', 'text not visible'); }

  // 12. Escape closes location dropdown
  await goHome(page);
  await openLoc(page);
  const before = await page.locator(LB).isVisible();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const after = await page.locator(LB).isVisible();
  before && !after ? pass('12. Escape closes location dropdown') : fail('12. Escape closes location dropdown', `before=${before} after=${after}`);

  await ctx.close();

  // ── geolocation context ────────────────────────────────────────────────────
  const geoCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    geolocation: { latitude: 14.5995, longitude: 120.9842 },
    permissions: ['geolocation'],
  });
  const gp = await geoCtx.newPage();

  async function clickGps(p) {
    await p.locator(LOC).click();
    await p.waitForTimeout(200);
    await p.waitForSelector(`${LB} [role="option"]`, { state: 'visible', timeout: 6000 });
    await p.waitForTimeout(200);
    await p.locator(`${LB} [role="option"]`).filter({ hasText: 'Use current location' }).first().click({ force: true });
    await p.waitForTimeout(2500);
  }

  // 13. Use current location → ?nearby=true
  await gp.goto(BASE, { waitUntil: 'networkidle' });
  await gp.locator(LOC).waitFor({ state: 'visible' });
  await gp.waitForTimeout(200);
  await clickGps(gp);
  await gp.click('button[aria-label="Search"]');
  await gp.waitForTimeout(400);
  { const u = new URL(gp.url()).pathname + new URL(gp.url()).search;
    u === '/events?nearby=true' ? pass('13. Use current location → nearby=true', u) : fail('13. Use current location → nearby=true', `got: ${u}`); }

  // 14. Query + nearby
  await gp.goto(BASE, { waitUntil: 'networkidle' });
  await gp.locator(LOC).waitFor({ state: 'visible' });
  await gp.waitForTimeout(200);
  await clickGps(gp);
  await gp.fill(SEARCH, 'music');
  await gp.waitForTimeout(350);
  await gp.keyboard.press('Escape');
  await gp.waitForTimeout(200);
  await gp.click('button[aria-label="Search"]');
  await gp.waitForTimeout(400);
  { const u = new URL(gp.url()).pathname + new URL(gp.url()).search;
    u.includes('q=music') && u.includes('nearby=true') ? pass('14. Query "music" + nearby=true', u) : fail('14. Query "music" + nearby=true', `got: ${u}`); }

  await geoCtx.close();
  await browser.close();

  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  console.log(`\n${'─'.repeat(64)}`);
  console.log(`Search filter verification  (${passed} pass / ${failed} fail)`);
  console.log('─'.repeat(64));
  for (const r of results) {
    console.log(`${r.ok ? '✅' : '❌'}  ${r.label}`);
    if (r.detail) console.log(`     ${r.detail}`);
  }
  console.log('─'.repeat(64));
  if (failed > 0) process.exit(1);
}

run().catch(e => { console.error(e.message ?? e); process.exit(1); });
