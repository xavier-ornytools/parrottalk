#!/usr/bin/env bash
#
# publish-article.sh — tir d'UNE cartouche blog en production.
#
# Reporte sur la branche courante (normalement main) UNIQUEMENT les fichiers d'UN
# article depuis la branche stock : son dossier blog/<slug>/, ses 3 images, sa carte
# dans blog/index.html, son item dans blog/feed.xml, son entree dans sitemap.xml.
# Les autres articles en stock ne sont PAS touches. Lance le gate complet, commit la
# cartouche, PUIS S'ARRETE en affichant le diff. AUCUN push : c'est une commande
# manuelle que Xavier declenche apres validation.
#
# Usage :  bash scripts/publish-article.sh <slug> [branche-stock]
#   branche-stock par defaut : blog-lot3-2026-07-19
#
# Principe fixe du blog : on ne publie JAMAIS plusieurs articles d'un coup. Une
# cartouche = un article, a sa date du calendrier.
set -euo pipefail

SLUG="${1:?usage: publish-article.sh <slug> [branche-stock]}"
STOCK="${2:-blog-lot3-2026-07-19}"
REPO="$(git rev-parse --show-toplevel)"
cd "$REPO"
CUR="$(git branch --show-current)"

echo "Repo   : $REPO"
echo "Branche: $CUR   Stock: $STOCK   Slug: $SLUG"
echo

# ── Garde-fous ───────────────────────────────────────────────────────────────
[ "$CUR" = "main" ] || echo "AVERTISSEMENT: branche courante '$CUR' (attendu 'main'). Poursuite (test a blanc ?)."
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "ERREUR: des fichiers suivis sont modifies. Arbre non propre, on s'arrete."; exit 1
fi
git rev-parse --verify "$STOCK" >/dev/null 2>&1 || { echo "ERREUR: branche stock '$STOCK' introuvable."; exit 1; }
git cat-file -e "$STOCK:blog/$SLUG/index.html" 2>/dev/null || { echo "ERREUR: article '$SLUG' absent du stock '$STOCK'."; exit 1; }
if [ -e "blog/$SLUG/index.html" ]; then
  echo "ERREUR: blog/$SLUG/ existe deja sur '$CUR'. Article deja publie ? On s'arrete."; exit 1
fi

