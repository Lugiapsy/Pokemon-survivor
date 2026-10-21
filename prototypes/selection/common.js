/* Prototypes de sélection du starter : données, sprites animés, navigation souris / clavier / manette.
   Les sprites viennent de ../../src/assets/sprites.js (window.PMD_SHEETS), chargé avant ce fichier. */
"use strict";
const TYPE_COLORS = { feu:"#f0803c", eau:"#5a9ef0", plante:"#72c94e", electrik:"#f6d13a", normal:"#c8bf98", dragon:"#7a5cf0", psy:"#f05888" };
const TYPE_NAMES = { feu:"Feu", eau:"Eau", plante:"Plante", electrik:"Électrik", normal:"Normal", dragon:"Dragon", psy:"Psy" };
const LOCK_MEWTWO = ["Pokémon fabuleux", "Vaincre Mewtwo au fond de la Caverne Azurée."];
const STARTERS = [
  { id:"plante", names:["Bulbizarre","Herbizarre","Florizarre"], dex:["0001","0002","0003"], type:"plante", hp:48, speed:150, regen:.4, move:"Tranch'Herbe",
    moveDesc:"Ses feuilles tournent autour de lui et fauchent tout ce qui s'approche.", talent:["Engrais", "Récupère 0,4 PV par seconde."], role:"Encaisse bien" },
  { id:"feu", names:["Salamèche","Reptincel","Dracaufeu"], dex:["0004","0005","0006"], type:"feu", hp:38, speed:165, dmg:1.1, move:"Flammèche",
    moveDesc:"Ses Flammèches visent seules l'ennemi le plus proche.", talent:["Brasier", "+10 % de dégâts."], role:"Rapide et fragile" },
  { id:"eau", names:["Carapuce","Carabaffe","Tortank"], dex:["0007","0008","0009"], type:"eau", hp:44, speed:155, cd:.92, move:"Pistolet à O",
    moveDesc:"Tire droit devant et transperce plusieurs ennemis.", talent:["Torrent", "Capacités rechargées 8 % plus vite."], role:"Équilibré" },
  { id:"miaouss", names:["Miaouss","Persian"], dex:["0052","0053"], type:"normal", hp:36, speed:175, crit:.1, move:"Combo-Griffe",
    moveDesc:"Lacère les ennemis proches de plusieurs coups à la suite.", talent:["Technicien", "+10 % de coups critiques."], role:"Très rapide",
    lock:["Jackpot !", "Gagner 1 000 ₽ au total grâce au Pokédex."] },
  { id:"pika", names:["Pichu","Pikachu","Raichu"], dex:["0172","0025","0026"], skins:[{ n:"Classique", dex:"0172" }, { n:"Troizépi", dex:"0172sp" }], type:"electrik", hp:38, speed:168, move:"Tonnerre",
    moveDesc:"La foudre saute d'ennemi en ennemi.", talent:["Statik", "Un ennemi qui le touche est paralysé 1 s."], role:"Rapide et nerveux",
    lock:["Ami des souris", "Vaincre 50 Pikachu (au total)."] },
  { id:"evoli", names:["Évoli"], evoNote:"Pyroli, Aquali, Phyllali ou Voltali au N.10", dex:["0133"], type:"normal", hp:42, speed:166, xp:.1, move:"Météores",
    moveDesc:"Lance des étoiles qui ne ratent jamais leur cible.", talent:["Adaptabilité", "+10 % d'expérience."], role:"Polyvalent",
    lock:["Team Rocket en déroute", "Terminer le Repaire Rocket et libérer l'Évoli prisonnier."] },
  { id:"draco", names:["Minidraco","Draco","Dracolosse"], dex:["0147","0148","0149"], type:"dragon", hp:42, speed:160, armor:.1, move:"Draco-Rage",
    moveDesc:"Crache une boule de flammes draconiques qui explose.", talent:["Multiécaille", "−10 % de dégâts reçus."], role:"Résistant",
    lock:["Chasseur de dragon", "Attraper le Minidraco pendant la chasse du Parc Safari."] },
  { id:"mew", names:["Mew"], evoNote:"n'évolue pas, se renforce N.10 et N.22", dex:["0151"], type:"psy", hp:50, speed:170, dmg:1.1, move:"Métronome 1",
    moveDesc:"Lance au hasard une attaque d'un autre starter.", talent:["Fabuleux", "+10 % de dégâts et de bons PV."], role:"Imprévisible", lock:LOCK_MEWTWO, secret:true },
  { id:"germignon", names:["Germignon","Macronium","Méganium"], dex:["0152","0153","0154"], type:"plante", region:"johto", hp:50, speed:152, move:"Feuillemagik",
    moveDesc:"Des feuilles qui vont chercher leur cible.", talent:["Feuille Garde", "Une aura soigne les alliés proches et ralentit les ennemis."], role:"Soutien", lock:LOCK_MEWTWO },
  { id:"heri", names:["Héricendre","Feurisson","Typhlosion"], dex:["0155","0156","0157"], type:"feu", region:"johto", hp:40, speed:172, move:"Roue de Feu",
    moveDesc:"Fonce en roulant dans un sillage de flammes.", talent:["Torche", "Courir rend ses attaques Feu jusqu'à 40 % plus fortes."], role:"Toujours en mouvement", lock:LOCK_MEWTWO },
  { id:"kaiminus", names:["Kaiminus","Crocrodil","Aligatueur"], dex:["0158","0159","0160"], type:"eau", region:"johto", hp:52, speed:158, move:"Mâchouille",
    moveDesc:"Mord les ennemis les plus proches, de plus en plus vite.", talent:["Sans Limite", "+15 % de dégâts au contact, chaque coup le soigne un peu."], role:"Corps-à-corps", lock:LOCK_MEWTWO },
];
// Prototype : tout est débloqué sauf Mew et Johto, pour montrer les deux états. ?tout dans l'adresse = tout débloqué
const ALL_OPEN = location.search.includes("tout");
const isLocked = s => !ALL_OPEN && (s.id === "mew" || s.region === "johto");
const evoText = s => s.evoNote || (s.names.length === 2 ? `${s.names[1]} au N.10` : `${s.names[1]} au N.10, ${s.names[2]} au N.22`);
// Statistiques, même calcul que l'écran de choix de Neo (valeur affichée, remplissage de la barre 0-1, bonus ?)
function stats(s) {
  return [
    { k:"pv",  n:"PV",       ic:"❤", v:s.hp, f:s.hp / 56 },
    { k:"atk", n:"Attaque",  ic:"⚔", v:Math.round(100 * (s.dmg || 1)), f:(s.dmg || 1) / 1.2, up:(s.dmg || 1) > 1 },
    { k:"vit", n:"Vitesse",  ic:"➤", v:s.speed, f:(s.speed - 135) / 45 },
    { k:"rch", n:"Recharge", ic:"⟳", v:Math.round(100 / (s.cd || 1)), f:(100 / (s.cd || 1) - 70) / 45, up:(s.cd || 1) < 1 },
    { k:"crt", n:"Critique", ic:"✦", v:`${Math.round(100 * (s.crit || 0))} %`, f:(s.crit || 0) / .2, up:!!s.crit },
    { k:"reg", n:"Régén.",   ic:"✚", v:String(s.regen || 0).replace(".", ","), f:(s.regen || 0) / .8, up:!!s.regen },
  ].map(x => ({ ...x, f:Math.max(.06, Math.min(1, x.f)) }));
}
// Achats du Marchand (mêmes effets que src/js/01-progression.js SHOP et 09-etat-partie.js mkPlayer)
const SHOP_MAX = { hp:10, dmg:10, spd:10, slot:2, reroll:5, rappel:1, depipe:1, loupe:10, veste:3, lentil:10 };
const SHOP_SIM = { aucun:{}, un:Object.fromEntries(Object.keys(SHOP_MAX).map(k => [k, 1])), max:{ ...SHOP_MAX } };
// Liste complète, par groupes, chaque stat avec l'objet du jeu qui l'augmente (icône ICONS[item]).
// v : valeur finale (départ du Pokémon + achats), buy : niveaux achetés au Marchand, "–" : rien
const pct = (v, sign = "+") => Math.round(v * 100) ? `${sign}${Math.round(Math.abs(v) * 100)} %` : "–";
function statsFull(s, sh = {}) {
  const L = k => sh[k] || 0, dmg = (s.dmg || 1) * (1 + .02 * L("dmg")) - 1, crit = (s.crit || 0) + .01 * L("lentil");
  const armor = [s.armor && `−${Math.round(s.armor * 100)} %`, L("veste") && `−${L("veste")}/coup`].filter(Boolean).join(" ");
  return [
    [{ n:"PV max", item:"pvplus", v:Math.round(s.hp * (1 + .02 * L("hp"))), buy:L("hp") },
     { n:"Régénération", item:"restes", v:s.regen ? `${String(s.regen).replace(".", ",")}/s` : "–" },
     { n:"Armure", item:"veste", v:armor || "–", buy:L("veste") }],
    [{ n:"Attaque", item:"carbone", v:pct(dmg), buy:L("dmg") },
     { n:"Critique", item:"lentilscope", v:pct(crit), buy:L("lentil") },
     { n:"Recharge", item:"vivegriffe", v:pct(s.cd ? 1 - s.cd : 0, "−") },
     { n:"Projectiles", item:"depipe", v:L("depipe") ? `+${L("depipe")}` : "–", buy:L("depipe") }],
    [{ n:"Vitesse", item:"mouchoir", v:Math.round(s.speed * (1 + .02 * L("spd"))), buy:L("spd") },
     { n:"Zone", item:"loupe", v:pct(.01 * L("loupe")), buy:L("loupe") },
     { n:"Vit. projectiles", item:"poudrevite", v:"–" },
     { n:"Durée", item:"lumargile", v:"–" }],
    [{ n:"Attraction", item:"aimant", v:"–" },
     { n:"Expérience", item:"multiexp", v:pct(s.xp || 0) },
     { n:"Malédiction", item:"miel", v:"–" },
     { n:"Rappel", item:"rappel", v:L("rappel") || "–", buy:L("rappel") },
     { n:"Relances", item:null, ic:"🎲", v:L("reroll") || "–", buy:L("reroll") }],
  ].map(g => g.map(x => ({ ...x, up:x.v !== "–" && (x.buy || /PV max|Vitesse/.test(x.n) ? !!x.buy : true) })));
}
const maxMoves = (sh = {}) => 4 + (sh.slot || 0);
const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(",");

