#!/usr/bin/env node
// Test E2E RÉEL (vrai Chrome) du cycle de vie de la page Writing.
// Couvre : écran d'accueil sans test lancé ni chrono, sélection réelle des 3
// tests, COHÉRENCE énoncé affiché == énoncé envoyé à Gemini (interception du
// POST /evaluate/writing), changement de test avant/après démarrage (avec
// confirmation), reprise au rechargement, isolation des brouillons par test.
//
// Prérequis : playwright-core ; Chrome ; serveur statique sur localhost:8000.
// Usage : node tests/e2e-writing-lifecycle.js [chemin_vers_chrome]

const { chromium } = require('playwright-core');

const BASE_URL = process.env.PARROTTALK_TEST_URL || 'http://localhost:8000';
const CHROME_PATH = process.argv[2] || process.env.CHROME_PATH || '/usr/bin/google-chrome';

let passed = 0, failed = 0;
function check(label, ok) {
  if (ok) { console.log(`  ✅ ${label}`); passed++; }
  else    { console.log(`  ❌ ${label}`); failed++; }
}

const EVAL_MOCK = {
  band: 6.5,
  taskAchievement: { band: 6, comment: 'ok' }, taskResponse: { band: 6, comment: 'ok' },
  coherence: { band: 6.5, comment: 'ok' }, lexical: { band: 6, comment: 'ok' }, grammar: { band: 7, comment: 'ok' },
  summary: 'ok', topTip: 'ok', capsApplied: []
};
const ESSAY = ('The chart clearly shows a range of different values across the three groups and over the ' +
  'whole period, with several notable trends and comparisons worth reporting in detail here now today. ').repeat(3);

async function freshLoad(browser) {
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('  [JS ERROR]', err.message));
  await page.goto(`${BASE_URL}/writing.html`);
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await page.waitForTimeout(200);
  return page;
}

async function testFreshArrivalNoAutoStart(browser) {
  console.log('\n=== Accueil : aucun test lancé, aucun chrono ===');
  const page = await freshLoad(browser);
  check('Écran d\'instructions visible', await page.locator('#writing-instructions').isVisible());
  check('Zone de test masquée', (await page.locator('#writing-test-zone').isVisible()) === false);
  check('Aucun chrono en cours (globalInterval null)', (await page.evaluate(() => globalInterval)) === null);
  check('Bouton Start reflète le test sélectionné (Test 01)', (await page.textContent('#start-writing-btn')).includes('Test 01'));
  await page.close();
}

async function testSelectAndStartLoadsRightTest(browser) {
  console.log('\n=== Sélection Test 2 puis Start → contenu du Test 2 chargé ===');
  const page = await freshLoad(browser);
  await page.click('#wbtn-2');
  check('Bouton Start mis à jour (Test 02)', (await page.textContent('#start-writing-btn')).includes('Test 02'));
  check('Toujours aucun chrono avant Start', (await page.evaluate(() => globalInterval)) === null);
  await page.click('#start-writing-btn');
  await page.waitForTimeout(150);
  check('Zone de test affichée après Start', await page.locator('#writing-test-zone').isVisible());
  const instr = await page.textContent('#task1-instruction');
  check('Énoncé Task 1 = celui du Test 2 (leisure)', instr.toLowerCase().includes('leisure'));
  check('Graphique = celui du Test 2', (await page.getAttribute('#task1-graph', 'src')).includes('writing_test02_graph'));
  check('Chrono démarré (globalInterval non null)', (await page.evaluate(() => globalInterval)) !== null);
  await page.close();
}

async function testCoherencePromptSentMatchesDisplayed(browser) {
  console.log('\n=== COHÉRENCE : énoncé envoyé à Gemini == énoncé affiché (Test 2) ===');
  const page = await freshLoad(browser);
  let captured = null;
  await page.route('**/evaluate/writing', async route => {
    try { captured = route.request().postDataJSON(); } catch (e) { captured = null; }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(EVAL_MOCK) });
  });

  await page.click('#wbtn-2');
  await page.click('#start-writing-btn');
  await page.waitForTimeout(150);
  await page.fill('#task1-answer', ESSAY);
  await page.click('#ai-btn-1');
  await page.waitForTimeout(600);

  const shownPrompt = await page.evaluate(() =>
    document.getElementById('task1-instruction').innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
  check('POST /evaluate/writing intercepté', captured !== null);
  check('prompt envoyé == énoncé affiché (au caractère près)', captured && captured.prompt === shownPrompt);
  check('prompt envoyé bien celui du Test 2 (leisure)', captured && captured.prompt.toLowerCase().includes('leisure'));
  check('prompt PAS celui du Test 1 (renewable)', captured && !captured.prompt.toLowerCase().includes('renewable'));
  await page.close();
}

async function testSwitchBeforeStart(browser) {
  console.log('\n=== Changer de test AVANT démarrage : sans confirmation ===');
  const page = await freshLoad(browser);
  await page.click('#wbtn-2');
  await page.click('#wbtn-3');
  check('Start reflète le dernier choix (Test 03)', (await page.textContent('#start-writing-btn')).includes('Test 03'));
  await page.click('#start-writing-btn');
  await page.waitForTimeout(150);
  const instr = await page.textContent('#task1-instruction');
  check('Énoncé = Test 3 (smartphone)', instr.toLowerCase().includes('smartphone'));
  await page.close();
}

