/* ---------- Fork (Lugiapsy) : choix de la carte (Solo, thème menu Lugiapsy), style Vampire Survivors + Megabonk ----------
   Sélection du Pokémon → Confirmer → cet écran → Commencer. Régions en colonne à gauche, niveaux empilés au centre, fiche à droite.
   Tout est lu dans le jeu : LEVELS (niveaux, Pokémon de chaque table, boss), levelOpen (déblocage), dexKills (Pokémon déjà vus),
   career (parties jouées par niveau). Images des lieux : window.FORK_MAPS (src/assets/fork-carte-assets.js). */
const CARTE_REG = { kanto:{ name:"Kanto", chap:"Chapitre 1", mascot:"0150", img:"1" }, johto:{ name:"Johto", chap:"Chapitre 2", mascot:"0251", img:"10" } };
// Textes courts de la liste (sinon : les deux premières phrases de l'intro du niveau, pour les niveaux que Neo ajoutera)
const CARTE_DESC = {
  1:"Une forêt touffue qui grouille d'insectes, d'oiseaux et de Pichu. Traverse-la jusqu'à Argenta.",
  2:"Une grotte obscure pleine de Nosferapti et de Racaillou. Gare aux éboulements des Grolem !",
  3:"Sous le Casino de Céladopole, la Team Rocket cache son repaire. Attention aux Smogo qui explosent et aux flèches du sol.",
  4:"La tour hantée de Lavanville. Sans le Scope Sylphe, les Spectres restent des silhouettes impossibles à identifier.",
  5:"Les hautes herbes de Parmanie. Noeunoeuf et Scarabrute traversent parfois le parc en courant : attrape-les !",
  6:"Un manoir en ruines à Cramois'Île. Des statues ouvrent les portes de feu, et un journal secret est éparpillé dans les couloirs.",
  7:"Trois cartes possibles, tirées au sort à chaque partie : l'Île Écume, la Centrale électrique ou la Route Victoire.",
  8:"Le Conseil 4 puis le Champion : cinq salles à la suite, de plus en plus difficiles. Tu es soigné entre deux salles.",
  9:"Au nord d'Azuria, une caverne réservée aux Maîtres de la Ligue. Mewtwo t'attend tout au fond.",
  10:"À Mauville, une tour en bois qui oscille au rythme de son grand pilier. Les Sages y entraînent toute une lignée de Chétiflor.",
};
const CARTE_KIND = { 1:"Forêt", 2:"Grotte", 3:"Repaire", 4:"Tour hantée", 5:"Plein air", 6:"Ruines", 7:"Carte au hasard", 8:"Sans chrono", 9:"Niveau secret", 10:"Tour" };
const CARTE_PROPS = new Set(["berrytree", "crackrock", "urn", "crate"]);
const carteKindOf = lv => CARTE_KIND[lv.num] || (lv.cave ? "Intérieur" : "Plein air");
const carteImg = lv => (window.FORK_MAPS || {})[lv.num] || "";
const carteRegion = lv => lv.region || "kanto";
const carteHidden = k => LEVELS[k].secret && !levelOpen(k); // niveau secret : nom et image cachés tant qu'il est fermé
const carteDone = k => !!achs["win" + LEVELS[k].num];
const carteUnlock = k => LEVELS[k].jFirst ? "Termine la Caverne Azurée" : `Termine ${LEVELS[k - 1].name}`;
const carteSprite = kind => { const d = FOES[kind] && DEX[FOES[kind].sprite || kind] || DEX[kind]; return Array.isArray(d) ? d[0] : d; };
// Pokémon sauvages et boss d'un niveau, lus dans ses tables (cartes au hasard et salles comprises)
function carteFoes(lv, m) { // m : une seule carte de l'Oiseau Légendaire
  const key = m == null ? "_carte" : "_carte" + m; if (lv[key]) return lv[key];
  const srcs = m != null ? [lv.maps[m]] : lv.maps || lv.rooms || [lv], kinds = [], boss = [];
  const add = (arr, k) => { if (k && FOES[k] && !CARTE_PROPS.has(k) && !FOES[k].hideDex && !arr.includes(k)) arr.push(k); };
  for (const s of srcs) {
    if (s.table) for (let m = 0; m <= 12; m += .25) { const o = []; s.table(m, o); for (const [k] of o) add(kinds, k); }
    for (const b of s.bosses || []) add(boss, b.kind);
    add(boss, s.boss); add(boss, s.bird);
  }
  if (lv.finalBoss) { const f = FOES[lv.finalBoss]; add(boss, f && f.sprite && FOES[f.sprite] ? f.sprite : lv.finalBoss); }
  return lv[key] = { kinds, boss };
}
function carteStats(lv) { // parties jouées sur ce niveau, tous Pokémon confondus (career, 01-progression.js)
  const o = { runs:0, ko:0 }; for (const c of Object.values(career)) { const l = c && c.lv && c.lv[lv.num]; if (l) { o.runs += l.runs || 0; o.ko += l.ko || 0; } }
  return o;
}
const CARTE = document.createElement("div"); CARTE.className = "overlay"; CARTE.id = "carte"; CARTE.hidden = true;
CARTE.innerHTML = `<div class="ctTop"><button class="ctBtn red" id="carteBack" type="button">← Retour</button><h1>Choix de la carte</h1></div>
  <div class="ctWrap"><div class="ctRegs" id="carteRegs"></div><div class="ctList ctFrame"><h2 id="carteRegTitle"></h2><div class="ctRows" id="carteRows"></div></div><div class="ctCard ctFrame" id="carteCard"></div></div>`;
