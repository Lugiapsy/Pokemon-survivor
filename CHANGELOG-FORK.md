# Journal du fork (Lugiapsy)

Fork de [neocrizis/Pokemon-survivor](https://github.com/neocrizis/Pokemon-survivor) consacré à l'interface. Le projet de Neo reste la branche principale.

- **Numérotation** : chaque envoi sur GitHub est une mise à jour **MAJ-NNN**, affichée en jeu « Version 135 · Fork NN ». Entre deux envois, tout reste en local et compte dans la même mise à jour.
- **Version du jeu** (135, 136…) : lue dans le code de Neo (`NET_VER`), elle change toute seule quand on récupère ses mises à jour.

---

## MAJ-002 · Fork 02 (base : v141 de Neo)

### Mises à jour de Neo intégrées (v136 → v141)
- Nouveau choix du starter : carrousel, fiches Stats et Attaques, onglets Kanto/Johto, Poké Ball et Master Ball.
- Marchand : nouveaux prix, objets permanents de Johto (Rappel, Dé Pipé, Loupe, Veste de Combat, Lentilscope).
- Pokédex : Ronflex compte comme boss pour les récompenses, paliers des boss 1 / 5 / 10 / 15.
- Fusion : le carrousel garde le bouton « ← Menu » du fork ; crédits et aide restent dans Mentions légales et Paramètres.

### Corrections
- **Accents** : la v141 n'a plus d'en-tête de page ; ajout de `<meta charset="utf-8">` en tête, sinon les accents s'affichent mal hors de GitHub Pages (en local, en double-cliquant le fichier).
- **Mère Ossatueur** : l'apaiser compte désormais au Pokédex (`dexCount` dans `motherCalm`) ; avant, sa case restait noire pour toujours.
- `tools/split.py` trouve le style principal même sans `<head>`.

### Pokédex
- Catégorie **Boss** (30) : géants par numéro de Pokédex, puis **Mère Ossatueur** (de retour, paliers de boss), puis Arbok de Jessie, Smogogo de James, Miaouss de la Team Rocket, puis la Ligue.
- **Ronflex** reste dans la catégorie Pokémon (n° 143), avec les paliers de boss de Neo.

### Menus
- Magasin, Pokédex et Succès : bouton **« ← Menu »** en haut à gauche, comme l'écran de choix (le bouton « Retour » du bas reste).

### Notes pour l'intégration chez Neo
- À lui signaler : l'encodage manquant (`<meta charset="utf-8">`) et la Mère Ossatueur jamais comptée au Pokédex.

---

## MAJ-001 · Fork 01 (base : v135 de Neo)

### Organisation du code
- `index.html` (fichier unique, format de Neo) est découpé en fichiers dans `src/` :
  `src/index.html` (structure), `src/css/style.css`, `src/assets/sprites.js`, et le jeu en fichiers numérotés dans `src/js/` (00-base → 32-maj-et-cloud).
- `tools/build.py` reconstruit `index.html` depuis `src/` (c'est ce fichier que sert GitHub Pages).
- `tools/split.py` découpe un `index.html` de Neo de la même façon (repères de texte, pas de numéros de ligne).
- Les ajouts du fork sont dans des fichiers à part : `src/css/fork-menu.css`, `src/js/33-fork-menu.js`, `src/assets/fork-sprites.js`.
- Branche `neo` : référence de la version de Neo, pour fusionner ses mises à jour fichier par fichier.

### Écran d'accueil (nouveau)
- Au lancement, un menu : logo, puis **Solo**, **Multijoueur**, **Magasin** (avec le solde de ₽), **Pokédex**, **Succès**, **Paramètres**, **Mentions légales**. La version « Version 135 · Fork 01 » est affichée en bas.
- **Solo** et **Multijoueur** ouvrent l'ancien écran, devenu le choix du niveau et du starter. Solo masque les options multijoueur, Multijoueur affiche le local et l'en ligne. Un bouton **← Menu** ramène à l'accueil.
- Magasin, Pokédex et Succès reviennent à l'accueil ; **Échap** revient au menu depuis toutes ces pages.
- Un lien d'invitation en ligne (`…/#CODE`) mène directement à l'écran multijoueur.
- Sur téléphone en paysage, menu sur deux colonnes.

### Paramètres (nouvelle page)
- **Volume** de 0 à 100 % (curseur) et bouton couper / remettre le son.
- Auto-validation de la Super Potion, sauvegarde Google, plein écran (mobile), liste des commandes.

### Mentions légales (nouvelle page)
- Jeu de fan non commercial, droits Pokémon, crédits des sprites (SpriteCollab, CC BY-NC 4.0), musiques synthétisées, données et jeu en ligne, liens vers le jeu de Neo et le fork.

### En partie
- Le bouton son quitte le HUD.
- **Pause** : récap (temps, K.O., niveau, ₽, dégâts) puis **Reprendre**, **⚙️ Options**, **Quitter la partie**.
- **Options** : volume 0-100 % (mémorisé) et auto-validation de la Super Potion.
- **Écran de fin** : le bouton « Rejouer » s'appelle **« Quitter »**.

### Pokédex
- Retrait de 5 entrées impossibles à compléter : Esprit d'Ossatueur (boss inutilisé), Mère Ossatueur (apaisée, pas vaincue), Minidraco, Noeunoeuf et Scarabrute du Parc Safari (attrapés, pas vaincus). Ronflex reste.
- Deux catégories avec compteur « vus / total » :
  - **Pokémon** (105), triés par numéro de Pokédex. Mewtwo, Artikodin, Électhor et Sulfura y restent.
  - **Boss** (29) : géants par numéro de Pokédex (Arbok géant compris), puis Arbok de Jessie, Smogogo de James, Miaouss de la Team Rocket, puis Lokhlass d'Olga, Mackogneur d'Aldo, Ectoplasma d'Agatha, Dracolosse de Peter, Alakazam du Champion.
- Images à la **même échelle (x2)**, découpées au plus près : les petits Pokémon restent petits. Cases plus larges.

### Corrections de bugs du jeu de Neo
- **Pichu Troizépi** : il utilisait l'image du Pichu chromatique normal. Ajout du vrai sprite (SpriteCollab `0172/0001`) dans `src/assets/fork-sprites.js`. Taux d'apparition inchangé (1 sur 30).

### Notes pour l'intégration chez Neo
- Modifications dans ses fichiers, à reprendre : retours vers l'accueil (`closeAch`, `closeShop`, `closeDex`), texte du bouton Magasin (`refreshMoneyTag`), liste des écrans à la manette (`overlayButtons`), volume (`AU.vol`, 4 lignes dans les sons), `hideDex` sur 5 Pokémon, `openDex` (catégories, tri, échelle commune), `DEX.pichuspiky`.
- `src/js/34-fork-debug.js` est un outil de test du fork : ne pas l'envoyer à Neo.
