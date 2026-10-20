/* ---------- Écran titre ---------- */
const starterOrder = ["plante", "feu", "eau", "miaouss", "pika", "evoli", "draco", "mew", "germignon", "heri", "kaiminus"];
const previews = [], matchupEls = {}, levelBtns = [];
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
  for (const line in matchupEls) { const mu = LEVEL.matchup[line] || (LINES[line].own && LEVEL.matchup[LINES[line].type]) || ["Variable", "Métronome peut tirer n'importe quel type : chaque partie est une surprise."]; matchupEls[line].innerHTML = `<b>${mu[0]}</b> ${LEVEL.where}. ${mu[1]}`; }
  if (typeof NET !== "undefined" && NET.role === "host" && !NET.started) setTimeout(netLobby, 0);
  levelBtns.forEach((b, k) => { b.setAttribute("aria-pressed", String(k === i)); const lv = LEVELS[k]; b.hidden = (!!lv.secret && !levelOpen(k)) || (lv.region || "kanto") !== REGION; b.classList.toggle("lvlocked", !levelOpen(k)); b.textContent = `${levelOpen(k) ? "" : "🔒 "}${lvLabel(lv)} · ${lv.name}`; });
  for (const l in starterCardEls) starterCardEls[l].style.order = REGION === "johto" && LINES[l].own ? -1 : 0; // à Johto, ses starters en tête
  regionBtns.forEach(b => { b.hidden = !achs.win9; b.setAttribute("aria-pressed", String(b.dataset.r === REGION)); });
}
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
const starterCardEls = {};
function refreshLocks() {
  const cb = $("carBtn"); if (cb) cb.hidden = !achs.win8; // le Panthéon n'apparaît qu'après la victoire à la Ligue
  for (const line in starterCardEls) {
    const b = starterCardEls[line], a = ACHS.find(x => unlocks(x, line) && !achs[x.id]);
    b.classList.toggle("locked", !!a); b.querySelector(".lockInfo").textContent = a ? `🔒 Succès « ${a.name} » : ${a.desc}` : "";
    if (LINES[line].secret) b.hidden = !!a; // Mew : invisible tant qu'il n'est pas débloqué
  }
}
starterOrder.forEach((line, i) => {
  const L = LINES[line], b = document.createElement("button");
  b.className = "card"; b.type = "button"; b.style.setProperty("--c", TYPE_COLORS[L.type]);
  b.innerHTML = `<span class="key">${i+1}</span><canvas width="480" height="240"></canvas><div class="card-body"><h3>${L.names[0]} <span class="chip">${TYPE_NAMES[L.type]}</span></h3><p>${L.blurb}</p><p>Capacité : <b>${MOVES[L.move].name}</b> · ${L.evo || `évolue N.${EVO_LEVELS[0]} et N.${EVO_LEVELS[1]}`}</p><p class="lockInfo"></p><p class="matchup"></p></div>`;
  b.addEventListener("click", () => pickStarter(line));
  $("starterCards").appendChild(b); starterCardEls[line] = b;
  previews.push([b.querySelector("canvas"), line]);
  matchupEls[line] = b.querySelector(".matchup");
});
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
function drawPreviews(now) {
  if (state === "menu") for (const [c, line] of previews) {
    const g = c.getContext("2d"); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 480, 240);
    const sp = sheetFor(line, 0);
    drawMon(g, line, 240, sp ? 108 : 118 + Math.sin(now / 300) * 3, sp ? 40 : 54, false, now / 1000, 0, 1, true);
  }
  requestAnimationFrame(drawPreviews);
}
requestAnimationFrame(drawPreviews);

