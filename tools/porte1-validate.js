#!/usr/bin/env node
// ParrotTalk — PORTE 1 : contrôle source AVANT génération / mise en prod. PASS obligatoire.
//
//   [VOIX]     deux locuteurs distincts d'une section ne partagent jamais une voix ;
//              dialogue => ≥2 voix ; la VOIX NARRATEUR est distincte de tous les locuteurs.
//   [ORDRE]    réponses `at` strictement croissantes (intra-section et global).
//   [ANCRE]    la réponse (mc/matching/completion) ou l'étiquette carte est dite à la ligne `at`.
//   [TYPES]    conformité IELTS des types par section (requiredTypes).
//   [MOTS]     limite de mots par réponse de complétion (nombres non comptés).
//   [BLOCS]    découpe examen : split => 2 blocs de 5 ; sans split (Partie 4) => 1 bloc de 10.
//   [NARR]     narratorVoice défini ; context par section ; exemple présent en Partie 1.
//   [FORME]    10 questions/section, n contigus 1..40.
//
// Usage : node tools/porte1-validate.js listening-src/testXX.js
//         (sans argument : + self-test négatif prouvant que le verrou voix bloque)

const path = require('path');
const { flattenQuestions, sectionBlocks } = require('./listening-lib');

const norm = s => String(s).toLowerCase();
const compact = s => norm(s).replace(/[^a-z0-9]/g, '');
const wordCount = ans => String(ans).split(/\s+/).filter(t => /[a-z]/i.test(t)).length;

function spokenAt(text, needles) {
  const hay = norm(text), hayC = compact(text);
  return needles.some(c => { const n = norm(c), nc = compact(c); return (n && hay.includes(n)) || (nc && hayC.includes(nc)); });
}

