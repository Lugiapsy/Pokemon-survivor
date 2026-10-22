
/* ---------- Fork (Lugiapsy) : menu pause (thème menu « Lugiapsy », partie solo hors ligne) ----------
   Fond de jeu flouté et assombri. Panneau PAUSE au centre : Reprendre, Capacités, Statistiques, Options, Quitter.
   « Capacités » ouvre la zone de droite (chaque capacité niveau par niveau : acquis en blanc, à venir en gris, + objets),
   « Statistiques » celle de gauche (portrait, PV, stats en cours de partie) ; le panneau glisse pour leur faire de la place.
   La pause de Neo (#pause) reste la référence : elle est seulement masquée et remplacée tant que ce menu est actif. */
const FP = document.createElement("div"); FP.id = "fpause"; FP.className = "fpOverlay"; FP.hidden = true;
FP.innerHTML = `<div class="fpRow">
  <section class="fpStats" id="fpStats" hidden></section>
  <div class="fpPanel" id="fpPanel"><h1>PAUSE</h1><div class="fpStage" id="fpStage"></div>
    <div class="fpBtns" id="fpBtns"><button class="fpBtn gold" id="fpResume" type="button">Reprendre</button><button class="fpBtn green" id="fpCapsBtn" type="button">Capacités</button>
      <button class="fpBtn blue" id="fpStatsBtn" type="button">Statistiques</button><button class="fpBtn grey" id="fpOptBtn" type="button">Options</button><button class="fpBtn red" id="fpQuit" type="button">Quitter</button></div>
    <div id="fpOptSlot"></div></div>
  <section class="fpCaps" id="fpCaps" hidden></section></div>`;
