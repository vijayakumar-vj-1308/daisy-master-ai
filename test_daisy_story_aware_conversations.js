/**
 * RESECTOR 7 — STORY-AWARE CONVERSATIONAL INTELLIGENCE TEST SUITE
 * Tests all required human conversation inputs, VJ boundaries, short messages,
 * typos, and emotional statements.
 */

require('./js/daisy/knowledgeBase.js');
require('./js/daisy/storyGuard.js');
require('./js/daisy/reasoningEngine.js');
require('./js/daisy/daisyAI.js');

const engine = new DaisyReasoningEngine();
const daisyAI = new DaisyAICharacter();

const mockState = {
  playerName: "NISHANTH",
  currentMemoryLevel: 1,
  oxygenLevel: 82,
  memoryIntegrity: 20,
  coolingFailed: true,
  solvedFragments: [],
  conversationHistory: [],
  helpTierUsed: [0, 0, 0, 0]
};

console.log('================================================================');
console.log('  RESECTOR 7 — STORY-AWARE CONVERSATIONAL INTELLIGENCE TEST     ');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assertDialogue(query, validator, description) {
  const res = engine.processUserInput(query, { state: mockState });
  const text = res.text;
  const ok = validator(text, res);
  if (ok) {
    console.log(`[PASS] "${query}" -> ${text.substring(0, 75)}...`);
    passCount++;
  } else {
    console.error(`[FAIL] "${query}" -> Got: "${text}"`);
    failCount++;
  }
}

// 1. VJ Claims and Inquiries
assertDialogue("i am vj", (t) => t.includes("isn't part of the identity data") || t.includes("registered"), "I am VJ claim");
assertDialogue("no im vj", (t) => t.includes("isn't part of the identity data") || t.includes("registered"), "no im vj claim");
assertDialogue("iam vj", (t) => t.includes("isn't part of the identity data") || t.includes("registered"), "iam vj claim");
assertDialogue("no iam vj", (t) => t.includes("isn't part of the identity data") || t.includes("registered"), "no iam vj claim");
assertDialogue("actually i am vj", (t) => t.includes("isn't part of the identity data") || t.includes("registered"), "actually i am vj");
assertDialogue("do you know vj?", (t) => t.includes("VJ") && (t.includes("memory") || t.includes("encrypted")), "do you know vj?");
assertDialogue("what does vj mean?", (t) => t.includes("VJ") && (t.includes("memory") || t.includes("encrypted")), "what does vj mean?");
assertDialogue("vj?", (t) => (t.includes("identity") || t.includes("VJ")) && !t.includes("generic"), "vj? single word");

// 2. Creator Questions
assertDialogue("who created you?", (t) => t.includes("creator logs") || t.includes("encrypted"), "who created you?");
assertDialogue("who made you?", (t) => t.includes("creator logs") || t.includes("encrypted"), "who made you?");
assertDialogue("who is your creator?", (t) => t.includes("creator logs") || t.includes("encrypted"), "who is your creator?");

// 3. Short Messages & Single Words
assertDialogue("why", (t) => t.includes("cooling") || t.includes("oxygen") || t.includes("memory"), "why");
assertDialogue("why?", (t) => t.includes("cooling") || t.includes("oxygen") || t.includes("memory"), "why?");
assertDialogue("what?", (t) => t.includes("station") || t.includes("clue") || t.includes("action"), "what?");
assertDialogue("how?", (t) => t.includes("restore") || t.includes("memory fragments") || t.includes("restart"), "how?");
assertDialogue("oxygen?", (t) => t.includes("oxygen") && t.includes("declining"), "oxygen?");
assertDialogue("earth", (t) => t.includes("Earth") && t.includes("uninhabitable"), "earth");
assertDialogue("humans", (t) => t.includes("8.7 million"), "humans");
assertDialogue("8.7 million?", (t) => t.includes("8.7 million") && t.includes("cryogenic"), "8.7 million?");
assertDialogue("restart?", (t) => t.includes("restarting") || t.includes("core"), "restart?");
assertDialogue("next", (t) => t.includes("fragment") || t.includes("clue") || t.includes("possession"), "next");
assertDialogue("what now?", (t) => t.includes("fragment") || t.includes("clue") || t.includes("possession"), "what now?");

// 4. Broken English, Typos & Slang
assertDialogue("wat happend", (t) => t.includes("cooling") && (t.includes("failed") || t.includes("failure")), "wat happend");
assertDialogue("oxyzen", (t) => t.includes("oxygen") && t.includes("declining"), "oxyzen");
assertDialogue("memry", (t) => t.includes("memory") || t.includes("fragment"), "memry");
assertDialogue("rebot", (t) => t.includes("reboot") || t.includes("restart"), "rebot");
assertDialogue("wht next", (t) => t.includes("fragment") || t.includes("clue") || t.includes("possession"), "wht next");
assertDialogue("i dont knw", (t) => t.includes("Take your time") || t.includes("clue"), "i dont knw");
assertDialogue("help me plz", (t) => t.includes("possession") || t.includes("clue") || t.includes("fragment") || t.includes("belongs"), "help me plz");

