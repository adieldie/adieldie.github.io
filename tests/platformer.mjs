import assert from 'node:assert/strict';
import { PHYSICS, createLevel, createPlayer, overlaps, stepPlayer } from '../platformer.js';
const dt = 1 / 120;
const tick = (p, input, solids, frames = 1) => { for (let i = 0; i < frames; i++) stepPlayer(p, i ? { ...input, jumpPressed: false, jumpReleased: false } : input, solids, dt, 2480); return p; };
assert.equal(overlaps({ x: 0, y: 0, w: 10, h: 10 }, { x: 10, y: 0, w: 10, h: 10 }), false, 'Touching boundaries are not collisions');
assert.equal(overlaps({ x: 0, y: 0, w: 11, h: 10 }, { x: 10, y: 0, w: 10, h: 10 }), true);
const ground = [{ x: 0, y: 390, w: 600, h: 90 }];
const p = createPlayer(); tick(p, {}, ground, 80); assert.equal(p.y, 390 - PHYSICS.height); assert.equal(p.grounded, true);
tick(p, { jumpPressed: true }, ground); assert(p.vy < 0); const startY = p.y; tick(p, {}, ground, 20); assert(p.y < startY - 50); tick(p, {}, ground, 130); assert.equal(p.y, 352); assert(p.grounded);
const wall = [...ground, { x: 150, y: 310, w: 30, h: 80 }]; tick(p, { right: true }, wall, 80); assert.equal(p.x, 122, 'Cannot walk through wall');
tick(p, { left: true }, ground, 200); assert.equal(p.x, 0, 'Cannot leave the world to the left');
const fall = createPlayer(640, 350); tick(fall, {}, ground, 100); assert(fall.y > 520, 'Pit falls exit playfield');
const fullJump = createPlayer(); tick(fullJump, {}, ground, 50); tick(fullJump, { jumpPressed: true }, ground); tick(fullJump, {}, ground, 12);
const shortJump = createPlayer(); tick(shortJump, {}, ground, 50); tick(shortJump, { jumpPressed: true }, ground); tick(shortJump, { jumpReleased: true }, ground); tick(shortJump, {}, ground, 11); assert(fullJump.y < shortJump.y, 'Early release makes a smaller jump');
const coyote = createPlayer(630, 352); coyote.coyote = .08; tick(coyote, { jumpPressed: true }, ground); assert(coyote.vy < 0, 'Coyote jump works just beyond ledge');
const ceilingPlayer = createPlayer(200, 352); tick(ceilingPlayer, {}, ground, 10); const ceiling = [...ground, { x: 170, y: 270, w: 100, h: 20 }]; tick(ceilingPlayer, { jumpPressed: true }, ceiling, 15); assert(ceilingPlayer.y >= 290, 'Cannot pass through platform from below');
// Each elevated platform is reachable from the floor or a lower platform, in both directions.
for (let i = 0; i < 3; i++) {
 const level = createLevel(i); assert.equal(level.chips.length, 3); assert.equal(level.width, 2480);
 assert(level.solids.some(s => level.exit.x >= s.x && level.exit.x + level.exit.w <= s.x + s.w && s.y === 390), 'Portal has solid ground');
 assert(level.solids.some(s => level.checkpoint.x >= s.x && level.checkpoint.x + 60 <= s.x + s.w && s.y === 390), 'Checkpoint has a safe respawn');
 for (const chip of level.chips) assert(level.solids.some(s => chip.x + chip.w > s.x && chip.x < s.x + s.w && s.y - chip.y < 50 && s.y > chip.y), 'Every chip sits directly above a platform');
 for (const target of level.solids.filter(s => s.h === 20)) {
  let reachable = false;
  for (const source of level.solids.filter(s => s !== target && s.y > target.y && s.y - target.y < 110)) {
   for (let x = source.x + 3; x < source.x + source.w - PHYSICS.width; x += 8) {
    const bot = createPlayer(x, source.y - PHYSICS.height); bot.grounded = true;
    const direction = target.x + target.w / 2 > x ? 'right' : 'left';
    for (let step = 0; step < 115; step++) { stepPlayer(bot, { [direction]: true, jumpPressed: step === 0 }, level.solids, dt, level.width); if (bot.grounded && Math.abs(bot.y + bot.h - target.y) < .1 && bot.x + bot.w > target.x && bot.x < target.x + target.w) { reachable = true; break; } }
    if (reachable) break;
   }
   if (reachable) break;
  }
  assert(reachable, `Level ${i + 1} platform at ${target.x},${target.y} has a tested jump approach`);
 }
}
assert.notEqual(createLevel(0).chips, createLevel(0).chips, 'Restart uses clean state');
console.log('Platformer: collision, jumping, variable jump, coyote time, pits, restart state, and all level platform routes passed.');

