/* Prototypes de sélection de la carte : données des niveaux, progression simulée, sprites animés, navigation.
   Les sprites viennent de ../../src/assets/sprites.js (window.PMD_SHEETS), chargé avant ce fichier.
   Les images des lieux sont de vraies captures du jeu (capture.html). */
"use strict";
const REGIONS = [
  { id:"kanto", name:"Kanto", chap:"Chapitre 1", mascot:"0150", img:"img/lv1.jpg", col:"#e5483b", col2:"#f6c845",
    blurb:"La région des débuts : de la Forêt de Jade jusqu'au Plateau Indigo, sur les traces de Mewtwo.", starters:["0001", "0004", "0007"] },
  { id:"johto", name:"Johto", chap:"Chapitre 2", mascot:"0251", img:"img/lv10.jpg", col:"#d9a520", col2:"#c0c8d8", plan:8,
    blurb:"La région voisine, pleine de traditions : tours anciennes, Pokémon inédits et Pokémon légendaires.", starters:["0152", "0155", "0158"],
    lock:"Termine la Caverne Azurée pour ouvrir Johto." },
];
const LV = [
  { num:1, region:"kanto", name:"Forêt de Jade", img:"img/lv1.jpg", time:"10:00", kind:"Forêt",
    desc:"Une forêt touffue qui grouille d'insectes, d'oiseaux et de Pichu. Traverse-la jusqu'à Argenta.",
    mons:["0010", "0013", "0016", "0172", "0025", "0011", "0014", "0017", "0012", "0015", "0026", "0018"], boss:[["Dardargnan géant", "0015"], ["Roucarnage géant", "0018"]],
    event:["Celebi", "0251", "1 partie sur 3, Celebi traverse la forêt."] },
  { num:2, region:"kanto", name:"Mont Sélénite", img:"img/lv2.jpg", time:"10:00", kind:"Grotte",
    desc:"Une grotte obscure pleine de Nosferapti et de Racaillou. Gare aux éboulements des Grolem !",
    mons:["0041", "0074", "0046", "0173", "0027", "0035", "0042", "0075", "0047", "0028", "0036", "0076", "0169"], boss:[["Grolem géant", "0076"], ["Mélodelfe géant", "0036"]],
    event:["Ronflex", "0143", "Un Ronflex endormi peut bloquer le passage."] },
  { num:3, region:"kanto", name:"Repaire Rocket", img:"img/lv3.jpg", time:"10:00", kind:"Repaire",
    desc:"Sous le Casino de Céladopole, la Team Rocket cache son repaire. Attention aux Smogo qui explosent et aux flèches du sol.",
    mons:["0019", "0023", "0052", "0109", "0088", "0020", "0024", "0053", "0110", "0111", "0089"], boss:[["Arbok géant", "0024"], ["Persian de Giovanni", "0053"]],
    event:["Team Rocket", "0052", "Jessie, James et Miaouss peuvent surgir."] },
  { num:4, region:"kanto", name:"Tour Pokémon", img:"img/lv4.jpg", time:"10:00", kind:"Tour hantée",
    desc:"La tour hantée de Lavanville. Sans le Scope Sylphe, les Spectres restent des silhouettes impossibles à identifier.",
    mons:["0092", "0019", "0104", "0093", "0020", "0105", "0094"], boss:[["Spectrum géant", "0093"], ["Ectoplasma géant", "0094"]],
    event:["Mère Ossatueur", "0105", "Un esprit tourmenté erre dans la tour."] },
  { num:5, region:"kanto", name:"Parc Safari", img:"img/lv5.jpg", time:"10:00", kind:"Plein air",
    desc:"Les hautes herbes de Parmanie. Noeunoeuf et Scarabrute traversent parfois le parc en courant : attrape-les !",
    mons:["0029", "0032", "0102", "0054", "0113", "0030", "0033", "0111", "0103", "0128", "0123"], boss:[["Kangourex géant", "0115"], ["Tauros géant", "0128"]],
    event:["Minidraco", "0147", "1 partie sur 3, un Minidraco rare apparaît."] },
  { num:6, region:"kanto", name:"Manoir Pokémon", img:"img/lv6.jpg", time:"10:00", kind:"Ruines",
    desc:"Un manoir en ruines à Cramois'Île. Des statues ouvrent les portes de feu, et un journal secret est éparpillé dans les couloirs.",
    mons:["0037", "0058", "0088", "0077", "0109", "0020", "0038", "0089", "0078", "0126", "0059"], boss:[["Magmar géant", "0126"], ["Arcanin géant", "0059"]],
    event:["Journal du chercheur", "0150", "Retrouve toutes les pages pour découvrir ce qu'il cache."] },
  { num:7, region:"kanto", name:"Oiseau Légendaire", img:"img/lv7-a.jpg", time:"10:00", kind:"Carte au hasard",
    desc:"Trois cartes possibles, tirées au sort à chaque partie : l'Île Écume, la Centrale électrique ou la Route Victoire.",
    maps:[["Île Écume", "img/lv7-a.jpg", "0144"], ["Centrale électrique", "img/lv7-b.jpg", "0145"], ["Route Victoire", "img/lv7-c.jpg", "0146"]],
    mons:["0054", "0086", "0079", "0081", "0100", "0082", "0101", "0066", "0067", "0095", "0074", "0087"], boss:[["Artikodin", "0144"], ["Électhor", "0145"], ["Sulfura", "0146"]] },
  { num:8, region:"kanto", name:"Ligue Indigo", img:"img/lv8.jpg", time:"5 salles", kind:"Sans chrono",
    desc:"Le Conseil 4 puis le Champion : cinq salles à la suite, de plus en plus difficiles. Tu es soigné entre deux salles.",
    mons:["0090", "0120", "0072", "0066", "0056", "0106", "0107", "0092", "0093", "0147", "0129", "0142", "0130"], boss:[["Lokhlass d'Olga", "0131"], ["Mackogneur d'Aldo", "0068"], ["Ectoplasma d'Agatha", "0094"], ["Dracolosse de Peter", "0149"], ["Alakazam du Champion", "0065"]] },
  { num:9, region:"kanto", name:"Caverne Azurée", img:"img/lv9.jpg", time:"10:00", kind:"Niveau secret", secret:true,
    desc:"Au nord d'Azuria, une caverne réservée aux Maîtres de la Ligue. Mewtwo t'attend tout au fond.",
    mons:["0041", "0046", "0081", "0054", "0100", "0064", "0042", "0047", "0082", "0055", "0026", "0101", "0132", "0112"], boss:[["Électrode géant", "0101"], ["Rhinoféros géant", "0112"], ["Mewtwo", "0150"]] },
  { num:10, label:1, region:"johto", name:"Tour Chétiflor", img:"img/lv10.jpg", time:"10:00", kind:"Tour",
    desc:"À Mauville, une tour en bois qui oscille au rythme de son grand pilier. Les Sages y entraînent toute une lignée de Chétiflor.",
    mons:["0069", "0019", "0163", "0092", "0161", "0070", "0020", "0162", "0164", "0071"], boss:[["Chétiflor géant", "0069"], ["Boustiflor géant", "0070"], ["Empiflor géant", "0071"]],
    event:["Œuf de Togepi", "0175", "L'assistant du Prof. Orme te confie un Œuf."] },
];
const DEX_NAMES = { "0010":"Chenipan", "0013":"Aspicot", "0016":"Roucool", "0172":"Pichu", "0025":"Pikachu", "0011":"Chrysacier", "0014":"Coconfort", "0017":"Roucoups", "0012":"Papilusion",
  "0015":"Dardargnan", "0026":"Raichu", "0018":"Roucarnage", "0041":"Nosferapti", "0074":"Racaillou", "0046":"Paras", "0173":"Mélo", "0027":"Sabelette", "0035":"Mélofée", "0042":"Nosferalto",
  "0075":"Gravalanch", "0047":"Parasect", "0028":"Sablaireau", "0036":"Mélodelfe", "0076":"Grolem", "0169":"Nostenfer", "0019":"Rattata", "0023":"Abo", "0052":"Miaouss", "0109":"Smogo",
  "0088":"Tadmorv", "0020":"Rattatac", "0024":"Arbok", "0053":"Persian", "0110":"Smogogo", "0111":"Rhinocorne", "0089":"Grotadmorv", "0092":"Fantominus", "0104":"Osselait", "0093":"Spectrum",
  "0105":"Ossatueur", "0094":"Ectoplasma", "0029":"Nidoran♀", "0032":"Nidoran♂", "0102":"Noeunoeuf", "0054":"Psykokwak", "0113":"Leveinard", "0030":"Nidorina", "0033":"Nidorino",
  "0103":"Noadkoko", "0128":"Tauros", "0123":"Insécateur", "0037":"Goupix", "0058":"Caninos", "0077":"Ponyta", "0038":"Feunard", "0078":"Galopa", "0126":"Magmar", "0059":"Arcanin",
  "0086":"Otaria", "0079":"Ramoloss", "0081":"Magnéti", "0100":"Voltorbe", "0082":"Magnéton", "0101":"Électrode", "0066":"Machoc", "0067":"Machopeur", "0095":"Onix", "0087":"Lamantine",
  "0090":"Kokiyas", "0120":"Stari", "0072":"Tentacool", "0056":"Férosinge", "0106":"Kicklee", "0107":"Tygnon", "0147":"Minidraco", "0129":"Magicarpe", "0142":"Ptéra", "0130":"Léviator",
  "0064":"Kadabra", "0055":"Akwakwak", "0132":"Métamorph", "0112":"Rhinoféros", "0069":"Chétiflor", "0163":"Hoothoot", "0161":"Fouinette", "0070":"Boustiflor", "0162":"Fouinar",
  "0164":"Noarfang", "0071":"Empiflor", "0150":"Mewtwo", "0251":"Celebi", "0143":"Ronflex", "0175":"Togepi", "0144":"Artikodin", "0145":"Électhor", "0146":"Sulfura" };
