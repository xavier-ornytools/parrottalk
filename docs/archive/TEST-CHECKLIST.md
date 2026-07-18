> PERIME au 18/07/2026, conserve pour historique, voir TESTS.md pour l'etat courant.

# ParrotTalk — Checklist de test

**Date :** _______________  
**Testeur :** Xavier  
**URL :** https://parrottalk.app  
**Légende :** ✅ OK · ⚠️ partiel/bizarre · ❌ bug/cassé · — non testé

---

## 0. Préparation (30 sec)

1. Ouvrir https://parrottalk.app dans Chrome
2. Ouvrir DevTools (F12) → onglet **Application** → **Storage** → **Clear site data**
   *(efface les scores précédents pour partir à zéro)*
3. Fermer DevTools, recharger la page

---

## 1. Page d'accueil — visuel

| # | Ce qu'on teste | Résultat | Notes |
|---|---|---|---|
| 1.1 | Nav blanche (pas sombre) avec logo et liens | | |
| 1.2 | Hero blanc avec **photo parrot sur fusée** (pas le logo vert) | | |
| 1.3 | 4 module cards avec **bordure colorée** en haut (bleu/vert/orange/violet) | | |
| 1.4 | Section "Practice" avec photo parrot qui étudie à son bureau | | |
| 1.5 | Section "100% Free" avec photo parrot au mégaphone | | |
| 1.6 | Section bas de page (fond sombre) avec une photo du parrot | | |
| 1.7 | Cliquer sur une card → redirige vers la bonne page | | |

---

## 2. Listening — fonctionnalités

