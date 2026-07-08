import { requireRole } from '../services/auth.js';
import { renderNavbar } from '../components/navbar.js';
import { getAll, getById, create } from '../services/storage.js';
import { formatDateLong } from '../utils/dates.js';
import { showAlert, escapeHtml } from '../utils/ui.js';

const session = requireRole(['medico'], '../login.html');
if (session) {
  renderNavbar(session, '../', null);

  const params = new URLSearchParams(window.location.search);
  const citaId = Number(params.get('citaId'));
  const cita = citaId ? getById('citas', citaId) : null;

  const sinCitaEl = document.getElementById('historial-sin-cita');
  const contenidoEl = document.getElementById('historial-contenido');

  if (!cita) {
    sinCitaEl.classList.remove('d-none');
  } else {
    contenidoEl.classList.remove('d-none');
    const paciente = getById('usuarios', cita.pacienteId);

    document.getElementById('texto-paciente-nombre').textContent = paciente?.nombre || '';
    document.getElementById('texto-paciente-dni').textContent = paciente?.dni || '';
    document.getElementById('texto-cita-codigo').textContent = cita.codigo;
    document.getElementById('texto-cita-fecha').textContent = `${formatDateLong(cita.fecha)} · ${cita.hora}`;

    const historialExistente = getAll('historiales', (h) => h.citaId === cita.id)[0];
    const detalleEl = document.getElementById('historial-detalle-existente');
    const formEl = document.getElementById('form-historial');

    function mostrarDetalle(historial) {
      detalleEl.classList.remove('d-none');
      formEl.classList.add('d-none');
      document.getElementById('texto-diagnostico').textContent = historial.diagnostico;
      document.getElementById('texto-alergias').textContent = historial.alergias;
      document.getElementById('texto-atenciones-previas').textContent = historial.atencionesPrevias;
    }

    if (historialExistente) {
      mostrarDetalle(historialExistente);
    } else {
      formEl.classList.remove('d-none');
      formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const diagnostico = document.getElementById('input-diagnostico').value.trim();
        const alergias = document.getElementById('input-alergias').value.trim() || 'Ninguna conocida';
        const atencionesPrevias = document.getElementById('input-atenciones-previas').value.trim() || 'Sin registros previos.';

        if (!diagnostico) {
          showAlert('historial-alert-container', {
            type: 'danger', message: 'El diagnóstico es obligatorio.', testId: 'alert-historial-error'
          });
          return;
        }

        const nuevo = create('historiales', {
          pacienteId: cita.pacienteId,
          medicoId: cita.medicoId,
          citaId: cita.id,
          fecha: cita.fecha,
          diagnostico,
          alergias,
          atencionesPrevias
        });

        showAlert('historial-alert-container', {
          type: 'success', message: 'Historial clínico guardado correctamente.', testId: 'alert-historial-guardado'
        });
        mostrarDetalle(nuevo);
      });
    }

    const previos = getAll('historiales', (h) => h.pacienteId === cita.pacienteId && h.citaId !== cita.id)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
    const listaPreviosEl = document.getElementById('lista-historial-previo');
    const sinPreviosEl = document.getElementById('texto-sin-historial-previo');

    if (previos.length === 0) {
      sinPreviosEl.classList.remove('d-none');
    } else {
      listaPreviosEl.innerHTML = previos.map((h, i) => `
        <div class="border-bottom py-2" id="historial-previo-${h.id}" data-testid="historial-previo-${h.id}">
          <p class="mb-1 small text-muted">${formatDateLong(h.fecha)}</p>
          <p class="mb-1"><strong>Diagnóstico:</strong> ${escapeHtml(h.diagnostico)}</p>
          <p class="mb-0"><strong>Alergias:</strong> ${escapeHtml(h.alergias)}</p>
        </div>
      `).join('');
    }
  }
}
