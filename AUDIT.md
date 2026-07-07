# AUDIT — ParrotTalk (Session 1, lecture seule)

> Audit du repo `parrottalk_restored` suite au premier test blanc IELTS complet.
> Aucune modification de code n'a été faite cette session — voir `CORRECTIONS-PLAN.md`
> pour le détail des corrections à venir.
> Tag git posé avant cette session : `avant-audit-docs-2026-07-07`.

---

## 1. Banque de sujets/questions

**Fichiers concernés** : `js/data.js`, `reading.html`, `writing.html`, `speaking.html`

Pas de base centralisée unique — chaque module a son propre mécanisme de stockage.

- **Listening** : centralisé dans `js/data.js`. Trois objets `TEST01`, `TEST02`,
  `TEST03`, agrégés dans `const TESTS = { test01: TEST01, test02: TEST02, test03: TEST03 }`
  (ligne 455). Chaque test a `sections[]` avec `audio`, `type` (`form`/`mixed`),
  `questions[]` (label + `answer` + `alt[]` de variantes acceptées), ou pour
  test03 un `script[]` de répliques TTS. Chargement : `let currentTest = TEST01`
  puis `selectTest(id)` fait `currentTest = TESTS[id]`. Rendu : `renderSection(i)`
  → `buildSectionHTML(sec)`. Scores : `saveScore`/`getScore`/`getAllScores`
  (data.js:458-469), `localStorage['ielts_scores']`.

- **Reading** : passages codés en dur directement dans le HTML de `reading.html`
  (`<div class="passage-text">`). Réponses attendues dans des objets JS inline
  en fin de fichier : `ANSWERS`, `ANSWERS_02`, `ANSWERS_03` (lignes 1430-1521),
  agrégés via `ANSWERS_MAP`. Navigation via `PASSAGE_RANGES*`. `js/data.js`
  n'est utilisé ici que pour `BAND_TABLE`/`getBand()` (voir point 3 ci-dessous).
  Scores : `getAllReadingScores()`/`saveReadingScore()` (lignes 1542-1554),
  `localStorage['ielts_reading_scores']`.

- **Writing** : sujets + corrigés modèles codés en dur dans
  `const WRITING_DATA = {1:{...},2:{...},3:{...}}` (writing.html:298-320) :
  `task1_instruction`, `task1_graph`, `task1_sample`, `task2_instruction`,
  `task2_sample`. Scores : `localStorage['ielts_writing_scores']`.

- **Speaking** : questions codées en dur dans
  `const SPEAKING_TESTS = {1:{...},2:{...},3:{...}}` (speaking.html:254-327).

**Conclusion** : confirmé fonctionnel, mais format hétérogène. Toute mise à
jour d'un sujet nécessite d'éditer le bon fichier HTML au bon endroit — pas de
schéma JSON externe unifié entre modules.

**Risque d'une éventuelle harmonisation** : moyen (toucherait les 4 modules,
mais chacun indépendamment, pas de dépendance croisée).

---

## 2. Writing — sujet affiché ≠ sujet évalué

**Fichiers concernés** : `writing.html`, `worker/src/index.js`

**Conclusion : ce n'est probablement PAS un bug de code.** Flux tracé de bout
en bout :

1. `WRITING_DATA[currentWritingTest].task{1,2}_instruction` est affiché au
   candidat via `startWritingTest()` (writing.html:335-354). Le sujet n'est
   pas aléatoire, il est choisi explicitement par le candidat via
   `selectWritingTest(n)` avant le lancement.
2. `getAIFeedback(task)` (writing.html:390-429) lit `essay` depuis
   `document.getElementById(\`task${task}-answer\`).value` et construit
   `promptText` depuis `WRITING_DATA[currentWritingTest]` — **le même test et
   la même tâche que ceux réellement affichés**. Le body envoyé au Worker
   inclut `{ task, taskType, prompt: promptText, essay, wordCount, minWords }`.
3. `handleWriting()` (worker/src/index.js:129-170) utilise `prompt` tel que
   reçu, sans réindexation ni sujet codé en dur côté serveur :
   `TASK PROMPT: ${prompt}` est injecté directement dans le prompt Gemini.
   Aucune donnée de sujet Writing n'existe côté Worker.

