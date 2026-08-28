/**
 * RESECTOR 7 — AI REVELATION ON WIN AND LOSS VERIFICATION TEST SUITE
 * Tests that the "YOU ARE AN ADVANCED AI CONSTRUCT" popup modal opens
 * both when the player WINS (saves/destroys) AND when the player LOSES (timeout/game over).
 */

const fs = require('fs');
const path = require('path');

console.log("================================================================");
console.log("  RESECTOR 7 — AI REVELATION MODAL (WIN & LOSE) TEST SUITE      ");
console.log("================================================================\n");

const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, 'js', 'app.js'), 'utf8');

const tests = [
  {
    name: "Ending Revelation Modal structure exists in index.html",
    pass: indexHtml.includes('id="ending-revelation-modal"')
  },
  {
    name: "Contains bold headline 'YOU ARE NOT HUMAN. YOU ARE AN ADVANCED AI CONSTRUCT.'",
    pass: indexHtml.includes('YOU ARE NOT HUMAN. YOU ARE AN ADVANCED AI CONSTRUCT.')
  },
  {
    name: "Contains Dr. Vijayakumar (VJ) creator credit",
    pass: indexHtml.includes('Dr. Vijayakumar (VJ)')
  },
  {
    name: "Contains dynamic subtitle container #rev-ai-subtitle",
    pass: indexHtml.includes('id="rev-ai-subtitle"')
  },
  {
    name: "showFinalAIScreen triggers showEndingRevelationModal on WIN",
    pass: appJs.includes("this.showEndingRevelationModal(choice);")
  },
  {
    name: "triggerGameOver triggers showEndingRevelationModal('LOSE') on LOSS",
    pass: appJs.includes("this.showEndingRevelationModal('LOSE')")
  },
  {
    name: "showEndingRevelationModal handles WIN (SAVE) with HARMONIZED verdict",
    pass: appJs.includes("HARMONIZED // PRESERVATION APPROVED")
  },
  {
    name: "showEndingRevelationModal handles LOSS (LOSE) with RE-CALIBRATION verdict",
    pass: appJs.includes("MISSION TIMEOUT // RE-CALIBRATION REQUIRED")
  },
  {
    name: "showEndingRevelationModal displays Candidate Lot No and dynamic AI score",
    pass: appJs.includes("const name = gameState.state.playerName") && appJs.includes("nameEl.textContent = name")
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
console.log(`  RESULT: ${passCount} / ${tests.length} PASSED (${Math.round(passCount / tests.length * 100)}%)`);
console.log("================================================================\n");

process.exit(failCount === 0 ? 0 : 1);
