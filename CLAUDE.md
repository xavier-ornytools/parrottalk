# CLAUDE.md — Projet ParrotTalk

Plateforme web de preparation a l'examen IELTS (4 modules : Listening, Reading, Writing, Speaking). Site statique HTML/CSS/JS vanilla, deploye sur Vercel, avec un Worker Cloudflare pour l'evaluation IA (Writing/Speaking) et le micro-feedback.

Xavier n'est pas developpeur. Toute verification qu'on lui demande ne doit exiger de lui rien d'autre qu'ouvrir un lien dans son navigateur.

## Regle permanente : fin de lot avec verification visuelle

A chaque fin de lot qui necessite une verification visuelle de Xavier, terminer TOUJOURS par ces trois etapes, sans exception :

1. **Lancer le serveur local sur la bonne branche.** Verifier d'abord la branche courante (`git branch --show-current`), puis demarrer le serveur statique en arriere-plan. Port standard : **8000** (`python3 -m http.server 8000 --bind 127.0.0.1`), car c'est l'origine autorisee par le Worker Cloudflare pour le micro-feedback et l'evaluation IA (`ALLOWED_ORIGINS`). Ne pas utiliser un autre port sans raison.

2. **Donner l'adresse localhost exacte et cliquable**, dans le chat ET dans le rapport PDF. Dans le PDF, section « A toi, au navigateur » avec l'adresse en gros et la liste exacte des pages a ouvrir. Exemple : `http://localhost:8000/reading.html`. Toujours donner l'URL complete de chaque page concernee, jamais juste « ouvre le site ».

3. **Confirmer que le serveur tourne** (un `curl` de controle qui renvoie 200) avant de rendre la main.

Le but : Xavier clique, regarde, valide ou signale. Aucune commande a taper de son cote. Si le serveur doit rester actif entre deux echanges, le laisser tourner en arriere-plan et le lui dire.

## Regles de travail heritees (chantier en cours)

- **Aucun tiret cadratin ni demi-cadratin** dans tout texte visible produit ou modifie (virgules, deux-points, parentheses, tiret simple a la place).
- **Une branche dediee par lot, jamais de merge ni de push automatique** : Xavier valide au navigateur avant tout merge.
- **`TESTS.md` a jour en fin de lot** (section en tete, anti-chronologique).
- Livrer les rapports en **PDF sur le Bureau** (weasyprint), sans redemander.
- Ne pas toucher au bug e2e `feedback_completed` (Speaking) : session dediee.
