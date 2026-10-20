/* ---------- Événements : Célébi, Ronflex, Jessie et James ---------- */
function startEvent(kind) {
  const P = S.P, mx = P.mvx || 1, my = P.mvy || 0;
  if (kind === "celebi") {
    const a = Math.random() * Math.PI * 2;
    S.celebi = { x:P.x + Math.cos(a) * 280, y:P.y + Math.sin(a) * 280, life:25, ph:Math.random() * 6 };
    banner("Un chant mystérieux résonne… Célébi est apparu ! Attrape-le avant qu'il disparaisse !"); sfx("ach");
  } else if (kind === "ronflex") {
    const f = spawnFoe("ronflex", P.x + mx * 360, P.y + my * 360); f.sleepT = 1e9;
    banner("Un Ronflex endormi bloque le passage ! Frappe-le pour le réveiller."); sfx("boss");
  } else if (kind === "rocket") {
    const base = Math.random() * Math.PI * 2;
    ["jarbok", "jsmogogo", "jmiaouss"].forEach((k, i) => { const a = base + i * 2.1; spawnFoe(k, P.x + Math.cos(a) * 380, P.y + Math.sin(a) * 380); });
    S.seq = [[S.t, "« Nous sommes de retour ! »"], [S.t + 1.6, "« Pour vous jouer un mauvais tour ! »"], [S.t + 3.2, "« Jessie ! » « James ! »"],
             [S.t + 4.8, "« La Team Rocket, plus rapide que la lumière ! »"], [S.t + 6.4, "« Rendez-vous tous, ou ce sera la guerre ! »"], [S.t + 8, "« Miaouss, oui la guerre ! »"]];
    sfx("boss");
  } else if (kind === "draco") {
    // il jaillit d'un étang proche et retombe sur la rive, côté joueur
    const ci = Math.floor(P.x / CH), cj = Math.floor(P.y / CH), ponds = [];
    for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) for (const pd of getChunk(ci + a, cj + b).ponds) { const d = Math.hypot(pd.x - P.x, pd.y - P.y); if (d > 260 && d < 900) ponds.push(pd); }
    const pd = ponds[Math.floor(Math.random() * ponds.length)], a0 = Math.random() * Math.PI * 2;
    const sx = pd ? pd.x : P.x + Math.cos(a0) * 420, sy = pd ? pd.y : P.y + Math.sin(a0) * 420, dd = Math.hypot(P.x - sx, P.y - sy) || 1, out = pd ? Math.max(pd.rx, pd.ry) + 45 : 0;
    S.dracoJump = { sx, sy, tx:sx + (P.x - sx) / dd * out, ty:sy + (P.y - sy) / dd * out, t:0 };
    banner("Plouf ! Un Minidraco jaillit d'un étang ! Rattrape-le avant qu'il s'échappe dans les herbes."); sfx("ach");
  } else if (kind === "journal") {
    S.journal = { n:0 }; journalNext();
    banner("Une page de journal traîne sur le sol… Il y en a d'autres dans le manoir : retrouve-les toutes !"); sfx("ach");
  } else if (kind === "mere") {
    const f = spawnFoe("mereossa", P.x + mx * 420, P.y + my * 420); S.mother = { t:300, f };
    banner(scopeOn() ? "« Partez… partez… » Le Scope Sylphe révèle le Spectre : c'est la Mère Ossatueur ! Apaise son esprit en le combattant."
                      : "« Partez… partez… » Un Spectre surgit ! Sans Scope Sylphe, impossible de le toucher : survis 5 minutes."); sfx("boss");
  }
}
// Spectre de la Mère Ossatueur : poursuit le joueur 5 min, lance des Ball'Ombre, puis s'apaise
function mewChoc(f, n) {
  const P = S.P, a0 = Math.atan2(P.y - f.y, P.x - f.x), m = f.d.cave ? 1.6 : 1;
  for (let i = 0; i < n; i++) { const a = a0 + (i - (n - 1) / 2) * .5; S.eshots.push({ x:f.x, y:f.y, vx:Math.cos(a) * 170, vy:Math.sin(a) * 170, dmg:16 * m, life:4.5, type:"psy", r:11, home:2.4, mew:true }); }
}
function mewRing(f, n, off) {
  const m = f.d.cave ? 1.6 : 1;
  for (let i = 0; i < n; i++) { const a = (i + off) / n * Math.PI * 2; S.eshots.push({ x:f.x, y:f.y, vx:Math.cos(a) * 175, vy:Math.sin(a) * 175, dmg:14 * m, life:4, type:"psy", r:10, mew:true }); }
}
function updateMother(dt) {
  const m = S.mother, f = m.f;
  if (!S.foes.includes(f)) { S.mother = null; return; }
  m.t -= dt;
  if (m.t <= 0) { f.calm = true; f.hp = 0; return; }
  f.wailT = (f.wailT ?? 3) - dt;
  if (f.wailT <= 0) {
    f.wailT = 3.2; const n = 10, off = Math.random();
    for (let i = 0; i < n; i++) { const a = (i + off) / n * Math.PI * 2; S.eshots.push({ x:f.x, y:f.y, vx:Math.cos(a) * 160, vy:Math.sin(a) * 160, dmg:10, life:4, type:"spectre", r:10 }); }
    S.texts.push({ x:f.x, y:f.y - f.r - 26, txt:"« Partez… »", col:"#cfc4ff", life:1.2, label:true });
  }
}
// Parc Safari : Noeunoeuf et Scarabrute traversent le parc en fuyant, la Dent d'Or du gardien
function updateSafari(dt) {
  const P = S.P;
  S.rareT = (S.rareT ?? 35 + Math.random() * 20) - dt;
  if (S.rareT <= 0 && !S.foes.some(f => f.d.rare)) {
    S.rareT = 50 + Math.random() * 30;
    const kind = Math.random() < .5 ? "noeunoeuf" : "scarabrute", a = Math.random() * Math.PI * 2;
    const f = spawnFoe(kind, P.x + Math.cos(a) * 330, P.y + Math.sin(a) * 330); f.life = 15;
    banner(`Un ${FOES[kind].name} sauvage traverse le parc ! Touche-le avant qu'il s'enfuie !`); sfx("ach");
  }
  const dj = S.dracoJump;
  if (dj) {
    dj.t += dt;
    if (dj.t >= .9) { // il touche terre : il ne retournera plus dans l'eau
      S.dracoJump = null; const f = spawnFoe("minidraco", dj.tx, dj.ty); f.life = 25;
      banner("Minidraco est très rapide : il te faudra de la vitesse ou une ruée (Cascade, Vive-Attaque) pour le toucher !");
      emit(dj.tx, dj.ty, 14, "eau", { sp:150, life:.5, r:3 });
    }
  }
}

