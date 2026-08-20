// ============================================================
// DATA MANAGEMENT
// ============================================================

import { CONFIG } from './config.js';
import { DEMO_DATA } from './dummy.js';
import { showLoading } from './utils.js';

let DATA = DEMO_DATA;
let isLoading = false;

/**
 * Fetch data from spreadsheet
 * @returns {Promise<Object>} Data
 */
export async function fetchData() {
    if (isLoading) return DATA;
    
    isLoading = true;
    showLoading(true);
    
    try {
        const url = CONFIG.WEBAPP_URL;
        console.log('📡 Mengambil data dari:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            console.error('❌ API Error:', data.error);
            console.log('📌 Menggunakan data dummy sebagai fallback');
            return DEMO_DATA;
        }
        
        console.log('✅ Data berhasil diambil:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error fetching spreadsheet data:', error);
        console.log('📌 Menggunakan data dummy sebagai fallback');
        return DEMO_DATA;
    } finally {
        isLoading = false;
        showLoading(false);
    }
}

/**
 * Get current data
 * @returns {Object} Current data
 */
export function getData() {
    return DATA;
}

/**
 * Set data
 * @param {Object} newData - New data
 */
export function setData(newData) {
    DATA = newData || DEMO_DATA;
}

/**
 * Reset data to dummy
 */
export function resetData() {
    DATA = DEMO_DATA;
}

export { DEMO_DATA };
