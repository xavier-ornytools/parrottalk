#!/usr/bin/env node
// Test E2E de la PREUVE RÉSEAU du garde-fous Reading (branche fix/reading-garde-fous-tracking).
// Objectif : prouver que l'event GA4 `test_started` (celui qui déclenche la requête
// google-analytics.com/g/collect?en=test_started) ne part QU'au clic Start explicite,
// jamais au chargement ni au choix de test, et pas non plus à une reprise (reload même onglet).
//
// Méthode : on observe window.dataLayer.push (le point de passage garanti de tout event
// gtag : ptEvent -> gtag('event',...) -> dataLayer.push(['event', name, ...]) -> /g/collect).
// On BLOQUE googletagmanager : le test est déterministe ET n'envoie rien aux vraies données
// GA4 de prod (zéro pollution). Observer dataLayer équivaut à sniffer /g/collect, en mieux.
//
// Profil vierge : contexte neuf, pas de marqueur interne (pt_internal absent) -> trafic externe.
// Consentement cookies accordé d'emblée (equivaut à accepter le bandeau), pour que l'étape 1
// soit STRICTE : analytics pleinement actif, donc si le garde-fou échouait, l'event partirait.
//
// Prérequis : playwright-core ; Chrome ; preview locale de la branche Reading sur 127.0.0.1:8080.
// Usage : node tests/e2e-reading-tracking.js [chemin_vers_chrome]

const { chromium } = require('playwright-core');
const BASE_URL = process.env.PARROTTALK_TEST_URL || 'http://127.0.0.1:8080';
const CHROME_PATH = process.argv[2] || process.env.CHROME_PATH || '/usr/bin/google-chrome';

let passed = 0, failed = 0;
function check(label, ok) {
  if (ok) { console.log(`  \x1b[32mPASS\x1b[0m ${label}`); passed++; }
  else    { console.log(`  \x1b[31mFAIL\x1b[0m ${label}`); failed++; }
}

// Injecté AVANT tout script de page, à chaque navigation ET reload : accorde le
// consentement et patche dataLayer.push pour enregistrer les events dans window.__ev.
// Capture donc aussi une émission fautive survenant pendant le chargement (étape 3).
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

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  await context.addInitScript(INIT);
  const page = await context.newPage();
  page.on('pageerror', err => console.log('  [JS ERROR]', err.message));
  // Blocage du vrai GA : pas de dépendance réseau, pas de pollution des données de prod.
  await page.route('**/googletagmanager.com/**', r => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));

  const startedEvents = () => page.evaluate(() => (window.__ev || []).filter(e => e.name === 'test_started'));
  const resetEv = () => page.evaluate(() => { window.__ev = []; });

  // ── Étape 1 : rien au chargement, rien au choix de test ──────────────────────
  console.log('\n=== Étape 1 : aucun test_started au chargement ni au choix de test ===');
  await page.goto(`${BASE_URL}/reading.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  let s = await startedEvents();
  check('Aucun test_started au chargement de la page', s.length === 0);

  await page.click(`button[onclick="selectTest('test02')"]`);
  await page.waitForTimeout(300);
  s = await startedEvents();
  check('Aucun test_started après le choix de Test 02', s.length === 0);

  // ── Étape 2 : exactement un test_started au clic Start ────────────────────────
  console.log('\n=== Étape 2 : un seul test_started au clic Start ===');
  await resetEv();
  await page.click(`button[onclick="startTest()"]`);
  await page.waitForTimeout(400);
  s = await startedEvents();
  check('Exactement 1 test_started émis au Start', s.length === 1);
  check('  -> param section = "reading"', s.length === 1 && s[0].params.section === 'reading');
  check('  -> pas de doublon (une seule émission)', s.length === 1);

  // ── Étape 3 : reprise (reload même onglet) sans nouveau test_started ──────────
  console.log('\n=== Étape 3 : reprise (reload même onglet) sans nouveau test_started ===');
  await page.reload({ waitUntil: 'networkidle' }); // __ev réinitialisé par INIT avant le load
  await page.waitForTimeout(600);
  const resumed = await page.evaluate(() => sessionStorage.getItem('ielts_reading_session'));
  check('Sanity : le test a bien repris (session active = Test 02)', resumed === '2');
  s = await startedEvents();
  check('Aucun nouveau test_started à la reprise (param resume)', s.length === 0);

  await browser.close();

  console.log('\n────────────────────────────────────────');
  const verdict = failed === 0 ? '\x1b[32m✅ VERDICT : PASS\x1b[0m' : '\x1b[31m❌ VERDICT : FAIL\x1b[0m';
  console.log(`${verdict}  (${passed} PASS, ${failed} FAIL)`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(err => { console.error('Erreur test :', err); process.exit(2); });
