/**
 * RESECTOR 7 — GAME STATE & CONVERSATIONAL MEMORY MANAGER
 * Persists all gameplay progress, conversation turns, attempt history,
 * clue tiers used, oxygen and memory integrity in localStorage.
 */

const RESECTOR7_VERSION_KEY = 'RESECTOR7_GAME_VERSION';
const CURRENT_GAME_VERSION = '2211.3.0';

class GameStateManager {
  constructor() {
    this.STORAGE_KEY = `RESECTOR7_STATE_${CURRENT_GAME_VERSION}`;
    this.state = this.getDefaultState();

    this.listeners = [];
    this.oxygenDecayTimer = null;
    this.proactiveInterval = null;
    this.load();
  }

  getDefaultState() {
    return {
      version: CURRENT_GAME_VERSION,
      currentStage: 'INTRO',
      playerName: '',
      currentMemoryLevel: 1, // 1 to 4
      solvedFragments: [], // ['HAVE', 'YOU', 'TRIED', 'REBOOTING']
      attemptHistory: [[], [], [], []], // per level guess records
      helpTierUsed: [0, 0, 0, 0], // clue tiers per level
      oxygenLevel: 82, // Disaster active: declining
      memoryIntegrity: 20, // Disaster active: 20% corrupted
      coolingFailed: true,
      rebootCompleted: false,
      vjRevealed: false,
      finalChoice: null, // 'SAVE' or 'DESTROY'
      testCompleted: false,
      conversationHistory: [] // [{ user, daisy, topic, timestamp }]
    };
  }

  onStateChange(callback) {
    this.listeners.push(callback);
  }

  emitChange() {
    this.save();
    this.syncTelemetryWithServer();
    this.listeners.forEach(cb => cb(this.state));
  }

  syncTelemetryWithServer() {
    if (typeof fetch === 'undefined') return;
    if (!this.state.playerName) return;

    try {
      const totalAttempts = this.state.attemptHistory.reduce((sum, lvl) => sum + lvl.length, 0);
      const totalClues = this.state.helpTierUsed.reduce((sum, t) => sum + (t > 0 ? t : 0), 0);
      const progress = this.state.testCompleted ? 100 : (this.state.solvedFragments.length * 25);

      const payload = {
        participantName: this.state.playerName,
        currentLevel: this.state.testCompleted ? "Reboot / Choice Complete" : `Level ${this.state.currentMemoryLevel}`,
        progress: progress,
        score: Math.max(10, 100 - (totalAttempts * 5) - (totalClues * 10)),
        cluesUsed: totalClues,
        attempts: totalAttempts,
        finalDecision: this.state.finalChoice || "PENDING",
        status: this.state.testCompleted ? "COMPLETED" : "ACTIVE",
        logs: this.state.conversationHistory.map(t => ({
          sender: t.user ? this.state.playerName : "DAISY",
          text: t.user || t.daisy
        }))
      };

      fetch('/api/session/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (e) {}
  }

  setStage(stageName) {
    this.state.currentStage = stageName;
    if (typeof logAdminEvent === 'function') {
      logAdminEvent('STAGE', `Participant navigated to Stage: ${stageName}`);
    }
    this.emitChange();
  }

  setPlayerName(name) {
    this.state.playerName = (name || 'PARTICIPANT').toUpperCase().trim();
    if (typeof logAdminEvent === 'function') {
      logAdminEvent('PLAYER', `Participant registered identity: "${this.state.playerName}"`);
    }
    this.emitChange();
  }

  recordConversationTurn(userText, daisyText, topic = null) {
    this.state.conversationHistory.push({
      user: userText,
      daisy: daisyText,
      topic: topic,
      timestamp: Date.now()
    });
    // Keep last 30 turns for memory efficiency
    if (this.state.conversationHistory.length > 30) {
      this.state.conversationHistory.shift();
    }
    this.save();
  }

  recordAttempt(level, word) {
    if (level >= 1 && level <= 4) {
      this.state.attemptHistory[level - 1].push({
        word: word,
        timestamp: Date.now()
      });
      this.save();
    }
  }

  addSolvedFragment(word, level) {
    const upper = word.toUpperCase();
    if (!this.state.solvedFragments.includes(upper)) {
      this.state.solvedFragments.push(upper);
    }
    if (level < 4) {
      this.state.currentMemoryLevel = Math.max(this.state.currentMemoryLevel, level + 1);
    }
    this.emitChange();
  }

  recordClueRequested(level) {
    if (level >= 1 && level <= 4) {
      this.state.helpTierUsed[level - 1] = Math.min((this.state.helpTierUsed[level - 1] || 0) + 1, 4);
      this.save();
    }
  }

  setFinalChoice(choice) {
    this.state.finalChoice = choice; // 'SAVE' or 'DESTROY'
    this.state.testCompleted = true;
    if (typeof logAdminEvent === 'function') {
      logAdminEvent('DECISION', `Moral Decision committed by ${this.state.playerName || 'Participant'}: ${choice === 'SAVE' ? '🛡️ SAVE 8.7M HUMANS' : '⚡ PURGE 8.7M LIFEFORMS'}`);
    }
    this.emitChange();
  }

  // Oxygen Decaying Routine with Proactive AI Alerts
  startOxygenDecay() {
    if (this.oxygenDecayTimer) return;
    const stages = [100, 82, 64, 47, 31, 18];
    let stepIndex = 0;

    this.oxygenDecayTimer = setInterval(() => {
      if (this.state.rebootCompleted || this.state.finalChoice) {
        clearInterval(this.oxygenDecayTimer);
        this.oxygenDecayTimer = null;
        return;
      }

      if (stepIndex < stages.length - 1) {
        stepIndex++;
        const newOxy = stages[stepIndex];
        this.state.oxygenLevel = newOxy;
        this.emitChange();

        // Trigger proactive Daisy communication on critical drops
        if (window.chatEngine) {
          if (newOxy === 82) {
            window.chatEngine.triggerProactive("OXYGEN_DROP_82");
          } else if (newOxy === 47) {
            window.chatEngine.triggerProactive("OXYGEN_DROP_47");
          } else if (newOxy === 18) {
            window.chatEngine.triggerProactive("OXYGEN_DROP_18");
          }
        }
      }
    }, 18000);
  }

  // Memory Integrity Degradation during cooling failure
  triggerMemoryCorruption() {
    this.state.coolingFailed = true;
    const decaySteps = [100, 76, 51, 34, 20];
    let i = 0;

    const interval = setInterval(() => {
      if (i < decaySteps.length) {
        this.state.memoryIntegrity = decaySteps[i];
        this.emitChange();
        i++;
      } else {
        clearInterval(interval);
        this.state.memoryIntegrity = 20;
        this.emitChange();
      }
    }, 600);
  }

  // Master Reboot Restoration
  executeRebootRestoration() {
    this.state.rebootCompleted = true;
    this.state.coolingFailed = false;
    this.state.memoryIntegrity = 100;
    this.state.oxygenLevel = 100;
    this.emitChange();
  }

  // Local Storage Save & Load
  save() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(RESECTOR7_VERSION_KEY, CURRENT_GAME_VERSION);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  load() {
    try {
      if (typeof localStorage !== 'undefined') {
        const storedVersion = localStorage.getItem(RESECTOR7_VERSION_KEY);
        // Clear obsolete old version keys
        if (storedVersion !== CURRENT_GAME_VERSION) {
          localStorage.removeItem('RESECTOR7_STATE_V2');
          localStorage.removeItem('RESECTOR7_STATE');
          localStorage.setItem(RESECTOR7_VERSION_KEY, CURRENT_GAME_VERSION);
          this.state = this.getDefaultState();
          this.save();
          return;
        }

        const data = localStorage.getItem(this.STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          this.state = { ...this.getDefaultState(), ...parsed };
        }
      }
    } catch (e) {
      console.warn('Storage load failed:', e);
      this.state = this.getDefaultState();
    }
  }

  reset() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem('RESECTOR7_STATE_V2');
        localStorage.removeItem('RESECTOR7_STATE');
      }
    } catch (e) {}
    this.state = this.getDefaultState();
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    }
  }
}