async function testSwitchDuringTestCancelThenAccept(browser) {
  console.log('\n=== Changer de test EN COURS : confirmation (annuler puis accepter) ===');
  const page = await freshLoad(browser);
  await page.click('#wbtn-1');
  await page.click('#start-writing-btn');
  await page.waitForTimeout(150);
  await page.fill('#task1-answer', 'My Test 1 answer in progress.');

  // 1) Annuler : on reste sur le Test 1, texte préservé
  page.once('dialog', d => d.dismiss());
  await page.click('#wbtn-2');
  await page.waitForTimeout(150);
  check('Après annulation : zone de test encore visible', await page.locator('#writing-test-zone').isVisible());
  check('Après annulation : énoncé encore Test 1 (renewable)', (await page.textContent('#task1-instruction')).toLowerCase().includes('renewable'));
  check('Après annulation : texte préservé', (await page.inputValue('#task1-answer')) === 'My Test 1 answer in progress.');

  // 2) Accepter : reset propre, retour accueil avec Test 2 sélectionné
  page.once('dialog', d => d.accept());
  await page.click('#wbtn-2');
  await page.waitForTimeout(200);
  check('Après acceptation : retour à l\'écran d\'accueil', await page.locator('#writing-instructions').isVisible());
  check('Après acceptation : zone de test masquée', (await page.locator('#writing-test-zone').isVisible()) === false);
  check('Après acceptation : chrono arrêté', (await page.evaluate(() => globalInterval)) === null);
  check('Après acceptation : Start pointe sur Test 02', (await page.textContent('#start-writing-btn')).includes('Test 02'));
  check('Après acceptation : champ vidé', (await page.inputValue('#task1-answer')) === '');

  // Démarrer le Test 2 : contenu cohérent
  await page.click('#start-writing-btn');
  await page.waitForTimeout(150);
  check('Test 2 démarré avec le bon énoncé (leisure)', (await page.textContent('#task1-instruction')).toLowerCase().includes('leisure'));
  await page.close();
}

async function testReloadDuringTestRestores(browser) {
  console.log('\n=== Rechargement EN COURS de test : restaure le bon test + brouillon ===');
  const page = await freshLoad(browser);
  await page.click('#wbtn-2');
  await page.click('#start-writing-btn');
  await page.waitForTimeout(150);
  await page.fill('#task1-answer', 'Draft text for test two.');
  await page.waitForTimeout(1000); // laisse l'autosave écrire (debounce 800ms)

  await page.reload();
  await page.waitForTimeout(400);
  check('Zone de test rouverte après reload (pas l\'accueil)', await page.locator('#writing-test-zone').isVisible());
  check('Bon test restauré = Test 2 (leisure)', (await page.textContent('#task1-instruction')).toLowerCase().includes('leisure'));
  check('Brouillon Task 1 restauré', (await page.inputValue('#task1-answer')) === 'Draft text for test two.');
  await page.close();
}

async function testDraftIsolationPerTest(browser) {
  console.log('\n=== Isolation : un brouillon du Test 1 ne se restaure jamais dans le Test 2 ===');
  const page = await freshLoad(browser);
  // Brouillon résiduel du Test 1 injecté à la main
  await page.evaluate(() => localStorage.setItem('ielts_writing_draft_test1',
    JSON.stringify({ testId: 1, task1: 'LEAKED TEST 1 TEXT', task2: '', savedAt: Date.now() })));
  // On démarre et travaille le Test 2
  await page.click('#wbtn-2');
  await page.click('#start-writing-btn');
  await page.waitForTimeout(150);
  await page.fill('#task1-answer', 'Genuine test two text.');
  await page.waitForTimeout(1000);
  await page.reload();
  await page.waitForTimeout(400);
  check('Test 2 restauré (leisure), pas le Test 1', (await page.textContent('#task1-instruction')).toLowerCase().includes('leisure'));
  const val = await page.inputValue('#task1-answer');
  check('Champ = texte du Test 2, jamais le brouillon du Test 1', val === 'Genuine test two text.' && !val.includes('LEAKED'));
  await page.close();
}

async function main() {
  console.log('=== Test E2E cycle de vie Writing (vrai navigateur) ===');
  console.log(`URL de base : ${BASE_URL}`);
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  try {
    await testFreshArrivalNoAutoStart(browser);
    await testSelectAndStartLoadsRightTest(browser);
    await testCoherencePromptSentMatchesDisplayed(browser);
    await testSwitchBeforeStart(browser);
    await testSwitchDuringTestCancelThenAccept(browser);
    await testReloadDuringTestRestores(browser);
    await testDraftIsolationPerTest(browser);
  } finally {
    await browser.close();
  }
  console.log(`\n${'='.repeat(30)}`);
  console.log(`  ${passed} passed  |  ${failed} failed`);
  console.log('='.repeat(30) + '\n');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error('ERREUR TEST:', e); process.exit(1); });
