// ===== Arte procedural: retratos, luchadores, paisajes, partículas =====
const rnd = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function seeded(str) { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const SKINS = ['#f2d0b1', '#e7b893', '#d29b72', '#b97d55', '#8d5a3b', '#6b4029'];
const HAIRS = ['#1b1512', '#3b2516', '#6b3e1f', '#a8692e', '#d9b36a', '#2a2a2a', '#7a1f1f', '#e0e0e0'];
const SHIRTS = ['#c0392b', '#2e86de', '#27ae60', '#8e44ad', '#e67e22', '#16a085', '#d35400', '#2c3e50', '#b33771', '#3b3b98', '#6ab04c', '#f0932b', '#4b6584', '#a5b1c2', '#eb3b5a', '#20bf6b'];
let LOOKS = {}; try { LOOKS = JSON.parse(localStorage.getItem('pob_looks') || '{}'); } catch (e) {}
const PANTS = ['#2b2f3a', '#3a2f25', '#1f2a22', '#30303a', '#5a4a3a', '#1c2b45', '#6b6b6b', '#111111'];
function lookOf(ch) { return { ...baseLook(ch), ...(LOOKS[ch.id] || {}) }; }
function baseLook(ch) {
  const r = seeded(ch.name + 'pob');
  return {
    skin: SKINS[Math.floor(r() * SKINS.length)], hair: HAIRS[Math.floor(r() * HAIRS.length)], hs: Math.floor(r() * 7),
    shirt: SHIRTS[ch.id % SHIRTS.length], pants: ['#2b2f3a', '#3a2f25', '#1f2a22', '#30303a'][Math.floor(r() * 4)],
    eye: r() < .5 ? 0 : 1, beard: r() < .25, acc: (v => v < .62 ? 0 : v < .77 ? 1 : v < .9 ? 2 : 3)(r()), brow: r() * .3 - .15, h: 0.95 + r() * 0.12, w: 0.92 + r() * 0.16,
  };
}
function shade(hex, a) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255; r = clamp(r + a, 0, 255); g = clamp(g + a, 0, 255); b = clamp(b + a, 0, 255); return `rgb(${r|0},${g|0},${b|0})`; }

