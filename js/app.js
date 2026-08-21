import { WEBAPP_URL } from './config.js';
import { DEMO_DATA, dashboardState, fetchDataFromSpreadsheet, setDashboardData } from './data.js';
import { showLoading } from './utils.js';
import { renderAll } from './render.js';
import { initInteractions } from './interactions.js';

let refreshTimer = null;

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

function setAutoRefresh(minutes = 15) {
  if (refreshTimer) window.clearInterval(refreshTimer);
  refreshTimer = window.setInterval(loadData, Math.max(1, minutes) * 60_000);
}

function init() {
  initInteractions(loadData, setAutoRefresh);
  loadData();

  const initialMinutes = Number(document.getElementById('refreshInterval')?.value) || 15;
  setAutoRefresh(initialMinutes);

  console.log('🚀 SLA Dashboard Loaded!');
  console.log('📌 WEBAPP_URL:', WEBAPP_URL);
}

document.addEventListener('DOMContentLoaded', init);
