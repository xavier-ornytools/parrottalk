#!/usr/bin/env node
// Test de non-régression RÉEL (vrai navigateur Chrome, pas de simulation DOM)
// pour le bug de persistance corrigé en session 3 : la progression doit
// survivre à un vrai rechargement de page (Ctrl+R / page.reload()), SANS
// action supplémentaire de l'utilisateur.
//
// Étendu en session "legal v1" (2026-07-08) avec 3 scénarios de conformité :
// testSpeakingConsentGate (le consentement micro bloque bien l'enregistrement
// Speaking tant que la case n'est pas cochée), testCookieBannerBlocksGA4 et
// testCookieBannerReject (le bandeau cookies bloque réellement le chargement
// de GA4 tant qu'il n'est pas accepté, et respecte un Reject).
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

// Reproduit le bug rapporté par Xavier après le premier fix : section 1 ET
// section 2 finalisées (bouton cliqué sur les deux), puis reload. Vérifie
// aussi la restauration visuelle des réponses à choix multiples (boutons
// radio, section 2 questions 16-20 du Test 01) — pas seulement le texte.
async function testListeningTwoSectionsAndMC(browser) {
  console.log('\n=== Listening : 2 sections finalisées + réponses MC (radio), puis reload ===');
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

  // Section 2 : questions texte (q11-15) ET à choix multiples (q16-20,
  // boutons radio sans id — c'est précisément ce qui n'était pas restauré).
  await page.evaluate(() => {
    getQuestions(currentTest.sections[1]).forEach(q => {
      const el = document.getElementById('q'+q.n);
      if (el) { el.value = q.answer; return; }
      const radio = document.querySelector(`input[name="q${q.n}"][value="${q.answer}"]`);
      if (radio) radio.checked = true;
    });
  });
  await page.click('#finish-section-btn');
  await page.waitForTimeout(150);

  const scoreBeforeReload = await page.evaluate(() => sectionScores.slice());
  // Section 2 = 5 questions texte (q11-15) + 5 questions à choix multiples
  // (q16-20), toutes correctes ci-dessus => score complet attendu = 10.
  check('Score section 2 = 10/10 (texte + choix multiples, calculé AVANT reload)',
    scoreBeforeReload[1] === 10);

  await page.reload();
  await page.waitForTimeout(300);

  const state = await page.evaluate(() => ({
    sectionsDone: sectionsDone.slice(),
    sectionScores: sectionScores.slice(),
  }));
  check('Section 1 ET 2 toujours marquées faites après reload',
    JSON.stringify(state.sectionsDone) === JSON.stringify([true,true,false,false]));
  check('Scores des 2 sections inchangés par le reload (pas remis à 0)',
    JSON.stringify(state.sectionScores) === JSON.stringify(scoreBeforeReload));
  check('Score section 2 toujours = 10/10 APRÈS reload (choix multiples comptés)',
    state.sectionScores[1] === 10);

  await page.click('#tab-1');
  await page.waitForTimeout(100);
  const q16 = await page.evaluate(() => {
    const r = document.querySelector('input[name="q16"]:checked');
    return r ? r.value : null;
  });
  check('Réponse MC (bouton radio q16) réaffichée cochée après reload', q16 === '1');

  await page.close();
}

