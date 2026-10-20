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
    const vw = W / Z, vh = H / Z, camX = s ? 900 : -900 - vw, camY = START_Y - 1400 - vh / 2; // loin du départ, là où le niveau est bien garni
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
    g.fillStyle = "rgba(10,18,13,.38)"; g.fillRect(0, 0, W, H); // assombri : le starter reste la vedette
  }
}

/* Panneaux posés sur ce décor : ce que le niveau choisi réserve.
   À gauche, les Pokémon sauvages qu'on y croise ; à droite, ses boss.
   Jamais battu : silhouette noire et « ??? », comme au Pokédex. */
const PANEL = { el:[], mons:[], key:"" };
const PANEL_COL = () => LEVEL.league ? "224,176,64" : LEVEL.rocket ? "200,64,64" : LEVEL.manor ? "210,100,50" : LEVEL.safari ? "200,160,64" : LEVEL.tower ? (LEVEL.sprout ? "190,140,80" : "150,110,190") : LEVEL.cave ? "120,140,210" : "110,190,90";
function panelKinds() {
  const wild = new Set();
  if (LEVEL.table) for (let m = 0; m <= 10; m += .5) { const o = []; LEVEL.table(m, o); for (const [k] of o) if (FOES[k] && !dexBoss(FOES[k]) && !FOES[k].hideDex && !FOES[k].prop) wild.add(k); }
  for (const k of LEVEL.rings || []) if (FOES[k] && !dexBoss(FOES[k])) wild.add(k);
  const boss = (LEVEL.bosses || []).map(b => [b.kind, b.at]); if (LEVEL.finalBoss) boss.push([LEVEL.finalBoss, 600]);
  return { wild:[...wild].slice(0, 12), boss };
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
  PANEL.el[0].innerHTML = `<header><span>Pokémon sauvages</span><i>${LEVEL.name}</i></header><div class="rGrid">${wild.map(k => cell(k)).join("")}</div><footer>${wild.filter(seen).length} / ${wild.length} rencontrés</footer>`;
  PANEL.el[1].innerHTML = `<header><span>Boss de la zone</span><i>${LEVEL.name}</i></header><div class="rBoss">${boss.map(([k, at]) => `<div class="rRow">${cell(k, true)}</div>`).join("")}</div><footer>${boss.filter(([k]) => seen(k)).length} / ${boss.length} vaincus</footer>`;
  for (const c of document.querySelectorAll(".rPanel canvas")) PANEL.mons.push([c.getContext("2d"), c.dataset.k, c.width, c.height, c.closest(".big") ? 30 : 15]);
}
function drawPanels(t) {
  if ($("start").hidden || !PANEL.el[0] || PANEL.el[0].hidden) return;
  for (const [g, k, w, h, r] of PANEL.mons) { g.clearRect(0, 0, w, h); drawMon(g, FOES[k].sprite || k, w / 2, h / 2 - 2, r, false, t, 0, 0, true); }
}
(function panelLoop(ts) { drawPanels(ts / 1000); requestAnimationFrame(panelLoop); })(0);
function refreshSides(force) { if (force) PANEL.key = ""; drawDeco(); buildPanels(); }
addEventListener("resize", () => refreshSides(true));
// à chaque ouverture de l'écran de choix : K.O. et boss vaincus à jour
new MutationObserver(() => { if (!$("start").hidden) refreshSides(true); }).observe($("start"), { attributes:true, attributeFilter:["hidden"] });
