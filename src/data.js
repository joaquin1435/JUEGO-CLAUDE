// ===== Datos: tributos, objetos, sectores =====
const PERKS = {
  tanque:   { n: 'Tanque', d: '+25 de vida máxima.' },
  halcon:   { n: 'Ojo de halcón', d: '+15% de probabilidad de crítico.' },
  carnicero:{ n: 'Carnicero', d: '+3 de daño en cada golpe.' },
  escurri:  { n: 'Escurridizo', d: '+15% de esquivar.' },
  cocinero: { n: 'Cocinero', d: 'La comida rinde el doble.' },
  medica:   { n: 'Médica', d: 'Botiquines y vendas curan +50%.' },
  carisma:  { n: 'Carisma', d: 'Ganás 50% más de audiencia.' },
  rastreo:  { n: 'Rastreadora', d: 'Ves cuántos tributos hay en los sectores vecinos.' },
  trampera: { n: 'Trampera', d: 'Empezás con una trampa y tus trampas pegan el doble.' },
  sigilo:   { n: 'Sigiloso', d: 'Te encuentran mucho menos y huir es más fácil.' },
  suerte:   { n: 'Suertudo', d: 'Mejor botín al explorar y en los patrocinios.' },
  estratega:{ n: 'Estratega', d: 'Siempre actuás primero en combate.' },
  berserk:  { n: 'Berserker', d: 'Con menos de 40% de vida pegás +50%.' },
  leal:     { n: 'Leal', d: 'Tu compañero confía más en vos: la lealtad casi no baja.' },
  resist:   { n: 'Resistente', d: 'El hambre baja a la mitad.' },
  arquero:  { n: 'Arquero', d: 'Empezás con un arco y apuntás mejor.' },
};
// fue, agi, ast, res (1-10)
const CHARS = [
  ['poto', 8, 4, 4, 9, 'tanque'], ['chani', 5, 7, 7, 5, 'halcon'], ['colo', 9, 5, 3, 7, 'carnicero'], ['nano', 4, 9, 6, 5, 'escurri'],
  ['tomba', 6, 5, 6, 7, 'cocinero'], ['macha', 4, 6, 8, 6, 'medica'], ['mema', 5, 6, 8, 5, 'carisma'], ['pola', 5, 7, 8, 5, 'rastreo'],
  ['appu', 6, 6, 7, 5, 'trampera'], ['chino', 5, 8, 7, 4, 'sigilo'], ['luqui', 5, 6, 6, 6, 'suerte'], ['ferna', 6, 6, 9, 4, 'estratega'],
  ['panti', 8, 6, 3, 6, 'berserk'], ['lucho', 6, 5, 6, 7, 'leal'], ['ledo', 6, 4, 5, 9, 'resist'], ['thiago', 5, 8, 6, 5, 'arquero'],
].map(([name, fue, agi, ast, res, perk], i) => ({ id: i, name, fue, agi, ast, res, perk }));

// objetos: w = arma (dmg bonus), c = consumible
const ITEMS = {
  cuchillo: { n: 'Cuchillo', ic: '🔪', w: 3, d: 'Arma rápida. +3 de daño.' },
  machete:  { n: 'Machete', ic: '🗡️', w: 5, d: 'Arma. +5 de daño.' },
  lanza:    { n: 'Lanza', ic: '🔱', w: 5, crit: 5, d: 'Arma. +5 de daño, +5% crítico.' },
  hacha:    { n: 'Hacha', ic: '🪓', w: 7, agi: -1, d: 'Arma pesada. +7 de daño, -1 agilidad.' },
  arco:     { n: 'Arco', ic: '🏹', w: 4, ranged: 1, d: 'Arma a distancia. +4 de daño y el primer golpe es gratis.' },
  maza:     { n: 'Maza', ic: '🔨', w: 6, stun: 1, d: 'Arma. +6 de daño y puede aturdir.' },
  botiquin: { n: 'Botiquín', ic: '🩹', c: 1, heal: 40, cmb: 1, map: 1, d: 'Cura 40 de vida.' },
  vendas:   { n: 'Vendas', ic: '🧻', c: 1, heal: 18, cmb: 1, map: 1, d: 'Cura 18 y frena el sangrado.' },
  racion:   { n: 'Ración', ic: '🥫', c: 1, food: 45, map: 1, d: 'Comida: +45 de saciedad y +6 de vida.' },
  agua:     { n: 'Agua', ic: '💧', c: 1, food: 20, map: 1, d: '+20 de saciedad y +2 de energía para el próximo combate.' },
  bayas:    { n: 'Bayas', ic: '🫐', c: 1, food: 25, map: 1, d: '+25 de saciedad. Algunas son venenosas...' },
  arroj:    { n: 'Cuchillo arrojadizo', ic: '🗡', c: 1, cmb: 1, d: 'Combate: 16 de daño a distancia, no se esquiva fácil.' },
  polvo:    { n: 'Polvo cegador', ic: '✨', c: 1, cmb: 1, d: 'Combate: ciega al enemigo 2 turnos (falla casi todo).' },
  escudo:   { n: 'Escudo', ic: '🛡️', c: 1, cmb: 1, d: 'Combate: bloquea los próximos 2 golpes a la mitad.' },
  humo:     { n: 'Bengala de humo', ic: '💨', c: 1, cmb: 1, d: 'Combate: escape garantizado.' },
  trampa:   { n: 'Trampa', ic: '🪤', c: 1, map: 1, d: 'Mapa: la armás en tu sector. El próximo que te encuentre arranca herido.' },
  veneno:   { n: 'Veneno', ic: '☠️', c: 1, cmb: 1, d: 'Unta tu arma: los próximos 3 golpes envenenan.' },
  bomba:    { n: 'Bomba casera', ic: '💣', c: 1, cmb: 1, d: 'Combate: 22 de daño a TODOS los enemigos.' },
};
const WEAPONS = Object.keys(ITEMS).filter(k => ITEMS[k].w);
const LOOT_COMMON = ['racion', 'agua', 'bayas', 'vendas', 'arroj', 'cuchillo'];
const LOOT_RARE = ['botiquin', 'polvo', 'escudo', 'humo', 'trampa', 'veneno', 'machete', 'lanza', 'arco', 'hacha', 'maza', 'bomba'];

