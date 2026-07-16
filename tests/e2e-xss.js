#!/usr/bin/env node
// Test E2E securite (vrai Chrome) : verifie que les champs renvoyes par le
// modele sont echappes avant insertion via innerHTML (PT-01, defense XSS).
// On injecte une charge malveillante dans TOUS les champs IA de
// renderSpeakingFeedback et renderAIFeedback, on debloque le detail, puis on
// verifie qu'aucun noeud injecte n'est cree et qu'aucun handler ne s'execute.
//
// Prerequis : playwright-core ; Chrome ; serveur statique sur localhost:8000.
// Usage : node tests/e2e-xss.js [chemin_vers_chrome]

const { chromium } = require('playwright-core');

const BASE_URL = process.env.PARROTTALK_TEST_URL || 'http://localhost:8000';
const CHROME_PATH = process.argv[2] || process.env.CHROME_PATH || '/usr/bin/google-chrome';

let passed = 0, failed = 0;
function check(label, ok) {
  if (ok) { console.log(`  ✅ ${label}`); passed++; }
  else    { console.log(`  ❌ ${label}`); failed++; }
}

// Charge d'attaque : un onerror qui leverait un drapeau global s'il s'executait,
// et une balise script. Marqueur unique pour retrouver la trace dans le DOM.
const XSS = '<img src=pt-xss-probe onerror="window.__xssFired=1"><script>window.__xssScript=1<\/script>';

const SPK_MOCK = {
  overall: 6.5, fc: 6, lr: 6.5, gra: 6, pron: 7,
  summary: 'Summary ' + XSS,
  strengths: ['Strength ' + XSS],
  toFix: ['Fix ' + XSS],
  topTip: 'Tip ' + XSS,
  transcript: 'Transcript ' + XSS,
  transcripts: [{ q: 1, text: 'Answer ' + XSS }],
  skippedQuestions: []
};
const WR_MOCK = {
  band: 6.5,
  taskAchievement: { band: 6, comment: 'Comment ' + XSS },
  coherence: { band: 6.5, comment: 'Coh ' + XSS },
  lexical: { band: 6, comment: 'Lex ' + XSS },
  grammar: { band: 7, comment: 'Gram ' + XSS },
  summary: 'Summary ' + XSS,
  topTip: 'Tip ' + XSS,
  capsApplied: []
};

async function unlockAll(page) {
  await page.evaluate(() => {
    ['ielts_feedback_unlocked', 'ielts_feedback_unlocked_speaking', 'ielts_feedback_unlocked_writing']
      .forEach(k => localStorage.setItem(k, '1'));
  });
}

async function probe(page) {
  // Etat des drapeaux d'execution + presence d'un noeud injecte reel.
  return page.evaluate(() => ({
    fired: window.__xssFired === 1,
    script: window.__xssScript === 1,
    injectedNode: !!document.querySelector('img[src="pt-xss-probe"]'),
    escapedPresent: document.body.innerHTML.includes('&lt;img src=pt-xss-probe'),
    // textContent (et non innerText) inclut le texte des noeuds masques par le
    // gate : on verifie que la charge existe bien en tant que texte inerte.
    visibleText: document.body.textContent.includes('pt-xss-probe')
  }));
}

async function run() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage();
  page.on('dialog', d => d.dismiss()); // au cas ou un alert() passerait

  // ---- Speaking ----
  console.log('\n=== Speaking : renderSpeakingFeedback avec charge XSS ===');
  await page.goto(`${BASE_URL}/speaking.html`);
  await unlockAll(page);
  const spkErr = await page.evaluate(m => {
    try {
      document.getElementById('spk-results').classList.remove('hidden');
      renderSpeakingFeedback(m, 1);
      return null;
    } catch (e) { return String(e); }
  }, SPK_MOCK);
  check('renderSpeakingFeedback ne leve pas d erreur', spkErr === null);
  const s = await probe(page);
  check('Speaking : handler onerror NON execute', !s.fired);
  check('Speaking : balise script NON executee', !s.script);
  check('Speaking : aucun noeud img injecte', !s.injectedNode);
  check('Speaking : charge presente sous forme echappee', s.escapedPresent);
  check('Speaking : charge visible comme texte inoffensif', s.visibleText);

  // ---- Writing ----
  console.log('\n=== Writing : renderAIFeedback avec charge XSS ===');
  await page.goto(`${BASE_URL}/writing.html`);
  await unlockAll(page);
  const wrErr = await page.evaluate(m => {
    try {
      const box = document.getElementById('ai-feedback-1');
      box.classList.remove('hidden');
      renderAIFeedback(box, m, 1, 'The graph below shows...');
      return null;
    } catch (e) { return String(e); }
  }, WR_MOCK);
  check('renderAIFeedback ne leve pas d erreur', wrErr === null);
  const w = await probe(page);
  check('Writing : handler onerror NON execute', !w.fired);
  check('Writing : balise script NON executee', !w.script);
  check('Writing : aucun noeud img injecte', !w.injectedNode);
  check('Writing : charge presente sous forme echappee', w.escapedPresent);
  check('Writing : charge visible comme texte inoffensif', w.visibleText);

  await browser.close();
  console.log('\n==============================');
  console.log(`  ${passed} passed  |  ${failed} failed`);
  console.log('==============================');
  process.exit(failed === 0 ? 0 : 1);
}

run().catch(e => { console.error(e); process.exit(1); });
