/**
 * RESECTOR 7 — FINAL DAISY POLISH & GAMEPLAY INTELLIGENCE VERIFICATION
 * Tests:
 * 1. Consistent Character & Persona
 * 2. Complete Story & Lore Model
 * 3. Participant Role Invariance ("I am an engineer")
 * 4. Tamil-English & Colloquial Slang Normalization
 * 5. Multi-Turn Context Resolution & Pronoun Chaining
 * 6. No-Dead-End Step-by-Step Level Guidance
 * 7. Adaptive 5-Tier Clues
 * 8. Hard but Fair Socratic Reasoning
 * 9. Self-Correction & Contradiction Resolution
 * 10. Logical Cause vs Effect vs Consequence Reasoning
 */

global.window = global;

require('./js/daisy/knowledgeBase.js');
require('./js/daisy/storyGuard.js');
require('./js/daisy/reasoningEngine.js');
require('./js/daisy/daisyAI.js');

const daisyAI = global.daisyAI;

let passCount = 0;
let failCount = 0;

const state = {
  playerName: "NISHANTH",
  currentMemoryLevel: 1,
  solvedFragments: [],
  oxygenLevel: 75,
  conversationHistory: [],
  helpTierUsed: [0, 0, 0, 0]
};

function runTest(desc, query, expectedKeywords, options = {}) {
  const resp = daisyAI.respond(query, state);
  state.conversationHistory.push({ user: query, daisy: resp.text, topic: resp.topic });

  const text = (resp && resp.text) ? resp.text.toLowerCase() : "";
  const matched = expectedKeywords.some(k => text.includes(k.toLowerCase()));

  if (matched) {
    console.log(`[PASS] ${desc}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${desc}`);
    console.error(`       Query: "${query}"`);
    console.error(`       Expected one of: ${JSON.stringify(expectedKeywords)}`);
    console.error(`       Daisy gave: "${resp.text}"`);
    failCount++;
  }
}

console.log('================================================================');
console.log('  RESECTOR 7 — FINAL DAISY POLISH & GAMEPLAY INTELLIGENCE TEST   ');
console.log('================================================================\n');

// 1. Participant Role Invariance
runTest("Participant claims to be engineer", "I am the chief engineer", ["passenger", "Pod 000-A9", "001-Alpha", "neural sync failure"]);
runTest("Participant claims to be scientist", "I am a scientist", ["passenger", "Pod 000-A9", "001-Alpha"]);

// 2. Tamil-English & Tanglish Normalization
runTest("Tanglish: enna aachu", "enna aachu", ["cooling", "temperature", "memory"]);
runTest("Tanglish: yen", "yen", ["thermal", "power", "cooling", "memory", "heat sinks"]);
runTest("Tanglish: epdi", "epdi", ["first task", "recover", "damaged memory", "reboot", "analyze"]);
runTest("Tanglish: romba bayam", "romba bayama irukku", ["understand", "NISHANTH", "not alone", "Take a breath", "with you"]);
runTest("Tanglish: mudiyala", "mudiyala puriyala", ["Focus on the meaning", "technology", "possess", "short word", "sentence", "identify"]);
runTest("Tanglish: enna panradhu", "enna panradhu", ["first task", "recover", "damaged memory", "possessed", "tell me your answer", "Focus on the meaning"]);

// 3. Self-Correction & Contradiction Resolution
runTest("Contradiction challenge: oxygen was stable", "You said the oxygen system was stable.", ["clarify", "timeline", "life-support", "declining", "not the same condition"]);
runTest("Causality challenge: oxygen caused cooling", "Maybe oxygen failure caused the cooling failure.", ["opposite direction", "cooling failure was detected first", "resulted", "instability"]);

// 4. Multi-Turn Context Resolution Chaining
runTest("Multi-turn: Why is oxygen falling?", "Why is oxygen falling?", ["temperature", "emergency", "power", "starving", "cooling"]);
runTest("Multi-turn follow-up: Then fixing cooling should help?", "Then fixing cooling should help?", ["stabilizing", "cooling", "restart", "coolant cycle"]);
runTest("Multi-turn follow-up: So why don't you fix it?", "So why don't you fix it?", ["portion of my memory", "damaged", "directly access"]);

// 5. Adaptive 5-Tier Clues (Level 1)
state.helpTierUsed = [0, 0, 0, 0];
runTest("Clue Tier 1 (Concept)", "Help me", ["possession"]);
runTest("Clue Tier 2 (Alternative Perspective)", "Give me another clue", ["belongs to someone"]);
runTest("Clue Tier 3 (Structure)", "Give me another hint", ["You ___ something", "having something"]);
runTest("Clue Tier 4 (Strongest Indirect)", "More clue", ["universal root word", "hold or possess", "possess"]);
runTest("Clue Tier 5 (Max Socratic)", "Another clue", ["furthest I can guide you", "remaining deduction"]);

// 6. No-Dead-End Step-by-Step Level Guidance
runTest("What should I do now?", "What should I do now?", ["first task", "recover", "damaged memory", "possessed", "tell me your answer", "Focus on the meaning"]);

console.log('\n================================================================');
console.log(`  FINAL POLISH TEST SUMMARY: ${passCount} / ${passCount + failCount} PASSED (${Math.round(passCount / (passCount + failCount) * 100)}%)`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