function validate(test) {
  const errors = [], warns = [];
  const pool = new Set(test.accentPool || []);
  let lastGlobalAt = -1, expectedN = 1, total = 0;

  // [NARR] voix narrateur au niveau test
  if (!test.narratorVoice) errors.push(`narratorVoice manquant (voix des annonces d'examen)`);

  test.sections.forEach((sec, si) => {
    const tag = `Section ${sec.number}`;

    // [VOIX] locuteurs
    const used = [...new Set(sec.script.map(l => l.who))];
    used.forEach(w => { if (!sec.speakers[w]) errors.push(`[${tag}] locuteur "${w}" absent du casting speakers`); });
    const seen = {};
    used.forEach(w => {
      const v = sec.speakers[w] && sec.speakers[w].voice; if (!v) return;
      if (seen[v]) errors.push(`[${tag}] ⛔ VERROU VOIX : "${w}" et "${seen[v]}" partagent la voix ${v}`);
      else seen[v] = w;
    });
    if (used.length >= 2 && new Set(used.map(w => sec.speakers[w].voice)).size < 2)
      errors.push(`[${tag}] ⛔ dialogue à ${used.length} locuteurs mais <2 voix distinctes`);
    // narrateur distinct de tous les locuteurs
    Object.entries(sec.speakers).forEach(([w, s]) => {
      if (test.narratorVoice && s.voice === test.narratorVoice)
        errors.push(`[${tag}] ⛔ locuteur "${w}" utilise la voix narrateur ${test.narratorVoice}`);
      if (pool.size && !pool.has(s.accent)) errors.push(`[${tag}] accent "${s.accent}" (${w}) hors pool`);
      if (!['M', 'F'].includes(s.gender)) warns.push(`[${tag}] genre manquant pour "${w}"`);
    });

    // [NARR] contexte + exemple Partie 1
    if (!sec.context) errors.push(`[${tag}] context (annonce parlée) manquant`);
    if (sec.number === 1) {
      if (!sec.example || !Array.isArray(sec.example.lines) || !sec.example.lines.length || !sec.example.answer)
        errors.push(`[${tag}] exemple travaillé (example.lines + example.answer) requis en Partie 1`);
      else sec.example.lines.forEach(l => { if (!sec.speakers[l.who]) errors.push(`[${tag}] exemple : locuteur "${l.who}" inconnu`); });
    }

    // [BLOCS]
    if (sec.splitAt != null && (sec.splitAt <= 0 || sec.splitAt >= sec.script.length))
      errors.push(`[${tag}] splitAt=${sec.splitAt} hors script (1..${sec.script.length - 1})`);
    const blocks = sectionBlocks(sec);
    if (sec.splitAt == null) {
      if (blocks.length !== 1) errors.push(`[${tag}] Partie sans coupure : 1 bloc attendu`);
    } else {
      if (blocks.length !== 2) errors.push(`[${tag}] coupure : 2 blocs attendus`);
      blocks.forEach((b, i) => {
        const c = b.qTo - b.qFrom + 1;
        if (c !== 5) errors.push(`[${tag}] bloc ${i + 1} = ${c} questions (attendu 5)`);
      });
    }

    const flat = flattenQuestions(sec);

    // [TYPES]
    const present = new Set(flat.map(f => f.qtype));
    const required = new Set(sec.requiredTypes || []);
    required.forEach(t => { if (!present.has(t)) errors.push(`[${tag}] type requis manquant : ${t}`); });
    present.forEach(t => { if (required.size && !required.has(t)) errors.push(`[${tag}] type inattendu : ${t}`); });

    if (flat.length !== 10) errors.push(`[${tag}] ${flat.length} questions au lieu de 10`);
    let lastAt = -1;

    flat.forEach(({ q, g, qtype }) => {
      total++;
      if (q.n !== expectedN) errors.push(`[${tag}] numérotation : q.n=${q.n} attendu ${expectedN}`);
      expectedN++;
      if (typeof q.at !== 'number' || q.at < 0 || q.at >= sec.script.length) {
        errors.push(`[${tag}] Q${q.n} : at=${q.at} hors script`); return;
      }
      if (q.at <= lastAt) errors.push(`[${tag}] Q${q.n} : ordre rompu, at=${q.at} ≤ ${lastAt}`);
      lastAt = q.at;
      const globalAt = si * 1000 + q.at;
      if (globalAt <= lastGlobalAt) errors.push(`[${tag}] Q${q.n} : ordre global rompu`);
      lastGlobalAt = globalAt;
      const line = sec.script[q.at].text;

      if (qtype === 'maplabel') {
        if (!/^[A-H]$/.test(q.answer)) errors.push(`[${tag}] Q${q.n} map : "${q.answer}" pas une lettre A–H`);
        else if (!new RegExp(`point\\s+${q.answer}`, 'i').test(line)) errors.push(`[${tag}] Q${q.n} map : « point ${q.answer} » absent à at=${q.at}`);
      } else if (qtype === 'mc') {
        if (!Array.isArray(q.options) || q.options.length !== 3) errors.push(`[${tag}] Q${q.n} MCQ : 3 options requises`);
        if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < (q.options || []).length)) errors.push(`[${tag}] Q${q.n} MCQ : index réponse invalide`);
        const needles = q.anchor || [];
        if (!needles.length) errors.push(`[${tag}] Q${q.n} MCQ : anchor requis`);
        else if (!spokenAt(line, needles)) errors.push(`[${tag}] Q${q.n} MCQ : réponse non dite à at=${q.at}`);
      } else if (qtype === 'matching') {
        if (!Array.isArray(g.options) || g.options.length < 3) errors.push(`[${tag}] Q${q.n} matching : options de groupe insuffisantes`);
        if (!/^[A-Z]$/.test(q.answer)) errors.push(`[${tag}] Q${q.n} matching : réponse "${q.answer}" doit être une lettre`);
        const needles = q.anchor || [];
        if (!needles.length) errors.push(`[${tag}] Q${q.n} matching : anchor requis`);
        else if (!spokenAt(line, needles)) errors.push(`[${tag}] Q${q.n} matching : tâche non dite à at=${q.at}`);
      } else {
        const needles = [q.answer, ...(q.alt || []), ...(q.anchor || [])];
        if (!spokenAt(line, needles)) errors.push(`[${tag}] Q${q.n} : réponse "${q.answer}" introuvable à at=${q.at}`);
        const limit = g.wordLimit || sec.wordLimit;
        if (limit && wordCount(q.answer) > limit) errors.push(`[${tag}] Q${q.n} : "${q.answer}" = ${wordCount(q.answer)} mots > ${limit}`);
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
  if (!errors.length) { console.log('  ✅ PASS — voix (dont narrateur) · ordre=audio · ancrages · types · mots · blocs examen · exemple P1'); return true; }
  errors.forEach(e => console.log(`  ❌ ${e}`));
  console.log(`  ⛔ FAIL — ${errors.length} erreur(s), livraison BLOQUÉE`);
  return false;
}

const arg = process.argv[2];
if (arg) {
  process.exit(report(path.basename(arg), require(path.resolve(arg))) ? 0 : 1);
} else {
  const test = require(path.resolve(__dirname, '..', 'listening-src', 'test01.js'));
  const okReal = report('test01.js (réel)', test);
  const broken = JSON.parse(JSON.stringify(test));
  broken.sections[0].speakers.caller.voice = broken.sections[0].speakers.clerk.voice;
  const okBroken = report('test01.js (SABOTÉ : 2 voix identiques S1)', broken);
  console.log('\n── Self-test ──');
  console.log(`  réel PASS : ${okReal ? 'OK ✅' : 'KO ❌'} | saboté FAIL : ${!okBroken ? 'OK ✅' : 'KO ❌'}`);
  process.exit(okReal && !okBroken ? 0 : 1);
}
