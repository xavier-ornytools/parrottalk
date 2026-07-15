#!/usr/bin/env node
// ParrotTalk — PORTE 1 : contrôle du script + questions AVANT génération / mise en prod.
// Rien ne part tant que ce script ne sort pas en PASS.
//
// Contrôles :
//   [VOIX]     Verrou de distinction — deux locuteurs DISTINCTS d'une section ne
//              peuvent JAMAIS partager le même id de voix. Dialogue => ≥2 voix. Bloquant.
//   [ORDRE]    ordre questions = ordre audio : `at` strictement croissant dans chaque
//              section et croissant d'une section à l'autre. Toute inversion bloque.
//   [ANCRE]    la réponse (mc/matching/completion) ou l'étiquette de carte est bien
//              prononcée à la ligne `at` indiquée. Sinon l'ancrage question↔audio est faux.
//   [TYPES]    conformité IELTS : chaque section contient exactement les types requis
//              (S1 completion ; S2 map labelling + MCQ ; S3 MCQ + matching + completion ;
//              S4 completion). Type non prévu ou type requis manquant => bloquant.
//   [MOTS]     limite de mots par réponse de complétion respectée (nombres exclus du décompte).
//   [FORME]    10 questions/section, n contigus 1..40.
//
// Usage : node tools/porte1-validate.js listening-src/test02.js
//         (sans argument : + self-test négatif prouvant que le verrou voix bloque)

const path = require('path');

const norm = s => String(s).toLowerCase();
const compact = s => norm(s).replace(/[^a-z0-9]/g, '');
const wordCount = ans => String(ans).split(/\s+/).filter(t => /[a-z]/i.test(t)).length; // nombres non comptés

// Aplatis les questions d'une section en préservant l'ordre, avec leur type et groupe.
function flatten(sec) {
  if (sec.groups) {
    return sec.groups.flatMap(g => g.questions.map(q => ({
      q, g,
      qtype: g.type === 'form' ? (g.kind || 'completion') : g.type, // mc | matching | maplabel | completion
    })));
  }
  return sec.questions.map(q => ({ q, g: sec, qtype: 'completion' }));
}

function spokenAt(text, needles) {
  const hay = norm(text), hayC = compact(text);
  return needles.some(c => { const n = norm(c), nc = compact(c); return (n && hay.includes(n)) || (nc && hayC.includes(nc)); });
}

