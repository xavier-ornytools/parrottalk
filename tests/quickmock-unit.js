#!/usr/bin/env node
// tests/quickmock-unit.js
// Tests unitaires de js/quickmock.js, sans navigateur. Couvre la logique pure :
// arrondi IELTS du band global, refus de la moyenne partielle, tirage (seed
// deterministe, couverture, anti-repetition), et surtout le fait que les
// tranches sont passees PAR REFERENCE (garantie du "mot pour mot").
//
// L'e2e navigateur (tests/e2e-quickmock.js) couvre le parcours ; ici on couvre
// le calcul. Les deux sont necessaires : un band global faux ne se voit pas a
// l'oeil dans un navigateur.
//
// Usage : node tests/quickmock-unit.js

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// Faux localStorage / window : le module est ecrit pour le navigateur.
let store = {};
global.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};
global.window = global;

require(path.join(ROOT, 'js', 'quickmock.js'));
const QM = global.QuickMock;

let passed = 0, failed = 0;
function check(label, cond, detail) {
  if (cond) { passed++; console.log('  ok   ' + label); }
  else { failed++; console.log('  FAIL ' + label + (detail ? ' -> ' + detail : '')); }
}
const bands = (a, b, c, d) => ({ listening: { band: a }, reading: { band: b }, writing: { band: c }, speaking: { band: d } });

// ── Arrondi IELTS ────────────────────────────────────────────────────────────
// Math.round(x*2)/2 doit reproduire la regle officielle (mi-chemin vers le haut).
console.log('Arrondi IELTS du band global');
check('6.25 arrondit a 6.5', QM.overallBand(bands(6.5, 6.0, 6.0, 6.5)) === 6.5);
check('6.75 arrondit a 7.0', QM.overallBand(bands(7.0, 7.0, 6.5, 6.5)) === 7.0);
check('6.125 arrondit a 6.0', QM.overallBand(bands(6.5, 6.0, 6.0, 6.0)) === 6.0);
check('6.375 arrondit a 6.5', QM.overallBand(bands(6.5, 6.5, 6.0, 6.5)) === 6.5);
check('9 partout donne 9.0', QM.overallBand(bands(9, 9, 9, 9)) === 9.0);

// ── Refus de la moyenne partielle ────────────────────────────────────────────
// Un band global sur 3 epreuves serait un chiffre faux presente comme un resultat.
console.log('\nRefus de la moyenne partielle');
check('un module manquant donne null', QM.overallBand({ listening: { band: 6 }, reading: { band: 7 }, writing: { band: 6 } }) === null);
check('un band non numerique donne null', QM.overallBand(bands(6, 7, null, 6)) === null);
check('resultats vides donnent null', QM.overallBand({}) === null);
check('resultats absents donnent null', QM.overallBand(null) === null);

// ── Cycle de vie ─────────────────────────────────────────────────────────────
console.log('\nCycle de vie');
store = {};
check('inactif au depart', QM.isActive() === false);
const combo = QM.start(42);
check('actif apres start', QM.isActive() === true);
check('step initial = listening', QM.currentStep() === 'listening');
check('la composition respecte le POOL', combo.writing.task === 1 && combo.speaking.part === 2, JSON.stringify(combo));

// ── Progression derivee ──────────────────────────────────────────────────────
// Le step est calcule depuis les resultats, jamais stocke : une valeur stockee
// peut se desynchroniser, un calcul non.
console.log('\nProgression derivee des resultats');
store = {}; QM.start(42);
QM.recordResult('listening', { raw: 7, max: 10, scaled: 28, band: 6.5 });
check('step avance a reading', QM.currentStep() === 'reading', QM.currentStep());
QM.recordResult('reading', { raw: 9, max: 13, scaled: 28, band: 6.5 });
QM.recordResult('writing', { band: 6.0 });
check('step avance a speaking', QM.currentStep() === 'speaking', QM.currentStep());
QM.recordResult('speaking', { band: 6.5 });
check('step = done quand les 4 sont la', QM.currentStep() === 'done', QM.currentStep());
check('band global calcule sur les 4 resultats', QM.overallBand(QM.get().results) === 6.5);

