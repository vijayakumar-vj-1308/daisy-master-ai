/**
 * RESECTOR 7 — GAME START SEQUENCE VERIFICATION TEST
 */

// Mock browser environment
global.window = global;
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

require('./js/gameState.js');

console.log("================================================================");
console.log("  RESECTOR 7 — GAME START & INITIALIZATION TEST                 ");
console.log("================================================================\n");

let allPass = true;
function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
    allPass = false;
  }
}

// 1. New game state creation
const gs = new GameStateManager();

assert(gs.state.currentStage === 'INTRO', `Default stage is INTRO (got ${gs.state.currentStage})`);
assert(gs.state.missionTimeRemaining === 300, `Default timer is 300s / 5:00 (got ${gs.state.missionTimeRemaining})`);
assert(gs.state.isGameOver === false, "isGameOver is false");
assert(gs.state.oxygenLevel === 82, `Oxygen level is 82% (got ${gs.state.oxygenLevel})`);

// 2. Simulate previously timed-out storage being loaded into intro
gs.state.missionTimeRemaining = 0;
gs.state.isGameOver = true;
gs.state.playerName = '';
gs.save();

const gs2 = new GameStateManager();
assert(gs2.state.missionTimeRemaining === 300, `Reloading intro resets timer to 300s (got ${gs2.state.missionTimeRemaining})`);
assert(gs2.state.isGameOver === false, "Reloading intro resets isGameOver to false");

// 3. Advancing to Identity and Terminal
gs2.setPlayerName("CYBER_RUNNER");
assert(gs2.state.playerName === "CYBER_RUNNER", "Player name set");
assert(gs2.state.missionTimeRemaining === 300, "Timer remains active 300s");
assert(gs2.state.missionTimerRunning === true, "Timer running is true");

console.log("================================================================");
if (allPass) {
  console.log("  ALL START & INITIALIZATION TESTS PASSED (100% OK)            ");
} else {
  console.log("  START TEST FAILED.                                           ");
  process.exit(1);
}
console.log("================================================================\n");
