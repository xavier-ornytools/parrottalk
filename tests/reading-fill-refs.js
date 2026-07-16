#!/usr/bin/env node
// tests/reading-fill-refs.js
// Remplit le champ `ref` (renvoi au passage) dans js/reading-data.js, par lot.
// Ecrit DIRECTEMENT dans js/reading-data.js en preservant tous les refs deja
// remplis : chaque execution recharge le fichier courant et n'ecrase que les
// numeros presents dans le lot fourni. Serialisation identique au generateur
// (tests/reading-build-data.js), donc le diff ne touche que les lignes `ref`.
//
// Usage : node tests/reading-fill-refs.js <clef-test> <batch.json>
//   <clef-test>  : rdtest01 | rdtest02 | rdtest03
//   <batch.json> : { "1": "Paragraph 2: '...'", "8": "...", ... }  (numeros globaux 1-40)

const fs = require('fs');
const path = require('path');
const DATA = path.join(__dirname, '..', 'js', 'reading-data.js');

const testKey = process.argv[2];
const batchPath = process.argv[3];
if (!testKey || !batchPath) {
  console.error('Usage: node tests/reading-fill-refs.js <rdtestNN> <batch.json>');
  process.exit(2);
}

const refs = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
const code = fs.readFileSync(DATA, 'utf8');
const tests = new Function(code + '\n;return READING_TESTS;')();

const model = tests[testKey];
if (!model) { console.error('Clef test inconnue:', testKey); process.exit(2); }

const wanted = new Set(Object.keys(refs));
let applied = 0;
for (const p of model.passages) {
  for (const g of p.groups) {
    for (const q of (g.questions || [])) {
      const k = String(q.n);
      if (Object.prototype.hasOwnProperty.call(refs, k)) {
        q.ref = refs[k];
        applied++;
        wanted.delete(k);
      }
    }
  }
}

const header = `// js/reading-data.js
// Donnees des tests Reading, modele data-driven (LOT 2). Genere par extraction
// fidele du DOM d'origine (tests/reading-build-data.js), prose des passages
// conservee a l'identique. Convention data.js : globals classiques, pas d'export.
// Le champ \`ref\` (renvoi au paragraphe) et \`explanation\` (vide) alimentent le
// feedback minimal sur erreurs, enrichissable plus tard.

`;
const order = [['rdtest01', 'READING_TEST01'], ['rdtest02', 'READING_TEST02'], ['rdtest03', 'READING_TEST03']];
let body = '';
for (const [key, varName] of order) {
  body += `const ${varName} = ` + JSON.stringify(tests[key], null, 2) + ';\n\n';
}
body += `const READING_TESTS = { rdtest01: READING_TEST01, rdtest02: READING_TEST02, rdtest03: READING_TEST03 };\n`;
fs.writeFileSync(DATA, header + body);

console.log(`${testKey}: ${applied} refs appliques.` + (wanted.size ? ` INTROUVABLES: ${[...wanted].join(',')}` : ''));