**Aucune désynchronisation de code trouvée.** Task 1 (Test 01) = graphique sur
les énergies renouvelables ; Task 2 (Test 01) = essai argumentatif sur
"university education" (writing.html:303) — exactement le sujet mentionné
dans l'incident. Ce sont deux sujets normalement différents à l'intérieur d'un
même test IELTS (structure standard : T1 = graphique, T2 = essai sans rapport
thématique).

**Cause la plus probable (scénario UX, pas bug)** : le candidat a écrit ou
collé son texte sur le graphique dans le mauvais encadré (`task2-answer` au
lieu de `task1-answer`), puis cliqué le bouton "Get AI Feedback" de la Task 2
— qui a évalué, à raison, le texte réellement présent dans cet encadré contre
le vrai sujet de la Task 2. Voir point 4 (approfondissement UX) pour l'analyse
des facteurs de confusion identifiés dans l'interface.

**Trou d'audit confirmé** : `logEvaluation()` (worker/src/index.js:70-75) ne
stocke jamais le `prompt` ni l'`essay` réels — seulement
`{ type, bands, durationSeconds, ts }`. **Impossible de vérifier a posteriori**
quel prompt exact a été envoyé lors de l'incident réel. Voir
`CORRECTIONS-PLAN.md` Session 2 pour la correction de ce trou de logging.

**Limites de cette conclusion** : impossible de garantir que le Worker
réellement déployé sur `parrottalk-api.foundry8.workers.dev` correspond
bit-à-bit à ce fichier source (pas d'accès à l'historique de déploiement
Cloudflare depuis ce dépôt). Une hallucination du modèle Gemini reste
théoriquement possible mais peu probable : le contenu incriminé
("university education") correspond exactement et littéralement au
`task2_instruction` du Test 01 présent dans le code.

**Risque de correction** : faible pour le logging (ajout de champs) ; le
scénario UX ne nécessite qu'un ajustement d'interface, pas de logique
(voir point 4).

---

## 3. Persistance / gestion d'état entre les sections

**Fichiers concernés** : `listening.html`, `reading.html`, `js/data.js`

**Deux causes racines confirmées :**

**(a) Aucune sauvegarde incrémentale.** Grep exhaustif sur `localStorage`
confirme qu'il n'est écrit qu'à un seul endroit par test, au clic final sur
"Submit" (`saveScore()` en Listening, `saveReadingScore()` en Reading). Entre
temps, tout l'état (réponses saisies, sections faites) vit uniquement en
mémoire DOM. → Si l'utilisateur recharge la page, ferme l'onglet, ou navigue
ailleurs avant d'avoir soumis, **100% de la progression est perdue**.