function drawHair(c, L, x, y, R, back) {
  c.fillStyle = L.hair;
  const s = L.hs;
  if (back) { if (s === 3) { c.beginPath(); c.ellipse(x, y + R * .5, R * 1.08, R * 1.25, 0, 0, Math.PI * 2); c.fill(); } if (s === 6) { c.beginPath(); c.arc(x - R * .2, y - R * .9, R * .45, 0, Math.PI * 2); c.fill(); } return; }
  c.beginPath();
  if (s === 0) { c.arc(x, y - R * .15, R * 1.02, Math.PI * 1.05, Math.PI * 1.95); c.lineTo(x + R * .9, y - R * .25); c.quadraticCurveTo(x, y - R * .55, x - R * .9, y - R * .25); }
  else if (s === 1) { for (let i = 0; i < 7; i++) { const a = Math.PI * (1.05 + i * .13); c.moveTo(x + Math.cos(a) * R * .7, y + Math.sin(a) * R * .7); c.lineTo(x + Math.cos(a + .06) * R * 1.35, y + Math.sin(a + .06) * R * 1.35); c.lineTo(x + Math.cos(a + .14) * R * .8, y + Math.sin(a + .14) * R * .8); } }
  else if (s === 2) { c.arc(x, y - R * .1, R * 1.06, Math.PI * 1.0, Math.PI * 2.0); c.quadraticCurveTo(x + R * .4, y - R * .7, x - R * 1.06, y - R * .1); }
  else if (s === 3) { c.arc(x, y - R * .1, R * 1.08, Math.PI * .95, Math.PI * 2.05); c.lineTo(x + R * 1.1, y + R * .6); c.lineTo(x + R * .8, y - R * .3); c.quadraticCurveTo(x, y - R * .7, x - R * .8, y - R * .3); c.lineTo(x - R * 1.1, y + R * .6); }
  else if (s === 4) { c.arc(x, y - R * .55, R * .75, Math.PI, Math.PI * 2); c.rect(x - R * .25, y - R * 1.45, R * .5, R * .6); }
  else if (s === 5) { c.arc(x, y - R * .2, R * 1.0, Math.PI * 1.1, Math.PI * 1.9); c.quadraticCurveTo(x, y - R * .85, x - R * .8, y - R * .6); }
  else { c.arc(x, y - R * .12, R * 1.03, Math.PI * 1.02, Math.PI * 1.98); c.quadraticCurveTo(x + R * .2, y - R * .5, x - R * 1.0, y - R * .2); }
  c.fill();
  if (L.acc === 3) { c.fillStyle = L.capc || '#c0392b'; c.beginPath(); c.arc(x, y - R * .2, R * 1.04, Math.PI, 0); c.fill(); c.fillStyle = shade(L.capc || '#c0392b', -30); c.beginPath(); c.ellipse(x + R * .6, y - R * .22, R * .75, R * .16, 0, 0, 7); c.fill(); }
}
function drawFace(c, L, x, y, R, mood) {
  // mood: 0 normal, 1 dolor, 2 muerto, 3 furia
  c.fillStyle = L.skin; c.beginPath(); c.ellipse(x, y, R * .92 * L.w, R, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = shade(L.skin, -25); c.beginPath(); c.ellipse(x + R * .25, y + R * .2, R * .6, R * .7, 0, -0.5, 1.2); c.fill();
  c.fillStyle = L.skin; c.beginPath(); c.ellipse(x - R * .05, y - R * .05, R * .8 * L.w, R * .88, 0, 0, Math.PI * 2); c.fill();
  const ey = y - R * .05, ex = R * .36;
  c.strokeStyle = '#1a1210'; c.fillStyle = '#1a1210'; c.lineWidth = Math.max(1, R * .1); c.lineCap = 'round';
  if (mood === 2) { [-1, 1].forEach(s => { c.beginPath(); c.moveTo(x + s * ex - R * .12, ey - R * .12); c.lineTo(x + s * ex + R * .12, ey + R * .12); c.moveTo(x + s * ex + R * .12, ey - R * .12); c.lineTo(x + s * ex - R * .12, ey + R * .12); c.stroke(); }); }
  else if (mood === 1) { [-1, 1].forEach(s => { c.beginPath(); c.moveTo(x + s * ex - R * .14, ey); c.lineTo(x + s * ex + R * .14, ey); c.stroke(); }); }
  else { [-1, 1].forEach(s => { c.beginPath(); c.ellipse(x + s * ex, ey, R * (L.eye ? .09 : .12), R * .14, 0, 0, Math.PI * 2); c.fill(); }); }
  c.lineWidth = Math.max(1, R * .09);
  [-1, 1].forEach(s => { c.beginPath(); const tilt = mood === 3 ? .18 * s : L.brow * s; c.moveTo(x + s * ex - R * .17, ey - R * .27 - tilt * R); c.lineTo(x + s * ex + R * .17, ey - R * .27 + tilt * R); c.stroke(); });
  c.beginPath();
  if (mood === 1 || mood === 3) { c.ellipse(x, y + R * .45, R * .18, R * .1, 0, 0, Math.PI * 2); c.fill(); }
  else if (mood === 2) { c.moveTo(x - R * .18, y + R * .48); c.lineTo(x + R * .18, y + R * .45); c.stroke(); }
  else { c.arc(x, y + R * .3, R * .22, .25, Math.PI - .25); c.stroke(); }
  if (L.beard && mood !== 2) { c.fillStyle = shade(L.hair, 10); c.globalAlpha = .55; c.beginPath(); c.ellipse(x, y + R * .55, R * .55, R * .38, 0, 0, Math.PI); c.fill(); c.globalAlpha = 1; }
  if (L.acc === 1) { c.strokeStyle = '#111'; c.lineWidth = R * .07; [-1, 1].forEach(s => { c.beginPath(); c.arc(x + s * ex, ey, R * .22, 0, Math.PI * 2); c.stroke(); }); c.beginPath(); c.moveTo(x - ex + R * .22, ey); c.lineTo(x + ex - R * .22, ey); c.stroke(); }
  if (L.acc === 2) { c.fillStyle = '#c0392b'; c.fillRect(x - R * .95, y - R * .62, R * 1.9, R * .2); }
}
const portraitCache = {};
function portrait(ch, size = 128, mood = 0) {
  const key = ch.id + '_' + size + '_' + mood; if (portraitCache[key]) return portraitCache[key];
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d'), L = lookOf(ch);
  const g = c.createRadialGradient(size / 2, size * .35, 4, size / 2, size / 2, size * .75); g.addColorStop(0, shade(L.shirt, -40)); g.addColorStop(1, '#0d0b10');
  c.fillStyle = g; c.fillRect(0, 0, size, size);
  const R = size * .26, x = size / 2, y = size * .45;
  drawHair(c, L, x, y, R, true);
  c.fillStyle = L.shirt; c.beginPath(); c.ellipse(x, size * 1.02, size * .42, size * .3, 0, Math.PI, 0); c.fill();
  c.fillStyle = shade(L.shirt, -30); c.beginPath(); c.moveTo(x - R * .4, size * .74); c.lineTo(x, size * .86); c.lineTo(x + R * .4, size * .74); c.fill();
  c.fillStyle = shade(L.skin, -15); c.fillRect(x - R * .3, y + R * .6, R * .6, R * .55);
  drawFace(c, L, x, y, R, mood); drawHair(c, L, x, y, R, false);
  return portraitCache[key] = cv.toDataURL();
}

// ---------- luchador articulado ----------
function limb(c, x1, y1, a1, l1, a2, l2, w, col) {
  const x2 = x1 + Math.sin(a1) * l1, y2 = y1 + Math.cos(a1) * l1, x3 = x2 + Math.sin(a1 + a2) * l2, y3 = y2 + Math.cos(a1 + a2) * l2;
  c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x3, y3); c.stroke(); return [x3, y3, Math.atan2(Math.cos(a1 + a2), Math.sin(a1 + a2))];
}
function drawWeapon(c, w, x, y, ang, s) {
  if (!w) return; c.save(); c.translate(x, y); c.rotate(ang); c.lineCap = 'round';
  const wood = '#6b4a2b', steel = '#d6dde5';
  if (w === 'arco') { c.strokeStyle = wood; c.lineWidth = 3 * s; c.beginPath(); c.arc(0, 0, 22 * s, -1.2, 1.2); c.stroke(); c.strokeStyle = '#ddd'; c.lineWidth = 1; c.beginPath(); c.moveTo(Math.cos(-1.2) * 22 * s, Math.sin(-1.2) * 22 * s); c.lineTo(Math.cos(1.2) * 22 * s, Math.sin(1.2) * 22 * s); c.stroke(); }
  else if (w === 'lanza') { c.strokeStyle = wood; c.lineWidth = 3 * s; c.beginPath(); c.moveTo(-14 * s, 0); c.lineTo(34 * s, 0); c.stroke(); c.fillStyle = steel; c.beginPath(); c.moveTo(34 * s, -4 * s); c.lineTo(46 * s, 0); c.lineTo(34 * s, 4 * s); c.fill(); }
  else if (w === 'hacha') { c.strokeStyle = wood; c.lineWidth = 3.5 * s; c.beginPath(); c.moveTo(-4 * s, 0); c.lineTo(28 * s, 0); c.stroke(); c.fillStyle = steel; c.beginPath(); c.moveTo(20 * s, -2 * s); c.quadraticCurveTo(26 * s, -16 * s, 34 * s, -12 * s); c.lineTo(30 * s, 2 * s); c.fill(); }
  else if (w === 'maza') { c.strokeStyle = wood; c.lineWidth = 3.5 * s; c.beginPath(); c.moveTo(-4 * s, 0); c.lineTo(24 * s, 0); c.stroke(); c.fillStyle = '#555'; c.beginPath(); c.arc(28 * s, 0, 7 * s, 0, 7); c.fill(); }
  else { const L = w === 'machete' ? 28 : 16; c.strokeStyle = '#333'; c.lineWidth = 4 * s; c.beginPath(); c.moveTo(-4 * s, 0); c.lineTo(4 * s, 0); c.stroke(); c.fillStyle = steel; c.beginPath(); c.moveTo(4 * s, -3 * s); c.lineTo((4 + L) * s, -1 * s); c.lineTo(4 * s, 3 * s); c.fill(); }
  c.restore();
}
// f: {x,y,dir,L,weapon,anim,at,hp,maxhp,flash,dead,deadT,scale,blind,shield,name}
function drawFighter(c, f, now) {
  const s = f.scale || 1, L = f.L, t = now / 1000, dir = f.dir;
  let bob = Math.sin(t * 3 + f.seed) * 1.5 * s, lean = 0, armA = .35, armB = -.9, legA = .15, legB = -.15, ox = 0, oy = 0, mood = f.hp < f.maxhp * .3 ? 1 : 0;
  const a = f.anim, p = a ? clamp((now - a.t0) / a.dur, 0, 1) : 0;
  if (a && p >= 1 && a.type !== 'dead') f.anim = null;
  if (a) {
    const k = Math.sin(p * Math.PI);
    if (a.type === 'atk') { ox = k * a.dist; armA = -1.9 * k + .3; armB = -.2; lean = .25 * k; mood = 3; legA = .5 * k; legB = -.4 * k; }
    else if (a.type === 'shoot') { armA = -1.4; armB = -.1; lean = -.05; mood = 3; }
    else if (a.type === 'hurt') { ox = -k * 14 * s; lean = -.3 * k; mood = 1; armA = .9 * k; }
    else if (a.type === 'guard') { armA = -1.2; armB = -1.6; lean = -.1; }
    else if (a.type === 'cast') { armA = -2.4 * k; armB = 0; oy = -k * 8; }
    else if (a.type === 'dodge') { ox = -Math.sin(p * Math.PI) * 30 * s; oy = -Math.sin(p * Math.PI) * 10; lean = -.4 * k; }
    else if (a.type === 'run') { ox = -p * 400 * s; legA = Math.sin(p * 30) * .8; legB = -legA; }
    else if (a.type === 'win') { armA = -2.8; armB = -.3; oy = -Math.abs(Math.sin(p * Math.PI * 4)) * 12; mood = 3; }
  }
  if (f.dead) {
    const dp = clamp((now - f.deadT) / 700, 0, 1);
    c.save(); c.globalAlpha = 1 - clamp((now - f.deadT - 2500) / 1500, 0, .55);
    c.translate(f.x, f.y); c.rotate(-dir * dp * Math.PI / 2); c.translate(-f.x, -f.y);
    bob = 0; mood = 2; armA = 1.2; armB = .3; legA = .3; legB = -.2;
  } else c.save();
  if (f.flash && now - f.flash < 140) c.filter = 'brightness(2.6) saturate(.3)';
  const x = f.x + ox * dir, y = f.y + oy;
  // sombra
  c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(f.x + ox * dir, f.y + 2, 26 * s, 6 * s, 0, 0, 7); c.fill();
  const hip = [x, y - 44 * s * L.h + bob * .3], sh = [x + lean * 20 * s * dir, y - 82 * s * L.h + bob], head = [sh[0] + lean * 6 * dir, sh[1] - 18 * s];
  const lw = 9 * s * L.w, legL = 22 * s * L.h;
  // pierna y brazo traseros
  limb(c, hip[0] - 3 * dir, hip[1], legB * dir, legL, .25 * dir, legL, lw, shade(L.pants, -25));
  const back = limb(c, sh[0] - 4 * dir, sh[1] + 4 * s, (armB * .6 + .3) * dir, 18 * s, .6 * dir, 17 * s, 7.5 * s, shade(L.shirt, -35));
  c.fillStyle = shade(L.skin, -25); c.beginPath(); c.arc(back[0], back[1], 4 * s, 0, 7); c.fill();
  limb(c, hip[0] + 3 * dir, hip[1], legA * dir, legL, .1 * dir, legL, lw, L.pants);
  // torso
  c.strokeStyle = L.shirt; c.lineWidth = 20 * s * L.w; c.lineCap = 'round'; c.beginPath(); c.moveTo(hip[0], hip[1] - 4 * s); c.lineTo(sh[0], sh[1] + 6 * s); c.stroke();
  c.strokeStyle = shade(L.shirt, -30); c.lineWidth = 3 * s; c.beginPath(); c.moveTo(hip[0] - 9 * s, hip[1] - 2 * s); c.lineTo(hip[0] + 9 * s, hip[1] - 2 * s); c.stroke();
  // cabeza
  drawHair(c, L, head[0], head[1], 12 * s, true); drawFace(c, L, head[0], head[1], 12 * s, mood); drawHair(c, L, head[0], head[1], 12 * s, false);
  // brazo frontal + arma
  const hand = limb(c, sh[0] + 4 * dir, sh[1] + 4 * s, armA * dir, 18 * s, armB * dir, 17 * s, 8 * s, shade(L.shirt, 10));
  drawWeapon(c, f.weapon, hand[0], hand[1], hand[2] - 2.9 * dir, s);
  c.fillStyle = L.skin; c.beginPath(); c.arc(hand[0], hand[1], 4.2 * s, 0, 7); c.fill();
  // flash de golpe
  c.restore();
  if (f.bubble && now - f.bubble.t0 < 2200 && !f.dead) {
    const k = now - f.bubble.t0, a = k < 150 ? k / 150 : k > 1900 ? (2200 - k) / 300 : 1, fs = Math.round(12 * s);
    c.save(); c.globalAlpha = a; c.font = `700 ${fs}px Inter,sans-serif`; const tw = c.measureText(f.bubble.txt).width, bx = clamp(f.x - tw / 2 - 10, 4, c.canvas.width - tw - 24), by = f.y - 212 * s - (1 - a) * 8;
    c.fillStyle = '#fff'; c.beginPath(); c.roundRect ? c.roundRect(bx, by, tw + 20, fs + 14, 10) : c.rect(bx, by, tw + 20, fs + 14); c.fill();
    c.beginPath(); c.moveTo(f.x - 6, by + fs + 13); c.lineTo(f.x + 6, by + fs + 13); c.lineTo(f.x, by + fs + 22); c.fill();
    c.fillStyle = '#111'; c.textAlign = 'left'; c.fillText(f.bubble.txt, bx + 10, by + fs + 3); c.restore();
  }
  // estados
  if (!f.dead) {
    let ix = f.x - 14; c.font = `${14 * s}px sans-serif`; c.textAlign = 'center';
    if (f.blind > 0) { c.fillText('✨', ix, f.y - 128 * s); ix += 18; }
    if (f.shield > 0) { c.fillText('🛡️', ix, f.y - 128 * s); ix += 18; }
    if (f.poison > 0) { c.fillText('☠️', ix, f.y - 128 * s); ix += 18; }
    if (f.stun > 0) { c.fillText('💫', ix, f.y - 128 * s); ix += 18; }
    if (f.guard) { c.globalAlpha = .25 + Math.sin(t * 8) * .1; c.strokeStyle = '#7fc8ff'; c.lineWidth = 3; c.beginPath(); c.arc(f.x, f.y - 55 * s, 48 * s, 0, 7); c.stroke(); c.globalAlpha = 1; }
  }
}

