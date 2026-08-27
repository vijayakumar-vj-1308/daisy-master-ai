/**
 * RESECTOR 7 — ENHANCED CONVERSATIONAL CHAT ENGINE
 * Integrates directly with DaisyAICharacter for intelligent, natural,
 * conversation-driven gameplay and puzzle progression.
 */

class ChatEngine {
  constructor(feedId, typingId, chipsContainerId) {
    this.feed = document.getElementById(feedId);
    this.typingIndicator = document.getElementById(typingId);
    this.chipsContainer = document.getElementById(chipsContainerId);
    this.isDaisyTyping = false;
    this.hasPlayedIntro = false;

    this.initQuickChips();
    this.restoreConversationFeed();
  }

  initQuickChips() {
    if (!this.chipsContainer) return;
    this.chipsContainer.innerHTML = '';

    STORY_DATA.QUICK_INQUIRIES.forEach(item => {
      const chip = document.createElement('button');
      chip.className = 'quick-chip';
      chip.textContent = item.label;
      chip.addEventListener('click', () => {
        if (!this.isDaisyTyping) {
          this.handleUserTransmission(item.query);
        }
      });
      this.chipsContainer.appendChild(chip);
    });
  }

  restoreConversationFeed() {
    if (!this.feed) return;
    const history = gameState.state.conversationHistory || [];
    if (history.length > 0) {
      this.hasPlayedIntro = true;
      this.feed.innerHTML = '';
      history.forEach(turn => {
        if (turn.user) {
          this.renderUserMessageElement(turn.user);
        }
        if (turn.daisy) {
          this.renderDaisyMessageElement(turn.daisy);
        }
      });
      this.scrollToBottom();
    }
  }

  // Mild cosmetic glitch effect maintaining readability
  applyGlitchText(text, isCorrupted) {
    if (!isCorrupted || text.length < 10) return text;
    const chars = text.split('');
    const glitchSymbols = ['░', '▒', '§', '∆', '·'];
    for (let i = 0; i < chars.length; i++) {
      if (Math.random() < 0.012 && chars[i] !== ' ' && chars[i] !== '\n') {
        chars[i] = glitchSymbols[Math.floor(Math.random() * glitchSymbols.length)];
      }
    }
    return chars.join('');
  }

  renderUserMessageElement(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg user';

    const header = document.createElement('div');
    header.className = 'chat-msg-header';
    header.textContent = `${gameState.state.playerName || 'PARTICIPANT'} // TERMINAL INPUT`;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;

    msgDiv.appendChild(header);
    msgDiv.appendChild(bubble);
    this.feed.appendChild(msgDiv);
    return msgDiv;
  }

