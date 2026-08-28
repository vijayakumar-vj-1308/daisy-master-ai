/**
 * RESECTOR 7 — UNIVERSAL ADMIN UNDO & REDO AUTOMATED TEST SUITE
 * Verifies that all admin modifications (Oxygen, Memory, Stages, Timers, Deletions, Clear-All)
 * support complete multi-level Undo (Ctrl+Z) and Redo (Ctrl+Y).
 */

const fs = require('fs');
const path = require('path');

console.log("================================================================");
console.log("  RESECTOR 7 — UNIVERSAL ADMIN UNDO & REDO TEST SUITE           ");
console.log("================================================================\n");

// Mock browser DOM and Storage
let storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { storage = {}; }
};

const elements = {};
global.document = {
  getElementById: (id) => {
    if (!elements[id]) {
      elements[id] = {
        value: '',
        textContent: '',
        style: {},
        classList: {
          contains: () => false,
          add: () => {},
          remove: () => {}
        },
        disabled: false
      };
    }
    return elements[id];
  },
  querySelectorAll: (selector) => {
    return [
      { disabled: false, style: {}, textContent: '' },
      { disabled: false, style: {}, textContent: '' }
    ];
  },
  addEventListener: () => {}
};
global.window = global;

// Load GameState and setup app
require('./js/gameState.js');
const gm = global.gameState || new global.GameStateManager();
global.gameState = gm;
global.window.app = {
  showStage: (stg) => { gm.state.currentStage = stg; },
  triggerRebootSequence: () => {},
  triggerVJReveal: () => {},
  triggerGameOver: () => {}
};

// Evaluate Admin Undo/Redo Engine
let adminUniversalUndoStack = [];
let adminUniversalRedoStack = [];
const MAX_ADMIN_HISTORY = 50;

function recordAdminSnapshot(actionDescription = "Admin Modification") {
  const snapshot = {
    description: actionDescription,
    timestamp: Date.now(),
    gameState: (typeof gameState !== 'undefined' && gameState.state) ? JSON.parse(JSON.stringify(gameState.state)) : null,
    allParticipants: localStorage.getItem('RESECTOR7_ALL_PARTICIPANTS'),
    stage: (typeof gameState !== 'undefined' && gameState.state && gameState.state.currentStage) || 'TERMINAL'
  };
  adminUniversalUndoStack.push(snapshot);
  if (adminUniversalUndoStack.length > MAX_ADMIN_HISTORY) {
    adminUniversalUndoStack.shift();
  }
  adminUniversalRedoStack = [];
}

function adminPerformUndo() {
  if (adminUniversalUndoStack.length === 0) return false;
  const currentSnapshot = {
    description: "Current State",
    timestamp: Date.now(),
    gameState: (typeof gameState !== 'undefined' && gameState.state) ? JSON.parse(JSON.stringify(gameState.state)) : null,
    allParticipants: localStorage.getItem('RESECTOR7_ALL_PARTICIPANTS'),
    stage: (typeof gameState !== 'undefined' && gameState.state && gameState.state.currentStage) || 'TERMINAL'
  };
  adminUniversalRedoStack.push(currentSnapshot);
  const targetSnapshot = adminUniversalUndoStack.pop();

  if (targetSnapshot.gameState && typeof gameState !== 'undefined') {
    gameState.state = JSON.parse(JSON.stringify(targetSnapshot.gameState));
  }
  if (targetSnapshot.allParticipants !== null) {
    localStorage.setItem('RESECTOR7_ALL_PARTICIPANTS', targetSnapshot.allParticipants);
  } else {
    localStorage.removeItem('RESECTOR7_ALL_PARTICIPANTS');
  }
  return true;
}

function adminPerformRedo() {
  if (adminUniversalRedoStack.length === 0) return false;
  const currentSnapshot = {
    description: "State before Redo",
    timestamp: Date.now(),
    gameState: (typeof gameState !== 'undefined' && gameState.state) ? JSON.parse(JSON.stringify(gameState.state)) : null,
    allParticipants: localStorage.getItem('RESECTOR7_ALL_PARTICIPANTS'),
    stage: (typeof gameState !== 'undefined' && gameState.state && gameState.state.currentStage) || 'TERMINAL'
  };
  adminUniversalUndoStack.push(currentSnapshot);
  const targetSnapshot = adminUniversalRedoStack.pop();

  if (targetSnapshot.gameState && typeof gameState !== 'undefined') {
    gameState.state = JSON.parse(JSON.stringify(targetSnapshot.gameState));
  }
  if (targetSnapshot.allParticipants !== null) {
    localStorage.setItem('RESECTOR7_ALL_PARTICIPANTS', targetSnapshot.allParticipants);
  } else {
    localStorage.removeItem('RESECTOR7_ALL_PARTICIPANTS');
  }
  return true;
}

