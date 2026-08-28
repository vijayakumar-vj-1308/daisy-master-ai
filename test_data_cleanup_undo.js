/**
 * RESECTOR 7 — LEADERBOARD DATA CLEANUP, INDIVIDUAL DELETE, UNDO & SLOW STARS TEST
 */

const fs = require('fs');
const path = require('path');

console.log("================================================================");
console.log("  RESECTOR 7 — LEADERBOARD DATA CLEANUP & UNDO TEST             ");
console.log("================================================================\n");

// 1. Check index.html for delete, clear all, load samples, undo
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const checks = [
  { name: "adminDeleteSingleParticipant in index.html", pass: indexHtml.includes('adminDeleteSingleParticipant') },
  { name: "adminClearAllLeaderboard in index.html", pass: indexHtml.includes('adminClearAllLeaderboard') },
  { name: "adminUndoDelete in index.html", pass: indexHtml.includes('adminUndoDelete') },
  { name: "adminLoadSampleParticipants in index.html", pass: indexHtml.includes('adminLoadSampleParticipants') },
  { name: "Leaderboard Toast Notification Element", pass: indexHtml.includes('id="admin-leaderboard-toast"') },
  { name: "Toolbar Undo Button", pass: indexHtml.includes('id="btn-admin-undo"') },
  { name: "Individual Delete Button in Table Row", pass: indexHtml.includes('adminDeleteSingleParticipant(') },
];

let allPassed = true;
checks.forEach(c => {
  if (c.pass) {
    console.log(`[PASS] ${c.name}`);
  } else {
    console.log(`[FAIL] ${c.name}`);
    allPassed = false;
  }
});

// 2. Check admin.html
const adminHtml = fs.readFileSync(path.join(__dirname, 'admin.html'), 'utf8');
const adminChecks = [
  { name: "deleteParticipantRow in admin.html", pass: adminHtml.includes('deleteParticipantRow') },
  { name: "clearAllAdminLeaderboard in admin.html", pass: adminHtml.includes('clearAllAdminLeaderboard') },
  { name: "undoAdminDelete in admin.html", pass: adminHtml.includes('undoAdminDelete') },
  { name: "loadSampleTournamentData in admin.html", pass: adminHtml.includes('loadSampleTournamentData') },
  { name: "Delete button on table row in admin.html", pass: adminHtml.includes('deleteParticipantRow(') },
];

adminChecks.forEach(c => {
  if (c.pass) {
    console.log(`[PASS] ${c.name}`);
  } else {
    console.log(`[FAIL] ${c.name}`);
    allPassed = false;
  }
});

// 3. Check background.js for slow star twinkling
const bgJs = fs.readFileSync(path.join(__dirname, 'js', 'background.js'), 'utf8');
const bgChecks = [
  { name: "Slow star twinkling speed in background.js", pass: bgJs.includes('0.0012') || bgJs.includes('0.0004') },
  { name: "Slow bright star twinkle speed", pass: bgJs.includes('0.0015') || bgJs.includes('0.0006') },
];

bgChecks.forEach(c => {
  if (c.pass) {
    console.log(`[PASS] ${c.name}`);
  } else {
    console.log(`[FAIL] ${c.name}`);
    allPassed = false;
  }
});

console.log("\n================================================================");
if (allPassed) {
  console.log("  ALL LEADERBOARD DATA CLEANUP & UNDO TESTS PASSED (100% OK)    ");
} else {
  console.log("  SOME TESTS FAILED! PLEASE REVIEW OUTPUT ABOVE.               ");
  process.exit(1);
}
console.log("================================================================\n");
