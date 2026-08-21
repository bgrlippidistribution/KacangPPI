import { WEBAPP_URL, AUTO_REFRESH_MS } from './config.js';
import { DEMO_DATA, dashboardState, fetchDataFromSpreadsheet, setDashboardData } from './data.js';
import { showLoading } from './utils.js';
import { renderAll } from './render.js';
import { initInteractions } from './interactions.js';

async function loadData() {
  showLoading(true);

  try {
    const data = await fetchDataFromSpreadsheet();
    setDashboardData(data || DEMO_DATA);
    renderAll();
  } catch (error) {
    console.error('Error loading data:', error);
    setDashboardData(DEMO_DATA);
    renderAll();
  } finally {
    showLoading(false);
  }
}

function init() {
  initInteractions(loadData);
  loadData();

  // Auto refresh setiap 5 menit.
  window.setInterval(loadData, AUTO_REFRESH_MS);

  console.log('🚀 SLA Dashboard Loaded!');
  console.log('📌 WEBAPP_URL:', WEBAPP_URL);
}

document.addEventListener('DOMContentLoaded', init);
