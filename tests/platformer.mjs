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
