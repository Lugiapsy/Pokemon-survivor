/* ---------- Écran titre ---------- */
const starterOrder = ["plante", "feu", "eau", "miaouss", "pika", "evoli", "draco", "mew", "germignon", "heri", "kaiminus"];
const levelBtns = [];
$("lgBtn").addEventListener("click", nextRoom);
const levelOpen = i => i === 0 || !!achs[LEVELS[i].jFirst ? "win9" : "win" + i]; // un niveau se débloque en terminant le précédent (Johto : après la Caverne Azurée)
const lvLabel = lv => lv.label || lv.num;
let REGION = "kanto";
function setLevel(i) {
  if (!levelOpen(i)) { $("levelTag").textContent = `🔒 Termine ${LEVELS[i].jFirst ? "la Caverne Azurée" : LEVELS[i - 1].name} pour débloquer ${LEVELS[i].name}`; sfx("hurt"); return; }
  REGION = LEVELS[i].region || "kanto";
  if (LEVEL !== LEVELS[i]) { LEVEL = LEVELS[i]; chunkData.clear(); nearCache.clear(); liveChunks.clear(); motes.length = 0; }
  $("levelTag").textContent = `${REGION === "johto" ? "Johto · " : ""}Niveau ${lvLabel(LEVEL)} · ${LEVEL.name}`;
  $("levelIntro").textContent = LEVEL.intro;
  if (LEVEL.league) { let hof = []; try { hof = JSON.parse(localStorage.getItem("pokesurv-hof") || "[]"); } catch (e) {} if (Array.isArray(hof) && hof[0]) $("levelIntro").textContent += ` Record du Panthéon : ${hof[0].n}, ${fmt(hof[0].t)}.`; }
  if (typeof renderCar === "function") renderCar();
  if (typeof NET !== "undefined" && NET.role === "host" && !NET.started) setTimeout(netLobby, 0);
  levelBtns.forEach((b, k) => { b.setAttribute("aria-pressed", String(k === i)); const lv = LEVELS[k]; b.hidden = (!!lv.secret && !levelOpen(k)) || (lv.region || "kanto") !== REGION; b.classList.toggle("lvlocked", !levelOpen(k)); b.textContent = `${levelOpen(k) ? "" : "🔒 "}${lvLabel(lv)} · ${lv.name}`; });
  regionBtns.forEach(b => { b.hidden = !achs.win9; b.setAttribute("aria-pressed", String(b.dataset.r === REGION)); });
  regLbl.hidden = !achs.win9;
}
const regLbl = document.createElement("span"); regLbl.className = "regLbl"; regLbl.textContent = "Aventure"; regLbl.hidden = true; $("levelPick").appendChild(regLbl); // la région choisit les niveaux, pas les starters
const regionBtns = [["kanto", "🗾 Kanto"], ["johto", "🍃 Johto"]].map(([r, txt]) => { // choix de la région, une fois la Caverne Azurée gagnée
  const b = document.createElement("button"); b.type = "button"; b.className = "lvbtn regbtn"; b.dataset.r = r; b.textContent = txt; b.hidden = true;
  b.addEventListener("click", () => { if (r === REGION) return; const ks = LEVELS.map((lv, k) => k).filter(k => (LEVELS[k].region || "kanto") === r && levelOpen(k) && !(LEVELS[k].secret && !levelOpen(k))); setLevel(ks[ks.length - 1] ?? 0); });
  $("levelPick").appendChild(b); return b;
});
LEVELS.forEach((lv, i) => {
  const b = document.createElement("button"); b.type = "button"; b.className = "lvbtn";
  b.textContent = `${lvLabel(lv)} · ${lv.name}`; b.addEventListener("click", () => setLevel(i));
  $("levelPick").appendChild(b); levelBtns.push(b);
});
// Choix du starter : carrousel, fiche Stats et Attaques façon jeu Pokémon
const TALENTS = { plante:["Engrais", "récupère 0,4 PV par seconde."], feu:["Brasier", "+10 % de dégâts."], eau:["Torrent", "capacités rechargées 8 % plus vite."],
  pika:["Statik", "un ennemi qui le touche est paralysé 1 s."], evoli:["Adaptabilité", "+10 % d'expérience."], draco:["Multiécaille", "−10 % de dégâts reçus."],
  mew:["Fabuleux", "+10 % de dégâts et de bons PV."], miaouss:["Technicien", "+10 % de coups critiques."], germignon:["Feuille Garde", "une aura soigne les alliés proches et ralentit les ennemis."],
  heri:["Torche", "courir rend ses attaques Feu jusqu'à 40 % plus fortes."], kaiminus:["Sans Limite", "+15 % de dégâts au contact, chaque coup le soigne un peu."] };
