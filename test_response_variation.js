/**
 * RESECTOR 7 — RESPONSE VARIATION & REPETITION MEMORY TEST
 * Verifies Daisy maintains factual consistency while varying phrasing naturally
 * when asked the same question multiple times.
 */

// Mock browser globals for Node.js
global.window = global;

require('./js/daisy/knowledgeBase.js');
require('./js/daisy/storyGuard.js');
require('./js/daisy/reasoningEngine.js');
require('./js/daisy/daisyAI.js');
require('./js/gameState.js');

const daisyAI = global.daisyAI;
const gameState = global.gameState;

console.log('================================================================');
console.log('  RESECTOR 7 — DAISY RESPONSE VARIATION & MEMORY TEST           ');
console.log('================================================================\n');

// Clean test state
gameState.state = {
  currentStage: 'TERMINAL',
  playerName: 'NISHANTH',
  currentMemoryLevel: 1,
  solvedFragments: [],
  attemptHistory: [[], [], [], []],
  helpTierUsed: [0, 0, 0, 0],
  oxygenLevel: 75,
  memoryIntegrity: 20,
  coolingFailed: true,
  rebootCompleted: false,
  vjRevealed: false,
  finalChoice: null,
  testCompleted: false,
  conversationHistory: []
};

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// Test 1: Cooling Disaster Repetition
console.log('--- TEST 1: REPEATED QUESTION: "What happened?" ---');
const qCool = "What happened?";

// Turn 1
const rCool1 = daisyAI.respond(qCool, gameState);
gameState.recordConversationTurn(qCool, rCool1.text, rCool1.topic);
assert(rCool1.text.includes("cooling system failed") && !rCool1.text.includes("already"), "Turn 1: Initial detailed explanation.");

// Turn 2
const rCool2 = daisyAI.respond(qCool, gameState);
gameState.recordConversationTurn(qCool, rCool2.text, rCool2.topic);
assert(rCool2.text.includes("mentioned earlier") || rCool2.text.includes("root cause"), "Turn 2: Natural recall variation ('As I mentioned earlier...').");
assert(rCool1.text !== rCool2.text, "Turn 2: Phrasing is different from Turn 1.");

// Turn 3
const rCool3 = daisyAI.respond(qCool, gameState);
gameState.recordConversationTurn(qCool, rCool3.text, rCool3.topic);
assert(rCool3.text.includes("already told you") || rCool3.text.includes("source of the current instability"), "Turn 3: Concise recall variation ('I already told you...').");
assert(rCool3.text !== rCool2.text && rCool3.text !== rCool1.text, "Turn 3: Phrasing is different from Turn 1 & 2.");
assert(rCool3.text.includes("cooling"), "Turn 3: Factual consistency maintained (cooling system).");

// Test 2: Population Question Repetition
console.log('\n--- TEST 2: REPEATED QUESTION: "How many people are here?" ---');
const qPop = "How many people are here?";

// Turn 1
const rPop1 = daisyAI.respond(qPop, gameState);
gameState.recordConversationTurn(qPop, rPop1.text, rPop1.topic);
assert(rPop1.text.includes("8.7 million humans") && !rPop1.text.includes("already"), "Turn 1: Primary population explanation.");

// Turn 2
const rPop2 = daisyAI.respond(qPop, gameState);
gameState.recordConversationTurn(qPop, rPop2.text, rPop2.topic);
assert(rPop2.text.includes("As I told you") || rPop2.text.includes("8.7 million"), "Turn 2: Natural variation with recall.");
assert(rPop1.text !== rPop2.text, "Turn 2: Different phrasing from Turn 1.");

// Turn 3
const rPop3 = daisyAI.respond(qPop, gameState);
gameState.recordConversationTurn(qPop, rPop3.text, rPop3.topic);
assert(rPop3.text.includes("not changed") || rPop3.text.includes("8.7 million"), "Turn 3: Concise variation acknowledging repetition.");
assert(rPop3.text.includes("8.7 million"), "Turn 3: Population number remains 100% factually consistent.");

// Test 3: Earth Inquiry Repetition
console.log('\n--- TEST 3: REPEATED QUESTION: "What happened to Earth?" ---');
const qEarth = "What happened to Earth?";

const rEarth1 = daisyAI.respond(qEarth, gameState);
gameState.recordConversationTurn(qEarth, rEarth1.text, rEarth1.topic);

const rEarth2 = daisyAI.respond(qEarth, gameState);
gameState.recordConversationTurn(qEarth, rEarth2.text, rEarth2.topic);

assert(rEarth1.text !== rEarth2.text, "Earth inquiry produces natural variation on repetition.");
assert(rEarth2.text.includes("Earth") && (rEarth2.text.includes("uninhabitable") || rEarth2.text.includes("ruin")), "Earth facts remain 100% consistent.");

console.log('\n================================================================');
console.log(`  VARIATION TEST SUMMARY: ${passCount} / ${passCount + failCount} PASSED`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