// ── Slices : la garantie du "mot pour mot" ───────────────────────────────────
// Le contenu doit etre le MEME OBJET que la source, pas une copie : une copie
// pourrait diverger, une reference non.
console.log('\nSlices, passage par reference');
const TESTS = new Function(fs.readFileSync(path.join(ROOT, 'js', 'data.js'), 'utf8') + '\n;return TESTS;')();
const READING_TESTS = new Function(fs.readFileSync(path.join(ROOT, 'js', 'reading-data.js'), 'utf8') + '\n;return READING_TESTS;')();
store = {}; QM.start(42);
const sl = QM.sliceListening(TESTS);
check('slice Listening a exactement 1 section', sl.sections.length === 1);
check('slice Listening porte un id distinct du mode isole', /^qm-/.test(sl.id), sl.id);
check('slice Listening est le MEME OBJET que la source', sl.sections[0] === TESTS[QM.get().combo.listening.test].sections[QM.get().combo.listening.section]);
const sr = QM.sliceReading(READING_TESTS);
check('slice Reading a exactement 1 passage', sr.passages.length === 1);
check('slice Reading est le MEME OBJET que la source', sr.passages[0] === READING_TESTS[QM.get().combo.reading.test].passages[QM.get().combo.reading.passage]);
check('slice Reading : la prose est intacte', sr.passages[0].bodyHTML === READING_TESTS[QM.get().combo.reading.test].passages[QM.get().combo.reading.passage].bodyHTML);
check('une clef de test inconnue donne null sans exception', (() => { const s = QM.get(); s.combo.listening.test = 'nope'; store[Object.keys(store).find(k => k === 'pt_quickmock')] = JSON.stringify(s); return QM.sliceListening(TESTS) === null; })());

// ── Durees ───────────────────────────────────────────────────────────────────
console.log('\nDurees allouees');
check('Listening 480 s', QM.duration('listening') === 480);
check('Reading 1200 s', QM.duration('reading') === 1200);
check('Writing 1200 s', QM.duration('writing') === 1200);
check('Speaking 240 s', QM.duration('speaking') === 240);

// ── Tirage, sur POOL ELARGI ──────────────────────────────────────────────────
// Point important : avec le POOL du temps 1 (un billet par module), "meme seed
// donne meme combinaison" est vrai trivialement et ne prouve RIEN. On elargit le
// pool comme le fera le temps 2 pour eprouver la mecanique elle-meme.
console.log('\nTirage (POOL elargi, comme au temps 2)');
const POOL_T1 = JSON.parse(JSON.stringify(QM.POOL));
QM.POOL.listening = [{ test: 'test01', section: 0 }, { test: 'test02', section: 1 }, { test: 'test03', section: 2 }, { test: 'test04', section: 3 }];
QM.POOL.reading = [{ test: 'rdtest01', passage: 0 }, { test: 'rdtest02', passage: 1 }, { test: 'rdtest03', passage: 2 }, { test: 'rdtest04', passage: 0 }];
QM.POOL.writing = [1, 2, 3, 4];
QM.POOL.speaking = [1, 2, 3, 4];

store = {}; const a = QM.comboKey(QM.start(42));
store = {}; const b = QM.comboKey(QM.start(42));
store = {}; const c = QM.comboKey(QM.start(7));
check('meme seed donne la meme combinaison', a === b, a + ' vs ' + b);
check('un seed different change la combinaison', a !== c, a + ' vs ' + c);

const seen = {};
for (let i = 0; i < 400; i++) { store = {}; seen[QM.comboKey(QM.start())] = 1; }
const distinct = Object.keys(seen).length;
check('400 tirages couvrent l espace (plus de 50 combinaisons distinctes)', distinct > 50, distinct + ' distinctes sur 256 possibles');

store = {};
const keys = [];
for (let j = 0; j < 5; j++) keys.push(QM.comboKey(QM.start(j)));
check('l historique est plafonne a 5', QM.history().length <= 5, String(QM.history().length));
check('l historique retient le dernier tirage', QM.history()[0] === keys[keys.length - 1]);

// ── Le POOL du temps 1 ne casse pas le tirage ────────────────────────────────
// Avec un seul billet, l anti-repetition ne peut jamais etre satisfaite : le
// plafond d essais evite la boucle infinie. C'est ce que ce test verifie.
console.log('\nPOOL du temps 1 (un seul billet par module)');
QM.POOL.listening = POOL_T1.listening; QM.POOL.reading = POOL_T1.reading;
QM.POOL.writing = POOL_T1.writing; QM.POOL.speaking = POOL_T1.speaking;
store = {}; const only1 = QM.comboKey(QM.start());
const only2 = QM.comboKey(QM.start());
check('tire toujours le meme billet, sans boucler', only1 === only2, only1);

console.log(`\n  ${passed} passed  |  ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
