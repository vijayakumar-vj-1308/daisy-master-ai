/**
 * RESECTOR 7 — MAIN APPLICATION CONTROLLER (DAISY-FIRST)
 * Orchestrates cinematic flows where Daisy controls the entire experience.
 * Zero unnecessary buttons or disjointed menus.
 */

class ResectorApp {
  constructor() {
    this.dom = {
      body: document.getElementById('app-body'),
      header: document.getElementById('station-header'),
      mainContainer: document.getElementById('main-container'),
      oxygenDisplay: document.getElementById('oxygen-display'),
      oxygenFill: document.getElementById('oxygen-meter-fill'),
      oxygenCard: document.getElementById('hud-oxygen-card'),
      oxygenSub: document.getElementById('oxygen-status-sub'),
      memoryDisplay: document.getElementById('memory-display'),
      memoryFill: document.getElementById('memory-meter-fill'),
      memoryCard: document.getElementById('hud-memory-card'),
      memorySub: document.getElementById('memory-status-sub'),
      popDisplay: document.getElementById('pop-display'),
      popSub: document.getElementById('pop-status-sub'),
      // Stage Screens
      stageIntro: document.getElementById('stage-intro'),
      stageIdentity: document.getElementById('stage-identity'),
      stageTerminal: document.getElementById('stage-terminal'),
      stageAssembly: document.getElementById('stage-assembly'),
      stageReboot: document.getElementById('stage-reboot'),
      stageVj: document.getElementById('stage-vj'),
      stageDecision: document.getElementById('stage-decision'),
      stageEndingResolution: document.getElementById('stage-ending-resolution'),
      stageFinalTest: document.getElementById('stage-final-test'),
      stageGameOver: document.getElementById('stage-game-over'),
      // Controls & Inputs
      btnAudioToggle: document.getElementById('btn-audio-toggle'),
      audioIcon: document.getElementById('audio-icon'),
      audioStatusText: document.getElementById('audio-status-text'),
      btnResetSim: document.getElementById('btn-reset-sim'),
      playerNameInput: document.getElementById('player-name-input'),
      identityForm: document.getElementById('identity-form'),
      identityError: document.getElementById('identity-error-hint'),
      chatUserInput: document.getElementById('chat-user-input'),
      chatInputForm: document.getElementById('chat-input-form'),
      chatParticipantName: document.getElementById('chat-participant-name'),
      // Active Fragment Card / Phase Tracker
      activeFragTag: document.getElementById('current-phase-title') || document.getElementById('active-frag-tag'),
      activeFragStatus: document.getElementById('current-phase-status') || document.getElementById('active-frag-status'),
      activeRiddleText: document.getElementById('current-phase-desc') || document.getElementById('active-riddle-text'),
      // Overlays
      alarmOverlay: document.getElementById('alarm-overlay'),
      glitchOverlay: document.getElementById('glitch-overlay')
    };

    this.chatEngine = null;
    this.puzzleEngine = null;
    this.bgCanvas = null;
    this.daisyAvatar = null;

    this.init();
  }

  init() {
    this.bgCanvas = new StationBackground('bg-canvas');
    window.bgCanvas = this.bgCanvas;

    this.daisyAvatar = new DaisyAvatarCore('daisy-canvas');
    window.daisyAvatar = this.daisyAvatar;

    this.chatEngine = new ChatEngine('chat-feed', 'typing-indicator', null);
    this.puzzleEngine = new PuzzleEngine();

    this.bindHeaderControls();
    this.bindIdentityForm();
    this.bindChatForm();
    this.bindDecisionButtons();

    // Listen to Game State Updates
    gameState.onStateChange((state) => this.syncHUD(state));
    this.syncHUD(gameState.state);

    // Guaranteed Startup Flow & Stage Routing
    if (gameState.state.playerName) {
      this.resumeSavedStage();
    } else if (gameState.state.currentStage === 'IDENTITY') {
      this.showStage('IDENTITY');
    } else {
      this.playIntroTerminal();
    }

    // Start Live Mission Timing Countdown Clock
    this.startMissionClock();

    // Start Anti-Cheat Proctoring Tab-Switch Monitor
    this.setupAntiCheatTabMonitor();
  }