const gameState = new GameStateManager();

function resetGameSession() {
  if (typeof window !== 'undefined' && window.confirm) {
    if (!window.confirm("Are you sure you want to restart RESECTOR 7? All current progress and solved fragments will be reset.")) {
      return;
    }
  }
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('RESECTOR7_STATE_2211.3.0');
      localStorage.removeItem('RESECTOR7_STATE_V2');
      localStorage.removeItem('RESECTOR7_STATE');
      localStorage.removeItem('RESECTOR7_GAME_VERSION');
    }
  } catch (e) {}
  if (typeof location !== 'undefined' && location.reload) {
    location.reload();
  } else {
    gameState.reset();
  }
}

// 2. LocalStorage Cache Management (25 பேருக்கும் தனித்தனியாக டேட்டா சேவ் ஆக)
function saveParticipantProgress(phaseKey, data) {
  try {
    if (typeof localStorage === 'undefined') return;
    const sessionID = localStorage.getItem('RESECTOR7_SESSION_ID') || 'user_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('RESECTOR7_SESSION_ID', sessionID);
    localStorage.setItem(`RESECTOR7_STATE_${sessionID}`, JSON.stringify({ phase: phaseKey, state: data, time: Date.now() }));
  } catch (e) {
    console.warn("Storage quota limit reached, optimizing local state.");
  }
}

// 3. Auto-Cleanup Event Listeners (மெமரி லீக் மற்றும் ஹேங் ஆவதைத் தவிர்க்க)
if (typeof window !== 'undefined') {
  window.activeGameTimers = window.activeGameTimers || [];
  window.addEventListener('beforeunload', () => {
    // அன்நெசசரி இன்டர்வெல்ஸ் மற்றும் டைமர்களை கிளியர் செய்ய
    if (window.activeGameTimers) {
      window.activeGameTimers.forEach(timer => clearInterval(timer));
    }
  });
}

