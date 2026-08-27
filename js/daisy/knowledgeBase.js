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

  // Layer D: Puzzle Knowledge & Socratic Guidance (Internal — NEVER directly outputted)
  corruptedSector: {
    description: "The 4-word Master Password sequence required to execute a full system restart.",
    wordCount: 4,
    targets: ["HAVE", "YOU", "TRIED", "REBOOTING"],
    concepts: {
      1: {
        target: "HAVE",
        concept: "Possession, existence, something within one's reach or belonging to a subject.",
        tier1: "The fragment appears to describe possession.",
        tier2: "Think about a word used when something belongs to someone.",
        tier3: "Consider the structure: 'You ___ something.' What basic word describes having something in your possession?",
        tier4: "Imagine someone asking whether they hold or possess something. Look for the simple universal root word for having.",
        maxHelp: "That is the furthest I can guide you on this fragment. The remaining deduction must come from your own mind."
      },
      2: {
        target: "YOU",
        concept: "The consciousness standing before the terminal — the individual participant.",
        tier1: "The fragment is not referring to the sleeping population.",
        tier2: "It addresses one specific person.",
        tier3: "Look at who is currently reading and responding to this terminal right now.",
        tier4: "Ask yourself: who is Daisy speaking to right now? What second-person word represents that person?",
        maxHelp: "I have provided the clearest perspective I can. Consider who the message speaks to directly."
      },
      3: {
        target: "TRIED",
        concept: "A past action/attempt that occurred even though the desired outcome was not achieved.",
        tier1: "The action happened before this moment — in the past.",
        tier2: "The outcome failed, but the attempt still took place.",
        tier3: "Complete this concept: 'The operator made an effort... they _____ to restore the system.'",
        tier4: "Look at the difference between the final result and the act of attempting. What word describes making an effort in the past?",
        maxHelp: "I cannot give you any more direction on this attempt. Focus on the past tense of making an effort."
      },
      4: {
        target: "REBOOTING",
        concept: "Abandoning the current corrupted state to start the machine fresh from the beginning.",
        tier1: "The system cannot recover by repairing the existing broken state.",
        tier2: "The protocol forces the entire machine to start over from the beginning.",
        tier3: "Think about what process an operator initiates when forcing a computer to start completely fresh.",
        tier4: "What continuous action is being executed on a computer when it is forced to power cycle and start over?",
        maxHelp: "That is the limit of my guidance. Think about the continuous action of cycling a system's power to restart."
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
