#!/usr/bin/env node
/*
 * e2e-mockexam.js  (2026-07-18)
 *
 * Verifie la porte d'entree de l'examen complet, mockexam.html :
 *   - la page charge sans erreur JS ;
 *   - les 4 cartes de sections informatives sont rendues ;
 *   - le lien nav "Mock Exam" est actif sur la page ;
 *   - un clic REEL sur "Start Full Mock Exam" lance l'examen : pt_mock.active
 *     devient vrai ET on arrive sur listening.html?mock=1 (mecanisme ExamFlow
 *     existant, non modifie) ;
 *   - en etat "mock en cours" (pt_mock.active injecte), la banniere reprendre /
 *     recommencer s'affiche ;
 *   - la carte "Real Exam Test" de index.html pointe vers mockexam.html.
 *
 * Usage : python3 -m http.server 8000 ; node tests/e2e-mockexam.js
 */
const { chromium } = require('playwright-core');

const BASE = process.env.PARROTTALK_TEST_URL || 'http://127.0.0.1:8000';
const CHROME = process.argv[2] || process.env.CHROME_PATH || '/usr/bin/google-chrome';
const C = { g: '\x1b[32m', r: '\x1b[31m', d: '\x1b[2m', x: '\x1b[0m' };
let passed = 0, failed = 0;
function c(label, ok, detail) {
  if (ok) { passed++; console.log(`  ${C.g}PASS${C.x} ${label} ${C.d}${detail || ''}${C.x}`); }
  else { failed++; console.log(`  ${C.r}FAIL${C.x} ${label} ${detail || ''}`); }
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });

  // --- 1. Chargement propre + structure ---
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(String(e)));
    await page.goto(`${BASE}/mockexam.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(200);
    const cards = await page.locator('.mex-card').count();
    const startVisible = await page.locator('#mex-start').isVisible().catch(() => false);
    const navActive = await page.evaluate(() => {
      const a = document.querySelector('.nav__link.active');
      return a ? a.getAttribute('href') : null;
    });
    c('page charge sans erreur JS', errs.length === 0, errs[0] || '');
    c('4 cartes de sections rendues', cards === 4, `count=${cards}`);
    c('bouton Start visible', startVisible);
    c('nav "Mock Exam" active sur la page', navActive === 'mockexam.html', `active href=${navActive}`);
    await ctx.close();
  }

  // --- 2. Clic reel : l'examen se lance vraiment ---
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/mockexam.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(150);
    await page.click('#mex-start', { timeout: 4000 }); // clic NON force
    await page.waitForTimeout(400);
    const url = page.url();
    const mock = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('pt_mock') || 'null'); } catch (e) { return null; } });
    c('clic Start pose pt_mock.active', !!(mock && mock.active), `pt_mock=${JSON.stringify(mock)}`);
    c('clic Start arrive sur listening.html?mock=1', /listening\.html\?mock=1/.test(url), `url=${url}`);
    await ctx.close();
  }

  // --- 3. Etat "mock en cours" : banniere reprendre/recommencer ---
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript(() => {
      try { localStorage.setItem('pt_mock', JSON.stringify({ active: true, started: 1 })); } catch (e) {}
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/mockexam.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(250);
    const banner = await page.locator('#mex-resume').isVisible().catch(() => false);
    const hasContinue = await page.locator('#mex-resume a[href="listening.html?mock=1"]').count();
    const hasRestart = await page.locator('#mex-restart').count();
    c('banniere reprendre affichee (mock en cours)', banner);
    c('banniere: action Continue presente', hasContinue === 1);
    c('banniere: action Start over presente', hasRestart === 1);
    await ctx.close();
  }

  // --- 4. Carte "Real Exam Test" de index -> mockexam.html ---
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
    const href = await page.evaluate(() => {
      const a = document.querySelector('a.pcard--exam');
      return a ? a.getAttribute('href') : null;
    });
    c('carte "Real Exam Test" pointe vers mockexam.html', href === 'mockexam.html', `href=${href}`);
    await ctx.close();
  }

  await browser.close();
  console.log(`\n${'-'.repeat(40)}`);
  console.log(`${failed === 0 ? C.g + 'VERDICT : PASS' : C.r + 'VERDICT : FAIL'}${C.x}  (${passed} PASS, ${failed} FAIL)`);
  process.exit(failed === 0 ? 0 : 1);
}
main().catch(e => { console.error('Erreur:', e); process.exit(2); });