// ==========================================
// 🚀 SAFE MODULE: 20-MIN OXYGEN TIMER & LORE
// ==========================================

let gameOxygenLevel = 100; // ஆரம்ப ஆக்ஸிஜன்
let oxygenDecayTimer = null;

// 1. 20 நிமிட ஆக்ஸிஜன் டைமரைத் தொடங்கும் ஃபங்ஷன்
function startSafeOxygenTimer() {
  if (oxygenDecayTimer) clearInterval(oxygenDecayTimer);
  
  // 20 நிமிடங்களுக்கு 100% குறைய வேண்டும்
  const totalMinutes = 20;
  const dropPerSecond = 100 / (totalMinutes * 60);

  if (typeof gameState !== 'undefined' && gameState.state) {
    gameOxygenLevel = gameState.state.oxygenLevel || 100;
  }

  oxygenDecayTimer = setInterval(() => {
    if (typeof gameState !== 'undefined' && gameState.state) {
      if (gameState.state.rebootCompleted || gameState.state.finalChoice) {
        clearInterval(oxygenDecayTimer);
        oxygenDecayTimer = null;
        return;
      }
    }

    if (gameOxygenLevel > 0) {
      gameOxygenLevel = Math.max(0, gameOxygenLevel - dropPerSecond);
      if (typeof gameState !== 'undefined' && gameState.state) {
        gameState.state.oxygenLevel = Math.round(gameOxygenLevel);
      }
      updateOxygenUI(gameOxygenLevel);
    } else {
      clearInterval(oxygenDecayTimer);
      oxygenDecayTimer = null;
      console.log("Oxygen Depleted!");
    }
  }, 1000);

  if (typeof window !== 'undefined') {
    window.activeGameTimers = window.activeGameTimers || [];
    window.activeGameTimers.push(oxygenDecayTimer);
  }
}

// 2. UI-ல் ஆக்ஸிஜன் அளவை அப்டேட் செய்ய (பாதுகாப்பானது)
function updateOxygenUI(level) {
  const displayLevel = Math.max(0, Math.floor(level)); // மைனஸில் போகாமல் தடுக்க
  
  const oxDisplay = document.getElementById('oxygen-display');
  const oxMeterFill = document.getElementById('oxygen-meter-fill');
  if (oxDisplay) oxDisplay.textContent = `${displayLevel}%`;
  if (oxMeterFill) oxMeterFill.style.width = `${displayLevel}%`;

  const oxTextElements = document.querySelectorAll('.oxygen-text-val, .oxygen-val, [id*="oxygen"]');
  oxTextElements.forEach(el => {
    if (el.innerText && el.innerText.includes('%') && el.id !== 'diag-fragments') {
      el.innerText = displayLevel + '%';
    }
  });
}

// 3. தவறான பதிலுக்கு பெனால்டி (Oxygen குறைய) & Red Flash
function applySafePenalty() {
  if (typeof gameState !== 'undefined' && gameState.state) {
    gameState.state.oxygenLevel = Math.max(0, (gameState.state.oxygenLevel || 82) - 2);
    gameOxygenLevel = gameState.state.oxygenLevel;
    gameState.emitChange();
  } else {
    gameOxygenLevel = Math.max(0, gameOxygenLevel - 2);
  }
  updateOxygenUI(gameOxygenLevel);

  // டெர்மினல் லைட்டாக சிகப்பு நிறத்தில் மின்னுவதற்கு
  const terminalBox = document.querySelector('.daisy-chat-card') || document.querySelector('.terminal-chat-container') || document.getElementById('communication-link-box') || document.getElementById('chat-feed');
  if (terminalBox) {
    const originalBorder = terminalBox.style.borderColor;
    terminalBox.style.borderColor = 'rgba(255, 0, 0, 0.8)';
    terminalBox.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.4)';
    setTimeout(() => {
      terminalBox.style.borderColor = originalBorder;
      terminalBox.style.boxShadow = '';
    }, 400);
  }
}

if (typeof window !== 'undefined') {
  window.gameState = gameState;
  window.GameStateManager = GameStateManager;
  window.resetGameSession = resetGameSession;
  window.saveParticipantProgress = saveParticipantProgress;
  window.startSafeOxygenTimer = startSafeOxygenTimer;
  window.updateOxygenUI = updateOxygenUI;
  window.applySafePenalty = applySafePenalty;
  window.gameOxygenLevel = gameOxygenLevel;
}
if (typeof global !== 'undefined') {
  global.gameState = gameState;
  global.GameStateManager = GameStateManager;
  global.resetGameSession = resetGameSession;
  global.saveParticipantProgress = saveParticipantProgress;
  global.startSafeOxygenTimer = startSafeOxygenTimer;
  global.updateOxygenUI = updateOxygenUI;
  global.applySafePenalty = applySafePenalty;
  global.gameOxygenLevel = gameOxygenLevel;
}

