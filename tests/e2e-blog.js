#!/usr/bin/env node
/*
 * e2e-blog.js  (blog, LOT 1 puis LOT 3 : 5 articles)
 *
 * Verifie l'infrastructure blog et les 10 articles dans un vrai Chrome :
 *   - /blog/ charge, liste 10 cartes, chaque carte a une vignette -card.webp PETITE (<= 1/4 de la carte)
 *   - chaque article charge sans erreur JS, H1 + fil d'ariane, JSON-LD Article + BreadcrumbList,
 *     auteur, image d'article -<slug>.webp, og:image/twitter/JSON-LD = -<slug>-og.jpg,
 *     1 a 2 liens produit en prose (anti-bourrage)
 *   - DEUX photos differentes par article (vignette != image) et AUCUNE reutilisee ailleurs sur le blog
 *   - lien Blog du footer sur toutes les pages publiques
 *   - feed.xml et sitemap.xml bien formes et contenant les 10 articles
 *   - ressources image (10 webp + 5 og) : 200, decodees, poids web
 * Captures : tests/screenshots/blog/ (index + un article, 1280 et 390).
 *
 * Usage : node tests/e2e-blog.js   (serveur statique sur :8000)
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BASE = process.env.PARROTTALK_TEST_URL || 'http://127.0.0.1:8000';
const CHROME = process.argv[2] || process.env.CHROME_PATH || '/usr/bin/google-chrome';
const SHOT = path.join(__dirname, 'screenshots', 'blog');

// Ordre antechronologique attendu dans l'index (le plus recent en premier).
const ARTICLES = [
  'making-sure-we-grade-what-you-wrote',
  'never-lose-an-essay-again',
  'when-assistants-started-recommending-us',
  'giving-each-speaker-a-different-voice',
  'putting-the-exam-clock-on-listening',
  'when-someone-skips-a-question',
  'free-ielts-practice-vietnam-bangladesh-pakistan-uzbekistan',
  'ai-checker-for-ielts-writing-task-2',
  'free-ielts-mock-test-explained',
  'moving-the-ai-off-the-browser',
  'opening-the-doors-beta',
  'rewriting-the-faq-around-proof',
  'starting-to-measure',
  'the-day-a-passing-test-lied-to-me',
  'never-losing-your-progress',
  'the-honesty-pass',
  'ten-bugs-and-one-section-at-a-time',
  'teaching-a-parrot-to-grade-a-voice',
  'how-our-scoring-works',
  'how-i-built-an-ielts-site-with-ai',
];
const SHOT_ARTICLE = 'how-our-scoring-works';

let passed = 0, failed = 0;
const c = (l, ok, d) => { console.log((ok ? '  \x1b[32mPASS\x1b[0m ' : '  \x1b[31mFAIL\x1b[0m ') + l + (d ? ` \x1b[2m${d}\x1b[0m` : '')); ok ? passed++ : failed++; };

const PUBLIC_PAGES = ['index.html', 'listening.html', 'reading.html', 'writing.html', 'speaking.html',
  'dashboard.html', 'writing-checker.html', 'quickmock.html', 'mockexam.html',
  'faq.html', 'privacy.html', 'terms.html', 'legal-notice.html'];

const base = s => (s || '').split('/').pop();

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
  const idx = await page.evaluate(() => {
    const posts = Array.from(document.querySelectorAll('a.post'));
    const rss = document.querySelector('link[rel="alternate"][type="application/rss+xml"]');
    const canon = document.querySelector('link[rel="canonical"]');
    return {
      count: posts.length,
      cards: posts.map(a => ({
        href: a.getAttribute('href'),
        thumb: (a.querySelector('.post__thumb img') || {}).getAttribute ? a.querySelector('.post__thumb img').getAttribute('src') : null,
      })),
      rss: rss ? rss.getAttribute('href') : null,
      canon: canon ? canon.getAttribute('href') : null,
    };
  });
  c('index blog : aucune erreur JS', idxErr.length === 0, idxErr[0] || '');
  c(`index blog : ${ARTICLES.length} cartes listees`, idx.count === ARTICLES.length, `count=${idx.count}`);
  c('index blog : lien RSS present', /\/blog\/feed\.xml$/.test(idx.rss || ''));
  c('index blog : canonical = /blog/', idx.canon === 'https://www.parrottalk.app/blog/');
  c('index blog : chaque carte a une vignette -card.webp', idx.cards.every(c => /\/img\/blog\/.+-card\.webp$/.test(c.thumb || '')),
    idx.cards.map(c => base(c.thumb)).join(', '));
  c('index blog : ordre antechronologique', idx.cards.map(c => (c.href || '').replace(/\/blog\/|\//g, '')).slice(0, ARTICLES.length).join(',') === ARTICLES.join(','),
    idx.cards.map(c => (c.href || '').split('/').filter(Boolean).pop()).join(','));
  // Garde-fou taille de vignette (article 1 : la banniere avait ete refusee).
  const thumbGeo = await page.evaluate(() => {
    const card = document.querySelector('.post');
    const thumb = document.querySelector('.post__thumb');
    if (!card || !thumb) return null;
    const cw = card.getBoundingClientRect().width, tw = thumb.getBoundingClientRect().width;
    return { cardW: Math.round(cw), thumbW: Math.round(tw), ratio: tw / cw };
  });
  c('index blog : vignette petite (<= 1/4 de la carte)', thumbGeo && thumbGeo.thumbW <= 160 && thumbGeo.ratio <= 0.25,
    thumbGeo ? `${thumbGeo.thumbW}px / ${thumbGeo.cardW}px = ${(thumbGeo.ratio * 100).toFixed(0)}%` : 'introuvable');
  await page.screenshot({ path: path.join(SHOT, 'index-1280.png'), fullPage: true });
  const pm = await b.newPage({ viewport: { width: 390, height: 800 } });
  await pm.goto(`${BASE}/blog/`, { waitUntil: 'domcontentloaded' });
  await pm.waitForTimeout(150);
  const idxOverflow = await pm.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  c('index blog 390px : pas de debordement horizontal', idxOverflow <= 1, `overflow=${idxOverflow}`);
  await pm.screenshot({ path: path.join(SHOT, 'index-390.png'), fullPage: true });
  await pm.close();

  const cardBySlug = {};
  idx.cards.forEach(c => { const s = (c.href || '').split('/').filter(Boolean).pop(); cardBySlug[s] = base(c.thumb); });

  // ── Chaque article ──────────────────────────────────────────────────────────
  const heroBySlug = {};
  for (const slug of ARTICLES) {
    console.log(`\n=== Article ${slug} ===`);
    const ap = await b.newPage({ viewport: { width: 1280, height: 900 } });
    const errs = [];
    ap.on('pageerror', e => errs.push(String(e)));
    await ap.goto(`${BASE}/blog/${slug}/`, { waitUntil: 'domcontentloaded' });
    await ap.waitForTimeout(150);
    const a = await ap.evaluate(() => {
      const lds = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s => {
        try { return JSON.parse(s.textContent); } catch (e) { return 'invalid'; }
      });
      const art = lds.find(l => l && l['@type'] === 'Article') || {};
      const hero = document.querySelector('.article-figure img');
      const og = document.querySelector('meta[property="og:image"]');
      const tw = document.querySelector('meta[name="twitter:image"]');
      const proseLinks = Array.from(document.querySelectorAll('.article-body a'))
        .filter(x => !x.closest('.article-cta')).map(x => x.getAttribute('href'));
      const PROD = /(mockexam|quickmock|writing-checker|speaking|listening|reading|writing|dashboard|faq)\.html|^\/$/;
      return {
        h1len: ((document.querySelector('h1') || {}).textContent || '').length,
        crumbs: !!document.querySelector('.crumbs'),
        types: lds.map(l => (l && l['@type']) || 'x'),
        author: (art.author || {}).name || '',
        heroSrc: hero ? hero.getAttribute('src') : null,
        heroAlt: hero ? hero.getAttribute('alt') : null,
        ogImage: og ? og.getAttribute('content') : null,
        twImage: tw ? tw.getAttribute('content') : null,
        ldImage: art.image || null,
        proseProd: proseLinks.filter(h => PROD.test(h || '')).length,
        hasCta: !!document.querySelector('.article-cta'),
        readMin: /(\d+) min read/.test(document.body.textContent) ? RegExp.$1 : null,
      };
    });
    c(`${slug} : aucune erreur JS`, errs.length === 0, errs[0] || '');
    c(`${slug} : H1 + fil d'ariane`, a.h1len > 10 && a.crumbs);
    c(`${slug} : JSON-LD Article + BreadcrumbList`, a.types.includes('Article') && a.types.includes('BreadcrumbList'));
    c(`${slug} : auteur Xavier, founder of ParrotTalk`, /Xavier, founder of ParrotTalk/.test(a.author));
    c(`${slug} : image d'article /img/blog/${slug}.webp + alt`,
      a.heroSrc === `/img/blog/${slug}.webp` && (a.heroAlt || '').length > 8, a.heroSrc || '');
    c(`${slug} : og + twitter + JSON-LD image = -og.jpg coherents`,
      a.ogImage === `https://www.parrottalk.app/img/blog/${slug}-og.jpg` && a.ogImage === a.twImage && a.ogImage === a.ldImage,
      a.ogImage || '');
    c(`${slug} : 1 a 2 liens produit en prose`, a.proseProd >= 1 && a.proseProd <= 2, `prose=${a.proseProd}`);
    c(`${slug} : encart CTA present`, a.hasCta);
    heroBySlug[slug] = base(a.heroSrc);
    if (slug === SHOT_ARTICLE) {
      await ap.screenshot({ path: path.join(SHOT, 'article-1280.png'), fullPage: true });
      const am = await b.newPage({ viewport: { width: 390, height: 800 } });
      await am.goto(`${BASE}/blog/${slug}/`, { waitUntil: 'domcontentloaded' });
      await am.waitForTimeout(150);
      const ov = await am.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      c(`${slug} 390px : pas de debordement horizontal`, ov <= 1, `overflow=${ov}`);
      await am.screenshot({ path: path.join(SHOT, 'article-390.png'), fullPage: true });
      await am.close();
    }
    await ap.close();
  }

  // ── Regle photos : 2 differentes par article, aucune reutilisee sur le blog ──
  console.log('\n=== Regle des photos ===');
  let twoDiff = true;
  for (const slug of ARTICLES) {
    if (!cardBySlug[slug] || !heroBySlug[slug] || cardBySlug[slug] === heroBySlug[slug]) twoDiff = false;
  }
  c('chaque article : vignette != image (2 photos differentes)', twoDiff,
    ARTICLES.map(s => `${s}:${cardBySlug[s]}|${heroBySlug[s]}`).join('  '));
  const allPhotos = [...Object.values(cardBySlug), ...Object.values(heroBySlug)];
  c('aucune photo reutilisee ailleurs sur le blog (20 fichiers distincts)',
    new Set(allPhotos).size === allPhotos.length, `${new Set(allPhotos).size}/${allPhotos.length} distincts`);

  // ── Lien Blog du footer sur toutes les pages publiques ──────────────────────
  console.log('\n=== Lien Blog du footer ===');
  for (const p of PUBLIC_PAGES) {
    const fp = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await fp.goto(`${BASE}/${p}`, { waitUntil: 'domcontentloaded' });
    const hasBlog = await fp.evaluate(() => Array.from(document.querySelectorAll('footer a, .footer a'))
      .some(a => /(^|\/)blog\/?$/.test(a.getAttribute('href') || '') && /blog/i.test(a.textContent || '')));
    c(`${p} : footer contient un lien Blog`, hasBlog);
    await fp.close();
  }

  // ── RSS + sitemap + ressources image ────────────────────────────────────────
  console.log('\n=== RSS + sitemap + images ===');
  const rp = await b.newPage();
  await rp.goto(`${BASE}/blog/`, { waitUntil: 'domcontentloaded' });
  const data = await rp.evaluate(async (arts) => {
    const decode = (src) => new Promise(res => { const im = new Image(); im.onload = () => res(im.naturalWidth); im.onerror = () => res(0); im.src = src; });
    const feedTxt = await (await fetch('/blog/feed.xml')).text();
    const feedDoc = new DOMParser().parseFromString(feedTxt, 'application/xml');
    const smTxt = await (await fetch('/sitemap.xml')).text();
    const smDoc = new DOMParser().parseFromString(smTxt, 'application/xml');
    const locs = Array.from(smDoc.querySelectorAll('loc')).map(n => n.textContent || '');
    const imgs = {};
    for (const s of arts) {
      for (const suffix of ['.webp', '-card.webp']) {
        const r = await fetch(`/img/blog/${s}${suffix}`); const bytes = (await r.arrayBuffer()).byteLength;
        imgs[s + suffix] = { status: r.status, w: await decode(`/img/blog/${s}${suffix}`), bytes };
      }
      const ro = await fetch(`/img/blog/${s}-og.jpg`); const ob = (await ro.arrayBuffer()).byteLength;
      imgs[s + '-og.jpg'] = { status: ro.status, w: await decode(`/img/blog/${s}-og.jpg`), bytes: ob };
    }
    return {
      feedOk: !feedDoc.querySelector('parsererror') && feedDoc.documentElement.nodeName.toLowerCase() === 'rss',
      feedHas: arts.every(s => feedTxt.includes(`/blog/${s}/`)),
      smOk: !smDoc.querySelector('parsererror'),
      smHas: locs.some(l => l.endsWith('/blog/')) && arts.every(s => locs.some(l => l.includes(`/blog/${s}/`))),
      imgs,
    };
  }, ARTICLES);
  c('feed.xml : RSS bien forme + les 10 articles', data.feedOk && data.feedHas);
  c('sitemap.xml : bien forme + index blog + les 10 articles', data.smOk && data.smHas);
  const imgEntries = Object.entries(data.imgs);
  const imgOk = imgEntries.every(([k, v]) => v.status === 200 && v.w > 0 && v.bytes < 300000);
  c('images blog : 30 fichiers 200 + decodes + poids web (<300k)', imgOk,
    `${imgEntries.filter(([k, v]) => v.status === 200 && v.w > 0).length}/${imgEntries.length} ok`);
  await rp.close();

  await b.close();
  console.log('\n────────────────────────────────────────');
  const verdict = failed === 0 ? '\x1b[32m✅ VERDICT : PASS\x1b[0m' : '\x1b[31m❌ VERDICT : FAIL\x1b[0m';
  console.log(`${verdict}  (${passed} PASS, ${failed} FAIL)`);
  console.log(`\x1b[2mCaptures : ${SHOT}\x1b[0m\n`);
  process.exit(failed ? 1 : 0);
}
main().catch(e => { console.error('ERREUR:', e); process.exit(1); });
