import { requireRole } from '../services/auth.js';
import { renderNavbar } from '../components/navbar.js';
import { getAll, update } from '../services/storage.js';
import { formatDateTimeLegible } from '../utils/dates.js';
import { escapeHtml } from '../utils/ui.js';

const session = requireRole(['paciente'], '../login.html');
if (session) {
  const listaEl = document.getElementById('lista-notificaciones');
  const sinNotifEl = document.getElementById('texto-sin-notificaciones');
  const btnMarcarTodas = document.getElementById('btn-marcar-todas-leidas');

  const ICONOS = {
    confirmacion: 'bi-check-circle text-success',
    cancelacion: 'bi-x-circle text-danger',
    recordatorio: 'bi-bell text-warning',
    reprogramacion: 'bi-arrow-repeat text-primary'
  };

  function render() {
    renderNavbar(session, '../', 'notificaciones');

    const notifs = getAll('notificaciones', (n) => n.usuarioId === session.userId)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    if (notifs.length === 0) {
      listaEl.innerHTML = '';
      sinNotifEl.classList.remove('d-none');
      return;
    }
    sinNotifEl.classList.add('d-none');

    listaEl.innerHTML = notifs.map((n) => `
      <div class="list-group-item notif-item ${n.leida ? '' : 'no-leida'}" id="notif-${n.id}" data-testid="notif-${n.id}">
        <div class="d-flex justify-content-between align-items-start">
          <div class="d-flex">
            <i class="bi ${ICONOS[n.tipo] || 'bi-info-circle'} me-2 mt-1"></i>
            <div>
              <p class="mb-1">${escapeHtml(n.mensaje)}</p>
              <p class="text-muted small mb-0">${formatDateTimeLegible(n.fecha)}</p>
            </div>
          </div>
          ${n.leida
            ? '<span class="badge bg-light text-dark">Leída</span>'
            : `<button class="btn btn-sm btn-outline-primary" id="btn-marcar-leida-${n.id}" data-testid="btn-marcar-leida-${n.id}">Marcar como leída</button>`
          }
        </div>
      </div>
    `).join('');

    listaEl.querySelectorAll('button[id^="btn-marcar-leida-"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.id.replace('btn-marcar-leida-', ''));
        update('notificaciones', id, { leida: true });
        render();
      });
    });
  }

  btnMarcarTodas.addEventListener('click', () => {
    const notifs = getAll('notificaciones', (n) => n.usuarioId === session.userId && !n.leida);
    notifs.forEach((n) => update('notificaciones', n.id, { leida: true }));
    render();
  });

  render();
}
