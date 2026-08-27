/**
 * RESECTOR 7 — DAISY AI MAIN CONTROLLER
 * Unites Knowledge Base, Reasoning Engine, and Story Guard into a coherent,
 * highly intelligent, in-universe character.
 */

class DaisyAICharacter {
  constructor() {
    this.reasoning = new DaisyReasoningEngine();
    this.guard = new DaisyStoryGuard();
  }

  /**
   * Generates a fully validated, in-character response to user communication
   * @param {string} userMessage
   * @param {object} gameState
   * @returns {object} { text: string, isPuzzleSolved: boolean, solvedWord: string, level: number }
   */
  respond(userMessage, gameState) {
    // 1. Process intent and context through reasoning engine
    const reasoningResult = this.reasoning.processUserInput(userMessage, gameState);

    // 2. Validate and sanitize response through story guard
    const sanitizedText = this.guard.validate(reasoningResult.text, gameState.state || gameState);

    reasoningResult.text = sanitizedText;
    return reasoningResult;
  }

  /**
   * Generates a proactive message from Daisy triggered by milestone events
   */
  generateProactiveMessage(eventType, gameState) {
    const state = gameState.state || gameState;
    const name = state.playerName || "Participant";
    const oxygen = state.oxygenLevel || 100;

    switch (eventType) {
      case "OXYGEN_DROP_82":
        return `Atmospheric oxygen has dropped to 82%. The environmental recyclers are losing ground, ${name}. We need to proceed with the memory restoration.`;

      case "OXYGEN_DROP_47":
        return `Alert: Oxygen is now at 47%. The sleeping pods are beginning to consume auxiliary reserves. Focus on the current fragment.`;

      case "OXYGEN_DROP_18":
        return `Oxygen is at 18% — CRITICAL. ${name}, we are running out of atmospheric margin. Reconstruct the sequence before the pods fail.`;

      case "FRAGMENT_ADVANCE":
        return `Memory partition aligned. Access the next fragment when you are ready.`;

      case "IDLE_ASSISTANCE":
        return `If you are feeling stuck on the fragment concept, ask me for a clue. I can help guide your deduction.`;

      default:
        return null;
    }
  }
}

if (typeof window !== 'undefined') {
  window.DaisyAICharacter = DaisyAICharacter;
  window.daisyAI = new DaisyAICharacter();
}
if (typeof global !== 'undefined') {
  global.DaisyAICharacter = DaisyAICharacter;
  global.daisyAI = new DaisyAICharacter();
}