function updateRare(f, dt) {
  const P = S.P, dx = f.x - P.x, dy = f.y - P.y, d = Math.hypot(dx, dy) || 1;
  f.life -= dt; f.hurt -= dt;
  if (d < f.r + P.r + (P.dashT > 0 ? 18 : 0)) { f.caught = true; f.hp = 0; return; } // une ruée (Cascade, Vive-Attaque) attrape plus large
  if (f.kind === "minidraco") { // très rapide : il faut un build vitesse (Mouchoir Choix) ou une ruée pour le rattraper
    f.sprint = (f.sprint ?? 3) - dt; if (f.sprint < -1) f.sprint = 3; // 3 s de sprint, 1 s de souffle
    if (f.sprint < 0 && Math.random() < dt * 6) S.texts.push({ x:f.x, y:f.y - 26, txt:"…", col:"#b9a4ff", life:.4, label:true });
  }
  if (f.life <= 0) { f.gone = true; f.hp = 0; banner(`${f.d.name} s'est enfui dans les hautes herbes…`); return; }
  // il fuit quand on s'approche, sinon il traverse le parc en zigzag
  const near = d < (f.kind === "minidraco" ? 210 : 240), w = Math.sin(S.t * 2 + f.ph) * .7;
  let ax = near ? dx / d : Math.cos(f.ph + S.t * .3 + w), ay = near ? dy / d : Math.sin(f.ph + S.t * .3 + w);
  if (!near && d > 420) { ax = -dx / d; ay = -dy / d; } // reste à portée
  const sp = f.kind === "minidraco" ? (near ? (f.sprint > 0 ? 215 : 115) : 100) : near ? 125 : 90;
  f.x += ax * sp * dt; f.y += ay * sp * dt; f.flip = ax < 0; f.dir = dirOf(ax, ay);
  collide(f, f.r, false);
  if (Math.random() < dt * 8) emit(f.x, f.y - f.r, 1, "electrik", { sp:30, life:.7, up:20, r:2 });
}
function rareCaught(f) {
  const P = S.P; sfx("evo");
  if (f.kind === "minidraco") {
    P.dmgMul *= 1.1; banner("Tu as attrapé Minidraco ! Il te confie une Écaille Draco : dégâts +10 % !"); teamAch("draco", P);
    S.gems.push({ x:f.x, y:f.y, pick:"chest" });
    for (let i = 0; i < 10; i++) S.gems.push({ x:f.x + (Math.random() - .5) * 110, y:f.y + (Math.random() - .5) * 80, v:4 });
  } else if (f.kind === "noeunoeuf") {
    banner("Tu as attrapé Noeunoeuf ! Ses six œufs éclatent en Bonbons Exp. !");
    for (let i = 0; i < 14; i++) S.gems.push({ x:f.x + (Math.random() - .5) * 110, y:f.y + (Math.random() - .5) * 80, v:5 });
    if (!S.nuz) { P.hp = Math.min(P.maxHp, P.hp + P.maxHp * .5); S.texts.push({ x:P.x, y:P.y - 30, txt:"+50 % PV", col:"#7fe08a", life:1.2, label:true }); }
  } else {
    banner("Tu as attrapé Scarabrute ! Il te laisse une Poké Ball…");
    S.gems.push({ x:f.x, y:f.y, pick:"chest" });
  }
  emit(f.x, f.y, 26, "electrik", { sp:220, life:.7, r:3 });
  S.fxs.push({ x:f.x, y:f.y, r:0, max:160, life:.45, col:"rgba(255,240,150," });
}
// Manoir : grilles de feu (on/off par les statues), pages du journal, réveil de Mewtwo
const JOURNAL = ["Page 1 : « 5 juillet. Guyane, Amérique du Sud. Nous avons découvert un nouveau Pokémon au cœur de la jungle. »",
  "Page 2 : « 10 juillet. Nous l'avons baptisé Mew. Sa puissance dépasse tout ce que nous connaissons. »",
  "Page 3 : « 6 février. Mew a donné naissance. Nous avons appelé le petit Mewtwo. »",
  "Page 4 : « 1er septembre. Mewtwo est bien trop puissant. Nous ne parvenons plus à le contrôler… »"];