// ---------- paisajes ----------
function paintBiome(c, W, H, b, opts = {}) {
  const [top, mid, low] = BIOME_COL[b] || BIOME_COL.field, r = seeded(b + (opts.seed || ''));
  const night = opts.night;
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, night ? '#05060d' : shade(top, 20)); g.addColorStop(.55, night ? '#121528' : shade(mid, -30)); g.addColorStop(1, low);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  if (night) { for (let i = 0; i < 80; i++) { c.fillStyle = `rgba(255,255,255,${r() * .7})`; c.fillRect(r() * W, r() * H * .6, 1.5, 1.5); } c.fillStyle = '#e8ecff'; c.beginPath(); c.arc(W * .82, H * .18, 18, 0, 7); c.fill(); }
  else { const sg = c.createRadialGradient(W * .75, H * .2, 5, W * .75, H * .2, H * .6); sg.addColorStop(0, 'rgba(255,220,160,.45)'); sg.addColorStop(1, 'rgba(255,220,160,0)'); c.fillStyle = sg; c.fillRect(0, 0, W, H); }
  const hz = H * .62;
  // capas de fondo
  for (let layer = 0; layer < 3; layer++) {
    const yb = hz + layer * H * .07, col = shade(mid, -55 + layer * 18 - (night ? 40 : 0));
    c.fillStyle = col; c.beginPath(); c.moveTo(0, H);
    for (let x = 0; x <= W + 20; x += 20) {
      let yy = yb;
      if (b === 'mountain') yy -= (Math.abs(Math.sin(x * .006 + layer * 2 + r() * .1)) * 130 + r() * 10) * (1 - layer * .3);
      else if (b === 'forest') yy -= 40 + Math.abs(Math.sin(x * .05 + layer)) * 50 + r() * 30;
      else if (b === 'ruins' || b === 'corn') yy -= (Math.floor(x / 60 + layer) % 3 === 0 ? 70 : 20) + r() * 8;
      else yy -= Math.sin(x * .01 + layer) * 18 + 10;
      c.lineTo(x, yy);
    }
    c.lineTo(W, H); c.fill();
  }
  if (b === 'forest') for (let i = 0; i < 14; i++) { const x = r() * W, hh = 90 + r() * 90; c.fillStyle = shade(mid, -70 - (night ? 30 : 0)); c.beginPath(); c.moveTo(x, hz + 30 - hh); c.lineTo(x - 28, hz + 30); c.lineTo(x + 28, hz + 30); c.fill(); }
  if (b === 'river' || b === 'beach' || b === 'swamp') { c.fillStyle = b === 'swamp' ? 'rgba(80,100,50,.6)' : 'rgba(90,160,220,.35)'; c.fillRect(0, hz + H * .1, W, H * .1); }
  if (b === 'corn') { c.fillStyle = shade('#c9a14a', night ? -80 : -20); c.beginPath(); c.moveTo(W * .35, hz + 25); c.quadraticCurveTo(W * .5, hz - 90, W * .68, hz - 30); c.lineTo(W * .64, hz + 25); c.fill(); }
  if (b === 'cave') { c.fillStyle = '#050407'; c.beginPath(); c.ellipse(W * .5, hz + 10, W * .18, H * .2, 0, Math.PI, 0); c.fill(); }
  // suelo
  const gg = c.createLinearGradient(0, hz + H * .12, 0, H); gg.addColorStop(0, shade(low, 30)); gg.addColorStop(1, shade(low, -10));
  c.fillStyle = gg; c.fillRect(0, hz + H * .18, W, H);
  // niebla
  c.fillStyle = night ? 'rgba(30,40,80,.18)' : 'rgba(255,240,220,.06)'; c.fillRect(0, hz - 30, W, 80);
}