$("pick").after(CARTE); HOME_PAGES.push("carte");
let carteFlow = false, carteReg = "kanto", carteKs = [], carteCur = -1, carteZone = "rows", cartePtr = 0;
const carteDraws = new Set(); // petits Pokémon animés de l'écran
function carteMon(kind, id, seen, size, cls = "ctMon") { // case animée (silhouette noire si jamais vu)
  const s = document.createElement("span"); s.className = cls + (seen ? "" : " unseen"); s.title = seen ? (kind && FOES[kind] ? FOES[kind].name : "") : "Pas encore vu";
  const c = document.createElement("canvas"); c.width = c.height = size; s.appendChild(c); const g = c.getContext("2d"), ph = Math.random() * 3;
  carteDraws.add(t => { if (!c.isConnected) return false; g.clearRect(0, 0, size, size); g.save(); if (!seen) g.filter = "brightness(0)"; pickDraw(g, id, size / 2, size - 3, size / 40, 0, seen ? t + ph : 0); g.restore(); });
  return s;
}
(function carteLoop(now) {
  if (state === "carte") for (const d of carteDraws) if (d(now / 1000) === false) carteDraws.delete(d);
  requestAnimationFrame(carteLoop);
})(0);
/* Oiseau Légendaire découpé en trois niveaux optionnels 7-1, 7-2, 7-3 (Île Écume, Centrale électrique, Route Victoire), sans tirage
   au sort : les trois s'ouvrent après le Manoir, une seule suffit pour la Ligue (succès win7 du jeu de Neo, inchangé).
   Le jeu de Neo garde un seul niveau à cartes (LEVEL.maps) : on impose la carte (pickMap) et on note chaque carte terminée. */
