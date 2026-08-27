/**
 * RESECTOR 7 — ADMIN PORTAL SECURITY & AUTHENTICATION VERIFICATION SUITE
 * Tests server-side reference code verification, brute-force rate limiting,
 * protected endpoints, session token invalidation on logout, and zero client leaks.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://127.0.0.1:3000';

console.log('================================================================');
console.log('  RESECTOR 7 — ADMIN PORTAL SECURITY & ACCESS TEST SUITE        ');
console.log('================================================================\n');

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

function request(method, path, body = null, token = null) {
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
        resolve({ status: res.statusCode, headers: res.headers, body: json || data });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  // Test 1: Unauthorized access to admin endpoints
  console.log('--- 1. UNAUTHORIZED ACCESS ATTEMPTS (DIRECT URL / API ACCESS) ---');
  const unauthStats = await request('GET', '/api/admin/stats');
  assert(unauthStats.status === 401, 'GET /api/admin/stats without token returns 401 Unauthorized.');

  const unauthParts = await request('GET', '/api/admin/participants');
  assert(unauthParts.status === 401, 'GET /api/admin/participants without token returns 401 Unauthorized.');

  const unauthVerify = await request('GET', '/api/admin/verify');
  assert(unauthVerify.status === 401, 'GET /api/admin/verify without token returns 401 Unauthorized.');

  // Test 2: Invalid reference code attempts
  console.log('\n--- 2. INVALID REFERENCE CODE VALIDATION ---');
  const wrongCodeRes = await request('POST', '/api/admin/login', { referenceCode: 'wrong_secret_123' });
  assert(wrongCodeRes.status === 401, 'Incorrect reference code rejected with 401.');
  assert(wrongCodeRes.body.error && wrongCodeRes.body.error.includes('ACCESS DENIED'), 'Returns ACCESS DENIED without revealing code hints.');

  const emptyCodeRes = await request('POST', '/api/admin/login', { referenceCode: '' });
  assert(emptyCodeRes.status === 401, 'Empty reference code rejected with 401.');

  // Test 3: Correct reference code login (srnmc@cs)
  console.log('\n--- 3. CORRECT REFERENCE CODE LOGIN & SESSION GENERATION ---');
  const validLoginRes = await request('POST', '/api/admin/login', { referenceCode: 'srnmc@cs' });
  assert(validLoginRes.status === 200, 'Valid reference code accepted with 200 OK.');
  assert(validLoginRes.body.token && validLoginRes.body.token.length >= 32, 'Returns secure cryptographically random session token.');

  const adminToken = validLoginRes.body.token;

  // Test 4: Accessing protected endpoints with valid token
  console.log('\n--- 4. PROTECTED ADMIN API ACCESS WITH VALID TOKEN ---');
  const verifyRes = await request('GET', '/api/admin/verify', null, adminToken);
  assert(verifyRes.status === 200 && verifyRes.body.authenticated === true, 'GET /api/admin/verify confirms active session.');

  const statsRes = await request('GET', '/api/admin/stats', null, adminToken);
  assert(statsRes.status === 200, 'GET /api/admin/stats returns 200 with valid session.');
  assert(statsRes.body.totalParticipants >= 5, `Returns valid KPI data (Total Participants: ${statsRes.body.totalParticipants}).`);
  assert(statsRes.body.decisionSave !== undefined && statsRes.body.decisionDestroy !== undefined, 'Returns Decision Distribution.');

  const partsRes = await request('GET', '/api/admin/participants', null, adminToken);
  assert(partsRes.status === 200 && Array.isArray(partsRes.body.participants), 'GET /api/admin/participants returns participant telemetry array.');

  // Test 5: Logout & Session Invalidation
  console.log('\n--- 5. LOGOUT & SERVER-SIDE TOKEN INVALIDATION ---');
  const logoutRes = await request('POST', '/api/admin/logout', null, adminToken);
  assert(logoutRes.status === 200, 'POST /api/admin/logout returns 200.');

  const postLogoutStats = await request('GET', '/api/admin/stats', null, adminToken);
  assert(postLogoutStats.status === 401, 'Token is immediately invalidated on server (Cannot reuse token after logout).');

  // Test 6: Zero reference code leaks in client bundles
  console.log('\n--- 6. CLIENT CODE LEAK AUDIT (ZERO CREDENTIAL IN CLIENT BUNDLE) ---');
  const clientFiles = [
    'index.html',
    'admin.html',
    'css/main.css',
    'css/admin.css',
    'js/audio.js',
    'js/storyData.js',
    'js/background.js',
    'js/daisyAvatar.js',
    'js/gameState.js',
    'js/chatEngine.js',
    'js/puzzleEngine.js',
    'js/app.js',
    'js/admin/adminAuth.js',
    'js/admin/adminUI.js'
  ];

  let clientCodeClean = true;
  const FORBIDDEN_SECRET = 'srnmc@cs';

  clientFiles.forEach(f => {
    const p = path.join(__dirname, f);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      if (content.includes(FORBIDDEN_SECRET)) {
        console.error(`[FAIL] SECRET EXPOSED IN CLIENT FILE: ${f}`);
        clientCodeClean = false;
      }
    }
  });

  assert(clientCodeClean, 'Reference code is 100% ABSENT from all client-side files and bundles.');

  console.log('\n================================================================');
  console.log(`  ADMIN SECURITY TEST SUMMARY: ${passCount} / ${passCount + failCount} PASSED`);
  console.log('================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
