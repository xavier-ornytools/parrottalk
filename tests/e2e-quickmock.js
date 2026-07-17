#!/usr/bin/env node
// tests/e2e-quickmock.js
// Parcours Quick Test de bout en bout, en vrai Chrome, plus les garde-fous qui
// protegent le reste du site.
//
// Les deux endpoints IA sont MOCKES : un Quick Test consomme 2 evaluations du
// quota (10/jour/IP, partage Writing+Speaking), donc 5 Quick Tests par jour
// suffiraient a bloquer Xavier le jour du tournage. Aucun test ne doit y toucher.
//
// Usage : node tests/e2e-quickmock.js [chemin-chrome]
// Prerequis : serveur statique sur http://127.0.0.1:8000 (cf. CLAUDE.md projet).

const { chromium } = require('playwright-core');

const URL = process.env.PARROTTALK_TEST_URL || 'http://127.0.0.1:8000';
const CHROME = process.argv[2] || process.env.CHROME_PATH || '/usr/bin/google-chrome';
const SEED = 42; // tirage deterministe, sinon le test n'est pas reproductible

let passed = 0, failed = 0;
function check(label, cond, detail) {
  if (cond) { passed++; console.log('  ok   ' + label); }
  else { failed++; console.log('  FAIL ' + label + (detail ? ' -> ' + detail : '')); }
}

