#!/usr/bin/env node
// Émet le bloc runtime `const TEST02 = {...};` (format js/data.js) depuis la source
// d'authoring, en retirant script/speakers/at/anchor. Ce qui ship = ce que la
// Porte 1 a validé. Usage : node tools/emit-runtime.js listening-src/test02.js
const path = require('path');
const fs = require('fs');
const test = require(path.resolve(process.argv[2]));

// Lit la cue sheet horodatée générée à côté du MP3 (révélation progressive).
function cuesFor(n) {
  const p = path.resolve('audio', test.id, `section${n}.cues.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8')).cues;
}

const cleanQ = q => {
  if (Array.isArray(q.options)) return { n: q.n, text: q.text, options: q.options, answer: q.answer };
  if (q.text) return { n: q.n, text: q.text, answer: q.answer, alt: q.alt || [] }; // matching
  return { n: q.n, label: q.label, answer: q.answer, alt: q.alt || [] };           // completion / maplabel
};

const runtime = {
  id: test.id, title: test.title, date: null,
  sections: test.sections.map(sec => {
    const base = { number: sec.number, title: sec.title, audio: `audio/${test.id}/section${sec.number}.mp3`, cues: cuesFor(sec.number), type: sec.runtimeType };
    if (sec.runtimeType === 'form') {
      return { ...base, formTitle: sec.formTitle, instructions: sec.instructions, questions: sec.questions.map(cleanQ) };
    }
    return { ...base, groups: sec.groups.map(g => {
      const gb = { type: g.type };
      if (g.formTitle) gb.formTitle = g.formTitle;
      gb.instructions = g.instructions;
      if (g.options) gb.options = g.options;
      gb.questions = g.questions.map(cleanQ);
      return gb;
    }) };
  }),
};

const js = 'const ' + test.id.toUpperCase() + ' = ' + JSON.stringify(runtime, null, 2)
  .replace(/"([a-zA-Z_][a-zA-Z0-9_]*)":/g, '$1:') // clés sans guillemets, style data.js
  + ';';
process.stdout.write(js + '\n');
