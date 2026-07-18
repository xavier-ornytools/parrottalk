#!/usr/bin/env node
// Test E2E (vrai Chrome) du correctif d'aiguillage Quick Test vs mode isole (18/07).
//
// Bug corrige : QM_ON valait QuickMock.isActive() seul, donc une arrivee sur une
// page de module en mode ISOLE (lien Single Section Practice, sans ?qm) etait
// detournee en Quick Test des qu'un etat quick trainait dans le localStorage.
//
// Comportement verrouille :
//   1) Quick actif + arrivee SANS ?qm  -> page en mode isole (selecteur visible,
//      hero "IELTS Reading Test"), plus une banniere explicite Reprendre/Quitter.
//   2) Quick actif + arrivee AVEC ?qm=1 -> mode Quick Test (test lance, hero
//      "Quick Test, Reading"), aucune banniere.
//   3) Bouton "Quit Quick Test" -> etat quick purge, banniere retiree.
//
// Prerequis : playwright-core ; Chrome ; serveur statique local.
// Usage : node tests/e2e-quick-routing.js [chemin_vers_chrome]

const { chromium } = require('playwright-core');
const BASE_URL = process.env.PARROTTALK_TEST_URL || 'http://127.0.0.1:8000';
const CHROME_PATH = process.argv[2] || process.env.CHROME_PATH || '/usr/bin/google-chrome';

let passed = 0, failed = 0;
function check(label, ok) {
  if (ok) { console.log(`  \x1b[32mPASS\x1b[0m ${label}`); passed++; }
  else    { console.log(`  \x1b[31mFAIL\x1b[0m ${label}`); failed++; }
}

const hidden = (page, id) => page.evaluate((i) => {
  const el = document.getElementById(i);
  return el ? el.classList.contains('hidden') : null;
}, id);
const heroH1 = (page) => page.evaluate(() => {
  const h = document.querySelector('.page-hero.reading h1');
  return h ? h.textContent.trim() : null;
});
const hasBanner = (page) => page.evaluate(() => !!document.getElementById('qm-resume-banner'));

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  await context.addInitScript(() => { try { localStorage.setItem('parrottalk_cookie_consent','granted'); } catch (e) {} });
  const page = await context.newPage();
  page.on('pageerror', err => console.log('  [JS ERROR]', err.message));
  await page.route('**/googletagmanager.com/**', r => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));

  // Active un Quick Test (etat localStorage), sans passer par le hub.
  await page.goto(`${BASE_URL}/reading.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.QuickMock.start(1));

  // ── 1) Arrivee SANS ?qm : doit rester isolee + banniere ──────────────────────
  console.log('\n=== 1) Quick actif, arrivee isolee (sans ?qm) ===');
  await page.goto(`${BASE_URL}/reading.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  check('Le selecteur de test est visible (mode isole, non detourne)', (await hidden(page, 'test-selector')) === false);
  check('Le hero reste "IELTS Reading Test" (pas de format quick)', (await heroH1(page)) === 'IELTS Reading Test');
  check('La banniere Quick Test en cours est affichee', (await hasBanner(page)) === true);
  check('La banniere propose Reprendre (lien vers le hub)',
        await page.evaluate(() => { const a = document.querySelector('#qm-resume-banner a'); return !!a && /quickmock\.html/.test(a.getAttribute('href') || ''); }));
  check('La banniere propose Quitter', await page.evaluate(() => !!document.getElementById('qm-resume-quit')));

  // ── 2) Arrivee AVEC ?qm=1 : doit lancer le Quick Test, sans banniere ─────────
  console.log('\n=== 2) Quick actif, arrivee quick (?qm=1) ===');
  await page.goto(`${BASE_URL}/reading.html?qm=1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  check('Le selecteur de test est masque (Quick Test lance)', (await hidden(page, 'test-selector')) === true);
  check('La zone de test est affichee', (await hidden(page, 'test-zone')) === false);
  check('Le hero devient "Quick Test, Reading"', (await heroH1(page)) === 'Quick Test, Reading');
  check('Aucune banniere en entree quick legitime', (await hasBanner(page)) === false);

  // ── 3) Bouton Quitter : purge l'etat quick ───────────────────────────────────
  console.log('\n=== 3) Quitter le Quick Test depuis la banniere ===');
  await page.goto(`${BASE_URL}/reading.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  check('Sanity : quick encore actif, banniere presente', (await hasBanner(page)) === true && (await page.evaluate(() => window.QuickMock.isActive())) === true);
  await page.click('#qm-resume-quit');
  await page.waitForTimeout(200);
  check('Apres Quitter : Quick Test purge (isActive=false)', (await page.evaluate(() => window.QuickMock.isActive())) === false);
  check('Apres Quitter : banniere retiree', (await hasBanner(page)) === false);

  await browser.close();
  console.log('\n────────────────────────────────────────');
  const verdict = failed === 0 ? '\x1b[32mVERDICT : PASS\x1b[0m' : '\x1b[31mVERDICT : FAIL\x1b[0m';
  console.log(`${verdict}  (${passed} PASS, ${failed} FAIL)`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(err => { console.error('Erreur test :', err); process.exit(2); });
