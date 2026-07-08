// Navbar compartido, adaptado según el rol de la sesión activa.

import { logout } from '../services/auth.js';
import { getAll } from '../services/storage.js';

const LINKS_BY_ROLE = {
  paciente: [
    { href: 'dashboard.html', label: 'Inicio', page: 'dashboard', testId: 'nav-link-dashboard' },
    { href: 'especialidades.html', label: 'Especialidades', page: 'especialidades', testId: 'nav-link-especialidades' },
    { href: 'reservar.html', label: 'Reservar cita', page: 'reservar', testId: 'nav-link-reservar' },
    { href: 'mis-citas.html', label: 'Mis citas', page: 'mis-citas', testId: 'nav-link-mis-citas' },
    { href: 'notificaciones.html', label: 'Notificaciones', page: 'notificaciones', testId: 'nav-link-notificaciones', badge: true }
  ],
  medico: [
    { href: 'dashboard.html', label: 'Inicio', page: 'dashboard', testId: 'nav-link-dashboard' },
    { href: 'agenda.html', label: 'Agenda del día', page: 'agenda', testId: 'nav-link-agenda' },
    { href: 'horarios.html', label: 'Mis horarios', page: 'horarios', testId: 'nav-link-horarios' }
  ],
  recepcionista: [
    { href: 'dashboard.html', label: 'Inicio', page: 'dashboard', testId: 'nav-link-dashboard' },
    { href: 'monitoreo.html', label: 'Monitoreo de citas', page: 'monitoreo', testId: 'nav-link-monitoreo' },
    { href: 'medicos.html', label: 'Médicos', page: 'medicos', testId: 'nav-link-medicos' },
    { href: 'reportes.html', label: 'Reportes', page: 'reportes', testId: 'nav-link-reportes' }
  ],
  admin: [
    { href: 'dashboard.html', label: 'Inicio', page: 'dashboard', testId: 'nav-link-dashboard' },
    { href: 'monitoreo.html', label: 'Monitoreo de citas', page: 'monitoreo', testId: 'nav-link-monitoreo' },
    { href: 'medicos.html', label: 'Médicos', page: 'medicos', testId: 'nav-link-medicos' },
    { href: 'reportes.html', label: 'Reportes', page: 'reportes', testId: 'nav-link-reportes' }
  ]
};

const SECTION_BASE = {
  paciente: 'paciente/',
  medico: 'medico/',
  recepcionista: 'admin/',
  admin: 'admin/'
};

const ROLE_LABEL = {
  paciente: 'Paciente',
  medico: 'Médico',
  recepcionista: 'Recepción',
  admin: 'Administrador'
};

/**
 * Renderiza el navbar dentro de #navbar-container.
 * @param {object} session - sesión activa (de auth.getSession())
 * @param {string} basePath - ruta relativa a la raíz del sitio desde la página actual ('' o '../')
 * @param {string} activePage - identificador de la página activa para resaltar el link
 */
export function renderNavbar(session, basePath, activePage) {
  const container = document.getElementById('navbar-container');
  if (!container || !session) return;

  const links = LINKS_BY_ROLE[session.rol] || [];
  const sectionBase = basePath + (SECTION_BASE[session.rol] || '');
  const navTestId = session.rol === 'paciente' ? 'nav-paciente'
    : session.rol === 'medico' ? 'nav-medico'
    : 'nav-admin';

  let unreadCount = 0;
  if (session.rol === 'paciente') {
    unreadCount = getAll('notificaciones', (n) => n.usuarioId === session.userId && !n.leida).length;
  }

  const linksHtml = links.map((l) => {
    const isActive = l.page === activePage;
    const badgeHtml = l.badge && unreadCount > 0
      ? ` <span class="badge rounded-pill bg-danger" id="badge-notificaciones" data-testid="badge-notificaciones-no-leidas">${unreadCount}</span>`
      : '';
    return `
      <li class="nav-item">
        <a class="nav-link ${isActive ? 'active fw-semibold' : ''}" href="${sectionBase}${l.href}" data-testid="${l.testId}">
          ${l.label}${badgeHtml}
        </a>
      </li>`;
  }).join('');

  container.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary mb-4" data-testid="${navTestId}">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold" href="${sectionBase}dashboard.html" data-testid="nav-brand">
          <i class="bi bi-hospital"></i> MediCitas
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
          aria-controls="navbarNav" aria-expanded="false" aria-label="Alternar navegación" data-testid="btn-nav-toggle">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            ${linksHtml}
          </ul>
          <span class="navbar-text text-white me-3" data-testid="text-usuario-actual">
            <i class="bi bi-person-circle"></i> ${session.nombre} <span class="badge bg-light text-dark ms-1">${ROLE_LABEL[session.rol] || session.rol}</span>
          </span>
          <button class="btn btn-outline-light" id="btn-logout" data-testid="btn-logout">
            <i class="bi bi-box-arrow-right"></i> Cerrar sesión
          </button>
        </div>
      </div>
    </nav>`;

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logout();
      window.location.href = `${basePath}login.html`;
    });
  }
}