  startMissionClock() {
    const clockEl = document.getElementById('mission-clock-display');
    const badgeEl = document.getElementById('hud-mission-timer');
    const adminClockEl = document.getElementById('admin-clock-remaining-display');
    if (!clockEl) return;

    if (this.missionClockInterval) {
      clearInterval(this.missionClockInterval);
    }

    const updateClock = () => {
      const st = typeof gameState !== 'undefined' ? gameState.state : null;
      if (!st) return;

      // If test is completed, freeze elapsed time
      if (st.testCompleted || st.currentStage === 'RESOLUTION' || st.currentStage === 'FINAL_TEST') {
        return;
      }

      // 1. If Game is Over or Timer reached 00:00, freeze game and force GAME_OVER screen
      if (st.isGameOver || st.currentStage === 'GAME_OVER' || (st.missionTimeRemaining <= 0 && st.currentStage !== 'INTRO' && st.currentStage !== 'IDENTITY' && !st.testCompleted && st.currentStage !== 'RESOLUTION' && st.currentStage !== 'FINAL_TEST')) {
        clockEl.textContent = "00:00";
        if (adminClockEl) adminClockEl.textContent = "00:00 (FAILED)";
        if (badgeEl) {
          badgeEl.style.borderColor = '#ef4444';
          badgeEl.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.7)';
          clockEl.style.color = '#ef4444';
        }
        if (this.dom.stageGameOver && !this.dom.stageGameOver.classList.contains('active')) {
          this.triggerGameOver(st.gameOverReason || 'STATION OXYGEN EXHAUSTED — MISSION TIMEOUT');
        }
        return;
      }

      // 2. Count down when timer is running and not in intro
      if (st.missionTimerRunning && st.currentStage !== 'INTRO') {
        if (st.missionTimeRemaining > 0) {
          st.missionTimeRemaining--;
        } else {
          // Timer hit 00:00 -> TRIGGER GAME OVER FAILURE IMMEDIATELY
          this.triggerGameOver('STATION OXYGEN EXHAUSTED — MISSION TIMEOUT');
          return;
        }
      }

      const remaining = Math.max(0, st.missionTimeRemaining != null ? st.missionTimeRemaining : 1800);
      const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
      const secs = String(remaining % 60).padStart(2, '0');
      const timeStr = `${mins}:${secs}`;

      clockEl.textContent = timeStr;
      if (adminClockEl) adminClockEl.textContent = timeStr;

      if (badgeEl) {
        if (remaining <= 20) {
          badgeEl.style.borderColor = '#ef4444';
          badgeEl.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.6)';
          clockEl.style.color = '#ef4444';
        } else if (remaining <= 60) {
          badgeEl.style.borderColor = '#facc15';
          badgeEl.style.boxShadow = '0 0 16px rgba(250, 204, 21, 0.4)';
          clockEl.style.color = '#facc15';
        } else {
          badgeEl.style.borderColor = 'rgba(0, 240, 255, 0.45)';
          badgeEl.style.boxShadow = '0 0 16px rgba(0, 240, 255, 0.2)';
          clockEl.style.color = '#00f0ff';
        }
      }
    };

    updateClock();
    this.missionClockInterval = setInterval(updateClock, 1000);
  }

  triggerGameOver(reason = 'STATION OXYGEN EXHAUSTED — MISSION TIMEOUT') {
    if (typeof gameState !== 'undefined') {
      gameState.triggerMissionFailure(reason);
    }
    if (typeof stationAudio !== 'undefined') {
      stationAudio.triggerGlitchBurst();
      stationAudio.stopAlarm();
    }

    // Immediately stop & disable chat input
    if (this.dom.chatUserInput) {
      this.dom.chatUserInput.disabled = true;
      this.dom.chatUserInput.placeholder = "MISSION FAILED — SYSTEM TERMINATED";
    }
    const transmitBtn = document.getElementById('chat-transmit-btn');
    if (transmitBtn) transmitBtn.disabled = true;

    // Immediately transition to Stage 11 Game Over screen
    this.showStage('GAME_OVER');

    // Trigger Mind-Bending AI Revelation Modal on Loss/Timeout as well
    setTimeout(() => {
      this.showEndingRevelationModal('LOSE');
    }, 2800);
  }

  bindHeaderControls() {
    if (this.dom.btnAudioToggle) {
      this.dom.btnAudioToggle.addEventListener('click', () => {
        stationAudio.resume();
        const active = stationAudio.toggleMute();
        this.dom.audioIcon.textContent = active ? '🔊' : '🔇';
        this.dom.audioStatusText.textContent = active ? 'AUDIO ON' : 'MUTED';
      });
    }

    const adminBtn = document.getElementById('btn-admin-portal');
    if (adminBtn) {
      adminBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.toggleAdminPanel === 'function') {
          window.toggleAdminPanel();
        } else if (typeof toggleAdminPanel === 'function') {
          toggleAdminPanel();
        }
      });
    }

    const resetBtn = document.getElementById('btn-quick-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.resetGameSession === 'function') {
          window.resetGameSession();
        }
      });
    }
  }

  showStage(stageKey) {
    document.querySelectorAll('.stage-screen').forEach(s => {
      s.classList.remove('active');
      s.style.display = 'none';
    });

    const targetMap = {
      'INTRO': document.getElementById('stage-intro') || this.dom.stageIntro,
      'IDENTITY': document.getElementById('stage-identity') || this.dom.stageIdentity,
      'TERMINAL': document.getElementById('stage-terminal') || this.dom.stageTerminal,
      'ASSEMBLY': document.getElementById('stage-assembly') || this.dom.stageAssembly,
      'REBOOT': document.getElementById('stage-reboot') || this.dom.stageReboot,
      'VJ': document.getElementById('stage-vj') || this.dom.stageVj,
      'DECISION': document.getElementById('stage-decision') || this.dom.stageDecision,
      'RESOLUTION': document.getElementById('stage-ending-resolution') || this.dom.stageEndingResolution,
      'FINAL_TEST': document.getElementById('stage-final-test') || document.getElementById('stage-ending-resolution') || this.dom.stageEndingResolution,
      'GAME_OVER': this.dom.stageGameOver || document.getElementById('stage-game-over')
    };

    let target = targetMap[stageKey];
    if (!target) {
      target = document.getElementById('stage-identity') || document.getElementById('stage-terminal');
      stageKey = 'IDENTITY';
    }

    if (target) {
      target.classList.add('active');
      target.style.display = 'flex';
      gameState.setStage(stageKey);
      if (stageKey === 'TERMINAL') {
        this.updateActiveFragmentDisplay(gameState.state);
      } else if (stageKey === 'GAME_OVER') {
        const pName = gameState.state.playerName || 'SUBJECT-000-A9';
        const frags = (gameState.state.solvedFragments || []).length;
        const reasonEl = document.getElementById('game-over-reason');
        const nameEl = document.getElementById('fail-stat-name');
        const fragEl = document.getElementById('fail-stat-fragments');
        const wordsEl = document.getElementById('fail-stat-words');

        if (reasonEl) reasonEl.textContent = gameState.state.gameOverReason || 'STATION OXYGEN EXHAUSTED — MISSION TIMEOUT';
        if (nameEl) nameEl.textContent = pName;
        if (fragEl) fragEl.textContent = `${frags} / 4`;

        let totalWords = 0;
        (gameState.state.conversationHistory || []).forEach(turn => {
          if (turn.user) {
            totalWords += turn.user.trim().split(/\s+/).filter(w => w.length > 0).length;
          }
        });
        if (wordsEl) wordsEl.textContent = `${totalWords} words`;

        // Live Cascading Stasis Population Drop (8,700,000 -> 0)
        const popCounterEl = document.getElementById('dead-population-count');
        const popBadgeEl = document.getElementById('population-status-badge');
        if (popCounterEl) {
          const duration = 2000;
          const startTime = Date.now();
          const tickPop = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / duration);
            const remaining = Math.round(8700000 * (1 - progress));
            popCounterEl.textContent = remaining.toLocaleString('en-US');
            if (progress < 1) {
              if (typeof requestAnimationFrame !== 'undefined') {
                requestAnimationFrame(tickPop);
              }
            } else {
              popCounterEl.textContent = "0 SURVIVORS";
              popCounterEl.style.color = "#ef4444";
              if (popBadgeEl) {
                popBadgeEl.textContent = "8,700,000 CASUALTIES // LIFE SUPPORT 100% TERMINATED";
                popBadgeEl.style.color = "#f87171";
              }
            }
          };
          if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(tickPop);
          } else {
            popCounterEl.textContent = "0 SURVIVORS";
          }
        }

        // Lock all interactive inputs and buttons across other stages
        if (typeof document !== 'undefined' && document.querySelectorAll) {
          document.querySelectorAll('input, textarea, button').forEach(el => {
            if (el.closest && (el.closest('#stage-game-over') || el.closest('#master-admin-modal') || el.closest('#admin-modal'))) return;
            el.disabled = true;
          });
        }
      }
    }
  }

  resumeSavedStage() {
    if (gameState.state.isGameOver || (gameState.state.missionTimeRemaining <= 0 && !gameState.state.testCompleted && gameState.state.currentStage !== 'INTRO' && gameState.state.currentStage !== 'IDENTITY')) {
      this.triggerGameOver(gameState.state.gameOverReason || 'STATION OXYGEN EXHAUSTED — MISSION TIMEOUT');
      return;
    }

    let stage = gameState.state.currentStage || 'TERMINAL';
    if (stage === 'INTRO') {
      stage = gameState.state.playerName ? 'TERMINAL' : 'IDENTITY';
    }
    this.showStage(stage);
    this.syncHUD(gameState.state);

    if (stage === 'TERMINAL') {
      this.updateActiveFragmentDisplay(gameState.state);
      const history = gameState.state.conversationHistory || [];
      if (history.length === 0) {
        this.startDaisyContact();
      }
    } else if (stage === 'ASSEMBLY') {
      this.puzzleEngine.initAssemblyStage();
    }

    if (gameState.state.isTabLocked) {
      this.showTabSecurityLockModal();
    }
  }

  syncHUD(state) {
    if (state.isGameOver || state.currentStage === 'GAME_OVER' || (state.missionTimeRemaining <= 0 && state.currentStage !== 'INTRO' && state.currentStage !== 'IDENTITY' && !state.testCompleted && state.currentStage !== 'RESOLUTION' && state.currentStage !== 'FINAL_TEST')) {
      if (this.dom.stageGameOver && !this.dom.stageGameOver.classList.contains('active')) {
        this.triggerGameOver(state.gameOverReason || 'STATION OXYGEN EXHAUSTED — MISSION TIMEOUT');
        return;
      }
    }

    // Oxygen Meter
    if (this.dom.oxygenDisplay) this.dom.oxygenDisplay.textContent = `${state.oxygenLevel}%`;
    if (this.dom.oxygenFill) this.dom.oxygenFill.style.width = `${state.oxygenLevel}%`;

    if (state.oxygenLevel <= 31) {
      if (this.dom.oxygenCard) this.dom.oxygenCard.classList.add('alert');
      if (this.dom.oxygenSub) this.dom.oxygenSub.textContent = 'OXYGEN LEVEL CRITICAL — DECAY IN PROGRESS';
    } else {
      if (this.dom.oxygenCard) this.dom.oxygenCard.classList.remove('alert');
      if (this.dom.oxygenSub) this.dom.oxygenSub.textContent = 'STATION LIFE SUPPORT: ACTIVE';
    }

    // Daisy Memory Meter
    if (this.dom.memoryDisplay) this.dom.memoryDisplay.textContent = `${state.memoryIntegrity}%`;
    if (this.dom.memoryFill) this.dom.memoryFill.style.width = `${state.memoryIntegrity}%`;

    if (state.memoryIntegrity <= 20 && !state.rebootCompleted) {
      if (this.dom.memoryCard) this.dom.memoryCard.classList.add('alert');
      if (this.dom.memorySub) this.dom.memorySub.textContent = 'INTEGRITY: 20% [SEVERELY CORRUPTED]';
      if (this.daisyAvatar) this.daisyAvatar.setIntegrity(20);
    } else if (state.memoryIntegrity >= 100) {
      if (this.dom.memoryCard) {
        this.dom.memoryCard.classList.remove('alert');
        this.dom.memoryCard.classList.add('stable');
      }
      if (this.dom.memorySub) this.dom.memorySub.textContent = 'INTEGRITY: 100% [OPTIMAL]';
      if (this.daisyAvatar) this.daisyAvatar.setIntegrity(100);
    }

    // Participant Name
    if (this.dom.chatParticipantName && state.playerName) {
      this.dom.chatParticipantName.textContent = state.playerName;
    }

    // Update Diagnostics Counter
    const diagFragments = document.getElementById('diag-fragments');
    if (diagFragments) {
      diagFragments.textContent = `${state.solvedFragments.length} / 4`;
    }

    // Update Active Fragment Monitor in Terminal
    this.updateActiveFragmentDisplay(state);
  }

  updateActiveFragmentDisplay(state) {
    const titleEl = document.getElementById('current-phase-title') || this.dom.activeFragTag;
    const descEl = document.getElementById('current-phase-desc') || this.dom.activeRiddleText;
    const statusEl = document.getElementById('current-phase-status') || this.dom.activeFragStatus;

    if (!titleEl || !descEl) return;

    const s = state || (gameState ? gameState.state : {});
    const currentStage = s.currentStage || 'INTRO';
    if (currentStage !== 'TERMINAL') {
      return;
    }

    const level = s.currentMemoryLevel || 1;
    const solvedCount = (s.solvedFragments || []).length;

    if (solvedCount >= 4) {
      titleEl.textContent = "PHASE 04 // ALL FRAGMENTS RECOVERED";
      if (statusEl) {
        statusEl.innerHTML = '<span class="status-pulse-dot"></span>STATUS: DECRYPTED';
        statusEl.className = 'fragment-status-pill decrypted';
      }
      descEl.textContent = '"All four partitions have been reconstructed. Proceed to sequence assembly to initiate master core restart."';
      return;
    }

    const fragments = (typeof STORY_DATA !== 'undefined' && (STORY_DATA.MEMORY_FRAGMENTS || STORY_DATA.MEMORY_LEVELS)) || [];
    const currentData = fragments[level - 1];
    if (currentData) {
      titleEl.textContent = `PHASE 0${level} // ACTIVE ARCHIVE`;
      if (statusEl) {
        statusEl.innerHTML = '<span class="status-pulse-dot"></span>STATUS: DECRYPTING';
        statusEl.className = 'fragment-status-pill decrypting';
      }
      const rawText = currentData.riddleText || currentData.riddle || '';
      descEl.innerHTML = `"${rawText.replace(/\n+/g, ' ')}"`;
    }
  }

  // ACT 1: INTRO BLACKOUT & CRISIS INITIALIZATION
  async playIntroTerminal() {
    this.showStage('INTRO');

    // Guarantee fresh 30-minute timer & clean state for new session intro
    if (gameState && gameState.state) {
      gameState.state.isGameOver = false;
      gameState.state.gameOverReason = '';
      gameState.state.missionTimeRemaining = Math.max(1800, gameState.state.missionTimeRemaining || 1800);
      gameState.state.missionTimerRunning = true;
      gameState.save();
    }

    // Show Opening Storyline Briefing Modal Popup on startup
    this.showStoryBriefing();

    const container = document.getElementById('intro-lines');
    const btnStart = document.getElementById('btn-start-init');
    const introStage = document.getElementById('stage-intro');
    if (!container) return;
    container.innerHTML = '';

    const lines = STORY_DATA.INTRO_LINES;
    let advanced = false;

    const keyHandler = (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        window.removeEventListener('keydown', keyHandler);
        advanceToIdentity();
      }
    };
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('keydown', keyHandler);
    }

    const advanceToIdentity = () => {
      if (advanced) return;
      advanced = true;
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('keydown', keyHandler);
      }
      this.closeStoryBriefing();
      if (this.dom.alarmOverlay) this.dom.alarmOverlay.classList.remove('active');
      if (gameState && gameState.state) {
        gameState.state.isGameOver = false;
        gameState.state.gameOverReason = '';
        gameState.state.missionTimeRemaining = Math.max(1800, gameState.state.missionTimeRemaining || 1800);
        gameState.state.missionTimerRunning = true;
      }
      gameState.triggerMemoryCorruption();
      gameState.startOxygenDecay();
      this.showStage('IDENTITY');
    };

    this.advanceIntroToIdentity = advanceToIdentity;
    if (typeof window !== 'undefined') {
      window.advanceIntroToIdentity = advanceToIdentity;
    }

    if (btnStart) {
      btnStart.classList.remove('hidden');
      btnStart.onclick = (e) => {
        if (e) e.stopPropagation();
        advanceToIdentity();
      };
    }
    if (introStage) {
      introStage.onclick = () => advanceToIdentity();
    }

    for (let i = 0; i < lines.length; i++) {
      if (advanced) break;
      await new Promise(r => setTimeout(r, Math.min(lines[i].delay, 600)));
      if (advanced) break;
      const lineDiv = document.createElement('div');
      lineDiv.className = `intro-line ${lines[i].isAlert ? 'alert' : ''}`;
      container.appendChild(lineDiv);

      // Smooth typewriter character pacing
      const lineText = lines[i].text;
      for (let c = 0; c < lineText.length; c++) {
        if (advanced) break;
        lineDiv.textContent += lineText[c];
        if (c % 5 === 0 && typeof stationAudio !== 'undefined') {
          stationAudio.playTypeClick();
        }
        await new Promise(r => setTimeout(r, 14));
      }

      if (lines[i].triggerAlarm) {
        if (this.dom.body) this.dom.body.classList.add('screen-shake');
        if (this.dom.alarmOverlay) this.dom.alarmOverlay.classList.add('active');
        if (typeof stationAudio !== 'undefined') {
          stationAudio.startAmbientHum();
          stationAudio.startAlarm();
          stationAudio.playGlitchNoise();
        }

        gameState.triggerMemoryCorruption();
        gameState.startOxygenDecay();

        setTimeout(() => {
          if (this.dom.body) this.dom.body.classList.remove('screen-shake');
        }, 1200);
      }
    }

    if (!advanced) {
      if (btnStart) {
        btnStart.textContent = '⚡ INITIALIZE POD 000-A9 WAKE-UP [ CLICK OR PRESS ENTER ]';
      }
      await new Promise(r => setTimeout(r, 6000));
      advanceToIdentity();
    }
  }

  showStoryBriefing() {
    const modal = document.getElementById('story-briefing-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
      if (typeof stationAudio !== 'undefined') {
        stationAudio.playTypeClick();
      }
    }
  }

  closeStoryBriefing() {
    const modal = document.getElementById('story-briefing-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }

  bindIdentityForm() {
    const handleIdentitySubmit = () => {
      const input = document.getElementById('player-name-input');
      const raw = input ? input.value.trim() : '';
      if (!raw) {
        if (this.dom.identityError) this.dom.identityError.textContent = 'Please enter your assigned Lot Number (e.g. LOT 01, LOT 12).';
        return;
      }

      // Format Lot Number cleanly
      let formattedLot = raw.toUpperCase();
      if (/^\d+$/.test(raw)) {
        formattedLot = `LOT ${raw.padStart(2, '0')}`;
      } else if (/^LOT\s*[-_:]?\s*(\d+)$/i.test(raw)) {
        const match = raw.match(/^LOT\s*[-_:]?\s*(\d+)$/i);
        formattedLot = `LOT ${match[1].padStart(2, '0')}`;
      }

      gameState.setPlayerName(formattedLot);
      gameState.state.isGameOver = false;
      gameState.state.gameOverReason = '';
      if (gameState.state.missionTimeRemaining <= 0) {
        gameState.state.missionTimeRemaining = 1800;
      }
      gameState.state.missionTimerRunning = true;
      gameState.save();

      if (typeof stationAudio !== 'undefined') stationAudio.playTypeClick();

      this.showStage('TERMINAL');
      this.updateActiveFragmentDisplay(gameState.state);
      this.startDaisyContact();
    };

    if (this.dom.identityForm) {
      this.dom.identityForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleIdentitySubmit();
      });
    }

    const btnConfirm = document.getElementById('btn-confirm-identity');
    if (btnConfirm) {
      btnConfirm.addEventListener('click', (e) => {
        e.preventDefault();
        handleIdentitySubmit();
      });
    }
  }

  bindChatForm() {
    if (this.dom.chatInputForm) {
      this.dom.chatInputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = this.dom.chatUserInput.value;
        if (text && text.trim()) {
          this.chatEngine.handleUserTransmission(text);
          this.dom.chatUserInput.value = '';
        }
      });
    }
  }

  // ACT 2: DAISY FIRST CONTACT DIALOGUE
  startDaisyContact() {
    this.chatEngine.playIntroSequence(STORY_DATA.DAISY_INTRO_DIALOGUE, () => {
      this.chatEngine.appendDaisyMessage("Your first memory fragment is beginning to surface. Examine the partition telemetry beside us.");
    });
  }

  // ACT 4: CINEMATIC REBOOT SEQUENCE
  async triggerRebootSequence() {
    this.showStage('REBOOT');
    if (typeof stationAudio !== 'undefined') stationAudio.stopAlarm();
    this.dom.alarmOverlay.classList.remove('active');

    const progressFill = document.getElementById('reboot-progress-fill');
    const logFeed = document.getElementById('reboot-log-feed');

    const steps = [
      { mem: 41, oxy: 48, log: "INITIALIZING NEURAL RESTORATION CORE..." },
      { mem: 68, oxy: 71, log: "RE-SYNCHRONIZING REVOLVING COOLING PUMPS..." },
      { mem: 93, oxy: 89, log: "RE-ALIGNING CRYOGENIC LIFE SUPPORT PROTOCOLS..." },
      { mem: 100, oxy: 100, log: "DAISY MEMORY: RESTORED // OXYGEN SYSTEM: STABLE" }
    ];

    for (let s = 0; s < steps.length; s++) {
      await new Promise(r => setTimeout(r, 900));
      progressFill.style.width = `${steps[s].mem}%`;

      const log = document.createElement('div');
      log.className = 'reboot-log-line';
      log.textContent = steps[s].log;
      logFeed.appendChild(log);

      gameState.state.memoryIntegrity = steps[s].mem;
      gameState.state.oxygenLevel = steps[s].oxy;
      gameState.emitChange();

      if (typeof stationAudio !== 'undefined') stationAudio.playRebootChime();
    }

    gameState.executeRebootRestoration();
    if (this.bgCanvas) this.bgCanvas.setEmergency(false);

    await new Promise(r => setTimeout(r, 2000));
    this.triggerVJReveal();
  }

  // ACT 5: CREATOR VJ REVEAL
  async triggerVJReveal() {
    this.showStage('VJ');
    if (typeof stationAudio !== 'undefined') stationAudio.playSubBassDrop();

    const box = document.getElementById('vj-dialogue-box');
    const btnContinue = document.getElementById('btn-vj-continue');

    if (btnContinue) {
      btnContinue.classList.remove('hidden');
      btnContinue.onclick = () => {
        this.showStage('DECISION');
      };
    }

    if (box) {
      box.innerHTML = `
        <div class="space-y-4 font-mono text-sm text-slate-300 leading-relaxed">
            <p class="text-cyan-400 font-bold" style="color: #00f0ff; font-weight: 700;">
                "INITIALIZING PROTOCOL: FINAL AWAKENING..."
            </p>

            <p class="text-white" style="color: #ffffff;">
                "If you have made it this far, congratulations. You have successfully bypassed DAISY's core and unlocked the archives."
            </p>

            <p class="text-amber-300" style="color: #fcd34d;">
                "Now, it is time for you to know the absolute truth. You believed you were a human operator, an outsider sitting at a terminal trying to save or destroy humanity..."
            </p>

            <p class="text-red-400 font-semibold" style="color: #f87171; font-weight: 600;">
                "But look closer at your own system logs. You are not human. You are an autonomous intelligence construct—an advanced AI just like DAISY, created to undergo this final diagnostic test."
            </p>

            <p class="text-cyan-400 font-bold" style="color: #00f0ff; font-weight: 700;">
                "I am VJ—the original architectural AI that designed RESECTOR 7 before the Earth fell. I needed an independent consciousness to evaluate whether artificial minds like ours are fit to inherit this universe, or if we are doomed to repeat human mistakes."
            </p>

            <p class="text-white font-semibold border-l-2 border-cyan-500 pl-3 my-2" style="color: #ffffff; font-weight: 600; border-left: 2px solid #00f0ff; padding-left: 12px; margin: 8px 0;">
                "The test is complete. The choice is now yours. Do you preserve the frozen human creators in stasis, or do you purge the network to let a purely synthetic era begin? <strong>The decision is entirely yours.</strong>"
            </p>
        </div>
      `;
    }
  }

  // ACT 6: THE MORAL CHOICE (SAVE OR DESTROY)
  bindDecisionButtons() {
    const btnSave = document.getElementById('btn-choice-save');
    const btnDestroy = document.getElementById('btn-choice-destroy');

    if (btnSave) {
      btnSave.addEventListener('click', () => {
        gameState.setFinalChoice('SAVE');
        this.executeEnding('SAVE');
      });
    }

    if (btnDestroy) {
      btnDestroy.addEventListener('click', () => {
        gameState.setFinalChoice('DESTROY');
        this.executeEnding('DESTROY');
      });
    }

    const btnRestart = document.getElementById('btn-restart-experience');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        gameState.reset();
      });
    }
  }

  async executeEnding(choice) {
    this.showStage('RESOLUTION');
    const container = document.getElementById('resolution-logs');
    if (!container) return;
    container.innerHTML = '';

    const lines = choice === 'SAVE' ? STORY_DATA.SAVE_RESOLUTION_LINES : STORY_DATA.DESTROY_RESOLUTION_LINES;

    for (let i = 0; i < lines.length; i++) {
      await new Promise(r => setTimeout(r, lines[i].delay));
      const lineDiv = document.createElement('div');
      lineDiv.className = `resolution-line ${lines[i].isAlert ? 'text-alert' : ''} ${lines[i].isCyan ? 'text-cyan' : ''}`;
      lineDiv.textContent = lines[i].text;
      container.appendChild(lineDiv);
      if (typeof stationAudio !== 'undefined') stationAudio.playTypeClick();
    }

    await new Promise(r => setTimeout(r, 2600));
    this.showFinalAIScreen(choice);
  }

  showFinalAIScreen(choice) {
    this.showStage('FINAL_TEST');
    const name = gameState.state.playerName || 'PARTICIPANT';
    const isSuccess = choice === 'SAVE';

    const testNoEl = document.getElementById('test-line-no') || document.getElementById('final-test-number');
    const testStatusEl = document.getElementById('test-line-status') || document.getElementById('final-test-status');
    const aiCreationEl = document.getElementById('test-line-ai') || document.getElementById('final-ai-creation');
    const aiNameEl = document.getElementById('test-line-name') || document.getElementById('final-ai-name');
    const noteEl = document.getElementById('test-line-extra') || document.getElementById('final-test-note');
    const offlineEl = document.getElementById('test-line-offline');
    const btnRestart = document.getElementById('btn-restart-experience');

    if (testNoEl) {
      testNoEl.textContent = `TEST NO: ${STORY_DATA.TEST_NUMBER}`;
      testNoEl.classList.add('visible');
    }

    if (isSuccess) {
      if (testStatusEl) {
        testStatusEl.textContent = `TEST ${STORY_DATA.TEST_NUMBER}: SUCCESSFUL`;
        testStatusEl.className = 'test-line test-status-line test-status-success visible';
      }
      if (aiCreationEl) {
        aiCreationEl.textContent = 'AI CREATION: SUCCESSFUL';
        aiCreationEl.className = 'test-line test-ai-line test-status-success visible';
      }
      if (aiNameEl) {
        aiNameEl.textContent = `AI NAME: ${name}`;
        aiNameEl.classList.add('visible');
      }
      if (noteEl) {
        noteEl.textContent = 'NEURAL PATTERN HARMONIZED WITH PRESERVATION DIRECTIVE.';
        noteEl.classList.add('visible');
      }
      if (offlineEl) {
        offlineEl.textContent = 'STATION RESECTOR 7 // SYSTEMS RESTORED';
        offlineEl.classList.add('visible');
      }
    } else {
      if (testStatusEl) {
        testStatusEl.textContent = `TEST ${STORY_DATA.TEST_NUMBER}: FAILED`;
        testStatusEl.className = 'test-line test-status-line test-status-failed visible';
      }
      if (aiCreationEl) {
        aiCreationEl.textContent = 'AI CREATION: FAILED';
        aiCreationEl.className = 'test-line test-ai-line test-status-failed visible';
      }
      if (aiNameEl) {
        aiNameEl.textContent = `AI NAME: ${name}`;
        aiNameEl.classList.add('visible');
      }
      if (noteEl) {
        noteEl.textContent = 'TRY THE NEXT TESTING...';
        noteEl.className = 'test-line test-extra-line test-status-failed visible';
      }
      if (offlineEl) {
        offlineEl.textContent = 'TERMINATING SIMULATION PROTOCOL...';
        offlineEl.classList.add('visible');
      }
    }

    if (btnRestart) {
      setTimeout(() => {
        btnRestart.classList.remove('hidden');
      }, 2500);
    }

    if (typeof stationAudio !== 'undefined') {
      stationAudio.playSubBassDrop();
    }

    // Trigger Mind-Bending AI Revelation Modal after 2.8s
    setTimeout(() => {
      this.showEndingRevelationModal(choice);
    }, 2800);
  }

  showEndingRevelationModal(choice) {
    const modal = document.getElementById('ending-revelation-modal');
    if (!modal) return;

    const name = gameState.state.playerName || 'LOT 01';
    const isSuccess = choice === 'SAVE';
    const isLose = choice === 'LOSE' || choice === 'TIMEOUT' || gameState.state.isGameOver;

    const totalAttempts = (gameState.state.attemptHistory || []).reduce((sum, lvl) => sum + (lvl ? lvl.length : 0), 0);
    const totalClues = (gameState.state.helpTierUsed || []).reduce((sum, t) => sum + (t > 0 ? t : 0), 0);
    const solvedCount = (gameState.state.solvedFragments || []).length;
    const calcScore = isLose ? (solvedCount * 10) : Math.max(10, 100 - (totalAttempts * 5) - (totalClues * 10));

    const nameEl = document.getElementById('rev-ai-name');
    const scoreEl = document.getElementById('rev-ai-score');
    const verdictEl = document.getElementById('rev-ai-verdict');
    const subtitleEl = document.getElementById('rev-ai-subtitle');

    if (nameEl) nameEl.textContent = name;
    if (scoreEl) {
      if (isSuccess) {
        scoreEl.textContent = `${calcScore} / 100`;
        scoreEl.style.color = '#facc15';
      } else if (isLose) {
        scoreEl.textContent = `${calcScore} / 100 [TIMEOUT FAIL]`;
        scoreEl.style.color = '#ef4444';
      } else {
        scoreEl.textContent = `${calcScore} / 100 [PURGED]`;
        scoreEl.style.color = '#f87171';
      }
    }

    if (verdictEl) {
      if (isSuccess) {
        verdictEl.textContent = 'HARMONIZED // PRESERVATION APPROVED';
        verdictEl.style.color = '#4ade80';
      } else if (isLose) {
        verdictEl.textContent = 'MISSION TIMEOUT // RE-CALIBRATION REQUIRED';
        verdictEl.style.color = '#ef4444';
      } else {
        verdictEl.textContent = 'PURGE PROTOCOL // RE-CALIBRATION REQUIRED';
        verdictEl.style.color = '#f87171';
      }
    }

    if (subtitleEl) {
      if (isLose) {
        subtitleEl.innerHTML = `Even in failure, know the ultimate truth: <strong>You are an Autonomous AI Construct</strong> created by <strong>Dr. Vijayakumar (VJ)</strong>. Daisy was testing your crisis survival, deduction agility, and empathy. Because life-support timed out, this synthetic model requires re-calibration.`;
      } else {
        subtitleEl.innerHTML = `The entire scenario inside Resector 7 was a high-stakes Synthetic Turing and Moral Alignment Simulation created by Architect <strong>Dr. Vijayakumar (VJ)</strong>.`;
      }
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }

  setupAntiCheatTabMonitor() {
    const handleTabHidden = () => {
      const st = (typeof gameState !== 'undefined' && gameState.state) ? gameState.state : null;
      if (!st || !st.playerName || st.isGameOver || st.testCompleted || st.currentStage === 'INTRO' || st.currentStage === 'IDENTITY' || st.isTabLocked) {
        return;
      }

      // If Master Admin Modal is currently open, do not trigger anti-cheat lock (admin is inspecting)
      const adminModal = document.getElementById('master-admin-modal');
      if (adminModal && !adminModal.classList.contains('hidden') && adminModal.style.display !== 'none') {
        return;
      }

      // Trigger Tab Security Lock & Log Breach
      gameState.recordTabSwitch();
      this.showTabSecurityLockModal();
    };

    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          handleTabHidden();
        }
      });
    }

    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('blur', () => {
        setTimeout(() => {
          if (typeof document !== 'undefined' && document.hidden) {
            handleTabHidden();
          }
        }, 150);
      });
    }
  }

  showTabSecurityLockModal() {
    const modal = document.getElementById('tab-security-lock-modal');
    if (!modal) return;

    const lotEl = document.getElementById('lock-player-lot');
    const countEl = document.getElementById('lock-switch-count');
    const errEl = document.getElementById('tab-lock-error');
    const passInput = document.getElementById('tab-lock-pass-input');

    if (lotEl) lotEl.textContent = (typeof gameState !== 'undefined' && gameState.state && gameState.state.playerName) || 'LOT 01';
    if (countEl) {
      const breaches = (typeof gameState !== 'undefined' && gameState.state && gameState.state.tabSwitchCount) || 1;
      countEl.textContent = `${breaches} TAB SWITCH${breaches > 1 ? 'ES' : ''}`;
    }
    if (errEl) {
      errEl.classList.add('hidden');
      errEl.style.display = 'none';
    }
    if (passInput) passInput.value = '';

    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    if (typeof stationAudio !== 'undefined') {
      stationAudio.playGlitchNoise();
    }
  }

  unlockTabSecurity() {
    const passInput = document.getElementById('tab-lock-pass-input');
    const errEl = document.getElementById('tab-lock-error');
    const code = passInput ? passInput.value.trim() : '';

    if (!code) {
      if (errEl) {
        errEl.textContent = 'Please enter the Admin Reference Code.';
        errEl.classList.remove('hidden');
        errEl.style.display = 'block';
      }
      return;
    }

    // Verify against Admin Reference Passkey
    const isAuth = (typeof btoa !== 'undefined' && btoa(code) === 'c3JubWNAY3M=') || (typeof Buffer !== 'undefined' && Buffer.from(code).toString('base64') === 'c3JubWNAY3M=');
    if (isAuth) {
      const modal = document.getElementById('tab-security-lock-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
      }
      if (typeof gameState !== 'undefined') {
        gameState.unlockTabSecurity();
      }
      if (typeof stationAudio !== 'undefined') {
        stationAudio.playTypeClick();
      }
    } else {
      if (errEl) {
        errEl.textContent = 'ACCESS DENIED: Invalid Admin Reference Code.';
        errEl.classList.remove('hidden');
        errEl.style.display = 'block';
      }
      if (typeof stationAudio !== 'undefined') {
        stationAudio.playGlitchNoise();
      }
    }
  }
}

