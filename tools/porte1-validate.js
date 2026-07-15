#!/usr/bin/env node
// ParrotTalk — PORTE 1 : contrôle du script AVANT toute génération audio.
// Rien ne part au TTS tant que ce script ne sort pas en PASS.
//
// Contrôles :
//   [VOIX]   Verrou de distinction — dans une section, deux locuteurs DISTINCTS
//            ne peuvent JAMAIS partager le même id de voix. Un dialogue (≥2
//            locuteurs) doit exposer ≥2 voix distinctes. => bloquant.
//   [ORDRE]  ordre questions = ordre audio : les index `at` sont strictement
//            croissants dans chaque section, et croissants d'une section à l'autre.
//   [ANCRE]  la réponse de chaque question est réellement prononcée à la ligne
//            `at` indiquée (sinon l'ancrage question↔audio est faux).
//   [FORME]  10 questions/section, n contigus 1..40, consignes présentes,
//            accents dans le pool déclaré, `who` connus.
//
// Usage : node tools/porte1-validate.js listening-src/test02.js
//         (sans argument : self-test négatif inclus, prouve que le verrou bloque)

const path = require('path');

function norm(s)     { return String(s).toLowerCase(); }
function compact(s)  { return norm(s).replace(/[^a-z0-9]/g, ''); }

// La réponse est-elle réellement prononcée dans `text` ?
// Gère l'épellation (« P. E. L. L. E. T. I. E. R. » ≈ « PELLETIER ») via compaction,
// et le cas des étiquettes de carte à une lettre (A–H) via « point X ».
function answerSpokenIn(text, q) {
  const candidates = [q.answer, ...(q.alt || [])];
  const hay = norm(text);
  const hayC = compact(text);
  if (/^[A-H]$/.test(q.answer)) {
    return new RegExp(`point\\s+${q.answer}`, 'i').test(text);
  }
  return candidates.some(c => {
    const n = norm(c), nc = compact(c);
    return (n && hay.includes(n)) || (nc && hayC.includes(nc));
  });
}

function validate(test) {
  const errors = [];
  const warns = [];
  const pool = new Set(test.accentPool || []);
  let lastGlobalAt = -1;
  let totalQuestions = 0;
  let expectedN = 1;

  test.sections.forEach((sec, si) => {
    const tag = `Section ${sec.number}`;

    // [VOIX] verrou de distinction
    const used = [...new Set(sec.script.map(l => l.who))];
    used.forEach(w => {
      if (!sec.speakers[w]) errors.push(`[${tag}] locuteur "${w}" utilisé dans le script mais absent du casting speakers`);
    });
    const voiceBySpeaker = {};
    used.forEach(w => { if (sec.speakers[w]) voiceBySpeaker[w] = sec.speakers[w].voice; });
    const voices = Object.values(voiceBySpeaker);
    const distinctVoices = new Set(voices);
    if (voices.length !== distinctVoices.size) {
      // Trouver la collision précise
      const seen = {};
      Object.entries(voiceBySpeaker).forEach(([w, v]) => {
        if (seen[v]) errors.push(`[${tag}] ⛔ VERROU VOIX : "${w}" et "${seen[v]}" partagent la voix ${v} — INTERDIT dans un même dialogue`);
        else seen[v] = w;
      });
    }
    if (used.length >= 2 && distinctVoices.size < 2) {
      errors.push(`[${tag}] ⛔ dialogue à ${used.length} locuteurs mais ${distinctVoices.size} voix distincte(s)`);
    }
    // accents dans le pool + genres renseignés
    Object.entries(sec.speakers).forEach(([w, s]) => {
      if (pool.size && !pool.has(s.accent)) errors.push(`[${tag}] accent "${s.accent}" du locuteur "${w}" hors pool ${[...pool].join('/')}`);
      if (!['M', 'F'].includes(s.gender)) warns.push(`[${tag}] genre manquant/inconnu pour "${w}"`);
    });

    // [FORME] consignes
    if (!sec.instructions) warns.push(`[${tag}] consignes (instructions) absentes`);

    // Questions : forme, ordre, ancrage
    if (sec.questions.length !== 10) errors.push(`[${tag}] ${sec.questions.length} questions au lieu de 10`);
    let lastAt = -1;
    sec.questions.forEach(q => {
      totalQuestions++;
      if (q.n !== expectedN) errors.push(`[${tag}] numérotation : q.n=${q.n} attendu ${expectedN}`);
      expectedN++;

      // [ORDRE] intra-section
      if (typeof q.at !== 'number' || q.at < 0 || q.at >= sec.script.length) {
        errors.push(`[${tag}] Q${q.n} : index at=${q.at} hors du script (0..${sec.script.length - 1})`);
        return;
      }
      if (q.at <= lastAt) errors.push(`[${tag}] Q${q.n} : ordre rompu, at=${q.at} ≤ précédent ${lastAt} (ordre questions ≠ ordre audio)`);
      lastAt = q.at;

      // [ORDRE] inter-section (position absolue)
      const globalAt = si * 1000 + q.at;
      if (globalAt <= lastGlobalAt) errors.push(`[${tag}] Q${q.n} : ordre global rompu`);
      lastGlobalAt = globalAt;

      // [ANCRE] réponse réellement dite à la ligne at
      if (!answerSpokenIn(sec.script[q.at].text, q)) {
        errors.push(`[${tag}] Q${q.n} : réponse "${q.answer}" introuvable à la ligne at=${q.at} → « ${sec.script[q.at].text.slice(0, 60)}… »`);
      }
    });
  });

  if (totalQuestions !== 40) errors.push(`Total questions = ${totalQuestions} au lieu de 40`);
  return { errors, warns };
}

function report(label, test) {
  const { errors, warns } = validate(test);
  console.log(`\n── PORTE 1 · ${label} ──`);
  warns.forEach(w => console.log(`  ⚠︎  ${w}`));
  if (errors.length === 0) {
    console.log(`  ✅ PASS — verrou voix OK, ordre questions=audio OK, ancrages OK, forme OK`);
    return true;
  }
  errors.forEach(e => console.log(`  ❌ ${e}`));
  console.log(`  ⛔ FAIL — ${errors.length} erreur(s), génération audio BLOQUÉE`);
  return false;
}

// ── Exécution ────────────────────────────────────────────────────────────────
const arg = process.argv[2];
if (arg) {
  const test = require(path.resolve(arg));
  const ok = report(path.basename(arg), test);
  process.exit(ok ? 0 : 1);
} else {
  // Self-test négatif : prouve que le verrou bloque un dialogue à voix identique.
  const test = require(path.resolve(__dirname, '..', 'listening-src', 'test02.js'));
  const okReal = report('test02.js (réel)', test);

  const broken = JSON.parse(JSON.stringify(test));
  broken.sections[0].speakers.customer.voice = broken.sections[0].speakers.agent.voice; // même voix !
  const okBroken = report('test02.js (SABOTÉ : 2 voix identiques S1)', broken);

  console.log(`\n── Résultat self-test ──`);
  console.log(`  réel doit PASSER : ${okReal ? 'OK ✅' : 'KO ❌'}`);
  console.log(`  saboté doit ÉCHOUER : ${!okBroken ? 'OK ✅ (verrou a bloqué)' : 'KO ❌ (verrou n\'a pas bloqué !)'}`);
  process.exit(okReal && !okBroken ? 0 : 1);
}
