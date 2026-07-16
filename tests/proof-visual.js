// Preuve visuelle du nouvel encart de preparation Part 2 (vrai Chrome).
// 2 captures Bureau : avant clic (bouton) et pendant le decompte (gros chiffres).
// Verifie aussi que .prep-panel rend sur les 4 tests.
const { chromium } = require('playwright-core');
const BASE = process.env.PARROTTALK_TEST_URL || 'http://localhost:8000';
const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome';
const OUT = '/home/mac1/Bureau';

async function driveToPart2(page, N) {
  await page.click(`#spk-btn-${N}`);
  await page.waitForTimeout(120);
  await page.click('button:has-text("Start Test")');
  await page.waitForTimeout(180);
  for (let s = 0; s < 4; s++) {
    if ((await page.evaluate(() => currentPart)) !== 1) break;
    await page.evaluate(() => document.getElementById('spk-rec-btn').click());
    await page.waitForTimeout(1700);
    await page.evaluate(() => document.getElementById('spk-rec-btn').click());
    await page.waitForTimeout(500);
    const next = page.locator('.spk-nav button.btn-primary:not([disabled])');
    await next.waitFor({ state: 'visible', timeout: 4000 });
    await next.click();
    await page.waitForTimeout(300);
  }
}

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROME, headless: true,
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  });

  // Verif rapide : .prep-panel present sur les 4 tests
  for (const N of [1, 2, 3, 4]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript(() => { try { localStorage.setItem('parrottalk_consent_recording', 'granted'); } catch (e) {} });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/speaking.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(200);
    await driveToPart2(page, N);
    const has = await page.evaluate(() => {
      const p = document.querySelector('.prep-panel');
      const btn = document.querySelector('.prep-panel .btn-primary');
      const r = p ? p.getBoundingClientRect() : null;
      return { panel: !!p, primaryBtn: !!btn, top: r ? Math.round(r.top) : null, insideViewport: r ? r.right <= window.innerWidth + 1 : false };
    });
    console.log(`Test 0${N} prep-panel:`, JSON.stringify(has));
    await ctx.close();
  }

  // Captures sur Test 04 : avant clic + pendant decompte, banniere cookies acceptee
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('parrottalk_consent_recording', 'granted'); } catch (e) {} });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/speaking.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(200);
  const accept = page.locator('button:has-text("Accept")');
  if (await accept.count()) { try { await accept.first().click({ timeout: 800 }); } catch (e) {} }
  await driveToPart2(page, 4);

  const shot1 = `${OUT}/2026-07-16_Speaking_Prep_avant-clic.png`;
  await page.screenshot({ path: shot1, fullPage: true });

  // Lancer le decompte et laisser tourner ~3s
  await page.evaluate(() => document.querySelector('.prep-panel .btn-primary').click());
  await page.waitForTimeout(3000);
  const countTxt = await page.evaluate(() => {
    const el = document.getElementById('spk-prep-display');
    return el ? el.textContent : null;
  });
  const shot2 = `${OUT}/2026-07-16_Speaking_Prep_pendant-decompte.png`;
  await page.screenshot({ path: shot2, fullPage: true });
  console.log('countdown affiche:', countTxt);
  console.log('shot1:', shot1);
  console.log('shot2:', shot2);

  await browser.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
