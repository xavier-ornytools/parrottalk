#!/usr/bin/env node
// Test E2E de la PREUVE RESEAU de l'instrumentation Listening (branche
// fix/listening-test-started-tracking).
//
// Contexte : le funnel par section du rapport quotidien montrait, cote Listening,
// plus de "Termines" que de "Demarres" (145 / 89 depuis le 14/07). Cause reelle
// (mesuree, pas supposee) : `section_completed` partait a CHAQUE sous-section
// (jusqu'a 4x par tentative), alors que `test_started` part une seule fois par
// tentative. Le demarrage, lui, etait correct. Correctif : `section_completed`
// n'est plus emis qu'UNE fois, quand la derniere sous-section est validee
// (module termine), comme Speaking.
//
// Ce test prouve le contrat corrige :
//   1. Un seul test_started au clic Start (jamais au chargement / choix de test).
//   2. AUCUN section_completed tant que le module n'est pas entierement termine.
//   3. Exactement UN section_completed quand la derniere sous-section est validee.
//   4. Reprise (reload meme onglet, auto-resume) : aucun nouveau test_started.
//
// Methode identique a e2e-reading-tracking.js : on observe dataLayer.push (point
// de passage garanti de tout event gtag), on BLOQUE googletagmanager (deterministe,
// zero pollution des vraies donnees GA4 de prod).
//
// Prerequis : playwright-core ; Chrome ; serveur statique sur 127.0.0.1:8000.
// Usage : node tests/e2e-listening-tracking.js [chemin_vers_chrome]

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
  window.__ev = [];
  window.dataLayer = window.dataLayer || [];
  (function () {
    var origPush = window.dataLayer.push.bind(window.dataLayer);
    window.dataLayer.push = function () {
      try {
        var a = arguments[0];
        if (a && a[0] === 'event') window.__ev.push({ name: a[1], params: a[2] || {} });
      } catch (e) {}
      return origPush.apply(window.dataLayer, arguments);
    };
  })();
`;

const nStarted   = (page) => page.evaluate(() => (window.__ev || []).filter(e => e.name === 'test_started').length);
const nCompleted = (page) => page.evaluate(() => (window.__ev || []).filter(e => e.name === 'section_completed').length);
const resetEv    = (page) => page.evaluate(() => { window.__ev = []; });

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  await context.addInitScript(INIT);
  const page = await context.newPage();
  page.on('pageerror', err => console.log('  [JS ERROR]', err.message));
  await page.route('**/googletagmanager.com/**', r => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));

  // ── Etape 1 : rien au chargement ni au choix de test ─────────────────────────
  console.log('\n=== Etape 1 : aucun event au chargement ni au choix de test ===');
  await page.goto(`${BASE_URL}/listening.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  check('Aucun test_started au chargement', (await nStarted(page)) === 0);
  await page.click(`button[onclick="selectTest('test01')"]`);
  await page.waitForTimeout(250);
  check('Aucun test_started apres le choix de Test 01', (await nStarted(page)) === 0);
  check('Aucun section_completed a ce stade', (await nCompleted(page)) === 0);

  // ── Etape 2 : exactement un test_started au clic Start ────────────────────────
  console.log('\n=== Etape 2 : un seul test_started au clic Start ===');
  await resetEv(page);
  const nSec = await page.evaluate(() => currentTest.sections.length);
  await page.click(`button[onclick="startTest()"]`);
  await page.waitForTimeout(400);
  check('Exactement 1 test_started emis au Start', (await nStarted(page)) === 1);
  const started = await page.evaluate(() => (window.__ev || []).find(e => e.name === 'test_started'));
  check('  -> param section = "listening"', started && started.params.section === 'listening');

  // ── Etape 3 : aucun section_completed sur les sous-sections intermediaires ────
  console.log(`\n=== Etape 3 : ${nSec} sous-sections, aucun section_completed avant la derniere ===`);
  for (let i = 0; i < nSec - 1; i++) {
    await page.evaluate(() => finishSection());
    await page.waitForTimeout(200);
    check(`  Sous-section ${i + 1}/${nSec} validee : toujours 0 section_completed`, (await nCompleted(page)) === 0);
  }

  // ── Etape 4 : exactement un section_completed a la derniere sous-section ──────
  console.log('\n=== Etape 4 : un seul section_completed a la fin du module ===');
  await page.evaluate(() => finishSection());
  await page.waitForTimeout(300);
  check('Exactement 1 section_completed (module termine, une fois par tentative)', (await nCompleted(page)) === 1);
  check('test_started toujours a 1 (pas de doublon)', (await nStarted(page)) === 1);

  // ── Etape 5 : reprise (reload) sans nouveau test_started ──────────────────────
  console.log('\n=== Etape 5 : reprise (auto-resume au reload) sans nouveau test_started ===');
  await page.goto(`${BASE_URL}/listening.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(150);
  await page.click(`button[onclick="selectTest('test02')"]`);
  await page.click(`button[onclick="startTest()"]`);
  await page.waitForTimeout(300);
  await page.evaluate(() => finishSection()); // 1 sous-section sur plusieurs
  await page.waitForTimeout(150);
  await resetEv(page);
  await page.reload({ waitUntil: 'networkidle' }); // init() auto-resume
  await page.waitForTimeout(500);
  const resumed = await page.evaluate(() => {
    const z = document.getElementById('test-zone');
    return !!z && !z.classList.contains('hidden');
  });
  check('Sanity : le test a bien repris (test-zone visible)', resumed === true);
  check('Aucun nouveau test_started a la reprise', (await nStarted(page)) === 0);

  await browser.close();

  console.log('\n────────────────────────────────────────');
  const verdict = failed === 0 ? '\x1b[32m✅ VERDICT : PASS\x1b[0m' : '\x1b[31m❌ VERDICT : FAIL\x1b[0m';
  console.log(`${verdict}  (${passed} PASS, ${failed} FAIL)`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(err => { console.error('Erreur test :', err); process.exit(2); });
