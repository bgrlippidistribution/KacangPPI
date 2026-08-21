import { STAGE_NAMES, STAGE_SLA, STAGE_DETAILS, STATUS } from './config.js';
import { dashboardState } from './data.js';
import { $, fmtHours, getStatusBadgeClass } from './utils.js';
import {
  filteredAlerts, renderAlerts, renderJourney, mapCurrentStage
} from './render.js';

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
  const pctVal = index < cur ? 100 : (index === cur ? Math.round(a.slaUsedPct * 100) : 0);
  const remaining = index < cur ? 'Selesai' : index === cur ? (a.remainingHours < 0 ? `+${fmtHours(Math.abs(a.remainingHours))}` : fmtHours(a.remainingHours)) : 'Belum Mulai';

  const steps = stageInfo.steps || ['Proses 1', 'Proses 2', 'Proses 3'];
  const stepStatuses = steps.map((step, i) => {
    if (index < cur) return 'COMPLETED';
    if (index === cur && i === 0) return a.priority;
    if (index === cur && i < 2) return 'ON TRACK';
    return 'NOT STARTED';
  });

  const popupContent = `
    <div class="detail-row">
      <span class="label">Nama Tahapan</span>
      <span class="value"><strong>${stageName}</strong></span>
    </div>
    <div class="detail-row">
      <span class="label">Status</span>
      <span class="value"><span class="status-badge ${getStatusBadgeClass(stat)}">${stat}</span></span>
    </div>
    <div class="detail-row">
      <span class="label">SLA Tahapan</span>
      <span class="value">${sla}</span>
    </div>
    <div class="detail-row">
      <span class="label">SLA Used</span>
      <span class="value" style="color:${statusObj.color}">${pctVal}%</span>
    </div>
    <div class="detail-row">
      <span class="label">Sisa / Overdue</span>
      <span class="value" style="color:${a.remainingHours < 0 ? '#d30d14' : '#0a7f63'}">${remaining}</span>
    </div>
    <div class="detail-row">
      <span class="label">Deskripsi</span>
      <span class="value">${stageInfo.deskripsi || 'Proses tahapan ini'}</span>
    </div>
    <div class="detail-row">
      <span class="label">PIC Default</span>
      <span class="value">${stageInfo.picDefault || a.pic || '-'}</span>
    </div>
    <div class="detail-row">
      <span class="label">Controller</span>
      <span class="value">${stageInfo.controllerDefault || a.controller || '-'}</span>
    </div>
    <div style="margin-top:15px;border-top:2px solid #e1e5eb;padding-top:12px">
      <div style="font-weight:700;font-size:11px;margin-bottom:8px">📋 CHECKPOINT DETAIL</div>
      ${steps.map((step, i) => `
        <div class="detail-row" style="padding:4px 0;border-bottom:1px solid #f0f2f5">
          <span class="label">Step ${i+1}</span>
          <span class="value">${step} 
            <span class="status-badge ${getStatusBadgeClass(stepStatuses[i])}" style="font-size:8px;padding:1px 8px;margin-left:8px">
              ${stepStatuses[i]}
            </span>
          </span>
        </div>
      `).join('')}
    </div>
    <div style="margin-top:12px;font-size:9px;color:#6a8aaa;border-top:1px solid #e1e5eb;padding-top:8px">
      <i>Klik di luar popup untuk menutup</i>
    </div>
  `;

  $('#popupTitle').textContent = `Detail Tahapan ${index + 1}: ${stageName}`;
  $('#popupContent').innerHTML = popupContent;
  $('#stageDetailPopup').classList.add('show');

  renderJourney(a);
}

export function closeStageDetail() {
  $('#stageDetailPopup').classList.remove('show');
  dashboardState.selectedStageIndex = -1;
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

  $('#overallFilter')?.addEventListener('change', renderAlerts);
  $('#stageFilter').addEventListener('change', renderAlerts);
  $('#priorityFilter').addEventListener('change', renderAlerts);
  $('#region2').addEventListener('change', renderAlerts);
  $('#escalationFilter').addEventListener('change', renderAlerts);

  // Event delegation untuk 12 tahapan SLA.
  $('#journey').addEventListener('click', event => {
    const stage = event.target.closest('.stage[data-stage-index]');
    if (!stage) return;
    showStageDetail(Number(stage.dataset.stageIndex), stage.dataset.orderId);
  });

  $('#closeStageDetailBtn').addEventListener('click', closeStageDetail);

  $('#stageDetailPopup').addEventListener('click', event => {
    if (event.target === $('#stageDetailPopup')) closeStageDetail();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeStageDetail();
  });
}
