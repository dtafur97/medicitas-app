import { requireRole } from '../services/auth.js';
import { renderNavbar } from '../components/navbar.js';
import { getAll, create, update, remove } from '../services/storage.js';
import { todayISO, generarFranjas } from '../utils/dates.js';
import { showAlert, clearAlerts, escapeHtml, horarioBadgeClass } from '../utils/ui.js';

const session = requireRole(['medico'], '../login.html');
if (session) {
  renderNavbar(session, '../', 'horarios');

  const medico = getAll('medicos', (m) => m.usuarioId === session.userId)[0];
  const hoy = todayISO();

  const inputNuevaFecha = document.getElementById('input-nueva-franja-fecha');
  const inputInicio = document.getElementById('input-nueva-franja-inicio');
  const inputFin = document.getElementById('input-nueva-franja-fin');
  const btnCrear = document.getElementById('btn-crear-franjas');
  const inputFiltroFecha = document.getElementById('input-filtro-fecha-horarios');
  const tbody = document.getElementById('tbody-horarios');
  const textoSinHorarios = document.getElementById('texto-sin-horarios');

  inputNuevaFecha.min = hoy;
  inputNuevaFecha.value = hoy;
  inputFiltroFecha.min = hoy;
  inputFiltroFecha.value = hoy;

  function render() {
    if (!medico) return;
    const fecha = inputFiltroFecha.value;
    const horarios = getAll('horarios', (h) => h.medicoId === medico.id && h.fecha === fecha)
      .sort((a, b) => a.hora.localeCompare(b.hora));

    if (horarios.length === 0) {
      tbody.innerHTML = '';
      textoSinHorarios.classList.remove('d-none');
      return;
    }
    textoSinHorarios.classList.add('d-none');

    tbody.innerHTML = horarios.map((h) => {
      let acciones = '';
      if (h.estado === 'disponible') {
        acciones += `<button class="btn btn-sm btn-outline-warning me-1" data-action="bloquear" data-id="${h.id}"
          id="btn-bloquear-${h.id}" data-testid="btn-bloquear-${h.fecha}-${h.hora}">Bloquear</button>`;
        acciones += `<button class="btn btn-sm btn-outline-danger" data-action="eliminar" data-id="${h.id}"
          id="btn-eliminar-${h.id}" data-testid="btn-eliminar-${h.fecha}-${h.hora}">Eliminar</button>`;
      } else if (h.estado === 'bloqueado') {
        acciones += `<button class="btn btn-sm btn-outline-success me-1" data-action="desbloquear" data-id="${h.id}"
          id="btn-desbloquear-${h.id}" data-testid="btn-desbloquear-${h.fecha}-${h.hora}">Desbloquear</button>`;
        acciones += `<button class="btn btn-sm btn-outline-danger" data-action="eliminar" data-id="${h.id}"
          id="btn-eliminar-${h.id}" data-testid="btn-eliminar-${h.fecha}-${h.hora}">Eliminar</button>`;
      } else {
        acciones = '<span class="text-muted small">Ocupada por una cita</span>';
      }
      return `
        <tr id="row-horario-${h.id}" data-testid="row-horario-${h.fecha}-${h.hora}">
          <td>${escapeHtml(h.hora)}</td>
          <td><span class="badge ${horarioBadgeClass(h.estado)}" data-testid="estado-horario-${h.fecha}-${h.hora}">${h.estado}</span></td>
          <td class="d-flex flex-wrap gap-1">${acciones}</td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('button[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const accion = btn.dataset.action;
        clearAlerts('horarios-alert-container');
        if (accion === 'bloquear') {
          update('horarios', id, { estado: 'bloqueado' });
          showAlert('horarios-alert-container', { type: 'success', message: 'Franja bloqueada correctamente.', testId: 'alert-bloquear-exito' });
        } else if (accion === 'desbloquear') {
          update('horarios', id, { estado: 'disponible' });
          showAlert('horarios-alert-container', { type: 'success', message: 'Franja desbloqueada correctamente.', testId: 'alert-desbloquear-exito' });
        } else if (accion === 'eliminar') {
          remove('horarios', id);
          showAlert('horarios-alert-container', { type: 'success', message: 'Franja eliminada correctamente.', testId: 'alert-eliminar-exito' });
        }
        render();
      });
    });
  }

  btnCrear.addEventListener('click', () => {
    clearAlerts('horarios-alert-container');
    if (!medico) return;
    const fecha = inputNuevaFecha.value;
    const inicio = inputInicio.value;
    const fin = inputFin.value;

    if (!fecha || !inicio || !fin) {
      showAlert('horarios-alert-container', { type: 'danger', message: 'Completa fecha, hora de inicio y hora de fin.', testId: 'alert-crear-franjas-error' });
      return;
    }
    if (inicio >= fin) {
      showAlert('horarios-alert-container', { type: 'danger', message: 'La hora de inicio debe ser anterior a la hora de fin.', testId: 'alert-crear-franjas-error' });
      return;
    }

    const franjas = generarFranjas(inicio, fin, 30);
    const existentes = new Set(getAll('horarios', (h) => h.medicoId === medico.id && h.fecha === fecha).map((h) => h.hora));
    let creadas = 0;
    franjas.forEach((hora) => {
      if (!existentes.has(hora)) {
        create('horarios', { medicoId: medico.id, fecha, hora, estado: 'disponible' });
        creadas++;
      }
    });

    showAlert('horarios-alert-container', {
      type: creadas > 0 ? 'success' : 'warning',
      message: creadas > 0
        ? `Se crearon ${creadas} franja(s) nueva(s) para el ${fecha}.`
        : 'Todas las franjas del rango seleccionado ya existían.',
      testId: 'alert-crear-franjas-resultado'
    });

    inputFiltroFecha.value = fecha;
    render();
  });

  inputFiltroFecha.addEventListener('change', render);
  render();
}