const WRITING_MOCK = {
  band: 6.0, taskAchievement: { band: 6, comment: 'ok' }, coherence: { band: 6, comment: 'ok' },
  lexical: { band: 6, comment: 'ok' }, grammar: { band: 6, comment: 'ok' }, summary: 'ok', topTip: 'ok',
};
const SPEAKING_MOCK = {
  fc: 7.0, lr: 7.0, gra: 6.5, pron: 7.5, overall: 7.0, transcript: 'x', transcripts: [],
  summary: 'ok', strengths: [], toFix: [], topTip: 'ok', skippedQuestions: [],
};

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  });
  const ctx = await browser.newContext({ permissions: ['microphone'] });
  const page = await ctx.newPage();
  const jsErrors = [];
  page.on('pageerror', (e) => jsErrors.push(e.message));

  // Ce que le front envoie reellement au Worker, capture pour assertion.
  let speakingForm = null, writingBody = null;
  await page.route('**/evaluate/speaking', async (route) => {
    const buf = route.request().postDataBuffer();
    speakingForm = buf ? buf.toString('latin1') : '';
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(SPEAKING_MOCK) });
  });
  await page.route('**/evaluate/writing', async (route) => {
    writingBody = JSON.parse(route.request().postData());
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(WRITING_MOCK) });
  });

  const reset = async () => {
    await page.goto(URL + '/quickmock.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); localStorage.setItem('parrottalk_cookie_consent', 'granted'); localStorage.setItem('parrottalk_consent_recording', 'granted'); });
  };

  // ── 1. Le hub tire une composition, une seule fois ──────────────────────────
  console.log('\nHub et tirage');
  await reset();
  await page.goto(URL + '/quickmock.html?qmseed=' + SEED, { waitUntil: 'networkidle' });
  await page.click('button:has-text("Start Quick Test")');
  await page.waitForURL('**/listening.html*');
  const combo1 = await page.evaluate(() => JSON.stringify(QuickMock.get().combo));
  check('Start tire une composition et entre dans Listening', !!combo1);

  // Un F5 ne doit JAMAIS retirer : le candidat perdrait son test en cours.
  await page.reload({ waitUntil: 'networkidle' });
  const combo2 = await page.evaluate(() => JSON.stringify(QuickMock.get().combo));
  check('un rechargement ne retire pas la composition', combo1 === combo2, 'la composition a change');

  // ── 2. Listening : le verrou de la review ──────────────────────────────────
  console.log('\nListening, une section seule');
  const lst = await page.evaluate(() => ({ n: currentTest.sections.length, done: sectionsDone.length, dur: LISTENING_DURATION }));
  check('une seule section injectee', lst.n === 1, String(lst.n));
  check('etat dimensionne sur 1, pas sur un litteral de 4', lst.done === 1, String(lst.done));
  check('chrono a 480 s', lst.dur === 480, String(lst.dur));

  await page.evaluate(() => {
    // Pool temps 2 : le seed peut tirer n'importe laquelle des 16 sections, dont
    // certaines melent inputs texte et questions a choix. On pose la bonne reponse
    // quel que soit le type (texte ou radio), comme le fait deja le bloc Reading.
    // Les 3 dernieres restent fausses (texte errone, ou choix laisse vide).
    const qs = getQuestions(currentTest.sections[0]);
    qs.forEach((q, i) => {
      const el = document.getElementById('q' + q.n);
      if (i < 7) {
        if (el) el.value = q.answer;
        else { const radio = document.querySelector('input[name="q' + q.n + '"][value="' + q.answer + '"]'); if (radio) radio.checked = true; }
      } else if (el) {
        el.value = 'FAUX';
      }
    });
    finishSection();
  });
  await page.waitForTimeout(300);
  const rev = await page.evaluate(() => !document.getElementById('review-panel').classList.contains('hidden'));
  check('VERROU : la review se declenche avec une seule section', rev === true);

  page.on('dialog', (d) => d.accept());
  await page.evaluate(() => submitTest());
  await page.waitForTimeout(400);
  const rL = await page.evaluate(() => QuickMock.get().results.listening);
  check('Listening pousse son band au parcours', !!rL, JSON.stringify(rL));
  check('score mis a l echelle sur les questions POSEES', rL && rL.raw === 7 && rL.max === 10, JSON.stringify(rL));

  // ── 3. Reading : ecran vide et base du score ───────────────────────────────
  console.log('\nReading, un passage seul');
  await page.goto(URL + '/reading.html?qm=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const rd = await page.evaluate(() => ({ n: currentTest.passages.length, done: passagesDone.length, dur: READING_DURATION }));
  check('un seul passage injecte', rd.n === 1, String(rd.n));
  check('etat dimensionne sur 1, pas sur un litteral de 3', rd.done === 1, String(rd.done));
  check('chrono a 1200 s', rd.dur === 1200, String(rd.dur));

  await page.evaluate(() => {
    const r = passageRanges[0];
    for (let qn = r.start; qn <= r.end; qn++) {
      const rec = qIndex[qn]; if (!rec) continue;
      const el = document.getElementById('q' + qn);
      if (el) el.value = rec.q.answer;
      else { const radio = document.querySelector('input[name="q' + qn + '"][value="' + rec.q.answer + '"]'); if (radio) radio.checked = true; }
    }
    finishReadingPassage();
  });
  await page.waitForTimeout(300);
  const rdv = await page.evaluate(() => ({
    ghost: !!document.getElementById('passage-1'),
    empty: document.getElementById('test-zone').innerText.trim().length < 50,
    panel: !document.getElementById('review-panel').classList.contains('hidden'),
  }));
  check('VERROU : pas de bascule sur un passage inexistant', rdv.ghost === false);
  check('VERROU : l ecran ne se vide pas', rdv.empty === false);
  check('VERROU : la review se declenche', rdv.panel === true);
  await page.evaluate(() => submitTest());
  await page.waitForTimeout(400);
  check('Reading pousse son band au parcours', !!(await page.evaluate(() => QuickMock.get().results.reading)));

  // ── 4. Writing : Task 1 seule, et les brouillons de l utilisateur ──────────
  console.log('\nWriting, Task 1 seule');
  const wTest = await page.evaluate(() => QuickMock.writingTest());
  await page.evaluate((w) => localStorage.setItem('ielts_writing_draft_test' + w, JSON.stringify({ testId: w, task1: 'TRAVAIL UTILISATEUR', task2: '', savedAt: Date.now() })), wTest);
  await page.goto(URL + '/writing.html?qm=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const wr = await page.evaluate(() => ({
    dur: WRITING_DURATION,
    t2: document.getElementById('task2-card').classList.contains('hidden'),
    bridge: document.getElementById('task2-bridge').classList.contains('hidden'),
    key: draftKey(3),
  }));
  check('chrono a 1200 s', wr.dur === 1200, String(wr.dur));
  check('Task 2 masquee', wr.t2 === true);
  check('le pont vers Task 2 est masque', wr.bridge === true);
  check('clef de brouillon isolee du mode isole', wr.key === 'ielts_qm_writing_draft', wr.key);

  const draft = await page.evaluate((w) => JSON.parse(localStorage.getItem('ielts_writing_draft_test' + w) || 'null'), wTest);
  check('ETANCHEITE : le brouillon de l utilisateur survit', draft && draft.task1 === 'TRAVAIL UTILISATEUR', draft ? 'altere' : 'DETRUIT');

  await page.evaluate(() => {
    document.getElementById('task1-answer').value = 'word '.repeat(160);
    updateWordCount('task1-answer', 'wc1', 150);
    getAIFeedback(1);
  });
  await page.waitForTimeout(1000);
  check('le Worker recoit bien la Task 1', writingBody && writingBody.task === 1, writingBody ? 'task=' + writingBody.task : 'rien');
  check('Writing pousse son band des la Task 1', !!(await page.evaluate(() => QuickMock.get().results.writing)));

  // ── 5. Speaking : le piege du scoring ──────────────────────────────────────
  console.log('\nSpeaking, Part 2 seule');
  await page.goto(URL + '/speaking.html?qm=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const sp = await page.evaluate(() => ({ part: currentPart, rec: recordings.length, nq: getAllQuestions(currentSpeakingTest).length, idx: getRecordingIndex(2, 0) }));
  check('entree directe sur la cue card', sp.part === 2, 'part=' + sp.part);
  check('une seule prise attendue, pas 9', sp.rec === 1, String(sp.rec));
  check('une seule question, pas 9', sp.nq === 1, String(sp.nq));
  check('PIEGE : la cue card est a l index 0, pas 4', sp.idx === 0, String(sp.idx));

  await page.evaluate(() => {
    recordings[0] = { blob: new Blob([new Uint8Array(9000)], { type: 'audio/webm' }), mimeType: 'audio/webm', duration: 42 };
    renderTestZone();
    checkAndSubmit();
  });
  await page.waitForTimeout(1200);
  const qsMatch = speakingForm && speakingForm.match(/name="questions"\r?\n\r?\n([^\r]*)/);
  const qsSent = qsMatch ? JSON.parse(qsMatch[1]) : null;
  check('PIEGE : le Worker recoit 1 question, pas 9', qsSent && qsSent.length === 1, qsSent ? qsSent.length + ' questions' : 'introuvable');
  check('PIEGE : le blob part en audio_0, pas audio_4', speakingForm && /name="audio_0"/.test(speakingForm) && !/name="audio_4"/.test(speakingForm));
  check('Speaking pousse son band au parcours', !!(await page.evaluate(() => QuickMock.get().results.speaking)));

  // ── 6. Synthese et band global ─────────────────────────────────────────────
  console.log('\nSynthese');
  await page.goto(URL + '/quickmock.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const step = await page.evaluate(() => QuickMock.currentStep());
  check('le parcours est termine', step === 'done', step);
  const band = await page.locator('.fb-hero__band').innerText();
  // Listening 7/10 -> band, Reading 13/13 -> 9.0, Writing 6.0, Speaking 7.0
  check('un band global est affiche', /^\d\.\d$/.test(band), band);
  const note = await page.locator('.fb-hero__note').innerText();
  check('le band est ETIQUETE comme une estimation', /not an official IELTS score/i.test(note), note);
  check('les 4 bands de section sont affiches', (await page.locator('.score-val').count()) === 4);

  // ── 7. Etancheite : rien n a fuite vers le mode isole ──────────────────────
  console.log('\nEtancheite avec le mode isole');
  const leaks = await page.evaluate(() => ({
    scores: Object.keys(JSON.parse(localStorage.getItem('ielts_scores') || '{}')),
    rscores: Object.keys(JSON.parse(localStorage.getItem('ielts_reading_scores') || '{}')),
    mock: localStorage.getItem('pt_mock'),
  }));
  check('aucune entree qm- dans ielts_scores', !leaks.scores.some((k) => /^qm-/.test(k)), JSON.stringify(leaks.scores));
  check('aucune entree qm- dans ielts_reading_scores', !leaks.rscores.some((k) => /^qm-/.test(k)), JSON.stringify(leaks.rscores));
  check('le Quick Test ne pose jamais pt_mock (Full Mock intact)', leaks.mock === null, String(leaks.mock));

  // ── 8. Arrondi IELTS du band global ───────────────────────────────────────
  console.log('\nArrondi IELTS du band global');
  const rounds = await page.evaluate(() => {
    const mk = (a, b, c, d) => ({ listening: { band: a }, reading: { band: b }, writing: { band: c }, speaking: { band: d } });
    return {
      up: QuickMock.overallBand(mk(6.5, 6.0, 6.0, 6.5)),      // 6.25 -> 6.5
      up2: QuickMock.overallBand(mk(7.0, 7.0, 6.5, 6.5)),      // 6.75 -> 7.0
      down: QuickMock.overallBand(mk(6.5, 6.0, 6.0, 6.0)),     // 6.125 -> 6.0
      partial: QuickMock.overallBand(mk(6, 7, null, 6)),       // pas de moyenne partielle
    };
  });
  check('6.25 arrondit a 6.5', rounds.up === 6.5, String(rounds.up));
  check('6.75 arrondit a 7.0', rounds.up2 === 7.0, String(rounds.up2));
  check('6.125 arrondit a 6.0', rounds.down === 6.0, String(rounds.down));
  check('aucun band global sur 3 epreuves', rounds.partial === null, String(rounds.partial));

  // ── 9. Le parcours dans GA4 ───────────────────────────────────────────────
  console.log('\nGA4');
  const p2 = await ctx.newPage();
  await p2.addInitScript(() => { window.__ev = []; window.gtag = (k, n, p) => { if (k === 'event') window.__ev.push({ n, p }); }; });
  await p2.goto(URL + '/quickmock.html', { waitUntil: 'domcontentloaded' });
  await p2.evaluate(() => { localStorage.clear(); sessionStorage.clear(); QuickMock.start(42); });
  await p2.goto(URL + '/listening.html?qm=1', { waitUntil: 'networkidle' });
  await p2.waitForTimeout(400);
  const ev = await p2.evaluate(() => window.__ev);
  const ts = ev.find((e) => e.n === 'test_started');
  check('test_started porte flow:quick', ts && ts.p.flow === 'quick', ts ? JSON.stringify(ts.p) : 'aucun event');
  check('les parametres historiques sont preserves', ts && ts.p.section === 'listening', ts ? JSON.stringify(ts.p) : '-');

  console.log('\n  erreurs JS : ' + (jsErrors.length ? jsErrors.slice(0, 3).join(' | ') : 'aucune'));
  if (jsErrors.length) failed++;
  await browser.close();
  console.log(`\n  ${passed} passed  |  ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