/* ---------- Sprites PMD animés ---------- */
const IMG = {};
function sheet(id) {
  const sh = window.PMD_SHEETS && PMD_SHEETS[id]; if (!sh) return null;
  if (!IMG[id]) { const im = new Image(); im.src = sh.src; IMG[id] = { ...sh, img:im, total:sh.dur.reduce((a, b) => a + b, 0) }; }
  const s = IMG[id]; return s.img.complete && s.img.naturalWidth ? s : null;
}
const ROWS = { bas:0, basDroite:1, droite:2, hautDroite:3, haut:4, hautGauche:5, gauche:6, basGauche:7 };
// Ligne des pieds : dernière ligne non transparente de la 1re image (calculée une fois par Pokémon)
function footOf(sh) {
  if (sh.foot != null) return sh.foot;
  const c = document.createElement("canvas"); c.width = sh.fw; c.height = sh.fh; const g = c.getContext("2d");
  g.drawImage(sh.img, 0, 0, sh.fw, sh.fh, 0, 0, sh.fw, sh.fh); const d = g.getImageData(0, 0, sh.fw, sh.fh).data;
  let f = sh.fh - 1; while (f > 0 && ![...Array(sh.fw).keys()].some(x => d[(f * sh.fw + x) * 4 + 3] > 20)) f--;
  return sh.foot = f;
}
// Dessine l'image (row = direction) à l'échelle sc, pieds du Pokémon posés sur (x, y). moving : anime la marche
function drawMon(g, id, x, y, sc, row = 0, t = 0, moving = true, black = false) {
  const sh = sheet(id); if (!sh) return;
  let tick = moving ? Math.floor(t * 60) % sh.total : 0, f = 0;
  while (tick >= sh.dur[f]) { tick -= sh.dur[f]; f++; }
  g.save(); g.imageSmoothingEnabled = false; if (black) g.filter = "brightness(0)";
  g.drawImage(sh.img, f * sh.fw, row * sh.fh, sh.fw, sh.fh, Math.round(x - sh.fw * sc / 2), Math.round(y - (footOf(sh) + 1) * sc), sh.fw * sc, sh.fh * sc);
  g.restore();
}
// Une boucle d'animation pour tous les canvas de la page : chaque canvas a sa fonction de dessin
const DRAWERS = new Set();
(function loop(now) { for (const d of DRAWERS) d(now / 1000); requestAnimationFrame(loop); })(0);
function canvasFor(el, w, h, draw) {
  const c = el.tagName === "CANVAS" ? el : el.appendChild(document.createElement("canvas")); c.width = w; c.height = h;
  const g = c.getContext("2d"), d = t => { if (!c.isConnected) return DRAWERS.delete(d); g.clearRect(0, 0, w, h); draw(g, t); }; DRAWERS.add(d); return c;
}

