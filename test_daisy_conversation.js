/**
 * RESECTOR 7 — DAISY CONVERSATION & SMART CLUE REASONING TEST
 */

const fs = require('fs');
const path = require('path');

// Mock browser environment
global.window = global;
require('./js/daisy/knowledgeBase.js');
require('./js/daisy/storyGuard.js');
require('./js/daisy/reasoningEngine.js');
require('./js/daisy/daisyAI.js');

console.log("================================================================");
console.log("  RESECTOR 7 — DAISY NATURAL CONVERSATION & CLUE TEST           ");
console.log("================================================================\n");

const daisy = new DaisyAICharacter();

const mockGameState = {
  state: {
    playerName: "VIJAYAKUMAR",
    currentMemoryLevel: 1,
    oxygenLevel: 82,
    rebootCompleted: false,
    helpTierUsed: [0, 0, 0, 0],
    conversationHistory: []
  }
};

let allPass = true;

function testCase(label, input, level, expectedSubstring) {
  mockGameState.state.currentMemoryLevel = level;
  const res = daisy.respond(input, mockGameState);
  const text = (res && res.text) || "";
  const passed = text.toLowerCase().includes(expectedSubstring.toLowerCase());
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${label}`);
  console.log(`   User: "${input}" (Level ${level})`);
  console.log(`   Daisy: "${text.substring(0, 100)}..."\n`);
  if (!passed) allPass = false;
}

// 1. Clue Identification & Guidance
testCase("English Clue Request (Level 1)", "Give me a clue", 1, "Possessed by all");
testCase("Tanglish Clue Request (Level 1)", "clue sollu", 1, "basic questions of possession");
testCase("Clue Request (Level 2)", "I need help with this riddle", 2, "second fragment");
testCase("Clue Request (Level 3)", "give me a hint", 3, "effort");
testCase("Clue Request (Level 4)", "help me analyze", 4, "universal IT procedure");

// 2. Smart Near-Miss Recognition
testCase("Near-Miss Guess 'has' for HAVE (Level 1)", "is the word has", 1, "deduced the exact concept of possession");
testCase("Near-Miss Guess 'me' for YOU (Level 2)", "is it me", 2, "right perspective");
testCase("Near-Miss Guess 'try' for TRIED (Level 3)", "maybe try", 3, "spot-on");
testCase("Near-Miss Guess 'reboot' for REBOOTING (Level 4)", "is it reboot", 4, "continuous action");

// 3. Emotional & Tanglish Reassurance
testCase("Player Panic / Fear", "I am so scared right now", 1, "I understand");

console.log("================================================================");
if (allPass) {
  console.log("  ALL DAISY CONVERSATION & CLUE TESTS PASSED (100% OK)          ");
} else {
  console.log("  SOME CONVERSATION TESTS FAILED.                              ");
  process.exit(1);
}
console.log("================================================================\n");