// ---------- partículas ----------
const Parts = {
  list: [],
  burst(x, y, n, col, sp = 4, life = 700, g = .25, size = 3) { for (let i = 0; i < n; i++) this.list.push({ x, y, vx: rnd(-sp, sp), vy: rnd(-sp * 1.3, sp * .4), col, life, t0: performance.now(), g, size: rnd(size * .5, size * 1.4) }); },
  text(x, y, txt, col, big) { this.list.push({ x, y, vx: rnd(-.6, .6), vy: -2.2, txt, col, life: 1100, t0: performance.now(), g: .04, size: big ? 34 : 22 }); },
  draw(c, now) {
    this.list = this.list.filter(p => now - p.t0 < p.life);
    for (const p of this.list) {
      p.x += p.vx; p.y += p.vy; p.vy += p.g; const a = 1 - (now - p.t0) / p.life;
      c.globalAlpha = clamp(a * 1.4, 0, 1);
      if (p.txt) { c.font = `800 ${p.size}px Inter,sans-serif`; c.textAlign = 'center'; c.lineWidth = 4; c.strokeStyle = 'rgba(0,0,0,.8)'; c.strokeText(p.txt, p.x, p.y); c.fillStyle = p.col; c.fillText(p.txt, p.x, p.y); }
      else { c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, p.size * a + .4, 0, 7); c.fill(); }
    }
    c.globalAlpha = 1;
  },
};

