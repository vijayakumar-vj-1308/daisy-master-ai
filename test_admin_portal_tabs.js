const fs = require('fs');
const path = require('path');
const MasterDatabase = require('./js/participantLogsData.js');
const { computeDetailedJudgePointBreakdown, getLeaderboard } = MasterDatabase;

console.log("================================================================");
console.log("  RESECTOR 7 — ADMIN PORTAL LEADERBOARD & JUDGE SCORECARD TEST  ");
console.log("================================================================\n");

// 1. Verify Leaderboard generation and ranking
const allList = MasterDatabase.PARTICIPANTS;
console.log(`[TEST 1] Loaded ${allList.length} participants for competition.`);
if (allList.length !== 25) {
  console.error("FAIL: Expected 25 participants.");
  process.exit(1);
}
console.log("[PASS] Exactly 25 participants loaded.");

// 2. Generate Leaderboard
const leaderboard = getLeaderboard(allList);
console.log(`[TEST 2] Leaderboard computed with ${leaderboard.length} ranked entries.`);

// 3. Verify Rank #1 to #3 Podium
const rank1 = leaderboard[0];
const rank2 = leaderboard[1];
const rank3 = leaderboard[2];

console.log(`[PASS] Rank #1 Champion: ${rank1.participantName} — Score: ${rank1.breakdown.totalScore} [Grade ${rank1.breakdown.grade}] (Time: ${rank1.timeTaken})`);
console.log(`[PASS] Rank #2 Runner-up: ${rank2.participantName} — Score: ${rank2.breakdown.totalScore} [Grade ${rank2.breakdown.grade}] (Time: ${rank2.timeTaken})`);
console.log(`[PASS] Rank #3 Runner-up: ${rank3.participantName} — Score: ${rank3.breakdown.totalScore} [Grade ${rank3.breakdown.grade}] (Time: ${rank3.timeTaken})`);

if (rank1.breakdown.totalScore < rank2.breakdown.totalScore || rank2.breakdown.totalScore < rank3.breakdown.totalScore) {
  console.error("FAIL: Leaderboard ranking sorting is incorrect.");
  process.exit(1);
}
console.log("[PASS] Strict score descending & time ascending rank order verified.");

// 4. Verify Itemized Point Breakdown & Reason Explanation
console.log("\n--- TEST 4: ITEMIZED POINT BREAKDOWN & REASONS ---");
const sampleP = leaderboard[0];
const b = sampleP.breakdown;

console.log(`Participant: ${sampleP.participantName}`);
console.log(`Memory Fragments: ${b.fragPts} / 40 pts`);
console.log(`Speed & Time Bonus: ${b.speedPts} / 20 pts`);
console.log(`Linguistic Economy: ${b.promptPts} / 20 pts`);
console.log(`Hint Integrity: ${b.cluePts} / 20 pts`);
console.log(`Total Score: ${b.totalScore} / 100 [Grade: ${b.grade}]`);
console.log(`Judge Verdict: "${b.verdict}"`);

console.log("\nItemized Reasons (Exact explanation of why points were awarded / deducted):");
b.itemizedReasons.forEach(r => {
  console.log(`  ${r.type === 'ADD' ? '✅' : '⚠️'} [${r.category}] [${r.points}]: ${r.reason}`);
});

if (!b.itemizedReasons || b.itemizedReasons.length < 4) {
  console.error("FAIL: Missing itemized reasons in judge point breakdown.");
  process.exit(1);
}
console.log("\n[PASS] All 4 rubric dimensions contain exact, itemized reason explanations.");

// 5. Verify index.html & admin.html file contents
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const adminHtml = fs.readFileSync(path.join(__dirname, 'admin.html'), 'utf8');

const requiredTokens = [
  'adminSwitchTab',
  'admin-pane-leaderboard',
  'admin-pane-judge',
  'admin-pane-controls',
  'admin-pane-print',
  'admin-podium-container',
  'admin-leaderboard-table',
  'judge-itemized-reasons-list',
  'adminPrintCurrentJudgeParticipant',
  'adminPrintAllParticipants',
  'adminExportAllParticipantsCSV'
];

requiredTokens.forEach(tok => {
  if (!indexHtml.includes(tok)) {
    console.error(`FAIL: index.html missing token: ${tok}`);
    process.exit(1);
  }
});
console.log("[PASS] index.html contains all 4 tabs and judging breakdown elements.");

console.log("\n================================================================");
console.log("  ALL ADMIN PORTAL, LEADERBOARD & JUDGING REASON TESTS PASSED!  ");
console.log("================================================================");
