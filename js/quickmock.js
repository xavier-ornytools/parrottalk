/* ParrotTalk, Quick Test (mini examen, environ 50 min).
 *
 * Module FRERE de exam-flow.js, pas une extension : exam-flow gouverne le Full
 * Mock qui tourne en prod, on n'y touche pas. Memes idiomes (blob localStorage,
 * isActive(), renderNextStep()), etat et cycle de vie separes.
 *
 * Principe : le Quick Test est un ORCHESTRATEUR, pas un 5e moteur. Il ne rend
 * aucune question. Il tire une composition, puis injecte dans chaque moteur
 * existant un objet test synthetique qui ne contient QU'UNE tranche. Le moteur
 * ignore qu'il joue un Quick Test : il joue un test qui n'a qu'une section.
 * Les tranches sont passees PAR REFERENCE, jamais copiees : le contenu reste
 * mot pour mot celui des tests complets, aucune divergence possible.
 *
 * Composition : 1 section Listening (8 min) + 1 passage Reading (20 min) +
 * Writing Task 1 seule (20 min) + Speaking Part 2 seule (4 min).
 *
 * Le band global est une ESTIMATION, jamais un score officiel : il repose sur
 * une extrapolation de 10 questions vers 40 (Listening), ce qui est brutal par
 * construction. L'etiquetage n'est pas cosmetique, il est la seule chose qui
 * rend ce chiffre defendable.
 *
 * Chargement : script SIMPLE, avant le script inline de chaque moteur. Jamais
 * en `defer`, sinon window.QuickMock est undefined quand le code inline appele
 * au parsing le consulte (piege dont speaking.html:1163 souffre deja avec
 * window.ExamFlow).
 *
 * API :
 *   QuickMock.isActive()                    un Quick Test est-il en cours ?
 *   QuickMock.start(seed)                   tire une composition et demarre
 *   QuickMock.get()                         l'etat complet
 *   QuickMock.currentStep()                 'listening'..'speaking' | 'done'
 *   QuickMock.sliceListening(TESTS)         objet test synthetique, 1 section
 *   QuickMock.sliceReading(READING_TESTS)   objet test synthetique, 1 passage
 *   QuickMock.writingTest() / speakingTest() numero du test tire
 *   QuickMock.duration(module)              secondes allouees a la tranche
 *   QuickMock.recordResult(module, payload) le moteur pousse son resultat
 *   QuickMock.overallBand(results)          moyenne des 4 bands, arrondi IELTS
 *   QuickMock.renderNextStep(current, el)   bouton de retour au hub
 *   QuickMock.stop()                        abandon
 */
