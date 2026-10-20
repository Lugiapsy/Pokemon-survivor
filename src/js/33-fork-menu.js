
/* ---------- Fork (Lugiapsy) : menu d'accueil, paramètres, mentions légales ---------- */
// L'écran "start" de Neo devient l'écran de choix du niveau et du starter, ouvert par Solo ou Multijoueur.
// Magasin, Pokédex et Succès réutilisent ses boutons (shopBtn, dexBtn, achBtn) : leurs fermetures ramènent ici.
const HOME_PAGES = ["home", "start", "settings", "legal"];
function showPage(id, st) {
  for (const p of HOME_PAGES) $(p).hidden = p !== id;
  state = st;
  const b = $(id).querySelector("button:not([hidden])"); if (b) b.focus({ preventScroll:true });
}
function goHome() { showPage("home", "home"); }
function goPlay(multi) { // Solo : une seule personne, rien d'autre ; Multijoueur : local (manettes) ou en ligne
  if (!multi) { if (NET.role) netClose(); $("netBox").hidden = true; $("netBtn").setAttribute("aria-pressed", "false"); setPlayers(1); }
  $("netBtn").hidden = $("mpBtn").hidden = !multi;
  showPage("start", "menu");
  setLevel(Math.max(0, LEVELS.indexOf(LEVEL))); refreshLocks(); refreshMoneyTag();
}
$("homeSolo").addEventListener("click", () => goPlay(false));
$("homeMulti").addEventListener("click", () => goPlay(true));
$("homeSettings").addEventListener("click", () => showPage("settings", "settings"));
$("homeLegal").addEventListener("click", () => showPage("legal", "legal"));
for (const id of ["shopBtn", "dexBtn", "achBtn"]) $(id).addEventListener("click", () => { $("home").hidden = true; });
$("shopBack").addEventListener("click", closeShop); $("dexBack").addEventListener("click", closeDex); $("achBack").addEventListener("click", closeAch); // bouton ← Menu en haut à gauche
for (const id of ["startBack", "settingsClose", "legalClose"]) $(id).addEventListener("click", () => { if (id === "startBack" && NET.role) netClose(); goHome(); });
window.addEventListener("keydown", e => { // Échap : retour au menu depuis les pages du menu
  if (e.code !== "Escape") return;
  if (state === "menu" || state === "settings" || state === "legal") { if (state === "menu" && NET.role) netClose(); goHome(); }
  else if (state === "shop") closeShop(); else if (state === "dex") closeDex(); else if (state === "ach") closeAch();
});
// Auto-validation de la Super Potion : même réglage que les cases de Neo (montée de niveau et pause)
$("autoPot3").checked = autoPotion;
$("autoPot3").addEventListener("change", e => { autoPotion = e.target.checked; $("autoPot").checked = $("autoPot2").checked = autoPotion; try { localStorage.setItem("pokesurv-autopotion", autoPotion ? "1" : "0"); } catch (er) {} });
for (const id of ["autoPot", "autoPot2"]) $(id).addEventListener("change", () => { $("autoPot3").checked = autoPotion; });
// Au lancement : le menu, sauf avec un lien d'invitation (…/#CODE), qui mène droit au salon en ligne
if (/^[A-Z0-9]{5}$/.test((location.hash || "").replace("#", "").toUpperCase())) goPlay(true); else goHome();

// Volume de 0 à 100 % (Paramètres du menu et Options de la pause), en plus du bouton couper / remettre le son
function volUI() {
  for (const id of ["volRange", "volRange2"]) {
    const r = $(id); r.value = Math.round(AU.vol * 100);
    r.style.setProperty("--p", r.value + "%");
    r.nextElementSibling.textContent = AU.muted ? "Muet" : r.value + " %";
  }
}
function setVolume(v) {
  AU.vol = v; try { localStorage.setItem("pokesurv-vol", String(v)); } catch (e) {}
  if (AU.muted && v > 0) setMute(false); // bouger le curseur remet le son
  else if (AU.master) AU.master.gain.value = AU.muted ? 0 : .7 * AU.vol;
  volUI();
}
const forkSetMute = setMute;
setMute = m => { forkSetMute(m); volUI(); };
for (const id of ["volRange", "volRange2"]) $(id).addEventListener("input", e => { auInit(); setVolume(e.target.value / 100); });
volUI();
// Pause : Reprendre / Options / Quitter la partie ; Options montre le volume et l'auto-validation de la Super Potion
function pauseOpt(on) {
  $("pauseOpt").hidden = !on; for (const id of ["pauseBtns", "pauseStats", "pauseDmg"]) $(id).hidden = on;
  $(on ? "pauseOptBack" : "resumeBtn").focus({ preventScroll:true });
}
$("pauseOptBtn").addEventListener("click", () => pauseOpt(true));
$("pauseOptBack").addEventListener("click", () => pauseOpt(false));
new MutationObserver(() => { if ($("pause").hidden && !$("pauseOpt").hidden) pauseOpt(false); }).observe($("pause"), { attributes:true, attributeFilter:["hidden"] });