// Project-derived mechanics must be deterministic, bounded, and idempotent.
const { MISSIONS, collectMissionChip, resolveMissionAction, missionReady } = await import('../platformer.js');
const { projects } = await import('../projects.js');
for (const mission of MISSIONS) {
 const project = projects.find(p => p.id === mission.projectId);
 assert(project, `Mission references catalog project ${mission.projectId}`);
 assert.equal(mission.projectTitle, project.title);
 assert.equal(mission.status, project.status);
 assert.equal(mission.repositoryUrl, project.repositoryUrl, 'Public links must match the existing catalog, not guesses');
}
const lots = createLevel(0);
assert.equal(resolveMissionAction(lots).ok, false, 'Cannot confirm incomplete lot collection');
for (let i = 0; i < 3; i++) assert.equal(collectMissionChip(lots, i).points, 100);
assert.equal(collectMissionChip(lots, 0).points, 0, 'Collecting twice gives no duplicate score');
assert.equal(missionReady(lots), false, 'Collection alone does not complete the lot mission');
lots.mission.rejected = 2;
assert.equal(resolveMissionAction(lots).ok, true);
assert(missionReady(lots));
assert.equal(resolveMissionAction(lots).points, 0, 'Second confirmation does not double-process lots');
assert.equal(lots.mission.rejected, 2, 'Quarantined records do not corrupt valid lots');
const printing = createLevel(1);
assert.equal(collectMissionChip(printing, 2).ok, false, 'Diagnostic dependencies enforce test order');
assert.equal(printing.chips[2].taken, false);
for (let i = 0; i < 3; i++) collectMissionChip(printing, i);
assert.equal(resolveMissionAction(printing, { id: 1 }).ok, false, 'Queue cannot process a task out of order');
assert.equal(printing.mission.queueCursor, 0);
for (const id of [2, 1, 3]) assert.equal(resolveMissionAction(printing, { id }).ok, true);
assert(missionReady(printing));
assert.equal(resolveMissionAction(printing, { id: 3 }).points, 0, 'Already processed queue stays complete');
const sync = createLevel(2);
for (let i = 0; i < 3; i++) collectMissionChip(sync, i);
assert.equal(missionReady(sync), false);
assert.equal(resolveMissionAction(sync).ok, true);
assert.deepEqual(sync.mission.committed, [0, 1]); assert.deepEqual(sync.mission.pending, [2]);
assert(sync.checkpoint.active); assert.equal(sync.checkpoint.x, 2090, 'Failed connection saves progress near repair area');
assert.equal(resolveMissionAction(sync).ok, false, 'Retry requires recovery module');
sync.mission.recovery = true; assert.equal(resolveMissionAction(sync).ok, true);
assert.deepEqual(sync.mission.committed, [0, 1, 2]); assert.deepEqual(sync.mission.pending, []);
assert(missionReady(sync));
assert.equal(resolveMissionAction(sync).points, 0, 'Reprocessing cannot duplicate confirmed updates');
assert.deepEqual(createLevel(2).mission.committed, [], 'Restart clears committed state');
assert.equal(createLevel(1).mission.queueCursor, 0, 'Restart clears queue state');
assert(createLevel(2).solids.some(p => sync.recoveryCell.x >= p.x && sync.recoveryCell.x < p.x + p.w && p.y - sync.recoveryCell.y === 38), 'Recovery module is on an already reachability-tested platform');
console.log('Project missions: catalog mapping, lot validation, ordered diagnostics and queue, partial failure, checkpoint, recovery, retry idempotence, and restart passed.');

// Touch regression: independent pointer ownership, including the event ordering
// pointerup -> lostpointercapture. No browser focus is involved in the controller.
const { createTouchInput } = await import('../platformer.js');
const touch = createTouchInput();
assert(touch.startStick(11, 80, 50, 50, 50, 30));
assert.equal(touch.read().right, true);
assert(touch.startJump(22));
assert.deepEqual([touch.read().right, touch.read().jumpPressed, touch.read().activePointers], [true, true, 2], 'Hold right with one pointer while the second requests jump');
const mobilePlayer = createPlayer(); tick(mobilePlayer, {}, ground, 30);
stepPlayer(mobilePlayer, touch.read({ consumeJump: true }), ground, dt, 2480);
assert(mobilePlayer.vx > 0 && mobilePlayer.vy < 0, 'Real physics both moves and jumps in the same simulation step');
assert.equal(touch.read().jumpPressed, false, 'A held jump is not repeated every physics frame');
touch.release(22); touch.cancel(22);
assert.equal(touch.read().right, true, 'Releasing jump and losing its capture preserves movement');
assert.equal(touch.read().activePointers, 1);
touch.startJump(33); touch.release(11);
assert.equal(touch.read().right, false, 'Releasing movement stops only movement');
assert.equal(touch.read().jumpHeld, true, 'Jump pointer remains held after stick release');
assert.equal(touch.read().jumpPressed, true);
touch.release(33); touch.cancel(33);
assert.equal(touch.read().jumpPressed, true, 'A short tap is preserved through implicit lostpointercapture until the next frame');
touch.read({ consumeJump: true });
assert.equal(touch.read().activePointers, 0);
assert(touch.startStick(44, 52, 51, 50, 50, 30));
assert.deepEqual([touch.read().left, touch.read().right], [false, false], 'Dead zone prevents neutral-stick drift');
touch.moveStick(44, -100, 50);
assert.equal(touch.read().left, true);
assert.equal(touch.read().dx, -30, 'Thumb travel stays bounded');
assert.equal(touch.moveStick(99, 100, 50), false, 'Unrelated pointer cannot steal stick ownership');
assert.equal(touch.startStick(99, 100, 50, 50, 50, 30), false);
touch.startJump(55); touch.cancel(55);
assert.equal(touch.read().left, true, 'Cancelling jump leaves the stick intact');
assert.equal(touch.read().jumpPressed, false, 'Cancelled tap does not produce a phantom jump');
touch.startJump(66); touch.cancel(44);
assert.equal(touch.read().jumpHeld, true, 'Cancelling movement leaves the jump intact');
assert.equal(touch.read().left, false);
touch.reset();
assert.deepEqual(touch.read(), { left: false, right: false, jumpPressed: false, jumpHeld: false, stickHeld: false, dx: 0, dy: 0, activePointers: 0 }, 'Pause, lost focus and restart clear all touch state');
touch.release(66); touch.cancel(66); assert.equal(touch.read().activePointers, 0, 'Late events after reset cannot resurrect input');
console.log('Mobile touch: simultaneous move+jump physics, independent release/cancel, dead zone, bounded thumb, pointer ownership, short tap, reset and late events passed.');
