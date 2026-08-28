/**
 * RESECTOR 7 — BROWSER RUNTIME & LIFECYCLE E2E SIMULATION
 * Verifies that the complete DOM lifecycle, ResectorApp mounting,
 * stage transitions, Daisy chat interaction, fragment progression,
 * password assembly, reboot, VJ reveal, and final decision run without any errors.
 */

// Mock browser DOM environment
class MockClassList {
  constructor() { this.classes = new Set(); }
  add(...c) { c.forEach(x => this.classes.add(x)); }
  remove(...c) { c.forEach(x => this.classes.delete(x)); }
  contains(c) { return this.classes.has(c); }
}

class MockElement {
  constructor(id = '') {
    this.id = id;
    this.classList = new MockClassList();
    this.textContent = '';
    this.innerHTML = '';
    this.value = '';
    this.style = {};
    this.children = [];
    this.listeners = {};
    this.disabled = false;
    this.draggable = false;
    this.dataset = {};
  }
  addEventListener(event, handler) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }
  dispatchEvent(event) {
    const handlers = this.listeners[event.type || event] || [];
    handlers.forEach(h => h(event));
  }
  appendChild(child) {
    this.children.push(child);
  }
  getContext() {
    return {
      clearRect: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      closePath: () => {},
      clip: () => {},
      moveTo: () => {},
      lineTo: () => {},
      quadraticCurveTo: () => {},
      bezierCurveTo: () => {},
      arc: () => {},
      ellipse: () => {},
      measureText: () => ({ width: 10 }),
      fill: () => {},
      stroke: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      scale: () => {},
      setLineDash: () => {},
      drawImage: () => {},
      createRadialGradient: () => ({ addColorStop: () => {} }),
      createLinearGradient: () => ({ addColorStop: () => {} })
    };
  }
}

const mockDomElements = {};
function getOrCreateElement(id) {
  if (!mockDomElements[id]) {
    mockDomElements[id] = new MockElement(id);
  }
  return mockDomElements[id];
}

const mockDocument = {
  getElementById: (id) => getOrCreateElement(id),
  createElement: (tag) => new MockElement(),
  querySelectorAll: (sel) => Object.values(mockDomElements),
  querySelector: (sel) => Object.values(mockDomElements)[0] || null,
  addEventListener: () => {}
};

const mockLocalStorage = {
  store: {},
  getItem: function(key) { return this.store[key] || null; },
  setItem: function(key, val) { this.store[key] = String(val); },
  removeItem: function(key) { delete this.store[key]; }
};

global.window = {
  innerWidth: 1920,
  innerHeight: 1080,
  document: mockDocument,
  localStorage: mockLocalStorage,
  addEventListener: () => {},
  location: { reload: () => {} }
};
global.document = mockDocument;
global.localStorage = mockLocalStorage;

// Load application modules in exact browser order
require('./js/audio.js');
require('./js/storyData.js');
require('./js/daisy/knowledgeBase.js');
require('./js/daisy/storyGuard.js');
require('./js/daisy/reasoningEngine.js');
require('./js/daisy/daisyAI.js');
require('./js/background.js');
require('./js/daisyAvatar.js');
require('./js/gameState.js');
require('./js/chatEngine.js');
require('./js/puzzleEngine.js');
require('./js/app.js');

console.log('================================================================');
console.log('  RESECTOR 7 — COMPLETE BROWSER RUNTIME LIFECYCLE E2E TEST       ');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assertTest(desc, condition) {
  if (condition) {
    console.log(`[PASS] ${desc}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${desc}`);
    failCount++;
  }
}

global.gameState = window.gameState;
global.daisyAI = window.daisyAI;