const lvLabel = lv => lv.label || lv.num;
const regLevels = r => LV.filter(l => l.region === r);
// Johto : 8 étapes prévues, celles qui n'existent pas encore s'affichent « Bientôt »
const SOON = n => Array.from({ length:n }, (_, i) => ({ soon:true, num:"?", name:"Bientôt", region:"johto" }));
const regSlots = r => { const ls = regLevels(r), R = REGIONS.find(x => x.id === r); return R.plan ? ls.concat(SOON(R.plan - ls.length)) : ls; };

/* ---------- Progression simulée : ?p=debut (par défaut), ?p=milieu, ?p=tout ---------- */
const PROG = new URLSearchParams(location.search).get("p") || "debut";
const WINS = PROG === "tout" ? 10 : PROG === "milieu" ? 4 : 0; // nombre de niveaux terminés dans l'ordre
const isDone = lv => !lv.soon && lv.num <= WINS;
const isOpen = lv => !lv.soon && (lv.region === "johto" ? WINS >= 9 : lv.num <= WINS + 1);
const regOpen = r => r === "kanto" || WINS >= 9;
const unlockText = lv => lv.region === "johto" ? "Termine la Caverne Azurée" : `Termine ${LV[lv.num - 2].name}`;
const isHidden = lv => lv.secret && !isOpen(lv); // niveau secret : nom et image cachés tant qu'il est fermé
const shownName = lv => isHidden(lv) ? "???" : lv.name;
// Pokédex simulé : un Pokémon est « vu » si le niveau est terminé, ou un des 4 premiers du niveau ouvert en cours
const isSeen = (lv, i) => isDone(lv) || (isOpen(lv) && i < 4);
const best = lv => isDone(lv) ? { time:lv.time === "5 salles" ? "18:42" : "10:00", kos:[612, 845, 903, 1120, 977, 1204, 1310, 2208, 1486, 1032][lv.num - 1], lvl:[18, 21, 23, 24, 26, 27, 29, 34, 31, 22][lv.num - 1] } : null;