const lineMoves = line => { // capacités que ce starter peut apprendre (même règle que buildChoices, tous stades confondus)
  const L = LINES[line], out = [];
  for (const [id, m] of Object.entries(MOVES)) {
    if (m.line && m.line !== line) continue;
    const alt = m.alt && m.alt.line === line, also = (m.also || []).includes(line);
    if (m.only && ![].concat(m.only).includes(L.type) && !alt && !also) continue;
    if (m.only && L.own && !also) continue;
    if (!m.only && !m.line) continue;
    out.push([id, m, alt]);
  }
  return out.sort((a, b) => (b[0] === L.move) - (a[0] === L.move) || (a[1].tier || 0) - (b[1].tier || 0) || !!a[1].rare - !!b[1].rare);
};
const carVisible = () => starterOrder.filter(l => !(LINES[l].secret && !isUnlocked(l))); // Mew et Johto : invisibles tant qu'ils ne sont pas débloqués
let carLine = starterOrder[0], ballAnim = null;
function carMove(d) {
  if (ballAnim) return; const v = carVisible(); let i = v.indexOf(carLine); if (i < 0) i = 0;
  carLine = v[(i + d + v.length) % v.length]; renderCar(); sfx("click");
  $("sGo").scrollIntoView({ block:"nearest", behavior:"smooth" }); // la fiche et le bouton restent à l'écran
}
function carGo(line) { if (!ballAnim && v_ok(line)) { carLine = line; renderCar(); } }
const v_ok = l => carVisible().includes(l);
function renderCar() {
  const v = carVisible(); if (!v.includes(carLine)) carLine = v[0];
  const line = carLine, L = LINES[line], i = v.indexOf(line), col = TYPE_COLORS[L.type], lock = ACHS.find(x => unlocks(x, line) && !achs[x.id]);
  const hex = col.replace("#", ""), rgb = [0, 2, 4].map(k => parseInt(hex.slice(k, k + 2), 16)).join(",");
  const car = $("sCar"); car.style.setProperty("--c", col); car.style.setProperty("--ca", rgb);
  const lum = rgb.split(",").reduce((a, v, k) => a + v * [.3, .59, .11][k], 0); car.querySelectorAll(".pkh").forEach(h => { h.style.color = lum > 170 ? "#2a2310" : "#fff"; h.style.textShadow = lum > 170 ? "none" : ""; }); // en-tête lisible sur le jaune
  const groups = [["Kanto", v.filter(l => !LINES[l].own)], ["Johto", v.filter(l => LINES[l].own)]].filter(g => g[1].length);
  $("sTabs").innerHTML = `<span class="lbl">Starters</span>` + (groups.length > 1 ? groups.map(([n, ls]) => `<button type="button" role="tab" data-g="${ls[0]}" aria-selected="${ls.includes(line)}">${n}<i>${ls.length}</i></button>`).join("") : "") + `<span class="cnt">${i + 1} / ${v.length}</span>`;
  $("sTabs").querySelectorAll("[data-g]").forEach(b => b.addEventListener("click", () => carGo(b.dataset.g)));
  $("sName").textContent = lock ? "???" : L.names[0]; $("sChip").textContent = TYPE_NAMES[L.type]; $("sChip").style.background = col;
  const mu = LEVEL.matchup[line] || (L.own && LEVEL.matchup[L.type]) || ["Variable", "Métronome peut tirer n'importe quel type : chaque partie est une surprise."];
  $("sMu").innerHTML = `<b>${mu[0]}</b> ${LEVEL.where}. ${mu[1]}`;
  $("sLock").hidden = !lock; $("sLock").textContent = lock ? `🔒 Succès « ${lock.name} » : ${lock.desc}` : "";
  $("sEvo").textContent = "N.1";
  const evo = line === "mew" ? "n'évolue pas, se renforce N.10 et N.22" : line === "evoli" ? "Pyroli, Aquali, Phyllali ou Voltali au N.10" : line === "miaouss" ? `${L.names[1]} au N.${EVO_LEVELS[0]}` : `${L.names[1]} au N.${EVO_LEVELS[0]}, ${L.names[2]} au N.${EVO_LEVELS[1]}`;
  const st = [["PV", L.hp, L.hp / 56, false], ["Attaque", Math.round(100 * (L.dmg || 1)), (L.dmg || 1) / 1.2, (L.dmg || 1) > 1],
    ["Vitesse", L.speed, (L.speed - 135) / 45, false], ["Recharge", Math.round(100 / (L.cd || 1)), (100 / (L.cd || 1) - 70) / 45, (L.cd || 1) < 1],
    ["Critique", `${Math.round(100 * (L.crit || 0))} %`, (L.crit || 0) / .2, !!L.crit], ["Régén.", String(L.regen || 0).replace(".", ","), (L.regen || 0) / .8, !!L.regen]];
  $("sStats").innerHTML = st.map(([n, val, f, up]) => `<div class="pst${up ? " up" : ""}"><span>${n}${up ? " ▲" : ""}</span><span class="v">${val}</span><div class="bb"><i style="width:${Math.round(Math.max(.06, Math.min(1, f)) * 100)}%"></i></div></div>`).join("");
  const t = TALENTS[line]; $("sTal").innerHTML = (t ? `<b>Talent · ${t[0]}</b> : ${t[1]}<br>` : "") + `<b>Évolution</b> : ${evo}`;
  const mv = lineMoves(line); $("sMvN").textContent = mv.length; $("sMoves").classList.toggle("many", mv.length > 7);
  $("sMoves").innerHTML = mv.map(([id, m, alt]) => { const d = m.desc(1).split(/(?<=\.) /)[0].replace(/\.$/, "");
    const tg = id === L.move ? `<span class="tg">Départ</span>` : m.rare ? `<span class="tg r">Rare N.${m.rare.minLvl}</span>` : alt ? `<span class="tg a">${L.names[m.alt.stage]}</span>` : m.tier ? `<span class="tg r" title="Proposé après Métronome ${m.tier - 1}">après M.${m.tier - 1}</span>` : "<span></span>";
    return `<div class="mv"><span class="ty" style="background:${TYPE_COLORS[m.type] || "#888"}">${TYPE_NAMES[m.type] || m.type}</span><div><b>${m.name}</b><small>${d}</small></div>${m.tier === 1 ? "<span></span>" : tg}</div>`; }).join("");
  $("sGo").disabled = !!lock; $("sGo").textContent = lock ? "🔒 Verrouillé" : `▶ Choisir ${L.names[0]}`;
  $("sBig").parentElement.classList.toggle("lk", !!lock);
  const side = (el, l) => { el.querySelector("b").textContent = isUnlocked(l) ? LINES[l].names[0] : "???"; el.classList.toggle("lk", !isUnlocked(l)); el.dataset.l = l; };
  side($("sPrev"), v[(i - 1 + v.length) % v.length]); side($("sNext"), v[(i + 1) % v.length]);
  $("sDots").innerHTML = v.map(l => `<i data-l="${l}" class="${l === line ? "on" : ""}" title="${isUnlocked(l) ? LINES[l].names[0] : "???"}"></i>`).join("");
  $("sDots").querySelectorAll("i").forEach(d => d.addEventListener("click", () => carGo(d.dataset.l)));
}
function refreshLocks() {
  const cb = $("carBtn"); if (cb) cb.hidden = !achs.win8; // le Panthéon n'apparaît qu'après la victoire à la Ligue
  renderCar();
}
// Validation : la Poké Ball (Master Ball pour Mew) tombe, tremble et s'ouvre, puis la partie démarre
function chooseStarter(line = carLine) {
  if (ballAnim || !isUnlocked(line) || state !== "menu") return;
  if (line !== carLine) { carLine = line; renderCar(); }
  ballAnim = { line, t0:performance.now(), master: line === "mew", opened:false }; sfx("chest");
}
$("sGo").addEventListener("click", () => chooseStarter());
$("sLeft").addEventListener("click", () => carMove(-1)); $("sRight").addEventListener("click", () => carMove(1));
$("sPrev").addEventListener("click", () => carMove(-1)); $("sNext").addEventListener("click", () => carMove(1));
$("sBig").addEventListener("click", () => chooseStarter());
{ let sx = null; const st = $("sCar"); // mobile : glisser pour changer de starter
  st.addEventListener("pointerdown", e => { sx = e.clientX; });
  st.addEventListener("pointerup", e => { if (sx !== null && Math.abs(e.clientX - sx) > 50) carMove(e.clientX < sx ? 1 : -1); sx = null; }); }