let BIRDS = {}; try { BIRDS = JSON.parse(localStorage.getItem("pokesurv-birds") || "{}") || {}; } catch (e) {}
const birdSave = () => { try { localStorage.setItem("pokesurv-birds", JSON.stringify(BIRDS)); } catch (e) {} };
let forkBirdMap = null; // carte imposée pour la prochaine partie (null : tirage au sort de Neo)
const forkPickMap = pickMap;
pickMap = k => { if (k == null && forkBirdMap != null) { k = forkBirdMap; forkBirdMap = null; } return forkPickMap(k); }; // une fois, au lancement (newGame ne précise pas la carte)
const forkEndGame = endGame;
endGame = win => {
  if (win && LEVEL.maps && !NET.role) { // carte gagnée, et par quel Pokémon (BIRDS.by[ligne][carte]) pour la sélection du Pokémon
    const m = LEVEL.mapIdx | 0, ln = S.players[0] && S.players[0].line; BIRDS[m] = true;
    if (ln) { BIRDS.by = BIRDS.by || {}; (BIRDS.by[ln] = BIRDS.by[ln] || {})[m] = true; }
    birdSave();
  }
  return forkEndGame(win);
};
const BIRD_DESC = ["Des grottes gelées au large de Parmanie. Le sol glisse et des stalactites tombent du plafond. Artikodin dort tout au fond.",
  "Une centrale abandonnée près d'Azuria. Les barrières électriques s'allument et s'éteignent. Électhor rôde parmi les générateurs.",
  "Le dernier passage avant le Plateau Indigo : lacs de lave brûlante, Onix et Machoc. Sulfura garde la sortie."];
