import { STATUS, STAGE_NAMES, STAGE_SLA, MAX_VISIBLE_ROWS } from './config.js';
import { dashboardState } from './data.js';
import {
  $, $$, pct, statusClass, fmtHours, priorityRank, calculatePeriodFromUpdates
} from './utils.js';

export function renderAll() {
    renderMetrics();
    renderOverall();
    populateFilters();
    renderAlerts();
    
    // 🔥 UPDATE PERIODE OTOMATIS DARI dashboardState.data UPDATE
    const period = calculatePeriodFromUpdates(dashboardState.data.alerts);
    document.getElementById('period').textContent = period;
    
    const first = (filteredAlerts()[0] || dashboardState.data.alerts[0]);
    if (first) selectShipment(first.idOrder);
    $('#lastUpdate').textContent = dashboardState.data.lastUpdate || '-';
}

export function renderMetrics() {
  const total = dashboardState.data.metrics.reduce((s, x) => s + x.count, 0);
  $('#metrics').innerHTML = dashboardState.data.metrics.map(m => {
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

  const colors = dashboardState.data.metrics.map(m => (STATUS[m.status] || STATUS['ON TRACK']).color);
  let acc = 0;
  const seg = dashboardState.data.metrics.map((m, i) => {
    const p = total ? m.count / total * 100 : 0;
    const x = `${colors[i]} ${acc}% ${acc + p}%`;
    acc += p;
    return x;
  }).join(',');
  $('#donut').style.background = `conic-gradient(${seg})`;
  $('#donutTotal').textContent = dashboardState.data.overall?.total || total;

  $('#donutLegend').innerHTML = dashboardState.data.metrics.map(m => {
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

export function renderOverall() {
  const o = dashboardState.data.overall || { onTrack: 0, atRisk: 0, late: 0, total: 0 };
  $('#overallCards').innerHTML = [
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

  const crit = dashboardState.data.alerts.filter(x => x.priority === 'CRITICAL EVENT');
  $('#criticalCount').textContent = crit.length;
  $('#criticalIssue').textContent = crit.length ? crit[0].issue || 'Critical event terdeteksi' : 'Tidak ada critical event';
}

export function populateFilters() {
  const regions = [...new Set([...(dashboardState.data.regions || []), ...dashboardState.data.alerts.map(a => a.region).filter(Boolean)])].sort();
  ['#region', '#region2'].forEach(sel => {
    const el = $(sel);
    const val = el.value;
    el.innerHTML = (sel === '#region' ? '<option value="">Semua</option>' : '<option value="">Semua Wilayah</option>') +
      regions.map(r => `<option>${r}</option>`).join('');
    el.value = val;
  });

  const stages = [...new Set(dashboardState.data.alerts.map(a => a.stage).filter(Boolean))].sort();
  $('#stageFilter').innerHTML = '<option value="">Semua Tahapan</option>' +
    stages.map(s => `<option>${s}</option>`).join('');
}

export function filteredAlerts() {
  const q = $('#search').value.trim().toLowerCase();
  const st = $('#stageFilter').value;
  const pr = $('#priorityFilter').value;
  const rg = $('#region2').value || $('#region').value;
  const es = $('#escalationFilter').value;
  const ov = $('#overallFilter')?.value || '';

  return dashboardState.data.alerts.filter(a => {
    const matchSearch = !q || `${a.bl} ${a.container}`.toLowerCase().includes(q);
    const matchStage = !st || a.stage === st;
    const matchPriority = !pr || a.priority === pr;
    const matchRegion = !rg || a.region === rg;
    const matchEscalation = !es || a.escalationStatus === es;
    const matchOverall = !ov || a.overallStatus === ov;
    return matchSearch && matchStage && matchPriority && matchRegion && matchEscalation && matchOverall;
  }).sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || b.slaUsedPct - a.slaUsedPct);
}

export function renderAlerts() {
  const rows = filteredAlerts();
  const total = rows.length;
  $('#totalAlert').textContent = total;
  $('#viewAllCount').textContent = total;

  const visibleRows = dashboardState.isExpanded ? total : Math.min(total, MAX_VISIBLE_ROWS);
  
  $('#alertRows').innerHTML = rows.map((a, index) => {
    const st = STATUS[a.priority] || STATUS['ON TRACK'];
    const remain = a.remainingHours < 0 ? `+${fmtHours(Math.abs(a.remainingHours))}` : fmtHours(a.remainingHours);
    const remainColor = a.remainingHours < 0 ? '#d30d14' : (a.slaUsedPct >= .85 ? '#e26e05' : '#0a7f63');
    const priorityLabel = a.priority
      .replace('CRITICAL EVENT', 'Critical Event')
      .replace('SLA BREACH', 'SLA Breach')
      .replace('AT RISK', 'At Risk');
    
    const hiddenClass = (!dashboardState.isExpanded && index >= visibleRows) ? 'hidden-row' : '';

    return `<tr data-id="${a.idOrder}" class="${a.idOrder === dashboardState.selectedId ? 'selected' : ''} ${hiddenClass}">
      <td class="prio" style="color:${st.color}">
        <span class="pill-icon" style="background:${st.color}">${st.icon}</span>
        ${priorityLabel}
      </td>
      <td><b>${a.bl || '-'}</b></td>
      <td><b>${a.container || '-'}</b></td>
      <td><b>${a.stage || '-'}</b><br/>(${a.slaHours || '-'} Jam)</td>
      <td class="pct-big" style="color:${st.color}">${Math.round((a.slaUsedPct || 0) * 100)}%</td>
      <td style="color:${remainColor};font-weight:800">${remain}</td>
      <td>${a.currentCheckpoint || '-'}</td>
      <td>${a.pic || '-'}</td>
      <td>${a.controller || '-'}</td>
      <td><span class="tag ${a.escalationStatus && a.escalationStatus !== 'NONE' ? 'tag-orange' : 'tag-gray'}">${a.escalationStatus || 'NONE'}</span></td>
      <td style="font-weight:800;color:${a.overallStatus === 'ON TRACK' ? '#087e63' : a.overallStatus === 'AT RISK' ? '#e26e05' : '#c90d13'}">
        ${a.overallStatus || '-'}<br/><span style="font-weight:500">(${fmtHours(a.overallRemainingHours)} sisa)</span>
      </td>
      <td>${a.update || '-'}</td>
    </tr>`;
  }).join('');

  // Update view all button
  const viewAllBtn = document.getElementById('viewAllBtn');
  if (dashboardState.isExpanded) {
    viewAllBtn.innerHTML = `Sembunyikan Alert (<span id="viewAllCount">${total}</span>) <span class="arrow-icon up" id="arrowIcon">▼</span>`;
  } else {
    viewAllBtn.innerHTML = `Lihat Semua Alert (<span id="viewAllCount">${total}</span>) <span class="arrow-icon down" id="arrowIcon">▼</span>`;
  }

  $$('#alertRows tr').forEach(tr => {
    tr.onclick = () => selectShipment(tr.dataset.id);
  });
}

export function selectShipment(id) {
  dashboardState.selectedId = id;
  dashboardState.selectedStageIndex = -1;
  renderAlerts();
  const a = dashboardState.data.alerts.find(x => x.idOrder === id);
  if (!a) return;

  $('#selectedBar').innerHTML = `
    <div class="selected-label">◉ SELECTED SHIPMENT (DETAIL VIEW)</div>
    <div class="selected-item">B/L NO. &nbsp; <b>${a.bl}</b></div>
    <div class="selected-item">| &nbsp; CONTAINER &nbsp; <b>${a.container}</b></div>
    <div class="selected-item">| &nbsp; ORIGIN &nbsp; <b>${a.origin || '-'}</b></div>
    <div class="selected-item">| &nbsp; WILAYAH &nbsp; <b>${a.region || '-'}</b></div>
    <div class="selected-item">| &nbsp; OVERALL SLA (7 HARI)</div>
    <div class="overall-badge">${a.overallStatus} (${fmtHours(a.overallRemainingHours)} sisa)</div>
  `;

  renderJourney(a);
  renderDetail(a);
}

export function mapCurrentStage(a) {
  const s = (a.stage || '').toLowerCase();
  const match = STAGE_NAMES.findIndex(x => {
    const y = x.toLowerCase();
    if (s.includes('lab')) return y.includes('uji lab');
    if (s.includes('karantina') || s.includes('sampling')) return y.includes('karantina');
    if (s.includes('sppb')) return y === 'sppb';
    if (s.includes('do')) return y.includes('tebus do');
    if (s.includes('billing paid')) return y.includes('billing paid');
    if (s.includes('billing')) return y === 'e-billing';
    if (s.includes('pib') && s.includes('terbit')) return y.includes('pib terbit');
    if (s.includes('draft')) return y.includes('draft pib');
    if (s.includes('penjaluran')) return y.includes('penjaluran');
    if (s.includes('delivery')) return y.includes('delivery / bast');
    if (s.includes('empty')) return y.includes('empty return');
    if (s.includes('pre') || s.includes('verval')) return y.includes('pre-alert');
    return false;
  });
  return match >= 0 ? match : 0;
}

export function renderJourney(a) {
  const cur = mapCurrentStage(a);
  $('#journey').innerHTML = STAGE_NAMES.map((name, i) => {
    let stat = i < cur ? 'COMPLETED' : i === cur ? a.priority : 'NOT STARTED';
    let cls = statusClass(stat);
    let p = i < cur ? 100 : (i === cur ? Math.round(a.slaUsedPct * 100) : 0);
    let note = i < cur ? 'Selesai' : i === cur ? (a.remainingHours < 0 ? `+${fmtHours(Math.abs(a.remainingHours))}` : fmtHours(a.remainingHours)) : 'Belum Mulai';
    const statusObj = STATUS[stat] || STATUS['NOT STARTED'];
    const isActive = i === dashboardState.selectedStageIndex;

    return `<div class="stage ${cls} ${i === cur ? 'current' : ''} ${isActive ? 'active' : ''}" data-stage-index="${i}" data-order-id="${a.idOrder}" title="Klik untuk detail ${name}">
      <div class="circle">${i + 1}</div>
      <div class="stage-name">${name}</div>
      <div class="stage-sla">(${STAGE_SLA[i]})</div>
      <div class="stage-pct" style="color:${statusObj.color}">${p ? `${p}%` : ''}</div>
      <div class="stage-note" style="color:${statusObj.color}">${note}</div>
      ${i < cur ? '<div class="checkmark">✓</div>' : ''}
    </div>`;
  }).join('');

  const overallElapsed = (a.overallElapsedHours || 0);
  $('#journeyFoot').innerHTML = `
    <span>SLA Total (Overall): 7 Hari</span>
    <span>Overall SLA: ${a.overallStatus}</span>
    <span>SLA Elapsed: ${fmtHours(overallElapsed)}</span>
    <span>SLA Remaining: ${fmtHours(a.overallRemainingHours)}</span>
  `;
}

export function renderDetail(a) {
  const cur = mapCurrentStage(a);
  $('#detailChip').textContent = `TAHAPAN : ${cur + 1}. ${STAGE_NAMES[cur].toUpperCase()}`;
  $('#detailSla').textContent = `| SLA : ${a.slaHours || '-'} JAM`;

  const elapsed = (a.slaUsedPct || 0) * (a.slaHours || 0);
  const over = Math.max(0, elapsed - (a.slaHours || 0));
  const remaining = Math.max(0, (a.slaHours || 0) - elapsed);

  $('#detailStats').innerHTML = [
    ['SLA USED', `${Math.round((a.slaUsedPct || 0) * 100)}%`, (a.slaUsedPct >= 1 ? '#d20c13' : '#0a7f63')],
    ['ELAPSED', fmtHours(elapsed), '#d20c13'],
    ['OVERDUE', over ? `+${fmtHours(over)}` : '-', '#d20c13'],
    ['REMAINING', remaining ? fmtHours(remaining) : '-', '#0a7f63'],
    ['TARGET SELESAI', a.targetFinish || '-', '#061a3b'],
    ['STATUS TAHAPAN', a.priority, '#d20c13']
  ].map(x => `
    <div class="detail-stat">
      <label>${x[0]}</label>
      <strong style="color:${x[2]}">${x[1]}</strong>
    </div>
  `).join('');

  const hist = (dashboardState.data.history && dashboardState.data.history[a.idOrder]) || [{
    name: a.currentCheckpoint || a.stage,
    status: a.priority,
    start: a.start || '-',
    elapsed: elapsed,
    sla: a.slaHours,
    used: a.slaUsedPct,
    remaining: a.remainingHours < 0 ? `${fmtHours(a.remainingHours)} Overdue` : fmtHours(a.remainingHours),
    pic: a.pic
  }];

  $('#checkpointRows').innerHTML = hist.slice(-7).map((h, i) => `
    <tr class="${h.status === 'SLA BREACH' || h.status === 'CRITICAL EVENT' ? 'alert-row' : ''}">
      <td>${cur + 1}.${i + 1}</td>
      <td style="text-align:left">${h.name || '-'}</td>
      <td>${h.status === 'COMPLETED' ? '<span class="mini-check">✓</span>' : h.status === 'NOT STARTED' ? '<span class="mini-wait">○</span>' : '<span class="mini-wait" style="border-color:#d20c13;color:#d20c13">!</span>'}</td>
      <td>${h.start || '-'}</td>
      <td>${fmtHours(h.elapsed)}</td>
      <td>${h.sla ? fmtHours(h.sla) : '-'}</td>
      <td>${Math.round((h.used || 0) * 100)}%</td>
      <td>${h.remaining || '-'}</td>
      <td>${h.pic || a.pic || '-'}</td>
    </tr>
  `).join('');

  const actions = (a.action || 'Monitor sesuai SLA').split(/;|\n|\|/).map(x => x.trim()).filter(Boolean);
  $('#currentAction').innerHTML = actions.slice(0, 4).map(x => `<li>${x}</li>`).join('');

  const flow = (dashboardState.data.flows && dashboardState.data.flows[a.idOrder]) || a.escalationFlow || [
    a.controller || 'Koordinator',
    'Pimpinan Proyek (Pimpro)',
    'PIC Pengadaan / PPI',
    'Top Management PPI'
  ];
  $('#flowList').innerHTML = flow.slice(0, 5).map((x, i) => `
    <div class="flow-item">
      <span class="flow-avatar">●</span>
      <span>${x}</span>
    </div>
    ${i < flow.length - 1 ? '<div class="arrow-down">↓</div>' : ''}
  `).join('');

  const tl = (dashboardState.data.timelines && dashboardState.data.timelines[a.idOrder]) || [
    { time: a.update || '-', desc: `Escalasi Level ${a.escalationLevel || 0}\n${a.controller || ''}`, state: 'done' },
    { time: '-', desc: 'Level berikutnya menunggu trigger SLA', state: 'pending' }
  ];
  $('#timeline').innerHTML = tl.slice(0, 4).map(t => `
    <div class="timeline-row">
      <div class="time">${t.time || '-'}</div>
      <div class="desc">${(t.desc || '').replace(/\n/g, '<br/>')}</div>
      <div class="timeline-icon ${t.state === 'pending' ? 'pending' : t.state === 'wait' ? 'wait' : ''}">
        ${t.state === 'done' ? '✓' : t.state === 'wait' ? '⌕' : '○'}
      </div>
    </div>
  `).join('');
}
