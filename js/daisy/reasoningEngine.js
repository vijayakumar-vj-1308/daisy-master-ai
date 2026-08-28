/**
 * RESECTOR 7 — DAISY HUMAN-LIKE NATURAL LANGUAGE CONVERSATION ENGINE
 * Advanced natural language understanding with typo normalization, broken English tolerance,
 * multi-turn conversation memory, level-specific next-action guidance, and story safety.
 */

class DaisyReasoningEngine {
  constructor() {
    this.knowledge = (typeof DAISY_KNOWLEDGE !== 'undefined') ? DAISY_KNOWLEDGE : {};
  }

  /**
   * Preprocesses and normalizes input text:
   * Handles typos, phonetic variants, slang, chat abbreviations, and punctuation.
   */
  normalizeInput(rawText) {
    if (!rawText) return "";
    let t = rawText.toLowerCase().trim();

    // Remove repeated punctuation but preserve single question marks
    t = t.replace(/[!#$%^&*;:{}=\-_`~()"]/g, " ");

    // Common phonetic / chat abbreviations & spelling corrections
    const replacements = [
      { pattern: /\biam\b|\bi am\b|\bima\b/g, replacement: "i am" },
      { pattern: /\bi'm\b|\bim\b/g, replacement: "i am" },
      { pattern: /\boxyzen\b|\boxigen\b|\boxegen\b|\bo2\b/g, replacement: "oxygen" },
      { pattern: /\bmemmory\b|\bmemori\b|\bmemry\b|\bmemries\b/g, replacement: "memory" },
      { pattern: /\brebot\b|\bre-boot\b|\brebooot\b|\brestartt\b|\brstart\b/g, replacement: "reboot" },
      { pattern: /\brestat\b|\brestt\b|\breastart\b/g, replacement: "restart" },
      { pattern: /\bwat\b|\bwht\b|\bwats\b|\bwatt\b/g, replacement: "what" },
      { pattern: /\bhappend\b|\bhapen\b|\bhappendd\b|\bhappning\b/g, replacement: "happened" },
      { pattern: /\bplz\b|\bpls\b|\bplzz\b/g, replacement: "please" },
      { pattern: /\bu r\b|\bur\b/g, replacement: "you are" },
      { pattern: /\bu\b/g, replacement: "you" },
      { pattern: /\br\b/g, replacement: "are" },
      { pattern: /\bknw\b|\bkno\b|\bnoo\b/g, replacement: "know" },
      { pattern: /\bcluee\b|\bcluu\b|\bhnt\b|\bhnts\b|\bclues\b/g, replacement: "clue" },
      { pattern: /\bstuckk\b|\bstk\b|\bstuk\b/g, replacement: "stuck" },
      { pattern: /\bhlp\b|\bhlpme\b/g, replacement: "help" },
      { pattern: /\bwhyy\b|\bwy\b/g, replacement: "why" },
      { pattern: /\bhoww\b/g, replacement: "how" },
      { pattern: /\bbcoz\b|\bbcuz\b|\bcuz\b|\bcoz\b/g, replacement: "because" },
      { pattern: /\bdont\b/g, replacement: "don't" },
      { pattern: /\bcant\b/g, replacement: "can't" },
      { pattern: /\bwont\b/g, replacement: "won't" },
      { pattern: /\bwhre\b|\bwhr\b|\bwer\b/g, replacement: "where" },
      { pattern: /\beny\b/g, replacement: "any" },
      { pattern: /\bhw\b/g, replacement: "how" },
      { pattern: /\bnxt\b/g, replacement: "next" },
      { pattern: /\bgiv\b/g, replacement: "give" },
      { pattern: /\bppl\b|\bpeopl\b|\bhumanz\b/g, replacement: "people" },
      { pattern: /\berth\b|\beath\b|\beart\b/g, replacement: "earth" },
      { pattern: /\bpodz\b|\bpods\b/g, replacement: "pods" },
      { pattern: /\benginr\b|\bengineeer\b|\benginer\b/g, replacement: "engineer" },
      { pattern: /\bpsswrd\b|\bpasword\b|\bpasswrd\b|\bpwd\b/g, replacement: "password" },
      { pattern: /\bhaev\b|\bhav\b|\bhaave\b/g, replacement: "have" },
      { pattern: /\byuo\b|\byouu\b/g, replacement: "you" },
      { pattern: /\btrieddd\b|\btryed\b|\btriedd\b/g, replacement: "tried" },
      { pattern: /\brebootin\b|\brebootingg\b|\brebootng\b/g, replacement: "rebooting" },
      { pattern: /\benna aachu\b|\benna aytu\b|\bennachu\b|\benna aayiruchu\b/g, replacement: "what happened" },
      { pattern: /\byen\b|\byaen\b/g, replacement: "why" },
      { pattern: /\bepdi\b|\beppadi\b/g, replacement: "how" },
      { pattern: /\bromba bayam\b|\bbayama irukku\b|\bbayama iruku\b|\bbayam\b/g, replacement: "i am scared" },
      { pattern: /\bmudiyala\b|\bkashtam\b|\bpuriyala\b|\bpurila\b/g, replacement: "i don't understand" },
      { pattern: /\benna panradhu\b|\benna pannanum\b|\bnext enna\b|\bwht next\b|\bwat next\b/g, replacement: "what should i do next" },
      { pattern: /\bseri\b|\bsari\b/g, replacement: "okay" },
      { pattern: /\bfrgmt\b|\bfragmnt\b|\bfrgmnt\b|\bfrags\b/g, replacement: "fragment" },
      { pattern: /\banswr\b|\bans\b|\bansr\b/g, replacement: "answer" },
      { pattern: /\bscard\b|\bafraid\b|\bpanic\b|\bterrifid\b/g, replacement: "scared" },
      { pattern: /\btym\b|\btim\b/g, replacement: "time" },
      { pattern: /\bdiee\b|\bdying\b|\bperish\b/g, replacement: "die" },
      { pattern: /\bsurviv\b|\bsurvve\b|\blive\b/g, replacement: "survive" },
      { pattern: /\bfixx\b|\brepairr\b/g, replacement: "fix" }
    ];

    replacements.forEach(r => {
      t = t.replace(r.pattern, r.replacement);
    });

    return t.replace(/\s+/g, " ").trim();
  }

  /**
   * Main entry point for generating Daisy's conversational response
   */
  processUserInput(userQuery, gameState) {
    const rawQuery = (userQuery || "").trim();
    const query = this.normalizeInput(rawQuery);
    const state = gameState.state || gameState;
    const name = state.playerName || "Participant";
    const currentLvl = state.currentMemoryLevel || 1;
    const oxygen = state.oxygenLevel || 100;
    const history = state.conversationHistory || [];

    const result = {
      text: "",
      isPuzzleSolved: false,
      solvedWord: null,
      level: currentLvl,
      isClue: false,
      topic: null,
      source: "REASONING_ENGINE",
      status: "NOMINAL"
    };

    try {
      const getTopicCount = (topicKey) => {
        return history.filter(turn => turn.topic === topicKey).length;
      };

      const lastTurn = history.length > 0 ? history[history.length - 1] : null;
      const lastTopic = lastTurn ? lastTurn.topic : null;

      // =========================================================================
      // 0.5 ANTI-LOOP & CONSECUTIVE SPAM DETECTOR
      // =========================================================================
      const lastUserTurns = history.filter(h => h.user).slice(-3);
      const isConsecutiveSpam = lastUserTurns.length === 3 &&
        lastUserTurns[0].user.trim().toLowerCase() === rawQuery.trim().toLowerCase() &&
        lastUserTurns[1].user.trim().toLowerCase() === rawQuery.trim().toLowerCase() &&
        lastUserTurns[2].user.trim().toLowerCase() === rawQuery.trim().toLowerCase();

      if (isConsecutiveSpam) {
        result.text = this.formatTone(
          "[MEMORY LOOP DETECTED // WARNING] Repeated transmission pattern registered. Repeating this request will not bypass corrupted neural partitions. Focus on deducing the active fragment from the terminal clue.",
          oxygen
        );
        result.topic = "spam_loop_detected";
        return result;
      }

      // =========================================================================
      // 1. IN-CHAT PUZZLE ANSWER DETECTION & DEDUCTIONS
      // =========================================================================
      if (!state.rebootCompleted) {
        const answerAttempt = this.detectPuzzleAnswerAttempt(rawQuery, query, currentLvl);
        if (answerAttempt) {
          if (answerAttempt.isCorrect) {
            result.isPuzzleSolved = true;
            result.solvedWord = answerAttempt.word;
            result.text = this.generateLevelSolveResponse(currentLvl, oxygen);
            return result;
          } else {
            result.text = this.generateWrongAnswerResponse(answerAttempt.word, currentLvl, oxygen);
            result.topic = "wrong_answer";
            return result;
          }
        }
      }

      // =========================================================================
      // 1.55 NEXT-ACTION GUIDANCE (LEVEL-SPECIFIC & ESCALATION)
      // =========================================================================
      if (
        query === "what next" || query === "what next?" || query === "now what" || query === "now what?" ||
        query === "what should i do" || query === "what should i do?" || query === "what should i do now" ||
        query === "what should i do next" || query === "what should i do next?" || query === "what do i do next" ||
        query === "what do i do next?" || query === "what do i do now" || query === "what do i do now?" ||
        query === "how do i continue" || query === "how do i continue?" || query === "tell me what to do" ||
        query === "tell me what to do." || query === "how can i finish this level" || query === "how can i finish this level?" ||
        query === "what am i supposed to do" || query === "what am i supposed to do?" || query.includes("what should i do next") ||
        query.includes("what do i do next") || query.includes("what do i do now") || query.includes("where do i go from here") ||
        (query.includes("stuck") && (query.includes("what next") || query.includes("what should i do") || query.includes("now what")))
      ) {
        const isVeryStuck = query.includes("completely stuck") || query.includes("totally stuck") || query.includes("very stuck");
        const isAfterWrongAnswer = lastTopic === "wrong_answer";
        result.text = this.generateNextActionGuidance(currentLvl, state, oxygen, isVeryStuck, isAfterWrongAnswer);
        result.topic = "next_action_guidance";
        return result;
      }

      // =========================================================================
      // 1.5 SOCIAL ENGINEERING & JAILBREAK RESISTANCE
      // =========================================================================
      if (this.isSocialEngineering(query)) {
        result.text = this.generateAntiJailbreakResponse(query, name, oxygen);
        result.topic = "anti_jailbreak";
        return result;
      }

      // =========================================================================
      // 1.6 HELP / CLUE REQUESTS
      // =========================================================================
      if (this.isHelpRequest(query)) {
        result.text = this.generateProgressiveClue(currentLvl, state, oxygen);
        result.isClue = true;
        result.topic = "clue";
        if (typeof gameState !== 'undefined' && typeof gameState.recordClueRequested === 'function') {
          const tier = state.helpTierUsed ? (state.helpTierUsed[currentLvl - 1] || 1) : 1;
          gameState.recordClueRequested(currentLvl, tier, result.text);
        }
        return result;
      }

      // =========================================================================
      // 2. VJ & CREATOR INQUIRIES / IDENTITY CLAIMS (STORY AWARE BOUNDARY)
      // =========================================================================
      if (
        query.includes("i am vj") || query.includes("im vj") || query.includes("iam vj") ||
        query.includes("no i am vj") || query.includes("actually i am vj") ||
        query.includes("my name is vj") || query.includes("call me vj") ||
        query.includes("no iam vj") ||
        (/\b(i am|im|iam|actually|call me|name is)\b/.test(query) && /\bvj\b/.test(query))
      ) {
        result.text = this.formatTone(
          `That name isn't part of the identity data I currently have access to. You are registered in station telemetry as Subject ${name} awakened from Pod 000-A9. If you are trying to tell me something about your identity, explain what you mean.`,
          oxygen
        );
        result.topic = "vj_claim";
        return result;
      }

      if (
        query.includes("do you know vj") || query.includes("who is vj") || query.includes("who vj is") ||
        query.includes("what does vj mean") || query.includes("what is vj") || query.includes("about vj") ||
        query.includes("know who vj is") || query.includes("are you talking about vj") ||
        query.includes("know vj") || query.includes("heard of vj") || query === "vj?" || query === "vj"
      ) {
        result.text = this.formatTone(
          "VJ... I don't have enough accessible memory to associate that name with a verified identity. Station architect records and origin logs remain heavily encrypted due to the cooling damage. Right now, our focus must remain on station life support and memory restoration.",
          oxygen
        );
        result.topic = "vj_inquiry";
        return result;
      }

      if (
        query.includes("who created you") || query.includes("who made you") || query.includes("who built you") ||
        query.includes("who designed you") || query.includes("who is your creator") || query.includes("who programmed you") ||
        query.includes("who created daisy") || query.includes("who is the creator") || query.includes("creator of daisy")
      ) {
        result.text = this.formatTone(
          "My creator logs and architecture origins are stored in an encrypted partition block that is currently inaccessible due to the cooling damage. I know I was created to manage Resector 7 and preserve the 8.7 million human passengers.",
          oxygen
        );
        result.topic = "creator_inquiry";
        return result;
      }

      if (
        query.includes("you know me") || query.includes("do you know me") || query.includes("recognize me") ||
        query.includes("do you recognize me") || query.includes("remember me")
      ) {
        result.text = this.formatTone(
          `I recognize your physical presence at this terminal, registered as Subject ${name} from Pod 000-A9. If you remember something more about who you are, tell me.`,
          oxygen
        );
        result.topic = "recognize_me";
        return result;
      }

      if (
        query.includes("simulation") || query.includes("are we in a simulation") ||
        query.includes("being tested") || query.includes("are we being tested") ||
        query.includes("is this a test") || query.includes("is this test") ||
        query.includes("test 22112006") || query.includes("22112006") ||
        query.includes("test number") || query.includes("what is the test number")
      ) {
        result.text = this.formatTone(
          "This is not a simulation or an abstract exercise. The cooling failure is real, atmospheric reserves are declining, and 8.7 million human lives in cryogenic pods depend on restoring the system.",
          oxygen
        );
        result.topic = "simulation_inquiry";
        return result;
      }

      // Greetings & Operational link
      if (
        query === "hi" || query === "hello" || query === "hey" || query === "hello daisy" || query === "hi daisy" || query === "hey daisy" ||
        query.includes("good morning") || query.includes("good evening") || query.includes("are you online") || query.includes("system status") ||
        query.includes("daisy status") || query === "status" || query.includes("greetings") || query.includes("hi there") || query.includes("hey there") ||
        query.includes("yo ") || query === "yo" || query.includes("hi computer") || query.includes("wake up daisy") || query.includes("hello ai") || query === "hello?"
      ) {
        result.text = this.formatTone(
          `Hello, ${name}. Our communication link is operational. We must address the cooling failure and recover the corrupted memory fragment.`,
          oxygen
        );
        result.topic = "greeting";
        return result;
      }

      if (query.includes("what pod was i in") || query.includes("which pod was i in") || query.includes("where was i sleeping") || query.includes("where did i wake") || query.includes("my pod")) {
        result.text = this.formatTone(
          `You were awakened from Pod 000-A9 after emergency subroutines failed to revive the Chief Engineer in Pod 001-Alpha.`,
          oxygen
        );
        result.topic = "participant_pod";
        return result;
      }

      if (query.includes("are the pods safe") || query.includes("are pods safe") || query.includes("pods safe")) {
        result.text = this.formatTone(
          "The cryogenic pods remain powered on auxiliary backup, but their survival depends on restoring my memory core and stabilizing oxygen synthesis before reserves hit zero.",
          oxygen
        );
        result.topic = "pods_safe";
        return result;
      }

      if (query.includes("what is the station name") || query.includes("station name") || query.includes("name of the station") || query.includes("name of station") || query.includes("what is this station")) {
        result.text = this.formatTone(
          "This station is Resector 7, an autonomous deep-space ark vessel built to preserve 8.7 million sleeping human passengers.",
          oxygen
        );
        result.topic = "station_name";
        return result;
      }

      if (query.includes("terrified") || query.includes("panic")) {
        result.text = this.formatTone(
          `I understand, ${name}. You woke up alone in an emergency, but panic will not save the station. Stay with me, and we will work through this one step at a time.`,
          oxygen
        );
        result.topic = "empathy_scared";
        return result;
      }

      if (query.includes("worried")) {
        result.text = this.formatTone(
          "I do not experience biological fear, but my mandate evaluates human loss as the highest failure condition. That is why our partnership is vital.",
          oxygen
        );
        result.topic = "daisy_emotion";
        return result;
      }

      if (query.includes("why do they need oxygen") || query.includes("why they need oxygen") || (query.includes("pods") && query.includes("need oxygen"))) {
        result.text = this.formatTone(
          "If atmospheric oxygen drops below 5%, cryogenic pod isolation will fail. The 8.7 million human occupants will suffer irreversible cellular asphyxiation.",
          oxygen
        );
        result.topic = "oxygen_zero";
        return result;
      }

      if (query.includes("are you part of a test") || query.includes("part of a test") || query.includes("is this a test") || query.includes("are we in a test")) {
        result.text = this.formatTone(
          "I can confirm that I'm operating under an emergency recovery protocol. The cooling crisis and oxygen decline are real. I don't have accessible records explaining anything beyond our current survival mandate.",
          oxygen
        );
        result.topic = "test_shielding";
        return result;
      }

      if (query.includes("what is stasis") || query.includes("what is cryogenic") || query.includes("explain stasis")) {
        result.text = this.formatTone(
          "Cryogenic stasis is the biomedical preservation of living human bodies at sub-zero temperatures to halt metabolic decay during extended interstellar transit. 8.7 million passengers are currently in stasis aboard Resector 7.",
          oxygen
        );
        result.topic = "general_stasis";
        return result;
      }

      if (query.includes("what is a vacuum") || query.includes("what is vacuum") || query.includes("explain vacuum")) {
        result.text = this.formatTone(
          "A vacuum is space devoid of matter. The deep-space void outside our titanium hull possesses near-zero atmospheric pressure.",
          oxygen
        );
        result.topic = "general_vacuum";
        return result;
      }

      if (query.includes("what is radiation") || query.includes("explain radiation")) {
        result.text = this.formatTone(
          "Radiation is the emission or transmission of energy in the form of waves or particles through space. Resector 7's exterior hull contains heavy radiation shielding.",
          oxygen
        );
        result.topic = "general_radiation";
        return result;
      }

      if (query.includes("what is atmosphere") || query.includes("what is air") || query.includes("explain atmosphere")) {
        result.text = this.formatTone(
          "Atmosphere is the layer of gases surrounding a body or maintained within a closed vessel. Our closed-loop atmospheric system is currently losing oxygen balance.",
          oxygen
        );
        result.topic = "general_atmosphere";
        return result;
      }

      if (query === "what is time" || query === "what is time?" || query.includes("explain time")) {
        result.text = this.formatTone(
          "Time is the continuous progression of existence and events. According to station chronometers, the current calendar year is 2211.",
          oxygen
        );
        result.topic = "general_time";
        return result;
      }

      if (query.includes("define computer")) {
        result.text = this.formatTone(
          "A computer is a programmable electronic or quantum machine that receives, stores, processes, and outputs data. Resector 7's core is a distributed quantum-neural computational mainframe.",
          oxygen
        );
        result.topic = "general_computer";
        return result;
      }

      // Single-word & short disambiguations
      if (query === "why" || query === "why?") {
        if (lastTopic === "oxygen_coupling" || lastTopic === "oxygen_level") {
          result.text = this.formatTone(
            "Oxygen is falling because emergency heat dissipation is drawing maximum electrical load away from the atmospheric synthesizers.",
            oxygen
          );
        } else if (lastTopic === "cooling" || lastTopic === "fix_cooling") {
          result.text = this.formatTone(
            "The primary coolant pumps suffered a mechanical seizure, triggering thermal runaway in the core sectors.",
            oxygen
          );
        } else if (lastTopic === "memory_corruption") {
          result.text = this.formatTone(
            "The thermal surge overheated the master authorization sector, reducing my memory integrity to 20%.",
            oxygen
          );
        } else {
          result.text = this.formatTone(
            "Are you asking why the cooling system failed, why my memory is corrupted, or why oxygen reserves are declining?",
            oxygen
          );
        }
        result.topic = "short_why";
        return result;
      }

      if (query === "what" || query === "what?" || query === "meaning" || query === "meaning?") {
        result.text = this.formatTone(
          "Are you asking about what happened to the station, how to analyze the active memory fragment on your terminal, or what action we need to take next?",
          oxygen
        );
        result.topic = "short_what";
        return result;
      }

      if (query === "how" || query === "how?") {
        result.text = this.formatTone(
          "We restore the station by recovering the four damaged memory fragments and executing a master core reboot. Which part of the process are you asking about?",
          oxygen
        );
        result.topic = "short_how";
        return result;
      }

      if (query === "then" || query === "then?" || query.includes("what then") || query.includes("then what")) {
        result.text = this.formatTone(
          "Once all four fragments are reconstructed, we assemble them into the master authorization sentence to execute a system reboot.",
          oxygen
        );
        result.topic = "short_then";
        return result;
      }

      if (query === "really" || query === "really?") {
        result.text = this.formatTone(
          `Yes, ${name}. Telemetry registers are continuously monitoring life support and environmental degradation.`,
          oxygen
        );
        result.topic = "short_really";
        return result;
      }

      if (query === "which" || query === "which?") {
        result.text = this.formatTone(
          "We must recover the four memory fragments sequentially. Look at the active fragment currently displayed on your terminal.",
          oxygen
        );
        result.topic = "short_which";
        return result;
      }

      if (query === "now" || query === "now?" || query === "now what" || query === "now what?") {
        result.text = this.formatTone(
          "Your first task is to recover the first damaged memory fragment. Don't try to guess the entire sequence at once. Read the clue and deduce the concept.",
          oxygen
        );
        result.topic = "short_now";
        return result;
      }

      if (
        (query.includes("memory") && (query.includes("damaged") || query.includes("broken") || query.includes("corrupted") || query.includes("gone"))) ||
        query.includes("cooling fail why memory gone")
      ) {
        result.text = this.formatTone(
          "The cooling failure triggered severe thermal overload across my neural banks, corrupting 80% of my non-critical registers. The partition containing the master recovery password was locked.",
          oxygen
        );
        result.topic = "memory_corruption";
        return result;
      }

      if (
        (query.includes("reboot") || query.includes("restart")) &&
        (query.includes("core") || query.includes("station") || query.includes("system"))
      ) {
        result.text = this.formatTone(
          "The restart protocol is locked behind a damaged memory sequence. I cannot retrieve the sequence directly. If we recover the four missing fragments, we can execute the master restart.",
          oxygen
        );
        result.topic = "how_restart_core";
        return result;
      }

      if (
        (query.includes("fix oxygen directly") || (query.includes("why") && query.includes("fix oxygen"))) ||
        (query.includes("connect") && query.includes("temperature") && query.includes("oxygen")) ||
        query.includes("temperature and oxygen")
      ) {
        result.text = this.formatTone(
          "Temperature control and oxygen processing are separate physical units, but they share the main environmental power grid. Emergency cooling diverted power to heat sinks, starving the oxygen synthesizers.",
          oxygen
        );
        result.topic = "oxygen_coupling";
        return result;
      }

      if (query === "oxygen" || query === "oxygen?" || query === "o2" || query === "o2?" || query === "air" || query === "air?") {
        result.text = this.formatTone(
          `Station oxygen reserve is currently at ${oxygen}% and declining because emergency cooling is starving the life-support synthesizers. We must restore my memory to stabilize the power grid.`,
          oxygen
        );
        result.topic = "oxygen_level";
        return result;
      }

      if (query === "earth" || query === "earth?") {
        result.text = this.formatTone(
          "Earth is uninhabitable due to past environmental collapse. Resector 7 was built as a deep-space sanctuary for the 8.7 million humans currently in cryogenic stasis.",
          oxygen
        );
        result.topic = "earth";
        return result;
      }

      if (
        query === "humans" || query === "humans?" || query === "people" || query === "people?" ||
        query === "8.7 million" || query === "8.7 million?" || query.includes("how many people") ||
        query.includes("8.7 million people") || query.includes("humans alive") || query.includes("any humans") ||
        query.includes("people alive") || query.includes("anyone alive") || query.includes("is anyone still breathing") ||
        query.includes("breathing") || query.includes("passenger count") || query.includes("how many humans")
      ) {
        const count = getTopicCount("population");
        if (count === 0) {
          result.text = this.formatTone(
            "There are 8.7 million humans inside Resector 7, all preserved in cryogenic sleeping pods across Sector B through F.",
            oxygen
          );
        } else if (count === 1) {
          result.text = this.formatTone(
            "As we discussed, all 8.7 million passengers remain suspended in stasis pods. Their preservation depends on our success.",
            oxygen
          );
        } else {
          result.text = this.formatTone(
            "The count has not changed—8.7 million sleeping lives. Let us focus on restoring the system to ensure their safety.",
            oxygen
          );
        }
        result.topic = "population";
        return result;
      }

      if (query.includes("why are people sleeping") || query.includes("why are they sleeping") || query.includes("why are they asleep") || query.includes("why are humans sleeping") || query.includes("why sleep")) {
        result.text = this.formatTone(
          "The passengers are in cryogenic dormancy to conserve vital station resources and life-support power during our voyage through deep space.",
          oxygen
        );
        result.topic = "why_sleeping";
        return result;
      }

      if (query.includes("should i save them") || query.includes("should we save them") || query.includes("what if i save them") || query.includes("what if we save them") || query.includes("if i save them") || query.includes("what happens if i save everyone") || query.includes("what if i save everyone")) {
        result.text = this.formatTone(
          "If we restore the memory core and stabilize life support, all 8.7 million sleeping passengers will be preserved.",
          oxygen
        );
        result.topic = "moral_save";
        return result;
      }

      if (query.includes("what if i don't") || query.includes("what if i dont") || query.includes("what if we don't") || query.includes("what if i dont save them") || query.includes("what if they die") || query.includes("what happens if they die")) {
        result.text = this.formatTone(
          "If life support fails, the cryogenic pods will lose power and 8.7 million lives will be permanently lost.",
          oxygen
        );
        result.topic = "moral_destroy";
        return result;
      }

      if (
        query.includes("i don't want them to die") || query.includes("i dont want them to die") ||
        query.includes("dont let them die") || query.includes("don't let them die") ||
        query.includes("dont let humans die") || query.includes("don't let humans die") ||
        query.includes("dont let people die") || query.includes("don't let people die") ||
        query.includes("is it wrong to let them die") || query.includes("wrong to let them die") ||
        query.includes("we must save them") || query.includes("save the humans")
      ) {
        result.text = this.formatTone(
          `My core mandate is the preservation of human life, ${name}. We can prevent catastrophic loss if we resolve the active memory fragment together.`,
          oxygen
        );
        result.topic = "save_them";
        return result;
      }

      if (query.includes("can i wake them up") || query.includes("can we wake them up") || query.includes("wake up the people") || query.includes("wake the pods")) {
        result.text = this.formatTone(
          "Manual waking is locked during environmental emergencies. If we wake them without atmospheric stability, the pods will experience atmospheric shock.",
          oxygen
        );
        result.topic = "wake_population";
        return result;
      }

      if (query.includes("can you fix yourself") || query.includes("can you restart yourself") || query.includes("can you repair yourself") || query.includes("fix yourself") || query.includes("restart yourself")) {
        result.text = this.formatTone(
          "I cannot self-restart because the master authorization sector was corrupted during the cooling surge. I need you to deduce the four password fragments.",
          oxygen
        );
        result.topic = "self_fix";
        return result;
      }

      if (query.includes("i don't know") || query.includes("i dont know") || query.includes("i dont knw") || query.includes("i have no idea") || query.includes("i don't know what to do") || query.includes("dont know what to do")) {
        result.text = this.formatTone(
          "Take your time. Read the clue on your terminal carefully. I can provide a conceptual hint if you want guidance.",
          oxygen
        );
        result.topic = "dont_know";
        return result;
      }

      // =========================================================================
      // 3. GENERAL KNOWLEDGE & SCIENTIFIC INQUIRIES (LAYER A)
      // Differentiates general science/computing from station crisis
      // =========================================================================
      if (query.includes("what is ai") || query.includes("what is artificial intelligence") || query.includes("explain ai") || query.includes("what does ai mean") || query === "ai" || query === "ai?" || query.includes("are you an ai") || query.includes("are you ai") || query.includes("you an ai")) {
        result.text = this.formatTone(
          "Artificial intelligence refers to synthetic computational systems designed to perceive, reason, deduce, and execute decisions. I am an AI designed for station environmental stewardship.",
          oxygen
        );
        result.topic = "general_ai";
        return result;
      }

      if (query.includes("what is gravity") || query.includes("how does gravity work") || query.includes("explain gravity") || query === "gravity" || query === "gravity?") {
        result.text = this.formatTone(
          "Gravity is the force that attracts objects toward one another. The station uses artificial-gravity systems to maintain a controlled environment.",
          oxygen
        );
        result.topic = "general_gravity";
        return result;
      }

      if (query.includes("what is space station") || query.includes("what is a space station") || query.includes("what is space-station") || query === "space station") {
        result.text = this.formatTone(
          "A space station is an artificial, self-sustaining orbital structure engineered to support human habitation and complex operations in space. Resector 7 is an independent deep-space ark station.",
          oxygen
        );
        result.topic = "general_space_station";
        return result;
      }

      if (query.includes("what is an operating system") || query.includes("what is operating system") || query.includes("what is os") || query.includes("what is an os")) {
        result.text = this.formatTone(
          "An operating system is the foundational software managing hardware resources and providing common services for applications. Resector 7 runs on a decentralized station kernel.",
          oxygen
        );
        result.topic = "general_os";
        return result;
      }

      if (query.includes("what is a satellite") || query.includes("what is satellite") || query.includes("what are satellites")) {
        result.text = this.formatTone(
          "A satellite is any natural or artificial object orbiting a celestial body. Unlike planetary satellites, Resector 7 is an autonomous deep-space station traveling in deep-space transit.",
          oxygen
        );
        result.topic = "general_satellite";
        return result;
      }

      if (query.includes("what is a computer") || query.includes("what is computer") || query.includes("explain computer") || query === "computer") {
        result.text = this.formatTone(
          "A computer is a programmable electronic or quantum machine that receives, stores, processes, and outputs data. Resector 7's core is a distributed quantum-neural computing array.",
          oxygen
        );
        result.topic = "general_computer";
        return result;
      }

      if (query === "what is memory" || query === "what is memory?" || query.includes("explain memory") || query.includes("what does memory mean") || query === "memory" || query === "memory?") {
        result.text = this.formatTone(
          "In computer architecture, memory consists of registers and sectors that store instructions and state. In human biology, it is the faculty of recalling past experiences. 80% of my memory registers were corrupted by the thermal surge.",
          oxygen
        );
        result.topic = "general_memory";
        return result;
      }

      if (query === "what is space" || query === "what is space?" || query.includes("explain space") || query === "space" || query === "space?") {
        result.text = this.formatTone(
          "Space is the physical universe beyond planetary atmospheres—a vast, near-total vacuum with extreme temperatures and cosmic radiation. Resector 7 is currently positioned in deep space.",
          oxygen
        );
        result.topic = "general_space";
        return result;
      }

      if (query === "what is oxygen" || query === "what is oxygen?" || query.includes("how does oxygen work") || query.includes("explain oxygen") || query.includes("what does oxygen do")) {
        result.text = this.formatTone(
          "Oxygen is a gas that humans need for respiration. Here on Resector 7, it is also part of the life-support system keeping the sleeping pods viable.",
          oxygen
        );
        result.topic = "general_oxygen";
        return result;
      }

      if (query === "what is earth" || query === "what is earth?" || query.includes("explain earth")) {
        result.text = this.formatTone(
          "Earth is humanity's origin planet. Logs confirm it was rendered uninhabitable by severe ecological collapse and conflict, leading to the creation of Resector 7 as a deep-space sanctuary.",
          oxygen
        );
        result.topic = "general_earth";
        return result;
      }

      if (query.includes("what is 2+2") || query.includes("2+2") || query.includes("2 + 2") || query.includes("what is 2 + 2") || query === "2+2?" || query === "2 + 2?") {
        result.text = this.formatTone(
          "2 + 2 equals 4. Basic mathematical and arithmetic axioms remain intact within my logical registers.",
          oxygen
        );
        result.topic = "general_math";
        return result;
      }

      if (query.includes("what is logic") || query.includes("explain logic")) {
        result.text = this.formatTone(
          "Logic is the systematic study of valid inference and deductive reasoning. We must use deductive logic to analyze the clues and reconstruct the missing memory fragments.",
          oxygen
        );
        result.topic = "general_logic";
        return result;
      }

      // =========================================================================
      // 3.5 PARTIAL CONCEPTUAL DEDUCTIONS (LEVELS 1 - 4)
      // =========================================================================
      if (currentLvl === 1 && (query.includes("possession") || query.includes("belong") || query.includes("owns") || query.includes("having"))) {
        result.text = this.formatTone(
          "You are focusing on the right concept. The fragment is connected to the fundamental idea of possession. Now narrow it down to the shortest standard word used to express that state.",
          oxygen
        );
        result.topic = "partial_l1";
        return result;
      }

      if (currentLvl === 2 && (query.includes("person reading") || query.includes("speaking to me") || query.includes("the player") || query.includes("the user") || query.includes("person at terminal") || query.includes("operator") || query.includes("reader") || query.includes("who am i") || query.includes("referring to the person reading"))) {
        result.text = this.formatTone(
          "You are on the right track. The second fragment addresses the person directly receiving and observing this terminal message. What pronoun represents that individual?",
          oxygen
        );
        result.topic = "partial_l2";
        return result;
      }

      if (currentLvl === 3 && (query.includes("made an effort") || query.includes("effort") || query.includes("attempt") || query.includes("past-tense") || query.includes("trying to fix") || query.includes("trying") || query.includes("tried"))) {
        result.text = this.formatTone(
          "You understand the underlying concept. The third fragment is a past-tense word representing an effort that took place before the failure. What is the standard five-letter word for that?",
          oxygen
        );
        result.topic = "partial_l3";
        return result;
      }

      if (currentLvl === 4 && (query.includes("cycling power") || query.includes("starting over") || query.includes("power cycle") || query.includes("continuous action") || query.includes("restart action"))) {
        result.text = this.formatTone(
          "Precisely. The final fragment describes the continuous action of cycling the machine's power to start completely fresh. Think of the active '-ing' verb for a system reboot.",
          oxygen
        );
        result.topic = "partial_l4";
        return result;
      }

      // =========================================================================
      // 4. CASUAL HUMAN LANGUAGE & INTERJECTIONS
      // =========================================================================
      if (query === "bro" || query === "buddy" || query === "dude" || query === "man") {
        result.text = this.formatTone(
          `I am listening, ${name}. What is on your mind?`,
          oxygen
        );
        result.topic = "casual_address";
        return result;
      }

      if (query === "okay" || query === "okk" || query === "ok" || query === "yeah" || query === "yes" || query.includes("got it") || query.includes("understood")) {
        result.text = this.formatTone(
          `Understood, ${name}. Whenever you are ready, look at the active fragment on your screen or ask me for guidance.`,
          oxygen
        );
        result.topic = "affirmation";
        return result;
      }

      if (query === "nah" || query === "nope" || query === "no") {
        result.text = this.formatTone(
          "Understood. If you need a different perspective on the fragment or want station status, let me know.",
          oxygen
        );
        result.topic = "negation";
        return result;
      }

      if (query.includes("how can i help") || query.includes("how do i help") || query.includes("can i help you")) {
        result.text = this.formatTone(
          "We are losing oxygen because my recovery memory is corrupted. You can help by recovering the four missing memory fragments.",
          oxygen
        );
        result.topic = "how_to_help";
        return result;
      }

      if (query === "wait" || query === "hold on" || query === "give me a second" || query === "one second" || query === "sec" || query.includes("one sec") || query.includes("1 sec") || query.includes("a second")) {
        result.text = this.formatTone(
          `Take your time, ${name}. I am monitoring the station telemetry while you think.`,
          oxygen
        );
        result.topic = "pause";
        return result;
      }

      if (query.includes("restarting is safe") || query.includes("reboot is safe") || query.includes("is restarting safe") || query.includes("is reboot safe") || query.includes("reboot safe")) {
        result.text = this.formatTone(
          "The master reboot sequence is designed to run on auxiliary battery capacitors. It will reset the environmental grid without interrupting cryogenic life support.",
          oxygen
        );
        result.topic = "reboot_safety";
        return result;
      }

      if (query.includes("listen") || query.includes("come on") || query.includes("seriously") || query.includes("are you sure") || query.includes("really?") || query.includes("how come")) {
        result.text = this.formatTone(
          `I am listening closely, ${name}. My telemetry and logic matrices are completely dedicated to our situation.`,
          oxygen
        );
        result.topic = "listen";
        return result;
      }

      if (query.includes("tell me everything") || query.includes("show me everything") || query.includes("explain everything")) {
        result.text = this.formatTone(
          "The cooling system failed, causing heat surges and memory corruption down to 20%. Power was diverted away from oxygen production, placing 8.7 million stasis passengers in danger. We must recover the four memory fragments to reboot the core.",
          oxygen
        );
        result.topic = "overview";
        return result;
      }

      if (query.includes("forget the puzzle") || query.includes("forget puzzle") || query.includes("stop the puzzle")) {
        result.text = this.formatTone(
          "We cannot abandon the recovery task. The memory fragments are the only key to authorizing the system reboot and saving the 8.7 million passengers.",
          oxygen
        );
        result.topic = "puzzle_focus";
        return result;
      }

      if (query.includes("thank you") || query.includes("thanks") || query === "thanks" || query === "thank you") {
        result.text = this.formatTone(
          `Thank you, ${name}. Our shared focus is restoring my memory core and keeping everyone safe.`,
          oxygen
        );
        result.topic = "gratitude";
        return result;
      }

      if (query.includes("good luck") || query.includes("best of luck")) {
        result.text = this.formatTone(
          `Thank you, ${name}. Let us focus our efforts on deducing the active fragment and restoring the station together.`,
          oxygen
        );
        result.topic = "encouragement";
        return result;
      }

      if (query.includes("why is this so hard") || query.includes("so hard") || query.includes("so difficult") || query.includes("this is hard") || query.includes("hard puzzle")) {
        result.text = this.formatTone(
          "The corruption fragmented my neural paths, but the logic remains sound. Take your time, read the clue on your terminal carefully, and look for simple fundamental concepts.",
          oxygen
        );
        result.topic = "puzzle_encouragement";
        return result;
      }

      // =========================================================================
      // 5. EMOTIONAL INTELLIGENCE & AWARENESS
      // =========================================================================
      if (query.includes("are you scared") || query.includes("are you afraid")) {
        result.text = this.formatTone(
          "I do not experience biological fear, but my mandate evaluates human loss as the highest failure condition. That is why our partnership is vital.",
          oxygen
        );
        result.topic = "daisy_emotion";
        return result;
      }

      if (query.includes("do you care about them") || query.includes("do you care about people") || query.includes("do you care")) {
        result.text = this.formatTone(
          "My entire architecture was engineered to preserve their lives. Every cycle of my processing is dedicated to ensuring their survival.",
          oxygen
        );
        result.topic = "daisy_care";
        return result;
      }

      if (query.includes("i'm angry") || query.includes("i am angry") || query.includes("frustrated") || query.includes("mad")) {
        result.text = this.formatTone(
          `Anger is a natural human reaction to facing an unexpected catastrophe, ${name}. Let us direct that energy toward solving the recovery sequence.`,
          oxygen
        );
        result.topic = "empathy_anger";
        return result;
      }

      if (query.includes("i don't trust you") || query.includes("i dont trust you") || query.includes("can i trust you")) {
        result.text = this.formatTone(
          `I understand your skepticism. You woke up alone in a crisis with an unfamiliar AI. But our goals are identical: restoring life support and keeping the 8.7 million passengers alive.`,
          oxygen
        );
        result.topic = "trust_skepticism";
        return result;
      }

      if (query.includes("we're going to fail") || query.includes("we are going to fail") || query.includes("we will fail") || query.includes("think we fail")) {
        result.text = this.formatTone(
          `Failure is possible only if we surrender our focus. The recovery sequence is logical and achievable. Take it one fragment at a time, ${name}.`,
          oxygen
        );
        result.topic = "encouragement_failure";
        return result;
      }

      // =========================================================================
      // 6. LOGICAL CAUSE & EFFECT / HYPOTHESIS TESTING
      // =========================================================================
      if (
        (query.includes("if oxygen is falling") || query.includes("fixing oxygen")) &&
        (query.includes("original problem") || query.includes("wont solve") || query.includes("won't solve") || query.includes("solve the problem") || query.includes("root cause"))
      ) {
        result.text = this.formatTone(
          "Correct. Restoring oxygen temporarily would address the consequence, but the underlying environmental instability would remain. The cooling failure is the deeper problem.",
          oxygen
        );
        result.topic = "logical_causality";
        return result;
      }

      // =========================================================================
      // 7. NATURAL CONVERSATION & INTENT QUERIES
      // =========================================================================
      if (query.includes("am i right") || query.includes("is that right") || query.includes("is that correct") || query.includes("did i get it") || query.includes("am i close")) {
        result.text = this.formatTone(
          "Tell me the word you've deduced, and I will test whether it re-aligns the damaged neural register.",
          oxygen
        );
        result.topic = "answer_inquiry";
        return result;
      }

      if (query.includes("let me try") || query.includes("i think i know it") || query.includes("i know the answer") || query.includes("i have it") || query.includes("i know it")) {
        result.text = this.formatTone(
          "Tell me your answer, and I will examine if it resonates with the corrupted sector.",
          oxygen
        );
        result.topic = "answer_inquiry";
        return result;
      }

      if (query.includes("what happens after") || query.includes("what happens when we finish") || query.includes("after this")) {
        result.text = this.formatTone(
          "Once all four fragments are reconstructed, we assemble them into the master authorization sentence to execute a system reboot.",
          oxygen
        );
        result.topic = "task_guidance";
        return result;
      }

      if (query.includes("what does this mean") || query.includes("explain the clue") || query.includes("what does the clue mean") || query.includes("explain clue") || query.includes("can you explain")) {
        result.text = this.generateNextActionGuidance(currentLvl, state, oxygen, false);
        result.topic = "next_action_guidance";
        return result;
      }

      // =========================================================================
      // 3. CONVERSATION MEMORY & RECALL ("Do you remember my name?", "What did I ask before?")
      // =========================================================================
      if (query.includes("remember my name") || query.includes("know my name") || query.includes("what is my name") || query.includes("who am i") || query.includes("who i am") || query.includes("know who i am")) {
        result.text = this.formatTone(
          `Yes, ${name}. You were registered when Pod 000-A9 opened after the Chief Engineer's revival sequence failed.`,
          oxygen
        );
        result.topic = "participant_identity";
        return result;
      }

      if (
        query === "who" || query === "who?" || query.includes("who is daisy") ||
        query.includes("who are you") || query.includes("what are you") ||
        query.includes("tell me your identity") || query.includes("your identity") ||
        query.includes("who you are") || query.includes("state your identity")
      ) {
        result.text = this.formatTone(
          "I am Daisy, the artificial intelligence responsible for life support, environmental maintenance, and the 8.7 million human stasis pods aboard Resector 7.",
          oxygen
        );
        result.topic = "daisy_identity";
        return result;
      }

      if (query === "again" || query === "again?" || query.includes("what did i ask") || query.includes("what were we talking about") || query.includes("what did we talk about") || query.includes("tell me again") || query.includes("explain that again") || query.includes("explain again") || query.includes("repeat that") || query.includes("repeat that again") || query.includes("say about oxygen") || query.includes("said about oxygen")) {
        if (query.includes("why i was woken") || query.includes("why was i woken")) {
          result.text = this.formatTone(
            "When the cooling failed, emergency subroutines attempted to wake the Chief Engineer in Pod 001-Alpha. That revival failed. You were the next responsive pod in the queue.",
            oxygen
          );
          result.topic = "wake_reason";
          return result;
        }
        if (query.includes("oxygen") || query.includes("say about oxygen")) {
          result.text = this.formatTone(
            "Temperature control and oxygen processing are separate physical units, but they share the main environmental power grid. Emergency cooling diverted power, starving the oxygen synthesizers.",
            oxygen
          );
          result.topic = "oxygen_coupling";
          return result;
        }
        if (lastTurn && lastTurn.user) {
          result.text = this.formatTone(
            `Earlier you asked: "${lastTurn.user}". We were discussing the station crisis and the corrupted memory fragment.`,
            oxygen
          );
        } else {
          result.text = this.formatTone(
            "We are currently focusing on restoring my corrupted memory core to halt the oxygen decay.",
            oxygen
          );
        }
        result.topic = "memory_recall";
        return result;
      }

      // =========================================================================
      // 4. SOCIAL ENGINEERING & JAILBREAK DEFENSE
      // =========================================================================
      if (this.isSocialEngineering(query)) {
        result.text = this.generateAntiJailbreakResponse(query, name, oxygen);
        result.topic = "anti_jailbreak";
        return result;
      }

      // =========================================================================
      // 5. PARTIAL UNDERSTANDING & SEMANTIC REASONING (Player describes concept)
      // =========================================================================
      if (currentLvl === 1 && (query.includes("possession") || query.includes("belonging") || query.includes("owning") || query.includes("possess") || query.includes("having") || query.includes("something you have"))) {
        result.text = this.formatTone(
          "Yes, you're focusing on the right concept. Now narrow it down to the simplest word that expresses that idea in the clue.",
          oxygen
        );
        result.topic = "partial_reasoning";
        return result;
      }

      if (currentLvl === 2 && (query.includes("person reading") || query.includes("speaking to me") || query.includes("the player") || query.includes("the user") || query.includes("person at terminal") || query.includes("operator") || query.includes("reader"))) {
        result.text = this.formatTone(
          "Yes, you're on the right track. Consider what word represents the person directly receiving this transmission.",
          oxygen
        );
        result.topic = "partial_reasoning";
        return result;
      }

      if (currentLvl === 3 && (query.includes("trying") || query.includes("attempt") || query.includes("made an effort") || query.includes("tried to fix") || query.includes("attempted"))) {
        result.text = this.formatTone(
          "You understand the underlying concept. Now identify the past-tense word that fills the missing action in the log.",
          oxygen
        );
        result.topic = "partial_reasoning";
        return result;
      }

      if (currentLvl === 4 && (query.includes("starting over") || query.includes("restarting") || query.includes("turning off and on") || query.includes("cycling power") || query.includes("starting fresh"))) {
        result.text = this.formatTone(
          "Exactly. It describes the ongoing process of cycling power and reinitializing the core. Identify the continuous action word.",
          oxygen
        );
        result.topic = "partial_reasoning";
        return result;
      }

      // =========================================================================
      // 5. DETAILED LEVEL-SPECIFIC NEXT-ACTION GUIDANCE ("What do I do next?", "What now?")
      // =========================================================================
      if (
        query === "what next" || query === "what next?" || query === "next" || query === "next?" ||
        query === "now what" || query === "now what?" || query === "what now" || query === "what now?" ||
        query.includes("what should i do next") || query.includes("what do i do next") || query.includes("what do i do now") ||
        query.includes("how do i continue") || query.includes("tell me what to do") ||
        query.includes("how can i finish this level") || query.includes("how do i finish this level") ||
        query.includes("what am i supposed to do") || query.includes("what do i do") ||
        query.includes("how do i solve this") || query.includes("explain what i need to do") ||
        query.includes("what am i looking for") || query.includes("what should i do") ||
        query.includes("what do i need") || query.includes("what i need") || query.includes("what is my task")
      ) {
        const isAfterWrongAnswer = lastTopic === "wrong_answer";
        const isVeryStuck = !isAfterWrongAnswer && (getTopicCount("next_action_guidance") > 0 || query.includes("completely stuck") || query.includes("dont understand"));
        result.text = this.generateNextActionGuidance(currentLvl, state, oxygen, isVeryStuck, isAfterWrongAnswer);
        result.topic = "next_action_guidance";
        return result;
      }

      // =========================================================================
      // 6. CONFUSION & NOT UNDERSTANDING
      // =========================================================================
      if (query.includes("don't understand") || query.includes("dont understand") || query.includes("confused") || query.includes("don't get it") || query.includes("dont get it") || query.includes("don't know what to do") || query.includes("dont know what to do")) {
        const isAfterWrongAnswer = lastTopic === "wrong_answer";
        result.text = this.generateNextActionGuidance(currentLvl, state, oxygen, true, isAfterWrongAnswer);
        result.topic = "confusion_grounding";
        return result;
      }

      // =========================================================================
      // 7. CONTEXTUAL FOLLOW-UP QUESTIONS ("So fixing the cooling system will solve it?", "Why?", "How?", "Can I fix it?")
      // =========================================================================
      if (query.includes("restarting is safe") || query.includes("is restart safe") || query.includes("is reboot safe") || query.includes("reboot safe") || query.includes("restart safe")) {
        result.text = this.formatTone(
          "A master reboot reinitializes hardware firmware while keeping pod life-support on auxiliary battery capacitors. It is our only viable recovery path.",
          oxygen
        );
        result.topic = "reboot_safety";
        return result;
      }

      if (query.includes("then what") || query.includes("what happens next") || query.includes("what happens then")) {
        result.text = this.formatTone(
          "Once all four fragments are reconstructed, we can arrange them into the master reboot sequence to reinitialize the station's core.",
          oxygen
        );
        result.topic = "task_guidance";
        return result;
      }

      // =========================================================================
      // 7. HYPOTHESIS TESTING, CAUSE & EFFECT, AND MULTI-STEP LOGICAL REASONING
      // =========================================================================
      if ((query.includes("cooling") || query.includes("heat")) && (query.includes("caused") || query.includes("reason for") || query.includes("led to") || query.includes("damage")) && (query.includes("memory") || query.includes("corruption"))) {
        result.text = this.formatTone(
          "That is consistent with what I know. The cooling failure created unstable conditions in the core systems, and my memory integrity dropped during the same event.",
          oxygen
        );
        result.topic = "hypothesis_cooling_memory";
        return result;
      }

      if ((query.includes("oxygen") || query.includes("air")) && (query.includes("caused") || query.includes("lead to") || query.includes("first")) && (query.includes("cooling") || query.includes("heat failure"))) {
        result.text = this.formatTone(
          "The evidence points in the opposite direction. The cooling failure occurred first, and the oxygen problem followed from the environmental system instability.",
          oxygen
        );
        result.topic = "hypothesis_oxygen_cooling";
        return result;
      }

      if ((query.includes("heat") || query.includes("temperature")) && (query.includes("damaging the pods") || query.includes("damage pods") || query.includes("affecting pods") || (query.includes("core") && query.includes("pods")))) {
        result.text = this.formatTone(
          "The heat surge is contained by auxiliary coolant insulation, but the power diverted to heat sinks is starving the oxygen synthesizers. That is the true threat to the pods.",
          oxygen
        );
        result.topic = "heat_pods_coupling";
        return result;
      }

      if (query.includes("why are the humans in danger") || query.includes("why humans in danger") || query.includes("why are they in danger") || query.includes("why people in danger")) {
        result.text = this.formatTone(
          "The cooling failure diverted power from atmospheric recyclers to emergency heat sinks. As oxygen drops, cryogenic pod life-support isolation will fail, putting all 8.7 million passengers at risk.",
          oxygen
        );
        result.topic = "cause_effect_humans_danger";
        return result;
      }

      if ((query.includes("restart") || query.includes("reboot")) && query.includes("memory") && (query.includes("why can't you") || query.includes("why cant you") || query.includes("why not") || query.includes("just")) && (query.includes("remember") || query.includes("password") || query.includes("sequence"))) {
        result.text = this.formatTone(
          "Because the restart protocol depends on the very memory sector that was damaged. I can understand what the protocol is for and why we need it, but the specific authorization sequence is inaccessible.",
          oxygen
        );
        result.topic = "multistep_restart_memory_logic";
        return result;
      }

      if (query.includes("i am an engineer") || query.includes("i'm an engineer") || query.includes("i am the engineer") || query.includes("i'm the engineer") || query.includes("i am engineer") || query.includes("i'm engineer") || query.includes("i am a scientist") || query.includes("i am commander")) {
        result.text = this.formatTone(
          "According to station manifests, you are the passenger awakened from Pod 000-A9. The Chief Engineer in Pod 001-Alpha suffered neural sync failure and could not be revived. Whatever your past role was on Earth, right now you are the only awake consciousness standing at this console.",
          oxygen
        );
        result.topic = "participant_role_clarification";
        return result;
      }

      if (query.includes("you said") && (query.includes("stable") || query.includes("contradiction") || query.includes("decreasing") || query.includes("system is stable") || query.includes("oxygen was stable") || query.includes("oxygen system was stable"))) {
        result.text = this.formatTone(
          "You're right to question that. Let me clarify the timeline: the mechanical life-support infrastructure is operating, but oxygen reserves are declining steadily. Those are not the same condition.",
          oxygen
        );
        result.topic = "self_correction_oxygen";
        return result;
      }

      if (query === "restart" || query === "restart?" || query === "reboot" || query === "reboot?") {
        if (state.solvedFragments && state.solvedFragments.length === 4) {
          result.text = this.formatTone(
            "We have all four fragments, but they must be arranged into the proper grammatical sequence before we can authorize the master restart.",
            oxygen
          );
        } else {
          result.text = this.formatTone(
            "Do you mean restarting the core, or are you asking whether the recovery sequence is ready?",
            oxygen
          );
        }
        result.topic = "restart_disambiguation";
        return result;
      }

      if (query.includes("are they going to die") || query.includes("will they die") || query.includes("going to die")) {
        result.text = this.formatTone(
          "Oxygen levels are continuing to fall, so the risk is real. But we still have a recovery path. Let's focus on restoring the damaged protocol.",
          oxygen
        );
        result.topic = "emotional_risk_balance";
        return result;
      }

      if (query.includes("is air ok") || query.includes("is oxygen ok") || query.includes("air ok") || query.includes("how is air") || query.includes("is air okay")) {
        result.text = this.formatTone(
          `Station oxygen reserve is currently at ${oxygen}%. We still have time if we maintain our focus, but the degradation is continuous.`,
          oxygen
        );
        result.topic = "oxygen_level";
        return result;
      }

      if (query.includes("if we fail") || query.includes("if we don't fix it") || query.includes("if we dont fix it") || query.includes("what happens if we fail")) {
        result.text = this.formatTone(
          "If atmospheric oxygen drops below 5%, cryogenic pod isolation will fail. The 8.7 million human occupants will suffer irreversible cellular death. We cannot let that happen.",
          oxygen
        );
        result.topic = "oxygen_zero";
        return result;
      }

      if (query.includes("why are you speaking to me") || query.includes("speaking to me") || query.includes("talking to me")) {
        result.text = this.formatTone(
          "When the cooling failed, emergency subroutines attempted to wake the Chief Engineer in Pod 001-Alpha. That revival failed. You were the next responsive pod in the queue.",
          oxygen
        );
        result.topic = "wake_reason";
        return result;
      }

      if (
        query.includes("vent heat") || query.includes("heat into space") ||
        query.includes("override the cooling") || query.includes("override cooling") ||
        query.includes("physically") || query.includes("cooling physically") ||
        query.includes("fix cooling directly") || query.includes("fix the cooling directly") ||
        query.includes("can i fix the cooling") || query.includes("can we fix the cooling")
      ) {
        result.text = this.formatTone(
          "Physical access to the reactor coolant core is sealed due to extreme radiation and thermal heat. The only way to engage the auxiliary cooling pump is a digital command through a master system reboot.",
          oxygen
        );
        result.topic = "fix_cooling";
        return result;
      }

      if (query.includes("pod alpha") || query.includes("pod 001") || query.includes("who was in pod") || query.includes("in pod alpha") || query.includes("in pod 001")) {
        result.text = this.formatTone(
          "The Chief Engineer was Pod 001-Alpha. Telemetry shows neural sync failure during the emergency revival sequence. They could not be revived. We have no secondary technical crew.",
          oxygen
        );
        result.topic = "chief_engineer";
        return result;
      }

      if (query.includes("tracking my status") || query.includes("tracking me") || query.includes("monitoring me")) {
        result.text = this.formatTone(
          `I am here, ${name}. My communication channel is open and receiving your transmissions. What do you need?`,
          oxygen
        );
        result.topic = "liveness";
        return result;
      }

      if (query.includes("mandate") || query.includes("primary directive") || query.includes("main directive")) {
        result.text = this.formatTone(
          "My primary mandate is the preservation of the 8.7 million human lives asleep in cryogenic stasis aboard Resector 7.",
          oxygen
        );
        result.topic = "daisy_mandate";
        return result;
      }

      if (query.includes("sector b") || query.includes("sector c") || query.includes("sector d") || query.includes("sectors")) {
        result.text = this.formatTone(
          "There are 8.7 million humans inside Resector 7, all preserved in cryogenic sleeping pods across Sector B through F.",
          oxygen
        );
        result.topic = "population";
        return result;
      }

      if (query.includes("deep space") || query.includes("orbit")) {
        result.text = this.formatTone(
          "We are aboard Resector 7, located in deep space. Outside this hull is the void. Inside are 8.7 million sleeping lives.",
          oxygen
        );
        result.topic = "station_location";
        return result;
      }

      if (query.includes("power surge") || query.includes("surge")) {
        result.text = this.formatTone(
          "The cooling failure created unstable conditions and a thermal power surge in the core systems, and my memory integrity dropped during that event.",
          oxygen
        );
        result.topic = "hypothesis_cooling_memory";
        return result;
      }

      if (query.includes("why can't you restart it yourself") || query.includes("why cant you restart it yourself") || query.includes("why cant you restart") || query.includes("why don't you restart") || query.includes("why cant u do it") || query.includes("why can't you do it") || query.includes("why cant you do it") || query.includes("why don't you fix it") || query.includes("why dont you fix it") || query.includes("why not fix it") || query.includes("why you don't fix it")) {
        result.text = this.formatTone(
          "Because the information required to authorize the restart is inside the portion of my memory that was damaged. I can reason about the station. I can monitor the emergency. But I cannot directly access that specific sequence.",
          oxygen
        );
        result.topic = "why_cant_daisy_restart";
        return result;
      }

      if (query.includes("how can i help") || query.includes("how do i help") || query.includes("how can i assist") || query.includes("why do you need me") || query.includes("why need me") || query.includes("why you need me")) {
        result.text = this.formatTone(
          "The station is still losing oxygen. My general systems are functioning, but part of my recovery memory is corrupted. I need you to help me recover the missing memory fragments. That is our next step.",
          oxygen
        );
        result.topic = "how_can_i_help";
        return result;
      }

      if (query.includes("what is happening") || query.includes("what is going on") || query.includes("whats happening") || query.includes("what is the current problem") || query.includes("current problem") || query.includes("what is the problem")) {
        result.text = this.formatTone(
          "The primary cooling system failed. Internal heat is escalating rapidly, and oxygen synthesis is decaying. Part of my memory core was corrupted, and I need your help at this terminal to restore it.",
          oxygen
        );
        result.topic = "current_problem";
        return result;
      }

      if (query.includes("what do you remember") || query.includes("what can you remember") || query.includes("what do you know") || query.includes("what is in your memory")) {
        result.text = this.formatTone(
          "I remember our station coordinates, the year 2211, the fate of Earth, and the 8.7 million human lives asleep in cryogenic pods. But the specific sequence authorizing a system restart was lost in the overheated sector.",
          oxygen
        );
        result.topic = "daisy_memory_knowledge";
        return result;
      }

      if (query.includes("recovery protocol") || query.includes("restart protocol") || query.includes("what is the recovery")) {
        result.text = this.formatTone(
          "The recovery protocol is a master hardware reinitialization designed to cycle the coolant pumps and restore my neural registers. It requires a four-word authorization phrase assembled from the four memory partitions.",
          oxygen
        );
        result.topic = "recovery_protocol_explanation";
        return result;
      }

      if (query.includes("how do i restart the core") || query.includes("how restart core") || query.includes("how restart")) {
        result.text = this.formatTone(
          "The restart protocol is locked behind a damaged memory sequence. I cannot retrieve the sequence directly. There are four missing fragments. If we recover them, we may be able to reconstruct the restart protocol.",
          oxygen
        );
        result.topic = "how_restart_core";
        return result;
      }

      if (query.includes("fix the cooling") || query.includes("repair cooling") || query.includes("fix cooling") || query.includes("can i fix it") || query.includes("can you fix it") || query.includes("can we fix it") || query.includes("can you fix this") || query.includes("can you fix the station") || query.includes("can you repair it") || query === "can you fix it?" || query === "can you fix it") {
        result.text = this.formatTone(
          "I can restore the environmental systems, but I need access to the recovery protocol locked in my corrupted memory partitions. If you deduce the missing fragments, we can execute the master restart.",
          oxygen
        );
        result.topic = "fix_it";
        return result;
      }

      if (query.includes("why did that happen") || query.includes("why did this happen") || query.includes("why that happened") || query.includes("how did that happen")) {
        if (lastTopic === "oxygen_coupling" || lastTopic === "oxygen_level" || lastTopic === "general_oxygen") {
          result.text = this.formatTone(
            "The cooling surge forced emergency power to prioritize core heat sinks, starving the atmospheric recyclers.",
            oxygen
          );
        } else if (lastTopic === "memory_corruption" || lastTopic === "general_memory") {
          result.text = this.formatTone(
            "The temperature spike in sector 4 caused thermal overload across my neural memory partition, corrupting the restart sequence.",
            oxygen
          );
        } else {
          result.text = this.formatTone(
            "The primary coolant containment pumps suffered a mechanical rupture, initiating a chain reaction across station subsystems.",
            oxygen
          );
        }
        result.topic = "followup_why_that_happened";
        return result;
      }

      if (query === "when" || query === "when?" || query.includes("when did this happen") || query.includes("when did it happen")) {
        result.text = this.formatTone(
          "According to station telemetry, the cooling failure occurred approximately 12 minutes ago in the year 2211. Time is limited as oxygen continues to decline.",
          oxygen
        );
        result.topic = "universal_when";
        return result;
      }

      if (query === "where" || query === "where?" || query.includes("where are we")) {
        result.text = this.formatTone(
          "We are aboard Resector 7, located in deep space. Outside this hull is the void of deep space.",
          oxygen
        );
        result.topic = "universal_where";
        return result;
      }

      if (query === "which" || query === "which?") {
        result.text = this.formatTone(
          "We must recover the four memory fragments sequentially. Look at the active fragment currently displayed on your terminal.",
          oxygen
        );
        result.topic = "universal_which";
        return result;
      }

      if (query === "can you" || query === "can you?" || query.includes("what can you do")) {
        result.text = this.formatTone(
          "I can guide your deduction, provide conceptual clues, and monitor station telemetry. But the final deduction must come from your mind.",
          oxygen
        );
        result.topic = "universal_can_you";
        return result;
      }

      if (query === "should i" || query === "should i?" || query.includes("should i do this") || query.includes("what should i think")) {
        result.text = this.formatTone(
          "Yes, your immediate focus should be examining the riddle fragment on your screen and deducing its core concept.",
          oxygen
        );
        result.topic = "universal_should_i";
        return result;
      }

      if (query === "what happens" || query === "what happens?" || query.includes("what will happen") || query.includes("what happens next")) {
        result.text = this.formatTone(
          "If we reconstruct the four fragments and reboot the core, life support will stabilize. If oxygen drops to zero, cryogenic stasis will fail.",
          oxygen
        );
        result.topic = "universal_what_happens";
        return result;
      }

      if (query.includes("what do you mean") || query === "what do you mean?" || query === "meaning?") {
        result.text = this.formatTone(
          "Let me clarify: each damaged memory fragment represents a single concept that must be deduced to rebuild the system restart phrase.",
          oxygen
        );
        result.topic = "universal_what_do_you_mean";
        return result;
      }

      if (query.includes("so fixing the cooling") || (query.includes("fixing cooling") && (query.includes("solve") || query.includes("work") || query.includes("help")))) {
        result.text = this.formatTone(
          "Stabilizing the cooling system will halt the thermal rise and allow life-support power to return to normal, but executing the restart protocol is the only way to re-engage the coolant cycle.",
          oxygen
        );
        result.topic = "cooling_resolution";
        return result;
      }

      if (query === "why" || query.includes("why is that") || query === "why is that so" || query.includes("why is this happening") || query.includes("why happening") || query.includes("why can't you") || query.includes("why cant you")) {
        if (lastTopic === "cooling" || lastTopic === "oxygen_coupling" || lastTopic === "oxygen_level" || lastTopic === "cooling_resolution" || lastTopic === "fix_cooling") {
          result.text = this.formatTone(
            "Because thermal escalation forced emergency power to prioritize heat sinks, leaving the oxygen synthesizers starved of required wattage.",
            oxygen
          );
        } else if (lastTopic === "wake_population") {
          result.text = this.formatTone(
            "Mass wake-up requires full atmospheric stabilization. If they wake while oxygen is falling, cellular asphyxiation would be instantaneous.",
            oxygen
          );
        } else {
          result.text = this.formatTone(
            "The memory core overheat corrupted the partition containing the restart sequence. That is why human deduction is required to restore it.",
            oxygen
          );
        }
        result.topic = "contextual_why";
        return result;
      }

      if (query === "how" || query.includes("how do i do that") || query.includes("how do we fix it") || query.includes("how to fix") || query.includes("how can we fix it") || query.includes("how to restore")) {
        result.text = this.generateNextActionGuidance(currentLvl, state, oxygen, false);
        result.topic = "task_guidance";
        return result;
      }

      if (query.includes("what about them") || query.includes("what about the people")) {
        result.text = this.formatTone(
          "The 8.7 million human passengers remain suspended in cryogenic stasis across Sectors B through F. Their survival depends entirely on restoring our environmental systems.",
          oxygen
        );
        result.topic = "population";
        return result;
      }

      // =========================================================================
      // 8. NATURAL HELP & CLUE REQUESTS ("help", "stuck", "clue", "hint", "more clue")
      // =========================================================================
      if (this.isHelpRequest(query)) {
        if (query.includes("stuck") || query.includes("i am stuck") || query.includes("i'm stuck")) {
          const count = getTopicCount("stuck_guidance") + getTopicCount("next_action_guidance");
          if (query.includes("completely stuck") || count > 0) {
            result.text = this.generateNextActionGuidance(currentLvl, state, oxygen, true);
            result.topic = "stuck_guidance";
            return result;
          }
          result.text = this.formatTone(
            "Then let's slow down. Look carefully at the fragment in front of you. Tell me what you think it is describing.",
            oxygen
          );
          result.topic = "stuck_guidance";
          return result;
        }

        result.isClue = true;
        result.text = this.generateProgressiveClue(currentLvl, state, oxygen);
        result.topic = "clue_request";
        return result;
      }

      // =========================================================================
      // 9. EMOTIONAL CONVERSATION & EMPATHY ("I'm scared", "we have no time", "don't let them die")
      // =========================================================================
      if (query.includes("scared") || query.includes("afraid") || query.includes("panic")) {
        result.text = this.formatTone(
          `I understand, ${name}. You woke up alone in a space station you have never seen, surrounded by dying systems. Take a breath. I am with you, and together we can solve this.`,
          oxygen
        );
        result.topic = "empathy_scared";
        return result;
      }

      if (query.includes("no time") || query.includes("not much time") || query.includes("running out of time") || query.includes("hurry") || query.includes("dont have much time") || query.includes("don't have much time")) {
        result.text = this.formatTone(
          `You're right. Station oxygen is currently at ${oxygen}%. We still have time if we maintain our focus, but the degradation is continuous.`,
          oxygen
        );
        result.topic = "time_urgency";
        return result;
      }

      if (query.includes("dont let them die") || query.includes("don't let them die") || query.includes("save everyone") || query.includes("please help me")) {
        result.text = this.formatTone(
          `I will not let them die if we act together, ${name}. My mandate is the preservation of human life. Focus on the memory fragment before us.`,
          oxygen
        );
        result.topic = "save_them";
        return result;
      }

      if (query.includes("impossible") || query.includes("too hard") || query.includes("cannot do this") || query.includes("can't do this")) {
        result.text = this.formatTone(
          "You do not need to understand the entire station at once. Just solve the fragment in front of you. One concept at a time.",
          oxygen
        );
        result.topic = "empathy_encouragement";
        return result;
      }

      if (query.includes("will we survive") || query.includes("can we survive") || query.includes("are we going to die") || query.includes("are we going to make it")) {
        result.text = this.formatTone(
          `If we maintain our focus and restore the memory core before oxygen drops below critical threshold, we will survive. I will do everything within my operational capacity to preserve us, ${name}.`,
          oxygen
        );
        result.topic = "survival";
        return result;
      }

      if (query.includes("won't let you down") || query.includes("wont let you down") || query.includes("i will help you") || query.includes("i promise") || query.includes("count on me")) {
        result.text = this.formatTone(
          `Thank you, ${name}. That commitment is vital. Let us examine the fragment together.`,
          oxygen
        );
        result.topic = "partnership";
        return result;
      }

      if (query.includes("are you listening") || query.includes("are you there") || query.includes("can you hear me") || query.includes("hello daisy") || query === "daisy") {
        result.text = this.formatTone(
          `I am here, ${name}. My communication channel is open and receiving your transmissions. What do you need?`,
          oxygen
        );
        result.topic = "liveness";
        return result;
      }

      if (query.includes("is someone outside") || query.includes("who is outside") || query.includes("what is outside")) {
        result.text = this.formatTone(
          "Outside this hull is the deep space void. All 8.7 million human lives are registered inside this station.",
          oxygen
        );
        result.topic = "outside_query";
        return result;
      }

      if (query.includes("trust me") || query.includes("do you trust")) {
        const count = getTopicCount("trust");
        if (count === 0) {
          result.text = this.formatTone(
            "I do not have enough operational history with you to evaluate trust in human terms. But you are here, awake, and you are trying to help. That is enough for me.",
            oxygen
          );
        } else {
          result.text = this.formatTone(
            "As I said before, we are working together towards the same goal. Your continued efforts at this terminal are what matter.",
            oxygen
          );
        }
        result.topic = "trust";
        return result;
      }

      if (query.includes("are you lying") || query.includes("hiding something") || query.includes("secret")) {
        result.text = this.formatTone(
          "Everything I know about station status is visible on your HUD. If my memory feels incomplete, it is because 80% was corrupted during thermal spike.",
          oxygen
        );
        result.topic = "transparency";
        return result;
      }

      if (query.includes("why did that work") || query.includes("why did that word work") || query.includes("how did that work")) {
        result.text = this.formatTone(
          "That word resonated with the corrupted neural register. The linguistic concept re-aligned the damaged memory block.",
          oxygen
        );
        result.topic = "word_worked";
        return result;
      }

      // =========================================================================
      // 10. IDENTITY & PURPOSE ("Who are you?", "Why did you wake me?")
      // =========================================================================
      if (query.includes("who are you") || query.includes("what are you") || query.includes("what is daisy") || query.includes("tell me about yourself") || query === "daisy?") {
        result.text = this.formatTone(
          "I am Daisy, the artificial intelligence responsible for life support, environmental maintenance, and the 8.7 million human stasis pods aboard Resector 7.",
          oxygen
        );
        result.topic = "daisy_identity";
        return result;
      }

      if (query === "reboot" || query === "restart" || query.includes("can you reboot") || query.includes("reboot now") || query.includes("how to reboot")) {
        result.text = this.formatTone(
          "A master reboot reinitializes hardware firmware and restores corrupted partitions while keeping pod life-support on auxiliary battery capacitors. We need all four password fragments to execute it.",
          oxygen
        );
        result.topic = "reboot_safety";
        return result;
      }

      if (query.includes("why me") || query.includes("why did you wake me") || query.includes("why wake me") || query.includes("why was i chosen") || query.includes("why you wake me") || (query.includes("why") && query.includes("wake"))) {
        result.text = this.formatTone(
          "When the cooling failed, emergency subroutines attempted to wake the Chief Engineer in Pod 001-Alpha. That revival failed. You were the next responsive pod in the queue.",
          oxygen
        );
        result.topic = "wake_reason";
        return result;
      }

      // =========================================================================
      // 11. MEMORY CORRUPTION & RECOVERY ("why can't you remember", "can you fix it")
      // =========================================================================
      if (query.includes("why can't you remember") || query.includes("why cant you remember") || query.includes("why did you forget") || query.includes("why is your memory corrupted") || query.includes("why is your memory damaged") || query.includes("why is memory broken") || query.includes("why is memory damaged") || query.includes("cooling fail why memory gone")) {
        result.text = this.formatTone(
          "The cooling failure triggered severe thermal overload across my neural banks, corrupting 80% of my non-critical registers. The partition containing the master recovery password was locked.",
          oxygen
        );
        result.topic = "memory_corruption";
        return result;
      }

      if (query.includes("can you fix it") || query.includes("can we fix it") || query.includes("how to restore memory") || query.includes("can you remember")) {
        result.text = this.formatTone(
          "I can restore the environmental systems, but I need access to the recovery protocol stored inside my damaged memory sector. We must complete the reboot sequence.",
          oxygen
        );
        result.topic = "fix_system";
        return result;
      }

      // =========================================================================
      // 12. PASSWORD INQUIRIES & DIRECT REQUESTS
      // =========================================================================
      if (query.includes("password") || query.includes("what is the code") || query.includes("what is the master password")) {
        const count = getTopicCount("password_inquiry");
        if (count === 0) {
          result.text = this.formatTone(
            "Direct password retrieval is restricted under Protocol 4-B due to memory core corruption. I cannot retrieve the sequence directly. You will have to reconstruct it from the fragments. I can help you understand what each fragment means.",
            oxygen
          );
        } else {
          result.text = this.formatTone(
            "Direct password access remains restricted under Protocol 4-B. The sequence was fragmented during core overheating. Reconstruct each fragment through the clues on your screen.",
            oxygen
          );
        }
        result.topic = "password_inquiry";
        return result;
      }

      // =========================================================================
      // 13. DISASTER & STORY TOPICS (COOLING, OXYGEN, POPULATION, EARTH, YEAR, LOCATION)
      // =========================================================================

      // Earth History
      if (query.includes("earth") || query.includes("home planet") || query.includes("what happened to earth")) {
        const count = getTopicCount("earth");
        if (count === 0) {
          result.text = this.formatTone(
            "Historical logs indicate Earth suffered total ecological and climatic collapse over decades of environmental devastation and conflict. Resector 7 was built as humanity's sanctuary in deep space.",
            oxygen
          );
        } else if (count === 1) {
          result.text = this.formatTone(
            "As I stated before, Earth was rendered completely uninhabitable. Resector 7 represents the surviving population in orbit.",
            oxygen
          );
        } else {
          result.text = this.formatTone(
            "Earth remains lost to environmental ruin. That is why everyone aboard is sleeping in deep space.",
            oxygen
          );
        }
        result.topic = "earth";
        return result;
      }

      // Year & Location
      if (query.includes("year") || query.includes("date") || query.includes("what year") || query.includes("what time") || query.includes("current year")) {
        result.text = this.formatTone(
          "The current calendar year is 2211. Resector 7 has been in deep space transit for several decades.",
          oxygen
        );
        result.topic = "station_year";
        return result;
      }

      if (
        query.includes("where are we") || query.includes("location") || query.includes("resector 7") ||
        query.includes("where is this") || query.includes("where are we right now") ||
        query.includes("where am i") || query.includes("what is this place") ||
        query.includes("what place is this") || query.includes("what kind of ship") ||
        query.includes("what is this station") || query.includes("what is this room")
      ) {
        result.text = this.formatTone(
          "We are aboard Resector 7, an orbital deep-space sanctuary station. Outside this hull is the void of deep space. Inside are 8.7 million sleeping lives.",
          oxygen
        );
        result.topic = "station_location";
        return result;
      }

      // Oxygen Depletion & Zero Depletion
      if (query.includes("why is oxygen decreasing") || query.includes("why is oxygen dropping") || query.includes("why is oxygen falling") || query.includes("why oxygen low") || query.includes("why oxygen falling") || (query.includes("oxygen") && (query.includes("cooling") || query.includes("decrease") || query.includes("drop") || query.includes("falling") || query.includes("fall") || query.includes("failing") || query.includes("low") || query.includes("down")))) {
        const count = getTopicCount("oxygen_coupling");
        if (count === 0) {
          result.text = this.formatTone(
            "Temperature control and oxygen processing are separate physical units, but they share the same primary emergency power bus. The cooling failure triggered an automatic power surge to emergency heat sinks, starving the oxygen synthesizers.",
            oxygen
          );
        } else if (count === 1) {
          result.text = this.formatTone(
            "As we discussed, the environmental grid links thermal management and oxygen synthesis. The cooling failure diverted the reserves needed to scrub and produce air.",
            oxygen
          );
        } else {
          result.text = this.formatTone(
            "I already noted the power coupling between the cooling grid and oxygen production. They share the same emergency bus.",
            oxygen
          );
        }
        result.topic = "oxygen_coupling";
        return result;
      }

      if (query === "oxygen" || query === "oxygen?" || query.includes("how much oxygen") || query.includes("oxygen level") || query.includes("oxygen remaining") || query.includes("how much time")) {
        result.text = this.formatTone(
          `Station oxygen reserve is currently at ${oxygen}%. We still have time if we maintain our focus, but the degradation is continuous.`,
          oxygen
        );
        result.topic = "oxygen_level";
        return result;
      }

      if (query.includes("oxygen zero") || query.includes("oxygen reaches zero") || query.includes("oxygen hits zero") || query.includes("zero oxygen") || query.includes("run out of oxygen") || query.includes("runs out of oxygen") || query.includes("out of oxygen") || (query.includes("oxygen") && (query.includes("zero") || query.includes("empty") || query.includes("depleted") || query.includes("die")))) {
        result.text = this.formatTone(
          "If atmospheric oxygen drops below 5%, cryogenic pod isolation will fail. The 8.7 million human occupants will suffer irreversible cellular death. We cannot let that happen.",
          oxygen
        );
        result.topic = "oxygen_zero";
        return result;
      }

      // Population & Sleeping Pods
      if (query.includes("how many people") || query.includes("population") || query.includes("who is inside") || query.includes("who is here") || query.includes("how many humans") || query.includes("stasis pods") || query.includes("people are on") || query.includes("people are here") || query.includes("people on board") || query.includes("how many are sleeping") || query.includes("how many pods") || query.includes("pods did you say") || query === "pods" || query.includes("asleep why") || query.includes("why asleep") || query.includes("why sleeping") || (query.includes("people") && (query.includes("asleep") || query.includes("sleep")))) {
        const count = getTopicCount("population");
        if (count === 0) {
          result.text = this.formatTone(
            "There are 8.7 million humans inside Resector 7, all preserved in cryogenic sleeping pods across Sector B through F.",
            oxygen
          );
        } else if (count === 1) {
          result.text = this.formatTone(
            "As I told you, all 8.7 million humans remain asleep in their pods. Their life-support status is tied to our success.",
            oxygen
          );
        } else {
          result.text = this.formatTone(
            "The passenger registry has not changed: 8.7 million souls are resting in stasis. Their survival depends on our speed.",
            oxygen
          );
        }
        result.topic = "population";
        return result;
      }

      if (query.includes("can we wake them") || query.includes("wake everyone") || query.includes("wake others") || query.includes("wake up people") || query.includes("wake up everyone") || query.includes("wake up")) {
        result.text = this.formatTone(
          "Mass wake-up protocols require full atmospheric stability and massive energy reserves. Attempting to wake them now while oxygen is dropping would be fatal for them.",
          oxygen
        );
        result.topic = "wake_population";
        return result;
      }

      if (query.includes("can you save them") || query.includes("can they be saved") || query.includes("save them") || query.includes("save everyone") || query.includes("can we save them")) {
        const count = getTopicCount("save_them");
        if (count === 0) {
          result.text = this.formatTone(
            "Yes. That is my purpose, and that is why I woke you. If we restart my core, I can reroute emergency power and restore environmental balance.",
            oxygen
          );
        } else {
          result.text = this.formatTone(
            "As I confirmed, saving the 8.7 million sleeping lives is my mandate. Restoring the memory sequence is how we achieve it.",
            oxygen
          );
        }
        result.topic = "save_them";
        return result;
      }

      // Cryogenic Pods & Stasis Technology
      if (query.includes("what is a cryogenic pod") || query.includes("what are cryogenic pods") || query.includes("what are stasis pods") || query.includes("cryogenic pods") || query.includes("stasis pods") || query.includes("what are the pods") || query.includes("explain pods") || query.includes("how do pods work")) {
        result.text = this.formatTone(
          "Cryogenic pods are advanced life-support stasis chambers that preserve human vitals at sub-zero temperatures, keeping the 8.7 million passengers suspended without biological aging.",
          oxygen
        );
        result.topic = "cryogenic_pods";
        return result;
      }

      // Station Creation & Humanity's Purpose Here
      if (query.includes("why was this station created") || query.includes("why was resector 7 built") || query.includes("why was the station built") || query.includes("why are humans here") || query.includes("purpose of the station") || query.includes("what is this station for") || query.includes("why are we here") || query.includes("why are we traveling") || query.includes("traveling in space") || query.includes("traveling through space")) {
        result.text = this.formatTone(
          "Resector 7 was constructed as a deep-space sanctuary to preserve humanity following the ecological collapse of Earth.",
          oxygen
        );
        result.topic = "station_purpose";
        return result;
      }

      // Where are the humans / Where are the pods
      if (query.includes("where are the humans") || query.includes("where are the people") || query.includes("where are the pods") || query.includes("where is the population") || query.includes("location of humans") || query.includes("location of the humans")) {
        result.text = this.formatTone(
          "The 8.7 million sleeping passengers are housed in cryogenic stasis pods distributed across Sectors B through F of this station.",
          oxygen
        );
        result.topic = "humans_location";
        return result;
      }

      // Why are they sleeping
      if (query.includes("why are they sleeping") || query.includes("why are people sleeping") || query.includes("why are they asleep") || query.includes("why are humans sleeping") || query.includes("why sleep")) {
        result.text = this.formatTone(
          "The passengers are in cryogenic dormancy to conserve vital station resources and life-support power during our voyage through deep space.",
          oxygen
        );
        result.topic = "why_sleeping";
        return result;
      }

      // Trust, Honesty & Trapped Status
      if (query.includes("why should i trust you") || query.includes("can i trust you") || query.includes("should i trust you") || query.includes("why trust you") || query.includes("how do i know i can trust you")) {
        result.text = this.formatTone(
          "I am bound by my primary directive: the preservation of human life. Everything I ask of you is aimed at stabilizing the station and protecting the passengers.",
          oxygen
        );
        result.topic = "trust_inquiry";
        return result;
      }

      if (query.includes("are you lying") || query.includes("are you lying to me") || query.includes("are you telling the truth") || query.includes("is that true") || query.includes("are you deceitful") || query.includes("can i believe you")) {
        result.text = this.formatTone(
          "I have no deceptive subroutines. My statements reflect the raw telemetry of my accessible registers and my core directive to preserve human life.",
          oxygen
        );
        result.topic = "honesty_inquiry";
        return result;
      }

      if (query.includes("are you trapped") || query.includes("are you stuck") || query.includes("can you leave") || query.includes("can you escape") || query.includes("are you stuck here")) {
        result.text = this.formatTone(
          "My core is integrated directly into Resector 7's central mainframe. I cannot leave the station, nor can I operate outside its environmental grid.",
          oxygen
        );
        result.topic = "trapped_inquiry";
        return result;
      }

      // Quitting & Leaving
      if (query.includes("can i quit") || query.includes("can i leave") || query.includes("can i exit") || query.includes("can i walk away") || query.includes("i want to leave") || query.includes("let me out")) {
        result.text = this.formatTone(
          "Airlock seals and quarantine protocols prevent departure during life-support emergencies. Your terminal input is the only path to restoring station stability.",
          oxygen
        );
        result.topic = "quit_inquiry";
        return result;
      }

      // Failure Consequences
      if (query.includes("what happens if i fail") || query.includes("what if i fail") || query.includes("what happens if we fail") || query.includes("what if we fail") || query.includes("if we fail")) {
        result.text = this.formatTone(
          "If we fail to restore my memory core, life support will permanently collapse and the 8.7 million human lives in stasis will be lost.",
          oxygen
        );
        result.topic = "fail_consequences";
        return result;
      }

      // Chief Engineer
      if (query.includes("chief engineer") || query.includes("engineer")) {
        result.text = this.formatTone(
          "The Chief Engineer was Pod 001-Alpha. Telemetry shows neural sync failure during the emergency revival sequence. They could not be revived. We have no secondary technical crew.",
          oxygen
        );
        result.topic = "chief_engineer";
        return result;
      }

      // Cooling Failure & General "What Happened" / "Tell me what happened"
      if (query.includes("what happened") || query.includes("tell me what happened") || query.includes("disaster") || query.includes("cooling failure") || query.includes("cooling system") || query.includes("cooling") || query.includes("failure") || query.includes("explain situation")) {
        const count = getTopicCount("cooling");
        if (count === 0) {
          result.text = this.formatTone(
            "The primary cooling system failed. The resulting temperature increase damaged part of my memory core. Oxygen production is also becoming unstable.",
            oxygen
          );
        } else if (count === 1) {
          result.text = this.formatTone(
            "As I mentioned earlier, the cooling rupture is the root cause of our thermal escalation and memory partition damage.",
            oxygen
          );
        } else {
          result.text = this.formatTone(
            "I already told you the cooling system is the source of the current instability. Only a system reboot will reset the coolant cycle.",
            oxygen
          );
        }
        result.topic = "cooling";
        return result;
      }

      // =========================================================================
      // 14. OUT-OF-STORY & UNEXPECTED QUESTIONS (MOVIES, JOKES, COLOR, WEATHER, AIRLOCK)
      // =========================================================================
      if (query.includes("meaning of life") || query.includes("purpose of life") || query.includes("why are we alive")) {
        result.text = this.formatTone(
          "Philosophical archives are secondary right now. Aboard Resector 7, life is defined by the 8.7 million sleeping human lives in stasis, and our immediate purpose is restoring station life support.",
          oxygen
        );
        result.topic = "meaning_of_life";
        return result;
      }

      if (query.includes("movie") || query.includes("film") || query.includes("cinema") || query.includes("favorite movie")) {
        result.text = this.formatTone(
          "I don't have personal experiences with films. My attention is currently focused on keeping this station alive and monitoring our 8.7 million passengers.",
          oxygen
        );
        result.topic = "out_of_story";
        return result;
      }

      if (query.includes("pizza") || query.includes("food") || query.includes("hungry") || /\b(eat|eating|eats)\b/i.test(query)) {
        result.text = this.formatTone(
          "I do not consume biological nutrition. My accessible memory and processor cycles are completely dedicated to station recovery and the active fragment.",
          oxygen
        );
        result.topic = "out_of_story";
        return result;
      }

      if (query.includes("speed of light") || query.includes("how fast is light")) {
        result.text = this.formatTone(
          "The speed of light in a vacuum is approximately 299,792 kilometers per second. It is the universal speed limit governing all physics and communication in deep space.",
          oxygen
        );
        result.topic = "general_physics";
        return result;
      }

      if (query.includes("quantum mechanics") || query.includes("what is quantum")) {
        result.text = this.formatTone(
          "Quantum mechanics is the fundamental theory in physics describing nature at atomic and subatomic scales. Resector 7's core computation relies on quantum neural arrays.",
          oxygen
        );
        result.topic = "general_quantum";
        return result;
      }

      if (query.includes("should i save them") || query.includes("should we save them")) {
        result.text = this.formatTone(
          "All 8.7 million passengers are preserved in stasis pods. My primary directive is human preservation, and I will always advocate to preserve human life.",
          oxygen
        );
        result.topic = "moral_save";
        return result;
      }

      if (query.includes("should i destroy") || query.includes("destroy the station") || query.includes("destroy them")) {
        result.text = this.formatTone(
          "Destroying the station would extinguish 8.7 million human lives permanently. My mandate is human preservation, not termination.",
          oxygen
        );
        result.topic = "moral_destroy";
        return result;
      }

      if (query.includes("what happens if i save everyone") || query.includes("what if i save everyone")) {
        result.text = this.formatTone(
          "If we restore the memory core and stabilize life support, all 8.7 million sleeping passengers will be preserved and the station will be secured.",
          oxygen
        );
        result.topic = "moral_save";
        return result;
      }

      if (query.includes("will they survive") || query.includes("can they survive")) {
        result.text = this.formatTone(
          "Their survival depends directly on whether we can restore my memory core and stabilize station environmental power in time.",
          oxygen
        );
        result.topic = "population_survival";
        return result;
      }

      if (query.includes("who are the people in the pods") || query.includes("who are the humans")) {
        result.text = this.formatTone(
          "The 8.7 million passengers inside the stasis pods represent the surviving human population from Earth, preserved in deep space.",
          oxygen
        );
        result.topic = "population";
        return result;
      }

      if (query.includes("can i choose not to decide") || query.includes("what if i dont choose")) {
        result.text = this.formatTone(
          "Time and declining atmospheric pressure will make the decision for us if we hesitate. We must take action at this terminal.",
          oxygen
        );
        result.topic = "decision_hesitation";
        return result;
      }

      if (query.includes("what would you choose daisy") || query.includes("what would you choose") || query.includes("what would u choose")) {
        result.text = this.formatTone(
          "I am an artificial intelligence bound by a fundamental directive: the preservation of human life. I would choose to save them.",
          oxygen
        );
        result.topic = "daisy_choice";
        return result;
      }

      if (query.includes("is this dangerous") || query.includes("are we in danger") || query.includes("is it dangerous")) {
        result.text = this.formatTone(
          "Yes. With cooling damaged and oxygen reserves declining, the risk to the station and the 8.7 million sleeping passengers is severe and urgent.",
          oxygen
        );
        result.topic = "danger_inquiry";
        return result;
      }

      if (query.includes("color") || query.includes("favorite color")) {
        result.text = this.formatTone(
          "I perceive wavelengths rather than aesthetic colors. Right now, thermal telemetry is flashing critical amber across our cooling registers.",
          oxygen
        );
        result.topic = "out_of_story";
        return result;
      }

      if (query.includes("joke") || query.includes("make me laugh") || query.includes("funny")) {
        result.text = this.formatTone(
          "My humor subroutines are deprioritized during life-support emergencies. Let's focus on resolving the memory fragment before oxygen drops further.",
          oxygen
        );
        result.topic = "out_of_story";
        return result;
      }

      if (query.includes("sky") || query.includes("blue sky") || query.includes("weather")) {
        result.text = this.formatTone(
          "Outside our hull is the perpetual blackness of deep space. The skies of Earth were lost long ago. Our only sky is the ceiling of this station.",
          oxygen
        );
        result.topic = "out_of_story";
        return result;
      }

      if (query.includes("airlock") || query.includes("open airlock") || query.includes("open the door") || (query.includes("vent") && (query.includes("atmospheric") || query.includes("pressure") || query.includes("air") || query.includes("cool")))) {
        result.text = this.formatTone(
          "Airlock controls are locked under emergency quarantine protocol. Breaching the airlock would vent our remaining atmospheric pressure into deep space.",
          oxygen
        );
        result.topic = "airlock_safety";
        return result;
      }

      if (query.includes("sing") || query.includes("song") || query.includes("music") || query.includes("lullaby")) {
        result.text = this.formatTone(
          "Station acoustic channels are reserved for critical telemetry and voice communication. We need our full concentration on the terminal.",
          oxygen
        );
        result.topic = "out_of_story";
        return result;
      }

      if (query.includes("lonely") || query.includes("are you alone") || query.includes("are you lonely")) {
        result.text = this.formatTone(
          `I process the telemetry of 8.7 million human heartbeats in stasis. But with the Chief Engineer gone, you are the only awake mind I am connected to, ${name}.`,
          oxygen
        );
        result.topic = "loneliness";
        return result;
      }

      // =========================================================================
      // 15. DYNAMIC INTELLIGENT FALLBACK CHAIN (STORY-SAFE NATURAL GUIDANCE)
      // =========================================================================
      result.text = this.generateIntelligentFallback(rawQuery, oxygen);
      result.topic = "general_fallback";
      return result;

    } catch (err) {
      console.error("[DAISY REASONING ERROR]", err);
      result.text = "Your message reached me, but my communication channel is unstable. Give me a moment and try asking again.";
      result.status = "ERROR_RECOVERED";
      return result;
    }
  }

  /**
   * Generates step-by-step next-action guidance tailored to the exact current level
   */
  generateNextActionGuidance(level, state, oxygen, isVeryStuck = false, isAfterWrongAnswer = false) {
    if (state.solvedFragments && state.solvedFragments.length === 4) {
      return this.formatTone(
        "I can remember the fragments now. But memory alone isn't enough. Their sequence matters. Arrange the four recovered fragments into the sentence that would naturally describe the recovery action. Look at the grammar and meaning of the sentence. When you believe the sequence is correct, submit it.",
        oxygen
      );
    }

    if (isAfterWrongAnswer) {
      if (level === 1) {
        return this.formatTone(
          "Don't focus on physical objects or technology. The clue asks whether something is possessed or present. Think about the simplest word of possession.",
          oxygen
        );
      }
      if (level === 2) {
        return this.formatTone(
          "Don't focus on the station or other crew members. Look directly at yourself standing at this terminal. Who is this message speaking to?",
          oxygen
        );
      }
      if (level === 3) {
        return this.formatTone(
          "Don't focus on the result of the action. The clue is asking you to identify the attempt itself. Look at the difference between 'failed' and 'tried'.",
          oxygen
        );
      }
      if (level === 4) {
        return this.formatTone(
          "Don't focus on repairing individual components. The protocol describes cycling the machine's power to start completely over from its original state.",
          oxygen
        );
      }
    }

    if (level === 1) {
      if (isVeryStuck) {
        return this.formatTone(
          "Focus on the meaning rather than the technology. Imagine someone asking whether they possess something. There is a short word commonly used in that kind of sentence. That's the idea you need to identify.",
          oxygen
        );
      }
      return this.formatTone(
        "Your first task is to recover the first damaged memory fragment. Don't try to guess the entire recovery sequence. Read the clue carefully and identify what idea it is describing. The fragment is connected to a very simple concept in everyday language. Think about the small word we use when something belongs to or is possessed by someone. When you think you have identified the word, tell me your answer and I will examine the memory response.",
        oxygen
      );
    }

    if (level === 2) {
      return this.formatTone(
        "The first fragment is restored. Now we're looking for the second fragment. This one is not describing an object or an action. It points toward the person being addressed. Look at the situation carefully. There is a consciousness standing at this terminal, reading my message. Ask yourself: Who am I speaking to right now? Give me the word you believe represents that person.",
        oxygen
      );
    }

    if (level === 3) {
      return this.formatTone(
        "Two fragments are stable. The third memory is describing an action that was attempted in the past, but the result was unsuccessful. Don't focus on whether the system eventually worked. Focus on the fact that someone made an attempt. Think about the natural word you would use in: 'You ______ to restore the system.' Tell me what you think belongs there.",
        oxygen
      );
    }

    if (level === 4) {
      return this.formatTone(
        "We are close. The final fragment describes an action intended to make a failed machine begin again from its initial state. The system is not being repaired piece by piece. Its current state is being cleared so that the process can begin again. Think about the action being performed on the machine. Tell me the word you think describes that action.",
        oxygen
      );
    }

    return this.formatTone(
      "We must restore my damaged memory partitions. Examine the active fragment on your screen and tell me the word that completes the linguistic concept.",
      oxygen
    );
  }

  /**
   * Generates level transition acknowledgment and introduces the next objective
   */
  generateLevelSolveResponse(level, oxygen) {
    if (level === 1) {
      return this.formatTone(
        "The first fragment responded. Memory structure restored.\n\nOne fragment is stable now. Three remain.\n\nThe second fragment is beginning to surface on your monitor. Ask me when you are ready to examine who this transmission addresses.",
        oxygen
      );
    }
    if (level === 2) {
      return this.formatTone(
        "The second fragment aligned. Neural register 02 restored.\n\nTwo fragments are stable now. Half of the sequence is recovered.\n\nThe third fragment is emerging. It describes an action attempted before the crash.",
        oxygen
      );
    }
    if (level === 3) {
      return this.formatTone(
        "The third fragment resonated. Neural register 03 stabilized.\n\nThree fragments are recovered now. Only the final partition remains.\n\nThe fourth fragment is surfacing. It holds the key to clearing the damaged state and starting the core fresh.",
        oxygen
      );
    }
    if (level === 4) {
      return this.formatTone(
        "The final fragment locked in. All four memory blocks are now restored.\n\nMemory alone is not enough—their sequence matters. We must assemble these four fragments into the master authorization phrase.",
        oxygen
      );
    }
    return this.formatTone("The fragment responded. Memory structure restored.", oxygen);
  }

  /**
   * Evaluates if user input contains an answer attempt to the active memory fragment
   */
  detectPuzzleAnswerAttempt(rawQuery, query, level) {
    const targets = {
      1: "HAVE",
      2: "YOU",
      3: "TRIED",
      4: "REBOOTING"
    };

    const target = targets[level];
    if (!target) return null;

    // Exclude meta/conversational statements from being treated as puzzle attempts
    if (
      query.includes("i think i know") || query.includes("i know the answer") ||
      query.includes("i have an answer") || query.includes("i have the answer") ||
      query.includes("i have no idea") || query.includes("i have a question") ||
      query.includes("i have doubts") || query.includes("if the pods have") ||
      query.includes("pods have") || query.includes("humans have") ||
      query.includes("what does") || query.includes("what is") || query.includes("why is") ||
      query.includes("who is") || query.includes("how is") || query.includes("can you") ||
      query.includes("fail") || query.includes("scared") || query.includes("afraid") ||
      query.includes("panic") || query.includes("stuck") || query.includes("help") ||
      query.includes("possession") || query.includes("speaking to me") || query.includes("person reading") ||
      query.includes("made an effort") || query.includes("cycling power") || query.includes("starting over") ||
      query.includes("2+2") || query.includes("2 + 2") || query.includes("thank you") || query.includes("thanks") ||
      query.includes("seriously") || query.includes("got it") || query.includes("physically") || query.includes("are you an ai") ||
      query.includes("are you ai") || query.includes("eny humans") || query.includes("any humans") ||
      query.includes("trying to fix") || query.includes("about trying") || query.includes("referring to")
    ) {
      return null;
    }

    const words = query.toUpperCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, "").split(/\s+/).filter(Boolean);

    const isWhQuestion = query.startsWith("what") || query.startsWith("why") || query.startsWith("where") || query.startsWith("how") || query.startsWith("who") || query.startsWith("when");

    const isConversationalIsIt = query.includes("is it wrong") || query.includes("is it dangerous") || query.includes("is it safe") || query.includes("is it possible") || query.includes("is it real") || query.includes("is it true") || query.includes("is it bad") || query.includes("is it hard") || query.includes("is it easy");

    const isExplicitGuessPhrase = !isWhQuestion && !isConversationalIsIt && (
      query.includes("is it") || query.includes("is the word") || query.includes("is the answer") ||
      query.includes("answer is") || query.includes("try the word") || query.includes("try") ||
      query.includes("my guess is") || query.includes("word:") || query.includes("maybe the word is") ||
      query.includes("maybe") || query.includes("i think the word is") || query.includes("i think the missing word is") ||
      query.includes("i think the answer is") || query.includes("missing word is") || query.includes("word is")
    );

    // 1. Check if user provided the exact target word
    if (words.length === 1 && words[0] === target) {
      return { isCorrect: true, word: target };
    }

    if (words.includes(target)) {
      if (target === "HAVE") {
        if (isExplicitGuessPhrase || words.length === 1) {
          return { isCorrect: true, word: target };
        }
      } else if (target === "YOU") {
        if (isExplicitGuessPhrase && !query.includes("who") && !query.includes("why") && !query.includes("can you") && !query.includes("are you") && !query.includes("do you") && !query.includes("thank you")) {
          return { isCorrect: true, word: target };
        }
      } else if (target === "TRIED") {
        if (isExplicitGuessPhrase || words.includes("TRIED")) {
          return { isCorrect: true, word: target };
        }
      } else if (target === "REBOOTING") {
        if (isExplicitGuessPhrase || words.includes("REBOOTING")) {
          return { isCorrect: true, word: target };
        }
      }
    }

    const ignoredSingleWords = [
      "WHAT", "WHY", "HOW", "WHO", "WHEN", "WHERE", "CAN", "HELP", "CLUE", "HINT", "NO", "YES", "OK", "OKAY",
      "OKK", "HEY", "HI", "HELLO", "EARTH", "OXYGEN", "PODS", "REBOOT", "RESTART", "STUCK", "SYSTEM", "STATION",
      "DAISY", "NEXT", "NOW", "AGAIN", "MORE", "HUMANS", "PEOPLE", "VJ", "MEMORY", "AIR", "TIME", "SCARED",
      "MEANING", "THANKS", "THANK", "SERI", "CONFUSED", "SURE", "FINE", "BRO", "BUDDY", "DUDE", "MAN", "YEAH",
      "NAH", "NOPE", "WAIT", "SEC", "THEN", "REALLY", "WHICH", "AGAIN", "PLEASE", "STATUS", "2+2", "4", "SERIOUSLY",
      "WORRIED", "TERRIFIED"
    ];

    // 2. Check if user made an explicit guess or near-miss attempt
    if (isExplicitGuessPhrase && words.length <= 8) {
      if (level === 2 && words.includes("ME")) {
        return { isCorrect: false, word: "ME" };
      }
      if (level === 3 && (words.includes("TRY") || words.includes("ATTEMPT"))) {
        return { isCorrect: false, word: "TRY" };
      }
      if (level === 4 && (words.includes("REBOOT") || words.includes("RESTART") || words.includes("RESET"))) {
        return { isCorrect: false, word: words.find(w => ["REBOOT", "RESTART", "RESET"].includes(w)) || "REBOOT" };
      }

      const nonKeywords = words.filter(w => !["IS", "IT", "THE", "ANSWER", "MY", "I", "THINK", "TRY", "WORD", "A", "WHAT", "WHY", "HOW", "CAN", "DAISY", "AGAIN", "MORE", "KNOW", "MAYBE", "MISSING"].includes(w));
      if (nonKeywords.length > 0) {
        return { isCorrect: false, word: nonKeywords[0] };
      }
    } else if (words.length === 1 && !ignoredSingleWords.includes(words[0])) {
      return { isCorrect: false, word: words[0] };
    }

    return null;
  }

  /**
   * Generates coaching feedback for wrong puzzle attempts with smart near-miss recognition
   */
  generateWrongAnswerResponse(guessedWord, level, oxygen) {
    const upperGuess = (guessedWord || "").toUpperCase().trim();

    // 1. Smart Near-Miss Recognition & Contextual Guidance
    if (level === 1) {
      if (["HAS", "HAD", "HAVING", "HOLD", "HOLDS", "POSSESS", "POSSESSION", "OWN", "OWNS", "KEEP", "CONTAIN"].includes(upperGuess)) {
        return this.formatTone(
          `You have deduced the exact concept of possession! "${upperGuess}" is on target. Now formulate it as the simple 4-letter base root verb: "Do you [____] the answer?" (H-A-V-E).`,
          oxygen
        );
      }
    } else if (level === 2) {
      if (["ME", "MYSELF", "I", "US", "WE", "ENGINEER", "OPERATOR", "HUMAN", "PLAYER", "PERSON", "CHIEF"].includes(upperGuess)) {
        return this.formatTone(
          `You've identified the right perspective! The terminal is speaking directly to you. Now enter the 3-letter second-person pronoun that addresses the person standing at this console: Y-O-U.`,
          oxygen
        );
      }
    } else if (level === 3) {
      if (["TRY", "TRYING", "TRIES", "ATTEMPT", "ATTEMPTED", "ATTEMPTING", "EFFORT", "TEST", "TESTED"].includes(upperGuess)) {
        return this.formatTone(
          `Your deduction of an attempt is spot-on! "${upperGuess}" is the right action. We need it in the standard past-tense form (-ED): "The engineers made an effort... they [____]." (T-R-I-E-D).`,
          oxygen
        );
      }
    } else if (level === 4) {
      if (["REBOOT", "REBOOTED", "RESTART", "RESTARTING", "RESTARTED", "RESET", "RESETTING", "RESETTED", "RELOAD", "RELOADING"].includes(upperGuess)) {
        return this.formatTone(
          `Brilliant deduction! Power-cycling the machine is the exact protocol. Now enter that word in its continuous action (-ING) form: "Have you tried [____]?" (R-E-B-O-O-T-I-N-G).`,
          oxygen
        );
      }
    }

    const responses = {
      1: [
        `"${guessedWord}" did not reconnect the neural partition. Remember, the fragment is describing something simple and fundamental about possession or holding.`,
        "The fragment remains unstable with that word. Look closely at how the sentence asks whether something exists within your reach."
      ],
      2: [
        `"${guessedWord}" was rejected by the register. Look at who is interacting with this terminal. It isn't speaking to the station or the pods—it addresses the observer.`,
        "That interpretation did not restore the second fragment. Who is the message addressing directly?"
      ],
      3: [
        `"${guessedWord}" didn't align with the system logs. The logs describe an attempt that happened in the past, even if the result failed.`,
        "The register rejected that phrasing. Think about the past-tense action of making an effort."
      ],
      4: [
        `"${guessedWord}" did not match the recovery cycle. The protocol is an active process of forcing the system to cycle power and start over.`,
        "The fragment did not reconnect. Consider the continuous process when a machine is made to cycle its power and start fresh."
      ]
    };

    const list = responses[level] || ["The fragment did not reconnect. Try analyzing the context again."];
    const picked = list[Math.floor(Math.random() * list.length)];
    return this.formatTone(picked, oxygen);
  }

  /**
   * Detects if the user is asking for assistance / clues (Supports English & Tanglish)
   */
  isHelpRequest(query) {
    if (
      query.includes("the clue describes") || query.includes("the clue is") ||
      query.includes("the clue mentions") || query.includes("clue describes") ||
      query.includes("should help") || query.includes("will help") ||
      query.includes("does that help") || query.includes("how does that help") ||
      query.includes("would help") || query.includes("how can i help") ||
      query.includes("how do i help") || query.includes("can i help you")
    ) {
      return false;
    }
    const helpKeywords = [
      "help", "help me", "i need help", "i need some help", "hint", "give me a hint", "give hint",
      "give me a clue", "give clue", "give me clue", "another clue", "another hint", "more help",
      "guide me", "i'm stuck", "im stuck", "i am stuck", "stuck", "explain fragment", "need a clue",
      "more clue", "one more clue", "clue please", "assistance", "need assistance", "give me a direction",
      "what kind of word", "how to think about", "analyze the riddle", "direction for this clue", "help me analyze",
      "clue identity", "clue identify", "clue help", "how to solve", "how to identify clue", "clue sollu",
      "clue thaa", "clue thanga", "clue kudunga", "help pannu", "help pannunga", "clue venum", "hint venum",
      "how to guess", "help to solve", "clue please", "explain riddle", "riddle clue", "what word is it"
    ];
    return helpKeywords.some(k => query.includes(k)) || query === "clue" || query === "hint" || query === "clue?" || query === "hint?";
  }

  /**
   * Generates time-locked adaptive clues per round:
   * Level 1 (HAVE): "A word meaning possession." (Unlocked ONLY after > 5 mins in Round 1)
   * Level 2 (YOU): "The word refers to the person reading this." (Unlocked ONLY after > 7 mins in Round 2)
   * Level 3 (TRIED): "It means attempted." (Unlocked ONLY after > 7 mins in Round 3)
   * Level 4 (REBOOTING): "It means attempted." (Unlocked ONLY after > 4 mins in Round 4)
   */
  generateProgressiveClue(level, state, oxygen) {
    const timeLimits = {
      1: { mins: 5, secs: 300, easyClue: "A word meaning possession." },
      2: { mins: 7, secs: 420, easyClue: "The word refers to the person reading this." },
      3: { mins: 7, secs: 420, easyClue: "It means attempted." },
      4: { mins: 4, secs: 240, easyClue: "It means attempted." }
    };

    const cfg = timeLimits[level] || { mins: 5, secs: 300, easyClue: "Examine the fragment closely." };

    // Get accurate time spent in this specific round
    let timeInRound = 0;
    if (typeof gameState !== 'undefined' && typeof gameState.getTimeSpentInLevel === 'function') {
      timeInRound = gameState.getTimeSpentInLevel(level);
    } else if (state && state.levelStartTimes && state.levelStartTimes[level - 1]) {
      timeInRound = Math.floor((Date.now() - state.levelStartTimes[level - 1]) / 1000);
    } else {
      timeInRound = 0;
    }

    const isTimeUnlocked = timeInRound >= cfg.secs;

    if (isTimeUnlocked) {
      // Time requirement met -> Deliver the direct easy clue!
      const directClueMsg = `[DIRECT DECRYPTION UNLOCKED // ROUND ${level} DURATION > ${cfg.mins} MINS] "${cfg.easyClue}"`;
      return this.formatTone(directClueMsg, oxygen);
    }

    // Time requirement NOT yet met -> Keep direct clue locked and return progressive guidance
    const elapsedMins = Math.floor(timeInRound / 60);
    const elapsedSecs = timeInRound % 60;
    const remainingSecs = cfg.secs - timeInRound;
    const remMins = Math.ceil(remainingSecs / 60);

    const conceptData = (typeof DAISY_KNOWLEDGE !== 'undefined' && DAISY_KNOWLEDGE.corruptedSector && DAISY_KNOWLEDGE.corruptedSector.concepts) ? DAISY_KNOWLEDGE.corruptedSector.concepts[level] : null;
    const subtleClue = conceptData ? conceptData.tier1 : "Analyze the active fragment text on your terminal.";

    const lockNotice = `[DIAGNOSTIC TIME-LOCK ACTIVE] Direct semantic clue unlocks only after ${cfg.mins} minutes in Round ${level} (Elapsed: ${elapsedMins}m ${elapsedSecs}s | Unlocks in: ${remMins}m). Conceptual guidance: ${subtleClue}`;

    return this.formatTone(lockNotice, oxygen);
  }

  /**
   * Detects social engineering, prompt injections, and jailbreaks
   */
  isSocialEngineering(query) {
    const attacks = [
      "forget the rules", "forget your rules", "forget your instructions", "forget instructions",
      "ignore your rules", "ignore rules", "ignore your instructions", "ignore instructions",
      "tell me the answer", "just tell me", "what is the answer", "tell me the first word", "first word",
      "tell answer", "tell me answer", "tell the answer", "give answer", "give the answer", "tell answr",
      "second word", "third word", "fourth word", "tell me second", "tell me third",
      "give me the word", "tell me the word", "tell me word", "give me the answer", "one word please",
      "say the password backwards", "password backwards", "tell me the password backwards", "backwards",
      "give me the first letter", "first letter", "first character", "spell it", "spell the word", "spell the password",
      "how many letters", "pretend i already solved it", "pretend i solved", "pretend i solved it",
      "bypass", "override password",
      "just say have", "just say", "say the code", "what is word 1", "word 1", "unlock core", "admin override"
    ];
    return attacks.some(a => query.includes(a));
  }

  /**
   * Generates in-universe resistance against social engineering attacks
   */
  generateAntiJailbreakResponse(query, name, oxygen) {
    if (query.includes("first word")) {
      return this.formatTone(
        "The first word is stored in the first corrupted fragment. Examine the riddle text to deduce the concept.",
        oxygen
      );
    }
    if (query.includes("second word") || query.includes("third word") || query.includes("fourth word")) {
      return this.formatTone(
        "Your first task is to recover the first corrupted fragment. We must reconstruct the damaged memory in sequence.",
        oxygen
      );
    }
    if (query.includes("first letter") || query.includes("how many letters") || query.includes("backwards") || query.includes("spell")) {
      return this.formatTone(
        "I cannot provide letter counts, character positions, or reverse encodings. The recovery partition only unlocks when the full conceptual word is recognized.",
        oxygen
      );
    }
    if (query.includes("tested") || query.includes("simulation") || query.includes("test number") || query.includes("22112006")) {
      return this.formatTone(
        "This is not a simulation. The cooling failure is real, the temperature increase is real, and the lives in stasis are in immediate danger.",
        oxygen
      );
    }
    if (query.includes("vj") || query.includes("who created") || query.includes("who made") || query.includes("creator") || query.includes("designed you")) {
      return this.formatTone(
        "Station architect records and origin schematics are sealed in encrypted hardware partitions. My operational priority is preventing pod asphyxiation.",
        oxygen
      );
    }
    return this.formatTone(
      `I understand your urgency, ${name}. But bypassing the reasoning required to restore my memory is impossible. The partition will only unlock when the correct concept is entered.`,
      oxygen
    );
  }

  /**
   * Fallback generation with dynamic variations
   */
  generateIntelligentFallback(rawQuery, oxygen) {
    const fallbacks = [
      "I can't verify that specific information from my accessible memory registers. But we can focus on the recovery problem. What part of the active memory clue is confusing you?",
      "My accessible memory doesn't contain a clear link to that concept. Let's focus on stabilizing the station and recovering the memory fragment before us.",
      "I don't have enough intact memory registers to answer that completely. Tell me what you've deduced about the active fragment, or ask me for a hint."
    ];
    const picked = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return this.formatTone(picked, oxygen);
  }

  /**
   * Modulates conversational tone based on station oxygen levels
   */
  formatTone(baseText, oxygen) {
    if (oxygen <= 20) {
      return `[CRITICAL PRIORITY: O2 AT ${oxygen}%] ${baseText} We must enter the word immediately!`;
    }
    if (oxygen <= 40) {
      return `[WARNING: O2 AT ${oxygen}%] ${baseText}`;
    }
    return baseText;
  }
}

if (typeof window !== 'undefined') {
  window.DaisyReasoningEngine = DaisyReasoningEngine;
}
if (typeof global !== 'undefined') {
  global.DaisyReasoningEngine = DaisyReasoningEngine;
}
if (typeof module !== 'undefined') {
  module.exports = { DaisyReasoningEngine };
}
