// One clock owns scene selection, canvas motion, CSS effects and progress.
export const SCENES = [
  { id: 1, at: 0, name: 'ALIGN' },
  { id: 2, at: 2800, name: 'IGNITION' },
  { id: 3, at: 5000, name: 'DIRECTION' },
  { id: 4, at: 9500, name: 'CHAOS' },
  { id: 5, at: 13500, name: 'CONNECT' },
  { id: 6, at: 18000, name: 'ATLAS' },
  { id: 7, at: 23000, name: 'RAVIN' },
  { id: 8, at: 28000, name: 'RELAY' },
  { id: 9, at: 33000, name: 'WAYPOINT' },
  { id: 10, at: 38000, name: 'ORBIT' },
  { id: 11, at: 45000, name: 'ARROW' },
  { id: 12, at: 49000, name: 'EXPLORE' },
];
export const DURATION = SCENES.at(-1).at;
export function sceneAt(elapsed) {
  return SCENES.findLast(s => elapsed >= s.at) || SCENES[0];
}
export function createClock() {
  return {
    elapsed: 0, last: null, running: false,
    start(now) { this.elapsed = 0; this.last = now; this.running = true; },
    pause() { this.last = null; },
    tick(now) {
      if (this.running && this.last !== null) this.elapsed = Math.min(DURATION, this.elapsed + Math.max(0, now - this.last));
      this.last = now;
      if (this.elapsed === DURATION) this.running = false;
      return this.elapsed;
    },
    reset() { this.elapsed = 0; this.last = null; this.running = false; },
    finish() { this.elapsed = DURATION; this.running = false; this.last = null; },
  };
}
