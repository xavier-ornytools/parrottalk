# ParrotTalk — Tests techniques

## P1.3 — Writing en deux temps (2026-07-14) ✅

Branche `feat/writing-two-step-wip`. Défaut examen blanc : Task 1 et Task 2 s'affichaient ensemble (gros paquet). Correctif : Task 2 masquée au départ, un pont « Continue to Task 2 » l'ouvre au clic, et elle s'ouvre **automatiquement à 20 min** (`startTimer`, `totalSeconds === 2400`). Pages plus courtes, format conforme (T1 puis T2). Le chrono unique 60 min et la logique d'évaluation sont inchangés. Note : W1 de l'audit de conformité (qui jugeait « 2 tâches ensemble » CONFORME) est à réviser en conséquence.

Implémentation (`writing.html`) : `hideTask2()`/`revealTask2()`, `hideTask2()` au démarrage, auto-ouverture à 2400s, et `resumeTest` rouvre Task 2 si elle a déjà été entamée ou évaluée (sinon elle resterait masquée après un rechargement).

### Testé avec
- Vérif ciblée (Playwright, vrai Chrome) : **9/9**. Frais : Task 2 masquée + pont visible ; clic → Task 2 ouverte, pont masqué ; auto-ouverture quand le chrono atteint 20 min ; reprise : Task 2 rouverte et contenu restauré.
- Non-régression : e2e feedback **36/36** (flux Writing Task 2), smoke P0 **16/16**.

## P1.1 — Révélation progressive Listening (2026-07-14) ✅

Branche `feat/listening-progressive-reveal`. Défaut examen blanc : les 4 sections étaient toutes accessibles d'emblée (pas de révélation progressive). Correctif (mode examen) : une section ne se déverrouille que lorsque l'audio de la précédente a été joué (`sectionsPlayed`) ou qu'elle a été validée (`sectionsDone`), comme le vrai IELTS. En mode practice, navigation libre inchangée. Vaut pour les 3 tests (indépendant du contenu audio, donc de P1.2).

Implémentation (`listening.html`) : `sectionUnlocked(i)` + `refreshTabLocks()`, garde dans `switchSection`, rafraîchissement après `togglePlay` (audio joué) et `finishSection` (section validée). Onglet verrouillé : classe `.tab-btn.locked` (grisé, `disabled`, tooltip). Consigne mise à jour.

### Testé avec
- Vérif ciblée (Playwright, vrai Chrome) : **9/9**. Exam : S1 libre, S2/S4 verrouillées au départ, saut vers section verrouillée refusé, S2 déverrouillée après lecture de S1, S3 encore verrouillée, navigation OK une fois déverrouillée. Practice : tout libre, saut direct à S4 autorisé.
- Non-régression : smoke P0 **16/16**.

## Résilience quota Gemini + micro-correctifs (2026-07-14) ✅

Contexte : la clé Gemini était sur le palier gratuit (20 requêtes/jour), un candidat a pris un 429. Xavier a activé la facturation (projet `gen-lang-client-0553736701`, crédit prépayé 50 €, recharge auto désactivée). Appel de test réel sur le Worker : évaluation renvoyée en HTTP 200, plus de 429.

Branche `fix/quota-resilience` :
1. **429 gracieux + relance auto** (`writing.html` `getAIFeedback`, `speaking.html` `checkAndSubmit`). Sur 429/503 : message « High demand right now, retrying in a moment » (au lieu de l'erreur Gemini brute), une relance automatique après 6 s, puis bouton « Try again » si l'échec persiste. Les copies/enregistrements ne sont jamais perdus.
2. **beforeunload Writing désarmé après soumission** (`hasUnsavedWork` compare le texte au texte déjà soumis `submittedEssays`). Fini le « modifications non enregistrées » anxiogène quand la copie est déjà notée (ex. « Continue to Speaking »).

### Testé avec
- Vérif ciblée (Playwright, vrai Chrome) : **7/7**. Après soumission Writing, `hasUnsavedWork() === false` ; sur 429 injecté, message « High demand », aucune fuite du message Gemini brut, relance auto (2e appel), bouton « Try again » ensuite.
- Non-régression : smoke P0 **16/16**, e2e feedback **36/36**.

### Note alerte Telegram
`logGeminiFailure` incrémente `errors:<jour>` sur toute réponse non-OK de Gemini, **429 compris** (l'alerte n'est pas aveugle). Seuil actuel ≥ 3 erreurs/jour. À suivre : suivi du solde prépayé (le crédit coupe à zéro sans recharge auto) et éventuel abaissement du seuil / alerte quota dédiée.

## Corrections post examen blanc — P0 (2026-07-14) ✅ (en cours, P1 à suivre)

Branche `fix/exam-blanc-p0` (tag de départ `pre-exam-blanc-p0`). Trois points, un commit chacun :

1. **P0.1 Continuité entre les 4 épreuves** (`7e769b5`). Nouveau module partagé `js/exam-flow.js` : ordre officiel Listening → Reading → Writing → Speaking, mode « examen blanc complet » (`pt_mock`), écran de fin « You've completed all four ». `renderNextStep` ajouté à la fin de chaque écran de résultats (plus de cul-de-sac). Entrée « Full Mock Exam » sur l'accueil et le dashboard. Styles `.exam-flow` / `.exam-done`.
2. **P0.2 Questionnaire cohérent + garde réponse** (`19c9eac`). `feedback-gate.js` : déverrouillage scopé par épreuve (`ielts_feedback_unlocked_<type>`) au lieu d'une clé globale qui sautait le gate partout après une réponse. Deux régimes : mock = rapports libres pendant le parcours + un seul questionnaire final (`renderFinalQuestionnaire` déverrouille les 4 rétroactivement) ; épreuve isolée = un questionnaire par épreuve. Reading et Listening intègrent enfin le gate (band libre, détail gaté). Garde « au moins une réponse » ajouté à la soumission Listening (les 3 autres l'avaient).
3. **P0.3 Bouton mort** (`094dd67`). Le bouton « Show All Correct Answers » était invisible (`.btn-outline` fond blanc + texte blanc inline) sur la carte de résultats sombre. Remplacé par `.btn-outline--on-dark` (lisible). Bloc de continuité déplacé sous la carte (fond clair).

### Testé avec
- Smoke test réel (Playwright, vrai Chrome) : **16/16**. Couvre : chargement des 6 pages sans exception JS, globals `ExamFlow`/`FeedbackGate` présents, boutons mock, garde « soumission sans réponse bloquée » (Listening), régime isolé (band libre + détail gaté par le questionnaire), régime mock (détail libre + lien de continuité).
- Syntaxe JS validée (`node --check` sur `exam-flow.js` et `feedback-gate.js`, `new Function` sur les blocs inline des 6 pages).

### Reste à faire (P1) puis vérif finale
- P1.1 révélation progressive Listening, P1.2 ordre questions/audio (transcription Gemini), P1.3 Writing deux temps, P1.4 refonte visuelle Speaking + suppression Web Speech.
- e2e parcours complet (mock, 1 seul questionnaire à la fin) + épreuve isolée + Speaking sans Web Speech.
- Vérif prod par Xavier, mobile, marqueur `pt_internal`, avant clôture.

## Écran de remerciement + commentaire libre + accueil 100% anglais (2026-07-14) ✅

Tag avant : `ui-session-2026-07-14-feedback-thankyou`. Branche `feat/feedback-thankyou-comment`, repartie de `main`. Trois chantiers :

1. **Écran de remerciement** après le micro-feedback : image multilingue du perroquet (`img/parrot-thanks.webp`, WebP 30 Ko, 480x480, préchargée pendant la 3e question) + texte fixe, bouton « See my detailed feedback » qui révèle le rapport. Styles `.fb-thanks` dans `css/main.css`.
2. **Champ commentaire libre optionnel** après la 3e question, avant l'écran merci : textarea 500 caractères max, bouton Skip visible. Envoyé au Worker sous la clé `freeComment` (POST `/feedback`), nettoyé des caractères de contrôle et borné à 500 côté Worker (`sanitizeFeedback`), échappé à l'affichage. Le collecteur Foundry archive la clé et le rapport v3 remonte les verbatims (section E).
3. **Accueil 100 % anglais** : suppression des sections françaises `#pre-beta` et `#beta-feedback`, de la fonction `handleBetaFeedback`, des PDF `beta/`. Aucun lien mort, sections HTML équilibrées (8/8), aucun français résiduel.

### Ordre du flux
Question 1, 2, 3, puis commentaire libre (Skip possible), puis écran merci (image + texte), puis rapport détaillé, puis note de beta.

### Testé avec
- `node tests/e2e-feedback.js` (Playwright, vrai Chrome) : **36/36**. Couvre le nouveau flux (écran commentaire, écran merci avec image, `freeComment` dans le POST, révélation après le merci), la persistance au reload, et les 2 tâches Writing.
- Syntaxe JS validée (`node --check` sur `feedback-gate.js` et `worker/src/index.js`).
- Rendu vérifié en captures (écran commentaire + écran merci).

### Déploiement (au go de Xavier, après vérif navigateur)
- Site : merge dans `main`, Vercel déploie.
- Worker : `npx wrangler deploy` (indispensable pour que `freeComment` soit stocké).
- Foundry : `report_v3.py` (verbatims section E) déjà sur master.

## Key events GA4 + exclusion du trafic interne (2026-07-13) ✅

Tag avant : `measure-session-2026-07-13-ga4-events`. Branche `feat/ga4-key-events`,
repartie de `main`. Chantier de mesure : savoir combien de visiteurs FONT quelque
chose, pas juste combien arrivent. Aucune nouvelle UI, aucun flux modifié : des
appels `gtag` aux endroits existants.

### Référence des events (à utiliser pour lire les rapports GA4)

| Event | Params | Émis quand / où |
|---|---|---|
| `test_started` | `section`, `test_number` | Démarrage d'un test (Writing `startWritingTest` hors reprise, Speaking `startTest`, Reading/Listening `startTest` hors reprise) |
| `section_completed` | `section`, `test_number` | Writing : soumission d'une tâche (`getAIFeedback`) ; Speaking : soumission (`checkAndSubmit`) ; Reading : `finishReadingPassage` ; Listening : `finishSection` |
| `evaluation_received` | `section`, `band_score` | Retour du band IA (Writing `renderAIFeedback`, Speaking `renderSpeakingFeedback`) |
| `feedback_completed` | `section` | Les 3 questions du micro-feedback répondues (`js/feedback-gate.js`) |
| `beta_rating_given` | `rating` | Note de beta 1-5 cliquée (`js/feedback-gate.js`) |

`section` ∈ {writing, speaking, reading, listening}. `test_number` = numéro (1/2/3)
ou id (`test01`…) selon la page. Writing/Speaking émettent les 5 events ;
Reading/Listening émettent `test_started` + `section_completed`.

### Exclusion du trafic interne

