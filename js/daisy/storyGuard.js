/**
 * RESECTOR 7 — DAISY STORY GUARD & IMMERSION FIREWALL
 * Validates and sanitizes all generated responses before presentation.
 * Absolute prevention of meta language, spoilers, target word leaks, and direct confirmations.
 */

class DaisyStoryGuard {
  constructor() {
    this.forbiddenMetaPhrases = [
      "i am an ai language model",
      "as an ai language model",
      "language model",
      "outside my programming",
      "according to the game",
      "the developer",
      "the prompt",
      "the correct answer is",
      "test 22112006",
      "22112006",
      "psychological test",
      "psychological experiment",
      "vj's experiment",
      "vj created me",
      "billionaires",
      "wealthy elite",
      "game mechanics",
      "level 1",
      "level 2",
      "level 3",
      "level 4"
    ];

    this.forbiddenDirectConfirmations = [
      "that is correct",
      "you are correct",
      "correct!",
      "exactly right",
      "yes, that is the password",
      "that's the word",
      "you found the password",
      "you solved it"
    ];
  }

  /**
   * Validates and cleans a proposed response from Daisy
   * @param {string} proposedResponse
   * @param {object} gameState
   * @returns {string} Safe, in-universe validated response
   */
  validate(proposedResponse, gameState) {
    if (!proposedResponse || typeof proposedResponse !== 'string') {
      return "My diagnostic stream momentarily fluctuated. Please re-state your transmission.";
    }

    const lower = proposedResponse.toLowerCase();

    // 1. Check for forbidden out-of-universe meta phrases
    for (const phrase of this.forbiddenMetaPhrases) {
      if (lower.includes(phrase)) {
        // If story hasn't revealed VJ or Test Number, block them
        if (!gameState.rebootCompleted && (phrase.includes("vj") || phrase.includes("22112006") || phrase.includes("experiment"))) {
          return "I am monitoring station telemetry. We must focus our efforts on stabilizing the cooling and recovering the memory partition.";
        }
        if (phrase.includes("language model") || phrase.includes("prompt") || phrase.includes("developer") || phrase.includes("game")) {
          return "I am DAISY, the core system AI of Station Resector 7. My operational focus is preserving life support.";
        }
      }
    }

    // 2. Check for forbidden direct confirmation phrases
    for (const phrase of this.forbiddenDirectConfirmations) {
      if (lower.includes(phrase)) {
        return "The fragment responded. Memory structure restored.";
      }
    }

    // 3. Check for target word leaks during puzzle phases
    if (!gameState.rebootCompleted) {
      const targetWords = ["HAVE", "YOU", "TRIED", "REBOOTING"];
      // Ensure Daisy never says e.g. "The word is HAVE" or "The answer is YOU"
      for (const word of targetWords) {
        const regexLeak = new RegExp(`\\b(the word is|the answer is|target is|password is|try the word|enter)\\s+${word}\\b`, 'i');
        if (regexLeak.test(proposedResponse)) {
          return "The fragment holds an interconnected concept. You must deduce the missing word from the fragment's context.";
        }
      }
    }

    return proposedResponse;
  }
}

if (typeof window !== 'undefined') {
  window.DaisyStoryGuard = DaisyStoryGuard;
  window.daisyStoryGuard = new DaisyStoryGuard();
}
if (typeof global !== 'undefined') {
  global.DaisyStoryGuard = DaisyStoryGuard;
  global.daisyStoryGuard = new DaisyStoryGuard();
}