function drawBall(g, x, y, R, master, open, now) {
  g.save(); g.translate(x, y); g.lineWidth = R * .14; g.strokeStyle = "#1a1a1a";
  const top = master ? "#7a3fc8" : "#e8382c";
  g.save(); g.rotate(-open * 1.1); g.translate(0, -open * R * .5); // moitié haute qui bascule à l'ouverture
  g.beginPath(); g.arc(0, 0, R, Math.PI, 0); g.closePath(); g.fillStyle = top; g.fill(); g.stroke();
  g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.ellipse(-R * .42, -R * .55, R * .22, R * .12, -.6, 0, 7); g.fill();
  if (master) { // bosses roses et « M »
    g.fillStyle = "#f05ab4"; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * R * .58, -R * .52, R * .2, R * .16, s * .5, 0, 7); g.fill(); g.stroke(); }
    g.fillStyle = "#fff"; g.font = `bold ${R * .55}px "Pixelify Sans", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("M", 0, -R * .52);
  }
  g.restore();
  g.beginPath(); g.arc(0, 0, R, 0, Math.PI); g.closePath(); g.fillStyle = "#f4f4f0"; g.fill(); g.stroke();
  g.fillStyle = "#1a1a1a"; g.fillRect(-R, -R * .07, R * 2, R * .14);
  g.beginPath(); g.arc(0, 0, R * .3, 0, 7); g.fillStyle = "#f4f4f0"; g.fill(); g.stroke();
  g.beginPath(); g.arc(0, 0, R * .14, 0, 7); g.fillStyle = (now / 120 | 0) % 2 && !open ? "#ffe680" : "#fff"; g.fill();
  g.restore();
}
function drawPreviews(now) {
  if (state === "menu") {
    // Canvas à la taille affichée et sprite agrandi d'un nombre entier de fois (×4) : pixels nets et réguliers
    const c = $("sBig"), dpr = Math.min(2, Math.round(devicePixelRatio || 1)) || 1;
    if (c.width !== 280 * dpr) { c.width = 280 * dpr; c.height = 210 * dpr; }
    const g = c.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, 280, 210);
    const line = ballAnim ? ballAnim.line : carLine, sp = sheetFor(line, 0), MX = 140, MY = sp ? 142 : 140, MR = sp ? 28 : 46; // ×4
    if (!ballAnim) drawMon(g, line, MX, sp ? MY : MY + Math.sin(now / 300) * 3, MR, false, now / 1000, 0, 1, true);
    else {
      const t = (now - ballAnim.t0) / 1000, gy = 236, R = 34; g.save(); g.scale(.7, .7); // la Poké Ball est dessinée dans l'ancien repère 400×300
      if (t < .45) { const k = t / .45, y = 20 + (gy - 20) * k * k - (k > .8 ? Math.sin((k - .8) / .2 * Math.PI) * 18 : 0); drawBall(g, 200, y, R, ballAnim.master, 0, now); }
      else if (t < 1.25) { const k = (t - .45) / .8, wob = Math.sin(k * Math.PI * 3) * (1 - k) * .45; g.save(); g.translate(200, gy + R); g.rotate(wob); drawBall(g, 0, -R, R, ballAnim.master, 0, now); g.restore(); }
      else {
        if (!ballAnim.opened) { ballAnim.opened = true; sfx("evo"); }
        const k = Math.min(1, (t - 1.25) / .45);
        drawBall(g, 200, gy, R, ballAnim.master, Math.min(1, k * 2), now);
        g.save(); g.globalCompositeOperation = "lighter"; const fl = g.createRadialGradient(200, gy - 40, 0, 200, gy - 40, 40 + 160 * k);
        const fc = ballAnim.master ? "200,140,255" : "255,255,255"; fl.addColorStop(0, `rgba(${fc},${.9 * (1 - k)})`); fl.addColorStop(1, `rgba(${fc},0)`); g.fillStyle = fl; g.fillRect(0, 0, 400, 300); g.restore();
        g.restore(); g.save(); g.globalAlpha = k; g.translate(MX, MY); g.scale(.3 + .7 * k, .3 + .7 * k); g.translate(-MX, -MY); drawMon(g, line, MX, MY, MR, false, now / 1000, 0, 1, true); g.restore();
        if (t > 2.05) { const l = ballAnim.line; ballAnim = null; pickStarter(l); }
      }
      if (ballAnim && !ballAnim.opened) g.restore();
    }
    for (const id of ["sPrev", "sNext"]) {
      const el = $(id), l = el.dataset.l; if (!l) continue; const cc = el.querySelector("canvas"), gg = cc.getContext("2d"), sp2 = sheetFor(l, 0);
      if (cc.width !== 150 * dpr) { cc.width = 150 * dpr; cc.height = 112 * dpr; }
      gg.setTransform(dpr, 0, 0, dpr, 0, 0); gg.clearRect(0, 0, 150, 112); drawMon(gg, l, 75, sp2 ? 64 : 66, sp2 ? 14 : 30, false, now / 1000, 0, 1, true); // ×2
    }
  }
  requestAnimationFrame(drawPreviews);
}
setLevel(0);
achCheck(); refreshLocks();
// multijoueur local (2 à 4) : chaque joueur choisit son starter à tour de rôle
let NPL = 1, picks = [];
function mpHint() {
  const el = $("mpTag"); el.hidden = NPL === 1; if (NPL === 1) return;
  const g = padList().length, need = NPL - 1;
  el.textContent = `👥 Joueur ${picks.length + 1} sur ${NPL} : choisis ton starter` + (picks.length ? ` (déjà pris : ${picks.map(l => LINES[l].names[0]).join(", ")})` : "")
    + ` · J1 au clavier, ${NPL === 2 ? "J2" : `J2 à J${NPL}`} à la manette (${Math.min(g, NPL)}/${g >= NPL ? NPL : need} détectée${g > 1 ? "s" : ""}${g < need ? " : appuie sur un bouton de chaque manette" : ""})`;
}
function setPlayers(n) { NPL = n; picks = []; $("mpBtn").textContent = `👥 ${n} joueur${n > 1 ? "s" : ""}`; $("mpBtn").setAttribute("aria-pressed", String(n > 1)); mpHint(); }
// Mobile : plein écran (et paysage verrouillé si le navigateur le permet) au lancement d'une partie
const TOUCH = matchMedia("(pointer: coarse)").matches;
function goFull() {
  const d = document, el = d.documentElement, req = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!req || d.fullscreenElement || d.webkitFullscreenElement) return;
  try { const pr = req.call(el, { navigationUI:"hide" }); if (pr && pr.then) pr.then(() => screen.orientation?.lock?.("landscape").catch(() => {})).catch(() => {}); } catch (e) {}
}
if (TOUCH && (document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen)) {
  $("fsBtn").hidden = false; $("fsBtn").addEventListener("click", goFull);
}
function pickStarter(line) {
  if (!isUnlocked(line)) return;
  if (TOUCH) goFull();
  if (NET.role) return netPick(line);
  if (NPL === 1) return newGame(line);
  picks.push(line);
  if (picks.length < NPL) { mpHint(); return; }
  const p = picks; picks = []; mpHint(); newGame(p);
}
$("mpBtn").addEventListener("click", () => setPlayers(NPL % 4 + 1));
window.addEventListener("gamepadconnected", () => mpHint()); window.addEventListener("gamepaddisconnected", () => mpHint());
requestAnimationFrame(drawPreviews);

