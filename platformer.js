/** Original canvas game. Import { initPlatformer } and pass #robot-platformer.
 * No side effects on import. The physics exports also run in Node for tests.
 * All measurements are logical pixels; simulation uses a fixed 1/120 s step.
 */
export const PHYSICS = Object.freeze({ speed: 265, jump: 590, gravity: 1520, maxFall: 850, width: 28, height: 38 });
export const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const platform = (x, y, w, h = 20) => ({ x, y, w, h });
const floors = () => [platform(0, 390, 620, 90), platform(710, 390, 590, 90), platform(1390, 390, 510, 90), platform(1990, 390, 500, 90)];
const pickups = points => points.map(([x, y]) => ({ x, y, w: 22, h: 26, taken: false }));
export function createLevel(index = 0) {
 const definitions = [
  { name: 'DISTRITO DAS ANTENAS', colors: ['#102932', '#174143', '#a7edbd'], platforms: [[245, 318, 155], [960, 315, 135], [1130, 247, 140], [1815, 310, 140]], chips: [[306, 280], [1189, 209], [1875, 272]], spikes: [845, 1660, 2180], drones: [] },
  { name: 'JARDINS DO CIRCUITO', colors: ['#17283a', '#244250', '#bde5a1'], platforms: [[225, 322, 140], [395, 252, 135], [1050, 317, 135], [1210, 247, 145], [1745, 313, 145]], chips: [[451, 214], [1270, 209], [1805, 275]], spikes: [545, 960, 2140, 2280], drones: [[760, 890], [1490, 1650]] },
  { name: 'NÚCLEO DA CONEXÃO', colors: ['#221f39', '#37344a', '#a9e6cb'], platforms: [[160, 323, 140], [330, 253, 135], [870, 323, 135], [1040, 253, 135], [1740, 324, 145], [1910, 254, 145]], chips: [[386, 215], [1096, 215], [1966, 216]], spikes: [540, 1180, 1650, 2210], drones: [[735, 840], [1420, 1590], [2280, 2360]] }
 ];
 const d = definitions[clamp(index, 0, 2)];
 return { ...d, width: 2480, index, solids: [...floors(), ...d.platforms.map(p => platform(...p))], chips: pickups(d.chips), bolts: pickups([[150, 348], [510, 338], [744, 348], [1010, 279], [1455, 348], [1570, 338], [2050, 348], [2330, 335]]), spikes: d.spikes.map(x => ({ x, y: 373, w: 42, h: 17 })), drones: d.drones.map(([lo, hi], i) => ({ x: lo, y: 362, w: 32, h: 28, lo, hi, direction: i % 2 ? -1 : 1, alive: true })), checkpoint: { x: 1460, y: 325, w: 30, h: 65, active: false }, exit: { x: 2400, y: 302, w: 48, h: 88 } };
}
export function createPlayer(x = 62, y = 346) { return { x, y, w: PHYSICS.width, h: PHYSICS.height, vx: 0, vy: 0, grounded: false, coyote: 0, jumpBuffer: 0, facing: 1, invulnerable: 0 }; }
/** Axis-separated solid collisions, with coyote time and buffered jump input. */
export function stepPlayer(player, input, solids, dt, worldWidth) {
 player.coyote = player.grounded ? .11 : Math.max(0, player.coyote - dt);
 player.jumpBuffer = input.jumpPressed ? .13 : Math.max(0, player.jumpBuffer - dt);
 const direction = Number(Boolean(input.right)) - Number(Boolean(input.left));
 player.vx = direction * PHYSICS.speed;
 if (direction) player.facing = direction;
 if (player.jumpBuffer > 0 && player.coyote > 0) { player.vy = -PHYSICS.jump; player.grounded = false; player.coyote = 0; player.jumpBuffer = 0; }
 if (input.jumpReleased && player.vy < -260) player.vy = -260;
 player.x = clamp(player.x + player.vx * dt, 0, worldWidth - player.w);
 for (const solid of solids) if (overlaps(player, solid)) { player.x = player.vx > 0 ? solid.x - player.w : player.vx < 0 ? solid.x + solid.w : player.x; }
 player.vy = Math.min(PHYSICS.maxFall, player.vy + PHYSICS.gravity * dt);
 player.y += player.vy * dt; player.grounded = false;
 for (const solid of solids) if (overlaps(player, solid)) {
  if (player.vy >= 0) { player.y = solid.y - player.h; player.grounded = true; player.coyote = .11; }
  else player.y = solid.y + solid.h;
  player.vy = 0;
 }
 player.invulnerable = Math.max(0, player.invulnerable - dt);
 return player;
}

