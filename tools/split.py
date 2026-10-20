"""Découpe index.html (fichier unique, format du projet de Neocrizis) en fichiers rangés dans src/.

    python tools/split.py              # découpe ./index.html
    python tools/split.py autre.html   # découpe un autre fichier (ex. une nouvelle version de Neo)

Le découpage se fait sur des repères de texte (pas des numéros de ligne), il reste donc valable
quand Neo ajoute du code. Si un repère disparaît, le script s'arrête et dit lequel : il suffit
alors de corriger la liste JS_PARTS ci-dessous.
tools/build.py fait l'inverse et redonne un index.html identique à l'octet près.
"""
import pathlib, shutil, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

# Fichiers JS, dans l'ordre : (nom, début de la première ligne du fichier)
JS_PARTS = [
    ("00-base.js",                     "const $ = id =>"),
    ("01-progression.js",              "// Pokédex : K.O. cumulés"),
    ("02-ecran.js",                    'const cv = $("game")'),
    ("03-types.js",                    "/* ---------- Types & table"),
    ("04-starters.js",                 "/* ---------- Lignées de starters"),
    ("05-capacites-objets.js",         "/* ---------- Capacités et objets"),
    ("06-ennemis-niveaux.js",          "/* ---------- Ennemis et niveaux"),
    ("07-dessin-procedural.js",        "/* ---------- Dessin procédural"),
    ("08-sprites-pmd.js",              "/* ---------- Sprites PMD"),
    ("09-etat-partie.js",              "/* ---------- État de partie"),
    ("10-oiseau-legendaire.js",        "// Oiseau Légendaire : stalactites"),
    ("11-ligue-indigo.js",             "// Ligue Indigo : enchaînement"),
    ("12-joueurs-controles.js",        "function nearP(x, y)"),
    ("13-spawns.js",                   "/* ---------- Spawns"),
    ("14-evenements.js",               "/* ---------- Événements"),
    ("15-combat.js",                   "/* ---------- Combat"),
    ("16-johto.js",                    "/* ---------- Johto"),
    ("17-capacites-joueur.js",         "function updateMoves(dt)"),
    ("18-boucle.js",                   "/* ---------- Boucle"),
    ("19-montee-niveau.js",            "/* ---------- Montée de niveau"),
    ("20-fin.js",                      "/* ---------- Fin"),
    ("21-sons-musique.js",             "/* ---------- Sons et musique"),
    ("22-hud.js",                      "/* ---------- HUD"),
    ("23-carte-foret-arenes.js",       "/* ---------- Rendu"),
    ("24-carte-tour-manoir-rocket.js", "function towerChunk("),
    ("25-carte-grottes.js",            "function caveChunk("),
    ("26-collisions-rendu-foret.js",   "function around("),
    ("27-rendu.js",                    "let frameNo = 0;"),
    ("28-ecran-titre.js",              "/* ---------- Écran titre"),
    ("29-entrees.js",                  "/* ---------- Entrées"),
    ("30-manette.js",                  "/* ---------- Manette"),
    ("31-en-ligne.js",                 "/* ---------- En ligne"),
    ("32-maj-et-cloud.js",             "// Sur GitHub Pages : si une version"),
]
GAME_OPEN = [b'(() => {\n', b'"use strict";\n']  # début du script du jeu
GAME_CLOSE = b'})();\n'                           # fin du script du jeu


def inc(path):
    return f"<!-- @include {path} -->\n".encode()


def find(lines, start, pred, what):
    for i in range(start, len(lines)):
        if pred(lines[i]):
            return i
    sys.exit(f"Repère introuvable : {what}")


def main():
    html = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "index.html"
    lines = html.read_bytes().splitlines(keepends=True)
    files = {}  # chemin dans src/ -> contenu
    tpl = []

    # 1. CSS principal : la balise <style> seule sur sa ligne (un éventuel <style> d'une ligne reste dans la page)
    s = find(lines, 0, lambda l: l.strip() == b"<style>", "<style> principal")
    e = find(lines, s, lambda l: l.strip() == b"</style>", "</style>")
    tpl += lines[:s + 1] + [inc("css/style.css")]
    files["css/style.css"] = b"".join(lines[s + 1:e])

    # 2. Sprites : <script> qui définit window.PMD_SHEETS
    sp = find(lines, e, lambda l: l.startswith(b"window.PMD_SHEETS"), "window.PMD_SHEETS")
    so = sp - 1 if lines[sp - 1].startswith(b"/*") else sp
    while lines[so - 1].strip() != b"<script>":
        so -= 1
    sc = find(lines, sp, lambda l: l.strip() == b"</script>", "</script> des sprites")
    tpl += lines[e:so] + [inc("assets/sprites.js")]
    files["assets/sprites.js"] = b"".join(lines[so:sc])

    # 3. Script du jeu, découpé en morceaux
    g = find(lines, sc + 1, lambda l: l == GAME_OPEN[0], "début du script du jeu")
    if lines[g + 1] != GAME_OPEN[1]:
        sys.exit('"use strict" attendu après (() => {')
    gc = max(i for i, l in enumerate(lines) if l == GAME_CLOSE)
    tpl += lines[sc:g + 2]
    starts, pos = [], g + 2
    for name, mark in JS_PARTS:
        pos = find(lines, pos, lambda l: l.startswith(mark.encode()), f"{name} ({mark})")
        starts.append(pos)
    if starts[0] != g + 2:
        sys.exit("Du code se trouve avant le premier repère : ajouter un morceau à JS_PARTS")
    for k, (name, _) in enumerate(JS_PARTS):
        end = starts[k + 1] if k + 1 < len(JS_PARTS) else gc
        files[f"js/{name}"] = b"".join(lines[starts[k]:end])
        tpl.append(inc(f"js/{name}"))
    tpl += lines[gc:]
    files["index.html"] = b"".join(tpl)

    for d in ("css", "assets", "js"):
        shutil.rmtree(SRC / d, ignore_errors=True)
    for path, data in files.items():
        p = SRC / path
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(data)
    print(f"{html.name} découpé en {len(files)} fichiers dans src/")


if __name__ == "__main__":
    main()
