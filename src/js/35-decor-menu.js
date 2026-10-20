/* Écran de choix : les côtés vides prennent le décor du niveau choisi (vrai sol du niveau, arbres, etc.) */
const DECO = { cvs:[], key:"" };
function decoSide(side) {
  let c = DECO.cvs[side];
  if (!c) { c = document.createElement("canvas"); c.className = "sideDeco " + (side ? "r" : "l"); c.setAttribute("aria-hidden", "true"); $("start").prepend(c); DECO.cvs[side] = c; }
  return c;
}
function drawDeco(force) {
  const ov = $("start"); if (!ov || ov.hidden) return;
  const sh = ov.querySelector(".sheet").getBoundingClientRect(), W = Math.floor(Math.max(0, sh.left - 8)), H = innerHeight;
  const key = LEVELS.indexOf(LEVEL) + ":" + W + "x" + H;
  for (let s = 0; s < 2; s++) decoSide(s).hidden = W < 140;
  if (W < 140 || (!force && key === DECO.key)) return; DECO.key = key;
  const Z = .8; // un peu dézoomé : on voit plus du niveau
  for (let s = 0; s < 2; s++) {
    const c = decoSide(s); c.width = W; c.height = H; const g = c.getContext("2d");
    if (LEVEL.league) leagueDeco(g, s, W, H, Z);
    else if (LEVEL.maps) birdDeco(g, s, W, H, Z);
    else paintView(g, s ? 900 : -900 - W / Z, START_Y - 1400 - H / Z / 2, W, H, Z); // loin du départ, là où le niveau est bien garni
    g.fillStyle = "rgba(10,18,13,.38)"; g.fillRect(0, 0, W, H); // assombri : le starter reste la vedette
  }
}
function paintView(g, camX, camY, W, H, Z) {
  const vw = W / Z, vh = H / Z;
  g.save(); g.scale(Z, Z); g.translate(-camX, -camY);
  g.fillStyle = LEVEL.rocket ? "#4a505c" : LEVEL.tower ? (LEVEL.sprout ? "#6a4a2c" : "#3a3446") : LEVEL.manor ? "#4a3020" : LEVEL.theme ? (CAVE_PAL[LEVEL.theme] || {}).base || "#2c2834" : LEVEL.cave ? "#2c2834" : LEVEL.safari ? "#b89a50" : "#3d6e38";
  g.fillRect(camX, camY, vw, vh);
  const i0 = Math.floor(camX / CH), j0 = Math.floor(camY / CH), i1 = Math.floor((camX + vw) / CH), j1 = Math.floor((camY + vh) / CH);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const ch = getChunk(i, j); if (!ch.canvas) renderChunk(i, j); if (ch.canvas) g.drawImage(ch.canvas, i * CH, j * CH, CH, CH); }
  if (!LEVEL.cave && !LEVEL.tower && !LEVEL.manor && !LEVEL.rocket && !LEVEL.league) // cimes des arbres (forêt, safari)
    for (let j = j0 - 1; j <= j1 + 1; j++) for (let i = i0 - 1; i <= i1 + 1; i++) for (const tr of getChunk(i, j).trees || []) {
      const sp = LEVEL.safari ? acaciaSprite(tr.r, tr.v) : canopySprite(tr.r, tr.v); g.drawImage(sp.cv, tr.x - sp.size / 2, tr.y - tr.r * .55 - sp.size / 2, sp.size, sp.size);
    }
  g.restore();
}
function leagueDeco(g, s, W, H, Z) { // Ligue : la salle du Champion, vue de l'intérieur (dehors, il n'y a rien)
  const A = arena(), k0 = LEVEL.roomIdx || 0;
  setRoom(LEVEL.rooms.length - 1); paintView(g, s ? A.x1 - 60 - W / Z : A.x0 + 60, START_Y - H / Z / 2, W, H, Z); setRoom(k0);
}
function birdDeco(g, s, W, H, Z) { // Oiseau Légendaire : les trois cartes en bandes, de chaque côté
  const k0 = LEVEL.mapIdx || 0, n = LEVEL.maps.length;
  for (let b = 0; b < n; b++) {
    const y0 = Math.round(b * H / n), h = Math.round((b + 1) * H / n) - y0, mp = LEVEL.maps[b];
    pickMap(b); g.save(); g.beginPath(); g.rect(0, y0, W, h); g.clip(); g.translate(0, y0);
    paintView(g, s ? 900 : -900 - W / Z, START_Y - 1400 - h / Z / 2, W, h, Z); g.restore();
    if (b) { g.fillStyle = "rgba(120,140,210,.75)"; g.fillRect(0, y0 - 2, W, 4); }
    g.font = "bold 13px Outfit, sans-serif"; g.textAlign = s ? "right" : "left"; g.fillStyle = "rgba(220,230,255,.95)";
    g.fillText(mp.mapName, s ? W - 16 : 16, y0 + (b ? h - 12 : 64));
  }
  pickMap(k0);
}

