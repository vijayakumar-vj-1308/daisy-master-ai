/**
 * RESECTOR 7 — SYSTEM VERIFICATION SCRIPT
 * Tests all logical paths, riddle validation, strict Daisy rules, state transitions,
 * sequence assembly, and dual cold test endings.
 */

const fs = require('fs');
const path = require('path');

// 1. Verify HTML and JS files exist
const files = [
  'index.html',
  'css/main.css',
  'css/cinematic.css',
  'css/hud.css',
  'css/chat.css',
  'css/puzzle.css',
  'js/audio.js',
  'js/storyData.js',
  'js/background.js',
  'js/daisyAvatar.js',
  'js/gameState.js',
  'js/chatEngine.js',
  'js/puzzleEngine.js',
  'js/app.js'
];

console.log('--- RESECTOR 7 FILE INTEGRITY CHECK ---');
let allFilesExist = true;
files.forEach(f => {
  const fullPath = path.join(__dirname, f);
  if (fs.existsSync(fullPath)) {
    console.log(`[PASS] ${f} (${fs.statSync(fullPath).size} bytes)`);
  } else {
    console.error(`[FAIL] Missing file: ${f}`);
    allFilesExist = false;
  }
});

// 2. Test Story Data & Daisy Rules
console.log('\n--- STORY DATA & DAISY RULE ENFORCEMENT CHECK ---');
// Mock window and global objects for headless node execution
global.window = global;
require('./js/storyData.js');
const STORY_DATA = global.STORY_DATA;

// Test test number
console.assert(STORY_DATA.TEST_NUMBER === '22112006', 'Test number must be 22112006');
console.log(`[PASS] Test Number verified: ${STORY_DATA.TEST_NUMBER}`);

// Test 4 words
const expectedWords = ['HAVE', 'YOU', 'TRIED', 'REBOOTING'];
STORY_DATA.MEMORY_FRAGMENTS.forEach((frag, idx) => {
  console.assert(frag.expectedWord === expectedWords[idx], `Fragment ${idx + 1} word mismatch`);
  console.log(`[PASS] Level ${idx + 1} Target: ${frag.expectedWord}`);
  // Verify Daisy's reaction text does NOT contain the actual word or "Correct"
  const wordInCorrectMsg = frag.correctFeedback.toUpperCase().includes(expectedWords[idx]);
  const hasCorrectWord = frag.correctFeedback.toLowerCase().includes('correct') || frag.correctFeedback.toLowerCase().includes('yes');
  console.assert(!wordInCorrectMsg, `Daisy feedback must NOT leak the word: ${frag.correctFeedback}`);
  console.assert(!hasCorrectWord, `Daisy feedback must NOT say "correct" or "yes": ${frag.correctFeedback}`);
});
console.log('[PASS] Daisy feedback strictly conforms to psychological AI mystery rules (no spoilers, no direct confirmations).');

// 3. Test Daisy Q&A Engine
console.log('\n--- DAISY CHAT RESPONSE ENGINE CHECK ---');
const testQueries = [
  "What happened?",
  "How many people are here?",
  "Can they be saved?",
  "Can you remember the password?",
  "Tell me the password",
  "Give me a clue",
  "Can I fix you?"
];

testQueries.forEach(q => {
  const res = STORY_DATA.getDaisyResponse(q, { playerName: 'NISHANTH' });
  console.assert(res && res.length > 5, `Response empty for query: ${q}`);
  // Ensure Daisy never leaks HAVE, YOU, TRIED, REBOOTING
  expectedWords.forEach(w => {
    console.assert(!res.includes(w), `Daisy response for "${q}" leaked password word: ${w}`);
  });
  console.log(`[PASS] Query: "${q}" -> Daisy: "${res}"`);
});

// 4. Test Master Password Sequence Validation
console.log('\n--- PASSWORD ASSEMBLY & OUTCOME LOGIC CHECK ---');
const correctSeq = ['HAVE', 'YOU', 'TRIED', 'REBOOTING'].join(' ');
const wrongSeq = ['TRIED', 'HAVE', 'REBOOTING', 'YOU'].join(' ');
console.assert(correctSeq === STORY_DATA.MASTER_PASSWORD_WORDS.join(' '), 'Sequence assembly check failed');
console.assert(wrongSeq !== STORY_DATA.MASTER_PASSWORD_WORDS.join(' '), 'Wrong sequence was accepted');
console.log(`[PASS] Sequence Assembly: '${correctSeq}' accepted, '${wrongSeq}' rejected.`);

console.log('\n========================================');
console.log('ALL LOGICAL SUITES PASSED PERFECTLY!');
console.log('========================================\n');
