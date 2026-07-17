# Suivi des lots, chantier « 4 tests par module »

Tableau de suivi des lots. Le planning stratégique v17 (Excel) reste inchangé.

| Lot | Contenu | Statut | Date |
|-----|---------|--------|------|
| LOT 2 | Reading data-driven : sortie des données + renvois d'erreur | Clos | 2026-07-16 |
| LOT 4 | Renommé Quick Mock (concept mock rapide) | Backlog | 2026-07-16 |
| Speaking 04 | 4e test Speaking, thème Food & Culture (Part 1 / cue card / Part 3), MediaRecorder, verrou Suivant 1s, encart préparation redessiné | Clos, mergé et déployé en prod | 2026-07-16 |
| Writing 04 | 4e test Writing, Task 1 camembert Chart.js live (dépenses ménage UK) + Task 2 essai environnement, avenant tableau Test 03 restylé | Clos, mergé, déployé et vérifié en prod | 2026-07-16 |
| Calibrage évaluateur | Calibrage de l'évaluateur IA (Option A), Writing et Speaking. Prompts : ancres numériques supprimées (le gabarit `"band": "6.5"` était recopié tel quel sur toutes les copies, band 4 comme band 9), descripteurs de bande 4 à 9 ajoutés, défauts cités obligatoirement quotés et vérifiables, interdiction d'inventer des données du visuel (Task 1 ne reçoit jamais l'image), interdiction de commenter les seuils internes. Code : band Writing = moyenne des 4 critères, arrondi officiel IELTS, calculé par le code et non par l'IA (Speaking le faisait déjà). Validé par 34 évaluations sur 5 copies de niveau certifié (4 officielles ielts.org) + les 9 audios réels de Xavier | Clos, mergé, déployé et vérifié en prod | 2026-07-17 |
| Gemini Pro (évaluateur) | Test de faisabilité mené en extension du lot calibrage : 2x plus juste (band 9 : 8.5 contre 7.0) mais 2 échecs de parse sur 10, latence 18s contre 3.7s, coût ~13x. Non retenu. Préalables si réouverture : maxOutputTokens à 16000, et corriger `estimateCost()` qui ignore les tokens de thinking (le garde-fou budget sous-compterait d'un facteur ~5) | Backlog, non retenu | 2026-07-17 |
| Reading 04 | 4e test Reading, après le calibrage évaluateur | À venir, 17/07 | 2026-07-17 |
