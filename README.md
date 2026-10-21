# Pokémon Survivor · fork interface (Lugiapsy)

Ce dépôt est un **fork** du projet de Neocrizis([neocrizis/Pokemon-survivor](https://github.com/neocrizis/Pokemon-survivor)), qui reste la branche principale : lui s'occupe du gameplay, ce fork sert à travailler l'interface (menus, nouvelles pages, aspect visuel, arrière-plans). Chaque modification est numérotée (MAJ-001, MAJ-002…) pour pouvoir être reprise dans le projet principal.

**Jouer à cette version :** https://lugiapsy.github.io/Pokemon-survivor/
**Jouer à la version officielle :** https://neocrizis.github.io/Pokemon-survivor/

## Jouer en ligne avec des amis
1. Sur l'écran titre, clique sur **🌐 En ligne** puis **Créer un salon**.
2. Donne le code (5 caractères) ou le lien affiché à tes amis (jusqu'à 3 amis).
3. Chacun choisit son starter, puis l'hôte clique sur **Lancer la partie**.

L'hôte fait tourner la partie : il doit garder sa page ouverte. La connexion se fait directement entre les navigateurs (PeerJS / WebRTC). Tous les joueurs doivent être sur la même version du jeu.

## Jouer à plusieurs sur un seul ordinateur
Bouton **👥 1 joueur** sur l'écran titre (jusqu'à 4) : J1 au clavier et à la souris, les autres à la manette.

## Sauvegarde
La progression est gardée dans le navigateur, propre à chaque adresse : celle de ce fork est séparée de celle de la version officielle. La sauvegarde Google (Firebase) est configurée pour le site de Raphaël et peut refuser la connexion depuis ce fork.

## Modifier le code
Le code source est découpé dans `src/` (`src/index.html`, `src/css/`, `src/js/`). Après une modification, reconstruire `index.html` (le fichier servi par GitHub Pages) :

    python tools/build.py

`tools/split.py` refait le découpage à partir d'un `index.html` complet. L'interface (menu d'accueil, Paramètres, Mentions légales…) vient du fork de [Lugiapsy](https://github.com/Lugiapsy/Pokemon-survivor), détail dans [CHANGELOG-FORK.md](CHANGELOG-FORK.md).

## Licence
Projet de fan, non commercial. Pokémon © Nintendo / Creatures / GAME FREAK.
Sprites : PMD Sprite Repository (SpriteCollab), CC BY-NC 4.0, voir [CREDITS.md](CREDITS.md).
