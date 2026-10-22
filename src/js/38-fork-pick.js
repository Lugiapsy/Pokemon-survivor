
/* ---------- Fork (Lugiapsy) : sélection du Pokémon (Solo), style Vampire Survivors ----------
   Menu → Solo → cet écran → Confirmer → choix de la carte (42-fork-carte.js), avec ce starter déjà choisi.
   Stats : départ du Pokémon + vrais achats du Marchand (objet shop). Données lues dans LINES, MOVES, TALENTS. */
// Version du fork, à côté de celle du jeu (Neo l'a retirée de son jeu ; elle reste ici, dans un fichier propre au fork)
const FORK_VER = "05"; // +1 à chaque envoi sur GitHub (MAJ-NNN)
$("verTag").textContent = "Version " + NET_VER.slice(1) + " · Fork " + FORK_VER;
// Mentions légales : crédit du fork ajouté à la ligne « Jeu original » de Neo (ou en fin de page si elle change)
{ const box = document.querySelector("#legal .legalText"), orig = box && [...box.querySelectorAll("p")].find(p => /Jeu original/.test(p.textContent));
  const credit = `<b>Fork</b> : <a href="https://github.com/Lugiapsy/Pokemon-survivor" target="_blank" rel="noopener">Lugiapsy</a>`;
  if (orig) orig.insertAdjacentHTML("beforeend", ` · ${credit}`); else if (box) box.insertAdjacentHTML("beforeend", `<p>${credit}</p>`); }
const PICK_SKINS = { pika:[{ n:"Classique", dex:"0172" }, { n:"Troizépi", dex:"0172sp" }] }; // skins (visuel seulement pour l'instant)
const PICK_REGIONS = [["kanto", "Kanto"], ["johto", "Johto"]];
const pickRegion = { kanto:true, johto:true }, pickSkin = {};
let pickList = [], pickCur = null, pickCells = [], pickFlow = false; // pickFlow : l'écran de Neo a été ouvert depuis cette sélection
// pickFlow : sur l'écran de Neo, plus de carrousel ; on choisit seulement le niveau, puis « Jouer avec … » (classe body.pickFlow)
function setPickFlow(on) { pickFlow = on; document.body.classList.toggle("pickFlow", on); if (on) pickLaunchLabel(); }
const pickIcon = k => k === "carbone" ? window.FORK_CARBONE || ITEM_ICONS.carbone : ITEM_ICONS[k]; // vraie icône du Carbone (celle du jeu est le Charbon)
const pickSkinOf = line => (PICK_SKINS[line] || [{ n:"Classique", dex:DEX[line][0] }])[pickSkin[line] || 0];
const pickLock = line => ACHS.find(a => unlocks(a, line) && !achs[a.id]);
const pickEvo = line => { const L = LINES[line];
  return line === "mew" ? "n'évolue pas, se renforce N.10 et N.22" : line === "evoli" ? "Pyroli, Aquali, Phyllali ou Voltali au N.10"
    : line === "miaouss" ? `${L.names[1]} au N.${EVO_LEVELS[0]}` : `${L.names[1]} au N.${EVO_LEVELS[0]}, ${L.names[2]} au N.${EVO_LEVELS[1]}`; };