export function initPlatformer(root) {
 if (!root || root.dataset.initialized) return null;
 root.dataset.initialized = 'true';
 const q = selector => root.querySelector(selector);
 const canvas = q('canvas'); const ctx = canvas.getContext('2d');
 if (!ctx) { q('#robot-status').textContent = 'Este navegador não oferece o recurso gráfico necessário para jogar.'; q('[data-game-start]').disabled = true; return null; }
 const overlay = q('.robot-overlay'), start = q('[data-game-start]'), pauseButton = q('[data-game-pause]');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 let level = createLevel(0), player = createPlayer(), score = 0, hearts = 3, mode = 'ready', camera = 0;
 let viewW = 960, viewH = 450, clock = 0, previous = 0, accumulator = 0, frame = 0, gateNotice = false, visible = true;
 let keyboard = new Set(), pointers = new Map(), jumpPressed = false, jumpReleased = false, tapLeft = 0, tapRight = 0;
 const unbind = [], particles = [];
 const on = (node, event, fn, options) => { node.addEventListener(event, fn, options); unbind.push(() => node.removeEventListener(event, fn, options)); };
 const announce = text => { q('#robot-status').textContent = text; };
 function hud() {
  q('[data-hud-level]').textContent = `0${level.index + 1} / 03`;
  q('[data-hud-chips]').textContent = `${level.chips.filter(c => c.taken).length} / 3`;
  q('[data-hud-score]').textContent = String(score).padStart(4, '0');
  q('[data-hud-hearts]').textContent = '♥ '.repeat(hearts).trim() + (hearts < 3 ? ' ' + '♡ '.repeat(3 - hearts).trim() : '');
  q('[data-hud-hearts]').setAttribute('aria-label', `${hearts} ${hearts === 1 ? 'vida' : 'vidas'}`);
  q('[data-scene-label]').textContent = `0${level.index + 1} / ${level.name}`;
 }
 function clearInputs() { keyboard.clear(); pointers.clear(); jumpPressed = jumpReleased = false; tapLeft = tapRight = 0; root.querySelectorAll('[data-control]').forEach(b => b.classList.remove('is-held')); }
 function display(title, copy, button, kicker = 'MISSÃO EM ANDAMENTO') {
  q('[data-overlay-title]').textContent = title; q('[data-overlay-copy]').textContent = copy; start.textContent = button; q('.robot-overlay-kicker').textContent = kicker; overlay.hidden = false; root.classList.remove('is-playing'); pauseButton.disabled = true;
 }
 function schedule() { if (!frame) frame = requestAnimationFrame(tick); }
 function pause(reason = 'Jogo pausado. Retome quando quiser.') {
  if (mode !== 'playing') return;
  mode = 'paused'; clearInputs(); display('Uma pausa na missão.', reason, 'Continuar missão'); announce(reason); draw();
 }
 function begin() {
  if (!visible || document.hidden) return;
  if (mode === 'won' || mode === 'gameover') reset();
  else if (mode === 'levelComplete') { level = createLevel(level.index + 1); player = createPlayer(); hearts = 3; camera = 0; gateNotice = false; particles.length = 0; }
  mode = 'playing'; overlay.hidden = true; root.classList.add('is-playing'); pauseButton.disabled = false; clearInputs(); previous = 0; accumulator = 0; hud(); announce(`${level.name}. Encontre os 3 chips e alcance o portal à direita.`); canvas.focus({ preventScroll: true }); schedule();
 }
 function reset() { level = createLevel(0); player = createPlayer(); score = 0; hearts = 3; mode = 'ready'; camera = 0; gateNotice = false; clock = 0; particles.length = 0; clearInputs(); hud(); display('Restaure a conexão.', 'Guie BYTE pelos telhados da cidade. Encontre os 3 chips de cada fase e leve-os ao portal. Cuidado com os circuitos expostos!', 'Começar missão', 'PLATAFORMAS / 3 FASES'); announce('Missão reiniciada. Selecione Começar missão para jogar.'); draw(); }
 function burst(x, y, color) { if (reduced.matches) return; for (let i = 0; i < 9; i++) particles.push({ x, y, vx: Math.cos(i * .7) * 90, vy: Math.sin(i * .7) * 90 - 50, life: .45, color }); }
 function hurt() {
  if (player.invulnerable > 0) return;
  hearts--; clearInputs();
  if (hearts <= 0) { mode = 'gameover'; display('Vamos tentar de novo?', `Você fez ${score} pontos. Dica: no teclado, solte o pulo mais cedo para saltos curtos. A antena guarda seu ponto de retorno dentro da fase.`, 'Recomeçar missão', 'ENERGIA ESGOTADA'); announce('Energia esgotada. Selecione Recomeçar missão para tentar novamente.'); start.focus({ preventScroll: true }); }
  else { const checkpoint = level.checkpoint.active; player = createPlayer(checkpoint ? level.checkpoint.x + 42 : 62, 346); player.invulnerable = 1.5; camera = clamp(player.x - viewW * .34, 0, level.width - viewW); announce(`${checkpoint ? 'Retorno ao checkpoint' : 'Retorno ao início da fase'}. ${hearts} ${hearts === 1 ? 'vida restante' : 'vidas restantes'}. Seus chips foram mantidos.`); }
  hud();
 }
 function advance(dt) {
  clock += dt;
  const held = control => [...pointers.values()].includes(control);
  const input = { left: keyboard.has('left') || held('left') || tapLeft > 0, right: keyboard.has('right') || held('right') || tapRight > 0, jumpPressed, jumpReleased };
  tapLeft = Math.max(0, tapLeft - dt); tapRight = Math.max(0, tapRight - dt);
  const previousBottom = player.y + player.h;
  stepPlayer(player, input, level.solids, dt, level.width); jumpPressed = jumpReleased = false;
  for (const drone of level.drones) {
   if (!drone.alive) continue;
   drone.x += drone.direction * (65 + level.index * 8) * dt;
   if (drone.x <= drone.lo || drone.x >= drone.hi) { drone.x = clamp(drone.x, drone.lo, drone.hi); drone.direction *= -1; }
   if (overlaps(player, drone)) {
    if (player.vy > 0 && previousBottom <= drone.y + 11) { drone.alive = false; player.vy = -390; score += 50; burst(drone.x + 16, drone.y, '#e8c38d'); announce('Drone desativado. +50 pontos.'); hud(); }
    else { hurt(); return; }
   }
  }
  if (player.y > 520 || level.spikes.some(s => overlaps(player, { x: s.x + 4, y: s.y + 5, w: s.w - 8, h: s.h - 5 }))) { hurt(); return; }
  for (const chip of level.chips) if (!chip.taken && overlaps(player, chip)) { chip.taken = true; score += 100; burst(chip.x + 11, chip.y + 13, '#a4efbe'); const count = level.chips.filter(c => c.taken).length; announce(count === 3 ? '3 chips coletados! O portal à direita está liberado.' : `Chip ${count} de 3 coletado. +100 pontos.`); hud(); }
  for (const bolt of level.bolts) if (!bolt.taken && overlaps(player, bolt)) { bolt.taken = true; score += 10; burst(bolt.x + 11, bolt.y, '#ebca89'); hud(); }
  if (!level.checkpoint.active && overlaps(player, level.checkpoint)) { level.checkpoint.active = true; announce('Checkpoint ativado. Se perder energia, você volta para esta antena.'); burst(level.checkpoint.x, level.checkpoint.y, '#b5efd1'); }
  if (overlaps(player, level.exit)) {
   if (level.chips.every(c => c.taken)) { score += 250; clearInputs(); mode = level.index === 2 ? 'won' : 'levelComplete'; hud(); display(mode === 'won' ? 'Conexão restaurada!' : 'Setor conectado.', mode === 'won' ? `BYTE reativou os três setores. Missão concluída com ${score} pontos. Obrigado por explorar este pequeno mundo!` : `Os 3 chips chegaram ao destino. +250 pontos. Próximo: ${createLevel(level.index + 1).name.toLowerCase()}. Sua energia será recarregada.`, mode === 'won' ? 'Jogar novamente' : 'Próxima fase →', mode === 'won' ? '3 / 3 SETORES ONLINE' : `FASE 0${level.index + 1} CONCLUÍDA`); announce(mode === 'won' ? `Missão concluída! Três fases, ${score} pontos.` : `Fase ${level.index + 1} concluída. Selecione Próxima fase para continuar.`); start.focus({ preventScroll: true }); }
   else if (!gateNotice) { gateNotice = true; announce(`O portal precisa de 3 chips. Você tem ${level.chips.filter(c => c.taken).length}. Volte e explore as plataformas mais altas.`); }
  } else gateNotice = false;
  const target = clamp(player.x - viewW * .35, 0, Math.max(0, level.width - viewW));
  camera = reduced.matches ? target : camera + (target - camera) * Math.min(1, dt * 8);
  for (let i = particles.length - 1; i >= 0; i--) { const p = particles[i]; p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.life <= 0) particles.splice(i, 1); }
 }
 function tick(time) { frame = 0; if (mode !== 'playing') { draw(); return; } if (!previous) previous = time; accumulator += Math.min((time - previous) / 1000, .05); previous = time; while (accumulator >= 1 / 120 && mode === 'playing') { advance(1 / 120); accumulator -= 1 / 120; } draw(); if (mode === 'playing') schedule(); }
 const rect = (x, y, w, h, fill) => { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); };
 const line = (x1, y1, x2, y2, color, width = 1) => { ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
 const text = (label, x, y, size, color, align = 'left') => { ctx.fillStyle = color; ctx.font = `600 ${size}px ui-monospace, monospace`; ctx.textAlign = align; ctx.fillText(label, x, y); };
 function draw() {
  ctx.setTransform(canvas.width / viewW, 0, 0, canvas.height / viewH, 0, 0); ctx.clearRect(0, 0, viewW, viewH);
  const sky = ctx.createLinearGradient(0, 0, 0, 450); sky.addColorStop(0, level.colors[0]); sky.addColorStop(1, level.colors[1]); rect(0, 0, viewW, 450, sky);
  // Quiet parallax skyline, deterministic original vector art. No idle animation.
  ctx.fillStyle = '#d1edd512'; ctx.beginPath(); ctx.arc(viewW * .79 - camera * .015, 91, 49, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 25; i++) { const x = i * 127 - (camera * .2 % 127), h = 70 + (i * 37 % 110); rect(x, 385 - h, 83, h, '#10282c75'); rect(x + 8, 373 - h, 65, 12, '#17323b'); for (let yy = 397 - h; yy < 365; yy += 24) { rect(x + 15, yy, 7, 4, '#8ed9b324'); rect(x + 45, yy, 7, 4, '#8ed9b317'); } }
  for (let i = 0; i < 11; i++) { const x = i * 269 - camera * .4; line(x, 370, x + 150, 260, '#b7ebc40b'); }
  ctx.save(); ctx.translate(-Math.round(camera), 0);
  rect(0, 432, level.width, 18, '#07191f'); line(0, 432, level.width, 432, '#508b944a', 2);
  for (const solid of level.solids) {
   rect(solid.x, solid.y, solid.w, solid.h, solid.h > 30 ? '#1c393a' : '#284948'); rect(solid.x, solid.y, solid.w, 5, '#95c5a3'); rect(solid.x + 4, solid.y + 6, solid.w - 8, 4, '#14292b');
   if (solid.h > 30) { for (let x = solid.x + 20; x < solid.x + solid.w - 10; x += 52) { line(x, solid.y + 21, x, 444, '#5d90832a'); rect(x + 10, solid.y + 28, 9, 3, '#8cc6a62c'); } }
   else for (let x = solid.x + 15; x < solid.x + solid.w - 5; x += 31) rect(x, solid.y + 13, 4, 3, '#82ac98');
  }
  for (const spike of level.spikes) { rect(spike.x, spike.y + 14, spike.w, 3, '#b97b6c'); for (let n = 0; n < 3; n++) { ctx.fillStyle = '#e3a38a'; ctx.beginPath(); ctx.moveTo(spike.x + n * 14, spike.y + 16); ctx.lineTo(spike.x + n * 14 + 7, spike.y); ctx.lineTo(spike.x + n * 14 + 14, spike.y + 16); ctx.fill(); } }
  for (const bolt of level.bolts) if (!bolt.taken) { ctx.fillStyle = '#e9c98b'; ctx.beginPath(); ctx.moveTo(bolt.x + 13, bolt.y); ctx.lineTo(bolt.x + 3, bolt.y + 14); ctx.lineTo(bolt.x + 11, bolt.y + 14); ctx.lineTo(bolt.x + 8, bolt.y + 25); ctx.lineTo(bolt.x + 22, bolt.y + 9); ctx.lineTo(bolt.x + 13, bolt.y + 9); ctx.closePath(); ctx.fill(); }
  for (const chip of level.chips) if (!chip.taken) { const y = chip.y + (reduced.matches ? 0 : Math.sin(clock * 2.4 + chip.x) * 2); rect(chip.x - 4, y - 4, 30, 33, '#a1edb917'); rect(chip.x, y, 22, 25, '#a8efc0'); rect(chip.x + 5, y + 5, 12, 14, '#2c6b56'); rect(chip.x + 9, y + 9, 4, 6, '#c9f9bc'); for (let i = 0; i < 3; i++) { rect(chip.x - 3, y + 5 + i * 7, 3, 3, '#d8f0bd'); rect(chip.x + 22, y + 5 + i * 7, 3, 3, '#d8f0bd'); } }
  const cp = level.checkpoint; rect(cp.x + 10, cp.y + 15, 8, 50, '#648b7d'); rect(cp.x, cp.y + 55, 30, 10, '#43665a'); rect(cp.x + 2, cp.y + 8, 24, 19, cp.active ? '#a4efbe' : '#8a9d89'); line(cp.x + 14, cp.y + 8, cp.x + 14, cp.y - 3, '#b5d6b8', 2); if (cp.active) { line(cp.x - 2, cp.y + 1, cp.x - 7, cp.y - 7, '#ade3bc', 2); line(cp.x + 30, cp.y + 1, cp.x + 35, cp.y - 7, '#ade3bc', 2); } text('CHECKPOINT', cp.x + 14, 410, 9, cp.active ? '#c4edb5' : '#91b7a4', 'center');
  const exit = level.exit, unlocked = level.chips.every(c => c.taken); rect(exit.x - 5, exit.y - 5, exit.w + 10, exit.h + 5, '#264a46'); rect(exit.x, exit.y, exit.w, exit.h, unlocked ? '#97dbb237' : '#113234'); line(exit.x, exit.y, exit.x, exit.y + exit.h, unlocked ? '#b2f4bd' : '#729985', 4); line(exit.x + exit.w, exit.y, exit.x + exit.w, exit.y + exit.h, unlocked ? '#b2f4bd' : '#729985', 4); line(exit.x, exit.y, exit.x + exit.w, exit.y, '#9dcca4', 5); text(unlocked ? '→' : '3', exit.x + exit.w / 2, exit.y + 56, 26, '#b5e9bd', 'center'); text('PORTAL', exit.x + exit.w / 2, exit.y - 19, 10, '#c0d9b8', 'center');
  for (const drone of level.drones) if (drone.alive) { rect(drone.x + 3, drone.y + 3, 26, 19, '#bc9589'); rect(drone.x, drone.y + 20, 10, 8, '#688884'); rect(drone.x + 22, drone.y + 20, 10, 8, '#688884'); rect(drone.x + 7, drone.y + 9, 18, 5, '#493242'); rect(drone.x + (drone.direction > 0 ? 19 : 8), drone.y + 9, 5, 5, '#f6c195'); }
  // BYTE: binocular display, mint casing, backpack, boots, antenna.
  const p = player, x = Math.round(p.x), y = Math.round(p.y), step = p.grounded && p.vx && !reduced.matches ? Math.sin(clock * 18) * 3 : 0;
  if (p.invulnerable) { ctx.strokeStyle = '#d9f7b6'; ctx.lineWidth = 2; ctx.strokeRect(x - 5, y - 7, p.w + 10, p.h + 13); }
  rect(x + (p.facing > 0 ? -5 : 24), y + 15, 9, 17, '#708e8c'); rect(x + 3, y + 17, 22, 16, '#a8d0bc'); rect(x + 1, y + 3, 26, 18, '#d4e9c7'); rect(x + 5, y + 7, 18, 9, '#173b3c'); rect(x + 7 + (p.facing > 0 ? 2 : 0), y + 9, 4, 4, '#91efc7'); rect(x + 15 + (p.facing > 0 ? 2 : 0), y + 9, 4, 4, '#91efc7'); rect(x + 13, y - 3, 2, 6, '#a7d7bb'); rect(x + 11, y - 5, 6, 4, '#e9c486'); rect(x + 3, y + 31 + Math.max(0, step), 9, 7, '#71969a'); rect(x + 17, y + 31 + Math.max(0, -step), 9, 7, '#71969a'); rect(x + (p.facing > 0 ? 23 : 0), y + 22, 5, 9, '#d4e9c7'); rect(x + 10, y + 23, 8, 4, '#467a6d');
  for (const particle of particles) { ctx.globalAlpha = Math.max(0, particle.life / .45); rect(particle.x, particle.y, 4, 4, particle.color); } ctx.globalAlpha = 1;
  ctx.restore();
  // A small route strip gives orientation without obscuring the playfield.
  const barW = Math.min(170, viewW * .24), barX = viewW - barW - 21; rect(barX, 25, barW, 3, '#a9cfc342'); rect(barX, 25, barW * p.x / level.width, 3, '#a6e5b6'); for (const chip of level.chips) rect(barX + barW * chip.x / level.width - 2, 23, 4, 7, chip.taken ? '#a6e5b6' : '#e7cf99'); rect(barX + barW * p.x / level.width - 2, 22, 5, 9, '#eff8da');
 }
 function resize() { const r = canvas.getBoundingClientRect(); if (!r.width || !r.height) return; viewW = r.width / r.height * 450; const dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr); camera = clamp(player.x - viewW * .35, 0, Math.max(0, level.width - viewW)); draw(); }
 const keyControl = code => ({ ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'jump', KeyW: 'jump', Space: 'jump' })[code];
 on(canvas, 'keydown', event => { if (event.code === 'Escape' || event.code === 'KeyP') { if (mode === 'playing') { event.preventDefault(); pause(); start.focus({ preventScroll: true }); } return; } const control = keyControl(event.code); if (!control || mode !== 'playing') return; event.preventDefault(); if (control === 'jump' && !keyboard.has(control) && !event.repeat) jumpPressed = true; keyboard.add(control); });
 on(canvas, 'keyup', event => { const control = keyControl(event.code); if (!control) return; if (mode === 'playing') event.preventDefault(); keyboard.delete(control); if (control === 'jump') jumpReleased = true; });
 on(canvas, 'blur', () => { keyboard.clear(); jumpReleased = true; });
 on(root, 'focusout', () => { queueMicrotask(() => { if (!root.contains(document.activeElement)) pause('A missão foi pausada quando o foco saiu do jogo.'); }); });
 on(start, 'click', begin); on(pauseButton, 'click', () => { pause(); start.focus({ preventScroll: true }); });
 on(q('[data-game-restart]'), 'click', () => { reset(); start.focus({ preventScroll: true }); });
 for (const button of root.querySelectorAll('[data-control]')) {
  const release = event => { pointers.delete(event.pointerId); if (![...pointers.values()].includes(button.dataset.control)) button.classList.remove('is-held'); }; // A touch tap always gives a full jump; keyboard release controls jump height.
  on(button, 'pointerdown', event => { if (mode !== 'playing') return; event.preventDefault(); button.setPointerCapture(event.pointerId); pointers.set(event.pointerId, button.dataset.control); button.classList.add('is-held'); if (button.dataset.control === 'jump') jumpPressed = true; canvas.focus({ preventScroll: true }); });
  on(button, 'pointerup', release); on(button, 'pointercancel', release); on(button, 'lostpointercapture', release); on(button, 'contextmenu', e => e.preventDefault());
  // Keyboard activation of on-screen buttons is still useful with assistive input.
  on(button, 'click', event => { if (event.detail === 0 && mode === 'playing') { if (button.dataset.control === 'jump') jumpPressed = true; else if (button.dataset.control === 'left') tapLeft = .12; else tapRight = .12; canvas.focus({ preventScroll: true }); } });
 }
 on(document, 'visibilitychange', () => { if (document.hidden) pause('A missão foi pausada enquanto esta página estava em segundo plano.'); });
 on(window, 'blur', () => pause('A missão foi pausada quando você saiu desta janela.'));
 const observer = new IntersectionObserver(entries => { visible = entries[0].intersectionRatio >= .25; if (!visible) pause('A missão foi pausada enquanto você explorava o portfólio.'); }, { threshold: [0, .25] }); observer.observe(canvas);
 const resizer = new ResizeObserver(resize); resizer.observe(canvas); on(reduced, 'change', () => { particles.length = 0; draw(); });
 hud(); resize();
 return { pause, restart: reset, destroy() { cancelAnimationFrame(frame); unbind.forEach(fn => fn()); observer.disconnect(); resizer.disconnect(); root.dataset.initialized = ''; } };
}
