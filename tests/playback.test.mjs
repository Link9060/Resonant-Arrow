import test from 'node:test';
import assert from 'node:assert/strict';
import { createClock, SCENES, sceneAt, DURATION } from '../src/playback.js';

test('each scene switches exactly at its boundary, including a dropped frame', () => {
 for(let i=1;i<SCENES.length;i++) {
  assert.equal(sceneAt(SCENES[i].at-1).id,SCENES[i-1].id);
  assert.equal(sceneAt(SCENES[i].at).id,SCENES[i].id);
 }
 const c=createClock();c.start(0);c.tick(3200);
 assert.equal(sceneAt(c.elapsed).name,'IGNITION');
 assert.equal(c.elapsed-SCENES[1].at,400); // effects catch up rather than replay
});
test('hidden time does not advance the sequence',()=>{
 const c=createClock();c.start(100);c.tick(2900);c.pause();
 c.tick(60000);assert.equal(c.elapsed,2800);
 c.tick(60100);assert.equal(c.elapsed,2900);
});
test('skip cannot be undone by the next animation frame',()=>{
 const c=createClock();c.start(0);c.tick(1000);c.finish();c.tick(2000);
 assert.equal(c.elapsed,DURATION);assert.equal(c.running,false);
});
test('replay resets time, then a full new run finishes at 49 seconds',()=>{
 const c=createClock();c.finish();c.reset();assert.equal(c.elapsed,0);
 c.start(100000);c.tick(102800);assert.equal(sceneAt(c.elapsed).name,'IGNITION');
 c.tick(149001);assert.equal(c.elapsed,49000);assert.equal(c.running,false);
});
