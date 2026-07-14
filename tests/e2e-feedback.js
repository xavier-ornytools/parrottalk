#!/usr/bin/env node
// Test E2E RÉEL (vrai Chrome) du micro-feedback post-score.
// On injecte un résultat IA fictif via renderSpeakingFeedback / renderAIFeedback
// (pas d'appel Gemini réel) puis on pilote la carte de déblocage : band visible,
// détail masqué, 3 questions à un clic, révélation, note 1-10, persistance au
// reload. Le POST /feedback est intercepté pour vérifier la charge utile.
//
// Prérequis : npm install --no-save playwright-core ; Chrome installé ;
//   serveur statique sur http://localhost:8000 (python3 -m http.server 8000).
// Usage : node tests/e2e-feedback.js [chemin_vers_chrome]

const { chromium } = require('playwright-core');

const BASE_URL = process.env.PARROTTALK_TEST_URL || 'http://localhost:8000';
const CHROME_PATH = process.argv[2] || process.env.CHROME_PATH || '/usr/bin/google-chrome';

let passed = 0, failed = 0;
function check(label, ok) {
  if (ok) { console.log(`  ✅ ${label}`); passed++; }
  else    { console.log(`  ❌ ${label}`); failed++; }
}

const SPK_MOCK = {
  overall: 6.5, fc: 6, lr: 6.5, gra: 6, pron: 7,
  summary: 'Good fluency with some grammar slips.',
  strengths: ['Clear ideas', 'Natural pace'],
  toFix: ['Article use', 'Verb tenses'],
  topTip: 'Practice linking words.',
  transcripts: [{ q: 1, text: 'I think that...' }],
  skippedQuestions: []
};
const WR_MOCK = {
  band: 6.5,
  taskAchievement: { band: 6, comment: 'Covers the task.' },
  taskResponse: { band: 6, comment: 'Addresses both views.' },
  coherence: { band: 6.5, comment: 'Well organised.' },
  lexical: { band: 6, comment: 'Adequate range.' },
  grammar: { band: 7, comment: 'Good control.' },
  summary: 'A solid response.',
  topTip: 'Vary sentence structures.',
  capsApplied: []
};

