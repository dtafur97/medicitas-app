import { requireRole } from '../services/auth.js';
import { renderNavbar } from '../components/navbar.js';
import { getAll, getById, create, update } from '../services/storage.js';
import { generateCitaCode } from '../utils/codes.js';
import { todayISO, addDaysISO, formatDateLong } from '../utils/dates.js';
import { showAlert, clearAlerts, escapeHtml } from '../utils/ui.js';

const session = requireRole(['paciente'], '../login.html');
if (session) {
  renderNavbar(session, '../', 'reservar');

  const especialidades = getAll('especialidades');
  const medicos = getAll('medicos');

  const selectEspecialidad = document.getElementById('select-especialidad');
  const selectMedico = document.getElementById('select-medico');
  const inputFecha = document.getElementById('input-fecha-reserva');
  const gridHorarios = document.getElementById('grid-horarios');
  const textoHorarioSeleccionado = document.getElementById('texto-horario-seleccionado');
  const btnReservar = document.getElementById('btn-reservar-cita');
  const inputMotivo = document.getElementById('input-motivo-cita');

  const hoy = todayISO();
  const maxFecha = addDaysISO(hoy, 6);
  inputFecha.min = hoy;
  inputFecha.max = maxFecha;

  let horarioSeleccionado = null; // { medicoId, fecha, hora, horarioId }

  selectEspecialidad.innerHTML += especialidades
    .map((e) => `<option value="${e.id}">${escapeHtml(e.nombre)}</option>`)
    .join('');

  const params = new URLSearchParams(window.location.search);
  const especialidadPreseleccionada = params.get('especialidadId');
  if (especialidadPreseleccionada) {
    selectEspecialidad.value = especialidadPreseleccionada;
  }

  function poblarMedicos() {
    const especialidadId = Number(selectEspecialidad.value);
    selectMedico.innerHTML = '<option value="">Selecciona un médico</option>';
    if (!especialidadId) {
      selectMedico.disabled = true;
      inputFecha.disabled = true;
      return;
    }
    const disponibles = medicos.filter((m) => m.especialidadId === especialidadId && m.activo);
    selectMedico.innerHTML += disponibles
      .map((m) => `<option value="${m.id}">${escapeHtml(m.nombre)}</option>`)
      .join('');
    selectMedico.disabled = disponibles.length === 0;
    resetGrid();
  }

  function resetGrid(mensaje = 'Selecciona especialidad, médico y fecha para ver los horarios disponibles.') {
    gridHorarios.innerHTML = `<p class="text-muted mb-0" data-testid="texto-seleccione-filtros">${mensaje}</p>`;
    horarioSeleccionado = null;
    textoHorarioSeleccionado.textContent = 'Ninguno';
    btnReservar.disabled = true;
  }

  function renderGrid() {
    const medicoId = Number(selectMedico.value);
    const fecha = inputFecha.value;
    if (!medicoId || !fecha) {
      resetGrid();
      return;
    }

    const horarios = getAll('horarios', (h) => h.medicoId === medicoId && h.fecha === fecha)
      .sort((a, b) => a.hora.localeCompare(b.hora));

    if (horarios.length === 0) {
      gridHorarios.innerHTML = `<p class="text-muted mb-0" data-testid="texto-sin-horarios">
        El médico no atiende en la fecha seleccionada. Elige otra fecha.</p>`;
      horarioSeleccionado = null;
      btnReservar.disabled = true;
      return;
    }

    gridHorarios.innerHTML = `<div class="d-flex flex-wrap gap-2">${horarios.map((h) => {
      const disabled = h.estado !== 'disponible';
      return `<button type="button" class="btn btn-outline-primary franja-slot"
        id="btn-franja-${h.id}" data-testid="btn-franja-${h.fecha}-${h.hora}"
        data-horario-id="${h.id}" ${disabled ? 'disabled' : ''}>${h.hora}</button>`;
    }).join('')}</div>`;

    gridHorarios.querySelectorAll('button[data-horario-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        gridHorarios.querySelectorAll('button[data-horario-id]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const horarioId = Number(btn.dataset.horarioId);
        const horario = horarios.find((h) => h.id === horarioId);
        horarioSeleccionado = { medicoId, fecha, hora: horario.hora, horarioId: horario.id };
        textoHorarioSeleccionado.textContent = `${formatDateLong(fecha)} a las ${horario.hora}`;
        btnReservar.disabled = false;
      });
    });

    horarioSeleccionado = null;
    textoHorarioSeleccionado.textContent = 'Ninguno';
    btnReservar.disabled = true;
  }

  selectEspecialidad.addEventListener('change', poblarMedicos);
  selectMedico.addEventListener('change', () => {
    inputFecha.disabled = !selectMedico.value;
    renderGrid();
  });
  inputFecha.addEventListener('change', renderGrid);

  btnReservar.addEventListener('click', () => {
    clearAlerts('reservar-alert-container');
    if (!horarioSeleccionado) return;

    const especialidadId = Number(selectEspecialidad.value);
    const citasActuales = getAll('citas');
    const codigo = generateCitaCode(citasActuales);

    const cita = create('citas', {
      codigo,
      pacienteId: session.userId,
      medicoId: horarioSeleccionado.medicoId,
      especialidadId,
      fecha: horarioSeleccionado.fecha,
      hora: horarioSeleccionado.hora,
      estado: 'pendiente',
      motivo: inputMotivo.value.trim() || 'Consulta general',
      createdAt: new Date().toISOString()
    });

    update('horarios', horarioSeleccionado.horarioId, { estado: 'ocupado' });

    create('notificaciones', {
      usuarioId: session.userId,
      tipo: 'confirmacion',
      mensaje: `Tu cita ${cita.codigo} fue registrada para el ${formatDateLong(cita.fecha)} a las ${cita.hora}. Está pendiente de confirmación.`,
      leida: false,
      fecha: new Date().toISOString()
    });

    showAlert('reservar-alert-container', {
      type: 'success',
      message: `Cita reservada con éxito. Código: <strong>${cita.codigo}</strong>. Puedes revisarla en "Mis citas".`,
      testId: 'alert-cita-confirmada',
      dismissible: false
    });

    inputMotivo.value = '';
    renderGrid();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  poblarMedicos();
}
