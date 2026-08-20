// ============================================================
// EVENT HANDLERS
// ============================================================

import { CONFIG } from './config.js';
import { getData, setData } from './data.js';
import { 
    $, $$, fmtHours, statusClass, mapCurrentStage, 
    getStatusBadgeClass, priorityRank 
} from './utils.js';
import { 
    renderAlerts, renderJourney, renderDetail, 
    setSelectedId, getSelectedId, setSelectedStageIndex, getSelectedStageIndex,
    filteredAlerts 
} from './render.js';

let selectedId = null;
let selectedStageIndex = -1;

/**
 * Select a shipment
 * @param {string} id - Order ID
 */
export function selectShipment(id) {
    selectedId = id;
    selectedStageIndex = -1;
    setSelectedId(id);
    setSelectedStageIndex(-1);
    
    renderAlerts();
    
    const data = getData();
    const a = data.alerts.find(x => x.idOrder === id);
    if (!a) return;

    const selectedBar = $('#selectedBar');
    if (selectedBar) {
        selectedBar.innerHTML = `
            <div class="selected-label">◉ SELECTED SHIPMENT (DETAIL VIEW)</div>
            <div class="selected-item">B/L NO. &nbsp; <b>${a.bl}</b></div>
            <div class="selected-item">| &nbsp; CONTAINER &nbsp; <b>${a.container}</b></div>
            <div class="selected-item">| &nbsp; ORIGIN &nbsp; <b>${a.origin || '-'}</b></div>
            <div class="selected-item">| &nbsp; WILAYAH &nbsp; <b>${a.region || '-'}</b></div>
            <div class="selected-item">| &nbsp; OVERALL SLA (7 HARI)</div>
            <div class="overall-badge">${a.overallStatus} (${fmtHours(a.overallRemainingHours)} sisa)</div>
        `;
    }

    renderJourney(a);
    renderDetail(a);
}

/**
 * Adjust table height based on number of rows
 */
export function adjustTableHeight() {
    const rows = $('#alertRows')?.children?.length || 0;
    const rowHeight = 31;
    const headerHeight = 38;
    const maxHeight = 500;
    const minHeight = 200;
    const calculatedHeight = Math.min(rows * rowHeight + headerHeight + 10, maxHeight);
    const finalHeight = Math.max(calculatedHeight, minHeight);
    
    const tableWrap = $('#tableWrap');
    if (tableWrap) {
        tableWrap.style.maxHeight = finalHeight + 'px';
        tableWrap.style.height = finalHeight + 'px';
    }
}

/**
 * Toggle view all alerts
 */
export function toggleViewAll() {
    const box = $('#alertsBox');
    const btn = $('#viewAllBtn');
    const count = $('#viewAllCount')?.textContent || '0';
    
    if (!box) return;
    
    box.classList.toggle('expanded');
    
    if (box.classList.contains('expanded')) {
        if (btn) {
            btn.innerHTML = `Sembunyikan Alert (<span id="viewAllCount">${count}</span>) <span class="arrow-icon rotated" id="arrowIcon">▼</span>`;
        }
        setTimeout(adjustTableHeight, 50);
    } else {
        if (btn) {
            btn.innerHTML = `Lihat Semua Alert (<span id="viewAllCount">${count}</span>) <span class="arrow-icon" id="arrowIcon">▼</span>`;
        }
        const tableWrap = $('#tableWrap');
        if (tableWrap) {
            tableWrap.style.maxHeight = '200px';
            tableWrap.style.height = '200px';
        }
    }
    
    const newCount = btn?.querySelector('#viewAllCount');
    if (newCount) newCount.textContent = count;
}

/**
 * Show stage detail popup
 * @param {number} index - Stage index
 * @param {string} orderId - Order ID
 */
export function showStageDetail(index, orderId) {
    selectedStageIndex = index;
    setSelectedStageIndex(index);
    
    const data = getData();
    const a = data.alerts.find(x => x.idOrder === orderId);
    if (!a) return;

    const STAGE_NAMES = CONFIG.STAGE_NAMES;
    const STAGE_SLA = CONFIG.STAGE_SLA;
    const STAGE_DETAILS = CONFIG.STAGE_DETAILS;
    
    const stageName = STAGE_NAMES[index];
    const stageInfo = STAGE_DETAILS[stageName] || STAGE_DETAILS[STAGE_NAMES[0]];
    const cur = mapCurrentStage(a, STAGE_NAMES);
    const stat = index < cur ? 'COMPLETED' : index === cur ? a.priority : 'NOT STARTED';
    const statusObj = CONFIG.STATUS[stat] || CONFIG.STATUS['NOT STARTED'];
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

    const popupTitle = $('#popupTitle');
    const popupContentEl = $('#popupContent');
    const popup = $('#stageDetailPopup');
    
    if (popupTitle) popupTitle.textContent = `Detail Tahapan ${index + 1}: ${stageName}`;
    if (popupContentEl) popupContentEl.innerHTML = popupContent;
    if (popup) popup.classList.add('show');

    renderJourney(a);
}

/**
 * Close stage detail popup
 */
export function closeStageDetail() {
    const popup = $('#stageDetailPopup');
    if (popup) popup.classList.remove('show');
    
    selectedStageIndex = -1;
    setSelectedStageIndex(-1);
    
    const data = getData();
    const a = data.alerts.find(x => x.idOrder === selectedId);
    if (a) renderJourney(a);
}

/**
 * Apply filters
 */
export function applyFilters() {
    renderAlerts();
}

/**
 * Initialize event listeners
 */
export function initEvents() {
    // Apply filter
    const applyFilter = $('#applyFilter');
    if (applyFilter) {
        applyFilter.onclick = applyFilters;
    }
    
    // Search input
    const search = $('#search');
    if (search) {
        search.addEventListener('input', applyFilters);
    }
    
    // Refresh button
    const refreshBtn = $('#refreshBtn');
    if (refreshBtn) {
        refreshBtn.onclick = () => window.location.reload();
    }
    
    // Region filter
    const region = $('#region');
    const region2 = $('#region2');
    if (region) {
        region.onchange = () => {
            if (region2) region2.value = region.value;
            applyFilters();
        };
    }
    if (region2) {
        region2.onchange = applyFilters;
    }
    
    // Other filters
    const overallFilter = $('#overallFilter');
    const stageFilter = $('#stageFilter');
    const priorityFilter = $('#priorityFilter');
    const escalationFilter = $('#escalationFilter');
    
    if (overallFilter) overallFilter.onchange = applyFilters;
    if (stageFilter) stageFilter.onchange = applyFilters;
    if (priorityFilter) priorityFilter.onchange = applyFilters;
    if (escalationFilter) escalationFilter.onchange = applyFilters;
    
    // Toggle view all
    const viewAllBtn = $('#viewAllBtn');
    if (viewAllBtn) {
        viewAllBtn.onclick = toggleViewAll;
    }
    
    // Popup close
    const popupClose = $('#popupCloseBtn');
    if (popupClose) {
        popupClose.onclick = closeStageDetail;
    }
    
    // Click outside popup
    document.addEventListener('click', function(e) {
        const popup = $('#stageDetailPopup');
        if (popup && e.target === popup) {
            closeStageDetail();
        }
    });
    
    // ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeStageDetail();
        }
    });
}