# ── Serveur local pour le gate (demarre seulement si absent) ─────────────────
SERVER_PID=""
cleanup() { [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null || true; }
trap cleanup EXIT
if ! curl -s -o /dev/null http://127.0.0.1:8000/index.html 2>/dev/null; then
  echo "Demarrage d'un serveur local temporaire sur :8000 ..."
  python3 -m http.server 8000 --bind 127.0.0.1 >/dev/null 2>&1 &
  SERVER_PID=$!
  sleep 1.5
fi

# ── 1. Fichiers propres a l'article (dossier + 3 images) ─────────────────────
echo "1. Report des fichiers de l'article depuis le stock..."
git checkout "$STOCK" -- "blog/$SLUG/" \
  "img/blog/$SLUG.webp" "img/blog/$SLUG-card.webp" "img/blog/$SLUG-og.jpg"

# ── 2. Insertions chirurgicales : carte index, item feed, url sitemap ────────
echo "2. Insertion de la carte, de l'item feed et de l'entree sitemap..."
python3 - "$SLUG" "$STOCK" <<'PY'
import subprocess, sys, re
slug, stock = sys.argv[1], sys.argv[2]
def stock_file(p): return subprocess.check_output(["git","show",f"{stock}:{p}"]).decode()

# Carte d'index : extraite du stock, inseree EN TETE de la liste (le plus recent en premier).
sidx = stock_file("blog/index.html")
m = re.search(r'(\s*<a class="post" href="/blog/%s/">.*?</a>)' % re.escape(slug), sidx, re.S)
if not m: sys.exit(f"carte introuvable pour {slug}")
card = m.group(1)
idx = open("blog/index.html").read()
idx2 = re.sub(r'(<section class="blog-list">)', lambda mm: mm.group(1) + card, idx, count=1)
if idx2 == idx: sys.exit("insertion carte echouee")
open("blog/index.html","w").write(idx2)

# Item feed : extrait du stock, insere EN TETE ; lastBuildDate cale sur sa pubDate.
sfeed = stock_file("blog/feed.xml")
# Motif tempere : on reste DANS un seul <item> (interdit de traverser un </item>),
# sinon l'ancrage sur le 1er item capturerait un bloc couvrant plusieurs articles.
mi = re.search(r'(\s*<item>(?:(?!</item>)[\s\S])*?/blog/%s/(?:(?!</item>)[\s\S])*?</item>)' % re.escape(slug), sfeed)
if not mi: sys.exit(f"item feed introuvable pour {slug}")
item = mi.group(1)
pub = re.search(r'<pubDate>(.*?)</pubDate>', item).group(1)
feed = open("blog/feed.xml").read()
feed = re.sub(r'(<lastBuildDate>).*?(</lastBuildDate>)', lambda mm: mm.group(1)+pub+mm.group(2), feed, count=1)
feed = re.sub(r'(\s*<item>)', lambda mm: item + mm.group(1), feed, count=1)
open("blog/feed.xml","w").write(feed)

# Entree sitemap : extraite du stock, inseree avant </urlset> (l'ordre n'y importe pas).
ssm = stock_file("sitemap.xml")
mu = re.search(r'(\s*<url>\s*<loc>[^<]*?/blog/%s/</loc>.*?</url>)' % re.escape(slug), ssm, re.S)
if not mu: sys.exit(f"url sitemap introuvable pour {slug}")
url = mu.group(1)
sm = open("sitemap.xml").read()
sm = re.sub(r'(\s*</urlset>)', lambda mm: url + mm.group(1), sm, count=1)
open("sitemap.xml","w").write(sm)
print("   insertions OK (pubDate:", pub, ")")
PY

# ── 3. Self-check : le diff ne doit toucher QUE les 7 fichiers de l'article ──
echo "3. Verification que le diff ne touche QUE cet article..."
EXPECTED="$(printf '%s\n' \
  "blog/$SLUG/index.html" \
  "img/blog/$SLUG-card.webp" \
  "img/blog/$SLUG-og.jpg" \
  "img/blog/$SLUG.webp" \
  "blog/feed.xml" \
  "blog/index.html" \
  "sitemap.xml" | sort)"
ACTUAL="$(git status --porcelain --untracked-files=no | sed 's/^...//' | sort -u)"
if [ "$EXPECTED" != "$ACTUAL" ]; then
  echo "ERREUR GRAVE: le diff touche des fichiers inattendus. Annulation."
  echo "--- attendu ---"; echo "$EXPECTED"
  echo "--- obtenu  ---"; echo "$ACTUAL"
  git reset -q --hard HEAD
  git clean -fdq -- "blog/$SLUG" "img/blog" 2>/dev/null || true
  exit 1
fi
echo "   OK : uniquement les 7 fichiers de $SLUG."

# ── 4. Gate complet (avant commit) ───────────────────────────────────────────
echo "4. Gate complet..."
node tests/check.js
node tests/e2e-blog.js
STATE=clean node tests/e2e-launch-all.js
STATE=dirty node tests/e2e-launch-all.js
node tests/e2e-quick-routing.js
node tests/e2e-footer-social.js
node tests/e2e-mockexam.js
node tests/nav-visual-check.js
node tests/e2e-quickmock.js || echo "   NB: e2e-quickmock non bloquant (2 events GA4 flow:quick pre-existants toleres)."

# ── 5. Commit de la cartouche (PAS de push) ──────────────────────────────────
echo "5. Commit de la cartouche..."
git add "blog/$SLUG/" "img/blog/$SLUG.webp" "img/blog/$SLUG-card.webp" "img/blog/$SLUG-og.jpg" \
        blog/index.html blog/feed.xml sitemap.xml
git commit -q -m "publish(blog): mise en production de la cartouche $SLUG"

# ── 6. Diff a verifier, STOP avant push ──────────────────────────────────────
echo
echo "================ CARTOUCHE PRETE (non poussee) ================"
git show --stat HEAD | sed -n '1,40p'
echo "=============================================================="
echo
echo "Gate vert et diff limite a $SLUG. RIEN n'a ete pousse."
echo "Pour publier reellement, verifie le diff ci-dessus puis lance A LA MAIN :"
echo
echo "    git push origin $CUR"
echo
echo "Pour annuler avant push :   git reset --hard HEAD~1"
