// ===== AUTENTICACIÓN =====

function login(username, password) {
  const db = getDB();
  const user = db.users.find(u => u.username === username && u.password === password);
  if (user) {
    const session = { userId: user.id, role: user.role, name: user.name, email: user.email, alumnoId: user.alumnoId, docenteId: user.docenteId };
    sessionStorage.setItem('session', JSON.stringify(session));
    return { ok: true, user: session };
  }
  return { ok: false };
}

function logout() {
  sessionStorage.removeItem('session');
  window.location.href = 'index.html';
}

function getSession() {
  const s = sessionStorage.getItem('session');
  return s ? JSON.parse(s) : null;
}

function requireAuth(allowedRoles) {
  const session = getSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    window.location.href = 'dashboard.html';
    return null;
  }
  return session;
}

function isAdmin() {
  const s = getSession();
  return s && s.role === 'admin';
}

function isDocente() {
  const s = getSession();
  return s && s.role === 'docente';
}

function isAlumno() {
  const s = getSession();
  return s && s.role === 'alumno';
}

// Renderizar barra de usuario en el sidebar
function renderUserBar() {
  const session = getSession();
  if (!session) return;
  const el = document.getElementById('sidebar-user-name');
  const el2 = document.getElementById('sidebar-user-role');
  const el3 = document.getElementById('sidebar-user-avatar');
  const roleMap = { admin: 'Administrador', docente: 'Docente', alumno: 'Alumno' };
  if (el) el.textContent = session.name;
  if (el2) el2.textContent = roleMap[session.role] || session.role;
  if (el3) el3.textContent = session.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// Marcar enlace activo del sidebar
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(el => {
    const href = el.getAttribute('href') || '';
    if (href === page || href.startsWith(page.split('.')[0])) {
      el.classList.add('active');
    }
  });
}

// Mostrar/ocultar elementos según rol
function applyRoleVisibility() {
  const session = getSession();
  if (!session) return;
  document.querySelectorAll('[data-role]').forEach(el => {
    const roles = el.getAttribute('data-role').split(',');
    if (!roles.includes(session.role)) el.style.display = 'none';
  });
}
