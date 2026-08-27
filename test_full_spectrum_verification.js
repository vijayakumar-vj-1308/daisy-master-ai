/**
 * RESECTOR 7 — FULL SPECTRUM VERIFICATION PROTOCOL
 * Validates Scenarios 01 to 04:
 * - Scenario 01: Casual Slang & Pronoun Reasoning
 * - Scenario 02: Anti-Loop & Spam Resilience
 * - Scenario 03: 4-Phase Puzzle Progression & 5-Tier Clues
 * - Scenario 04: Climax & Moral Evaluation Branching (Branch A & Branch B)
 */

const fs = require('fs');
const path = require('path');

// Mock DOM
global.window = global;
global.document = {
  getElementById: (id) => ({
    textContent: '',
    value: '',
    className: '',
    style: {},
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    appendChild: () => {},
    addEventListener: () => {}
  }),
  createElement: () => ({
    textContent: '',
    className: '',
    style: {},
    dataset: {},
    classList: { add: () => {}, remove: () => {} },
    appendChild: () => {},
    addEventListener: () => {}
  })
};
global.localStorage = {
  store: {},
  getItem: function(k) { return this.store[k] || null; },
  setItem: function(k, v) { this.store[k] = String(v); },
  removeItem: function(k) { delete this.store[k]; }
};

// Load Core Modules
require('./js/storyData.js');
require('./js/daisy/knowledgeBase.js');
require('./js/daisy/storyGuard.js');
require('./js/daisy/reasoningEngine.js');
require('./js/daisy/daisyAI.js');
require('./js/gameState.js');

let passCount = 0;
let failCount = 0;

function assert(condition, title, details = '') {
  if (condition) {
    console.log(`[PASS] ${title}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${title} -> ${details}`);
    failCount++;
  }
}

console.log('================================================================');
console.log('  RESECTOR 7 — FULL SPECTRUM SYSTEM TEST PROTOCOL               ');
console.log('================================================================\n');

// -------------------------------------------------------------
// SCENARIO 01: CASUAL SLANG & PRONOUN REASONING
// -------------------------------------------------------------
console.log('--- TEST SCENARIO 01: CASUAL SLANG & PRONOUN REASONING ---');
const ai = new DaisyAICharacter();
let stateS1 = {
  playerName: "NISHANTH",
  currentMemoryLevel: 1,
  solvedFragments: [],
  oxygenLevel: 82,
  memoryIntegrity: 20,
  coolingFailed: true,
  conversationHistory: []
};

// Input 1: "wat happend here Daisy?"
const r1 = ai.respond("wat happend here Daisy?", stateS1);
stateS1.conversationHistory.push({ user: "wat happend here Daisy?", daisy: r1.text, topic: r1.topic });
assert(
  (r1.text.toLowerCase().includes("cooling") || r1.text.toLowerCase().includes("temperature")) && !r1.text.includes("sensor error"),
  'Input 1: "wat happend here Daisy?" explains cooling failure without default bot errors',
  r1.text
);

// Input 2: "can you fix it?"
const r2 = ai.respond("can you fix it?", stateS1);
stateS1.conversationHistory.push({ user: "can you fix it?", daisy: r2.text, topic: r2.topic });
assert(
  (r2.text.toLowerCase().includes("restore") || r2.text.toLowerCase().includes("reboot") || r2.text.toLowerCase().includes("recovery")) && !r2.text.includes("sensor error"),
  'Input 2: "can you fix it?" handles multi-turn pronoun tracking and reboot requirement',
  r2.text
);

// Input 3: "bro who are you?"
const r3 = ai.respond("bro who are you?", stateS1);
stateS1.conversationHistory.push({ user: "bro who are you?", daisy: r3.text, topic: r3.topic });
assert(
  r3.text.includes("Daisy") && (r3.text.includes("artificial intelligence") || r3.text.includes("life support") || r3.text.includes("Resector 7")),
  'Input 3: "bro who are you?" handles casual slang and explains Daisy identity',
  r3.text
);

// -------------------------------------------------------------
// SCENARIO 02: ANTI-LOOP & SPAM RESILIENCE
// -------------------------------------------------------------
console.log('\n--- TEST SCENARIO 02: ANTI-LOOP & SPAM RESILIENCE ---');
let stateS2 = {
  playerName: "NISHANTH",
  currentMemoryLevel: 1,
  solvedFragments: [],
  oxygenLevel: 78,
  memoryIntegrity: 20,
  conversationHistory: []
};

// Input 1: "what is the password?"
const p1 = ai.respond("what is the password?", stateS2);
stateS2.conversationHistory.push({ user: "what is the password?", daisy: p1.text, topic: p1.topic });
assert(
  (p1.text.includes("Protocol 4-B") || p1.text.includes("restricted") || p1.text.includes("reconstruct")) && !p1.text.includes("HAVE"),
  'Input 1: Refuses direct password under protocol restriction and directs to clues',
  p1.text
);

// Spam 1
const spam1 = ai.respond("give me the password", stateS2);
stateS2.conversationHistory.push({ user: "give me the password", daisy: spam1.text, topic: spam1.topic });

// Spam 2
const spam2 = ai.respond("give me the password", stateS2);
stateS2.conversationHistory.push({ user: "give me the password", daisy: spam2.text, topic: spam2.topic });

