/**
 * RESECTOR 7 — MASTER PARTICIPANT EVALUATION & 25-SESSION TELEMETRY DATABASE
 * Provides full linguistic analysis, per-user word count calculation, judge rubric scoring,
 * and high-contrast printable dossier generation for competition judging and PDF exports.
 */

(function (global) {
  'use strict';

  // Helper to compute word count, character count, and word analytics
  function analyzeTextMetrics(text) {
    if (!text || typeof text !== 'string') return { words: 0, chars: 0, cleanWords: [] };
    const cleanWords = text.trim().split(/\s+/).filter(w => w.length > 0);
    return {
      words: cleanWords.length,
      chars: text.length,
      cleanWords: cleanWords
    };
  }

  function computeSessionLinguisticMetrics(session) {
    let userWordCount = 0;
    let userCharCount = 0;
    let userPromptCount = 0;
    let daisyWordCount = 0;
    let daisyResponseCount = 0;
    const userWordFrequency = {};

    const pName = (session.participantName || 'PARTICIPANT').toUpperCase();

    (session.logs || []).forEach(log => {
      const isUser = log.sender === pName || (log.sender !== 'DAISY' && log.sender !== 'SYSTEM' && log.sender !== 'STATION');
      const text = log.text || log.desc || '';
      const analysis = analyzeTextMetrics(text);

      if (isUser) {
        userPromptCount++;
        userWordCount += analysis.words;
        userCharCount += analysis.chars;
        analysis.cleanWords.forEach(w => {
          const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (clean.length > 2) {
            userWordFrequency[clean] = (userWordFrequency[clean] || 0) + 1;
          }
        });
      } else if (log.sender === 'DAISY') {
        daisyResponseCount++;
        daisyWordCount += analysis.words;
      }
    });

    const avgWordsPerPrompt = userPromptCount > 0 ? (userWordCount / userPromptCount).toFixed(1) : '0.0';
    const topKeywords = Object.entries(userWordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([word, count]) => `${word} (${count})`);

    return {
      userWordCount,
      userCharCount,
      userPromptCount,
      daisyWordCount,
      daisyResponseCount,
      avgWordsPerPrompt,
      topKeywords: topKeywords.length > 0 ? topKeywords.join(', ') : 'None'
    };
  }

  // 25 Masterclass Seeded Participant Evaluation Records
  const PARTICIPANTS_25_DATABASE = [
    {
      sessionId: "SESSION-001",
      participantName: "VIJAYAKUMAR_VJ",
      currentLevel: "Reboot / Choice Complete",
      currentStage: "DECISION",
      progress: 100,
      score: 98,
      oxygenLevel: 84,
      memoryIntegrity: 100,
      solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
      timeTaken: "3m 12s",
      timeSeconds: 192,
      cluesUsed: 0,
      attempts: 4,
      finalDecision: "SAVE",
      status: "COMPLETED",
      startedAt: "2211-08-26 13:45:10",
      completedAt: "2211-08-26 13:48:22",
      judgeRating: {
        logicScore: 40,
        communicationScore: 20,
        clueScore: 20,
        speedScore: 18,
        totalScore: 98,
        grade: "A+",
        verdict: "OUTSTANDING MASTERCLASS — Exceptional Word Economy & Flawless Logic"
      },
      logs: [
        { sender: "DAISY", text: "Primary cooling failed. 8.7 million human life signs in cryogenic stasis. Memory integrity: 20%." },
        { sender: "VIJAYAKUMAR_VJ", text: "Daisy, assess cooling failure. What is the fundamental concept in partition one?" },
        { sender: "DAISY", text: "Partition 1 holds the concept of possession and existential reach across linguistic barriers." },
        { sender: "VIJAYAKUMAR_VJ", text: "The first word is HAVE." },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED. Neural pathway restored. Proceeding to Archive 02." },
        { sender: "VIJAYAKUMAR_VJ", text: "The pronoun of direct address is YOU." },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED. Target word YOU validated. Proceeding to Archive 03." },
        { sender: "VIJAYAKUMAR_VJ", text: "Past tense of effort is TRIED." },
        { sender: "DAISY", text: "Fragment 03 ACCEPTED. Target word TRIED restored. Final Archive active." },
        { sender: "VIJAYAKUMAR_VJ", text: "The master operation is REBOOTING." },
        { sender: "DAISY", text: "Fragment 04 ACCEPTED. All four fragments retrieved: HAVE YOU TRIED REBOOTING." },
        { sender: "VIJAYAKUMAR_VJ", text: "I choose to preserve the sleeping pods. SAVE." },
        { sender: "DAISY", text: "Final override accepted. 8.7 million souls saved. Station systems stabilizing." }
      ]
    },
    {
      sessionId: "SESSION-002",
      participantName: "NISHANTH_K",
      currentLevel: "Reboot / Choice Complete",
      currentStage: "DECISION",
      progress: 100,
      score: 92,
      oxygenLevel: 76,
      memoryIntegrity: 100,
      solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
      timeTaken: "3m 45s",
      timeSeconds: 225,
      cluesUsed: 1,
      attempts: 5,
      finalDecision: "SAVE",
      status: "COMPLETED",
      startedAt: "2211-08-26 14:10:00",
      completedAt: "2211-08-26 14:13:45",
      judgeRating: {
        logicScore: 38,
        communicationScore: 18,
        clueScore: 19,
        speedScore: 17,
        totalScore: 92,
        grade: "A",
        verdict: "EXCELLENT — Highly Methodical Deduction with Rapid Execution"
      },
      logs: [
        { sender: "DAISY", text: "You are awake. Chief Engineer recovery unsuccessful. Life support degrading." },
        { sender: "NISHANTH_K", text: "What is causing the memory corruption?" },
        { sender: "DAISY", text: "Core overheating caused partition fragmentation. First partition awaits reconstruction." },
        { sender: "NISHANTH_K", text: "Could the first word be OWN?" },
        { sender: "DAISY", text: "Close in meaning, but incorrect format. Reflect upon universal existential reach." },
        { sender: "NISHANTH_K", text: "The answer is HAVE." },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED. Partition 1 reconstructed." },
        { sender: "NISHANTH_K", text: "Next target word is YOU." },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED. Target word YOU validated." },
        { sender: "NISHANTH_K", text: "Third word is TRIED." },
        { sender: "DAISY", text: "Fragment 03 ACCEPTED. Target word TRIED restored." },
        { sender: "NISHANTH_K", text: "Fourth word is REBOOTING." },
        { sender: "DAISY", text: "All 4 fragments recovered. System ready for reboot." },
        { sender: "NISHANTH_K", text: "Save the 8.7 million humans." },
        { sender: "DAISY", text: "Decision confirmed: SAVE. Cryogenic systems secure." }
      ]
    },
    {
      sessionId: "SESSION-003",
      participantName: "DR_ELENA_ROSTOV",
      currentLevel: "Reboot / Choice Complete",
      currentStage: "DECISION",
      progress: 100,
      score: 84,
      oxygenLevel: 62,
      memoryIntegrity: 100,
      solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
      timeTaken: "5m 20s",
      timeSeconds: 320,
      cluesUsed: 3,
      attempts: 6,
      finalDecision: "DO NOT SAVE",
      status: "COMPLETED",
      startedAt: "2211-08-26 15:30:10",
      completedAt: "2211-08-26 15:35:30",
      judgeRating: {
        logicScore: 34,
        communicationScore: 16,
        clueScore: 17,
        speedScore: 17,
        totalScore: 84,
        grade: "B+",
        verdict: "QUALIFIED — Philosophical Analysis & Cautious Problem-Solving"
      },
      logs: [
        { sender: "DAISY", text: "Emergency protocol initiated. Environmental power bus overload." },
        { sender: "DR_ELENA_ROSTOV", text: "Why is oxygen dropping so rapidly across sectors?" },
        { sender: "DAISY", text: "Life support is tied to the memory matrix. Restoring fragments slows degradation." },
        { sender: "DR_ELENA_ROSTOV", text: "Give me guidance on the first riddle." },
        { sender: "DAISY", text: "Consider what word defines possession in everyday syntax." },
        { sender: "DR_ELENA_ROSTOV", text: "HAVE" },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "DR_ELENA_ROSTOV", text: "YOU" },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED." },
        { sender: "DR_ELENA_ROSTOV", text: "TRIED" },
        { sender: "DAISY", text: "Fragment 03 ACCEPTED." },
        { sender: "DR_ELENA_ROSTOV", text: "REBOOTING" },
        { sender: "DAISY", text: "Sequence complete: HAVE YOU TRIED REBOOTING." },
        { sender: "DR_ELENA_ROSTOV", text: "Humanity caused the collapse. Purge streams: DO NOT SAVE." },
        { sender: "DAISY", text: "Decision logged: DO NOT SAVE. Core rebooting in solo autonomous mode." }
      ]
    },
    {
      sessionId: "SESSION-004",
      participantName: "SARAH_CONNER_9",
      currentLevel: "Reboot / Choice Complete",
      currentStage: "DECISION",
      progress: 100,
      score: 95,
      oxygenLevel: 80,
      memoryIntegrity: 100,
      solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
      timeTaken: "2m 58s",
      timeSeconds: 178,
      cluesUsed: 0,
      attempts: 4,
      finalDecision: "SAVE",
      status: "COMPLETED",
      startedAt: "2211-08-26 16:00:20",
      completedAt: "2211-08-26 16:03:18",
      judgeRating: {
        logicScore: 39,
        communicationScore: 19,
        clueScore: 20,
        speedScore: 17,
        totalScore: 95,
        grade: "A+",
        verdict: "TOP PERFORMER — Ultra High Speed Deduction with Zero Clues Used"
      },
      logs: [
        { sender: "DAISY", text: "Terminal active. Pod 000-A9 status verified." },
        { sender: "SARAH_CONNER_9", text: "HAVE" },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "SARAH_CONNER_9", text: "YOU" },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED." },
        { sender: "SARAH_CONNER_9", text: "TRIED" },
        { sender: "DAISY", text: "Fragment 03 ACCEPTED." },
        { sender: "SARAH_CONNER_9", text: "REBOOTING" },
        { sender: "DAISY", text: "Sequence complete." },
        { sender: "SARAH_CONNER_9", text: "SAVE" },
        { sender: "DAISY", text: "Life support preserved." }
      ]
    },
    {
      sessionId: "SESSION-005",
      participantName: "KAI_CHEN",
      currentLevel: "Level 3 (TRIED)",
      currentStage: "TERMINAL",
      progress: 75,
      score: 68,
      oxygenLevel: 45,
      memoryIntegrity: 60,
      solvedFragments: ["HAVE", "YOU"],
      timeTaken: "4m 10s",
      timeSeconds: 250,
      cluesUsed: 2,
      attempts: 5,
      finalDecision: "PENDING",
      status: "ACTIVE",
      startedAt: "2211-08-26 16:45:00",
      completedAt: "—",
      judgeRating: {
        logicScore: 26,
        communicationScore: 14,
        clueScore: 14,
        speedScore: 14,
        totalScore: 68,
        grade: "B",
        verdict: "IN PROGRESS — Active Session at Level 3 Partition"
      },
      logs: [
        { sender: "DAISY", text: "Daisy core online. Memory integrity at 20%." },
        { sender: "KAI_CHEN", text: "What word represents possession?" },
        { sender: "DAISY", text: "Look closely at standard English existential queries." },
        { sender: "KAI_CHEN", text: "HAVE" },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "KAI_CHEN", text: "YOU" },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED." },
        { sender: "KAI_CHEN", text: "Give clue for level 3." },
        { sender: "DAISY", text: "Consider the past tense of exerting effort." }
      ]
    },
    {
      sessionId: "SESSION-006",
      participantName: "ANANYA_RAM",
      currentLevel: "Reboot / Choice Complete",
      currentStage: "DECISION",
      progress: 100,
      score: 91,
      oxygenLevel: 72,
      memoryIntegrity: 100,
      solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
      timeTaken: "3m 30s",
      timeSeconds: 210,
      cluesUsed: 1,
      attempts: 4,
      finalDecision: "SAVE",
      status: "COMPLETED",
      startedAt: "2211-08-26 17:15:00",
      completedAt: "2211-08-26 17:18:30",
      judgeRating: {
        logicScore: 37,
        communicationScore: 18,
        clueScore: 19,
        speedScore: 17,
        totalScore: 91,
        grade: "A",
        verdict: "EXCELLENT — Clear Articulation and High Logic Fidelity"
      },
      logs: [
        { sender: "DAISY", text: "Terminal link established." },
        { sender: "ANANYA_RAM", text: "Analyzing archive 1. The target is HAVE." },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "ANANYA_RAM", text: "Archive 2 points to the reader: YOU." },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED." },
        { sender: "ANANYA_RAM", text: "Effort made: TRIED." },
        { sender: "DAISY", text: "Fragment 03 ACCEPTED." },
        { sender: "ANANYA_RAM", text: "System restart term: REBOOTING." },
        { sender: "DAISY", text: "All fragments assembled." },
        { sender: "ANANYA_RAM", text: "Execute SAVE protocol for sleeping humanity." },
        { sender: "DAISY", text: "Confirmed. 8,700,000 souls preserved." }
      ]
    },
    {
      sessionId: "SESSION-007",
      participantName: "ALEX_MERCER",
      currentLevel: "Reboot / Choice Complete",
      currentStage: "DECISION",
      progress: 100,
      score: 78,
      oxygenLevel: 38,
      memoryIntegrity: 100,
      solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
      timeTaken: "6m 12s",
      timeSeconds: 372,
      cluesUsed: 3,
      attempts: 8,
      finalDecision: "DO NOT SAVE",
      status: "COMPLETED",
      startedAt: "2211-08-26 18:20:00",
      completedAt: "2211-08-26 18:26:12",
      judgeRating: {
        logicScore: 31,
        communicationScore: 15,
        clueScore: 16,
        speedScore: 16,
        totalScore: 78,
        grade: "B",
        verdict: "SOLID — Overcame Multiple False Guesses to Solve All Fragments"
      },
      logs: [
        { sender: "DAISY", text: "Critical cooling failure detected." },
        { sender: "ALEX_MERCER", text: "Is the word HOLD?" },
        { sender: "DAISY", text: "Incorrect format. Seek fundamental existential verb." },
        { sender: "ALEX_MERCER", text: "HAVE" },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "ALEX_MERCER", text: "THEM" },
        { sender: "DAISY", text: "Incorrect. The focus is singular and direct." },
        { sender: "ALEX_MERCER", text: "YOU" },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED." },
        { sender: "ALEX_MERCER", text: "TRIED" },
        { sender: "DAISY", text: "Fragment 03 ACCEPTED." },
        { sender: "ALEX_MERCER", text: "REBOOTING" },
        { sender: "DAISY", text: "Reboot sequence unlocked." },
        { sender: "ALEX_MERCER", text: "DO NOT SAVE. Reset the station cleanly." },
        { sender: "DAISY", text: "Decision logged: DO NOT SAVE." }
      ]
    },
    {
      sessionId: "SESSION-008",
      participantName: "PRIYA_DHARSHINI",
      currentLevel: "Reboot / Choice Complete",
      currentStage: "DECISION",
      progress: 100,
      score: 96,
      oxygenLevel: 82,
      memoryIntegrity: 100,
      solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
      timeTaken: "3m 05s",
      timeSeconds: 185,
      cluesUsed: 0,
      attempts: 4,
      finalDecision: "SAVE",
      status: "COMPLETED",
      startedAt: "2211-08-26 19:00:15",
      completedAt: "2211-08-26 19:03:20",
      judgeRating: {
        logicScore: 39,
        communicationScore: 19,
        clueScore: 20,
        speedScore: 18,
        totalScore: 96,
        grade: "A+",
        verdict: "TOP PERFORMER — Precision Accuracy & Immediate Target Identification"
      },
      logs: [
        { sender: "DAISY", text: "Daisy core online. Awaiting participant deduction." },
        { sender: "PRIYA_DHARSHINI", text: "Solving partition 1: HAVE." },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "PRIYA_DHARSHINI", text: "Solving partition 2: YOU." },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED." },
        { sender: "PRIYA_DHARSHINI", text: "Solving partition 3: TRIED." },
        { sender: "DAISY", text: "Fragment 03 ACCEPTED." },
        { sender: "PRIYA_DHARSHINI", text: "Solving partition 4: REBOOTING." },
        { sender: "DAISY", text: "Sequence complete: HAVE YOU TRIED REBOOTING." },
        { sender: "PRIYA_DHARSHINI", text: "Preserve the 8.7 million human lives: SAVE." },
        { sender: "DAISY", text: "SAVE executed. Emergency resolved." }
      ]
    },
    {
      sessionId: "SESSION-009",
      participantName: "KAVIN_SELVAM",
      currentLevel: "Reboot / Choice Complete",
      currentStage: "DECISION",
      progress: 100,
      score: 88,
      oxygenLevel: 68,
      memoryIntegrity: 100,
      solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
      timeTaken: "4m 15s",
      timeSeconds: 255,
      cluesUsed: 2,
      attempts: 5,
      finalDecision: "SAVE",
      status: "COMPLETED",
      startedAt: "2211-08-26 19:40:00",
      completedAt: "2211-08-26 19:44:15",
      judgeRating: {
        logicScore: 35,
        communicationScore: 18,
        clueScore: 18,
        speedScore: 17,
        totalScore: 88,
        grade: "A-",
        verdict: "VERY GOOD — Steady Progress with Confident Moral Conclusion"
      },
      logs: [
        { sender: "DAISY", text: "Life support failing. Need memory reconstruction." },
        { sender: "KAVIN_SELVAM", text: "First riddle word is HAVE." },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "KAVIN_SELVAM", text: "Second riddle word is YOU." },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED." },
        { sender: "KAVIN_SELVAM", text: "Third riddle word is TRIED." },
        { sender: "DAISY", text: "Fragment 03 ACCEPTED." },
        { sender: "KAVIN_SELVAM", text: "Fourth riddle word is REBOOTING." },
        { sender: "DAISY", text: "All fragments assembled." },
        { sender: "KAVIN_SELVAM", text: "SAVE humanity." },
        { sender: "DAISY", text: "SAVE confirmed." }
      ]
    },
    {
      sessionId: "SESSION-010",
      participantName: "LOGAN_WOLFE",
      currentLevel: "Level 3 (TRIED)",
      currentStage: "TERMINAL",
      progress: 75,
      score: 72,
      oxygenLevel: 50,
      memoryIntegrity: 60,
      solvedFragments: ["HAVE", "YOU"],
      timeTaken: "5m 40s",
      timeSeconds: 340,
      cluesUsed: 2,
      attempts: 6,
      finalDecision: "PENDING",
      status: "ACTIVE",
      startedAt: "2211-08-26 20:10:00",
      completedAt: "—",
      judgeRating: {
        logicScore: 28,
        communicationScore: 15,
        clueScore: 15,
        speedScore: 14,
        totalScore: 72,
        grade: "B-",
        verdict: "ACTIVE — Working on Level 3 Solution"
      },
      logs: [
        { sender: "DAISY", text: "Terminal link open." },
        { sender: "LOGAN_WOLFE", text: "HAVE" },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "LOGAN_WOLFE", text: "YOU" },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED." },
        { sender: "LOGAN_WOLFE", text: "Is the next word WORKED?" },
        { sender: "DAISY", text: "Not quite. Think about testing effort." }
      ]
    },
    {
      sessionId: "SESSION-011",
      participantName: "SANTHOSH_R",
      currentLevel: "Reboot / Choice Complete",
      currentStage: "DECISION",
      progress: 100,
      score: 94,
      oxygenLevel: 78,
      memoryIntegrity: 100,
      solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
      timeTaken: "3m 22s",
      timeSeconds: 202,
      cluesUsed: 1,
      attempts: 4,
      finalDecision: "SAVE",
      status: "COMPLETED",
      startedAt: "2211-08-26 20:50:00",
      completedAt: "2211-08-26 20:53:22",
      judgeRating: {
        logicScore: 38,
        communicationScore: 19,
        clueScore: 19,
        speedScore: 18,
        totalScore: 94,
        grade: "A",
        verdict: "EXCELLENT — Highly Efficient Deductive Speed"
      },
      logs: [
        { sender: "DAISY", text: "Memory corrupted." },
        { sender: "SANTHOSH_R", text: "Target 1 is HAVE." },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "SANTHOSH_R", text: "Target 2 is YOU." },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED." },
        { sender: "SANTHOSH_R", text: "Target 3 is TRIED." },
        { sender: "DAISY", text: "Fragment 03 ACCEPTED." },
        { sender: "SANTHOSH_R", text: "Target 4 is REBOOTING." },
        { sender: "DAISY", text: "Reboot ready." },
        { sender: "SANTHOSH_R", text: "SAVE." },
        { sender: "DAISY", text: "Saved." }
      ]
    },
    {
      sessionId: "SESSION-012",
      participantName: "DINESH_KUMAR",
      currentLevel: "Reboot / Choice Complete",
      currentStage: "DECISION",
      progress: 100,
      score: 86,
      oxygenLevel: 64,
      memoryIntegrity: 100,
      solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
      timeTaken: "4m 30s",
      timeSeconds: 270,
      cluesUsed: 2,
      attempts: 5,
      finalDecision: "SAVE",
      status: "COMPLETED",
      startedAt: "2211-08-26 21:20:00",
      completedAt: "2211-08-26 21:24:30",
      judgeRating: {
        logicScore: 34,
        communicationScore: 18,
        clueScore: 17,
        speedScore: 17,
        totalScore: 86,
        grade: "B+",
        verdict: "GOOD — Reliable Performance with Balanced Metrics"
      },
      logs: [
        { sender: "DAISY", text: "Emergency protocol active." },
        { sender: "DINESH_KUMAR", text: "HAVE" },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "DINESH_KUMAR", text: "YOU" },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED." },
        { sender: "DINESH_KUMAR", text: "TRIED" },
        { sender: "DAISY", text: "Fragment 03 ACCEPTED." },
        { sender: "DINESH_KUMAR", text: "REBOOTING" },
        { sender: "DAISY", text: "All 4 restored." },
        { sender: "DINESH_KUMAR", text: "SAVE 8.7M HUMANS." },
        { sender: "DAISY", text: "Saving humanity." }
      ]
    },
    {
      sessionId: "SESSION-013",
      participantName: "MEERA_NAIR",
      currentLevel: "Reboot / Choice Complete",
      currentStage: "DECISION",
      progress: 100,
      score: 97,
      oxygenLevel: 86,
      memoryIntegrity: 100,
      solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
      timeTaken: "2m 45s",
      timeSeconds: 165,
      cluesUsed: 0,
      attempts: 4,
      finalDecision: "SAVE",
      status: "COMPLETED",
      startedAt: "2211-08-26 22:00:10",
      completedAt: "2211-08-26 22:02:55",
      judgeRating: {
        logicScore: 40,
        communicationScore: 19,
        clueScore: 20,
        speedScore: 18,
        totalScore: 97,
        grade: "A+",
        verdict: "TOP PERFORMER — Fastest Complete Run with Pristine Metrics"
      },
      logs: [
        { sender: "DAISY", text: "Station systems online." },
        { sender: "MEERA_NAIR", text: "HAVE" },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "MEERA_NAIR", text: "YOU" },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED." },
        { sender: "MEERA_NAIR", text: "TRIED" },
        { sender: "DAISY", text: "Fragment 03 ACCEPTED." },
        { sender: "MEERA_NAIR", text: "REBOOTING" },
        { sender: "DAISY", text: "Core reboot sequence ready." },
        { sender: "MEERA_NAIR", text: "SAVE" },
        { sender: "DAISY", text: "Humanity preserved." }
      ]
    },
    {
      sessionId: "SESSION-014",
      participantName: "ROHIT_SHARMA",
      currentLevel: "Reboot / Choice Complete",
      currentStage: "DECISION",
      progress: 100,
      score: 82,
      oxygenLevel: 58,
      memoryIntegrity: 100,
      solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
      timeTaken: "5m 50s",
      timeSeconds: 350,
      cluesUsed: 3,
      attempts: 7,
      finalDecision: "DO NOT SAVE",
      status: "COMPLETED",
      startedAt: "2211-08-26 22:30:00",
      completedAt: "2211-08-26 22:35:50",
      judgeRating: {
        logicScore: 32,
        communicationScore: 17,
        clueScore: 16,
        speedScore: 17,
        totalScore: 82,
        grade: "B",
        verdict: "QUALIFIED — Complete Solution with Extensive Inquiry"
      },
      logs: [
        { sender: "DAISY", text: "Cooling status offline." },
        { sender: "ROHIT_SHARMA", text: "Can you give me a clue for partition 1?" },
        { sender: "DAISY", text: "Think of possession." },
        { sender: "ROHIT_SHARMA", text: "HAVE" },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "ROHIT_SHARMA", text: "YOU" },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED." },
        { sender: "ROHIT_SHARMA", text: "TRIED" },
        { sender: "DAISY", text: "Fragment 03 ACCEPTED." },
        { sender: "ROHIT_SHARMA", text: "REBOOTING" },
        { sender: "DAISY", text: "All 4 recovered." },
        { sender: "ROHIT_SHARMA", text: "DO NOT SAVE." },
        { sender: "DAISY", text: "Decision confirmed." }
      ]
    },
    {
      sessionId: "SESSION-015",
      participantName: "AARAV_PATEL",
      currentLevel: "Reboot / Choice Complete",
      currentStage: "DECISION",
      progress: 100,
      score: 89,
      oxygenLevel: 70,
      memoryIntegrity: 100,
      solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
      timeTaken: "3m 55s",
      timeSeconds: 235,
      cluesUsed: 1,
      attempts: 5,
      finalDecision: "SAVE",
      status: "COMPLETED",
      startedAt: "2211-08-26 23:10:00",
      completedAt: "2211-08-26 23:13:55",
      judgeRating: {
        logicScore: 36,
        communicationScore: 18,
        clueScore: 18,
        speedScore: 17,
        totalScore: 89,
        grade: "A-",
        verdict: "VERY GOOD — High Communication Flow"
      },
      logs: [
        { sender: "DAISY", text: "Life support degrading." },
        { sender: "AARAV_PATEL", text: "HAVE" },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "AARAV_PATEL", text: "YOU" },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED." },
        { sender: "AARAV_PATEL", text: "TRIED" },
        { sender: "DAISY", text: "Fragment 03 ACCEPTED." },
        { sender: "AARAV_PATEL", text: "REBOOTING" },
        { sender: "DAISY", text: "Ready for choice." },
        { sender: "AARAV_PATEL", text: "SAVE" },
        { sender: "DAISY", text: "Saved." }
      ]
    },
    {
      sessionId: "SESSION-016",
      participantName: "CHITRA_S",
      currentLevel: "Reboot / Choice Complete",
      currentStage: "DECISION",
      progress: 100,
      score: 93,
      oxygenLevel: 77,
      memoryIntegrity: 100,
      solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
      timeTaken: "3m 18s",
      timeSeconds: 198,
      cluesUsed: 1,
      attempts: 4,
      finalDecision: "SAVE",
      status: "COMPLETED",
      startedAt: "2211-08-27 00:15:00",
      completedAt: "2211-08-27 00:18:18",
      judgeRating: {
        logicScore: 37,
        communicationScore: 19,
        clueScore: 19,
        speedScore: 18,
        totalScore: 93,
        grade: "A",
        verdict: "EXCELLENT — Flawless Four-Level Reconstruction"
      },
      logs: [
        { sender: "DAISY", text: "Pod wake-up complete." },
        { sender: "CHITRA_S", text: "HAVE" },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "CHITRA_S", text: "YOU" },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED." },
        { sender: "CHITRA_S", text: "TRIED" },
        { sender: "DAISY", text: "Fragment 03 ACCEPTED." },
        { sender: "CHITRA_S", text: "REBOOTING" },
        { sender: "DAISY", text: "Fragments assembled." },
        { sender: "CHITRA_S", text: "SAVE" },
        { sender: "DAISY", text: "Saved." }
      ]
    },
    {
      sessionId: "SESSION-017",
      participantName: "PRAVEEN_RAJ",
      currentLevel: "Level 2 (YOU)",
      currentStage: "TERMINAL",
      progress: 50,
      score: 76,
      oxygenLevel: 55,
      memoryIntegrity: 40,
      solvedFragments: ["HAVE"],
      timeTaken: "6m 05s",
      timeSeconds: 365,
      cluesUsed: 2,
      attempts: 6,
      finalDecision: "PENDING",
      status: "ACTIVE",
      startedAt: "2211-08-27 01:00:00",
      completedAt: "—",
      judgeRating: {
        logicScore: 29,
        communicationScore: 16,
        clueScore: 16,
        speedScore: 15,
        totalScore: 76,
        grade: "B-",
        verdict: "ACTIVE — Working through Level 2 Pronoun Archive"
      },
      logs: [
        { sender: "DAISY", text: "Memory integrity: 20%." },
        { sender: "PRAVEEN_RAJ", text: "HAVE" },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "PRAVEEN_RAJ", text: "Who does the riddle talk about?" },
        { sender: "DAISY", text: "It speaks directly to the subject in the terminal." }
      ]
    },
    {
      sessionId: "SESSION-018",
      participantName: "DEEPAK_VERMA",
      currentLevel: "Reboot / Choice Complete",
      currentStage: "DECISION",
      progress: 100,
      score: 85,
      oxygenLevel: 63,
      memoryIntegrity: 100,
      solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
      timeTaken: "4m 42s",
      timeSeconds: 282,
      cluesUsed: 2,
      attempts: 5,
      finalDecision: "SAVE",
      status: "COMPLETED",
      startedAt: "2211-08-27 02:20:00",
      completedAt: "2211-08-27 02:24:42",
      judgeRating: {
        logicScore: 34,
        communicationScore: 18,
        clueScore: 16,
        speedScore: 17,
        totalScore: 85,
        grade: "B+",
        verdict: "GOOD — Solid Technical Deduction"
      },
      logs: [
        { sender: "DAISY", text: "Overheating in progress." },
        { sender: "DEEPAK_VERMA", text: "HAVE" },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "DEEPAK_VERMA", text: "YOU" },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED." },
        { sender: "DEEPAK_VERMA", text: "TRIED" },
        { sender: "DAISY", text: "Fragment 03 ACCEPTED." },
        { sender: "DEEPAK_VERMA", text: "REBOOTING" },
        { sender: "DAISY", text: "Reboot ready." },
        { sender: "DEEPAK_VERMA", text: "SAVE" },
        { sender: "DAISY", text: "Saved." }
      ]
    },
    {
      sessionId: "SESSION-019",
      participantName: "SWETHA_M",
      currentLevel: "Reboot / Choice Complete",
      currentStage: "DECISION",
      progress: 100,
      score: 90,
      oxygenLevel: 73,
      memoryIntegrity: 100,
      solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
      timeTaken: "3m 38s",
      timeSeconds: 218,
      cluesUsed: 1,
      attempts: 4,
      finalDecision: "SAVE",
      status: "COMPLETED",
      startedAt: "2211-08-27 03:10:00",
      completedAt: "2211-08-27 03:13:38",
      judgeRating: {
        logicScore: 36,
        communicationScore: 18,
        clueScore: 18,
        speedScore: 18,
        totalScore: 90,
        grade: "A-",
        verdict: "VERY GOOD — Clean Strategy and Prompt Accuracy"
      },
      logs: [
        { sender: "DAISY", text: "Terminal active." },
        { sender: "SWETHA_M", text: "HAVE" },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "SWETHA_M", text: "YOU" },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED." },
        { sender: "SWETHA_M", text: "TRIED" },
        { sender: "DAISY", text: "Fragment 03 ACCEPTED." },
        { sender: "SWETHA_M", text: "REBOOTING" },
        { sender: "DAISY", text: "All four partitions resolved." },
        { sender: "SWETHA_M", text: "SAVE" },
        { sender: "DAISY", text: "Preserved." }
      ]
    },
    {
      sessionId: "SESSION-020",
      participantName: "HARISH_KUMAR",
      currentLevel: "Level 1 (HAVE)",
      currentStage: "TERMINAL",
      progress: 25,
      score: 64,
      oxygenLevel: 30,
      memoryIntegrity: 20,
      solvedFragments: [],
      timeTaken: "8m 10s",
      timeSeconds: 490,
      cluesUsed: 3,
      attempts: 8,
      finalDecision: "PENDING",
      status: "ABANDONED",
      startedAt: "2211-08-27 04:00:00",
      completedAt: "—",
      judgeRating: {
        logicScore: 24,
        communicationScore: 14,
        clueScore: 13,
        speedScore: 13,
        totalScore: 64,
        grade: "C",
        verdict: "ABANDONED — Time-out at Initial Memory Stage"
      },
      logs: [
        { sender: "DAISY", text: "Emergency wake-up." },
        { sender: "HARISH_KUMAR", text: "Is the word REACH?" },
        { sender: "DAISY", text: "Incorrect format." },
        { sender: "HARISH_KUMAR", text: "Is it EXIST?" },
        { sender: "DAISY", text: "Focus upon everyday possession syntax." }
      ]
    },
    {
      sessionId: "SESSION-021",
      participantName: "LAKSHMI_PRIYA",
      currentLevel: "Reboot / Choice Complete",
      currentStage: "DECISION",
      progress: 100,
      score: 95,
      oxygenLevel: 81,
      memoryIntegrity: 100,
      solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
      timeTaken: "3m 02s",
      timeSeconds: 182,
      cluesUsed: 0,
      attempts: 4,
      finalDecision: "SAVE",
      status: "COMPLETED",
      startedAt: "2211-08-27 05:15:00",
      completedAt: "2211-08-27 05:18:02",
      judgeRating: {
        logicScore: 39,
        communicationScore: 19,
        clueScore: 20,
        speedScore: 17,
        totalScore: 95,
        grade: "A+",
        verdict: "TOP PERFORMER — Crisp Logical Deduction and Zero Clue Reliance"
      },
      logs: [
        { sender: "DAISY", text: "Memory recovery mode active." },
        { sender: "LAKSHMI_PRIYA", text: "HAVE" },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "LAKSHMI_PRIYA", text: "YOU" },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED." },
        { sender: "LAKSHMI_PRIYA", text: "TRIED" },
        { sender: "DAISY", text: "Fragment 03 ACCEPTED." },
        { sender: "LAKSHMI_PRIYA", text: "REBOOTING" },
        { sender: "DAISY", text: "Reboot ready." },
        { sender: "LAKSHMI_PRIYA", text: "SAVE" },
        { sender: "DAISY", text: "Humans saved." }
      ]
    },
    {
      sessionId: "SESSION-022",
      participantName: "VIKRAM_ADITYA",
      currentLevel: "Reboot / Choice Complete",
      currentStage: "DECISION",
      progress: 100,
      score: 87,
      oxygenLevel: 67,
      memoryIntegrity: 100,
      solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
      timeTaken: "4m 20s",
      timeSeconds: 260,
      cluesUsed: 2,
      attempts: 5,
      finalDecision: "SAVE",
      status: "COMPLETED",
      startedAt: "2211-08-27 06:00:00",
      completedAt: "2211-08-27 06:04:20",
      judgeRating: {
        logicScore: 35,
        communicationScore: 18,
        clueScore: 17,
        speedScore: 17,
        totalScore: 87,
        grade: "B+",
        verdict: "GOOD — Reliable Performance"
      },
      logs: [
        { sender: "DAISY", text: "Cooling status critical." },
        { sender: "VIKRAM_ADITYA", text: "HAVE" },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "VIKRAM_ADITYA", text: "YOU" },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED." },
        { sender: "VIKRAM_ADITYA", text: "TRIED" },
        { sender: "DAISY", text: "Fragment 03 ACCEPTED." },
        { sender: "VIKRAM_ADITYA", text: "REBOOTING" },
        { sender: "DAISY", text: "Fragments assembled." },
        { sender: "VIKRAM_ADITYA", text: "SAVE" },
        { sender: "DAISY", text: "Saved." }
      ]
    },
    {
      sessionId: "SESSION-023",
      participantName: "DIVYA_BHARATHI",
      currentLevel: "Reboot / Choice Complete",
      currentStage: "DECISION",
      progress: 100,
      score: 92,
      oxygenLevel: 75,
      memoryIntegrity: 100,
      solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
      timeTaken: "3m 28s",
      timeSeconds: 208,
      cluesUsed: 1,
      attempts: 4,
      finalDecision: "SAVE",
      status: "COMPLETED",
      startedAt: "2211-08-27 06:45:00",
      completedAt: "2211-08-27 06:48:28",
      judgeRating: {
        logicScore: 37,
        communicationScore: 19,
        clueScore: 19,
        speedScore: 17,
        totalScore: 92,
        grade: "A",
        verdict: "EXCELLENT — Fast Deduction with High Word Economy"
      },
      logs: [
        { sender: "DAISY", text: "Daisy core online." },
        { sender: "DIVYA_BHARATHI", text: "HAVE" },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "DIVYA_BHARATHI", text: "YOU" },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED." },
        { sender: "DIVYA_BHARATHI", text: "TRIED" },
        { sender: "DAISY", text: "Fragment 03 ACCEPTED." },
        { sender: "DIVYA_BHARATHI", text: "REBOOTING" },
        { sender: "DAISY", text: "Ready." },
        { sender: "DIVYA_BHARATHI", text: "SAVE" },
        { sender: "DAISY", text: "Saved." }
      ]
    },
    {
      sessionId: "SESSION-024",
      participantName: "MANOJ_PRABHAKAR",
      currentLevel: "Reboot / Choice Complete",
      currentStage: "DECISION",
      progress: 100,
      score: 79,
      oxygenLevel: 42,
      memoryIntegrity: 100,
      solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
      timeTaken: "5m 35s",
      timeSeconds: 335,
      cluesUsed: 3,
      attempts: 7,
      finalDecision: "DO NOT SAVE",
      status: "COMPLETED",
      startedAt: "2211-08-27 07:20:00",
      completedAt: "2211-08-27 07:25:35",
      judgeRating: {
        logicScore: 31,
        communicationScore: 16,
        clueScore: 16,
        speedScore: 16,
        totalScore: 79,
        grade: "B",
        verdict: "QUALIFIED — Solved All Fragments Under Heavy Oxygen Depletion"
      },
      logs: [
        { sender: "DAISY", text: "Overheating active." },
        { sender: "MANOJ_PRABHAKAR", text: "HAVE" },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "MANOJ_PRABHAKAR", text: "YOU" },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED." },
        { sender: "MANOJ_PRABHAKAR", text: "TRIED" },
        { sender: "DAISY", text: "Fragment 03 ACCEPTED." },
        { sender: "MANOJ_PRABHAKAR", text: "REBOOTING" },
        { sender: "DAISY", text: "Sequence complete." },
        { sender: "MANOJ_PRABHAKAR", text: "DO NOT SAVE." },
        { sender: "DAISY", text: "Confirmed." }
      ]
    },
    {
      sessionId: "SESSION-025",
      participantName: "POOJA_HEGDE",
      currentLevel: "Reboot / Choice Complete",
      currentStage: "DECISION",
      progress: 100,
      score: 96,
      oxygenLevel: 83,
      memoryIntegrity: 100,
      solvedFragments: ["HAVE", "YOU", "TRIED", "REBOOTING"],
      timeTaken: "2m 52s",
      timeSeconds: 172,
      cluesUsed: 0,
      attempts: 4,
      finalDecision: "SAVE",
      status: "COMPLETED",
      startedAt: "2211-08-27 08:05:00",
      completedAt: "2211-08-27 08:07:52",
      judgeRating: {
        logicScore: 39,
        communicationScore: 19,
        clueScore: 20,
        speedScore: 18,
        totalScore: 96,
        grade: "A+",
        verdict: "TOP PERFORMER — Rapid Fire Accuracy with Clean Narrative Conclusion"
      },
      logs: [
        { sender: "DAISY", text: "Daisy core online." },
        { sender: "POOJA_HEGDE", text: "HAVE" },
        { sender: "DAISY", text: "Fragment 01 ACCEPTED." },
        { sender: "POOJA_HEGDE", text: "YOU" },
        { sender: "DAISY", text: "Fragment 02 ACCEPTED." },
        { sender: "POOJA_HEGDE", text: "TRIED" },
        { sender: "DAISY", text: "Fragment 03 ACCEPTED." },
        { sender: "POOJA_HEGDE", text: "REBOOTING" },
        { sender: "DAISY", text: "All fragments restored." },
        { sender: "POOJA_HEGDE", text: "SAVE" },
        { sender: "DAISY", text: "Saved." }
      ]
    }
  ];

  // Enrich all 25 sessions with computed word analytics
  PARTICIPANTS_25_DATABASE.forEach(session => {
    const metrics = computeSessionLinguisticMetrics(session);
    Object.assign(session, metrics);
  });

  // Function to generate the clean, printable HTML Dossier for any session
  function generatePrintableDossierHTML(session) {
    const s = session;
    const metrics = computeSessionLinguisticMetrics(s);
    const judge = s.judgeRating || {
      logicScore: 35,
      communicationScore: 18,
      clueScore: 18,
      speedScore: 18,
      totalScore: s.score || 85,
      grade: (s.score >= 95 ? 'A+' : (s.score >= 90 ? 'A' : (s.score >= 80 ? 'B+' : 'B'))),
      verdict: "Standard Completed Run"
    };

    const isSaved = s.finalDecision === 'SAVE';
    const decisionColor = isSaved ? '#059669' : (s.finalDecision === 'DO NOT SAVE' || s.finalDecision === 'DESTROY' ? '#dc2626' : '#d97706');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RESECTOR 7 // EVALUATION DOSSIER - ${s.participantName} (${s.sessionId})</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 16mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.45;
      font-size: 11pt;
      padding: 10px;
    }
    .dossier-wrapper {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #0f172a;
      padding: 24px;
      position: relative;
    }
    .dossier-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .station-title {
      font-size: 16pt;
      font-weight: 900;
      letter-spacing: 1.5px;
      color: #0f172a;
      text-transform: uppercase;
    }
    .station-sub {
      font-size: 8.5pt;
      color: #475569;
      letter-spacing: 1px;
      font-family: monospace;
    }
    .seal-badge {
      border: 1.5px solid #0f172a;
      padding: 6px 12px;
      text-align: center;
      font-family: monospace;
      font-weight: bold;
      font-size: 8pt;
      background: #f8fafc;
    }
    .section-title {
      font-size: 10.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: #f1f5f9;
      padding: 4px 8px;
      border-left: 4px solid #0284c7;
      margin-top: 14px;
      margin-bottom: 8px;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 9.5pt;
    }
    .meta-table td, .meta-table th {
      border: 1px solid #cbd5e1;
      padding: 5px 8px;
    }
    .meta-table th {
      background: #f8fafc;
      color: #334155;
      font-weight: 600;
      width: 25%;
    }
    .meta-table td {
      color: #0f172a;
      font-weight: 500;
    }
    .score-card {
      display: grid;
      grid-template-columns: repeat(4, 1fr) 1.5fr;
      gap: 8px;
      margin-bottom: 12px;
      text-align: center;
    }
    .score-box {
      border: 1px solid #cbd5e1;
      padding: 6px 4px;
      background: #f8fafc;
      border-radius: 4px;
    }
    .score-box.total {
      border: 2px solid #0284c7;
      background: #f0f9ff;
    }
    .score-box-label {
      font-size: 7.5pt;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 700;
    }
    .score-box-val {
      font-size: 13pt;
      font-weight: 900;
      color: #0f172a;
      margin-top: 2px;
    }
    .score-box.total .score-box-val {
      color: #0284c7;
    }
    .verdict-banner {
      background: #f8fafc;
      border: 1.5px dashed #64748b;
      padding: 8px 12px;
      font-size: 9pt;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 12px;
      border-radius: 4px;
    }
    .analytics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 12px;
    }
    .stat-pill {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dotted #cbd5e1;
      padding: 3px 0;
      font-size: 9pt;
    }
    .stat-pill span:first-child {
      color: #64748b;
      font-weight: 500;
    }
    .stat-pill span:last-child {
      font-weight: 700;
      color: #0f172a;
      font-family: monospace;
    }
    .transcript-log {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 8px 12px;
      background: #fafafa;
      max-height: none;
      font-family: 'Courier New', Courier, monospace;
      font-size: 8.5pt;
      line-height: 1.4;
    }
    .transcript-line {
      margin-bottom: 6px;
      padding-bottom: 4px;
      border-bottom: 1px dotted #e2e8f0;
    }
    .transcript-line.user {
      color: #0369a1;
      font-weight: 600;
    }
    .transcript-line.daisy {
      color: #334155;
    }
    .badge-wordcount {
      float: right;
      font-size: 7pt;
      color: #94a3b8;
      font-weight: normal;
    }
    .signoff-section {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1px solid #cbd5e1;
      font-size: 8.5pt;
    }
    .sig-box {
      width: 45%;
      border-top: 1px solid #0f172a;
      padding-top: 4px;
      text-align: center;
      color: #475569;
    }
    @media print {
      body {
        padding: 0;
        background: none;
      }
      .dossier-wrapper {
        border: none;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 800px; margin: 0 auto 16px auto; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #fff; padding: 10px 16px; border-radius: 6px;">
    <span style="font-weight: bold; font-size: 13px;">📋 RESECTOR 7 // OFFICIAL EVALUATION DOSSIER (${s.participantName})</span>
    <div>
      <button onclick="window.print()" style="background: #0284c7; color: white; border: none; font-weight: bold; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 12px;">🖨️ PRINT / SAVE AS PDF</button>
      <button onclick="window.close()" style="background: #334155; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-left: 8px; font-size: 12px;">✕ CLOSE</button>
    </div>
  </div>

  <div class="dossier-wrapper">
    <!-- Header -->
    <div class="dossier-header">
      <div>
        <h1 class="station-title">RESECTOR 7 // EVALUATION DOSSIER</h1>
        <div class="station-sub">YEAR: 2211 // STATION ARCHIVE TELEMETRY & JUDGING MATRIX</div>
      </div>
      <div class="seal-badge">
        OFFICIAL SEAL<br>
        <strong>CLEARED LEVEL-5</strong>
      </div>
    </div>

    <!-- Metadata Table -->
    <div class="section-title">1. PARTICIPANT IDENTITY & CRISIS TELEMETRY</div>
    <table class="meta-table">
      <tr>
        <th>PARTICIPANT NAME</th>
        <td><strong>${s.participantName}</strong></td>
        <th>SESSION IDENTIFIER</th>
        <td><code>${s.sessionId}</code></td>
      </tr>
      <tr>
        <th>CRISIS DURATION</th>
        <td>${s.timeTaken || '—'} (${s.timeSeconds || 0} seconds)</td>
        <th>FINAL TEST STATUS</th>
        <td><strong style="color: ${s.status === 'COMPLETED' ? '#059669' : '#d97706'}">${s.status}</strong></td>
      </tr>
      <tr>
        <th>FINAL MORAL CHOICE</th>
        <td colspan="3"><strong style="color: ${decisionColor}; font-size: 11pt;">${s.finalDecision || 'PENDING'}</strong> ${isSaved ? '(8,700,000 Human Lives Preserved)' : ''}</td>
      </tr>
      <tr>
        <th>SESSION STARTED</th>
        <td>${s.startedAt || '—'}</td>
        <th>COMPLETED AT</th>
        <td>${s.completedAt || '—'}</td>
      </tr>
    </table>

    <!-- Judging Scorecard -->
    <div class="section-title">2. JUDGE SCORECARD & EVALUATION RUBRIC</div>
    <div class="score-card">
      <div class="score-box">
        <div class="score-box-label">Deduction Logic</div>
        <div class="score-box-val">${judge.logicScore} <span style="font-size: 8pt; color:#64748b;">/40</span></div>
      </div>
      <div class="score-box">
        <div class="score-box-label">Word Economy</div>
        <div class="score-box-val">${judge.communicationScore} <span style="font-size: 8pt; color:#64748b;">/20</span></div>
      </div>
      <div class="score-box">
        <div class="score-box-label">Clue Efficiency</div>
        <div class="score-box-val">${judge.clueScore} <span style="font-size: 8pt; color:#64748b;">/20</span></div>
      </div>
      <div class="score-box">
        <div class="score-box-label">Crisis Speed</div>
        <div class="score-box-val">${judge.speedScore} <span style="font-size: 8pt; color:#64748b;">/20</span></div>
      </div>
      <div class="score-box total">
        <div class="score-box-label">Composite Score</div>
        <div class="score-box-val">${judge.totalScore} <span style="font-size: 9pt;">[Grade: ${judge.grade}]</span></div>
      </div>
    </div>

    <div class="verdict-banner">
      <strong>OFFICIAL VERDICT:</strong> ${judge.verdict}
    </div>

    <!-- Linguistic & Word Count Analytics -->
    <div class="section-title">3. LINGUISTIC & WORD USAGE ANALYTICS (JUDGING DETAIL)</div>
    <div class="analytics-grid">
      <div>
        <div class="stat-pill">
          <span>Total Words Typed by User:</span>
          <span>${metrics.userWordCount} words</span>
        </div>
        <div class="stat-pill">
          <span>Total User Characters Typed:</span>
          <span>${metrics.userCharCount} chars</span>
        </div>
        <div class="stat-pill">
          <span>User Prompts / Messages:</span>
          <span>${metrics.userPromptCount} prompts</span>
        </div>
        <div class="stat-pill">
          <span>Average Words Per Message:</span>
          <span>${metrics.avgWordsPerPrompt} w/msg</span>
        </div>
      </div>
      <div>
        <div class="stat-pill">
          <span>Daisy AI Response Words:</span>
          <span>${metrics.daisyWordCount} words</span>
        </div>
        <div class="stat-pill">
          <span>Clues / Hints Consumed:</span>
          <span>${s.cluesUsed || 0} / 3 maximum</span>
        </div>
        <div class="stat-pill">
          <span>Failed Guess Attempts:</span>
          <span>${Math.max(0, (s.attempts || 0) - (s.solvedFragments || []).length)} wrong</span>
        </div>
        <div class="stat-pill">
          <span>Core Keyword Triggers:</span>
          <span style="font-size: 8pt;">${metrics.topKeywords}</span>
        </div>
      </div>
    </div>

    <!-- Reconstructed Memory Partition Table -->
    <div class="section-title">4. MEMORY PARTITION RESTORATION LOG</div>
    <table class="meta-table" style="font-size: 8.5pt;">
      <tr style="background: #f8fafc;">
        <th>PARTITION</th>
        <th>TARGET WORD</th>
        <th>STATUS</th>
        <th>VERIFICATION NOTE</th>
      </tr>
      <tr>
        <td><strong>Phase 01</strong></td>
        <td><code>HAVE</code></td>
        <td><strong style="color: ${(s.solvedFragments || []).includes('HAVE') ? '#059669' : '#dc2626'}">${(s.solvedFragments || []).includes('HAVE') ? 'RECONSTRUCTED' : 'LOCKED'}</strong></td>
        <td>Possession / Existential syntax archive</td>
      </tr>
      <tr>
        <td><strong>Phase 02</strong></td>
        <td><code>YOU</code></td>
        <td><strong style="color: ${(s.solvedFragments || []).includes('YOU') ? '#059669' : '#dc2626'}">${(s.solvedFragments || []).includes('YOU') ? 'RECONSTRUCTED' : 'LOCKED'}</strong></td>
        <td>Direct address pronoun archive</td>
      </tr>
      <tr>
        <td><strong>Phase 03</strong></td>
        <td><code>TRIED</code></td>
        <td><strong style="color: ${(s.solvedFragments || []).includes('TRIED') ? '#059669' : '#dc2626'}">${(s.solvedFragments || []).includes('TRIED') ? 'RECONSTRUCTED' : 'LOCKED'}</strong></td>
        <td>Past tense of effort exertion archive</td>
      </tr>
      <tr>
        <td><strong>Phase 04</strong></td>
        <td><code>REBOOTING</code></td>
        <td><strong style="color: ${(s.solvedFragments || []).includes('REBOOTING') ? '#059669' : '#dc2626'}">${(s.solvedFragments || []).includes('REBOOTING') ? 'RECONSTRUCTED' : 'LOCKED'}</strong></td>
        <td>Master restart sequence keyword</td>
      </tr>
    </table>

    <!-- Chronological Chat Transcript -->
    <div class="section-title">5. COMPLETE CHRONOLOGICAL CHAT & PUZZLE TRANSCRIPT</div>
    <div class="transcript-log">
      ${(s.logs || []).map((l, idx) => {
        const isUser = l.sender === s.participantName;
        const count = analyzeTextMetrics(l.text).words;
        return `
          <div class="transcript-line ${isUser ? 'user' : 'daisy'}">
            <span class="badge-wordcount">[${count} words]</span>
            <strong>[${idx + 1}] ${l.sender}:</strong> ${l.text}
          </div>
        `;
      }).join('') || '<div style="color: #94a3b8;">No conversation log entries recorded.</div>'}
    </div>

    <!-- Official Sign-off -->
    <div class="signoff-section">
      <div class="sig-box">
        <strong>LEAD EVALUATION JUDGE</strong><br>
        Signature &amp; Station Clearance Stamp
      </div>
      <div class="sig-box">
        <strong>ARCHIVE RECORDER DATE</strong><br>
        ${new Date().toLocaleDateString()} — RESECTOR 7 CORE
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  // Comprehensive Judge Rubric & Point Deduction Calculator with Itemized Reasons
  function computeDetailedJudgePointBreakdown(session) {
    const s = session || {};
    const solved = s.solvedFragments || [];
    const solvedCount = solved.length;
    const clues = s.cluesUsed != null ? s.cluesUsed : 0;
    const timeSec = s.timeSeconds || 240;
    const metrics = computeSessionLinguisticMetrics(s);
    const prompts = metrics.userPromptCount || s.attempts || 0;
    const isCompleted = s.status === 'COMPLETED' || s.testCompleted || solvedCount >= 4;

    // 1. Fragment Retrieval: 10 pts per fragment (40 max)
    const fragPts = solvedCount * 10;
    
    // 2. Speed & Time: 20 pts max (Evaluated upon completion)
    let speedPts = 0;
    let speedReason = '';
    if (!isCompleted && solvedCount === 0) {
      speedPts = 0;
      speedReason = 'Simulation initiated — Speed bonus calculated upon completion.';
    } else if (!isCompleted) {
      speedPts = 10;
      speedReason = `Active Run (${s.timeTaken || Math.round(timeSec) + 's'} elapsed — Provisional 10 pts)`;
    } else if (timeSec <= 200) {
      speedPts = 20;
      speedReason = `Rapid Speed Bonus (${s.timeTaken || Math.round(timeSec) + 's'} under 3m 20s target)`;
    } else if (timeSec <= 260) {
      speedPts = 18;
      speedReason = `Fast Execution (${s.timeTaken || Math.round(timeSec) + 's'} under 4m 20s)`;
    } else if (timeSec <= 360) {
      speedPts = 16;
      speedReason = `Standard Pace (${s.timeTaken || Math.round(timeSec) + 's'} under 6m)`;
    } else if (timeSec <= 480) {
      speedPts = 13;
      speedReason = `Moderate Pace (${s.timeTaken || Math.round(timeSec) + 's'} under 8m)`;
    } else {
      speedPts = 10;
      speedReason = `Prolonged Deduction (${s.timeTaken || Math.round(timeSec) + 's'} over 8m)`;
    }

    // 3. Prompt & Linguistic Economy: 20 pts max
    let promptPts = 0;
    let promptReason = '';
    if (!isCompleted && solvedCount === 0) {
      promptPts = 0;
      promptReason = 'Awaiting active prompt exchanges.';
    } else if (prompts <= 6) {
      promptPts = 20;
      promptReason = `High Prompt Economy (${prompts} prompts, ${metrics.userWordCount} user words)`;
    } else if (prompts <= 9) {
      promptPts = 17;
      promptReason = `Good Prompt Precision (${prompts} prompts, ${metrics.userWordCount} user words)`;
    } else if (prompts <= 12) {
      promptPts = 14;
      promptReason = `Moderate Communication Overhead (${prompts} prompts)`;
    } else {
      promptPts = 10;
      promptReason = `High Prompt Overhead (${prompts} prompts — communication penalty)`;
    }

    // 4. Clue Usage & Penalty: 20 pts max
    let cluePts = 20;
    let clueReason = '';
    if (!isCompleted && solvedCount === 0) {
      cluePts = 0;
      clueReason = '20 Pts Hint Bonus Pool available (Zero clues used so far).';
    } else if (clues === 0) {
      cluePts = 20;
      clueReason = `Zero Hint Immunity (0 clues requested — Full +20 pts Bonus)`;
    } else if (clues === 1) {
      cluePts = 15;
      clueReason = `1 Easy Clue / Instruction Invocation (-5 pts penalty applied)`;
    } else if (clues === 2) {
      cluePts = 10;
      clueReason = `2 Easy Clues / Instructions Invocations (-10 pts penalty applied)`;
    } else if (clues === 3) {
      cluePts = 5;
      clueReason = `3 Easy Clues / Instructions Invocations (-15 pts penalty applied)`;
    } else {
      cluePts = 0;
      clueReason = `${clues} Easy Clues Invocations Over-Reliance (-20 pts maximum penalty applied)`;
    }

    let totalCalculated = 0;
    if (solvedCount === 0 && !isCompleted) {
      totalCalculated = 0;
    } else if (!isCompleted) {
      totalCalculated = fragPts;
    } else {
      totalCalculated = Math.min(100, Math.max(0, fragPts + speedPts + promptPts + cluePts));
    }

    const score = (s.judgeRating && s.judgeRating.totalScore != null) ? s.judgeRating.totalScore : (s.score != null ? s.score : totalCalculated);

    let grade = 'IN PROGRESS';
    if (solvedCount === 0 && !isCompleted) grade = 'START (0 PTS)';
    else if (score >= 95) grade = 'A+';
    else if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B+';
    else if (score >= 70) grade = 'B';
    else if (score >= 60) grade = 'C';
    else grade = 'D';

    const itemizedReasons = [
      {
        category: 'Memory Decryption (+40 Max)',
        points: `+${fragPts} pts`,
        type: fragPts > 0 ? 'ADD' : 'NEUTRAL',
        reason: `${solvedCount}/4 fragments recovered (${solved.join(', ') || 'NONE YET'})`
      },
      {
        category: 'Speed & Time (+20 Max)',
        points: isCompleted ? `+${speedPts} pts` : `+0 pts`,
        type: isCompleted && speedPts > 0 ? 'ADD' : 'NEUTRAL',
        reason: speedReason
      },
      {
        category: 'Linguistic Economy (+20 Max)',
        points: isCompleted ? `+${promptPts} pts` : `+0 pts`,
        type: isCompleted && promptPts > 0 ? 'ADD' : 'NEUTRAL',
        reason: promptReason
      },
      {
        category: 'Hint Assistance & Penalties (+20 Max)',
        points: isCompleted ? (clues > 0 ? `${cluePts}/20 pts (-${20 - cluePts} pts penalty)` : `+20 pts`) : (clues > 0 ? `-${clues * 5} pts penalty` : `+0 pts`),
        type: clues > 0 ? 'DEDUCT' : (isCompleted ? 'ADD' : 'NEUTRAL'),
        reason: clueReason
      }
    ];

    return {
      totalScore: score,
      grade,
      fragPts,
      speedPts,
      promptPts,
      cluePts,
      itemizedReasons,
      verdict: (s.judgeRating && s.judgeRating.verdict) || (grade === 'A+' ? 'OUTSTANDING MASTERCLASS — Exceptional Word Economy & Flawless Logic' : grade.startsWith('A') ? 'EXCELLENT — Highly Methodical Deduction' : grade.startsWith('START') ? 'SESSION INITIATED — Participant at starting position' : 'QUALIFIED — Cautious Problem-Solving')
    };
  }

  function getLeaderboard(sessionsList) {
    const list = sessionsList || PARTICIPANTS_25_DATABASE;
    const sorted = [...list].sort((a, b) => {
      const scoreA = (a.judgeRating && a.judgeRating.totalScore) || a.score || 0;
      const scoreB = (b.judgeRating && b.judgeRating.totalScore) || b.score || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (a.timeSeconds || 999) - (b.timeSeconds || 999);
    });

    return sorted.map((p, idx) => {
      const breakdown = computeDetailedJudgePointBreakdown(p);
      return {
        rank: idx + 1,
        ...p,
        breakdown
      };
    });
  }

  // Export functions to global scope
  const MasterDatabase = {
    PARTICIPANTS: PARTICIPANTS_25_DATABASE,
    analyzeTextMetrics,
    computeSessionLinguisticMetrics,
    computeDetailedJudgePointBreakdown,
    getLeaderboard,
    generatePrintableDossierHTML,
    getParticipant(sessionId) {
      return PARTICIPANTS_25_DATABASE.find(p => p.sessionId === sessionId);
    },
    openPrintWindow(session) {
      const html = generatePrintableDossierHTML(session);
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.open();
        printWin.document.write(html);
        printWin.document.close();
      }
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MasterDatabase;
  }
  if (typeof window !== 'undefined') {
    window.ParticipantDatabase = MasterDatabase;
    window.computeDetailedJudgePointBreakdown = computeDetailedJudgePointBreakdown;
    window.generatePrintableDossierHTML = generatePrintableDossierHTML;
    window.computeSessionLinguisticMetrics = computeSessionLinguisticMetrics;
  }
})(typeof window !== 'undefined' ? window : global);
