#!/usr/bin/env node
// Vérifie les liens sociaux du footer (vrai Chrome) : 5 liens (YouTube + X + Reddit
// + Instagram + TikTok) avec href corrects, target=_blank, rel noopener/noreferrer,
// SVG VISIBLE et de taille lisible (>= 28px), sur toutes les pages de contenu ;
// + JSON-LD Organization valide avec sameAs (YouTube + X + Reddit + Instagram + TikTok)
// sur l'accueil ; + rendu mobile 375px (icônes lisibles, zone cliquable confortable,
// pas de débordement horizontal).
const { chromium } = require('playwright-core');
const BASE = process.env.PARROTTALK_TEST_URL || 'http://localhost:8000';
const CHROME = process.argv[2] || '/usr/bin/google-chrome';
let passed = 0, failed = 0;
const c = (l, ok) => { console.log((ok ? '  \x1b[32mPASS\x1b[0m ' : '  \x1b[31mFAIL\x1b[0m ') + l); ok ? passed++ : failed++; };

const PAGES = ['index.html', 'listening.html', 'reading.html', 'writing.html', 'speaking.html',
  'dashboard.html', 'privacy.html', 'terms.html', 'legal-notice.html'];

const MIN_ICON = 28;   // taille minimale lisible demandée
const MIN_TARGET = 40; // zone cliquable tactile confortable

async function readFooter(page) {
  return page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('.footer-social a'));
    return links.map(a => {
      const svg = a.querySelector('svg');
      const sr = svg ? svg.getBoundingClientRect() : { width: 0, height: 0 };
      const ar = a.getBoundingClientRect();
      return {
        href: a.getAttribute('href'), target: a.getAttribute('target'), rel: a.getAttribute('rel'),
        hasSvg: !!svg, shown: a.offsetParent !== null,
        iconW: Math.round(sr.width), iconH: Math.round(sr.height),
        tapW: Math.round(ar.width), tapH: Math.round(ar.height),
      };
    });
  });
}

async function main() {
  const b = await chromium.launch({ executablePath: CHROME, headless: true });

  // ── Desktop ─────────────────────────────────────────────────────────────────
  console.log('\n=== Desktop (1200px) : 3 icônes lisibles sur chaque page ===');
  const page = await b.newPage({ viewport: { width: 1200, height: 900 } });
  page.on('pageerror', e => console.log('  [JS ERROR]', e.message));
  for (const p of PAGES) {
    await page.goto(`${BASE}/${p}`);
    const info = await readFooter(page);
    const yt = info.find(i => (i.href || '').includes('youtube.com/@ParrotTalkApp'));
    const x = info.find(i => (i.href || '').includes('x.com/ParrotTalkApp'));
    const rd = info.find(i => (i.href || '').includes('reddit.com/user/ParrotTalkApp'));
    const ig = info.find(i => (i.href || '').includes('instagram.com/parrottalkapp'));
    const tt = info.find(i => (i.href || '').includes('tiktok.com/@parrottalk.app'));
    const relOk = info.every(i => (i.rel || '').includes('noopener') && (i.rel || '').includes('noreferrer'));
    const tgtOk = info.every(i => i.target === '_blank');
    const svgOk = info.every(i => i.hasSvg && i.shown);
    const sizeOk = info.every(i => i.iconW >= MIN_ICON && i.iconH >= MIN_ICON);
    c(`${p} : 5 liens (YouTube + X + Reddit + Instagram + TikTok)`, info.length === 5 && yt && x && rd && ig && tt);
    c(`${p} : target=_blank + rel noopener/noreferrer`, relOk && tgtOk);
    c(`${p} : SVG visibles et >= ${MIN_ICON}px (rendu ${info[0] ? info[0].iconW : 0}px)`, svgOk && sizeOk);
  }

  // JSON-LD sur l'accueil
  await page.goto(`${BASE}/index.html`);
  const ld = await page.evaluate(() => {
    const s = document.querySelector('script[type="application/ld+json"]');
    if (!s) return null;
    try { return JSON.parse(s.textContent); } catch (e) { return 'invalid'; }
  });
  c('Accueil : JSON-LD Organization valide', ld && ld !== 'invalid' && ld['@type'] === 'Organization');
  c('Accueil : sameAs vers YouTube + X + Reddit + Instagram + TikTok', ld && Array.isArray(ld.sameAs) &&
    ld.sameAs.some(u => u.includes('youtube')) && ld.sameAs.some(u => u.includes('x.com')) &&
    ld.sameAs.some(u => u.includes('reddit')) && ld.sameAs.some(u => u.includes('instagram')) &&
    ld.sameAs.some(u => u.includes('tiktok')));

  // ── Mobile 375px ──────────────────────────────────────────────────────────────
  console.log('\n=== Mobile (375px) : lisibilité + pas de débordement ===');
  const m = await b.newPage({ viewport: { width: 375, height: 720 }, deviceScaleFactor: 2 });
  await m.goto(`${BASE}/index.html`);
  const minfo = await readFooter(m);
  const mSize = minfo.every(i => i.iconW >= MIN_ICON && i.iconH >= MIN_ICON);
  const mTap = minfo.every(i => i.tapW >= MIN_TARGET && i.tapH >= MIN_TARGET);
  const overflow = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  c(`375px : 5 icônes présentes`, minfo.length === 5);
  c(`375px : icônes >= ${MIN_ICON}px sans zoomer (rendu ${minfo[0] ? minfo[0].iconW : 0}px)`, mSize);
  c(`375px : zone cliquable >= ${MIN_TARGET}px (rendu ${minfo[0] ? minfo[0].tapW : 0}px)`, mTap);
  c(`375px : pas de débordement horizontal (overflow ${overflow}px)`, overflow <= 0);

  await b.close();
  console.log('\n────────────────────────────────────────');
  const verdict = failed === 0 ? '\x1b[32m✅ VERDICT : PASS\x1b[0m' : '\x1b[31m❌ VERDICT : FAIL\x1b[0m';
  console.log(`${verdict}  (${passed} PASS, ${failed} FAIL)\n`);
  process.exit(failed ? 1 : 0);
}
main().catch(e => { console.error('ERREUR:', e); process.exit(1); });
