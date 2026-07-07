# CORRECTIONS-PLAN — ParrotTalk

> Plan de corrections découpé en sessions futures, basé sur `AUDIT.md`.
> Rien n'a été codé cette session — chaque correction est décrite au niveau
> exploitable (fichier, fonction, extrait de code visé, nature du changement,
> risque, dépendances) pour que les sessions suivantes soient du travail
> mécanique, sans réflexion à refaire.

---

## Action prioritaire — à faire en tout premier (Session 2)

### Fix band global (point 4 de l'audit)

**Fichier** : `dashboard.html`
**Fonction** : `loadDashboard()`
**Certain, localisé, risque faible.**

Code actuel (lignes 314-316) :
```js
const available = Object.values(skills).filter(v => v !== null);
const overall = available.length ? (available.reduce((a,b) => a+b, 0) / available.length).toFixed(1) : null;
```

Changement exact à appliquer (pattern déjà présent et validé juste au-dessus
dans le même fichier pour le calcul Writing, ligne 293 :
`Math.round(((t.t1 + t.t2 * 2) / 3) * 2) / 2`) :
```js
const available = Object.values(skills).filter(v => v !== null);
const rawAvg = available.length ? available.reduce((a,b) => a+b, 0) / available.length : null;
const overall = rawAvg !== null ? (Math.round(rawAvg * 2) / 2).toFixed(1) : null;
```

