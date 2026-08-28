const http = require('http');
const participantData = require('./js/participantLogsData.js');

async function runTests() {
  console.log('--- TESTING 25 PARTICIPANTS DATABASE & WORD COUNT ANALYTICS ---');
  
  // 1. Check in-memory 25 database
  if (!participantData.PARTICIPANTS || participantData.PARTICIPANTS.length !== 25) {
    throw new Error(`Expected 25 participants, found ${participantData.PARTICIPANTS ? participantData.PARTICIPANTS.length : 0}`);
  }
  console.log(`[PASS] Total 25 participant test sessions validated.`);

  // 2. Validate linguistic analysis for all 25
  participantData.PARTICIPANTS.forEach((p, idx) => {
    const metrics = participantData.computeSessionLinguisticMetrics(p);
    if (typeof metrics.userWordCount !== 'number' || typeof metrics.avgWordsPerPrompt !== 'string') {
      throw new Error(`Participant #${idx + 1} (${p.participantName}) has invalid linguistic metrics.`);
    }
  });
  console.log(`[PASS] Word count & linguistic analytics calculated for all 25 participants.`);

  // 3. Test dossier HTML generation
  const dossierHTML = participantData.generatePrintableDossierHTML(participantData.PARTICIPANTS[0]);
  if (!dossierHTML.includes('RESECTOR 7 // EVALUATION DOSSIER') || !dossierHTML.includes('JUDGE SCORECARD') || !dossierHTML.includes('Total Words Typed by User')) {
    throw new Error('Dossier HTML is missing required judge or word analytics components.');
  }
  console.log(`[PASS] Printable Judge Dossier HTML generator produces high-contrast rubric & analytics.`);

  // 4. Test HTTP endpoint GET /api/participants
  const partsRes = await makeRequest('http://localhost:3000/api/participants');
  const partsJson = JSON.parse(partsRes);
  if (!partsJson.participants || partsJson.participants.length !== 25) {
    throw new Error(`Expected 25 participants from /api/participants, got ${partsJson.participants ? partsJson.participants.length : 0}`);
  }
  console.log(`[PASS] /api/participants returned all 25 participant records.`);

  // 5. Test HTTP endpoint GET /api/dossier/SESSION-001
  const singleDossier = await makeRequest('http://localhost:3000/api/dossier/SESSION-001');
  if (!singleDossier.includes('SESSION-001') || !singleDossier.includes('VIJAYAKUMAR_VJ')) {
    throw new Error('Single dossier endpoint failed to return participant dossier.');
  }
  console.log(`[PASS] /api/dossier/SESSION-001 rendered individual printable dossier.`);

  // 6. Test HTTP endpoint GET /api/dossier/all
  const batchDossier = await makeRequest('http://localhost:3000/api/dossier/all');
  if (!batchDossier.includes('ALL 25 PARTICIPANT DOSSIERS') || !batchDossier.includes('POOJA_HEGDE')) {
    throw new Error('Batch dossier endpoint failed to concatenate all 25 participant dossiers.');
  }
  console.log(`[PASS] /api/dossier/all rendered complete 25-participant batch dossier book.`);

  console.log('\n🌟 ALL 6/6 PARTICIPANT EVALUATION & WORD ANALYTICS TESTS PASSED WITH 100% FIDELITY!\n');
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

runTests().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