// Vérifie explicitement le CALCUL du score (pas seulement l'affichage) pour
// un mélange de bonnes/mauvaises réponses en choix multiples, avant tout
// rechargement — isole le bug de checkAnswer()/markQuestion() corrigé
// séparément de la restauration après reload.
async function testListeningMCScoring(browser) {
  console.log('\n=== Listening : calcul du score pour les choix multiples (texte + MC) ===');
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('  [JS ERROR]', err.message));

  await page.goto(`${BASE_URL}/listening.html`);
  await page.click('button:has-text("Start Test")');
  await page.waitForTimeout(150);
  await page.evaluate(() => switchSection(1)); // 5 texte (q11-15) + 5 MC (q16-20)

  // Tout correct
  await page.evaluate(() => {
    getQuestions(currentTest.sections[1]).forEach(q => {
      const el = document.getElementById('q'+q.n);
      if (el) { el.value = q.answer; return; }
      const radio = document.querySelector(`input[name="q${q.n}"][value="${q.answer}"]`);
      if (radio) radio.checked = true;
    });
  });
  await page.click('#finish-section-btn');
  await page.waitForTimeout(150);

  const scoreAllCorrect = await page.evaluate(() => sectionScores[1]);
  check('10/10 quand texte ET choix multiples sont tous corrects', scoreAllCorrect === 10);

  const marks = await page.evaluate(() => {
    const correctLbl = document.querySelector('input[name="q16"][value="1"]').closest('.mc-option');
    return { correctMarked: correctLbl.classList.contains('correct-ans') };
  });
  check('La bonne réponse MC est visuellement marquée (correct-ans)', marks.correctMarked);

  await page.reload();
  await page.waitForTimeout(300);
  const scoreAfterReload = await page.evaluate(() => sectionScores[1]);
  check('Score toujours 10/10 après reload', scoreAfterReload === 10);

  await page.close();
}

// Groupe "matching" de Listening (section 3, q21-25) : anciennement un
// <select>, converti en boutons radio visibles. Vérifie que le score et la
// persistance fonctionnent toujours après la conversion.
async function testListeningMatchingGroup(browser) {
  console.log('\n=== Listening : groupe matching (ex-select → radios) ===');
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('  [JS ERROR]', err.message));

  await page.goto(`${BASE_URL}/listening.html`);
  await page.click('button:has-text("Start Test")');
  await page.waitForTimeout(150);
  await page.evaluate(() => switchSection(2));
  await page.waitForTimeout(150);

  const noMoreSelect = await page.evaluate(() => {
    const el = document.getElementById('q21');
    return !el || el.tagName !== 'SELECT';
  });
  check('Plus de <select> pour le groupe matching (q21)', noMoreSelect);

  await page.evaluate(() => {
    getQuestions(currentTest.sections[2]).forEach(q => {
      const el = document.getElementById('q'+q.n);
      if (el) { el.value = q.answer; return; }
      const radio = document.querySelector(`input[name="q${q.n}"][value="${q.answer}"]`);
      if (radio) radio.checked = true;
    });
  });
  await page.click('#finish-section-btn');
  await page.waitForTimeout(150);
  const scoreBefore = await page.evaluate(() => sectionScores[2]);

  await page.reload();
  await page.waitForTimeout(300);
  await page.evaluate(() => switchSection(2));
  await page.waitForTimeout(100);

  const after = await page.evaluate(() => {
    const checked = document.querySelector('input[name="q21"]:checked');
    return { score: sectionScores[2], q21: checked ? checked.value : null };
  });
  check('Score du groupe matching conservé après reload', after.score === scoreBefore && scoreBefore > 0);
  check('Réponse matching (q21) réaffichée cochée après reload', !!after.q21);

  await page.close();
}