const BIRD_KIND = ["Grotte gelée", "Usine", "Grotte de lave"];
// entrées de la liste : un niveau, ou une carte de l'Oiseau Légendaire ({ k, m })
const carteRegLevels = r => LEVELS.map((lv, k) => k).filter(k => carteRegion(LEVELS[k]) === r);
const carteEntries = r => carteRegLevels(r).flatMap(k => LEVELS[k].maps ? LEVELS[k].maps.map((_, m) => ({ k, m })) : [{ k }]);
const eBird = e => e.m != null;
const eAfterBirds = e => !eBird(e) && e.k > 0 && !!LEVELS[e.k - 1].maps && carteRegion(LEVELS[e.k - 1]) === carteRegion(LEVELS[e.k]); // la Ligue
const eOpen = e => levelOpen(e.k); // les trois cartes s'ouvrent ensemble ; la Ligue après n'importe laquelle (règle du jeu de Neo)
const eLabel = e => eBird(e) ? `Niveau optionnel ${lvLabel(LEVELS[e.k])}-${e.m + 1}` : `Niveau ${lvLabel(LEVELS[e.k])}`;
const eDone = e => eBird(e) ? !!BIRDS[e.m] : carteDone(e.k);
// terminé avec ce Pokémon : victoires par niveau du Panthéon de Neo (career), ou carte de l'Oiseau Légendaire notée ci-dessus
const eDoneBy = (e, line) => eBird(e) ? !!(BIRDS.by && BIRDS.by[line] && BIRDS.by[line][e.m]) : !!(career[line] && career[line].lv && career[line].lv[LEVELS[e.k].num] && career[line].lv[LEVELS[e.k].num].wins);
const eName = e => eBird(e) ? LEVELS[e.k].maps[e.m].mapName : LEVELS[e.k].name;
const eImg = e => eBird(e) ? (window.FORK_MAPS || {})[`${LEVELS[e.k].num}-${e.m}`] || carteImg(LEVELS[e.k]) : carteImg(LEVELS[e.k]);
const eDesc = e => eBird(e) ? BIRD_DESC[e.m] || LEVELS[e.k].maps[e.m].tip : CARTE_DESC[LEVELS[e.k].num] || LEVELS[e.k].intro.split(/(?<=[.!?…]) /).slice(0, 2).join(" ");
const eKind = e => eBird(e) ? BIRD_KIND[e.m] || "Grotte" : carteKindOf(LEVELS[e.k]);
const eUnlock = e => eAfterBirds(e) ? `Termine ${LEVELS[e.k - 1].maps.map(m => m.mapName).join(", ").replace(/, ([^,]*)$/, " ou $1")}` : carteUnlock(e.k);
const carteRegOpen = r => carteEntries(r).some(eOpen);
function carteRegions() {
  $("carteRegs").innerHTML = "";
  for (const [r, R] of Object.entries(CARTE_REG)) {
    const es = carteEntries(r); if (!es.length) continue;
    const open = carteRegOpen(r), done = es.filter(eDone).length, plan = Math.max(es.length, (typeof RT_REG !== "undefined" && RT_REG[r] && RT_REG[r].plan) || 0);
    const b = document.createElement("button"); b.type = "button"; b.className = "ctReg" + (open ? "" : " locked") + (r === carteReg ? " on" : ""); b.dataset.r = r;
    b.innerHTML = `<img src="${(window.FORK_MAPS || {})[R.img] || ""}" alt=""><span class="chap">${R.chap}</span>${open ? "" : `<span class="lk">🔒</span>`}
      <span class="lbl"><b>${R.name}</b><small>${open ? `${done} / ${plan} terminé${done > 1 ? "s" : ""}` : "Termine la Caverne Azurée"}</small></span>`;
    const m = carteMon(null, R.mascot, open, 96, "ctMascot"); m.title = ""; b.appendChild(m);
    b.addEventListener("click", () => carteRegPick(r));
    $("carteRegs").appendChild(b);
  }
}
function carteRegPick(r) {
  if (!carteRegOpen(r)) { sfx("hurt"); return; }
  if (r !== carteReg) { sfx("click"); carteReg = r; carteRegions(); carteRows(null); }
  carteZone = "rows"; carteFocus();
}
function carteRows(want) {
  const r = carteReg, R = CARTE_REG[r]; $("carteRegTitle").textContent = `${R.name} · Sélection du niveau`;
  carteKs = carteEntries(r); // entrées { k, m } (nom gardé pour le reste de l'écran)
  const plan = (typeof RT_REG !== "undefined" && RT_REG[r] && RT_REG[r].plan) || 0;
  $("carteRows").innerHTML = "";
  carteKs.forEach((e, j) => {
    const lv = LEVELS[e.k], open = eOpen(e), hid = carteHidden(e.k), done = eDone(e);
    const b = document.createElement("button"); b.type = "button"; b.className = "ctRow" + (open ? "" : " locked"); b.dataset.j = j;
    b.innerHTML = `<span class="th">${hid ? "" : `<img src="${eImg(e)}" alt="">`}<b>${hid ? "???" : eName(e)}</b><i>${eLabel(e)}</i></span>
      <span class="tx">${hid ? "Un lieu mystérieux… Seuls les Maîtres de la Ligue savent où il se cache." : open ? eDesc(e) : `<b>Condition :</b> ${eUnlock(e)} pour débloquer ce niveau.`}
        ${open ? `<small>⏱ ${lv.league ? "5 salles, sans chrono" : fmt(GAME_LEN)} · ${eKind(e)}</small>` : ""}</span>
      <span class="side">${done ? `<span class="tro">🏆</span>Terminé` : open ? `<span class="tro off">🏆</span>` : `<span class="tro">🔒</span>`}</span>`;
    b.addEventListener("pointerdown", () => { cartePtr = performance.now(); });
    b.addEventListener("click", () => { if (carteCur !== j) { sfx("click"); carteSel(j); } }); // la partie ne démarre qu'avec « Commencer »
    b.addEventListener("focus", () => { if (performance.now() - cartePtr > 400 && carteCur !== j) carteSel(j, false); }); // clavier ou manette : le focus choisit
    $("carteRows").appendChild(b);
  });
  for (let j = carteKs.length; j < plan; j++) $("carteRows").insertAdjacentHTML("beforeend", `<div class="ctRow soon"><span class="th"><b>Bientôt</b><i>Niveau ${j + 1}</i></span><span class="tx">Ce niveau est en construction.</span><span class="side"></span></div>`);
  const cur = LEVELS.indexOf(LEVEL), same = e => e.k === cur && (!eBird(e) || e.m === (forkBirdMap ?? LEVEL.mapIdx ?? 0));
  const openJs = carteKs.map((e, j) => j).filter(j => eOpen(carteKs[j])), curJ = carteKs.findIndex(same);
  const pick = want != null && carteKs[want] ? want : curJ >= 0 && eOpen(carteKs[curJ]) ? curJ : openJs[openJs.length - 1] ?? 0;
  carteSel(pick, false);
}
function carteSel(j, scroll = true) {
  carteCur = j; const rows = [...$("carteRows").querySelectorAll(".ctRow:not(.soon)")];
  rows.forEach((b, i) => b.classList.toggle("sel", i === j));
  if (rows[j]) rows[j].scrollIntoView({ block:"nearest", behavior:scroll ? "smooth" : "auto" });
  carteCard(carteKs[j], j);
}
function carteCard(e, j) {
  const k = e.k, lv = LEVELS[k], open = eOpen(e), hid = carteHidden(k), done = eDone(e), st = carteStats(lv), F = carteFoes(lv, e.m);
  const mon = pickCur && LINES[pickCur];
  $("carteCard").innerHTML = `
    <div class="pic"><img src="${hid ? "" : eImg(e)}" alt=""${open ? "" : ` class="dim"`}></div>
    <h3>${hid ? "???" : eName(e)}</h3><div class="sub">${CARTE_REG[carteRegion(lv)].name} · ${eLabel(e)}${hid ? "" : " · " + eKind(e)}</div>
    <div class="stats"><span>⏱ Durée</span><b>${lv.league ? "5 salles, sans chrono" : fmt(GAME_LEN)}</b><span>🏆 Terminé</span><b>${done ? "Oui" : "Pas encore"}</b>
      <span>🎮 Parties</span><b>${st.runs || "--"}</b><span>💥 K.O. au total</span><b>${st.ko ? st.ko.toLocaleString("fr-FR") : "--"}</b></div>
    ${open ? "" : `<div class="need">🔒 ${eUnlock(e)} pour débloquer ce niveau.</div>`}
    ${hid ? "" : `<h4>Pokémon sauvages</h4><div class="mons" id="carteMons"></div><h4>${lv.rooms ? "Conseil 4 et Champion" : "Boss"}</h4><div class="mons" id="carteBoss"></div>`}
    <div class="go"><button class="ctBtn go" id="carteGo" type="button" ${open && mon ? "" : "disabled"}>${mon ? `<img src="${(window.FORK_PORTRAITS || {})[DEX[pickCur][0]] || ""}" alt="">` : ""}<span>Commencer<small>${mon ? "avec " + mon.names[0] : ""}</small></span></button>
      <button class="ctNuz" id="carteNuz" type="button" aria-pressed="${NUZ}" title="Pas de Rappel ni de soin au sol">💀 Nuzlocke</button></div>`;
  if (!hid) {
    for (const kind of F.kinds) $("carteMons").appendChild(carteMon(kind, carteSprite(kind), !!dexKills[kind], 52));
    for (const kind of F.boss) $("carteBoss").appendChild(carteMon(kind, carteSprite(kind), !!dexKills[kind], 60));
  }
  $("carteGo").addEventListener("click", carteGo);
  $("carteNuz").addEventListener("click", () => { setNuz(!NUZ); sfx("click"); $("carteNuz").setAttribute("aria-pressed", String(NUZ)); });
}
function carteGo() {
  const e = carteKs[carteCur]; if (!e) return;
  if (!eOpen(e)) { sfx("hurt"); return; }
  if (!pickCur || pickLock(pickCur)) return;
  sfx("click"); forkBirdMap = eBird(e) ? e.m : null; setLevel(e.k); pickStarter(pickCur);
  if (state !== "carte") CARTE.hidden = true; // la partie a démarré (newGame ne cache que les écrans de Neo)
}
function carteFocus() {
  if (carteZone === "regs") { const b = $("carteRegs").querySelector(".ctReg.on") || $("carteRegs").querySelector(".ctReg"); if (b) b.focus({ preventScroll:true }); return; }
  const b = $("carteRows").querySelectorAll(".ctRow:not(.soon)")[carteCur]; if (b) b.focus({ preventScroll:true });
}
function carteOpen() { // depuis Confirmer (sélection du Pokémon) ou après une partie
  goPlay(false); // réglages Solo de l'écran de Neo (un joueur, pas de salon en ligne), puis on affiche cet écran à la place
  if (pickCur) carGo(pickCur); setPickFlow(false); carteFlow = true;
  showPage("carte", "carte");
  const cur = LEVELS.indexOf(LEVEL); carteReg = cur >= 0 && levelOpen(cur) ? carteRegion(LEVELS[cur]) : "kanto";
  carteRegions(); carteRows(null); carteZone = "rows"; carteFocus();
}
function carteBack() { carteFlow = false; sfx("click"); pickOpen(); }
function carteMove(d) {
  if (carteZone === "regs") {
    const regs = [...$("carteRegs").querySelectorAll(".ctReg")], i = regs.findIndex(b => b === document.activeElement);
    if (d === "r") { carteZone = "rows"; carteFocus(); return; }
    if (d === "u" || d === "d") { const n = regs[Math.max(0, Math.min(regs.length - 1, (i < 0 ? 0 : i) + (d === "d" ? 1 : -1)))]; if (n) n.focus({ preventScroll:true }); sfx("click"); }
    return;
  }
  if (d === "l") { carteZone = "regs"; carteFocus(); sfx("click"); return; }
  if (d === "u" || d === "d") { const j = Math.max(0, Math.min(carteKs.length - 1, carteCur + (d === "d" ? 1 : -1))); if (j !== carteCur) { sfx("click"); carteSel(j); carteFocus(); } }
}
function carteOk() {
  if (carteZone === "regs") { const b = document.activeElement; if (b && b.classList.contains("ctReg")) carteRegPick(b.dataset.r); return; }
  const a = document.activeElement; if (a && a.closest("#carteCard") && a.tagName === "BUTTON") { a.click(); return; }
  carteGo();
}
$("carteBack").addEventListener("click", carteBack);
window.addEventListener("keydown", e => {
  if (state !== "carte") return;
  const d = { ArrowLeft:"l", ArrowRight:"r", ArrowUp:"u", ArrowDown:"d", KeyA:"l", KeyQ:"l", KeyD:"r", KeyW:"u", KeyZ:"u", KeyS:"d" }[e.code];
  if (d) { e.preventDefault(); carteMove(d); }
  else if (e.code === "Enter" || e.code === "Space") { e.preventDefault(); carteOk(); }
  else if (e.code === "Escape" || e.code === "Backspace") { e.preventDefault(); if (carteZone === "regs") { carteZone = "rows"; carteFocus(); } else carteBack(); }
});
(function cartePad(prev) { // manette : croix / stick, A valide, B retour (la navigation générique de 30-manette.js ne gère pas cet écran)
  const gp = [...(navigator.getGamepads ? navigator.getGamepads() : [])].find(g => g && g.connected); let now = {};
  if (gp && state === "carte") {
    const b = i => !!gp.buttons[i]?.pressed, ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
    now = { l:b(14) || ax < -.5, r:b(15) || ax > .5, u:b(12) || ay < -.5, d:b(13) || ay > .5, a:b(0), b:b(1), lb:b(4), rb:b(5) };
    for (const k of "lrud") if (now[k] && !prev[k]) carteMove(k);
    if (now.a && !prev.a) carteOk(); if (now.b && !prev.b) carteBack();
    if ((now.lb && !prev.lb) || (now.rb && !prev.rb)) { const rs = Object.keys(CARTE_REG).filter(carteRegOpen); carteRegPick(rs[(rs.indexOf(carteReg) + 1) % rs.length]); }
  }
  requestAnimationFrame(() => cartePad(now));
})({});
// Après une partie (« Rejouer » de l'écran de fin) : retour sur cet écran au lieu de celui de Neo
$("againBtn").addEventListener("click", () => { if (carteFlow && !NET.role) carteOpen(); });
