// ===== DATOS DE LA APLICACIÓN ESCOLAR =====

const DB = {
  users: [
    { id: 1, username: 'admin',      password: 'admin123',    role: 'admin',   name: 'Administrador General',  email: 'admin@escuela.edu' },
    { id: 2, username: 'director',   password: 'director123', role: 'admin',   name: 'Carlos Mendoza Ríos',    email: 'director@escuela.edu' },
    { id: 3, username: 'prof.garcia',password: 'prof123',     role: 'docente', name: 'Ana García López',       email: 'a.garcia@escuela.edu', docenteId: 1 },
    { id: 4, username: 'prof.torres',password: 'prof123',     role: 'docente', name: 'Roberto Torres Vega',    email: 'r.torres@escuela.edu', docenteId: 2 },
    { id: 5, username: 'prof.silva', password: 'prof123',     role: 'docente', name: 'María Silva Paredes',    email: 'm.silva@escuela.edu',  docenteId: 3 },
    { id: 6, username: 'alumno.001', password: 'alumno123',   role: 'alumno',  name: 'Luis Rodríguez Castro',  email: 'l.rodriguez@escuela.edu', alumnoId: 1 },
  ],
  docentes:      [],
  alumnos:       [],
  calificaciones:[],
  asistencias:   [],
  horarios:      [],
  finanzas:      [],
  matriculas:    [],
  actividades:   [],
  tareas:        [],
  entregas:      [],
  nomina:        [],
};

// ---- Módulo de BD en memoria ----
let _db = null;

function _defaultDB() {
  return JSON.parse(JSON.stringify(DB));
}

// Firebase convierte arrays vacíos a null y arrays no-vacíos a objetos {0:{…},1:{…}}
// Esta función restaura todos los campos de array a arrays reales de JS
function _normalizeDB(db) {
  const arrays = ['users','docentes','alumnos','calificaciones','asistencias',
                  'horarios','finanzas','matriculas','actividades','tareas','entregas','nomina'];
  arrays.forEach(k => {
    if (!db[k]) {
      db[k] = [];                               // null / undefined → []
    } else if (!Array.isArray(db[k])) {
      db[k] = Object.values(db[k]);             // objeto Firebase → array real
    }
  });
  return db;
}

// ==========================================
// initDB  — síncrono para las páginas
// ==========================================
function initDB() {
  const raw = localStorage.getItem('escuela_db');
  if (raw) {
    try { _db = _normalizeDB(JSON.parse(raw)); } catch (e) { _db = _defaultDB(); }
    // Sincronizar Firebase en background (no bloquea)
    _fbSyncBackground();
  } else {
    _db = _defaultDB();
    if (window._fbDB) {
      // Primera vez en este dispositivo: esperar Firebase
      _fbSyncBlocking();
    }
    // Sin Firebase → usar defaults (se guardará en localStorage al primer saveDB)
  }
}

function getDB() {
  if (_db) _normalizeDB(_db);   // garantiza arrays reales en cada llamada
  return _db;
}

function saveDB(db) {
  // JSON round-trip elimina undefined (Firebase los rechaza) y sincroniza _db con lo que se guarda
  const clean = JSON.parse(JSON.stringify(db, (k, v) => v === undefined ? null : v));
  _db = clean;
  localStorage.setItem('escuela_db', JSON.stringify(clean));
  if (window._fbDB) {
    window._fbDB.ref('data').set(clean)
      .catch(e => console.warn('[Firebase] Error al guardar:', e.message));
  }
}

// ==========================================
// Sync en background (dispositivo con datos locales)
// ==========================================
async function _fbSyncBackground() {
  if (!window._fbDB) return;
  try {
    const snap  = await window._fbDB.ref('data').once('value');
    const fbData = snap.val();
    if (!fbData) {
      // Firebase vacío → subir datos locales
      await window._fbDB.ref('data').set(_db);
      return;
    }
    if (JSON.stringify(fbData) !== JSON.stringify(_db)) {
      _db = _normalizeDB(fbData);
      localStorage.setItem('escuela_db', JSON.stringify(_db));
    }
  } catch (e) { /* sin conexión — ignorar */ }
}

// ==========================================
// Sync bloqueante (dispositivo sin datos locales)
// ==========================================
function _fbSyncBlocking() {
  // Mostrar pantalla de carga
  const css = '@keyframes _fbSpin{to{transform:rotate(360deg)}}';
  const overlay = document.createElement('div');
  overlay.id = '_fb-loader';
  overlay.innerHTML =
    `<style>${css}</style>` +
    `<div style="position:fixed;inset:0;background:rgba(10,16,28,.97);z-index:99999;` +
    `display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:sans-serif">` +
    `<div style="width:42px;height:42px;border:3px solid rgba(245,158,11,.25);border-top-color:#F59E0B;` +
    `border-radius:50%;animation:_fbSpin .8s linear infinite;margin-bottom:18px"></div>` +
    `<div style="font-size:16px;font-weight:600;margin-bottom:6px">Cargando datos...</div>` +
    `<div style="font-size:13px;opacity:.45">Sincronizando con el servidor</div></div>`;

  const attach = () => document.body.appendChild(overlay);
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', attach)
    : attach();

  window._fbDB.ref('data').once('value')
    .then(snap => {
      const fbData = snap.val();
      if (fbData) {
        _db = _normalizeDB(fbData);
        localStorage.setItem('escuela_db', JSON.stringify(_db));
      } else {
        // Firebase vacío → subir defaults
        window._fbDB.ref('data').set(_db);
        localStorage.setItem('escuela_db', JSON.stringify(_db));
      }
      location.reload();
    })
    .catch(() => {
      // Sin conexión → quitar loader, usar defaults
      document.getElementById('_fb-loader')?.remove();
    });
}