/* ---------- Sprites PMD animés ---------- */
const IMG = {};
function sheet(id) {
  const sh = window.PMD_SHEETS && PMD_SHEETS[id]; if (!sh) return null;
  if (!IMG[id]) { const im = new Image(); im.src = sh.src; IMG[id] = { ...sh, img:im, total:sh.dur.reduce((a, b) => a + b, 0) }; }
  const s = IMG[id]; return s.img.complete && s.img.naturalWidth ? s : null;
}
function footOf(sh) {
  if (sh.foot != null) return sh.foot;
  const c = document.createElement("canvas"); c.width = sh.fw; c.height = sh.fh; const g = c.getContext("2d");
  g.drawImage(sh.img, 0, 0, sh.fw, sh.fh, 0, 0, sh.fw, sh.fh); const d = g.getImageData(0, 0, sh.fw, sh.fh).data;
  let f = sh.fh - 1; while (f > 0 && ![...Array(sh.fw).keys()].some(x => d[(f * sh.fw + x) * 4 + 3] > 20)) f--;
  return sh.foot = f;
}
function drawMon(g, id, x, y, sc, row = 0, t = 0, moving = true, black = false) {
  const sh = sheet(id); if (!sh) return;
  let tick = moving ? Math.floor(t * 60) % sh.total : 0, f = 0;
  while (tick >= sh.dur[f]) { tick -= sh.dur[f]; f++; }
  g.save(); g.imageSmoothingEnabled = false; if (black) g.filter = "brightness(0)";
  g.drawImage(sh.img, f * sh.fw, row * sh.fh, sh.fw, sh.fh, Math.round(x - sh.fw * sc / 2), Math.round(y - (footOf(sh) + 1) * sc), sh.fw * sc, sh.fh * sc);
  g.restore();
}
const DRAWERS = new Set();
(function loop(now) { for (const d of DRAWERS) d(now / 1000); requestAnimationFrame(loop); })(0);
function canvasFor(el, w, h, draw) {
  const c = el.tagName === "CANVAS" ? el : el.appendChild(document.createElement("canvas")); c.width = w; c.height = h;
  const g = c.getContext("2d"), d = t => { if (!c.isConnected) return DRAWERS.delete(d); g.clearRect(0, 0, w, h); draw(g, t); }; DRAWERS.add(d); return c;
}
// Petit Pokémon animé (case de la liste « Pokémon rencontrés ») ; silhouette noire s'il n'a jamais été vu
function monIcon(dex, seen = true, size = 40, row = 0) {
  const s = document.createElement("span"); s.className = "mon" + (seen ? "" : " unseen"); s.title = seen ? DEX_NAMES[dex] || "" : "Pas encore vu";
  canvasFor(s, size, size, (g, t) => drawMon(g, dex, size / 2, size - 3, size / 40, row, t + dex.charCodeAt(3) * .37, seen, !seen));
  return s;
}

