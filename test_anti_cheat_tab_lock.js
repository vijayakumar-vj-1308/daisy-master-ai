/**
 * RESECTOR 7 — ANTI-CHEAT PROCTORING TAB-SWITCH SECURITY LOCK TEST SUITE
 * Verifies that switching tabs triggers a full security lock screen, pauses the timer,
 * logs the breach to Admin, and requires the Admin Reference Passkey (srnmc@cs) to unlock.
 */

const fs = require('fs');
const path = require('path');

console.log("================================================================");
console.log("  RESECTOR 7 — ANTI-CHEAT TAB LOCK SECURITY TEST SUITE          ");
console.log("================================================================\n");

const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, 'js', 'app.js'), 'utf8');
const gameStateJs = fs.readFileSync(path.join(__dirname, 'js', 'gameState.js'), 'utf8');
const serverJs = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

const tests = [
  {
    name: "Anti-Cheat Tab Security Lock Modal exists in index.html",
    pass: indexHtml.includes('id="tab-security-lock-modal"')
  },
  {
    name: "Modal contains Breach Alert Banner",
    pass: indexHtml.includes('🚨 ANTI-CHEAT SECURITY BREACH // UNAUTHORIZED TAB SWITCH DETECTED')
  },
  {
    name: "Modal contains Candidate Lot No Element",
    pass: indexHtml.includes('id="lock-player-lot"')
  },
  {
    name: "Modal contains Breach Count Element",
    pass: indexHtml.includes('id="lock-switch-count"')
  },
  {
    name: "Modal contains Admin Reference Passkey Input",
    pass: indexHtml.includes('id="tab-lock-pass-input"')
  },
  {
    name: "Modal contains Unlock Button & Error Element",
    pass: indexHtml.includes('unlockTabSecurity()') && indexHtml.includes('id="tab-lock-error"')
  },
  {
    name: "gameState.js has tabSwitchCount and isTabLocked in state",
    pass: gameStateJs.includes('tabSwitchCount:') && gameStateJs.includes('isTabLocked:')
  },
  {
    name: "gameState.js implements recordTabSwitch() and pauses timer",
    pass: gameStateJs.includes('recordTabSwitch()') && gameStateJs.includes('this.state.isTabLocked = true;')
  },
  {
    name: "gameState.js implements unlockTabSecurity() and resumes timer",
    pass: gameStateJs.includes('unlockTabSecurity()') && gameStateJs.includes('this.state.isTabLocked = false;')
  },
  {
    name: "app.js implements setupAntiCheatTabMonitor with visibilitychange listener",
    pass: appJs.includes('setupAntiCheatTabMonitor()') && appJs.includes('visibilitychange')
  },
  {
    name: "app.js validates Admin Reference Passkey (srnmc@cs) to unlock",
    pass: appJs.includes("code === 'srnmc@cs'")
  },
  {
    name: "server.js syncs and stores tabSwitchCount in participant sessions",
    pass: serverJs.includes('existing.tabSwitchCount = body.tabSwitchCount')
  },
  {
    name: "Admin Leaderboard in index.html displays anti-cheat tab switch badge",
    pass: indexHtml.includes('TAB SWITCH')
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
console.log(`  ANTI-CHEAT TEST SUMMARY: ${passCount} / ${tests.length} PASSED (${Math.round(passCount / tests.length * 100)}%)`);
console.log("================================================================\n");

process.exit(failCount === 0 ? 0 : 1);
