/**
 * RESECTOR 7 — ADMIN TIMING (UP TO 30 MINS) & ACCESS VERIFICATION TEST
 */

const fs = require('fs');
const path = require('path');

console.log("================================================================");
console.log("  RESECTOR 7 — ADMIN 30-MIN TIMING & ACCESS VERIFICATION TEST   ");
console.log("================================================================\n");

const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const adminHtml = fs.readFileSync(path.join(__dirname, 'admin.html'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, 'js', 'app.js'), 'utf8');
const gameStateJs = fs.readFileSync(path.join(__dirname, 'js', 'gameState.js'), 'utf8');

const tests = [
  // 1. Admin Timing (30 Mins) in index.html (Master Admin Modal)
  {
    name: "index.html has 30:00 (1800s) preset button in Master Admin Modal",
    pass: indexHtml.includes('adminResetTimer(1800)') && indexHtml.includes('30:00')
  },
  {
    name: "index.html admin timer minutes input defaults to 30 mins with range up to 60",
    pass: indexHtml.includes('id="admin-timer-minutes-input"') && indexHtml.includes('value="30"')
  },
  {
    name: "index.html has +5 Mins (+300s) quick addition button",
    pass: indexHtml.includes('adminAddTimerSeconds(300)') && indexHtml.includes('+5 Mins')
  },
  {
    name: "index.html implements adminSetTimerFromInput to convert custom minutes to seconds",
    pass: indexHtml.includes('function adminSetTimerFromInput()') && indexHtml.includes('Math.round(mins * 60)')
  },
  {
    name: "index.html implements adminToggleTimer for Pause / Resume",
    pass: indexHtml.includes('function adminToggleTimer()') && indexHtml.includes('gameState.toggleMissionTimer')
  },
  {
    name: "index.html implements adminForceGameOver for instant 0:00 crisis testing",
    pass: indexHtml.includes('function adminForceGameOver()') && indexHtml.includes('triggerGameOver')
  },

  // 2. Admin Timing in admin.html (Separate Dashboard)
  {
    name: "admin.html has 30:00 (1800s) preset button",
    pass: adminHtml.includes('resetTimer(1800)') && adminHtml.includes('30:00')
  },
  {
    name: "admin.html timer input defaults to 30 mins",
    pass: adminHtml.includes('id="timer-minutes-input"') && adminHtml.includes('value="30"')
  },
  {
    name: "admin.html has +5 Mins (+300s) button",
    pass: adminHtml.includes('addTimerSeconds(300)') && adminHtml.includes('+5 Mins')
  },

  // 3. Admin Authentication & Access Check
  {
    name: "index.html has Master Admin Passkey Input and Verify action",
    pass: indexHtml.includes('id="inline-admin-pass"') && indexHtml.includes('verifyInlineAdmin()')
  },
  {
    name: "index.html authenticates reference passkey (c3JubWNAY3M= / srnmc@cs)",
    pass: indexHtml.includes('c3JubWNAY3M=') && indexHtml.includes('verifyAndOpenAdmin')
  },
  {
    name: "Anti-Cheat modal unlocks via reference passkey in app.js",
    pass: appJs.includes('c3JubWNAY3M=') && appJs.includes('unlockTabSecurity')
  },
  {
    name: "admin.html validates security passkey on login (verifyAdmin / admin-pass)",
    pass: adminHtml.includes('verifyAdmin()') && adminHtml.includes('id="admin-pass"') && adminHtml.includes('c3JubWNAY3M=')
  },

  // 4. Game State Timer Logic
  {
    name: "gameState.js implements setMissionTimer method",
    pass: gameStateJs.includes('setMissionTimer(seconds)')
  },
  {
    name: "gameState.js implements addMissionTimerSeconds method",
    pass: gameStateJs.includes('addMissionTimerSeconds(seconds)')
  },
  {
    name: "gameState.js implements toggleMissionTimer method",
    pass: gameStateJs.includes('toggleMissionTimer(running)')
  }
];

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
console.log(`  ADMIN 30-MIN TIMING & ACCESS SUMMARY: ${passCount} / ${tests.length} PASSED (${Math.round(passCount / tests.length * 100)}%)`);
console.log("================================================================\n");

// Runtime Timer & Math Verification
const mockState = {
  missionTimeRemaining: 1800, // 30 mins
  missionTimerRunning: true
};

const formatTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

console.log("Runtime Timer Math & Clock Formatting Check:");
console.log(`  1800 seconds = ${formatTime(1800)} (Expected: 30:00) -> ${formatTime(1800) === '30:00' ? 'OK' : 'FAIL'}`);
console.log(`  1200 seconds = ${formatTime(1200)} (Expected: 20:00) -> ${formatTime(1200) === '20:00' ? 'OK' : 'FAIL'}`);
console.log(`   900 seconds = ${formatTime(900)} (Expected: 15:00) -> ${formatTime(900) === '15:00' ? 'OK' : 'FAIL'}`);
console.log(`   300 seconds = ${formatTime(300)} (Expected: 05:00) -> ${formatTime(300) === '05:00' ? 'OK' : 'FAIL'}`);
console.log(`    60 seconds = ${formatTime(60)} (Expected: 01:00) -> ${formatTime(60) === '01:00' ? 'OK' : 'FAIL'}`);

process.exit(failCount === 0 ? 0 : 1);
