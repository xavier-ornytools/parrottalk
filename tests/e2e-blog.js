#!/usr/bin/env node
/*
 * e2e-blog.js  (LOT 1 blog, 2026-07-19)
 *
 * Verifie l'infrastructure blog dans un vrai Chrome (playwright-core) :
 *   - /blog/ charge sans erreur JS, liste l'article, lien RSS present, canonical bon
 *   - l'article charge sans erreur JS, H1 + fil d'ariane, JSON-LD Article + BreadcrumbList
 *     valides, 1 a 2 liens produit en contexte (mockexam, quickmock)
 *   - le lien Blog du footer est present et pointe vers le blog sur TOUTES les pages publiques
 *   - le flux RSS /blog/feed.xml est un XML bien forme contenant l'article
 *   - /sitemap.xml contient l'index blog et l'article
 * Captures : tests/screenshots/blog/ aux largeurs 1280 et 390.
 *
 * Usage : node tests/e2e-blog.js   (serveur statique sur :8000)
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BASE = process.env.PARROTTALK_TEST_URL || 'http://127.0.0.1:8000';
const CHROME = process.argv[2] || process.env.CHROME_PATH || '/usr/bin/google-chrome';
const SHOT = path.join(__dirname, 'screenshots', 'blog');
const ART = 'blog/how-i-built-an-ielts-site-with-ai/';

let passed = 0, failed = 0;
const c = (l, ok, d) => { console.log((ok ? '  \x1b[32mPASS\x1b[0m ' : '  \x1b[31mFAIL\x1b[0m ') + l + (d ? ` \x1b[2m${d}\x1b[0m` : '')); ok ? passed++ : failed++; };

const PUBLIC_PAGES = ['index.html', 'listening.html', 'reading.html', 'writing.html', 'speaking.html',
  'dashboard.html', 'writing-checker.html', 'quickmock.html', 'mockexam.html',
  'faq.html', 'privacy.html', 'terms.html', 'legal-notice.html'];

async function main() {
  fs.mkdirSync(SHOT, { recursive: true });
  const b = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });

  // ── Index blog ────────────────────────────────────────────────────────────
  console.log('\n=== Index /blog/ ===');
  const page = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const idxErr = [];
  page.on('pageerror', e => idxErr.push(String(e)));
  await page.goto(`${BASE}/blog/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(200);
  const idx = await page.evaluate((art) => {
    const posts = Array.from(document.querySelectorAll('a.post'));
    const rss = document.querySelector('link[rel="alternate"][type="application/rss+xml"]');
    const canon = document.querySelector('link[rel="canonical"]');
    const thumb = document.querySelector('.post__thumb img');
    return {
      posts: posts.length,
      linksArticle: posts.some(a => (a.getAttribute('href') || '').includes(art)),
      rss: rss ? rss.getAttribute('href') : null,
      canon: canon ? canon.getAttribute('href') : null,
      h1: (document.querySelector('h1') || {}).textContent || '',
      cardImg: thumb ? thumb.getAttribute('src') : null,
    };
  }, ART);
  c('index blog : aucune erreur JS', idxErr.length === 0, idxErr[0] || '');
  c('index blog : au moins 1 article liste', idx.posts >= 1, `posts=${idx.posts}`);
  c('index blog : lien vers l\'article 1', idx.linksArticle);
  c('index blog : lien RSS present', /\/blog\/feed\.xml$/.test(idx.rss || ''), idx.rss || '');
  c('index blog : canonical = /blog/', idx.canon === 'https://www.parrottalk.app/blog/', idx.canon || '');
  c('index blog : carte avec vignette image webp', /\/img\/blog\/.+\.webp$/.test(idx.cardImg || ''), idx.cardImg || '');
  await page.screenshot({ path: path.join(SHOT, 'index-1280.png'), fullPage: true });
  const pm = await b.newPage({ viewport: { width: 390, height: 800 } });
  await pm.goto(`${BASE}/blog/`, { waitUntil: 'domcontentloaded' });
  await pm.waitForTimeout(150);
  const idxOverflow = await pm.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  c('index blog 390px : pas de debordement horizontal', idxOverflow <= 1, `overflow=${idxOverflow}`);
  await pm.screenshot({ path: path.join(SHOT, 'index-390.png'), fullPage: true });
  await pm.close();

  // ── Article ───────────────────────────────────────────────────────────────
  console.log('\n=== Article 1 ===');
  const ap = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const artErr = [];
  ap.on('pageerror', e => artErr.push(String(e)));
  await ap.goto(`${BASE}/${ART}`, { waitUntil: 'domcontentloaded' });
  await ap.waitForTimeout(200);
  const art = await ap.evaluate(() => {
    const lds = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s => {
      try { return JSON.parse(s.textContent); } catch (e) { return 'invalid'; }
    });
    const bodyLinks = Array.from(document.querySelectorAll('.article-body a')).map(a => a.getAttribute('href'));
    // Liens produit en prose = hors encart CTA (.article-cta), pour mesurer le bourrage reel.
    const proseLinks = Array.from(document.querySelectorAll('.article-body a'))
      .filter(a => !a.closest('.article-cta')).map(a => a.getAttribute('href'));
    const hero = document.querySelector('.article-hero img');
    const ogImg = document.querySelector('meta[property="og:image"]');
    const ldImg = (lds.find(l => l && l['@type'] === 'Article') || {}).image;
    return {
      h1: (document.querySelector('h1') || {}).textContent || '',
      crumbs: !!document.querySelector('.crumbs'),
      types: lds.map(l => (l && l['@type']) || 'invalid'),
      author: (lds.find(l => l && l['@type'] === 'Article') || {}).author,
      toMock: bodyLinks.some(h => (h || '').includes('mockexam.html')),
      toQuick: bodyLinks.some(h => (h || '').includes('quickmock.html')),
      hasCta: !!document.querySelector('.article-cta'),
      proseProductLinks: proseLinks.filter(h => /mockexam|quickmock|writing-checker/.test(h || '')).length,
      heroSrc: hero ? hero.getAttribute('src') : null,
      heroAlt: hero ? hero.getAttribute('alt') : null,
      ogImage: ogImg ? ogImg.getAttribute('content') : null,
      ldImage: ldImg || null,
    };
  });
  c('article : aucune erreur JS', artErr.length === 0, artErr[0] || '');
  c('article : H1 present', art.h1.length > 10, art.h1.slice(0, 48));
  c('article : fil d\'ariane present', art.crumbs);
  c('article : JSON-LD Article valide', art.types.includes('Article'));
  c('article : JSON-LD BreadcrumbList valide', art.types.includes('BreadcrumbList'));
  c('article : auteur = Xavier, founder of ParrotTalk',
    !!art.author && /Xavier, founder of ParrotTalk/.test(art.author.name || ''), (art.author || {}).name || '');
  c('article : lien produit vers mockexam', art.toMock);
  c('article : lien produit vers quickmock', art.toQuick);
  c('article : 1 a 2 liens produit en prose (anti bourrage)', art.proseProductLinks >= 1 && art.proseProductLinks <= 2, `prose=${art.proseProductLinks}`);
  c('article : 1 encart CTA produit', art.hasCta);
  c('article : image de tete presente (webp) + alt', /\/img\/blog\/.+\.webp$/.test(art.heroSrc || '') && (art.heroAlt || '').length > 8, art.heroSrc || '');
  c('article : og:image + JSON-LD image pointent l\'og du blog',
    /\/img\/blog\/.+-og\.jpg$/.test(art.ogImage || '') && art.ogImage === art.ldImage, art.ogImage || '');
  await ap.screenshot({ path: path.join(SHOT, 'article-1280.png'), fullPage: true });
  const am = await b.newPage({ viewport: { width: 390, height: 800 } });
  await am.goto(`${BASE}/${ART}`, { waitUntil: 'domcontentloaded' });
  await am.waitForTimeout(150);
  const artOverflow = await am.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  c('article 390px : pas de debordement horizontal', artOverflow <= 1, `overflow=${artOverflow}`);
  await am.screenshot({ path: path.join(SHOT, 'article-390.png'), fullPage: true });
  await am.close();

  // ── Lien Blog du footer sur toutes les pages publiques ─────────────────────
  console.log('\n=== Lien Blog du footer (toutes pages publiques) ===');
  for (const p of PUBLIC_PAGES) {
    const fp = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await fp.goto(`${BASE}/${p}`, { waitUntil: 'domcontentloaded' });
    const hasBlog = await fp.evaluate(() => {
      const links = Array.from(document.querySelectorAll('footer a, .footer a'));
      return links.some(a => {
        const h = a.getAttribute('href') || '';
        return /(^|\/)blog\/?$/.test(h) && /blog/i.test(a.textContent || '');
      });
    });
    c(`${p} : footer contient un lien Blog`, hasBlog);
    await fp.close();
  }

  // ── RSS + sitemap ──────────────────────────────────────────────────────────
  // On recupere le texte brut en same-origin (fetch depuis une page du site) puis
  // on parse avec DOMParser : robuste, independant de la facon dont le navigateur
  // rend une navigation directe vers un .xml.
  console.log('\n=== RSS + sitemap ===');
  const rp = await b.newPage();
  await rp.goto(`${BASE}/blog/`, { waitUntil: 'domcontentloaded' });
  const feed = await rp.evaluate(async () => {
    const r = await fetch('/blog/feed.xml');
    const txt = await r.text();
    const doc = new DOMParser().parseFromString(txt, 'application/xml');
    return {
      status: r.status,
      wellFormed: !doc.querySelector('parsererror'),
      isRss: doc.documentElement && doc.documentElement.nodeName.toLowerCase() === 'rss',
      hasArticle: txt.includes('how-i-built-an-ielts-site-with-ai'),
    };
  });
  c('feed.xml : HTTP 200', feed.status === 200, `status=${feed.status}`);
  c('feed.xml : XML RSS bien forme', feed.wellFormed && feed.isRss);
  c('feed.xml : contient l\'article 1', feed.hasArticle);

  const smap = await rp.evaluate(async () => {
    const r = await fetch('/sitemap.xml');
    const txt = await r.text();
    const doc = new DOMParser().parseFromString(txt, 'application/xml');
    const locs = Array.from(doc.querySelectorAll('loc')).map(n => n.textContent || '');
    return {
      status: r.status,
      wellFormed: !doc.querySelector('parsererror'),
      hasIndex: locs.some(l => l.endsWith('/blog/')),
      hasArticle: locs.some(l => l.includes('/blog/how-i-built-an-ielts-site-with-ai/')),
    };
  });
  c('sitemap.xml : HTTP 200', smap.status === 200, `status=${smap.status}`);
  c('sitemap.xml : bien forme + index blog + article', smap.wellFormed && smap.hasIndex && smap.hasArticle);

  console.log('\n=== Ressources image ===');
  // On verifie le vrai decodage image (naturalWidth) plutot que le content-type :
  // le serveur de dev Python renvoie application/octet-stream pour .webp, mais le
  // navigateur (et Vercel en prod) decode correctement. Poids controle via fetch.
  const imgs = await rp.evaluate(async () => {
    const decode = (src) => new Promise(res => {
      const im = new Image();
      im.onload = () => res({ ok: true, w: im.naturalWidth });
      im.onerror = () => res({ ok: false, w: 0 });
      im.src = src;
    });
    const hero = await fetch('/img/blog/how-i-built-an-ielts-site-with-ai.webp');
    const og = await fetch('/img/blog/how-i-built-an-ielts-site-with-ai-og.jpg');
    const heroBytes = (await hero.arrayBuffer()).byteLength;
    const ogBytes = (await og.arrayBuffer()).byteLength;
    const heroDec = await decode('/img/blog/how-i-built-an-ielts-site-with-ai.webp');
    const ogDec = await decode('/img/blog/how-i-built-an-ielts-site-with-ai-og.jpg');
    return { heroStatus: hero.status, heroBytes, heroDec, ogStatus: og.status, ogBytes, ogDec };
  });
  c('hero webp : 200 + image decodee + poids web (<200k)',
    imgs.heroStatus === 200 && imgs.heroDec.ok && imgs.heroDec.w > 0 && imgs.heroBytes < 200000,
    `${Math.round(imgs.heroBytes/1024)}k ${imgs.heroDec.w}px`);
  c('og jpg : 200 + image decodee 1200px + poids web (<300k)',
    imgs.ogStatus === 200 && imgs.ogDec.ok && imgs.ogDec.w === 1200 && imgs.ogBytes < 300000,
    `${Math.round(imgs.ogBytes/1024)}k ${imgs.ogDec.w}px`);
  await rp.close();

  await b.close();
  console.log('\n────────────────────────────────────────');
  const verdict = failed === 0 ? '\x1b[32m✅ VERDICT : PASS\x1b[0m' : '\x1b[31m❌ VERDICT : FAIL\x1b[0m';
  console.log(`${verdict}  (${passed} PASS, ${failed} FAIL)`);
  console.log(`\x1b[2mCaptures : ${SHOT}\x1b[0m\n`);
  process.exit(failed ? 1 : 0);
}
main().catch(e => { console.error('ERREUR:', e); process.exit(1); });