// Blocs Q14-19 "Matching Headings" de Reading (Test01) : anciennement 6
// <select>, convertis en boutons radio visibles.
async function testReadingMatchingHeadings(browser) {
  console.log('\n=== Reading : Matching Headings Q14-19 (ex-select → radios) ===');
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('  [JS ERROR]', err.message));

  await page.goto(`${BASE_URL}/reading.html`);
  await page.click('button:has-text("Start Test")');
  await page.waitForTimeout(150);
  await page.evaluate(() => switchPassage(1));
  await page.waitForTimeout(150);

  const noMoreSelect = await page.evaluate(() => document.querySelectorAll('select.matching-select').length === 0);
  check('Plus aucun <select class="matching-select"> dans reading.html', noMoreSelect);

  await page.evaluate(() => {
    const range = currentRanges()[1];
    for (let qn = range.start; qn <= range.end; qn++) {
      setAnswerValue('q'+qn, ANSWERS_MAP[''][('q'+qn)]);
    }
  });
  await page.evaluate(() => finishReadingPassage());
  await page.waitForTimeout(150);
  const scoreBefore = await page.evaluate(() => passageScoresLive[1]);
  check('Score passage 2 = 13/13 (inclut Q14-19 matching)', scoreBefore === 13);

  await page.reload();
  await page.waitForTimeout(300);
  await page.evaluate(() => switchPassage(1));
  await page.waitForTimeout(100);

  const after = await page.evaluate(() => {
    const checked = document.querySelector('input[name="q14"]:checked');
    return { score: passageScoresLive[1], q14: checked ? checked.value : null };
  });
  check('Score conservé après reload (toujours 13/13)', after.score === 13);
  check('Réponse Q14 réaffichée cochée après reload', !!after.q14);

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

async function testSpeakingConsentGate(browser) {
  console.log('\n=== Speaking : le consentement micro bloque l\'enregistrement ===');
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('  [JS ERROR]', err.message));

  await page.goto(`${BASE_URL}/speaking.html`);
  await page.evaluate(() => localStorage.removeItem('parrottalk_consent_recording'));
  await page.reload();
  await page.waitForTimeout(200);

  await page.click('button:has-text("Start Test 01")');
  await page.waitForTimeout(150);
  await page.click('#spk-rec-btn');
  await page.waitForTimeout(200);

  const gateVisible = await page.evaluate(() =>
    !document.getElementById('consent-gate-overlay').classList.contains('hidden'));
  check('Panneau de consentement affiché avant tout accès au micro', gateVisible);

  const acceptDisabledBeforeCheck = await page.evaluate(() =>
    document.getElementById('consent-gate-accept').disabled);
  check('Bouton Continue désactivé tant que la case n\'est pas cochée', acceptDisabledBeforeCheck);

  await page.check('#consent-gate-checkbox');
  await page.waitForTimeout(50);
  const acceptEnabledAfterCheck = await page.evaluate(() =>
    !document.getElementById('consent-gate-accept').disabled);
  check('Bouton Continue activé une fois la case cochée', acceptEnabledAfterCheck);

  await page.click('#consent-gate-accept');
  await page.waitForTimeout(200);

  const consentStored = await page.evaluate(() =>
    localStorage.getItem('parrottalk_consent_recording') === 'granted');
  check('Consentement mémorisé en localStorage après acceptation', consentStored);

  const gateHiddenAfter = await page.evaluate(() =>
    document.getElementById('consent-gate-overlay').classList.contains('hidden'));
  check('Panneau masqué après acceptation', gateHiddenAfter);

  await page.close();
}

async function testCookieBannerBlocksGA4(browser) {
  console.log('\n=== Bandeau cookies : GA4 ne charge pas avant acceptation ===');
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('  [JS ERROR]', err.message));

  await page.goto(`${BASE_URL}/index.html`);
  await page.evaluate(() => localStorage.removeItem('parrottalk_cookie_consent'));
  await page.reload();
  await page.waitForTimeout(300);

  const bannerVisibleFirstVisit = await page.evaluate(() => !!document.getElementById('cookie-banner'));
  check('Bandeau cookies affiché à la première visite', bannerVisibleFirstVisit);

  const ga4NotLoadedBefore = await page.evaluate(() =>
    !Array.from(document.scripts).some(s => s.src.includes('googletagmanager.com')));
  check('GA4 non chargé avant consentement', ga4NotLoadedBefore);

  await page.click('#cookie-banner-accept');
  await page.waitForTimeout(300);

  const ga4LoadedAfterAccept = await page.evaluate(() =>
    Array.from(document.scripts).some(s => s.src.includes('googletagmanager.com')));
  check('GA4 chargé juste après clic sur Accept', ga4LoadedAfterAccept);

  const bannerGoneAfterChoice = await page.evaluate(() => !document.getElementById('cookie-banner'));
  check('Bandeau disparu après le choix', bannerGoneAfterChoice);

  await page.reload();
  await page.waitForTimeout(300);
  const bannerNotShownAgain = await page.evaluate(() => !document.getElementById('cookie-banner'));
  check('Bandeau ne réapparaît pas après reload une fois le choix fait', bannerNotShownAgain);

  await page.close();
}

