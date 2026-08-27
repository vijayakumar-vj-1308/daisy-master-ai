/**
 * RESECTOR 7 — PUZZLE & MEMORY RESTORATION ENGINE (DAISY-FIRST)
 * Handles sequence assembly and automatic reboot verification.
 */

class PuzzleEngine {
  constructor() {
    this.currentLevel = 1;
    this.assembledSequence = [null, null, null, null];
    this.dom = {
      slotsContainer: document.getElementById('sequence-slots-container'),
      chipsPool: document.getElementById('chips-pool-container'),
      btnVerifySeq: document.getElementById('btn-verify-sequence'),
      btnResetChips: document.getElementById('btn-reset-chips'),
      assemblyFeedback: document.getElementById('assembly-feedback')
    };

    this.bindEvents();
  }

  bindEvents() {
    if (this.dom.btnVerifySeq) {
      this.dom.btnVerifySeq.addEventListener('click', () => this.verifyAssembledSequence());
    }

    if (this.dom.btnResetChips) {
      this.dom.btnResetChips.addEventListener('click', () => this.resetAssemblySlots());
    }
  }

  // Master Password Assembly Phase (HAVE YOU TRIED REBOOTING)
  initAssemblyStage() {
    this.assembledSequence = [null, null, null, null];
    if (!this.dom.chipsPool || !this.dom.slotsContainer) return;

    this.dom.chipsPool.innerHTML = '';
    if (this.dom.assemblyFeedback) {
      this.dom.assemblyFeedback.textContent = '';
      this.dom.assemblyFeedback.className = 'assembly-feedback';
    }
    if (this.dom.btnVerifySeq) this.dom.btnVerifySeq.disabled = true;

    // Scramble the 4 fragments
    const scrambled = ['TRIED', 'HAVE', 'REBOOTING', 'YOU'];

    scrambled.forEach((word) => {
      const chip = document.createElement('div');
      chip.className = 'word-chip';
      chip.textContent = word;
      chip.dataset.word = word;
      chip.draggable = true;

      // Click to place in next available slot
      chip.addEventListener('click', () => this.handleChipClick(chip, word));

      // Drag and drop support
      chip.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', word);
      });

      this.dom.chipsPool.appendChild(chip);
    });

    // Setup drop slots
    for (let s = 0; s < 4; s++) {
      const slot = document.getElementById(`slot-${s}`);
      if (slot) {
        slot.innerHTML = `<span class="slot-placeholder">SLOT ${s + 1}</span>`;
        slot.classList.remove('filled', 'hovered');

        slot.addEventListener('dragover', (e) => {
          e.preventDefault();
          slot.classList.add('hovered');
        });

        slot.addEventListener('dragleave', () => {
          slot.classList.remove('hovered');
        });

        slot.addEventListener('drop', (e) => {
          e.preventDefault();
          slot.classList.remove('hovered');
          const word = e.dataTransfer.getData('text/plain');
          if (word) {
            this.placeWordInSlot(word, s);
          }
        });

        // Click slot to clear it
        slot.addEventListener('click', () => {
          if (this.assembledSequence[s]) {
            this.clearSlot(s);
          }
        });
      }
    }
  }

  handleChipClick(chipEl, word) {
    if (chipEl.classList.contains('placed')) return;
    const firstEmpty = this.assembledSequence.findIndex(w => w === null);
    if (firstEmpty !== -1) {
      this.placeWordInSlot(word, firstEmpty);
    }
  }

  placeWordInSlot(word, slotIndex) {
    const existingSlot = this.assembledSequence.findIndex(w => w === word);
    if (existingSlot !== -1 && existingSlot !== slotIndex) {
      this.clearSlot(existingSlot);
    }

    this.assembledSequence[slotIndex] = word;
    const slot = document.getElementById(`slot-${slotIndex}`);
    if (slot) {
      slot.innerHTML = `<span class="word-chip" style="cursor:pointer;" title="Click to remove">${word}</span>`;
      slot.classList.add('filled');
      if (typeof stationAudio !== 'undefined') stationAudio.playTypeClick();
    }

    if (this.dom.chipsPool) {
      const chips = this.dom.chipsPool.querySelectorAll('.word-chip');
      chips.forEach(c => {
        if (c.dataset.word === word) c.classList.add('placed');
      });
    }

    const allFilled = this.assembledSequence.every(w => w !== null);
    if (this.dom.btnVerifySeq) {
      this.dom.btnVerifySeq.disabled = !allFilled;
    }

    // If all 4 are filled, auto-verify immediately
    if (allFilled) {
      this.verifyAssembledSequence();
    }
  }

  clearSlot(slotIndex) {
    const word = this.assembledSequence[slotIndex];
    this.assembledSequence[slotIndex] = null;

    const slot = document.getElementById(`slot-${slotIndex}`);
    if (slot) {
      slot.innerHTML = `<span class="slot-placeholder">SLOT ${slotIndex + 1}</span>`;
      slot.classList.remove('filled');
    }

    if (word && this.dom.chipsPool) {
      const chips = this.dom.chipsPool.querySelectorAll('.word-chip');
      chips.forEach(c => {
        if (c.dataset.word === word) c.classList.remove('placed');
      });
    }

    if (this.dom.btnVerifySeq) this.dom.btnVerifySeq.disabled = true;
  }

  resetAssemblySlots() {
    for (let i = 0; i < 4; i++) {
      this.clearSlot(i);
    }
  }

  verifyAssembledSequence() {
    const entered = this.assembledSequence.join(' ');
    const correct = STORY_DATA.MASTER_PASSWORD_WORDS.join(' ');

    if (entered === correct) {
      if (typeof logAdminEvent === 'function') {
        logAdminEvent('PUZZLE', `Master Sequence CORRECT: "${entered}" -> Reboot authorized!`);
      }
      if (this.dom.assemblyFeedback) {
        this.dom.assemblyFeedback.textContent = "SEQUENCE VALID — MASTER RECOVERY PROTOCOL ACCEPTED";
        this.dom.assemblyFeedback.className = "assembly-feedback text-stable";
      }
      if (typeof stationAudio !== 'undefined') stationAudio.playRebootChime();

      setTimeout(() => {
        if (window.app) {
          window.app.triggerRebootSequence();
        }
      }, 1400);
    } else {
      if (typeof logAdminEvent === 'function') {
        logAdminEvent('PUZZLE', `Master Sequence INVALID: "${entered}" (Expected: "${correct}")`);
      }
      if (this.dom.assemblyFeedback) {
        this.dom.assemblyFeedback.textContent = "INVALID SEQUENCE — REBOOT INSTRUCTION REJECTED";
        this.dom.assemblyFeedback.className = "assembly-feedback text-alert";
      }
      if (typeof stationAudio !== 'undefined') stationAudio.playGlitchNoise();
      if (window.daisyAvatar) window.daisyAvatar.triggerGlitch();
    }
  }
}

if (typeof window !== 'undefined') {
  window.PuzzleEngine = PuzzleEngine;
}
if (typeof global !== 'undefined') {
  global.PuzzleEngine = PuzzleEngine;
}
