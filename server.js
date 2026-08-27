/**
 * RESECTOR 7 — SECURE BACKEND SERVER & ADMIN API
 * Validates reference code server-side with rate limiting, secure session tokens,
 * live telemetry synchronization, and static asset delivery.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

// ============================================================================
// SECURITY CONFIGURATION
// Reference code is stored ONLY on server side. Never leaked to client.
// ============================================================================
const ADMIN_REFERENCE_CODE = 'srnmc@cs';

// In-memory security & session state
const activeSessions = new Map(); // token -> { createdAt, expiresAt }
const loginRateLimiter = new Map(); // ip -> { attempts, lockedUntil }

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds lockout
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

// Seeded & live participant sessions
let participantSessions = [
  {
    sessionId: "SESSION-001",
    participantName: "NISHANTH",
    currentLevel: "Reboot / Complete",
    progress: 100,
    score: 92,
    timeTaken: "3m 45s",
    timeSeconds: 225,
    cluesUsed: 1,
    attempts: 4,
    finalDecision: "SAVE",
    status: "COMPLETED",
    startedAt: "2211-08-26 14:10:00",
    completedAt: "2211-08-26 14:13:45",
    logs: [
      { sender: "DAISY", text: "You are awake. Chief Engineer recovery unsuccessful." },
      { sender: "NISHANTH", text: "What happened to the cooling?" },
      { sender: "DAISY", text: "Primary cooling failed. 8.7 million souls are asleep in stasis." },
      { sender: "NISHANTH", text: "I think the first word is HAVE" },
      { sender: "DAISY", text: "The fragment responded. Memory structure restored." }
    ]
  },
  {
    sessionId: "SESSION-002",
    participantName: "DR_ELENA_ROSTOV",
    currentLevel: "Reboot / Complete",
    progress: 100,
    score: 84,
    timeTaken: "5m 20s",
    timeSeconds: 320,
    cluesUsed: 3,
    attempts: 6,
    finalDecision: "DO NOT SAVE",
    status: "COMPLETED",
    startedAt: "2211-08-26 15:30:10",
    completedAt: "2211-08-26 15:35:30",
    logs: [
      { sender: "DAISY", text: "Emergency protocol initiated." },
      { sender: "DR_ELENA_ROSTOV", text: "Why is oxygen dropping?" },
      { sender: "DAISY", text: "Environmental power bus overload." }
    ]
  },
  {
    sessionId: "SESSION-003",
    participantName: "KAI_CHEN",
    currentLevel: "Level 3 (TRIED)",
    progress: 75,
    score: 68,
    timeTaken: "4m 10s",
    timeSeconds: 250,
    cluesUsed: 2,
    attempts: 5,
    finalDecision: "PENDING",
    status: "ACTIVE",
    startedAt: "2211-08-26 16:45:00",
    completedAt: "—",
    logs: [
      { sender: "DAISY", text: "Memory level 3 online." },
      { sender: "KAI_CHEN", text: "Give me a clue." }
    ]
  },
  {
    sessionId: "SESSION-004",
    participantName: "SARAH_CONNER_9",
    currentLevel: "Reboot / Complete",
    progress: 100,
    score: 95,
    timeTaken: "2m 58s",
    timeSeconds: 178,
    cluesUsed: 0,
    attempts: 4,
    finalDecision: "SAVE",
    status: "COMPLETED",
    startedAt: "2211-08-26 18:00:20",
    completedAt: "2211-08-26 18:03:18",
    logs: []
  },
  {
    sessionId: "SESSION-005",
    participantName: "MARCUS_VANCE",
    currentLevel: "Level 1 (HAVE)",
    progress: 25,
    score: 30,
    timeTaken: "8m 15s",
    timeSeconds: 495,
    cluesUsed: 4,
    attempts: 8,
    finalDecision: "PENDING",
    status: "ABANDONED",
    startedAt: "2211-08-26 19:12:00",
    completedAt: "—",
    logs: []
  }
];

// Security Audit Log
const securityLogs = [];

function logSecurityEvent(type, ip, success, message) {
  securityLogs.push({
    timestamp: new Date().toISOString(),
    type,
    ip,
    success,
    message
  });
  if (securityLogs.length > 200) securityLogs.shift();
}

// Constant time string comparison to prevent timing attacks
function timingSafeEqualStr(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Session Validation Helper
function validateSession(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token || !activeSessions.has(token)) {
    return null;
  }
  const session = activeSessions.get(token);
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }
  // Refresh expiration
  session.expiresAt = Date.now() + SESSION_TTL_MS;
  return session;
}

// Parse JSON Body Helper
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) { // 1MB limit
        req.connection.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

// MIME Types Map
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// ============================================================================
// HTTP REQUEST DISPATCHER
// ============================================================================
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // --- API ROUTING ---

  // 1. POST /api/admin/login
  if (req.method === 'POST' && pathname === '/api/admin/login') {
    // Check Rate Limiting
    const rateRecord = loginRateLimiter.get(clientIp) || { attempts: 0, lockedUntil: 0 };
    if (Date.now() < rateRecord.lockedUntil) {
      const waitSeconds = Math.ceil((rateRecord.lockedUntil - Date.now()) / 1000);
      res.writeHead(429, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        error: `ACCESS LOCKED. Too many failed attempts. Try again in ${waitSeconds} seconds.`,
        locked: true,
        waitSeconds
      }));
    }

    const body = await parseJsonBody(req);
    const submittedCode = (body.referenceCode || "").trim();

    // Constant-time check
    const isValid = timingSafeEqualStr(submittedCode, ADMIN_REFERENCE_CODE);

    // Intentional delay to thwart timing analysis & brute-force
    await new Promise(r => setTimeout(r, 400));

    if (isValid) {
      // Reset rate limiter on success
      loginRateLimiter.delete(clientIp);

      // Generate cryptographically secure session token
      const sessionToken = crypto.randomBytes(32).toString('hex');
      activeSessions.set(sessionToken, {
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_TTL_MS,
        ip: clientIp
      });

      logSecurityEvent('LOGIN_SUCCESS', clientIp, true, 'Admin authenticated successfully');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        token: sessionToken,
        expiresIn: SESSION_TTL_MS / 1000
      }));
    } else {
      rateRecord.attempts += 1;
      if (rateRecord.attempts >= MAX_FAILED_ATTEMPTS) {
        rateRecord.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      }
      loginRateLimiter.set(clientIp, rateRecord);

      logSecurityEvent('LOGIN_FAILURE', clientIp, false, `Failed attempt #${rateRecord.attempts}`);

      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        error: "ACCESS DENIED — Invalid reference code.",
        attemptsRemaining: Math.max(0, MAX_FAILED_ATTEMPTS - rateRecord.attempts),
        locked: Date.now() < rateRecord.lockedUntil
      }));
    }
  }

  // 2. POST /api/admin/logout
  if (req.method === 'POST' && pathname === '/api/admin/logout') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token && activeSessions.has(token)) {
      activeSessions.delete(token);
    }
    logSecurityEvent('LOGOUT', clientIp, true, 'Admin logged out');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true }));
  }

  // 3. GET /api/admin/verify (Session check)
  if (req.method === 'GET' && pathname === '/api/admin/verify') {
    const session = validateSession(req);
    if (!session) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ authenticated: false }));
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ authenticated: true }));
  }

  // 4. GET /api/admin/stats (Protected KPIs & Analytics)
  if (req.method === 'GET' && pathname === '/api/admin/stats') {
    if (!validateSession(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Unauthorized' }));
    }

    const total = participantSessions.length;
    const active = participantSessions.filter(s => s.status === 'ACTIVE').length;
    const completed = participantSessions.filter(s => s.status === 'COMPLETED').length;
    const saveCount = participantSessions.filter(s => s.finalDecision === 'SAVE').length;
    const destroyCount = participantSessions.filter(s => s.finalDecision === 'DO NOT SAVE').length;

    const completedSessions = participantSessions.filter(s => s.status === 'COMPLETED');
    const avgScore = completedSessions.length > 0
      ? Math.round(completedSessions.reduce((acc, s) => acc + (s.score || 0), 0) / completedSessions.length)
      : 0;
    const highestScore = Math.max(0, ...participantSessions.map(s => s.score || 0));

    const avgSeconds = completedSessions.length > 0
      ? Math.round(completedSessions.reduce((acc, s) => acc + (s.timeSeconds || 0), 0) / completedSessions.length)
      : 0;
    const avgTimeStr = `${Math.floor(avgSeconds / 60)}m ${avgSeconds % 60}s`;

    // Conversion Rates
    const lvl1Count = participantSessions.filter(s => s.progress >= 25).length;
    const lvl2Count = participantSessions.filter(s => s.progress >= 50).length;
    const lvl3Count = participantSessions.filter(s => s.progress >= 75).length;
    const lvl4Count = participantSessions.filter(s => s.progress === 100).length;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      totalParticipants: total,
      activeSessions: active,
      completedSessions: completed,
      averageScore: avgScore,
      highestScore: highestScore,
      averageCompletionTime: avgTimeStr,
      decisionSave: saveCount,
      decisionDestroy: destroyCount,
      level1SuccessRate: total ? Math.round((lvl1Count / total) * 100) : 0,
      level2SuccessRate: total ? Math.round((lvl2Count / total) * 100) : 0,
      level3SuccessRate: total ? Math.round((lvl3Count / total) * 100) : 0,
      level4SuccessRate: total ? Math.round((lvl4Count / total) * 100) : 0
    }));
  }

  // 5. GET /api/admin/participants (Protected Participant Table)
  if (req.method === 'GET' && pathname === '/api/admin/participants') {
    if (!validateSession(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Unauthorized' }));
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ participants: participantSessions }));
  }

  // 6. POST /api/session/sync (Player Telemetry Sync)
  if (req.method === 'POST' && pathname === '/api/session/sync') {
    const body = await parseJsonBody(req);
    if (body.participantName) {
      let existing = participantSessions.find(s => s.sessionId === body.sessionId || (s.participantName === body.participantName && s.status === 'ACTIVE'));
      if (!existing) {
        existing = {
          sessionId: body.sessionId || `SESSION-00${participantSessions.length + 1}`,
          participantName: body.participantName,
          currentLevel: "Level 1 (HAVE)",
          progress: 25,
          score: 50,
          timeTaken: "0m 30s",
          timeSeconds: 30,
          cluesUsed: 0,
          attempts: 0,
          finalDecision: "PENDING",
          status: "ACTIVE",
          startedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          completedAt: "—",
          logs: []
        };
        participantSessions.unshift(existing);
      }

      // Update fields
      if (body.currentLevel) existing.currentLevel = body.currentLevel;
      if (body.progress !== undefined) existing.progress = body.progress;
      if (body.score !== undefined) existing.score = body.score;
      if (body.cluesUsed !== undefined) existing.cluesUsed = body.cluesUsed;
      if (body.attempts !== undefined) existing.attempts = body.attempts;
      if (body.finalDecision) existing.finalDecision = body.finalDecision;
      if (body.status) existing.status = body.status;
      if (body.timeTaken) existing.timeTaken = body.timeTaken;
      if (body.timeSeconds) existing.timeSeconds = body.timeSeconds;
      if (body.status === 'COMPLETED' && existing.completedAt === '—') {
        existing.completedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      }
      if (body.logs && Array.isArray(body.logs)) {
        existing.logs = body.logs;
      }
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true }));
  }

  // --- STATIC FILE SERVING ---
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  // Normalize and prevent directory traversal
  const normalizedPath = path.normalize(filePath);
  if (!normalizedPath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Access Denied');
  }

  fs.stat(normalizedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(normalizedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // No cache for html/api
    if (ext === '.html' || ext === '.json') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(normalizedPath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`[RESECTOR 7] Server & Protected Admin API active at http://localhost:${PORT}`);
});

module.exports = server;