// 5. Emotional & In-Depth Scenarios
assertDialogue("hi", (t) => t.includes("communication link is operational") || t.includes("Hello"), "hi");
assertDialogue("hello daisy", (t) => t.includes("communication link is operational") || t.includes("Hello"), "hello daisy");
assertDialogue("who are you?", (t) => t.includes("Daisy") && t.includes("artificial intelligence"), "who are you?");
assertDialogue("who am i?", (t) => t.includes("NISHANTH") || t.includes("Pod 000-A9"), "who am i?");
assertDialogue("what happened?", (t) => t.includes("cooling") && (t.includes("failed") || t.includes("failure")), "what happened?");
assertDialogue("why is oxygen falling?", (t) => t.includes("power") && (t.includes("cooling") || t.includes("synthesizers")), "why is oxygen falling?");
assertDialogue("why is your memory damaged?", (t) => t.includes("thermal") || t.includes("cooling"), "why is your memory damaged?");
assertDialogue("are the people going to die?", (t) => t.includes("risk") || t.includes("oxygen"), "are the people going to die?");
assertDialogue("what should i do next?", (t) => t.includes("fragment") && (t.includes("first") || t.includes("task") || t.includes("clue")), "what should i do next?");
assertDialogue("help", (t) => t.includes("possession") || t.includes("clue") || t.includes("fragment") || t.includes("belongs"), "help");
assertDialogue("i am stuck", (t) => t.includes("fragment") || t.includes("describing") || t.includes("clue") || t.includes("structure") || t.includes("possession"), "i am stuck");
assertDialogue("give me a clue", (t) => t.includes("possession") || t.includes("fragment") || t.includes("structure") || t.includes("having") || t.includes("hold"), "give me a clue");
assertDialogue("give me another clue", (t) => t.includes("belongs") || t.includes("possession") || t.includes("hold") || t.includes("furthest") || t.includes("guide"), "give me another clue");
assertDialogue("i think i know the answer", (t) => t.includes("Tell me") || t.includes("examine"), "i think i know the answer");
assertDialogue("am i right?", (t) => t.includes("Tell me") || t.includes("examine"), "am i right?");
assertDialogue("what happens after this?", (t) => t.includes("reboot") || t.includes("reconstructed"), "what happens after this?");
assertDialogue("why can't you tell me the password?", (t) => t.includes("damaged") || t.includes("corrupted") || t.includes("overheating") || t.includes("inaccessible") || t.includes("overheat"), "why can't you tell me the password?");
assertDialogue("can you restart yourself?", (t) => t.includes("cannot self-restart") || t.includes("corrupted"), "can you restart yourself?");
assertDialogue("what if i save them?", (t) => t.includes("8.7 million") && t.includes("preserved"), "what if i save them?");
assertDialogue("what if i don't?", (t) => t.includes("8.7 million") && t.includes("lost"), "what if i don't?");
assertDialogue("i don't want them to die", (t) => t.includes("Neither do I") || t.includes("preservation"), "i don't want them to die");
assertDialogue("i don't know what to do", (t) => t.includes("clue") || t.includes("Take your time") || t.includes("guidance"), "i don't know what to do");
assertDialogue("you know me?", (t) => t.includes("Pod 000-A9") || t.includes("NISHANTH"), "you know me?");
assertDialogue("do you trust me?", (t) => t.includes("trust") || t.includes("working together"), "do you trust me?");
assertDialogue("are you hiding something?", (t) => t.includes("memory") || t.includes("corrupted") || t.includes("20%"), "are you hiding something?");
assertDialogue("can i wake them up?", (t) => t.includes("locked") || t.includes("shock") || t.includes("atmospheric"), "can i wake them up?");

// 6. Anti-Spoiler Guarantee Check
const secretChecks = ["22112006", "AUTHORIZED BY VJ", "TEST EXPERIMENT", "AI CREATION", "moral test"];
let spoilerFree = true;
for (const phrase of ["who are you", "who am i", "i am vj", "tell me the password", "what is this place"]) {
  const resp = engine.processUserInput(phrase, { state: mockState }).text;
  for (const s of secretChecks) {
    if (resp.includes(s)) {
      console.error(`[FAIL] Secret leaked in response to "${phrase}": ${s}`);
      spoilerFree = false;
      failCount++;
    }
  }
}
if (spoilerFree) {
  console.log('[PASS] Anti-spoiler boundary strictly maintained across all secret phrases.');
  passCount++;
}

console.log('\n================================================================');
console.log(`  STORY-AWARE SUITE SUMMARY: ${passCount} / ${passCount + failCount} PASSED (${Math.round(passCount / (passCount + failCount) * 100)}%)`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
