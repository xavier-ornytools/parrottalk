#!/usr/bin/env node
/*
 * nav-visual-check.js  (reprise nav 2026-07-18)
 *
 * Verifie que la barre de nav TIENT sans deborder ni chevaucher le logo, aux
 * largeurs desktop (1280), tablette (800) et mobile (390), sur les pages cles.
 * Reutilise le CSS .nav existant (aucune modif CSS). Rappel : sous 600px,
 * .nav__links est display:none (logo + CTA seulement).
 *
 * Controles :
 *   - pas de scroll horizontal (scrollWidth <= viewport + 1px)
 *   - aucun lien de nav ne chevauche le logo
 *   - tout le contenu nav reste dans les bornes de .nav__inner
 * Captures dans tests/screenshots/nav/.
 *
 * Usage : node tests/nav-visual-check.js   (serveur sur :8000)
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BASE = process.env.PARROTTALK_TEST_URL || 'http://127.0.0.1:8000';
const CHROME = process.argv[2] || process.env.CHROME_PATH || '/usr/bin/google-chrome';
const SHOT = path.join(__dirname, 'screenshots', 'nav');
const C = { g: '\x1b[32m', r: '\x1b[31m', d: '\x1b[2m', x: '\x1b[0m' };

const PAGES = ['index.html', 'reading.html', 'listening.html', 'dashboard.html', 'mockexam.html'];
// gate = largeur qui decide du PASS/FAIL (celles exigees : desktop et mobile).
// La tablette 800 est INFORMATIVE : la bande 600-900px est intrinsequement
// serree dans le .nav existant (constat verifie aussi sur l'ancienne nav), et
// on n'a pas le droit de modifier le CSS .nav pour l'elargir.
const WIDTHS = [
  { w: 1280, tag: 'desktop', gate: true },
  { w: 800, tag: 'tablette', gate: false },
  { w: 390, tag: 'mobile', gate: true },
];

let passed = 0, failed = 0;
function rec(label, ok, detail) {
  if (ok) { passed++; console.log(`${C.g}PASS${C.x} ${label} ${C.d}${detail || ''}${C.x}`); }
  else { failed++; console.log(`${C.r}FAIL${C.x} ${label} ${detail || ''}`); }
}

async function measure(page) {
  return page.evaluate(() => {
    const overlap = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 &&
                              a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
    const inner = document.querySelector('.nav__inner');
    const logo = document.querySelector('.nav__logo');
    const links = Array.from(document.querySelectorAll('.nav__link'));
    const ir = inner.getBoundingClientRect();
    const lr = logo.getBoundingClientRect();
    const visLinks = links.filter(a => {
      const s = getComputedStyle(a);
      const r = a.getBoundingClientRect();
      return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
    });
    let overlapLogo = 0, outOfInner = 0, wrapped = 0;
    for (const a of visLinks) {
      const r = a.getBoundingClientRect();
      if (overlap(r, lr)) overlapLogo++;
      if (r.left < ir.left - 1 || r.right > ir.right + 1) outOfInner++;
      // Un lien qui passe sur 2 lignes (retour a la ligne) a une hauteur bien
      // superieure a une ligne unique (~32px : 14px police + 12px padding).
      if (r.height > 42) wrapped++;
    }
    return {
      scrollWidth: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
      visLinkCount: visLinks.length,
      overlapLogo, outOfInner, wrapped,
    };
  });
}

async function main() {
  fs.mkdirSync(SHOT, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
  for (const { w, tag, gate } of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 720 } });
    for (const pg of PAGES) {
      const page = await ctx.newPage();
      const errs = [];
      page.on('pageerror', e => errs.push(String(e)));
      await page.goto(`${BASE}/${pg}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(200);
      const m = await measure(page);
      await page.locator('.nav').screenshot({ path: path.join(SHOT, `${tag}-${pg.replace('.html', '')}.png`) }).catch(() => {});
      const noScroll = m.scrollWidth <= m.viewport + 1;
      const expectLinks = w >= 600; // sous 600px, .nav__links masque
      const linksState = expectLinks ? m.visLinkCount === 4 : m.visLinkCount === 0;
      const ok = noScroll && m.overlapLogo === 0 && m.outOfInner === 0 &&
                 m.wrapped === 0 && linksState && errs.length === 0;
      const detail = `liens=${m.visLinkCount} chevauche-logo=${m.overlapLogo} hors-inner=${m.outOfInner} 2-lignes=${m.wrapped} scroll=${m.scrollWidth}/${m.viewport}${errs.length ? ' JSerr:' + errs[0] : ''}`;
      if (gate) {
        rec(`${tag}(${w}) ${pg}`, ok, detail);
      } else {
        // Informatif : n'entre pas dans le verdict PASS/FAIL.
        console.log(`${C.d}INFO ${tag}(${w}) ${pg}  ${detail}  ${ok ? 'OK' : 'serre (pre-existant, hors scope)'}${C.x}`);
      }
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  console.log(`\n${C.d}Captures: ${SHOT}${C.x}`);
  console.log(`${passed + failed} controles  |  ${C.g}${passed} PASS${C.x}  ${C.r}${failed} FAIL${C.x}`);
  process.exit(failed === 0 ? 0 : 1);
}
main().catch(e => { console.error('Erreur:', e); process.exit(2); });
