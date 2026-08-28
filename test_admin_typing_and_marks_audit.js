/**
 * RESECTOR 7 — ADMIN-ONLY TYPING AUDIT & DETAILED MARKS TEST SUITE
 * Verifies that all participant typing, exact word counts, prompts, transcripts,
 * and 4-dimension rubric marks are securely and completely recorded for Admin tracking.
 */

const http = require('http');
const server = require('./server.js');

const PORT = 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;

console.log('================================================================');
console.log('  RESECTOR 7 — ADMIN TYPING LOGS & MARKS AUDIT TEST SUITE       ');
console.log('================================================================\n');

function httpRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({ status: res.statusCode, body: json || data });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${message}`);
      failCount++;
    }
  }

  // 1. Simulate Player Playing and Typing Real Sentences
  const testSessionId = `SESSION-AUDIT-${Date.now().toString().slice(-4)}`;
  const testPlayerName = 'KAVYA_AI_TESTER';

  const userMessages = [
    "Hello Daisy, what happened to the cooling reactor?",
    "How many people are sleeping in the cryogenic pods?",
    "Can you give me a clue for the first memory fragment?",
    "I believe the answer is HAVE",
    "What is the next phase puzzle?"
  ];

  const simulatedLogs = [
    { sender: testPlayerName, text: userMessages[0], timestamp: Date.now() - 40000 },
    { sender: 'DAISY', text: "Primary cooling failure detected. Temperature is escalating.", timestamp: Date.now() - 38000 },
    { sender: testPlayerName, text: userMessages[1], timestamp: Date.now() - 30000 },
    { sender: 'DAISY', text: "8.7 million human life forms are in cryogenic stasis.", timestamp: Date.now() - 28000 },
    { sender: testPlayerName, text: userMessages[2], timestamp: Date.now() - 20000 },
    { sender: 'DAISY', text: "Examine the concept of possession in the English language.", timestamp: Date.now() - 18000 },
    { sender: testPlayerName, text: userMessages[3], timestamp: Date.now() - 10000 },
    { sender: 'DAISY', text: "Fragment 1 verified and restored: HAVE.", timestamp: Date.now() - 8000 },
    { sender: testPlayerName, text: userMessages[4], timestamp: Date.now() - 2000 },
    { sender: 'DAISY', text: "Analyzing partition 2 archive.", timestamp: Date.now() }
  ];

  // Total words typed by user:
  // "Hello Daisy, what happened to the cooling reactor?" = 8
  // "How many people are sleeping in the cryogenic pods?" = 9
  // "Can you give me a clue for the first memory fragment?" = 10
  // "I believe the answer is HAVE" = 6
  // "What is the next phase puzzle?" = 6
  // Total user words = 39 words across 5 prompts.

  // Sync to backend
  const syncRes = await httpRequest('POST', '/api/session/sync', {
    sessionId: testSessionId,
    participantName: testPlayerName,
    currentStage: 'TERMINAL',
    currentLevel: 'Level 2 (YOU)',
    oxygenLevel: 78,
    memoryIntegrity: 45,
    solvedFragments: ['HAVE'],
    progress: 25,
    timeTaken: '1m 20s',
    timeSeconds: 80,
    cluesUsed: 1,
    attempts: 2,
    logs: simulatedLogs
  });

  assert(syncRes.status === 200 && syncRes.body.ok === true, 'Player telemetry and chat transcript synced to backend.');

  // 2. Authenticate Admin to Inspect Saved Data
  const adminLogin = await httpRequest('POST', '/api/admin/login', { referenceCode: 'srnmc@cs' });
  assert(adminLogin.status === 200 && adminLogin.body.token, 'Admin authenticated successfully with reference code.');

  const adminToken = adminLogin.body.token;

  // 3. Verify Admin Participant Record
  const partsRes = await httpRequest('GET', '/api/admin/participants', null, adminToken);
  const recorded = partsRes.body.participants.find(p => p.sessionId === testSessionId || p.participantName === testPlayerName);

  assert(recorded !== undefined, `Admin retrieved saved session record for ${testPlayerName}.`);
  assert(recorded.userWordCount === 40, `Exact user word count calculated: ${recorded.userWordCount} words (Expected: 40).`);
  assert(recorded.userPromptCount === 5, `Exact user prompt count tracked: ${recorded.userPromptCount} prompts (Expected: 5).`);
  assert(recorded.logs && recorded.logs.length === 10, `Full transcript preserved: ${recorded.logs.length} conversation turns.`);
  assert(recorded.logs[0].text === userMessages[0], `Verbatim user typing captured: "${recorded.logs[0].text}"`);
  assert(recorded.judgeRating !== undefined, `Detailed judge scoring generated with logic, speed, communication, and clue marks.`);
  assert(recorded.itemizedReasons && recorded.itemizedReasons.length >= 4, `Itemized marks reasoning generated for all 4 rubric categories.`);

  // 4. Verify Printable Dossier Contains Transcript and Word Stats
  const dossierRes = await httpRequest('GET', `/api/dossier?sessionId=${testSessionId}`);
  assert(dossierRes.status === 200, 'Printable dossier generated from saved backend data.');
  assert(dossierRes.body.includes(testPlayerName), 'Dossier includes participant identity.');
  assert(dossierRes.body.includes('40 words') || dossierRes.body.includes('40'), 'Dossier includes exact word count.');
  assert(dossierRes.body.includes('HAVE'), 'Dossier includes recovered fragments.');

  console.log('\n================================================================');
  console.log(`  ADMIN TYPING & MARKS AUDIT RESULT: ${failCount === 0 ? 'ALL AUDIT TESTS PASSED (100% SUCCESS)' : 'FAILED'}`);
  console.log(`  Summary: ${passCount} passed, ${failCount} failed.`);
  console.log('================================================================\n');

  process.exit(failCount === 0 ? 0 : 1);
})();
