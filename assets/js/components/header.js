// ============================================================
// HEADER COMPONENT
// ============================================================

import { $ } from '../utils.js';

/**
 * Update header time
 * @param {string} time - Time string
 */
export function updateHeaderTime(time) {
    const updateTime = $('#updateTime');
    if (updateTime) {
        updateTime.textContent = time || '-';
    }
}

/**
 * Update period
 * @param {string} period - Period string
 */
export function setPeriod(period) {
    const periodInput = $('#period');
    if (periodInput) {
        periodInput.value = period || '14 – 16 Mei 2026';
    }
}

/**
 * Get current period
 * @returns {string} Period
 */
export function getPeriod() {
    return $('#period')?.value || '';
}
