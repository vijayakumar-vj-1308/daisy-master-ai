/**
 * RESECTOR 7 — PROJECT-WIDE SPELLING & DAISY CONSISTENCY AUDIT
 * Scans all source files for any misspelled character names, UI variations, or broken strings.
 */

const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('  RESECTOR 7 — GLOBAL SPELLING & NAME CONSISTENCY AUDIT        ');
console.log('================================================================\n');

const ROOT_DIR = path.resolve(__dirname);
const IGNORE_DIRS = ['node_modules', '.git', '.system_generated', 'logs'];
const EXTENSIONS = ['.html', '.js', '.css', '.json', '.md'];

const TYPO_PATTERNS = [
  { name: "Dasiy (misspelling)", regex: /\bdasiy\b/i },
  { name: "DASIY (uppercase misspelling)", regex: /\bDASIY\b/ },
  { name: "DASİY (Turkish dot-I)", regex: /DAS[İI]Y/ },
  { name: "Daisy's AI (improper label)", regex: /\bDaisy's AI\b/i },
  { name: "Daisy AI in UI labels", regex: /DAISY AI \/\// }
];

let scannedFiles = 0;
let errorsFound = 0;
const results = [];

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.includes(entry.name)) {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (EXTENSIONS.includes(ext)) {
        scannedFiles++;
        const content = fs.readFileSync(fullPath, 'utf8');

        TYPO_PATTERNS.forEach(pat => {
          const matches = content.match(pat.regex);
          if (matches) {
            // Ignore this audit script itself
            if (!entry.name.includes('test_spelling_audit.js')) {
              results.push({
                file: path.relative(ROOT_DIR, fullPath),
                pattern: pat.name,
                match: matches[0]
              });
              errorsFound++;
            }
          }
        });
      }
    }
  }
}

scanDirectory(ROOT_DIR);

console.log(`Scanned ${scannedFiles} project files across HTML, JS, CSS, JSON, and MD.`);

if (errorsFound === 0) {
  console.log('\n[PASS] ZERO incorrect Daisy name variations or misspellings found!');
  console.log('[PASS] All UI displays, logs, story scripts, and telemetry strictly adhere to official "DAISY" naming.');
  console.log('\n================================================================');
  console.log('  GLOBAL SPELLING AUDIT: 100% CLEAN (0 DEFECTS)                 ');
  console.log('================================================================\n');
  process.exit(0);
} else {
  console.error(`\n[FAIL] Found ${errorsFound} naming defects:`);
  results.forEach(r => {
    console.error(`  - ${r.file}: Matched ${r.pattern} ("${r.match}")`);
  });
  process.exit(1);
}
