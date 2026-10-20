/* ---------- HUD ---------- */
let hudCache = "", bossKey = "";
function refreshHud() {
  const P = S.P, pct = P.hp / P.maxHp;
  $("hudName").textContent = pTag() + pName(); $("hudName").style.color = S.players.length > 1 ? PCOL[P.idx] : ""; $("hudLvl").textContent = `N.${P.lvl}`;
  const fill = $("hpFill"); fill.style.width = (pct * 100) + "%";
  fill.style.background = pct > .5 ? "var(--hp)" : pct > .2 ? "var(--hp-low)" : "var(--hp-crit)";
  $("hpText").textContent = `${Math.ceil(P.hp)}/${P.maxHp}`;
  $("hudTime").textContent = fmt(S.t); $("hudKills").textContent = S.kills;
  $("xpFill").style.width = (P.xp / P.need * 100) + "%";
  const mv = realMoves(P).map(([id, m]) => `<span class="move" style="--c:${TYPE_COLORS[MOVES[id].type]}">${MOVES[id].name} ${MOVES[id].tier ? `(${m.lv})${m.cur?.length ? ` : ${m.cur.map(c => MOVES[c].name).join(" + ")}` : ""}` : m.lv}</span>`).join("")
    + Object.entries(P.items).map(([id, lv]) => `<span class="move item" style="--c:#e8e2c8">${itemIcon(id)}${ITEMS[id].name} ${lv}</span>`).join("");
  if (mv !== hudCache) { $("hudMoves").innerHTML = mv; hudCache = mv; }
  for (let k = 1; k <= 3; k++) { // panneaux de J2, J3 et J4, empilés sous celui de J1
    const el = $("pp" + k), Q = S.players.filter(p => p !== S.P)[k - 1] || null, me = S.P;
    el.hidden = !Q; if (!Q) continue;
    S.P = Q; const name = pName(); S.P = me;
    const q = Math.max(0, Q.hp / Q.maxHp), col = q > .5 ? "var(--hp)" : q > .2 ? "var(--hp-low)" : "var(--hp-crit)";
    const mvs = Object.entries(Q.moves).map(([id, m]) => `<span class="move" style="--c:${TYPE_COLORS[MOVES[id].type]}">${MOVES[id].name} ${m.lv}</span>`).join("")
      + Object.entries(Q.items).map(([id, lv]) => `<span class="move item" style="--c:#e8e2c8">${itemIcon(id)}${ITEMS[id].name} ${lv}</span>`).join("");
    const key = name + Q.lvl + mvs + !!Q.down;
    if (el.dataset.key !== key) {
      el.dataset.key = key; el.style.setProperty("--c", PCOL[Q.idx]); el.classList.toggle("down", !!Q.down);
      el.innerHTML = `<div class="who-name"><span><span class="tagJ">J${Q.idx + 1}</span> · ${name}${Q.down ? " (K.O.)" : ""}</span><span class="lvl">N.${Q.lvl}</span></div>`
        + `<div class="hp-row"><div class="bar"><i></i></div><b></b></div><div class="xpmini"><i></i></div><div class="moves">${mvs}</div>`;
    }
    const fi = el.querySelector(".bar > i"); fi.style.width = (q * 100) + "%"; fi.style.background = col;
    el.querySelector(".hp-row b").textContent = `${Math.ceil(Q.hp)}/${Q.maxHp}`;
    el.querySelector(".xpmini > i").style.width = (Q.xp / Q.need * 100) + "%";
  }
  const bosses = S.foes.filter(f => (f.d.boss || f.d.mini || f.d.event || f.d.mother) && f.hp > 0);
  if (bosses.length) {
    $("boss").hidden = false;
    const key = bosses.map(b => b.kind).join();
    if (key + scopeOn() !== bossKey) { bossKey = key + scopeOn(); $("boss").innerHTML = bosses.map(b => `<div><span>${foeName(b.d)}</span><div class="bar"><i></i></div></div>`).join(""); }
    $("boss").querySelectorAll("i").forEach((el, k) => { el.style.width = Math.max(0, bosses[k].hp / bosses[k].maxHp * 100) + "%"; });
  }
  else $("boss").hidden = true;
}

