// PREUVE REELLE (vrai Chrome) que le minuteur de preparation Part 2 est TOUJOURS
// visible en haut, sur les 4 tests, y compris dans le scenario qui echouait :
// une prise Part 2 existe deja (recordings[4] non nul). Pilote la Part 1 en
// enregistrant (verrou Suivant), arrive en Part 2, injecte une prise Part 2,
// re-rend, verifie et capture 4 screenshots sur le Bureau.
const { chromium } = require('playwright-core');
const BASE = process.env.PARROTTALK_TEST_URL || 'http://localhost:8000';
const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome';
const OUT = '/home/mac1/Bureau';

async function driveToPart2(page) {
  async function state() {
    return await page.evaluate(() => ({ part: currentPart, q: currentQIdx }));
  }
  for (let step = 0; step < 4; step++) {
    if ((await state()).part !== 1) break;
    await page.evaluate(() => document.getElementById('spk-rec-btn').click()); // start
    await page.waitForTimeout(1700);
    await page.evaluate(() => document.getElementById('spk-rec-btn').click()); // stop
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
  const results = [];
  for (const N of [1, 2, 3, 4]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript(() => { try { localStorage.setItem('parrottalk_consent_recording', 'granted'); } catch (e) {} });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.goto(`${BASE}/speaking.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(250);
    await page.click(`#spk-btn-${N}`);
    await page.waitForTimeout(120);
    await page.click('button:has-text("Start Test")');
    await page.waitForTimeout(180);

    await driveToPart2(page);

    // Scenario qui echouait : une prise Part 2 existe deja.
    await page.evaluate(() => {
      recordings[4] = { blob: { size: 5000 }, mimeType: 'audio/webm', duration: 6 };
      renderTestZone();
    });
    await page.waitForTimeout(150);

    const dom = await page.evaluate(() => {
      const pz = document.querySelector('.prep-zone');
      const startBtn = Array.from(document.querySelectorAll('button')).find(b => /Preparation Timer/i.test(b.textContent));
      const rec = document.body.innerText.includes('Recorded');
      const r = pz ? pz.getBoundingClientRect() : null;
      return {
        part: currentPart,
        prepInDOM: !!pz,
        startBtn: !!startBtn,
        top: r ? Math.round(r.top) : null,
        visible: r ? (r.width > 0 && r.height > 0) : false,
        part2RecordingExists: !!recordings[4],
        recordedStatusShown: rec,
      };
    });

    const shot = `${OUT}/2026-07-16_Speaking_Test0${N}_Part2.png`;
    await page.screenshot({ path: shot, fullPage: true });
    const ok = dom.part === 2 && dom.prepInDOM && dom.startBtn && dom.visible && dom.part2RecordingExists;
    results.push({ N, ok, dom, shot, errs });
    console.log(`Test 0${N}:`, ok ? 'PREP VISIBLE (avec prise Part 2 existante)' : 'ECHEC', JSON.stringify(dom), errs.length ? ('ERR ' + errs.join('|')) : '');
    await ctx.close();
  }
  await browser.close();
  const allOk = results.every(r => r.ok);
  console.log('\n=== RESULTAT GLOBAL:', allOk ? 'LES 4 TESTS OK' : 'AU MOINS UN ECHEC', '===');
  process.exit(allOk ? 0 : 2);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