function validate(test) {
  const errors = [], warns = [];
  const pool = new Set(test.accentPool || []);
  let lastGlobalAt = -1, expectedN = 1, total = 0;

  test.sections.forEach((sec, si) => {
    const tag = `Section ${sec.number}`;

    // [VOIX]
    const used = [...new Set(sec.script.map(l => l.who))];
    used.forEach(w => { if (!sec.speakers[w]) errors.push(`[${tag}] locuteur "${w}" absent du casting speakers`); });
    const seen = {};
    used.forEach(w => {
      const v = sec.speakers[w] && sec.speakers[w].voice;
      if (!v) return;
      if (seen[v]) errors.push(`[${tag}] ⛔ VERROU VOIX : "${w}" et "${seen[v]}" partagent la voix ${v} — INTERDIT dans un dialogue`);
      else seen[v] = w;
    });
    if (used.length >= 2 && new Set(used.map(w => sec.speakers[w].voice)).size < 2)
      errors.push(`[${tag}] ⛔ dialogue à ${used.length} locuteurs mais <2 voix distinctes`);
    Object.entries(sec.speakers).forEach(([w, s]) => {
      if (pool.size && !pool.has(s.accent)) errors.push(`[${tag}] accent "${s.accent}" (${w}) hors pool ${[...pool].join('/')}`);
      if (!['M', 'F'].includes(s.gender)) warns.push(`[${tag}] genre manquant pour "${w}"`);
    });

    const flat = flatten(sec);

    // [TYPES] conformité
    const present = new Set(flat.map(f => f.qtype));
    const required = new Set(sec.requiredTypes || []);
    required.forEach(t => { if (!present.has(t)) errors.push(`[${tag}] type requis manquant : ${t} (présents : ${[...present].join(', ')})`); });
    present.forEach(t => { if (required.size && !required.has(t)) errors.push(`[${tag}] type inattendu : ${t} (attendus : ${[...required].join(', ')})`); });

    if (flat.length !== 10) errors.push(`[${tag}] ${flat.length} questions au lieu de 10`);
    let lastAt = -1;

    flat.forEach(({ q, g, qtype }) => {
      total++;
      if (q.n !== expectedN) errors.push(`[${tag}] numérotation : q.n=${q.n} attendu ${expectedN}`);
      expectedN++;

      // [ORDRE]
      if (typeof q.at !== 'number' || q.at < 0 || q.at >= sec.script.length) {
        errors.push(`[${tag}] Q${q.n} : at=${q.at} hors script (0..${sec.script.length - 1})`); return;
      }
      if (q.at <= lastAt) errors.push(`[${tag}] Q${q.n} : ordre rompu, at=${q.at} ≤ précédent ${lastAt}`);
      lastAt = q.at;
      const globalAt = si * 1000 + q.at;
      if (globalAt <= lastGlobalAt) errors.push(`[${tag}] Q${q.n} : ordre global rompu`);
      lastGlobalAt = globalAt;

      const line = sec.script[q.at].text;

      // [ANCRE] + validité par type
      if (qtype === 'maplabel') {
        if (!/^[A-H]$/.test(q.answer)) errors.push(`[${tag}] Q${q.n} map : réponse "${q.answer}" n'est pas une lettre A–H`);
        else if (!new RegExp(`point\\s+${q.answer}`, 'i').test(line))
          errors.push(`[${tag}] Q${q.n} map : « point ${q.answer} » absent de la ligne at=${q.at}`);
      } else if (qtype === 'mc') {
        if (!Array.isArray(q.options) || q.options.length !== 3) errors.push(`[${tag}] Q${q.n} MCQ : il faut 3 options (A/B/C)`);
        if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < (q.options || []).length)) errors.push(`[${tag}] Q${q.n} MCQ : index réponse invalide`);
        const needles = q.anchor || [];
        if (!needles.length) errors.push(`[${tag}] Q${q.n} MCQ : champ anchor requis`);
        else if (!spokenAt(line, needles)) errors.push(`[${tag}] Q${q.n} MCQ : réponse non prononcée à at=${q.at} → « ${line.slice(0, 55)}… »`);
      } else if (qtype === 'matching') {
        if (!Array.isArray(g.options) || g.options.length < 3) errors.push(`[${tag}] Q${q.n} matching : groupe sans liste d'options suffisante`);
        if (!/^[A-Z]$/.test(q.answer)) errors.push(`[${tag}] Q${q.n} matching : réponse "${q.answer}" doit être une lettre`);
        const needles = q.anchor || [];
        if (!needles.length) errors.push(`[${tag}] Q${q.n} matching : champ anchor requis`);
        else if (!spokenAt(line, needles)) errors.push(`[${tag}] Q${q.n} matching : tâche non prononcée à at=${q.at}`);
      } else { // completion
        const needles = [q.answer, ...(q.alt || []), ...(q.anchor || [])];
        if (!spokenAt(line, needles)) errors.push(`[${tag}] Q${q.n} : réponse "${q.answer}" introuvable à at=${q.at} → « ${line.slice(0, 55)}… »`);
        // [MOTS]
        const limit = g.wordLimit || sec.wordLimit;
        if (limit && wordCount(q.answer) > limit) errors.push(`[${tag}] Q${q.n} : réponse "${q.answer}" = ${wordCount(q.answer)} mots > limite ${limit}`);
      }
    });
  });

  if (total !== 40) errors.push(`Total questions = ${total} au lieu de 40`);
  return { errors, warns };
}

function report(label, test) {
  const { errors, warns } = validate(test);
  console.log(`\n── PORTE 1 · ${label} ──`);
  warns.forEach(w => console.log(`  ⚠︎  ${w}`));
  if (!errors.length) { console.log('  ✅ PASS — voix distinctes · ordre=audio · ancrages · types IELTS · limites de mots · forme'); return true; }
  errors.forEach(e => console.log(`  ❌ ${e}`));
  console.log(`  ⛔ FAIL — ${errors.length} erreur(s), livraison BLOQUÉE`);
  return false;
}

const arg = process.argv[2];
if (arg) {
  process.exit(report(path.basename(arg), require(path.resolve(arg))) ? 0 : 1);
} else {
  const test = require(path.resolve(__dirname, '..', 'listening-src', 'test02.js'));
  const okReal = report('test02.js (réel)', test);
  const broken = JSON.parse(JSON.stringify(test));
  broken.sections[0].speakers.customer.voice = broken.sections[0].speakers.agent.voice;
  const okBroken = report('test02.js (SABOTÉ : 2 voix identiques S1)', broken);
  console.log('\n── Self-test ──');
  console.log(`  réel PASS : ${okReal ? 'OK ✅' : 'KO ❌'} | saboté FAIL : ${!okBroken ? 'OK ✅ (verrou a bloqué)' : 'KO ❌'}`);
  process.exit(okReal && !okBroken ? 0 : 1);
}