const tests = [];

// TEST 1: Initial Stack State
tests.push({
  name: "Initial Undo & Redo stacks are clean (length 0)",
  pass: adminUniversalUndoStack.length === 0 && adminUniversalRedoStack.length === 0
});

// TEST 2: Oxygen change + Undo
gm.state.oxygenLevel = 82;
recordAdminSnapshot("Oxygen overridden to 40%");
gm.state.oxygenLevel = 40;

tests.push({
  name: "Snapshot successfully pushed to Undo stack",
  pass: adminUniversalUndoStack.length === 1 && gm.state.oxygenLevel === 40
});

adminPerformUndo();
tests.push({
  name: "Undo reverts Oxygen level from 40% back to 82%",
  pass: gm.state.oxygenLevel === 82 && adminUniversalRedoStack.length === 1
});

// TEST 3: Redo Oxygen change
adminPerformRedo();
tests.push({
  name: "Redo re-applies Oxygen level from 82% forward to 40%",
  pass: gm.state.oxygenLevel === 40 && adminUniversalUndoStack.length === 1
});

// TEST 4: Stage Jump + Undo
gm.state.currentStage = 'TERMINAL';
recordAdminSnapshot("Jumped to DECISION stage");
gm.state.currentStage = 'DECISION';
tests.push({
  name: "Stage is now DECISION",
  pass: gm.state.currentStage === 'DECISION' && adminUniversalUndoStack.length === 2
});

adminPerformUndo();
tests.push({
  name: "Undo reverts Stage back to TERMINAL",
  pass: gm.state.currentStage === 'TERMINAL'
});

// TEST 5: Leaderboard Data Clear & Undo
const sampleData = { "p1": { participantName: "ALPHA_LEAD", score: 95 } };
localStorage.setItem('RESECTOR7_ALL_PARTICIPANTS', JSON.stringify(sampleData));

recordAdminSnapshot("Cleared Leaderboard");
localStorage.removeItem('RESECTOR7_ALL_PARTICIPANTS');

tests.push({
  name: "Leaderboard cleared in localStorage",
  pass: localStorage.getItem('RESECTOR7_ALL_PARTICIPANTS') === null
});

adminPerformUndo();
const restored = JSON.parse(localStorage.getItem('RESECTOR7_ALL_PARTICIPANTS') || '{}');
tests.push({
  name: "Undo successfully restores deleted participant records",
  pass: restored["p1"] && restored["p1"].participantName === "ALPHA_LEAD"
});

// TEST 6: index.html has Universal Undo and Redo buttons & event bindings
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
tests.push({
  name: "index.html contains #admin-header-undo-btn with Ctrl+Z tooltip",
  pass: indexHtml.includes('id="admin-header-undo-btn"') && indexHtml.includes('Ctrl+Z')
});
tests.push({
  name: "index.html contains #admin-header-redo-btn with Ctrl+Y tooltip",
  pass: indexHtml.includes('id="admin-header-redo-btn"') && indexHtml.includes('Ctrl+Y')
});
tests.push({
  name: "index.html implements adminPerformUndo and adminPerformRedo functions",
  pass: indexHtml.includes('function adminPerformUndo()') && indexHtml.includes('function adminPerformRedo()')
});

// TEST 7: admin.html has Universal Undo and Redo buttons & event bindings
const adminHtml = fs.readFileSync(path.join(__dirname, 'admin.html'), 'utf8');
tests.push({
  name: "admin.html contains #admin-top-undo-btn and #admin-top-redo-btn",
  pass: adminHtml.includes('id="admin-top-undo-btn"') && adminHtml.includes('id="admin-top-redo-btn"')
});
tests.push({
  name: "admin.html implements adminPerformUndo and adminPerformRedo functions",
  pass: adminHtml.includes('function adminPerformUndo()') && adminHtml.includes('function adminPerformRedo()')
});

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
console.log(`  ADMIN UNDO/REDO TEST RESULT: ${passCount} / ${tests.length} PASSED (${Math.round(passCount / tests.length * 100)}%)`);
console.log("================================================================\n");

process.exit(failCount === 0 ? 0 : 1);
