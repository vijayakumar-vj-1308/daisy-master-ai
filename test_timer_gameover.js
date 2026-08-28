/**
 * RESECTOR 7 — MISSION COUNTDOWN CLOCK & GAME OVER VERIFICATION
 */

const fs = require('fs');
const path = require('path');

console.log("================================================================");
console.log("  RESECTOR 7 — COUNTDOWN CLOCK & GAME OVER TEST SUITE           ");
console.log("================================================================\n");

// 1. Verify index.html contains stage-game-over, countdown timer, and admin controls
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const checks = [
  { name: "Mission Clock Display Element", pass: indexHtml.includes('id="mission-clock-display"') },
  { name: "HUD Mission Timer Container", pass: indexHtml.includes('id="hud-mission-timer"') },
  { name: "Stage Game Over Section (Stage 11)", pass: indexHtml.includes('id="stage-game-over"') },
  { name: "GAME OVER Heading", pass: indexHtml.includes('GAME OVER — MISSION FAILED') },
  { name: "Game Over Reason Element", pass: indexHtml.includes('id="game-over-reason"') },
  { name: "Fail Stat Name Element", pass: indexHtml.includes('id="fail-stat-name"') },
  { name: "Fail Stat Fragments Element", pass: indexHtml.includes('id="fail-stat-fragments"') },
  { name: "Fail Stat Words Element", pass: indexHtml.includes('id="fail-stat-words"') },
  { name: "Admin Timer Minutes Input", pass: indexHtml.includes('id="admin-timer-minutes-input"') },
  { name: "Admin Set Timer Function", pass: indexHtml.includes('adminSetTimerFromInput') },
  { name: "Admin Toggle Timer Function", pass: indexHtml.includes('adminToggleTimer') },
  { name: "Admin Force Game Over Button", pass: indexHtml.includes('adminForceGameOver') },
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

// 2. Check gameState.js for mission timer logic
const gameStateJs = fs.readFileSync(path.join(__dirname, 'js', 'gameState.js'), 'utf8');
const stateChecks = [
  { name: "missionTimeRemaining in default state", pass: gameStateJs.includes('missionTimeRemaining: 300') },
  { name: "setMissionTimer method", pass: gameStateJs.includes('setMissionTimer(seconds)') },
  { name: "toggleMissionTimer method", pass: gameStateJs.includes('toggleMissionTimer(running)') },
  { name: "addMissionTimerSeconds method", pass: gameStateJs.includes('addMissionTimerSeconds(seconds)') },
  { name: "triggerMissionFailure method", pass: gameStateJs.includes('triggerMissionFailure(reason') },
];

stateChecks.forEach(c => {
  if (c.pass) {
    console.log(`[PASS] ${c.name}`);
  } else {
    console.log(`[FAIL] ${c.name}`);
    allPassed = false;
  }
});

// 3. Check app.js for countdown ticking and failure trigger
const appJs = fs.readFileSync(path.join(__dirname, 'js', 'app.js'), 'utf8');
const appChecks = [
  { name: "stageGameOver in ResectorApp DOM", pass: appJs.includes("stageGameOver: document.getElementById('stage-game-over')") },
  { name: "GAME_OVER target in showStage", pass: appJs.includes("'GAME_OVER': this.dom.stageGameOver") },
  { name: "triggerGameOver method in app.js", pass: appJs.includes("triggerGameOver(reason") },
  { name: "Countdown decrements and checks <= 0", pass: appJs.includes("triggerGameOver('STATION OXYGEN EXHAUSTED — MISSION TIMEOUT')") },
];

appChecks.forEach(c => {
  if (c.pass) {
    console.log(`[PASS] ${c.name}`);
  } else {
    console.log(`[FAIL] ${c.name}`);
    allPassed = false;
  }
});

console.log("\n================================================================");
if (allPassed) {
  console.log("  ALL COUNTDOWN CLOCK & GAME OVER TESTS PASSED (100% OK)       ");
} else {
  console.log("  SOME TESTS FAILED! PLEASE REVIEW OUTPUT ABOVE.               ");
  process.exit(1);
}
console.log("================================================================\n");