/* Panneaux posés sur ce décor : ce que le niveau choisi réserve.
   À gauche, les Pokémon sauvages qu'on y croise ; à droite, ses boss.
   Jamais battu : silhouette noire et « ??? », comme au Pokédex. */
const PANEL = { el:[], mons:[], key:"" };
const PANEL_COL = () => LEVEL.league ? "224,176,64" : LEVEL.rocket ? "200,64,64" : LEVEL.manor ? "210,100,50" : LEVEL.safari ? "200,160,64" : LEVEL.tower ? (LEVEL.sprout ? "190,140,80" : "150,110,190") : LEVEL.cave ? "120,140,210" : "110,190,90";
function panelKinds() { // Oiseau Légendaire : les trois cartes ; Ligue : toutes les salles
  const wild = new Set(), boss = new Set(), add = k => { if (FOES[k] && !FOES[k].hideDex && !FOES[k].prop) (dexBoss(FOES[k]) ? boss : wild).add(k); };
  for (const src of LEVEL.maps || LEVEL.rooms || [LEVEL]) {
    if (src.table) for (let m = 0; m <= 10; m += .5) { const o = []; src.table(m, o); for (const [k] of o) add(k); }
    for (const k of src.rings || []) add(k);
    for (const b of src.bosses || []) boss.add(b.kind);
    for (const k of [src.boss, src.bird, src.finalBoss]) if (k && FOES[k]) boss.add(k);
  }
  return { wild:[...wild].slice(0, 32), boss:[...boss] };
}
function buildPanels() {
  const ov = $("start"); if (!ov || ov.hidden) return;
  const sh = ov.querySelector(".sheet").getBoundingClientRect(), W = Math.floor(sh.left - 28);
  for (let s = 0; s < 2; s++) if (!PANEL.el[s]) { const d = document.createElement("aside"); d.className = "rPanel " + (s ? "r" : "l"); d.setAttribute("aria-hidden", "true"); ov.prepend(d); PANEL.el[s] = d; }
  const show = W >= 200; for (const d of PANEL.el) d.hidden = !show; if (!show) return;
  const key = LEVELS.indexOf(LEVEL) + ":" + W; if (key === PANEL.key) return; PANEL.key = key;
  const { wild, boss } = panelKinds(), seen = k => (dexKills[k] || 0) > 0, col = PANEL_COL();
  PANEL.mons = [];
  for (const d of PANEL.el) { d.style.width = Math.min(W, 300) + "px"; d.style.setProperty("--pc", col); }
  const cell = (k, big) => { const ok = seen(k), n = dexKills[k] || 0, nm = ok ? (FOES[k].name || k).replace(" géant", "") : "???";
    return `<div class="rMon${big ? " big" : ""}${ok ? "" : " unseen"}"><canvas width="${big ? 150 : 76}" height="${big ? 120 : 70}" data-k="${k}"></canvas><b>${nm}</b><small>${ok ? n + " K.O." : "inconnu"}</small></div>`; };
  PANEL.el[0].innerHTML = `<header><span>Pokémon sauvages</span><i>${LEVEL.name}</i></header><div class="rGrid${wild.length > 15 ? " dense" : ""}">${wild.map(k => cell(k)).join("")}</div><footer>${wild.filter(seen).length} / ${wild.length} rencontrés</footer>`;
  PANEL.el[1].innerHTML = `<header><span>Boss de la zone</span><i>${LEVEL.name}</i></header>${boss.length > 3 ? `<div class="rGrid${boss.length > 9 ? " dense" : ""}">${boss.map(k => cell(k)).join("")}</div>` : `<div class="rBoss">${boss.map(k => `<div class="rRow">${cell(k, true)}</div>`).join("")}</div>`}<footer>${boss.filter(seen).length} / ${boss.length} vaincus</footer>`;
  for (const c of document.querySelectorAll(".rPanel canvas")) PANEL.mons.push([c.getContext("2d"), c.dataset.k, c.width, c.height, c.closest(".big") ? 30 : 15]);
}
const PANEL_BOX = new Map(); // zone réellement dessinée de chaque planche (les cadres PMD ont beaucoup de vide autour)
function sheetBox(sh) {
  let b = PANEL_BOX.get(sh); if (b) return b;
  const n = sh.dur.length, c = document.createElement("canvas"); c.width = sh.fw * n; c.height = sh.fh;
  const g = c.getContext("2d"); g.drawImage(sh.img, 0, 0, sh.fw * n, sh.fh, 0, 0, sh.fw * n, sh.fh);
  let x0 = sh.fw, y0 = sh.fh, x1 = 0, y1 = 0;
  try { const d = g.getImageData(0, 0, c.width, c.height).data;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 20) { const fx = x % sh.fw; if (fx < x0) x0 = fx; if (fx > x1) x1 = fx; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  } catch (e) { x0 = 0; y0 = 0; x1 = sh.fw - 1; y1 = sh.fh - 1; }
  if (x1 < x0) { x0 = 0; y0 = 0; x1 = sh.fw - 1; y1 = sh.fh - 1; }
  b = { x0, y0, w:x1 - x0 + 1, h:y1 - y0 + 1 }; PANEL_BOX.set(sh, b); return b;
}
function drawPanels(t) {
  if ($("start").hidden || !PANEL.el[0] || PANEL.el[0].hidden) return;
  for (const [g, k, w, h, r] of PANEL.mons) {
    g.clearRect(0, 0, w, h); const sp = FOES[k].sprite || k, sh = sheetFor(sp, 0);
    if (!sh) { drawMon(g, sp, w / 2, h / 2 - 2, r, false, t, 0, 0, true); continue; }
    // le Pokémon tient toujours dans sa case, quelle que soit sa taille
    const bx = sheetBox(sh), sc = Math.min(w * .88 / bx.w, h * .84 / bx.h, r / 3.2);
    let tick = Math.floor(t * 60) % sh.total, f = 0; while (tick >= sh.dur[f]) { tick -= sh.dur[f]; f++; }
    const dw = bx.w * sc, dh = bx.h * sc, dx = (w - dw) / 2, dy = (h - dh) / 2 + 1;
    ell(g, w / 2, dy + dh - 1, dw * .38, Math.max(2, dh * .07), "rgba(0,0,0,.3)");
    g.imageSmoothingEnabled = false; g.drawImage(sh.img, f * sh.fw + bx.x0, bx.y0, bx.w, bx.h, Math.round(dx), Math.round(dy), Math.round(dw), Math.round(dh));
  }
}
(function panelLoop(ts) { drawPanels(ts / 1000); requestAnimationFrame(panelLoop); })(0);
function refreshSides(force) { if (force) PANEL.key = ""; drawDeco(); buildPanels(); }
addEventListener("resize", () => refreshSides(true));
// à chaque ouverture de l'écran de choix : K.O. et boss vaincus à jour
new MutationObserver(() => { if (!$("start").hidden) refreshSides(true); }).observe($("start"), { attributes:true, attributeFilter:["hidden"] });