  renderDaisyMessageElement(text) {
    const isCorrupted = gameState.state.memoryIntegrity < 100;
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg daisy ${isCorrupted ? 'corrupted' : ''}`;

    const header = document.createElement('div');
    header.className = 'chat-msg-header';
    header.innerHTML = `<span>DAISY CORE 07</span> <span style="font-size:0.65rem;opacity:0.7;">[${isCorrupted ? 'MEM: 20%' : 'NOMINAL'}]</span>`;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;

    msgDiv.appendChild(header);
    msgDiv.appendChild(bubble);
    this.feed.appendChild(msgDiv);
    return msgDiv;
  }

  appendUserMessage(text) {
    if (!this.feed) return;
    this.renderUserMessageElement(text);
    this.scrollToBottom();
    if (typeof stationAudio !== 'undefined') {
      stationAudio.playTypeClick();
    }
  }

  async appendDaisyMessage(text, callback, isGlitched = true) {
    if (!this.feed) return;
    this.isDaisyTyping = true;
    this.showTyping(true);

    if (window.daisyAvatar) {
      window.daisyAvatar.setSpeaking(true);
    }

    // Realistic thinking pause
    await new Promise(r => setTimeout(r, 650));

    this.showTyping(false);

    const isCorrupted = gameState.state.memoryIntegrity < 100;
    const glitchedText = isGlitched ? this.applyGlitchText(text, isCorrupted) : text;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg daisy ${isCorrupted ? 'corrupted' : ''}`;

    const header = document.createElement('div');
    header.className = 'chat-msg-header';
    header.innerHTML = `<span>DAISY CORE 07</span> <span style="font-size:0.65rem;opacity:0.7;">[${isCorrupted ? 'MEM: 20%' : 'NOMINAL'}]</span>`;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = '';

    msgDiv.appendChild(header);
    msgDiv.appendChild(bubble);
    this.feed.appendChild(msgDiv);

    // Typewriter effect
    await new Promise(resolve => {
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex < glitchedText.length) {
          bubble.textContent += glitchedText[charIndex];
          if (charIndex % 3 === 0 && typeof stationAudio !== 'undefined') {
            stationAudio.playDaisyVoiceBlip(isCorrupted);
          }
          charIndex++;
          this.scrollToBottom();
        } else {
          clearInterval(typeInterval);
          this.isDaisyTyping = false;
          if (window.daisyAvatar) {
            window.daisyAvatar.setSpeaking(false);
          }
          if (callback) callback();
          resolve();
        }
      }, 16);
    });
  }

  showTyping(state) {
    if (!this.typingIndicator) return;
    if (state) {
      this.typingIndicator.classList.remove('hidden');
      this.scrollToBottom();
    } else {
      this.typingIndicator.classList.add('hidden');
    }
  }

  scrollToBottom() {
    if (this.feed) {
      this.feed.scrollTop = this.feed.scrollHeight;
    }
  }

  /**
   * Primary handler for user communications
   */
  async handleUserTransmission(userText) {
    if (!userText || !userText.trim()) return;
    this.isDaisyTyping = false;
    const cleanText = userText.trim();
    this.appendUserMessage(cleanText);

    // Route query through Daisy AI Cognition Engine with safe recovery
    let responseObj = null;
    try {
      if (window.daisyAI) {
        responseObj = window.daisyAI.respond(cleanText, gameState);
      } else {
        responseObj = { text: STORY_DATA.getDaisyResponse(cleanText, gameState.state) };
      }
    } catch (err) {
      console.error("[DAISY CHAT ROUTING ERROR]", err);
      responseObj = {
        text: "My communication channel is unstable. I can still process your message. Try asking me again.",
        status: "ERROR_RECOVERED"
      };
    }

    if (!responseObj || !responseObj.text) {
      responseObj = {
        text: "I understand you're asking about the situation, but I'm not sure which part you mean. Ask me about the station, the oxygen system, my memory, or the problem we're currently solving.",
        status: "FALLBACK"
      };
    }

    // Save to persistent conversation history
    gameState.recordConversationTurn(cleanText, responseObj.text, responseObj.topic || null);

    // Master Admin Activity Logging
    if (typeof logAdminEvent === 'function') {
      const pName = (gameState && gameState.state && gameState.state.playerName) || 'USER';
      logAdminEvent('CHAT', `[${pName}]: "${cleanText}" → [DAISY]: "${responseObj.text.slice(0, 90)}${responseObj.text.length > 90 ? '...' : ''}"`);
    }

    // If wrong answer attempt, apply safe oxygen penalty
    if (responseObj.topic === 'wrong_answer' || responseObj.isWrongAnswer) {
      if (typeof logAdminEvent === 'function') {
        logAdminEvent('PUZZLE', `Incorrect memory attempt: "${cleanText}" (Penalty: -2% Oxygen)`);
      }
      if (typeof applySafePenalty === 'function') {
        applySafePenalty();
      }
    }

    // If a puzzle was solved in chat
    if (responseObj.isPuzzleSolved && responseObj.solvedWord) {
      gameState.addSolvedFragment(responseObj.solvedWord, responseObj.level);
      if (typeof logAdminEvent === 'function') {
        logAdminEvent('PUZZLE', `Fragment ${responseObj.level} Unlocked: "${responseObj.solvedWord}" (${gameState.state.solvedFragments.length}/4 total)`);
      }
      if (typeof stationAudio !== 'undefined') {
        stationAudio.playRebootChime();
      }

      // Update HUD diagnostic indicators
      const diagFragments = document.getElementById('diag-fragments');
      if (diagFragments) {
        diagFragments.textContent = `${gameState.state.solvedFragments.length} / 4`;
      }

      // Check if all 4 solved
      if (gameState.state.solvedFragments.length >= 4) {
        if (typeof logAdminEvent === 'function') {
          logAdminEvent('STAGE', 'All 4 memory fragments unlocked! Transitioning to Password Assembly...');
        }
        setTimeout(() => {
          if (window.app) {
            window.app.showStage('ASSEMBLY');
            if (window.app.puzzleEngine) window.app.puzzleEngine.initAssemblyStage();
          }
        }, 1600);
      }
    }

    // Display Daisy's message with thinking animation
    await this.appendDaisyMessage(responseObj.text);
  }

  /**
   * Triggers a proactive Daisy message
   */
  triggerProactive(eventType) {
    if (this.isDaisyTyping || !window.daisyAI) return;
    const message = window.daisyAI.generateProactiveMessage(eventType, gameState);
    if (message) {
      gameState.recordConversationTurn(null, message, "proactive");
      this.appendDaisyMessage(message);
    }
  }

  // Play opening script sequence
  async playIntroSequence(lines, onComplete) {
    if (this.hasPlayedIntro) {
      if (onComplete) onComplete();
      return;
    }
    this.hasPlayedIntro = true;
    for (let i = 0; i < lines.length; i++) {
      await new Promise(resolve => {
        this.appendDaisyMessage(lines[i].text, resolve);
      });
      gameState.recordConversationTurn(null, lines[i].text, "intro");
      await new Promise(r => setTimeout(r, 400));
    }
    if (onComplete) onComplete();
  }
}