(async () => {
  try {
    // 1. Initialize fresh GameStateManager
    const stateMgr = window.gameState;
    assertTest("Initial memory is 20% (corrupted by disaster)", stateMgr.state.memoryIntegrity === 20);
    assertTest("Initial cooling failed is true", stateMgr.state.coolingFailed === true);
    assertTest("Initial stage is INTRO", stateMgr.state.currentStage === 'INTRO');

    // 2. Initialize ResectorApp
    const app = new ResectorApp();
    window.app = app;
    global.app = app;
    assertTest("ResectorApp initialized successfully with zero exceptions", !!app);

    // 3. Verify HUD sync
    assertTest("Memory display shows 20%", mockDomElements['memory-display'].textContent === '20%');
    assertTest("Memory sub status indicates corrupted", mockDomElements['memory-status-sub'].textContent.includes('CORRUPTED'));

    // 4. Test stage transition to IDENTITY
    app.showStage('IDENTITY');
    assertTest("Stage IDENTITY activated", mockDomElements['stage-identity'].classList.contains('active'));
    assertTest("Intro screen deactivated", !mockDomElements['stage-intro'].classList.contains('active'));

    // 5. Test participant Lot No submission
    getOrCreateElement('player-name-input').value = '01';
    app.dom.identityForm.dispatchEvent({ type: 'submit', preventDefault: () => {} });
    assertTest("Player Lot No formatted and set to LOT 01", stateMgr.state.playerName === 'LOT 01');
    assertTest("Stage transitioned to TERMINAL", stateMgr.state.currentStage === 'TERMINAL');

    // 6. Test Daisy chat interaction & fragment 1 (HAVE)
    await app.chatEngine.handleUserTransmission("What happened?");
    assertTest("Conversation history recorded user query", stateMgr.state.conversationHistory.length > 0);

    await app.chatEngine.handleUserTransmission("I think the first word is HAVE");
    assertTest("Level 1 fragment HAVE solved", stateMgr.state.solvedFragments.includes('HAVE'));
    assertTest("Current memory level advanced to 2", stateMgr.state.currentMemoryLevel === 2);

    // 7. Solve Level 2 (YOU)
    await app.chatEngine.handleUserTransmission("The second word is YOU");
    assertTest("Level 2 fragment YOU solved", stateMgr.state.solvedFragments.includes('YOU'));
    assertTest("Current memory level advanced to 3", stateMgr.state.currentMemoryLevel === 3);

    // 8. Solve Level 3 (TRIED)
    await app.chatEngine.handleUserTransmission("Is it TRIED?");
    assertTest("Level 3 fragment TRIED solved", stateMgr.state.solvedFragments.includes('TRIED'));
    assertTest("Current memory level advanced to 4", stateMgr.state.currentMemoryLevel === 4);

    // 9. Solve Level 4 (REBOOTING)
    await app.chatEngine.handleUserTransmission("The final word is REBOOTING");
    assertTest("Level 4 fragment REBOOTING solved", stateMgr.state.solvedFragments.includes('REBOOTING'));
    assertTest("All 4 fragments recovered", stateMgr.state.solvedFragments.length === 4);

    // 10. Test Password Assembly Verification
    app.puzzleEngine.assembledSequence = ['HAVE', 'YOU', 'TRIED', 'REBOOTING'];
    app.puzzleEngine.verifyAssembledSequence();
    await new Promise(r => setTimeout(r, 1600));
    assertTest("Correct sequence triggers reboot stage", stateMgr.state.currentStage === 'REBOOT');

    // 11. Test Final Decision Option 1 (SAVE)
    gameState.setFinalChoice('SAVE');
    app.executeEnding('SAVE');
    assertTest("Final choice recorded as SAVE", stateMgr.state.finalChoice === 'SAVE');
    assertTest("Stage transitioned to RESOLUTION", stateMgr.state.currentStage === 'RESOLUTION');

    // 12. Test Final AI Results Screen
    app.showFinalAIScreen('SAVE');
    const statusText = (mockDomElements['test-line-status'] || mockDomElements['final-test-status']).textContent;
    assertTest("Final test screen shows test line", statusText.includes('SUCCESSFUL'));
    assertTest("Stage transitioned to FINAL_TEST", stateMgr.state.currentStage === 'FINAL_TEST');

  } catch (err) {
    console.error("FATAL RUNTIME ERROR IN E2E SIMULATION:", err);
    failCount++;
  }

  console.log('\n================================================================');
  console.log(`  E2E RUNTIME SUMMARY: ${passCount} / ${passCount + failCount} PASSED (${Math.round(passCount / (passCount + failCount) * 100)}%)`);
  console.log('================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
})();