// Stats : départ du Pokémon + achats du Marchand (mêmes effets que mkPlayer, hurtP, hitFoe…). buy : niveaux achetés
function pickStats(line) { // valeurs réelles (base du Pokémon, 0 s'il n'a rien) + achats du Marchand ; plus : gain total par rapport à la base neutre
  const L = LINES[line], b = k => shop[k] || 0, dec = v => String(Math.round(v * 10) / 10).replace(".", ",");
  const gain = (v, base, unit = "") => v !== base ? `${v > base ? "+" : "−"}${Math.abs(Math.round(v - base))}${unit}` : "";
  const hp = Math.round(L.hp * (1 + .02 * b("hp"))), spd = Math.round(L.speed * (1 + .02 * b("spd")));
  const atk = Math.round(100 * (L.dmg || 1) * (1 + .02 * b("dmg"))), rch = Math.round(100 / (L.cd || 1));
  const crit = Math.round(100 * ((L.crit || 0) + .01 * b("lentil"))), zone = 100 + b("loupe"), xp = line === "evoli" ? 110 : 100;
  const armor = (line === "draco" ? 10 : 0) + " %" + (b("veste") ? ` · ${b("veste")}/coup` : "");
  const rows = [
    [{ n:"PV max", item:"pvplus", v:hp, plus:gain(hp, L.hp), buy:b("hp") },
     { n:"Régénération", item:"restes", v:`${dec(L.regen || 0)}/s`, on:!!L.regen },
     { n:"Armure", item:"veste", v:armor, on:line === "draco" || !!b("veste"), buy:b("veste") }],
    [{ n:"Attaque", item:"carbone", v:atk, plus:gain(atk, 100, " %"), buy:b("dmg") },
     { n:"Critique", item:"lentilscope", v:`${crit} %`, on:crit > 0, buy:b("lentil") },
     { n:"Recharge", item:"vivegriffe", v:rch, plus:gain(rch, 100, " %") },
     { n:"Projectiles", item:"depipe", v:b("depipe"), on:!!b("depipe"), buy:b("depipe") }],
    [{ n:"Vitesse", item:"mouchoir", v:spd, plus:gain(spd, L.speed), buy:b("spd") },
     { n:"Zone", item:"loupe", v:`${zone} %`, plus:gain(zone, 100, " %"), buy:b("loupe") },
     { n:"Vit. projectiles", item:"poudrevite", v:"100 %" },
     { n:"Durée", item:"lumargile", v:"100 %" }],
    [{ n:"Attraction", item:"aimant", v:"100 %" },
     { n:"Expérience", item:"multiexp", v:`${xp} %`, plus:gain(xp, 100, " %") },
     { n:"Malédiction", item:"miel", v:"0 %" },
     { n:"Rappel", item:"rappel", v:b("rappel") && !NUZ ? b("rappel") : 0, on:!!b("rappel") && !NUZ, buy:b("rappel") },
     { n:"Relances", ic:"🎲", v:b("reroll"), on:!!b("reroll"), buy:b("reroll") }],
  ];
  return rows.map(g => g.map(x => ({ ...x, up:!!x.plus || !!x.on })));
}
// Sprite animé (feuille PMD) : pieds posés sur (x, y), direction row, marche si moving
function pickDraw(g, id, x, y, sc, row, t) {
  const sh = SPR[id]; if (!sh || !sh.img.complete || !sh.img.naturalWidth) return;
  if (sh.foot == null) { // ligne des pieds : dernière ligne non transparente de la 1re image
    const c = document.createElement("canvas"); c.width = sh.fw; c.height = sh.fh; const cg = c.getContext("2d");
    cg.drawImage(sh.img, 0, 0, sh.fw, sh.fh, 0, 0, sh.fw, sh.fh); const d = cg.getImageData(0, 0, sh.fw, sh.fh).data;
    let f = sh.fh - 1; const rowEmpty = r => { for (let i = 0; i < sh.fw; i++) if (d[(r * sh.fw + i) * 4 + 3] > 20) return false; return true; };
    while (f > 0 && rowEmpty(f)) f--; sh.foot = f;
  }
  let tick = Math.floor(t * 60) % sh.total, f = 0; while (tick >= sh.dur[f]) { tick -= sh.dur[f]; f++; }
  g.imageSmoothingEnabled = false;
  g.drawImage(sh.img, f * sh.fw, row * sh.fh, sh.fw, sh.fh, Math.round(x - sh.fw * sc / 2), Math.round(y - (sh.foot + 1) * sc), sh.fw * sc, sh.fh * sc);
}
let pickCanvas = null;
(function pickLoop(now) { // le Pokémon de la fiche marche et fait un tour sur lui-même (seulement quand l'écran est ouvert)
  if (state === "pick" && pickCanvas && pickCanvas.isConnected && pickCur) {
    const g = pickCanvas.getContext("2d"), t = now / 1000; g.clearRect(0, 0, pickCanvas.width, pickCanvas.height);
    pickDraw(g, pickSkinOf(pickCur).dex, 55, 88, 2, Math.floor(t / 1.5) % 8, t);
  }
  requestAnimationFrame(pickLoop);
})(0);

