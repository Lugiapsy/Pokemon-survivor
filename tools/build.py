"""Rassemble les fichiers de src/ en un seul index.html (celui que GitHub Pages sert, et le format du projet de Neocrizis).

    python tools/build.py

Chaque ligne <!-- @include chemin --> de src/index.html est remplacée par le contenu du fichier.
"""
import pathlib, re

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


if __name__ == "__main__":
    main()
