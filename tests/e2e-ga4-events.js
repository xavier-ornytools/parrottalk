#!/usr/bin/env node
// Test E2E des key events GA4 (vrai Chrome). On bloque le vrai googletagmanager,
// on accorde le consentement, on remplace window.gtag par un enregistreur, puis
// on pilote les flux et on vérifie que les events partent avec leurs params —
// et que le mode interne (pt_internal=1) les supprime tous.
//
// Prérequis : playwright-core ; Chrome ; serveur statique sur localhost:8000.
// Usage : node tests/e2e-ga4-events.js [chemin_vers_chrome]

const { chromium } = require('playwright-core');
const BASE_URL = process.env.PARROTTALK_TEST_URL || 'http://localhost:8000';
const CHROME_PATH = process.argv[2] || process.env.CHROME_PATH || '/usr/bin/google-chrome';

let passed = 0, failed = 0;
function check(label, ok) {
  if (ok) { console.log(`  ✅ ${label}`); passed++; }
  else    { console.log(`  ❌ ${label}`); failed++; }
}

const EVAL_MOCK = {
  band: 6.5, taskAchievement: { band: 6, comment: 'ok' }, taskResponse: { band: 6, comment: 'ok' },
  coherence: { band: 6.5, comment: 'ok' }, lexical: { band: 6, comment: 'ok' }, grammar: { band: 7, comment: 'ok' },
  summary: 'ok', topTip: 'ok', capsApplied: []
};
const ESSAY = ('The chart clearly shows a range of different values across the three groups and over the ' +
  'whole period, with several notable trends and comparisons worth reporting in detail here now today. ').repeat(3);

async function newPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  page.on('pageerror', err => console.log('  [JS ERROR]', err.message));
  await page.route('**/googletagmanager.com/**', r => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  return page;
}

// Consentement accordé (+ éventuel mode interne), reload, puis on installe
// l'enregistreur sur window.gtag (analytics.js l'a déjà défini au chargement).
async function prep(page, opts) {
  opts = opts || {};
  await page.evaluate((internal) => {
    localStorage.clear(); sessionStorage.clear();
    localStorage.setItem('parrottalk_cookie_consent', 'granted');
    if (internal) localStorage.setItem('pt_internal', '1');
  }, !!opts.internal);
  await page.reload();
  await page.waitForTimeout(300);
  await page.evaluate(() => { window.__ev = []; window.gtag = function () { window.__ev.push(Array.prototype.slice.call(arguments)); }; });
}
async function events(page) {
  return page.evaluate(() => (window.__ev || []).filter(a => a[0] === 'event').map(a => ({ name: a[1], params: a[2] })));
}

async function testWritingEvents(browser) {
  console.log('\n=== Writing : test_started, section_completed, evaluation_received ===');
  const page = await newPage(browser);
  let evalBody = null;
  await page.route('**/evaluate/writing', async route => {
    try { evalBody = route.request().postDataJSON(); } catch (e) {}
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(EVAL_MOCK) });
  });
  await page.goto(`${BASE_URL}/writing.html`);
  await prep(page);

  await page.click('#wbtn-2');
  await page.click('#start-writing-btn');
  await page.waitForTimeout(150);
  let ev = await events(page);
  const started = ev.find(e => e.name === 'test_started');
  check('test_started émis', !!started);
  check('test_started params section=writing, test_number=2', started && started.params.section === 'writing' && started.params.test_number === 2);

  await page.fill('#task1-answer', ESSAY);
  await page.click('#ai-btn-1');
  await page.waitForTimeout(700);
  ev = await events(page);
  const completed = ev.find(e => e.name === 'section_completed');
  const received = ev.find(e => e.name === 'evaluation_received');
  check('section_completed émis (section=writing)', !!completed && completed.params.section === 'writing');
  check('evaluation_received émis avec band_score', !!received && received.params.section === 'writing' && received.params.band_score === 6.5);

  await page.close();
}

