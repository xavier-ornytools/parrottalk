#!/usr/bin/env node
// tests/e2e-reading-test04.js
// Preuve de bout en bout que le Reading Test 04 s'integre reellement : selection,
// rendu des 3 passages, 40 questions, timer 60:00, et surtout non-regression de la
// selection (l'ancienne cascade de ternaires retombait en silence sur le test 01).
//
// Usage : node tests/e2e-reading-test04.js [chemin-chrome]
// Prerequis : serveur statique sur http://127.0.0.1:8000 (cf. CLAUDE.md du projet).

const { chromium } = require('playwright-core');

const URL = process.env.PARROTTALK_TEST_URL || 'http://127.0.0.1:8000';
const CHROME = process.argv[2] || process.env.CHROME_PATH || '/usr/bin/google-chrome';

let passed = 0, failed = 0;
function check(label, cond, detail) {
  if (cond) { passed++; console.log('  ok   ' + label); }
  else { failed++; console.log('  FAIL ' + label + (detail ? ' -> ' + detail : '')); }
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage();
  await page.goto(URL + '/reading.html', { waitUntil: 'domcontentloaded' });

  // Consentement cookies eventuel, meme approche que reading-extract.js
  await page.evaluate(() => { try { localStorage.setItem('pt_cookie_consent', 'all'); } catch (e) {} });
  await page.reload({ waitUntil: 'domcontentloaded' });

  // 1) Le 4e bouton de selection existe
  const btn4 = await page.locator('button.test-sel-btn').nth(3);
  check('le 4e bouton de test est present', await btn4.count() > 0);
  check('le 4e bouton porte le libelle Test 04', (await btn4.locator('.t-num').innerText()).trim() === 'Test 04');

  // 2) Selection du test 04 : c'est BIEN le test 04 qui se charge, pas le 01
  await page.click('button.test-sel-btn:nth-child(4)');
  const key = await page.evaluate(() => currentTestKey);
  check('selectTest(test04) charge rdtest04 et non rdtest01', key === 'rdtest04', 'currentTestKey=' + key);

  // 3) Demarrage et rendu
  await page.click('button:has-text("Start Test")');
  await page.waitForTimeout(500);

  const h = await page.locator('#test-zone h3').first().innerText();
  check('le passage 1 rendu est celui du test 04', /Navigation of Migratory Birds/.test(h), h);

  const headings = await page.locator('#test-zone h3').allInnerTexts();
  check('les 3 passages du test 04 sont rendus', headings.length >= 3, headings.length + ' titres');

  // 4) 40 questions repondables sur l'ensemble des passages
  let inputs = 0;
  for (let qn = 1; qn <= 40; qn++) {
    const n = await page.locator(`input[name="q${qn}"], #q${qn}`).count();
    if (n > 0) inputs++;
  }
  check('les 40 questions sont rendues et repondables', inputs === 40, inputs + '/40');

  // 5) Timer 60 minutes herite sans configuration
  const timer = await page.locator('#timer-display').innerText();
  check('le timer affiche 60:00 au demarrage', /60:00/.test(timer), timer);

  // 6) Non-regression : les tests 01 a 03 se chargent toujours sur leur propre contenu
  for (const [idx, expectKey, expectHeading] of [[1, 'rdtest01', /Psychology of Sleep/], [2, 'rdtest02', /Renewable Energy/], [3, 'rdtest03', /History of Glass/]]) {
    await page.click(`button.test-sel-btn:nth-child(${idx})`);
    const k = await page.evaluate(() => currentTestKey);
    await page.click('button:has-text("Start Test")');
    await page.waitForTimeout(300);
    const hh = await page.locator('#test-zone h3').first().innerText();
    check(`non-regression test 0${idx} : clef ${expectKey}`, k === expectKey, 'clef=' + k);
    check(`non-regression test 0${idx} : passage 1 correct`, expectHeading.test(hh), hh);
  }

  await browser.close();
  console.log(`\n  ${passed} passed  |  ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
