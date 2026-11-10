// ===== Núcleo: estado, helpers de efectos, IA, flujo de días =====
let G = null;
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function newTribute(ch) { const maxhp = 70 + ch.res * 5 + (ch.perk === 'tanque' ? 25 : 0); return { ch, id: ch.id, name: ch.name, L: lookOf(ch), fue: ch.fue, agi: ch.agi, ast: ch.ast, res: ch.res, perk: ch.perk, hp: maxhp, maxhp, weapon: null, alive: true, kills: 0, killer: null, diedDay: 0, team: null }; }
const hasPerk = (t, p) => t && t.alive && t.perk === p;
const teamPerk = p => hasPerk(G.P, p) || hasPerk(G.C, p);
const aliveT = () => G.all.filter(t => t.alive);
const aliveTeams = () => G.teams.filter(tm => tm.m.some(t => t.alive));
const myTeam = () => G.teams[0];

function startGame(pid, cid) {
  const all = CHARS.map(newTribute), P = all[pid], C = all[cid];
  const rest = shuffle(all.filter(t => t !== P && t !== C));
  const teams = [{ id: 0, m: [P, C], sec: 0, inv: [], player: true }];
  for (let i = 0; i < 7; i++) teams.push({ id: i + 1, m: [rest[i * 2], rest[i * 2 + 1]], sec: 0, inv: [], trust: ri(40, 90) });
  teams.forEach(tm => tm.m.forEach(t => { t.team = tm.id; if (t.perk === 'arquero') t.weapon = 'arco'; }));
  G = { day: 1, phase: 0, all, P, C, teams, inv: [], fame: 0, hunger: 100, loyalty: hasPerk(P, 'leal') || hasPerk(C, 'leal') ? 80 : 62, sec: 0, log: [], fallenToday: [], hazard: null, closed: [], trap: null, timeline: [], energyBonus: 0, over: false, moved: false, sponsorGot: 0, betrayed: null };
  if (teamPerk('trampera')) G.inv.push('trampa');
  G.inv.push('agua');
  return G;
}
// ---- efectos (usados por escenas) ----
function addLog(html, cls) { G.log.unshift({ html, cls, d: G.day, p: G.phase }); if (G.log.length > 80) G.log.pop(); }
function mark(txt) { G.timeline.push(`<b>Día ${G.day} · ${PHASES[G.phase]}:</b> ${txt}`); }
function hurt(t, n, by) {
  if (!t || !t.alive) return 0; n = Math.round(n); t.hp = Math.max(0, t.hp - n);
  if (t.hp <= 0) kill(t, by); return n;
}
function heal(t, n) { if (!t || !t.alive) return 0; const b = t.hp; t.hp = Math.min(t.maxhp, t.hp + Math.round(n)); return t.hp - b; }
function kill(t, by, how) {
  if (!t.alive) return; t.alive = false; t.hp = 0; t.diedDay = G.day; t.killer = by ? by.name : (how || 'la arena');
  if (by) by.kills++;
  G.fallenToday.push(t);
  if (t === G.P) mark(`Caíste. ${by ? 'Te mató ' + cap(by.name) : 'Te venció ' + (how || 'la arena')}.`);
  else if (t === G.C) mark(`Murió ${cap(t.name)}, tu compañero.`);
  else if (by === G.P || by === G.C) mark(`${cap(by.name)} eliminó a ${cap(t.name)}.`);
}
function feed(n) { const m = teamPerk('cocinero') ? 2 : 1; G.hunger = clamp(G.hunger + n * m, 0, 100); }
function fame(n) { if (n > 0 && teamPerk('carisma')) n = Math.round(n * 1.5); G.fame = Math.max(0, G.fame + n); }
function loyal(n) { if (n < 0 && teamPerk('leal')) n = Math.round(n / 3); G.loyalty = clamp(G.loyalty + n, 0, 100); }
function give(id, silent) {
  if (WEAPONS.includes(id)) {
    const w = ITEMS[id].w, cur = G.P.weapon ? ITEMS[G.P.weapon].w : 0, cw = G.C.alive && G.C.weapon ? ITEMS[G.C.weapon].w : 0;
    if (w > cur) { if (G.P.weapon && G.C.alive && (!G.C.weapon || ITEMS[G.P.weapon].w > cw)) G.C.weapon = G.P.weapon; G.P.weapon = id; }
    else if (G.C.alive && w > cw) G.C.weapon = id; else return silent ? '' : `${ITEMS[id].ic} ${ITEMS[id].n} (no te sirve, lo dejás)`;
    return `${ITEMS[id].ic} ${ITEMS[id].n} (equipado)`;
  }
  if (G.inv.length >= 10) return `${ITEMS[id].ic} ${ITEMS[id].n} (no te entra en la mochila)`;
  G.inv.push(id); return `${ITEMS[id].ic} ${ITEMS[id].n}`;
}
function rollLoot(rare = .25) { if (teamPerk('suerte')) rare += .2; return Math.random() < rare ? pick(LOOT_RARE) : pick(LOOT_COMMON); }
function chk(stat, dc, who) {
  who = who || G.P; const v = who[stat] + (stat === 'agi' && who.weapon === 'hacha' ? -1 : 0), d = ri(1, 10), ok = v + d >= dc;
  const nm = { fue: 'Fuerza', agi: 'Agilidad', ast: 'Astucia', res: 'Resistencia' }[stat];
  return { ok, s: `<span class="mut" style="font-size:.78em">🎲 ${nm} ${v} + ${d} = ${v + d} vs ${dc} ${ok ? '✔' : '✘'}</span>` };
}

