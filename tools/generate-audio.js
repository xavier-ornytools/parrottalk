#!/usr/bin/env node
// ParrotTalk — Génération audio Listening v2 (simulateur fidèle).
// Grave dans chaque MP3 : narration d'examen (voix narrateur) + silences de lecture
// ~20 s + exemple (Partie 1) + contenu + clôture, et ÉMET une cue sheet horodatée
// (timestamps de révélation des blocs) mesurée sur les durées réelles des segments.
//
// NÉCESSITE GCP_TTS_KEY (clé Cloud Text-to-Speech).
// Usage : GCP_TTS_KEY=xxxx node tools/generate-audio.js listening-src/test01.js

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { sectionBlocks, discourseWord } = require('./listening-lib');

const KEY = process.env.GCP_TTS_KEY;
const TTS_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';
const READING_GAP = 20;   // silence de lecture (s)
const LINE_GAP = 0.45;    // micro-pause entre répliques de contenu (s)
const NARR_GAP = 0.6;     // pause après une phrase de narration (s)
const RATE = 0.96;
const NARR_RATE = 0.95;
const LOUDNESS = 'loudnorm=I=-16:TP=-1.5:LRA=11';

let TMP, SIL = {};

async function synth(text, voiceName, lang, rate, outPath) {
  const body = { input: { text }, voice: { name: voiceName, languageCode: lang },
    audioConfig: { audioEncoding: 'MP3', speakingRate: rate, sampleRateHertz: 24000 } };
  const res = await fetch(`${TTS_URL}?key=${KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`TTS ${res.status} sur "${text.slice(0, 40)}…" : ${await res.text()}`);
  fs.writeFileSync(outPath, Buffer.from((await res.json()).audioContent, 'base64'));
}

function durationOf(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file]);
  return parseFloat(String(out).trim());
}

function silenceFile(seconds) {
  if (SIL[seconds]) return SIL[seconds];
  const f = path.join(TMP, `sil_${String(seconds).replace('.', '_')}.mp3`);
  execFileSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', String(seconds), '-q:a', '9', f], { stdio: 'ignore' });
  SIL[seconds] = f;
  return f;
}

async function main() {
  const src = process.argv[2];
  if (!src) { console.error('Usage: GCP_TTS_KEY=… node tools/generate-audio.js <source.js>'); process.exit(2); }
  if (!KEY) { console.error('⛔ GCP_TTS_KEY manquante.'); process.exit(2); }
  try { execFileSync('node', [path.join(__dirname, 'porte1-validate.js'), src], { stdio: 'inherit' }); }
  catch { console.error('⛔ Porte 1 en échec — génération annulée.'); process.exit(1); }

  // Filtre optionnel : --only=1,3 pour ne (re)générer que certaines sections
  // (ex. correctif d'intro qui ne touche que la Section 1). Les autres MP3/cues
  // existants restent intacts.
  const onlyArg = (process.argv.find(a => a.startsWith('--only=')) || '').split('=')[1];
  const onlySet = onlyArg ? new Set(onlyArg.split(',').map(n => parseInt(n, 10))) : null;

  const test = require(path.resolve(src));
  const narrator = test.narratorVoice;
  const outDir = path.resolve('audio', test.id);
  fs.mkdirSync(outDir, { recursive: true });
  TMP = path.join(outDir, '.tmp'); fs.mkdirSync(TMP, { recursive: true }); SIL = {};

  for (const sec of test.sections) {
    if (onlySet && !onlySet.has(sec.number)) continue; // section non ciblée : inchangée
    console.log(`\n▶ Section ${sec.number} — ${sec.title}`);
    const blocks = sectionBlocks(sec);
    const disc = discourseWord(sec);
    const isFirst = sec.number === 1;
    const isLast = sec.number === test.sections.length;
    const spVoice = who => sec.speakers[who].voice;
    const spLang = who => sec.speakers[who].accent;

    const segs = [];   // fichiers à concaténer
    const cues = [];
    let T = 0;         // temps cumulé (s)
    let counter = 0;

    const addFile = (file, dur) => { segs.push(file); const start = T; T += dur; return start; };
    const gap = s => addFile(silenceFile(s), s);
    const say = async (text, voice, lang, rate) => {
      const f = path.join(TMP, `s${sec.number}_${counter++}.mp3`);
      await synth(text, voice, lang, rate, f);
      const start = addFile(f, durationOf(f));
      process.stdout.write('.');
      return start;
    };
    const narr = t => say(t, narrator, 'en-GB', NARR_RATE);
    // Débit du contenu : RATE par défaut, surchargé par sec.rate (levier difficulté
    // « débit un peu plus rapide sur une section »). La narration reste à NARR_RATE.
    const contentRate = sec.rate || RATE;
    const contentBlock = async (from, to) => {
      for (let i = from; i <= to; i++) {
        await say(sec.script[i].text, spVoice(sec.script[i].who), spLang(sec.script[i].who), contentRate);
        if (i < to) gap(LINE_GAP);
      }
    };

    // Préambule (Partie 1) = intro de MARQUE par test. AUCUNE mention de marque
    // tierce dans l'audio (règle stricte). Rotation fixe définie par test.intro.
    if (isFirst) {
      const intro = test.intro || 'Welcome to the ParrotTalk listening test. You will hear a number of different recordings, and you will hear each one only once.';
      await narr(intro); gap(NARR_GAP);
    }
    // Annonce + contexte
    await narr(`Section ${sec.number}. You will hear ${sec.context}.`); gap(NARR_GAP);

    // ── Bloc 1 ────────────────────────────────────────────────────────────────
    const b1 = blocks[0];
    const revealB1 = await narr(`First, you have some time to look at questions ${b1.qFrom} to ${b1.qTo}.`);
    cues.push({ t: +revealB1.toFixed(2), reveal: [b1.qFrom, b1.qTo], phase: 'reading' });
    gap(READING_GAP);
    // Exemple (Partie 1)
    if (isFirst && sec.example) {
      await narr('Look at the example.'); gap(NARR_GAP);
      for (const l of sec.example.lines) { await say(l.text, spVoice(l.who), spLang(l.who), RATE); gap(LINE_GAP); }
      await narr(sec.example.answer); gap(NARR_GAP);
    }
    await narr(`Now listen carefully and answer questions ${b1.qFrom} to ${b1.qTo}.`); gap(NARR_GAP);
    cues.push({ t: +T.toFixed(2), activate: [b1.qFrom, b1.qTo] });
    await contentBlock(b1.lineFrom, b1.lineTo);

    // ── Bloc 2 (si coupure) ─────────────────────────────────────────────────────
    if (blocks.length === 2) {
      const b2 = blocks[1];
      gap(NARR_GAP);
      const revealB2 = await narr(`Before the ${disc} continues, you have some time to look at questions ${b2.qFrom} to ${b2.qTo}.`);
      cues.push({ t: +revealB2.toFixed(2), reveal: [b2.qFrom, b2.qTo], phase: 'reading' });
      gap(READING_GAP);
      await narr(`Now listen and answer questions ${b2.qFrom} to ${b2.qTo}.`); gap(NARR_GAP);
      cues.push({ t: +T.toFixed(2), activate: [b2.qFrom, b2.qTo] });
      await contentBlock(b2.lineFrom, b2.lineTo);
    }

    // Clôture
    gap(NARR_GAP);
    await narr(isLast ? 'That is the end of the Listening test.' : `That is the end of section ${sec.number}.`);
    cues.push({ t: +T.toFixed(2), end: true });

    // Concat + loudnorm
    const listFile = path.join(TMP, `concat_s${sec.number}.txt`);
    fs.writeFileSync(listFile, segs.map(p => `file '${p}'`).join('\n'));
    const outMp3 = path.join(outDir, `section${sec.number}.mp3`);
    execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-af', LOUDNESS, '-ar', '24000', '-b:a', '96k', outMp3], { stdio: 'ignore' });

    fs.writeFileSync(path.join(outDir, `section${sec.number}.cues.json`),
      JSON.stringify({ section: sec.number, duration: +T.toFixed(2), cues }, null, 2));
    console.log(`\n  ✅ ${path.relative(process.cwd(), outMp3)}  (${T.toFixed(1)}s, ${cues.length} cues)`);
  }

  fs.rmSync(TMP, { recursive: true, force: true });
  console.log('\n📦 Audio narré + cue sheets générés. Étapes : emit-runtime → intégration → preview.');
}

main().catch(e => { console.error('\n⛔', e.message); process.exit(1); });
