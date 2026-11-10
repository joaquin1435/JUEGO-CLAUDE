// ===== Pantallas y flujo principal =====
let REC = { plays: 0, wins: 0, kills: 0, best: 16 };
try { Object.assign(REC, JSON.parse(localStorage.getItem('pob_rec') || '{}')); } catch (e) {}
const saveRec = () => { try { localStorage.setItem('pob_rec', JSON.stringify(REC)); } catch (e) {} };
document.addEventListener('pointerdown', () => Snd.init(), { once: false });
Snd.setVol(Opt.music, Opt.sfx);

// ---------- Logros ----------
const ACHS = {
  primera: ['🩸', 'Primera sangre', 'Eliminá a tu primer tributo.'], carnicero: ['🪓', 'Carnicero', '5 bajas en una sola partida.'],
  vencedor: ['👑', 'Vencedor', 'Ganá los Juegos.'], pacifista: ['🕊️', 'Manos limpias', 'Ganá sin matar a nadie.'],
  juntos: ['🤝', 'Rompan las reglas', 'Ganen los dos juntos.'], traidor: ['🗡️', 'Et tu, Brute', 'Traicioná a tu compañero.'],
  sobrevivi: ['🛡️', 'Ojos en la nuca', 'Sobreviví a la traición de tu compañero.'], martir: ['🌹', 'Mártir', 'Sacrificate en el final.'],
  final: ['🏛️', 'Hasta el final', 'Llegá al día 6.'], trampa: ['🪤', 'Trampero', 'Que alguien caiga en tu trampa.'],
  festin: ['🎁', 'Invitado al festín', 'Llevate algo del festín.'], solo: ['🐺', 'Lobo solitario', 'Ganá después de perder a tu compañero.'],
  dificil: ['💀', 'Masoquista', 'Ganá en dificultad Difícil.'], hambre: ['🍖', 'Panza llena', 'Terminá un día con la saciedad al máximo.'],
};
let ACH = {}; try { ACH = JSON.parse(localStorage.getItem('pob_ach') || '{}'); } catch (e) {}
function ach(id) { if (ACH[id] || !ACHS[id]) return; ACH[id] = Date.now(); try { localStorage.setItem('pob_ach', JSON.stringify(ACH)); } catch (e) {} toast(`🏆 Logro: <b>${ACHS[id][1]}</b>`, 3500); Snd.play('pick'); }
function screenAch() {
  const n = Object.keys(ACH).length;
  view(`<div class="screen" style="justify-content:flex-start"><div class="wrap" style="max-width:900px"><div class="title-row"><div><span class="tag">${n} de ${Object.keys(ACHS).length}</span><h2>Logros</h2></div><button class="btn ghost" id="bk">← Volver</button></div>
  <div class="achs">${Object.entries(ACHS).map(([k, [i, nm, d]]) => `<div class="ach ${ACH[k] ? '' : 'off'}"><div class="i">${i}</div><div><b>${nm}</b><div class="mut" style="font-size:.8rem">${d}</div></div></div>`).join('')}</div></div></div>`);
  $('#bk').onclick = screenTitle;
}
// fila de los 16 animados en el menú
function lineup() {
  const cv = document.createElement('canvas'); cv.id = 'lineup'; app.appendChild(cv);
  const fs = shuffle(CHARS).map((ch, i) => ({ L: lookOf(ch), dir: i < 8 ? 1 : -1, seed: i * 1.7, hp: 1, maxhp: 1, weapon: pick([null, ...WEAPONS]), i }));
  (function loop(now) {
    if (!document.body.contains(cv)) return; requestAnimationFrame(loop);
    const W = cv.width = cv.clientWidth * devicePixelRatio, H = cv.height = cv.clientHeight * devicePixelRatio, c = cv.getContext('2d'), s = Math.min(H / 170, W / 900);
    fs.forEach((f, i) => { f.scale = s; f.x = W * (.04 + i * .92 / 15) + (i % 2 ? 0 : 0); f.y = H * (i % 2 ? .88 : .98); f.dir = f.x < W / 2 ? 1 : -1; if (!f.anim && Math.random() < .002) f.anim = { type: pick(['atk', 'guard', 'win', 'cast']), t0: now, dur: 700, dist: 20 * s }; });
    [...fs].sort((a, b) => a.y - b.y).forEach(f => drawFighter(c, f, now));
  })(performance.now());
}
// ---------- Guardado ----------
function saveGame() {
  try {
    const d = { ...G, all: G.all.map(t => ({ ...t, ch: t.ch.id, L: null })), P: G.P.id, C: G.C.id, teams: G.teams.map(tm => ({ ...tm, m: tm.m.map(t => t.id) })), fallenToday: G.fallenToday.map(t => t.id), st: null, lastScene: null, hazard: G.hazard };
    localStorage.setItem('pob_save', JSON.stringify(d));
  } catch (e) {}
}
function clearSave() { try { localStorage.removeItem('pob_save'); } catch (e) {} }
function loadGame() {
  try {
    const d = JSON.parse(localStorage.getItem('pob_save') || 'null'); if (!d) return false;
    const all = d.all.map(t => ({ ...t, ch: CHARS[t.ch], L: lookOf(CHARS[t.ch]) }));
    G = { ...d, all, P: all[d.P], C: all[d.C], teams: d.teams.map(tm => ({ ...tm, m: tm.m.map(i => all[i]) })), fallenToday: d.fallenToday.map(i => all[i]) };
    G.stats = G.stats || { dealt: 0, taken: 0 }; G.allies = G.allies || [];
    return true;
  } catch (e) { return false; }
}
const savedInfo = () => { try { const d = JSON.parse(localStorage.getItem('pob_save') || 'null'); return d && `${cap(CHARS[d.all[d.P].ch].name)} · Día ${d.day}`; } catch (e) { return null; } };
// ---------- Título ----------
function screenTitle() {
  BG.set(true); Snd.music('menu');
  view(`<div class="screen" style="padding-bottom:20vh"><div class="logo"><div class="kicker">Los Juegos de</div><h1>LA POBLACIÓN</h1><div class="sub">ARENA · 16</div></div>
  <div class="menu">${savedInfo() ? `<button class="btn primary" id="b-cont">▶ Continuar <small>${savedInfo()}</small></button>` : ''}<button class="btn ${savedInfo() ? '' : 'primary'}" id="b-play">${savedInfo() ? 'Nueva partida' : '▶ Jugar'}</button><button class="btn" id="b-how">Cómo se juega</button><button class="btn" id="b-ach">🏆 Logros <small>${Object.keys(ACH).length}/${Object.keys(ACHS).length}</small></button><button class="btn" id="b-opt">Opciones</button></div>
  <p class="mut" style="margin-top:22px;font-size:.8rem;text-align:center">Partidas ${REC.plays} · Victorias ${REC.wins} · Mejor puesto ${REC.best === 16 ? '—' : '#' + REC.best} · Récord de bajas ${REC.kills}</p></div>
  <div class="foot">16 tributos · 8 duplas · 6 días · 1 sobreviviente</div>`);
  $('#b-play').onclick = screenSelect; $('#b-how').onclick = screenHow; $('#b-opt').onclick = screenOptions; $('#b-ach').onclick = screenAch; lineup();
  const bc = $('#b-cont'); if (bc) bc.onclick = () => { if (!loadGame()) { clearSave(); return screenTitle(); } busy = false; Snd.music('map'); screenGame(); toast('Partida recuperada'); };
}
function screenHow() {
  view(`<div class="screen"><div class="card wrap" style="max-width:720px;padding:24px"><h2 style="font-size:2.6rem">Cómo se juega</h2><div class="howto">
  <h3>La premisa</h3>16 de La Población entran a la arena en 8 duplas. Elegís quién sos y a quién querés de compañero; el resto se sortea. Durante 6 días vas a tener que comer, esconderte, pelear y decidir en quién confiar. Sale uno solo.
  <h3>Cada turno</h3>El día tiene tres momentos: mañana, tarde y noche. En cada uno elegís qué hacer: <b>moverte</b> (tocá un sector vecino en el mapa), <b>explorar</b>, <b>cazar</b>, <b>descansar</b> o <b>esconderte</b>. Después se mueven los demás. Si coinciden en un sector, puede haber pelea.
  <h3>Lo que tenés que cuidar</h3><b>Vida</b>: si llega a cero, se terminó. <b>Saciedad</b>: baja cada turno; en cero, el hambre te come la vida. <b>Lealtad</b>: si tu compañero confía poco en vos, una noche puede clavarte el cuchillo. <b>Audiencia</b>: el show manda. De noche, los patrocinadores te dejan canjear audiencia por objetos.
  <h3>Combate</h3>Por turnos. Atacar, golpe fuerte (gasta energía ⚡), cubrirse, usar objetos o huir. Tocá a un enemigo para apuntarle. Cada personaje tiene una habilidad propia.<h3>Alianzas</h3>Otras duplas pueden proponerte una alianza: mientras dure no se atacan. Pero ninguna alianza dura para siempre.<h3>Atajos en PC</h3>En combate, las teclas 1 a 5. En el mapa: E explorar, C cazar, D descansar, S esconderse. En los carteles, los números eligen la opción y Enter continúa.
  <h3>La arena</h3>Hay peligros que cambian cada día y a partir del día 3 la arena se achica: las zonas cerradas matan. El día 6 se termina todo en la Cornucopia.
  </div><button class="btn primary" style="margin-top:18px" id="bk">Entendido</button></div></div>`);
  $('#bk').onclick = screenTitle;
}
function screenOptions() {
  const sp = { .75: 'Lenta', 1: 'Normal', 1.5: 'Rápida', 2.2: 'Muy rápida' };
  view(`<div class="screen"><div class="card" style="width:min(460px,100%);padding:24px"><h2 style="font-size:2.6rem;margin-bottom:8px">Opciones</h2>
  <div class="opt-row"><span>Música</span><input type="range" class="range" style="width:55%" min="0" max="1" step=".05" value="${Opt.music}" id="o-m"></div>
  <div class="opt-row"><span>Efectos</span><input type="range" class="range" style="width:55%" min="0" max="1" step=".05" value="${Opt.sfx}" id="o-s"></div>
  <div class="opt-row"><span>Velocidad de animaciones</span><select id="o-v" class="btn" style="padding:.5em">${Object.entries(sp).map(([k, v]) => `<option value="${k}" ${+k === Opt.speed ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
  <div class="opt-row"><span>Dificultad</span><select id="o-d" class="btn" style="padding:.5em">${[[.7, 'Fácil'], [.9, 'Normal'], [1.15, 'Difícil']].map(([k, v]) => `<option value="${k}" ${k === Opt.diff ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
  <div class="opt-row"><span>Controlar a tu compañero en combate</span><input type="checkbox" id="o-c" ${Opt.ctrl ? 'checked' : ''} style="width:22px;height:22px;accent-color:var(--ember)"></div>
  <div class="opt-row"><span>Borrar récords</span><button class="btn danger" id="o-r">Borrar</button></div>
  <button class="btn primary" style="margin-top:18px;width:100%" id="bk">Listo</button></div></div>`);
  $('#o-m').oninput = e => { Opt.music = +e.target.value; Snd.setVol(Opt.music, Opt.sfx); saveOpt(); };
  $('#o-s').oninput = e => { Opt.sfx = +e.target.value; Snd.setVol(Opt.music, Opt.sfx); saveOpt(); Snd.play('hit'); };
  $('#o-v').onchange = e => { Opt.speed = +e.target.value; saveOpt(); };
  $('#o-c').onchange = e => { Opt.ctrl = e.target.checked; saveOpt(); };
  $('#o-d').onchange = e => { Opt.diff = +e.target.value; saveOpt(); };
  $('#o-r').onclick = () => { REC = { plays: 0, wins: 0, kills: 0, best: 16 }; saveRec(); toast('Récords borrados'); };
  $('#bk').onclick = screenTitle;
}
// ---------- Selección ----------
function statRows(ch) { return [['Fuerza', 'fue'], ['Agilidad', 'agi'], ['Astucia', 'ast'], ['Aguante', 'res']].map(([n, k]) => `<div class="stat"><span>${n}</span><div class="bar"><i style="width:${ch[k] * 10}%"></i></div><b>${ch[k]}</b></div>`).join(''); }
function previewLoop(ch) {
  const cv = $('#pv'); if (!cv) return; const t = newTribute(ch);
  const f = { L: t.L, dir: 1, seed: 1, hp: 1, maxhp: 1, weapon: ch.perk === 'arquero' ? 'arco' : ['cuchillo', 'machete', 'lanza', 'hacha', 'maza'][ch.id % 5], anim: { type: 'win', t0: performance.now(), dur: 900 } };
  (function loop(now) {
    if (!document.body.contains(cv)) return; requestAnimationFrame(loop);
    cv.width = 240; cv.height = 300; const c = cv.getContext('2d');
    const g = c.createRadialGradient(120, 200, 10, 120, 180, 170); g.addColorStop(0, shade(t.L.shirt, -50)); g.addColorStop(1, '#0d0b10'); c.fillStyle = g; c.fillRect(0, 0, 240, 300);
    f.x = 120; f.y = 285; f.scale = 1.75;
    if (!f.anim && Math.random() < .006) f.anim = { type: pick(['atk', 'guard', 'win', 'cast']), t0: now, dur: 700, dist: 10 };
    drawFighter(c, f, now);
  })(performance.now());
}
function screenSelect() {
  let me = null, comp = null, focus = CHARS[0];
  function render() {
    const step = me === null ? 0 : 1;
    view(`<div class="screen" style="justify-content:flex-start"><div class="wrap">
    <div class="title-row"><div><span class="tag">Paso ${step + 1} de 2</span><h2>${step ? 'Elegí a tu compañero' : 'Elegí tu tributo'}</h2></div><button class="btn ghost" id="bk">← Volver</button></div>
    <div class="card detail"><canvas id="pv" style="width:120px;height:150px"></canvas><div><div class="disp" style="font-size:2.4rem;line-height:1">${cap(focus.name)}</div><div style="margin:4px 0 8px"><span class="tag">${PERKS[focus.perk].n}</span> <span class="mut" style="font-size:.85rem">${PERKS[focus.perk].d}</span></div>${statRows(focus)}</div></div>
    <div class="grid16" style="margin-top:14px">${CHARS.map(ch => `<div class="tcard ${ch.id === me ? 'sel' : ''} ${ch.id === comp ? 'comp' : ''}" data-id="${ch.id}">${ch.id === me ? '<span class="badge" style="background:var(--ember);color:#000">VOS</span>' : ch.id === comp ? '<span class="badge" style="background:var(--blue);color:#000">DUPLA</span>' : ''}<img src="${portrait(ch, 168)}"><div class="nm">${cap(ch.name)}</div><div class="pk">${PERKS[ch.perk].n}</div></div>`).join('')}</div>
    <div class="card selbar"><div class="mut" style="font-size:.9rem">${me === null ? 'Tocá un tributo para ver sus stats y elegilo.' : comp === null ? `Sos <b style="color:var(--ember)">${cap(CHARS[me].name)}</b>. Ahora elegí con quién entrás.` : `<b style="color:var(--ember)">${cap(CHARS[me].name)}</b> + <b style="color:var(--blue)">${cap(CHARS[comp].name)}</b>. El resto se sortea.`}</div>
    <div style="display:flex;gap:8px">${step && comp === null ? `<button class="btn" id="rnd">🎲 Al azar</button>` : ''}<button class="btn primary" id="ok" ${(step === 0) || comp !== null ? '' : 'disabled'}>${step === 0 ? `Elegir a ${cap(focus.name)}` : 'Al sorteo →'}</button></div></div></div></div>`);
    previewLoop(focus);
    app.querySelectorAll('.tcard').forEach(el => el.onclick = () => { const id = +el.dataset.id; focus = CHARS[id]; if (step === 1 && id !== me) comp = id; render(); });
    $('#bk').onclick = () => { if (step) { me = null; comp = null; render(); } else screenTitle(); };
    $('#ok').onclick = () => { if (step === 0) { me = focus.id; focus = CHARS[(me + 1) % 16]; render(); } else screenDraw(me, comp); };
    const r = $('#rnd'); if (r) r.onclick = () => { do comp = ri(0, 15); while (comp === me); focus = CHARS[comp]; render(); };
  }
  render();
}
// ---------- Sorteo ----------
async function screenDraw(me, comp) {
  startGame(me, comp);
  view(`<div class="screen" style="justify-content:flex-start"><div class="wrap"><div class="title-row"><div><span class="tag">La Cosecha</span><h2>Las ocho duplas</h2></div></div><div class="pairs" id="pairs"></div>
  <div style="text-align:center;margin-top:20px"><button class="btn primary" id="go" style="visibility:hidden;padding:1em 2.4em">Entrar a la arena</button></div></div></div>`);
  const box = $('#pairs');
  for (const tm of G.teams) {
    const d = document.createElement('div'); d.className = 'pair' + (tm.player ? ' me' : '');
    d.innerHTML = `<img src="${portrait(tm.m[0].ch, 96)}"><img src="${portrait(tm.m[1].ch, 96)}" style="margin-left:-18px"><div><div class="dn">Dupla ${tm.id + 1}</div><div class="disp" style="font-size:1.35rem">${cap(tm.m[0].name)} & ${cap(tm.m[1].name)}</div></div>`;
    box.appendChild(d); Snd.play('tick'); await sleep(tm.player ? 600 : 380);
  }
  Snd.play('gong'); const go = $('#go'); go.style.visibility = 'visible'; go.onclick = preGame;
}
async function preGame() {
  BG.set(true); view('<div class="screen"></div>');
  const i = await ask({ tag: 'Antes de los Juegos', title: 'El entrenamiento', biome: 'ruins', faces: [G.P], text: 'Tres días en el centro de entrenamiento. Los demás te miran de reojo. Tenés tiempo para enfocarte en una sola cosa.', opts: [
    { t: '🏋️ Levantar peso', sub: '+2 Fuerza' }, { t: '🤸 Pista de obstáculos', sub: '+2 Agilidad' }, { t: '🧠 Estación de supervivencia', sub: '+2 Astucia' }, { t: '🗡️ Practicar con armas', sub: 'Arrancás con un machete' }] });
  if (i === 0) G.P.fue += 2; else if (i === 1) G.P.agi += 2; else if (i === 2) G.P.ast += 2; else G.P.weapon = G.P.weapon || 'machete';
  const sc = clamp(Math.round((G.P.fue + G.P.agi + G.P.ast + G.P.res) / 4 + rnd(-2, 3)), 1, 12); fame(Math.max(0, sc - 5) * 2);
  Snd.play(sc >= 8 ? 'win' : 'click');
  await tell({ tag: 'Sesión privada', title: `Puntaje: ${sc} de 12`, biome: 'ruins', faces: [G.P], text: sc >= 9 ? 'Los jueces dejan de comer para mirarte. Los otros tributos ya te tienen marcado.' : sc >= 6 ? 'Un puntaje respetable. Nadie te va a subestimar, pero tampoco te van a temer.' : 'Algunos jueces bostezan. Mejor: que te subestimen.', cls: sc >= 8 ? 'good' : '' });
  const j = await ask({ tag: 'En vivo', title: 'La entrevista', biome: 'corn', faces: [G.P], text: `Luces, aplausos, el presentador con su sonrisa de plástico: "${cap(G.P.name)}, ¿qué le querés decir a la gente que te está mirando?"`, opts: [
    { t: '"Que no vine a hacer amigos."', sub: '+ audiencia' }, { t: '"Que voy a cuidar a ' + cap(G.C.name) + ' con mi vida."', sub: '+ lealtad' }, { t: 'Hacer un chiste y que se rían todos', sub: '+ un poco de los dos' }, { t: '"Esto es para mi vieja."', sub: '++ audiencia' }] });
  if (j === 0) fame(12); else if (j === 1) loyal(18); else { if (j === 2) { fame(6); loyal(6); } else fame(16); }
  await tell({ tag: 'En vivo', title: ['El público ruge', `${cap(G.C.name)} te mira distinto`, 'Carcajadas', 'Silencio y aplausos'][j], biome: 'corn', faces: j === 1 ? [G.P, G.C] : [G.P], text: ['Los patrocinadores toman nota. Los demás tributos también.', 'Cuando bajás del escenario te espera con un abrazo. "Yo también, boludo."', 'Hasta el presentador se tienta. Caíste bien.', 'Alguien en primera fila llora. Los patrocinadores sacan la billetera.'][j], cls: 'good', btn: 'A la plataforma' });
  countdown();
}
async function countdown() {
  BG.set(false);
  view(`<div class="screen" style="background:#000"><div class="mut" style="letter-spacing:.4em;text-transform:uppercase;font-size:.8rem">Sobre la plataforma</div><div class="endbig disp" id="cd" style="font-size:12rem">10</div><div class="mut" id="cdt">No te bajes antes de tiempo.</div></div>`);
  Snd.music('none');
  for (let i = 10; i > 0; i--) { $('#cd').textContent = i; $('#cd').style.animation = 'none'; void $('#cd').offsetWidth; $('#cd').style.animation = 'pop .4s'; Snd.play('tick'); await sleep(i > 3 ? 280 : 700); }
  Snd.play('gong'); flash('#fff', .8); $('#cd').textContent = 'YA'; await sleep(700);
  Snd.music('map'); busy = true; screenGame(); await bloodbath();
}
async function bloodbath() {
  busy = true;
  const i = await ask({ tag: 'Día 1 · El baño de sangre', title: 'Suena el gong', biome: 'corn', faces: [G.P, G.C], text: `La Cornucopia brilla a cuarenta metros, llena de armas y mochilas. Alrededor, catorce personas que conocés de toda la vida corren hacia ella. ${cap(G.C.name)} te mira esperando que decidas.`, opts: [
    { t: 'Correr a la Cornucopia', sub: 'Mucho botín · pelea segura' }, { t: 'Agarrar la mochila más cercana y salir', sub: 'Agilidad' }, { t: 'Huir directo al bosque', sub: 'Seguro, sin nada' }] });
  if (i === 0) {
    const loot = [give(pick(['machete', 'lanza', 'hacha', 'maza', 'arco'])), give(pick(LOOT_RARE)), give(pick(LOOT_COMMON))];
    fame(12); await tell({ title: 'Al centro', biome: 'corn', text: `Llegás entre los primeros. Manoteás ${loot.join(', ')}. Alguien viene directo hacia vos...`, cls: 'good' });
    const tm = pick(G.teams.filter(t => !t.player)); tm.sec = 0;
    const r = await fight(G.P.alive ? [G.P, G.C] : [], tm.m, { banner: 'BAÑO DE SANGRE' });
    await afterFight(r, tm);
    if (!G.P.alive) return gameOver();
    if (r === 'fled') G.sec = pick(SECTORS[0].adj);
    else G.sec = pick(SECTORS[0].adj);
  } else if (i === 1) {
    const r = chk('agi', 9);
    if (r.ok) await tell({ title: 'Mochila', biome: 'corn', text: `Agarrás una mochila al vuelo: ${give(pick(LOOT_COMMON))} y ${give(rollLoot(.3))}. Salís corriendo. ${r.s}`, cls: 'good' });
    else { hurt(G.P, 15); await tell({ title: 'Mochila', biome: 'corn', text: `Un cuchillo te pasa rozando el hombro. Te llevás la mochila igual: ${give(pick(LOOT_COMMON))}. -15 vida. ${r.s}`, cls: 'bad' }); }
    G.sec = pick(SECTORS[0].adj);
  } else { G.sec = 1; loyal(4); await tell({ title: 'Al bosque', biome: 'forest', text: 'Corren sin mirar atrás. A sus espaldas, los primeros gritos. Están vivos y enteros. Es algo.' }); }
  // el resto se mata en el centro
  G.teams.forEach(tm => { if (!tm.player) tm.sec = 0; });
  for (let k = 0; k < 2; k++) aiResolve();
  G.teams.forEach(tm => { if (!tm.player && tm.m.some(t => t.alive)) tm.sec = Math.random() < .3 ? 0 : pick(SECTORS[0].adj); });
  addLog('<b>Termina el baño de sangre.</b>');
  G.phase = 1; busy = false; renderGame();
}
// ---------- Juego ----------
let meImg = null, busy = false, mapCv = null, mapNodes = [], hoverSec = -1;
function screenGame() {
  BG.set(false);
  view(`<div class="game"><div class="card topbar" id="top"></div><div class="card mapwrap"><canvas id="map"></canvas><div id="secinfo" style="position:absolute;left:12px;bottom:12px;right:12px;pointer-events:none"></div></div><div class="side" id="side"></div></div>`);
  mapCv = $('#map'); mapCv.onclick = mapClick; mapCv.onpointermove = e => { const s = secAt(e); if (s !== hoverSec) { hoverSec = s; renderSecInfo(); } };
  requestAnimationFrame(mapLoop); renderGame();
}
function secAt(e) { const r = mapCv.getBoundingClientRect(), x = (e.clientX - r.left) * devicePixelRatio, y = (e.clientY - r.top) * devicePixelRatio; const n = mapNodes.find(n => Math.hypot(n.x - x, n.y - y) < n.r * 1.1); return n ? n.id : -1; }
function mapClick(e) { const s = secAt(e); if (s < 0 || busy || !G || G.over) return; if (SECTORS[G.sec].adj.includes(s)) act('move', s); else if (s === G.sec) toast('Ya estás acá.'); else toast('Solo podés moverte a sectores vecinos.'); }
function mapLoop(now) {
  if (!mapCv || !document.body.contains(mapCv)) return; requestAnimationFrame(mapLoop);
  const cw = mapCv.clientWidth * devicePixelRatio | 0, ch = mapCv.clientHeight * devicePixelRatio | 0; if (mapCv.width !== cw || mapCv.height !== ch) { mapCv.width = cw; mapCv.height = ch; }
  const W = cw, H = ch, c = mapCv.getContext('2d');
  const g = c.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, Math.max(W, H) * .7); g.addColorStop(0, '#1d1a14'); g.addColorStop(1, '#09080b'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.strokeStyle = 'rgba(255,255,255,.03)'; c.lineWidth = 1; for (let x = 0; x < W; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y < H; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  const pad = Math.min(W, H) * .13, R = Math.min(W, H) * .085;
  mapNodes = SECTORS.map(s => ({ id: s.id, x: pad + s.x * (W - pad * 2), y: pad + s.y * (H - pad * 2), r: s.id === 0 ? R * 1.35 : R }));
  if (!G) return;
  const adj = SECTORS[G.sec].adj, t = now / 1000;
  // conexiones
  SECTORS.forEach(s => s.adj.forEach(a => { if (a < s.id) return; const A = mapNodes[s.id], B = mapNodes[a], on = (s.id === G.sec || a === G.sec) && !busy; c.strokeStyle = on ? `rgba(255,140,60,${.5 + Math.sin(t * 4) * .2})` : 'rgba(255,255,255,.09)'; c.lineWidth = on ? 3 * devicePixelRatio : 2; c.setLineDash(on ? [8, 8] : []); c.lineDashOffset = -t * 30; c.beginPath(); c.moveTo(A.x, A.y); c.lineTo(B.x, B.y); c.stroke(); }));
  c.setLineDash([]);
  mapNodes.forEach(n => {
    const s = SECTORS[n.id], [top, mid] = BIOME_COL[s.b], closed = G.closed.includes(n.id), haz = G.hazard && G.hazard.sec === n.id;
    const gg = c.createRadialGradient(n.x - n.r * .3, n.y - n.r * .3, 2, n.x, n.y, n.r); gg.addColorStop(0, shade(mid, 30)); gg.addColorStop(1, shade(top, -10));
    c.save(); c.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; c.lineTo(n.x + Math.cos(a) * n.r, n.y + Math.sin(a) * n.r); } c.closePath();
    c.fillStyle = gg; c.fill(); c.clip();
    if (closed) { c.fillStyle = `rgba(200,20,20,${.45 + Math.sin(t * 3) * .1})`; c.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 6; for (let k = -n.r * 2; k < n.r * 2; k += 14) { c.beginPath(); c.moveTo(n.x + k, n.y - n.r); c.lineTo(n.x + k + n.r * 2, n.y + n.r); c.stroke(); } }
    if (haz) { c.fillStyle = `rgba(120,255,80,${.15 + Math.sin(t * 5) * .08})`; c.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2); }
    c.restore();
    const hl = n.id === hoverSec, isAdj = adj.includes(n.id) && !busy;
    c.strokeStyle = n.id === G.sec ? '#ff8a3c' : hl ? '#fff' : isAdj ? 'rgba(255,170,90,.7)' : 'rgba(255,255,255,.18)'; c.lineWidth = (n.id === G.sec ? 4 : hl ? 3 : 2) * devicePixelRatio;
    c.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; c.lineTo(n.x + Math.cos(a) * n.r, n.y + Math.sin(a) * n.r); } c.closePath(); c.stroke();
    c.textAlign = 'center'; c.font = `${n.r * .55}px sans-serif`;
    c.fillText({ corn: '🏛️', forest: '🌲', mountain: '⛰️', river: '🏞️', swamp: '🐸', ruins: '🏚️', field: '🌾', cave: '🕳️', beach: '🧂' }[s.b], n.x, n.y + n.r * .05);
    c.font = `700 ${Math.max(10, n.r * .2)}px Inter`; c.fillStyle = closed ? '#ff9a8a' : '#f1e6d6'; c.fillText(s.n.replace(/^(La|Las|El|Los) /, ''), n.x, n.y + n.r * .55);
    if (haz) { c.font = `${n.r * .38}px sans-serif`; c.fillText(G.hazard.ic, n.x + n.r * .55, n.y - n.r * .5); }
    if (G.feast === 2 && n.id === 0) { c.font = `${n.r * .3}px sans-serif`; c.fillText('🎁', n.x - n.r * .55, n.y - n.r * .45); }
    if (G.trap === n.id) { c.font = `${n.r * .3}px sans-serif`; c.fillText('🪤', n.x - n.r * .55, n.y + n.r * .55); }
    // gente visible
    const vis = n.id === G.sec || (teamPerk('rastreo') && adj.includes(n.id));
    if (vis && n.id !== G.sec) { const k = teamsIn(n.id).reduce((s, tm) => s + tm.m.filter(x => x.alive).length, 0); if (k) { c.fillStyle = '#e2403a'; c.beginPath(); c.arc(n.x + n.r * .6, n.y - n.r * .55, n.r * .22, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = `800 ${n.r * .24}px Inter`; c.fillText(k, n.x + n.r * .6, n.y - n.r * .47); } }
  });
  // tinte según momento del día
  c.fillStyle = ['rgba(255,170,80,.06)', 'rgba(255,90,30,.08)', 'rgba(20,40,120,.28)'][G.phase] || 'transparent'; c.fillRect(0, 0, W, H);
  // ficha del jugador (se desliza entre sectores)
  const to = mapNodes[G.sec], fr = mapNodes[G.prevSec ?? G.sec], k = clamp((now - (G.moveT || 0)) / 550, 0, 1), e = 1 - Math.pow(1 - k, 3);
  const me = { x: fr.x + (to.x - fr.x) * e, y: fr.y + (to.y - fr.y) * e - Math.sin(k * Math.PI) * 30, r: to.r }, bob = Math.sin(t * 3) * 4;
  if (!meImg || meImg._id !== G.P.id) { meImg = new Image(); meImg._id = G.P.id; meImg.src = portrait(G.P.ch, 96); }
  const pr = me.r * .5; c.save(); c.shadowColor = '#ff6a2b'; c.shadowBlur = 20; c.beginPath(); c.arc(me.x, me.y - me.r - pr * .4 + bob, pr, 0, 7); c.fillStyle = '#ff6a2b'; c.fill(); c.restore();
  c.save(); c.beginPath(); c.arc(me.x, me.y - me.r - pr * .4 + bob, pr * .88, 0, 7); c.clip(); c.drawImage(meImg, me.x - pr, me.y - me.r - pr * 1.4 + bob, pr * 2, pr * 2); c.restore();
}
function renderSecInfo() {
  const el = $('#secinfo'); if (!el || !G) return; const id = hoverSec >= 0 ? hoverSec : G.sec, s = SECTORS[id];
  const here = id === G.sec, adj = SECTORS[G.sec].adj.includes(id), closed = G.closed.includes(id), haz = G.hazard && G.hazard.sec === id;
  el.innerHTML = `<div class="card" style="display:inline-block;padding:10px 14px;max-width:420px;background:rgba(15,13,18,.88)"><div class="disp" style="font-size:1.5rem;line-height:1">${s.n} ${here ? '<span class="tag">Estás acá</span>' : adj ? '<span class="tag" style="color:#ffb27a">Tocá para ir</span>' : ''}</div><div class="mut" style="font-size:.8rem;margin-top:3px">${s.d}${closed ? ' <b style="color:#ff6b5b">ZONA CERRADA: quedarte acá te mata.</b>' : ''}${haz ? ` <b style="color:#9cff6a">${G.hazard.ic} ${G.hazard.n}.</b>` : ''}</div><div style="font-size:.72rem;margin-top:4px;color:#cbb">Botín ${'●'.repeat(s.loot)}${'○'.repeat(3 - s.loot)} · Comida ${'●'.repeat(s.food)}${'○'.repeat(2 - s.food)} · Peligro ${'●'.repeat(s.danger)}${'○'.repeat(3 - s.danger)}</div></div>`;
}
function whoCard(t, extra) {
  const w = t.weapon ? ITEMS[t.weapon] : null;
  return `<div class="card who ${t.alive ? '' : 'dead'}"><img src="${portrait(t.ch, 112, t.alive ? (t.hp < t.maxhp * .3 ? 1 : 0) : 2)}"><div><div class="n">${cap(t.name)} <span class="tag" title="${PERKS[t.perk].d}">${PERKS[t.perk].n}</span></div>
  <div class="meter hp"><i style="width:${t.hp / t.maxhp * 100}%"></i></div><div class="ml"><span>❤ ${t.hp}/${t.maxhp}</span><span>${w ? w.ic + ' ' + w.n : '👊 Sin arma'}</span></div>${extra || ''}</div></div>`;
}
function renderGame() {
  if (!G || !$('#top')) return;
  if (!busy && !G.over) saveGame();
  const alive = aliveT().length;
  $('#top').innerHTML = `<div><div class="day">Día ${G.day}<span class="mut" style="font-size:1.1rem"> / 6</span></div><div class="ph">${PHASES[G.phase]}</div></div><div class="spacer"></div>
  <div class="chip" title="Tributos con vida">👥 ${alive}</div><div class="chip" title="Audiencia: de noche la canjeás con los patrocinadores">⭐ ${G.fame}</div>${G.hazard ? `<div class="chip" style="border-color:#4a6b2a">${G.hazard.ic} ${G.hazard.n} en ${SECTORS[G.hazard.sec].n}</div>` : ''}${G.allies.length ? `<div class="chip" title="Aliados">🤝 ${G.allies.map(i => G.teams[i].m.filter(t => t.alive).map(t => cap(t.name)).join('/')).join(', ')}</div>` : ''}${G.closed.length ? `<div class="chip" style="border-color:#7a2b2b">⛔ ${G.closed.length} zonas cerradas</div>` : ''}<button class="chip" id="b-menu">☰</button>`;
  const cAlive = G.C.alive;
  const acts = [['explore', '🔎', 'Explorar', 'Buscar cosas y problemas'], ['hunt', '🍖', 'Cazar', 'Conseguir comida'], ['rest', '💤', 'Descansar', 'Curarse, más expuesto'], ['hide', '🌿', 'Esconderse', 'Casi no te encuentran']];
  $('#side').innerHTML = `${whoCard(G.P, `<div class="meter hu" style="margin-top:8px"><i style="width:${G.hunger}%"></i></div><div class="ml"><span>🍖 Saciedad ${G.hunger}</span><span>${G.hunger < 25 ? '<b style="color:#ffc94a">¡Hambre!</b>' : ''}</span></div>`)}
  ${whoCard(G.C, cAlive ? `<div class="meter lo" style="margin-top:8px"><i style="width:${G.loyalty}%"></i></div><div class="ml"><span>🤝 Lealtad ${G.loyalty}</span><span>${G.loyalty < 30 ? '<b style="color:#ff6b5b">Desconfía</b>' : G.loyalty > 75 ? 'Te banca' : ''}</span></div>` : `<div class="ml"><span>☠ Murió el día ${G.C.diedDay} · ${esc(G.C.killer)}</span></div>`)}
  <div class="card"><div class="sectitle">¿Qué hacés? ${busy ? '' : '<span style="color:var(--ember);text-transform:none;letter-spacing:0">· o tocá un sector vecino para moverte</span>'}</div><div class="acts">${acts.map(([k, ic, n, d]) => `<button class="btn" data-a="${k}" ${busy ? 'disabled' : ''} title="${d}"><span class="ic">${ic}</span>${n}<small>${d}</small></button>`).join('')}
  ${cAlive ? `<button class="btn danger" data-a="betray" ${busy ? 'disabled' : ''} style="grid-column:1/-1;padding:.55em"><span>🗡️ Traicionar a ${cap(G.C.name)}</span></button>` : ''}</div></div>
  <div class="card"><div class="sectitle">Mochila ${G.inv.length}/10</div><div class="inv">${Array.from({ length: 8 }, (_, i) => { const ks = [...new Set(G.inv)], k = ks[i]; return k ? `<div class="slot f" data-it="${k}">${ITEMS[k].ic}<span class="q">${G.inv.filter(x => x === k).length}</span></div>` : '<div class="slot"></div>'; }).join('')}</div></div>
  <div class="card"><div class="sectitle">Lo que pasa en la arena</div><div class="log">${G.log.slice(0, 40).map(l => `<p class="${l.cls || ''}"><span class="mut">D${l.d}</span> ${l.html}</p>`).join('') || '<p class="mut">Silencio. Demasiado.</p>'}</div></div>`;
  bindSfx($('#side'));
  $('#side').querySelectorAll('[data-a]').forEach(b => b.onclick = () => act(b.dataset.a));
  $('#side').querySelectorAll('[data-it]').forEach(s => { const it = ITEMS[s.dataset.it]; tipOn(s, `<b>${it.ic} ${it.n}</b><br>${it.d}`); s.onclick = () => itemMenu(s.dataset.it); });
  $('#b-menu').onclick = pauseMenu;
  renderSecInfo();
}
async function pauseMenu() {
  if (busy) return;
  const i = await ask({ title: 'Pausa', biome: SECTORS[G.sec].b, text: `Día ${G.day}, ${PHASES[G.phase].toLowerCase()}. Quedan ${aliveT().length} con vida.`, opts: [{ t: 'Seguir jugando', cls: 'primary' }, { t: 'Opciones de sonido', sub: `Música ${Math.round(Opt.music * 100)}%` }, { t: 'Abandonar partida', cls: 'danger' }] });
  if (i === 1) { Opt.music = Opt.music > 0 ? 0 : .5; Snd.setVol(Opt.music, Opt.sfx); saveOpt(); toast(Opt.music ? 'Música activada' : 'Música apagada'); }
  if (i === 2) { G.over = true; clearSave(); screenTitle(); }
}
async function itemMenu(id) {
  if (busy) return; killTip(); const it = ITEMS[id];
  const opts = [];
  if (it.map) opts.push({ t: id === 'trampa' ? 'Armarla acá' : `Usar en ${cap(G.P.name)}`, k: 'me' });
  if ((it.heal || it.food) && G.C.alive) opts.push({ t: `Dárselo a ${cap(G.C.name)}`, sub: '+lealtad', k: 'c' });
  opts.push({ t: 'Tirar', k: 'drop' }, { t: 'Cerrar', k: 'x' });
  const i = await ask({ title: `${it.ic} ${it.n}`, text: it.d + (!it.map ? '<br><span class="mut">Se usa durante el combate.</span>' : ''), biome: SECTORS[G.sec].b, opts });
  const k = opts[i].k; if (k === 'x') return;
  G.inv.splice(G.inv.indexOf(id), 1);
  const tgt = k === 'c' ? G.C : G.P;
  if (k === 'drop') { renderGame(); return; }
  if (k === 'c') loyal(it.food ? 12 : 8);
  if (it.heal) { const h = heal(tgt, it.heal * (teamPerk('medica') ? 1.5 : 1)); Snd.play('heal'); toast(`${it.ic} ${cap(tgt.name)} +${h} vida`); }
  if (it.food) { if (k === 'c') { heal(G.C, 10); toast(`${cap(G.C.name)} come. Te lo agradece.`); } else { if (id === 'bayas' && Math.random() < .25) { hurt(G.P, 12); toast('🤢 Eran de las malas. -12 vida'); Snd.play('bad'); } else { feed(it.food); if (id === 'racion') heal(G.P, 6); if (id === 'agua') G.energyBonus = 2; toast(`${it.ic} +${it.food} saciedad`); Snd.play('pick'); } } }
  if (id === 'trampa') { G.trap = G.sec; toast('🪤 Trampa armada en ' + SECTORS[G.sec].n); }
  if (id === 'veneno') { G.inv.push('veneno'); toast('El veneno se usa en combate.'); }
  if (!G.P.alive) return gameOver();
  renderGame();
}
// ---------- Acciones ----------
async function act(type, arg) {
  if (busy || G.over) return; busy = true; renderGame();
  const s = SECTORS[G.sec]; let encMult = 1, ambushP = .2;
  if (type === 'move') {
    G.prevSec = G.sec; G.moveT = performance.now(); G.sec = arg; Snd.play('step'); hoverSec = -1; addLog(`Te movés a <b>${SECTORS[arg].n}</b>.`);
    if (Math.random() < .35) await runScene(pickScene());
  } else if (type === 'explore') {
    if (G.feast === 2 && G.sec === 0) { const a = give(pick(LOOT_RARE)), b = give(pick(LOOT_RARE)); G.feast = 0; G.forceEnc = 1; fame(10); ach('festin'); await tell({ title: 'El festín', biome: 'corn', text: `Sobre la mesa hay mochilas con números. Agarrás ${a} y ${b}. Atrás tuyo, pasos...`, cls: 'good' }); }
    else if (Math.random() < .78) await runScene(pickScene());
    else { const found = Math.random() < .25 + s.loot * .15 ? give(rollLoot(.15 + s.loot * .1)) : null; await tell({ title: 'Explorando', biome: s.b, text: found ? `Revolviendo encontrás ${found}.` : 'Horas buscando y nada. Por lo menos nadie te vio.', cls: found ? 'good' : '' }); }
    encMult = 1.1;
  } else if (type === 'hunt') {
    const r = chk(Math.random() < .5 ? 'agi' : 'ast', 11 - s.food * 2);
    if (r.ok) { feed(30 + s.food * 8); const extra = Math.random() < .4 ? give('racion') : null; Snd.play('pick'); await tell({ title: 'Cazar', biome: s.b, text: `Conseguís comida. +${30 + s.food * 8} saciedad${extra ? ' y ' + extra : ''}. ${r.s}`, cls: 'good' }); }
    else await tell({ title: 'Cazar', biome: s.b, text: `${s.food ? 'Nada pica hoy.' : 'Acá no hay nada que cazar. Probá en el bosque o el río.'} ${r.s}`, cls: 'bad' });
  } else if (type === 'rest') {
    const h = 10 + G.P.res * 1.5; heal(G.P, h); heal(G.C, h); encMult = 1.15; ambushP = .55; Snd.play('heal');
    addLog(`Descansan. +${Math.round(h)} vida.`);
  } else if (type === 'hide') { heal(G.P, 5); heal(G.C, 5); encMult = .35; ambushP = .05; addLog('Se esconden y esperan.'); }
  else if (type === 'betray') {
    const i = await ask({ title: 'Traición', biome: s.b, faces: [{ ...G.C, enemy: true }], text: `${cap(G.C.name)} está de espaldas, afilando algo. Confía en vos${G.loyalty < 30 ? '... o eso parece' : ''}. ¿Lo hacés?`, opts: [{ t: 'Sí. Solo puede quedar uno.', cls: 'danger' }, { t: 'No. Todavía no.' }] });
    if (i === 0) {
      Snd.play('betray'); const r = await fight([G.P], [G.C], { firstStrike: true, preDmg: 18, noflee: true, banner: 'TRAICIÓN', intro: `Le clavás el primer golpe por la espalda.` });
      if (!G.P.alive) return gameOver();
      fame(18); ach('traidor'); mark(`Traicionaste a ${cap(G.C.name)}.`); addLog(`<b>${cap(G.P.name)}</b> traicionó a <b>${cap(G.C.name)}</b>`, 'k'); G.betrayed = 'you';
      if (G.C.weapon) give(G.C.weapon, true);
    } else { busy = false; renderGame(); return; }
  }
  if (!G.P.alive) return gameOver();
  await endPhase(encMult, ambushP);
}
async function endPhase(encMult = 1, ambushP = .2) {
  aiMove();
  // encuentro en tu sector
  const here = teamsIn(G.sec).filter(tm => !G.allies.includes(tm.id));
  if (here.length) {
    let p = (G.sec === 0 ? .8 : .55) * encMult * (teamPerk('sigilo') ? .6 : 1); if (G.forceEnc) p = 1;
    if (Math.random() < p) await encounter(pick(here), Math.random() < ambushP && !G.forceEnc);
  }
  G.forceEnc = 0;
  if (!G.P.alive) return gameOver();
  aiResolve();
  // peligros propios
  if (G.closed.includes(G.sec)) { hurt(G.P, 30); hurt(G.C, 30); shakeEl(); flash('#f00', .3); await tell({ title: 'Zona cerrada', biome: SECTORS[G.sec].b, text: 'El aire quema. Esta zona ya no es parte de la arena. -30 de vida. ¡Salí de acá!', cls: 'bad' }); if (!G.P.alive) { G.P.killer = 'la zona cerrada'; return gameOver(); } }
  if (G.hazard && G.hazard.sec === G.sec) { const d = G.hazard.dmg; hurt(G.P, d); hurt(G.C, d * .8); shakeEl(); await tell({ title: G.hazard.ic + ' ' + G.hazard.n, biome: SECTORS[G.sec].b, text: `${G.hazard.t} -${d} de vida.`, cls: 'bad' }); if (!G.P.alive) { G.P.killer = G.hazard.n.toLowerCase(); return gameOver(); } }
  // hambre
  G.hunger = Math.max(0, G.hunger - (teamPerk('resist') ? 5 : 10));
  if (G.hunger === 0) { hurt(G.P, 8); hurt(G.C, 6); loyal(-4); toast('🍖 El hambre te está matando. -8 vida'); if (!G.P.alive) { G.P.killer = 'el hambre'; return gameOver(); } }
  if (G.C.alive && G.C.hp < G.C.maxhp * .3 && Math.random() < .3) loyal(-3);
  if (await checkEnd()) return;
  G.phase++;
  if (G.phase > 2) { await nightFall(); if (G.over) return; G.day++; G.phase = 0; await newDay(); if (G.over) return; }
  busy = false; renderGame();
}
async function encounter(tm, ambush) {
  const foes = tm.m.filter(t => t.alive); if (!foes.length) return;
  const faces = foes.map(t => ({ ...t, enemy: true }));
  let pre = 0; if (G.trap === G.sec) { ach('trampa'); mark('Alguien cayó en tu trampa.'); pre = teamPerk('trampera') ? 30 : 16; G.trap = null; }
  const pw = teamPower(tm), mine = teamPower(myTeam()), feel = pw > mine * 1.25 ? 'Se los ve <b style="color:#ff6b5b">más fuertes que ustedes</b>.' : pw < mine * .8 ? 'Se los ve <b style="color:#4ec27a">débiles</b>.' : 'Parejo.';
  let r;
  if (ambush) {
    Snd.play('bad'); shakeEl();
    await tell({ title: '¡Emboscada!', biome: SECTORS[G.sec].b, faces, text: `${foes.map(t => cap(t.name)).join(' y ')} te caen encima sin aviso.`, cls: 'bad', btn: 'Defenderse' });
    r = await fight([G.P, G.C], foes, { ambush: true, preDmg: pre, banner: 'EMBOSCADA' });
  } else {
    const i = await ask({ tag: SECTORS[G.sec].n, title: 'Encuentro', biome: SECTORS[G.sec].b, faces, text: `${foes.map(t => `<b>${cap(t.name)}</b> ${t.weapon ? ITEMS[t.weapon].ic : '👊'}`).join(' y ')} aparecen ${foes.length > 1 ? 'entre' : 'detrás de'} los árboles. ${feel}${pre ? ' <b>Están parados justo sobre tu trampa.</b>' : ''}`, opts: [
      { t: '⚔️ Pelear', sub: G.trackBonus ? 'Atacás primero' : '', cls: 'primary' }, { t: '🗣️ Negociar', sub: 'Astucia' }, { t: '🏃 Escapar', sub: 'Agilidad' }] });
    if (i === 0) { r = await fight([G.P, G.C], foes, { preDmg: pre, firstStrike: !!G.trackBonus }); G.trackBonus = 0; }
    else if (i === 1) { const c = chk('ast', 11 + (G.day > 3 ? 2 : 0)); if (c.ok) { const gift = Math.random() < .3 && tm.inv.length ? tm.inv.splice(0, 1)[0] : null; await tell({ title: 'Tregua', biome: SECTORS[G.sec].b, faces, text: `Les hablás tranquilo. Bajan las armas. "Hoy no." ${gift ? 'Hasta te tiran ' + give(gift) + ' de buena onda.' : ''} ${c.s}`, cls: 'good' }); tm.sec = pick(SECTORS[G.sec].adj.filter(a => !G.closed.includes(a)).concat([0])); return; } await tell({ title: 'No funcionó', biome: SECTORS[G.sec].b, faces, text: `Se ríen en tu cara y atacan. ${c.s}`, cls: 'bad' }); r = await fight([G.P, G.C], foes, { ambush: true, preDmg: pre }); }
    else { const c = chk('agi', 10 - (teamPerk('sigilo') ? 3 : 0)); if (c.ok) { G.sec = pick(SECTORS[G.sec].adj.filter(a => !G.closed.includes(a)).concat([0])); fame(-2); await tell({ title: 'Escape', biome: SECTORS[G.sec].b, text: `Corrés hasta que no te dan más las piernas. Terminás en ${SECTORS[G.sec].n}. ${c.s}`, cls: 'good' }); return; } await tell({ title: 'Te alcanzan', biome: SECTORS[G.sec].b, faces, text: `Tropezás. Te alcanzan. ${c.s}`, cls: 'bad' }); r = await fight([G.P, G.C], foes, { ambush: true }); }
  }
  await afterFight(r, tm);
}
async function afterFight(r, tm) {
  if (r === 'win') {
    const got = []; tm.inv.splice(0).forEach(i => got.push(give(i))); tm.m.forEach(t => { if (!t.alive && t.weapon) { const w = t.weapon; t.weapon = null; const g = give(w, true); if (g) got.push(g); } });
    loyal(8); fame(5); [G.P, G.C].forEach(t => heal(t, t.maxhp * .15));
    await tell({ title: 'Ganaron', biome: SECTORS[G.sec].b, faces: tm.m.map(t => ({ ...t, enemy: true })), text: `${tm.m.filter(t => !t.alive).map(t => cap(t.name)).join(' y ')} ${tm.m.filter(t => !t.alive).length > 1 ? 'quedan' : 'queda'} en el piso. La adrenalina les devuelve algo de aire (+15% vida).${got.filter(Boolean).length ? ' Se llevan: ' + got.filter(Boolean).join(', ') + '.' : ''}`, cls: 'good' });
    if (tm.m.some(t => t.alive)) tm.sec = pick(SECTORS[G.sec].adj);
  } else if (r === 'fled') { const old = G.sec; G.sec = pick(SECTORS[G.sec].adj.filter(a => !G.closed.includes(a)).concat([0]).filter(a => a !== old)); loyal(-3); addLog(`Huyen a <b>${SECTORS[G.sec].n}</b>.`); }
  renderGame();
}
async function checkEnd() {
  if (!G.P.alive) { await gameOver(); return true; }
  const others = aliveTeams().filter(tm => !tm.player);
  if (!others.length) { await finalDilemma(); return true; }
  return false;
}
async function nightFall() {
  for (const id of G.allies.slice()) { const tm = G.teams[id]; if (!tm.m.some(t => t.alive)) { G.allies.splice(G.allies.indexOf(id), 1); continue; } if (Math.random() < .12 + G.day * .04) { G.allies.splice(G.allies.indexOf(id), 1); addLog(`<b>${tm.m.filter(t => t.alive).map(t => cap(t.name)).join(' y ')}</b> rompieron la alianza con ustedes.`, 'k'); toast('💔 Se rompió una alianza'); } }
  if (G.hunger >= 100) ach('hambre');
  aiNightBetrayals();
  const fallen = G.fallenToday.filter(t => t !== G.P); G.fallenToday = [];
  view(`<div class="screen night" style="background:radial-gradient(ellipse at top,#121a35,#05060c 70%)"><div class="mut" style="letter-spacing:.4em;text-transform:uppercase;font-size:.8rem">Fin del día ${G.day}</div><h2>El cielo de la noche</h2>
  <div class="fallen" id="fl">${fallen.length ? '' : '<p class="mut" style="font-size:1.1rem">Hoy no sonó ningún cañón.</p>'}</div><p class="mut" id="nt"></p><button class="btn primary" id="nx" style="margin-top:14px;visibility:hidden">Seguir</button></div>`);
  Snd.music('menu');
  for (const t of fallen) { const d = document.createElement('div'); d.innerHTML = `<img src="${portrait(t.ch, 160, 0)}"><span>${cap(t.name)}</span>`; $('#fl').appendChild(d); Snd.play('cannon'); await sleep(1100); }
  $('#nt').innerHTML = `Quedan <b style="color:#fff">${aliveT().length}</b> tributos.`;
  await sleep(400); $('#nx').style.visibility = 'visible';
  await new Promise(r => $('#nx').onclick = r);
  screenGame(); Snd.music('map');
  // patrocinadores
  await sponsorShop();
  // traición del compañero
  if (G.C.alive && G.P.alive) {
    G.loyalty = clamp(G.loyalty - 4, 0, 100);
    const p = G.loyalty < 30 ? (30 - G.loyalty) / 30 * .7 + .1 : 0;
    if (Math.random() < p) {
      Snd.play('betray'); shakeEl(); flash('#a00', .4);
      await tell({ title: 'Un ruido en la oscuridad', biome: SECTORS[G.sec].b, night: true, faces: [{ ...G.C, enemy: true }], text: `Te despertás con ${cap(G.C.name)} encima tuyo, cuchillo en mano. "Perdón. Solo puede quedar uno."`, cls: 'bad', btn: 'Pelear por tu vida' });
      const r = await fight([G.P], [G.C], { ambush: true, noflee: true, banner: 'TRAICIÓN' });
      if (!G.P.alive) { G.over = true; return gameOver(); }
      mark(`${cap(G.C.name)} te traicionó y lo mataste.`); ach('sobrevivi'); fame(15); G.betrayed = 'them'; if (G.C.weapon) give(G.C.weapon, true);
    }
  }
  if (aliveTeams().filter(tm => !tm.player).length === 0) { await finalDilemma(); }
}
const SHOP = [['racion', 12], ['agua', 8], ['vendas', 14], ['botiquin', 24], ['arroj', 16], ['polvo', 18], ['escudo', 22], ['humo', 20], ['trampa', 15], ['veneno', 18], ['bomba', 34], ['lanza', 30], ['hacha', 36]];
async function sponsorShop() {
  let bought = 0;
  while (G.fame >= 8 && bought < 3) {
    const off = shuffle(SHOP.filter(([, c]) => c <= G.fame)).slice(0, 4).map(([id, c]) => [id, teamPerk('suerte') ? Math.round(c * .8) : c]);
    if (!off.length) break;
    const i = await ask({ tag: `Audiencia: ⭐ ${G.fame}`, title: '🪂 Patrocinadores', biome: SECTORS[G.sec].b, night: true, text: bought ? '¿Algo más? Los patrocinadores siguen mirando.' : 'Te llega un mensaje: los patrocinadores quieren mandarte algo. Elegí qué pedir con la audiencia que juntaste.', opts: [...off.map(([id, c]) => ({ t: `${ITEMS[id].ic} ${ITEMS[id].n}`, sub: `⭐ ${c}` })), { t: bought ? 'Listo, gracias' : 'Guardar la audiencia para después', cls: 'ghost' }] });
    if (i >= off.length) break;
    const [id, c] = off[i]; G.fame -= c; bought++; Snd.play('drop'); toast(`🪂 Llegó: ${give(id)}`);
  }
}
async function newDay() {
  G.feast = G.feast === 1 ? 2 : 0;
  if (G.feast === 2) G.teams.forEach(tm => { if (!tm.player && Math.random() < .5) tm.sec = 0; });
  const ring = [1, 2, 3, 4, 5, 6, 7, 8];
  if (G.day >= 3) { const open = ring.filter(s => !G.closed.includes(s)); for (let k = 0; k < (G.day >= 5 ? 3 : 2) && open.length > 1; k++) G.closed.push(open.splice(ri(0, open.length - 1), 1)[0]); }
  const openR = ring.filter(s => !G.closed.includes(s)), hz = pick(HAZARDS);
  G.hazard = G.day >= 2 && openR.length ? { ...hz, sec: pick(openR) } : null;
  const others = aliveTeams().filter(tm => !tm.player).length;
  if (G.day >= 6 || others <= 1) return finale();
  const msg = [`Amanece el día ${G.day}.`];
  if (G.hazard) msg.push(`${G.hazard.ic} <b>${G.hazard.n}</b> en ${SECTORS[G.hazard.sec].n}.`);
  if (G.day >= 3) msg.push(`⛔ La arena se achica: ${G.closed.map(s => SECTORS[s].n).join(', ')} están cerradas.${G.closed.includes(G.sec) ? ' <b>¡Estás en una zona cerrada, movete ya!</b>' : ''}`);
  if (G.day === 5) msg.push('<b>Mañana es el final. Todos a la Cornucopia.</b>');
  if (G.feast === 2) msg.push('🎁 Hoy hay festín en la Cornucopia.');
  addLog(msg.join(' '));
  Snd.play('gong');
  await tell({ tag: `Día ${G.day}`, title: 'Amanece', biome: SECTORS[G.sec].b, text: msg.join('<br>') });
}
async function finale() {
  ach('final'); busy = true; G.sec = 0; renderGame();
  await tell({ tag: 'El final', title: 'Todos a la Cornucopia', biome: 'corn', text: 'Las paredes de la arena avanzan. El suelo tiembla. No queda dónde esconderse: el Consejo los quiere a todos en el centro. Ahora.' });
  let ai = aliveTeams().filter(tm => !tm.player);
  while (ai.length > 1) { const [a, b] = shuffle(ai); aiFight(a, b); ai = aliveTeams().filter(tm => !tm.player); }
  if (G.fallenToday.length) await tell({ title: 'Mientras llegabas', biome: 'corn', text: `En el centro ya hubo sangre: ${G.fallenToday.filter(t => t !== G.P && t !== G.C).map(t => '<b>' + cap(t.name) + '</b>').join(', ')} no llegaron a verte.`, cls: 'bad' });
  if (ai.length) {
    const tm = ai[0];
    await tell({ title: 'Los últimos', biome: 'corn', faces: tm.m.filter(t => t.alive).map(t => ({ ...t, enemy: true })), text: `Del otro lado de la Cornucopia: ${tm.m.filter(t => t.alive).map(t => cap(t.name)).join(' y ')}. No hay a dónde correr.`, btn: 'Pelear' });
    const r = await fight([G.P, G.C], tm.m, { final: true, banner: 'FINAL' });
    if (!G.P.alive) return gameOver();
    await afterFight(r, tm);
  }
  await finalDilemma();
}
async function finalDilemma() {
  if (G.over) return; G.over = true;
  if (!G.C.alive) return victory();
  const i = await ask({ tag: 'Último acto', title: 'Solo puede quedar uno', biome: 'corn', faces: [G.P, G.C], text: `La voz del Consejo retumba: "Felicitaciones a los dos últimos tributos. Les recordamos que hay un solo vencedor." ${cap(G.C.name)} te mira. Lealtad: ${G.loyalty}.`, opts: [
    { t: '⚔️ Pelear contra tu compañero', cls: 'danger' }, { t: '🤝 Negarse juntos a seguir', sub: `Astucia + audiencia (${G.fame})` }, { t: '🕊️ Dejarlo ganar a él' }] });
  if (i === 0) { Snd.play('betray'); G.over = false; const r = await fight([G.P], [G.C], { noflee: true, banner: 'UNO SOLO' }); G.over = true; if (!G.P.alive) return gameOver(true); mark(`Mataste a ${cap(G.C.name)} en el final.`); return victory(); }
  if (i === 1) { const c = chk('ast', 14 - Math.floor(G.fame / 15) - Math.floor(G.loyalty / 30)); if (c.ok) { G.both = true; return victory(`Se paran espalda con espalda y miran a las cámaras. El público enloquece. Después de un silencio eterno: "Se anuncia un cambio en las reglas. Ambos tributos... son los vencedores." ${c.s}`); } await tell({ title: 'Silencio', biome: 'corn', text: `Nadie responde. Y entonces ${cap(G.C.name)} se mueve primero... ${c.s}`, cls: 'bad', btn: 'Pelear' }); G.over = false; const r = await fight([G.P], [G.C], { ambush: true, noflee: true, banner: 'UNO SOLO' }); G.over = true; if (!G.P.alive) return gameOver(true); return victory(); }
  ach('martir'); G.P.alive = false; G.P.killer = 'su propia decisión'; G.P.diedDay = G.day; mark(`Te sacrificaste para que ${cap(G.C.name)} gane.`);
  return gameOver(true, `Le das la mano a ${cap(G.C.name)}, das un paso atrás y te dejás caer. ${cap(G.C.name)} gana los Juegos. El público llora. Vos te volvés leyenda.`);
}
// ---------- Final ----------
function placeOf() { return aliveT().length + 1; }
async function victory(txt) {
  G.over = true; busy = false; REC.plays++; REC.wins++; REC.best = 1; REC.kills = Math.max(REC.kills, G.P.kills); saveRec();
  ach('vencedor'); if (!G.P.kills) ach('pacifista'); if (G.both) ach('juntos'); if (!G.C.alive) ach('solo'); if (Opt.diff > 1.1) ach('dificil');
  Snd.music('none'); Snd.play('win'); flash('#ffd27a', .6);
  endScreen(true, txt || `${cap(G.P.name)} es el vencedor de los Juegos de La Población.`, G.both ? `${cap(G.P.name)} & ${cap(G.C.name)}` : cap(G.P.name));
}
async function gameOver(skipSim, txt) {
  if (G.ended) return; G.ended = true; G.over = true; busy = false;
  const place = placeOf(); REC.plays++; REC.best = Math.min(REC.best, place); REC.kills = Math.max(REC.kills, G.P.kills); saveRec();
  Snd.music('none'); Snd.play('lose'); Snd.play('cannon');
  // simular el resto
  let guard = 0, al = aliveTeams().filter(tm => !tm.player || tm.m.some(t => t.alive && t !== G.P));
  if (G.C.alive) myTeam().player = false;
  while (aliveTeams().length > 1 && guard++ < 60) { const ts = aliveTeams(); if (ts.length > 1) { const [a, b] = shuffle(ts); aiFight(a, b); } }
  const winT = aliveTeams()[0], winner = winT ? winT.m.filter(t => t.alive).map(t => cap(t.name)).join(' y ') : 'nadie';
  endScreen(false, txt || `${cap(G.P.name)} cayó en el puesto #${place}. ${G.P.killer ? 'Lo mató ' + (typeof G.P.killer === 'string' ? G.P.killer : '') + '.' : ''}`, winner, place);
}
function confetti() {
  const cv = document.createElement('canvas'); cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:40'; document.body.appendChild(cv);
  const W = cv.width = innerWidth, H = cv.height = innerHeight, c = cv.getContext('2d'), t0 = performance.now();
  const ps = Array.from({ length: 160 }, () => ({ x: Math.random() * W, y: -Math.random() * H, vx: rnd(-1, 1), vy: rnd(2, 5), r: rnd(0, 6), vr: rnd(-.2, .2), w: rnd(5, 10), col: pick(['#ffd27a', '#ff6a2b', '#fff3e2', '#e8b65a', '#c2410c']) }));
  (function loop(now) {
    const k = now - t0; if (k > 6000) return cv.remove(); requestAnimationFrame(loop); c.clearRect(0, 0, W, H); c.globalAlpha = k > 4500 ? (6000 - k) / 1500 : 1;
    ps.forEach(p => { p.x += p.vx + Math.sin(now / 400 + p.r) * .6; p.y += p.vy; p.r += p.vr; if (p.y > H + 10) p.y = -10; c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.col; c.fillRect(-p.w / 2, -p.w / 4, p.w, p.w / 2); c.restore(); });
  })(t0);
}
function endScreen(won, txt, winner, place) {
  clearSave();
  BG.set(true);
  view(`<div class="screen"><div class="wrap" style="max-width:820px"><div style="text-align:center"><span class="tag">${won ? 'Vencedor' : 'Fin del juego'}</span><div class="endbig disp" style="margin-top:10px;${won ? 'color:var(--gold)' : 'color:#ff6b5b'}">${won ? '¡GANASTE!' : 'CAÍSTE'}</div>
  <div style="display:flex;justify-content:center;gap:10px;margin:18px 0"><img src="${portrait(G.P.ch, 200, won ? 0 : 2)}" style="width:110px;height:110px;border-radius:50%;border:3px solid ${won ? 'var(--gold)' : '#555'}">${G.both ? `<img src="${portrait(G.C.ch, 200)}" style="width:110px;height:110px;border-radius:50%;border:3px solid var(--gold)">` : ''}</div>
  <p style="font-size:1.05rem;line-height:1.6;max-width:600px;margin:0 auto">${txt}</p>${!won ? `<p class="mut" style="margin-top:8px">Ganador de los Juegos: <b style="color:var(--gold)">${winner}</b></p>` : ''}</div>
  <div class="stats"><div><b>#${won ? 1 : place}</b><span>Puesto</span></div><div><b>${G.P.kills}</b><span>Bajas</span></div><div><b>${G.day}</b><span>Días</span></div><div><b>${G.fame}</b><span>Audiencia</span></div><div><b>${G.stats ? G.stats.dealt : 0}</b><span>Daño hecho</span></div><div><b>${G.stats ? G.stats.taken : 0}</b><span>Daño recibido</span></div></div>
  <div class="card"><div class="sectitle">Tu historia</div><div class="timeline">${G.timeline.length ? G.timeline.map(t => `<p>${t}</p>`).join('') : '<p class="mut">Pasaste desapercibido.</p>'}</div></div>
  <div class="card" style="margin-top:12px"><div class="sectitle">Los 16</div><div class="grid16" style="padding:12px">${G.all.slice().sort((a, b) => (b.alive - a.alive) || (b.diedDay - a.diedDay)).map(t => `<div class="tcard ${t.alive ? 'sel' : ''}" style="cursor:default"><img src="${portrait(t.ch, 120, t.alive ? 0 : 2)}" class="${t.alive ? '' : 'dead'}"><div class="nm">${cap(t.name)}</div><div class="pk">${t.alive ? 'Sobrevivió' : 'Día ' + t.diedDay + ' · ' + esc(t.killer || '')}${t.kills ? ' · ' + t.kills + '☠' : ''}</div></div>`).join('')}</div></div>
  <div style="display:flex;gap:10px;justify-content:center;margin:20px 0 40px;flex-wrap:wrap"><button class="btn primary" id="again">Jugar otra vez</button><button class="btn" id="home">Menú</button></div></div></div>`);
  $('#again').onclick = screenSelect; $('#home').onclick = screenTitle;
  if (won) confetti();
}
window.__dbg = () => G;
screenTitle();
// atajos de teclado
addEventListener('keydown', e => {
  if (e.repeat) return;
  const cb = [...document.querySelectorAll('.combat .acts-c .btn:not([disabled])')];
  if (cb.length && /^[1-9]$/.test(e.key)) { const b = cb[+e.key - 1]; if (b) b.click(); return; }
  const mb = [...document.querySelectorAll('.modal [data-i]:not([disabled])')];
  if (mb.length) { if (/^[1-9]$/.test(e.key) && mb[+e.key - 1]) mb[+e.key - 1].click(); else if ((e.key === 'Enter' || e.key === ' ') && mb.length === 1) { e.preventDefault(); mb[0].click(); } return; }
  const k = { e: 'explore', c: 'hunt', d: 'rest', s: 'hide' }[e.key.toLowerCase()];
  const b = k && document.querySelector(`#side [data-a="${k}"]:not([disabled])`); if (b) b.click();
});
