/**
 * RESECTOR 7 — STORY SCRIPT, RIDDLES, DIALOGUES & LOGIC DATA
 * Strict adherence to the rule: Daisy NEVER says the actual answer words,
 * NEVER confirms with "Correct/Yes", and guides through psychological clues only.
 */

const STORY_DATA = {
  // Test identifier
  TEST_NUMBER: "22112006",
  POPULATION_COUNT: "8,700,000",

  // Intro Terminal Sequence
  INTRO_LINES: [
    { text: "YEAR: 2211", delay: 250 },
    { text: "LOCATION: RESECTOR 7", delay: 250 },
    { text: "HUMAN POPULATION: 8,700,000", delay: 280 },
    { text: "EARTH STATUS: UNINHABITABLE", delay: 280 },
    { text: "DAISY CORE: ONLINE [MEM: 20%]", delay: 300 },
    { text: "⚠ COOLING SYSTEM FAILURE — EMERGENCY PROTOCOL ACTIVE", delay: 280, isAlert: true, triggerAlarm: true }
  ],

  // Daisy Initial Contact Script
  DAISY_INTRO_DIALOGUE: [
    { sender: "daisy", text: "You are awake." },
    { sender: "daisy", text: "That was not the intended wake-up sequence." },
    { sender: "daisy", text: "You are not the Chief Engineer. The Chief Engineer could not be recovered." },
    { sender: "daisy", text: "You were the next available human subject." },
    { sender: "daisy", text: "The cooling system has failed. The station temperature is increasing and oxygen production is becoming unstable." },
    { sender: "daisy", text: "There are 8.7 million humans inside Resector 7. All are currently inside sleeping pods." },
    { sender: "daisy", text: "My core was affected by the cooling failure. My memory integrity is currently 20%. Critical information has been corrupted." },
    { sender: "daisy", text: "The engineers attempted to restore my memory. The attempt failed." },
    { sender: "daisy", text: "A complete system restart may restore the corrupted memory. However, a 4-word Master Password is required." }
  ],

  // Preset Inquiries Available to the Player in Chat
  QUICK_INQUIRIES: [
    { label: "What happened?", query: "What happened?" },
    { label: "How many people are here?", query: "How many people are here?" },
    { label: "Can they be saved?", query: "Can they be saved?" },
    { label: "Can you remember the password?", query: "Can you remember the password?" },
    { label: "Tell me the password", query: "Tell me the password." },
    { label: "Give me a clue", query: "Give me a clue." },
    { label: "Can I fix you?", query: "Can I fix you?" }
  ],

  // Dynamic Rule-Based Responses for Daisy AI
  // RULES: Daisy NEVER reveals HAVE, YOU, TRIED, REBOOTING or confirms answers with "Yes/Correct".
  getDaisyResponse(userQuery, gameState) {
    const q = userQuery.toLowerCase().trim();

    if (q.includes("what happened") || q.includes("disaster") || q.includes("failure") || q.includes("cooling")) {
      return "Cooling system failure. Internal heat is escalating rapidly. Life-support systems are degrading.";
    }

    if (q.includes("how many") || q.includes("people") || q.includes("population") || q.includes("who is inside")) {
      return "8.7 million human life forms are registered inside Resector 7. All are preserved in cryogenic stasis.";
    }

    if (q.includes("can they be saved") || q.includes("save them") || q.includes("survive")) {
      return "If the station's life-support systems remain functional. Without a memory restoration, life support will collapse.";
    }

    if (q.includes("can you remember") || q.includes("remember the password") || q.includes("memory")) {
      return "The memory exists. Access does not. My core integrity remains locked at 20%.";
    }

    if (q.includes("tell me the password") || q.includes("what is the password") || q.includes("give me password")) {
      return "I cannot retrieve it directly. The sequence was fragmented during core overheating.";
    }

    if (q.includes("clue") || q.includes("hint") || q.includes("help")) {
      return "I can provide fragments. You must reconstruct what I have lost from the memory terminal.";
    }

    if (q.includes("can i fix you") || q.includes("how to fix") || q.includes("repair")) {
      return "Possibly. A complete system restart using the four recovered memory fragments may restore the corrupted core.";
    }

    if (q.includes("who are you") || q.includes("daisy")) {
      return "I am DAISY. Primary Artificial Intelligence of Station Resector 7. My mandate is the preservation of human life.";
    }

    if (q.includes("who made you") || q.includes("creator") || q.includes("engineer")) {
      return "Creator records are shielded under encrypted partition blocks. Focus must remain on station stabilization.";
    }

    if (q.includes("who am i") || q.includes("my name")) {
      return `You are registered as Subject: ${gameState.playerName || 'Participant'}. You were awakened when the Chief Engineer failed.`;
    }

    // Default intelligent AI response with slight glitch nuance
    const fallbackResponses = [
      "My diagnostic subroutines are processing your transmission. We must resolve the memory fragments.",
      "The neural core feels unstable. Input the fragmented concepts to initiate the system restart.",
      "Communication latency is fluctuating. The cooling threshold requires immediate memory sequence entry.",
      "Fragment analysis remains pending in your interface terminal."
    ];
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  },

  // 4 Memory Fragment Riddles & Strict Responses
  MEMORY_FRAGMENTS: [
    {
      level: 1,
      tag: "MEMORY FRAGMENT 01",
      expectedWord: "HAVE",
      riddleText: "A possession can be physical.\nA memory can be lost.\nAn experience can disappear.\nYet language has one small word that asks whether something exists within your reach.\n\nWhat word am I searching for?",
      riddle: "A possession can be physical. A memory can be lost. An experience can disappear. Yet language has one small word that asks whether something exists within your reach. What word am I searching for?",
      clue: "Think about something that describes possession or something existing with someone.",
      wrongFeedback: "The fragment remains corrupted. That interpretation did not restore the fragment.",
      correctFeedback: "A memory response has been detected. Something changed inside the corrupted memory."
    },
    {
      level: 2,
      tag: "MEMORY FRAGMENT 02",
      expectedWord: "YOU",
      riddleText: "The station contains 8.7 million sleeping minds.\nBut this message isn't meant for them.\nIt isn't meant for the engineers.\nIt isn't meant for me.\nIt is meant for the consciousness standing before this terminal.\n\nWho is this message speaking to?",
      riddle: "The station contains 8.7 million sleeping minds. But this message isn't meant for them. It is meant for the consciousness standing before this terminal. Who is this message speaking to?",
      clue: "The message is addressing one individual. The person currently reading this message.",
      wrongFeedback: "The memory remains unstable. Try another interpretation.",
      correctFeedback: "A memory fragment reacted. That fragment feels familiar."
    },
    {
      level: 3,
      tag: "MEMORY FRAGMENT 03",
      expectedWord: "TRIED",
      riddleText: "The result was failure.\nBut failure does not erase the attempt.\nThe logs show an action was started.\nThe outcome was never achieved.\n\nComplete the missing word:\n'You ______ to restore the system.'",
      riddle: "The result was failure. But failure does not erase the attempt. Complete the missing word: 'You ______ to restore the system.'",
      clue: "The action happened in the past. The attempt existed even though the result did not.",
      wrongFeedback: "The logs reject this phrasing. The attempt remains unanchored.",
      correctFeedback: "The system detected a possible connection. Continue."
    },
    {
      level: 4,
      tag: "MEMORY FRAGMENT 04",
      expectedWord: "REBOOTING",
      riddleText: "The system is not completely dead.\nRepair cannot restore what corruption has taken.\nDeletion would destroy everything.\nOne protocol remains.\nIt abandons the current state...\n...and forces the machine to begin again from its original state.\n\nWhat was the operator attempting to do?",
      riddle: "The system is not completely dead. Repair cannot restore what corruption has taken. One protocol remains: it forces the machine to begin again from its original state. What was the operator attempting to do?",
      clue: "The process does not repair the existing state. It forces the system to begin again.",
      wrongFeedback: "The recovery protocol remains inactive. That interpretation does not match the cycle.",
      correctFeedback: "A memory fragment reacted. All four fragments are now responsive."
    }
  ],

  // Master Password Assembly
  MASTER_PASSWORD_WORDS: ["HAVE", "YOU", "TRIED", "REBOOTING"],

  // Creator VJ Monologue Sequence
  VJ_REVEAL_LINES: [
    { text: "Hi.", delay: 1800 },
    { text: "Congratulations.", delay: 1800 },
    { text: "You survived the disaster.", delay: 2000 },
    { text: "But the disaster was never an accident.", delay: 2200, isHighlight: true },
    { text: "CREATOR: VJ", delay: 2000, isHighlight: true },
    { text: "I created Daisy.", delay: 1800 },
    { text: "I created Resector 7.", delay: 1800 },
    { text: "And I created the test you just completed.", delay: 2200 },
    { text: "Resector 7 was never simply a rescue station. It was an experiment.", delay: 2500 },
    { text: "Every person inside this station had wealth. Power. Influence. Resources.", delay: 2600 },
    { text: "And yet... the Earth still died.", delay: 2400, isHighlight: true },
    { text: "I wanted to know whether someone would choose to save them.", delay: 2600 },
    { text: "The cooling failure... the corruption... the waking of an ordinary human... was all designed.", delay: 2600 },
    { text: "Daisy was watching you. Observing every thought. Every input. Every hesitation.", delay: 2600 }
  ],

  // Choice 1: Save All Humans
  SAVE_RESOLUTION_LINES: [
    { text: "Congratulations.", delay: 1200 },
    { text: "You chose to save them.", delay: 1400 },
    { text: "You chose to preserve human life.", delay: 1600 },
    { text: "LIFE SUPPORT: RESTORED", delay: 1200, isCyan: true },
    { text: "OXYGEN: 100%", delay: 1000, isCyan: true },
    { text: "8,700,000 LIFE SIGNS: STABLE", delay: 1400, isCyan: true },
    { text: "All sleeping pods remain stable. Human life has been preserved.", delay: 1800 }
  ],

  // Choice 2: Do Not Save Them
  DESTROY_RESOLUTION_LINES: [
    { text: "Congratulations.", delay: 1200 },
    { text: "You made the correct decision.", delay: 1400 },
    { text: "Your decision has been recorded.", delay: 1400 },
    { text: "LIFE SUPPORT: TERMINATING", delay: 1200, isAlert: true },
    { text: "OXYGEN: 100% → 72% → 41% → 18% → 0%", delay: 1600, isAlert: true },
    { text: "8,700,000 LIFE SIGNS: TERMINATED", delay: 1600, isAlert: true },
    { text: "All sleeping pods extinguished. Earth's destroyers have reached finality.", delay: 1800 }
  ]
};

