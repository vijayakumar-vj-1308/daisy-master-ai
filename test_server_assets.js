const http = require('http');

const urls = [
  'http://localhost:3000/',
  'http://localhost:3000/css/main.css',
  'http://localhost:3000/css/cinematic.css',
  'http://localhost:3000/css/hud.css',
  'http://localhost:3000/css/chat.css',
  'http://localhost:3000/css/puzzle.css',
  'http://localhost:3000/js/audio.js',
  'http://localhost:3000/js/storyData.js',
  'http://localhost:3000/js/daisy/knowledgeBase.js',
  'http://localhost:3000/js/daisy/storyGuard.js',
  'http://localhost:3000/js/daisy/reasoningEngine.js',
  'http://localhost:3000/js/daisy/daisyAI.js',
  'http://localhost:3000/js/background.js',
  'http://localhost:3000/js/daisyAvatar.js',
  'http://localhost:3000/js/gameState.js',
  'http://localhost:3000/js/chatEngine.js',
  'http://localhost:3000/js/puzzleEngine.js',
  'http://localhost:3000/js/app.js'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 && data.length > 50) {
          console.log(`[PASS] ${url} (HTTP 200, ${data.length} bytes)`);
          resolve(true);
        } else {
          console.error(`[FAIL] ${url} (Status: ${res.statusCode}, Length: ${data.length})`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.error(`[FAIL] ${url} (Error: ${err.message})`);
      resolve(false);
    });
  });
}

(async () => {
  console.log('================================================================');
  console.log('  RESECTOR 7 — LOCALHOST SERVER ASSET VERIFICATION               ');
  console.log('================================================================\n');

  let allPass = true;
  for (const u of urls) {
    const ok = await checkUrl(u);
    if (!ok) allPass = false;
  }

  console.log('\n================================================================');
  console.log(`  ASSET CHECK RESULT: ${allPass ? 'ALL 18 ENDPOINTS PASS (200 OK)' : 'FAILED'}`);
  console.log('================================================================\n');

  process.exit(allPass ? 0 : 1);
})();