async function testFeedbackEvents(browser) {
  console.log('\n=== feedback_completed + beta_rating_given (via le micro-feedback) ===');
  const page = await newPage(browser);
  await page.goto(`${BASE_URL}/speaking.html`);
  await prep(page);
  await page.evaluate(() => {
    document.getElementById('spk-results').classList.remove('hidden');
    renderSpeakingFeedback({ overall: 6.5, fc: 6, lr: 6.5, gra: 6, pron: 7, summary: 'ok', strengths: ['a'], toFix: ['b'], topTip: 'c', transcripts: [], skippedQuestions: [] }, 1);
  });
  await page.waitForTimeout(150);
  // Réinstalle l'enregistreur (renderSpeakingFeedback a émis evaluation_received avant)
  await page.evaluate(() => { window.__ev = []; });
  // Les 3 questions du gate (une par etape, re-rendu a chaque reponse).
  await page.click('.fb-opt[data-val="about_right"]'); await page.waitForTimeout(600);
  await page.click('.fb-opt[data-val="3_6m"]'); await page.waitForTimeout(600);
  await page.click('.fb-opt[data-val="detailed_corrections"]'); await page.waitForTimeout(700);
  // Etape commentaire libre (optionnelle). Skip declenche submitFeedback donc
  // feedback_completed. C'est l'etape que l'ancienne version du test oubliait, d'ou
  // les 2 faux echecs : le code emettait bien l'event, le test ne l'atteignait pas.
  await page.click('.fb-comment__skip'); await page.waitForTimeout(500);
  let ev = await events(page);
  const fc = ev.find(e => e.name === 'feedback_completed');
  check('feedback_completed émis (section=speaking)', !!fc && fc.params.section === 'speaking');

  // "See my detailed feedback" revele le rapport et fait apparaitre la note de beta.
  await page.click('.fb-thanks__cta'); await page.waitForTimeout(500);
  await page.click('.fb-rating__scale .fb-opt[data-n="4"]');
  await page.waitForTimeout(200);
  ev = await events(page);
  const br = ev.find(e => e.name === 'beta_rating_given');
  check('beta_rating_given émis avec rating=4', !!br && br.params.rating === 4);

  await page.close();
}

async function testReadingListening(browser) {
  console.log('\n=== Reading & Listening : test_started + section_completed ===');
  const page = await newPage(browser);
  // Reading
  await page.goto(`${BASE_URL}/reading.html`);
  await prep(page);
  await page.click(`button[onclick="selectTest('test01')"]`);
  await page.waitForTimeout(150);
  await page.click(`button[onclick="startTest()"]`);
  await page.waitForTimeout(200);
  await page.evaluate(() => finishReadingPassage());
  let ev = await events(page);
  check('Reading test_started émis (section=reading)', ev.some(e => e.name === 'test_started' && e.params.section === 'reading'));
  check('Reading section_completed émis', ev.some(e => e.name === 'section_completed' && e.params.section === 'reading'));

  // Listening
  await page.goto(`${BASE_URL}/listening.html`);
  await prep(page);
  await page.click(`button[onclick="selectTest('test01')"]`);
  await page.waitForTimeout(150);
  await page.click(`button[onclick="startTest()"]`);
  await page.waitForTimeout(200);
  await page.evaluate(() => finishSection());
  ev = await events(page);
  check('Listening test_started émis (section=listening)', ev.some(e => e.name === 'test_started' && e.params.section === 'listening'));
  check('Listening section_completed émis', ev.some(e => e.name === 'section_completed' && e.params.section === 'listening'));

  await page.close();
}

async function testInternalExclusion(browser) {
  console.log('\n=== Exclusion trafic interne (pt_internal=1) : aucun event ===');
  const page = await newPage(browser);
  await page.goto(`${BASE_URL}/writing.html`);
  await prep(page, { internal: true });
  await page.click('#start-writing-btn');
  await page.waitForTimeout(150);
  const ev = await events(page);
  check('Aucun key event émis en mode interne', ev.length === 0);
  const internalFlag = await page.evaluate(() => localStorage.getItem('pt_internal'));
  check('Marqueur pt_internal présent', internalFlag === '1');

  await page.close();
}

async function testInternalPage(browser) {
  console.log('\n=== /internal.html pose le marqueur ===');
  const page = await newPage(browser);
  await page.goto(`${BASE_URL}/internal.html`);
  await page.waitForTimeout(150);
  const flag = await page.evaluate(() => localStorage.getItem('pt_internal'));
  check('/internal.html pose pt_internal=1', flag === '1');
  check('Affiche "Internal mode ON"', (await page.textContent('#status')).includes('ON'));
  await page.close();
}

async function main() {
  console.log('=== Test E2E key events GA4 (vrai navigateur) ===');
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  try {
    await testWritingEvents(browser);
    await testFeedbackEvents(browser);
    await testReadingListening(browser);
    await testInternalExclusion(browser);
    await testInternalPage(browser);
  } finally { await browser.close(); }
  console.log(`\n${'='.repeat(30)}\n  ${passed} passed  |  ${failed} failed\n${'='.repeat(30)}\n`);
  process.exit(failed > 0 ? 1 : 0);
}
main().catch(e => { console.error('ERREUR TEST:', e); process.exit(1); });