**(b) Listening — gating par la classe `done` (cause confirmée du "score
bloqué sur section 1").** Une section n'est comptée dans le score final que
si son onglet porte la classe CSS `done` :

```js
// listening.html:375-389
function handleSectionEnd(sectionIdx) {
  const tab = document.getElementById(`tab-${sectionIdx}`);
  if (tab) tab.classList.add('done');
  ...
}
```

Cette classe n'est posée que sur l'événement `ended` de l'audio HTML5 ou en
fin de file TTS (`speakNext()`). Or `switchSection()` (listening.html:323-330)
fait `audio.pause(); cancelTTS();` dès qu'on change d'onglet — ce qui n'émet
**jamais** `ended`. Au calcul final (`submitTest()`, lignes 522-534) :

```js
const isDone = document.getElementById(`tab-${si}`)?.classList.contains('done');
if (isDone) { sectionScores[si] = secScore; maxPossible += qs.length; }
```

Une section dont l'onglet n'est pas `done` est **exclue du calcul** (pas
comptée à 0 — complètement ignorée du numérateur ET du dénominateur). Si
l'utilisateur avance à la section suivante avant la fin naturelle de la piste
(très courant en usage réel), cette section ne sera jamais marquée `done` —
d'où le symptôme "score bloqué sur section 1" si elle seule a été écoutée
jusqu'au bout.

**Nuance Reading** : ce mécanisme de gating n'existe pas fonctionnellement
côté Reading, malgré la présence résiduelle de la classe CSS `.passage-tab.done`
(reading.html:149, jamais posée par le JS — code mort, probablement copié
depuis Listening puis jamais branché). L'agrégation entre les 3 passages
Reading fonctionne correctement intra-session (le calcul boucle sur les 40
questions par leur `id` DOM, indépendamment de l'onglet actif). Le risque
Reading se limite donc au point (a) — perte totale en cas de rechargement.

**Note de conformité projet** : toute solution de sauvegarde progressive
devra respecter la règle "pas de données personnelles dans `/site` déployé" —
les objets actuels (`ielts_scores`, `ielts_reading_scores`) ne contiennent que
des scores/dates, pas d'identité.

**Risque de correction** : moyen à élevé (touche `listening.html`,
potentiellement `reading.html`, `js/data.js`, et `dashboard.html` qui consomme
le format de scores).

---

## 4. Calcul du band global

**Fichier concerné** : `dashboard.html`

**Bug confirmé avec certitude.** Chaque compétence utilise `BAND_40`
(js/data.js:9-15), qui ne retourne que des multiples de 0.5 via `getBand()`.
Un band de 2.7 ne peut donc pas venir de `getBand()` — il vient de
l'agrégation finale dans `dashboard.html:loadDashboard()` :

```js
// dashboard.html:314-316
const available = Object.values(skills).filter(v => v !== null);
const overall = available.length ? (available.reduce((a,b) => a+b, 0) / available.length).toFixed(1) : null;
```

Simple moyenne arithmétique + `.toFixed(1)` — **aucun arrondi au multiple de
0.5 le plus proche**. À comparer avec le calcul Writing, juste au-dessus dans
le même fichier, qui le fait *correctement* :

```js
// dashboard.html:293
band = Math.round(((t.t1 + t.t2 * 2) / 3) * 2) / 2;
```

**Exemple reproductible donnant 2.7** : `listening=1.0`, `writing=1.0`,
`reading=6.0`, `speaking` non tenté → exclu du calcul (confirmé : une
compétence non tentée est mise à `null` puis filtrée, **pas** comptée comme 0)
→ `available = [1.0, 1.0, 6.0]` → `(1+1+6)/3 = 2.6666...` → `.toFixed(1)` →
`"2.7"`. Autre variante possible : imprécision binaire JS sur des sommes
donnant `.75` (ex. `2.75` stocké en `2.7499999999999996` → `toFixed(1)` →
`"2.7"` au lieu de `"2.8"`).

**Conclusion** : fonction fautive identifiée avec certitude — `loadDashboard()`,
lignes 314-316. Le pattern correct existe déjà dans le même fichier comme
modèle. Voir `CORRECTIONS-PLAN.md`, action prioritaire en tête de document —
ce fix est décrit prêt à appliquer.

**Risque de correction** : faible.

---

## 5. Affichage des questions par blocs (Listening)

**Fichier concerné** : `listening.html`

**Confirmé absent.** Le rendu (`renderSection()` → `buildSectionHTML()` →
`buildFormGroup`/`buildMCGroup`/`buildMatchingGroup`, lignes 459-514) injecte
systématiquement la **totalité** des questions d'une section en un seul bloc
HTML (`.map(...).join('')`), dès l'ouverture de la section — avant même le
lancement de l'audio. Recherche exhaustive de toute logique de reveal
progressif (mots-clés `reveal`, `chunk`, comparaison à `audio.currentTime`,
seuils de temps) : rien trouvé. `timeupdate` (lignes 417-422) ne sert qu'à la
barre de progression visuelle et à l'affichage du temps.

**Conclusion** : comportement confirmé, contraire au vrai IELTS (questions
prévisualisées par blocs calés sur les pauses audio).

**Risque de correction** : élevé — vraie refonte, pas un correctif ponctuel.
Nécessiterait : (1) découper les questions par sous-groupes dans les données
`js/data.js`, (2) associer des timecodes de déclenchement (absents des MP3
actuels, à inventer pour le TTS de test03), (3) réécrire les 3 fonctions de
rendu pour un rendu partiel + listeners sur `timeupdate`/`speakNext`.

---

## 6. Minuteur du Reading

**Fichier concerné** : `reading.html`

**Hypothèse initiale infirmée par le code.** `switchPassage()`
(reading.html:1604-1612) ne touche ni `timerInterval` ni `secondsLeft` — elle
ne fait que du toggle CSS + scroll. Changer de passage à l'intérieur d'un même
test **ne réinitialise donc pas** le chrono dans le code actuel — à
reconfirmer en conditions réelles (peut-être un souci de rendu visuel non
capturé par une lecture statique).

**Bug réel différent, confirmé** :

```js
// reading.html:1557-1565
function selectTest(id) {
  currentReadingTest = id === 'test03' ? 3 : id === 'test02' ? 2 : 1;
  ...
  submitted = false;
}
```

`selectTest()` et `startTimer()` (lignes 1579-1592) ne font jamais
`clearInterval(timerInterval)` avant de repartir. Si l'utilisateur
relance/change de **test** en cours de session (chrono déjà en cours), un
second `setInterval` s'empile sur le premier : `secondsLeft` décrémente deux
fois par seconde réelle (chrono qui défile trop vite), et l'ancien intervalle
peut déclencher un `submitTest()` prématuré. `secondsLeft`/`timerInterval` sont
des variables globales **uniques, partagées entre les 3 tests** — pas une par
test.

**Conclusion** : le symptôme rapporté ("le chrono s'arrête au passage à la
section suivante") pourrait en réalité correspondre à un changement de *test*
(pas de *passage*) en cours de session, provoquant ce recouvrement de
minuteurs. À reconfirmer avec Xavier en conditions réelles.

**Risque de correction** : faible — ajouter 2 `clearInterval()` de garde.

---

## 7. Listes déroulantes de réponses

**Fichiers concernés** : `listening.html`, `reading.html`

**Confirmé.**

- **Listening** : `buildMatchingGroup()` (lignes 500-514) génère un
  `<select class="matching-select">` par ligne, pour les sections
  `type: 'matching'` (test01/02/03, section 3 — "Which researcher/person...").
- **Reading** : 10 `<select class="matching-select">` codés en dur directement
  dans le HTML (pas de fonction JS générique ici), tous concentrés sur
  Test01/Passage 2, questions 14-19 ("Matching Headings"). Test02/Test03
  utilisent des champs texte "sentence completion" pour leur passage
  équivalent — ce défaut ne touche donc pas l'ensemble des 3 tests Reading.

Le `<select>` HTML natif masque toutes les options sauf celle sélectionnée,
empêchant de lire la liste complète pendant le temps de préparation —
contrairement au vrai IELTS où la liste (chercheurs, titres A-H, etc.) reste
visible en permanence.

**Risque de correction** : moyen — remplacer par des boutons/radios visibles.
Un pattern de ce type existe déjà dans le même fichier pour les questions
MC/TFNG et peut servir de modèle, y compris pour la logique de correction
associée (lire un `input:checked` au lieu de `select.value`).

---

## 8. Fichiers audio et accents (Listening)

**Fichiers concernés** : `js/data.js`, `listening.html`, dossier `audio/`

**Référencement** : chaque section pointe un chemin relatif dans `data.js`
(ex. `audio: 'audio/test01/section1.mp3'`), lu via
`<audio id="audio-player">` dans `togglePlay()`.

**Stockage physique** : MP3 réels uniquement pour Test 01 et Test 02
(`audio/test01/section1-4.mp3`, `audio/test02/section1-4.mp3`) — MPEG-1 Layer
III, mono, 24 kHz, 128 kbps, métadonnées ffmpeg/LAME génériques (aucune trace
du moteur TTS d'origine, aucun script de génération dans le repo, aucun commit
antérieur montrant leur création — premier commit git les ajoute déjà tels
quels).

**Test 03** : pas de MP3, utilise la Web Speech API du navigateur en direct
(`speechSynthesis`), une seule voix `en-GB` modulée en `rate`/`pitch` pour
distinguer 2 locuteurs (`r:0.85,p:1.1` vs `r:0.92,p:0.88`, data.js:266) — ce
n'est pas un changement d'accent, juste un débit/hauteur différents de la même
voix système.

**Recherche de variété d'accents** : `grep -rn "en-GB|en-US|en-AU|en-NZ"` sur
tout le repo ne renvoie **que** des occurrences de `en-GB` — utilisé
systématiquement pour le TTS de Listening Test 03 et pour le bouton
"Hear question" du Speaking (`readQuestion()`, speaking.html:755).

**Conclusion** : lacune confirmée pour tout ce qui est synthétisé en direct
dans le code (un seul accent, `en-GB`, partout). Non prouvable ni infirmable
pour les MP3 pré-enregistrés de Test01/02 (métadonnées muettes sur ce point),
mais aucune preuve positive de variété non plus.

**Risque de correction** : chantier de contenu (production/récupération
d'audio varié), pas un correctif de code.

---

## 9. Speaking — structure des 9 blobs audio

**Fichiers concernés** : `speaking.html`, `worker/src/index.js`

**Structure conforme** : `SPEAKING_TESTS` (lignes 254-327) — Part 1 : 4
questions courtes ; Part 2 : 1 cue card (long turn, prep 60s, parole max 120s) ;
Part 3 : 4 questions de discussion. Total 4+1+4 = 9, cohérent avec
`recordings = new Array(9).fill(null)` (ligne 333) et la structure IELTS
officielle. `getRecordingIndex(part, qIdx)` (ligne 447) mappe correctement
chaque question à son slot.

**Bug confirmé (désalignement en cas de question sautée)** :

Frontend (`checkAndSubmit()`, lignes 763-825) :
```js
let audioIndex = 0;
for (let i = 0; i < allQs.length; i++) {
  const rec = recordings[i];
  if (!rec || !rec.blob || rec.blob.size < 100) continue;   // skip si pas d'enregistrement
  formData.append(`audio_${audioIndex}`, rec.blob, `q${i}.webm`);
  audioIndex++;   // ← renumérotation CONTIGUË, sans les trous
}
formData.append('questions', JSON.stringify(allQs.map(q => q.question)));  // tableau complet, jamais filtré
```

Worker (`handleSpeaking`, worker/src/index.js:174-214) :
```js
const questions = JSON.parse(questionsRaw);   // tableau complet, ordre original
let idx = 0;
while (true) {
  const audioFile = formData.get(`audio_${idx}`);
  if (!audioFile) break;
  audioParts.push({ ..., question: questions[idx] || `Question ${idx + 1}`, ... });
  idx++;
}
```

Si une question est sautée au milieu du test, le frontend renumérote les
blobs de façon contiguë, mais le tableau `questions` envoyé reste complet et
non filtré. Le Worker fait `questions[idx]` avec le **même compteur contigu**
que celui des blobs — dès qu'il y a un trou, **le libellé de question associé
à un enregistrement se décale et ne correspond plus au bon enregistrement**
(ex. l'audio de la Question 4 est étiqueté "Question 3" dans le prompt Gemini).
`TESTS.md` documente que le cas "question sans réponse" est géré pour éviter
un crash, mais rien n'indique que ce désalignement de libellé ait été traité.

**Conclusion** : découpage 4+1+4 conforme. Bug réel confirmé sur le
désalignement question/audio en cas de question sautée — cas plausible et
probablement fréquent en usage réel. Prep-timer Part 2 non forcé/automatique
(choix UX mineur, pas bloquant).

**Risque de correction** : moyen — touche `checkAndSubmit()` côté site et
`handleSpeaking()` côté Worker (envoyer les index originaux au lieu de
renuméroter).

---

## 10. Suivi du coût API (usageMetadata)

**Fichier concerné** : `worker/src/index.js`

**Lu partiellement, jamais loggé par appel individuel.**

```js
// callGemini(), ligne 119-123
const usage = data?.usageMetadata || {};
return {
  parsed,
  inputTokens:  usage.promptTokenCount     || 500,   // fallback silencieux
  outputTokens: usage.candidatesTokenCount || 500,
};
```

Seuls `promptTokenCount`/`candidatesTokenCount` sont lus (pas
`totalTokenCount`, ni `thoughtsTokenCount`, ni `cachedContentTokenCount`).
Utilisés une seule fois pour calculer un coût € éphémère (`estimateCost()`),
agrégé mensuellement en KV (`budget:${month}`), puis **jetés** — jamais dans
`logEvaluation()` (qui ne stocke que `{ type, bands, durationSeconds, ts }`),
jamais de `console.log` dédié.

**Problèmes identifiés** :
1. Aucun log des compteurs de tokens bruts par appel — impossible d'auditer
   le coût d'une requête précise a posteriori.
2. Fallback silencieux à `500`/`500` si `usageMetadata` absent/malformé,
   **sans aucun warning** — une anomalie de l'API Gemini serait invisible.
3. Incohérence côté Speaking (`handleSpeaking`, ligne 240) : `inputTokens`
   réel de `usageMetadata` est **ignoré**, remplacé par une formule forfaitaire
   indépendante (`300 + audioParts.length * 20`) sans rapport avec la vraie
   valeur retournée par Gemini.

**Conclusion** : `usageMetadata` n'est ni ignoré ni pleinement exploité — lu
partiellement, utilisé une fois, puis perdu. Voir `CORRECTIONS-PLAN.md`
Session 4 pour la correction proposée.

**Risque de correction** : faible.

---

## Point complémentaire — Tables de conversion Reading (Academic / General Training)

**Vérifié explicitement à la demande de Xavier.** Une seule table de
conversion existe dans tout le repo : `BAND_40` (js/data.js:9-15), utilisée
via `getBand()`. Confirmé par grep que **Listening ET Reading appellent la
même fonction `getBand()`** :

- `listening.html:539` → `const band = getBand(scaledTotal);`
- `reading.html:1550,1645` → `getBand(total)` / `getBand(isPartial ? scaledTotal : total)`

**Conclusion : aucune distinction Academic / General Training n'existe dans
le code.** Reading utilise exactement la même table que Listening, alors que
l'IELTS officiel prévoit deux tables distinctes pour Reading (General
Training étant plus strict) et une seule table commune pour Listening. C'est
un écart de conformité confirmé, à traiter en Session 3 (voir
`CORRECTIONS-PLAN.md`).

---

## Point complémentaire — Approfondissement UX du point 2 (Writing)

**Vérifié explicitement à la demande de Xavier.** Recherche des facteurs de
confusion possibles dans l'interface Writing :

1. **Boutons visuellement identiques** : les deux boutons "Get AI Feedback"
   (writing.html:208 et :248) portent exactement le même libellé
   "🤖 Get AI Feedback", sans mention "Task 1"/"Task 2" dans le texte du
   bouton lui-même. Seule la position sur la page (dans la carte Task 1 ou
   Task 2) et un petit badge `<span class="task-tag t1|t2">` les distinguent.
2. **Placeholders génériques et similaires** : `"Write your Task 1 answer here..."`
   vs `"Write your Task 2 answer here..."` — différence d'un seul mot, facile
   à ne pas remarquer en cas de copier-coller rapide.
3. **Aucun rappel du sujet évalué dans le retour IA** : `renderAIFeedback()`
   (lignes 431-457) affiche band, critères, résumé et "top tip", mais
   **n'affiche jamais le sujet/prompt réellement évalué**. Un candidat qui
   aurait écrit dans le mauvais encadré n'a donc aucun moyen, en lisant le
   retour IA, de repérer immédiatement l'incohérence (ex. un rappel "Sujet
   évalué : ..." à côté du band aurait permis de détecter l'erreur en un
   coup d'œil).

**Conclusion** : ces trois facteurs combinés (boutons identiques, placeholders
proches, absence de rappel du sujet dans le feedback) rendent plausible qu'un
candidat écrive ou colle du contenu dans le mauvais encadré sans s'en
apercevoir avant de lire un feedback qui semble "hors sujet". Voir
`CORRECTIONS-PLAN.md` Session 2 pour les garde-fous UX proposés (non codés).

---

## Fin de session

Aucune modification de code applicatif n'a été effectuée. Tag posé avant
session : `avant-audit-docs-2026-07-07`. Deux documents produits :
`AUDIT.md` (ce fichier) et `CORRECTIONS-PLAN.md`.

### Résumé (10 lignes max)

1. Bug confirmé avec certitude, fix trivial : band global (point 4, `dashboard.html`).
2. Bug confirmé, désalignement question/audio si question sautée en Speaking (point 9).
3. Bug confirmé, absence de `clearInterval()` de garde sur le minuteur Reading (point 6).
4. Cause confirmée du "score bloqué section 1" : gating par classe `done` en Listening (point 3).
5. Écart de conformité confirmé : aucune table Reading Academic/GT distincte, Reading = Listening (point complémentaire).
6. Le bug Writing "sujet ≠ évalué" n'est probablement pas un bug de code — cause UX plus probable (point 2 + point complémentaire).
7. Trou d'audit confirmé : ni le prompt/essai Writing ni les tokens usageMetadata ne sont loggés par appel (points 2 et 10).
8. Confirmé absent : reveal des questions Listening par blocs (point 5) — refonte, pas un correctif.
9. Confirmé : listes déroulantes illisibles en Reading Q14-19 et Listening matching (point 7).
10. **Incertain, à vérifier à l'exécution** : l'hypothèse initiale sur le minuteur Reading (reset au changement de *passage*) est infirmée par le code — le vrai bug touche le changement de *test*, à reconfirmer avec Xavier en conditions réelles. Idem pour la variété d'accents des MP3 pré-enregistrés (non vérifiable depuis les métadonnées seules).
