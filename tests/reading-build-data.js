#!/usr/bin/env node
// Genere js/reading-data.js par extraction fidele du DOM actuel des 3 tests Reading.
// La prose des passages est conservee en HTML exact (bodyHTML) ; seuls les widgets
// interactifs sont structures. Les reponses viennent des maps ANSWERS de la page.
// Le champ `ref` est initialise vide (rempli ensuite a la main : renvoi paragraphe).
//
// Usage : node tests/reading-build-data.js [chemin_chrome]
// Prerequis : serveur statique sur PARROTTALK_TEST_URL (defaut http://127.0.0.1:8000).

const fs = require('fs');
const { chromium } = require('playwright-core');
const BASE_URL = process.env.PARROTTALK_TEST_URL || 'http://127.0.0.1:8000';
const CHROME_PATH = process.argv[2] || process.env.CHROME_PATH || '/usr/bin/google-chrome';

const TESTS = [
  { id: 'test01', key: 'rdtest01', title: 'Reading Test 01' },
  { id: 'test02', key: 'rdtest02', title: 'Reading Test 02' },
  { id: 'test03', key: 'rdtest03', title: 'Reading Test 03' },
];

async function extractOne(page, t) {
  await page.goto(BASE_URL + '/reading.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => { window.setInterval = () => 0; });
  await page.evaluate((id) => { selectTest(id); startTest(); }, t.id);
  await page.waitForTimeout(150);

  return await page.evaluate((t) => {
    const prefix = t.id === 'test03' ? 't3_' : t.id === 'test02' ? 't2_' : '';
    const ans = ANSWERS_MAP[prefix];
    const ranges = prefix === 't3_' ? PASSAGE_RANGES_03 : prefix === 't2_' ? PASSAGE_RANGES_02 : PASSAGE_RANGES;
    const zone = Array.from(document.querySelectorAll('#test-zone, #test-zone-02, #test-zone-03'))
      .find(z => z && !z.classList.contains('hidden'));
    const A = (n) => ans['q' + n];
    const numOf = (el) => parseInt(el.querySelector('.q-num').textContent.trim(), 10);
    const clean = (s) => s.replace(/\s+/g, ' ').trim();

    const passages = Array.from(zone.querySelectorAll('.passage-block')).map((pb, pi) => {
      const ptext = pb.querySelector('.passage-text');
      const heading = ptext.querySelector('h3') ? ptext.querySelector('h3').textContent.trim() : '';
      const label = ptext.querySelector('.passage-label') ? ptext.querySelector('.passage-label').textContent.trim() : '';
      const bodyHTML = ptext.innerHTML;
      const tab = pb.parentElement ? null : null;

      const groups = Array.from(pb.querySelectorAll('.question-group')).map(g => {
        const title = g.querySelector('.group-title') ? g.querySelector('.group-title').textContent.trim() : '';
        const instrEl = g.querySelector('.group-instructions');
        const instructions = instrEl ? instrEl.innerHTML.trim() : '';
        let type;
        if (/True \/ False/i.test(title)) type = 'tfng';
        else if (/Matching/i.test(title)) type = 'matching';
        else if (/Multiple Choice/i.test(title)) type = 'mc';
        else if (/Sentence Completion/i.test(title)) type = 'sentence';
        else if (/Summary/i.test(title)) type = 'summary';
        else type = 'unknown';

        if (type === 'tfng') {
          const questions = Array.from(g.querySelectorAll('.tfng-question')).map(q => {
            const n = numOf(q);
            const text = clean(q.querySelector('.tfng-text span').textContent);
            return { n, text, answer: A(n), ref: '', explanation: '' };
          });
          return { type, title, instructions, questions };
        }

        if (type === 'mc') {
          const questions = Array.from(g.querySelectorAll('.mc-question')).map(q => {
            const n = numOf(q);
            const text = clean(q.querySelector('.mc-text span').textContent);
            const options = Array.from(q.querySelectorAll('.mc-option')).map(o =>
              o.textContent.replace(/^\s*[A-H]\.\s*/, '').trim());
            return { n, text, options, answer: A(n), ref: '', explanation: '' };
          });
          return { type, title, instructions, questions };
        }

        if (type === 'matching') {
          const first = g.querySelector('.mc-question');
          const options = Array.from(first.querySelectorAll('.mc-option')).map(o =>
            o.textContent.replace(/^\s*[A-H]\.\s*/, '').trim());
          const questions = Array.from(g.querySelectorAll('.mc-question')).map(q => {
            const n = numOf(q);
            const text = clean(q.querySelector('.mc-text span').textContent);
            return { n, text, answer: A(n), ref: '', explanation: '' };
          });
          return { type, title, instructions, options, questions };
        }

        if (type === 'sentence') {
          const questions = Array.from(g.querySelectorAll('.fill-row')).map(row => {
            const n = numOf(row);
            const span = row.querySelector('span');
            const sentence = span ? span.innerHTML.trim() : '';
            const spanStyle = span ? (span.getAttribute('style') || '') : '';
            return { n, sentence, spanStyle, answer: A(n), ref: '', explanation: '' };
          });
          return { type, title, instructions, questions };
        }

        if (type === 'summary') {
          const p = g.querySelector('p');
          const pStyle = p.getAttribute('style') || '';
          const widths = {};
          let template = '';
          p.childNodes.forEach(node => {
            if (node.nodeType === 3) { template += node.textContent; return; }
            // element : soit un <span> wrappant un input, soit un input direct
            const input = node.tagName === 'INPUT' ? node : node.querySelector && node.querySelector('input');
            if (input) {
              const n = parseInt(input.id.replace(/^t\d_/, '').replace('q', ''), 10);
              const st = input.getAttribute('style') || '';
              const m = st.match(/width:\s*([0-9]+px)/);
              if (m) widths[n] = m[1];
              template += '{{' + n + '}}';
            } else {
              template += node.textContent;
            }
          });
          template = template.replace(/\s+/g, ' ').trim();
          const nums = Object.keys(widths).map(Number).sort((a, b) => a - b);
          const questions = nums.map(n => ({ n, answer: A(n), ref: '', explanation: '' }));
          return { type, title, instructions, pStyle, template, widths, questions };
        }

        return { type: 'unknown', title, instructions };
      });

      return {
        number: pi + 1,
        tabLabel: 'Passage ' + (pi + 1),
        resultLabel: ranges[pi].label,
        label,
        heading,
        bodyHTML,
        groups,
      };
    });

    return { id: t.key, title: t.title, passages };
  }, t);
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  await context.addInitScript(`try { localStorage.setItem('parrottalk_cookie_consent','granted'); } catch(e){}`);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  const models = {};
  for (const t of TESTS) {
    models[t.key] = await extractOne(page, t);
    const g = models[t.key].passages.flatMap(p => p.groups);
    console.log(`  ${t.key}: ${models[t.key].passages.length} passages, groupes=[${g.map(x => x.type).join(',')}]`);
  }
  await browser.close();

  const header = `// js/reading-data.js
// Donnees des tests Reading, modele data-driven (LOT 2). Genere par extraction
// fidele du DOM d'origine (tests/reading-build-data.js), prose des passages
// conservee a l'identique. Convention data.js : globals classiques, pas d'export.
// Le champ \`ref\` (renvoi au paragraphe) et \`explanation\` (vide) alimentent le
// feedback minimal sur erreurs, enrichissable plus tard.

`;
  let body = '';
  for (const t of TESTS) {
    const varName = 'READING_' + t.id.toUpperCase();
    body += `const ${varName} = ` + JSON.stringify(models[t.key], null, 2) + ';\n\n';
  }
  body += `const READING_TESTS = { rdtest01: READING_TEST01, rdtest02: READING_TEST02, rdtest03: READING_TEST03 };\n`;

  fs.writeFileSync(__dirname + '/../js/reading-data.js', header + body);
  console.log('Ecrit js/reading-data.js | erreurs page :', errors.length);
  if (errors.length) console.log('  ', errors.slice(0, 3).join(' | '));
}

main().catch(err => { console.error('Erreur:', err); process.exit(2); });
