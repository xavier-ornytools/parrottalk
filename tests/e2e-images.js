#!/usr/bin/env node
// Vérifie qu'aucune image affichée n'est cassée après le passage en WebP :
// charge chaque page (vrai Chrome), déclenche le lazy-load par défilement, et
// confirme que chaque <img src="img/..."> se décode (naturalWidth > 0) et
// qu'aucune réponse img/ ne renvoie une erreur HTTP.
//
// Prérequis : playwright-core ; Chrome ; serveur statique sur localhost:8000.
// Usage : node tests/e2e-images.js [chemin_vers_chrome]

const { chromium } = require('playwright-core');
const BASE_URL = process.env.PARROTTALK_TEST_URL || 'http://localhost:8000';
const CHROME_PATH = process.argv[2] || process.env.CHROME_PATH || '/usr/bin/google-chrome';

let passed = 0, failed = 0;
function check(label, ok) {
  if (ok) { console.log(`  ✅ ${label}`); passed++; }
  else    { console.log(`  ❌ ${label}`); failed++; }
}

const PAGES = ['index.html', 'listening.html', 'reading.html', 'writing.html',
  'speaking.html', 'dashboard.html', 'privacy.html', 'terms.html', 'legal-notice.html'];

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y <= h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
    // Attente déterministe : force le décodage de chaque image img/ (déclenche
    // le fetch des images lazy encore en attente) avant de vérifier.
    const imgs = Array.from(document.querySelectorAll('img')).filter(i => (i.getAttribute('src') || '').includes('img/'));
    await Promise.all(imgs.map(i => i.decode().catch(() => {})));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);
}

async function testPageImages(browser, path) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const httpErrors = [];
  page.on('response', r => { if (r.url().includes('/img/') && r.status() >= 400) httpErrors.push(`${r.status()} ${r.url()}`); });
  page.on('pageerror', err => console.log('  [JS ERROR]', err.message));

  await page.goto(`${BASE_URL}/${path}`);
  await scrollThrough(page);

  const imgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img'))
      .filter(im => im.getAttribute('src') && im.getAttribute('src').includes('img/'))
      .map(im => ({
        src: im.getAttribute('src'),
        webp: im.getAttribute('src').endsWith('.webp'),
        ok: im.complete && im.naturalWidth > 0,
        shown: im.offsetParent !== null || getComputedStyle(im).display !== 'none',
      }));
  });

  const broken = imgs.filter(i => !i.ok);
  const nonWebp = imgs.filter(i => !i.webp);
  check(`${path} : ${imgs.length} image(s) img/, toutes décodées (naturalWidth>0)`, imgs.length > 0 && broken.length === 0);
  check(`${path} : toutes en WebP`, nonWebp.length === 0);
  check(`${path} : aucune erreur HTTP sur img/`, httpErrors.length === 0);
  if (broken.length) console.log('     cassées :', broken.map(b => b.src).join(', '));
  if (httpErrors.length) console.log('     HTTP :', httpErrors.join(', '));

  await page.close();
}

async function main() {
  console.log('=== Vérification images WebP (vrai navigateur) ===');
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  try { for (const p of PAGES) await testPageImages(browser, p); }
  finally { await browser.close(); }
  console.log(`\n${'='.repeat(30)}\n  ${passed} passed  |  ${failed} failed\n${'='.repeat(30)}\n`);
  process.exit(failed > 0 ? 1 : 0);
}
main().catch(e => { console.error('ERREUR TEST:', e); process.exit(1); });
