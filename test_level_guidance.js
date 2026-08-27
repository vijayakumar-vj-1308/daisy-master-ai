// Mock browser globals for Node.js
global.window = global;

require('./js/daisy/knowledgeBase.js');
require('./js/daisy/storyGuard.js');
require('./js/daisy/reasoningEngine.js');
require('./js/daisy/daisyAI.js');

const daisyAI = global.daisyAI;

let passCount = 0;
let failCount = 0;

function assert(condition, message, details = "") {
  if (condition) {
    passCount++;
    console.log(`[PASS] ${message}`);
  } else {
    failCount++;
    console.error(`[FAIL] ${message} -> ${details}`);
  }
}

console.log('================================================================');
console.log('  RESECTOR 7 — DETAILED NEXT-ACTION GUIDANCE TEST SUITE         ');
console.log('================================================================\n');

// -------------------------------------------------------------
// 1. LEVEL 1 NEXT-ACTION GUIDANCE
// -------------------------------------------------------------
console.log('--- 1. LEVEL 1 NEXT-ACTION GUIDANCE ---');
let stateL1 = {
  playerName: "NISHANTH",
  currentMemoryLevel: 1,
  solvedFragments: [],
  oxygenLevel: 75,
  conversationHistory: []
};

const l1Queries = [
  "What do I do next?",
  "What next?",
  "Now what?",
  "How do I continue?",
  "Tell me what to do.",
  "How can I finish this level?",
  "What am I supposed to do?"
];

l1Queries.forEach(q => {
  const resp = daisyAI.respond(q, stateL1);
  assert(
    resp.text.includes("first task") && resp.text.includes("recover") && resp.text.includes("possessed"),
    `L1 Guidance for "${q}"`,
    `Daisy returned: "${resp.text.substring(0, 80)}..."`
  );
  assert(!resp.text.includes("HAVE"), `L1 Guidance does NOT leak HAVE for "${q}"`);
});

// -------------------------------------------------------------
// 2. LEVEL 1 VERY STUCK GUIDANCE
// -------------------------------------------------------------
console.log('\n--- 2. LEVEL 1 VERY STUCK ESCALATION ---');
stateL1.conversationHistory.push({ user: "What next?", daisy: "...", topic: "next_action_guidance" });
const stuckResp = daisyAI.respond("I'm completely stuck. what next?", stateL1);
assert(
  stuckResp.text.includes("Focus on the meaning rather than the technology") && stuckResp.text.includes("possess"),
  "L1 Very Stuck provides escalated conceptual focus",
  stuckResp.text
);
assert(!stuckResp.text.includes("HAVE"), "L1 Very Stuck does NOT leak HAVE");

// -------------------------------------------------------------
// 3. LEVEL 2 NEXT-ACTION GUIDANCE
// -------------------------------------------------------------
console.log('\n--- 3. LEVEL 2 NEXT-ACTION GUIDANCE ---');
let stateL2 = {
  playerName: "NISHANTH",
  currentMemoryLevel: 2,
  solvedFragments: ["HAVE"],
  oxygenLevel: 68,
  conversationHistory: []
};

const l2Resp = daisyAI.respond("What do I do now?", stateL2);
assert(
  l2Resp.text.includes("first fragment is restored") && l2Resp.text.includes("second fragment") && l2Resp.text.includes("person being addressed"),
  "L2 Guidance references restored fragment 1 and introduces consciousness concept",
  l2Resp.text
);
assert(!l2Resp.text.includes("YOU"), "L2 Guidance does NOT leak YOU");

// -------------------------------------------------------------
// 4. LEVEL 3 NEXT-ACTION GUIDANCE
// -------------------------------------------------------------
console.log('\n--- 4. LEVEL 3 NEXT-ACTION GUIDANCE ---');
let stateL3 = {
  playerName: "NISHANTH",
  currentMemoryLevel: 3,
  solvedFragments: ["HAVE", "YOU"],
  oxygenLevel: 55,
  conversationHistory: []
};

