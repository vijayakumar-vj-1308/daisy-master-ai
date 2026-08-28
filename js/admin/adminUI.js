/**
 * RESECTOR 7 — ADMIN CONTROL ROOM UI & TELEMETRY CONTROLLER
 * Fetches metrics and participant logs from protected backend endpoints,
 * renders interactive charts, tables, search filters, and session transcript modals.
 */

class AdminUIManager {
  constructor() {
    this.participantsData = [];
    this.statsData = {};
    this.pollInterval = null;

    this.dom = {
      // KPIs
      totalParticipants: document.getElementById('kpi-total-participants'),
      activeSessions: document.getElementById('kpi-active-sessions'),
      completedSessions: document.getElementById('kpi-completed-sessions'),
      avgScore: document.getElementById('kpi-avg-score'),
      highScore: document.getElementById('kpi-high-score'),
      avgTime: document.getElementById('kpi-avg-time'),
      // Decision Chart
      chartCanvas: document.getElementById('chart-decision'),
      legendSave: document.getElementById('legend-save-val'),
      legendDestroy: document.getElementById('legend-destroy-val'),
      // Funnel
      rateLvl1: document.getElementById('rate-lvl1'),
      rateLvl2: document.getElementById('rate-lvl2'),
      rateLvl3: document.getElementById('rate-lvl3'),
      rateLvl4: document.getElementById('rate-lvl4'),
      fillLvl1: document.getElementById('fill-lvl1'),
      fillLvl2: document.getElementById('fill-lvl2'),
      fillLvl3: document.getElementById('fill-lvl3'),
      fillLvl4: document.getElementById('fill-lvl4'),
      // Table & Filters
      tableCountBadge: document.getElementById('table-count-badge'),
      tableBody: document.getElementById('table-body'),
      searchInput: document.getElementById('search-input'),
      filterStatus: document.getElementById('filter-status'),
      filterDecision: document.getElementById('filter-decision'),
      btnExportCsv: document.getElementById('btn-export-csv'),
      btnRefresh: document.getElementById('btn-refresh-data'),
      // Modal
      modal: document.getElementById('session-modal'),
      modalTitle: document.getElementById('modal-title'),
      modalMetaRow: document.getElementById('modal-meta-row'),
      modalTranscriptFeed: document.getElementById('modal-transcript-feed'),
      btnCloseModal: document.getElementById('btn-close-modal')
    };

    this.init();
  }

  init() {
    this.bindEvents();
    // Auto refresh every 8 seconds
    this.pollInterval = setInterval(() => {
      if (window.adminAuth && window.adminAuth.sessionToken) {
        this.loadData();
      }
    }, 8000);
  }

  bindEvents() {
    if (this.dom.btnRefresh) {
      this.dom.btnRefresh.addEventListener('click', () => this.loadData());
    }

    if (this.dom.searchInput) {
      this.dom.searchInput.addEventListener('input', () => this.renderTable());
    }

    if (this.dom.filterStatus) {
      this.dom.filterStatus.addEventListener('change', () => this.renderTable());
    }

    if (this.dom.filterDecision) {
      this.dom.filterDecision.addEventListener('change', () => this.renderTable());
    }

    if (this.dom.btnExportCsv) {
      this.dom.btnExportCsv.addEventListener('click', () => this.exportCsv());
    }

    if (this.dom.btnCloseModal && this.dom.modal) {
      this.dom.btnCloseModal.addEventListener('click', () => {
        this.dom.modal.classList.add('hidden');
      });
    }
  }