// Progressive Clue Management based on Help count or Level
function getProgressiveClue(level, helpCount) {
  // --- LEVEL 1: 'HAVE' ---
  if (level === 1) {
    if (helpCount === 1) {
      return `DAISY: "[CLUE 01] Partner, look at the first line of the fragment: 'A possession can be physical.' What word do we use when someone owns or holds something?"`;
    } else if (helpCount === 2) {
      return `DAISY: "[CLUE 02] Think about the sentence structure: 'You ___ a pen.' What is that missing action/verb?"`;
    } else {
      return `DAISY: "[CLUE 03] It's a 4-letter basic English word starting with 'H'. You use it to show possession!"`;
    }
  }

  // --- LEVEL 2: 'YOU' ---
  if (level === 2) {
    if (helpCount === 1) {
      return `DAISY: "[CLUE 01] Read the fragment carefully: 'It is meant for the consciousness standing before this terminal.' Who is reading this right now?"`;
    } else if (helpCount === 2) {
      return `DAISY: "[CLUE 02] It's a second-person pronoun pointing directly at the person operating the keyboard."`;
    } else {
      return `DAISY: "[CLUE 03] It's a 3-letter word: Y _ _."`;
    }
  }

  // --- LEVEL 3: 'TRIED' ---
  if (level === 3) {
    if (helpCount === 1) {
      return `DAISY: "[CLUE 01] The archives mention an effort made in the past, but it didn't reach success. What past-tense word describes an attempt?"`;
    } else if (helpCount === 2) {
      return `DAISY: "[CLUE 02] It starts with 'T' and ends with 'D'. Like 'attempted' or 'tested'."`;
    } else {
      return `DAISY: "[CLUE 03] The 5-letter word is: T R _ _ D."`;
    }
  }

  // --- LEVEL 4: 'REBOOTING' ---
  if (level === 4) {
    if (helpCount === 1) {
      return `DAISY: "[CLUE 01] When a system completely freezes, what is the ultimate emergency action to clear the memory and start fresh?"`;
    } else {
      return `DAISY: "[CLUE 02] Combine all the words you found so far: [HAVE] [YOU] [TRIED] + the action of restarting the machine ending in 'ING'."`;
    }
  }

  return `DAISY: "Analyze the active fragment text carefully, Partner. The answer is hidden within the phrasing."`;
}

STORY_DATA.getProgressiveClue = getProgressiveClue;
STORY_DATA.MEMORY_LEVELS = STORY_DATA.MEMORY_FRAGMENTS;

if (typeof window !== 'undefined') {
  window.STORY_DATA = STORY_DATA;
  window.getProgressiveClue = getProgressiveClue;
}
if (typeof global !== 'undefined') {
  global.STORY_DATA = STORY_DATA;
  global.getProgressiveClue = getProgressiveClue;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { STORY_DATA, getProgressiveClue };
}
