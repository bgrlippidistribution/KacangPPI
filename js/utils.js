export const $ = selector => document.querySelector(selector);
export const $$ = selector => [...document.querySelectorAll(selector)];

export function pct(n, total) {
  return total ? Math.round(n / total * 100) : 0;
}

export function statusClass(s) {
  s = (s || '').toUpperCase();
  if (s.includes('CRITICAL')) return 'critical';
  if (s.includes('BREACH')) return 'breach';
  if (s.includes('AT RISK')) return 'atrisk';
  if (s.includes('WARNING')) return 'warning';
  if (s.includes('COMPLETED')) return 'completed';
  if (s.includes('ON TRACK')) return 'ontrack';
  return 'notstarted';
}

export function fmtHours(h) {
  if (h == null || isNaN(h)) return '-';
  const abs = Math.abs(h);
  if (abs >= 24) {
    const d = Math.floor(abs / 24);
    const hr = Math.round(abs % 24);
    return `${h < 0 ? '-' : ''}${d} Hr ${hr} Jam`;
  }
  return `${h < 0 ? '-' : ''}${Math.round(abs * 10) / 10} Jam`;
}

export function priorityRank(s) {
  const map = {
    'CRITICAL EVENT': 0,
    'SLA BREACH': 1,
    'AT RISK': 2,
    'WARNING': 3,
    'ON TRACK': 4,
    'COMPLETED': 5
  };
  return map[s] ?? 9;
}

export function showLoading(on) {
  $('#loading').classList.toggle('show', !!on);
}

export function getStatusBadgeClass(status) {
  const map = {
    'CRITICAL EVENT': 'critical',
    'SLA BREACH': 'breach',
    'AT RISK': 'atrisk',
    'WARNING': 'warning',
    'ON TRACK': 'ontrack',
    'COMPLETED': 'completed',
    'NOT STARTED': 'warning'
  };
  return map[status] || 'warning';
}

// ============================================================
// FUNGSI MENGHITUNG PERIODE DARI DATA UPDATE
// ============================================================
export function calculatePeriodFromUpdates(alerts) {
    if (!alerts || alerts.length === 0) {
        return '14 – 16 Mei 2026';
    }
    
    // Ambil semua tanggal dari field 'update'
    const dates = alerts
        .map(a => a.update || a.start || '')
        .filter(d => d && d !== '-' && d !== '')
        .map(d => {
            // Format: "16 Mei 15:25" atau "16 Mei 09:12"
            const parts = d.match(/(\d+)\s+(\w+)\s+(\d{2}:\d{2})/);
            if (parts) {
                const day = parseInt(parts[1]);
                const month = parts[2];
                const time = parts[3];
                return { day, month, time, full: d };
            }
            return null;
        })
        .filter(d => d !== null);
    
    if (dates.length === 0) {
        return '14 – 16 Mei 2026';
    }
    
    // Urutkan berdasarkan tanggal
    const months = {'Jan':1,'Feb':2,'Mar':3,'Apr':4,'Mei':5,'Jun':6,'Jul':7,'Agu':8,'Sep':9,'Okt':10,'Nov':11,'Des':12};
    dates.sort((a, b) => {
        if (months[a.month] !== months[b.month]) return months[a.month] - months[b.month];
        return a.day - b.day;
    });
    
    const min = dates[0];
    const max = dates[dates.length - 1];
    
    // Format periode
    let periodText = '';
    if (min.month === max.month) {
        periodText = `${min.day} – ${max.day} ${min.month} 2026`;
    } else {
        periodText = `${min.day} ${min.month} – ${max.day} ${max.month} 2026`;
    }
    
    console.log('📅 Periode terhitung:', periodText);
    return periodText;
}