// sectores: centro + anillo de 8
const SECTORS = [
  { n: 'La Cornucopia', b: 'corn', x: .5, y: .5, loot: 3, food: 0, danger: 3, d: 'El centro. Mucho botín y mucha sangre.' },
  { n: 'Bosque Negro', b: 'forest', x: .5, y: .1, loot: 1, food: 2, danger: 1, d: 'Árboles cerrados. Buena caza, poca visibilidad.' },
  { n: 'Las Sierras', b: 'mountain', x: .8, y: .2, loot: 1, food: 0, danger: 2, d: 'Roca, viento y caídas. Buen lugar para esconderse.' },
  { n: 'Río Turbio', b: 'river', x: .92, y: .5, loot: 1, food: 2, danger: 1, d: 'Agua y peces. Todos pasan por acá tarde o temprano.' },
  { n: 'El Pantano', b: 'swamp', x: .8, y: .8, loot: 1, food: 1, danger: 2, d: 'Barro hasta las rodillas. Cosas que pican.' },
  { n: 'Las Ruinas', b: 'ruins', x: .5, y: .9, loot: 2, food: 0, danger: 2, d: 'Un pueblo abandonado. Restos útiles entre los escombros.' },
  { n: 'La Pradera', b: 'field', x: .2, y: .8, loot: 1, food: 1, danger: 1, d: 'Campo abierto. Te ven venir de lejos.' },
  { n: 'Las Cuevas', b: 'cave', x: .08, y: .5, loot: 2, food: 0, danger: 2, d: 'Oscuras y frías. Refugio o trampa.' },
  { n: 'La Playa de Sal', b: 'beach', x: .2, y: .2, loot: 1, food: 1, danger: 1, d: 'Un lago salado y quieto. Demasiado quieto.' },
].map((s, i) => ({ ...s, id: i, adj: i === 0 ? [1, 2, 3, 4, 5, 6, 7, 8] : [0, ((i - 2 + 8) % 8) + 1, (i % 8) + 1] }));

const BIOME_COL = {
  corn: ['#3a2c1c', '#c9a14a', '#1a140c'], forest: ['#13261a', '#2f6b3b', '#0a140d'], mountain: ['#2a2a33', '#7d7f8f', '#141419'],
  river: ['#10263a', '#2f7bb3', '#0a1520'], swamp: ['#1d2416', '#58663a', '#10140b'], ruins: ['#2b2420', '#8a7461', '#16120f'],
  field: ['#2a2d14', '#9aa33e', '#14160a'], cave: ['#16131a', '#4a4058', '#0b090d'], beach: ['#2b2a26', '#d8cfb5', '#16150f'],
};
const HAZARDS = [
  { n: 'Niebla tóxica', ic: '☁️', dmg: 18, t: 'Una niebla verde baja de la nada. Arde en los pulmones.' },
  { n: 'Incendio', ic: '🔥', dmg: 22, t: 'El fuego corre más rápido que vos.' },
  { n: 'Jauría', ic: '🐺', dmg: 16, t: 'Perros enormes, criados para esto.' },
  { n: 'Inundación', ic: '🌊', dmg: 14, t: 'El agua sube sin aviso y arrastra todo.' },
];
const PHASES = ['Mañana', 'Tarde', 'Noche'];
const FEED_KILL = ['{a} le partió la cabeza a {b}', '{a} sorprendió a {b} por la espalda', '{a} y su compañero acorralaron a {b}', '{a} ganó un duelo brutal contra {b}', '{a} empujó a {b} por un barranco', '{a} le clavó una flecha a {b}', '{a} estranguló a {b} mientras dormía'];
const FEED_FLAVOR = ['{a} encontró agua limpia.', '{a} se lastimó un tobillo.', '{a} pasó la noche llorando.', '{a} y {b} discutieron a los gritos.', '{a} juntó bayas.', '{a} recibió un regalo de un patrocinador.', '{a} se esconde en un árbol.', '{a} afila un palo.'];