const l3Resp = daisyAI.respond("What should I do next?", stateL3);
assert(
  l3Resp.text.includes("Two fragments are stable") && l3Resp.text.includes("third memory") && l3Resp.text.includes("attempted in the past"),
  "L3 Guidance references 2 stable fragments and past attempt sentence",
  l3Resp.text
);
assert(!l3Resp.text.includes("TRIED"), "L3 Guidance does NOT leak TRIED");

// -------------------------------------------------------------
// 5. LEVEL 4 NEXT-ACTION GUIDANCE
// -------------------------------------------------------------
console.log('\n--- 5. LEVEL 4 NEXT-ACTION GUIDANCE ---');
let stateL4 = {
  playerName: "NISHANTH",
  currentMemoryLevel: 4,
  solvedFragments: ["HAVE", "YOU", "TRIED"],
  oxygenLevel: 42,
  conversationHistory: []
};

const l4Resp = daisyAI.respond("What do I do now?", stateL4);
assert(
  l4Resp.text.includes("close") && l4Resp.text.includes("final fragment") && l4Resp.text.includes("failed machine begin again"),
  "L4 Guidance highlights final fragment and machine power cycle concept",
  l4Resp.text
);
assert(!l4Resp.text.includes("REBOOTING"), "L4 Guidance does NOT leak REBOOTING");

// -------------------------------------------------------------
// 6. PASSWORD ASSEMBLY GUIDANCE (ALL 4 RECOVERED)
// -------------------------------------------------------------
console.log('\n--- 6. PASSWORD ASSEMBLY GUIDANCE ---');
let stateAssembly = {
  playerName: "NISHANTH",
  currentMemoryLevel: 4,
  solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
  oxygenLevel: 30,
  conversationHistory: []
};

const assemblyResp = daisyAI.respond("What next?", stateAssembly);
assert(
  assemblyResp.text.includes("remember the fragments now") && assemblyResp.text.includes("sequence matters") && assemblyResp.text.includes("natural"),
  "Assembly Guidance explains sequence ordering without revealing password order",
  assemblyResp.text
);

// -------------------------------------------------------------
// 7. PARTIAL UNDERSTANDING REASONING
// -------------------------------------------------------------
console.log('\n--- 7. PARTIAL UNDERSTANDING REASONING ---');
const partL1 = daisyAI.respond("I think it is something about possession.", stateL1);
assert(
  partL1.text.includes("focusing on the right concept") && partL1.text.includes("narrow it down"),
  "Partial reasoning in L1 validated constructively",
  partL1.text
);

const partL2 = daisyAI.respond("Is it referring to the person reading?", stateL2);
assert(
  partL2.text.includes("on the right track") && partL2.text.includes("person directly receiving"),
  "Partial reasoning in L2 validated constructively",
  partL2.text
);

const partL3 = daisyAI.respond("Is it about trying to fix it?", stateL3);
assert(
  partL3.text.includes("understand the underlying concept") && partL3.text.includes("past-tense word"),
  "Partial reasoning in L3 validated constructively",
  partL3.text
);

// -------------------------------------------------------------
// 8. WRONG ANSWER + WHAT SHOULD I DO COACHING
// -------------------------------------------------------------
console.log('\n--- 8. WRONG ANSWER + WHAT SHOULD I DO COACHING ---');
let stateWrong = {
  playerName: "NISHANTH",
  currentMemoryLevel: 3,
  solvedFragments: ["HAVE", "YOU"],
  oxygenLevel: 50,
  conversationHistory: []
};

const wrongAttempt = daisyAI.respond("Is the word FAILED?", stateWrong);
stateWrong.conversationHistory.push({ user: "Is the word FAILED?", daisy: wrongAttempt.text, topic: "wrong_answer" });

const coachResp = daisyAI.respond("What should I do?", stateWrong);
assert(
  coachResp.text.includes("Don't focus on the result") && coachResp.text.includes("identify the attempt itself"),
  "Wrong answer follow-up coaches how to rethink the clue",
  coachResp.text
);

console.log('\n================================================================');
console.log(`  LEVEL GUIDANCE TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================\n');

if (failCount > 0) process.exit(1);
process.exit(0);
