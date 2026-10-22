# Journal du fork (Lugiapsy)

Fork de [neocrizis/Pokemon-survivor](https://github.com/neocrizis/Pokemon-survivor) consacré à l'interface. Le projet de Neo reste la branche principale.

- **Numérotation** : chaque envoi sur GitHub est une mise à jour **MAJ-NNN**, affichée en jeu « Version 135 · Fork NN ». Entre deux envois, tout reste en local et compte dans la même mise à jour.
- **Version du jeu** (135, 136…) : lue dans le code de Neo (`NET_VER`), elle change toute seule quand on récupère ses mises à jour.

---

## MAJ-005 · Fork 05 (base : v174 de Neo)

Pas de nouvelle version de Neo dans cette mise à jour.

### Menu pause
- Plus de bouton Statistiques : « Capacités » ouvre en même temps les statistiques (à gauche) et les capacités (à droite).
- Les objets sont détaillés niveau par niveau sous les capacités (partie « OBJETS »), comme les attaques : niveaux obtenus en blanc, à venir en gris. Chaque ligne donne le total à ce niveau, avec les formules du jeu (ex. Carbone +12 %, +25 %, +40 %… car les bonus se multiplient).

### Thème Lugiapsy sur les pages du menu
- Accueil, Paramètres, Mentions légales, Magasin, Succès et Pokédex reprennent les fenêtres et boutons de la sélection du Pokémon : fond vert, cadre bleu nuit bordé d'or, cases grises, bouton d'action doré.
- Un seul bouton de retour, rouge, en haut à gauche (le « Retour » du bas est caché).
- Magasin : boutons d'achat dorés, grisés sans assez de Pokédollars. Succès : obtenus en clair à cadre doré, à faire en foncé. Pokédex : cases façon sélection du Pokémon, plus foncées pour les Pokémon pas encore vus.
- Actif seulement avec Paramètres > Thème menu = Lugiapsy ; le thème Neocrizis et le Multijoueur gardent le style de Neo.

### Gameplay : Pichu dans la Forêt de Jade (à valider par Neo)
- Avec Pichu, les Pichu, Pikachu et Raichu sauvages ne sont plus remplacés par Lixy, Luxio et Luxray.
- Lixy, Luxio et Luxray sont retirés : sprites (0403 à 0405), cases du Pokédex, crédits, phrase de la description de Pichu. L'astuce de la Forêt de Jade parle des éclairs des Pikachu.
- Leurs trois fiches (`FOES.lixy`, `luxio`, `luxray`) restent, cachées (`hideDex`) : le jeu recalcule les Pokédollars du Pokédex à partir des fiches, les effacer ferait perdre cet argent aux joueurs qui en ont déjà mis K.O.

### Pour les futures versions de Neo
- Nouveau fichier propre au fork : `fork-theme.css` (classe `body.thLugia`, posée par `38-fork-pick.js` selon le thème menu).

---

## MAJ-004 · Fork 04 (base : v174 de Neo)

Pas de nouvelle version de Neo dans cette mise à jour.

### Choix de la carte (Solo, thème menu Lugiapsy, style Vampire Survivors + Megabonk)
- Sélection du Pokémon → Confirmer ouvre ce nouvel écran à la place de celui de Neo, puis « Commencer » lance la partie.
- À gauche, les régions Kanto et Johto en rectangles verticaux (image, Mewtwo ou Celebi animé, niveaux terminés). Johto reste fermé tant que la Caverne Azurée n'est pas finie.
- Au centre, les niveaux empilés : image du lieu (vraie capture du jeu), nom, description, durée, 🏆 si terminé. Un niveau fermé est assombri, avec un cadenas et sa condition. La Caverne Azurée s'affiche « ??? » tant qu'elle est secrète, les étapes de Johto pas encore faites s'affichent « Bientôt ».
- À droite, la fiche : grande image, durée, parties jouées, K.O., Pokémon sauvages et boss animés (silhouette noire s'ils n'ont jamais été vus au Pokédex), bouton Commencer avec le portrait du Pokémon, bouton Nuzlocke.
- Cliquer sur une carte la sélectionne seulement ; la partie démarre avec « Commencer ». Clavier, manette (LB/RB pour changer de région), version compacte sur téléphone en paysage, contenu centré sur écran large (21/9).
- Après une partie, « Rejouer » revient sur cet écran.
- Les Pokémon et boss sont lus dans les tables des niveaux de Neo : ses futurs niveaux apparaîtront tout seuls (il faudra seulement leur ajouter une image dans `fork-carte-assets.js`).

### Oiseau Légendaire en trois niveaux optionnels
- Dans le choix de la carte, le niveau 7 devient 7-1 Île Écume, 7-2 Centrale électrique et 7-3 Route Victoire, sans tirage au sort. Chacun a son image, sa description, ses Pokémon, ses boss et son oiseau.
- Les trois s'ouvrent après le Manoir, un seul suffit pour ouvrir la Ligue. Les cartes terminées sont notées (`pokesurv-birds`). Le jeu de Neo n'est pas modifié : la carte choisie est imposée au lancement.
- Le titre au-dessus du chrono et dans le menu pause affiche le nom de la carte.

### Sélection du Pokémon
- Vraies valeurs des statistiques (plus de « – ») : base du Pokémon + achats du Marchand, avec le gain total entre parenthèses (ex. Attaque 132 (+32 %)).
- Filtre renommé « Filtre génération ». Nouveau panneau des niveaux Kanto / Johto avec un trophée par niveau terminé avec le Pokémon de la fiche.

### Pour les futures versions de Neo
- Nouveaux fichiers propres au fork : `42-fork-carte.js`, `fork-carte.css`, `fork-carte-assets.js` (images des lieux).
- Prototypes et captures : `prototypes/carte/` (5 prototypes ; `capture.html` refait les images des lieux depuis le jeu).

---

## MAJ-003 · Fork 03 (base : v174 de Neo)

### Mises à jour de Neo intégrées (v142 → v174)
- Neo avait repris MAJ-001 et MAJ-002 : fusion directe de son dépôt (même structure `src/`).
- Nouvel écran du niveau (carte de route Kanto / Johto, fiche du starter, capture à la Poké Ball), nouveau logo, décors vivants, Togepi jouable.
- Il a retiré les mentions du fork chez lui : elles sont remises ici depuis un fichier propre au fork (« Fork NN » à côté de la version, « Fork : Lugiapsy » dans les Mentions légales).

### Thème menu (Paramètres)
- **Lugiapsy** (par défaut) : les écrans du fork ci-dessous. **Neocrizis** : écrans de Neo.

### Sélection du Pokémon (Solo, style Vampire Survivors)
- Grille de portraits PMD, « ? » pour les Pokémon verrouillés avec le succès à obtenir.
- 16 statistiques avec l'icône de l'objet correspondant, calculées avec les vrais achats du Marchand (badge ×N).
- Filtre Kanto / Johto ; skins de Pichu (Classique / Troizépi) en cliquant sur le Pokémon animé (visuel seulement).
- Confirmer → écran du niveau **sans carrousel** : on choisit le niveau, puis « ▶ Jouer avec … » ; bouton « ← Retour », « Changer de Pokémon ».

### Interface en partie (style Holocure)
- Portrait qui suit les évolutions, nom + niveau, grande barre de PV.
- Icônes pixel art 16×16 des 59 capacités (fond de la couleur du type) et icônes des objets, avec des carrés de niveau selon le max réel (Dé Pipé 2).
- Nom du niveau + chrono au centre, mini-carte en haut à droite et K.O. dessous, XP fine en haut, bouton Pause seulement sur écran tactile.

### Menu pause
- Fond de jeu flouté et assombri, panneau PAUSE bleu foncé à cadre doré : Reprendre, Capacités, Statistiques, Options, Quitter.
- Capacités : chaque niveau de chaque capacité (acquis en blanc, à venir en gris) + objets. Statistiques : portrait, PV, stats en cours de partie. Le panneau glisse pour leur faire de la place.

### Corrections
- L'interface du fork ne reste plus affichée derrière les menus après une partie.

### Pour les futures versions de Neo
- `CLAUDE.md` : consignes lues par Claude Code (nouvelle capacité → icône, nouveau Pokémon → portraits).
- `tools/build.py` signale les capacités sans icône et les portraits manquants.
- Fichiers propres au fork : `38-fork-pick.js`, `39-fork-debug.js`, `40-fork-hud.js`, `41-fork-pause.js`, `fork-pick.css`, `fork-hud.css`, `fork-pause.css`, `fork-pick-assets.js`.
- Prototypes et maquettes : `prototypes/selection/` et `prototypes/hud/`.

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
