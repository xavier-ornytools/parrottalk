#!/usr/bin/env node
// ParrotTalk — Génération audio Listening via Google Cloud Text-to-Speech (Path A).
// Prêt à tourner. NÉCESSITE une clé API Cloud TTS dans l'env GCP_TTS_KEY
// (clé GCP restreinte à l'API "Cloud Text-to-Speech", distincte de la clé Gemini).
//
// Chaîne : Porte 1 (bloquante) → 1 synthèse REST par réplique avec la voix du
// locuteur → concat ffmpeg avec silences → normalisation loudness -16 LUFS
// (élimine grésillement/clipping) → audio/test02/sectionN.mp3.
//
// Usage : GCP_TTS_KEY=xxxx node tools/generate-audio.js listening-src/test02.js
//
// Portable : une synthèse par réplique (pas de balisage multi-speaker propriétaire),
// donc on peut mélanger librement les accents et changer de moteur sans réécrire
// le contenu.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const KEY = process.env.GCP_TTS_KEY;
const TTS_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';
const GAP_SECONDS = 0.6;           // silence entre répliques
const RATE = 0.96;                 // débit légèrement posé, examen
const LOUDNESS = 'loudnorm=I=-16:TP=-1.5:LRA=11';

async function synthLine(text, voiceName, languageCode, outPath) {
  const body = {
    input: { text },
    voice: { name: voiceName, languageCode },
    audioConfig: { audioEncoding: 'MP3', speakingRate: RATE, sampleRateHertz: 24000 },
  };
  const res = await fetch(`${TTS_URL}?key=${KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`TTS ${res.status} sur "${text.slice(0, 40)}…" : ${await res.text()}`);
  const { audioContent } = await res.json();
  fs.writeFileSync(outPath, Buffer.from(audioContent, 'base64'));
}

async function main() {
  const src = process.argv[2];
  if (!src) { console.error('Usage: GCP_TTS_KEY=… node tools/generate-audio.js <source.js>'); process.exit(2); }
  if (!KEY) { console.error('⛔ GCP_TTS_KEY manquante — clé API Cloud Text-to-Speech requise.'); process.exit(2); }

  // Porte 1 bloquante
  try {
    execFileSync('node', [path.join(__dirname, 'porte1-validate.js'), src], { stdio: 'inherit' });
  } catch { console.error('⛔ Porte 1 en échec — génération annulée.'); process.exit(1); }

  const test = require(path.resolve(src));
  const outDir = path.resolve('audio', test.id);
  const tmp = fs.mkdirSync(path.join(outDir, '.tmp'), { recursive: true }) || path.join(outDir, '.tmp');

  // Silence réutilisable
  const silence = path.join(tmp, 'gap.mp3');
  execFileSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono',
    '-t', String(GAP_SECONDS), '-q:a', '9', silence], { stdio: 'ignore' });

  for (const sec of test.sections) {
    console.log(`\n▶ Section ${sec.number} — ${sec.title}`);
    const parts = [];
    for (let i = 0; i < sec.script.length; i++) {
      const line = sec.script[i];
      const sp = sec.speakers[line.who];
      const lp = path.join(tmp, `s${sec.number}_l${i}.mp3`);
      await synthLine(line.text, sp.voice, sp.accent, lp);
      parts.push(lp);
      if (i < sec.script.length - 1) parts.push(silence);
      process.stdout.write('.');
    }
    // concat + loudnorm
    const listFile = path.join(tmp, `concat_s${sec.number}.txt`);
    fs.writeFileSync(listFile, parts.map(p => `file '${p}'`).join('\n'));
    const outMp3 = path.join(outDir, `section${sec.number}.mp3`);
    execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listFile,
      '-af', LOUDNESS, '-ar', '24000', '-b:a', '96k', outMp3], { stdio: 'ignore' });
    console.log(`\n  ✅ ${path.relative(process.cwd(), outMp3)}`);
  }

  fs.rmSync(tmp, { recursive: true, force: true });

  // Émet le bloc questions runtime (à injecter dans js/data.js à l'intégration)
  const runtime = {
    id: test.id, title: test.title,
    sections: test.sections.map(s => ({
      number: s.number, title: s.title, type: s.type,
      audio: `audio/${test.id}/section${s.number}.mp3`,
      instructions: s.instructions,
      questions: s.questions.map(({ at, ...q }) => q),
    })),
  };
  fs.writeFileSync(path.join(outDir, 'runtime-questions.json'), JSON.stringify(runtime, null, 2));
  console.log(`\n📦 Bloc runtime écrit → ${path.relative(process.cwd(), path.join(outDir, 'runtime-questions.json'))}`);
  console.log('→ Étape suivante : Porte 2 (tools/porte2-diarize.js) puis écoute Android par Xavier avant intégration.');
}

main().catch(e => { console.error('\n⛔', e.message); process.exit(1); });