  async loadData() {
    if (!window.adminAuth) return;
    const headers = window.adminAuth.getAuthHeaders();

    try {
      const [statsRes, partsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/participants', { headers })
      ]);

      if (statsRes.status === 401 || partsRes.status === 401) {
        window.adminAuth.logout();
        return;
      }

      this.statsData = await statsRes.json();
      const partsJson = await partsRes.json();
      this.participantsData = partsJson.participants || [];

      this.renderKPIs();
      this.renderDecisionChart();
      this.renderFunnel();
      this.renderTable();
    } catch (e) {
      console.warn("Failed to load telemetry data:", e);
    }
  }

  renderKPIs() {
    const s = this.statsData;
    if (this.dom.totalParticipants) this.dom.totalParticipants.textContent = s.totalParticipants || 0;
    if (this.dom.activeSessions) this.dom.activeSessions.textContent = s.activeSessions || 0;
    if (this.dom.completedSessions) this.dom.completedSessions.textContent = s.completedSessions || 0;
    if (this.dom.avgScore) this.dom.avgScore.textContent = `${s.averageScore || 0}`;
    if (this.dom.highScore) this.dom.highScore.textContent = `HIGHEST SCORE: ${s.highestScore || 0}`;
    if (this.dom.avgTime) this.dom.avgTime.textContent = s.averageCompletionTime || '0m 0s';
  }

  renderDecisionChart() {
    const s = this.statsData;
    const saveCount = s.decisionSave || 0;
    const destroyCount = s.decisionDestroy || 0;
    const total = saveCount + destroyCount;

    const savePct = total > 0 ? Math.round((saveCount / total) * 100) : 0;
    const destroyPct = total > 0 ? Math.round((destroyCount / total) * 100) : 0;

    if (this.dom.legendSave) this.dom.legendSave.textContent = `${saveCount} (${savePct}%)`;
    if (this.dom.legendDestroy) this.dom.legendDestroy.textContent = `${destroyCount} (${destroyPct}%)`;

    // Draw Donut on Canvas
    const canvas = this.dom.chartCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 80;
    const lineWidth = 24;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (total === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '12px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('NO DATA', cx, cy + 4);
      return;
    }

    const saveAngle = (saveCount / total) * Math.PI * 2;

    // Draw Save Arc (Green)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + saveAngle);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Draw Destroy Arc (Red)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2 + saveAngle, -Math.PI / 2 + Math.PI * 2);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Center Total text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText(`${total}`, cx, cy + 2);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText('DECISIONS', cx, cy + 18);
  }

  renderFunnel() {
    const s = this.statsData;
    if (this.dom.rateLvl1) this.dom.rateLvl1.textContent = `${s.level1SuccessRate || 0}%`;
    if (this.dom.rateLvl2) this.dom.rateLvl2.textContent = `${s.level2SuccessRate || 0}%`;
    if (this.dom.rateLvl3) this.dom.rateLvl3.textContent = `${s.level3SuccessRate || 0}%`;
    if (this.dom.rateLvl4) this.dom.rateLvl4.textContent = `${s.level4SuccessRate || 0}%`;

    if (this.dom.fillLvl1) this.dom.fillLvl1.style.width = `${s.level1SuccessRate || 0}%`;
    if (this.dom.fillLvl2) this.dom.fillLvl2.style.width = `${s.level2SuccessRate || 0}%`;
    if (this.dom.fillLvl3) this.dom.fillLvl3.style.width = `${s.level3SuccessRate || 0}%`;
    if (this.dom.fillLvl4) this.dom.fillLvl4.style.width = `${s.level4SuccessRate || 0}%`;
  }

  renderTable() {
    if (!this.dom.tableBody) return;
    const search = (this.dom.searchInput?.value || "").toLowerCase().trim();
    const statusFilter = this.dom.filterStatus?.value || "ALL";
    const decisionFilter = this.dom.filterDecision?.value || "ALL";

    let filtered = this.participantsData.filter(item => {
      const matchSearch = !search ||
        item.participantName.toLowerCase().includes(search) ||
        item.sessionId.toLowerCase().includes(search);
      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchDecision = decisionFilter === "ALL" || item.finalDecision === decisionFilter;
      return matchSearch && matchStatus && matchDecision;
    });

    if (this.dom.tableCountBadge) {
      this.dom.tableCountBadge.textContent = `${filtered.length} Records`;
    }

    this.dom.tableBody.innerHTML = '';

    if (filtered.length === 0) {
      const emptyTr = document.createElement('tr');
      emptyTr.innerHTML = `<td colspan="13" style="text-align:center; padding: 24px; color: var(--admin-text-dim);">No matching participant sessions found.</td>`;
      this.dom.tableBody.appendChild(emptyTr);
      return;
    }

    filtered.forEach(session => {
      const tr = document.createElement('tr');

      // Status pill class
      let statusClass = 'status-active';
      if (session.status === 'COMPLETED') statusClass = 'status-completed';
      if (session.status === 'ABANDONED') statusClass = 'status-abandoned';

      // Decision color
      let decisionClass = 'decision-pending';
      if (session.finalDecision === 'SAVE') decisionClass = 'decision-save';
      if (session.finalDecision === 'DO NOT SAVE') decisionClass = 'decision-destroy';

      const wordsCount = session.userWordCount || (session.logs || []).filter(l => l.sender === session.participantName).reduce((sum, l) => sum + (l.text ? l.text.split(/\s+/).filter(Boolean).length : 0), 0);

      tr.innerHTML = `
        <td><strong>${session.participantName}</strong></td>
        <td><code>${session.sessionId}</code></td>
        <td>${session.currentLevel}</td>
        <td><span style="color:var(--admin-cyan); font-weight:bold;">${wordsCount} w</span></td>
        <td>${session.progress}%</td>
        <td><strong>${session.score}</strong></td>
        <td>${session.timeTaken}</td>
        <td>${session.cluesUsed} clue(s)</td>
        <td>${session.attempts} attempt(s)</td>
        <td><span class="${decisionClass}">${session.finalDecision}</span></td>
        <td><span class="status-pill ${statusClass}">${session.status}</span></td>
        <td><small>${session.startedAt}</small></td>
        <td>
          <button class="btn-view-logs" data-session-id="${session.sessionId}" style="margin-right: 4px;">VIEW LOGS</button>
          <button class="btn-print-dossier" data-session-id="${session.sessionId}" style="background: rgba(56, 189, 248, 0.15); border: 1px solid var(--admin-primary); color: var(--admin-primary); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; cursor: pointer; font-weight: bold;">🖨️ PDF</button>
        </td>
      `;

      const btnLogs = tr.querySelector('.btn-view-logs');
      if (btnLogs) {
        btnLogs.addEventListener('click', () => this.openSessionModal(session));
      }

      const btnPrint = tr.querySelector('.btn-print-dossier');
      if (btnPrint) {
        btnPrint.addEventListener('click', () => {
          if (window.ParticipantDatabase) {
            const p = window.ParticipantDatabase.getParticipant(session.sessionId) || session;
            window.ParticipantDatabase.openPrintWindow(p);
          } else {
            window.open(`/api/dossier/${session.sessionId}`, '_blank');
          }
        });
      }

      this.dom.tableBody.appendChild(tr);
    });
  }

  openSessionModal(session) {
    if (!this.dom.modal) return;
    this.dom.modalTitle.textContent = `SESSION LOGS & EVALUATION: ${session.sessionId} (${session.participantName})`;

    const wordsCount = session.userWordCount || (session.logs || []).filter(l => l.sender === session.participantName).reduce((sum, l) => sum + (l.text ? l.text.split(/\s+/).filter(Boolean).length : 0), 0);
    const promptsCount = session.userPromptCount || (session.logs || []).filter(l => l.sender === session.participantName).length;

    // Populate Meta Row
    if (this.dom.modalMetaRow) {
      this.dom.modalMetaRow.innerHTML = `
        <div class="meta-chip">
          <span class="meta-chip-label">PARTICIPANT</span>
          <span class="meta-chip-val">${session.participantName}</span>
        </div>
        <div class="meta-chip">
          <span class="meta-chip-label">WORDS TYPED</span>
          <span class="meta-chip-val" style="color: var(--admin-cyan)">${wordsCount} words (${promptsCount} prompts)</span>
        </div>
        <div class="meta-chip">
          <span class="meta-chip-label">FINAL DECISION</span>
          <span class="meta-chip-val" style="color: ${session.finalDecision === 'SAVE' ? 'var(--admin-green)' : 'var(--admin-red)'}">${session.finalDecision}</span>
        </div>
        <div class="meta-chip">
          <span class="meta-chip-label">SCORE</span>
          <span class="meta-chip-val">${session.score} PTS</span>
        </div>
        <div class="meta-chip">
          <span class="meta-chip-label">TIME TAKEN</span>
          <span class="meta-chip-val">${session.timeTaken}</span>
        </div>
        <div class="meta-chip">
          <button onclick="if(window.ParticipantDatabase){window.ParticipantDatabase.openPrintWindow(window.ParticipantDatabase.getParticipant('${session.sessionId}')||${JSON.stringify(session).replace(/"/g, '&quot;')})}else{window.open('/api/dossier/${session.sessionId}','_blank')}" style="background: var(--admin-primary); color: #000; border: none; font-weight: bold; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">🖨️ PRINT DOSSIER (PDF)</button>
        </div>
      `;
    }

    // Populate Transcript Feed
    if (this.dom.modalTranscriptFeed) {
      this.dom.modalTranscriptFeed.innerHTML = '';
      if (!session.logs || session.logs.length === 0) {
        this.dom.modalTranscriptFeed.innerHTML = '<div style="color:var(--admin-text-dim);">No conversation logs recorded for this session.</div>';
      } else {
        session.logs.forEach(log => {
          const entry = document.createElement('div');
          entry.className = `log-entry ${log.sender === 'DAISY' ? 'log-daisy' : ''}`;
          const wordCount = (log.text || '').trim().split(/\s+/).filter(Boolean).length;
          entry.innerHTML = `<strong>${log.sender}</strong> <span style="font-size:0.7rem; color:var(--admin-text-dim);">[${wordCount}w]:</span> <span>${log.text}</span>`;
          this.dom.modalTranscriptFeed.appendChild(entry);
        });
      }
    }

    this.dom.modal.classList.remove('hidden');
  }

  exportCsv() {
    if (!this.participantsData || this.participantsData.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = [
      "Participant Name",
      "Session ID",
      "Current Level",
      "Progress (%)",
      "Score",
      "Time Taken",
      "Clues Used",
      "Attempts",
      "Final Decision",
      "Status",
      "Started At",
      "Completed At"
    ];

    const rows = this.participantsData.map(s => [
      `"${s.participantName}"`,
      `"${s.sessionId}"`,
      `"${s.currentLevel}"`,
      s.progress,
      s.score,
      `"${s.timeTaken}"`,
      s.cluesUsed,
      s.attempts,
      `"${s.finalDecision}"`,
      `"${s.status}"`,
      `"${s.startedAt}"`,
      `"${s.completedAt}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RESECTOR7_TELEMETRY_EXPORT_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.adminUI = new AdminUIManager();
});
