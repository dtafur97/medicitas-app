import { requireRole } from '../services/auth.js';
import { renderNavbar } from '../components/navbar.js';
import { getAll, getById, update } from '../services/storage.js';
import { showAlert, clearAlerts, escapeHtml } from '../utils/ui.js';

const session = requireRole(['admin', 'recepcionista'], '../login.html');
if (session) {
  renderNavbar(session, '../', 'medicos');

  const tbody = document.getElementById('tbody-medicos');
  const inputBuscar = document.getElementById('input-buscar-medico');

  function render(filtroTexto = '') {
    const filtro = filtroTexto.trim().toLowerCase();
    const medicos = getAll('medicos').filter((m) => {
      const especialidad = getById('especialidades', m.especialidadId);
      return m.nombre.toLowerCase().includes(filtro) || (especialidad?.nombre || '').toLowerCase().includes(filtro);
    });

    tbody.innerHTML = medicos.map((m) => {
      const especialidad = getById('especialidades', m.especialidadId);
      return `
        <tr id="row-medico-${m.id}" data-testid="row-medico-${m.id}">
          <td>${escapeHtml(m.nombre)}</td>
          <td>${escapeHtml(especialidad?.nombre || '')}</td>
          <td>${escapeHtml(m.colegiatura)}</td>
          <td>${escapeHtml(m.email)}</td>
          <td>
            <span class="badge ${m.activo ? 'bg-success' : 'bg-secondary'}" data-testid="estado-medico-${m.id}">
              ${m.activo ? 'Activo' : 'Inactivo'}
            </span>
          </td>
          <td>
            <button class="btn btn-sm ${m.activo ? 'btn-outline-danger' : 'btn-outline-success'}"
              data-id="${m.id}" id="btn-toggle-medico-${m.id}" data-testid="btn-toggle-medico-${m.id}">
              ${m.activo ? 'Desactivar' : 'Activar'}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('button[data-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const medico = getById('medicos', id);
        update('medicos', id, { activo: !medico.activo });
        clearAlerts('medicos-alert-container');
        showAlert('medicos-alert-container', {
          type: 'success',
          message: `${medico.nombre} fue ${medico.activo ? 'desactivado' : 'activado'} correctamente.`,
          testId: `alert-toggle-medico-${id}`
        });
        render(inputBuscar.value);
      });
    });
  }

  inputBuscar.addEventListener('input', (e) => render(e.target.value));
  render();
}
