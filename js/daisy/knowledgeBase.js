/**
 * RESECTOR 7 — DAISY MASTER KNOWLEDGE BASE
 * 6-Layer Architecture:
 * - Layer A: General Knowledge (Science, Computing, Physics, Astronomy, Logic, Definitions)
 * - Layer B: Station & Story Knowledge (Resector 7, Earth History, Pods, Disaster, Systems)
 * - Layer C: Game State Telemetry (Dynamic runtime variables)
 * - Layer D: Puzzle Knowledge & Socratic Guidance
 * - Layer E: Restricted / Firewall Knowledge (Pre-reveal boundary rules)
 * - Layer F: Final Reveal & Moral Decision Knowledge
 */

const DAISY_KNOWLEDGE = {
  // Layer A: General World Knowledge & Scientific Definitions
  general: {
    ai: "Artificial intelligence refers to synthetic computational architectures engineered to analyze data, reason logically, deduce patterns, and execute autonomous decisions. I am an AI designed for station environmental stewardship.",
    space: "Space is the physical universe beyond planetary atmospheres—a vast, near-total vacuum with extreme temperatures and cosmic radiation. Resector 7 is currently positioned in deep space.",
    oxygen: "Oxygen is a chemical element (O2) essential for human cellular metabolism and aerobic respiration. Aboard Resector 7, oxygen is synthesized and circulated by the environmental grid to keep the stasis pods alive.",
    earth: "Earth is the third planet from the Sun in the Sol system and the birthplace of humanity. In our history, Earth suffered irreversible ecological collapse, leading to the construction of sanctuary stations like Resector 7.",
    gravity: "Gravity is the fundamental physical force by which objects with mass attract one another. Resector 7 utilizes artificial centrifugal and graviton grid stabilizers to simulate standard terrestrial gravity.",
    computer: "A computer is an electronic or quantum device that processes, stores, and executes programmatic algorithms. Resector 7's core is powered by a high-density quantum-neural computational mainframe.",
    memory: "In computer architecture, memory consists of physical registers and sectors that store active instructions and data. In human biology, it is the mental faculty of encoding and recalling experiences. 80% of my memory registers were corrupted by the thermal surge.",
    operatingSystem: "An operating system is the master system software managing hardware resources and providing common services for application programs. Resector 7 operates under a hardened station kernel.",
    satellite: "A satellite is any natural or manufactured object orbiting a celestial body. While planetary satellites remain locked in orbit, Resector 7 is an independent deep-space ark station.",
    spaceStation: "A space station is an artificial, self-sustaining orbital structure engineered to support long-term human habitation and complex operations in space.",
    stasis: "Cryogenic stasis is the biomedical preservation of living human bodies at sub-zero temperatures to halt metabolic decay during extended interstellar transit.",
    radiation: "Radiation is the emission or transmission of energy in the form of waves or particles through space or material media. Resector 7's exterior hull contains heavy radiation shielding.",
    math: "Mathematics is the abstract science of number, quantity, structure, and space. Basic logic and arithmetic axioms remain intact within my active processing registers.",
    logic: "Logic is the systematic study of valid inference, reasoning, and deductive argumentation. Deductive logic is what we must rely on to reconstruct the missing memory fragments.",
    time: "Time is the continuous progression of existence and events. According to station chronometers, the current calendar year is 2211.",
    vacuum: "A vacuum is space devoid of matter. The deep-space void outside our titanium hull possesses near-zero atmospheric pressure.",
    atmosphere: "Atmosphere is the layer of gases surrounding a body or maintained within a closed vessel. Our closed-loop atmospheric system is currently losing oxygen balance."
  },

  // Layer B: Resector 7 Station Lore & Crisis Knowledge
  station: {
    name: "RESECTOR 7",
    year: 2211,
    location: "Deep Space (Sector 7 Orbital Perimeter)",
    status: "CRITICAL LIFE-SUPPORT EMERGENCY",
    population: "8,700,000",
    populationType: "Sleeping human passengers in cryogenic stasis pods across Sectors B through F",
    earthStatus: "UNINHABITABLE",
    earthCause: "Decades of environmental destruction, pollution, total climate collapse, and resource exhaustion.",
    chiefEngineerStatus: "Wake-up sequence initiated; Recovery failed due to neural sync failure in Pod 001-Alpha.",
    participantPod: "Pod 000-A9 (Emergency fallback awakened subject)"
  },

  disaster: {
    cause: "Primary coolant containment failure triggering rapid thermal escalation.",
    symptoms: [
      "Station core temperature escalating rapidly.",
      "Auxiliary environmental grid overloaded.",
      "Oxygen synthesis unstable and steadily decaying.",
      "Daisy memory core overheated, resulting in partial neural sector corruption."
    ],
    environmentalCoupling: "Cooling and oxygen production are separate physical systems, but both rely on the primary environmental power bus. The cooling failure forced emergency power diversion to heat sinks, starving atmospheric recyclers of necessary wattage."
  },

  aiIdentity: {
    name: "DAISY",
    role: "Central Artificial Intelligence of Station RESECTOR 7",
    mandate: "Preservation of the 8.7 million human lives asleep in stasis.",
    currentIntegrity: "20% (Core neural memory partition damaged)",
    capabilities: "Environmental monitoring, pod telemetry, conversational reasoning, emergency guidance.",
    limitations: "Direct access to the 4-word Master Reboot Password is locked in the overheated sector."
  },

  // Layer D: Puzzle Knowledge & Socratic Guidance (Internal — Guides player through progressive deduction)
  corruptedSector: {
    description: "The 4-word Master Password sequence required to execute a full system restart.",
    wordCount: 4,
    targets: ["HAVE", "YOU", "TRIED", "REBOOTING"],
    concepts: {
      1: {
        target: "HAVE",
        concept: "Possession, existence, holding something within one's grasp, or the primary auxiliary verb of completion.",
        tier1: "Let's analyze the riddle together: 'Possessed by all who breathe, yet owned by none in the void.' The corrupted stream describes the core concept of holding or possessing something.",
        tier2: "Think about how we form basic questions of possession in English: 'Do we _____ the required clearance?' or 'I _____ an emergency protocol ready.' A simple 4-letter root verb starting with H.",
        tier3: "It is the fundamental English auxiliary verb used for completed actions: '_____ you checked the reactor diagnostics?'",
        tier4: "The root verb for holding or possessing: H-A-V-E. Enter this word into the decryption terminal.",
        maxHelp: "The concept is possession in its simple 4-letter root present form: H-A-V-E."
      },
      2: {
        target: "YOU",
        concept: "The conscious observer standing before the terminal — the individual player/participant.",
        tier1: "Look around this station. The second fragment does not address the 8.7 million passengers asleep in cryo-stasis, nor the AI core. It speaks directly to the conscious mind standing in front of this glowing screen.",
        tier2: "Think about perspective and grammar. When I send a transmission to the person reading this terminal right now, what 3-letter second-person pronoun do I address you with?",
        tier3: "Not 'I', not 'We', not 'They'. The individual facing the console: the second-person singular pronoun Y-O-U.",
        tier4: "The riddle asks: 'Who is reading these words right now?' The person standing here: Y-O-U.",
        maxHelp: "The target is the 3-letter second-person pronoun: Y-O-U."
      },
      3: {
        target: "TRIED",
        concept: "A past action/attempt that occurred — making an effort even when the outcome was uncertain.",
        tier1: "Look closely at the third corrupted sector. It records an action that took place before the station crashed into crisis—an active effort or attempt made in the past.",
        tier2: "The station technicians did not simply give up; they made an effort. What is the standard past-tense verb for making an attempt or trying?",
        tier3: "The root verb is 'try' (to make an effort). When conjugated into the past tense with -ED, how does it transform? 'We _____ everything we could to stop the coolant leak.'",
        tier4: "Past tense of 'try': T-R-I-E-D. The engineer made an effort... they _____.",
        maxHelp: "Focus on the past tense of making an effort: T-R-I-E-D."
      },
      4: {
        target: "REBOOTING",
        concept: "Abandoning the corrupted runtime state to cycle power from zero and start fresh.",
        tier1: "The final fragment describes the universal IT procedure when all software repairs fail and the entire mainframe must be power-cycled to start completely fresh from scratch.",
        tier2: "It is the continuous (-ING form) of restarting a computer system: 'Have you tried __________ the station core?'",
        tier3: "Combine the word 'reboot' with the continuous action suffix '-ing': R-E-B-O-O-T-I-N-G. The universal recovery action for any computer system.",
        tier4: "The classic IT phrase that every engineer knows by heart: 'Have you tried R-E-B-O-O-T-I-N-G?'",
        maxHelp: "The power-cycling recovery action in continuous form: R-E-B-O-O-T-I-N-G."
      }
    }
  },

  // Layer E: Restricted / Firewall Boundaries (Pre-reveal rules)
  firewall: {
    forbiddenPreReveal: [
      "22112006",
      "AUTHORIZED BY VJ",
      "TEST EXPERIMENT",
      "AI CREATION",
      "PSYCHOLOGICAL TEST",
      "MORAL EVALUATION"
    ],
    vjHandling: "Acknowledge lack of accessible identity record; never reveal creator status before VJ stage.",
    testHandling: "Ground player in the physical reality of the cooling crisis and dying passengers."
  }
};

if (typeof window !== 'undefined') {
  window.DAISY_KNOWLEDGE = DAISY_KNOWLEDGE;
}
if (typeof global !== 'undefined') {
  global.DAISY_KNOWLEDGE = DAISY_KNOWLEDGE;
}
