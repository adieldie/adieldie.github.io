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
export const MISSIONS = Object.freeze([
 { name: 'CONFERÊNCIA DE LOTES', projectId: 'entrada-mercadorias', projectTitle: 'Entrada de mercadorias e lotes', status: 'Em validação', label: 'LOTES', objective: 'Colete A, B e C com ✓. Evite duplicados ×. Depois, acione CONFERIR perto do portal.', lesson: 'Você separou registros válidos de duplicados e confirmou a conferência. O projeto real associa itens e fatores por nota, pede confirmação e trata reconferência e retomada após falhas.' },
 { name: 'RESGATE DA IMPRESSÃO', projectId: 'diagnostico-impressao', projectTitle: 'Diagnóstico de impressão em rede', status: 'Implementado', repositoryUrl: 'https://github.com/adieldie/printrescue-windows', label: 'TESTES', objective: 'Colete os testes 1 → 2 → 3. No fim, pouse nos terminais da fila na ordem 2 → 1 → 3.', lesson: 'Você verificou camadas antes de liberar uma fila de impressão. O projeto real organiza diagnóstico de serviços, conectividade e filas, com registro das ações. A ordem numérica é uma regra desta simulação.' },
 { name: 'SINCRONIA SEM REPETIÇÃO', projectId: 'sincronizacao-estoque', projectTitle: 'Sincronização de estoque e disponibilidade', status: 'Em validação', label: 'MUDANÇAS', objective: 'Colete 3 mudanças Δ e acione SINCRONIZAR. Se a conexão falhar, busque o módulo R e retome só o item pendente.', lesson: 'Você preservou atualizações confirmadas e reenviou apenas a pendente. O projeto real aplica regras de disponibilidade e evita atualizações repetidas; a falha e o módulo de reparo são uma analogia de jogo.' }
]);
export function collectMissionChip(level, index) {
 const chip = level.chips[index];
 if (!chip || chip.taken) return { ok: false, points: 0, message: '' };
 if (level.index === 1 && index !== level.chips.filter(c => c.taken).length) return { ok: false, points: 0, message: `Primeiro execute o teste ${level.chips.filter(c => c.taken).length + 1}. Cada verificação libera a próxima.` };
 chip.taken = true;
 const count = level.chips.filter(c => c.taken).length;
 return { ok: true, points: 100, message: level.index === 1 ? `Teste ${index + 1} concluído: ${['serviço', 'rede', 'fila'][index]}. ${count === 3 ? 'Libere a fila na ordem 2 → 1 → 3.' : 'Próxima verificação liberada.'}` : `${level.index === 0 ? 'Lote válido' : 'Mudança'} ${count} de 3 coletado. ${count === 3 ? 'Acione o terminal perto do portal.' : '+100 pontos.'}` };
}
export function resolveMissionAction(level, action = {}) {
 const m = level.mission;
 if (!level.chips.every(c => c.taken)) return { ok: false, points: 0, message: 'Faltam registros nas plataformas. Complete os 3 antes de processar.' };
 if (level.index === 0) {
  if (m.confirmed) return { ok: false, points: 0, message: 'Lotes já conferidos. Nenhuma conversão duplicada. Portal liberado.' };
  m.confirmed = true; return { ok: true, points: 75, message: `3 lotes conferidos uma única vez. ${m.rejected} duplicado(s) em quarentena. Portal liberado!` };
 }
 if (level.index === 1) {
  if (m.queueCursor === 3) return { ok: false, points: 0, message: 'Fila concluída. Portal liberado.' };
  if (action.id !== m.queueOrder[m.queueCursor]) return { ok: false, points: 0, message: `A próxima tarefa da fila é ${m.queueOrder[m.queueCursor]}. As já processadas foram preservadas.` };
  m.queueCursor++; return { ok: true, points: 30, message: m.queueCursor === 3 ? 'Fila processada na ordem correta. Portal liberado!' : `Tarefa ${action.id} impressa. Próxima: ${m.queueOrder[m.queueCursor]}.` };
 }
 if (!m.failed) { m.failed = true; m.committed = [0, 1]; m.pending = [2]; level.checkpoint.active = true; level.checkpoint.x = 2090; return { ok: true, points: 40, message: 'Conexão interrompida: 2 mudanças confirmadas, 1 pendente. Progresso salvo! Busque o módulo R na plataforma à direita e volte ao terminal.' }; }
 if (!m.recovery) return { ok: false, points: 0, message: 'Busque o módulo R acima, à direita, para reabrir a conexão.' };
 if (!m.pending.length) return { ok: false, points: 0, message: 'Tudo sincronizado. Nenhum reenvio duplicado. Portal liberado.' };
 m.committed = [...new Set([...m.committed, ...m.pending])]; m.pending = []; return { ok: true, points: 75, message: 'Somente a mudança pendente foi reenviada. 3 confirmações, zero duplicatas. Portal liberado!' };
}
export function missionReady(level) { const m = level.mission; return level.chips.every(c => c.taken) && (level.index === 0 ? m.confirmed : level.index === 1 ? m.queueCursor === 3 : m.failed && m.committed.length === 3 && m.pending.length === 0); }
export function createLevel(index = 0) {
 const definitions = [
  { name: 'DISTRITO DAS ANTENAS', colors: ['#102932', '#174143', '#a7edbd'], platforms: [[245, 318, 155], [960, 315, 135], [1130, 247, 140], [1815, 310, 140]], chips: [[306, 280], [1189, 209], [1875, 272]], spikes: [845, 1660, 2180], drones: [] },
  { name: 'JARDINS DO CIRCUITO', colors: ['#17283a', '#244250', '#bde5a1'], platforms: [[225, 322, 140], [395, 252, 135], [1050, 317, 135], [1210, 247, 145], [1745, 313, 145]], chips: [[451, 214], [1270, 209], [1805, 275]], spikes: [545, 960, 2140, 2280], drones: [[760, 890], [1490, 1650]] },
  { name: 'NÚCLEO DA CONEXÃO', colors: ['#221f39', '#37344a', '#a9e6cb'], platforms: [[160, 323, 140], [330, 253, 135], [870, 323, 135], [1040, 253, 135], [1740, 324, 145], [1910, 254, 145]], chips: [[386, 215], [1096, 215], [1966, 216]], spikes: [540, 1180, 1650, 2210], drones: [[735, 840], [1420, 1590], [2280, 2360]] }
 ];
 index = clamp(index, 0, 2);
 const d = definitions[index];
 if (index === 2) d.platforms.push([2240, 310, 145]);
 return { ...d, name: MISSIONS[index].name, project: MISSIONS[index], mission: { confirmed: false, rejected: 0, queueOrder: [2, 1, 3], queueCursor: 0, committed: [], pending: [], failed: false, recovery: false }, console: { x: 2140, y: 330, w: 35, h: 60 }, queuePads: [2060, 2190, 2320].map((x, i) => ({ x, y: 386, w: 68, h: 4, id: i + 1 })), rejectedRecords: index === 1 ? [] : pickups(index === 0 ? [[464, 346], [1065, 279], [2010, 346]] : [[515, 346], [1580, 346]]), recoveryCell: { x: 2300, y: 272, w: 24, h: 26 }, width: 2480, index, solids: [...floors(), ...d.platforms.map(p => platform(...p))], chips: pickups(d.chips), bolts: pickups([[150, 348], [510, 338], [744, 348], [1010, 279], [1455, 348], [1570, 338], [2050, 348], [2330, 335]]), spikes: d.spikes.filter(x => index === 0 ? x !== 2180 : index === 1 ? x < 2000 : x !== 2210).map(x => ({ x, y: 373, w: 42, h: 17 })), drones: d.drones.filter(([lo]) => index !== 2 || lo < 2000).map(([lo, hi], i) => ({ x: lo, y: 362, w: 32, h: 28, lo, hi, direction: i % 2 ? -1 : 1, alive: true })), checkpoint: { x: 1460, y: 325, w: 30, h: 65, active: false }, exit: { x: 2400, y: 302, w: 48, h: 88 } };
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

/** Independent touch pointers: moving a stick never overwrites a jump pointer.
 * release preserves a short tap until the next physics frame; cancellation drops it.
 * Safe to call release/cancel again after lostpointercapture or a global pointerup.
 */
export function createTouchInput({ deadZone = .22 } = {}) {
 let stick = null;
 const jumps = new Set(), queuedJumps = new Set();
 function updateStick(id, x, y) {
  if (!stick || stick.id !== id) return false;
  const dx = x - stick.cx, dy = y - stick.cy, distance = Math.hypot(dx, dy), scale = distance > stick.radius ? stick.radius / distance : 1;
  stick.dx = dx * scale; stick.dy = dy * scale;
  return true;
 }
 return {
  startStick(id, x, y, cx, cy, radius = 32) {
   if (stick || jumps.has(id)) return false;
   stick = { id, cx, cy, radius: Math.max(1, radius), dx: 0, dy: 0 };
   updateStick(id, x, y); return true;
  },
  moveStick: updateStick,
  startJump(id) { if (jumps.has(id) || stick?.id === id) return false; jumps.add(id); queuedJumps.add(id); return true; },
  release(id) { if (stick?.id === id) stick = null; jumps.delete(id); },
  cancel(id) { const active = stick?.id === id || jumps.has(id); if (!active) return; if (stick?.id === id) stick = null; jumps.delete(id); queuedJumps.delete(id); },
  reset() { stick = null; jumps.clear(); queuedJumps.clear(); },
  read({ consumeJump = false } = {}) {
   const axis = stick ? stick.dx / stick.radius : 0;
   const state = { left: axis < -deadZone, right: axis > deadZone, jumpPressed: queuedJumps.size > 0, jumpHeld: jumps.size > 0, stickHeld: Boolean(stick), dx: stick?.dx || 0, dy: stick?.dy || 0, activePointers: jumps.size + (stick ? 1 : 0) };
   if (consumeJump) queuedJumps.clear();
   return state;
  }
 };
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
 let lastMissionNotice = '', missionNoticeTime = 0;
 let keyboard = new Set(), jumpPressed = false, jumpReleased = false;
 const touchInput = createTouchInput();
 const unbind = [], particles = [];
 const on = (node, event, fn, options) => { node.addEventListener(event, fn, options); unbind.push(() => node.removeEventListener(event, fn, options)); };
 const announce = text => { q('#robot-status').textContent = text; };
 const touchControls = q('.robot-touch');
 touchControls.innerHTML = '<div class="robot-stick-wrap"><div class="robot-joystick" tabindex="0" role="group" aria-label="Joystick de direção: arraste para os lados, ou use as setas e A ou D"><span class="robot-stick-arrow robot-stick-left" aria-hidden="true">‹</span><span class="robot-stick-arrow robot-stick-right" aria-hidden="true">›</span><span class="robot-stick-base" aria-hidden="true"></span><span class="robot-stick-thumb" aria-hidden="true"></span></div><small>ARRASTE PARA ANDAR</small></div><button data-control="jump" class="robot-jump" type="button" aria-label="Pular; pode usar enquanto segura o joystick"><span aria-hidden="true">↑</span><strong>PULAR</strong></button>';
 const joystick = q('.robot-joystick'), jumpButton = q('[data-control="jump"]');
 function renderTouch() { const state = touchInput.read(); joystick.style.setProperty('--stick-x', state.dx + 'px'); joystick.style.setProperty('--stick-y', state.dy + 'px'); joystick.classList.toggle('is-held', state.stickHeld); joystick.classList.toggle('is-left', state.left); joystick.classList.toggle('is-right', state.right); jumpButton.classList.toggle('is-held', state.jumpHeld); jumpButton.setAttribute('aria-pressed', String(state.jumpHeld)); }

 const missionPanel = document.createElement('div'); missionPanel.className = 'robot-mission'; missionPanel.id = 'robot-mission-context'; missionPanel.innerHTML = '<div><span data-mission-name></span><p data-mission-objective></p></div><span data-mission-progress></span>'; q('.robot-hud').after(missionPanel); canvas.setAttribute('aria-describedby', 'robot-instructions robot-mission-context robot-status'); canvas.setAttribute('aria-label', 'Jogo de plataforma. Andar: setas ou A e D. Pular: Espaço, W ou seta para cima. Acionar terminal: E. Pausar: P ou Esc.');
 const actionButton = document.createElement('button'); actionButton.type = 'button'; actionButton.className = 'robot-action-button'; actionButton.textContent = 'Acionar · E'; actionButton.setAttribute('aria-label', 'Acionar terminal próximo, tecla E'); q('.robot-actions').prepend(actionButton);
 const projectResult = document.createElement('div'); projectResult.className = 'robot-project-result'; projectResult.hidden = true; q('#robot-status').after(projectResult);
 q('.robot-brand strong').textContent = 'BYTE / PROJETOS EM JOGO';
 q('.robot-brand div > span').textContent = 'AUTOMAÇÃO, SUPORTE E INTEGRAÇÕES';
 q('#robot-instructions').textContent = 'Como jogar: setas ou A/D para andar; Espaço, W ou ↑ para pular; E ou Acionar para usar terminais; P ou Esc para pausar. No celular, arraste e segure o joystick com um dedo; toque em Pular com o outro, sem soltar a direção. Leia a missão de cada fase. Pule sobre drones para desativá-los. Simulação fictícia inspirada nos projetos do portfólio.';
 function missionNotice(message) { if (message && (message !== lastMissionNotice || clock - missionNoticeTime > 2)) { announce(message); lastMissionNotice = message; missionNoticeTime = clock; } }
 function showProjectResult() { projectResult.replaceChildren(); const title = document.createElement('strong'); title.textContent = 'Do jogo ao projeto: ' + level.project.projectTitle; const description = document.createElement('p'); description.textContent = level.project.lesson + ' Status no portfólio: ' + level.project.status + '.'; const link = document.createElement('a'); link.href = level.project.repositoryUrl || '#projetos'; link.textContent = level.project.repositoryUrl ? 'Ver repositório público ↗' : 'Explorar os projetos ↓'; if (level.project.repositoryUrl) { link.target = '_blank'; link.rel = 'noopener noreferrer'; } projectResult.append(title, description, link); projectResult.hidden = false; }
 function interact(id) {
  if (mode !== 'playing') return;
  if (level.index === 1) { const pad = level.queuePads.find(p => player.x + player.w >= p.x && player.x <= p.x + p.w && Math.abs(player.y + player.h - 390) < 12); if (!pad && id === undefined) { missionNotice('Na área final, pouse nos terminais 2 → 1 → 3 ou use Acionar quando estiver sobre eles.'); return; } id = id ?? pad.id; }
  else if (Math.abs(player.x + player.w / 2 - (level.console.x + 18)) > 90 || player.y < 280) { missionNotice('Aproxime-se do terminal no fim da fase para acionar.'); return; }
  const result = resolveMissionAction(level, { id }); score += result.points; missionNotice(result.message); if (result.ok) burst(player.x, player.y, '#a4efbe'); hud();
 }

 function hud() {
  q('[data-hud-level]').textContent = `0${level.index + 1} / 03`;
  q('[data-hud-chips]').textContent = `${level.chips.filter(c => c.taken).length} / 3`;
  q('[data-hud-score]').textContent = String(score).padStart(4, '0');
  q('[data-hud-hearts]').textContent = '♥ '.repeat(hearts).trim() + (hearts < 3 ? ' ' + '♡ '.repeat(3 - hearts).trim() : '');
  q('[data-hud-hearts]').setAttribute('aria-label', `${hearts} ${hearts === 1 ? 'vida' : 'vidas'}`);
  q('[data-scene-label]').textContent = `0${level.index + 1} / ${level.name}`;
  q('[data-hud-chips]').parentElement.querySelector('small').textContent = level.project.label;
  q('[data-mission-name]').textContent = level.project.projectTitle;
  q('[data-mission-objective]').textContent = level.project.objective;
  q('[data-mission-progress]').textContent = level.index === 0 ? (level.mission.confirmed ? 'CONFERIDO ✓' : 'CONFERÊNCIA PENDENTE') : level.index === 1 ? 'FILA: ' + level.mission.queueOrder.map((id, i) => i < level.mission.queueCursor ? '✓' : id).join(' → ') : level.mission.failed ? `${level.mission.committed.length} CONFIRMADAS / ${level.mission.pending.length} PENDENTE` : 'AGUARDANDO MUDANÇAS';
  actionButton.textContent = level.index === 0 ? 'Conferir · E' : level.index === 1 ? 'Processar · E' : level.mission.failed ? 'Retomar · E' : 'Sincronizar · E';
  actionButton.disabled = mode !== 'playing';
 }
 function clearInputs() { keyboard.clear(); touchInput.reset(); jumpPressed = jumpReleased = false; renderTouch(); }
 function display(title, copy, button, kicker = 'MISSÃO EM ANDAMENTO') {
  q('[data-overlay-title]').textContent = title; q('[data-overlay-copy]').textContent = copy; start.textContent = button; q('.robot-overlay-kicker').textContent = kicker; overlay.hidden = false; root.classList.remove('is-playing'); pauseButton.disabled = true; actionButton.disabled = true;
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
  mode = 'playing'; projectResult.hidden = true; lastMissionNotice = ''; overlay.hidden = true; root.classList.add('is-playing'); pauseButton.disabled = false; clearInputs(); previous = 0; accumulator = 0; hud(); announce(`${level.name}. ${level.project.objective}`); canvas.focus({ preventScroll: true }); schedule();
 }
 function reset() { projectResult.hidden = true; lastMissionNotice = ''; level = createLevel(0); player = createPlayer(); score = 0; hearts = 3; mode = 'ready'; camera = 0; gateNotice = false; clock = 0; particles.length = 0; clearInputs(); hud(); display('Projetos viram missões.', 'Confira lotes, resgate uma fila de impressão e sincronize mudanças. Três desafios de plataforma inspirados nos projetos deste portfólio.', 'Começar missão', 'PLATAFORMAS / 3 FASES'); announce('Missão reiniciada. Selecione Começar missão para jogar.'); draw(); }
 function burst(x, y, color) { if (reduced.matches) return; for (let i = 0; i < 9; i++) particles.push({ x, y, vx: Math.cos(i * .7) * 90, vy: Math.sin(i * .7) * 90 - 50, life: .45, color }); }
 function hurt() {
  if (player.invulnerable > 0) return;
  hearts--; clearInputs();
  if (hearts <= 0) { mode = 'gameover'; display('Vamos tentar de novo?', `Você fez ${score} pontos. Dica: no teclado, solte o pulo mais cedo para saltos curtos. A antena guarda seu ponto de retorno dentro da fase.`, 'Recomeçar missão', 'ENERGIA ESGOTADA'); announce('Energia esgotada. Selecione Recomeçar missão para tentar novamente.'); start.focus({ preventScroll: true }); }
  else { const checkpoint = level.checkpoint.active; player = createPlayer(checkpoint ? level.checkpoint.x + 42 : 62, 346); player.invulnerable = 1.5; camera = clamp(player.x - viewW * .34, 0, level.width - viewW); announce(`${checkpoint ? 'Retorno ao checkpoint' : 'Retorno ao início da fase'}. ${hearts} ${hearts === 1 ? 'vida restante' : 'vidas restantes'}. Seus dados e etapas foram mantidos.`); }
  hud();
 }
 function advance(dt) {
  clock += dt;
  const touch = touchInput.read({ consumeJump: true });
  const input = { left: keyboard.has('left') || touch.left, right: keyboard.has('right') || touch.right, jumpPressed: jumpPressed || touch.jumpPressed, jumpReleased };
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
  for (const [index, chip] of level.chips.entries()) if (!chip.taken && overlaps(player, chip)) { const result = collectMissionChip(level, index); score += result.points; missionNotice(result.message); if (result.ok) burst(chip.x + 11, chip.y + 13, '#a4efbe'); hud(); }
  for (const record of level.rejectedRecords) if (!record.taken && overlaps(player, record)) { record.taken = true; level.mission.rejected++; if (level.index === 0) { score = Math.max(0, score - 15); announce('Lote duplicado × enviado para quarentena. −15 pontos; seus lotes válidos foram preservados.'); } else announce('Estado = já estava atualizado. Nenhuma atualização extra foi enviada.'); hud(); }
  if (level.index === 1 && player.grounded && previousBottom < 389.999) { const pad = level.queuePads.find(p => player.x + player.w > p.x && player.x < p.x + p.w); if (pad) interact(pad.id); }
  if (level.index === 2 && level.mission.failed && !level.mission.recovery && overlaps(player, level.recoveryCell)) { level.mission.recovery = true; announce('Módulo R recuperado. Volte ao terminal e acione Retomar para reenviar só o item pendente.'); burst(player.x, player.y, '#a4efbe'); hud(); }
  for (const bolt of level.bolts) if (!bolt.taken && overlaps(player, bolt)) { bolt.taken = true; score += 10; burst(bolt.x + 11, bolt.y, '#ebca89'); hud(); }
  if (!level.checkpoint.active && overlaps(player, level.checkpoint)) { level.checkpoint.active = true; announce('Checkpoint ativado. Se perder energia, você volta para esta antena.'); burst(level.checkpoint.x, level.checkpoint.y, '#b5efd1'); }
  if (overlaps(player, level.exit)) {
   if (missionReady(level)) { score += 250; clearInputs(); mode = level.index === 2 ? 'won' : 'levelComplete'; hud(); display(mode === 'won' ? 'Projetos conectados!' : 'Missão processada.', mode === 'won' ? `Três desafios resolvidos: conferência, diagnóstico e sincronização. ${score} pontos. Conheça abaixo os projetos que inspiraram a missão.` : `+250 pontos. Você concluiu a missão inspirada em ${level.project.projectTitle.toLowerCase()}. Veja abaixo a relação com o projeto real. Próximo: ${createLevel(level.index + 1).name.toLowerCase()}.`, mode === 'won' ? 'Jogar novamente' : 'Próxima fase →', mode === 'won' ? '3 / 3 SETORES ONLINE' : `FASE 0${level.index + 1} CONCLUÍDA`); announce(mode === 'won' ? `Missão concluída! Três fases, ${score} pontos.` : `Fase ${level.index + 1} concluída. Selecione Próxima fase para continuar.`); showProjectResult(); start.focus({ preventScroll: true }); }
   else if (!gateNotice) { gateNotice = true; announce(level.chips.every(c => c.taken) ? 'Dados reunidos, mas a missão ainda não foi processada. ' + level.project.objective : `Faltam registros: ${level.chips.filter(c => c.taken).length} de 3. Explore as plataformas mais altas.`); }
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
  for (const chip of level.chips) if (!chip.taken) { const y = chip.y + (reduced.matches ? 0 : Math.sin(clock * 2.4 + chip.x) * 2); rect(chip.x - 4, y - 4, 30, 33, '#a1edb917'); rect(chip.x, y, 22, 25, '#a8efc0'); rect(chip.x + 5, y + 5, 12, 14, '#2c6b56'); rect(chip.x + 9, y + 9, 4, 6, '#c9f9bc'); text(level.index === 0 ? String.fromCharCode(65 + level.chips.indexOf(chip)) + '✓' : level.index === 1 ? String(level.chips.indexOf(chip) + 1) : 'Δ', chip.x + 11, y - 9, 13, '#e5f5c9', 'center'); for (let i = 0; i < 3; i++) { rect(chip.x - 3, y + 5 + i * 7, 3, 3, '#d8f0bd'); rect(chip.x + 22, y + 5 + i * 7, 3, 3, '#d8f0bd'); } }
  for (const record of level.rejectedRecords) if (!record.taken) { rect(record.x, record.y, 22, 25, level.index === 0 ? '#cd998c' : '#99a6bd'); text(level.index === 0 ? '×' : '=', record.x + 11, record.y + 18, 19, '#192e35', 'center'); text(level.index === 0 ? 'DUP' : 'IGUAL', record.x + 11, record.y - 7, 9, '#d7c0b2', 'center'); }
  if (level.index === 1) {
   for (const pad of level.queuePads) { const done = level.mission.queueOrder.slice(0, level.mission.queueCursor).includes(pad.id), next = level.mission.queueOrder[level.mission.queueCursor] === pad.id; rect(pad.x, 384, pad.w, 6, done ? '#a1e5be' : next ? '#e7c58d' : '#667b90'); rect(pad.x + 15, 365, pad.w - 30, 19, '#192f36'); text(done ? '✓' : String(pad.id), pad.x + pad.w / 2, 380, 15, done ? '#a1e5be' : '#ecdfbd', 'center'); text('FILA', pad.x + pad.w / 2, 410, 9, '#a3c5b2', 'center'); }
   text('2 → 1 → 3', 2190, 333, 16, '#e0dbc0', 'center');
  } else { const terminal = level.console, ready = missionReady(level); rect(terminal.x, terminal.y, terminal.w, terminal.h, '#496f68'); rect(terminal.x + 4, terminal.y + 4, terminal.w - 8, 27, '#123037'); text(ready ? '✓' : level.index === 2 && level.mission.failed ? 'R' : 'E', terminal.x + 18, terminal.y + 24, 17, '#c3edbc', 'center'); text(level.index === 0 ? 'CONFERIR' : 'SINCRONIZAR', terminal.x + 18, terminal.y - 12, 10, '#c9e2b7', 'center'); }
  if (level.index === 2 && level.mission.failed && !level.mission.recovery) { const cell = level.recoveryCell; rect(cell.x - 3, cell.y - 3, 30, 32, '#acd5f21c'); rect(cell.x, cell.y, 24, 26, '#b7d6f2'); text('R', cell.x + 12, cell.y + 19, 18, '#244150', 'center'); text('RETOMAR', cell.x + 12, cell.y - 12, 10, '#c9e3ed', 'center'); }
  const cp = level.checkpoint; rect(cp.x + 10, cp.y + 15, 8, 50, '#648b7d'); rect(cp.x, cp.y + 55, 30, 10, '#43665a'); rect(cp.x + 2, cp.y + 8, 24, 19, cp.active ? '#a4efbe' : '#8a9d89'); line(cp.x + 14, cp.y + 8, cp.x + 14, cp.y - 3, '#b5d6b8', 2); if (cp.active) { line(cp.x - 2, cp.y + 1, cp.x - 7, cp.y - 7, '#ade3bc', 2); line(cp.x + 30, cp.y + 1, cp.x + 35, cp.y - 7, '#ade3bc', 2); } text('CHECKPOINT', cp.x + 14, 410, 9, cp.active ? '#c4edb5' : '#91b7a4', 'center');
  const exit = level.exit, unlocked = missionReady(level); rect(exit.x - 5, exit.y - 5, exit.w + 10, exit.h + 5, '#264a46'); rect(exit.x, exit.y, exit.w, exit.h, unlocked ? '#97dbb237' : '#113234'); line(exit.x, exit.y, exit.x, exit.y + exit.h, unlocked ? '#b2f4bd' : '#729985', 4); line(exit.x + exit.w, exit.y, exit.x + exit.w, exit.y + exit.h, unlocked ? '#b2f4bd' : '#729985', 4); line(exit.x, exit.y, exit.x + exit.w, exit.y, '#9dcca4', 5); text(unlocked ? '→' : '×', exit.x + exit.w / 2, exit.y + 56, 26, '#b5e9bd', 'center'); text('PORTAL', exit.x + exit.w / 2, exit.y - 19, 10, '#c0d9b8', 'center');
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
 on(actionButton, 'click', () => { interact(); if (mode === 'playing') canvas.focus({ preventScroll: true }); });
 const keyControl = code => ({ ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'jump', KeyW: 'jump', Space: 'jump' })[code];
 const keydown = event => { if (event.code === 'KeyE' && mode === 'playing') { event.preventDefault(); if (!event.repeat) interact(); return; } if (event.code === 'Escape' || event.code === 'KeyP') { if (mode === 'playing') { event.preventDefault(); pause(); start.focus({ preventScroll: true }); } return; } const control = keyControl(event.code); if (!control || mode !== 'playing') return; event.preventDefault(); if (control === 'jump' && !keyboard.has(control) && !event.repeat) jumpPressed = true; keyboard.add(control); };
 const keyup = event => { const control = keyControl(event.code); if (!control) return; if (mode === 'playing') event.preventDefault(); keyboard.delete(control); if (control === 'jump') jumpReleased = true; };
 const clearKeyboard = () => { if (keyboard.has('jump')) jumpReleased = true; keyboard.clear(); };
 for (const keyboardTarget of [canvas, joystick]) { on(keyboardTarget, 'keydown', keydown); on(keyboardTarget, 'keyup', keyup); on(keyboardTarget, 'blur', clearKeyboard); }
 on(root, 'focusout', () => { queueMicrotask(() => { if (!root.contains(document.activeElement) && !touchInput.read().activePointers) pause('A missão foi pausada quando o foco saiu do jogo.'); }); });
 on(start, 'click', begin); on(pauseButton, 'click', () => { pause(); start.focus({ preventScroll: true }); });
 on(q('[data-game-restart]'), 'click', () => { reset(); start.focus({ preventScroll: true }); });
 const capture = (node, id) => { try { node.setPointerCapture(id); } catch { /* Global release listeners remain as a safety net. */ } };
 const acceptPointer = event => mode === 'playing' && (event.pointerType !== 'mouse' || event.button === 0);
 on(joystick, 'pointerdown', event => {
  if (!acceptPointer(event)) return;
  event.preventDefault();
  const bounds = joystick.getBoundingClientRect();
  if (touchInput.startStick(event.pointerId, event.clientX, event.clientY, bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, Math.min(bounds.width, bounds.height) * .28)) { capture(joystick, event.pointerId); renderTouch(); }
 }, { passive: false });
 on(joystick, 'pointermove', event => { if (touchInput.moveStick(event.pointerId, event.clientX, event.clientY)) { event.preventDefault(); renderTouch(); } }, { passive: false });
 on(jumpButton, 'pointerdown', event => { if (!acceptPointer(event)) return; event.preventDefault(); if (touchInput.startJump(event.pointerId)) { capture(jumpButton, event.pointerId); renderTouch(); } }, { passive: false });
 const releasePointer = event => { touchInput.release(event.pointerId); renderTouch(); };
 const cancelPointer = event => { touchInput.cancel(event.pointerId); renderTouch(); };
 for (const control of [joystick, jumpButton]) { on(control, 'pointerup', releasePointer); on(control, 'pointercancel', cancelPointer); on(control, 'lostpointercapture', cancelPointer); on(control, 'contextmenu', event => event.preventDefault()); on(control, 'dragstart', event => event.preventDefault()); }
 on(window, 'pointerup', releasePointer); on(window, 'pointercancel', cancelPointer);
 // Touch never moves keyboard focus: a second finger cannot blur/pause the game.
 // Keyboard/assistive activation retains its normal focused-button interaction.
 on(jumpButton, 'click', event => { if (event.detail === 0 && mode === 'playing') { jumpPressed = true; canvas.focus({ preventScroll: true }); } });
 on(document, 'visibilitychange', () => { if (document.hidden) pause('A missão foi pausada enquanto esta página estava em segundo plano.'); });
 on(window, 'blur', () => pause('A missão foi pausada quando você saiu desta janela.'));
 const observer = new IntersectionObserver(entries => { visible = entries[0].intersectionRatio >= .25; if (!visible) pause('A missão foi pausada enquanto você explorava o portfólio.'); }, { threshold: [0, .25] }); observer.observe(canvas);
 const resizer = new ResizeObserver(resize); resizer.observe(canvas); on(reduced, 'change', () => { particles.length = 0; draw(); });
 hud(); reset(); resize();
 return { pause, restart: reset, destroy() { cancelAnimationFrame(frame); unbind.forEach(fn => fn()); observer.disconnect(); resizer.disconnect(); missionPanel.remove(); actionButton.remove(); projectResult.remove(); root.dataset.initialized = ''; } };
}
