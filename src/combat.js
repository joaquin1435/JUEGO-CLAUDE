// ===== Combate por turnos animado =====
async function fight(allies, enemies, opt = {}) {
  allies = allies.filter(t => t.alive); enemies = enemies.filter(t => t.alive);
  Snd.music('combat'); killTip();
  const root = document.createElement('div'); root.className = 'combat';
  root.innerHTML = `<canvas></canvas><div class="cbar"><div class="cmsg"></div><div class="targets"></div><div class="row acts-c"></div></div>`;
  document.body.appendChild(root);
  const cv = root.querySelector('canvas'), c = cv.getContext('2d'), msgEl = root.querySelector('.cmsg'), tgEl = root.querySelector('.targets'), actEl = root.querySelector('.acts-c');
  const biome = SECTORS[G.sec].b, bgc = document.createElement('canvas');
  let W, H, S, shakeT = 0, running = true, projs = [], banner = null;
  const mk = (t, side, i) => ({ t, side, L: t.L, name: t.name, dir: side === 'A' ? 1 : -1, seed: Math.random() * 9, energy: 1 + (side === 'A' ? G.energyBonus : 0), blind: 0, shield: 0, poison: 0, stun: 0, guard: false, coat: 0, idx: i, get hp() { return t.hp; }, get maxhp() { return t.maxhp; }, get weapon() { return t.weapon; }, get dead() { return !t.alive; }, deadT: 0, scale: 1 });
  const F = [...allies.map((t, i) => mk(t, 'A', i)), ...enemies.map((t, i) => mk(t, 'B', i))];
  G.energyBonus = 0;
  function layout() {
    W = cv.width = cv.clientWidth * devicePixelRatio; H = cv.height = cv.clientHeight * devicePixelRatio; S = clamp(Math.min(H / 330, W / 470), .7, 2.6); const port = W < H;
    bgc.width = W; bgc.height = H; paintBiome(bgc.getContext('2d'), W, H, biome, { night: G.phase === 2, seed: 'c' });
    F.forEach(f => { const n = F.filter(x => x.side === f.side).length; f.scale = S; f.x = W * (f.side === 'A' ? (n > 1 ? (f.idx ? .12 : .32) : .25) : (n > 1 ? (f.idx ? .88 : .68) : .75)); f.y = H * (n > 1 ? (f.idx ? (port ? .74 : .84) : .9) : .88); });
  }
  addEventListener('resize', layout); requestAnimationFrame(layout);
  const say = h => msgEl.innerHTML = h;
  function frame(now) {
    if (!running) return; requestAnimationFrame(frame); if (!W) return;
    c.save(); if (now < shakeT) c.translate(rnd(-8, 8), rnd(-6, 6));
    c.drawImage(bgc, 0, 0);
    [...F].sort((a, b) => a.y - b.y).forEach(f => drawFighter(c, f, now));
    // barras de vida
    F.forEach(f => {
      const bw = 90 * S, x = clamp(f.x - bw / 2, 6, W - bw - 6), y = f.y - 150 * S; if (f.dead) return;
      c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(x - 2, y - 2, bw + 4, 10 * S + 4);
      c.fillStyle = f.side === 'A' ? '#4ec27a' : '#e2403a'; c.fillRect(x, y, bw * f.hp / f.maxhp, 10 * S);
      c.font = `800 ${13 * S}px Inter`; c.textAlign = 'center'; c.fillStyle = f === cur ? '#ffd27a' : '#fff'; c.fillText(cap(f.name) + (f === cur ? ' ◆' : ''), x + bw / 2, y - 6 * S);
      c.font = `600 ${10 * S}px Inter`; c.fillStyle = '#ccc'; c.fillText(`${f.hp}/${f.maxhp}  ⚡${f.energy}`, x + bw / 2, y + 22 * S);
      if (f === target) { c.strokeStyle = '#e2403a'; c.lineWidth = 3; c.beginPath(); c.ellipse(f.x, f.y + 2, 34 * S, 9 * S, 0, 0, 7); c.stroke(); }
    });
    projs = projs.filter(p => now - p.t0 < p.dur);
    projs.forEach(p => { const k = (now - p.t0) / p.dur, x = p.x0 + (p.x1 - p.x0) * k, y = p.y0 + (p.y1 - p.y0) * k - Math.sin(k * Math.PI) * 40 * S; c.font = `${26 * S}px sans-serif`; c.textAlign = 'center'; c.save(); c.translate(x, y); c.rotate(k * (p.spin || 0)); c.fillText(p.ic, 0, 0); c.restore(); });
    weather(now);
    Parts.draw(c, now);
    if (banner && now - banner.t0 < 1400) { const k = (now - banner.t0) / 1400, a = k < .15 ? k / .15 : k > .8 ? (1 - k) / .2 : 1; c.globalAlpha = a; c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(0, H * .35, W, H * .18); c.font = `${Math.min(H * .12, W * .12)}px "Bebas Neue",Impact,sans-serif`; c.textAlign = 'center'; c.fillStyle = banner.col; c.fillText(banner.t, W / 2 + (1 - a) * 60, H * .48); c.globalAlpha = 1; }
    c.restore();
  }
  const wx = { forest: ['🍂', 1], river: ['rain', 1], swamp: ['rain', 1], mountain: ['snow', 1], beach: ['dust', 1], field: ['dust', 1], ruins: ['dust', 1], cave: ['drip', 1], corn: ['dust', 1] }[biome][0], drops = Array.from({ length: wx === 'rain' ? 140 : 50 }, () => ({ x: Math.random(), y: Math.random(), v: rnd(.4, 1), s: rnd(.5, 1.5) }));
  function weather(now) {
    const night = G.phase === 2;
    for (const d of drops) {
      d.y += (wx === 'rain' ? .018 : wx === 'snow' ? .002 : wx === '🍂' ? .003 : .0008) * d.v; d.x += wx === 'dust' ? .0009 * d.v : wx === 'rain' ? .003 : Math.sin(now / 900 + d.s * 9) * .0008;
      if (d.y > 1) { d.y = -.02; d.x = Math.random(); } if (d.x > 1) d.x = 0;
      const X = d.x * W, Y = d.y * H;
      if (wx === 'rain') { c.strokeStyle = 'rgba(170,200,255,.35)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(X, Y); c.lineTo(X + 4, Y + 18 * d.v); c.stroke(); }
      else if (wx === 'snow') { c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(X, Y, 2 * d.s * S / 1.5, 0, 7); c.fill(); }
      else if (wx === '🍂') { c.font = `${10 * d.s * S}px sans-serif`; c.save(); c.translate(X, Y); c.rotate(now / 600 * d.v); c.fillText('🍂', 0, 0); c.restore(); }
      else if (wx === 'drip') { c.fillStyle = 'rgba(150,170,220,.4)'; c.fillRect(X, Y, 1.5, 6); }
      else { c.fillStyle = night ? `rgba(200,255,140,${.4 + Math.sin(now / 300 + d.s * 7) * .4})` : 'rgba(255,230,190,.25)'; c.beginPath(); c.arc(X, Y * .9, (night ? 2 : 1.2) * d.s, 0, 7); c.fill(); }
    }
    if (night) { c.fillStyle = 'rgba(10,20,60,.28)'; c.fillRect(0, 0, W, H); }
  }
  requestAnimationFrame(frame);
  const anim = (f, type, dur, extra) => { f.anim = { type, t0: performance.now(), dur: dur / Opt.speed, ...extra }; return sleep(dur); };
  const throwP = (a, b, ic, dur = 380) => { projs.push({ x0: a.x, y0: a.y - 80 * S, x1: b.x, y1: b.y - 70 * S, ic, t0: performance.now(), dur: dur / Opt.speed, spin: ic === '🏹' || ic === '➶' ? 0 : 12 }); return sleep(dur); };
  const showBanner = (t, col = '#ffd27a') => { banner = { t, col, t0: performance.now() }; };
  const foes = f => F.filter(x => x.side !== f.side && !x.dead), friends = f => F.filter(x => x.side === f.side && !x.dead);
  let cur = null, target = null;

  function calc(a, d, mult = 1) {
    const ta = a.t, w = ta.weapon ? ITEMS[ta.weapon] : null;
    let hit = .9 - d.t.agi * .022 - (hasPerk(d.t, 'escurri') ? .15 : 0) - (a.blind > 0 ? .6 : 0) + (ta.weapon === 'hacha' ? -.05 : 0) + (opt.mult || 0);
    if (d.stun > 0) hit = 1;
    let dmg = (3 + ta.fue * 1.3 + (w ? w.w : 0) + (hasPerk(ta, 'carnicero') ? 3 : 0)) * rnd(.85, 1.15) * mult;
    if (hasPerk(ta, 'berserk') && ta.hp < ta.maxhp * .4) dmg *= 1.5;
    if (a.side === 'B') dmg *= Opt.diff || 1;
    const critC = .08 + (hasPerk(ta, 'halcon') ? .15 : 0) + (w && w.crit ? w.crit / 100 : 0) + (hasPerk(ta, 'arquero') && ta.weapon === 'arco' ? .1 : 0);
    const crit = Math.random() < critC; if (crit) dmg *= 1.65;
    return { hit: Math.random() < hit, dmg, crit };
  }
  async function strike(a, d, mult = 1, label) {
    const r = calc(a, d, mult), ranged = a.t.weapon === 'arco';
    Snd.play('swing');
    if (ranged) { anim(a, 'shoot', 500); await throwP(a, d, '➶', 300); }
    else await anim(a, 'atk', 360, { dist: Math.abs(d.x - a.x) - 70 * S });
    if (!r.hit) { anim(d, 'dodge', 420); Parts.text(d.x, d.y - 120 * S, 'ESQUIVA', '#9ad1ff'); Snd.play('miss'); say(`${cap(d.name)} esquiva ${label ? 'el ' + label : 'el golpe'} de ${cap(a.name)}.`); await sleep(450); return; }
    let dmg = r.dmg;
    if (d.guard) { dmg *= .5; Snd.play('block'); Parts.burst(d.x + 20 * d.dir * -1, d.y - 70 * S, 10, '#9ad1ff', 4, 400, .1, 2.5); }
    if (d.shield > 0) { dmg *= .5; d.shield--; Snd.play('block'); }
    dmg = Math.max(1, Math.round(dmg));
    if (a.coat > 0) { a.coat--; d.poison = 3; }
    if (a.t.weapon === 'maza' && Math.random() < .25) d.stun = 1;
    await applyDmg(d, dmg, a, r.crit);
    say(`${cap(a.name)} ${r.crit ? '<b style="color:#ffd27a">¡CRÍTICO!</b> ' : ''}le pega a ${cap(d.name)}: <b>${dmg}</b>${d.stun > 0 ? ' 💫 aturdido' : ''}${d.poison === 3 && a.coat >= 0 ? '' : ''}`);
    await sleep(380);
  }
  async function applyDmg(d, dmg, a, crit) {
    d.t.flash = 0; d.flash = performance.now(); anim(d, 'hurt', 320);
    Parts.burst(d.x, d.y - 70 * S, crit ? 26 : 14, crit ? '#ffcf5a' : '#b3191c', crit ? 7 : 4.5, 750, .3, 3 * S / 1.4);
    Parts.text(d.x, d.y - 125 * S, (crit ? '¡' : '') + '-' + dmg + (crit ? '!' : ''), crit ? '#ffd27a' : '#ff6b5b', crit);
    Snd.play(crit ? 'crit' : 'hit'); if (crit) { shakeT = performance.now() + 260; flash('#fff', .18); }
    hurt(d.t, dmg, a && a.t);
    if (d.dead) { d.deadT = performance.now(); Snd.play('death'); Parts.burst(d.x, d.y - 40 * S, 30, '#555', 3, 1200, .05, 5); if (d.t === G.P || d.t === G.C || (a && (a.t === G.P || a.t === G.C))) setTimeout(() => Snd.play('cannon'), 600); showBanner(cap(d.name) + ' cae', d.side === 'A' ? '#ff6b5b' : '#ffd27a'); fame(a && a.side === 'A' ? 10 : 0); await sleep(900); }
  }
  async function useItem(f, id, tgt) {
    const it = ITEMS[id], inv = f.side === 'A' ? G.inv : (enemyTeam ? enemyTeam.inv : []);
    const k = inv.indexOf(id); if (k < 0) return; inv.splice(k, 1);
    if (it.heal) { const who = friends(f).sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0]; let h = it.heal * (hasPerk(f.t, 'medica') || (f.side === 'A' && teamPerk('medica')) ? 1.5 : 1); h = heal(who.t, h); who.poison = 0; await anim(f, 'cast', 400); Parts.burst(who.x, who.y - 70 * S, 18, '#6dffa0', 3, 800, -.05, 3); Parts.text(who.x, who.y - 125 * S, '+' + h, '#6dffa0'); Snd.play('heal'); say(`${cap(f.name)} usa ${it.n} en ${cap(who.name)}: +${h}`); }
    else if (id === 'arroj') { anim(f, 'shoot', 400); Snd.play('throwk'); await throwP(f, tgt, '🗡'); const d = Math.round(16 * rnd(.9, 1.15)); await applyDmg(tgt, d, f, false); say(`${cap(f.name)} lanza un cuchillo a ${cap(tgt.name)}: <b>${d}</b>`); }
    else if (id === 'polvo') { anim(f, 'cast', 400); await throwP(f, tgt, '✨'); tgt.blind = 2; Parts.burst(tgt.x, tgt.y - 90 * S, 30, '#fff6c2', 4, 900, .02, 3); Snd.play('smoke'); say(`${cap(tgt.name)} queda ciego.`); }
    else if (id === 'escudo') { f.shield = 2; await anim(f, 'guard', 400); Snd.play('block'); say(`${cap(f.name)} levanta un escudo.`); }
    else if (id === 'veneno') { f.coat = 3; await anim(f, 'cast', 400); say(`${cap(f.name)} unta el arma con veneno.`); }
    else if (id === 'bomba') { anim(f, 'shoot', 400); const fs = foes(f); await throwP(f, fs[0], '💣', 500); shakeT = performance.now() + 500; flash('#ffb04a', .5); Snd.play('crit'); Parts.burst(fs[0].x, fs[0].y - 40 * S, 60, '#ff9a3c', 9, 1000, .2, 5); for (const e of fs) await applyDmg(e, Math.round(22 * rnd(.9, 1.1)), f, false); say('¡BOOM!'); }
    else if (id === 'humo') { Snd.play('smoke'); Parts.burst(f.x, f.y - 50 * S, 80, '#aaa', 6, 1500, -.02, 9); say('Una nube de humo lo tapa todo...'); await sleep(700); return 'fled'; }
    await sleep(350);
  }
  const enemyTeam = G.teams.find(tm => tm.m.includes(enemies[0]));
  // ---- IA ----
  async function aiTurn(f) {
    const fs = foes(f); if (!fs.length) return;
    const tgt = fs.sort((a, b) => a.hp - b.hp)[0], inv = f.side === 'A' ? G.inv : (enemyTeam ? enemyTeam.inv : []);
    if (f.t.hp < f.t.maxhp * .35) { const h = inv.find(i => ITEMS[i].heal); if (h && Math.random() < .8) return useItem(f, h); }
    if (f.side === 'B') { const off = inv.find(i => ['arroj', 'polvo', 'bomba'].includes(i)); if (off && Math.random() < .3) return useItem(f, off, tgt); }
    if (f.energy >= 3 && Math.random() < .6) { f.energy -= 3; say(`${cap(f.name)} carga un golpe fuerte...`); await sleep(300); return strike(f, tgt, 1.7, 'golpe fuerte'); }
    if (Math.random() < .12) { f.guard = true; f.energy++; anim(f, 'guard', 500); say(`${cap(f.name)} se cubre.`); return sleep(500); }
    return strike(f, tgt);
  }
  // ---- turno del jugador ----
  function renderTargets(me) { const fs = foes(me); if (!target || target.dead) target = fs[0]; tgEl.innerHTML = fs.length > 1 ? fs.map((e, i) => `<button class="btn ${e === target ? 'on' : ''}" data-t="${F.indexOf(e)}">🎯 ${cap(e.name)} ${e.hp}</button>`).join('') : ''; tgEl.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { target = F[+b.dataset.t]; renderTargets(me); }); }
  cv.onclick = e => { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * devicePixelRatio; const fs = F.filter(f => f.side === 'B' && !f.dead); if (!fs.length) return; target = fs.sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0]; renderTargets(G.P._f || F[0]); };
  function playerTurn(f) {
    return new Promise(res => {
      renderTargets(f);
      const ci = [...new Set(G.inv.filter(i => ITEMS[i].cmb))];
      const fleeP = clamp(.3 + f.t.agi * .04 + (teamPerk('sigilo') ? .2 : 0) - (opt.final ? 1 : 0), 0, .9);
      actEl.innerHTML = `<button class="btn primary" data-a="atk"><span class="ic">⚔️</span>Atacar</button>
        <button class="btn" data-a="pow" ${f.energy < 3 ? 'disabled' : ''}><span class="ic">💥</span>Golpe fuerte<small>⚡3</small></button>
        <button class="btn" data-a="def"><span class="ic">🛡️</span>Cubrirse<small>+⚡</small></button>
        <button class="btn" data-a="item" ${ci.length ? '' : 'disabled'}><span class="ic">🎒</span>Objeto<small>${ci.length}</small></button>
        <button class="btn" data-a="run" ${opt.final || opt.noflee ? 'disabled' : ''}><span class="ic">🏃</span>Huir<small>${Math.round(fleeP * 100)}%</small></button>`;
      bindSfx(actEl);
      actEl.querySelectorAll('[data-a]').forEach(b => b.onclick = async () => {
        const a = b.dataset.a;
        if (a === 'item') { actEl.innerHTML = ci.map(i => `<button class="btn" data-i="${i}"><span class="ic">${ITEMS[i].ic}</span>${ITEMS[i].n}<small>x${G.inv.filter(x => x === i).length}</small></button>`).join('') + `<button class="btn ghost" data-i="">↩ Volver</button>`; bindSfx(actEl); actEl.querySelectorAll('[data-i]').forEach(x => x.onclick = () => { if (!x.dataset.i) return playerTurn(f).then(res); actEl.innerHTML = ''; res({ a: 'item', id: x.dataset.i }); }); return; }
        actEl.innerHTML = ''; res({ a, fleeP });
      });
    });
  }
  // ---- bucle ----
  const vs = document.createElement('div'); vs.className = 'vs';
  vs.innerHTML = `<div class="vs-side l">${allies.map(t => `<img src="${portrait(t.ch, 200)}">`).join('')}</div><div class="vs-mid disp">${opt.banner || 'VS'}</div><div class="vs-side r">${enemies.map(t => `<img src="${portrait(t.ch, 200)}">`).join('')}</div>`;
  root.appendChild(vs); Snd.play('crit'); await sleep(1300); vs.classList.add('out'); setTimeout(() => vs.remove(), 500);
  say(opt.intro || '¡Pelea!'); await sleep(300);
  if (opt.preDmg) { for (const e of foes(F[0])) await applyDmg(e, opt.preDmg, F[0], false); say('¡Cayeron en tu trampa!'); await sleep(600); }
  // arcos: tiro gratis
  for (const f of F.filter(f => f.t.weapon === 'arco' && !f.dead)) { const fs = foes(f); if (fs.length) { say(`${cap(f.name)} dispara primero con el arco.`); await strike(f, fs[0], .8, 'flechazo'); } }
  let result = null, round = 0;
  while (!result) {
    round++;
    let order = F.filter(f => !f.dead).sort((a, b) => (b.t.agi + rnd(0, 4)) - (a.t.agi + rnd(0, 4)));
    if (round === 1 && opt.ambush) order.sort((a, b) => (a.side === 'B' ? -1 : 1) - (b.side === 'B' ? -1 : 1));
    if (round === 1 && opt.firstStrike) order.sort((a, b) => (a.side === 'A' ? -1 : 1) - (b.side === 'A' ? -1 : 1));
    if (teamPerk('estratega')) { const p = order.findIndex(f => f.t === G.P); if (p > 0) order.unshift(order.splice(p, 1)[0]); }
    for (const f of order) {
      if (f.dead) continue;
      if (!foes(f).length) break;
      cur = f; f.guard = false;
      if (f.poison > 0) { f.poison--; Parts.text(f.x, f.y - 125 * S, '☠-5', '#9cff6a'); hurt(f.t, 5); if (f.dead) { f.deadT = performance.now(); Snd.play('death'); await sleep(700); continue; } }
      if (f.stun > 0) { f.stun--; say(`${cap(f.name)} está aturdido y pierde el turno.`); await sleep(700); continue; }
      if (f.t === G.P || (Opt.ctrl && f.side === 'A' && f.t === G.C)) {
        say(f.t === G.P ? `Tu turno, <b>${cap(f.name)}</b>.` : `Turno de <b>${cap(f.name)}</b> (tu compañero).`);
        const ch = await playerTurn(f);
        if (ch.a === 'atk') await strike(f, target && !target.dead ? target : foes(f)[0]);
        else if (ch.a === 'pow') { f.energy -= 3; await strike(f, target && !target.dead ? target : foes(f)[0], 1.75, 'golpe fuerte'); }
        else if (ch.a === 'def') { f.guard = true; f.energy++; anim(f, 'guard', 500); say('Te cubrís.'); await sleep(450); }
        else if (ch.a === 'item') { const r = await useItem(f, ch.id, target && !target.dead ? target : foes(f)[0]); if (r === 'fled') { result = 'fled'; break; } }
        else if (ch.a === 'run') { if (Math.random() < ch.fleeP) { F.filter(x => x.side === 'A' && !x.dead).forEach(x => anim(x, 'run', 900)); say('¡Te escapás!'); Snd.play('step'); await sleep(900); result = 'fled'; break; } say('¡No podés escapar!'); Snd.play('bad'); await sleep(600); }
      } else await aiTurn(f);
      f.energy = Math.min(5, f.energy + 1); if (f.blind > 0) f.blind--;
      if (!G.P.alive) { result = 'lose'; break; }
      if (!foes(F.find(x => x.side === 'A')).length) { result = 'win'; break; }
    }
    if (!result && !F.some(f => f.side === 'B' && !f.dead)) result = 'win';
  }
  cur = null; target = null; tgEl.innerHTML = ''; actEl.innerHTML = '';
  if (result === 'win') { F.filter(f => f.side === 'A' && !f.dead).forEach(f => anim(f, 'win', 1400)); showBanner('VICTORIA', '#ffd27a'); Snd.play('win'); }
  if (result === 'lose') { showBanner('CAÍSTE', '#ff4b3b'); Snd.play('lose'); }
  await sleep(1600);
  running = false; removeEventListener('resize', layout); root.remove(); Snd.music('map');
  return result;
}
