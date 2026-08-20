// ============================================================
// RENDER FUNCTIONS
// ============================================================

import { CONFIG } from './config.js';
import { getData } from './data.js';
import { $, $$, pct, fmtHours, statusClass, priorityRank, mapCurrentStage, getStatusBadgeClass } from './utils.js';
import { selectShipment, filteredAlerts, adjustTableHeight, showStageDetail, closeStageDetail } from './events.js';

let selectedId = null;
let selectedStageIndex = -1;

/**
 * Render all components
 */
export function renderAll() {
    renderMetrics();
    renderOverall();
    populateFilters();
    renderAlerts();
    
    const data = getData();
    const first = (filteredAlerts()[0] || data.alerts[0]);
    if (first) selectShipment(first.idOrder);
    
    const updateTime = $('#updateTime');
    if (updateTime) {
        updateTime.textContent = data.lastUpdate || '-';
    }
}

/**
 * Render metrics
 */
export function renderMetrics() {
    const data = getData();
    const total = data.metrics.reduce((s, x) => s + x.count, 0);
    const STATUS = CONFIG.STATUS;
    const metricsEl = $('#metrics');
    
    if (!metricsEl) return;
    
    metricsEl.innerHTML = data.metrics.map(m => {
        const st = STATUS[m.status] || STATUS['ON TRACK'];
        return `<div class="metric">
            <div class="metric-head" style="color:${st.color}">
                <span class="metric-icon" style="background:${st.color}">${st.icon}</span>
                ${m.status}
            </div>
            <div class="value">${m.count}</div>
            <div class="pct">${pct(m.count, total)}%</div>
        </div>`;
    }).join('');

    // Donut chart
    const colors = data.metrics.map(m => (STATUS[m.status] || STATUS['ON TRACK']).color);
    let acc = 0;
    const seg = data.metrics.map((m, i) => {
        const p = total ? m.count / total * 100 : 0;
        const x = `${colors[i]} ${acc}% ${acc + p}%`;
        acc += p;
        return x;
    }).join(',');
    
    const donut = $('#donut');
    if (donut) {
        donut.style.background = `conic-gradient(${seg})`;
    }
    
    const donutTotal = $('#donutTotal');
    if (donutTotal) {
        donutTotal.textContent = data.overall?.total || total;
    }

    const donutLegend = $('#donutLegend');
    if (donutLegend) {
        donutLegend.innerHTML = data.metrics.map(m => {
            const st = STATUS[m.status] || STATUS['ON TRACK'];
            const label = m.status
                .replace('CRITICAL EVENT', 'Critical Event')
                .replace('SLA BREACH', 'SLA Breach')
                .replace('AT RISK', 'At Risk')
                .replace('WARNING', 'Warning')
                .replace('ON TRACK', 'On Track')
                .replace('COMPLETED', 'Completed');
            return `<div class="legend-row">
                <span class="dot" style="background:${st.color}"></span>
                <span>${label}</span>
                <b>${m.count} (${pct(m.count, total)}%)</b>
            </div>`;
        }).join('');
    }
}

/**
 * Render overall SLA
 */
export function renderOverall() {
    const data = getData();
    const o = data.overall || { onTrack: 0, atRisk: 0, late: 0, total: 0 };
    const overallCards = $('#overallCards');
    
    if (!overallCards) return;
    
    overallCards.innerHTML = [
        ['ON TRACK', '(≤ 7 HARI)', o.onTrack, 'Masih On Track', '#07936f'],
        ['AT RISK', '(MENDEKATI 7 HARI)', o.atRisk, 'Perlu Monitoring', '#f17b0c'],
        ['LEWAT SLA', '(> 7 HARI)', o.late, 'Perlu Tindakan', '#b5090d']
    ].map(x => `
        <div class="overall-card">
            <div class="label" style="color:${x[4]}">${x[0]}<br/>${x[1]}</div>
            <div class="big" style="color:${x[4]}">${x[2]} <span>${pct(x[2], o.total)}%</span></div>
            <small>${x[3]}</small>
        </div>
    `).join('');

    const crit = data.alerts.filter(x => x.priority === 'CRITICAL EVENT');
    const criticalCount = $('#criticalCount');
    const criticalIssue = $('#criticalIssue');
    
    if (criticalCount) criticalCount.textContent = crit.length;
    if (criticalIssue) {
        criticalIssue.textContent = crit.length ? crit[0].issue || 'Critical event terdeteksi' : 'Tidak ada critical event';
    }
}

/**
 * Populate filters
 */
export function populateFilters() {
    const data = getData();
    const regions = [...new Set([...(data.regions || []), ...data.alerts.map(a => a.region).filter(Boolean)])].sort();
    
    ['#region', '#region2'].forEach(sel => {
        const el = $(sel);
        if (!el) return;
        const val = el.value;
        el.innerHTML = (sel === '#region' ? '<option value="">Semua</option>' : '<option value="">Semua Wilayah</option>') +
            regions.map(r => `<option>${r}</option>`).join('');
        el.value = val;
    });

    const stages = [...new Set(data.alerts.map(a => a.stage).filter(Boolean))].sort();
    const stageFilter = $('#stageFilter');
    if (stageFilter) {
        stageFilter.innerHTML = '<option value="">Semua Tahapan</option>' +
            stages.map(s => `<option>${s}</option>`).join('');
    }
}