function pickBuild() {
  pickList = starterOrder.filter(l => pickRegion[LINES[l].own ? "johto" : "kanto"]);
  $("pickGrid").innerHTML = "";
  if (!pickList.length) { $("pickGrid").innerHTML = `<div class="pkEmpty">Coche au moins une région.</div>`; pickCells = []; pickShow(null); return; }
  pickCells = pickList.map(line => {
    const L = LINES[line], lk = !!pickLock(line), b = document.createElement("button");
    b.type = "button"; b.className = "pkCell" + (lk ? " lk" : "");
    b.innerHTML = `<span class="nm">${lk ? "???" : L.names[0]}</span>` + (lk ? `<span class="pkQ">?</span>`
      : `<img class="pt" src="${(window.FORK_PORTRAITS || {})[DEX[line][0]] || ""}" alt=""><span class="chip" style="--c:${TYPE_COLORS[L.type]}">${TYPE_NAMES[L.type]}</span>`);
    b.addEventListener("click", () => pickSelect(line));
    $("pickGrid").appendChild(b); return b;
  });
  pickSelect(pickList.includes(pickCur) ? pickCur : pickList.find(l => !pickLock(l)) || pickList[0]);
}
function pickSelect(line) { // le clic (ou les flèches) choisit ; la fiche reste sur ce Pokémon tant qu'on n'en choisit pas un autre
  pickCur = line; pickCells.forEach((c, i) => c.classList.toggle("sel", pickList[i] === line)); pickShow(line);
}
function pickShow(line) {
  if (!line) { $("pickTxt").innerHTML = ""; $("pickPic").innerHTML = ""; $("pickStats").innerHTML = ""; $("pickGo").disabled = true; return; }
  const L = LINES[line], lock = pickLock(line), col = TYPE_COLORS[L.type];
  $("pickStats").innerHTML = pickStats(line).map(g => `<div class="pkGrp">${g.map(x => `<div class="pkRow${x.up && !lock ? " up" : ""}"${x.buy ? ` title="${x.buy} niveau${x.buy > 1 ? "x" : ""} acheté${x.buy > 1 ? "s" : ""} au Marchand"` : ""}>${x.item ? `<img src="${pickIcon(x.item)}" alt="">` : `<span class="em">${x.ic}</span>`}<span>${x.n}</span><span class="v">${lock ? "?" : (x.buy ? `<em>×${x.buy}</em>` : "") + x.v + (x.plus ? `<small>(${x.plus})</small>` : "")}</span></div>`).join("")}</div>`).join("");
  $("pickSlots").innerHTML = `Capacités max : ${MAX_MOVES()}` + (shop.slot ? ` <small>(+${shop.slot} achetée${shop.slot > 1 ? "s" : ""})</small>` : "");
  $("pickPic").innerHTML = ""; pickCanvas = null;
  if (lock) $("pickPic").innerHTML = `<div class="pkQ">?</div>`;
  else {
    pickCanvas = document.createElement("canvas"); pickCanvas.width = 110; pickCanvas.height = 96; $("pickPic").appendChild(pickCanvas);
    const skins = PICK_SKINS[line];
    if (skins) { // plusieurs skins : clic sur le Pokémon animé = skin suivant ; petits carrés et nom du skin dessous
      pickCanvas.classList.add("multi"); pickCanvas.title = "Clique pour changer de skin";
      pickCanvas.addEventListener("click", () => { pickSkin[line] = ((pickSkin[line] || 0) + 1) % skins.length; sfx("click"); pickShow(line); });
      $("pickPic").insertAdjacentHTML("beforeend", `<div class="pkSkins">${skins.map((k, i) => `<i class="${(pickSkin[line] || 0) === i ? "on" : ""}"></i>`).join("")}</div><span class="pkSkinName">${pickSkinOf(line).n}</span>`);
    }
  }
  const m = MOVES[L.move], t = TALENTS[line], mdesc = m ? m.desc(1).split(/(?<=\.) /)[0] : "";
  $("pickTxt").innerHTML = lock ? `<h2>???</h2><p>🔒 Succès « ${lock.name} » : ${lock.desc}</p>`
    : `<h2>${L.names[0]} <span class="chip" style="--c:${col}">${TYPE_NAMES[L.type]}</span></h2>
       <p class="pkMv"><b>${m ? m.name : ""}</b> : ${mdesc}</p>${t ? `<p><b>${t[0]}</b> : ${t[1].charAt(0).toUpperCase() + t[1].slice(1)}</p>` : ""}<p>Évolution : ${pickEvo(line)}</p>`;
  $("pickGo").disabled = !!lock; $("pickGo").textContent = lock ? "Verrouillé" : "Confirmer";
  pickMaps();
}
// Niveaux terminés avec le Pokémon de la fiche : onglets Kanto / Johto, un trophée par carte gagnée (eDoneBy, 42-fork-carte.js)
let pickMapReg = "kanto";
function pickMaps() {
  $("pickMapTabs").innerHTML = PICK_REGIONS.map(([k, n]) => `<button type="button" class="pkTab${k === pickMapReg ? " on" : ""}" data-r="${k}">${n}</button>`).join("");
  const es = carteEntries(pickMapReg), line = pickCur && !pickLock(pickCur) ? pickCur : null;
  if (!es.length) { $("pickMaps").innerHTML = `<div class="pkMapNone">Bientôt…</div>`; return; }
  const done = es.filter(e => line && eDoneBy(e, line)).length;
  $("pickMaps").innerHTML = es.map(e => { const hid = carteHidden(e.k), ok = line && eDoneBy(e, line);
    return `<div class="pkMap${ok ? " done" : ""}"><span>${hid ? "???" : eName(e)}</span><b>${ok ? "🏆" : ""}</b></div>`; }).join("")
    + `<div class="pkMapTot">${line ? `${done} / ${es.length} terminé${done > 1 ? "s" : ""} avec ${LINES[line].names[0]}` : "?"}</div>`;
}
$("pickMapTabs").addEventListener("click", e => { const b = e.target.closest(".pkTab"); if (!b || b.dataset.r === pickMapReg) return; sfx("click"); pickMapReg = b.dataset.r; pickMaps(); });
function pickOpen() {
  $("pickRegions").innerHTML = PICK_REGIONS.map(([k, n]) => `<label><input type="checkbox" data-r="${k}" ${pickRegion[k] ? "checked" : ""}> ${n}</label>`).join("");
  showPage("pick", "pick"); pickBuild();
  const c = pickCells[pickList.indexOf(pickCur)]; if (c) c.focus({ preventScroll:true });
}
function pickConfirm() { // le choix de la carte s'ouvre avec ce Pokémon (42-fork-carte.js)
  if (!pickCur || pickLock(pickCur)) return;
  sfx("click"); carteOpen();
}
function pickMove(d) { // flèches / manette dans la grille
  if (!pickCells.length) return;
  const top = pickCells[0].offsetTop, cols = Math.max(1, pickCells.filter(c => c.offsetTop === top).length), i = pickList.indexOf(pickCur);
  const j = d === "l" ? i - 1 : d === "r" ? i + 1 : d === "u" ? i - cols : i + cols;
  if (j < 0 || j >= pickList.length) return;
  pickSelect(pickList[j]); pickCells[j].focus({ preventScroll:true }); sfx("click");
}
HOME_PAGES.push("pick");
$("homeSolo").replaceWith($("homeSolo").cloneNode(true)); // Solo ouvre maintenant cet écran (Multijoueur garde l'écran de Neo)
// Thème menu (Paramètres) : « Lugiapsy » = cette sélection, « Neocrizis » = Solo ouvre directement l'écran de Neo
let menuTheme = "lugiapsy"; try { menuTheme = localStorage.getItem("pokesurv-menutheme") || "lugiapsy"; } catch (e) {}
$("menuTheme").value = menuTheme;
const thApply = () => document.body.classList.toggle("thLugia", menuTheme === "lugiapsy"); // style des pages du menu (fork-theme.css)
thApply();
$("menuTheme").addEventListener("change", e => { menuTheme = e.target.value; thApply(); try { localStorage.setItem("pokesurv-menutheme", menuTheme); } catch (er) {} });
// Thème Lugiapsy : Magasin, Succès et Pokédex n'ont plus que le retour en haut à gauche (le « Retour » du bas est caché) : il prend le focus
for (const [btn, back] of [["shopBtn", "shopBack"], ["achBtn", "achBack"], ["dexBtn", "dexBack"]]) $(btn).addEventListener("click", () => {
  if (btn === "dexBtn") for (const c of $("dexGrid").querySelectorAll(".dexCard")) c.classList.toggle("unseen", c.querySelector("b").textContent === "???"); // pas encore vu : case foncée
  if (menuTheme === "lugiapsy") $(back).focus({ preventScroll:true });
});
$("homeSolo").addEventListener("click", () => { if (menuTheme === "lugiapsy") pickOpen(); else { setPickFlow(false); goPlay(false); } });
$("pickBack").addEventListener("click", goHome);
// Depuis l'écran de Neo ouvert par Solo : « ← Menu » et Échap reviennent à la sélection du Pokémon
$("startBack").addEventListener("click", () => { if (pickFlow) { setPickFlow(false); pickOpen(); } }); // après le retour à l'accueil (fork-menu)
$("homeMulti").addEventListener("click", () => { setPickFlow(false); });
window.addEventListener("keydown", e => { if (e.code === "Escape" && state === "menu" && pickFlow) { e.stopImmediatePropagation(); setPickFlow(false); pickOpen(); } }, { capture:true });
$("pickGo").addEventListener("click", pickConfirm);
$("pickRegions").addEventListener("change", e => { pickRegion[e.target.dataset.r] = e.target.checked; pickBuild(); });
window.addEventListener("keydown", e => {
  if (state !== "pick" || e.target.tagName === "INPUT" && e.target.type !== "checkbox") return;
  const d = { ArrowLeft:"l", ArrowRight:"r", ArrowUp:"u", ArrowDown:"d" }[e.code];
  if (d) { e.preventDefault(); pickMove(d); }
  else if (e.code === "Enter" && document.activeElement && document.activeElement.classList.contains("pkCell")) { e.preventDefault(); pickConfirm(); }
  else if (e.code === "Escape") goHome();
});
(function pickPad(prev) { // manette : croix / stick dans la grille, A confirme, B retour
  const gp = [...(navigator.getGamepads ? navigator.getGamepads() : [])].find(g => g && g.connected); let now = {};
  if (gp && state === "pick") {
    const b = i => !!gp.buttons[i]?.pressed, ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
    now = { l:b(14) || ax < -.5, r:b(15) || ax > .5, u:b(12) || ay < -.5, d:b(13) || ay > .5, a:b(0), b:b(1) };
    for (const k of "lrud") if (now[k] && !prev[k]) pickMove(k);
    if (now.a && !prev.a) pickConfirm(); if (now.b && !prev.b) goHome();
  }
  requestAnimationFrame(() => pickPad(now));
})({});

// Écran du niveau en mode « pickFlow » : bouton qui lance la partie avec le Pokémon confirmé (à la place du carrousel)
const PICK_LAUNCH = document.createElement("div"); PICK_LAUNCH.className = "pickLaunch";
PICK_LAUNCH.innerHTML = `<button class="btn pickLaunchBtn" id="pickLaunch" type="button"><img id="pickLaunchPf" alt=""><span id="pickLaunchTxt"></span></button><button class="lvbtn" id="pickChange" type="button">Changer de Pokémon</button>`;
$("sCar").insertAdjacentElement("beforebegin", PICK_LAUNCH);
function pickLaunchLabel() {
  if (!pickCur) return;
  $("pickLaunchTxt").textContent = `▶ Jouer avec ${LINES[pickCur].names[0]}`; $("pickLaunchPf").src = (window.FORK_PORTRAITS || {})[DEX[pickCur][0]] || "";
}
$("pickLaunch").addEventListener("click", () => { if (pickFlow && pickCur && !pickLock(pickCur)) pickStarter(pickCur); });
$("pickChange").addEventListener("click", () => { setPickFlow(false); pickOpen(); });
