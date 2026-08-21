import { STAGE_NAMES, STAGE_SLA, STAGE_DETAILS, STATUS } from './config.js';
import { dashboardState } from './data.js';
import { $, fmtHours, getStatusBadgeClass } from './utils.js';
import {
  filteredAlerts, renderAlerts, renderJourney, mapCurrentStage
} from './render.js';

let activeStageEvidence = [];

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function safeUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('data:image/')) return raw;
  try {
    const url = new URL(raw, window.location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function extractGoogleDriveId(url) {
  const value = String(url || '');
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]{10,})/,
    /[?&]id=([a-zA-Z0-9_-]{10,})/,
    /\/file\/d\/([a-zA-Z0-9_-]{10,})/
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }
  return '';
}

function imagePreviewUrl(evidence) {
  const explicitThumb = safeUrl(
    evidence.thumbnailUrl || evidence.thumbnail || evidence.previewUrl || evidence.imageUrl
  );
  if (explicitThumb) return explicitThumb;

  const original = safeUrl(
    evidence.url || evidence.fileUrl || evidence.evidenceUrl || evidence.link
  );
  if (!original) return '';

  const driveId = extractGoogleDriveId(original);
  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(driveId)}&sz=w1200`;
  }

  if (/\.(png|jpe?g|webp|gif|bmp|svg)(\?|#|$)/i.test(original)) return original;
  return '';
}

function evidenceOriginalUrl(evidence) {
  return safeUrl(evidence.url || evidence.fileUrl || evidence.evidenceUrl || evidence.link);
}

function getEvidenceSource(alert) {
  const data = dashboardState.data || {};
  const candidates = [
    alert.evidence,
    alert.evidences,
    data.evidence?.[alert.idOrder],
    data.evidences?.[alert.idOrder]
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

function getStageEvidence(alert, stageName) {
  const source = getEvidenceSource(alert);
  const wantedStage = normalizeText(stageName);

  return source
    .filter(item => {
      const itemStage = normalizeText(item.stage || item.stageName || item.tahapan || '');
      return !itemStage || itemStage === wantedStage;
    })
    .map((item, idx) => ({
      ...item,
      checkpoint: Number(item.checkpoint ?? item.checkpointNo ?? item.step ?? idx + 1) || idx + 1,
      checkpointName: item.checkpointName || item.stepName || item.namaCheckpoint || '',
      title: item.title || item.name || item.namaEviden || `Eviden ${idx + 1}`,
      uploadedAt: item.uploadedAt || item.uploadTime || item.timestamp || item.update || '-',
      uploadedBy: item.uploadedBy || item.uploader || item.pic || '-',
      validationStatus: String(item.validationStatus || item.validation || item.status || 'BELUM DIVERIFIKASI').toUpperCase()
    }));
}

function getCheckpointSource(alert) {
  const data = dashboardState.data || {};
  const candidates = [
    alert.checkpoints,
    data.checkpoints?.[alert.idOrder]
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

function checkpointStatusClass(status) {
  const s = String(status || '').toUpperCase();
  if (s.includes('COMPLETED')) return 'completed';
  if (s.includes('CRITICAL') || s.includes('BREACH')) return 'breach';
  if (s.includes('AT RISK')) return 'atrisk';
  if (s.includes('WARNING')) return 'warning';
  if (s.includes('ON TRACK')) return 'ontrack';
  return 'notstarted';
}

function checkpointIcon(status) {
  const cls = checkpointStatusClass(status);
  if (cls === 'completed' || cls === 'ontrack') return '✓';
  if (cls === 'breach' || cls === 'atrisk' || cls === 'warning') return '!';
  return '○';
}

function deriveCurrentCheckpointIndex(alert, steps) {
  const current = normalizeText(alert.currentCheckpoint);
  if (!current) return 0;

  let bestIndex = 0;
  let bestScore = 0;

  steps.forEach((step, index) => {
    const words = normalizeText(step).split(' ').filter(w => w.length >= 4);
    const score = words.reduce((sum, word) => sum + (current.includes(word) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function buildStageCheckpoints(alert, stageName, stageInfo, stageIndex, currentStageIndex, stageStatus) {
  const steps = stageInfo.steps || ['Proses 1', 'Proses 2', 'Proses 3'];
  const explicit = getCheckpointSource(alert)
    .filter(item => {
      const itemStage = normalizeText(item.stage || item.stageName || item.tahapan || '');
      return !itemStage || itemStage === normalizeText(stageName);
    });
  const history = dashboardState.data.history?.[alert.idOrder] || [];
  const currentCheckpointIndex = deriveCurrentCheckpointIndex(alert, steps);

  return steps.map((stepName, i) => {
    const stepNorm = normalizeText(stepName);

    const explicitItem = explicit.find(item => {
      const no = Number(item.checkpoint ?? item.checkpointNo ?? item.step);
      const name = normalizeText(item.name || item.checkpointName || item.stepName || item.namaCheckpoint);
      return no === i + 1 || (name && (name === stepNorm || name.includes(stepNorm) || stepNorm.includes(name)));
    });

    const historyItem = history.find(item => {
      const name = normalizeText(item.name || item.checkpointName || '');
      return name && (name === stepNorm || name.includes(stepNorm) || stepNorm.includes(name));
    });

    let status = explicitItem?.status || historyItem?.status;
    if (!status) {
      if (stageIndex < currentStageIndex) {
        status = 'COMPLETED';
      } else if (stageIndex > currentStageIndex) {
        status = 'NOT STARTED';
      } else if (i < currentCheckpointIndex) {
        status = 'COMPLETED';
      } else if (i === currentCheckpointIndex) {
        status = stageStatus;
      } else {
        status = 'NOT STARTED';
      }
    }

    const startTime = explicitItem?.startTime || explicitItem?.start || historyItem?.start || '-';
    const completedAt = explicitItem?.completedAt || explicitItem?.finish || explicitItem?.end || historyItem?.completedAt || historyItem?.end || '';
    const displayTime = completedAt || startTime || '-';

    return {
      step: i + 1,
      name: stepName,
      status: String(status || 'NOT STARTED').toUpperCase(),
      startTime,
      completedAt,
      displayTime,
      pic: explicitItem?.pic || historyItem?.pic || stageInfo.picDefault || alert.pic || '-'
    };
  });
}

function validationClass(status) {
  const s = String(status || '').toUpperCase();
  if (s.includes('VALID') && !s.includes('BELUM')) return 'valid';
  if (s.includes('REJECT') || s.includes('TOLAK') || s.includes('INVALID')) return 'reject';
  return 'pending';
}

function renderEvidenceCard(evidence, index) {
  const preview = imagePreviewUrl(evidence);
  const original = evidenceOriginalUrl(evidence);
  const checkpointLabel = evidence.checkpointName || `Step ${evidence.checkpoint}`;
  const validation = evidence.validationStatus || 'BELUM DIVERIFIKASI';

  return `
    <article class="evidence-card">
      <button class="evidence-image evidence-preview-trigger" type="button" data-evidence-index="${index}" ${preview ? '' : 'disabled'} aria-label="Preview ${escapeHtml(evidence.title)}">
        ${preview
          ? `<img src="${escapeHtml(preview)}" alt="${escapeHtml(evidence.title)}" loading="lazy" referrerpolicy="no-referrer" />
             <span class="evidence-zoom" aria-hidden="true">⌕</span>`
          : `<span class="evidence-placeholder"><span class="evidence-placeholder-icon">▧</span><b>Preview tidak tersedia</b><small>Gunakan tombol buka file</small></span>`
        }
      </button>
      <div class="evidence-info">
        <div class="evidence-card-head">
          <strong>${escapeHtml(evidence.title)}</strong>
          <span class="evidence-validation ${validationClass(validation)}">${escapeHtml(validation)}</span>
        </div>
        <div class="evidence-meta-row"><span>Checkpoint</span><b>${escapeHtml(checkpointLabel)}</b></div>
        <div class="evidence-meta-row"><span>Upload</span><b>${escapeHtml(evidence.uploadedAt)}</b></div>
        <div class="evidence-meta-row"><span>Oleh</span><b>${escapeHtml(evidence.uploadedBy)}</b></div>
        <div class="evidence-actions">
          <button class="evidence-preview-button evidence-preview-trigger" type="button" data-evidence-index="${index}" ${preview ? '' : 'disabled'}>Lihat</button>
          ${original
            ? `<a class="evidence-open-link" href="${escapeHtml(original)}" target="_blank" rel="noopener noreferrer">Buka File</a>`
            : `<span class="evidence-open-link disabled">File tidak tersedia</span>`
          }
        </div>
      </div>
    </article>
  `;
}

function ensureEvidenceViewer() {
  if ($('#evidenceViewer')) return;

  const viewer = document.createElement('div');
  viewer.id = 'evidenceViewer';
  viewer.className = 'evidence-viewer';
  viewer.setAttribute('aria-hidden', 'true');
  viewer.innerHTML = `
    <div class="evidence-viewer-dialog" role="dialog" aria-modal="true" aria-label="Preview eviden">
      <button class="evidence-viewer-close" id="evidenceViewerClose" type="button" aria-label="Tutup preview">×</button>
      <div class="evidence-viewer-image-wrap">
        <img id="evidenceViewerImage" alt="Preview eviden" />
      </div>
      <div class="evidence-viewer-caption">
        <div>
          <strong id="evidenceViewerTitle">Eviden</strong>
          <span id="evidenceViewerMeta"></span>
        </div>
        <a id="evidenceViewerOpen" target="_blank" rel="noopener noreferrer">Buka File Asli</a>
      </div>
    </div>
  `;
  document.body.appendChild(viewer);

  $('#evidenceViewerClose').addEventListener('click', closeEvidencePreview);
  viewer.addEventListener('click', event => {
    if (event.target === viewer) closeEvidencePreview();
  });
}

function openEvidencePreview(index) {
  const evidence = activeStageEvidence[index];
  if (!evidence) return;

  const preview = imagePreviewUrl(evidence);
  if (!preview) return;

  ensureEvidenceViewer();
  const viewer = $('#evidenceViewer');
  const original = evidenceOriginalUrl(evidence);

  $('#evidenceViewerImage').src = preview;
  $('#evidenceViewerImage').alt = evidence.title || 'Preview eviden';
  $('#evidenceViewerTitle').textContent = evidence.title || 'Eviden';
  $('#evidenceViewerMeta').textContent = `${evidence.checkpointName || `Step ${evidence.checkpoint}`} • ${evidence.uploadedAt || '-'} • ${evidence.uploadedBy || '-'}`;

  const openLink = $('#evidenceViewerOpen');
  if (original) {
    openLink.href = original;
    openLink.classList.remove('disabled');
    openLink.removeAttribute('aria-disabled');
  } else {
    openLink.removeAttribute('href');
    openLink.classList.add('disabled');
    openLink.setAttribute('aria-disabled', 'true');
  }

  viewer.classList.add('show');
  viewer.setAttribute('aria-hidden', 'false');
}

function closeEvidencePreview() {
  const viewer = $('#evidenceViewer');
  if (!viewer) return;
  viewer.classList.remove('show');
  viewer.setAttribute('aria-hidden', 'true');
}

export function toggleAlertView() {
  dashboardState.isExpanded = !dashboardState.isExpanded;
  const container = document.getElementById('alertContainer');
  const viewAllBtn = document.getElementById('viewAllBtn');
  const total = filteredAlerts().length;

  if (dashboardState.isExpanded) {
    container.classList.add('expanded');
    viewAllBtn.innerHTML = `Sembunyikan Alert (<span id="viewAllCount">${total}</span>) <span class="arrow-icon up" id="arrowIcon">▼</span>`;
  } else {
    container.classList.remove('expanded');
    viewAllBtn.innerHTML = `Lihat Semua Alert (<span id="viewAllCount">${total}</span>) <span class="arrow-icon down" id="arrowIcon">▼</span>`;
  }
  renderAlerts();
}

export function showStageDetail(index, orderId) {
  dashboardState.selectedStageIndex = index;
  const a = dashboardState.data.alerts.find(x => x.idOrder === orderId);
  if (!a) return;

  const stageName = STAGE_NAMES[index];
  const stageInfo = STAGE_DETAILS[stageName] || STAGE_DETAILS[STAGE_NAMES[0]];
  const cur = mapCurrentStage(a);
  const stat = index < cur ? 'COMPLETED' : index === cur ? a.priority : 'NOT STARTED';
  const statusObj = STATUS[stat] || STATUS['NOT STARTED'];
  const sla = STAGE_SLA[index];
  const pctVal = index < cur ? 100 : (index === cur ? Math.round((a.slaUsedPct || 0) * 100) : 0);
  const remaining = index < cur
    ? 'Selesai'
    : index === cur
      ? (a.remainingHours < 0 ? `+${fmtHours(Math.abs(a.remainingHours))}` : fmtHours(a.remainingHours))
      : 'Belum Mulai';

  const checkpoints = buildStageCheckpoints(a, stageName, stageInfo, index, cur, stat);
  activeStageEvidence = getStageEvidence(a, stageName);

  const isIssueStage = index === cur && (a.issue || a.action);
  const stageStart = a.stageStart || a.start || '-';
  const stageFinish = index < cur ? (a.stageFinish || a.update || '-') : (a.stageFinish || '-');

  const popupContent = `
    <div class="popup-shipment-strip">
      <div><span>B/L NO.</span><b>${escapeHtml(a.bl || '-')}</b></div>
      <div><span>CONTAINER</span><b>${escapeHtml(a.container || '-')}</b></div>
      <div><span>ORIGIN</span><b>${escapeHtml(a.origin || '-')}</b></div>
      <div><span>WILAYAH</span><b>${escapeHtml(a.region || '-')}</b></div>
    </div>

    <section class="popup-info-section">
      <div class="popup-info-grid">
        <div class="popup-info-column">
          <div class="popup-info-row"><span>Nama Tahapan</span><b>${escapeHtml(stageName)}</b></div>
          <div class="popup-info-row"><span>Status</span><b><span class="status-badge ${getStatusBadgeClass(stat)}">${escapeHtml(stat)}</span></b></div>
          <div class="popup-info-row"><span>SLA Tahapan</span><b>${escapeHtml(sla)}</b></div>
          <div class="popup-info-row"><span>SLA Used</span><b style="color:${statusObj.color}">${pctVal}%</b></div>
          <div class="popup-info-row"><span>Sisa / Overdue</span><b style="color:${a.remainingHours < 0 ? '#d30d14' : '#0a7f63'}">${escapeHtml(remaining)}</b></div>
        </div>
        <div class="popup-info-column">
          <div class="popup-info-row popup-description-row"><span>Deskripsi</span><b>${escapeHtml(stageInfo.deskripsi || 'Proses tahapan ini')}</b></div>
          <div class="popup-info-row"><span>PIC Default</span><b>${escapeHtml(stageInfo.picDefault || a.pic || '-')}</b></div>
          <div class="popup-info-row"><span>Controller</span><b>${escapeHtml(stageInfo.controllerDefault || a.controller || '-')}</b></div>
          <div class="popup-info-row"><span>Mulai Tahapan</span><b>${escapeHtml(stageStart)}</b></div>
          <div class="popup-info-row"><span>Selesai Tahapan</span><b>${escapeHtml(stageFinish)}</b></div>
        </div>
      </div>
    </section>

    <section class="popup-section checkpoint-section">
      <div class="popup-section-title"><span class="popup-section-icon">▣</span> CHECKPOINT DETAIL</div>
      <div class="checkpoint-scroll">
        <div class="checkpoint-horizontal" style="--checkpoint-count:${Math.max(checkpoints.length, 1)}">
          ${checkpoints.map(cp => {
            const cls = checkpointStatusClass(cp.status);
            return `
              <div class="checkpoint-item ${cls}">
                <div class="checkpoint-circle">${checkpointIcon(cp.status)}</div>
                <div class="checkpoint-step">STEP ${cp.step}</div>
                <div class="checkpoint-name">${escapeHtml(cp.name)}</div>
                <div class="checkpoint-time">${escapeHtml(cp.displayTime || '-')}</div>
                <span class="checkpoint-status status-${cls}">${escapeHtml(cp.status)}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </section>

    <section class="popup-section evidence-section">
      <div class="popup-section-title evidence-title-row">
        <span><span class="popup-section-icon">▧</span> EVIDEN <em>(${activeStageEvidence.length})</em></span>
        <small>Thumbnail dapat diklik untuk memperbesar</small>
      </div>
      ${activeStageEvidence.length
        ? `<div class="evidence-grid">${activeStageEvidence.map(renderEvidenceCard).join('')}</div>`
        : `<div class="evidence-empty">
             <span class="evidence-empty-icon">▧</span>
             <div><b>Belum ada eviden untuk tahapan ini</b><small>Jika URL eviden dikirim oleh API, gambar akan otomatis muncul di area ini.</small></div>
           </div>`
      }
    </section>

    ${isIssueStage ? `
      <section class="popup-section popup-issue-section">
        <div class="popup-section-title"><span class="popup-section-icon">!</span> ISSUE / TINDAK LANJ</div>
        <div class="popup-issue-grid">
          <div><span>Issue</span><b>${escapeHtml(a.issue || '-')}</b></div>
          <div><span>Tindak Lanjut</span><b>${escapeHtml(a.action || '-')}</b></div>
          <div><span>PIC</span><b>${escapeHtml(a.pic || '-')}</b></div>
          <div><span>Target Selesai</span><b>${escapeHtml(a.targetFinish || '-')}</b></div>
        </div>
      </section>
    ` : ''}

    <div class="popup-footnote"><i>Klik di luar popup atau tekan ESC untuk menutup</i></div>
  `;

  $('#popupTitle').textContent = `Detail Tahapan ${index + 1}: ${stageName}`;
  $('#popupContent').innerHTML = popupContent;
  $('#stageDetailPopup').classList.add('show');
  document.body.classList.add('modal-open');

  renderJourney(a);
}

export function closeStageDetail() {
  closeEvidencePreview();
  $('#stageDetailPopup').classList.remove('show');
  document.body.classList.remove('modal-open');
  dashboardState.selectedStageIndex = -1;
  activeStageEvidence = [];
  const a = dashboardState.data.alerts.find(x => x.idOrder === dashboardState.selectedId);
  if (a) renderJourney(a);
}

export function initInteractions(loadData, onIntervalChange) {
  $('#applyFilter').addEventListener('click', renderAlerts);
  $('#search').addEventListener('input', renderAlerts);
  $('#refreshBtn').addEventListener('click', loadData);
  $('#refreshInterval').addEventListener('change', event => {
    const minutes = Number(event.target.value) || 15;
    if (typeof onIntervalChange === 'function') onIntervalChange(minutes);
  });
  $('#viewAllBtn').addEventListener('click', toggleAlertView);

  $('#region').addEventListener('change', () => {
    $('#region2').value = $('#region').value;
    renderAlerts();
  });

  $('#overallFilter').addEventListener('change', renderAlerts);
  $('#stageFilter').addEventListener('change', renderAlerts);
  $('#priorityFilter').addEventListener('change', renderAlerts);
  $('#region2').addEventListener('change', renderAlerts);
  $('#escalationFilter').addEventListener('change', renderAlerts);

  $('#journey').addEventListener('click', event => {
    const stage = event.target.closest('.stage[data-stage-index]');
    if (!stage) return;
    showStageDetail(Number(stage.dataset.stageIndex), stage.dataset.orderId);
  });

  $('#closeStageDetailBtn').addEventListener('click', closeStageDetail);

  $('#popupContent').addEventListener('click', event => {
    const trigger = event.target.closest('.evidence-preview-trigger');
    if (!trigger || trigger.disabled) return;
    const index = Number(trigger.dataset.evidenceIndex);
    if (Number.isInteger(index)) openEvidencePreview(index);
  });

  $('#stageDetailPopup').addEventListener('click', event => {
    if (event.target === $('#stageDetailPopup')) closeStageDetail();
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const viewer = $('#evidenceViewer');
    if (viewer?.classList.contains('show')) {
      closeEvidencePreview();
    } else {
      closeStageDetail();
    }
  });
}
