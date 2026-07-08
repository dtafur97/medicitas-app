import { requireRole } from '../services/auth.js';
import { renderNavbar } from '../components/navbar.js';
import { getAll } from '../services/storage.js';
import { escapeHtml } from '../utils/ui.js';

const session = requireRole(['paciente'], '../login.html');
if (session) {
  renderNavbar(session, '../', 'especialidades');

  const especialidades = getAll('especialidades');
  const medicos = getAll('medicos');
  const listaEl = document.getElementById('lista-especialidades');
  const sinResultadosEl = document.getElementById('texto-sin-resultados');
  const inputBuscar = document.getElementById('input-buscar-especialidad');

  function contarMedicos(especialidadId) {
    return medicos.filter((m) => m.especialidadId === especialidadId && m.activo).length;
  }

  function render(filtroTexto = '') {
    const filtro = filtroTexto.trim().toLowerCase();
    const filtradas = especialidades.filter((e) =>
      e.nombre.toLowerCase().includes(filtro) || e.descripcion.toLowerCase().includes(filtro)
    );

    if (filtradas.length === 0) {
      listaEl.innerHTML = '';
      sinResultadosEl.classList.remove('d-none');
      return;
    }
    sinResultadosEl.classList.add('d-none');

    listaEl.innerHTML = filtradas.map((e) => `
      <div class="col-md-4 col-sm-6">
        <div class="card card-especialidad shadow-sm" data-testid="card-especialidad-${e.id}">
          <div class="card-body text-center">
            <i class="bi ${e.icono} icono-especialidad"></i>
            <h2 class="h6 mt-2 mb-1" data-testid="nombre-especialidad-${e.id}">${escapeHtml(e.nombre)}</h2>
            <p class="text-muted small mb-2">${escapeHtml(e.descripcion)}</p>
            <p class="small text-secondary mb-3" data-testid="conteo-medicos-especialidad-${e.id}">${contarMedicos(e.id)} médico(s) disponible(s)</p>
            <a href="reservar.html?especialidadId=${e.id}" class="btn btn-sm btn-primary"
              id="btn-reservar-especialidad-${e.id}" data-testid="btn-reservar-especialidad-${e.id}">
              <i class="bi bi-calendar-plus"></i> Reservar cita
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  render();
  inputBuscar.addEventListener('input', (e) => render(e.target.value));
}
