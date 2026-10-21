// Oiseau Légendaire : stalactites, barrières électriques, lave, gaz toxique et attaques spéciales des Pokémon de ses trois cartes
function updateMap7(dt) {
  const P0 = S.P, scl = 1 + S.t / 900;
  if (LEVEL.bird && !S.birdOut && S.t >= 300) spawnBird();
  if (LEVEL.ice && !LEVEL.league) { // Île Écume : des stalactites tombent du plafond, puis restent plantées comme obstacles
    S.icT = (S.icT ?? 5) - dt;
    if (S.icT <= 0) {
      S.icT = Math.max(1.1, 4.2 - S.t / 180) * (.6 + Math.random() * .8);
      const up = S.players.filter(p => !p.down), q = up[Math.floor(Math.random() * up.length)] || S.P;
      for (let n = S.t > 300 ? 2 : 1; n > 0; n--) {
        const a = Math.random() * Math.PI * 2, d = Math.random() < .35 ? Math.random() * 30 : 70 + Math.random() * 300;
        S.falls.push({ x:q.x + Math.cos(a) * d + (q.ivx || 0) * .5, y:q.y + Math.sin(a) * d + (q.ivy || 0) * .5, r:16 + Math.random() * 10, t:1.3, max:1.3, dmg:12, kind:"ice", life:22 + Math.random() * 8, ph:Math.random() * 6 });
      }
    }
  }
  for (const o of S.falls) {
    if (o.t > 0) { o.t -= dt; if (o.t <= 0) { // impact
      S.shake = Math.max(S.shake, o.kind === "rock" ? .45 : .12); sfx("break");
      S.fxs.push({ x:o.x, y:o.y, r:0, max:o.r * 1.8, life:.3, col:o.kind === "ice" ? "rgba(200,240,255," : "rgba(190,175,150," });
      emit(o.x, o.y, o.kind === "rock" ? 26 : 12, o.kind === "ice" ? "glace" : "roche", { sp:o.r * 5, life:.45, r:3 });
      if (boomHit(o.x, o.y, o.r * .9, o.dmg)) return true;
      for (const f of S.foes) if (!f.d.boss && !f.prop && !f.d.rare && (f.x - o.x) ** 2 + (f.y - o.y) ** 2 < (o.r + f.r) ** 2) { f.hp -= o.kind === "rock" ? 200 : 60; f.hurt = .12; }
    } }
    else o.life -= dt;
  }
  S.falls = S.falls.filter(o => o.life > 0);
  if (S.falls.length > 60) S.falls.splice(0, S.falls.length - 60);
  for (const q of S.players) {
    if (q.down || q.choosing || q.left) continue;
    S.P = q; const fly = flyP(q);
    if (q.burnT > 0) { // brûlure : petits dégâts réguliers
      q.burnT -= dt; if (Math.random() < dt * 12) emit(q.x + (Math.random() - .5) * q.r, q.y - q.r * .2, 1, "feu", { sp:30, life:.45, up:60, r:2.4 });
      q.brT = (q.brT || 0) - dt; if (q.brT <= 0) { q.brT = .5; if (q.inv <= 0 && hurtP(4 * scl)) return true; }
    }
    if (LEVEL.lava && !fly) { // Route Victoire : la lave brûle (moitié moins les Pokémon Feu et Dragon)
      q.inLava = false;
      around(q.x, q.y, c => { for (const lv of c.lava || []) { const dx = q.x - lv.x, dy = q.y - lv.y, cs = Math.cos(lv.rot), sn = Math.sin(lv.rot), u = dx * cs + dy * sn, v = -dx * sn + dy * cs; if ((u / lv.rx) ** 2 + (v / lv.ry) ** 2 < 1) q.inLava = true; } });
      if (q.inLava) {
        q.lavaT = (q.lavaT || 0) - dt; if (Math.random() < dt * 12) emit(q.x, q.y + q.r * .5, 1, "feu", { sp:30, life:.5, up:60, r:2.4 });
        if (q.lavaT <= 0) { q.lavaT = .5; if (q.inv <= 0) { if (!q.saidLava) { q.saidLava = true; S.texts.push({ x:q.x, y:q.y - q.r - 34, txt:"La lave brûle !", col:"#ff9a4a", life:1.2, label:true }); } if (hurtP(5 * (ptype() === "feu" || ptype() === "dragon" ? .5 : 1) * scl)) return true; } }
      }
    }
    if (LEVEL.plant && !fly) { // Centrale : barrière allumée → décharge, recul et paralysie
      for (const o of solidsNear(q.x, q.y)) {
        if (!o.gate || !gateOn(o.gate)) continue; const [d, px, py] = gateDist(q, o.gate);
        if (d < q.r * .7 + 12 && q.inv <= 0) { const dd = d || 1; q.kbx = (q.x - px) / dd * 520; q.kby = (q.y - py) / dd * 520; S.shake = .2; emit(q.x, q.y, 10, "electrik", { sp:180, life:.35 }); paralyze(q, .6); if (hurtP(8 * scl)) return true; }
      }
    }
    let gas = false; for (const g of S.gas) if ((q.x - g.x) ** 2 + (q.y - g.y) ** 2 < g.r * g.r) gas = true;
    if (gas) { q.gasT = (q.gasT || 0) - dt; if (q.gasT <= 0) { q.gasT = .5; if (q.inv <= 0 && hurtP(2.5 * scl)) return true; } }
  }
  for (const g of S.gas) { g.life -= dt; g.r += (g.max - g.r) * Math.min(1, dt * 1.5); }
  S.gas = S.gas.filter(g => g.life > 0);
  for (const f of S.foes) {
    const d = f.d;
    if (f.hp <= 0 || f.prop || f.sleepT > 0 || !(d.slowbro || d.iceBeam || d.bigSludge || d.megaBoom || d.cage || d.rockThrow || d.bird || (f.kind === "smogogo" && LEVEL.plant))) continue;
    const P = S.P = nearP(f.x, f.y), dx = P.x - f.x, dy = P.y - f.y, l = Math.hypot(dx, dy) || 1, a0 = Math.atan2(dy, dx);
    if (d.slowbro) { // Flagadoss géant : Choc Mental à tête chercheuse, Repos quand il faiblit
      if (f.rest > 0) {
        f.rest -= dt; f.hold = .1; f.hp = Math.min(f.maxHp, f.hp + f.maxHp * .075 * dt);
        if ((f.zT = (f.zT || 0) - dt) <= 0) { f.zT = .5; S.texts.push({ x:f.x + 20 + Math.random() * 20, y:f.y - f.r - 10, txt:"Z", col:"#2c5a96", life:1.2, label:true }); }
      } else {
        f.chT = (f.chT ?? 2.5) - dt;
        if (f.chT <= 0 && l < 800) { f.chT = 2.6; for (let i = -1; i <= 1; i++) S.eshots.push({ x:f.x, y:f.y, vx:Math.cos(a0 + i * .45) * 165, vy:Math.sin(a0 + i * .45) * 165, dmg:13, life:4, type:"psy", r:11, home:2.2 }); if (!f.said) { f.said = true; banner("Flagadoss géant utilise Choc Mental !"); } }
        f.restCd = (f.restCd ?? 0) - dt;
        if (f.hp < f.maxHp * .55 && f.restCd <= 0) { f.rest = 4; f.restCd = 20; banner("Flagadoss géant utilise Repos et se soigne ! Frappe-le avant qu'il se réveille !"); }
      }
    }
    if (d.iceBeam) { // Lamantine géant : Laser Glace (vise, puis balaie lentement ; ralentit) et éclats de glace
      f.lzT = (f.lzT ?? 3) - dt;
      if (!f.lz && f.lzT <= 0 && l < 750) { f.lz = { ph:"aim", t:1, a:a0, dmg:d.lzDmg }; if (!f.said) { f.said = true; banner(`${d.name} utilise Laser Glace ! Sors de sa ligne de mire !`); } }
      if (f.lz && laserTick(f, a0, dt)) return true;
      f.shT = (f.shT ?? 4.5) - dt;
      if (!f.lz && f.shT <= 0) { f.shT = 4.5; const off = Math.random(); for (let i = 0; i < 12; i++) { const a = (i + off) / 12 * Math.PI * 2; S.eshots.push({ x:f.x, y:f.y, vx:Math.cos(a) * 170, vy:Math.sin(a) * 170, dmg:d.shDmg || 11, life:4, type:"glace", r:9 }); } }
    }
    if (d.bigSludge) { // Grotadmorv géant : grosses traînées de poison et Bomb-Beurk
      f.trT = (f.trT ?? 0) - dt;
      if (f.trT <= 0) { f.trT = .14; if (S.sludge.length < 240) S.sludge.push({ x:f.x, y:f.y + f.r * .3, r:f.r * 1.05, life:9, max:9, ph:Math.random() * 6 }); }
      f.bbT = (f.bbT ?? 3) - dt;
      if (f.bbT <= 0 && l < 700) {
        f.bbT = 4;
        for (let i = 0; i < 5; i++) { const tx = P.x + (Math.random() - .5) * 240, ty = P.y + (Math.random() - .5) * 240, dd = Math.hypot(tx - f.x, ty - f.y) || 1, v = 260; S.eshots.push({ x:f.x, y:f.y, vx:(tx - f.x) / dd * v, vy:(ty - f.y) / dd * v, dmg:12, life:dd / v, type:"poison", r:10, puddle:true }); }
        if (!f.said) { f.said = true; banner("Grotadmorv géant laisse d'énormes traînées de poison et lance Bomb-Beurk !"); }
      }
    }
    if (d.megaBoom) { // Électrode géant : se charge, puis Explosion sur une très grande zone
      f.mbT = (f.mbT ?? 8) - dt;
      if (!(f.mb > 0) && f.mbT <= 0 && l < 700) { f.mb = f.mbMax = 2.4; f.dashMode = null; banner("Électrode géant se charge… Explosion imminente, éloigne-toi !"); sfx("boss"); }
      if (f.mb > 0) { f.hold = .1; f.mb -= dt; if (f.mb <= 0) {
        f.mbT = 12; const R = 340; S.shake = .7; sfx("break");
        S.fxs.push({ x:f.x, y:f.y, r:0, max:R, life:.55, col:"rgba(255,235,120," }); S.fxs.push({ x:f.x, y:f.y, r:0, max:R * .6, life:.35, col:"rgba(255,255,230," });
        emit(f.x, f.y, 50, "electrik", { sp:R * 3, life:.6, r:4.5 }); emit(f.x, f.y, 24, "feu", { sp:300, life:.45, r:4 });
        if (boomHit(f.x, f.y, R, 30)) return true;
        for (const g of S.foes) if (g !== f && !g.d.boss && !g.prop && !g.d.rare && Math.hypot(g.x - f.x, g.y - f.y) < R) { g.hp -= 150; g.hurt = .12; }
        f.hp = Math.max(1, f.hp - f.maxHp * .05); // Explosion le blesse un peu lui aussi
      } }
    }
    if (d.cage && !(f.mb > 0) && !(f.fuse > 0)) { // Cage-Éclair : paralyse
      f.cgT = (f.cgT ?? 2 + Math.random() * 3) - dt;
      if (f.cgT <= 0 && l < 460) {
        f.cgT = d.boss ? 3 : 5.5; const n = d.boss ? 3 : 1;
        for (let i = 0; i < n; i++) { const a = a0 + (i - (n - 1) / 2) * .35; S.eshots.push({ x:f.x, y:f.y, vx:Math.cos(a) * 200, vy:Math.sin(a) * 200, dmg:d.boss ? 11 : 8, life:3, type:"electrik", r:11, cage:true, para:1.1 }); }
        if (d.boss && !f.saidC) { f.saidC = true; banner("Électrode géant utilise Cage-Éclair : elle paralyse !"); }
      }
    }
    if (d.rockThrow && f.dashMode !== "go") { // Rhinoféros géant : lance un rocher géant qui reste planté
      f.rkT = (f.rkT ?? 4) - dt;
      if (f.rkT <= 0 && l < 800) { f.rkT = 6; S.falls.push({ x:P.x, y:P.y, r:62, t:1.6, max:1.6, dmg:30, kind:"rock", life:14, ph:Math.random() * 6 }); if (!f.said) { f.said = true; banner("Rhinoféros géant lance un rocher géant !"); } }
    }
    if (d.bird) { // Oiseau légendaire : attaque signature, Tornade, charge ; enragé sous 50 % de PV
      const rage = f.hp < f.maxHp * .5, nm = d.name, el = { ice:"glace", elec:"electrik", fire:"feu" }[d.bird];
      if (rage && !f.raged) { f.raged = true; banner(`${nm} entre en rage ! Ses attaques redoublent !`); S.shake = .4; }
      if (f.lz && laserTick(f, a0, dt)) return true;
      if (f.flame > 0) { // Lance-Flammes de Sulfura : peut brûler
        f.flame -= dt; f.hold = .1; f.flA += Math.sign(((a0 - f.flA + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * (rage ? 1.3 : .9) * dt;
        f.fsT = (f.fsT || 0) - dt;
        if (f.fsT <= 0) { f.fsT = .045; for (const o of rage ? [-.5, 0, .5] : [0]) { const a = f.flA + o + (Math.random() - .5) * .35, v = 320 + Math.random() * 90; S.eshots.push({ x:f.x + Math.cos(a) * 34, y:f.y + Math.sin(a) * 34, vx:Math.cos(a) * v, vy:Math.sin(a) * v, dmg:19, life:1.2, type:"feu", r:10, burn:4 }); } }
      }
      if (f.mb > 0) { f.hold = .1; f.mb -= dt; if (f.mb <= 0) { // Décharge d'Électhor : explosion électrique qui paralyse
        const R = f.mbR; S.shake = .6; sfx("break");
        S.fxs.push({ x:f.x, y:f.y, r:0, max:R, life:.5, col:"rgba(255,235,120," }); S.fxs.push({ x:f.x, y:f.y, r:0, max:R * .6, life:.3, col:"rgba(255,255,230," });
        emit(f.x, f.y, 50, "electrik", { sp:R * 3, life:.6, r:4.5 });
        for (const q of S.players) if (!q.down && !q.choosing && q.inv <= 0 && Math.hypot(q.x - f.x, q.y - f.y) < R + q.r * .6) { S.P = q; paralyze(q, 1.4); }
        if (boomHit(f.x, f.y, R, 40, "electrik")) return true; // Décharge : type Électrik
        const off = Math.random(); for (let i = 0; i < 8; i++) { const a = (i + off) / 8 * Math.PI * 2; S.eshots.push({ x:f.x, y:f.y, vx:Math.cos(a) * 190, vy:Math.sin(a) * 190, dmg:20, life:3.5, type:"electrik", r:11, cage:true, para:1.2 }); }
        for (const g of S.foes) if (g !== f && !g.d.boss && !g.prop && !g.d.rare && Math.hypot(g.x - f.x, g.y - f.y) < R) { g.hp -= 150; g.hurt = .12; }
      } }
      if (f.dashMode === "go") { // la charge laisse une traînée de glace, d'étincelles ou de flammes
        f.emT = (f.emT || 0) - dt;
        if (f.emT <= 0) { f.emT = .09; for (const sgn of [-1, 1]) S.eshots.push({ x:f.x, y:f.y, vx:-f.dy * sgn * 90 + (Math.random() - .5) * 40, vy:f.dx * sgn * 90 + (Math.random() - .5) * 40, dmg:d.bird === "ice" ? 6.5 : 9, life:2.2, type:el, r:8, slow:d.bird === "ice" ? 1.5 : 0, para:d.bird === "elec" ? .6 : 0, burn:d.bird === "fire" ? 2 : 0 }); }
      }
      const busy = f.lz || f.flame > 0 || f.mb > 0 || f.dashMode;
      if (!busy) f.atkT -= dt;
      if (!busy && f.atkT <= 0 && l < 900) {
        const seq = ["sig", "tornade", "dash", "sig", "dash", "tornade"]; let atk = seq[f.atkI++ % seq.length];
        if (atk === "sig" && d.bird !== "ice" && l > 420) atk = "dash"; // Décharge et Lance-Flammes : il fonce d'abord sur toi s'il est trop loin
        f.atkT = rage ? 1.3 : 2.1;
        if (atk === "sig") {
          if (d.bird === "ice") { f.lz = { ph:"aim", t:rage ? .75 : 1, a:a0, dmg:10.4, w:24, turn:rage ? .6 : .45, slow:3.5, dur:rage ? 2 : 1.6 }; if (!f.saidS) { f.saidS = true; banner("Artikodin utilise Laser Glace ! Il ralentit : sors de sa ligne de mire !"); } }
          else if (d.bird === "elec") { f.mb = f.mbMax = rage ? 1.1 : 1.4; f.mbR = rage ? 340 : 300; sfx("boss"); if (!f.saidS) { f.saidS = true; banner("Électhor se charge… Décharge ! Éloigne-toi ou tu seras paralysé !"); } }
          else { f.flame = rage ? 2.2 : 1.8; f.flA = a0; if (!f.saidS) { f.saidS = true; banner("Sulfura utilise Lance-Flammes ! Il peut te brûler !"); } }
        } else if (atk === "tornade") {
          for (const o of rage ? [-.7, -.35, 0, .35, .7] : [-.35, 0, .35]) S.gusts.push({ x:f.x, y:f.y, vx:Math.cos(a0 + o) * 160, vy:Math.sin(a0 + o) * 160, r:38, life:5, ph:Math.random() * 6, hitT:0, dmg:d.bird === "ice" ? 15.6 : 20, col:BIRD_COL[d.bird] });
          if (!f.saidT) { f.saidT = true; banner(`${nm} utilise Tornade !`); }
        } else { f.dashMode = "aim"; f.dashT = rage ? .55 : .8; if (!f.saidD) { f.saidD = true; banner(`${nm} fonce sur toi !`); } }
      }
    }
    if (f.kind === "smogogo" && LEVEL.plant) { // Smogogo : nuage de gaz toxique
      f.gsT = (f.gsT ?? 2 + Math.random() * 2) - dt;
      if (f.gsT <= 0 && l < 500) { f.gsT = 4.5; if (S.gas.length < 30) S.gas.push({ x:f.x, y:f.y, r:20, max:80, life:6, life0:6, ph:Math.random() * 6 }); }
    }
  }
  S.P = P0; return false;
}
