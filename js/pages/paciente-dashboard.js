import { requireRole } from '../services/auth.js';
import { renderNavbar } from '../components/navbar.js';
import { getAll, getById } from '../services/storage.js';
import { formatDateLong, diffHoursFromNow } from '../utils/dates.js';
import { escapeHtml } from '../utils/ui.js';

const session = requireRole(['paciente'], '../login.html');
if (session) {
  renderNavbar(session, '../', 'dashboard');

  document.getElementById('texto-nombre-paciente').textContent = session.nombre;

  const misCitas = getAll('citas', (c) => c.pacienteId === session.userId);
  const pendientes = misCitas.filter((c) => c.estado === 'pendiente');
  const confirmadas = misCitas.filter((c) => c.estado === 'confirmada');
  const noLeidas = getAll('notificaciones', (n) => n.usuarioId === session.userId && !n.leida);

  document.getElementById('stat-citas-pendientes').textContent = pendientes.length;
  document.getElementById('stat-citas-confirmadas').textContent = confirmadas.length;
  document.getElementById('stat-notificaciones-no-leidas').textContent = noLeidas.length;

  const futuras = misCitas
    .filter((c) => (c.estado === 'pendiente' || c.estado === 'confirmada') && diffHoursFromNow(c.fecha, c.hora) > 0)
    .sort((a, b) => diffHoursFromNow(a.fecha, a.hora) - diffHoursFromNow(b.fecha, b.hora));

  const container = document.getElementById('proxima-cita-container');
  if (futuras.length > 0) {
    const cita = futuras[0];
    const medico = getById('medicos', cita.medicoId);
    const especialidad = getById('especialidades', cita.especialidadId);
    container.innerHTML = `
      <p class="mb-1"><strong data-testid="proxima-cita-codigo">${escapeHtml(cita.codigo)}</strong></p>
      <p class="mb-1" data-testid="proxima-cita-especialidad">${escapeHtml(especialidad?.nombre || '')} con ${escapeHtml(medico?.nombre || '')}</p>
      <p class="mb-0 text-muted" data-testid="proxima-cita-fecha">${formatDateLong(cita.fecha)} · ${escapeHtml(cita.hora)}</p>
    `;
  }
}