// ---------- fondo animado de menú (brasas) ----------
const BG = (() => {
  const cv = document.getElementById('bg'), c = cv.getContext('2d'); let W, H, embers = [], on = true;
  function rs() { W = cv.width = innerWidth * devicePixelRatio; H = cv.height = innerHeight * devicePixelRatio; }
  addEventListener('resize', rs); rs();
  for (let i = 0; i < 90; i++) embers.push({ x: Math.random(), y: Math.random(), s: rnd(.5, 2.4), v: rnd(.0004, .0016), w: rnd(0, 6) });
  function loop(now) {
    requestAnimationFrame(loop); if (!on) return;
    const g = c.createRadialGradient(W * .5, H * 1.1, 10, W * .5, H * .8, H * 1.1); g.addColorStop(0, '#3a1406'); g.addColorStop(.45, '#140b0b'); g.addColorStop(1, '#09080b');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (const e of embers) {
      e.y -= e.v; if (e.y < -.05) { e.y = 1.05; e.x = Math.random(); }
      const x = (e.x + Math.sin(now / 1500 + e.w) * .01) * W, y = e.y * H, a = clamp(e.y * 1.2, 0, 1);
      c.fillStyle = `rgba(255,${120 + e.s * 40 | 0},50,${a * .8})`; c.beginPath(); c.arc(x, y, e.s * devicePixelRatio, 0, 7); c.fill();
    }
  }
  requestAnimationFrame(loop);
  return { set: v => { on = v; cv.style.display = v ? 'block' : 'none'; } };
})();