**Pourquoi ce fix et pas un autre** : `Math.round(x*2)/2` snappe toute valeur
sur le multiple de 0.5 le plus proche — exactement la règle IELTS (`.25` monte
à la demi-bande supérieure, `.75` monte à la bande entière supérieure, cf.
propriétés de l'arrondi standard appliqué à `x*2` avant division). Revérifier
avec l'exemple de l'audit : `(1+1+6)/3 = 2.6666` → `2.6666*2=5.333` →
`Math.round=5` → `5/2=2.5` (au lieu de l'actuel `"2.7"` impossible).

**Dépendances** : aucune — fonction autonome, pas de fichier consommateur à
adapter (le format de `overall` en sortie, une chaîne à 1 décimale, reste
identique).

**Test de validation suggéré** : rejouer le cas `listening=1.0, writing=1.0,
reading=6.0, speaking=null` et vérifier que l'Overall Band affiché est bien
un multiple de 0.5.

---

## Session 2 — Writing (logging + garde-fous UX) et persistance

### 1. Logging prompt/essai (point 2)

**Fichier** : `worker/src/index.js`
**Fonction** : `logEvaluation()` (lignes 70-75) et son appel dans
`handleWriting()` (ligne 167)

**Nature du changement** : ajouter au moins `testId`/`task` (déjà disponibles
dans le payload reçu) et un identifiant du prompt évalué (soit le `prompt`
complet, soit à défaut un hash court + les 100 premiers caractères) à l'objet
loggé. Objectif : pouvoir vérifier après coup, en cas de nouvelle réclamation
"hors sujet", quel prompt exact a été envoyé — sans avoir à stocker
l'intégralité de chaque essai si la taille du log KV est une contrainte.

**Risque** : faible — ajout de champs à un objet existant, pas de changement
de flux logique.

**Dépendance** : aucune avec le fix band global (fichiers différents).

### 2. Garde-fous UX Writing (point 2, approfondissement)

**Fichier** : `writing.html`
**Trois facteurs de confusion identifiés dans l'audit, trois garde-fous
proposés (à ne pas coder cette session, seulement décrire) :**

1. **Boutons ambigus** (lignes 208, 248) : libeller explicitement chaque
   bouton "🤖 Get AI Feedback — Task 1" / "🤖 Get AI Feedback — Task 2" au
   lieu du texte générique identique actuel.
2. **Placeholders trop proches** : renforcer visuellement la distinction
   (ex. couleur de bordure différente par tâche, déjà présente via
   `task-tag t1`/`t2` — étendre cette couleur à la bordure du `<textarea>`
   lui-même pour un repère visuel constant même hors du champ de vision du
   badge).
3. **Absence de rappel du sujet dans le feedback** — le plus impactant des
   trois : dans `renderAIFeedback()` (lignes 431-457), ajouter un bloc
   affichant le début du `prompt` réellement évalué (ex. les 100 premiers
   caractères de `data.prompt` si le Worker le renvoie en écho, ou simplement
   `promptText` déjà disponible côté client) juste au-dessus du band affiché —
   ex. *"Sujet évalué : Some people believe that universities should..."*.
   Permettrait à un candidat de repérer une incohérence en un coup d'œil.

**Risque** : faible pour 1 et 2 (CSS/HTML), faible à moyen pour 3 (nécessite
que le Worker renvoie le `prompt` en écho dans sa réponse JSON, ou que le
client réutilise `promptText` déjà en mémoire — à trancher selon si on veut
une preuve serveur ou un simple rappel client).

**Dépendance** : le point 3 (rappel du sujet) est indépendant du logging
Worker (point 1 ci-dessus) mais complémentaire — les deux visent le même bug
sous deux angles (audit rétrospectif vs prévention en temps réel).

### 3. Persistance / état entre sections (point 3)

**Fichiers** : `listening.html`, `reading.html`, `js/data.js`, `dashboard.html`
(consommateur du format de scores)

**Nature du changement proposé** (à concevoir plus précisément en session,
piste directrice seulement) :
- Remplacer le gating par classe CSS `done` (Listening) par une marque posée
  dès qu'un nombre minimum de réponses est saisi dans la section, ou dès que
  l'utilisateur quitte volontairement la section via la navigation (au lieu
  de dépendre exclusivement de la fin naturelle de l'audio/TTS) — décision à
  prendre avec Xavier sur la sémantique voulue ("done" = écouté en entier, ou
  "done" = tenté ?).
- Ajouter une sauvegarde incrémentale (ex. `localStorage` par section/passage,
  clé du type `ielts_progress_{testId}`) contenant uniquement des réponses et
  un statut de progression — **aucune donnée personnelle**, conforme à la
  règle Foundry "pas de données personnelles dans `/site` déployé".

**Risque** : moyen à élevé — touche 4 fichiers, nécessite de retester
l'ensemble du flux Listening + Reading après changement.

**Dépendance** : `dashboard.html` lit le format actuel de
`ielts_scores`/`ielts_reading_scores` — si le format de progression change,
vérifier que `loadDashboard()` reste compatible (même fonction que le fix
band global ci-dessus, mais partie différente du fichier — pas de conflit,
juste à tester ensemble).

---

## Session 3 — Conformité IELTS

*(Le point 4 — band global — est traité en tête de document, action
prioritaire déjà décrite. Il n'apparaît plus ici.)*

### 1. Affichage des questions Listening par blocs (point 5)

**Fichier** : `listening.html` + `js/data.js`
**Nature du changement** : refonte, pas un correctif ponctuel.
1. Ajouter aux données de chaque section (`js/data.js`) un découpage en
   sous-groupes de questions avec un timecode de déclenchement (à définir —
   absent des MP3 actuels pour test01/02, à mesurer manuellement ou à
   inventer pour le TTS de test03).
2. Réécrire `buildFormGroup`/`buildMCGroup`/`buildMatchingGroup` pour un rendu
   partiel (n'injecter que le sous-groupe courant) + écouteur sur `timeupdate`
   (MP3) et sur l'avancement de `speakNext()` (TTS) pour révéler le
   sous-groupe suivant au bon moment.

**Risque** : élevé. **Recommandation** : si trop volumineux pour une session,
cadrer comme chantier à part (ex. Session 3bis dédiée), à discuter avec Xavier
avant de démarrer.

### 2. Minuteur Reading (point 6)

**Fichier** : `reading.html`
**Fonctions** : `startTimer()` (lignes 1579-1592), `selectTest()`
(lignes 1557-1565)

**Nature du changement** :
```js
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);   // ← garde à ajouter
  secondsLeft = 3600;
  timerInterval = setInterval(() => { ... }, 1000);
}

function selectTest(id) {
  if (timerInterval) clearInterval(timerInterval);   // ← garde à ajouter
  currentReadingTest = id === 'test03' ? 3 : id === 'test02' ? 2 : 1;
  ...
}
```

**Risque** : faible. **Avant de coder** : reconfirmer avec Xavier en
conditions réelles que le symptôme apparaît bien lors d'un changement de
*test* (relance) et non de *passage* comme initialement supposé — l'audit a
infirmé l'hypothèse littérale sur `switchPassage()`.

### 3. Tables de conversion Reading Academic / General Training

**Fichier** : `js/data.js` (+ consommateurs `reading.html`)

**Constat confirmé** : une seule table (`BAND_40`) existe, utilisée
identiquement par Listening et Reading via `getBand()`. Aucune distinction
Academic/GT.

**Nature du changement** : ajouter une seconde table (ex. `BAND_40_GT`) avec
les seuils officiels General Training (plus stricts que Academic à score égal),
un paramètre ou une variante de test pour indiquer laquelle utiliser, et
adapter les appels `getBand()` de `reading.html` pour passer ce paramètre.
**Prérequis avant de coder** : obtenir les seuils officiels GT (référentiel
IELTS externe non présent dans ce repo au moment de l'audit — à fournir par
Xavier ou à sourcer).

**Risque** : moyen — nouvelle donnée + un paramètre supplémentaire à
propager, mais pas de changement de logique de calcul.

**Dépendance** : aucune avec les autres points de cette session.

---

## Session 4 — UX secondaire et instrumentation

### 1. Listes déroulantes (point 7)

**Fichiers** : `listening.html` (`buildMatchingGroup()`, lignes 500-514),
`reading.html` (10 blocs `<select class="matching-select">` codés en dur,
Q14-19)

**Nature du changement** : remplacer chaque `<select>` par une liste de
boutons/radios visibles en permanence (pattern déjà utilisé pour les
questions MC/TFNG dans les mêmes fichiers — réutilisable comme modèle),
adapter la lecture de réponse (`input:checked` au lieu de `select.value`)
dans les fonctions de correction associées.

**Risque** : moyen — `listening.html` : 1 fonction propre à modifier ;
`reading.html` : 6 blocs HTML dupliqués à réécrire un par un (pas de fonction
générique existante ici, contrairement à Listening).

### 2. Désalignement question/audio Speaking (point 9)

**Fichiers** : `speaking.html` (`checkAndSubmit()`, lignes 763-825),
`worker/src/index.js` (`handleSpeaking()`, lignes 174-214)

**Nature du changement** : envoyer les **index originaux** (0-8) avec chaque
blob au lieu de la renumérotation contiguë actuelle — ex.
`formData.append(\`audio_${i}\`, rec.blob, ...)` (utiliser `i`, l'index
d'origine dans `allQs`, au lieu de `audioIndex` incrémenté séparément). Côté
Worker, `handleSpeaking()` devra itérer sur les index potentiellement non
contigus (boucle `for` sur `questions.length` avec vérification
`formData.get(\`audio_${i}\`)` au lieu du `while(true)` actuel qui suppose une
contiguïté depuis 0).

**Risque** : moyen — touche les deux côtés (site + Worker), à tester avec un
scénario réel de question sautée avant/après le fix.

**Dépendance** : aucune avec les autres corrections de cette session.

### 3. Logging usageMetadata (point 10)

**Fichier** : `worker/src/index.js`

**Nature du changement** :
1. Dans `callGemini()` (lignes 119-123), lire aussi `totalTokenCount` en plus
   des deux champs déjà lus.
2. Dans `logEvaluation()` (lignes 70-75) et son usage dans `handleWriting()`/
   `handleSpeaking()`, ajouter `inputTokens`/`outputTokens` à l'objet loggé
   (actuellement seulement `{ type, bands, durationSeconds, ts }`).
3. Ajouter un `console.warn` explicite quand le fallback `500`/`500` est
   utilisé (`usageMetadata` absent/malformé), pour rendre l'anomalie visible
   au lieu de la masquer silencieusement.
4. Dans `handleSpeaking()` (ligne 240), remplacer la formule forfaitaire
   `300 + audioParts.length * 20` par la vraie valeur `inputTokens` retournée
   par `usageMetadata`, cohérent avec ce qui est déjà fait pour Writing.

**Risque** : faible — ajouts de champs et correction d'une formule, pas de
changement de flux.

---

## Chantier séparé — Vérification automatique des tests par IA avant publication

**Objectif de Xavier** : que chaque nouveau test créé soit automatiquement
validé par une IA avant sa mise en ligne — vérifier que chaque question a
bien sa réponse présente dans l'audio/le texte, que les questions
correspondent au contenu, et à terme que le band calculé est juste. Vouloir
l'instaurer maintenant (3 tests) plutôt que plus tard (10 tests).

**Constat préalable** : les 3 agents d'exploration n'ont trouvé aucun pipeline
de création de test existant — les tests sont ajoutés à la main, directement
dans le code (`js/data.js` pour Listening, HTML inline pour Reading/Writing/
Speaking). Ce chantier est à concevoir depuis zéro, pas à adapter d'un
processus existant.

**Pistes d'approche (à discuter, pas à coder)** :

1. **Comme étape manuelle avant publication** : un script (ou un prompt
   Claude Code dédié) à lancer sur un nouveau bloc de données de test avant
   de le committer — prend en entrée le JSON/objet du test, vérifie par appel
   à une IA (Gemini ou Claude) que chaque question a une réponse cohérente
   avec le contenu source (transcript audio ou passage de texte), et retourne
   un rapport de conformité avant publication humaine.
2. **Comme validation intégrée à un futur pipeline de contenu** : si un jour
   un outil d'ajout de test est construit (au lieu de l'édition manuelle du
   code), cette vérification IA en deviendrait une étape automatique du
   pipeline plutôt qu'un script à lancer à la main.

**Recommandation** : commencer par l'option 1 (script/prompt à la demande),
plus rapide à mettre en place vu l'absence de pipeline existant, et
suffisante tant que le volume de tests reste faible (3 aujourd'hui). Réévaluer
l'option 2 si le rythme de création de nouveaux tests s'accélère.

**Risque/complexité** : non estimé — chantier de conception, pas une
correction de bug. À cadrer dans une session dédiée une fois les sessions 2-4
terminées.
