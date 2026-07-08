import { requireRole } from '../services/auth.js';
import { renderNavbar } from '../components/navbar.js';
import { getAll } from '../services/storage.js';
import { todayISO } from '../utils/dates.js';

const session = requireRole(['admin', 'recepcionista'], '../login.html');
if (session) {
  renderNavbar(session, '../', 'dashboard');

  document.getElementById('texto-nombre-admin').textContent = session.nombre;

  const citas = getAll('citas');
  const medicos = getAll('medicos');
  const pacientes = getAll('usuarios', (u) => u.rol === 'paciente');
  const hoy = todayISO();

  document.getElementById('stat-total-citas').textContent = citas.length;
  document.getElementById('stat-citas-hoy').textContent = citas.filter((c) => c.fecha === hoy).length;
  document.getElementById('stat-medicos-activos').textContent = medicos.filter((m) => m.activo).length;
  document.getElementById('stat-pacientes-registrados').textContent = pacientes.length;
}
