#!/usr/bin/env node
// Minimal smoke-test — run with: node tests/check.js
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
let passed = 0, failed = 0;

function check(label, fn) {
  try {
    const ok = fn();
    if (ok) { console.log(`  ✅ ${label}`); passed++; }
    else     { console.log(`  ❌ ${label}`); failed++; }
  } catch (e) {
    console.log(`  ❌ ${label} — ${e.message}`); failed++;
  }
}

function exists(rel)    { return fs.existsSync(path.join(root, rel)); }
function contains(rel, str) {
  const src = fs.readFileSync(path.join(root, rel), 'utf8');
  return src.includes(str);
}

console.log('\n=== ParrotTalk check.js ===\n');

// HTML files
console.log('[ HTML files ]');
['index.html','dashboard.html','listening.html','reading.html','writing.html','speaking.html','privacy.html']
  .forEach(f => check(f, () => exists(f)));

// API files
console.log('\n[ API routes ]');
['api/writing-feedback.js','api/speaking-transcribe.js','api/speaking-feedback.js','api/subscribe.js']
  .forEach(f => check(f, () => exists(f)));

// API files use CommonJS (not ESM)
console.log('\n[ API CommonJS format ]');
['api/speaking-transcribe.js','api/speaking-feedback.js','api/subscribe.js'].forEach(f =>
  check(`${f} uses module.exports`, () =>
    contains(f, 'module.exports') && !contains(f, 'export default')));

// data.js exports
console.log('\n[ data.js exports ]');
check('BAND_40 defined',      () => contains('js/data.js', 'BAND_40'));
check('TEST01/02/03 defined',  () => contains('js/data.js', 'const TEST01') && contains('js/data.js', 'const TEST02'));
check('listeningTests / TESTS defined', () =>
  contains('js/data.js', 'listeningTests') || contains('js/data.js', 'const TESTS'));

// listening.html critical symbols
console.log('\n[ listening.html ]');
check('submitTest defined',     () => contains('listening.html', 'function submitTest'));
check('handleSectionEnd fixed', () => contains('listening.html', 'function handleSectionEnd(sectionIdx)'));
check('playingSection var',     () => contains('listening.html', 'let playingSection'));
check('seekAudio takes el',     () => contains('listening.html', 'function seekAudio(e, el)'));
check('cancelTTS on submit',    () => {
  const src = fs.readFileSync(path.join(root, 'listening.html'), 'utf8');
  const submitFn = src.slice(src.indexOf('function submitTest'));
  return submitFn.slice(0, 120).includes('cancelTTS');
});

// reading.html critical symbols
console.log('\n[ reading.html ]');
check('submitTest defined', () => contains('reading.html', 'function submitTest'));
check('checkQ defined',     () => contains('reading.html', 'checkQ') || contains('reading.html', 'function checkAnswer'));

// dashboard.html
console.log('\n[ dashboard.html ]');
check('Test03 label handled',   () => contains('dashboard.html', "'Test 03'"));
check('weighted writing formula', () => contains('dashboard.html', 't.t1 + t.t2 * 2'));
check('no bare Test02 hardcode', () => {
  const src = fs.readFileSync(path.join(root, 'dashboard.html'), 'utf8');
  return !src.includes("? 'Test 01' : 'Test 02'");
});

console.log(`\n${'='.repeat(30)}`);
console.log(`  ${passed} passed  |  ${failed} failed`);
console.log('='.repeat(30) + '\n');
process.exit(failed > 0 ? 1 : 0);
