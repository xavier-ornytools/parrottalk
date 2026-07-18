# CONCEPT PRODUIT: QUICK MOCK (ParrotTalk)

parrottalk.app, projet parrottalk_restored, 15 juillet 2026
Statut: LIVRE et déployé en prod (le Quick Mock a été développé, mergé et mis en ligne). Ce document reste le cadrage produit d'origine (15/07), conservé pour référence.

## L'idée en une phrase

Un bac blanc IELTS complet mais express: les 4 disciplines couvertes en moins d'une heure (environ 45 à 50 min, 3 fois plus court que le test officiel de 3h) au lieu de 2h30 à 3h pour le mock test complet.

## Pourquoi

1. Le mock test complet est excellent mais long: barrière d'entrée forte pour un nouveau visiteur.
2. Personne ne propose ça chez les concurrents identifiés: avantage concurrentiel réel et original.
3. Parfait pour l'entraînement régulier: "un express par jour" est tenable, un test de 3h ne l'est pas.
4. Coût de développement faible: 100% du contenu existe déjà, c'est un travail d'assemblage.
5. Effet mesure: multiplie les occasions de test_started et test_completed, meilleure lecture du funnel GA4.

## Le découpage (réutilisation de l'existant, zéro contenu neuf)

| Discipline | Version complète | Version Quick Mock | Durée cible |
|---|---|---|---|
| Listening | 4 sections | 1 section | ~8 min |
| Reading | 3 textes | 1 texte | ~20 min |
| Writing | Task 1 + Task 2 | **Task 1 seule** | ~20 min |
| Speaking | Part 1 + 2 + 3 | Part 2 seule (cue card) | ~4 min |

Total: environ 50 minutes (52 exactement, annoncé "About 50 min" côté produit).

> **MAJ 17/07/2026, ce tableau fait foi.** Deux écarts avec la version du 15/07,
> tranchés par Xavier et implémentés dans le lot Quick Mock :
> - **Writing: Task 1 seule**, et non Task 2. Le cadrage du 15/07 retenait la
>   Task 2 (« la plus valorisée à l'examen ») en gardant la Task 1 comme
>   « alternative plus courte ». L'argument de durée ne tenait pas, les deux
>   tâches valent 20 min ici. C'est bien la Task 1 qui est livrée.
> - **Reading: 20 min**, et non 15.
>
> **Durée du test: jusqu'à 1h (environ 50 min en pratique, 3 fois plus court que le
> test officiel de 3h), couvrant les 4 modules.** La stratégie YouTube du 16/07
> annonçait « le test dure 15 min » et en faisait l'argument produit des 4 vidéos :
> c'était une erreur de calcul, incompatible avec la composition ci-dessus
> (8+20+20+4), éradiquée comme durée du Quick Mock. La maquette d'accueil validée le
> 17/07 dit « About 50 min », et c'est ce qui est en ligne. **L'argument produit des
> vidéos est donc à réécrire avant le tournage.**

## Principes produit

- Réutilisation stricte: on pioche dans les tests existants, on ne crée aucun exercice nouveau pour la v1.
- Rotation: à chaque Quick Mock, piocher une section/un texte/un sujet différent parmi l'existant pour la rejouabilité.
- Enchaînement fluide: les 4 épreuves se suivent automatiquement avec un écran de transition court entre chaque.
- Timer global visible + timer par épreuve, dans l'esprit du vrai examen.
- Écran de résultats unique à la fin: les 4 disciplines sur une seule page de synthèse.

## Positionnement et honnêteté (règles ParrotTalk)

- Présenté comme une estimation rapide, PAS un score officiel ni une prédiction de band. Formulation type: "a fast snapshot of your current level".
- Aucun chiffre de band score aspirationnel, formulation "your target band" si besoin.
- Jamais de promesse de gratuité permanente (pas de always, forever, stay free).
- Anglais simple, formules courtes, classe jamais cheap.

## Nommage (à trancher, options)

- Quick Mock (court, clair, cohérent avec Mock Test)
- Express Test
- Mini Mock
Recommandation: Quick Mock, il capitalise sur le vocabulaire déjà en place.

## Place dans le site (à trancher)

- Une carte ou un bouton dédié sur la page d'accueil, au même niveau visuel que Mock Test et les tests unitaires: l'offre devient "Full Mock / Quick Mock / Single Skill".
- Ajout dans le dashboard et le funnel GA4 (nouveaux événements ou paramètre de type de test sur les événements existants, à définir avec la nomenclature GA4 actuelle).

## Points techniques à étudier avant le GO

1. Architecture d'enchaînement: réutiliser la mécanique du mock test complet en pointant vers des sous-ensembles, plutôt que dupliquer du code.
2. Scoring: adapter l'affichage des résultats à des volumes réduits (ex: Reading sur 13-14 questions au lieu de 40), sans convertir en band officiel.
3. Coût IA: un Quick Mock consomme 2 évaluations IA (Writing + Speaking) comme un test complet par module. Vérifier l'impact sur la limite 10 évaluations/jour/IP et le budget Gemini 50 euros/mois.
4. Rotation: mécanique simple de sélection (aléatoire ou séquentielle) parmi les tests existants.
5. Mobile: le parcours complet doit être fluide en 375px.

## Ce que ça implique côté mesure

- Distinguer quick vs full vs single dans GA4 pour ne pas polluer les comparaisons.
- Rappel: rupture de série test_started au 14/07 et jalon refonte Listening au 15/07 à flaguer dans toute comparaison.

## Prérequis avant développement

1. Lifting mergé et déployé (en cours).
2. Speaking v4 déployé.
3. Ensuite seulement: mission Quick Mock (un document d'ordre de mission détaillé sera rédigé à ce moment-là sur la base de ce cadrage).
