# Pipeline Listening — production reproductible (pilote Test 02)

Chaîne unique : **script → Porte 1 → audio TTS → Porte 2 → écoute Xavier → intégration**.
Un seul chemin audio (MP3 statiques). La synthèse navigateur (Web Speech) est abandonnée.

## Fichiers
- `listening-src/test02.js` — source d'authoring (casting voix + script + questions ancrées).
- `tools/porte1-validate.js` — **Porte 1** : verrou distinction des voix + ordre questions=audio. Bloquant.
- `tools/generate-audio.js` — génération Google Cloud TTS + concat + loudnorm.
- `tools/porte2-diarize.js` — **Porte 2** machine : re-vérifie ≥2 voix distinctes + fidélité.

## Étapes
```
# 1. Porte 1 (déjà PASS)
node tools/porte1-validate.js listening-src/test02.js

# 2. Génération audio  ── NÉCESSITE la clé Cloud TTS
GCP_TTS_KEY=xxxx node tools/generate-audio.js listening-src/test02.js
#   → audio/test02/section{1..4}.mp3 + audio/test02/runtime-questions.json

# 3. Porte 2 machine  ── NÉCESSITE la clé Gemini (celle du Worker)
GEMINI_API_KEY=xxxx node tools/porte2-diarize.js listening-src/test02.js

# 4. Écoute Android par Xavier (juge final) sur la preview Vercel

# 5. Intégration : injecter runtime-questions.json dans js/data.js, déployer preview.
#    Aucun merge avant validation Xavier.
```

## Credential à fournir (bloquant pour l'étape 2)
`GCP_TTS_KEY` = clé API d'un projet Google Cloud avec l'API **Cloud Text-to-Speech**
activée + facturation. C'est un produit distinct de la clé Gemini AI Studio du Worker.
Coût attendu du Test 02 : ~0,25 € (négligeable).

## Voix du Test 02 (toutes distinctes par section)
- S1 dialogue : Receptionist `en-GB-Neural2-C` (F, GB) · Customer `en-AU-Neural2-B` (M, AU)
- S2 monologue : Coordinator `en-US-Neural2-F` (F, US)
- S3 discussion : Dr Hollis `en-GB-Neural2-B` (M, GB) · Maya `en-US-Neural2-E` (F, US) · Tom `en-AU-Neural2-D` (M, AU)
- S4 lecture : Lecturer `en-GB-Neural2-A` (F, GB)