- Marqueur `localStorage.pt_internal = "1"`, posé par la page cachée **`/internal.html`**
  (noindex, aucun lien depuis le site, un bouton pour activer/désactiver).
- `js/analytics.js` : helper `window.ptEvent(name, params)` centralise tout envoi.
  Si `pt_internal=1` → **aucun key event n'est envoyé** ET le `page_view` est marqué
  `traffic_type=internal` (via `gtag('config', ID, {traffic_type:'internal'})`,
  méthode standard GA4 filtrable côté propriété).
- Consentement respecté : `ptEvent` n'envoie que si GA4 est déjà chargé (bandeau
  cookies accepté), et n'initialise jamais GA4 de lui-même. Bandeau inchangé.
- `js/feedback-gate.js` : son helper `ga()` délègue désormais à `ptEvent` (donc les
  events feedback respectent aussi l'exclusion interne).

### Testé avec
- `node tests/e2e-ga4-events.js` (Playwright, vrai Chrome, vrai `googletagmanager`
  bloqué, `window.gtag` remplacé par un enregistreur) : **14/14**. Les 5 events
  partent avec leurs params sur les bonnes pages ; en mode interne (`pt_internal=1`)
  **aucun event n'est émis** ; `/internal.html` pose bien le marqueur.
- Non-régression : feedback 31/31, persistance 50/50, cycle de vie Writing 30/30,
  images 27/27.

### Déploiement
Non déployé : en attente de la vérification locale de Xavier (aucun merge sans feu vert).

---

## robots.txt + sitemap.xml (2026-07-13) ✅

Tag avant : `seo-session-2026-07-13-robots-sitemap`. Branche `seo/robots-sitemap`,
repartie de `main`. Chantier identifié à l'audit conformité : `/robots.txt` était
en 404. ParrotTalk est classé n°1 par ChatGPT pour les outils IELTS gratuits avec
IA, le canal IA fait l'essentiel du trafic → accueil explicite des crawlers IA.

- `robots.txt` : `Allow: /` explicite pour GPTBot, OAI-SearchBot, ChatGPT-User,
  ClaudeBot, Claude-User, PerplexityBot, Google-Extended, Googlebot, Bingbot ;
  règle par défaut permissive (`User-agent: *` `Allow: /`) ; ligne
  `Sitemap: https://www.parrottalk.app/sitemap.xml`.
- `sitemap.xml` : 9 pages (accueil `/`, les 4 épreuves + dashboard, 3 pages
  légales), URLs canoniques `https://www.parrottalk.app/`. La FAQ est une section
  de l'accueil (pas de page dédiée), couverte par l'URL racine.
- Domaine canonique confirmé par test réel : `parrottalk.app` renvoie 308 →
  `www.parrottalk.app`.

**Testé avec :**
- Local : `/robots.txt` → 200 `text/plain`, `/sitemap.xml` → 200
  `application/xml`, XML bien formé (9 `<loc>`), 9 URLs = 9 fichiers réels.
- `vercel.json` audité : aucun `rewrite`/`redirect` ne touche `/robots.txt` ni
  `/sitemap.xml` (les rewrites ne visent que `/api/`).
- Validation navigateur manuelle par Xavier (serveur local) avant merge.

### Déploiement
Mergé sur `main` (merge commit `be32f22`) et poussé. Worker inchangé. Déploiement
Vercel confirmé par `curl` : `www.parrottalk.app/robots.txt` → 200 `text/plain`
(agents IA + moteurs + ligne Sitemap présents), `www.parrottalk.app/sitemap.xml`
→ 200 `application/xml` (9 URLs), et `parrottalk.app/robots.txt` suit le 308 vers
le www (200 final). Déclaration du sitemap dans Search Console faite par Xavier
lui-même (hors périmètre code).

---

## Optimisation des images WebP (2026-07-13) ✅

Tag avant : `ux-session-2026-07-13-image-optim`. Branche
`perf/image-optimization`, repartie de `main`. Durcissement 3 de l'audit
système. Marché cible en 3G à données chères (Pakistan, Ouzbékistan, Vietnam,
Algérie), 1er sur ChatGPT : chaque Mo de trop fait fuir des visiteurs.

Toutes les images affichées converties en WebP (Pillow, q80 illustrations, q88
graphiques pour la lisibilité) et redimensionnées à ~2x leur taille d'affichage
réelle (logo 1254px → 96px, mascottes 260px → 520px, héros → 960-1140px, app-mockup
→ 840px). `loading="lazy"` sur les 4 images de l'accueil sous la ligne de
flottaison (hero-rocket et logo restent eager). PNG d'affichage remplacés
supprimés (13). Contenu et layout inchangés : seules les images et leurs
attributs bougent (mêmes aspect ratios, mêmes tailles CSS). Pas de fallback
`<picture>` (WebP supporté par tous les navigateurs cibles).

**Mesures avant / après (images affichées) :**
- Accueil : ~9,6 Mo → **349 Ko** total, dont **110 Ko** au 1er rendu (le reste en lazy).
- Exercice (listening/reading/writing/speaking) : ~2,3 Mo → **~30 Ko**.
- Dashboard : ~1,7 Mo → **58 Ko**.
- `img/` global : 18 Mo → **2,1 Mo** (dont 1,5 Mo de `banner-hero.png` orpheline,
  jamais affichée ni en méta — laissée hors périmètre, **à supprimer dans un
  prochain chantier**).

**Testé avec :**
- `node tests/e2e-images.js` (Playwright, Chrome) : **27/27** sur 9 pages —
  chaque image affichée se décode (`naturalWidth>0`, lazy-load déclenché par
  défilement + `img.decode()` déterministe), toutes en WebP, zéro erreur HTTP.
- Non-régression : cycle de vie Writing **30/30**, persistance **50/50**,
  feedback **31/31**.
- **Validation navigateur manuelle par Xavier** (serveur local) : accueil + 5
  pages d'exercice, desktop + mobile simulé, aucune image floue ni déformée.

### Déploiement
Mergé sur `main` (merge commit `60efaf0`) et poussé. Worker inchangé.
Déploiement Vercel confirmé par `curl` : `index.html` sert 6 références `.webp`
(0 `.png`), les WebP arrivent en `Content-Type: image/webp`, l'ancien
`logo-official.png` renvoie 404 (supprimé de la prod).

---

## Cycle de vie Writing + cohérence énoncé/évaluation (2026-07-13) ✅

Tag avant : `ux-session-2026-07-13-writing-lifecycle`. Branche
`fix/writing-lifecycle`, repartie de `main`.

**Deux symptômes, une cause + un bug de cohérence critique.** À l'ouverture, le
Test 1 se lançait tout seul (chrono compris) et les boutons Test 2/3 étaient
sans effet. Cause : `restoreDraftIfAny`/`tryRestoreWritingFeedbackOnLoad`
s'exécutaient au chargement dès qu'un brouillon/feedback traînait en
localStorage, et `selectWritingTest` ne re-rendait pas. **Bug de cohérence
confirmé** : `getAIFeedback` envoyait `WRITING_DATA[currentWritingTest]` ;
cliquer Test 2 après affichage du Test 1 mettait `currentWritingTest=2` en
silence (écran inchangé), donc l'énoncé envoyé à Gemini et enregistré dans les
logs était celui du Test 2 alors que le candidat répondait au Test 1. Des
évaluations passées ont pu être faites contre le mauvais énoncé (non
quantifiable côté client : logs KV sans endpoint de listing).

Corrections : écran d'accueil sans test lancé ni chrono ; le chrono ne démarre
qu'à un Start explicite ; changer de test avant démarrage change le choix, en
cours de test demande confirmation puis reset propre (chrono, champs, compteurs,
feedback) ; cohérence garantie par construction (`currentWritingTest` == test
affiché) ET `getAIFeedback` lit désormais l'énoncé **exactement depuis le DOM
affiché** ; autosave à **une clé par test** (`ielts_writing_draft_test<n>`, un
brouillon du Test 1 ne peut plus se restaurer dans le Test 2) ; restauration au
rechargement **gated par sessionStorage** (seul un reload du même onglet en
cours de test restaure ; une arrivée fraîche montre l'accueil).

**Testé avec :**
- `node tests/e2e-writing-lifecycle.js` (Playwright, Chrome) : **30/30**. Accueil
  sans chrono, sélection réelle des 3 tests, changement avant/après démarrage
  (avec confirmation annuler/accepter), reprise au rechargement, isolation des
  brouillons par test, et surtout **cohérence** : POST `/evaluate/writing`
  intercepté, `prompt` envoyé == énoncé affiché au caractère près, bien celui du
  test choisi et jamais d'un autre.
- Non-régression : `tests/e2e-persistence.js` **50/50** (2 tests Writing mis à
  jour à la clé par test) et `tests/e2e-feedback.js` **31/31**.
- **Validation navigateur manuelle par Xavier** (serveur local) : 3 tests,
  changement avant/après démarrage, rechargement en cours de test.

**Audit des autres sections (constat, non corrigé cette session) :** Speaking
n'a PAS le défaut (écran de pré-test à l'ouverture, pas de chrono). Listening et
Reading ont le même motif d'auto-reprise (`init()` → `startTest()` +
`startTimer()` au chargement si progression en localStorage, non borné à la
session) mais c'était un choix délibéré de la session du 07/07 ; le même garde
`sessionStorage` pourrait leur être appliqué si on veut aligner le comportement.

### Déploiement
Mergé sur `main` (merge commit `6b52be1`) et poussé. Worker inchangé (pas de
redéploiement). Déploiement Vercel confirmé par `curl` sur
`www.parrottalk.app/writing.html` : clé par test, bouton Start explicite et
garde `sessionStorage` présents dans le HTML servi.

---

## Micro-feedback post-score (2026-07-13) ✅

Tag avant : `ui-session-2026-07-13-micro-feedback`. Branche
`feat/micro-feedback-post-score`, repartie de `main`. Objectif business :
capter du feedback des visiteurs organiques (68 users, 30 pays, zéro retour
spontané) par un échange de valeur au moment du score.

Le band global reste exact, gratuit et immédiat (démo produit, jamais touché) ;
le rapport détaillé (critères, corrections, conseils, transcript) se débloque
après 3 questions à un clic (échelles 5 niveaux type Typeform), avec une barre
de progression et une révélation en douceur (pas de rechargement). Une note de
beta 5 niveaux (Poor → Excellent) optionnelle clôt le rapport.

Implémentation : nouveau module partagé `js/feedback-gate.js` (Writing +
Speaking), styles `css/main.css` (`.fb-*`, mobile-first, boutons ≥ 60px), et
endpoint Worker `POST /feedback` qui logge dans `RATE_KV` avec le **même
mécanisme anonyme que les logs de calibration** (TTL 90 jours). `sanitizeFeedback`
ne conserve que des valeurs d'énumération connues + band + type d'épreuve ; toute
valeur libre/nominative ou hors bornes → `null` (aucun email, aucune donnée
nominative, cohérent avec la privacy policy). Envoi `POST` fire-and-forget
(jamais bloquant) + un event GA4 par réponse (sous consentement). `localStorage`
empêche de reposer les questions et restaure le rapport débloqué au rechargement.

