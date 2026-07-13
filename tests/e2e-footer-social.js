#!/usr/bin/env node
// Vérifie les liens sociaux du footer (vrai Chrome) : 2 liens (YouTube + X) avec
// href corrects, target=_blank, rel noopener/noreferrer, SVG visible, sur toutes
// les pages de contenu ; + JSON-LD Organization valide sur l'accueil.
const { chromium } = require('playwright-core');
const BASE = process.env.PARROTTALK_TEST_URL || 'http://localhost:8000';
const CHROME = process.argv[2] || '/usr/bin/google-chrome';
let passed = 0, failed = 0;
const c = (l, ok) => { console.log((ok ? '  ✅ ' : '  ❌ ') + l); ok ? passed++ : failed++; };

const PAGES = ['index.html', 'listening.html', 'reading.html', 'writing.html', 'speaking.html',
  'dashboard.html', 'privacy.html', 'terms.html', 'legal-notice.html'];

async function main() {
  const b = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await b.newPage({ viewport: { width: 1200, height: 900 } });
  page.on('pageerror', e => console.log('  [JS ERROR]', e.message));
  for (const p of PAGES) {
    await page.goto(`${BASE}/${p}`);
    const info = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('.footer-social a'));
      return links.map(a => ({
        href: a.getAttribute('href'), target: a.getAttribute('target'),
        rel: a.getAttribute('rel'), hasSvg: !!a.querySelector('svg'),
        shown: a.offsetParent !== null,
      }));
    });
    const yt = info.find(i => (i.href || '').includes('youtube.com/@ParrotTalkApp'));
    const x = info.find(i => (i.href || '').includes('x.com/ParrotTalkApp'));
    const relOk = info.every(i => (i.rel || '').includes('noopener') && (i.rel || '').includes('noreferrer'));
    const tgtOk = info.every(i => i.target === '_blank');
    const svgOk = info.every(i => i.hasSvg && i.shown);
    c(`${p} : 2 liens (YouTube + X)`, info.length === 2 && yt && x);
    c(`${p} : target=_blank + rel noopener/noreferrer`, relOk && tgtOk);
    c(`${p} : SVG visibles`, svgOk);
  }
  // JSON-LD sur l'accueil
  await page.goto(`${BASE}/index.html`);
  const ld = await page.evaluate(() => {
    const s = document.querySelector('script[type="application/ld+json"]');
    if (!s) return null;
    try { return JSON.parse(s.textContent); } catch (e) { return 'invalid'; }
  });
  c('Accueil : JSON-LD Organization valide', ld && ld !== 'invalid' && ld['@type'] === 'Organization');
  c('Accueil : sameAs vers YouTube + X', ld && Array.isArray(ld.sameAs) &&
    ld.sameAs.some(u => u.includes('youtube')) && ld.sameAs.some(u => u.includes('x.com')));
  await b.close();
  console.log(`\n  ${passed} passed | ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
}
main().catch(e => { console.error('ERREUR:', e); process.exit(1); });
