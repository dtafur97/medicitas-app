import { requireRole } from '../services/auth.js';
import { renderNavbar } from '../components/navbar.js';
import { getAll, getById } from '../services/storage.js';
import { formatDateShort } from '../utils/dates.js';
import { escapeHtml, estadoBadgeClass } from '../utils/ui.js';

const session = requireRole(['admin', 'recepcionista'], '../login.html');
if (session) {
  renderNavbar(session, '../', 'monitoreo');

  const medicos = getAll('medicos');
  const selectEstado = document.getElementById('select-filtro-monitoreo-estado');
  const selectMedico = document.getElementById('select-filtro-monitoreo-medico');
  const inputFecha = document.getElementById('input-filtro-monitoreo-fecha');
  const btnLimpiar = document.getElementById('btn-limpiar-filtros-monitoreo');
  const tbody = document.getElementById('tbody-monitoreo');
  const textoSinResultados = document.getElementById('texto-sin-resultados-monitoreo');
  const textoTotal = document.getElementById('texto-total-monitoreo');

  selectMedico.innerHTML += medicos.map((m) => `<option value="${m.id}">${escapeHtml(m.nombre)}</option>`).join('');

  function render() {
    let citas = getAll('citas');

    if (selectEstado.value !== 'todas') {
      citas = citas.filter((c) => c.estado === selectEstado.value);
    }
    if (selectMedico.value !== 'todos') {
      citas = citas.filter((c) => c.medicoId === Number(selectMedico.value));
    }
    if (inputFecha.value) {
      citas = citas.filter((c) => c.fecha === inputFecha.value);
    }

    citas = citas.sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora));

    if (citas.length === 0) {
      tbody.innerHTML = '';
      textoSinResultados.classList.remove('d-none');
      textoTotal.textContent = '';
      return;
    }
    textoSinResultados.classList.add('d-none');
    textoTotal.textContent = `Mostrando ${citas.length} cita(s).`;

    tbody.innerHTML = citas.map((c) => {
      const paciente = getById('usuarios', c.pacienteId);
      const medico = getById('medicos', c.medicoId);
      const especialidad = getById('especialidades', c.especialidadId);
      return `
        <tr id="row-cita-${c.codigo}" data-testid="row-cita-${c.codigo}">
          <td class="fw-semibold">${escapeHtml(c.codigo)}</td>
          <td>${escapeHtml(paciente?.nombre || '')}</td>
          <td>${escapeHtml(medico?.nombre || '')}</td>
          <td>${escapeHtml(especialidad?.nombre || '')}</td>
          <td>${formatDateShort(c.fecha)}</td>
          <td>${escapeHtml(c.hora)}</td>
          <td><span class="badge ${estadoBadgeClass(c.estado)}" data-testid="estado-monitoreo-${c.codigo}">${c.estado}</span></td>
        </tr>
      `;
    }).join('');
  }

  selectEstado.addEventListener('change', render);
  selectMedico.addEventListener('change', render);
  inputFecha.addEventListener('change', render);
  btnLimpiar.addEventListener('click', () => {
    selectEstado.value = 'todas';
    selectMedico.value = 'todos';
    inputFecha.value = '';
    render();
  });

  render();
}
