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

let ok = 0; const problems = [];
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

console.log(`${testKey}: ${ok}/${Object.keys(refs).length} renvois OK.`);
if (problems.length) { console.log('PROBLEMES:'); problems.forEach(p => console.log('  - ' + p)); process.exit(1); }
