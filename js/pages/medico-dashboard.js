import { requireRole } from '../services/auth.js';
import { renderNavbar } from '../components/navbar.js';
import { getAll, getById } from '../services/storage.js';
import { todayISO } from '../utils/dates.js';

const session = requireRole(['medico'], '../login.html');
if (session) {
  renderNavbar(session, '../', 'dashboard');

  const medico = getAll('medicos', (m) => m.usuarioId === session.userId)[0];
  document.getElementById('texto-nombre-medico').textContent = session.nombre;

  if (medico) {
    const especialidad = getById('especialidades', medico.especialidadId);
    document.getElementById('texto-especialidad-medico').textContent = especialidad?.nombre || '';

    const hoy = todayISO();
    const citasMedico = getAll('citas', (c) => c.medicoId === medico.id);
    const citasHoy = citasMedico.filter((c) => c.fecha === hoy && c.estado !== 'cancelada');
    const pendientes = citasMedico.filter((c) => c.estado === 'pendiente');
    const atendidos = new Set(citasMedico.filter((c) => c.estado === 'atendida').map((c) => c.pacienteId));

    document.getElementById('stat-citas-hoy').textContent = citasHoy.length;
    document.getElementById('stat-citas-pendientes').textContent = pendientes.length;
    document.getElementById('stat-pacientes-atendidos').textContent = atendidos.size;
  }
}
