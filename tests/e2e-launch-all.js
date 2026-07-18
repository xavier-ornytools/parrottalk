#!/usr/bin/env node
// Test E2E (vrai Chrome) : CHAQUE test de CHAQUE module se lance reellement.
// 4 modules x 4 tests = 16 lancements, verifies dans DEUX contextes :
//   - contexte VIERGE (localStorage vide) ;
//   - contexte SALE (Quick Test actif + progressions residuelles ILLISIBLES),
//     qui reproduit la regression du 18/07 (Listening 4/4 et Reading Test 1
//     bloques par un JSON.parse non garde dans loadProgress).
// Total : 32 lancements. Ce test manquait : la suite etait verte malgre le bug,
// car aucun test ne verifiait le lancement effectif en etat sale.
//
// Un lancement est OK si la zone de test devient visible ET qu'aucune erreur
// JavaScript (pageerror) n'est survenue pendant l'operation.
//
// Prerequis : playwright-core ; Chrome ; serveur statique local.
// Usage : node tests/e2e-launch-all.js [chemin_vers_chrome]

const { chromium } = require('playwright-core');
const BASE_URL = process.env.PARROTTALK_TEST_URL || 'http://127.0.0.1:8000';
const CHROME_PATH = process.argv[2] || process.env.CHROME_PATH || '/usr/bin/google-chrome';

let passed = 0, failed = 0;
function check(label, ok) {
  if (ok) { console.log(`  \x1b[32mPASS\x1b[0m ${label}`); passed++; }
  else    { console.log(`  \x1b[31mFAIL\x1b[0m ${label}`); failed++; }
}

// Procedure de lancement + indicateur "lance" (zone visible), par module.
const MODULES = {
  listening: {
    page: 'listening.html',
    launch: async (p, n) => {
      await p.click(`button[onclick="selectTest('test0${n}')"]`, { timeout: 3000 });
      await p.click(`button[onclick="startTest()"]`, { timeout: 3000 });
    },
    zone: 'test-zone',
  },
  reading: {
    page: 'reading.html',
    launch: async (p, n) => {
      await p.click(`button[onclick="selectTest('test0${n}')"]`, { timeout: 3000 });
      await p.click(`button[onclick="startTest()"]`, { timeout: 3000 });
    },
    zone: 'test-zone',
  },
  writing: {
    page: 'writing.html',
    launch: async (p, n) => {
      await p.click(`#wbtn-${n}`, { timeout: 3000 });
      await p.click('#start-writing-btn', { timeout: 3000 });
    },
    zone: 'task1-answer',
  },
  speaking: {
    page: 'speaking.html',
    launch: async (p, n) => {
      await p.click(`#spk-btn-${n}`, { timeout: 3000 });
      await p.click(`button[onclick="startTest()"]`, { timeout: 3000 }); // bouton du pretest
    },
    zone: 'spk-test-zone',
  },
};

const visible = (page, id) => page.evaluate((i) => {
  const el = document.getElementById(i);
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}, id);

function dirtyState() {
  // Progressions residuelles ILLISIBLES (residu tronque/corrompu) sur tous les
  // tests concernes, plus un Quick Test actif. Etat exact qui bloquait avant fix.
  try {
    localStorage.setItem('parrottalk_cookie_consent', 'granted');
    localStorage.setItem('pt_quickmock', JSON.stringify({ active: true }));
    ['test01', 'test02', 'test03', 'test04'].forEach((t) => {
      localStorage.setItem('ielts_progress_listening_' + t, '{tronque');
    });
    ['rdtest01', 'rdtest02', 'rdtest03', 'rdtest04'].forEach((t) => {
      localStorage.setItem('ielts_progress_reading_' + t, 'xx');
    });
  } catch (e) {}
}

async function runContext(browser, label, initFn) {
  console.log(`\n=== Contexte ${label} ===`);
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 }, permissions: ['microphone'] });
  await context.addInitScript(() => { try { localStorage.setItem('parrottalk_cookie_consent', 'granted'); } catch (e) {} });
  if (initFn) await context.addInitScript(initFn);
  const page = await context.newPage();
  // Writing sauve un brouillon et auto-reprend le test au rechargement ; changer
  // de test declenche alors un confirm("Switch to Test 0N?"). On l'accepte, comme
  // un utilisateur qui confirme le changement, pour tester chaque test isolement.
  page.on('dialog', (d) => d.accept().catch(() => {}));
  let errors = [];
  page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]));

  for (const [name, mod] of Object.entries(MODULES)) {
    for (let n = 1; n <= 4; n++) {
      errors = [];
      let ok = false;
      try {
        await page.goto(`${BASE_URL}/${mod.page}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(120);
        await mod.launch(page, n);
        await page.waitForTimeout(250);
        ok = await visible(page, mod.zone);
      } catch (e) {
        errors.push('EXC: ' + e.message.split('\n')[0]);
      }
      const clean = errors.length === 0;
      check(`${label} ${name} Test 0${n} se lance` + (clean ? '' : ` [erreur: ${errors[0]}]`), ok && clean);
    }
  }
  await context.close();
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  await runContext(browser, 'VIERGE', null);
  await runContext(browser, 'SALE', dirtyState);
  await browser.close();
  console.log('\n────────────────────────────────────────');
  const verdict = failed === 0 ? '\x1b[32mVERDICT : PASS\x1b[0m' : '\x1b[31mVERDICT : FAIL\x1b[0m';
  console.log(`${verdict}  (${passed} PASS, ${failed} FAIL sur 32)`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => { console.error('Erreur test :', err); process.exit(2); });
