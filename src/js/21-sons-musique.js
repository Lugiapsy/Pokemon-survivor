/* ---------- Sons et musique (Web Audio, tout est synthétisé : aucun fichier) ---------- */
const AU = { ctx:null, master:null, music:null, sfx:null, muted:false, vol:1, track:null, step:0, next:0, timer:null, last:{} };
try { AU.muted = localStorage.getItem("pokesurv-mute") === "1"; const v = parseFloat(localStorage.getItem("pokesurv-vol")); if (v >= 0 && v <= 1) AU.vol = v; } catch (e) {} // vol : volume général de 0 à 1 (Options)
function auInit() {
  if (AU.ctx) { if (AU.ctx.state === "suspended") AU.ctx.resume(); return; }
  try {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    AU.ctx = new C(); AU.master = AU.ctx.createGain(); AU.master.gain.value = AU.muted ? 0 : .7 * AU.vol; AU.master.connect(AU.ctx.destination);
    AU.music = AU.ctx.createGain(); AU.music.gain.value = .13; AU.music.connect(AU.master);
    AU.sfx = AU.ctx.createGain(); AU.sfx.gain.value = .3; AU.sfx.connect(AU.master);
    const len = AU.ctx.sampleRate * .5, buf = AU.ctx.createBuffer(1, len, AU.ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    AU.noise = buf;
  } catch (e) { AU.ctx = null; }
}
const midi = n => 440 * Math.pow(2, (n - 69) / 12);
function tone(f, dur, type = "square", vol = .3, slide = 0, at = 0, out = AU.sfx) {
  if (!AU.ctx) return; const t = (at || AU.ctx.currentTime) + .005;
  const o = AU.ctx.createOscillator(), g = AU.ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + .02);
}
function noise(dur, vol = .3, at = 0, hp = 800, out = AU.sfx) {
  if (!AU.ctx || !AU.noise) return; const t = (at || AU.ctx.currentTime) + .005;
  const src = AU.ctx.createBufferSource(), f = AU.ctx.createBiquadFilter(), g = AU.ctx.createGain();
  src.buffer = AU.noise; f.type = "highpass"; f.frequency.value = hp;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
  src.connect(f); f.connect(g); g.connect(out); src.start(t); src.stop(t + dur + .02);
}
const arp = (notes, gap, type = "square", vol = .25, len = .12) => { if (!AU.ctx) return; const t0 = AU.ctx.currentTime; notes.forEach((n, i) => tone(midi(n), len, type, vol, 0, t0 + i * gap)); };
const SFX = {
  hit:   [.05, () => tone(220 + Math.random() * 60, .06, "square", .12, .5)],
  ko:    [.05, () => { tone(520, .08, "square", .1, .4); noise(.06, .08, 0, 2000); }],
  xp:    [.035, () => tone(midi(84 + (Math.random() * 5 | 0)), .06, "triangle", .18)],
  hurt:  [.15, () => { noise(.15, .35, 0, 300); tone(160, .15, "sawtooth", .15, .5); }],
  levelup: [0, () => arp([72, 76, 79, 84], .07)],
  evo:   [0, () => arp([60, 64, 67, 72, 76, 79, 84, 88], .09, "square", .22, .2)],
  heal:  [0, () => arp([79, 84, 88], .06, "triangle", .3)],
  magnet:[0, () => tone(300, .5, "sine", .3, 4)],
  flute: [0, () => arp([79, 81, 83, 86, 83, 79, 81], .14, "sine", .3, .25)],
  chest: [0, () => arp([67, 72, 76, 79, 84, 79, 84], .08, "square", .22, .16)],
  boss:  [0, () => { arp([45, 44, 45, 44, 45], .12, "sawtooth", .25, .14); noise(.6, .15, 0, 100); }],
  ach:   [0, () => arp([76, 79, 84, 88, 91], .06, "square", .2, .14)],
  win:   [0, () => arp([72, 72, 72, 76, 79, 76, 79, 84], .12, "square", .25, .22)],
  lose:  [0, () => arp([67, 64, 60, 55, 48], .16, "triangle", .3, .3)],
  click: [.05, () => tone(880, .04, "square", .1)],
  break: [.08, () => noise(.12, .2, 0, 500)],
};
function sfx(name) {
  if (!AU.ctx || AU.muted) return; const [cool, fn] = SFX[name], now = AU.ctx.currentTime;
  if (cool && now - (AU.last[name] || 0) < cool) return; AU.last[name] = now; fn();
}
// Musiques originales : 4 mesures de 16 pas, mélodie + basse + charleston
const TRACKS = {
  forest: { bpm:132, lead:"square", leadVol:.18, hat:2, roots:[48, 50, 45, 41], mel:[
    72,0,76,0,79,0,76,0,77,0,76,74,72,0,0,0, 74,0,77,0,81,0,79,77,76,0,74,0,72,0,0,0,
    72,0,76,79,84,0,83,81,79,0,77,76,74,0,76,0, 77,0,76,0,74,0,71,0,72,0,0,0,0,0,0,0] },
  cave: { bpm:108, lead:"triangle", leadVol:.32, hat:4, roots:[45, 41, 43, 40], mel:[
    69,0,0,72,0,0,76,0,74,0,72,0,71,0,0,0, 69,0,0,72,0,0,77,0,76,0,74,0,76,0,0,0,
    81,0,0,79,0,0,77,0,76,0,74,0,72,0,71,0, 69,0,0,0,64,0,0,0,69,0,0,0,0,0,0,0] },
  tower: { bpm:92, lead:"square", leadVol:.12, hat:8, roots:[45, 44, 43, 42], mel:[
    81,0,0,76,0,0,81,0,80,0,76,0,0,0,0,0, 81,0,0,76,0,0,81,0,80,0,77,0,0,0,0,0,
    76,0,72,0,76,0,79,0,78,0,74,0,78,0,77,0, 76,0,0,0,73,0,0,0,69,0,0,0,0,0,0,0] },
  rocket: { bpm:140, lead:"sawtooth", leadVol:.1, hat:2, roots:[40, 40, 43, 38], mel:[
    64,0,64,67,0,64,0,70,0,69,0,67,0,64,0,0, 64,0,64,67,0,64,0,71,0,70,0,69,0,67,0,0,
    76,0,74,0,71,0,67,0,69,0,70,0,71,0,74,0, 76,0,0,75,0,0,74,0,0,0,64,0,0,0,0,0] },
  safari: { bpm:124, lead:"square", leadVol:.15, hat:2, roots:[43, 48, 45, 50], mel:[
    67,0,71,0,74,0,71,0,72,0,76,0,79,0,0,0, 76,0,74,0,72,0,71,0,69,0,71,0,67,0,0,0,
    74,0,0,76,0,74,72,0,71,0,72,0,74,0,79,0, 78,0,76,0,74,0,72,0,71,0,0,0,67,0,0,0] },
  manor: { bpm:100, lead:"triangle", leadVol:.3, hat:4, roots:[45, 41, 44, 40], mel:[
    69,0,72,0,76,0,75,0,76,0,0,72,0,0,69,0, 68,0,71,0,74,0,73,0,74,0,0,71,0,0,68,0,
    69,0,0,76,0,0,77,0,76,0,74,0,72,0,71,0, 72,0,71,0,69,0,68,0,69,0,0,0,0,0,0,0] },
  legend: { bpm:128, lead:"square", leadVol:.15, hat:2, roots:[45, 48, 43, 40], mel:[
    76,0,76,0,79,0,76,0,74,0,72,0,74,0,0,0, 76,0,76,0,79,0,81,0,79,0,0,0,0,0,0,0,
    81,0,79,0,77,0,76,0,77,0,76,0,74,0,72,0, 71,0,72,0,74,0,76,0,72,0,0,0,0,0,0,0] },
  boss: { bpm:156, lead:"sawtooth", leadVol:.13, hat:1, roots:[38, 46, 43, 45], mel:[
    74,74,0,77,0,74,0,81,0,79,77,0,76,0,74,0, 74,74,0,77,0,74,0,82,0,81,79,0,77,0,76,0,
    81,0,79,0,77,0,76,0,77,0,76,0,74,0,73,0, 74,0,0,0,69,0,0,0,74,0,0,0,62,0,0,0] },
};
function playTrack(name) {
  if (AU.track === name) return; AU.track = name; AU.step = 0;
  if (!AU.ctx || !name) return; AU.next = AU.ctx.currentTime + .1;
  if (!AU.timer) AU.timer = setInterval(musicTick, 50);
}
function musicTick() {
  if (!AU.ctx || !AU.track) return;
  const tr = TRACKS[AU.track], sp = 60 / tr.bpm / 4;
  if (AU.next < AU.ctx.currentTime - .5) AU.next = AU.ctx.currentTime + .05; // onglet en arrière-plan
  while (AU.next < AU.ctx.currentTime + .15) {
    const i = AU.step % 64, n = tr.mel[i], bar = i >> 4, k = i & 15;
    if (n) tone(midi(n), sp * 1.8, tr.lead, tr.leadVol, 0, AU.next, AU.music);
    if (k % 2 === 0) { const r = tr.roots[bar] + (bar === 3 && k >= 8 && AU.track === "forest" ? 2 : 0); tone(midi(k % 4 ? r + 12 : r), sp * 1.6, "triangle", .35, 0, AU.next, AU.music); }
    if (k % tr.hat === 0) noise(.03, k % 4 ? .05 : .09, AU.next, 6000, AU.music);
    AU.next += sp; AU.step++;
  }
}
function setMute(m) {
  AU.muted = m; try { localStorage.setItem("pokesurv-mute", m ? "1" : "0"); } catch (e) {}
  if (AU.master) AU.master.gain.value = m ? 0 : .7 * AU.vol;
  for (const id of ["muteBtn", "muteBtn2"]) { const b = document.getElementById(id); if (b) b.textContent = m ? "🔇" : "🔊"; }
}

