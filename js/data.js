// ===== DATOS DE LA APLICACIÓN ESCOLAR =====

const DB = {

  // Usuarios del sistema
  users: [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Administrador General', email: 'admin@escuela.edu' },
    { id: 2, username: 'director', password: 'director123', role: 'admin', name: 'Carlos Mendoza Ríos', email: 'director@escuela.edu' },
    { id: 3, username: 'prof.garcia', password: 'prof123', role: 'docente', name: 'Ana García López', email: 'a.garcia@escuela.edu', docenteId: 1 },
    { id: 4, username: 'prof.torres', password: 'prof123', role: 'docente', name: 'Roberto Torres Vega', email: 'r.torres@escuela.edu', docenteId: 2 },
    { id: 5, username: 'prof.silva', password: 'prof123', role: 'docente', name: 'María Silva Paredes', email: 'm.silva@escuela.edu', docenteId: 3 },
    { id: 6, username: 'alumno.001', password: 'alumno123', role: 'alumno', name: 'Luis Rodríguez Castro', email: 'l.rodriguez@escuela.edu', alumnoId: 1 },
  ],

  docentes:      [],
  alumnos:       [],
  calificaciones:[],
  asistencias:   [],
  horarios:      [],
  finanzas:      [],
  matriculas:    [],
  actividades:   [],
  tareas:        [],  // { id, titulo, descripcion, materia, grado, seccion, docenteId, fechaCreacion, fechaEntrega, archivos:[{nombre,tipo,datos}], estado }
  entregas:      [],  // { id, tareaId, alumnoId, fecha, archivos:[{nombre,tipo,datos}], calificacion, comentario, calificadoEn }
};

// Guardar datos en localStorage si no existen
function initDB() {
  if (!localStorage.getItem('escuela_db')) {
    localStorage.setItem('escuela_db', JSON.stringify(DB));
  }
}

function getDB() {
  return JSON.parse(localStorage.getItem('escuela_db')) || DB;
}

function saveDB(db) {
  localStorage.setItem('escuela_db', JSON.stringify(db));
}

// Obtener nombre de alumno por ID
function getAlumnoNombre(id) {
  const db = getDB();
  const a = db.alumnos.find(x => x.id === id);
  return a ? a.nombre : 'Desconocido';
}

// Obtener nombre de docente por ID
function getDocenteNombre(id) {
  const db = getDB();
  const d = db.docentes.find(x => x.id === id);
  return d ? d.nombre : 'Desconocido';
}

// Calcular letra de nota
function getLetraNota(nota) {
  if (nota >= 17) return 'AD';
  if (nota >= 13) return 'A';
  if (nota >= 11) return 'B';
  if (nota >= 0) return 'C';
}

// Formatear fecha
function formatFecha(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Formatear moneda
function formatMonto(n) {
  return '$ ' + Number(n).toFixed(2);
}

// Generar ID único
function genId(arr) {
  return arr.length > 0 ? Math.max(...arr.map(x => x.id)) + 1 : 1;
}

// Poblar select con alumnos actuales desde DB
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

// Poblar select con docentes actuales desde DB
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
