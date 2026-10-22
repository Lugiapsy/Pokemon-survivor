
/* ---------- Fork (Lugiapsy) : menu pause (thème menu « Lugiapsy », partie solo hors ligne) ----------
   Fond de jeu flouté et assombri. Panneau PAUSE au centre : Reprendre, Capacités, Options, Quitter.
   « Capacités » ouvre les deux zones : à gauche les statistiques (portrait, PV, stats en cours de partie), à droite chaque
   capacité puis chaque objet niveau par niveau (acquis en blanc, à venir en gris) ; le panneau glisse pour leur faire de la place.
   La pause de Neo (#pause) reste la référence : elle est seulement masquée et remplacée tant que ce menu est actif. */
const FP = document.createElement("div"); FP.id = "fpause"; FP.className = "fpOverlay"; FP.hidden = true;
FP.innerHTML = `<div class="fpRow">
  <section class="fpStats" id="fpStats" hidden></section>
  <div class="fpPanel" id="fpPanel"><h1>PAUSE</h1><div class="fpStage" id="fpStage"></div>
    <div class="fpBtns" id="fpBtns"><button class="fpBtn gold" id="fpResume" type="button">Reprendre</button><button class="fpBtn green" id="fpCapsBtn" type="button">Capacités</button>
      <button class="fpBtn grey" id="fpOptBtn" type="button">Options</button><button class="fpBtn red" id="fpQuit" type="button">Quitter</button></div>
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
  const items = Object.entries(P.items).map(([id, lv]) => { const I = ITEMS[id] || { name:id, max:5 }, max = I.max || 5, lines = [];
    for (let k = 1; k <= max; k++) lines.push(`<li class="${k <= lv ? "on" : ""}"><b>${k}</b><span>${FP_ITEM_LV[id] ? FP_ITEM_LV[id](k) : I.desc || ""}</span></li>`);
    return `<div class="fpMv fpObj"><div class="ic"><img src="${fhItemIcon(id)}" alt=""></div><div><h4>${I.name} <em>N.${lv}/${max}</em></h4><ol>${lines.join("")}</ol></div></div>`; }).join("");
  $("fpCaps").innerHTML = `<h3>CAPACITÉS</h3><div class="fpMoves">${mv}</div>${items ? `<h3 class="fpObjH">OBJETS</h3><div class="fpMoves">${items}</div>` : ""}`;
}
// Objets : total obtenu à chaque niveau (mêmes formules que grant, speed, AREA… : Carbone, Vive Griffe et Orbe Vie se multiplient)
const fpN = v => String(Math.round(v * 10) / 10).replace(".", ","), fpMul = (f, k) => Math.round((Math.pow(f, k) - 1) * 100), fpDiv = (f, k) => Math.round((1 - Math.pow(f, k)) * 100);
const FP_ITEM_LV = {
  carbone:k => `Attaque +${fpMul(1.12, k)} %`, pvplus:k => `PV max +${20 * k} (et soigne 20 PV)`, aimant:k => `Attraction des Bonbons Exp. +${35 * k} %`,
  vivegriffe:k => `Recharge −${fpDiv(.92, k)} %`, mouchoir:k => `Vitesse +${8 * k} %`, restes:k => `Régénération ${fpN(.4 * k)} PV/s`,
  veste:k => `Dégâts subis −${k} par coup`, loupe:k => `Zone des capacités +${10 * k} %`, poudrevite:k => `Vitesse des projectiles +${12 * k} %`,
  lumargile:k => `Durée des effets +${12 * k} %`, lentilscope:k => `Coup critique +${5 * k} % (dégâts ×2)`, depipe:k => `+${k} projectile${k > 1 ? "s" : ""}`,
  multiexp:k => `Exp. gagnée +${8 * k} %`, rappel:k => `${k} Rappel${k > 1 ? "s" : ""} : ranime à 50 % des PV`,
  orbevie:k => `Attaque +${fpMul(1.04, k)} %, zone, vit. projectiles et durée +${3 * k} %, recharge −${fpDiv(.98, k)} % · contrecoup ${fpN(.4 * k)} % des PV/s`,
  miel:k => `Pokémon sauvages +${10 * k} % (vitesse, PV, nombre)`,
};
function fpZones(on) { $("fpCaps").hidden = $("fpStats").hidden = !on; $("fpCapsBtn").classList.toggle("on", on); } // Capacités : statistiques + capacités et objets
function fpOptions(on) { // Options : le réglage de la pause de Neo (volume, auto-potion) est prêté au panneau le temps de l'affichage
  const opt = $("pauseOpt");
  if (on) { $("fpOptSlot").appendChild(opt); opt.hidden = false; $("fpBtns").hidden = true; $("pauseOptBack").focus({ preventScroll:true }); }
  else { $("pauseBtns").insertAdjacentElement("afterend", opt); opt.hidden = true; $("fpBtns").hidden = false; $("fpOptBtn").focus({ preventScroll:true }); }
}
let fpWas = false;
function fpSync() { // la pause de Neo s'ouvre/se ferme (Échap, bouton, manette) : ce menu suit, ouvert par défaut sur le seul panneau PAUSE
  const show = state === "pause" && fpOn();
  if (show && !fpWas) { fpZones(false); fpRender(); if ($("fpOptSlot").contains($("pauseOpt"))) fpOptions(false); setTimeout(() => $("fpResume").focus({ preventScroll:true }), 0); }
  if (!show && fpWas && $("fpOptSlot").contains($("pauseOpt"))) fpOptions(false);
  if (show && !$("pause").hidden) $("pause").hidden = true; // seulement s'il est visible (sinon l'observateur de fork-menu referme les Options)
  FP.hidden = !show; fpWas = show;
}
(function fpLoop() { fpSync(); requestAnimationFrame(fpLoop); })();
const fpTogglePause = togglePause;
togglePause = () => { fpTogglePause(); fpSync(); };
$("fpResume").addEventListener("click", () => { if (state === "pause") togglePause(); });
$("fpCapsBtn").addEventListener("click", () => fpZones($("fpCaps").hidden));
$("fpOptBtn").addEventListener("click", () => fpOptions(true));
$("pauseOptBack").addEventListener("click", () => { if ($("fpOptSlot").contains($("pauseOpt"))) fpOptions(false); });
$("fpQuit").addEventListener("click", () => $("quitBtn").click());
