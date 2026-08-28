/**
 * RESECTOR 7 — CLUE DEDUCTIONS, 0 PTS START & ADMIN LOGS TEST
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

global.logAdminEvent = function(category, message) {
  const masterLogs = JSON.parse(localStorage.getItem('RESECTOR7_MASTER_LOGS') || '[]');
  masterLogs.push({ category, message, timestamp: Date.now() });
  localStorage.setItem('RESECTOR7_MASTER_LOGS', JSON.stringify(masterLogs));
};

require('./js/gameState.js');
require('./js/daisy/knowledgeBase.js');
require('./js/daisy/storyGuard.js');
require('./js/daisy/reasoningEngine.js');
require('./js/daisy/daisyAI.js');
require('./js/participantLogsData.js');

console.log("================================================================");
console.log("  RESECTOR 7 — CLUE DEDUCTION, 0 PTS START & LOGGING TEST      ");
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

// 1. Initial State: Player starts at 0 points
const gs = new GameStateManager();
gs.setPlayerName("TEST_PILOT_01");

let allParticipants = JSON.parse(localStorage.getItem('RESECTOR7_ALL_PARTICIPANTS') || '{}');
let record = allParticipants[gs.sessionId];

assert(record != null, "Participant record created in RESECTOR7_ALL_PARTICIPANTS");
assert(record.score === 0, `Initial score is 0 PTS (got ${record.score})`);
assert(record.solvedFragments.length === 0, "Initial solved fragments is 0/4");

// 2. Daisy gives easy clue and logs penalty
const daisy = new DaisyAICharacter();
const clueResponse = daisy.respond("clue please", gs);

assert(clueResponse && clueResponse.text.length > 20, "Daisy returned progressive easy clue");
assert(gs.state.helpTierUsed[0] === 1, "helpTierUsed for Phase 1 incremented to 1");

const masterLogs = JSON.parse(localStorage.getItem('RESECTOR7_MASTER_LOGS') || '[]');
const clueLog = masterLogs.find(l => l.category === 'CLUE_PENALTY');

assert(clueLog != null, "Clue penalty logged in Master Admin Activity logs");
assert(clueLog.message.includes("TEST_PILOT_01") && clueLog.message.includes("-5 PTS"), `Log contains participant and deduction info (${clueLog ? clueLog.message : 'none'})`);

// 3. Player solves fragments and earns points
gs.addSolvedFragment("HAVE", 1);
allParticipants = JSON.parse(localStorage.getItem('RESECTOR7_ALL_PARTICIPANTS') || '{}');
record = allParticipants[gs.sessionId];

assert(record.score === 10, `Score is now 10 PTS after solving Fragment 1 (got ${record.score})`);

gs.addSolvedFragment("YOU", 2);
gs.addSolvedFragment("TRIED", 3);
gs.addSolvedFragment("REBOOTING", 4);
gs.setFinalChoice("SAVE");

allParticipants = JSON.parse(localStorage.getItem('RESECTOR7_ALL_PARTICIPANTS') || '{}');
record = allParticipants[gs.sessionId];

assert(record.score >= 80, `Final score calculated upon completion (got ${record.score} PTS)`);
assert(record.status === 'COMPLETED', "Status is COMPLETED");

// 4. Detailed itemized judge reasons
const breakdown = window.computeDetailedJudgePointBreakdown(record);
assert(breakdown.fragPts === 40, `40 PTS for all 4 fragments recovered (got ${breakdown.fragPts})`);
assert(breakdown.cluePts === 15, `15/20 PTS for Clue bonus after 1 clue used (-5 pts penalty) (got ${breakdown.cluePts})`);
assert(breakdown.itemizedReasons.length === 4, "4 itemized reason categories present");

console.log("\n--- ITEMIZED REASONS BREAKDOWN ---");
breakdown.itemizedReasons.forEach(r => {
  console.log(`  • ${r.category}: ${r.points} (${r.reason})`);
});
console.log(`  Total: ${breakdown.totalScore} PTS [${breakdown.grade}] — ${breakdown.verdict}\n`);

console.log("================================================================");
if (allPass) {
  console.log("  ALL CLUE DEDUCTION & 0 PTS TESTS PASSED (100% OK)            ");
} else {
  console.log("  TEST SUITE FAILED.                                           ");
  process.exit(1);
}
console.log("================================================================\n");
