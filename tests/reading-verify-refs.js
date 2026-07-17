#!/usr/bin/env node
// tests/reading-verify-refs.js
// Garde-fou de fidelite des renvois : verifie que chaque ancre est une sous-chaine
// EXACTE (verbatim) du passage, ET qu'elle se trouve bien dans le paragraphe cite.
// Source de verite = js/reading-data.js si les refs y sont deja injectes, sinon un
// JSON de lot passe en 2e argument.
//
// Usage :
//   node tests/reading-verify-refs.js <rdtestNN>              (verifie les refs du fichier)
//   node tests/reading-verify-refs.js <rdtestNN> <batch.json> (verifie un lot avant injection)

const fs = require('fs');
const path = require('path');
const DATA = path.join(__dirname, '..', 'js', 'reading-data.js');

const testKey = process.argv[2];
const batchPath = process.argv[3];
if (!testKey) { console.error('Usage: node tests/reading-verify-refs.js <rdtestNN> [batch.json]'); process.exit(2); }

const code = fs.readFileSync(DATA, 'utf8');
const tests = new Function(code + '\n;return READING_TESTS;')();
const model = tests[testKey];
if (!model) { console.error('Clef test inconnue:', testKey); process.exit(2); }

const batch = batchPath ? JSON.parse(fs.readFileSync(batchPath, 'utf8')) : null;

function decode(s) {
  return s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
          .replace(/&middot;/g, '·');
}
function stripTags(html) { return decode(html.replace(/<[^>]+>/g, ' ')); }
function norm(s) { return stripTags(s).replace(/\s+/g, ' ').trim(); }

// Decoupe un passage en paragraphes { key: '1'|'A', text }
function paragraphs(bodyHTML) {
  const out = [];
  const re = /<p\b[^>]*>([\s\S]*?)<\/p>/g;
  let m, i = 0;
  while ((m = re.exec(bodyHTML))) {
    i++;
    const text = norm(m[1]);
    const letter = text.match(/^([A-H])\.\s/);
    out.push({ num: String(i), letter: letter ? letter[1] : null, text });
  }
  return out;
}

// index question n -> passage (0/1/2) via l'ordre des passages
const qToPassage = {};
model.passages.forEach((p, pi) => {
  p.groups.forEach(g => (g.questions || []).forEach(q => { qToPassage[q.n] = pi; }));
});

// answer par n
const answerOf = {};
model.passages.forEach(p => p.groups.forEach(g => (g.questions || []).forEach(q => { answerOf[q.n] = q.answer; })));

// refs a verifier : soit le lot, soit ce qui est dans le fichier
const refs = {};
if (batch) { Object.assign(refs, batch); }
else {
  model.passages.forEach(p => p.groups.forEach(g => (g.questions || []).forEach(q => { if (q.ref) refs[String(q.n)] = q.ref; })));
}

// Total des questions du test, tous groupes confondus. Sert de denominateur :
// compter sur Object.keys(refs) laisserait une question sans `ref` passer en
// silence (le compteur afficherait 38/38 OK au lieu de signaler 2 manques).
const allQ = Object.keys(answerOf).map(Number).sort((a, b) => a - b);

let ok = 0; const problems = [];

// Exhaustivite : en mode fichier, chaque question doit porter un renvoi. En mode
// lot (batch.json), le lot peut etre partiel par construction, on ne l'exige pas.
if (!batch) {
  allQ.forEach((n) => { if (!refs[String(n)]) problems.push(`Q${n}: renvoi MANQUANT (question sans ref)`); });
}

// Reciproque de la regle 'Not stated' : une reponse NOT GIVEN ne doit jamais
// porter de fausse ancre vers un paragraphe.
allQ.forEach((n) => {
  const r = refs[String(n)];
  if (answerOf[n] === 'NOT GIVEN' && r && !/^Not stated in the passage$/.test(r)) {
    problems.push(`Q${n}: answer=NOT GIVEN mais ref pointe un paragraphe -> ${r}`);
  }
});

for (const k of Object.keys(refs).sort((a, b) => a - b)) {
  const ref = refs[k];
  const ans = answerOf[k];
  if (/^Not stated in the passage$/.test(ref)) {
    if (ans !== 'NOT GIVEN') problems.push(`Q${k}: 'Not stated' mais answer=${ans} (attendu NOT GIVEN)`);
    else ok++;
    continue;
  }
  const mm = ref.match(/^Paragraph\s+(\S+):\s*'(.*)'\s*$/);
  if (!mm) { problems.push(`Q${k}: format invalide -> ${ref}`); continue; }
  const paraLabel = mm[1];
  const anchor = norm(mm[2]);
  const pi = qToPassage[k];
  const paras = paragraphs(model.passages[pi].bodyHTML);
  const wholeText = norm(model.passages[pi].bodyHTML);

  // 1) verbatim dans le passage
  const inPassage = wholeText.includes(anchor);
  const inPassageCI = wholeText.toLowerCase().includes(anchor.toLowerCase());
  // 2) dans le paragraphe cite
  const target = paras.find(p => p.letter === paraLabel) || paras.find(p => p.num === paraLabel);
  const inPara = target ? target.text.includes(anchor) : false;
  const inParaCI = target ? target.text.toLowerCase().includes(anchor.toLowerCase()) : false;

  if (inPassage && inPara) { ok++; }
  else if (inPassageCI && inParaCI) { problems.push(`Q${k}: CASSE differente (verbatim sinon OK) -> Paragraph ${paraLabel} '${anchor}'`); }
  else if (!target) { problems.push(`Q${k}: paragraphe '${paraLabel}' introuvable dans passage ${pi + 1}`); }
  else if (inPassage && !inPara) { problems.push(`Q${k}: ancre presente MAIS pas dans Paragraph ${paraLabel} -> '${anchor}'`); }
  else { problems.push(`Q${k}: ANCRE NON VERBATIM -> '${anchor}'`); }
}

// Verdict avant compteur : un "40/40 OK" imprime au-dessus d'une liste de
// problemes se lit comme un succes. En cas d'echec, aucun compteur rassurant.
const total = batch ? Object.keys(refs).length : allQ.length;
if (problems.length) {
  console.log(`${testKey}: ECHEC, ${problems.length} probleme(s) sur ${total} questions.`);
  console.log('PROBLEMES:'); problems.forEach(p => console.log('  - ' + p));
  process.exit(1);
}
console.log(`${testKey}: ${ok}/${total} renvois OK.`);
