
/* ---------- Fork (Lugiapsy) : interface en partie façon Holocure (thème menu « Lugiapsy ») ----------
   En haut à gauche : portrait du Pokémon (suit ses évolutions), nom + niveau, grande barre de PV, puis une rangée d'icônes
   de capacités et une rangée d'icônes d'objets, avec des petits carrés de niveau (autant que le niveau max réel).
   Au centre : nom du niveau + chrono. En haut à droite : mini-carte, K.O. dessous. Barre d'XP fine tout en haut.
   Pas de bouton Pause sur ordinateur (il reste sur écran tactile). Partie à un seul joueur, hors ligne ; sinon interface de Neo. */
/* NOUVELLE CAPACITÉ → ajouter son icône dans FH_ICONS ci-dessous (même id que dans MOVES), voir CLAUDE.md.
   tools/build.py signale toute capacité sans icône. */
const FH_TAU = Math.PI * 2;
const FHP = {
  circ(g, x, y, r, c) { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, FH_TAU); g.fill(); },
  ell(g, x, y, rx, ry, a, c) { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, FH_TAU); g.fill(); },
  poly(g, pts, c) { g.fillStyle = c; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); },
  line(g, x1, y1, x2, y2, w, c) { g.strokeStyle = c; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); },
  arc(g, x, y, r, a0, a1, w, c) { g.strokeStyle = c; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); g.arc(x, y, r, a0, a1); g.stroke(); },
  // flamme : base ronde, pointe vers le haut
  flame(g, x, y, s, c1, c2) {
    g.fillStyle = c1; g.beginPath(); g.moveTo(x, y - 7 * s); g.quadraticCurveTo(x + 5 * s, y - 2 * s, x + 3.6 * s, y + 2 * s); g.quadraticCurveTo(x, y + 4.5 * s, x - 3.6 * s, y + 2 * s); g.quadraticCurveTo(x - 5 * s, y - 2 * s, x, y - 7 * s); g.fill();
    g.fillStyle = c2; g.beginPath(); g.moveTo(x, y - 2.5 * s); g.quadraticCurveTo(x + 2.4 * s, y + .5 * s, x + 1.6 * s, y + 2 * s); g.quadraticCurveTo(x, y + 3 * s, x - 1.6 * s, y + 2 * s); g.quadraticCurveTo(x - 2.4 * s, y + .5 * s, x, y - 2.5 * s); g.fill();
  },
  bolt(g, x, y, s, c) { FHP.poly(g, [x + 1 * s, y - 7 * s, x - 3.5 * s, y + .5 * s, x - .2 * s, y + .5 * s, x - 1.5 * s, y + 7 * s, x + 3.8 * s, y - 1.5 * s, x + .4 * s, y - 1.5 * s], c); },
  drop(g, x, y, s, c) { g.fillStyle = c; g.beginPath(); g.moveTo(x, y - 5 * s); g.quadraticCurveTo(x + 4 * s, y, x + 3 * s, y + 2 * s); g.arc(x, y + 1.8 * s, 3 * s, 0, Math.PI); g.quadraticCurveTo(x - 4 * s, y, x, y - 5 * s); g.fill(); },
  star(g, x, y, r, c, n = 5) { const pts = []; for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * .45 : r; pts.push(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } FHP.poly(g, pts, c); },
  leaf(g, x, y, a, s, c1, c2) { g.save(); g.translate(x, y); g.rotate(a); FHP.ell(g, 0, 0, 6 * s, 2.5 * s, 0, c1); g.fillStyle = c2; g.fillRect(-5 * s, -.5, 10 * s, 1); g.restore(); },
  claw(g, x, y, c) { for (let i = 0; i < 3; i++) FHP.line(g, x + i * 3.5, y, x + i * 3.5 - 4, y + 10, 1.6, c); },
  fang(g, x, y, s, c) { FHP.poly(g, [x - 2 * s, y, x + 2 * s, y, x, y + 5 * s], c); },
  wave(g, y, c, amp = 2) { g.fillStyle = c; g.beginPath(); g.moveTo(0, 16); g.lineTo(0, y); for (let x = 0; x <= 16; x++) g.lineTo(x, y + Math.sin(x / 2.2) * amp); g.lineTo(16, 16); g.fill(); },
};
const FH_ICONS = {
  /* ---- Plante ---- */
  tranchherbe(g) { FHP.leaf(g, 8, 8, -Math.PI / 4, 1.2, "#7fd858", "#3f8f2c"); FHP.leaf(g, 8.5, 8.5, Math.PI / 4, 1.2, "#a8ec7a", "#4c9e36"); },
  fouetlianes(g) {
    g.strokeStyle = "#4c9e36"; g.lineWidth = 2.4; g.lineCap = "round"; g.beginPath(); g.moveTo(2.5, 14); g.bezierCurveTo(13, 12, 2, 5, 13, 2.5); g.stroke();
    FHP.ell(g, 4.5, 8.5, 2.6, 1.5, -.6, "#8fe060"); FHP.ell(g, 11.5, 8, 2.6, 1.5, .7, "#8fe060");
  },
  poudretoxik(g) { for (const [x, y, r] of [[5, 9, 3.6], [9, 6.5, 4.2], [12, 10, 3.3], [8, 11, 3.4]]) FHP.circ(g, x, y, r, "#9a4fc0"); g.fillStyle = "#e0a8ff"; for (const [x, y] of [[6, 8], [9, 5], [11, 9], [8, 11], [4, 11]]) g.fillRect(x, y, 1.6, 1.6); },
  lancesoleil(g) {
    FHP.line(g, 6, 6, 15, 15, 3.2, "#fff6c0");
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; FHP.line(g, 5.5 + Math.cos(a) * 3.5, 5.5 + Math.sin(a) * 3.5, 5.5 + Math.cos(a) * 5.4, 5.5 + Math.sin(a) * 5.4, 1.6, "#ffe14a"); }
    FHP.circ(g, 5.5, 5.5, 3.2, "#ffcf2a");
  },
  dansepetale(g) { for (let i = 0; i < 5; i++) { const a = i * FH_TAU / 5 + .3, r = 3.8 + i * .45; FHP.ell(g, 8 + Math.cos(a) * r, 8 + Math.sin(a) * r, 2.6, 1.5, a + 1.2, i % 2 ? "#ff9ccf" : "#ff6fae"); } FHP.circ(g, 8, 8, 1.6, "#ffe066"); },
  vampigraine(g) {
    FHP.ell(g, 7, 10.5, 4, 3.4, -.3, "#b07a3a"); FHP.ell(g, 5, 5, 2.8, 1.5, -.7, "#7fd858"); FHP.ell(g, 9.5, 4.8, 2.8, 1.5, .7, "#7fd858");
    g.fillStyle = "#4c9e36"; g.fillRect(6.8, 5, 1.2, 3); FHP.drop(g, 13, 11, .7, "#e8403a");
  },
  feuillemagik(g) { FHP.leaf(g, 7, 9, -.6, 1.1, "#8fe060", "#3f8f2c"); FHP.star(g, 12.5, 4, 3, "#fff3a0", 4); FHP.star(g, 3.5, 3.5, 1.8, "#d8ffb0", 4); },
  synthese(g) { FHP.circ(g, 11, 5, 3.2, "#ffd84a"); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; FHP.line(g, 11 + Math.cos(a) * 4, 5 + Math.sin(a) * 4, 11 + Math.cos(a) * 5.2, 5 + Math.sin(a) * 5.2, 1.2, "#ffe88a"); } FHP.leaf(g, 6, 11, -.5, 1, "#7fd858", "#3f8f2c"); },
  tapisfleuri(g) { FHP.wave(g, 12, "#4c9e36", 1); for (const [x, y, c] of [[4, 8, "#ff7ab8"], [9, 6, "#ffe066"], [13, 9, "#ff9ccf"], [7, 11, "#ffffff"]]) { for (let i = 0; i < 5; i++) { const a = i * FH_TAU / 5; FHP.circ(g, x + Math.cos(a) * 1.6, y + Math.sin(a) * 1.6, 1.2, c); } FHP.circ(g, x, y, .9, "#e09a2a"); } },
  tempeteflorale(g) { FHP.arc(g, 8, 8, 6, 0, 4.5, 1.6, "#7fd858"); FHP.arc(g, 8, 8, 3, 1.5, 6, 1.4, "#a8ec7a"); for (const [x, y, c] of [[13, 4, "#ff6fae"], [3, 11, "#ff9ccf"], [10, 12, "#ffe066"]]) FHP.ell(g, x, y, 2, 1.2, .6, c); },
  /* ---- Feu ---- */
  flammeche(g) { FHP.flame(g, 8, 9, 1.05, "#ff7a2a", "#ffd23a"); },
  feufollet(g) { FHP.flame(g, 8, 9, 1, "#8a5cff", "#d8b8ff"); FHP.circ(g, 6.5, 9, .9, "#2a1a4a"); FHP.circ(g, 9.5, 9, .9, "#2a1a4a"); },
  lanceflammes(g) { FHP.poly(g, [1, 9, 6, 6, 15, 3, 15, 13, 6, 11], "#ff7a2a"); FHP.poly(g, [3, 9, 7, 7.5, 13, 6, 13, 10.5, 7, 10.5], "#ffd23a"); },
  deflagration(g) { FHP.circ(g, 8, 8, 2, "#ffd23a"); for (const a of [-Math.PI / 2, Math.PI / 6, Math.PI * 5 / 6, Math.PI * .5]) FHP.line(g, 8, 8, 8 + Math.cos(a) * 7, 8 + Math.sin(a) * 7, 2.6, "#ff5a1a"); FHP.line(g, 8, 4, 8, 13, 1.2, "#ffd23a"); },
  danseflamme(g) { FHP.arc(g, 8, 8, 5.5, 0, FH_TAU, 2.6, "#ff7a2a"); FHP.arc(g, 8, 8, 5.5, 0, FH_TAU, 1, "#ffd23a"); FHP.flame(g, 8, 8, .5, "#ff5a1a", "#ffd23a"); },
  rouefeu(g) { FHP.arc(g, 8, 8, 5.5, .2, 5.6, 2.8, "#ff7a2a"); FHP.flame(g, 13.5, 5, .45, "#ff5a1a", "#ffd23a"); FHP.circ(g, 8, 8, 2, "#ffd23a"); },
  nitrocharge(g) { FHP.flame(g, 11, 9, .8, "#ff7a2a", "#ffd23a"); for (const y of [6, 9, 12]) FHP.line(g, 1.5, y, 5.5, y, 1.2, "#ffd9a0"); },
  rebondifeu(g) { FHP.arc(g, 8, 13, 6, Math.PI, FH_TAU, 1, "#ffd9a0"); FHP.circ(g, 4, 11, 2.2, "#ff7a2a"); FHP.circ(g, 12, 6, 3, "#ff5a1a"); FHP.circ(g, 12, 6, 1.4, "#ffd23a"); },
  eruption(g) { FHP.poly(g, [1, 15, 6, 7, 10, 7, 15, 15], "#7a4a2a"); FHP.poly(g, [6, 7, 10, 7, 9, 9, 7, 9], "#ff5a1a"); FHP.circ(g, 5, 3.5, 1.6, "#ff7a2a"); FHP.circ(g, 9, 2.5, 1.8, "#ffd23a"); FHP.circ(g, 12.5, 4, 1.4, "#ff7a2a"); },
  /* ---- Eau ---- */
  pistolet(g) { FHP.line(g, 2, 13, 11, 4, 2.8, "#5aa9ff"); FHP.drop(g, 12.5, 4.5, .6, "#9fd4ff"); FHP.circ(g, 3.5, 11.5, 1.8, "#9fd4ff"); },
  bullesdo(g) { for (const [x, y, r] of [[5, 10, 3.2], [11, 6, 2.6], [11, 12, 1.8], [5, 4, 1.6]]) { FHP.circ(g, x, y, r, "#5aa9ff"); FHP.circ(g, x - r * .35, y - r * .35, r * .3, "#e0f4ff"); } },
  surf(g) { FHP.wave(g, 9, "#3a7ad8", 2.4); FHP.arc(g, 9, 9, 5, Math.PI, Math.PI * 1.8, 2.4, "#9fd4ff"); },
  cascade(g) { g.fillStyle = "#5aa9ff"; g.fillRect(5, 1, 6, 11); g.fillStyle = "#cfeaff"; g.fillRect(7, 1, 1.4, 11); FHP.ell(g, 8, 13, 6, 2.2, 0, "#9fd4ff"); },
  hydrocanon(g) { FHP.circ(g, 4, 11, 3.5, "#4a7aa8"); FHP.line(g, 6, 9, 15, 2, 3.6, "#5aa9ff"); FHP.line(g, 7, 8.5, 14, 3, 1.2, "#e0f4ff"); },
  siphon(g) { FHP.arc(g, 8, 8, 6, 0, 5, 2, "#3a7ad8"); FHP.arc(g, 8, 8, 3.5, 1, 6, 2, "#5aa9ff"); FHP.circ(g, 8, 8, 1.4, "#cfeaff"); },
  hydroqueue(g) { g.strokeStyle = "#5aa9ff"; g.lineWidth = 3; g.lineCap = "round"; g.beginPath(); g.moveTo(2, 13); g.quadraticCurveTo(10, 13, 12, 5); g.stroke(); FHP.drop(g, 13, 4, .55, "#cfeaff"); FHP.drop(g, 6, 5, .45, "#9fd4ff"); },
  aquabreche(g) { FHP.wave(g, 11, "#3a7ad8", 1.5); FHP.fang(g, 5, 3, 1.1, "#ffffff"); FHP.fang(g, 11, 3, 1.1, "#ffffff"); FHP.drop(g, 8, 9, .6, "#9fd4ff"); },
  machouille(g) { FHP.ell(g, 8, 8, 7, 5.5, 0, "#3a3a4a"); for (const x of [4, 7, 10, 12.5]) { FHP.fang(g, x, 3, .8, "#ffffff"); FHP.poly(g, [x - 1.6, 13, x + 1.6, 13, x, 9], "#ffffff"); } },
  crocsgivre(g) { FHP.fang(g, 5, 2, 1.4, "#e8f8ff"); FHP.fang(g, 11, 2, 1.4, "#e8f8ff"); FHP.star(g, 8, 12, 3.4, "#7ad4e8", 6); FHP.circ(g, 8, 12, 1, "#ffffff"); },
  /* ---- Électrik ---- */
  eclair(g) { FHP.bolt(g, 8, 8, 1, "#ffe14a"); },
  tonnerre(g) { for (const [x, y, r] of [[5, 4, 3], [9, 3, 3.4], [12, 5, 2.6]]) FHP.circ(g, x, y, r, "#8a90a8"); FHP.bolt(g, 9, 11, .65, "#ffe14a"); },
  cageeclair(g) { FHP.arc(g, 8, 8, 6, 0, FH_TAU, 1.4, "#ffe14a"); FHP.line(g, 8, 2, 8, 14, 1.2, "#ffe14a"); FHP.line(g, 2, 8, 14, 8, 1.2, "#ffe14a"); FHP.circ(g, 8, 8, 1.5, "#fff6c0"); },
  bouleelek(g) { FHP.circ(g, 8, 8, 5.2, "#ffd23a"); FHP.circ(g, 6.5, 6.5, 1.8, "#fff6c0"); FHP.bolt(g, 9.5, 9, .4, "#b88a00"); },
  fatalfoudre(g) { for (const [x, y, r] of [[4, 3, 2.6], [8, 2.5, 3], [12, 3, 2.6]]) FHP.circ(g, x, y, r, "#5a5f78"); FHP.bolt(g, 8, 10, .9, "#ffe14a"); FHP.line(g, 3, 12, 5, 9, 1, "#fff6c0"); FHP.line(g, 13, 12, 11, 9, 1, "#fff6c0"); },
  /* ---- Dragon ---- */
  dracorage(g) { FHP.circ(g, 8, 8, 5, "#7a5cf0"); FHP.flame(g, 8, 9, .55, "#c0a8ff", "#ffffff"); },
  ouragan(g) { for (let i = 0; i < 4; i++) FHP.ell(g, 8 + i * .6 - 1, 3 + i * 3, 6 - i * 1.2, 1.4, 0, i % 2 ? "#a894f0" : "#7a5cf0"); },
  dracoqueue(g) { g.strokeStyle = "#7a5cf0"; g.lineWidth = 3.2; g.lineCap = "round"; g.beginPath(); g.moveTo(2, 4); g.quadraticCurveTo(4, 13, 13, 12); g.stroke(); FHP.poly(g, [12, 9, 15.5, 12, 12, 15], "#c0a8ff"); },
  ultralaser(g) { FHP.line(g, 1, 13, 15, 3, 4, "#ff9a3a"); FHP.line(g, 1, 13, 15, 3, 1.6, "#fff0c0"); FHP.circ(g, 2.5, 12, 2.4, "#ffd23a"); },
  dansedraco(g) { FHP.arc(g, 8, 8, 5.5, 0, 4.6, 2.2, "#7a5cf0"); FHP.flame(g, 8, 9, .6, "#ff7a2a", "#ffd23a"); FHP.star(g, 13, 3, 1.8, "#c0a8ff", 4); },
  /* ---- Normal ---- */
  meteores(g) { FHP.star(g, 10, 6, 4.4, "#ffd84a"); FHP.star(g, 4, 11, 2.6, "#fff0a0"); FHP.line(g, 1, 15, 3, 13, 1, "#fff0a0"); },
  combogriffe(g) { FHP.claw(g, 6, 3, "#ffffff"); FHP.claw(g, 9, 5, "#d8d8e8"); },
  jackpot(g) { FHP.circ(g, 8, 8, 5.5, "#e8b830"); FHP.circ(g, 8, 8, 3.8, "#ffd84a"); g.fillStyle = "#9a6a10"; g.fillRect(7.3, 5, 1.4, 6); g.fillRect(5.5, 6.5, 5, 1.2); g.fillRect(5.5, 8.6, 5, 1.2); },
  morsure(g) { FHP.ell(g, 8, 8, 6.5, 4.5, 0, "#3a2a3a"); for (const x of [4.5, 8, 11.5]) { FHP.fang(g, x, 4, .9, "#ffffff"); FHP.poly(g, [x - 1.8, 12, x + 1.8, 12, x, 8.5], "#ffffff"); } },
  viveattaque(g) { FHP.circ(g, 11, 8, 3.4, "#ffffff"); for (const y of [5, 8, 11]) FHP.line(g, 1.5, y, 6, y, 1.4, "#d8e8ff"); },
  grozyeux(g) { FHP.ell(g, 8, 8, 7, 4, 0, "#ffffff"); FHP.circ(g, 8, 8, 3, "#c0303a"); FHP.circ(g, 8, 8, 1.2, "#1a1a1a"); FHP.line(g, 2, 3, 6, 4.5, 1.2, "#1a1a1a"); FHP.line(g, 14, 3, 10, 4.5, 1.2, "#1a1a1a"); },
  tranche(g) { FHP.arc(g, 14, 15, 13, Math.PI * 1.05, Math.PI * 1.45, 2.4, "#ffffff"); FHP.arc(g, 14, 15, 10, Math.PI * 1.08, Math.PI * 1.42, 1, "#c8d8f0"); },
  brouillard(g) { for (const [x, y, r] of [[5, 9, 3.4], [9, 7, 4], [12, 10, 3], [7, 12, 2.8]]) FHP.circ(g, x, y, r, "#a8aab8"); FHP.circ(g, 8, 7, 1.8, "#dcdde6"); },
  protection(g) { FHP.circ(g, 8, 8, 6.5, "#6fdc8a"); FHP.circ(g, 8, 8, 5, "#3a9a58"); FHP.poly(g, [8, 3.5, 12, 5.5, 11, 10.5, 8, 13, 5, 10.5, 4, 5.5], "#bff5c8"); },
  metronome(g) { FHP.poly(g, [4, 15, 12, 15, 9.5, 2, 6.5, 2], "#c8a070"); FHP.line(g, 8, 13, 11.5, 4, 1.4, "#3a2a1a"); FHP.circ(g, 11, 5.5, 1.4, "#e8c040"); },
  /* ---- Autres types (Togepi, Kaiminus) ---- */
  ventfeerique(g) { FHP.arc(g, 3, 8, 7, -.8, .8, 1.6, "#ffb8e0"); FHP.arc(g, 1, 8, 10, -.5, .5, 1.6, "#ff8cc8"); for (const [x, y] of [[11, 4], [13, 9], [10, 12]]) FHP.star(g, x, y, 1.8, "#fff0fa", 4); },
  lamedair(g) { FHP.arc(g, 4, 14, 11, -1.4, -.2, 3, "#d8ecff"); FHP.arc(g, 4, 14, 8.5, -1.3, -.3, 1.2, "#a894f0"); },
  aurasphere(g) { FHP.circ(g, 8, 8, 5.8, "#3a6ae8"); FHP.circ(g, 8, 8, 3.6, "#7aa8ff"); FHP.circ(g, 6.8, 6.8, 1.4, "#e0ecff"); },
  eclatmagique(g) { FHP.star(g, 8, 8, 7, "#ff8cc8", 8); FHP.circ(g, 8, 8, 2.6, "#fff0fa"); },
};
// Métronome 1 à 6 (Mew) : le métronome, avec son numéro dessiné par-dessus (voir moveIcon)
for (let n = 1; n <= 6; n++) FH_ICONS["metro" + n] = FH_ICONS.metronome;
const FH_NUM = { metro1:1, metro2:2, metro3:3, metro4:4, metro5:5, metro6:6 };
const FH_BG = { plante:"#3f8f3a", poison:"#7a3a98", feu:"#c8582a", eau:"#2f6ab8", electrik:"#b8960a", dragon:"#5a3ec0", normal:"#7a7460", fee:"#c0508c", vol:"#6a58b8", combat:"#a03a2a", glace:"#3a98b0", psy:"#b03a6a", spectre:"#5a4880", sol:"#8a6a30", roche:"#7a6a38", insecte:"#6a7a1a", acier:"#6a7480" };
const fhIconCache = {};
function fhMoveIcon(id) { // icône 16x16 (pixels nets + contour sombre), agrandie x2, en image ; capacité sans dessin : initiale
  if (fhIconCache[id]) return fhIconCache[id];
  const s = document.createElement("canvas"); s.width = s.height = 16; const g = s.getContext("2d");
  if (FH_ICONS[id]) FH_ICONS[id](g);
  else { g.fillStyle = "#f4f1e4"; g.font = "bold 12px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(((MOVES[id] && MOVES[id].name) || "?").charAt(0), 8, 8.5); }
  const im = g.getImageData(0, 0, 16, 16), d = im.data, solid = new Uint8Array(256);
  for (let i = 0; i < 256; i++) { solid[i] = d[i * 4 + 3] > 110 ? 1 : 0; d[i * 4 + 3] = solid[i] ? 255 : 0; }
  const at = (x, y) => x >= 0 && x < 16 && y >= 0 && y < 16 && solid[y * 16 + x];
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const i = y * 16 + x; if (!solid[i] && (at(x + 1, y) || at(x - 1, y) || at(x, y + 1) || at(x, y - 1))) { d[i * 4] = 24; d[i * 4 + 1] = 30; d[i * 4 + 2] = 22; d[i * 4 + 3] = 255; } }
  g.putImageData(im, 0, 0);
  const c = document.createElement("canvas"); c.width = c.height = 32; const cg = c.getContext("2d"); cg.imageSmoothingEnabled = false; cg.drawImage(s, 0, 0, 32, 32);
  if (FH_NUM[id]) { cg.font = "12px 'Press Start 2P', monospace"; cg.textAlign = "right"; cg.textBaseline = "bottom"; cg.lineWidth = 3; cg.strokeStyle = "#1a1a1a"; cg.strokeText(FH_NUM[id], 31, 32); cg.fillStyle = "#ffe066"; cg.fillText(FH_NUM[id], 31, 32); }
  return fhIconCache[id] = c.toDataURL();
}
const fhItemIcon = id => id === "carbone" && window.FORK_CARBONE ? window.FORK_CARBONE : ITEM_ICONS[id] || "";
function fhPortrait(P) { // portrait de l'espèce actuelle (évolutions, formes d'Évoli) ; le Pichu Troizépi garde celui de Pichu
  const v = DEX[P.eform || P.line], id = String(Array.isArray(v) ? v[P.stage] : v || "").slice(0, 4);
  return (window.FORK_PORTRAITS || {})[id] || "";
}
const FH = document.createElement("div"); FH.id = "fhud"; FH.hidden = true;
FH.innerHTML = `<div class="fhPf"><img id="fhPf" alt=""></div><div class="fhName"><span id="fhName"></span><b id="fhLvl"></b></div>
  <div class="fhHp"><span class="lbl">PV</span><div class="bar"><i id="fhHpFill"></i></div><span class="v" id="fhHpText"></span></div>
  <div class="fhFrame"><div class="fhRow" id="fhMoves"></div><div class="fhRow" id="fhItems"></div></div>
  <div class="fhStage"><small id="fhStageName"></small><span id="fhTime"></span></div>`;
