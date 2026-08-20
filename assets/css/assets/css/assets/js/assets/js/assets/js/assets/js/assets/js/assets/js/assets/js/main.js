// ============================================================
// MAIN ENTRY POINT
// ============================================================

import { CONFIG } from './config.js';
import { fetchData, getData, setData } from './data.js';
import { renderAll } from './render.js';
import { initEvents } from './events.js';

/**
 * Load data and render dashboard
 */
export async function loadData() {
    try {
        const data = await fetchData();
        setData(data);
        renderAll();
    } catch (error) {
        console.error('❌ Error loading data:', error);
    }
}

/**
 * Initialize application
 */
async function init() {
    console.log('🚀 SLA Dashboard v1.0');
    console.log('📌 Konfigurasi:', CONFIG);
    
    // Init event listeners
    initEvents();
    
    // Load data
    await loadData();
    
    // Auto refresh
    setInterval(async () => {
        console.log('🔄 Auto refresh...');
        await loadData();
    }, CONFIG.REFRESH_INTERVAL);
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

export { loadData };
