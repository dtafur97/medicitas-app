import { requireRole } from '../services/auth.js';
import { renderNavbar } from '../components/navbar.js';
import { getAll, getById, update, create } from '../services/storage.js';
import { formatDateShort, formatDateLong, isMoreThan24h, todayISO, addDaysISO } from '../utils/dates.js';
import { showAlert, clearAlerts, escapeHtml, estadoBadgeClass } from '../utils/ui.js';

const session = requireRole(['paciente'], '../login.html');
if (session) {
  renderNavbar(session, '../', 'mis-citas');

  const tbody = document.getElementById('tbody-mis-citas');
  const textoSinCitas = document.getElementById('texto-sin-citas');
  const selectFiltro = document.getElementById('select-filtro-estado');
  const panelReprogramar = document.getElementById('panel-reprogramar');
  const textoReprogramarCodigo = document.getElementById('texto-reprogramar-codigo');
  const inputReprogramarFecha = document.getElementById('input-reprogramar-fecha');
  const gridReprogramarHorarios = document.getElementById('grid-reprogramar-horarios');
  const btnConfirmarReprogramar = document.getElementById('btn-confirmar-reprogramar');
  const btnCancelarReprogramar = document.getElementById('btn-cancelar-reprogramar');

  let citaEnReprogramacion = null;
  let nuevoHorarioSeleccionado = null;

  function cargarCitas() {
    return getAll('citas', (c) => c.pacienteId === session.userId)
      .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  }

  function renderTabla() {
    const filtro = selectFiltro.value;
    let citas = cargarCitas();
    if (filtro !== 'todas') {
      citas = citas.filter((c) => c.estado === filtro);
    }

    if (citas.length === 0) {
      tbody.innerHTML = '';
      textoSinCitas.classList.remove('d-none');
      return;
    }
    textoSinCitas.classList.add('d-none');

    tbody.innerHTML = citas.map((c) => {
      const medico = getById('medicos', c.medicoId);
      const especialidad = getById('especialidades', c.especialidadId);
      const puedeGestionar = (c.estado === 'pendiente' || c.estado === 'confirmada');
      const dentro24h = !isMoreThan24h(c.fecha, c.hora);

      let acciones;
      if (!puedeGestionar) {
        acciones = '<span class="text-muted small">Sin acciones disponibles</span>';
      } else {
        acciones = `
          <button class="btn btn-sm btn-outline-danger me-1" data-action="cancelar" data-codigo="${c.codigo}"
            id="btn-cancelar-${c.codigo}" data-testid="btn-cancelar-${c.codigo}">Cancelar</button>
          <button class="btn btn-sm btn-outline-primary" data-action="reprogramar" data-codigo="${c.codigo}"
            id="btn-reprogramar-${c.codigo}" data-testid="btn-reprogramar-${c.codigo}">Reprogramar</button>
        `;
      }

      return `
        <tr id="row-cita-${c.codigo}" data-testid="row-cita-${c.codigo}">
          <td class="fw-semibold">${escapeHtml(c.codigo)}</td>
          <td>${escapeHtml(especialidad?.nombre || '')}</td>
          <td>${escapeHtml(medico?.nombre || '')}</td>
          <td>${formatDateShort(c.fecha)}</td>
          <td>${escapeHtml(c.hora)}</td>
          <td><span class="badge ${estadoBadgeClass(c.estado)}" data-testid="estado-cita-${c.codigo}">${c.estado}</span>
            ${puedeGestionar && dentro24h ? '<span class="badge bg-light text-dark ms-1">&lt; 24h</span>' : ''}
          </td>
          <td>${acciones}</td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('button[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const codigo = btn.dataset.codigo;
        const accion = btn.dataset.action;
        const cita = cargarCitas().find((c) => c.codigo === codigo);
        if (accion === 'cancelar') manejarCancelar(cita);
        if (accion === 'reprogramar') abrirPanelReprogramar(cita);
      });
    });
  }

  function manejarCancelar(cita) {
    clearAlerts('mis-citas-alert-container');
    if (!isMoreThan24h(cita.fecha, cita.hora)) {
      showAlert('mis-citas-alert-container', {
        type: 'danger',
        message: `No es posible cancelar la cita ${cita.codigo}: faltan menos de 24 horas para la atención.`,
        testId: `alert-cancelar-error-${cita.codigo}`
      });
      return;
    }

    update('citas', cita.id, { estado: 'cancelada' });
    liberarHorario(cita.medicoId, cita.fecha, cita.hora);

    create_notificacion(`Tu cita ${cita.codigo} fue cancelada correctamente.`, 'cancelacion');

    showAlert('mis-citas-alert-container', {
      type: 'success',
      message: `La cita ${cita.codigo} fue cancelada correctamente.`,
      testId: `alert-cancelar-exito-${cita.codigo}`
    });
    renderTabla();
  }

  function liberarHorario(medicoId, fecha, hora) {
    const horario = getAll('horarios', (h) => h.medicoId === medicoId && h.fecha === fecha && h.hora === hora)[0];
    if (horario) update('horarios', horario.id, { estado: 'disponible' });
  }

  function create_notificacion(mensaje, tipo) {
    create('notificaciones', {
      usuarioId: session.userId,
      tipo,
      mensaje,
      leida: false,
      fecha: new Date().toISOString()
    });
  }

  function abrirPanelReprogramar(cita) {
    clearAlerts('mis-citas-alert-container');
    if (!isMoreThan24h(cita.fecha, cita.hora)) {
      showAlert('mis-citas-alert-container', {
        type: 'danger',
        message: `No es posible reprogramar la cita ${cita.codigo}: faltan menos de 24 horas para la atención.`,
        testId: `alert-reprogramar-error-${cita.codigo}`
      });
      return;
    }
    citaEnReprogramacion = cita;
    nuevoHorarioSeleccionado = null;
    textoReprogramarCodigo.textContent = cita.codigo;
    const hoy = todayISO();
    inputReprogramarFecha.min = hoy;
    inputReprogramarFecha.max = addDaysISO(hoy, 6);
    inputReprogramarFecha.value = '';
    gridReprogramarHorarios.innerHTML = '<p class="text-muted mb-0">Selecciona una nueva fecha para ver los horarios disponibles.</p>';
    btnConfirmarReprogramar.disabled = true;
    panelReprogramar.classList.remove('d-none');
    panelReprogramar.scrollIntoView({ behavior: 'smooth' });
  }

  inputReprogramarFecha.addEventListener('change', () => {
    if (!citaEnReprogramacion) return;
    const fecha = inputReprogramarFecha.value;
    const horarios = getAll('horarios', (h) =>
      h.medicoId === citaEnReprogramacion.medicoId && h.fecha === fecha
    ).sort((a, b) => a.hora.localeCompare(b.hora));

    if (horarios.length === 0) {
      gridReprogramarHorarios.innerHTML = '<p class="text-muted mb-0" data-testid="texto-reprogramar-sin-horarios">El médico no atiende en esa fecha.</p>';
      btnConfirmarReprogramar.disabled = true;
      return;
    }

    gridReprogramarHorarios.innerHTML = `<div class="d-flex flex-wrap gap-2">${horarios.map((h) => `
      <button type="button" class="btn btn-outline-primary franja-slot" data-horario-id="${h.id}"
        id="btn-reprogramar-franja-${h.id}" data-testid="btn-reprogramar-franja-${fecha}-${h.hora}"
        ${h.estado !== 'disponible' ? 'disabled' : ''}>${h.hora}</button>
    `).join('')}</div>`;

    gridReprogramarHorarios.querySelectorAll('button[data-horario-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        gridReprogramarHorarios.querySelectorAll('button[data-horario-id]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const horario = horarios.find((h) => h.id === Number(btn.dataset.horarioId));
        nuevoHorarioSeleccionado = { fecha, hora: horario.hora, horarioId: horario.id };
        btnConfirmarReprogramar.disabled = false;
      });
    });
    btnConfirmarReprogramar.disabled = true;
    nuevoHorarioSeleccionado = null;
  });

  btnConfirmarReprogramar.addEventListener('click', () => {
    if (!citaEnReprogramacion || !nuevoHorarioSeleccionado) return;
    const citaOriginal = { ...citaEnReprogramacion };

    liberarHorario(citaOriginal.medicoId, citaOriginal.fecha, citaOriginal.hora);
    update('horarios', nuevoHorarioSeleccionado.horarioId, { estado: 'ocupado' });
    update('citas', citaOriginal.id, {
      fecha: nuevoHorarioSeleccionado.fecha,
      hora: nuevoHorarioSeleccionado.hora,
      estado: 'confirmada'
    });

    create_notificacion(
      `Tu cita ${citaOriginal.codigo} fue reprogramada para el ${formatDateLong(nuevoHorarioSeleccionado.fecha)} a las ${nuevoHorarioSeleccionado.hora}.`,
      'reprogramacion'
    );

    showAlert('mis-citas-alert-container', {
      type: 'success',
      message: `La cita ${citaOriginal.codigo} fue reprogramada correctamente.`,
      testId: `alert-reprogramar-exito-${citaOriginal.codigo}`
    });

    panelReprogramar.classList.add('d-none');
    citaEnReprogramacion = null;
    nuevoHorarioSeleccionado = null;
    renderTabla();
  });

  btnCancelarReprogramar.addEventListener('click', () => {
    panelReprogramar.classList.add('d-none');
    citaEnReprogramacion = null;
    nuevoHorarioSeleccionado = null;
  });

  selectFiltro.addEventListener('change', renderTabla);
  renderTabla();
}
