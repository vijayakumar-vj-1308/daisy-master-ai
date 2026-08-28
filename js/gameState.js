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
    this.sessionId = this.getOrCreateSessionId();
    this.state = this.getDefaultState();

    this.listeners = [];
    this.oxygenDecayTimer = null;
    this.proactiveInterval = null;
    this.load();
  }

  getOrCreateSessionId() {
    let sId = null;
    try {
      sId = localStorage.getItem('RESECTOR7_SESSION_ID');
      if (!sId) {
        sId = `SESSION-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        localStorage.setItem('RESECTOR7_SESSION_ID', sId);
      }
    } catch (e) {
      sId = `SESSION-${Date.now().toString().slice(-5)}`;
    }
    return sId;
  }

  getDefaultState() {
    return {
      version: CURRENT_GAME_VERSION,
      sessionId: this.sessionId,
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
      missionTimeRemaining: 1800, // 30 minutes countdown default (1800s)
      missionTimerDuration: 1800,
      missionTimerRunning: true,
      isGameOver: false,
      gameOverReason: '',
      tabSwitchCount: 0, // Anti-cheat breach tracker
      isTabLocked: false, // Security lock state
      levelStartTimes: [Date.now(), 0, 0, 0], // Timestamp tracking per round
      startedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      conversationHistory: [] // [{ user, daisy, topic, timestamp }]
    };
  }

  onStateChange(callback) {
    this.listeners.push(callback);
  }

  emitChange() {
    this.save();
    this.saveParticipantRecord();
    this.syncTelemetryWithServer();
    this.listeners.forEach(cb => cb(this.state));
  }

  saveParticipantRecord() {
    try {
      const allParticipants = JSON.parse(localStorage.getItem('RESECTOR7_ALL_PARTICIPANTS') || '{}');
      const pName = (this.state.playerName || 'PARTICIPANT').toUpperCase();
      const totalAttempts = this.state.attemptHistory.reduce((sum, lvl) => sum + lvl.length, 0);
      const totalClues = this.state.helpTierUsed.reduce((sum, t) => sum + (t > 0 ? t : 0), 0);
      const solvedCount = (this.state.solvedFragments || []).length;
      const progress = this.state.testCompleted ? 100 : (solvedCount * 25);
      const isCompleted = this.state.testCompleted || solvedCount >= 4;

      const logs = this.state.conversationHistory.map(t => ({
        sender: t.user ? pName : "DAISY",
        text: t.user || t.daisy,
        timestamp: t.timestamp
      }));

      // Calculate linguistic & word metrics
      let userWordCount = 0;
      let userCharCount = 0;
      let userPromptCount = 0;
      let daisyWordCount = 0;

      logs.forEach(l => {
        const text = l.text || '';
        const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        if (l.sender === pName) {
          userPromptCount++;
          userWordCount += words;
          userCharCount += text.length;
        } else if (l.sender === 'DAISY') {
          daisyWordCount += words;
        }
      });

      const avgWordsPerPrompt = userPromptCount > 0 ? (userWordCount / userPromptCount).toFixed(1) : '0.0';

      // 4-Category Itemized Scoring (Starts at 0 pts for new players, max 100 pts on completion)
      const fragPts = solvedCount * 10; // +10 pts per fragment (40 max)
      const speedPts = isCompleted ? (this.state.missionTimeRemaining > 600 ? 20 : 15) : 0;
      const promptPts = isCompleted ? (userPromptCount <= 6 ? 20 : (userPromptCount <= 10 ? 15 : 10)) : 0;
      const clueBonus = isCompleted ? Math.max(0, 20 - (totalClues * 5)) : 0; // -5 pts per clue used

      let score = 0;
      if (isCompleted) {
        score = Math.min(100, Math.max(0, fragPts + speedPts + promptPts + clueBonus));
      } else if (solvedCount > 0) {
        score = fragPts; // Active progress points (+10, +20, +30)
      } else {
        score = 0; // Initial start points = 0
      }

      const judgeRating = {
        logicScore: fragPts,
        communicationScore: promptPts,
        clueScore: clueBonus,
        speedScore: speedPts,
        totalScore: score,
        grade: score >= 95 ? "A+" : (score >= 90 ? "A" : (score >= 80 ? "B+" : (score > 0 ? "B" : "START"))),
        verdict: score >= 90 ? "EXCELLENT — Highly Efficient Deductive Run" : (score > 0 ? "QUALIFIED — Active Simulation Progress" : "SESSION INITIATED — Score Starts at 0 PTS")
      };

      allParticipants[this.sessionId] = {
        sessionId: this.sessionId,
        participantName: pName,
        currentStage: this.state.currentStage || 'INTRO',
        currentLevel: this.state.testCompleted ? "Reboot / Choice Complete" : `Level ${this.state.currentMemoryLevel}`,
        progress: progress,
        score: score,
        oxygenLevel: this.state.oxygenLevel,
        memoryIntegrity: this.state.memoryIntegrity,
        solvedFragments: this.state.solvedFragments || [],
        cluesUsed: totalClues,
        attempts: totalAttempts,
        finalDecision: this.state.finalChoice || "PENDING",
        status: this.state.testCompleted ? "COMPLETED" : "ACTIVE",
        startedAt: this.state.startedAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
        lastActiveAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        totalTurns: this.state.conversationHistory.length,
        userWordCount: userWordCount,
        userCharCount: userCharCount,
        userPromptCount: userPromptCount,
        daisyWordCount: daisyWordCount,
        avgWordsPerPrompt: avgWordsPerPrompt,
        judgeRating: judgeRating,
        tabSwitchCount: this.state.tabSwitchCount || 0,
        isTabLocked: this.state.isTabLocked || false,
        logs: logs
      };

      localStorage.setItem('RESECTOR7_ALL_PARTICIPANTS', JSON.stringify(allParticipants));
    } catch (e) {}
  }

  syncTelemetryWithServer(forceImmediate = false) {
    if (typeof fetch === 'undefined') return;
    if (!this.state.playerName) return;

    const performSync = () => {
      try {
        const pName = (this.state.playerName || 'PARTICIPANT').toUpperCase();
        const totalAttempts = this.state.attemptHistory.reduce((sum, lvl) => sum + lvl.length, 0);
        const totalClues = this.state.helpTierUsed.reduce((sum, t) => sum + (t > 0 ? t : 0), 0);
        const solvedCount = (this.state.solvedFragments || []).length;
        const progress = this.state.testCompleted ? 100 : (solvedCount * 25);
        const isCompleted = this.state.testCompleted || solvedCount >= 4;

        const logs = (this.state.conversationHistory || []).slice(-30).map(t => ({
          sender: t.user ? pName : "DAISY",
          text: t.user || t.daisy,
          timestamp: t.timestamp || Date.now()
        }));

        let userWordCount = 0;
        let userCharCount = 0;
        let userPromptCount = 0;
        let daisyWordCount = 0;

        logs.forEach(l => {
          const text = l.text || '';
          const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
          if (l.sender === pName) {
            userPromptCount++;
            userWordCount += words;
            userCharCount += text.length;
          } else if (l.sender === 'DAISY') {
            daisyWordCount += words;
          }
        });

        const avgWordsPerPrompt = userPromptCount > 0 ? (userWordCount / userPromptCount).toFixed(1) : '0.0';

        const fragPts = solvedCount * 10;
        const speedPts = isCompleted ? (this.state.missionTimeRemaining > 600 ? 20 : 15) : 0;
        const promptPts = isCompleted ? (userPromptCount <= 6 ? 20 : (userPromptCount <= 10 ? 15 : 10)) : 0;
        const clueBonus = isCompleted ? Math.max(0, 20 - (totalClues * 5)) : 0;

        let score = 0;
        if (isCompleted) {
          score = Math.min(100, Math.max(0, fragPts + speedPts + promptPts + clueBonus));
        } else if (solvedCount > 0) {
          score = fragPts;
        }

        const elapsedSeconds = Math.max(0, (this.state.missionTimerDuration || 1800) - (this.state.missionTimeRemaining || 0));
        const timeTaken = `${Math.floor(elapsedSeconds / 60)}m ${String(elapsedSeconds % 60).padStart(2, '0')}s`;

        const judgeRating = {
          logicScore: fragPts,
          communicationScore: promptPts,
          clueScore: clueBonus,
          speedScore: speedPts,
          totalScore: score,
          grade: score >= 95 ? "A+" : (score >= 90 ? "A" : (score >= 80 ? "B+" : (score > 0 ? "B" : "START"))),
          verdict: score >= 90 ? "EXCELLENT — Highly Efficient Deductive Run" : (score > 0 ? "QUALIFIED — Active Simulation Progress" : "SESSION INITIATED")
        };

        const payload = {
          sessionId: this.sessionId,
          participantName: pName,
          currentStage: this.state.currentStage || "INTRO",
          currentLevel: this.state.testCompleted ? "Reboot / Choice Complete" : `Level ${this.state.currentMemoryLevel}`,
          oxygenLevel: this.state.oxygenLevel,
          memoryIntegrity: this.state.memoryIntegrity,
          solvedFragments: this.state.solvedFragments || [],
          progress: progress,
          score: score,
          timeTaken: timeTaken,
          timeSeconds: elapsedSeconds,
          cluesUsed: totalClues,
          attempts: totalAttempts,
          userWordCount: userWordCount,
          userCharCount: userCharCount,
          userPromptCount: userPromptCount,
          daisyWordCount: daisyWordCount,
          avgWordsPerPrompt: avgWordsPerPrompt,
          judgeRating: judgeRating,
          tabSwitchCount: this.state.tabSwitchCount || 0,
          isTabLocked: this.state.isTabLocked || false,
          finalDecision: this.state.finalChoice || "PENDING",
          status: this.state.testCompleted ? "COMPLETED" : "ACTIVE",
          logs: logs
        };

        fetch('/api/session/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
        this._lastSyncTime = Date.now();
      } catch (e) {}
    };

    if (forceImmediate) {
      if (this._syncTimer) {
        clearTimeout(this._syncTimer);
        this._syncTimer = null;
      }
      performSync();
      return;
    }

    const now = Date.now();
    if (this._lastSyncTime && (now - this._lastSyncTime < 1800)) {
      if (!this._syncTimer) {
        this._syncTimer = setTimeout(() => {
          this._syncTimer = null;
          performSync();
        }, 1800 - (now - this._lastSyncTime));
      }
      return;
    }

    performSync();
  }

  setStage(stageName) {
    this.state.currentStage = stageName;
    if (typeof logAdminEvent === 'function') {
      logAdminEvent('STAGE', `Participant navigated to Stage: ${stageName}`);
    }
    this.emitChange();
    this.syncTelemetryWithServer(true);
  }

  setPlayerName(name) {
    this.state.playerName = (name || 'PARTICIPANT').toUpperCase().trim();
    if (!this.state.levelStartTimes || !this.state.levelStartTimes[0]) {
      this.state.levelStartTimes = [Date.now(), 0, 0, 0];
    }
    if (typeof logAdminEvent === 'function') {
      logAdminEvent('PLAYER', `Participant registered identity: "${this.state.playerName}"`);
    }
    this.emitChange();
  }

  getTimeSpentInLevel(level = null) {
    const lvl = level || this.state.currentMemoryLevel || 1;
    const idx = Math.max(0, Math.min(3, lvl - 1));
    let startTime = 0;
    if (this.state.levelStartTimes && this.state.levelStartTimes[idx] > 0) {
      startTime = this.state.levelStartTimes[idx];
    } else if (idx === 0) {
      startTime = (this.state.startedAt && new Date(this.state.startedAt).getTime()) || Date.now();
      if (!this.state.levelStartTimes) this.state.levelStartTimes = [startTime, 0, 0, 0];
      else this.state.levelStartTimes[0] = startTime;
    } else {
      startTime = Date.now();
      if (!this.state.levelStartTimes) this.state.levelStartTimes = [0, 0, 0, 0];
      this.state.levelStartTimes[idx] = startTime;
    }
    return Math.max(0, Math.floor((Date.now() - startTime) / 1000));
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
      const pName = this.state.playerName || 'PARTICIPANT';
      if (typeof logAdminEvent === 'function') {
        logAdminEvent(
          'SUCCESS',
          `[+10 PTS] Subject "${pName}" successfully decrypted Phase ${level} Fragment: "${upper}". Total fragments: ${this.state.solvedFragments.length}/4.`
        );
      }
    }
    if (level < 4) {
      this.state.currentMemoryLevel = Math.max(this.state.currentMemoryLevel, level + 1);
      const nextIdx = this.state.currentMemoryLevel - 1;
      if (!this.state.levelStartTimes) this.state.levelStartTimes = [0, 0, 0, 0];
      if (!this.state.levelStartTimes[nextIdx]) {
        this.state.levelStartTimes[nextIdx] = Date.now();
      }
    }
    this.emitChange();
  }

  recordClueRequested(level, tier = null, clueSnippet = null) {
    if (level >= 1 && level <= 4) {
      if (tier != null) {
        this.state.helpTierUsed[level - 1] = Math.min(tier, 4);
      } else {
        this.state.helpTierUsed[level - 1] = Math.min((this.state.helpTierUsed[level - 1] || 0) + 1, 4);
      }
      const currentTier = this.state.helpTierUsed[level - 1];
      const totalClues = this.state.helpTierUsed.reduce((sum, t) => sum + (t > 0 ? t : 0), 0);
      const pName = this.state.playerName || 'PARTICIPANT';

      if (typeof logAdminEvent === 'function') {
        const snippetStr = clueSnippet ? ` ["${clueSnippet.substring(0, 45)}..."]` : '';
        logAdminEvent(
          'CLUE_PENALTY',
          `[CLUE PENALTY -5 PTS] Subject "${pName}" requested Phase ${level} Easy Clue (Tier ${currentTier})${snippetStr} -> -5 PTS deduction. Total clues used: ${totalClues}.`
        );
      }
      this.emitChange();
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
    const stages = [100, 82, 65, 47, 31, 18, 0];
    let stepIndex = 0;

    this.oxygenDecayTimer = setInterval(() => {
      if (this.state.rebootCompleted || this.state.finalChoice || this.state.isGameOver) {
        clearInterval(this.oxygenDecayTimer);
        this.oxygenDecayTimer = null;
        return;
      }

      if (stepIndex < stages.length - 1) {
        stepIndex++;
        const newOxy = stages[stepIndex];
        this.state.oxygenLevel = newOxy;

        if (newOxy <= 0) {
          this.triggerMissionFailure('STATION OXYGEN EXHAUSTED — CRITICAL LIFE SUPPORT FAILURE');
          return;
        }

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

  // Mission Countdown & Game Over Handlers
  setMissionTimer(seconds) {
    const s = Math.max(0, parseInt(seconds, 10) || 0);
    this.state.missionTimeRemaining = s;
    this.state.missionTimerDuration = Math.max(s, this.state.missionTimerDuration || s);
    if (s > 0 && this.state.isGameOver) {
      this.state.isGameOver = false;
      this.state.gameOverReason = '';
      this.state.oxygenLevel = 82;
      this.state.currentStage = this.state.playerName ? 'TERMINAL' : 'IDENTITY';
    }
    this.emitChange();
  }

  addMissionTimerSeconds(seconds) {
    const s = parseInt(seconds, 10) || 0;
    this.setMissionTimer((this.state.missionTimeRemaining || 0) + s);
  }

  toggleMissionTimer(running) {
    if (typeof running === 'boolean') {
      this.state.missionTimerRunning = running;
    } else {
      this.state.missionTimerRunning = !this.state.missionTimerRunning;
    }
    this.emitChange();
  }

  recordTabSwitch() {
    this.state.tabSwitchCount = (this.state.tabSwitchCount || 0) + 1;
    this.state.isTabLocked = true;
    this.state.missionTimerRunning = false;
    this.save();
    this.saveParticipantRecord();
    this.syncTelemetryWithServer(true);
    this.emitChange();
  }

  unlockTabSecurity() {
    this.state.isTabLocked = false;
    this.state.missionTimerRunning = true;
    this.save();
    this.saveParticipantRecord();
    this.syncTelemetryWithServer(true);
    this.emitChange();
  }

  triggerMissionFailure(reason = 'STATION OXYGEN EXHAUSTED — MISSION TIMEOUT') {
    this.state.isGameOver = true;
    this.state.gameOverReason = reason;
    this.state.oxygenLevel = 0;
    this.state.missionTimeRemaining = 0;
    this.state.missionTimerRunning = false;
    this.state.currentStage = 'GAME_OVER';
    if (this.oxygenDecayTimer) {
      clearInterval(this.oxygenDecayTimer);
      this.oxygenDecayTimer = null;
    }
    this.save();
    this.saveParticipantRecord();
    this.syncTelemetryWithServer(true);
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

          // If session is on Intro / Identity or has no registered player, guarantee fresh 30-minute timer
          if (this.state.currentStage === 'INTRO' || this.state.currentStage === 'IDENTITY' || !this.state.playerName) {
            this.state.missionTimeRemaining = Math.max(1800, this.state.missionTimeRemaining || 1800);
            this.state.missionTimerRunning = true;
            this.state.isGameOver = false;
            this.state.gameOverReason = '';
            if (this.state.oxygenLevel <= 0) this.state.oxygenLevel = 82;
            if (this.state.memoryIntegrity <= 0) this.state.memoryIntegrity = 20;
          }
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

function resetGameSession(force = false) {
  const isOver = gameState && gameState.state && (gameState.state.isGameOver || gameState.state.testCompleted);
  if (!force && !isOver && typeof window !== 'undefined' && window.confirm) {
    if (!window.confirm("Are you sure you want to restart RESECTOR 7? All current progress and solved fragments will be reset.")) {
      return;
    }
  }
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('RESECTOR7_STATE_2211.3.0');
      localStorage.removeItem('RESECTOR7_STATE_V2');
      localStorage.removeItem('RESECTOR7_STATE');
      localStorage.removeItem('resector7_gamestate_v1');
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
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
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

// 2. UI-ல் ஆக்ஸிஜன் அளவை அப்டேட் செய்ய (Zero Layout Thrashing, Pure textContent)
let _lastRenderedOxygen = -1;

function updateOxygenUI(level) {
  const displayLevel = Math.max(0, Math.floor(level)); // மைனஸில் போகாமல் தடுக்க
  if (_lastRenderedOxygen === displayLevel) return;
  _lastRenderedOxygen = displayLevel;

  const oxDisplay = document.getElementById('oxygen-display');
  const oxMeterFill = document.getElementById('oxygen-meter-fill');
  if (oxDisplay) oxDisplay.textContent = `${displayLevel}%`;
  if (oxMeterFill) oxMeterFill.style.width = `${displayLevel}%`;

  const oxSecondary = document.getElementById('hud-oxygen-val-secondary');
  if (oxSecondary) oxSecondary.textContent = `${displayLevel}%`;
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

// ==========================================
// ⚡ PERFORMANCE & LAG-FREE OPTIMIZATION ENGINE
// ==========================================

let _lastRenderedTimeStr = '';

function updateOxygenClockUI() {
  const st = (typeof gameState !== 'undefined' && gameState.state) ? gameState.state : null;
  const oxy = st && typeof st.oxygenLevel === 'number' ? st.oxygenLevel : (typeof gameOxygenLevel === 'number' ? gameOxygenLevel : 82);
  updateOxygenUI(oxy);

  if (typeof document !== 'undefined' && st) {
    const remaining = Math.max(0, st.missionTimeRemaining != null ? st.missionTimeRemaining : 1800);
    const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
    const secs = String(remaining % 60).padStart(2, '0');
    const timeStr = `${mins}:${secs}`;

    if (timeStr !== _lastRenderedTimeStr) {
      _lastRenderedTimeStr = timeStr;
      const clockEl = document.getElementById('mission-clock-display');
      const adminClockEl = document.getElementById('admin-clock-remaining-display');
      const badgeEl = document.getElementById('hud-mission-timer');

      if (clockEl) clockEl.textContent = timeStr;
      if (adminClockEl) adminClockEl.textContent = st.isGameOver ? `${timeStr} (FAILED)` : timeStr;

      if (badgeEl) {
        if (remaining <= 20) {
          badgeEl.style.borderColor = '#ef4444';
          badgeEl.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.6)';
          if (clockEl) clockEl.style.color = '#ef4444';
        } else if (remaining <= 60) {
          badgeEl.style.borderColor = '#facc15';
          badgeEl.style.boxShadow = '0 0 16px rgba(250, 204, 21, 0.4)';
          if (clockEl) clockEl.style.color = '#facc15';
        } else {
          badgeEl.style.borderColor = 'rgba(0, 240, 255, 0.45)';
          badgeEl.style.boxShadow = '0 0 16px rgba(0, 240, 255, 0.2)';
          if (clockEl) clockEl.style.color = '#00f0ff';
        }
      }
    }
  }
}

function optimizedGameLoop(timestamp) {
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(optimizedGameLoop);
  }

  if (!timestamp) timestamp = typeof performance !== 'undefined' ? performance.now() : Date.now();

  const elapsed = timestamp - lastUpdate;
  if (elapsed > fpsInterval) {
    lastUpdate = timestamp - (elapsed % fpsInterval);

    // UI ரெஃப்ரெஷ் மற்றும் டைமர் அப்டேட்களை இங்கு இயக்கவும்
    updateOxygenClockUI();
  }
}

// 2. Debounce Function for Chat / Command Inputs (Prevents lag during rapid typing)
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// 3. LocalStorage Memory Leak Prevention (Cleans up old redundant logs)
function pruneOldLogs() {
  try {
    if (typeof localStorage === 'undefined') return;
    let logs = JSON.parse(localStorage.getItem('RESECTOR7_MASTER_LOGS') || '[]');
    if (logs.length > 100) {
      // கடைசி 100 லாக்குகளை மட்டும் வைத்துக் கொண்டு பழையதை நீக்க, லேக் வராது
      logs = logs.slice(-100); 
      localStorage.setItem('RESECTOR7_MASTER_LOGS', JSON.stringify(logs));
    }
    let adminLogs = JSON.parse(localStorage.getItem('RESECTOR7_ADMIN_LOGS') || '[]');
    if (adminLogs.length > 100) {
      adminLogs = adminLogs.slice(-100);
      localStorage.setItem('RESECTOR7_ADMIN_LOGS', JSON.stringify(adminLogs));
    }
  } catch (e) {
    console.error("Log cleanup error:", e);
  }
}

// ஆட்டோ ரன் ஆப்டிமைசேஷன்
if (typeof setInterval !== 'undefined') {
  setInterval(pruneOldLogs, 30000); // प्रति 30 விநாடிகளுக்கு ஒருமுறை மெமரியை க்ளீன் செய்யும்
}
if (typeof window !== 'undefined' && typeof requestAnimationFrame !== 'undefined') {
  requestAnimationFrame(optimizedGameLoop);
}

if (typeof window !== 'undefined') {
  window.gameState = gameState;
  window.GameStateManager = GameStateManager;
  window.resetGameSession = resetGameSession;
  window.saveParticipantProgress = saveParticipantProgress;
  window.startSafeOxygenTimer = startSafeOxygenTimer;
  window.updateOxygenUI = updateOxygenUI;
  window.updateOxygenClockUI = updateOxygenClockUI;
  window.optimizedGameLoop = optimizedGameLoop;
  window.debounce = debounce;
  window.pruneOldLogs = pruneOldLogs;
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
  global.updateOxygenClockUI = updateOxygenClockUI;
  global.optimizedGameLoop = optimizedGameLoop;
  global.debounce = debounce;
  global.pruneOldLogs = pruneOldLogs;
  global.applySafePenalty = applySafePenalty;
  global.gameOxygenLevel = gameOxygenLevel;
}


