// ===== UTILIDADES GLOBALES =====

// Sidebar toggle para móvil
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!sidebar) return;
  const isOpen = sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('active', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Modal helpers
function openModal(id) {
  document.getElementById(id).style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
  document.body.style.overflow = '';
}

// Cerrar modal al hacer click en overlay
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) closeModal(this.id);
  });
});

// Toast notification
function showToast(msg, type = 'success') {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();

  const colors = { success: '#2e7d32', error: '#c62828', info: '#1565c0', warning: '#e65100' };
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px;
    background: ${colors[type]}; color: #fff;
    padding: 12px 20px; border-radius: 8px;
    font-size: 14px; font-weight: 500;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    z-index: 9999; display: flex; align-items: center; gap: 10px;
    animation: slideIn 0.3s ease; max-width: 360px;
  `;
  toast.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;

  if (!document.getElementById('toast-style')) {
    const style = document.createElement('style');
    style.id = 'toast-style';
    style.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3500);
}

// Confirmar acción
function confirmar(msg, callback) {
  if (confirm(msg)) callback();
}

// Buscar/filtrar tabla
function filterTable(inputId, tableId) {
  const term = document.getElementById(inputId).value.toLowerCase();
  const rows = document.querySelectorAll(`#${tableId} tbody tr`);
  let count = 0;
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    const show = text.includes(term);
    row.style.display = show ? '' : 'none';
    if (show) count++;
  });
  const countEl = document.getElementById('result-count');
  if (countEl) countEl.textContent = count + ' resultado(s)';
}

// Formatear fecha para inputs
function toInputDate(dateStr) {
  if (!dateStr) return '';
  return dateStr.substring(0, 10);
}

// Calcular edad
function calcEdad(fechaNac) {
  const hoy = new Date();
  const nac = new Date(fechaNac);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

// Exportar tabla a CSV compatible con Excel
function exportCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table) return;

  // Detectar índices de columnas a omitir (Acciones)
  const headers = [...table.querySelectorAll('thead th')];
  const skipIdx = new Set();
  headers.forEach((th, i) => {
    const txt = th.innerText.trim().toLowerCase();
    if (txt === 'acciones' || th.getAttribute('data-role') === 'admin') skipIdx.add(i);
  });

  function cellText(cell) {
    // Clonar y quitar botones/svg para obtener solo texto limpio
    const clone = cell.cloneNode(true);
    clone.querySelectorAll('button, svg, .btn').forEach(el => el.remove());
    // Para badges, tomar solo el texto del badge
    const badge = clone.querySelector('.badge');
    let text = badge ? badge.innerText.trim() : clone.innerText.replace(/\s+/g, ' ').trim();
    // Escapar para CSV
    if (text.includes(';') || text.includes('"') || text.includes('\n')) {
      text = '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
  }

  const rows = [];

  // Encabezados
  const headRow = headers
    .filter((_, i) => !skipIdx.has(i))
    .map(th => th.innerText.trim());
  rows.push(headRow.join(';'));

  // Filas de datos (solo visibles)
  table.querySelectorAll('tbody tr').forEach(tr => {
    if (tr.style.display === 'none') return;
    const cells = [...tr.querySelectorAll('td')]
      .filter((_, i) => !skipIdx.has(i))
      .map(td => cellText(td));
    rows.push(cells.join(';'));
  });

  // BOM + separador punto y coma (estándar Excel en español)
  const csv = '﻿' + rows.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename + '_' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Archivo CSV descargado', 'success');
}

// Color de estado
function badgeEstado(estado) {
  const map = {
    'activo': 'badge-green',
    'inactivo': 'badge-gray',
    'retirado': 'badge-red',
    'licencia': 'badge-amber',
    'nombrado': 'badge-blue',
    'contratado': 'badge-teal',
    'pagado': 'badge-green',
    'pendiente': 'badge-amber',
    'vencido': 'badge-red',
    'realizado': 'badge-green',
    'programado': 'badge-blue',
    'en progreso': 'badge-teal',
    'cancelado': 'badge-red',
    'aprobado': 'badge-green',
    'desaprobado': 'badge-red',
    'mañana': 'badge-blue',
    'tarde': 'badge-amber',
  };
  return map[estado] || 'badge-gray';
}
