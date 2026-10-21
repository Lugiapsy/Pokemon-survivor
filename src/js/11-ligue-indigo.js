// Ligue Indigo : enchaînement des salles, vent de la salle de Peter, attaques des boss
function updateLeague(dt) {
  const P0 = S.P, scl = 1 + S.t / 900;
  if (S.lgPh === "wild") {
    S.roomT += dt;
    if (S.roomT >= LEVEL.wild) {
      S.lgPh = "boss"; const q = nearP(S.cam.x, S.cam.y), a = Math.random() * Math.PI * 2;
      const f = S.lgBoss = S.boss = spawnFoe(LEVEL.boss, q.x + Math.cos(a) * 360, q.y + Math.sin(a) * 360); sfx("boss"); S.shake = .4; S.bossClean = true;
      if (f.d.alaka) f.hp = f.maxHp = Math.round((7000 + 12 * S.t) * (1 + .6 * (S.players.length - 1))); // le Champion : le boss le plus solide du jeu
      banner(LEVEL.roomIdx === 4 ? "Ton rival entre dans l'arène… « Alakazam, à toi ! »" : `${LEVEL.member} entre dans l'arène et envoie ${foeName(FOES[LEVEL.boss]).replace(/ d.*$/, "")} !`);
      playTrack("boss");
    }
  } else if (S.lgPh === "boss" && S.lgBoss && (S.lgBoss.hp <= 0 || !S.foes.includes(S.lgBoss))) { // boss battu : la salle se vide
    const bf = S.lgBoss; S.lgBoss = null;
    if (LEVEL.roomIdx === 4) { S.lgPh = "won"; S.lgT = 2.5; banner("Le Champion est battu ! Tu es le nouveau Maître de la Ligue Indigo !"); }
    else {
      S.lgPh = "clear"; S.lgT = 1.5;
      for (const g of S.foes) if (!g.prop && g !== bf && g.hp > 0) { emit(g.x, g.y, 5, "normal", { sp:100, life:.4 }); g.hp = 0; g.fled = true; }
      S.foes = S.foes.filter(g => g.prop || g === bf || g.hp > 0); // le boss garde sa Poké Ball S.eshots = []; S.gusts = []; S.gas = [];
      for (const g of S.gems) g.pull = true; // bonbons et Poké Ball du boss arrivent tout seuls
      banner(`${LEVEL.member} est battu${LEVEL.member === "Agatha" || LEVEL.member === "Olga" ? "e" : ""} ! Ramasse la Poké Ball, puis passe à la salle suivante.`);
    }
  } else if (S.lgPh === "won") { if ((S.lgT -= dt) <= 0) { S.lgPh = "done"; endGame(true); return true; } }
  else if (S.lgPh === "clear") {
    for (const g of S.gems) g.pull = true;
    S.lgT -= dt;
    if (S.lgT <= 0 && !S.gems.length && !S.chestQ.length && !S.players.some(p => p.pendingLv > 0 || p.pendingEvo)) { S.lgPh = "inter"; S.lgT = 8; openInter(); }
  } else if (S.lgPh === "inter" && NET.role === "host") { // en ligne : la salle suivante s'ouvre toute seule
    S.lgT -= dt; if (S.lgT <= 0) nextRoom();
  }
  if (LEVEL.windy) { // salle de Peter : bourrasques qui poussent tout le monde
    S.wind = S.wind || { t:4, on:0, a:0 };
    if (S.wind.on > 0) {
      S.wind.on -= dt; const vx = Math.cos(S.wind.a) * 95 * dt, vy = Math.sin(S.wind.a) * 95 * dt;
      for (const q of S.players) if (!q.down && !q.choosing && !flyP(q)) { q.x += vx; q.y += vy; }
      for (const f of S.foes) if (!f.d.boss && !f.prop) { f.x += vx * 1.3; f.y += vy * 1.3; }
    } else if ((S.wind.t -= dt) <= 0) { S.wind.t = 6 + Math.random() * 3; S.wind.on = 2.6; S.wind.a = Math.random() * Math.PI * 2; if (!S.saidWind) { S.saidWind = true; banner("Une bourrasque traverse la salle !"); } }
  }
  for (const f of S.foes) {
    const d = f.d;
    if (f.hp <= 0 || !(d.fist || d.hyper || d.alaka || d.shadowBall)) continue;
    const P = S.P = nearP(f.x, f.y), dx = P.x - f.x, dy = P.y - f.y, l = Math.hypot(dx, dy) || 1, a0 = Math.atan2(dy, dx), rage = f.hp < f.maxHp * .5;
    if (rage && !f.raged && (d.hyper || d.alaka)) { f.raged = true; banner(`${d.name} entre en rage ! Ses attaques redoublent !`); S.shake = .4; }
    if (d.fist) { // Mackogneur : Poing Karaté en rafale, puis Séisme autour de lui
      if (f.combo > 0) {
        f.comboT -= dt;
        if (f.comboT <= 0) {
          f.combo--; f.comboT = .18; const last = f.combo === 0;
          S.eclaws.push({ x:f.x, y:f.y, a:a0, side:f.combo % 2 ? 1 : -1, range:f.r + 80, life:.2, big:last });
          if (l < f.r + 85 && P.inv <= 0 && hurtP(d.dmg * (last ? .9 : .45) * eff("combat", [ptype()]) * scl)) return true;
        }
      } else if (!(f.mb > 0) && (f.cgT = (f.cgT ?? 1) - dt) <= 0 && l < f.r + 95 && f.dashMode !== "go") {
        f.combo = 4; f.comboT = .22; f.cgT = 2.2;
        if (!f.saidCG) { f.saidCG = true; banner(`${d.name} utilise Poing Karaté !`); }
      }
      f.qkT = (f.qkT ?? 5) - dt;
      if (!(f.mb > 0) && !(f.combo > 0) && f.qkT <= 0 && l < 520) { f.mb = f.mbMax = .9; f.mbR = 230; f.dashMode = null; if (!f.saidQ) { f.saidQ = true; banner(`${d.name} frappe le sol… Séisme, éloigne-toi !`); } }
      if (f.mb > 0) { f.hold = .1; f.mb -= dt; if (f.mb <= 0) {
        f.qkT = 6; const R = f.mbR; S.shake = .55; sfx("break");
        S.fxs.push({ x:f.x, y:f.y, r:0, max:R, life:.45, col:"rgba(220,170,110," }); emit(f.x, f.y, 34, "roche", { sp:R * 2.6, life:.55, r:4 });
        if (boomHit(f.x, f.y, R, 24, "combat")) return true;
        const off = Math.random(); for (let i = 0; i < 12; i++) { const a = (i + off) / 12 * Math.PI * 2; S.eshots.push({ x:f.x, y:f.y, vx:Math.cos(a) * 180, vy:Math.sin(a) * 180, dmg:13, life:3, type:"combat", r:10 }); }
      } }
    }
    if (d.shadowBall) { // Ectoplasma d'Agatha : en plus de ses anneaux de Ball'Ombre, des Ball'Ombre à tête chercheuse
      f.hbT = (f.hbT ?? 2) - dt;
      if (f.hbT <= 0 && l < 700) { f.hbT = 3.2; for (let i = -1; i <= 1; i++) S.eshots.push({ x:f.x, y:f.y, vx:Math.cos(a0 + i * .5) * 150, vy:Math.sin(a0 + i * .5) * 150, dmg:14, life:4.5, type:"spectre", r:11, home:2 }); }
    }
    if (d.hyper) { // Dracolosse de Peter : Ultralaser qui balaie la salle, et Draco-Rage en éventail
      f.lzT = (f.lzT ?? 4) - dt;
      if (!f.lz && f.lzT <= 0 && l < 760 && f.dashMode !== "go") { f.dashMode = null; f.lz = { ph:"aim", t:rage ? .7 : .95, a:a0, dmg:15, w:28, turn:rage ? .5 : .35, slow:0, type:"normal", dur:rage ? 1.6 : 1.3 }; if (!f.saidH) { f.saidH = true; banner(`${d.name} charge Ultralaser ! Sors de sa ligne de mire !`); } }
      if (f.lz) { if (laserTick(f, a0, dt)) return true; if (!f.lz) f.lzT = rage ? 4 : 5.5; }
      f.drT = (f.drT ?? 2.5) - dt;
      if (!f.lz && f.drT <= 0 && l < 700) { f.drT = rage ? 2.4 : 3.4; const n = rage ? 9 : 7; for (let i = 0; i < n; i++) { const a = a0 + (i - (n - 1) / 2) * .2; S.eshots.push({ x:f.x, y:f.y, vx:Math.cos(a) * 210, vy:Math.sin(a) * 210, dmg:15, life:3, type:"dragon", r:11 }); } if (!f.saidD) { f.saidD = true; banner(`${d.name} utilise Draco-Rage !`); } }
    }
    if (d.alaka) { // Alakazam du Champion : très rapide, Psyko, Téléport et Choc Mental
      if (f.ring2 > 0) { f.ring2 -= dt; if (f.ring2 <= 0) mewRing(f, rage ? 24 : 18, .5); }
      f.atkT = (f.atkT ?? 1.5) - dt;
      if (f.atkT <= 0) {
        const seq = ["psyko", "tele", "choc", "tele", "psyko", "choc"], atk = seq[(f.atkI = (f.atkI || 0) + 1) % seq.length];
        f.atkT = rage ? 1.25 : 1.8;
        if (atk === "psyko") { mewRing(f, rage ? 24 : 18, 0); f.ring2 = .35; if (!f.saidP) { f.saidP = true; banner("Alakazam utilise Psyko !"); } }
        else if (atk === "choc") { mewChoc(f, rage ? 5 : 3); if (!f.saidC) { f.saidC = true; banner("Alakazam utilise Choc Mental !"); } }
        else {
          S.fxs.push({ x:f.x, y:f.y, r:0, max:90, life:.3, col:"rgba(255,200,120," });
          const a = Math.random() * Math.PI * 2; f.x = P.x + Math.cos(a) * 220; f.y = P.y + Math.sin(a) * 220; f.appear = .25;
          S.fxs.push({ x:f.x, y:f.y, r:0, max:110, life:.35, col:"rgba(255,200,120," }); emit(f.x, f.y, 20, "psy", { sp:200, life:.5 });
          mewChoc(f, rage ? 4 : 2); if (!f.saidT) { f.saidT = true; banner("Alakazam utilise Téléport !"); }
        }
      }
    }
  }
  S.P = P0; return false;
}
function openInter() { // entre deux salles : soin complet, puis le joueur choisit quand entrer dans la salle suivante
  for (const q of S.players) { if (q.left) continue; q.down = false; q.revT = 0; q.hp = q.maxHp; q.inv = 1.5; q.slowT = q.parT = q.burnT = 0; }
  const nx = LEVEL.rooms[LEVEL.roomIdx + 1];
  sfx("heal");
  if (NET.role === "guest") return;
  $("lgTitle").textContent = `${LEVEL.member} est battu${LEVEL.member === "Agatha" || LEVEL.member === "Olga" ? "e" : ""} !`;
  $("lgSub").textContent = `Ton équipe est soignée. Salle suivante (${LEVEL.roomIdx + 2} sur 5) : ${nx.member === "le Champion" ? "le Champion" : nx.member + " (" + nx.mtype + ")"}. ${nx.tip}`;
  $("lgStats").innerHTML = statsHtml();
  if (NET.role === "host") { banner(`Salle suivante dans 8 s : ${nx.member} !`); return; }
  state = "inter"; $("lgInter").hidden = false; $("lgBtn").focus({ preventScroll:true });
}
function nextRoom() {
  if (!S || S.lgPh !== "inter") return;
  const k = LEVEL.roomIdx + 1; $("lgInter").hidden = true;
  setRoom(k); S.lgPh = "wild"; S.roomT = 0; S.nextRing = S.t + 60; S.wind = null;
  S.foes = []; S.eshots = []; S.gusts = []; S.gas = []; S.falls = []; S.sludge = []; S.gems = []; S.shots = []; S.parts = [];
  S.players.forEach((q, i) => { q.x = (i - (S.players.length - 1) / 2) * 44; q.y = START_Y; q.kbx = q.kby = 0; q.dashT = 0; q.ivx = q.ivy = 0; });
  S.cam = { x:0, y:START_Y };
  $("hudLevel").textContent = `${LEVEL.name} · Salle ${k + 1}/5 · ${LEVEL.member}` + (S.nuz ? " · 💀 Nuzlocke" : "");
  banner(`Salle ${k + 1} sur 5 : ${LEVEL.member === "le Champion" ? "le Champion" : LEVEL.member + " (" + LEVEL.mtype + ")"}. ${LEVEL.tip}`);
  playTrack(LEVEL.track); sfx("ach");
  if (NET.role === "host") netAll({ t:"room", k });
  if (state === "inter") { state = "play"; last = performance.now(); }
}
function drawLeagueOver(camX, camY, vw, vh, t) {
  if ((ARENA_PAL[LEVEL.theme] || {}).scary) { // Agatha : brume, flammes qui vacillent, yeux qui s'ouvrent dans l'ombre
    cx.save(); cx.globalCompositeOperation = "lighter";
    for (const o of arenaDecor()) glow(o.x, o.y - 20, 70 + 10 * Math.sin(t * 9 + o.y), "200,120,255", .22 + .1 * Math.sin(t * 13 + o.x));
    cx.restore();
    for (let k = 0; k < 7; k++) { const fx = camX + ((k * 397 + t * (18 + k * 4)) % (vw + 600)) - 300, fy = camY + vh * (.15 + .12 * k) + Math.sin(t * .5 + k) * 30;
      const gr = cx.createRadialGradient(fx, fy, 10, fx, fy, 260); gr.addColorStop(0, "rgba(40,20,60,.32)"); gr.addColorStop(1, "rgba(40,20,60,0)"); cx.fillStyle = gr; cx.fillRect(fx - 260, fy - 260, 520, 520); }
    const A = arena();
    for (let k = 0; k < 9; k++) { const ph = (t * .35 + k * .37) % 3; if (ph > 1) continue; const op = Math.sin(ph * Math.PI);
      const side = k % 3, ex = side === 0 ? A.x0 - 60 : side === 1 ? A.x1 + 60 : -800 + k * 190, ey = side === 2 ? A.y0 - 120 : A.y0 + 80 + ((k * 211) % (A.y1 - A.y0 - 160));
      cx.save(); cx.globalAlpha = op; cx.globalCompositeOperation = "lighter"; glow(ex, ey, 26, "255,60,90", .5); cx.restore();
      cx.save(); cx.globalAlpha = op; cx.fillStyle = "#ff4060"; for (const dx of [-9, 9]) { cx.beginPath(); cx.ellipse(ex + dx, ey, 5, 2.5 + op * 1.5, dx * .03, 0, Math.PI * 2); cx.fill(); } cx.restore(); }
  } // bourrasques de la salle de Peter
  const w = S.wind; if (!w || !(w.on > 0)) return;
  const a = Math.min(1, w.on * 2, (2.6 - w.on) * 3), ex = Math.cos(w.a), ey = Math.sin(w.a);
  cx.save(); cx.strokeStyle = `rgba(220,230,255,${.35 * a})`; cx.lineWidth = 2; cx.lineCap = "round";
  for (let k = 0; k < 26; k++) {
    const u = ((k * 0.381 + t * 1.6) % 1.2) - .1, v = (k * 0.618) % 1, len = 50 + (k % 4) * 25;
    const x = camX + (u - .5) * vw * 1.2 * (Math.abs(ex) > .3 ? 1 : 0) + (v - .5) * vw, y = camY + (v - .5) * vh + (u - .5) * vh * 1.2 * (Math.abs(ey) > .3 ? 1 : 0);
    cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + ex * len, y + ey * len); cx.stroke();
  }
  cx.restore();
}