// ==========================================
// Banner de actualización
// ==========================================
function _showSyncBanner() {
  if (document.getElementById('_sync-banner')) return;
  const style = document.createElement('style');
  style.textContent = '@keyframes _slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}';
  document.head.appendChild(style);
  const b = document.createElement('div');
  b.id = '_sync-banner';
  b.style.cssText =
    'position:fixed;bottom:20px;right:20px;z-index:9999;background:#1e293b;color:#fff;' +
    'padding:12px 16px;border-radius:12px;font-size:13px;display:flex;align-items:center;' +
    'gap:10px;box-shadow:0 4px 24px rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.1);' +
    'animation:_slideUp .3s ease;max-width:320px';
  b.innerHTML =
    '<span>🔄 Hay nuevos datos disponibles</span>' +
    '<button onclick="location.reload()" style="background:#F59E0B;color:#0d1420;border:none;' +
    'border-radius:6px;padding:4px 12px;cursor:pointer;font-size:12px;font-weight:700;white-space:nowrap">Actualizar</button>' +
    '<button onclick="this.parentElement.remove()" style="background:none;border:none;' +
    'color:rgba(255,255,255,.4);cursor:pointer;font-size:18px;padding:0 2px;line-height:1">×</button>';
  document.body.appendChild(b);
}

// ==========================================
// Utilidades (sin cambios)
// ==========================================
// Genera la cuota del mes en curso para cada alumno activo que no la tenga.
// Llamar al cargar Finanzas y Dashboard.
function autoGenerarCuotaMes() {
  const db = getDB();
  const hoy  = new Date();
  const anio = hoy.getFullYear();
  const mes  = hoy.getMonth();           // 0-based
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const concepto   = 'Mensualidad ' + meses[mes] + ' ' + anio;
  const fechaVenc  = anio + '-' + String(mes + 1).padStart(2, '0') + '-05';
  const estadoInic = hoy.getDate() > 5 ? 'vencido' : 'pendiente';

  let cambio = false;
  db.alumnos.filter(a => a.estado === 'activo').forEach(a => {
    const existe = db.finanzas.some(f => f.alumnoId === a.id && f.concepto === concepto);
    if (!existe) {
      db.finanzas.push({
        id: genId(db.finanzas),
        alumnoId:  a.id,
        concepto,
        monto:     50,
        abono:     0,
        saldo:     50,
        fechaVenc,
        fechaPago: null,
        metodoPago: null,
        estado:    estadoInic,
        tipo:      'mensualidad',
        recibo:    'REC-' + String(genId(db.finanzas)).padStart(4, '0'),
        registradoEn:  hoy.toISOString(),
        registradoPor: 'Sistema',
        autogenerado:  true,
      });
      cambio = true;
    }
  });
  if (cambio) saveDB(db);
}

function getAlumnoNombre(id) {
  const db = getDB();
  const a = db.alumnos.find(x => x.id === id);
  return a ? a.nombre : 'Desconocido';
}

function getDocenteNombre(id) {
  const db = getDB();
  const d = db.docentes.find(x => x.id === id);
  return d ? d.nombre : 'Desconocido';
}

function getLetraNota(nota) {
  if (nota >= 17) return 'AD';
  if (nota >= 13) return 'A';
  if (nota >= 11) return 'B';
  if (nota >= 0)  return 'C';
}

function formatFecha(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatMonto(n) {
  return '$ ' + Number(n).toFixed(2);
}

function genId(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return 1;
  return Math.max(...arr.map(x => x.id)) + 1;
}

function poblarSelectAlumnos(...selectIds) {
  const db = getDB();
  selectIds.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const val = sel.value;
    sel.innerHTML = '<option value="">— Seleccionar alumno —</option>';
    db.alumnos.forEach(a => {
      sel.innerHTML += `<option value="${a.id}">${a.nombre} (${a.grado}°-${a.seccion})</option>`;
    });
    if (val) sel.value = val;
  });
}

function poblarSelectDocentes(...selectIds) {
  const db = getDB();
  selectIds.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const val = sel.value;
    sel.innerHTML = '<option value="">— Seleccionar docente —</option>';
    db.docentes.forEach(d => {
      sel.innerHTML += `<option value="${d.id}">${d.nombre} — ${d.especialidad}</option>`;
    });
    if (val) sel.value = val;
  });
}
