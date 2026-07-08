import { requireRole } from '../services/auth.js';
import { renderNavbar } from '../components/navbar.js';
import { getAll, getById, update, create } from '../services/storage.js';
import { todayISO } from '../utils/dates.js';
import { showAlert, clearAlerts, escapeHtml, estadoBadgeClass } from '../utils/ui.js';

const session = requireRole(['medico'], '../login.html');
if (session) {
  renderNavbar(session, '../', 'agenda');

  const medico = getAll('medicos', (m) => m.usuarioId === session.userId)[0];
  const inputFecha = document.getElementById('input-fecha-agenda');
  const tbody = document.getElementById('tbody-agenda');
  const textoSinCitas = document.getElementById('texto-sin-citas-agenda');

  inputFecha.value = todayISO();

  function notificarPaciente(pacienteId, mensaje, tipo) {
    create('notificaciones', { usuarioId: pacienteId, tipo, mensaje, leida: false, fecha: new Date().toISOString() });
  }

  function render() {
    if (!medico) return;
    const fecha = inputFecha.value;
    const citas = getAll('citas', (c) => c.medicoId === medico.id && c.fecha === fecha && c.estado !== 'cancelada')
      .sort((a, b) => a.hora.localeCompare(b.hora));

    if (citas.length === 0) {
      tbody.innerHTML = '';
      textoSinCitas.classList.remove('d-none');
      return;
    }
    textoSinCitas.classList.add('d-none');

    tbody.innerHTML = citas.map((c) => {
      const paciente = getById('usuarios', c.pacienteId);
      let acciones = `<a href="historial.html?citaId=${c.id}" class="btn btn-sm btn-outline-secondary me-1"
        id="btn-ver-historial-${c.codigo}" data-testid="btn-ver-historial-${c.codigo}">Historial</a>`;
      if (c.estado === 'pendiente') {
        acciones += `<button class="btn btn-sm btn-outline-success" data-action="confirmar" data-id="${c.id}"
          id="btn-confirmar-${c.codigo}" data-testid="btn-confirmar-${c.codigo}">Confirmar</button>`;
      } else if (c.estado === 'confirmada') {
        acciones += `<button class="btn btn-sm btn-outline-primary" data-action="atender" data-id="${c.id}"
          id="btn-atender-${c.codigo}" data-testid="btn-atender-${c.codigo}">Marcar atendida</button>`;
      }
      return `
        <tr id="row-agenda-${c.codigo}" data-testid="row-agenda-${c.codigo}">
          <td>${escapeHtml(c.hora)}</td>
          <td>${escapeHtml(paciente?.nombre || '')}</td>
          <td>${escapeHtml(paciente?.dni || '')}</td>
          <td>${escapeHtml(paciente?.telefono || '')}</td>
          <td>${escapeHtml(c.motivo || '')}</td>
          <td><span class="badge ${estadoBadgeClass(c.estado)}" data-testid="estado-agenda-${c.codigo}">${c.estado}</span></td>
          <td class="d-flex flex-wrap gap-1">${acciones}</td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('button[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const cita = getById('citas', id);
        clearAlerts('agenda-alert-container');
        if (btn.dataset.action === 'confirmar') {
          update('citas', id, { estado: 'confirmada' });
          notificarPaciente(cita.pacienteId, `Tu cita ${cita.codigo} ha sido confirmada por el médico.`, 'confirmacion');
          showAlert('agenda-alert-container', {
            type: 'success', message: `Cita ${cita.codigo} confirmada.`, testId: `alert-confirmar-exito-${cita.codigo}`
          });
        } else if (btn.dataset.action === 'atender') {
          update('citas', id, { estado: 'atendida' });
          showAlert('agenda-alert-container', {
            type: 'success', message: `Cita ${cita.codigo} marcada como atendida.`, testId: `alert-atender-exito-${cita.codigo}`
          });
        }
        render();
      });
    });
  }

  inputFecha.addEventListener('change', render);
  render();
}
