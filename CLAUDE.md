# Pokémon Survivor : consignes pour Claude

## Structure
- On modifie les fichiers de `src/` (page `src/index.html`, styles `src/css/`, jeu `src/js/`, images `src/assets/`), puis on lance `python tools/build.py`, qui reconstruit `index.html` (le fichier servi par GitHub Pages). Ne pas modifier `index.html` à la main.
- `tools/build.py` affiche une ligne `ATTENTION` s'il manque une icône de capacité ou un portrait : à traiter avant de livrer.

## Nouvelle capacité → toujours créer son icône
Chaque capacité de `MOVES` (`src/js/05-capacites-objets.js`) a une icône pixel art 16×16 affichée dans l'interface en partie.
- Ajouter une fonction au même `id` dans `FH_ICONS` de `src/js/40-fork-hud.js` : `nomcapacite(g) { … }`.
- Dessiner sur une grille de 16×16 avec les aides `FHP` déjà présentes : `circ`, `ell`, `poly`, `line`, `arc`, `flame`, `bolt`, `drop`, `star`, `leaf`, `claw`, `fang`, `wave`. Le code rend ensuite les pixels nets et ajoute un contour sombre : pas besoin de le faire soi-même.
- Style : 2 à 4 couleurs vives, un symbole simple et lisible qui évoque l'attaque (flamme, éclair, goutte, feuille…), centré, sans texte.
- Le fond de la case prend la couleur du type (`FH_BG`). Ajouter la couleur si c'est un nouveau type.
- Une capacité partagée par plusieurs Pokémon garde la même icône. Sans icône, la case affiche l'initiale du nom : c'est un oubli à corriger.

## Nouveau Pokémon jouable (ou nouvelle évolution) → ajouter ses portraits
- Portrait neutre de chaque stade : `https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/portrait/NNNN/Normal.png` (NNNN = numéro du Pokédex sur 4 chiffres, comme dans `DEX`).
- À ajouter en data URL PNG dans `window.FORK_PORTRAITS` de `src/assets/fork-pick-assets.js` (clé `"NNNN"`). Utilisé par l'écran de sélection du Pokémon et par l'interface en partie (le portrait suit les évolutions).
- Mentionner les nouveaux sprites et portraits dans `CREDITS.md` (SpriteCollab, CC BY-NC 4.0).
