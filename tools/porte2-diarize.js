#!/usr/bin/env node
// ParrotTalk — PORTE 2 : contrôle des MP3 APRÈS génération.
// Ceinture (machine) + bretelles (oreille de Xavier). L'écoute Android par Xavier
// reste le juge AUTHORITAIRE ; ce script est le filet automatique.
//
// Pour chaque section de dialogue, envoie le MP3 à Gemini (transcription +
// diarisation par locuteur) et vérifie :
//   [DISTINCTION] on entend bien ≥ 2 locuteurs distincts là où le script en prévoit
//                 (re-contrôle indépendant du verrou de la Porte 1).
//   [FIDÉLITÉ]    la transcription recoupe le script (rien de sauté/mal lu).
//
// NÉCESSITE GEMINI_API_KEY dans l'env (clé AI Studio, celle du Worker).
// Usage : GEMINI_API_KEY=xxxx node tools/porte2-diarize.js listening-src/test02.js

const fs = require('fs');
const path = require('path');

const KEY = process.env.GEMINI_API_KEY;
const URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

async function diarize(mp3Path, expectedSpeakers) {
  const data = fs.readFileSync(mp3Path).toString('base64');
  const prompt = `You are an audio QA checker. Listen to this audio clip and return ONLY JSON:
{"distinctSpeakers": <integer, how many clearly different voices you hear>,
 "transcript": "<full transcript>"}
Count a voice as distinct only if gender/timbre/accent clearly differ.`;
  const body = {
    contents: [{ role: 'user', parts: [
      { inlineData: { mimeType: 'audio/mpeg', data } },
      { text: prompt },
    ] }],
    generationConfig: { temperature: 0, responseMimeType: 'application/json' },
  };
  const res = await fetch(`${URL}?key=${KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const j = await res.json();
  const txt = (j.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
  return JSON.parse(txt);
}

function keywordsFrom(sec) {
  return sec.questions.map(q => String(q.answer).toLowerCase().replace(/[^a-z0-9 ]/g, ''));
}

async function main() {
  const src = process.argv[2];
  if (!src || !KEY) { console.error('Usage: GEMINI_API_KEY=… node tools/porte2-diarize.js <source.js>'); process.exit(2); }
  const test = require(path.resolve(src));
  let fail = 0;

  for (const sec of test.sections) {
    const mp3 = path.resolve('audio', test.id, `section${sec.number}.mp3`);
    if (!fs.existsSync(mp3)) { console.log(`❌ S${sec.number} : MP3 absent (${mp3})`); fail++; continue; }
    const expected = new Set(sec.script.map(l => l.who)).size;
    const r = await diarize(mp3, expected);

    // [DISTINCTION]
    if (expected >= 2 && r.distinctSpeakers < 2) {
      console.log(`❌ S${sec.number} : ${r.distinctSpeakers} voix entendue(s) pour ${expected} locuteurs attendus — DISTINCTION NON TENUE`);
      fail++;
    } else {
      console.log(`✅ S${sec.number} : ${r.distinctSpeakers} voix distinctes (attendu ${expected})`);
    }
    // [FIDÉLITÉ] échantillon de mots-réponses présents dans la transcription
    const tr = (r.transcript || '').toLowerCase();
    const missing = keywordsFrom(sec).filter(k => k && !tr.includes(k.split(' ')[0]));
    if (missing.length > sec.questions.length / 2) {
      console.log(`   ⚠︎ fidélité douteuse : beaucoup de réponses absentes de la transcription (${missing.length}/${sec.questions.length})`);
    }
  }

  console.log(fail === 0
    ? '\n✅ PORTE 2 (machine) OK — reste l\'écoute Android par Xavier (juge final).'
    : `\n⛔ PORTE 2 : ${fail} section(s) en échec.`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(e => { console.error('⛔', e.message); process.exit(1); });
