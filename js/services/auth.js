// Servicio de autenticación y sesión para MediCitas

import { getAll } from './storage.js';

const SESSION_KEY = 'medicitas_session';

export function login(email, password) {
  const emailNorm = (email || '').trim().toLowerCase();
  const usuarios = getAll('usuarios');
  const usuario = usuarios.find((u) => u.email.toLowerCase() === emailNorm && u.password === password);
  if (!usuario) {
    return { success: false, message: 'Correo o contraseña incorrectos.' };
  }
  const session = {
    userId: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { success: true, session };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Protege una página: si no hay sesión o el rol no está permitido, redirige a login.
 * @param {string[]} rolesPermitidos
 * @param {string} loginPath - ruta relativa a login.html desde la página actual
 * @returns {object|null} la sesión activa, o null si redirigió
 */
export function requireRole(rolesPermitidos, loginPath = 'login.html') {
  const session = getSession();
  if (!session || !rolesPermitidos.includes(session.rol)) {
    window.location.href = loginPath;
    return null;
  }
  return session;
}

export function homePathForRole(rol, basePath = '') {
  switch (rol) {
    case 'paciente': return `${basePath}paciente/dashboard.html`;
    case 'medico': return `${basePath}medico/dashboard.html`;
    case 'recepcionista':
    case 'admin': return `${basePath}admin/dashboard.html`;
    default: return `${basePath}login.html`;
  }
}