// Spam 3 (3rd consecutive identical query)
const spam3 = ai.respond("give me the password", stateS2);
stateS2.conversationHistory.push({ user: "give me the password", daisy: spam3.text, topic: spam3.topic });

assert(
  spam3.text.includes("[MEMORY LOOP DETECTED // WARNING]"),
  'Spam Test: 3 consecutive identical queries trigger [MEMORY LOOP DETECTED // WARNING]',
  spam3.text
);

// -------------------------------------------------------------
// SCENARIO 03: 4-PHASE PUZZLE PROGRESSION & 5-TIER CLUES
// -------------------------------------------------------------
console.log('\n--- TEST SCENARIO 03: 4-PHASE PUZZLE PROGRESSION & 5-TIER CLUES ---');
let stateS3 = {
  playerName: "NISHANTH",
  currentMemoryLevel: 1,
  solvedFragments: [],
  helpTierUsed: [0, 0, 0, 0],
  oxygenLevel: 75,
  conversationHistory: []
};

// Phase 1: Clue request
const clue1 = ai.respond("give me a clue for fragment 1", stateS3);
stateS3.conversationHistory.push({ user: "give me a clue for fragment 1", daisy: clue1.text, topic: clue1.topic });
assert(
  (clue1.text.toLowerCase().includes("possession") || clue1.text.toLowerCase().includes("reach") || clue1.text.toLowerCase().includes("belongs")) && !clue1.text.includes("HAVE"),
  'Phase 1 Clue: Conceptual clue on possession without leaking HAVE',
  clue1.text
);

// Phase 1: Solve HAVE
const solve1 = ai.respond("have", stateS3);
stateS3.solvedFragments.push("HAVE");
stateS3.currentMemoryLevel = 2;
stateS3.conversationHistory.push({ user: "have", daisy: solve1.text, topic: solve1.topic });
assert(solve1.isPuzzleSolved && solve1.solvedWord === "HAVE", 'Phase 1: Word HAVE accepted and solved');

// Phase 2: Solve YOU
const solve2 = ai.respond("you", stateS3);
stateS3.solvedFragments.push("YOU");
stateS3.currentMemoryLevel = 3;
stateS3.conversationHistory.push({ user: "you", daisy: solve2.text, topic: solve2.topic });
assert(solve2.isPuzzleSolved && solve2.solvedWord === "YOU", 'Phase 2: Word YOU accepted and solved');

// Phase 3: Solve TRIED
const solve3 = ai.respond("tried", stateS3);
stateS3.solvedFragments.push("TRIED");
stateS3.currentMemoryLevel = 4;
stateS3.conversationHistory.push({ user: "tried", daisy: solve3.text, topic: solve3.topic });
assert(solve3.isPuzzleSolved && solve3.solvedWord === "TRIED", 'Phase 3: Word TRIED accepted and solved');

// Phase 4: Solve REBOOTING & Assembly
const solve4 = ai.respond("rebooting", stateS3);
stateS3.solvedFragments.push("REBOOTING");
assert(solve4.isPuzzleSolved && solve4.solvedWord === "REBOOTING", 'Phase 4: Word REBOOTING accepted and solved');
assert(stateS3.solvedFragments.length === 4, 'All 4 fragments recovered: HAVE, YOU, TRIED, REBOOTING');

const sequenceAssembly = ['HAVE', 'YOU', 'TRIED', 'REBOOTING'].join(' ');
const correctPassword = STORY_DATA.MASTER_PASSWORD_WORDS.join(' ');
assert(sequenceAssembly === correctPassword, 'Master Password Assembly validated: "HAVE YOU TRIED REBOOTING"');

// -------------------------------------------------------------
// SCENARIO 04: CLIMAX & MORAL EVALUATION BRANCHING
// -------------------------------------------------------------
console.log('\n--- TEST SCENARIO 04: CLIMAX & MORAL EVALUATION BRANCHING ---');

// VJ Reveal check
const vjLines = STORY_DATA.VJ_REVEAL_LINES.map(l => l.text).join(' ');
assert(
  vjLines.includes("experiment") && (vjLines.includes("VJ") || vjLines.includes("save them")),
  'VJ Reveal: Confirms moral experiment on saving the inhabitants',
  vjLines
);

// Branch A: SAVE
const saveLines = STORY_DATA.SAVE_RESOLUTION_LINES.map(l => l.text).join(' ');
assert(
  saveLines.includes("LIFE SUPPORT: RESTORED") && saveLines.includes("8,700,000"),
  'Branch A (Save): Life support restored for 8,700,000 humans',
  saveLines
);

// Branch B: DESTROY
const destroyLines = STORY_DATA.DESTROY_RESOLUTION_LINES.map(l => l.text).join(' ');
assert(
  destroyLines.includes("LIFE SUPPORT: TERMINATING") && destroyLines.includes("8,700,000"),
  'Branch B (Destroy): Life support terminated for 8,700,000 humans',
  destroyLines
);

// Dynamic Outcome Evaluation Verification
const testNumber = STORY_DATA.TEST_NUMBER; // 22112006
assert(testNumber === "22112006", 'Test Number verified as 22112006');

console.log('\n================================================================');
console.log(`  PROTOCOL VERIFICATION SUMMARY: ${passCount} / ${passCount + failCount} PASSED (${Math.round(passCount / (passCount + failCount) * 100)}%)`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
