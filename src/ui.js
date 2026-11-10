// ===== UI: helpers de pantalla, modales, escenas =====
const $ = s => document.querySelector(s);
const app = $('#app');
const Opt = { speed: 1, music: .5, sfx: .8, diff: .9 };
try { Object.assign(Opt, JSON.parse(localStorage.getItem('pob_opt') || '{}')); } catch (e) {}
const saveOpt = () => { try { localStorage.setItem('pob_opt', JSON.stringify(Opt)); } catch (e) {} };
const sleep = ms => new Promise(r => setTimeout(r, ms / Opt.speed));
const esc = s => String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function view(html) { app.innerHTML = html; app.scrollTop = 0; bindSfx(app); }
function bindSfx(root) { root.querySelectorAll('.btn,.tcard,.slot').forEach(b => { b.addEventListener('pointerenter', () => Snd.play('hover')); b.addEventListener('click', () => Snd.play('click')); }); }
function toast(msg, ms = 2600) { const d = document.createElement('div'); d.innerHTML = msg; $('#toast').appendChild(d); setTimeout(() => d.remove(), ms); }
function flash(col = '#fff', a = .6) { const f = $('#fx-flash'); f.style.background = col; f.style.transition = 'none'; f.style.opacity = a; requestAnimationFrame(() => { f.style.transition = 'opacity .5s'; f.style.opacity = 0; }); }
function shakeEl(el) { el = el || app; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
let tipEl;
function tipOn(el, html) {
  el.addEventListener('pointerenter', e => { tipEl = document.createElement('div'); tipEl.className = 'tip'; tipEl.innerHTML = html; document.body.appendChild(tipEl); moveTip(e); });
  el.addEventListener('pointermove', moveTip); el.addEventListener('pointerleave', () => { tipEl && tipEl.remove(); tipEl = null; });
}
function moveTip(e) { if (!tipEl) return; tipEl.style.left = Math.min(e.clientX + 14, innerWidth - 250) + 'px'; tipEl.style.top = Math.min(e.clientY + 14, innerHeight - 120) + 'px'; }
function killTip() { tipEl && tipEl.remove(); tipEl = null; }

// --- Modal de escena: header pintado + texto + opciones. Devuelve índice elegido ---
function sceneHead(cv, biome, faces, night) {
  const W = cv.width = 620 * 2, H = cv.height = 170 * 2, c = cv.getContext('2d');
  paintBiome(c, W, H, biome || 'field', { night, seed: 'm' });
  (faces || []).forEach((t, i, a) => {
    const img = new Image(); img.onload = () => { const s = 150, x = W / 2 + (i - (a.length - 1) / 2) * (s + 24) - s / 2, y = H - s - 22; c.save(); c.beginPath(); c.arc(x + s / 2, y + s / 2, s / 2, 0, 7); c.clip(); c.drawImage(img, x, y, s, s); c.restore(); c.strokeStyle = t.enemy ? '#e2403a' : '#e8b65a'; c.lineWidth = 6; c.beginPath(); c.arc(x + s / 2, y + s / 2, s / 2, 0, 7); c.stroke(); };
    img.src = portrait(t.ch || t, 160, t.alive === false ? 2 : 0);
  });
  const g = c.createLinearGradient(0, H * .6, 0, H); g.addColorStop(0, 'rgba(21,19,26,0)'); g.addColorStop(1, 'rgba(21,19,26,1)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
}
function ask(cfg) {
  return new Promise(res => {
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="card scene"><canvas></canvas><div class="bd">${cfg.tag ? `<span class="tag">${cfg.tag}</span>` : ''}<h3>${cfg.title}</h3><p class="tx">${cfg.text}</p><div class="opts">${(cfg.opts || []).map((o, i) => `<button class="btn ${o.cls || ''}" data-i="${i}" ${o.disabled ? 'disabled' : ''}><span>${o.t}</span>${o.sub ? `<small>${o.sub}</small>` : ''}</button>`).join('')}</div></div></div>`;
    document.body.appendChild(m); revealWords(m.querySelector('.tx')); sceneHead(m.querySelector('canvas'), cfg.biome, cfg.faces, cfg.night); bindSfx(m);
    m.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { m.remove(); res(+b.dataset.i); });
  });
}
function revealWords(el) {
  const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = []; while (tw.nextNode()) nodes.push(tw.currentNode);
  let i = 0; const total = nodes.reduce((s, n) => s + n.textContent.split(/\s+/).length, 0), step = Math.min(28, 900 / Math.max(1, total)) / Opt.speed;
  nodes.forEach(n => { const f = document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach(w => { if (!w.trim()) return f.appendChild(document.createTextNode(w)); const s = document.createElement('span'); s.className = 'w'; s.style.animationDelay = (i++ * step) + 'ms'; s.textContent = w; f.appendChild(s); }); n.replaceWith(f); });
}
// Muestra resultado con botón continuar
async function tell(cfg) { await ask({ ...cfg, text: `<div class="res ${cfg.cls || ''}">${cfg.text}</div>`, opts: [{ t: cfg.btn || 'Continuar', cls: 'primary' }] }); }