/* ---------- Navigation : souris, clavier (flèches, Entrée, Échap), manette (croix, A, B) ---------- */
let NAV = null;
// Liste à une dimension (les deux axes déplacent) ; locked(i) : la case se choisit mais ne se lance pas
function listNav(items, { onFocus, onConfirm, onBack, start = 0, cols = 1, side = {}, scroll = true }) { // side.l / side.r… : la direction appelle une fonction au lieu de bouger
  let cur = start;
  const focus = (i, user = true) => { cur = Math.max(0, Math.min(items.length - 1, i)); items.forEach((el, k) => el.classList.toggle("sel", k === cur));
    items[cur].focus({ preventScroll:true }); if (scroll) items[cur].scrollIntoView({ block:"nearest", inline:"nearest", behavior:user ? "smooth" : "auto" }); onFocus && onFocus(cur); };
  items.forEach((el, k) => { el.tabIndex = 0; el.addEventListener("click", () => { if (k === cur && el.classList.contains("sel")) NAV.confirm(); else focus(k); }); });
  const move = d => { if (side[d]) return side[d](); const c = typeof cols === "function" ? cols() : cols; focus(cur + ({ l:-1, r:1, u:-c, d:c })[d]); };
  NAV = { move, confirm:() => onConfirm && onConfirm(cur), back:() => onBack && onBack(), focus, get cur() { return cur; } };
  focus(start, false); return NAV;
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
function toast(html) {
  let t = document.getElementById("toast"); if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
  t.innerHTML = html; t.classList.remove("on"); void t.offsetWidth; t.classList.add("on");
}
function launch(lv) { toast(`▶ Lancement : <b>${lv.name}</b> avec Bulbizarre`); }
function refuse(lv) { toast(lv.soon ? "Ce niveau n'existe pas encore." : `🔒 ${unlockText(lv)} pour débloquer ce niveau.`); }

/* ---------- Barre des prototypes (en bas à droite) : autres prototypes et progression simulée ---------- */
const PROTOS = [["a-liste.html", "A"], ["b-carrousel.html", "B"], ["c-projecteur.html", "C"], ["d-cartouches.html", "D"], ["e-panneaux.html", "E"]];
addEventListener("DOMContentLoaded", () => {
  const nav = document.createElement("nav"); nav.className = "proto-nav"; const here = location.pathname.split("/").pop();
  nav.innerHTML = `<a href="index.html">☰</a>` + PROTOS.map(([f, n]) => `<a href="${f}?p=${PROG}"${f === here ? ' class="on"' : ""}>${n}</a>`).join("")
    + `<span class="sep"></span>` + [["debut", "Début"], ["milieu", "4 niveaux finis"], ["tout", "Tout fini"]].map(([p, n]) => `<a href="?p=${p}"${p === PROG ? ' class="on"' : ""}>${n}</a>`).join("");
  document.body.appendChild(nav);
});
