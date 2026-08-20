// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Format percentage
 * @param {number} n - Nilai
 * @param {number} total - Total
 * @returns {number} Persentase
 */
export function pct(n, total) {
    return total ? Math.round(n / total * 100) : 0;
}

/**
 * Get status class
 * @param {string} s - Status
 * @returns {string} Nama class
 */
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

/**
 * Format hours
 * @param {number} h - Jam
 * @returns {string} Format jam yang sudah diformat
 */
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

/**
 * Priority rank for sorting
 * @param {string} s - Priority
 * @returns {number} Rank
 */
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

/**
 * DOM selector helper
 * @param {string} s - CSS selector
 * @returns {Element|null} Element
 */
export const $ = (s) => document.querySelector(s);

/**
 * DOM selector all helper
 * @param {string} s - CSS selector
 * @returns {Element[]} Array of elements
 */
export const $$ = (s) => [...document.querySelectorAll(s)];

/**
 * Toggle loading overlay
 * @param {boolean} on - Show/hide
 */
export function showLoading(on) {
    const loading = $('#loading');
    if (loading) {
        loading.classList.toggle('show', !!on);
    }
}

/**
 * Get status badge class
 * @param {string} status - Status
 * @returns {string} CSS class
 */
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

/**
 * Map current stage from alert data
 * @param {Object} a - Alert object
 * @param {string[]} STAGE_NAMES - Array of stage names
 * @returns {number} Index of current stage
 */
export function mapCurrentStage(a, STAGE_NAMES) {
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

/**
 * Debounce function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay = 300) {
    let timer = null;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * Format date
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    return d.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
