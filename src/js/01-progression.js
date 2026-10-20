// Pokédex : K.O. cumulés par Pokémon, sauvegardés dans le navigateur. Chaque palier donne un petit bonus permanent.
const DEX_TIERS = [10, 100, 1000, 10000], DEX_TIERS_BOSS = [1, 5, 25, 100];
const DEX_MONEY = [50, 100, 500, 1000], DEX_MONEY_BOSS = [50, 200, 500, 1000]; // Pokédollars par palier
let dexKills = {}, dexDirty = false;
try { dexKills = JSON.parse(localStorage.getItem("pokesurv-dex") || "{}") || {}; } catch (e) { dexKills = {}; }
function dexSave() { if (!dexDirty) return; dexDirty = false; try { localStorage.setItem("pokesurv-dex", JSON.stringify(dexKills)); } catch (e) {} cloudSoon(); }
const dexTiers = kind => FOES[kind]?.boss ? DEX_TIERS_BOSS : DEX_TIERS;
const dexLevel = kind => dexTiers(kind).filter(n => (dexKills[kind] || 0) >= n).length;
// Marchand : améliorations permanentes achetées avec les Pokédollars gagnés aux paliers du Pokédex
const SHOP = [
  { id:"hp",     name:"PV max",   per:"+2 %",  max:10, cost:() => 150 },
  { id:"dmg",    name:"Dégâts",   per:"+2 %",  max:10, cost:() => 150 },
  { id:"spd",    name:"Vitesse",  per:"+2 %",  max:10, cost:() => 150 },
  { id:"slot",   name:"Capacité supplémentaire", per:"+1 emplacement de capacité (5, puis 6)", max:2, cost:lv => lv ? 2000 : 1000 },
  { id:"scope",  name:"Scope Sylphe", per:"Révèle les Spectres de la Tour Pokémon : sans lui, ce sont des silhouettes « ??? » qui ne prennent que la moitié des dégâts.", max:1, once:true, cost:() => 500 },
  { id:"reroll", name:"Relances", per:"+1 relance des choix par partie", max:5, cost:lv => Math.min(300, 100 * (lv + 1)) }, // 100, 200, puis 300
];
let shop = {};
try { shop = JSON.parse(localStorage.getItem("pokesurv-shop") || "{}") || {}; } catch (e) { shop = {}; }
const scopeOn = () => !!shop.scope && !shop.scopeOff; // Scope Sylphe acheté et activé
const shopSave = () => { try { localStorage.setItem("pokesurv-shop", JSON.stringify(shop)); } catch (e) {} cloudSoon(); };
const shopCost = u => u.cost(shop[u.id] || 0);
function moneyEarned() {
  let m = 0;
  for (const kind in dexKills) if (FOES[kind]) { const pay = FOES[kind].boss ? DEX_MONEY_BOSS : DEX_MONEY; for (let i = 0; i < dexLevel(kind); i++) m += pay[i]; }
  return m;
}
// Succès : rapportent des Pokédollars, certains débloquent des starters
const ACHS = [
  { id:"pika50",  name:"Ami des souris",     desc:"Vaincre 50 Pikachu (au total).",                 reward:10, unlock:"pika" },
  { id:"money",   name:"Jackpot !",          desc:"Gagner 1 000 ₽ au total grâce au Pokédex.",      reward:10, unlock:"miaouss" },
  { id:"surv5",   name:"Premiers pas",       desc:"Tenir 5 minutes dans une partie.",               reward:10 },
  { id:"boss",    name:"Chasseur de géants", desc:"Vaincre un Pokémon géant.",                      reward:15 },
  { id:"nohit",   name:"Intouchable",        desc:"Vaincre un géant sans être touché pendant qu'il est là.", reward:40 },
  { id:"evo",     name:"Forme finale",       desc:"Atteindre l'évolution finale (N.22).",            reward:10 },
  { id:"move5",   name:"Maître des capacités", desc:"Monter une capacité au niveau 5.",             reward:10 },
  { id:"items6",  name:"Sac plein",          desc:"Avoir 6 objets dans la même partie.",            reward:20 },
  { id:"kills1k", name:"Hécatombe",          desc:"1 000 K.O. dans une seule partie.",              reward:30 },
  { id:"win1",    name:"Forêt traversée",    desc:"Terminer la Forêt de Jade.",                     reward:30 },
  { id:"win2",    name:"Mont Sélénite vaincu", desc:"Terminer le Mont Sélénite.",                   reward:50 },
  { id:"win3",    name:"Team Rocket en déroute", desc:"Terminer le Repaire Rocket et libérer l'Évoli prisonnier.", reward:70, unlock:"evoli" },
  { id:"win4",    name:"Esprits apaisés",    desc:"Terminer la Tour Pokémon.",                      reward:100 },
  { id:"win5",    name:"Maître du Safari",   desc:"Terminer le Parc Safari.",                       reward:100 },
  { id:"win6",    name:"Manoir exploré",     desc:"Terminer le Manoir Pokémon.",                    reward:100 },
  { id:"win7",    name:"Oiseau Légendaire",  desc:"Terminer le niveau Oiseau Légendaire (Île Écume, Centrale ou Route Victoire).", reward:150 },
  { id:"win8",    name:"Maître de la Ligue", desc:"Battre le Conseil 4 et le Champion de la Ligue Indigo.", reward:200 },
  { id:"win9",    name:"Pokémon fabuleux",   desc:"Vaincre Mewtwo au fond de la Caverne Azurée.",       reward:100, unlock:["mew", "germignon", "heri", "kaiminus"], secret:true },
  { id:"win10",   name:"Tour Chétiflor gravie", desc:"Terminer la Tour Chétiflor, premier niveau de Johto.", reward:100, secret:true },
  { id:"mewtwo",  name:"Pokémon génétique",  desc:"Repousser Mewtwo dans le Manoir Pokémon.",       reward:100 },
  { id:"legend",  name:"Légende vivante",    desc:"Vaincre Artikodin, Électhor ou Sulfura dans le niveau Oiseau Légendaire.", reward:100 },
  { id:"draco",   name:"Chasseur de dragon", desc:"Attraper le Minidraco pendant la chasse du Parc Safari.", reward:50, unlock:"draco" },
  { id:"nuzwin",  name:"Sans filet",         desc:"Terminer un niveau en mode Nuzlocke.",           reward:100 },
  { id:"shiny",   name:"Ça brille !",        desc:"Jouer avec un starter chromatique.",             reward:20 },
  { id:"spiky",   name:"Oreille en pointe",  desc:"Terminer un niveau avec Pichu Troizépi.",        reward:100 },
];
let achs = {};
try { achs = JSON.parse(localStorage.getItem("pokesurv-ach") || "{}") || {}; } catch (e) { achs = {}; }
const achMoney = () => ACHS.reduce((m, a) => m + (achs[a.id] ? a.reward : 0), 0);
const unlocks = (a, line) => [].concat(a.unlock || []).includes(line);
const unlockNames = a => [].concat(a.unlock).map(l => LINES[l].names[0]).join(", ").replace(/, ([^,]*)$/, " et $1");
const isUnlocked = line => !ACHS.some(a => unlocks(a, line) && !achs[a.id]);
function achGet(id) {
  if (achs[id]) return; const a = ACHS.find(x => x.id === id); if (!a) return;
  achs[id] = true; sfx("ach"); try { localStorage.setItem("pokesurv-ach", JSON.stringify(achs)); } catch (e) {} cloudSoon(); if (id === "win8" || id === "win9") { refreshLocks(); setLevel(LEVELS.indexOf(LEVEL)); }
  const msg = `🏆 Succès « ${a.name} » ! +${a.reward} ₽` + (a.unlock ? ` · ${unlockNames(a)} débloqué${[].concat(a.unlock).length > 1 ? "s" : ""} !` : "");
  if (typeof NET !== "undefined" && NET.role === "guest" && NET.started) { NET.earned += a.reward; NET.achMsgs.push(msg); } // invité : sa propre progression
  if (S && state !== "menu") { S.earned = (S.earned || 0) + a.reward; S.achMsgs = [...(S.achMsgs || []), msg]; S.texts.push({ x:S.P.x, y:S.P.y - 70, txt:msg, col:"#ffd84a", life:3, label:true }); }
  refreshLocks();
}
function teamAch(id, who) { // succès d'équipe (boss, Mewtwo…) : chaque joueur en ligne le reçoit sur sa partie
  if (!(NET.role === "host" && NET.started)) return achGet(id);
  if (!who || !who.remote) achGet(id);
  for (const g of NET.conns) if (!who || who.idx === g.idx) netTo(g, { t:"ach", id });
}
function achCheck(win) {
  if ((dexKills.pikachu || 0) >= 50) achGet("pika50");
  if (moneyEarned() >= 1000) achGet("money");
  if (!S || !S.players) return;
  const P = typeof NET !== "undefined" && NET.role === "guest" ? S.players[NET.idx] || S.P : typeof NET !== "undefined" && NET.role === "host" ? S.players[0] : S.P; // en ligne : son propre Pokémon
  if (!P || !P.moves) return;
  if (S.t >= 300) achGet("surv5");
  if (P.stage >= 2) achGet("evo");
  if (Object.values(P.moves).some(m => m.lv >= 5)) achGet("move5");
  if (Object.keys(P.items).length >= 6) achGet("items6");
  if (S.kills >= 1000) achGet("kills1k");
  if (P.shiny) achGet("shiny");
  if (win) { achGet("win" + LEVEL.num); if (P.spiky) achGet("spiky"); if (S.nuz) achGet("nuzwin"); }
}
function openAch() {
  $("achSub").textContent = `${ACHS.filter(a => achs[a.id]).length} / ${ACHS.length} succès · ${achMoney().toLocaleString("fr-FR")} ₽ gagnés`;
  $("achList").innerHTML = ACHS.filter(a => !a.secret || (a.id === "win10" ? achs.win9 : achs.win8)).map(a => `<div class="shopRow ${achs[a.id] ? "done" : "todo"}"><div><b>${achs[a.id] ? "🏆" : "🔒"} ${a.name}</b><small>${a.desc}${a.unlock ? ` Débloque ${unlockNames(a)}.` : ""}</small></div><span class="reward">${a.reward} ₽</span></div>`).join("");
  state = "ach"; $("start").hidden = true; $("ach").hidden = false; $("achClose").focus({ preventScroll:true });
}
function closeAch() { $("ach").hidden = true; $("home").hidden = false; state = "home"; }
/* Panthéon : temps de jeu, dégâts et K.O. de chaque starter, niveau par niveau (depuis la v128) */
let career = {}; try { career = JSON.parse(localStorage.getItem("pokesurv-career") || "{}") || {}; } catch (e) {}
const CAR_F = ["t", "dmg", "ko", "runs", "wins"];
function careerRecord(ps, win) {
  if (!S || S.t < 5 || !LEVEL || !LEVEL.num) return;
  const n = String(LEVEL.num);
  for (const p of ps) {
    if (!p || !LINES[p.line]) continue;
    const c = career[p.line] = career[p.line] || { lv:{} }; c.lv = c.lv || {};
    const l = c.lv[n] = c.lv[n] || {};
    l.t = (l.t || 0) + Math.round(S.t); l.dmg = (l.dmg || 0) + Math.round(dmgSum(p)); l.ko = (l.ko || 0) + (p.kos || 0);
    l.runs = (l.runs || 0) + 1; if (win) l.wins = (l.wins || 0) + 1;
    if ((p.stage || 0) >= (c.st || 0)) { c.st = p.stage || 0; if (p.eform) c.ef = p.eform; }
    c.at = Date.now();
  }
  try { localStorage.setItem("pokesurv-career", JSON.stringify(career)); } catch (e) {}
  cloudSoon();
}
function careerTot(c) { const o = {}; for (const f of CAR_F) o[f] = 0; for (const k in c.lv || {}) for (const f of CAR_F) o[f] += +c.lv[k][f] || 0; return o; }
const carName = (line, c) => c.ef && EEVEE[c.ef] ? EEVEE[c.ef].name : LINES[line].names[Math.min(c.st || 0, LINES[line].names.length - 1)];
const fmtH = t => t >= 3600 ? `${Math.floor(t / 3600)} h ${String(Math.floor(t % 3600 / 60)).padStart(2, "0")}` : fmt(t);
const nFr = v => Math.round(v).toLocaleString("fr-FR");
function openCareer() {
  if (!achs.win8) return;
  const lines = Object.keys(career).filter(k => LINES[k] && career[k].lv).map(k => [k, career[k], careerTot(career[k])]).filter(r => r[2].runs).sort((a, b) => b[2].t - a[2].t);
  const all = { t:0, ko:0, runs:0 }; for (const r of lines) { all.t += r[2].t; all.ko += r[2].ko; all.runs += r[2].runs; }
  $("carSub").textContent = lines.length ? `${lines.length} Pokémon utilisé${lines.length > 1 ? "s" : ""} · ${fmtH(all.t)} de jeu · ${nFr(all.ko)} K.O. · ${all.runs} partie${all.runs > 1 ? "s" : ""}`
    : "Aucune partie enregistrée pour l'instant : joue un niveau et ton Pokémon apparaîtra ici.";
  const nums = LEVELS.map(l => l.num);
  const labs = LEVELS.map(l => l.region === "johto" ? "J" + lvLabel(l) : "N" + l.num);
  $("carList").innerHTML = lines.map(([k, c, T], i) => {
    const cell = (n, f, fm) => { const l = c.lv[n]; return l && l.runs ? `<td>${fm(+l[f] || 0)}</td>` : `<td class="off">—</td>`; };
    const row = (lab, f, fm) => `<tr><td>${lab}</td>${nums.map(n => cell(String(n), f, fm)).join("")}<td class="tot">${fm(T[f])}</td></tr>`;
    return `<div class="carRow"><canvas id="carCv${i}" width="144" height="144"></canvas><div><b>${carName(k, c)}</b>`
      + `<small>${fmtH(T.t)} de jeu · ${nFr(T.dmg)} dégâts · ${nFr(T.ko)} K.O. · ${T.wins} victoire${T.wins > 1 ? "s" : ""} sur ${T.runs} partie${T.runs > 1 ? "s" : ""}</small>`
      + `<div class="carTbl"><table><thead><tr><th></th>${labs.map(n => `<th>${n}</th>`).join("")}<th class="tot">Total</th></tr></thead><tbody>`
      + row("Temps", "t", fmtH) + row("Dégâts", "dmg", nFr) + row("K.O.", "ko", nFr) + row("Victoires", "wins", v => `${v}`)
      + `</tbody></table></div></div></div>`;
  }).join("");
  let hof = []; try { hof = JSON.parse(localStorage.getItem("pokesurv-hof") || "[]"); } catch (e) {}
  $("carHof").innerHTML = Array.isArray(hof) && hof.length ? `<b>🏆 Records de la Ligue Indigo</b><ol>${hof.map(h => `<li>${netEsc(h.n)} · N.${h.lvl} · ${fmt(h.t)}</li>`).join("")}</ol>` : "";
  lines.forEach(([k, c], i) => { const g = $("carCv" + i).getContext("2d"); g.fillStyle = "rgba(246,200,69,.12)"; g.beginPath(); g.arc(72, 72, 66, 0, Math.PI * 2); g.fill(); drawMon(g, c.ef || k, 72, 70, 24, false, 0, c.st || 0, 0, false); });
  state = "career"; $("start").hidden = true; $("career").hidden = false; $("carClose").focus({ preventScroll:true });
}
function closeCareer() { $("career").hidden = true; $("start").hidden = false; state = "menu"; }
const money = () => moneyEarned() + achMoney() - (shop.spent || 0);
function openShop() {
  $("shopMoney").textContent = `${money().toLocaleString("fr-FR")} ₽`;
  $("shopList").innerHTML = SHOP.map(u => {
    const lv = shop[u.id] || 0, full = lv >= u.max, cost = shopCost(u);
    return `<div class="shopRow"><div><b>${u.name}</b><small>${u.once ? u.per : `${u.per} par rang · rang ${lv}/${u.max}`}</small><span class="pips">${"★".repeat(lv)}${"☆".repeat(u.max - lv)}</span></div>
      ${u.id === "scope" && full ? `<button class="btn small" type="button" data-scope aria-pressed="${scopeOn()}">${scopeOn() ? "Activé" : "Désactivé"}</button>` : `<button class="btn small${full ? "" : " price"}" type="button" data-buy="${u.id}" ${full || cost > money() ? "disabled" : ""}>${full ? (u.once ? "Acheté" : "Max") : `${cost} ₽`}</button>`}</div>`;
  }).join("");
  $("shopList").querySelector("[data-scope]")?.addEventListener("click", () => { // on/off du Scope Sylphe
    shop.scopeOff = !shop.scopeOff; shopSave(); openShop(); $("shopList").querySelector("[data-scope]")?.focus({ preventScroll:true });
  });
  for (const bt of $("shopList").querySelectorAll("[data-buy]")) bt.addEventListener("click", () => {
    const u = SHOP.find(x => x.id === bt.dataset.buy), cost = shopCost(u);
    if ((shop[u.id] || 0) >= u.max || cost > money()) return;
    shop[u.id] = (shop[u.id] || 0) + 1; shop.spent = (shop.spent || 0) + cost; shopSave(); openShop();
    $("shopList").querySelector(`[data-buy="${u.id}"]`)?.focus({ preventScroll:true });
  });
  if (state !== "shop") { state = "shop"; $("start").hidden = true; $("shop").hidden = false; $("shopClose").focus({ preventScroll:true }); }
}
function closeShop() { $("shop").hidden = true; $("home").hidden = false; state = "home"; refreshMoneyTag(); }
const refreshMoneyTag = () => { $("shopBtn").innerHTML = `<span>🏪</span>Magasin <small class="homeMoney">${money().toLocaleString("fr-FR")} ₽</small>`; };
function dexCount(f) {
  const k = f.kind, n = (dexKills[k] || 0) + 1; dexKills[k] = n; dexDirty = true;
  if (typeof NET !== "undefined" && NET.role === "host" && NET.started) (NET.dexQ ||= {})[k] = (NET.dexQ[k] || 0) + 1; // envoyé aux invités
  const i = dexTiers(k).indexOf(n);
  if (i >= 0) { const gain = (f.d.boss ? DEX_MONEY_BOSS : DEX_MONEY)[i]; S.earned = (S.earned || 0) + gain;
    S.texts.push({ x:S.P.x, y:S.P.y - 52, txt:`Pokédex : ${n} ${foeName(f.d)} ! +${gain} ₽`, col:"#f6c845", life:2.4, label:true }); }
}
const DEX_CW = 112, DEX_CH = 96, DEX_SC = 2; // case d'image du Pokédex et agrandissement commun
function dexBox(sh) { // rectangle réellement dessiné dans la 1re image (sans le vide autour), calculé une fois
  if (sh.bb) return sh.bb;
  const c = document.createElement("canvas"); c.width = sh.fw; c.height = sh.fh;
  const g = c.getContext("2d"); g.drawImage(sh.img, 0, 0, sh.fw, sh.fh, 0, 0, sh.fw, sh.fh);
  const d = g.getImageData(0, 0, sh.fw, sh.fh).data; let x0 = sh.fw, y0 = sh.fh, x1 = -1, y1 = -1;
  for (let y = 0; y < sh.fh; y++) for (let x = 0; x < sh.fw; x++) if (d[(y * sh.fw + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return sh.bb = x1 < 0 ? [0, 0, sh.fw, sh.fh] : [x0, y0, x1 - x0 + 1, y1 - y0 + 1];
}
function openDex() {
  const grid = $("dexGrid"); grid.innerHTML = "";
  $("dexSub").innerHTML = `Chaque palier de K.O. d'un Pokémon rapporte des Pokédollars à dépenser chez le Marchand : ${DEX_TIERS.map((n, i) => `${n} K.O. → ${DEX_MONEY[i]} ₽`).join(", ")}.<br>Boss : ${DEX_TIERS_BOSS.map((n, i) => `${n} → ${DEX_MONEY_BOSS[i]} ₽`).join(", ")}. Total gagné : ${moneyEarned().toLocaleString("fr-FR")} ₽.`;
  // Deux catégories : les Pokémon, triés par numéro de Pokédex, puis les boss (géants par numéro, Team Rocket, Ligue)
  const DEX_ROCKET = ["jarbok", "jsmogogo", "jmiaouss"], DEX_LEAGUE = ["lgLokhlass", "lgMacko", "lgEcto", "lgDraco", "lgAlaka"];
  const dexNum = (kind, d) => { const v = DEX[d.sprite || kind]; return parseInt(Array.isArray(v) ? v[0] : v, 10) || 9999; };
  const shown = Object.entries(FOES).filter(([kind, d]) => !(kind === "berrytree" || kind === "crackrock" || kind === "urn" || kind === "crate" || d.hideDex || (d.johto && !achs.win9)));
  const isBoss = kind => kind.startsWith("boss") || DEX_ROCKET.includes(kind) || DEX_LEAGUE.includes(kind);
  const byNum = (a, b) => dexNum(...a) - dexNum(...b);
  const sections = [["Pokémon", shown.filter(([k]) => !isBoss(k)).sort(byNum)],
    ["Boss", [...shown.filter(([k]) => k.startsWith("boss")).sort(byNum), ...[...DEX_ROCKET, ...DEX_LEAGUE].map(k => shown.find(([q]) => q === k)).filter(Boolean)]]];
  for (const [title, list] of sections) {
    grid.insertAdjacentHTML("beforeend", `<h3 class="dexSection">${title} <small>${list.filter(([k]) => dexKills[k]).length} / ${list.length}</small></h3>`);
    for (const [kind, d] of list) {
      const n = dexKills[kind] || 0, lv = dexLevel(kind), tiers = dexTiers(kind);
      const card = document.createElement("div"); card.className = "dexCard";
      const c = document.createElement("canvas"); c.width = DEX_CW; c.height = DEX_CH;
      const sh = sheetFor(d.sprite || kind, 0), g = c.getContext("2d"); g.imageSmoothingEnabled = false;
      if (sh) { // même agrandissement (x2) pour tous, sur le Pokémon découpé au plus près : les petits restent petits
        const [bx, by, bw, bh] = dexBox(sh), sc = Math.min(DEX_SC, (DEX_CW - 8) / bw, (DEX_CH - 8) / bh);
        if (!n) g.filter = "brightness(0)";
        g.drawImage(sh.img, bx, by, bw, bh, Math.round((DEX_CW - bw * sc) / 2), Math.round((DEX_CH - bh * sc) / 2), bw * sc, bh * sc); }
      card.appendChild(c);
      card.insertAdjacentHTML("beforeend", `<b>${n ? d.name : "???"}</b><span>${n} K.O.</span><span class="pips">${"★".repeat(lv)}${"☆".repeat(4 - lv)}</span><span class="next">${lv < 4 ? `Prochain palier : ${tiers[lv]}` : "Complet !"}</span>`);
      grid.appendChild(card);
    }
  }
  state = "dex"; $("start").hidden = true; $("dex").hidden = false; $("dexClose").focus({ preventScroll:true });
}
function closeDex() { $("dex").hidden = true; $("home").hidden = false; state = "home"; }
window.addEventListener("pagehide", dexSave);
ITEM_ICONS.superpotion = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA/klEQVRYhe2WMQ7CMAxFe5RcgSOwMjIyMvYaGVlzDMaujFyjIyMja4hdfuVaCQzEmWLpq1Ij9b24TZph6NWr1x/lnIsyzcExPpe8Jo65RAkcZ8953EY7iW9gKWAmQQ8N424Bk0QGTJku+/oCPPtrWBOOBxaR4CYCdL2fTyxAMEgQVMZEAOCNQGq/OVxKEBhwKYD7pgKQWFdACmZNXZm9t5fQSxGzbyKwgafg49MCFDMBfu8fAbQfAghETFaCXu85AaS6BHZCKSDhNHMtUV2ANiNucRKhSDjGmghoEO7pMROBXxJmHShJ5N69CVxK4N9QAjc5nunzYPNzYa9eteoNZdlbvNix9y4AAAAASUVORK5CYII="; // soin quand tout est au maximum
const itemIcon = (id, cls = "ico") => ITEM_ICONS[id] ? `<img class="${cls}" src="${ITEM_ICONS[id]}" alt="">` : "";
