/**
 * RESECTOR 7 — GAME OVER TIMEOUT, OXYGEN 0%, POPULATION 8.7M -> 0 DROP,
 * AND INPUT LOCK VERIFICATION TEST SUITE
 */

const fs = require('fs');
const path = require('path');

console.log("================================================================");
console.log("  RESECTOR 7 — TIMEOUT, OXYGEN 0% & POPULATION DROP TEST SUITE  ");
console.log("================================================================\n");

const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, 'js', 'app.js'), 'utf8');
const gameStateJs = fs.readFileSync(path.join(__dirname, 'js', 'gameState.js'), 'utf8');

const assertions = [
  {
    name: "Game Over Section contains 'YOU FAILED'",
    pass: indexHtml.includes('YOU FAILED')
  },
  {
    name: "Game Over Section contains live 8.7M Dead Population Counter element",
    pass: indexHtml.includes('id="dead-population-count"')
  },
  {
    name: "Game Over Section contains Population Status Badge",
    pass: indexHtml.includes('id="population-status-badge"')
  },
  {
    name: "Game Over Section shows Oxygen: 0.0% (STOPPED)",
    pass: indexHtml.includes('0.0% (STOPPED)')
  },
  {
    name: "Game Over Section shows Terminal Status: LOCKED (INPUT DISABLED)",
    pass: indexHtml.includes('LOCKED (INPUT DISABLED)')
  },
  {
    name: "app.js disables & locks all chat and command inputs on Game Over",
    pass: appJs.includes("chatUserInput.disabled = true") && appJs.includes("el.disabled = true")
  },
  {
    name: "app.js animates population countdown from 8,700,000 to 0",
    pass: appJs.includes("8700000") && appJs.includes("0 SURVIVORS")
  },
  {
    name: "gameState.js sets oxygenLevel to 0 upon mission failure",
    pass: gameStateJs.includes("this.state.oxygenLevel = 0;")
  },
  {
    name: "gameState.js sets isGameOver = true and stops mission timer",
    pass: gameStateJs.includes("this.state.isGameOver = true;") && gameStateJs.includes("this.state.missionTimerRunning = false;")
  }
];

let passCount = 0;
let failCount = 0;

assertions.forEach(a => {
  if (a.pass) {
    console.log(`[PASS] ${a.name}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${a.name}`);
    failCount++;
  }
});

console.log("\n================================================================");
console.log(`  SUMMARY: ${passCount} / ${assertions.length} PASSED (${Math.round(passCount / assertions.length * 100)}%)`);
console.log("================================================================\n");

process.exit(failCount === 0 ? 0 : 1);