// ---- IA de otros equipos ----
function teamPower(tm) { return tm.m.filter(t => t.alive).reduce((s, t) => s + (t.hp / t.maxhp * .6 + .4) * (t.fue + t.agi * .5 + (t.weapon ? ITEMS[t.weapon].w : 0)), 0); }
function aiMove() {
  for (const tm of G.teams) {
    if (tm.player || !tm.m.some(t => t.alive)) continue;
    const s = SECTORS[tm.sec], bad = G.closed.includes(tm.sec) || (G.hazard && G.hazard.sec === tm.sec);
    if (bad || Math.random() < .5) {
      let opts = s.adj.filter(a => !G.closed.includes(a));
      if (!opts.length) opts = [0];
      if (G.day >= 4 && Math.random() < .4 && opts.includes(0)) tm.sec = 0; else tm.sec = pick(opts);
    }
    if (Math.random() < .22) { const it = rollLoot(); if (WEAPONS.includes(it)) { const t = tm.m.find(t => t.alive && (!t.weapon || ITEMS[t.weapon].w < ITEMS[it].w)); if (t) t.weapon = it; } else tm.inv.push(it); }
    tm.m.forEach(t => t.alive && heal(t, 4));
  }
}
function aiFight(a, b) {
  const pa = teamPower(a) + rnd(0, 9), pb = teamPower(b) + rnd(0, 9), [w, l] = pa >= pb ? [a, b] : [b, a];
  const wl = w.m.filter(t => t.alive);
  l.m.filter(t => t.alive).forEach(t => {
    const k = pick(wl);
    if (Math.random() < .72) { kill(t, k); addLog(FEED_KILL[ri(0, FEED_KILL.length - 1)].replace('{a}', `<b>${cap(k.name)}</b>`).replace('{b}', `<b>${cap(t.name)}</b>`), 'k'); }
    else { hurt(t, rnd(15, 35)); l.sec = pick(SECTORS[l.sec].adj.filter(x => !G.closed.includes(x)).concat([0])); }
  });
  wl.forEach(t => { if (Math.random() < .6) { const before = t.alive; hurt(t, rnd(6, 30)); if (before && !t.alive) addLog(`<b>${cap(t.name)}</b> ganó la pelea pero murió desangrado`, 'k'); } });
  if (!l.m.some(t => t.alive)) { w.inv.push(...l.inv); l.inv = []; l.m.forEach(t => { if (t.weapon) { const r = w.m.find(x => x.alive && (!x.weapon || ITEMS[x.weapon].w < ITEMS[t.weapon].w)); if (r) r.weapon = t.weapon; } }); }
}
function aiResolve() {
  const bySec = {};
  for (const tm of aliveTeams()) if (!tm.player) (bySec[tm.sec] = bySec[tm.sec] || []).push(tm);
  for (const sec in bySec) {
    const ts = shuffle(bySec[sec]);
    for (let i = 0; i + 1 < ts.length; i += 2) if (Math.random() < (+sec === 0 ? .8 : .55)) aiFight(ts[i], ts[i + 1]);
  }
  // peligros y zonas cerradas
  for (const tm of aliveTeams()) {
    if (tm.player) continue;
    if (G.closed.includes(tm.sec)) tm.m.forEach(t => { if (t.alive) { hurt(t, 30); if (!t.alive) { t.killer = 'la zona cerrada'; addLog(`<b>${cap(t.name)}</b> no salió a tiempo de la zona cerrada`, 'k'); } } });
    if (G.hazard && G.hazard.sec === tm.sec && Math.random() < .6) tm.m.forEach(t => { if (t.alive) { hurt(t, G.hazard.dmg); if (!t.alive) { t.killer = G.hazard.n.toLowerCase(); addLog(`<b>${cap(t.name)}</b> murió por ${G.hazard.n.toLowerCase()}`, 'k'); } } });
  }
  if (Math.random() < .35) { const t = pick(aliveT().filter(t => t.team !== 0)); if (t) { const o = pick(aliveT().filter(x => x !== t)) || t; addLog(pick(FEED_FLAVOR).replace('{a}', `<b>${cap(t.name)}</b>`).replace('{b}', `<b>${cap(o.name)}</b>`)); } }
}
function aiNightBetrayals() {
  for (const tm of aliveTeams()) {
    if (tm.player) continue; const al = tm.m.filter(t => t.alive);
    if (al.length === 2 && Math.random() < (G.day >= 4 ? .1 : .04)) { const [k, v] = shuffle(al); kill(v, k); addLog(`<b>${cap(k.name)}</b> traicionó a <b>${cap(v.name)}</b> mientras dormía`, 'k'); }
  }
}
// sectores vecinos con gente (para Rastreadora)
const teamsIn = sec => aliveTeams().filter(tm => !tm.player && tm.sec === sec);
