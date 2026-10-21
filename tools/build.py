"""Rassemble les fichiers de src/ en un seul index.html (celui que GitHub Pages sert, et le format du projet de Neocrizis).

    python tools/build.py

Chaque ligne <!-- @include chemin --> de src/index.html est remplacée par le contenu du fichier.
"""
import pathlib, re, sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(errors="replace")  # accents lisibles même dans un terminal Windows

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
INC = re.compile(rb"^<!-- @include (\S+) -->\r?\n?$")


def main():
    out = []
    for line in (SRC / "index.html").read_bytes().splitlines(keepends=True):
        m = INC.match(line)
        out.append((SRC / m.group(1).decode()).read_bytes() if m else line)
    (ROOT / "index.html").write_bytes(b"".join(out))
    print("index.html reconstruit depuis src/")
    check_icons()


def check_icons():
    """Rappel : chaque capacité doit avoir son icône (src/js/40-fork-hud.js, FH_ICONS) et chaque
    évolution des starters son portrait (src/assets/fork-pick-assets.js, FORK_PORTRAITS). Voir CLAUDE.md."""
    js = lambda name: (SRC / "js" / name).read_text(encoding="utf-8")
    hud, assets = SRC / "js" / "40-fork-hud.js", SRC / "assets" / "fork-pick-assets.js"
    if not hud.exists():
        return
    src = js("05-capacites-objets.js")
    block = src[src.index("const MOVES = {"):src.index("const ITEMS = {")]
    moves = re.findall(r'\n\s*([a-z0-9]+)\s*:\s*\{\s*name:\s*"([^"]*)"', block)
    icons = set(re.findall(r"^\s*([a-z0-9]+)\(g\)\s*\{", hud.read_text(encoding="utf-8"), re.M)) | {f"metro{n}" for n in range(1, 7)}
    missing = [f"{k} ({n})" for k, n in moves if k not in icons]
    if missing:
        print(f"ATTENTION : {len(missing)} capacité(s) sans icône, à dessiner dans FH_ICONS de src/js/40-fork-hud.js : " + ", ".join(missing))
    dex = js("08-sprites-pmd.js")
    order = re.search(r"const starterOrder = \[([^\]]*)\]", js("28-ecran-titre.js"))
    lines = re.findall(r'"([a-z]+)"', order.group(1)) if order else []
    eevee = js("04-starters.js")
    eevee = eevee[eevee.index("const EEVEE = {"):] if "const EEVEE = {" in eevee else ""
    forms = re.findall(r"\n\s*([a-z]+)\s*:\s*\{\s*name", eevee[:eevee.find("};") + 1])
    need = set()
    for key in lines + forms:
        m = re.search(r"\b" + key + r':\s*(\[[^\]]*\]|"[^"]*")', dex)
        if m:
            need |= {x[:4] for x in re.findall(r'"(\d{4})', m.group(1))}
    have = set(re.findall(r'"(\d{4})":"data:image', assets.read_text(encoding="utf-8"))) if assets.exists() else set()
    if need - have:
        print("ATTENTION : portraits manquants (SpriteCollab portrait/NNNN/Normal.png) à ajouter dans FORK_PORTRAITS de src/assets/fork-pick-assets.js : " + ", ".join(sorted(need - have)))


if __name__ == "__main__":
    main()