// Capture les POST /feedback pour vérifier ce qui est envoyé, sans réseau réel.
async function withFeedbackCapture(page) {
  const captured = [];
  await page.route('**/feedback', async route => {
    try { captured.push(route.request().postDataJSON()); } catch (e) { captured.push(null); }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  return captured;
}

async function clearFeedbackLS(page) {
  await page.evaluate(() => {
    ['ielts_feedback_unlocked', 'ielts_feedback_answers', 'ielts_feedback_rated',
     'ielts_speaking_feedback', 'ielts_writing_feedback'].forEach(k => localStorage.removeItem(k));
  });
}

async function testSpeakingGateFlow(browser) {
  console.log('\n=== Speaking : band visible, détail verrouillé, 3 questions, révélation ===');
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('  [JS ERROR]', err.message));
  const captured = await withFeedbackCapture(page);

  await page.goto(`${BASE_URL}/speaking.html`);
  await clearFeedbackLS(page);
  await page.evaluate(m => { document.getElementById('spk-results').classList.remove('hidden'); renderSpeakingFeedback(m, 1); }, SPK_MOCK);
  await page.waitForTimeout(150);

  check('Band global affiché (hero = 6.5)', (await page.textContent('.fb-hero__band')).trim() === '6.5');
  check('Détail verrouillé au départ (aucun .is-open)', (await page.locator('.feedback-detail.is-open').count()) === 0);
  check('Carte de déblocage présente', (await page.locator('.fb-gate').count()) === 1);
  check('Progression 1 / 3', (await page.textContent('.fb-progress__label')).trim() === '1 / 3');
  check('Q1 = comparaison au score attendu', (await page.textContent('.fb-q__text')).includes('Compared to what you expected'));
  check('Q1 = échelle 5 niveaux', (await page.locator('.fb-q__opts .fb-opt').count()) === 5);

  await page.click('.fb-opt[data-val="about_right"]');
  await page.waitForTimeout(600);
  check('Progression passe à 2 / 3', (await page.textContent('.fb-progress__label')).trim() === '2 / 3');
  check('Q2 = date de l\'examen', (await page.textContent('.fb-q__text')).includes('When is your IELTS exam'));
  check('Q2 = échelle 5 niveaux', (await page.locator('.fb-q__opts .fb-opt').count()) === 5);

  await page.click('.fb-opt[data-val="3_6m"]');
  await page.waitForTimeout(600);
  check('Progression passe à 3 / 3', (await page.textContent('.fb-progress__label')).trim() === '3 / 3');

  await page.click('.fb-opt[data-val="detailed_corrections"]');
  await page.waitForTimeout(900); // laisse apparaître l'écran commentaire

  // Nouveau flux : commentaire libre optionnel après la 3e question
  check('Écran commentaire affiché après la 3e question', await page.locator('.fb-comment__box').isVisible());
  await page.fill('.fb-comment__box', 'The Speaking test felt very realistic, thanks!');
  await page.click('.fb-comment__send');
  await page.waitForTimeout(250);

  // Écran de remerciement (image multilingue + texte exact)
  check('Écran merci avec image multilingue', await page.locator('.fb-thanks__img').isVisible());
  check('Texte de remerciement exact', (await page.textContent('.fb-thanks__text')).includes('Your feedback means a lot to us'));
  check('POST /feedback contient le commentaire libre (freeComment)', captured.some(p => p && typeof p.freeComment === 'string' && p.freeComment.includes('realistic')));

  await page.click('.fb-thanks__cta');
  await page.waitForTimeout(900);

  check('Après le merci : détail révélé (.is-open)', (await page.locator('.feedback-detail.is-open').count()) >= 1);
  check('Carte de déblocage retirée', (await page.locator('.fb-gate').count()) === 0);
  check('Grille des critères visible dans le détail', await page.locator('.feedback-detail .score-mini-grid').isVisible());
  check('unlock mémorisé en localStorage', (await page.evaluate(() => localStorage.getItem('ielts_feedback_unlocked'))) === '1');

  const answers = await page.evaluate(() => JSON.parse(localStorage.getItem('ielts_feedback_answers') || '{}'));
  check('Les 3 réponses mémorisées (nouvelles échelles)', answers.scoreVsExpected === 'about_right' && answers.examTiming === '3_6m' && answers.mostHelpful === 'detailed_corrections');

  check('POST /feedback envoyé avec type+band+réponses', captured.some(p => p && p.type === 'speaking' && p.band === 6.5 && p.scoreVsExpected === 'about_right' && p.mostHelpful === 'detailed_corrections'));

  // Note de beta : échelle 5 niveaux
  check('Note de beta = échelle 5 niveaux', (await page.locator('.fb-rating__scale .fb-opt').count()) === 5);
  await page.click('.fb-rating__scale .fb-opt[data-n="4"]');
  await page.waitForTimeout(650);
  check('Remerciement après la note', await page.locator('.fb-rating__thanks').isVisible());
  check('rated mémorisé en localStorage', (await page.evaluate(() => localStorage.getItem('ielts_feedback_rated'))) === '1');
  check('POST /feedback envoyé avec betaRating 1-5', captured.some(p => p && p.betaRating === 4));

  await page.close();
}

async function testSpeakingReloadRestore(browser) {
  console.log('\n=== Speaking : reload après réponses → détail débloqué, pas les questions ===');
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('  [JS ERROR]', err.message));
  await withFeedbackCapture(page);

  await page.goto(`${BASE_URL}/speaking.html`);
  await clearFeedbackLS(page);
  await page.evaluate(m => { document.getElementById('spk-results').classList.remove('hidden'); renderSpeakingFeedback(m, 1); }, SPK_MOCK);
  await page.waitForTimeout(100);
  // Répondre aux 3 questions
  await page.click('.fb-opt[data-val="much_higher"]'); await page.waitForTimeout(600);
  await page.click('.fb-opt[data-val="within_1m"]'); await page.waitForTimeout(600);
  await page.click('.fb-opt[data-val="speaking_practice"]'); await page.waitForTimeout(900);
  // Nouveau flux : Skip du commentaire déclenche l'unlock, puis on passe le merci
  await page.click('.fb-comment__skip'); await page.waitForTimeout(250);
  await page.click('.fb-thanks__cta'); await page.waitForTimeout(400);

  await page.reload();
  await page.waitForTimeout(400);

  check('Résultats réaffichés après reload', await page.locator('#spk-results').isVisible());
  check('Détail débloqué directement (.is-open)', (await page.locator('.feedback-detail.is-open').count()) >= 1);
  check('Aucune carte de questions après reload', (await page.locator('.fb-gate').count()) === 0);
  check('Band toujours affiché', (await page.textContent('.fb-hero__band')).trim() === '6.5');

  await page.close();
}