// 1. DOM Refresh & Heavy Animation Throttling (லேக் ஆகாமல் தவிர்க்க)
let isProcessing = false;

function optimizedTransmitAction(userInput) {
  if (isProcessing) return; // ஒரே நேரத்தில் பல கிளிக்குகள் விழுந்து ஸ்டக் ஆவதைத் தவிர்க்க
  isProcessing = true;

  // டெர்மினல் ப்ராசஸிங்
  if (window.app && window.app.chatEngine) {
    window.app.chatEngine.handleUserTransmission(userInput);
  } else if (typeof processTerminalInput === 'function') {
    processTerminalInput(userInput);
  }

  setTimeout(() => {
    isProcessing = false;
  }, 300); // 300ms இடைவெளி
}

// 1. Auto-Scroll Terminal Output (சாட் அல்லது டெர்மினல் டெக்ஸ்ட் ஆட்டோமேட்டிக்காக கீழே ஸ்க்ரோல் ஆக)
function autoScrollTerminal() {
  const terminalChatBox = document.getElementById('chat-feed') || document.getElementById('communication-link-box') || document.querySelector('.terminal-chat-container') || document.querySelector('.chat-feed');
  if (terminalChatBox) {
    terminalChatBox.scrollTop = terminalChatBox.scrollHeight;
  }
}

// 3. Smooth Fade-In Animation for Text Responses (எழுத்துக்கள் நேர்த்தியாகத் தோன்ற)
function renderSmoothMessage(containerId, messageHTML) {
  const container = document.getElementById(containerId) || document.getElementById('chat-feed');
  if (!container) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = "opacity-0 transition-opacity duration-500 ease-in-out my-2";
  msgDiv.innerHTML = messageHTML;
  container.appendChild(msgDiv);

  // அனிமேஷன் ட்ரிகர்
  setTimeout(() => {
    msgDiv.classList.remove('opacity-0');
    msgDiv.classList.add('opacity-100');
    autoScrollTerminal();
  }, 50);
}

// 4. கூடுதல் கமாண்ட்கள் (scan, logs) - பழைய விடைகளைப் பாதிக்காது
function checkSafeLoreCommands(userInput) {
  const cmd = (userInput || '').toLowerCase().trim();
  
  if (cmd === 'scan') {
    renderSmoothMessage('chat-feed', `<div class="text-amber-400 my-2" style="color: #fbbf24; font-family: var(--font-mono); font-size: 0.85rem; padding: 6px 10px; background: rgba(251, 191, 36, 0.1); border-left: 2px solid #fbbf24; border-radius: 4px;">[SYSTEM] Scanning Sector 7... 8,700,000 life signs detected in cryogenic stasis.</div>`);
    if (typeof stationAudio !== 'undefined') stationAudio.playTypeClick();
    return true; 
  } 
  else if (cmd === 'logs') {
    renderSmoothMessage('chat-feed', `<div class="text-amber-400 my-2" style="color: #fbbf24; font-family: var(--font-mono); font-size: 0.85rem; padding: 6px 10px; background: rgba(251, 191, 36, 0.1); border-left: 2px solid #fbbf24; border-radius: 4px;">[DAISY] Accessing archived log: "Earth was lost. We built this station for the elite. Was it the right choice?" - VJ</div>`);
    if (typeof stationAudio !== 'undefined') stationAudio.playTypeClick();
    return true;
  }
  
  return false; // இந்த கமாண்ட்கள் இல்லை என்றால் பழைய லாஜிக் வழக்கம் போல இயங்கும்
}

function processTerminalInput(userInput) {
  // Lore கமாண்டா என செக் செய்யும்
  if (checkSafeLoreCommands(userInput)) return;

  if (window.app && window.app.chatEngine) {
    window.app.chatEngine.handleUserTransmission(userInput);
  }
}

if (typeof window !== 'undefined') {
  window.ChatEngine = ChatEngine;
  window.optimizedTransmitAction = optimizedTransmitAction;
  window.autoScrollTerminal = autoScrollTerminal;
  window.renderSmoothMessage = renderSmoothMessage;
  window.checkSafeLoreCommands = checkSafeLoreCommands;
  window.processTerminalInput = processTerminalInput;
}
if (typeof global !== 'undefined') {
  global.ChatEngine = ChatEngine;
  global.optimizedTransmitAction = optimizedTransmitAction;
  global.autoScrollTerminal = autoScrollTerminal;
  global.renderSmoothMessage = renderSmoothMessage;
  global.checkSafeLoreCommands = checkSafeLoreCommands;
  global.processTerminalInput = processTerminalInput;
}