function journalNext() {
  const P = S.P, j = S.journal; let x = P.x + 500, y = P.y;
  for (let k = 0; k < 40; k++) { const a = Math.random() * Math.PI * 2, dd = 480 + Math.random() * 380; x = P.x + Math.cos(a) * dd; y = P.y + Math.sin(a) * dd;
    if (!solidsNear(x, y).some(o => Math.hypot(o.x - x, o.y - y) < o.r + 30)) break; }
  j.x = x; j.y = y; j.ph = Math.random() * 6;
}
function segDist(px, py, f) { const ux = Math.cos(f.a), uy = Math.sin(f.a), k = Math.max(-f.len / 2, Math.min(f.len / 2, (px - f.x) * ux + (py - f.y) * uy)); return Math.hypot(px - f.x - ux * k, py - f.y - uy * k); }
function updateManor(dt) {
  const P = S.P;
  S.statueCd = (S.statueCd || 0) - dt;
  let inFire = false, onStatue = false;
  around(P.x, P.y, c => {
    if (!S.fireOff) for (const f of c.fires || []) if (segDist(P.x, P.y, f) < 14 + P.r * .5) inFire = true;
    for (const q of c.statues || []) if (Math.hypot(P.x - q.x, P.y - q.y) < 15 + P.r + 8) onStatue = true;
  }, 1);
  if (onStatue && S.statueCd <= 0) {
    S.statueCd = 2; S.fireOff = !S.fireOff; sfx("chest"); S.shake = .12;
    banner(S.fireOff ? "Clic ! La statue s'enfonce… les portes de feu s'éteignent." : "Clic ! La statue s'enfonce… les portes de feu se rallument !");
  }
  S.fireT = (S.fireT || 0) - dt;
  if (inFire && S.fireT <= 0 && P.inv <= 0) { S.fireT = .45; emit(P.x, P.y, 6, "feu", { sp:90, life:.4, up:40 }); if (hurtP(9 * eff("feu", [ptype()]) * (1 + S.t / 900))) return; }
  const j = S.journal;
  if (j && Math.hypot(j.x - P.x, j.y - P.y) < P.r + 20) {
    banner(JOURNAL[j.n]); sfx("xp"); j.n++;
    emit(j.x, j.y, 12, "normal", { sp:120, life:.5, r:2.5 });
    if (j.n < 4) journalNext();
    else { S.journal = null; S.mewAt = S.t + 5; S.seq = [[S.t + 2.5, "Le manoir tremble… Une pression psychique terrible envahit les couloirs !"]]; S.shake = .4; }
  }
  if (S.mewAt && S.t >= S.mewAt) {
    S.mewAt = 0; const a = Math.random() * Math.PI * 2, f = spawnFoe("mewtwo", P.x + Math.cos(a) * 320, P.y + Math.sin(a) * 320);
    f.hp = f.maxHp = Math.round((6000 + S.t * 8) * (1 + .6 * (S.players.length - 1))); f.atkT = 2; f.atkI = 0; sfx("boss"); S.shake = .5; S.mewtwo = f;
    for (const g of S.foes) if (g !== f && !g.d.boss && !g.prop && Math.hypot(g.x - f.x, g.y - f.y) < 650) { g.hp = 0; emit(g.x, g.y, 4, "psy", { sp:120, life:.4 }); } // onde psychique : il balaie les Pokémon autour
    banner("MEWTWO s'est libéré ! Le Pokémon génétique veut se venger des humains !");
    S.fxs.push({ x:f.x, y:f.y, r:0, max:400, life:.8, col:"rgba(220,140,255," }); emit(f.x, f.y, 40, "psy", { sp:300, life:.8, r:3.5 });
  }
}
function motherCalm(f) {
  const P = S.P; S.mother = null; sfx("evo");
  dexCount(f); // l'apaiser compte au Pokédex (catégorie Boss)
  banner(f.calm ? `Le Spectre s'apaise et s'évanouit… C'était la Mère Ossatueur. Elle te bénit avant de rejoindre son petit.`
                : "L'esprit de la Mère Ossatueur est apaisé. Elle te bénit avant de rejoindre son petit…");
  if (S.nuz) { for (let i = 0; i < 10; i++) S.gems.push({ x:f.x + (Math.random() - .5) * 90, y:f.y + (Math.random() - .5) * 70, v:4 }); } // Nuzlocke : pas de soin
  else { P.hp = P.maxHp; S.texts.push({ x:P.x, y:P.y - 30, txt:"PV restaurés !", col:"#7fe08a", life:1.4, label:true }); }
  if (!f.calm) for (let i = 0; i < 8; i++) S.gems.push({ x:f.x + (Math.random() - .5) * 80, y:f.y + (Math.random() - .5) * 60, v:4 });
  S.gems.push({ x:f.x, y:f.y, pick:"chest" });
  emit(f.x, f.y, 30, "spectre", { sp:200, life:1, up:40, r:3 });
  S.fxs.push({ x:f.x, y:f.y, r:0, max:320, life:.7, col:"rgba(200,190,255," });
}
function updateCelebi(dt) {
  const c = S.celebi, P = S.P, dx = c.x - P.x, dy = c.y - P.y, d = Math.hypot(dx, dy) || 1;
  c.life -= dt;
  if (d < P.r + 18) { // attrapé : Voyage Temporel
    S.celebi = null; sfx("evo"); banner("Célébi utilise Voyage Temporel ! Le temps s'arrête… et il te laisse un cadeau !");
    for (const f of S.foes) if (!f.d.boss && !f.prop) f.stunT = 5;
    S.gems.push({ x:P.x + 30, y:P.y, pick:"chest" }); emit(P.x, P.y, 30, "plante", { sp:260, life:.7, r:3.5 });
    S.fxs.push({ x:P.x, y:P.y, r:0, max:420, life:.6, col:"rgba(160,255,170," });
    return;
  }
  if (c.life <= 0) { S.celebi = null; banner("Célébi a disparu dans la forêt…"); return; }
  // il fuit quand on s'approche, sinon il tourne autour du joueur en restant visible
  const tx = d < 170 ? dx / d : -dy / d * .8 + dx / d * (d > 300 ? -.6 : .1), ty = d < 170 ? dy / d : dx / d * .8 + dy / d * (d > 300 ? -.6 : .1), sp = d < 170 ? 125 : 90;
  c.x += tx * sp * dt; c.y += ty * sp * dt;
  if (Math.random() < dt * 14) emit(c.x, c.y, 1, "plante", { sp:30, life:.8, up:20, r:2.2 });
}