**Testé avec :**
- `node tests/e2e-feedback.js` (Playwright, Chrome système) : **31/31**. Band
  visible / détail verrouillé / 3 questions à échelles 5 niveaux / révélation /
  note 1-5 / POST `/feedback` intercepté avec la bonne charge / reload qui
  restaure le détail sans reposer les questions / déblocage Writing valable pour
  les 2 tâches.
- `sanitizeFeedback` testé sur le **code réel du Worker** : **8/8** (nouvelles
  échelles acceptées, anciennes valeurs et injections rejetées, `betaRating`
  borné 1-5, band clampé, champs parasites ignorés).
- Non-régression : `node tests/e2e-persistence.js` **50/50** (autosave, consentement
  micro, cookies, FAQ, persistance Listening/Reading inchangés).
- **Validation navigateur manuelle par Xavier** (serveur local, desktop +
  mobile simulé) : flux complet score → 3 questions → rapport → note beta,
  boutons et échelles, persistance, mobile. Validée avant tout merge.

### Déploiement
Worker déployé d'abord (`npx wrangler deploy`, version `20b6a2b4`) ; endpoint
`/feedback` vérifié réellement par `curl` (HTTP 200 `{"ok":true}` sur payload
valide et sur note beta, `/stats` intact). Puis site mergé sur `main` (merge
commit `42be64e`) et poussé ; déploiement Vercel confirmé par `curl` sur
`www.parrottalk.app` (include `feedback-gate.js` présent sur writing.html et
speaking.html, `js/feedback-gate.js` servi en 200, styles `.fb-opt--selected`
en ligne).

---

## Autosave Writing anti-perte de copie (2026-07-13) ✅

Branche `feat/writing-autosave`, repartie de `main`. Périmètre : `writing.html`
(logique d'autosave) + `tests/e2e-persistence.js` (nouveau test). Corrige le
risque n°1 (CRITIQUE) de l'audit système du 13/07 : l'essai Writing ne vivait
que dans le DOM, un rechargement de page / crash / fermeture d'onglet perdait
jusqu'à 40 min de rédaction.

Trois changements dans `writing.html` :
- Autosave continu de l'essai dans `localStorage` (clé `ielts_writing_draft`,
  debounce 800 ms). Purement local, aucune donnée ne quitte le navigateur.
- Restauration automatique au chargement (`restoreDraftIfAny` sur
  `DOMContentLoaded`) : la zone de test se rouvre avec les deux tâches et les
  compteurs de mots recalculés, sans aucun clic de l'utilisateur.
- `startWritingTest(resume)` : un démarrage neuf (bouton Start) efface le
  brouillon et repart d'une page blanche ; une reprise (`resume=true`) conserve
  le texte restauré. Garde `beforeunload` : confirmation avant de quitter s'il
  reste du texte non soumis, avec sauvegarde au passage.

**Testé avec :**
- `node tests/e2e-persistence.js` (Playwright, Chrome système) : **50/50, 0
  échec, 0 erreur JS**. 7 vérifications Writing ajoutées (brouillon écrit
  pendant la saisie, zone rouverte automatiquement après reload, Task 1 et
  Task 2 restaurées à l'identique, compteur de mots recalculé, démarrage neuf
  qui vide le champ et efface le brouillon). Les 43 tests préexistants
  (persistance Listening/Reading, consentement micro, bandeau cookies, FAQ)
  ne régressent pas.
- **Vérification navigateur manuelle par Xavier** sur le serveur local
  (`http://localhost:8000/writing.html`, branche `feat/writing-autosave`) :
  autosave + restauration OK, garde `beforeunload` OK, reset propre au Start
  OK. Validée avant merge.

### Déploiement
Mergé sur `main` (merge commit `7fa7eeb`, `feat/writing-autosave` conservée) et
poussé sur `origin/main`. Déploiement Vercel confirmé réellement par `curl
https://www.parrottalk.app/writing.html` : tous les marqueurs du nouveau code
sont présents dans le HTML servi en production (clé `ielts_writing_draft`,
`restoreDraftIfAny`, garde `beforeunload`, toast « Draft recovered », chemin de
reprise `startWritingTest(true)`), réponse HTTP 200.

---

## Balise de vérification Google Search Console (2026-07-10) ✅

Tag avant : `ops-session-2026-07-10-gsc-verification`. Branche
`feature/gsc-verification`, repartie de `main`. Périmètre strict : une
seule balise `<meta>` ajoutée dans `index.html`, rien d'autre touché.

