#!/usr/bin/env node
// Test E2E (vrai Chrome) qui verrouille deux correctifs Reading du 18/07 :
//
//   1a) Score en mode isole : repondre juste a 3 questions sur 40 ne doit PLUS
//       donner un band gonfle (avant le fix : 3/3*40 = band 9). La regle est
//       unifiee avec le Quick Test (division par les questions POSEES = 40 en
//       mode isole). On verifie que le band affiche en session EGALE le band
//       sauvegarde (avant le fix, l'affiche etait 9.0 et le sauve etait bas :
//       ils divergeaient) et qu'il n'est pas 9.0.
//
//   1b) Reaffichage du dernier score au rechargement : la vignette du test doit
//       montrer "Last: ..." et non rester sur "Not attempted yet" (bug d'ordre
//       defer sur window.fmtBand).
//
// Methode : on demarre le test 01 en mode isole (pas de Quick Test), puis on
// remplace isAnswered/checkQ pour simuler exactement 3 bonnes reponses sur 40
// avant d'appeler submitTest(). On pilote ainsi le vrai calcul, sans dependre
// des clefs de reponses reelles.
//
// Prerequis : playwright-core ; Chrome ; serveur statique local.
// Usage : node tests/e2e-reading-score.js [chemin_vers_chrome]

const { chromium } = require('playwright-core');
const BASE_URL = process.env.PARROTTALK_TEST_URL || 'http://127.0.0.1:8000';
const CHROME_PATH = process.argv[2] || process.env.CHROME_PATH || '/usr/bin/google-chrome';

let passed = 0, failed = 0;
function check(label, ok) {
  if (ok) { console.log(`  \x1b[32mPASS\x1b[0m ${label}`); passed++; }
  else    { console.log(`  \x1b[31mFAIL\x1b[0m ${label}`); failed++; }
}

const INIT = `
  try { localStorage.setItem('parrottalk_cookie_consent','granted'); } catch (e) {}
`;

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  await context.addInitScript(INIT);
  const page = await context.newPage();
  page.on('pageerror', err => console.log('  [JS ERROR]', err.message));
  await page.route('**/googletagmanager.com/**', r => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));

  // ── Preparation : demarrer le test 01 en mode isole ──────────────────────────
  console.log('\n=== Preparation : demarrage du test 01 (mode isole) ===');
  await page.goto(`${BASE_URL}/reading.html`, { waitUntil: 'networkidle' });
  await page.click(`button[onclick="selectTest('test01')"]`);
  await page.waitForTimeout(200);
  await page.click(`button[onclick="startTest()"]`);
  await page.waitForTimeout(400);

  // ── Simulation : exactement 3 bonnes reponses sur 40, puis submit ────────────
  console.log('\n=== 1a : score non gonfle en mode isole (3 bonnes sur 40) ===');
  const res = await page.evaluate(() => {
    // 3 questions repondues, ces memes 3 correctes ; les 37 autres ni repondues ni justes.
    window.isAnswered = (n) => n <= 3;
    window.checkQ = (n) => n <= 3;
    window.submitTest();
    const heroEl = document.querySelector('.fb-hero__band');
    const scores = JSON.parse(localStorage.getItem('ielts_reading_scores') || '{}');
    const saved = scores['rdtest01'] || null;
    return {
      heroBand: heroEl ? heroEl.textContent.trim() : null,
      savedBand: saved ? saved.band : null,
      savedTotal: saved ? saved.total : null,
    };
  });

  check('Un band est affiche en session', res.heroBand !== null);
  check('Le total sauvegarde est bien 3 (brut, non gonfle)', res.savedTotal === 3);
  check('Le band affiche n\'est PAS 9.0 (plus de gonflage 3/3*40)', res.heroBand !== '9.0');
  check('Band affiche == band sauvegarde (session et historique coherents)',
        res.heroBand !== null && res.savedBand !== null &&
        parseFloat(res.heroBand) === Number(res.savedBand));
  check('Band coherent avec 3/40 (band bas, <= 4)', parseFloat(res.heroBand) <= 4);

  // ── 1b : reaffichage du dernier score au rechargement ────────────────────────
  console.log('\n=== 1b : la vignette reaffiche le dernier score au rechargement ===');
  await page.evaluate(() => { try { sessionStorage.clear(); } catch (e) {} });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const tile = await page.evaluate(() => {
    const el = document.getElementById('meta-rdtest01');
    return el ? el.textContent.trim() : null;
  });
  check('La vignette du test 01 n\'est plus "Not attempted yet"', tile !== null && !/Not attempted/i.test(tile));
  check('La vignette affiche "Last:" avec un band', tile !== null && /Last:/.test(tile) && /Band/i.test(tile));

  await browser.close();
  console.log('\n────────────────────────────────────────');
  const verdict = failed === 0 ? '\x1b[32mVERDICT : PASS\x1b[0m' : '\x1b[31mVERDICT : FAIL\x1b[0m';
  console.log(`${verdict}  (${passed} PASS, ${failed} FAIL)`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(err => { console.error('Erreur test :', err); process.exit(2); });