/* ---------- Navigation : souris, clavier (flèches, Entrée, Échap), manette (croix, A, B) ---------- */
let NAV = null; // grille active ; clavier et manette sont branchés une seule fois
function gridNav(items, { onFocus, onConfirm, onBack }) {
  let cur = 0;
  const focus = i => { cur = (i + items.length) % items.length; items.forEach((el, k) => el.classList.toggle("sel", k === cur)); items[cur].focus({ preventScroll:true }); onFocus(cur); };
  const cols = () => { const top = items[0].offsetTop; let n = 0; for (const el of items) { if (el.offsetTop !== top) break; n++; } return Math.max(1, n); };
  // souris : le clic choisit la case (elle reste choisie quand la souris s'en va) ; on lance avec Confirmer, Entrée ou A
  items.forEach((el, k) => { el.tabIndex = 0; el.addEventListener("click", () => focus(k)); });
  const move = d => { if (d === "l") focus(cur - 1); if (d === "r") focus(cur + 1); if (d === "u") focus(Math.max(0, cur - cols())); if (d === "d") focus(Math.min(items.length - 1, cur + cols())); };
  NAV = { move, confirm:() => onConfirm(cur), back:onBack };
  focus(0); return NAV;
}
addEventListener("keydown", e => {
  if (!NAV) return;
  const m = { ArrowLeft:"l", ArrowRight:"r", ArrowUp:"u", ArrowDown:"d", KeyQ:"l", KeyA:"l", KeyD:"r", KeyZ:"u", KeyW:"u", KeyS:"d" }[e.code];
  if (m) { e.preventDefault(); NAV.move(m); } else if (e.code === "Enter" || e.code === "Space") { e.preventDefault(); NAV.confirm(); } else if (e.code === "Escape" || e.code === "Backspace") NAV.back();
});
(function pad(prev, rep) {
  const gp = [...(navigator.getGamepads ? navigator.getGamepads() : [])].find(Boolean); let now = {};
  if (gp && NAV) {
    const b = i => gp.buttons[i] && gp.buttons[i].pressed, ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
    now = { l:b(14) || ax < -.5, r:b(15) || ax > .5, u:b(12) || ay < -.5, d:b(13) || ay > .5, a:b(0), b:b(1) };
    for (const k of "lrud") if (now[k] && (!prev[k] || --rep < 0)) { NAV.move(k); rep = prev[k] ? 6 : 18; }
    if (now.a && !prev.a) NAV.confirm(); if (now.b && !prev.b) NAV.back();
  }
  requestAnimationFrame(() => pad(now, rep));
})({}, 0);
// Petit message en bas de l'écran (remplace le lancement réel dans le prototype)
function toast(html) {
  let t = document.getElementById("toast"); if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
  t.innerHTML = html; t.classList.remove("on"); void t.offsetWidth; t.classList.add("on");
}
