#!/usr/bin/env node
// Test de non-régression RÉEL (vrai navigateur Chrome, pas de simulation DOM)
// pour le bug de persistance corrigé en session 3 : la progression doit
// survivre à un vrai rechargement de page (Ctrl+R / page.reload()), SANS
// action supplémentaire de l'utilisateur.
//
// Pourquoi un vrai navigateur et pas jsdom : un premier test jsdom donnait un
// faux positif — il rappelait startTest() par programme après le "rechargement"
// simulé, ce qu'un vrai utilisateur ne fait pas forcément. Ce test-ci pilote un
// vrai Chrome et vérifie l'état de la page juste après reload, avant tout clic.
//
// Prérequis :
//   npm install --no-save playwright-core
//   Chrome (ou Chromium) installé sur la machine
//   Un serveur statique tournant sur http://localhost:8000 :
//     cd <repo> && python3 -m http.server 8000
//
// Usage : node tests/e2e-persistence.js [chemin_vers_chrome]

const { chromium } = require('playwright-core');

const BASE_URL = process.env.PARROTTALK_TEST_URL || 'http://localhost:8000';
const CHROME_PATH = process.argv[2] || process.env.CHROME_PATH || '/usr/bin/google-chrome';

let passed = 0, failed = 0;
function check(label, ok) {
  if (ok) { console.log(`  ✅ ${label}`); passed++; }
  else    { console.log(`  ❌ ${label}`); failed++; }
}

async function testListening(browser) {
  console.log('\n=== Listening : reload en plein milieu, sans re-cliquer ===');
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('  [JS ERROR]', err.message));

  await page.goto(`${BASE_URL}/listening.html`);
  await page.click('button:has-text("Start Test")');
  await page.waitForTimeout(150);

  await page.evaluate(() => {
    getQuestions(currentTest.sections[0]).forEach(q => {
      const el = document.getElementById('q'+q.n); if (el) el.value = q.answer;
    });
  });
  await page.click('#finish-section-btn');
  await page.waitForTimeout(150);

  // Section 2 : réponses saisies mais PAS finalisées (comme un vrai
  // rechargement accidentel en cours de section).
  await page.evaluate(() => {
    getQuestions(currentTest.sections[1]).forEach(q => {
      const el = document.getElementById('q'+q.n); if (el) el.value = q.answer;
    });
  });

  await page.reload();
  await page.waitForTimeout(300);

  const state = await page.evaluate(() => ({
    testZoneHidden: document.getElementById('test-zone').classList.contains('hidden'),
    currentSection: typeof currentSection !== 'undefined' ? currentSection : null,
    sectionsDone: typeof sectionsDone !== 'undefined' ? sectionsDone.slice() : null,
    sectionScores: typeof sectionScores !== 'undefined' ? sectionScores.slice() : null,
  }));

  check('Test-zone visible automatiquement après reload (pas l\'écran de sélection)', state.testZoneHidden === false);
  check('Section reprise = 2 (index 1)', state.currentSection === 1);
  check('Section 1 marquée faite', JSON.stringify(state.sectionsDone) === JSON.stringify([true,false,false,false]));
  check('Score section 1 préservé (10/10)', state.sectionScores && state.sectionScores[0] === 10);

  await page.click('#tab-0');
  const q1 = await page.$eval('#q1', el => el.value).catch(() => null);
  check('Réponse Q1 réellement visible dans le champ après retour', !!q1 && q1.length > 0);

  await page.close();
}

async function testReading(browser) {
  console.log('\n=== Reading : reload en plein milieu, sans re-cliquer ===');
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('  [JS ERROR]', err.message));

  await page.goto(`${BASE_URL}/reading.html`);
  await page.click('button:has-text("Start Test")');
  await page.waitForTimeout(150);

  await page.evaluate(() => {
    const range = currentRanges()[0];
    for (let qn = range.start; qn <= range.end; qn++) setAnswerValue('q'+qn, ANSWERS_MAP[''][('q'+qn)]);
  });
  await page.evaluate(() => finishReadingPassage());
  await page.waitForTimeout(150);

  await page.evaluate(() => {
    const range = currentRanges()[1];
    for (let qn = range.start; qn <= range.end; qn++) setAnswerValue('q'+qn, ANSWERS_MAP[''][('q'+qn)]);
  });

  await page.reload();
  await page.waitForTimeout(300);

  const state = await page.evaluate(() => ({
    testZoneHidden: document.getElementById('test-zone').classList.contains('hidden'),
    currentPassage: typeof currentPassage !== 'undefined' ? currentPassage : null,
    passagesDone: typeof passagesDone !== 'undefined' ? passagesDone.slice() : null,
    passageScores: typeof passageScoresLive !== 'undefined' ? passageScoresLive.slice() : null,
  }));

  check('Test-zone visible automatiquement après reload', state.testZoneHidden === false);
  check('Passage repris = 2 (index 1)', state.currentPassage === 1);
  check('Passage 1 marqué fait', JSON.stringify(state.passagesDone) === JSON.stringify([true,false,false]));
  check('Score passage 1 préservé (13/13)', state.passageScores && state.passageScores[0] === 13);

  await page.close();
}

async function main() {
  console.log('=== Test E2E persistance ParrotTalk (vrai navigateur) ===');
  console.log(`URL de base : ${BASE_URL} (lancer 'python3 -m http.server 8000' depuis le repo si besoin)`);
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  try {
    await testListening(browser);
    await testReading(browser);
  } finally {
    await browser.close();
  }
  console.log(`\n${'='.repeat(30)}`);
  console.log(`  ${passed} passed  |  ${failed} failed`);
  console.log('='.repeat(30) + '\n');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error('ERREUR TEST:', e); process.exit(1); });