La vérification Search Console par méthode GA4 avait échoué ("aucun code
de suivi Analytics trouvé sur la page d'index") car le tag GA4 ne se
charge qu'après consentement cookies, invisible pour le robot Google.
Bascule sur la méthode balise HTML meta : ajoutée en dur dans le
`<head>` de `index.html`, avant les scripts, sans aucune condition de
consentement (`js/cookie-banner.js`, `js/analytics.js` non modifiés).

```html
<meta name="google-site-verification" content="EHtVno9eNHVqmMhtAGzPRdLt6PP1LnHX1_pGuPoH6SQ" />
```

**Point de convention à ne jamais oublier :** cette balise doit rester en
place définitivement une fois la propriété validée par Google. Ne jamais
la retirer dans une session future, y compris lors d'un reformatage du
`<head>`.

**Testé avec :**
- `npm test` (`tests/check.js`) : 67/72, identique aux sessions
  précédentes (5 échecs préexistants, sans rapport).
- Vérification visuelle du `<head>` : balise présente ligne 6, avant les
  deux `<script>` (`analytics.js`, `cookie-banner.js`), aucune condition
  JS autour.

### Déploiement
Mergé sur `main` (fast-forward, commit `721c49f`) et poussé sur
`origin/main`. Vérifié réellement avec `curl https://www.parrottalk.app/`
juste après déploiement Vercel : la balise est présente dans le HTML brut
retourné par le serveur (donc visible par un robot sans exécuter de JS),
avant les deux `<script>`, exactement comme prévu.

---

## Encadrement du formulaire de retour (2026-07-09) ✅

Tag avant : `ops-session-2026-07-09-feedback-frame`. Branche
`feature/beta-feedback-frame`, repartie de `main`. Périmètre strict :
`#beta-feedback` uniquement, pour l'encadrer visuellement comme le reste
de la home. Rien d'autre touché.

`#beta-feedback` avait déjà une bande dégradée en bas (`.beta-feedback__stripe`,
ajoutée lors d'une session précédente) mais rien en haut, contrairement au
bloc `#pre-beta` qui a les deux. Ajout d'un modificateur `.beta-feedback__stripe--top`
(`css/main.css`, réutilise la classe de base, ne change que la position)
et du `<div>` correspondant juste après l'ouverture de la section, pour
une section encadrée haut + bas, cohérente avec `#pre-beta`.

**Testé avec :**
- `npm test` : 67/72, inchangé.
- Vérification réelle (Playwright, Chrome système), desktop 1440x900 et
  mobile 375x667 : 0px de débordement, comparaison programmatique des
  deux bandes de `#beta-feedback` (dégradé et hauteur identiques,
  confirmé via `getComputedStyle`), captures d'écran des deux tailles
  d'écran confirmant le rendu.

### Déploiement
Validé par Xavier, mergé sur `main` (fast-forward, commit `635a787`) et
poussé sur `origin/main`. Déploiement Vercel automatique attendu.

---

## Polish du bloc #pre-beta : bande de fermeture + texte court (2026-07-09) ✅

Tag avant : `ops-session-2026-07-09-prebeta-polish`. Branche
`feature/pre-beta-polish`, repartie de `main`. Périmètre strict : 3
retouches demandées par Xavier sur `#pre-beta` uniquement, rien d'autre
touché (boutons, formulaire `#beta-feedback`, bande du haut inchangés).

### 1. Bande de fermeture en bas de `#pre-beta`
`css/main.css` : nouvelle règle `.pre-beta__stripe--bottom { top: auto; bottom: 0; }`,
qui réutilise la classe de base `.pre-beta__stripe` (même dégradé 4
couleurs, même hauteur 4px) sans dupliquer les valeurs de couleur. La
bande du haut n'a pas été modifiée. `index.html` : `<div class="pre-beta__stripe pre-beta__stripe--bottom"></div>`
ajouté juste avant la fermeture de `</section>`.

### 2. Nouveau texte du paragraphe, centré, en 3 blocs
Le texte fourni par Xavier remplace l'ancien paragraphe unique, éclaté en
3 `<p class="pre-beta__body">` distincts (mêmes sauts de ligne que
demandé). Badge et titre inchangés. Déjà centré grâce à
`.pre-beta__inner{text-align:center}` existant (posé lors d'une session
précédente), aucune nouvelle règle de centrage nécessaire.

### 3. Aucun ajout d'inscription/newsletter
Rien ajouté dans `#pre-beta` en dehors des 3 retouches demandées.

**Testé avec :**
- `npm test` (`tests/check.js`) : 67/72, identique aux sessions précédentes.
- Vérification réelle (Playwright, Chrome système), desktop 1440x900 et
  mobile 375x667 : 0px de débordement horizontal dans les deux cas.
  Comparaison programmatique des deux bandes (`getComputedStyle` sur
  `background-image` et `height`) : **identiques bit pour bit**
  (`backgroundImage` égal, `height` égal), positionnées respectivement en
  haut (`y≈172px`) et en bas (`y≈723px`) du bloc en desktop. Captures
  d'écran du bloc complet sur les deux tailles d'écran confirmant le
  rendu symétrique et le texte centré.

### Déploiement
Validé par Xavier, mergé sur `main` (fast-forward, commit `a6b7b90`) et
poussé sur `origin/main`. Déploiement Vercel automatique attendu.

---

## Mascottes spécifiques par épreuve (2026-07-09) ✅

Tag avant : `ops-session-2026-07-09-mascots`. Branche `feature/skill-mascots`.
Les 4 pages d'épreuve (listening/reading/writing/speaking.html) affichaient
toutes la même image générique `img/parrot-practice.png` dans le bandeau
`.page-hero__mascot`. Les 4 images spécifiques fournies par Xavier
existaient déjà dans `img/` (`mascot-listening.png`, `mascot-reading.png`,
`mascot-writing.png`, `mascot-speaking.png`), confirmées identiques par
hash MD5 aux fichiers envoyés dans le chat, mais jamais branchées dans le
HTML. Une ligne changée par page (`src` uniquement, `alt` déjà correct).
`index.html` (bloc pré-bêta) continue d'utiliser `parrot-practice.png`,
non concerné par la demande.

**Testé avec :**
- `npm test` : 67/72, identique aux sessions précédentes.
- Vérification réelle (Playwright, Chrome système) : les 4 pages chargent
  bien leur image spécifique (`img.complete === true`, `naturalWidth` 1254
  confirmé), captures d'écran des 4 bandeaux comparées visuellement, aucune
  déformation (images déjà carrées, compatibles avec `object-fit:contain`).

### Déploiement
Mergé sur `main` et poussé sur `origin/main`.

---

## Retouches UX du bloc pré-bêta (2026-07-09) ✅

Suite directe de la session précédente, une fois le bloc pré-bêta validé et
déployé par Xavier. Tag avant : `ops-session-2026-07-09-ux-tweaks`. Travail
fait sur la branche `feature/pre-beta-ux-polish`, pas sur `main`. Périmètre
strict : `index.html` et `css/main.css`, 3 retouches demandées par Xavier.

### 1. Bande dégradée dupliquée en fin de section formulaire
`.pre-beta__stripe` (haut du bloc `#pre-beta`) n'a pas été modifiée. Ajout
d'une règle jumelle `.beta-feedback__stripe` (`position:absolute;bottom:0`),
`#beta-feedback` passée en `position:relative`, et ajout du `<div>`
correspondant juste avant la fermeture de la section. Même dégradé 4
couleurs, même rendu, à l'autre bout de la page.

### 2. Correction du mot "bugue" en "bug"
Texte d'invitation (`#pre-beta`) : "ce qui bugue" devient "ce qui a un bug".
Xavier a aussi demandé une légère relecture de syntaxe du même paragraphe :
la phrase à double "et" a été scindée pour fluidifier la lecture ("avant de
le lancer pour de bon" au lieu d'un enchaînement de deux "et"), sans changer
le ton ni le sens du texte.

### 3. Centrage des titres et textes courts de la home
Portée validée par Xavier : centrer titres/sous-titres/paragraphes courts,
laisser alignés à gauche les blocs longs (réponses FAQ, formulaire, cartes
module/why-card, liste à puces de la section 100% Free).
- `.hero__text` (+ `.hero__actions`, `.hero__stats`) centrés dans `css/main.css`.
- Colonne de texte de la section "Everything You Need. All in One Place."
  centrée (`text-align:center` sur le conteneur).
- Section "100% Free" : titre/paragraphe/bouton centrés, la checklist à
  coches conserve `text-align:left` explicite pour ne pas devenir illisible.
- Bannière CTA finale ("Ready to reach Band 7?") : titre/paragraphe/boutons
  centrés, paragraphe recentré via `margin:auto` (au lieu de `margin:0`).
- Bloc `#pre-beta` : déjà centré en mobile, centrage étendu au desktop pour
  cohérence avec le reste de la page.
- Sections déjà centrées (Modules, Why ParrotTalk, FAQ, Email Capture) :
  aucun changement.

**Testé avec :**
- `npm test` (`tests/check.js`) : 67/72, chiffres identiques à la session
  précédente (les 5 échecs restent les mêmes routes API préexistantes).
- Vérification visuelle réelle desktop (1440x900) et mobile (375x667) avec
  Playwright (Chrome système) : 0px de débordement horizontal dans les deux
  cas, captures d'écran des 4 sections retouchées comparées visuellement,
  formulaire et checklist confirmés toujours alignés à gauche, bande
  colorée confirmée identique en haut du bloc pré-bêta et en bas du
  formulaire de retour.

### Déploiement
Mergé sur `main` et poussé sur `origin/main` à la demande de Xavier
("envoie tout direct quand tu as fini, ce sont de petites modifications").

---

## Bloc pré-bêta sur la home + formulaire de retour Web3Forms (2026-07-09) ✅

Pré-bêta amicale lancée (posts Facebook/LinkedIn de Xavier), le kit testeur
(lettre d'invitation + fiche de test) est maintenant accessible directement
depuis la home, sans dépendre de l'email envoyé au préalable. Tag avant :
`ops-session-2026-07-09`. Travail fait sur la branche `feature/pre-beta-kit`,
pas sur `main`. Périmètre strict : `index.html` (home uniquement) et
`css/main.css`, aucun autre fichier touché.

Note de scope, à traiter avant la vraie bêta internationale : cette section
est volontairement en français alors que le reste du site est en anglais
(exception assumée pour la pré-bêta amicale francophone). À rebasculer en
anglais quand la bêta internationale sera lancée.

### 1. [NOUVEAU] Bloc invitation pré-bêta sur la home
Fichier : `index.html`, section `#pre-beta`, insérée juste après le hero et
avant la bande de fonctionnalités.
- Bandeau dégradé 4 couleurs (une par épreuve) en haut de la section, badge
  façon `.hero__eyebrow`, texte d'invitation intégré tel quel (fourni par
  Xavier), 3 boutons : téléchargement lettre PDF, téléchargement fiche de
  test PDF, ancre vers le formulaire de retour.
- Les deux PDF (`ParrotTalk_Mail-Beta.pdf`, `TEST_Bug_ParrotTalk_FR_contact_clean.pdf`)
  ont été copiés dans un nouveau dossier `beta/` à la racine du repo (pas
  `/public/beta/` : ce repo n'a pas de dossier `/public/`, les assets vivent
  à plat comme `img/`, `css/`, `js/`, `audio/`, donc `beta/` suit la même
  convention).

### 2. [NOUVEAU] Formulaire de retour en ligne (Web3Forms)
Fichier : `index.html`, section `#beta-feedback`, insérée avant le footer.
- Formulaire HTML natif (pas d'iframe), `fetch()` vers
  `https://api.web3forms.com/submit`, honeypot `botcheck` caché, champ
  `access_key` en placeholder littéral `XAVIER_COLLE_SA_CLE_WEB3FORMS_ICI` :
  **action manuelle restante pour Xavier**, coller la vraie clé publique
  associée à contact@parrottalk.app avant mise en prod.
  Cette clé est une clé publique de routage (pas un secret), elle peut donc
  rester dans le HTML client sans risque.
- Tous les champs demandés sont présents (prénom, email, appareil, épreuves
  testées, ce qui a marché, bugs, points pas clairs, correspondance du band,
  note globale, recommandation, remarques libres, consentement avec lien
  vers `privacy.html`).
- JS `handleBetaFeedback()` : `preventDefault` + `fetch` + bascule d'un état
  "formulaire" vers un état "confirmation" affiché inline, sans redirection
  (même mécanique que `handleSubscribe()` déjà en place pour la newsletter).

**Testé avec :**
- `npm test` (`tests/check.js`) : 67/72 passés. Les 5 échecs restants
  (`api/writing-feedback.js`, `api/speaking-transcribe.js`,
  `api/speaking-feedback.js` introuvables) sont préexistants, liés à la
  suppression de ces fichiers lors d'une session antérieure (voir plus bas
  dans ce fichier), aucun rapport avec cette session.
- Vérification mobile réelle à 375x667 avec Playwright (Chrome système,
  `/usr/bin/google-chrome`, `playwright-core` déjà en devDependency) :
  aucun débordement horizontal avant ni après le choix cookies
  (`document.body.scrollWidth - window.innerWidth === 0`), le CTA hero
  "Start Free Practice" reste accessible, le clic sur "Donner mon avis"
  amène le titre du formulaire à `y ≈ 230px` (bien sous la nav fixe de
  64px grâce à `scroll-margin-top` sur `#beta-feedback`), et le bandeau
  cookies disparaît définitivement après clic sur Accept (formulaire et
  boutons pleinement cliquables ensuite).
- Point vérifié et assumé, pas corrigé : en scroll continu (testé pixel par
  pixel de 0 à 1800px), les boutons du bloc pré-bêta traversent
  transitoirement la zone du bandeau cookies tant que celui-ci est affiché,
  le temps de quelques dizaines de pixels de scroll. Vérification faite que
  ce comportement est générique au site (le bouton "Start Now" de la
  section 100% Free et le bouton "Subscribe" de la newsletter font
  exactement la même chose ailleurs sur la page) : c'est une conséquence
  inévitable de
  tout bandeau `position:fixed` en bas d'écran traversé par du scroll, pas
  une régression propre à cette session, et différent du bug bloquant du
  08/07 (qui était un rendu cassé du bandeau lui-même, occupant 407px de
  vide). Ce point disparaît définitivement dès que l'utilisateur accepte ou
  refuse les cookies (vérifié ci-dessus).
- Pas testé (nécessite la vraie clé Web3Forms de Xavier) : la réception
  réelle d'un envoi sur la boîte contact@parrottalk.app. Action manuelle
  restante : Xavier colle sa clé `access_key`, fait un envoi de test depuis
  le site, confirme la réception.

### Déploiement
Clé Web3Forms collée par Xavier, testée en local (envoi réel confirmé reçu
sur contact@parrottalk.app). Mergé sur `main` (fast-forward, commit
`fae12a6`) et poussé sur `origin/main`. Déploiement Vercel automatique
attendu à la suite du push, à vérifier par Xavier sur le site en ligne.

---

## Corrections post-audit — bloquant mobile + importants (2026-07-08) ✅

Suite de l'audit complet du même jour ([[Journal/2026-07-08_parrottalk-audit-complet]]
côté Obsidian). Tag avant : `site-session-2026-07-08-audit-fixes`. Périmètre
strict : le BLOQUANT + les 3 IMPORTANTS de l'audit. Le COSMÉTIQUE (`js/app.js`
orphelin, routes API Vercel obsolètes, résidus `.ai` dans la doc) est
volontairement laissé de côté cette session.

### 1. [BLOQUANT] Bandeau cookies casse le mobile
Commit `1201a6e`.
- `css/main.css` : `.cookie-banner__text { flex: 0 0 auto; }` ajouté dans le
  bloc `@media (max-width:600px)`, avant le passage en `flex-direction:column`
  — neutralise le `flex-basis:320px` hérité qui s'appliquait à la hauteur au
  lieu de la largeur en mode colonne.
- **Découverte en cours de route** : ce bug était en réalité couplé à la
  Correction 2 — tant que `index.html` avait un débordement horizontal
  (footer 8 liens sans wrap), le navigateur mobile élargissait le "layout
  viewport" de toute la page, ce qui faussait aussi le rendu du bandeau
  cookies (boutons Accept/Reject devenus non cliquables après le premier
  correctif isolé). Les deux corrections ont dû être appliquées ensemble.

**Testé avec un vrai clic simulé (Playwright, pas juste visuel)**, à 375×667 :
- Hauteur du bandeau : 407px → **154px**
- Bouton "Start Test 01" de Speaking : **cliquable** bannière affichée (`tap()` réel, pas de timeout)
- Boutons **Accept** et **Reject** : cliquables, comportement inchangé (GA4 se charge/reste éteint correctement)

### 2. [IMPORTANT] Débordement horizontal mobile
Commit `0332442`.
- `css/main.css` : `.footer__links` — ajout de `flex-wrap: wrap; justify-content: center;` (8 liens désormais, aucun wrap avant)
- `listening.html`, `reading.html`, `writing.html` : le sélecteur de test (3 cartes) utilisait un `style="display:grid;grid-template-columns:repeat(3,1fr)"` **en ligne**, qui ne respectait aucun media query (spécificité CSS). Remplacé par `class="grid-3"` (classe déjà responsive, collapse en 1 colonne sous 600px), gap/margin conservés en inline.
- `writing.html` : un `<div class="flex items-center gap-3">` (bouton Start + note "Timer starts automatically") ne wrappait pas — ajout de `style="flex-wrap:wrap"`.

**Testé avec un vrai Chrome (Playwright)**, mesure `scrollWidth` vs `clientWidth` à 375px sur les 9 pages : **0px de débordement partout** (avant : 348px sur index.html, 31-48px sur listening/reading/writing).

### 3. [IMPORTANT] Config Foundry — email .ai → .app
Hors repo site (repo `FOUNDRY`) : `ops/sites.yaml`, `site_registry.py`,
`config/sites.json` — `email: contact@parrottalk.ai` → `contact@parrottalk.app`.
Vérifié : plus aucune occurrence de `.ai` dans ces 3 fichiers. Les résidus
dans la documentation/exemples Foundry sont laissés tels quels (cosmétique,
hors périmètre).

### 4. [IMPORTANT] TEST-CHECKLIST.md mis à jour
Commit `8ed23ff`.
Deux nouvelles sections ajoutées (renumérotées proprement, section Bugs
repoussée en fin de fichier) : **8. Légal, cookies & consentement micro**
(12 points : liens footer, bandeau cookies Accept/Reject/Network, bandeau
utilisable en fenêtre réduite, consentement micro bloque Speaking et
survit au reset dashboard) et **9. FAQ** (7 points : accessibilité, liens
Privacy/Terms, non-affiliation, band=estimation, absence de mention
newsletter). Total : 38 → **57** points.

**Testé avec** `tests/check.js` (67/70, 5 échecs préexistants hors
périmètre — routes API Vercel obsolètes, migration du 5 juillet) et
`tests/e2e-persistence.js` (**43/43 passed**, aucune régression sur les
scénarios existants).

### Déploiement
Pas encore fait — liste des changements soumise à Xavier avant
`git push origin main`, comme convenu pour cette session.

---

## FAQ v1 — décisions de Xavier appliquées (2026-07-08) ✅

Suite directe de la session "FAQ v1 — construction par la preuve"
ci-dessous (non déployée à l'époque). Tag avant : `site-session-2026-07-08-faq-v1-decisions`.
Périmètre strict : appliquer les 3 décisions de Xavier sur les 3 points
signalés, rien d'autre.

### Décision 1 — Academic / General Training : on publie tel quel
La formulation FAQ existante était déjà honnête et non maquillée — aucun
changement de texte nécessaire. Ajouté à `CORRECTIONS-PLAN.md` (section 3,
Session 3) une note de priorité business : la table de conversion Reading
General Training doit être ajoutée **avant tout lancement payant**, les
marchés cibles (Inde, Vietnam, Nigeria, Philippines) comptant une forte
proportion de candidats GT (immigration).

### Décision 2 — "±0,5 à 1 band" : gardé, reformulé en mise en garde
Phrase retenue (`index.html`, FAQ "Is the band score I receive an
official IELTS result?") :

> ⚠️ Word of caution: your estimated band may differ from an official
> result by roughly ±0.5 to 1 band — this is not a measured accuracy
> figure or a guarantee, just a heads-up on how much variance to expect.

Explicitement présentée comme un avertissement de prudence, jamais comme
une performance mesurée ou une garantie.

### Décision 3 — Newsletter retirée de la FAQ
La question "How often are new tests added?" ne renvoie plus vers
l'inscription newsletter (canal noté "non fonctionnel" côté Foundry, clé
Brevo non vérifiée en prod). `api/subscribe.js` et la section newsletter
du site restent inchangés — seule la mention côté FAQ a été retirée.

**Testé avec** `tests/check.js` : 2 nouvelles vérifications (aucune
mention "newsletter"/"subscribe" dans la FAQ ; la phrase du band contient
bien "not a measured accuracy figure or a guarantee"). **67/70 passed**
(5 échecs préexistants inchangés, hors périmètre).

**Testé avec un vrai Chrome (Playwright)** : suite complète inchangée,
**43/43 passed**, aucune régression introduite par ces 3 ajustements de
contenu.

### Déploiement
Poussé après validation de Xavier — voir tag `post-faq-v1-decisions-20260708`.

---

## FAQ v1 — construction par la preuve (2026-07-08) ✅

Tag avant session : `site-session-2026-07-08-faq-v1`. Périmètre strict :
la FAQ (`index.html#faq-list`), plus un aligmenent ponctuel d'une phrase
de sur-promesse ("will always be free") trouvée juste en dessous dans la
même page (hors périmètre strict mais directement liée au principe
"aucune sur-promesse" rappelé pour cette session — signalé à Xavier).

### Inspection préalable (avant écriture)
Vérifié dans le code réel (pas de suppositions) avant de rédiger :
- Les 4 sections ont bien 3 tests chacune (`TEST01/02/03` dans `js/data.js`,
  `SPEAKING_TESTS` 1-3 dans `speaking.html`) — confirmé par "3 Tests
  Available" déjà affiché sur la page d'accueil.
- Speaking : le Worker (`worker/src/index.js`, `handleSpeaking`) note bien
  sur 4 critères officiels IELTS (`fc`, `lr`, `gra`, `pron` = Fluency &
  Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation).
- Writing Task 1 est bien de type Academic (description de graphique/
  tableau — confirmé dans `writing.html`), pas une lettre (General
  Training).
- **Point d'écart trouvé** : `js/data.js` n'a qu'une seule table de
  conversion (`BAND_40`), utilisée à l'identique par Listening et Reading.
  Pour Listening c'est correct (l'IELTS officiel utilise une table unique
  Academic/GT). Pour Reading, ce n'est **pas** correct : l'IELTS officiel a
  deux tables distinctes (Academic vs GT, GT plus stricte à score égal),
  et ParrotTalk n'implémente que l'Academic. Déjà documenté comme dette
  connue dans `CORRECTIONS-PLAN.md` (point 3), jamais corrigé. L'ancienne
  FAQ ("scoring targets the Academic band scale") glissait sur ce point ;
  la nouvelle FAQ le dit explicitement.
- Email de contact et rétention des données vocales dans la FAQ alignés
  mot pour mot avec `privacy.html` (0 jour de stockage audio/texte,
  transitoire vers Gemini, 90 jours pour les métadonnées de score).

### Réécriture de la FAQ
Commit `aff4364`.
- 6 questions existantes conservées/reformulées (compte, mobile, cadence
  des nouveaux tests — "regularly" remplacé par une formulation honnête
  sans engagement de calendrier).
- 5 nouvelles questions : ce qu'est ParrotTalk, non-affiliation IELTS
  explicite, band = estimation vs score officiel, méthode de calibration
  (angle preuve, AU FUTUR, aucun chiffre de précision inventé), et le
  point Academic/General Training corrigé pour Reading.
- Alignement avec `privacy.html`/`terms.html` : liens vers les deux dans
  plusieurs réponses.

**Testé avec** `tests/check.js` : 8 nouvelles vérifications statiques
(≥10 questions FAQ, clause de non-affiliation présente, formulation
"AI-generated estimate" présente, absence de tout pourcentage de précision
inventé dans la FAQ, absence de "will always be free", liens vers
`privacy.html`/`terms.html` présents). **65/70 passed** — les 5 échecs
restants sont les mêmes routes API Vercel obsolètes déjà signalées comme
préexistantes (session burn rate/legal v1, migration vers le Worker
Cloudflare du 5 juillet, hors périmètre).

**Testé avec un vrai Chrome (Playwright)** — nouveau scénario
`testFAQAccessibleAndLinksWork` dans `tests/e2e-persistence.js` : la
section FAQ est visible et cliquable (`<details>`/`<summary>` s'ouvre
réellement), le lien vers `privacy.html` fonctionne et charge la bonne
page (200, titre correct), le lien vers `terms.html` fonctionne (200).
**43/43 passed** (suite complète, aucune régression).

### Points signalés à Xavier (à valider)
- **Fiabilité du mécanisme newsletter** : le code (`api/subscribe.js`) est
  fonctionnel et utilise Brevo, mais le kernel Foundry note "Newsletter
  opt-in non fonctionnel" — je n'ai pas pu vérifier si `BREVO_API_KEY` est
  bien configuré côté Vercel en prod. La FAQ reste factuelle sur ce point
  (elle ne promet pas que l'inscription fonctionne à 100%) mais ça
  mériterait une vérification séparée.
- **Chiffre "±0,5 à 1 band"** utilisé dans la FAQ pour expliquer l'écart
  possible avec un score officiel : ce n'est pas un chiffre inventé pour
  cette session, il est déjà présent ailleurs dans le produit (disclaimers
  Writing/Speaking existants). Je le réutilise par cohérence, mais comme
  c'est un chiffre numérique et que la consigne insiste sur "n'annonce
  aucun chiffre de précision", je le signale explicitement pour que tu
  puisses trancher si tu préfères le retirer aussi.
- **Correctif Reading Academic/GT** : la nouvelle FAQ dit maintenant
  explicitement que le score Reading ne reflète pas fidèlement le General
  Training. C'est plus honnête, mais expose publiquement une limite
  produit qui n'était qu'en interne (`CORRECTIONS-PLAN.md`) jusqu'ici. À
  toi de juger si tu préfères corriger le code (ajouter la table GT)
  avant de publier cette formulation, ou publier tel quel maintenant.

### Déploiement
**Pas encore fait.** Nouvelle règle : déployer en fin de session touchant
le site — mais liste des changements à valider par Xavier avant le push,
comme demandé pour cette session précisément.

---

## Legal v1 — mentions légales, consentement RGPD (2026-07-08) ✅

Tag avant session : `site-session-2026-07-08-legal-v1`. Tag après :
`post-legal-v1-20260708`.

Périmètre strict : les 3 documents légaux (Legal Notice, Terms of Use,
Privacy Policy réécrite), le consentement micro avant enregistrement
Speaking, la bannière de consentement cookies bloquant GA4, et les liens
de pied de page vers les 3 pages légales. Pas d'autre modif fonctionnelle.

### Contexte déclencheur
GA4 a été installé le jour même (commit `1b028cf`, tag
`site-session-2026-07-08-ga4-tag`) — ce qui invalidait la Privacy Policy
existante ("no tracking cookies", lignes 74/77/84-85). Corrigé dans cette
session, avec mise en conformité RGPD complète avant l'arrivée des
premiers testeurs externes le 2026-08-15.

### 1. Trois documents légaux
Commit `aba6a99`.
- `legal-notice.html` (nouveau) — mentions légales, éditeur individuel non
  professionnel (exception LCEN art. 6-III), pas d'adresse publiée.
- `terms.html` (nouveau) — CGU : bande = estimation IA (pas un score IELTS
  officiel), non-affiliation IELTS/British Council/IDP/Cambridge (+ mention
  marques), service "tel quel"/bêta, aucune garantie de disponibilité.
- `privacy.html` (réécrite) — corrige les fausses affirmations sur les
  cookies, documente GA4 comme sous-traitant, précise la rétention réelle
  (audio/texte : 0 jour côté ParrotTalk — traitement transitoire, transmis
  à Gemini puis jeté ; métadonnées d'évaluation : 90 jours KV ; IP
  anti-abus : ~25h), et le transfert international vers Google (Gemini,
  GA4).
- Contact harmonisé sur `contact@parrottalk.app` (et non `.ai`, erreur
  corrigée en cours de session) dans les 3 documents.
- ⚠️ Note explicite dans `legal-notice.html` et `terms.html` : ces textes
  n'ont pas été rédigés par un professionnel du droit ; à faire relire
  avant le 2026-08-15 si possible.

**Testé avec** `tests/check.js` : existence des 2 nouveaux fichiers,
absence de la fausse mention "no tracking cookies", présence de
`contact@parrottalk.app` partout, présence des clauses non-affiliation/
"as is" dans `terms.html`.

### 2. Consentement micro avant enregistrement (Speaking)
Commit `eb1008a`.
- Nouveau panneau `#consent-gate-overlay` (markup statique, hors des
  templates régénérés `renderPretest()`/`renderTestZone()`), case à cocher
  + bouton Continue désactivé tant que non cochée.
- `startRecording()` intercepte AVANT tout appel à `getUserMedia` si
  `localStorage.parrottalk_consent_recording !== 'granted'`.
- Clé `parrottalk_consent_recording` (préfixe `parrottalk_`, pas `ielts_`
  — ne sera donc jamais effacée par le bouton "Reset all scores" du
  dashboard).
- Persistant : demandé une seule fois, pas de re-demande par question.

**Testé avec un vrai Chrome (Playwright)** — nouveau scénario
`testSpeakingConsentGate` dans `tests/e2e-persistence.js` : le panneau
s'affiche au premier clic sur le micro, le bouton Continue reste
désactivé tant que la case n'est pas cochée puis s'active une fois
cochée, l'accord est mémorisé en localStorage et le panneau se masque.
**37/37 passed** (suite complète, aucune régression).

### 3. Bannière de consentement cookies (bloque GA4 réellement)
Commit `04119cb`.
- `js/analytics.js` réécrit : ne charge/exécute plus `gtag()` que si
  `localStorage.parrottalk_cookie_consent === 'granted'`.
- Nouveau `js/cookie-banner.js` : bannière Accept/Reject affichée une
  seule fois (tant qu'aucun choix n'est stocké), sur les 9 pages HTML du
  site.
- Clé `parrottalk_cookie_consent` (`granted` / `denied`) — le choix n'est
  jamais redemandé une fois posé, y compris après reload.

**Testé avec un vrai Chrome (Playwright)** — 2 nouveaux scénarios
`testCookieBannerBlocksGA4` et `testCookieBannerReject` : aucun
`<script>` GA4 (`googletagmanager.com`) injecté avant clic sur Accept,
injecté juste après ; Reject garde GA4 désactivé et mémorise le choix ;
le bandeau ne réapparaît jamais après reload une fois un choix fait.
**37/37 passed** (suite complète, incluse dans le total ci-dessus).

### 4. Accessibilité des pages légales depuis tout le site
Inclus dans les commits `aba6a99`/`eb1008a`/`04119cb`.
- Footer riche (`index.html`, `privacy.html`, `legal-notice.html`,
  `terms.html`) : liens Legal Notice + Terms of Use ajoutés dans
  `.footer__links`.
- Footers minimalistes (`listening.html`, `reading.html`, `writing.html`,
  `speaking.html`, `dashboard.html`) : une ligne de liens ajoutée, texte
  de non-affiliation existant non touché.

**Testé avec** `tests/check.js` : les 7 pages du site contiennent bien un
lien vers `legal-notice.html` et `terms.html`. **58/63 passed** — les 5
échecs restants sont préexistants et sans rapport avec cette session
(3 routes API Vercel citées dans check.js n'existent plus depuis la
migration vers le Worker Cloudflare, commit `4301e8f` du 5 juillet ;
non corrigé ici, hors périmètre).

### À vérifier manuellement avant le 2026-08-15
- [ ] Relecture des 3 documents légaux par un professionnel du droit
- [ ] Vérifier en prod (`https://parrottalk.app`) qu'aucun cookie/requête
      `googletagmanager.com` ne part avant acceptation (onglet Réseau)
- [ ] Vérifier la durée de rétention GA4 configurée côté Google Analytics
      (Admin > Data Settings > Data Retention) et l'aligner avec le texte
      de la Privacy Policy si besoin
- [ ] Corriger séparément les 3 routes API obsolètes dans `tests/check.js`
      (pré-existant, sans rapport avec cette session)

### Déploiement
**Pas encore fait.** Les 4 commits (`aba6a99`, `eb1008a`, `04119cb`, et le
commit tests à suivre) sont en local, prêts à pousser —
`git push origin main` suffit (Vercel builde automatiquement). En attente
du feu vert de Xavier avant déploiement, comme convenu pour cette
session.

---

## Session UX du soir (2026-07-07) ✅

Tag avant session : `avant-session-ux-2026-07-07-soir`. Périmètre strict : les
2 corrections ci-dessous uniquement — pas touché à l'affichage par blocs (L1)
ni aux accents audio (L8), réservés à des sessions dédiées.

### Correction 1 — nom de l'épreuve dans l'encart de résultat ✅
Commit `d5c740d`, dédié.
- `listening.html` : "🎧 Listening — Final Score"
- `reading.html` : "📖 Reading — Final Score" (encart partagé entre les 3 tests)
- `writing.html` : "🤖 AI Analysis — ✍️ Writing Task {n}"
- `speaking.html` : déjà conforme ("Speaking Test 0X — AI Results"), non touché

Vérifié visuellement (vrai Chrome, submit réel) sur Listening et Reading.
Writing vérifié par lecture de code (simple gabarit de texte, non testable
sans appel réel à l'API Gemini).

### Correction 2 — listes déroulantes remplacées par des options visibles ✅
Commit `a7f3cb7`, dédié. Point 7 de l'audit initial.
- `listening.html` : `buildMatchingGroup()` reprend le pattern déjà utilisé
  par `buildMCGroup()` (boutons radio, classes `.mc-option` existantes)
- `reading.html` : les 6 blocs `<select class="matching-select">` (Test01
  Q14-19) réécrits sur le même modèle

Aucun changement de logique nécessaire : `checkAnswer()`/`markQuestion()` et
`checkQ()`/`markQ()` géraient déjà les radios génériquement depuis le fix du
scoring MC — la conversion select→radio fonctionne directement avec le code
existant.

**Testé avec un vrai Chrome (Playwright)**, en particulier la persistance sur
ces zones proches de la persistance validée précédemment : score et réponses
corrects avant ET après un vrai rechargement, sur le groupe matching Listening
(q21-25, section 3) et Reading Q14-19 (passage 2, Test01).
`tests/e2e-persistence.js` étendu avec 2 nouveaux scénarios dédiés
(`testListeningMatchingGroup`, `testReadingMatchingHeadings`).
**24/24 passed** (suite complète, aucune régression).

### Déploiement
**Pas encore fait pour cette session-ci.** Les 2 commits (`d5c740d`,
`a7f3cb7`) sont en local, prêts à pousser — `git push origin main` suffit
(Vercel builde automatiquement), comme pour le déploiement précédent du
même jour.

## Déploiement en production (2026-07-07) ✅

Tag avant déploiement : `avant-deploiement-v2-2026-07-07`.

**Périmètre** : site statique uniquement (`https://parrottalk.app`, Vercel). Le
Worker Cloudflare n'a pas été touché — la seule modification qui le concerne
(logging du prompt Writing, session 2) reste non déployée, comme décidé.

**Mécanisme** : `git push origin main` vers `github.com/xavier-ornytools/parrottalk`
— Vercel builde et déploie automatiquement sur push (pas d'action manuelle
supplémentaire). 8 commits poussés (`bff5bed..f07d2a7`) : audit, band global +
logging + UX Writing, persistance, garde timer, restauration automatique,
réponses MC, score MC.

**Vérifié en ligne après déploiement** :
```bash
curl -sL https://parrottalk.app/listening.html | grep -c finish-section-btn   # 1
curl -sL https://parrottalk.app/dashboard.html  | grep -c "Math.round(rawAvg \* 2)"  # 1
curl -sL https://parrottalk.app/listening.html  | grep -c "correctVal = String(q.answer)"  # 1
curl -sL https://parrottalk.app/reading.html    | grep -c "if (timerInterval) clearInterval"  # 2
```
Les 4 correctifs clés (bouton de fin de section, band global, scoring MC,
garde timer) sont confirmés présents dans le code réellement servi en
production, pas seulement dans le repo local.

**Test manuel à faire sur le site public (par toi)** :
1. Aller sur https://parrottalk.app/listening.html
2. Faire la section 1 (Test 01), cliquer "I've finished this section"
3. Recharger la page (`Ctrl+R` / `Cmd+R`)
4. Vérifier : retour direct dans le test (pas l'écran de sélection), section 1
   toujours marquée faite, réponses toujours là si on clique son onglet
5. Faire une section avec des questions à choix multiples, vérifier qu'elles
   comptent bien dans le score final

## Fix #3 post-session 3 — score des choix multiples jamais compté (2026-07-07) ✅

Tag avant fix : `avant-fix-scoring-mc-2026-07-07`.

**Corrige le second bug identifié (et volontairement non traité) dans le fix
précédent** : `checkAnswer(q)` et `markQuestion(q, correct)` dans
`listening.html` ne lisaient une réponse que via
`document.getElementById('q'+q.n)` — ce qui retourne toujours rien pour les
questions à choix multiples (`buildMCGroup()`, boutons radio `name="q{n}"`
sans id partagé). Résultat : une question à choix multiples était **toujours**
comptée fausse, y compris à la toute première soumission, sans lien avec un
rechargement.

### Correctif
Même approche que celle déjà en place côté `reading.html` (`checkQ`/`markQ`) :
- `checkAnswer(q)` : si aucun élément `id="q{n}"` n'existe, se rabat sur
  `document.querySelector('input[name="q{n}"]:checked')` et compare sa valeur
  à `String(q.answer)` (l'index numérique de l'option correcte, tel que généré
  par `buildMCGroup()`).
- `markQuestion(q, correct)` : ajoute une branche radio qui désactive les
  boutons et applique les classes CSS déjà existantes mais jamais utilisées
  `.correct-ans` / `.wrong-ans` sur le `.mc-option` correspondant (bonne
  réponse toujours indiquée en vert, mauvais choix de l'utilisateur en rouge
  si applicable).

### Testé avec un vrai navigateur (Chrome via Playwright)
- Section de 10 questions (5 texte + 5 choix multiples), toutes correctes →
  **10/10** avant ET après rechargement (contre 5/10 avant ce fix).
- Marquage visuel vérifié : bonne réponse en vert, mauvais choix en rouge,
  boutons verrouillés après validation.
- `tests/e2e-persistence.js` étendu avec `testListeningMCScoring()` (calcul
  pur, isolé) et des vérifications de score ajoutées à
  `testListeningTwoSectionsAndMC()`. **17/17 passed.**

## Fix #2 post-session 3 — réponses à choix multiples (radio) non restaurées (2026-07-07) ✅

Tag avant fix : `avant-fix-restauration-multisection-2026-07-07`.

**Rapporté par Xavier** : après le fix de restauration automatique, nouveau test
manuel réel en Firefox — section 1 finie, section 2 finie (toast "section two
saved" confirmé), `Ctrl+R` → réponses de section 2 disparues des cases à
l'écran → soumission finale = 0/40, Band 1.

**Diagnostic (vérifié avec un vrai Chrome via Playwright, en reproduisant
exactement ce scénario à deux sections finalisées)** :

`Michel/Bureau/parrottalk_restored/listening.html` a deux mécanismes
différents pour lire une réponse selon le type de question :
- Questions texte/select (`id="q{n}"`) : `document.getElementById('q'+n).value`
- Questions à choix multiples (`buildMCGroup()`, boutons radio
  `name="q{n}"` **sans id partagé**) : uniquement lisibles via
  `document.querySelector('input[name="q{n}"]:checked')`

Mon `finishSection()`/`restoreSectionAnswers()` de la session 3 utilisaient
uniquement `document.getElementById('q'+q.n).value` — **qui retourne
`null`/rien pour les questions à choix multiples**. Résultat : les réponses
MC n'étaient ni capturées dans `savedAnswers`, ni réinjectées (radio recoché)
au rechargement. Reading n'avait pas ce problème : `checkQ()`/`markQ()` y
géraient déjà les radios via un repli `querySelector(':checked')` — Listening
ne l'avait jamais eu.

### Correctif appliqué (persistance uniquement)
`listening.html` : ajout de `getAnswerValue(key)`/`setAnswerValue(key, value)`
(même logique que celle déjà utilisée dans `reading.html`) — lisent/écrivent
un champ texte/select via `id`, ou un bouton radio via
`querySelector('input[name=...]:checked' / '[value=...]')`. `finishSection()`
et `restoreSectionAnswers()` utilisent désormais ces helpers au lieu de l'accès
direct `.value`.

**Vérifié avec un vrai Chrome (Playwright)** : après le fix, un bouton radio
coché avant "finish" reste correctement coché après un rechargement réel de
la page (`tests/e2e-persistence.js`, nouveau test dédié).

### ⚠️ Second bug trouvé, DISTINCT et PRÉ-EXISTANT — hors périmètre persistance

En isolant precisément le cas radio, découverte d'un bug séparé, **indépendant
de tout rechargement** : `checkAnswer(q)` dans `listening.html` fait
`document.getElementById('q'+q.n)` et retourne `false` immédiatement si
l'élément n'existe pas — **donc TOUTE question à choix multiples est toujours
comptée comme fausse, même lors d'une toute première soumission, sans jamais
recharger la page.** `markQuestion()` a la même limite (ne marque jamais les
boutons radio visuellement corrects/incorrects).

Vérifié : score d'une section à 10 questions (5 texte + 5 MC, toutes
correctes) = **5/10 avant ET après reload** — identique, prouvant que ce n'est
pas un problème de persistance mais un problème de calcul de score qui existait
déjà avant cette session.

**C'est probablement la vraie cause du "0/40, Band 1"** si le test que tu as
fait à la main comportait beaucoup de questions à choix multiples : leur
réponse était correcte, mais jamais comptée — que la page ait été rechargée
ou non.

**Je n'ai pas touché à `checkAnswer()`/`markQuestion()`** — ça sort du
périmètre "persistance uniquement" que tu as fixé. Si tu veux que ce soit
corrigé, dis-le et je le fais dans une prochaine session dédiée (ou
maintenant si tu préfères) : le fix est le même principe que celui déjà fait
côté Reading (`checkQ`/`markQ`), donc rapide et à faible risque.

### Test de non-régression étendu
`tests/e2e-persistence.js` complété avec un scénario "2 sections finalisées +
réponses à choix multiples", vérifiant l'état visuel réel (bouton radio coché)
après reload — pas seulement `localStorage`. **12/12 passed** (Listening x2 +
Reading).

## Fix post-session 3 — restauration automatique manquante (2026-07-07) ✅

Tag avant fix : `avant-fix-restauration-auto-2026-07-07`.

**Rapporté par Xavier** : test manuel en Firefox réel échoue après la session 3 —
section 1 finie, section 2 en cours, `Ctrl+R` → retour à l'écran de sélection,
réponses apparemment toutes perdues. Le test jsdom de la session 3 donnait
pourtant un ✅.

**Diagnostic (confirmé avec un vrai Chrome piloté par Playwright, pas jsdom)** :
`saveProgress()` écrivait bien dans `localStorage` au clic sur "finish", et
`loadProgress()` fonctionnait bien — **mais uniquement à l'intérieur de
`startTest()`**, qui n'est appelée que si l'utilisateur clique sur "▶ Start Test".
Après un rechargement réel, la page revient à son état HTML initial (écran de
sélection visible, zone de test cachée) — exactement comme au tout premier
chargement. Rien ne déclenchait automatiquement la restauration : il fallait
recliquer "Start Test" pour que la progression réapparaisse. Sans le savoir,
Xavier a vu l'écran de sélection et conclu, à raison de son point de vue, que
tout était perdu — alors que les données étaient bien là, juste inaccessibles
sans ce clic supplémentaire non documenté.

**Le vrai maillon manquant** : `loadProgress()` n'était jamais appelée dans
`init()` (exécutée à chaque chargement de page), seulement dans `startTest()`
(exécutée seulement sur clic).

**Pourquoi le test jsdom donnait un faux positif** : il rappelait `startTest()`
par programme juste après avoir simulé le "rechargement", ce qu'un vrai
utilisateur ne fait pas automatiquement. Le test vérifiait donc que le
mécanisme de sauvegarde/lecture fonctionnait *si* on rappelle `startTest()`,
mais jamais ce qui se passe réellement à l'écran juste après un `Ctrl+R`, sans
aucune action de l'utilisateur.

### Correctif
`listening.html` et `reading.html` : `init()` détecte maintenant une
progression sauvegardée pour n'importe quel test (via une nouvelle fonction
`findInProgressListeningTest()` / `findInProgressReadingTest()`) et rentre
**automatiquement** dans la zone de test correspondante, sans attendre de clic.

### Nouveau test de non-régression réel (vrai navigateur, pas jsdom)
`tests/e2e-persistence.js` — pilote un vrai Chrome via `playwright-core`,
reproduit exactement le scénario de Xavier (section 1 finie, section 2 remplie
mais pas finalisée, **rechargement réel de la page**, **aucun clic après**), et
vérifie l'état réel de l'écran. Ce test aurait détecté le bug immédiatement.

```bash
# Terminal 1 :
cd /home/mac1/Bureau/parrottalk_restored && python3 -m http.server 8000
# Terminal 2 :
npm install --no-save   # installe playwright-core (nécessite Chrome installé)
npm run test:e2e
```
Résultat obtenu : **9/9 passed** (Listening + Reading).

Le smoke-test existant `npm test` (`tests/check.js`) montre 5 échecs
pré-existants et sans rapport (fichiers `api/writing-feedback.js` etc. qui
n'existent plus depuis la bascule vers le Worker Cloudflare) — vérifié
identique avant/après cette session, non touché.

## Session 3 — Persistance + corrections voisines (2026-07-07) ✅

Tag avant session : `avant-session3-persistance-2026-07-07`. Méthode : étapes
séquentielles, chacune committée séparément. **Allé jusqu'à Étape A + Étape B.
Étape C (listes déroulantes) non commencée**, délibérément — voir raison
ci-dessous.

### Étape A — Persistance (PRIORITÉ ABSOLUE) ✅
Commit dédié `7f5f446`. Bouton "J'ai fini cette section/ce passage" sur les
4 sections Listening + 9 blocs Reading (3 tests × 3 passages). Sauvegarde
`localStorage` incrémentale (`ielts_progress_{module}_{testId}`), découplée
de la fin de l'audio.

**Testé fonctionnellement avec jsdom** (pas seulement une vérification de
syntaxe — un vrai navigateur simulé exécutant le code réel) :
```bash
cd /tmp && node test_persistence2.js   # Listening : section 1→fini→section 2→
                                        # "reload"→score section 1 préservé→
                                        # section 2 finie→submit→band agrégé→
                                        # progression effacée. PASS.
node test_reading.js                   # Reading : passage 1→fini→"reload"→
                                        # réponses restaurées→passages 2+3→
                                        # submit 40/40→progression effacée. PASS.
```
Un vrai bug a été trouvé et corrigé pendant ces tests : `currentSection`/
`currentPassage` sauvegardé était celui qu'on venait de finir au lieu du
suivant — un rechargement aurait fait revivre la section déjà validée au lieu
de reprendre à la bonne section.

**Test manuel à refaire dans un vrai navigateur** (les scripts jsdom
couvrent la logique mais pas le rendu réel/l'audio) :
- [ ] Listening : faire section 1, cliquer "I've finished", faire section 2,
      recharger la page, vérifier que le score section 1 est toujours là au
      dashboard après avoir fini et soumis
- [ ] Reading : idem sur 2 des 3 passages avant rechargement
- [ ] Dashboard : bouton "Reset all scores" nettoie bien aussi la progression
      en cours (pas seulement les scores finaux)

### Étape B — Garde clearInterval() minuteur Reading ✅
Commit dédié `b421f12`. `startTimer()` et `selectTest()` font désormais
`clearInterval()` avant de repartir — empêche l'empilement de plusieurs
chronos si un test Reading est relancé en cours de session.
- [ ] Test manuel : lancer un test Reading, cliquer sur un autre test avant la
      fin, relancer, vérifier que le chrono ne défile pas anormalement vite.

### Étape C — Listes déroulantes visibles — NON COMMENCÉE
Raison : les étapes A+B ont demandé un débogage réel substantiel (voir le bug
`currentSection` trouvé par les tests). L'étape C touche les mêmes zones
fraîchement testées (`buildMatchingGroup()` en Listening, les 6 `<select>`
Reading Q14-19) — la faire dans la foulée aurait augmenté le risque de
régression sur la persistance qui vient d'être validée, sans le temps de la
retester aussi rigoureusement. Xavier a explicitement autorisé à s'arrêter
après B dans ce cas. Reste décrite en détail dans `CORRECTIONS-PLAN.md`
(Session 4).

## Session 2 — Corrections sûres (2026-07-07) ✅

Tag avant session : `avant-session2-corrections-2026-07-07`. Périmètre strict :
3 corrections, persistance (point 3) explicitement hors scope.

### 1. Band global (`dashboard.html:loadDashboard()`)
```js
const skills = { listening: 1.0, reading: 6.0, writing: 1.0, speaking: null };
// avant : overall = "2.7" (impossible en IELTS)
// après : overall = "2.5"
```
- [x] Vérifié via Node avec le cas de test exact de l'audit → `2.5` obtenu.
- [ ] À vérifier dans le navigateur : ouvrir `dashboard.html` avec des scores
      réels donnant une moyenne non ronde et confirmer l'affichage.

### 2. Logging prompt Writing (`worker/src/index.js:logEvaluation()`)
- Ajout de `promptExcerpt` (300 premiers caractères du prompt réellement
  évalué) à l'objet loggé dans `handleWriting()`.
- **Écart signalé** : `testId` n'est pas dans le payload envoyé par
  `writing.html` (seulement `task`, `taskType`, `prompt`, `essay`, `wordCount`,
  `minWords`) — non ajouté au log pour rester dans le périmètre strict de
  cette session (fichier `worker/src/index.js` uniquement). Le `promptExcerpt`
  suffit à identifier le sujet exact évalué.
- [ ] **Nécessite un déploiement du Worker** pour être actif en production —
      voir note ci-dessous, pas fait sans feu vert de Xavier.
- [ ] À vérifier après déploiement : `wrangler tail` ou lecture KV après un
      appel `/evaluate/writing`, confirmer la présence de `promptExcerpt`.

### 3. Garde-fous UX Writing (`writing.html`)
- [x] Boutons renommés "🤖 Get AI Feedback — Task 1/2" (y compris après
      reset post-requête, oubli initial dans le code corrigé au passage).
- [x] Bordure gauche colorée sur chaque `<textarea>` (ambre `#92400E` pour
      Task 1, `var(--primary-dark)` pour Task 2), cohérent avec les badges
      `task-tag` existants.
- [x] Rappel du sujet évalué ajouté dans `renderAIFeedback()` (100 premiers
      caractères du `promptText` déjà disponible côté client — voir
      justification du choix client vs serveur dans le résumé de session).
- [x] Syntaxe JS du script inline vérifiée (extraction + `node --check`).
- [ ] À vérifier dans le navigateur : lancer un test Writing, cliquer les 2
      boutons, confirmer visuellement bordures + libellés + rappel du sujet.

## Audit lecture seule (2026-07-07) ✅

Session d'audit pure suite au premier test blanc IELTS complet — **aucun
fichier de code applicatif modifié**, rien à tester ici. Voir `AUDIT.md`
(10 points investigués + 2 points complémentaires) et `CORRECTIONS-PLAN.md`
(plan détaillé pour les sessions 2/3/4 à venir, fix band global décrit prêt
à appliquer en tête de document). Tag posé avant session :
`avant-audit-docs-2026-07-07`.

## Étape 0 — Honnêteté du site (2026-07-04) ✅

- [x] `grep -ri "parrottalk.ai"` → 0 résultat
- [x] `grep -ri "free forever"` → 0 résultat
- [x] Mentions Gemini dans le contenu visible → 0 (sauf privacy.html, intentionnel)
- [x] Disclaimer IELTS non-affiliation dans les 7 pages HTML
- [x] Pronunciation : "not assessed" dans Étape A, réactivée dans Étape 1 (audio Gemini)
- [x] privacy.html highlight box : décrit le vrai flux (plus "Google's AI")

## Fix CORS multi-origines (2026-07-04) ✅

- [x] `ALLOWED_ORIGINS` = Set contenant `https://parrottalk.app`, `https://www.parrottalk.app`, `http://localhost:3000`, `http://localhost:8000`
- [x] `Access-Control-Allow-Origin` renvoie l'origine de la requête si elle est dans la liste (jamais `*`)
- [x] Fallback si origine absente ou non listée → `https://parrottalk.app`
- [x] Preflight OPTIONS géré globalement pour toutes les routes
- [x] Aucune référence résiduelle à l'ancienne constante `ALLOWED_ORIGIN`
- [x] Tags `pre-cors-fix` et `post-cors-fix` posés

**Test manuel après déploiement :**
```bash
# Doit renvoyer Access-Control-Allow-Origin: https://www.parrottalk.app
curl -s -I -X OPTIONS https://api.parrottalk.app/evaluate/writing \
  -H "Origin: https://www.parrottalk.app" \
  -H "Access-Control-Request-Method: POST" | grep -i "access-control"

# Doit renvoyer 403/réponse sans CORS header (origine non listée)
curl -s -I -X OPTIONS https://api.parrottalk.app/evaluate/writing \
  -H "Origin: https://evil.com" | grep -i "access-control"
```

---

## Fix post-Étape 1 — Corrections Fable (2026-07-04) ✅

- [x] Constante modèle = `gemini-2.5-flash`, aucun `gemini-2.0` dans le code
- [x] Speaking : tous les blobs non-vides partent dans un seul FormData (`audio_0`…`audio_N` + `duration_N`)
- [x] Worker : une seule requête Gemini avec parties texte/audio alternées
- [x] Une évaluation speaking complète = 1 seul décompte rate limit / budget
- [x] Question sans réponse gérée sans crash (blob absent → ignoré, non envoyé)
- [x] Web Speech hors flux d'évaluation — `formData.append` n'envoie que `audio_N`/`duration_N`, pas de `transcripts`
- [x] JSON de réponse contient `transcript` (ce que Gemini a entendu), affiché dans l'UI résultats
- [x] Transcript non stocké dans les logs de calibration (seulement type + bands + durée)
- [x] Coût : formule `32 tokens/s × durée_totale_secondes` en place — ordre de grandeur ~0,03 €/test complet
- [x] `api/speaking-feedback.js`, `api/speaking-transcribe.js`, `api/writing-feedback.js` supprimés
- [x] Tags `pre-fix-post-etape1` (→ `c6e5ed4`) et `post-fix-post-etape1` (→ `4301e8f`) posés

**Actions manuelles Xavier avant déploiement :**
1. Vérifier dans Vercel Dashboard → Settings → Environment Variables : si une variable `GEMINI_API_KEY` (ou similaire) existe pour les anciennes fonctions serverless → la supprimer. Si c'est la même clé que celle du Worker → la révoquer dans AI Studio et en régénérer une neuve dans Cloudflare Worker secrets.
2. `cd worker && wrangler deploy` — redéploiement obligatoire pour activer toutes les corrections.
3. Test desktop : enregistrer 2 minutes sur Part 2, vérifier que le transcript "What the AI heard" apparaît.
4. Test mobile : vérifier que le micro fonctionne et que l'envoi des 9 blobs passe (réseau mobile).

---

## Centralisation API_BASE (2026-07-05) ✅

- [x] `writing.html` : `WORKER_URL` → `API_BASE = 'https://parrottalk-api.foundry8.workers.dev'`
- [x] `speaking.html` : idem
- [x] `grep -r "api.parrottalk.app" *.html *.js | grep -v privacy.html` → 0 résultat
- [x] Migration DNS future : changer 1 ligne dans chaque fichier (`API_BASE`) ou extraire dans un fichier de config partagé

---

## Fix gemini-2.5-flash thinking parts (2026-07-05) ✅

- [x] Extraction du texte : `parts.filter(p => !p.thought).map(p => p.text).join('')` — ignore les thinking parts
- [x] `thinkingConfig: { thinkingBudget: 0 }` ajouté dans `generationConfig` — thinking désactivé
- [x] Fallback JSON : strip des fences markdown + regex `{...}` + `console.error` du texte brut si échec
- [x] Test live : `/evaluate/writing` renvoie JSON valide avec band 6.5 et 4 critères ✅

**Cause :** `gemini-2.5-flash` retourne par défaut des "thinking parts" (`{thought: true}`) en `parts[0]`.
L'ancien code lisait `parts[0].text` = pensée interne ≠ JSON → `"Could not parse AI response as JSON"`.

---

## Étape 1 — Worker Cloudflare (2026-07-04) — À tester après déploiement

### Sécurité
- [ ] `grep -ri "AIza" *.html *.js` → 0 (clé jamais côté client)
- [ ] `grep -ri "gemini" *.html` → uniquement privacy.html (mentions intentionnelles)
- [ ] Code mort Gemini (ex-lignes 838–972 speaking.html) → supprimé ✅

### Worker — setup manuel requis

```bash
# 1. Installer Wrangler
cd worker && npm install

# 2. Créer le KV namespace
wrangler kv:namespace create RATE_KV
# → copier l'id retourné dans wrangler.toml

# 3. Déposer la clé API Gemini (JAMAIS dans le repo)
wrangler secret put GEMINI_API_KEY

# 4. Déployer
wrangler deploy

# 5. Configurer DNS : api.parrottalk.app → CNAME parrottalk-api.<subdomain>.workers.dev
```

### Critères de recette (après déploiement)

- [ ] Writing : `curl -X POST https://api.parrottalk.app/evaluate/writing -H "Content-Type: application/json" -d '{"task":1,"taskType":"Task 1","prompt":"Describe the graph","essay":"The graph shows...","wordCount":3,"minWords":150}'` → JSON avec band
- [ ] Speaking : enregistrement de 2 min → évaluation complète avec Pronunciation affichée
- [ ] Rate limit : 11ème requête du même IP → 429 "Daily evaluation limit reached"
- [ ] Plafond budget : forcer `budget:<mois>` à 50 dans KV → 429 "Monthly evaluation budget reached"
- [ ] `/stats` : `curl https://api.parrottalk.app/stats` → JSON avec budget_used_eur, evaluations
- [ ] Logs de calibration : après une évaluation, `wrangler kv:key list --prefix "log:"` → entrée présente
- [ ] privacy.html : décrit la nouvelle architecture (Gemini nommé, proxy mentionné)
- [ ] Tags git : `pre-etape1-worker` et `post-etape1-worker` posés

### Non testables sans déploiement réel

- Comportement sur mobile (microphone, MediaRecorder webm/opus)
- DNS api.parrottalk.app (à configurer dans Cloudflare dashboard)
- Alerte 80% budget (vérifier les logs Worker)
- Durée maximale audio (2 min) sans coupure Worker