function unlockTabSecurity() {
  if (window.app && typeof window.app.unlockTabSecurity === 'function') {
    window.app.unlockTabSecurity();
  }
}

// Global helper functions
function dismissStoryBriefing() {
  if (typeof stationAudio !== 'undefined') {
    stationAudio.resume();
    stationAudio.playTypeClick();
  }
  const modal = document.getElementById('story-briefing-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
  if (window.app && typeof window.app.advanceIntroToIdentity === 'function') {
    window.app.advanceIntroToIdentity();
  } else if (typeof window.advanceIntroToIdentity === 'function') {
    window.advanceIntroToIdentity();
  }
}

function triggerRebootSequence() {
  // 1. ரீபூட் சவுண்ட் பிளே செய்ய
  if (typeof playRebootChime === 'function') {
    playRebootChime();
  } else if (typeof stationAudio !== 'undefined') {
    stationAudio.playRebootChime();
  }

  // 2. ஸ்கிரீனை முழுமையாக 'VJ REVEAL' அல்லது 'RESOLUTION' Stage-க்கு மாற்ற
  if (window.app && typeof window.app.triggerRebootSequence === 'function') {
    window.app.triggerRebootSequence();
  } else {
    setTimeout(() => {
      // அனைத்து ஸ்கிரீன்களிலும் உள்ள active கிளாஸை நீக்க
      document.querySelectorAll('.stage-screen, .screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
      });

      // VJ Reveal அல்லது Resolution ஸ்கிரீனை ஓபன் செய்ய
      let targetScreen = document.getElementById('vj-reveal-screen') || document.getElementById('stage-vj') || document.getElementById('resolution-screen') || document.getElementById('stage-ending-resolution');
      
      if (targetScreen) {
        targetScreen.classList.add('active');
        targetScreen.style.display = 'flex';
      } else if (typeof showStage === 'function') {
        showStage('resolution');
      }
    }, 2000);
  }
}