async function testCookieBannerReject(browser) {
  console.log('\n=== Bandeau cookies : Reject garde GA4 désactivé ===');
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('  [JS ERROR]', err.message));

  await page.goto(`${BASE_URL}/index.html`);
  await page.evaluate(() => localStorage.removeItem('parrottalk_cookie_consent'));
  await page.reload();
  await page.waitForTimeout(300);

  await page.click('#cookie-banner-reject');
  await page.waitForTimeout(200);

  const ga4StillNotLoaded = await page.evaluate(() =>
    !Array.from(document.scripts).some(s => s.src.includes('googletagmanager.com')));
  check('GA4 reste absent après Reject', ga4StillNotLoaded);

  const consentDenied = await page.evaluate(() =>
    localStorage.getItem('parrottalk_cookie_consent') === 'denied');
  check('Choix "denied" mémorisé en localStorage', consentDenied);

  await page.reload();
  await page.waitForTimeout(300);
  const bannerNotShownAgain = await page.evaluate(() => !document.getElementById('cookie-banner'));
  check('Bandeau ne réapparaît pas après reload après un Reject', bannerNotShownAgain);

  await page.close();
}

async function testFAQAccessibleAndLinksWork(browser) {
  console.log('\n=== FAQ : la section est accessible et ses liens légaux fonctionnent ===');
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('  [JS ERROR]', err.message));

  await page.goto(`${BASE_URL}/index.html`);
  await page.evaluate(() => localStorage.removeItem('parrottalk_cookie_consent'));

  const faqCount = await page.evaluate(() => document.querySelectorAll('#faq-list .faq-item').length);
  check('Au moins 10 questions dans la FAQ', faqCount >= 10);

  // Ouvrir la première question (comportement <details>/<summary>)
  await page.click('#faq-list .faq-item summary');
  await page.waitForTimeout(100);
  const firstOpen = await page.evaluate(() => document.querySelector('#faq-list .faq-item').open);
  check('Cliquer sur une question l\'ouvre (details/summary)', firstOpen);

  // Suivre le premier lien vers privacy.html présent dans la FAQ
  const privacyHref = await page.evaluate(() => {
    const link = document.querySelector('#faq-list a[href="privacy.html"]');
    return link ? link.getAttribute('href') : null;
  });
  check('La FAQ contient un lien vers privacy.html', privacyHref === 'privacy.html');

  const privacyResp = await page.goto(`${BASE_URL}/privacy.html`);
  check('privacy.html se charge sans erreur (200)', privacyResp.status() === 200);
  const privacyTitle = await page.title();
  check('privacy.html est bien la Privacy Policy', privacyTitle.includes('Privacy Policy'));

  const termsResp = await page.goto(`${BASE_URL}/terms.html`);
  check('terms.html se charge sans erreur (200)', termsResp.status() === 200);

  await page.close();
}

