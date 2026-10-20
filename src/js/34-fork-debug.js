
/* ---------- Fork (Lugiapsy) : console de debug, à supprimer plus tard ----------
   Touche ² (à gauche de 1) : ouvre la console.
   - au menu d'accueil : « qqq » débloque tous les succès (donc Évoli, Minidraco, Mew, Johto et tous les niveaux)
   - en partie (le jeu se met en pause) : « god mode » rend invincible jusqu'à la fin de la partie (retaper pour couper)
   - en partie : « speed » accélère tout le jeu x2 (retaper pour couper) ; « speed 3 », « speed 4 »… pour aller plus vite, « speed 1 » pour revenir
     En vitesse accélérée, le jeu choisit tout seul : 1er choix de chaque montée de niveau (et d'évolution d'Évoli),
     coffres validés, salles de la Ligue enchaînées
   Pour tout retirer : supprimer ce fichier et sa ligne @include dans src/index.html. */
const DBG = document.createElement("div");
DBG.id = "dbgConsole"; DBG.hidden = true;
DBG.innerHTML = `<label for="dbgInput">Console</label><input id="dbgInput" autocomplete="off" spellcheck="false" placeholder="Tape un code puis Entrée"><small id="dbgMsg">Échap pour fermer</small>`;
document.body.appendChild(DBG);
const DBG_TAG = document.createElement("div"); DBG_TAG.id = "godTag"; DBG_TAG.hidden = true; DBG_TAG.textContent = "GOD MODE";
document.body.appendChild(DBG_TAG);
const dbgStyle = document.createElement("style");
dbgStyle.textContent = `
#dbgConsole { position: fixed; left: 50%; top: 22%; transform: translateX(-50%); z-index: 50; width: min(420px, calc(100% - 32px)); display: flex; flex-direction: column; gap: 8px;
  background: rgba(8,12,10,.94); border: 2px solid var(--accent); border-radius: 12px; padding: 14px 16px; box-shadow: 0 10px 40px rgba(0,0,0,.6); }
#dbgConsole[hidden] { display: none; }
#dbgConsole label { font: 700 13px var(--display); color: var(--accent); letter-spacing: .06em; text-transform: uppercase; }
#dbgInput { font: 14px var(--num); color: var(--ink); background: #000; border: 1px solid var(--panel-edge); border-radius: 6px; padding: 10px; outline: none; text-transform: uppercase; }
#dbgInput:focus { border-color: var(--accent); }
#dbgConsole small { font-size: 12px; color: var(--ink-dim); min-height: 1.2em; }
#godTag { position: fixed; left: 50%; top: calc(64px + env(safe-area-inset-top, 0px)); transform: translateX(-50%); z-index: 5; pointer-events: none;
  font: 9px var(--num); color: #1a1a1a; background: #ffd84a; border-radius: 4px; padding: 4px 6px; }
#godTag[hidden] { display: none; }`;
document.head.appendChild(dbgStyle);

const DBG_GAME = new Set(["play", "pause", "levelup", "chest", "inter"]); // écrans de partie où la console s'ouvre
let dbgPaused = false; // la console a mis la partie en pause : on la relance en fermant
function dbgOpen() {
  if (state === "play") { togglePause(); dbgPaused = true; } else dbgPaused = false;
  DBG.hidden = false; $("dbgInput").value = ""; $("dbgMsg").textContent = "Échap pour fermer"; $("dbgInput").focus();
}
function dbgClose() {
  DBG.hidden = true; $("dbgInput").blur();
  if (dbgPaused && state === "pause") togglePause();
  dbgPaused = false;
}
function dbgRun(txt) {
  const cmd = txt.toLowerCase().replace(/\s+/g, ""), say = m => { $("dbgMsg").textContent = m; };
  if (cmd === "qqq" && state === "home") {
    for (const a of ACHS) achs[a.id] = true;
    try { localStorage.setItem("pokesurv-ach", JSON.stringify(achs)); } catch (e) {}
    cloudSoon(); refreshLocks(); refreshMoneyTag(); sfx("ach");
    say(`✔ ${ACHS.length} succès débloqués : tous les starters et tous les niveaux sont ouverts.`);
  } else if (cmd === "godmode" && S && DBG_GAME.has(state)) {
    S.god = !S.god; sfx(S.god ? "ach" : "click");
    say(S.god ? "✔ God Mode activé : plus aucun dégât reçu pendant cette partie." : "✔ God Mode désactivé.");
  } else if (/^speed\d*$/.test(cmd) && S && DBG_GAME.has(state)) {
    const n = cmd.length > 5 ? Math.min(8, Math.max(1, parseInt(cmd.slice(5), 10))) : (S.speed > 1 ? 1 : 2);
    S.speed = n; sfx(n > 1 ? "ach" : "click");
    say(n > 1 ? `✔ Jeu accéléré x${n} jusqu'à la fin de la partie.` : "✔ Vitesse normale.");
  } else { say("Code inconnu ici."); return; }
  setTimeout(dbgClose, 1200);
}
// Vitesse : la boucle du jeu appelle update(dt) une fois par image ; on la rappelle S.speed fois (pas de grands pas qui feraient traverser les murs)
const dbgUpdate = update;
update = dt => { dbgUpdate(dt); for (let k = 1; k < ((S && S.speed) || 1) && S && state === "play"; k++) dbgUpdate(dt); };
// God Mode : le jeu passe par hurtP pour tous les dégâts reçus ; on l'enveloppe sans toucher au code de Neo
const dbgHurtP = hurtP;
hurtP = v => S && S.god ? false : dbgHurtP(v);

window.addEventListener("keydown", e => {
  if (e.code !== "Backquote" && e.key !== "²") return;
  if (!DBG.hidden) return;
  if (state === "home" || (S && DBG_GAME.has(state))) { e.preventDefault(); dbgOpen(); }
});
$("dbgInput").addEventListener("keydown", e => {
  e.stopPropagation(); // les touches tapées ne pilotent pas le jeu (M, Échap, chiffres…)
  if (e.key === "Enter") dbgRun(e.target.value);
  else if (e.key === "Escape" || e.code === "Backquote") { e.preventDefault(); dbgClose(); }
});
let dbgAutoT = 0; // pilote automatique en vitesse accélérée : petite attente pour voir passer l'écran
function dbgAuto(now) {
  if (!(S && S.speed > 1) || !DBG.hidden || !["levelup", "chest", "inter"].includes(state)) { dbgAutoT = 0; return; }
  if (!dbgAutoT) { dbgAutoT = now + 250; return; }
  if (now < dbgAutoT) return;
  dbgAutoT = 0;
  if (state === "levelup" && choices.length) applyChoice(choices[0]);
  else if (state === "chest") closeChest();
  else if (state === "inter") nextRoom();
}
(function dbgTagLoop(now) {
  dbgAuto(now || 0);
  const on = S && state !== "home" && state !== "menu", txt = on ? [S.god && "GOD MODE", S.speed > 1 && `VITESSE x${S.speed}`].filter(Boolean).join(" · ") : "";
  DBG_TAG.hidden = !txt; if (txt && DBG_TAG.textContent !== txt) DBG_TAG.textContent = txt;
  requestAnimationFrame(dbgTagLoop);
})();