(function () {
  'use strict';

  var ORDER  = ['listening', 'reading', 'writing', 'speaking'];
  var LABELS = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking' };
  var ICON   = { listening: '🎧', reading: '📖', writing: '✍️', speaking: '🎤' };
  var PAGES  = { listening: 'listening.html', reading: 'reading.html', writing: 'writing.html', speaking: 'speaking.html' };
  var HUB    = 'quickmock.html';

  // Ce que le candidat joue reellement dans chaque tranche, affiche sur l'ecran
  // de transition. Sert a annoncer honnetement la reduction : on ne pretend pas
  // qu'une section vaut une epreuve.
  var SCOPE = {
    listening: 'One section, 10 questions',
    reading:   'One passage',
    writing:   'Task 1 only',
    speaking:  'Part 2 only, the cue card',
  };

  // Secondes allouees a chaque tranche. Listening lit sa duree via ?timer= qui
  // existe deja (listening.html:412). Speaking n'a pas de chrono d'epreuve : il
  // est borne par maxSpeak (120 s) et la preparation (60 s), on l'annonce a 4 min.
  var DURATION = { listening: 480, reading: 1200, writing: 1200, speaking: 240 };

  var LS_QM   = 'pt_quickmock';
  var LS_HIST = 'pt_quickmock_history';
  var HIST_MAX = 5;
  var DRAW_TRIES = 8;
  var STATE_VERSION = 1;

  // Pool de tirage. TEMPS 1 : un seul billet par module, le mecanisme de tirage
  // est deja le bon et ne changera pas. TEMPS 2 : elargir ces 4 tableaux, une
  // ligne chacun, apres verification VISUELLE de chaque tranche (les 16 sections
  // ont-elles toutes leurs cues, les 12 passages se rendent-ils hors du contexte
  // de leur test, WRITING_DATA[4] et son camembert Chart.js tient-il en 20 min).
  // Cible : 4 x 12 x 4 x 4 = 768 combinaisons.
  var POOL = {
    listening: [{ test: 'test01', section: 0 }],
    reading:   [{ test: 'rdtest01', passage: 0 }],
    writing:   [1],
    speaking:  [1],
  };

  // ── Etat ────────────────────────────────────────────────────────────────────

  function get() { try { return JSON.parse(localStorage.getItem(LS_QM) || 'null'); } catch (e) { return null; } }
  function set(st) { try { localStorage.setItem(LS_QM, JSON.stringify(st)); } catch (e) {} }
  function isActive() { var s = get(); return !!(s && s.active); }
  function clear() { try { localStorage.removeItem(LS_QM); } catch (e) {} }
  function stop() { clear(); location.href = 'index.html'; }

  function history() { try { return JSON.parse(localStorage.getItem(LS_HIST) || '[]'); } catch (e) { return []; } }
  function pushHistory(key) {
    var h = history();
    h.unshift(key);
    try { localStorage.setItem(LS_HIST, JSON.stringify(h.slice(0, HIST_MAX))); } catch (e) {}
  }

  // ── Tirage ──────────────────────────────────────────────────────────────────

  // mulberry32 : generateur deterministe. Sert a ?qmseed=N, qui rend l'e2e
  // reproductible et permet de rejouer une combinaison precise depuis un lien.
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

  function drawCombo(rng) {
    var l = pick(rng, POOL.listening), r = pick(rng, POOL.reading);
    return {
      listening: { test: l.test, section: l.section },
      reading:   { test: r.test, passage: r.passage },
      writing:   { test: pick(rng, POOL.writing), task: 1 },
      speaking:  { test: pick(rng, POOL.speaking), part: 2 },
    };
  }

  function comboKey(c) {
    return 'L:' + c.listening.test + '#' + c.listening.section +
         '|R:' + c.reading.test + '#' + c.reading.passage +
         '|W:' + c.writing.test +
         '|S:' + c.speaking.test;
  }

  // Anti-repetition : on retire tant que la combinaison est dans l'historique
  // recent, avec un plafond d'essais. Le plafond n'est pas une precaution de
  // style : avec un pool de 1 (temps 1) la repetition est certaine, et sans lui
  // la boucle ne se terminerait jamais.
  function pickFresh(rng) {
    var h = history(), combo = null;
    for (var i = 0; i < DRAW_TRIES; i++) {
      combo = drawCombo(rng);
      if (h.indexOf(comboKey(combo)) === -1) return combo;
    }
    return combo;
  }

  function start(seed) {
    var rng = (typeof seed === 'number' && isFinite(seed)) ? mulberry32(seed) : Math.random;
    var combo = pickFresh(rng);
    set({
      v: STATE_VERSION,
      active: true,
      started: Date.now(),
      seed: (typeof seed === 'number' && isFinite(seed)) ? seed : null,
      combo: combo,
      results: {},
    });
    pushHistory(comboKey(combo));
    return combo;
  }

  // ── Progression ─────────────────────────────────────────────────────────────

  // Le step est DERIVE des resultats, jamais stocke : une valeur stockee peut se
  // desynchroniser des resultats, un calcul non.
  function currentStep() {
    var st = get();
    if (!st) return null;
    for (var i = 0; i < ORDER.length; i++) {
      if (!st.results[ORDER[i]]) return ORDER[i];
    }
    return 'done';
  }

  function stepIndex(module) { return ORDER.indexOf(module) + 1; }
  function duration(module) { return DURATION[module]; }

  // ── Injection dans les moteurs ──────────────────────────────────────────────

  // Objet test synthetique : meme forme que TESTS.test01, mais une seule section.
  // La section est passee PAR REFERENCE (pas de copie, pas de clone) : le contenu
  // reste strictement celui du test d'origine.
  // L'id est distinct (`qm-test01-s1`) et ce n'est pas cosmetique : il isole
  // naturellement la clef `ielts_progress_listening_<id>` du mode isole, et
  // findInProgressListeningTest() n'itere que test01..test04, donc il ne
  // detournera jamais la reprise de session de la page normale.
  function sliceListening(TESTS) {
    var st = get();
    if (!st) return null;
    var c = st.combo.listening;
    var src = TESTS[c.test];
    if (!src || !src.sections || !src.sections[c.section]) return null;
    return {
      id: 'qm-' + c.test + '-s' + (c.section + 1),
      title: 'Quick Test, Listening',
      sections: [src.sections[c.section]],
    };
  }

  function sliceReading(READING_TESTS) {
    var st = get();
    if (!st) return null;
    var c = st.combo.reading;
    var src = READING_TESTS[c.test];
    if (!src || !src.passages || !src.passages[c.passage]) return null;
    return {
      id: 'qm-' + c.test + '-p' + (c.passage + 1),
      title: 'Quick Test, Reading',
      passages: [src.passages[c.passage]],
    };
  }

  function writingTest()  { var s = get(); return s ? s.combo.writing.test : null; }
  function speakingTest() { var s = get(); return s ? s.combo.speaking.test : null; }

  // ── Resultats et band global ────────────────────────────────────────────────

  // Le moteur POUSSE son resultat ici, il n'est jamais scrape du DOM.
  // payload : { raw, max, scaled, band } pour Listening/Reading, { band } pour
  // Writing/Speaking (le Worker calcule deja leur band par le code).
  function recordResult(module, payload) {
    var st = get();
    if (!st || ORDER.indexOf(module) === -1) return;
    st.results[module] = Object.assign({}, payload, { at: Date.now() });
    set(st);
  }

  // Moyenne des 4 bands, arrondie au demi-point superieur : Math.round(x*2)/2 est
  // exactement la regle IELTS (mi-chemin vers le haut) et le meme idiome que
  // clampBand du Worker. 6.25 -> 6.5, 6.75 -> 7.0, 6.125 -> 6.0.
  // Pas de moyenne partielle : un band global sur 3 epreuves serait un chiffre
  // faux presente comme un resultat.
  function overallBand(results) {
    if (!results) return null;
    var bands = ORDER.map(function (k) { return results[k] && results[k].band; });
    if (bands.some(function (b) { return typeof b !== 'number' || !isFinite(b); })) return null;
    var sum = bands.reduce(function (a, b) { return a + b; }, 0);
    return Math.round((sum / ORDER.length) * 2) / 2;
  }

  // ── Fin de tranche ──────────────────────────────────────────────────────────

  // Retour au hub apres chaque tranche : c'est le hub qui porte l'ecran de
  // transition et la synthese, le moteur ne sait rien du parcours.
  function renderNextStep(current, container) {
    if (!container) return;
    var old = container.querySelector('.exam-flow');
    if (old) old.remove();
    var wrap = document.createElement('div');
    wrap.className = 'exam-flow';
    var pos = stepIndex(current);
    var isLast = pos === ORDER.length;
    wrap.innerHTML =
      '<div class="exam-flow__mock">Quick Test · step ' + pos + ' of ' + ORDER.length + ' complete</div>' +
      '<a class="btn btn-primary btn-lg" href="' + HUB + '">' +
        (isLast ? 'See my estimated band →' : 'Continue to ' + ICON[ORDER[pos]] + ' ' + LABELS[ORDER[pos]] + ' →') +
      '</a>' +
      '<button type="button" class="btn btn-ghost exam-flow__stop" onclick="QuickMock.stop()">Stop Quick Test</button>';
    container.appendChild(wrap);
  }

  window.QuickMock = {
    ORDER: ORDER, LABELS: LABELS, ICON: ICON, PAGES: PAGES, SCOPE: SCOPE,
    DURATION: DURATION, POOL: POOL, HUB: HUB,
    isActive: isActive, get: get, start: start, stop: stop, clear: clear,
    currentStep: currentStep, stepIndex: stepIndex, duration: duration,
    sliceListening: sliceListening, sliceReading: sliceReading,
    writingTest: writingTest, speakingTest: speakingTest,
    recordResult: recordResult, overallBand: overallBand,
    renderNextStep: renderNextStep, comboKey: comboKey, history: history,
  };
})();
