/* Icônes des capacités (pixel art 16x16 dessiné au canvas) : formes simples, puis pixels nets + contour sombre,
   comme les icônes d'objets du jeu. moveIcon(id, taille) renvoie un <canvas>. */
"use strict";
const TAU = Math.PI * 2;
const P = {
  circ(g, x, y, r, c) { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); },
  ell(g, x, y, rx, ry, a, c) { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, TAU); g.fill(); },
  poly(g, pts, c) { g.fillStyle = c; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); },
  line(g, x1, y1, x2, y2, w, c) { g.strokeStyle = c; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); },
  arc(g, x, y, r, a0, a1, w, c) { g.strokeStyle = c; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); g.arc(x, y, r, a0, a1); g.stroke(); },
  // flamme : base ronde, pointe vers le haut
  flame(g, x, y, s, c1, c2) {
    g.fillStyle = c1; g.beginPath(); g.moveTo(x, y - 7 * s); g.quadraticCurveTo(x + 5 * s, y - 2 * s, x + 3.6 * s, y + 2 * s); g.quadraticCurveTo(x, y + 4.5 * s, x - 3.6 * s, y + 2 * s); g.quadraticCurveTo(x - 5 * s, y - 2 * s, x, y - 7 * s); g.fill();
    g.fillStyle = c2; g.beginPath(); g.moveTo(x, y - 2.5 * s); g.quadraticCurveTo(x + 2.4 * s, y + .5 * s, x + 1.6 * s, y + 2 * s); g.quadraticCurveTo(x, y + 3 * s, x - 1.6 * s, y + 2 * s); g.quadraticCurveTo(x - 2.4 * s, y + .5 * s, x, y - 2.5 * s); g.fill();
  },
  bolt(g, x, y, s, c) { P.poly(g, [x + 1 * s, y - 7 * s, x - 3.5 * s, y + .5 * s, x - .2 * s, y + .5 * s, x - 1.5 * s, y + 7 * s, x + 3.8 * s, y - 1.5 * s, x + .4 * s, y - 1.5 * s], c); },
  drop(g, x, y, s, c) { g.fillStyle = c; g.beginPath(); g.moveTo(x, y - 5 * s); g.quadraticCurveTo(x + 4 * s, y, x + 3 * s, y + 2 * s); g.arc(x, y + 1.8 * s, 3 * s, 0, Math.PI); g.quadraticCurveTo(x - 4 * s, y, x, y - 5 * s); g.fill(); },
  star(g, x, y, r, c, n = 5) { const pts = []; for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * .45 : r; pts.push(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } P.poly(g, pts, c); },
  leaf(g, x, y, a, s, c1, c2) { g.save(); g.translate(x, y); g.rotate(a); P.ell(g, 0, 0, 6 * s, 2.5 * s, 0, c1); g.fillStyle = c2; g.fillRect(-5 * s, -.5, 10 * s, 1); g.restore(); },
  claw(g, x, y, c) { for (let i = 0; i < 3; i++) P.line(g, x + i * 3.5, y, x + i * 3.5 - 4, y + 10, 1.6, c); },
  fang(g, x, y, s, c) { P.poly(g, [x - 2 * s, y, x + 2 * s, y, x, y + 5 * s], c); },
  wave(g, y, c, amp = 2) { g.fillStyle = c; g.beginPath(); g.moveTo(0, 16); g.lineTo(0, y); for (let x = 0; x <= 16; x++) g.lineTo(x, y + Math.sin(x / 2.2) * amp); g.lineTo(16, 16); g.fill(); },
};
const MOVE_ICONS = {
  /* ---- Plante ---- */
  tranchherbe(g) { P.leaf(g, 8, 8, -Math.PI / 4, 1.2, "#7fd858", "#3f8f2c"); P.leaf(g, 8.5, 8.5, Math.PI / 4, 1.2, "#a8ec7a", "#4c9e36"); },
  fouetlianes(g) {
    g.strokeStyle = "#4c9e36"; g.lineWidth = 2.4; g.lineCap = "round"; g.beginPath(); g.moveTo(2.5, 14); g.bezierCurveTo(13, 12, 2, 5, 13, 2.5); g.stroke();
    P.ell(g, 4.5, 8.5, 2.6, 1.5, -.6, "#8fe060"); P.ell(g, 11.5, 8, 2.6, 1.5, .7, "#8fe060");
  },
  poudretoxik(g) { for (const [x, y, r] of [[5, 9, 3.6], [9, 6.5, 4.2], [12, 10, 3.3], [8, 11, 3.4]]) P.circ(g, x, y, r, "#9a4fc0"); g.fillStyle = "#e0a8ff"; for (const [x, y] of [[6, 8], [9, 5], [11, 9], [8, 11], [4, 11]]) g.fillRect(x, y, 1.6, 1.6); },
  lancesoleil(g) {
    P.line(g, 6, 6, 15, 15, 3.2, "#fff6c0");
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; P.line(g, 5.5 + Math.cos(a) * 3.5, 5.5 + Math.sin(a) * 3.5, 5.5 + Math.cos(a) * 5.4, 5.5 + Math.sin(a) * 5.4, 1.6, "#ffe14a"); }
    P.circ(g, 5.5, 5.5, 3.2, "#ffcf2a");
  },
  dansepetale(g) { for (let i = 0; i < 5; i++) { const a = i * TAU / 5 + .3, r = 3.8 + i * .45; P.ell(g, 8 + Math.cos(a) * r, 8 + Math.sin(a) * r, 2.6, 1.5, a + 1.2, i % 2 ? "#ff9ccf" : "#ff6fae"); } P.circ(g, 8, 8, 1.6, "#ffe066"); },
  vampigraine(g) {
    P.ell(g, 7, 10.5, 4, 3.4, -.3, "#b07a3a"); P.ell(g, 5, 5, 2.8, 1.5, -.7, "#7fd858"); P.ell(g, 9.5, 4.8, 2.8, 1.5, .7, "#7fd858");
    g.fillStyle = "#4c9e36"; g.fillRect(6.8, 5, 1.2, 3); P.drop(g, 13, 11, .7, "#e8403a");
  },
  feuillemagik(g) { P.leaf(g, 7, 9, -.6, 1.1, "#8fe060", "#3f8f2c"); P.star(g, 12.5, 4, 3, "#fff3a0", 4); P.star(g, 3.5, 3.5, 1.8, "#d8ffb0", 4); },
  synthese(g) { P.circ(g, 11, 5, 3.2, "#ffd84a"); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; P.line(g, 11 + Math.cos(a) * 4, 5 + Math.sin(a) * 4, 11 + Math.cos(a) * 5.2, 5 + Math.sin(a) * 5.2, 1.2, "#ffe88a"); } P.leaf(g, 6, 11, -.5, 1, "#7fd858", "#3f8f2c"); },
  tapisfleuri(g) { P.wave(g, 12, "#4c9e36", 1); for (const [x, y, c] of [[4, 8, "#ff7ab8"], [9, 6, "#ffe066"], [13, 9, "#ff9ccf"], [7, 11, "#ffffff"]]) { for (let i = 0; i < 5; i++) { const a = i * TAU / 5; P.circ(g, x + Math.cos(a) * 1.6, y + Math.sin(a) * 1.6, 1.2, c); } P.circ(g, x, y, .9, "#e09a2a"); } },
  tempeteflorale(g) { P.arc(g, 8, 8, 6, 0, 4.5, 1.6, "#7fd858"); P.arc(g, 8, 8, 3, 1.5, 6, 1.4, "#a8ec7a"); for (const [x, y, c] of [[13, 4, "#ff6fae"], [3, 11, "#ff9ccf"], [10, 12, "#ffe066"]]) P.ell(g, x, y, 2, 1.2, .6, c); },
  /* ---- Feu ---- */
  flammeche(g) { P.flame(g, 8, 9, 1.05, "#ff7a2a", "#ffd23a"); },
  feufollet(g) { P.flame(g, 8, 9, 1, "#8a5cff", "#d8b8ff"); P.circ(g, 6.5, 9, .9, "#2a1a4a"); P.circ(g, 9.5, 9, .9, "#2a1a4a"); },
  lanceflammes(g) { P.poly(g, [1, 9, 6, 6, 15, 3, 15, 13, 6, 11], "#ff7a2a"); P.poly(g, [3, 9, 7, 7.5, 13, 6, 13, 10.5, 7, 10.5], "#ffd23a"); },
  deflagration(g) { P.circ(g, 8, 8, 2, "#ffd23a"); for (const a of [-Math.PI / 2, Math.PI / 6, Math.PI * 5 / 6, Math.PI * .5]) P.line(g, 8, 8, 8 + Math.cos(a) * 7, 8 + Math.sin(a) * 7, 2.6, "#ff5a1a"); P.line(g, 8, 4, 8, 13, 1.2, "#ffd23a"); },
  danseflamme(g) { P.arc(g, 8, 8, 5.5, 0, TAU, 2.6, "#ff7a2a"); P.arc(g, 8, 8, 5.5, 0, TAU, 1, "#ffd23a"); P.flame(g, 8, 8, .5, "#ff5a1a", "#ffd23a"); },
  rouefeu(g) { P.arc(g, 8, 8, 5.5, .2, 5.6, 2.8, "#ff7a2a"); P.flame(g, 13.5, 5, .45, "#ff5a1a", "#ffd23a"); P.circ(g, 8, 8, 2, "#ffd23a"); },
  nitrocharge(g) { P.flame(g, 11, 9, .8, "#ff7a2a", "#ffd23a"); for (const y of [6, 9, 12]) P.line(g, 1.5, y, 5.5, y, 1.2, "#ffd9a0"); },
  rebondifeu(g) { P.arc(g, 8, 13, 6, Math.PI, TAU, 1, "#ffd9a0"); P.circ(g, 4, 11, 2.2, "#ff7a2a"); P.circ(g, 12, 6, 3, "#ff5a1a"); P.circ(g, 12, 6, 1.4, "#ffd23a"); },
  eruption(g) { P.poly(g, [1, 15, 6, 7, 10, 7, 15, 15], "#7a4a2a"); P.poly(g, [6, 7, 10, 7, 9, 9, 7, 9], "#ff5a1a"); P.circ(g, 5, 3.5, 1.6, "#ff7a2a"); P.circ(g, 9, 2.5, 1.8, "#ffd23a"); P.circ(g, 12.5, 4, 1.4, "#ff7a2a"); },
  /* ---- Eau ---- */
  pistolet(g) { P.line(g, 2, 13, 11, 4, 2.8, "#5aa9ff"); P.drop(g, 12.5, 4.5, .6, "#9fd4ff"); P.circ(g, 3.5, 11.5, 1.8, "#9fd4ff"); },
  bullesdo(g) { for (const [x, y, r] of [[5, 10, 3.2], [11, 6, 2.6], [11, 12, 1.8], [5, 4, 1.6]]) { P.circ(g, x, y, r, "#5aa9ff"); P.circ(g, x - r * .35, y - r * .35, r * .3, "#e0f4ff"); } },
  surf(g) { P.wave(g, 9, "#3a7ad8", 2.4); P.arc(g, 9, 9, 5, Math.PI, Math.PI * 1.8, 2.4, "#9fd4ff"); },
  cascade(g) { g.fillStyle = "#5aa9ff"; g.fillRect(5, 1, 6, 11); g.fillStyle = "#cfeaff"; g.fillRect(7, 1, 1.4, 11); P.ell(g, 8, 13, 6, 2.2, 0, "#9fd4ff"); },
  hydrocanon(g) { P.circ(g, 4, 11, 3.5, "#4a7aa8"); P.line(g, 6, 9, 15, 2, 3.6, "#5aa9ff"); P.line(g, 7, 8.5, 14, 3, 1.2, "#e0f4ff"); },
  siphon(g) { P.arc(g, 8, 8, 6, 0, 5, 2, "#3a7ad8"); P.arc(g, 8, 8, 3.5, 1, 6, 2, "#5aa9ff"); P.circ(g, 8, 8, 1.4, "#cfeaff"); },
  hydroqueue(g) { g.strokeStyle = "#5aa9ff"; g.lineWidth = 3; g.lineCap = "round"; g.beginPath(); g.moveTo(2, 13); g.quadraticCurveTo(10, 13, 12, 5); g.stroke(); P.drop(g, 13, 4, .55, "#cfeaff"); P.drop(g, 6, 5, .45, "#9fd4ff"); },
  aquabreche(g) { P.wave(g, 11, "#3a7ad8", 1.5); P.fang(g, 5, 3, 1.1, "#ffffff"); P.fang(g, 11, 3, 1.1, "#ffffff"); P.drop(g, 8, 9, .6, "#9fd4ff"); },
  machouille(g) { P.ell(g, 8, 8, 7, 5.5, 0, "#3a3a4a"); for (const x of [4, 7, 10, 12.5]) { P.fang(g, x, 3, .8, "#ffffff"); P.poly(g, [x - 1.6, 13, x + 1.6, 13, x, 9], "#ffffff"); } },
  crocsgivre(g) { P.fang(g, 5, 2, 1.4, "#e8f8ff"); P.fang(g, 11, 2, 1.4, "#e8f8ff"); P.star(g, 8, 12, 3.4, "#7ad4e8", 6); P.circ(g, 8, 12, 1, "#ffffff"); },
  /* ---- Électrik ---- */
  eclair(g) { P.bolt(g, 8, 8, 1, "#ffe14a"); },
  tonnerre(g) { for (const [x, y, r] of [[5, 4, 3], [9, 3, 3.4], [12, 5, 2.6]]) P.circ(g, x, y, r, "#8a90a8"); P.bolt(g, 9, 11, .65, "#ffe14a"); },
  cageeclair(g) { P.arc(g, 8, 8, 6, 0, TAU, 1.4, "#ffe14a"); P.line(g, 8, 2, 8, 14, 1.2, "#ffe14a"); P.line(g, 2, 8, 14, 8, 1.2, "#ffe14a"); P.circ(g, 8, 8, 1.5, "#fff6c0"); },
  bouleelek(g) { P.circ(g, 8, 8, 5.2, "#ffd23a"); P.circ(g, 6.5, 6.5, 1.8, "#fff6c0"); P.bolt(g, 9.5, 9, .4, "#b88a00"); },
  fatalfoudre(g) { for (const [x, y, r] of [[4, 3, 2.6], [8, 2.5, 3], [12, 3, 2.6]]) P.circ(g, x, y, r, "#5a5f78"); P.bolt(g, 8, 10, .9, "#ffe14a"); P.line(g, 3, 12, 5, 9, 1, "#fff6c0"); P.line(g, 13, 12, 11, 9, 1, "#fff6c0"); },
  /* ---- Dragon ---- */
  dracorage(g) { P.circ(g, 8, 8, 5, "#7a5cf0"); P.flame(g, 8, 9, .55, "#c0a8ff", "#ffffff"); },
  ouragan(g) { for (let i = 0; i < 4; i++) P.ell(g, 8 + i * .6 - 1, 3 + i * 3, 6 - i * 1.2, 1.4, 0, i % 2 ? "#a894f0" : "#7a5cf0"); },
  dracoqueue(g) { g.strokeStyle = "#7a5cf0"; g.lineWidth = 3.2; g.lineCap = "round"; g.beginPath(); g.moveTo(2, 4); g.quadraticCurveTo(4, 13, 13, 12); g.stroke(); P.poly(g, [12, 9, 15.5, 12, 12, 15], "#c0a8ff"); },
  ultralaser(g) { P.line(g, 1, 13, 15, 3, 4, "#ff9a3a"); P.line(g, 1, 13, 15, 3, 1.6, "#fff0c0"); P.circ(g, 2.5, 12, 2.4, "#ffd23a"); },
  dansedraco(g) { P.arc(g, 8, 8, 5.5, 0, 4.6, 2.2, "#7a5cf0"); P.flame(g, 8, 9, .6, "#ff7a2a", "#ffd23a"); P.star(g, 13, 3, 1.8, "#c0a8ff", 4); },
  /* ---- Normal ---- */
  meteores(g) { P.star(g, 10, 6, 4.4, "#ffd84a"); P.star(g, 4, 11, 2.6, "#fff0a0"); P.line(g, 1, 15, 3, 13, 1, "#fff0a0"); },
  combogriffe(g) { P.claw(g, 6, 3, "#ffffff"); P.claw(g, 9, 5, "#d8d8e8"); },
  jackpot(g) { P.circ(g, 8, 8, 5.5, "#e8b830"); P.circ(g, 8, 8, 3.8, "#ffd84a"); g.fillStyle = "#9a6a10"; g.fillRect(7.3, 5, 1.4, 6); g.fillRect(5.5, 6.5, 5, 1.2); g.fillRect(5.5, 8.6, 5, 1.2); },
  morsure(g) { P.ell(g, 8, 8, 6.5, 4.5, 0, "#3a2a3a"); for (const x of [4.5, 8, 11.5]) { P.fang(g, x, 4, .9, "#ffffff"); P.poly(g, [x - 1.8, 12, x + 1.8, 12, x, 8.5], "#ffffff"); } },
  viveattaque(g) { P.circ(g, 11, 8, 3.4, "#ffffff"); for (const y of [5, 8, 11]) P.line(g, 1.5, y, 6, y, 1.4, "#d8e8ff"); },
  grozyeux(g) { P.ell(g, 8, 8, 7, 4, 0, "#ffffff"); P.circ(g, 8, 8, 3, "#c0303a"); P.circ(g, 8, 8, 1.2, "#1a1a1a"); P.line(g, 2, 3, 6, 4.5, 1.2, "#1a1a1a"); P.line(g, 14, 3, 10, 4.5, 1.2, "#1a1a1a"); },
  tranche(g) { P.arc(g, 14, 15, 13, Math.PI * 1.05, Math.PI * 1.45, 2.4, "#ffffff"); P.arc(g, 14, 15, 10, Math.PI * 1.08, Math.PI * 1.42, 1, "#c8d8f0"); },
  brouillard(g) { for (const [x, y, r] of [[5, 9, 3.4], [9, 7, 4], [12, 10, 3], [7, 12, 2.8]]) P.circ(g, x, y, r, "#a8aab8"); P.circ(g, 8, 7, 1.8, "#dcdde6"); },
  protection(g) { P.circ(g, 8, 8, 6.5, "#6fdc8a"); P.circ(g, 8, 8, 5, "#3a9a58"); P.poly(g, [8, 3.5, 12, 5.5, 11, 10.5, 8, 13, 5, 10.5, 4, 5.5], "#bff5c8"); },
  metronome(g) { P.poly(g, [4, 15, 12, 15, 9.5, 2, 6.5, 2], "#c8a070"); P.line(g, 8, 13, 11.5, 4, 1.4, "#3a2a1a"); P.circ(g, 11, 5.5, 1.4, "#e8c040"); },
  /* ---- Autres types (Togepi, Kaiminus) ---- */
  ventfeerique(g) { P.arc(g, 3, 8, 7, -.8, .8, 1.6, "#ffb8e0"); P.arc(g, 1, 8, 10, -.5, .5, 1.6, "#ff8cc8"); for (const [x, y] of [[11, 4], [13, 9], [10, 12]]) P.star(g, x, y, 1.8, "#fff0fa", 4); },
  lamedair(g) { P.arc(g, 4, 14, 11, -1.4, -.2, 3, "#d8ecff"); P.arc(g, 4, 14, 8.5, -1.3, -.3, 1.2, "#a894f0"); },
  aurasphere(g) { P.circ(g, 8, 8, 5.8, "#3a6ae8"); P.circ(g, 8, 8, 3.6, "#7aa8ff"); P.circ(g, 6.8, 6.8, 1.4, "#e0ecff"); },
  eclatmagique(g) { P.star(g, 8, 8, 7, "#ff8cc8", 8); P.circ(g, 8, 8, 2.6, "#fff0fa"); },
};
// Métronome 1 à 6 (Mew) : le métronome, avec son numéro dessiné par-dessus (voir moveIcon)
for (let n = 1; n <= 6; n++) MOVE_ICONS["metro" + n] = MOVE_ICONS.metronome;
const MOVE_NUM = { metro1:1, metro2:2, metro3:3, metro4:4, metro5:5, metro6:6 };
// res : taille de la grille de pixels (16 ou 32). En 32, mêmes dessins tracés deux fois plus fins + ombrage (haut clair, bas sombre)
function moveIcon(id, size = 48, res = 16) {
  const s = document.createElement("canvas"); s.width = s.height = res;
  const g = s.getContext("2d"); g.scale(res / 16, res / 16); MOVE_ICONS[id](g); g.setTransform(1, 0, 0, 1, 0, 0);
  const N = res, im = g.getImageData(0, 0, N, N), d = im.data, solid = new Uint8Array(N * N);
  for (let i = 0; i < N * N; i++) { solid[i] = d[i * 4 + 3] > 110 ? 1 : 0; d[i * 4 + 3] = solid[i] ? 255 : 0; }
  const at = (x, y) => x >= 0 && x < N && y >= 0 && y < N && solid[y * N + x];
  if (res > 16) { // ombrage : bord haut / gauche éclairci, bord bas / droit assombri
    const src = d.slice();
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x; if (!solid[i]) continue;
      const k = !at(x, y - 1) || !at(x - 1, y) ? 1.28 : !at(x, y + 1) || !at(x + 1, y) ? .68 : !at(x, y + 2) || !at(x + 2, y) ? .86 : 1;
      for (let c = 0; c < 3; c++) d[i * 4 + c] = Math.min(255, src[i * 4 + c] * k + (k > 1 ? 18 : 0));
    }
  }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { // contour sombre d'un pixel autour du dessin
    const i = y * N + x; if (solid[i]) continue;
    if (at(x + 1, y) || at(x - 1, y) || at(x, y + 1) || at(x, y - 1)) { d[i * 4] = 24; d[i * 4 + 1] = 30; d[i * 4 + 2] = 22; d[i * 4 + 3] = 255; }
  }
  g.putImageData(im, 0, 0);
  const c = document.createElement("canvas"); c.width = c.height = size; const cg = c.getContext("2d");
  cg.imageSmoothingEnabled = false; cg.drawImage(s, 0, 0, size, size);
  if (MOVE_NUM[id]) { cg.font = `${Math.round(size * .42)}px "Press Start 2P", monospace`; cg.textAlign = "right"; cg.textBaseline = "bottom"; cg.lineWidth = Math.max(2, size / 12); cg.strokeStyle = "#1a1a1a"; cg.strokeText(MOVE_NUM[id], size - 1, size); cg.fillStyle = "#ffe066"; cg.fillText(MOVE_NUM[id], size - 1, size); }
  return c;
}