$("hud").insertAdjacentElement("afterend", FH); // même niveau que l'interface de Neo : les écrans de choix, pause et fin restent au-dessus
const FH_KO = document.createElement("div"); FH_KO.className = "fhKo"; FH_KO.innerHTML = `<span>💀</span><b id="fhKills">0</b>`;
$("minimap").insertAdjacentElement("afterend", FH_KO);
let fhKey = "";
const fhSlot = (img, lv, max, bg) => `<div class="fhSlot${bg ? " mv" : ""}"${bg ? ` style="--t:${bg}"` : ""}><img src="${img}" alt=""><span class="fhPips">${Array.from({ length:max }, (_, i) => `<i class="${i < lv ? "on" : ""}"></i>`).join("")}</span></div>`;
function fhRefresh() {
  const on = typeof menuTheme !== "undefined" && menuTheme === "lugiapsy" && S && S.players.length === 1 && !NET.role && !$("hud").hidden;
  document.body.classList.toggle("forkHud", !!on); document.body.classList.toggle("forkTouch", TOUCH); FH.hidden = !on;
  if (!on) return;
  const P = S.P, pct = Math.max(0, P.hp / P.maxHp);
  $("fhName").textContent = pName(); $("fhLvl").textContent = `N.${P.lvl}`;
  const pf = fhPortrait(P); if ($("fhPf").getAttribute("src") !== pf) $("fhPf").src = pf;
  $("fhHpFill").style.width = (pct * 100) + "%"; $("fhHpFill").style.background = pct > .5 ? "var(--hp)" : pct > .2 ? "var(--hp-low)" : "var(--hp-crit)";
  $("fhHpText").textContent = `${Math.ceil(P.hp)} / ${P.maxHp}`;
  $("fhTime").textContent = $("hudTime").textContent; $("fhStageName").textContent = $("hudLevel").textContent.split(" · ")[0];
  $("fhKills").textContent = S.kills;
  const mv = realMoves(P), it = Object.entries(P.items), key = mv.map(([id, m]) => id + m.lv).join() + "|" + it.map(([id, lv]) => id + lv).join();
  if (key !== fhKey) { fhKey = key;
    $("fhMoves").innerHTML = mv.map(([id, m]) => fhSlot(fhMoveIcon(id), m.lv, MOVES[id].max || 5, FH_BG[MOVES[id].type] || "#2f6a3a")).join("");
    $("fhItems").innerHTML = it.map(([id, lv]) => fhSlot(fhItemIcon(id), lv, (ITEMS[id] && ITEMS[id].max) || 5)).join("");
  }
}
// Fin de partie, retour au menu : l'interface du jeu (#hud) se cache, celle du fork aussi (sinon elle restait derrière les menus)
new MutationObserver(() => { if ($("hud").hidden) { FH.hidden = true; document.body.classList.remove("forkHud"); fhKey = ""; } }).observe($("hud"), { attributes:true, attributeFilter:["hidden"] });
const fhRefreshHud = refreshHud;
refreshHud = () => { fhRefreshHud(); fhRefresh(); }; // l'interface de Neo se met à jour, puis celle du fork par-dessus
