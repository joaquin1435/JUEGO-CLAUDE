// ===== Audio: todo sintetizado con WebAudio =====
const Snd = (() => {
  let ac, master, musG, sfxG, noiseBuf, mode = 'none', timer, step = 0, nextT = 0;
  const vol = { music: 0.5, sfx: 0.8 };
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ac.createGain(); master.gain.value = 0.9;
    const comp = ac.createDynamicsCompressor(); master.connect(comp); comp.connect(ac.destination);
    musG = ac.createGain(); sfxG = ac.createGain(); musG.connect(master); sfxG.connect(master);
    setVol(vol.music, vol.sfx);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 1.5, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    timer = setInterval(sched, 60);
  }
  function setVol(m, s) { vol.music = m; vol.sfx = s; if (musG) { musG.gain.value = m * 0.55; sfxG.gain.value = s; } }
  function env(g, t, a, d, peak) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function osc(type, f, t, a, d, peak, dest, fEnd) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    if (fEnd) o.frequency.exponentialRampToValueAtTime(fEnd, t + a + d);
    env(g, t, a, d, peak); o.connect(g); g.connect(dest || sfxG); o.start(t); o.stop(t + a + d + 0.05);
  }
  function noise(t, d, peak, ftype, f, dest, q) {
    const s = ac.createBufferSource(), g = ac.createGain(), fl = ac.createBiquadFilter();
    s.buffer = noiseBuf; fl.type = ftype || 'lowpass'; fl.frequency.value = f || 1200; fl.Q.value = q || 1;
    env(g, t, 0.005, d, peak); s.connect(fl); fl.connect(g); g.connect(dest || sfxG); s.start(t); s.stop(t + d + 0.1);
  }
  const fx = {
    click: t => osc('triangle', 660, t, .002, .06, .15),
    hover: t => osc('sine', 980, t, .002, .03, .04),
    swing: t => noise(t, .16, .35, 'bandpass', 1800, 0, 2),
    hit: t => { noise(t, .12, .7, 'lowpass', 900); osc('square', 140, t, .002, .12, .25, 0, 50); },
    crit: t => { noise(t, .2, .9, 'lowpass', 1400); osc('sawtooth', 220, t, .002, .25, .3, 0, 40); osc('triangle', 1300, t + .02, .002, .2, .15, 0, 600); },
    miss: t => noise(t, .2, .18, 'highpass', 3000),
    block: t => { osc('square', 900, t, .001, .1, .15, 0, 500); osc('triangle', 1800, t, .001, .2, .08); },
    throwk: t => noise(t, .25, .3, 'bandpass', 2600, 0, 6),
    heal: t => [523, 659, 784, 1046].forEach((f, i) => osc('sine', f, t + i * .07, .01, .3, .14)),
    pick: t => [880, 1320].forEach((f, i) => osc('triangle', f, t + i * .06, .005, .12, .14)),
    bad: t => [300, 220].forEach((f, i) => osc('sawtooth', f, t + i * .12, .01, .25, .1)),
    cannon: t => { noise(t, 1.6, 1, 'lowpass', 220); osc('sine', 70, t, .005, 1.4, .9, 0, 28); },
    gong: t => [110, 165, 221, 330].forEach(f => osc('sine', f, t, .01, 3, .18)),
    step: t => noise(t, .07, .18, 'lowpass', 500),
    smoke: t => noise(t, 1, .4, 'bandpass', 700, 0, .5),
    betray: t => { [440, 415, 392, 370].forEach((f, i) => osc('sawtooth', f, t + i * .18, .02, .4, .09)); noise(t, .5, .3, 'lowpass', 300); },
    win: t => [392, 494, 587, 784, 988].forEach((f, i) => osc('triangle', f, t + i * .12, .01, .7, .16)),
    lose: t => [392, 349, 311, 262].forEach((f, i) => osc('triangle', f, t + i * .25, .02, .8, .14)),
    drop: t => { osc('sine', 1200, t, .01, .9, .1, 0, 300); setTimeout(() => play('pick'), 900); },
    tick: t => osc('square', 1500, t, .001, .03, .05),
    death: t => { osc('sawtooth', 300, t, .01, .9, .2, 0, 40); noise(t, .6, .3, 'lowpass', 400); },
  };
  function play(n) { if (!ac || !fx[n]) return; try { fx[n](ac.currentTime + 0.01); } catch (e) {} }
  // --- música generativa ---
  const scales = { menu: [0, 3, 7, 10, 12, 15], map: [0, 2, 3, 7, 8, 12], combat: [0, 1, 3, 7, 8, 12] };
  function sched() {
    if (!ac || mode === 'none') return;
    const bpm = mode === 'combat' ? 128 : mode === 'menu' ? 70 : 84, spb = 60 / bpm / 2;
    if (nextT < ac.currentTime) nextT = ac.currentTime + 0.05;
    while (nextT < ac.currentTime + 0.25) {
      const t = nextT, s = step % 32, root = mode === 'combat' ? 55 : 49, sc = scales[mode] || scales.map, mf = n => root * Math.pow(2, n / 12);
      if (s % 16 === 0) { const ch = [0, 7, 12].map(n => mf(n + (step % 64 < 32 ? 0 : (mode === 'combat' ? -2 : 5)))); ch.forEach(f => { osc('sawtooth', f, t, 1.2, spb * 16, .045, musG); osc('sine', f / 2, t, .6, spb * 16, .07, musG); }); }
      if (mode === 'combat') {
        if (s % 4 === 0) { osc('sine', 120, t, .002, .25, .7, musG, 40); }
        if (s % 8 === 4) noise(t, .15, .35, 'bandpass', 1500, musG, 1);
        if (s % 2 === 1) noise(t, .04, .12, 'highpass', 7000, musG);
        if (s % 3 === 0) osc('square', mf(sc[(step * 5) % sc.length] + 12), t, .005, .12, .05, musG);
      } else if (mode === 'map') {
        if (s % 8 === 0) osc('sine', 90, t, .005, .5, .35, musG, 45);
        if (s % 16 === 10) noise(t, .25, .12, 'bandpass', 600, musG, 3);
        if (Math.random() < .22) osc('triangle', mf(sc[(Math.random() * sc.length) | 0] + 24), t, .02, .9, .035, musG);
      } else {
        if (Math.random() < .18) osc('sine', mf(sc[(Math.random() * sc.length) | 0] + 24), t, .05, 1.8, .04, musG);
        if (s === 0) osc('sine', 65, t, .01, 2.5, .25, musG, 50);
      }
      nextT += spb; step++;
    }
  }
  function music(m) { if (mode !== m) { mode = m; step = 0; } }
  return { init, play, music, setVol, vol };
})();
