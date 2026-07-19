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

// API + Worker. L'evaluation IA (Writing, Speaking, transcription) a migre le
// 16/07 des fichiers api/*-feedback et api/*-transcribe vers le Worker Cloudflare
// (worker/src/index.js). Assertions adaptees au Worker le 18/07 (point 3 dette).
console.log('\n[ API routes ]');
check('api/subscribe.js', () => exists('api/subscribe.js'));
check('worker/src/index.js (evaluation IA)', () => exists('worker/src/index.js'));
check('worker route /evaluate/writing (ex api/writing-feedback.js)', () => contains('worker/src/index.js', '/evaluate/writing'));
check('worker route /evaluate/speaking (ex api/speaking-feedback.js)', () => contains('worker/src/index.js', '/evaluate/speaking'));

// Format des sorties serveur. api/subscribe.js reste en Node CommonJS ; le Worker
// Cloudflare est un module ES (export default), format normal de la plateforme.
console.log('\n[ API CommonJS format ]');
check('api/subscribe.js uses module.exports', () =>
  contains('api/subscribe.js', 'module.exports') && !contains('api/subscribe.js', 'export default'));
check('worker/src/index.js est un module ES (export default)', () =>
  contains('worker/src/index.js', 'export default'));
check('worker produit un transcript Speaking (ex api/speaking-transcribe.js)', () =>
  contains('worker/src/index.js', 'transcript'));

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
  // La garde "aucune reponse" a ete ajoutee en tete de submitTest, repoussant
  // l'appel cancelTTS au-dela des 120 premiers caracteres. On inspecte donc un
  // segment plus large du corps de la fonction (adapte le 18/07).
  const src = fs.readFileSync(path.join(root, 'listening.html'), 'utf8');
  const submitFn = src.slice(src.indexOf('function submitTest'));
  return submitFn.slice(0, 900).includes('cancelTTS');
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

// Legal pages
console.log('\n[ Legal pages ]');
['legal-notice.html', 'terms.html'].forEach(f => check(f, () => exists(f)));
check('privacy.html mentions Google Analytics',        () => contains('privacy.html', 'Google Analytics'));
check('privacy.html no false no-cookies claim',        () => !contains('privacy.html', 'do not use tracking cookies'));
check('privacy.html contact is contact@parrottalk.app', () => contains('privacy.html', 'contact@parrottalk.app'));
check('legal-notice.html contact is contact@parrottalk.app', () => contains('legal-notice.html', 'contact@parrottalk.app'));
check('terms.html contact is contact@parrottalk.app',  () => contains('terms.html', 'contact@parrottalk.app'));
check('terms.html non-affiliation clause',             () => contains('terms.html', 'British Council'));
check('terms.html as-is/beta clause',                  () => contains('terms.html', '"as is"'));

// Legal pages reachable from every page
console.log('\n[ Legal pages reachable from every page ]');
['index.html','listening.html','reading.html','writing.html','speaking.html','dashboard.html','privacy.html']
  .forEach(f => {
    check(`${f} links to legal-notice.html`, () => contains(f, 'legal-notice.html'));
    check(`${f} links to terms.html`,        () => contains(f, 'terms.html'));
  });

// Cookie consent / GA4 gating
console.log('\n[ Cookie consent / GA4 gating ]');
check('analytics.js gated by consent key', () => contains('js/analytics.js', 'parrottalk_cookie_consent'));
check('analytics.js exposes a consent-gated loader', () =>
  contains('js/analytics.js', '__ptLoadAnalyticsIfConsented'));
check('cookie-banner.js exists', () => exists('js/cookie-banner.js'));
['index.html','listening.html','reading.html','writing.html','speaking.html','dashboard.html','privacy.html']
  .forEach(f => check(`${f} loads cookie-banner.js`, () => contains(f, 'js/cookie-banner.js')));

// Speaking recording consent gate
console.log('\n[ Speaking recording consent gate ]');
check('consent-gate-overlay markup present', () => contains('speaking.html', 'consent-gate-overlay'));
check('startRecording checks consent before getUserMedia', () => {
  const src = fs.readFileSync(path.join(root, 'speaking.html'), 'utf8');
  const fn = src.slice(src.indexOf('async function startRecording'));
  return fn.slice(0, 150).includes('hasRecordingConsent');
});
check('consent flag uses parrottalk_ prefix (survives dashboard reset)', () =>
  contains('speaking.html', 'parrottalk_consent_recording'));

// FAQ
console.log('\n[ FAQ ]');
// La FAQ a ete deplacee de index.html vers la page dediee faq.html le 15/07.
// Assertions repointees sur faq.html le 18/07 (point 3 dette). faq.html etant
// entierement la FAQ, on verifie le fichier entier plutot qu'une tranche.
check('faq.html has at least 10 FAQ items', () => {
  const src = fs.readFileSync(path.join(root, 'faq.html'), 'utf8');
  return (src.match(/class="faq-item"/g) || []).length >= 10;
});
check('FAQ states non-affiliation with IELTS/British Council', () =>
  contains('faq.html', 'not affiliated with, endorsed by, sponsored by, or connected'));
check('FAQ states the band is an AI estimate, not an official result', () =>
  contains('faq.html', "it's an AI-generated estimate"));
check('FAQ does not claim a measured accuracy figure (no percentage)', () => {
  const src = fs.readFileSync(path.join(root, 'faq.html'), 'utf8');
  return !/±\s*\d+(\.\d+)?\s*%/.test(src); // no invented precision percentage
});
check('FAQ no longer promises the site "will always be free"', () =>
  !contains('faq.html', 'will always be free'));
