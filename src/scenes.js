// ===== Escenas de exploración =====
// b: biomas donde aparece (null = cualquiera). run devuelve [texto, clase]
const P_ = () => cap(G.P.name), C_ = () => cap(G.C.name), cAlive = () => G.C.alive;
const SCENES = [
  { b: ['forest', 'field'], title: 'Un ciervo herido', text: () => `Un ciervo cojea entre los árboles. Está lento, pero sus cuernos no.`, opts: [
    { t: 'Cazarlo', sub: 'Fuerza', run: () => { const r = chk('fue', 10); if (r.ok) { feed(45); return [`Lo bajás de un golpe. Comen como reyes por primera vez en días. +45 saciedad. ${r.s}`, 'good']; } hurt(G.P, 14); return [`Te embiste y te tira contra un tronco. -14 de vida. Se escapa. ${r.s}`, 'bad']; } },
    { t: 'Dejarlo ir', run: () => { loyal(3); return [`Lo dejás pasar. ${cAlive() ? C_() + ' te mira raro, pero asiente.' : 'El bosque vuelve a quedar en silencio.'}`]; } }] },
  { b: ['river', 'beach', 'swamp'], title: 'Agua', text: 'El agua parece limpia. Parece.', opts: [
    { t: 'Tomar directo', run: () => { if (Math.random() < .35) { hurt(G.P, 10); feed(10); return ['Tenía algo. Pasás la tarde con retorcijones. -10 vida.', 'bad']; } feed(25); return ['Fresca. El cuerpo te lo agradece. +25 saciedad.', 'good']; } },
    { t: 'Hervirla primero', sub: 'Astucia', run: () => { const r = chk('ast', 9); if (r.ok) { feed(25); G.inv.length < 10 && G.inv.push('agua'); return [`Armás un fuego chico sin humo. Tomás y guardás una botella. +25 saciedad y 💧 Agua. ${r.s}`, 'good']; } fame(4); return [`El humo se ve a kilómetros. Apagás todo rápido, pero alguien seguro lo vio. ${r.s}`, 'bad']; } }] },
  { b: ['ruins', 'corn'], title: 'Una mochila entre los escombros', text: 'Asoma bajo una viga caída. La viga cruje.', opts: [
    { t: 'Sacarla con cuidado', sub: 'Agilidad', run: () => { const r = chk('agi', 10); if (r.ok) return [`La sacás sin que se mueva nada. Adentro: ${give(rollLoot(.5))}. ${r.s}`, 'good']; hurt(G.P, 16); return [`La viga se viene abajo y te agarra el brazo. -16 vida. ${r.s}`, 'bad']; } },
    { t: 'Levantar la viga', sub: 'Fuerza', run: () => { const r = chk('fue', 11); if (r.ok) return [`Con un grito la levantás. Adentro: ${give(rollLoot(.5))} y ${give(rollLoot(.2))}. ${r.s}`, 'good']; hurt(G.P, 10); return [`No se mueve ni un centímetro y te tirás la espalda. -10 vida. ${r.s}`, 'bad']; } },
    { t: 'No arriesgar', run: () => ['La dejás. Quizás otro sea menos cuidadoso.'] }] },
  { b: null, title: 'Paracaídas plateado', minFame: 0, text: 'Un paracaídas baja despacio... pero cae lejos, en un claro abierto.', opts: [
    { t: 'Correr a buscarlo', sub: 'Agilidad', run: () => { const r = chk('agi', 9); if (r.ok) { fame(6); return [`Llegás primero. ${give(pick(LOOT_RARE))}. El público aplaude. ${r.s}`, 'good']; } hurt(G.P, 12); return [`Alguien más llegó antes y te tiró una piedra al pasar. -12 vida. ${r.s}`, 'bad']; } },
    { t: 'Mandar a tu compañero', disabled: () => !cAlive(), run: () => { if (Math.random() < .6) { loyal(-4); return [`${C_()} vuelve con ${give(pick(LOOT_RARE))}. Medio molesto porque lo mandaste solo.`, 'good']; } hurt(G.C, 18); loyal(-10); return [`${C_()} vuelve herido y con las manos vacías. No te habla. -18 vida para él.`, 'bad']; } },
    { t: 'Ignorarlo, puede ser una trampa', run: () => ['A los minutos escuchás gritos desde el claro. Bien ahí.'] }] },
  { b: ['cave', 'mountain'], title: 'Algo respira en la oscuridad', text: 'El eco devuelve un gruñido. Dos ojos amarillos te miran.', opts: [
    { t: 'Pelear', sub: 'Fuerza', run: () => { const r = chk('fue', 11); if (r.ok) { feed(30); fame(8); return [`Era un lobo flaco. Ganás vos. Carne y fama. +30 saciedad. ${r.s}`, 'good']; } hurt(G.P, 22); return [`Te muerde la pierna antes de escaparse. -22 vida. ${r.s}`, 'bad']; } },
    { t: 'Retroceder despacio', sub: 'Astucia', run: () => { const r = chk('ast', 8); if (r.ok) return [`Sin darle la espalda, salís. Te deja ir. ${r.s}`, 'good']; hurt(G.P, 12); return [`Te tropezás y te salta encima. Zafás con -12 de vida. ${r.s}`, 'bad']; } }] },
  { b: null, title: 'La noche anterior', needC: 1, text: () => `${C_()} no durmió. Tiene los ojos rojos y te pide hablar.`, opts: [
    { t: 'Escucharlo', run: () => { loyal(12); return [`Te cuenta de su casa, de su vieja. Se le quiebra la voz. Algo se acomoda entre ustedes. +lealtad`, 'good']; } },
    { t: 'Decirle que no es momento', run: () => { loyal(-10); return [`Asiente y no dice más nada. Ese silencio pesa. -lealtad`, 'bad']; } },
    { t: 'Darle tu ración', disabled: () => !G.inv.includes('racion'), run: () => { G.inv.splice(G.inv.indexOf('racion'), 1); heal(G.C, 15); loyal(22); return [`Se la come en silencio. "No me voy a olvidar de esto." ++lealtad`, 'good']; } }] },
  { b: ['swamp'], title: 'Arenas movedizas', text: () => `${cAlive() ? C_() : 'Tu pie'} se hunde hasta la cintura en el barro.`, opts: [
    { t: 'Tirar de una rama', sub: 'Fuerza', run: () => { const r = chk('fue', 9); if (r.ok) { loyal(10); return [`Con todo el cuerpo tirás y salen los dos embarrados hasta las cejas. ${r.s}`, 'good']; } hurt(G.P, 10); hurt(G.C, 10); return [`Te hundís vos también. Salen, pero perdiste tiempo y aire. -10 vida a los dos. ${r.s}`, 'bad']; } },
    { t: 'Buscar algo firme', sub: 'Astucia', run: () => { const r = chk('ast', 10); if (r.ok) return [`Ves un tronco a dos metros y lo usás de puente. Fácil. ${r.s}`, 'good']; hurt(G.C.alive ? G.C : G.P, 18); loyal(-6); return [`Tardaste demasiado. -18 vida. ${r.s}`, 'bad']; } }] },
  { b: ['beach', 'field', 'river'], title: 'Un campamento abandonado', text: 'Fuego apagado, todavía tibio. Se fueron hace poco.', opts: [
    { t: 'Revisar todo', run: () => { if (Math.random() < .3) { hurt(G.P, 15); return ['Una trampa de alambre te corta la pantorrilla. -15 vida. Muy vivos.', 'bad']; } return [`Encontrás ${give(rollLoot(.35))}.`, 'good']; } },
    { t: 'Seguir el rastro', sub: 'Astucia', run: () => { const r = chk('ast', 11); if (r.ok) { G.trackBonus = 1; fame(3); return [`Las huellas van al sector de al lado. Sabés dónde están y ellos no saben de vos. La próxima pelea arrancás con ventaja. ${r.s}`, 'good']; } return [`Perdés el rastro en el pasto. ${r.s}`]; } }] },
  { b: ['forest', 'swamp', 'field'], title: 'Bayas', text: 'Un arbusto lleno de bayas oscuras. Se parecen a las que comías de chico. Se parecen.', opts: [
    { t: 'Comer un par', run: () => { if (Math.random() < .3) { hurt(G.P, 14); return ['Al rato te arde la garganta. Vomitás todo. -14 vida.', 'bad']; } feed(25); return ['Dulces. +25 saciedad.', 'good']; } },
    { t: 'Juntarlas', run: () => { G.inv.length < 10 && G.inv.push('bayas'); return ['Llenás un bolsillo. 🫐 Bayas', 'good']; } },
    { t: 'Usarlas para hacer veneno', sub: 'Astucia', run: () => { const r = chk('ast', 10); if (r.ok) { G.inv.length < 10 && G.inv.push('veneno'); return [`Las machacás con cuidado. ☠️ Veneno. ${r.s}`, 'good']; } hurt(G.P, 8); return [`Te salpicaste un ojo. -8 vida. ${r.s}`, 'bad']; } }] },
  { b: ['mountain'], title: 'La cornisa', text: 'El único camino es una cornisa de un pie de ancho. Abajo, nada.', opts: [
    { t: 'Cruzar', sub: 'Agilidad', run: () => { const r = chk('agi', 9); if (r.ok) { fame(5); return [`Del otro lado hay un nido de pájaros: ${give('racion')}. El público contuvo la respiración. ${r.s}`, 'good']; } hurt(G.P, 20); return [`Resbalás y te agarrás de milagro. -20 vida. ${r.s}`, 'bad']; } },
    { t: 'Volver', run: () => ['Hoy no.'] }] },
  { b: ['ruins', 'cave'], title: 'Un mensaje en la pared', text: '"NO CONFÍES EN TU COMPAÑERO". Escrito con algo que no es pintura.', opts: [
    { t: 'Mostrárselo y reírse', disabled: () => !cAlive(), run: () => { loyal(8); return [`${C_()} se ríe nervioso. "Qué boludez." Se relaja un poco. +lealtad`, 'good']; } },
    { t: 'Borrarlo sin decir nada', run: () => { loyal(-3); return ['Lo borrás con la manga. Pero te queda dando vueltas.']; } },
    { t: 'Buscar quién lo escribió', sub: 'Astucia', run: () => { const r = chk('ast', 11); if (r.ok) return [`Siguiendo las marcas encontrás su escondite vacío: ${give(rollLoot(.6))}. ${r.s}`, 'good']; return [`Nada. Solo más paredes. ${r.s}`]; } }] },
  { b: null, title: 'Tributo moribundo', minDay: 2, text: () => { const d = G.all.find(t => !t.alive && t.team !== 0); return `Encontrás a alguien tirado. Todavía respira, apenas. Tiene la remera de ${d ? cap(d.name) : 'otro equipo'}... pero no es su cara.`; }, opts: [
    { t: 'Ayudarlo', run: () => { fame(10); if (Math.random() < .5) return [`Te da lo que tenía antes de cerrar los ojos: ${give(rollLoot(.6))}. El público se emociona. +fama`, 'good']; return ['No llega. Pero el público lo vio. +fama']; } },
    { t: 'Revisarle los bolsillos', run: () => { fame(-4); return [`${give(rollLoot(.4))}. Hay gente mirando, y no les gustó.`]; } },
    { t: 'Seguir de largo', run: () => ['No es tu problema. No puede serlo.'] }] },
  { b: ['corn'], title: 'Restos del baño de sangre', text: 'La Cornucopia está casi vacía. Casi.', opts: [
    { t: 'Meterse en el fondo', sub: 'Agilidad', run: () => { const r = chk('agi', 11); if (r.ok) return [`Entre cajas rotas: ${give(pick(LOOT_RARE))}. ${r.s}`, 'good']; hurt(G.P, 14); return [`Una caja te cae encima. -14 vida. ${r.s}`, 'bad']; } },
    { t: 'Agarrar lo que esté a mano', run: () => [`${give(pick(LOOT_COMMON))}.`, 'good'] }] },
  { b: null, title: 'Silbido en el aire', minDay: 2, text: 'Un paracaídas con tu nombre. Desde algún sillón alguien apostó por vos.', cond: () => G.fame >= 15, opts: [
    { t: 'Abrirlo', run: () => { G.fame -= 15; Snd.play('drop'); return [`Adentro: ${give(pick(['botiquin', 'bomba', 'escudo', 'racion']))} y una nota: "Seguí así".`, 'good']; } }] },
  { b: ['field', 'beach'], title: 'Te vieron', text: 'A lo lejos, dos siluetas te señalan. Están ocupadas con otra cosa... por ahora.', opts: [
    { t: 'Hacerte el muerto en el pasto', sub: 'Astucia', run: () => { const r = chk('ast', 9); if (r.ok) return [`Pierden interés. ${r.s}`, 'good']; G.forceEnc = 1; return [`Vienen igual. Preparate. ${r.s}`, 'bad']; } },
    { t: 'Provocarlos para la cámara', run: () => { fame(12); G.forceEnc = 1; return ['Les hacés un gesto que no se puede describir. El público explota. Ellos vienen.', 'bad']; } }] },
  { b: ['river'], title: 'Peces', text: 'Un remanso lleno de peces gordos y tontos.', opts: [
    { t: 'Pescar con las manos', sub: 'Agilidad', run: () => { const r = chk('agi', 8); if (r.ok) { feed(35); G.inv.length < 10 && G.inv.push('racion'); return [`Sacás varios. +35 saciedad y una 🥫 Ración para después. ${r.s}`, 'good']; } return [`Te empapás entero y nada. ${r.s}`]; } },
    { t: 'Armar una trampa de palos', sub: 'Astucia', run: () => { const r = chk('ast', 9); if (r.ok) { feed(30); return [`Funciona. +30 saciedad. ${r.s}`, 'good']; } return [`El río se lleva tu trampa. ${r.s}`]; } }] },
  { b: null, title: 'Tormenta', minDay: 2, text: 'El cielo se pone negro de golpe. Esto no es natural.', opts: [
    { t: 'Buscar refugio', sub: 'Resistencia', run: () => { const r = chk('res', 9); if (r.ok) { heal(G.P, 10); return [`Encontrás una cueva chica y descansás. +10 vida. ${r.s}`, 'good']; } hurt(G.P, 12); hurt(G.C, 12); return [`Granizo como piedras. -12 vida a los dos. ${r.s}`, 'bad']; } },
    { t: 'Aprovechar para moverse', run: () => { fame(5); return ['Nadie más se mueve con este clima. Nadie te ve. Avanzás.', 'good']; } }] },
  { b: ['cave', 'ruins'], title: 'Un depósito', text: 'Una puerta de metal con candado. Del otro lado se escucha... nada.', opts: [
    { t: 'Forzar el candado', sub: 'Fuerza', run: () => { const r = chk('fue', 12); if (r.ok) return [`¡Crack! Adentro: ${give(pick(LOOT_RARE))} y ${give(pick(LOOT_RARE))}. ${r.s}`, 'good']; hurt(G.P, 6); return [`Te lastimás la mano. -6 vida. ${r.s}`, 'bad']; } },
    { t: 'Ganzúa improvisada', sub: 'Astucia', run: () => { const r = chk('ast', 12); if (r.ok) return [`Click. ${give(pick(LOOT_RARE))}. ${r.s}`, 'good']; return [`Rompés la ganzúa adentro. Ya no se abre más. ${r.s}`]; } }] },
  { b: null, title: 'El Consejo habla', minDay: 3, text: '"Atención, tributos. Esta noche habrá un festín en la Cornucopia. Algo que cada uno necesita desesperadamente."', opts: [
    { t: 'Ir al festín', run: () => { G.feast = 1; return ['Mañana a la mañana, la Cornucopia. Si vas, conseguís algo raro seguro... y una pelea casi segura.']; } },
    { t: 'Ni loco', run: () => ['Que se maten entre ellos.'] }] },
];
function pickScene() {
  const b = SECTORS[G.sec].b;
  const ok = SCENES.filter(s => (!s.b || s.b.includes(b)) && (!s.minDay || G.day >= s.minDay) && (!s.needC || G.C.alive) && (!s.cond || s.cond()) && s !== G.lastScene);
  const s = pick(ok); G.lastScene = s; return s;
}
async function runScene(s) {
  const opts = s.opts.map(o => ({ t: o.t, sub: o.sub, disabled: typeof o.disabled === 'function' ? o.disabled() : false }));
  const i = await ask({ tag: SECTORS[G.sec].n, title: s.title, text: typeof s.text === 'function' ? s.text() : s.text, biome: SECTORS[G.sec].b, opts });
  const [txt, cls] = s.opts[i].run();
  Snd.play(cls === 'good' ? 'pick' : cls === 'bad' ? 'bad' : 'click');
  if (cls === 'bad') shakeEl();
  addLog(`${s.title}: ${txt.replace(/<span.*<\/span>/, '')}`);
  await tell({ tag: SECTORS[G.sec].n, title: s.title, text: txt, cls, biome: SECTORS[G.sec].b });
}