| # | Ce qu'on teste | Résultat | Notes |
|---|---|---|---|
| 2.1 | Sélectionner Test 01 → instructions visibles | | |
| 2.2 | Cliquer Start → questions Section 1 visibles | | |
| 2.3 | Cliquer Play → audio démarre (ou voix TTS) | | |
| 2.4 | **Audio Section 1 terminé → bouton "Submit" apparaît** *(nouveau)* | | |
| 2.5 | Répondre 3-4 questions Section 1 | | |
| 2.6 | Cliquer Submit → score affiché avec **"~Band X.X ⚠️ Approximate — 1/4 sections"** | | |
| 2.7 | Section 1 dans le tableau résultats affiche "X/10", les autres affichent "—" | | |
| 2.8 | Recharger → faire Sections 1+2 → soumettre → "2/4 sections" dans le warning | | |
| 2.9 | Faire les 4 sections → soumettre → **Band normale sans ⚠️ warning** | | |
| 2.10 | Cliquer Start → badge minuteur **32:00** visible à côté des onglets de section *(nouveau, L5)* | | |
| 2.11 | Laisser le minuteur descendre sous 10:00 → badge passe en couleur alerte | | |
| 2.12 | Laisser expirer le minuteur (ou tester avec `?timer=60` dans l'URL) → soumission automatique, même si l'audio est en train de jouer | | |

---

## 3. Reading — fonctionnalités

| # | Ce qu'on teste | Résultat | Notes |
|---|---|---|---|
| 3.1 | Sélectionner Test 01 → instructions visibles | | |
| 3.2 | Cliquer Start → Passage 1 visible | | |
| 3.3 | Cliquer Submit sans rien répondre → **alerte "Answer at least one question"** *(nouveau)* | | |
| 3.4 | Répondre 5-6 questions Passage 1 uniquement | | |
| 3.5 | Cliquer Submit → score avec **"⚠️ Approximate — X/40 questions answered"** *(nouveau)* | | |
| 3.6 | Faire les 3 passages complets → soumettre → **Band normale sans warning** | | |

---

## 4. Writing — fonctionnalités

| # | Ce qu'on teste | Résultat | Notes |
|---|---|---|---|
| 4.1 | Cliquer Writing → bandeau **orange** en haut de page | | |
| 4.2 | Photo parrot-practice visible dans le bandeau | | |
| 4.3 | Cliquer Start → timer 60 min démarre | | |
| 4.4 | Écrire dans Task 1 → compteur de mots s'incrémente | | |
| 4.5 | Écrire dans Task 2 → compteur de mots s'incrémente | | |
| 4.6 | Cliquer "Get AI Feedback" sur Task 2 → feedback reçu avec Band | | |
| 4.7 | "Model Answer" visible en dessous du feedback | | |

---

## 5. Speaking — fonctionnalités

| # | Ce qu'on teste | Résultat | Notes |
|---|---|---|---|
| 5.1 | Cliquer Speaking → bandeau **violet** en haut | | |
| 5.2 | Photo parrot-practice visible dans le bandeau | | |
| 5.3 | Autoriser micro → bouton enregistrement actif | | |
| 5.4 | Enregistrer Part 1 (~30 sec) → transcription reçue | | |
| 5.5 | Feedback avec Band + 4 critères (FC · LR · GRA · Pronunciation) | | |
| 5.6 | Part 2 : cue card affichée correctement avec les points | | |

---

## 6. Dashboard — données

| # | Ce qu'on teste | Résultat | Notes |
|---|---|---|---|
| 6.1 | Photo app-mockup visible dans le bandeau haut | | |
| 6.2 | Score Listening visible (après test section 2) | | |
| 6.3 | Score Reading visible (après test partiel section 3) | | |
| 6.4 | Score Writing visible (après test section 4) | | |
| 6.5 | Graphique de progression affiché (pas vide) | | |

---

## 7. Inner pages — visuel

| # | Ce qu'on teste | Résultat | Notes |
|---|---|---|---|
| 7.1 | Listening : bandeau **bleu** en haut de page | | |
| 7.2 | Reading : bandeau **vert** | | |
| 7.3 | Writing : bandeau **orange** | | |
| 7.4 | Speaking : bandeau **violet** | | |
| 7.5 | Photo parrot (grand, coloré) visible dans chaque bandeau | | |

---

## 8. Légal, cookies & consentement micro *(nouveau — 8 juillet 2026)*

| # | Ce qu'on teste | Résultat | Notes |
|---|---|---|---|
| 8.1 | Footer (n'importe quelle page) : lien **Legal Notice** présent et fonctionnel | | |
| 8.2 | Footer : lien **Terms of Use** présent et fonctionnel | | |
| 8.3 | Footer : lien **Privacy Policy** présent, mentionne bien Google Analytics comme sous-traitant | | |
| 8.4 | Site data vidée (étape 0) → recharger une page → **bandeau cookies apparaît** | | |
| 8.5 | AVANT de cliquer sur le bandeau : DevTools → Network → aucune requête vers `googletagmanager.com` | | |
| 8.6 | Cliquer **Accept** → le bandeau disparaît → une requête `googletagmanager.com` apparaît dans Network | | |
| 8.7 | Vider les données, recharger, cliquer **Reject** → bandeau disparaît, **aucune** requête `googletagmanager.com` | | |
| 8.8 | Recharger la page après un choix (Accept ou Reject) → **le bandeau ne réapparaît pas** | | |
| 8.9 | Réduire la fenêtre du navigateur (ou tester sur téléphone) → le bandeau reste compact, les boutons Accept/Reject restent cliquables, rien ne bloque le contenu en dessous | | |
| 8.10 | Site data vidée → aller sur **Speaking** → cliquer le micro **avant** tout → un panneau **"Before you record"** apparaît (case à cocher + bouton Continue grisé) | | |
| 8.11 | Cocher la case → le bouton **Continue** s'active → cliquer → le navigateur demande l'accès au micro | | |
| 8.12 | Aller sur **Dashboard** → cliquer **"Reset all scores"** → revenir sur Speaking → le consentement micro **n'est pas redemandé** (déjà accordé, survit au reset) | | |

---

## 9. FAQ *(nouveau — 8 juillet 2026)*

| # | Ce qu'on teste | Résultat | Notes |
|---|---|---|---|
| 9.1 | Page d'accueil → section **"Common Questions"** visible, au moins 10 questions | | |
| 9.2 | Cliquer une question → elle s'ouvre (accordéon) | | |
| 9.3 | La question "affiliated with IELTS..." répond clairement **NON** | | |
| 9.4 | La question sur le score répond que c'est une **estimation IA**, pas un résultat officiel | | |
| 9.5 | Le lien vers **Privacy Policy** dans la FAQ fonctionne | | |
| 9.6 | Le lien vers **Terms of Use** dans la FAQ fonctionne | | |
| 9.7 | Aucune mention de newsletter/inscription dans la FAQ (retirée volontairement — canal pas encore vérifié) | | |

---

## 10. Bugs / observations libres

*(Écrire ici tout ce qui semble bizarre, cassé, ou inattendu)*

```
-
-
-
-
-
```

---

**Total testé :** _____ / 60  
**Bugs critiques :** _____  
**Commentaire général :**