check('FAQ links to privacy.html', () => contains('faq.html', 'href="privacy.html"'));
check('FAQ links to terms.html', () => contains('faq.html', 'href="terms.html"'));
check('FAQ does not mention the newsletter (Brevo not verified in prod)', () => {
  const src = fs.readFileSync(path.join(root, 'faq.html'), 'utf8');
  return !/newsletter|subscribe/i.test(src);
});
check('FAQ band-variance sentence reads as a caution, not a guarantee', () =>
  contains('faq.html', 'not a measured accuracy figure or a guarantee'));

// Blog (LOT 1, 2026-07-19)
console.log('\n[ Blog ]');
const ART_REL = 'blog/how-i-built-an-ielts-site-with-ai/index.html';
check('blog/index.html exists', () => exists('blog/index.html'));
check('blog/_template-article.html exists', () => exists('blog/_template-article.html'));
check('blog/feed.xml exists', () => exists('blog/feed.xml'));
check('article 1 exists', () => exists(ART_REL));
check('article : canonical vers /blog/<slug>/', () =>
  contains(ART_REL, 'rel="canonical" href="https://www.parrottalk.app/blog/how-i-built-an-ielts-site-with-ai/"'));
check('article : og:type article', () => contains(ART_REL, 'property="og:type" content="article"'));
check('article : JSON-LD Article', () => contains(ART_REL, '"@type": "Article"'));
check('article : JSON-LD BreadcrumbList', () => contains(ART_REL, '"@type": "BreadcrumbList"'));
check('article : lien RSS alternate', () => contains(ART_REL, 'type="application/rss+xml"'));
check('article : auteur Xavier, founder of ParrotTalk', () => contains(ART_REL, 'Xavier, founder of ParrotTalk'));
check('article : lien produit mockexam', () => contains(ART_REL, 'href="/mockexam.html"'));
check('article : lien produit quickmock', () => contains(ART_REL, 'href="/quickmock.html"'));
check('article : temps de lecture en dur', () => contains(ART_REL, 'min read'));
check('article : image d\'article en petite figure flottee', () =>
  contains(ART_REL, 'article-figure') && contains(ART_REL, 'img/blog/how-i-built-an-ielts-site-with-ai.webp'));
check('article : og:image = og jpg du blog', () => contains(ART_REL, 'img/blog/how-i-built-an-ielts-site-with-ai-og.jpg'));
check('image article webp existe', () => exists('img/blog/how-i-built-an-ielts-site-with-ai.webp'));
check('vignette card webp existe', () => exists('img/blog/how-i-built-an-ielts-site-with-ai-card.webp'));
check('og jpg existe', () => exists('img/blog/how-i-built-an-ielts-site-with-ai-og.jpg'));
check('index blog : vignette pointe -card.webp', () =>
  contains('blog/index.html', 'post__thumb') && contains('blog/index.html', 'how-i-built-an-ielts-site-with-ai-card.webp'));
check('deux photos distinctes (vignette -card != image article)', () => {
  const idx = fs.readFileSync(path.join(root, 'blog/index.html'), 'utf8');
  const art = fs.readFileSync(path.join(root, ART_REL), 'utf8');
  const idxThumb = /class="post__thumb"[\s\S]*?src="([^"]+)"/.exec(idx);
  const artFig = /class="article-figure"[\s\S]*?src="([^"]+)"/.exec(art);
  return idxThumb && artFig && idxThumb[1] !== artFig[1] && /-card\.webp$/.test(idxThumb[1]);
});
check('gabarit : 3 derives + regle photos distinctes', () =>
  contains('blog/_template-article.html', '{{SLUG}}.webp') &&
  contains('blog/_template-article.html', '{{SLUG}}-card.webp') &&
  contains('blog/_template-article.html', '{{SLUG}}-og.jpg') &&
  contains('blog/_template-article.html', 'DEUX photos differentes'));
// Wording : gratuite permanente/temporaire bannie sur tout le HTML du blog
check('blog : aucune formule "free forever"', () => {
  const files = ['blog/index.html', 'blog/_template-article.html', ART_REL];
  return files.every(f => !/free forever|always free|forever free/i.test(fs.readFileSync(path.join(root, f), 'utf8')));
});
check('blog : aucune formule "for now"', () => {
  const files = ['blog/index.html', 'blog/_template-article.html', ART_REL];
  return files.every(f => !/\bfor now\b/i.test(fs.readFileSync(path.join(root, f), 'utf8')));
});
check('sitemap : contient l\'index blog', () => contains('sitemap.xml', 'https://www.parrottalk.app/blog/</loc>'));
check('sitemap : contient l\'article 1', () => contains('sitemap.xml', '/blog/how-i-built-an-ielts-site-with-ai/</loc>'));

console.log('\n[ Blog footer link on every public page ]');
['index.html','listening.html','reading.html','writing.html','speaking.html','dashboard.html',
 'writing-checker.html','quickmock.html','mockexam.html','faq.html','privacy.html','terms.html','legal-notice.html']
  .forEach(f => check(`${f} : footer links to blog/`, () => contains(f, 'href="blog/"')));

console.log(`\n${'='.repeat(30)}`);
console.log(`  ${passed} passed  |  ${failed} failed`);
console.log('='.repeat(30) + '\n');
process.exit(failed > 0 ? 1 : 0);