$("pause").insertAdjacentElement("afterend", FP);
const fpOn = () => typeof menuTheme !== "undefined" && menuTheme === "lugiapsy" && S && S.players.length === 1 && !NET.role;
function fpStatsRows(P) { // stats en cours de partie : mêmes formules que le jeu (grant, speed, AREA, hurtP, hitFoe…)
  const L = LINES[P.line], it = k => P.items[k] || 0, pct = (v, s = "+") => Math.round(v * 100) ? `${s}${Math.round(Math.abs(v) * 100)} %` : "–";
  const armor = [P.line === "draco" && "−10 %", (it("veste") + (shop.veste || 0)) && `−${it("veste") + (shop.veste || 0)}/coup`].filter(Boolean).join(" ");
  const xp = (1 + .08 * it("multiexp")) * (P.line === "evoli" ? 1.1 : 1) - 1, hpBonus = P.maxHp - L.hp, regBonus = .4 * it("restes");
  return [
    [["pvplus", "PV max", P.maxHp, hpBonus > 0 && `+${hpBonus}`], ["restes", "Régénération", P.regen ? `${(Math.round(P.regen * 10) / 10).toString().replace(".", ",")}/s` : "–", regBonus && `+${String(regBonus).replace(".", ",")}`],
     ["veste", "Armure", armor || "–"], ["rappel", "Rappel", P.revives || "–"]],
    [["carbone", "Attaque", pct(P.dmgMul - 1)], ["lentilscope", "Critique", pct(.05 * it("lentilscope") + .01 * (shop.lentil || 0) + (L.crit || 0))],
     ["vivegriffe", "Recharge", pct(1 - P.cdMul, "−")], ["depipe", "Projectiles", EXTRA() ? `+${EXTRA()}` : "–"]],
    [["mouchoir", "Vitesse", Math.round(speed())], ["loupe", "Zone", pct(AREA() - 1)], ["poudrevite", "Vit. projectiles", pct(PSPD() - 1)], ["lumargile", "Durée", pct(DUR() - 1)]],
    [["aimant", "Attraction", pct(.35 * it("aimant"))], ["multiexp", "Expérience", pct(xp)], ["miel", "Malédiction", pct(CURSE() - 1)], [null, "Relances", S.rerolls || "–"]],
  ];
}
function fpRender() {
  const P = S.P, L = LINES[P.line], pct = Math.max(0, P.hp / P.maxHp);
  $("fpStage").textContent = `${LEVEL.maps ? LEVEL.mapName : $("hudLevel").textContent.split(" · ")[0]} · ${$("hudTime").textContent}`;
  $("fpStats").innerHTML = `<div class="fpHead"><div class="fpPf"><img src="${fhPortrait(P)}" alt=""></div><div><b>${pName()}</b><span>N.${P.lvl}</span>
      <div class="fpHp"><i style="--p:${Math.round(pct * 100)}%"></i><span>${Math.ceil(P.hp)} / ${P.maxHp}</span></div></div></div>
    <div class="fpSt">${fpStatsRows(P).map(g => `<div class="fpGrp">${g.map(([ic, n, v, plus]) => `<div class="fpLine${v === "–" ? " off" : plus || /[+−]/.test(String(v)) ? " up" : ""}">${ic ? `<img src="${pickIcon(ic)}" alt="">` : `<span class="em">🎲</span>`}<span>${n}</span><span class="v">${v}${plus ? `<small>(${plus})</small>` : ""}</span></div>`).join("")}</div>`).join("")}</div>`;
  const mv = realMoves(P).map(([id, m]) => { const M = MOVES[id], max = M.max || 5, lines = [];
    for (let k = 1; k <= max; k++) { let d = ""; try { d = typeof M.desc === "function" ? M.desc(k) : ""; } catch (e) {} lines.push(`<li class="${k <= m.lv ? "on" : ""}"><b>${k}</b><span>${d || ""}</span></li>`); }
    return `<div class="fpMv" style="--t:${FH_BG[M.type] || "#2f6a3a"}"><div class="ic"><img src="${fhMoveIcon(id)}" alt=""></div><div><h4>${M.name} <em>N.${m.lv}/${max}</em></h4><ol>${lines.join("")}</ol></div></div>`; }).join("");
  const items = Object.entries(P.items).map(([id, lv]) => `<span class="fpIt"><img src="${fhItemIcon(id)}" alt="">${ITEMS[id] ? ITEMS[id].name : id} <em>${lv}/${(ITEMS[id] && ITEMS[id].max) || 5}</em></span>`).join("");
  $("fpCaps").innerHTML = `<h3>CAPACITÉS</h3><div class="fpMoves">${mv}</div>${items ? `<div class="fpItems">${items}</div>` : ""}`;
}
function fpZone(which, on) { const z = $(which === "caps" ? "fpCaps" : "fpStats"), b = $(which === "caps" ? "fpCapsBtn" : "fpStatsBtn"); z.hidden = !on; b.classList.toggle("on", on); }
function fpOptions(on) { // Options : le réglage de la pause de Neo (volume, auto-potion) est prêté au panneau le temps de l'affichage
  const opt = $("pauseOpt");
  if (on) { $("fpOptSlot").appendChild(opt); opt.hidden = false; $("fpBtns").hidden = true; $("pauseOptBack").focus({ preventScroll:true }); }
  else { $("pauseBtns").insertAdjacentElement("afterend", opt); opt.hidden = true; $("fpBtns").hidden = false; $("fpOptBtn").focus({ preventScroll:true }); }
}
let fpWas = false;
function fpSync() { // la pause de Neo s'ouvre/se ferme (Échap, bouton, manette) : ce menu suit, ouvert par défaut sur le seul panneau PAUSE
  const show = state === "pause" && fpOn();
  if (show && !fpWas) { fpZone("caps", false); fpZone("stats", false); fpRender(); if ($("fpOptSlot").contains($("pauseOpt"))) fpOptions(false); setTimeout(() => $("fpResume").focus({ preventScroll:true }), 0); }
  if (!show && fpWas && $("fpOptSlot").contains($("pauseOpt"))) fpOptions(false);
  if (show && !$("pause").hidden) $("pause").hidden = true; // seulement s'il est visible (sinon l'observateur de fork-menu referme les Options)
  FP.hidden = !show; fpWas = show;
}
(function fpLoop() { fpSync(); requestAnimationFrame(fpLoop); })();
const fpTogglePause = togglePause;
togglePause = () => { fpTogglePause(); fpSync(); };
$("fpResume").addEventListener("click", () => { if (state === "pause") togglePause(); });
$("fpCapsBtn").addEventListener("click", () => fpZone("caps", $("fpCaps").hidden));
$("fpStatsBtn").addEventListener("click", () => fpZone("stats", $("fpStats").hidden));
$("fpOptBtn").addEventListener("click", () => fpOptions(true));
$("pauseOptBack").addEventListener("click", () => { if ($("fpOptSlot").contains($("pauseOpt"))) fpOptions(false); });
$("fpQuit").addEventListener("click", () => $("quitBtn").click());
