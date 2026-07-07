# ParrotTalk — Tests techniques

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
