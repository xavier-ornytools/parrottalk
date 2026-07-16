#!/usr/bin/env node
// Extraction deterministe de l'etat Reading, pour comparaison avant/apres refonte
// (LOT 2 data-driven). Capture, par test : texte visible normalise (timer exclu),
// cle des 40 reponses, et scoring pour 3 vecteurs (correct / wrong / partial).
//
// Usage : node tests/reading-extract.js <fichier_sortie.json> [chemin_chrome]
// Prerequis : serveur statique sur PARROTTALK_TEST_URL (defaut http://127.0.0.1:8000).

const fs = require('fs');
const { chromium } = require('playwright-core');
const BASE_URL = process.env.PARROTTALK_TEST_URL || 'http://127.0.0.1:8000';
const CHROME_PATH = process.argv[3] || process.env.CHROME_PATH || '/usr/bin/google-chrome';
const OUT = process.argv[2];
if (!OUT) { console.error('Fournir le fichier de sortie JSON.'); process.exit(2); }

const TESTS = ['test01', 'test02', 'test03'];

// Consentement cookies accorde d'emblee, timer neutralise (setInterval no-op pour
// eviter tout auto-submit pendant l'extraction), pour un contenu stable.
const INIT = `
  try { localStorage.setItem('parrottalk_cookie_consent','granted'); } catch (e) {}
`;

async function extractTest(page, testId) {
  await page.goto(BASE_URL + '/reading.html', { waitUntil: 'networkidle' });
  // Fige le chrono : evite tout compte a rebours / auto-submit pendant la capture.
  await page.evaluate(() => { window.setInterval = () => 0; });
  await page.evaluate((id) => { selectTest(id); startTest(); }, testId);
  await page.waitForTimeout(150);

  // Contenu de test visible et normalise : uniquement passages + groupes de
  // questions (exclut nav, timer, boutons finish/submit, qui sont du chrome UI
  // unifie par la refonte, pas du contenu de test).
  const content = await page.evaluate(() => {
    const zone = Array.from(document.querySelectorAll('#test-zone, #test-zone-02, #test-zone-03'))
      .find(z => z && !z.classList.contains('hidden'))
      || document.getElementById('test-zone');
    const parts = Array.from(zone.querySelectorAll('.passage-text, .question-group'))
      .map(el => el.textContent.replace(/\s+/g, ' ').trim());
    return parts.join(' ␞ ');
  });

  // Cle des reponses. Compatible ancien code (ANSWERS_MAP) et nouveau (qIndex).
  const answerKey = await page.evaluate((id) => {
    const prefix = id === 'test03' ? 't3_' : id === 'test02' ? 't2_' : '';
    const getAns = (n) => (typeof ANSWERS_MAP !== 'undefined')
      ? ANSWERS_MAP[prefix]['q' + n]
      : (qIndex[n] && qIndex[n].q.answer);
    const out = {};
    for (let n = 1; n <= 40; n++) out['q' + n] = getAns(n);
    return out;
  }, testId);

  return { content, answerKey };
}

async function runVector(page, testId, vector) {
  await page.goto(BASE_URL + '/reading.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => { window.setInterval = () => 0; });
  await page.evaluate((id) => { selectTest(id); startTest(); }, testId);
  await page.waitForTimeout(120);

  const result = await page.evaluate((args) => {
    const { id, vector } = args;
    const prefix = id === 'test03' ? 't3_' : id === 'test02' ? 't2_' : '';
    const oldCode = (typeof ANSWERS_MAP !== 'undefined');
    const getAns = (n) => oldCode ? ANSWERS_MAP[prefix]['q' + n] : (qIndex[n] && qIndex[n].q.answer);
    const wrongFor = (ans) => {
      if (ans === 'TRUE') return 'FALSE';
      if (ans === 'FALSE') return 'TRUE';
      if (ans === 'NOT GIVEN') return 'TRUE';
      if (/^[A-H]$/.test(ans)) return ans === 'A' ? 'B' : 'A';
      return 'ZZZ';
    };
    for (let n = 1; n <= 40; n++) {
      const key = (oldCode ? prefix : '') + 'q' + n;
      const correct = getAns(n);
      let val = '';
      if (vector === 'correct') val = correct;
      else if (vector === 'wrong') val = wrongFor(correct);
      else if (vector === 'partial') val = (n <= 26) ? correct : '';
      if (val) setAnswerValue(key, val);
    }
    submitTest();
    const stored = JSON.parse(localStorage.getItem('ielts_reading_scores') || '{}');
    const testKey = id === 'test03' ? 'rdtest03' : id === 'test02' ? 'rdtest02' : 'rdtest01';
    const saved = stored[testKey] || null;
    const savedNoDate = saved ? { total: saved.total, band: saved.band, passageScores: saved.passageScores } : null;
    const card = document.getElementById('results-card');
    const cardText = card ? card.textContent.replace(/\s+/g, ' ').trim() : '';
    const metaId = id === 'test03' ? 'meta-rdtest03' : id === 'test02' ? 'meta-rdtest02' : 'meta-rdtest01';
    const meta = document.getElementById(metaId);
    const metaText = meta ? meta.textContent.replace(/\s+/g, ' ').trim() : '';
    return { saved: savedNoDate, cardText, metaText };
  }, { id: testId, vector });

  return result;
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  await context.addInitScript(INIT);
  await context.route('**/googletagmanager.com/**', r => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  await context.route('**/google-analytics.com/**', r => r.fulfill({ status: 200, body: '' }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  const data = {};
  for (const testId of TESTS) {
    const base = await extractTest(page, testId);
    const vectors = {};
    for (const v of ['correct', 'wrong', 'partial']) {
      vectors[v] = await runVector(page, testId, v);
    }
    data[testId] = { ...base, vectors };
    console.log(`  extrait ${testId} : contenu ${base.content.length} car., cle ${Object.keys(base.answerKey).length} q., correct=${JSON.stringify(vectors.correct.saved)}`);
  }
  await browser.close();

  fs.writeFileSync(OUT, JSON.stringify({ pageErrors: errors, tests: data }, null, 2));
  console.log('Ecrit :', OUT, '| erreurs page :', errors.length);
  if (errors.length) console.log('  ', errors.join(' | '));
}

main().catch(err => { console.error('Erreur extraction :', err); process.exit(2); });
