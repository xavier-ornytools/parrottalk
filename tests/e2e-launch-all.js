#!/usr/bin/env node
/*
 * e2e-launch-all.js  (reecrit 2026-07-18, reprise regression nav)
 *
 * Harnais HONNETE : il mesure le fonctionnement REEL d'un lancement de test,
 * pas un proxy. Ce qui distingue cette version de l'ancienne (52074a5, qui
 * annoncait 32/32 alors que le site etait casse) :
 *   - Listening : on clique VRAIMENT le bouton Play et on exige que
 *     audio.currentTime AVANCE (l'audio joue reellement). Une zone "visible"
 *     ne suffit pas.
 *   - Reading   : on exige que des champs de reponse soient rendus (compte > 0).
 *   - Writing   : on exige que l'editeur (textarea) soit visible.
 *   - Speaking  : on exige que la zone de test soit rendue.
 *   - Clics NON forces : click() par defaut (Playwright verifie visibilite,
 *     stabilite, actionnabilite). Un obstacle reel DOIT faire echouer.
 *   - Toute erreur JS de la page (pageerror) invalide le lancement.
 *   - Captures d'ecran a l'appui dans tests/screenshots/.
 *
 * Etat localStorage : STATE=clean (defaut, premier visiteur) ou STATE=dirty
 * (progres residuel + quickmock actif + cle corrompue) pour reproduire la
 * regression vecue par Xavier.
 *
 * Usage :
 *   python3 -m http.server 8000 --bind 127.0.0.1   (depuis la racine du repo)
 *   node tests/e2e-launch-all.js [chemin-chrome]
 *   STATE=dirty node tests/e2e-launch-all.js
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.PARROTTALK_TEST_URL || 'http://127.0.0.1:8000';
const CHROME = process.argv[2] || process.env.CHROME_PATH || '/usr/bin/google-chrome';
const STATE = process.env.STATE || 'clean';
const SHOT_DIR = path.join(__dirname, 'screenshots', STATE);

const C = { g: '\x1b[32m', r: '\x1b[31m', y: '\x1b[33m', d: '\x1b[2m', x: '\x1b[0m' };
let passed = 0, failed = 0;
const rows = [];
function record(label, ok, detail) {
  if (ok) { passed++; console.log(`${C.g}PASS${C.x} ${label} ${C.d}${detail || ''}${C.x}`); }
  else { failed++; console.log(`${C.r}FAIL${C.x} ${label} ${C.y}${detail || ''}${C.x}`); }
  rows.push({ label, ok: !!ok, detail: detail || '' });
}

// Etat "sale" injecte AVANT tout script de page : progres Listening test01
// lisible mais perime (section 1 marquee jouee), quickmock actif, et une cle
// Reading corrompue. Reproduit le contexte reel ou "le clic play ne reagit pas".
const dirtyState = () => {
  try {
    // Progres Listening lisible mais perime : section 1 marquee "jouee".
    localStorage.setItem('ielts_progress_listening_test01', JSON.stringify({
      currentSection: 0,
      sectionsDone: [false, false, false, false],
      sectionScores: [0, 0, 0, 0],
      answers: {},
      examMode: true,
      sectionsPlayed: [true, false, false, false],
    }));
    // Cle Reading corrompue (teste la robustesse de loadProgress, f08b1a8).
    localStorage.setItem('ielts_progress_reading_rdtest01', '{tronque');
    // Quick Test abandonne, etat REALISTE (meme forme que QuickMock.start :
    // v/active/combo/results). Sert a verifier que les pages normales ne sont
    // PLUS detournees une fois l'aiguillage (74898c6) reapplique.
    localStorage.setItem('pt_quickmock', JSON.stringify({
      v: 1, active: true, started: 1, seed: null,
      combo: {
        listening: { test: 'test01', section: 0 },
        reading:   { test: 'test01', passage: 0 },
        writing:   { test: 'test01', task: 1 },
        speaking:  { test: 'test01', part: 2 },
      },
      results: {},
    }));
  } catch (e) {}
};

const TESTS = ['test01', 'test02', 'test03', 'test04'];

async function newPage(context) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('dialog', d => d.accept().catch(() => {})); // confirm("Switch to Test..") Writing
  page._jsErrors = errors;
  return page;
}

async function shot(page, name) {
  try {
    fs.mkdirSync(SHOT_DIR, { recursive: true });
    await page.screenshot({ path: path.join(SHOT_DIR, name + '.png') });
  } catch (e) {}
}

async function visible(page, sel) {
  return page.evaluate(s => {
    const el = document.querySelector(s);
    if (!el) return false;
    if (el.classList.contains('hidden')) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }, sel);
}

// ── Listening : le vrai test = l'audio AVANCE apres un clic Play reel ──────────
async function launchListening(page, testId) {
  const label = `listening/${testId}`;
  const errs = page._jsErrors;
  await page.goto(`${BASE_URL}/listening.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(150);
  await page.click(`button[onclick="selectTest('${testId}')"]`, { timeout: 4000 });
  await page.click('button[onclick="startTest()"]', { timeout: 4000 });
  await page.waitForTimeout(200);
  const zoneOk = await visible(page, '#test-zone');
  if (!zoneOk) { await shot(page, label.replace('/', '-')); return record(label, false, 'test-zone non visible'); }

  // Clic Play REEL (pas de force) puis preuve que l'audio joue vraiment.
  await page.click('#play-btn', { timeout: 4000 });
  let advanced = false, ct = 0;
  for (let i = 0; i < 40; i++) { // jusqu'a ~6s
    ct = await page.evaluate(() => {
      const a = document.getElementById('audio-player');
      return a ? a.currentTime : -1;
    });
    if (ct > 0.25) { advanced = true; break; }
    await page.waitForTimeout(150);
  }
  await shot(page, label.replace('/', '-'));
  const clean = errs.length === 0;
  record(label, advanced && clean,
    `audio currentTime=${ct.toFixed(2)}s ${advanced ? 'AVANCE' : 'BLOQUE'}${clean ? '' : ' | JS err: ' + errs[0]}`);
}

// ── Reading : le vrai test = des champs de reponse sont rendus (> 0) ──────────
async function launchReading(page, testId) {
  const label = `reading/${testId}`;
  const errs = page._jsErrors;
  await page.goto(`${BASE_URL}/reading.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(150);
  await page.click(`button[onclick="selectTest('${testId}')"]`, { timeout: 4000 });
  await page.click('button[onclick="startTest()"]', { timeout: 4000 });
  await page.waitForTimeout(300);
  const zoneOk = await visible(page, '#test-zone');
  const nInputs = await page.evaluate(() =>
    document.querySelectorAll('#test-zone input[name^="q"], #test-zone input.q-input').length);
  await shot(page, label.replace('/', '-'));
  const clean = errs.length === 0;
  record(label, zoneOk && nInputs > 0 && clean,
    `${nInputs} champs rendus${clean ? '' : ' | JS err: ' + errs[0]}`);
}

// ── Writing : le vrai test = l'editeur (textarea) est visible ─────────────────
async function launchWriting(page, testId) {
  const n = TESTS.indexOf(testId) + 1;
  const label = `writing/${testId}`;
  const errs = page._jsErrors;
  await page.goto(`${BASE_URL}/writing.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(150);
  await page.click(`#wbtn-${n}`, { timeout: 4000 });
  await page.click('#start-writing-btn', { timeout: 4000 });
  await page.waitForTimeout(250);
  const editorOk = await visible(page, '#task1-answer');
  await shot(page, label.replace('/', '-'));
  const clean = errs.length === 0;
  record(label, editorOk && clean, `editeur ${editorOk ? 'visible' : 'absent'}${clean ? '' : ' | JS err: ' + errs[0]}`);
}

// ── Speaking : le vrai test = la zone de test est rendue ───────────────────────
async function launchSpeaking(page, testId) {
  const n = TESTS.indexOf(testId) + 1;
  const label = `speaking/${testId}`;
  const errs = page._jsErrors;
  await page.goto(`${BASE_URL}/speaking.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(150);
  await page.click(`#spk-btn-${n}`, { timeout: 4000 });
  await page.click('button[onclick="startTest()"]', { timeout: 4000 });
  await page.waitForTimeout(250);
  const zoneOk = await visible(page, '#spk-test-zone');
  await shot(page, label.replace('/', '-'));
  const clean = errs.length === 0;
  record(label, zoneOk && clean, `zone ${zoneOk ? 'visible' : 'absente'}${clean ? '' : ' | JS err: ' + errs[0]}`);
}

async function main() {
  console.log(`${C.d}Harnais reel  BASE=${BASE_URL}  STATE=${STATE}  Chrome=${CHROME}${C.x}\n`);
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--mute-audio', '--no-sandbox'],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    permissions: ['microphone'],
  });
  if (STATE === 'dirty') await context.addInitScript(dirtyState);

  for (const t of TESTS) {
    const p = await newPage(context);
    try { await launchListening(p, t); } catch (e) { record(`listening/${t}`, false, 'exception ' + e.message); }
    await p.close();
  }
  for (const t of TESTS) {
    const p = await newPage(context);
    try { await launchReading(p, t); } catch (e) { record(`reading/${t}`, false, 'exception ' + e.message); }
    await p.close();
  }
  for (const t of TESTS) {
    const p = await newPage(context);
    try { await launchWriting(p, t); } catch (e) { record(`writing/${t}`, false, 'exception ' + e.message); }
    await p.close();
  }
  for (const t of TESTS) {
    const p = await newPage(context);
    try { await launchSpeaking(p, t); } catch (e) { record(`speaking/${t}`, false, 'exception ' + e.message); }
    await p.close();
  }

  await context.close();
  await browser.close();

  console.log(`\n${C.d}Captures: ${SHOT_DIR}${C.x}`);
  console.log(`${passed + failed} lancements  |  ${C.g}${passed} PASS${C.x}  ${C.r}${failed} FAIL${C.x}`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(e => { console.error('Erreur harnais:', e); process.exit(2); });