async function testWritingUnlockAppliesToBothTasks(browser) {
  console.log('\n=== Writing : déblocage via une tâche, l\'autre est débloquée sans re-questionner ===');
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('  [JS ERROR]', err.message));
  await withFeedbackCapture(page);

  await page.goto(`${BASE_URL}/writing.html`);
  await clearFeedbackLS(page);
  await page.evaluate(() => localStorage.removeItem('ielts_writing_draft'));
  await page.click('button:has-text("Start Test")');
  await page.waitForTimeout(150);

  // Rendu du feedback de la Task 1 → carte de déblocage
  await page.evaluate(m => {
    const box = document.getElementById('ai-feedback-1');
    box.classList.remove('hidden');
    renderAIFeedback(box, m, 1, 'The graph below shows...');
  }, WR_MOCK);
  await page.waitForTimeout(150);
  check('Task 1 : band hero visible', (await page.textContent('#ai-feedback-1 .fb-hero__band')).trim() === '6.5');
  check('Task 1 : détail verrouillé + carte présente', (await page.locator('#ai-feedback-1 .fb-gate').count()) === 1 && (await page.locator('#ai-feedback-1 .feedback-detail.is-open').count()) === 0);

  // Répondre aux 3 questions
  await page.click('#ai-feedback-1 .fb-opt[data-val="much_lower"]'); await page.waitForTimeout(600);
  await page.click('#ai-feedback-1 .fb-opt[data-val="not_booked"]'); await page.waitForTimeout(600);
  await page.click('#ai-feedback-1 .fb-opt[data-val="practice_tests"]'); await page.waitForTimeout(900);
  // Nouveau flux : commentaire (Skip) puis merci
  check('Task 1 : écran commentaire après la 3e question', await page.locator('#ai-feedback-1 .fb-comment__box').isVisible());
  await page.click('#ai-feedback-1 .fb-comment__skip'); await page.waitForTimeout(250);
  await page.click('#ai-feedback-1 .fb-thanks__cta'); await page.waitForTimeout(800);
  check('Task 1 : détail révélé après le merci', (await page.locator('#ai-feedback-1 .feedback-detail.is-open').count()) === 1);

  // Rendu du feedback de la Task 2 APRÈS déblocage → détail direct, pas de carte
  await page.evaluate(m => {
    const box = document.getElementById('ai-feedback-2');
    box.classList.remove('hidden');
    renderAIFeedback(box, m, 2, 'Some people believe universities...');
  }, WR_MOCK);
  await page.waitForTimeout(150);
  check('Task 2 : aucune carte de questions (déjà répondu)', (await page.locator('#ai-feedback-2 .fb-gate').count()) === 0);
  check('Task 2 : détail débloqué directement', (await page.locator('#ai-feedback-2 .feedback-detail.is-open').count()) === 1);
  check('Task 2 : band hero visible aussi', (await page.textContent('#ai-feedback-2 .fb-hero__band')).trim() === '6.5');

  // La note de beta n'apparaît qu'une fois sur la page
  check('Note de beta présente une seule fois', (await page.locator('.fb-rating').count()) === 1);

  await page.close();
}

async function main() {
  console.log('=== Test E2E micro-feedback post-score (vrai navigateur) ===');
  console.log(`URL de base : ${BASE_URL}`);
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  try {
    await testSpeakingGateFlow(browser);
    await testSpeakingReloadRestore(browser);
    await testWritingUnlockAppliesToBothTasks(browser);
  } finally {
    await browser.close();
  }
  console.log(`\n${'='.repeat(30)}`);
  console.log(`  ${passed} passed  |  ${failed} failed`);
  console.log('='.repeat(30) + '\n');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error('ERREUR TEST:', e); process.exit(1); });