/**
 * Filter alerts
 */
export function filteredAlerts() {
    const data = getData();
    const q = $('#search')?.value?.trim()?.toLowerCase() || '';
    const st = $('#stageFilter')?.value || '';
    const pr = $('#priorityFilter')?.value || '';
    const rg = $('#region2')?.value || $('#region')?.value || '';
    const es = $('#escalationFilter')?.value || '';
    const ov = $('#overallFilter')?.value || '';

    return data.alerts.filter(a => {
        const matchSearch = !q || `${a.bl} ${a.container}`.toLowerCase().includes(q);
        const matchStage = !st || a.stage === st;
        const matchPriority = !pr || a.priority === pr;
        const matchRegion = !rg || a.region === rg;
        const matchEscalation = !es || a.escalationStatus === es;
        const matchOverall = !ov || a.overallStatus === ov;
        return matchSearch && matchStage && matchPriority && matchRegion && matchEscalation && matchOverall;
    }).sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || b.slaUsedPct - a.slaUsedPct);
}

/**
 * Render alerts table
 */
export function renderAlerts() {
    const data = getData();
    const rows = filteredAlerts();
    const totalRows = data.alerts.length;
    const filteredCount = rows.length;
    const STATUS = CONFIG.STATUS;
    
    const totalAlert = $('#totalAlert');
    const viewAllCount = $('#viewAllCount');
    const alertRows = $('#alertRows');
    
    if (totalAlert) totalAlert.textContent = totalRows;
    if (viewAllCount) viewAllCount.textContent = filteredCount;
    if (!alertRows) return;

    alertRows.innerHTML = rows.map(a => {
        const st = STATUS[a.priority] || STATUS['ON TRACK'];
        const remain = a.remainingHours < 0 ? `+${fmtHours(Math.abs(a.remainingHours))}` : fmtHours(a.remainingHours);
        const remainColor = a.remainingHours < 0 ? '#d30d14' : (a.slaUsedPct >= .85 ? '#e26e05' : '#0a7f63');
        const priorityLabel = a.priority
            .replace('CRITICAL EVENT', 'Critical Event')
            .replace('SLA BREACH', 'SLA Breach')
            .replace('AT RISK', 'At Risk');

        return `<tr data-id="${a.idOrder}" class="${a.idOrder === selectedId ? 'selected' : ''}">
            <td class="prio" style="color:${st.color};white-space:nowrap;">
                <span class="pill-icon" style="background:${st.color}">${st.icon}</span>
                ${priorityLabel}
            </td>
            <td><b>${a.bl || '-'}</b></td>
            <td><b>${a.container || '-'}</b></td>
            <td><b>${a.stage || '-'}</b><br/>(${a.slaHours || '-'} Jam)</td>
            <td class="pct-big" style="color:${st.color}">${Math.round((a.slaUsedPct || 0) * 100)}%</td>
            <td style="color:${remainColor};font-weight:800;white-space:nowrap;">${remain}</td>
            <td style="font-size:7.5px;">${a.currentCheckpoint || '-'}</td>
            <td>${a.pic || '-'}</td>
            <td>${a.controller || '-'}</td>
            <td><span class="tag ${a.escalationStatus && a.escalationStatus !== 'NONE' ? 'tag-orange' : 'tag-gray'}" style="font-size:7px;">${a.escalationStatus || 'NONE'}</span></td>
            <td style="font-weight:800;font-size:7.5px;color:${a.overallStatus === 'ON TRACK' ? '#087e63' : a.overallStatus === 'AT RISK' ? '#e26e05' : '#c90d13'}">
                ${a.overallStatus || '-'}<br/><span style="font-weight:500;font-size:6.5px;">(${fmtHours(a.overallRemainingHours)} sisa)</span>
            </td>
            <td style="font-size:7px;">${a.update || '-'}</td>
        </tr>`;
    }).join('');

    // Event click untuk row
    $$('#alertRows tr').forEach(tr => {
        tr.onclick = () => selectShipment(tr.dataset.id);
    });

    if ($('#alertsBox')?.classList?.contains('expanded')) {
        adjustTableHeight();
    }
}

/**
 * Set selected ID
 */
export function setSelectedId(id) {
    selectedId = id;
}

/**
 * Get selected ID
 */
export function getSelectedId() {
    return selectedId;
}

/**
 * Set selected stage index
 */
export function setSelectedStageIndex(index) {
    selectedStageIndex = index;
}

/**
 * Get selected stage index
 */
export function getSelectedStageIndex() {
    return selectedStageIndex;
}