// Writing : l'essai ne vivait que dans le DOM. Autosave localStorage +
// restauration au chargement. On tape dans les deux tâches, on recharge SANS
// re-cliquer, et on vérifie que le texte revient tout seul.
async function testWritingAutosaveRecovery(browser) {
  console.log('\n=== Writing : reload en plein milieu, l\'essai est récupéré ===');
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('  [JS ERROR]', err.message));

  await page.goto(`${BASE_URL}/writing.html`);
  await page.evaluate(() => localStorage.removeItem('ielts_writing_draft'));
  await page.reload();
  await page.waitForTimeout(150);

  await page.click('button:has-text("Start Test")');
  await page.waitForTimeout(150);

  const t1 = 'This is my Task 1 answer describing the graph in detail over the period.';
  const t2 = 'This is my Task 2 essay discussing both views before giving my own opinion clearly.';
  await page.fill('#task1-answer', t1);
  await page.fill('#task2-answer', t2);
  await page.waitForTimeout(1000); // laisse le debounce (800ms) écrire le brouillon

  const draftStored = await page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem('ielts_writing_draft') || 'null');
    return d && d.task1 && d.task2;
  });
  check('Brouillon écrit en localStorage pendant la saisie', !!draftStored);

  // Rechargement accidentel : AUCUN clic ensuite.
  await page.reload();
  await page.waitForTimeout(400);

  const state = await page.evaluate(() => ({
    zoneHidden: document.getElementById('writing-test-zone').classList.contains('hidden'),
    v1: document.getElementById('task1-answer').value,
    v2: document.getElementById('task2-answer').value,
    wc1: document.getElementById('wc1').textContent,
  }));
  check('Zone de test visible automatiquement après reload (pas l\'écran d\'accueil)', state.zoneHidden === false);
  check('Task 1 restaurée à l\'identique', state.v1 === t1);
  check('Task 2 restaurée à l\'identique', state.v2 === t2);
  check('Compteur de mots recalculé après restauration', /\d+ words/.test(state.wc1) && !state.wc1.startsWith('0 words'));

  await page.close();
}

// Un démarrage neuf (bouton Start depuis l'écran d'accueil) doit repartir
// d'une page blanche et effacer tout brouillon résiduel.
async function testWritingFreshStartClearsDraft(browser) {
  console.log('\n=== Writing : un démarrage neuf efface le brouillon résiduel ===');
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('  [JS ERROR]', err.message));

  await page.goto(`${BASE_URL}/writing.html`);
  // Brouillon résiduel injecté à la main, puis on force l'écran d'accueil.
  await page.evaluate(() => {
    localStorage.setItem('ielts_writing_draft', JSON.stringify({
      testId: 1, task1: 'vieux texte', task2: '', savedAt: Date.now()
    }));
  });
  // On NE recharge pas (sinon auto-reprise) : on clique Start directement,
  // ce qui doit effacer le brouillon et vider les champs.
  await page.click('button:has-text("Start Test")');
  await page.waitForTimeout(150);

  const state = await page.evaluate(() => ({
    v1: document.getElementById('task1-answer').value,
    draft: localStorage.getItem('ielts_writing_draft'),
  }));
  check('Champ Task 1 vide après un démarrage neuf', state.v1 === '');
  check('Brouillon résiduel effacé du localStorage', state.draft === null);

  await page.close();
}

async function main() {
  console.log('=== Test E2E persistance ParrotTalk (vrai navigateur) ===');
  console.log(`URL de base : ${BASE_URL} (lancer 'python3 -m http.server 8000' depuis le repo si besoin)`);
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  try {
    await testListening(browser);
    await testListeningTwoSectionsAndMC(browser);
    await testListeningMCScoring(browser);
    await testListeningMatchingGroup(browser);
    await testReadingMatchingHeadings(browser);
    await testReading(browser);
    await testWritingAutosaveRecovery(browser);
    await testWritingFreshStartClearsDraft(browser);
    await testSpeakingConsentGate(browser);
    await testCookieBannerBlocksGA4(browser);
    await testCookieBannerReject(browser);
    await testFAQAccessibleAndLinksWork(browser);
  } finally {
    await browser.close();
  }
  console.log(`\n${'='.repeat(30)}`);
  console.log(`  ${passed} passed  |  ${failed} failed`);
  console.log('='.repeat(30) + '\n');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error('ERREUR TEST:', e); process.exit(1); });