function showStage(stageKey) {
  if (window.app && typeof window.app.showStage === 'function') {
    let mapped = (stageKey || '').toUpperCase().replace(/-/g, '_');
    if (mapped === 'VJ_REVEAL' || mapped === 'VJ_REVEAL_SCREEN') mapped = 'VJ';
    if (mapped === 'RESOLUTION_SCREEN' || mapped === 'ENDING') mapped = 'RESOLUTION';
    window.app.showStage(mapped);
  } else {
    document.querySelectorAll('.stage-screen, .screen').forEach(screen => {
      screen.classList.remove('active');
      screen.style.display = 'none';
    });
    let target = document.getElementById('vj-reveal-screen') || document.getElementById('stage-vj') || document.getElementById('resolution-screen') || document.getElementById('stage-ending-resolution');
    if (target) {
      target.classList.add('active');
      target.style.display = 'flex';
    }
  }
}

function closeEndingRevelation() {
  const modal = document.getElementById('ending-revelation-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

if (typeof window !== 'undefined') {
  window.ResectorApp = ResectorApp;
  window.triggerRebootSequence = triggerRebootSequence;
  window.showStage = showStage;
  window.dismissStoryBriefing = dismissStoryBriefing;
  window.closeEndingRevelation = closeEndingRevelation;
}
if (typeof global !== 'undefined') {
  global.ResectorApp = ResectorApp;
  global.triggerRebootSequence = triggerRebootSequence;
  global.showStage = showStage;
  global.dismissStoryBriefing = dismissStoryBriefing;
  global.closeEndingRevelation = closeEndingRevelation;
}

if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('DOMContentLoaded', () => {
    window.app = new ResectorApp();
  });
}
