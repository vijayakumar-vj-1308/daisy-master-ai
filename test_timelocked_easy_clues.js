/**
 * RESECTOR 7 — TIME-LOCKED EASY CLUES TEST SUITE
 * Verifies that easy clues are strictly time-gated per round:
 * - Round 1 (HAVE): "A word meaning possession." (> 5 mins in round 1)
 * - Round 2 (YOU): "The word refers to the person reading this." (> 7 mins in round 2)
 * - Round 3 (TRIED): "It means attempted." (> 7 mins in round 3)
 * - Round 4 (REBOOTING): "It means attempted." (> 4 mins in round 4)
 */

const fs = require('fs');
const path = require('path');

console.log("================================================================");
console.log("  RESECTOR 7 — TIME-LOCKED EASY CLUES TEST SUITE               ");
console.log("================================================================\n");

// Mock global environment
global.window = global;
global.document = {
  getElementById: () => null,
  addEventListener: () => {}
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

// Load modules
require('./js/storyData.js');
require('./js/daisy/knowledgeBase.js');
require('./js/gameState.js');
const { DaisyReasoningEngine } = require('./js/daisy/reasoningEngine.js');

const engine = new DaisyReasoningEngine();
const gm = global.gameState || new global.GameStateManager();
global.gameState = gm;

const tests = [];

// TEST 1: Round 1 (HAVE) - Under 5 mins -> Locked
gm.state.currentMemoryLevel = 1;
gm.state.levelStartTimes = [Date.now() - (2 * 60 * 1000), 0, 0, 0]; // 2 mins elapsed
const res1_early = engine.processUserInput("give me a clue", gm);
tests.push({
  name: "Round 1 (HAVE): Under 5 mins keeps direct clue locked",
  pass: res1_early.text.includes("TIME-LOCK ACTIVE") && !res1_early.text.includes("A word meaning possession.")
});

// TEST 2: Round 1 (HAVE) - Over 5 mins -> Unlocked
gm.state.levelStartTimes = [Date.now() - (6 * 60 * 1000), 0, 0, 0]; // 6 mins elapsed
const res1_unlocked = engine.processUserInput("give me a clue", gm);
tests.push({
  name: "Round 1 (HAVE): Over 5 mins unlocks 'A word meaning possession.'",
  pass: res1_unlocked.text.includes("A word meaning possession.")
});

// TEST 3: Round 2 (YOU) - Under 7 mins -> Locked
gm.state.currentMemoryLevel = 2;
gm.state.levelStartTimes = [0, Date.now() - (4 * 60 * 1000), 0, 0]; // 4 mins elapsed
const res2_early = engine.processUserInput("can you give hint", gm);
tests.push({
  name: "Round 2 (YOU): Under 7 mins keeps direct clue locked",
  pass: res2_early.text.includes("TIME-LOCK ACTIVE") && !res2_early.text.includes("The word refers to the person reading this.")
});

// TEST 4: Round 2 (YOU) - Over 7 mins -> Unlocked
gm.state.levelStartTimes = [0, Date.now() - (8 * 60 * 1000), 0, 0]; // 8 mins elapsed
const res2_unlocked = engine.processUserInput("give clue", gm);
tests.push({
  name: "Round 2 (YOU): Over 7 mins unlocks 'The word refers to the person reading this.'",
  pass: res2_unlocked.text.includes("The word refers to the person reading this.")
});

// TEST 5: Round 3 (TRIED) - Under 7 mins -> Locked
gm.state.currentMemoryLevel = 3;
gm.state.levelStartTimes = [0, 0, Date.now() - (5 * 60 * 1000), 0]; // 5 mins elapsed
const res3_early = engine.processUserInput("clue please", gm);
tests.push({
  name: "Round 3 (TRIED): Under 7 mins keeps direct clue locked",
  pass: res3_early.text.includes("TIME-LOCK ACTIVE") && !res3_early.text.includes("It means attempted.")
});

// TEST 6: Round 3 (TRIED) - Over 7 mins -> Unlocked
gm.state.levelStartTimes = [0, 0, Date.now() - (9 * 60 * 1000), 0]; // 9 mins elapsed
const res3_unlocked = engine.processUserInput("give me a clue", gm);
tests.push({
  name: "Round 3 (TRIED): Over 7 mins unlocks 'It means attempted.'",
  pass: res3_unlocked.text.includes("It means attempted.")
});

// TEST 7: Round 4 (REBOOTING) - Under 4 mins -> Locked
gm.state.currentMemoryLevel = 4;
gm.state.levelStartTimes = [0, 0, 0, Date.now() - (2 * 60 * 1000)]; // 2 mins elapsed
const res4_early = engine.processUserInput("give me hint for fragment 4", gm);
tests.push({
  name: "Round 4 (REBOOTING): Under 4 mins keeps direct clue locked",
  pass: res4_early.text.includes("TIME-LOCK ACTIVE") && !res4_early.text.includes("It means attempted.")
});

// TEST 8: Round 4 (REBOOTING) - Over 4 mins -> Unlocked
gm.state.levelStartTimes = [0, 0, 0, Date.now() - (5 * 60 * 1000)]; // 5 mins elapsed
const res4_unlocked = engine.processUserInput("give clue", gm);
tests.push({
  name: "Round 4 (REBOOTING): Over 4 mins unlocks 'It means attempted.'",
  pass: res4_unlocked.text.includes("It means attempted.")
});

let passCount = 0;
let failCount = 0;

tests.forEach(t => {
  if (t.pass) {
    console.log(`[PASS] ${t.name}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${t.name}`);
    failCount++;
  }
});

console.log("\n================================================================");
console.log(`  TIME-LOCKED CLUES TEST RESULT: ${passCount} / ${tests.length} PASSED (${Math.round(passCount / tests.length * 100)}%)`);
console.log("================================================================\n");

process.exit(failCount === 0 ? 0 : 1);
