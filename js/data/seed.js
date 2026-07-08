// Datos semilla de MediCitas. Se genera de forma programática para que
// las fechas de citas y horarios siempre sean relativas a "hoy".

import { addDaysISO, todayISO, generarFranjas, pad2 } from '../utils/dates.js';

const ESPECIALIDADES = [
  { id: 1, nombre: 'Medicina General', descripcion: 'Atención primaria y chequeos generales.', icono: 'bi-heart-pulse' },
  { id: 2, nombre: 'Cardiología', descripcion: 'Diagnóstico y tratamiento de enfermedades del corazón.', icono: 'bi-heart' },
  { id: 3, nombre: 'Pediatría', descripcion: 'Atención médica para niños y adolescentes.', icono: 'bi-emoji-smile' },
  { id: 4, nombre: 'Dermatología', descripcion: 'Cuidado de la piel, cabello y uñas.', icono: 'bi-bandaid' },
  { id: 5, nombre: 'Ginecología', descripcion: 'Salud reproductiva y ginecológica de la mujer.', icono: 'bi-gender-female' },
  { id: 6, nombre: 'Traumatología', descripcion: 'Lesiones y afecciones del sistema músculo-esquelético.', icono: 'bi-bandaid-fill' },
  { id: 7, nombre: 'Oftalmología', descripcion: 'Diagnóstico y tratamiento de enfermedades oculares.', icono: 'bi-eye' },
  { id: 8, nombre: 'Odontología', descripcion: 'Salud bucal y tratamientos dentales.', icono: 'bi-emoji-laughing' },
  { id: 9, nombre: 'Psicología', descripcion: 'Salud mental y bienestar emocional.', icono: 'bi-brain' },
  { id: 10, nombre: 'Nutrición', descripcion: 'Planes alimenticios y control nutricional.', icono: 'bi-apple' }
];

const MEDICOS_BASE = [
  { id: 1, nombre: 'Dr. Carlos Ramírez', especialidadId: 1, colegiatura: 'CMP-10234', email: 'medico@demo.com' },
  { id: 2, nombre: 'Dra. Lucía Fernández', especialidadId: 2, colegiatura: 'CMP-20345', email: 'lucia.fernandez@medicitas.com' },
  { id: 3, nombre: 'Dr. Jorge Salazar', especialidadId: 3, colegiatura: 'CMP-30456', email: 'jorge.salazar@medicitas.com' },
  { id: 4, nombre: 'Dra. Marina Torres', especialidadId: 4, colegiatura: 'CMP-40567', email: 'marina.torres@medicitas.com' },
  { id: 5, nombre: 'Dra. Patricia Rojas', especialidadId: 5, colegiatura: 'CMP-50678', email: 'patricia.rojas@medicitas.com' },
  { id: 6, nombre: 'Dr. Andrés Castillo', especialidadId: 6, colegiatura: 'CMP-60789', email: 'andres.castillo@medicitas.com' },
  { id: 7, nombre: 'Dra. Valeria Núñez', especialidadId: 7, colegiatura: 'CMP-70890', email: 'valeria.nunez@medicitas.com' },
  { id: 8, nombre: 'Dr. Ricardo Paredes', especialidadId: 8, colegiatura: 'CMP-80901', email: 'ricardo.paredes@medicitas.com' },
  { id: 9, nombre: 'Dra. Camila Vidal', especialidadId: 9, colegiatura: 'CMP-90012', email: 'camila.vidal@medicitas.com' },
  { id: 10, nombre: 'Dr. Fernando Quispe', especialidadId: 10, colegiatura: 'CMP-11023', email: 'fernando.quispe@medicitas.com' }
];

const PACIENTES_BASE = [
  { id: 1, nombre: 'María López', dni: '71234567', email: 'paciente@demo.com', telefono: '987654321' },
  { id: 2, nombre: 'Juan Pérez', dni: '72345678', email: 'juan.perez@correo.com', telefono: '987654322' },
  { id: 3, nombre: 'Ana Gómez', dni: '73456789', email: 'ana.gomez@correo.com', telefono: '987654323' },
  { id: 4, nombre: 'Luis Torres', dni: '74567890', email: 'luis.torres@correo.com', telefono: '987654324' },
  { id: 5, nombre: 'Sofía Vargas', dni: '75678901', email: 'sofia.vargas@correo.com', telefono: '987654325' }
];

function buildUsuarios() {
  const usuarios = [];
  let id = 1;

  for (const p of PACIENTES_BASE) {
    usuarios.push({
      id: id++, nombre: p.nombre, dni: p.dni, email: p.email,
      telefono: p.telefono, password: '123456', rol: 'paciente'
    });
  }

  for (const m of MEDICOS_BASE) {
    usuarios.push({
      id: id++, nombre: m.nombre, dni: `6${String(1000000 + m.id).slice(-7)}`, email: m.email,
      telefono: `98810${String(1000 + m.id).slice(-4)}`, password: '123456', rol: 'medico'
    });
  }

  usuarios.push({
    id: id++, nombre: 'Rosa Medina', dni: '80123456', email: 'recepcion@demo.com',
    telefono: '955512345', password: '123456', rol: 'recepcionista'
  });

  usuarios.push({
    id: id++, nombre: 'Administrador Sistema', dni: '90123456', email: 'admin@demo.com',
    telefono: '955567890', password: '123456', rol: 'admin'
  });

  return usuarios;
}

function buildMedicos(usuarios) {
  return MEDICOS_BASE.map((m) => {
    const usuario = usuarios.find((u) => u.email === m.email);
    return {
      id: m.id,
      usuarioId: usuario.id,
      nombre: m.nombre,
      email: m.email,
      especialidadId: m.especialidadId,
      colegiatura: m.colegiatura,
      activo: true
    };
  });
}

function buildHorarios(medicos) {
  const horarios = [];
  let id = 1;
  const hoy = todayISO();
  const franjasManana = generarFranjas('08:00', '13:00', 30);
  const franjasTarde = generarFranjas('14:00', '18:00', 30);
  const franjas = [...franjasManana, ...franjasTarde];

  for (const medico of medicos) {
    for (let offset = 0; offset <= 7; offset++) {
      const fecha = addDaysISO(hoy, offset);
      const diaSemana = new Date(fecha + 'T00:00:00').getDay();
      if (diaSemana === 0) continue; // domingo: sin atención

      franjas.forEach((hora, idx) => {
        // Patrón determinístico: ~1 de cada 7 franjas queda bloqueada
        const bloqueada = (medico.id + offset + idx) % 7 === 0;
        horarios.push({
          id: id++,
          medicoId: medico.id,
          fecha,
          hora,
          estado: bloqueada ? 'bloqueado' : 'disponible'
        });
      });
    }
  }
  return horarios;
}

function ocuparHorario(horarios, medicoId, fecha, hora) {
  const h = horarios.find((x) => x.medicoId === medicoId && x.fecha === fecha && x.hora === hora);
  if (h) h.estado = 'ocupado';
}

function buildCitasYNotificaciones(medicos, horarios) {
  const citas = [];
  const notificaciones = [];
  let citaId = 1;
  let notifId = 1;
  const hoy = todayISO();

  const franjasManana = generarFranjas('08:00', '13:00', 30);
  const franjasTarde = generarFranjas('14:00', '18:00', 30);
  const franjas = [...franjasManana, ...franjasTarde];

  const push = (arr) => citas.push(arr);

  function crearCita({ pacienteId, medicoId, offsetDias, horaIdx, estado, motivo, ocupar }) {
    const especialidadId = medicos.find((m) => m.id === medicoId).especialidadId;
    let fechaOffset = offsetDias;
    // Los médicos no atienden los domingos: si una cita futura cayera en domingo, se corre al lunes.
    if (ocupar && offsetDias >= 0 && new Date(addDaysISO(hoy, offsetDias) + 'T00:00:00').getDay() === 0) {
      fechaOffset += 1;
    }
    const fecha = addDaysISO(hoy, fechaOffset);
    const hora = franjas[horaIdx % franjas.length];
    const codigo = `CITA-${String(citaId).padStart(4, '0')}`;
    push({
      id: citaId,
      codigo,
      pacienteId,
      medicoId,
      especialidadId,
      fecha,
      hora,
      estado,
      motivo,
      createdAt: new Date().toISOString()
    });
    if (ocupar && (estado === 'pendiente' || estado === 'confirmada')) {
      ocuparHorario(horarios, medicoId, fecha, hora);
    }
    citaId++;
    return codigo;
  }

  function crearNotificacion(usuarioId, tipo, mensaje) {
    notificaciones.push({
      id: notifId++,
      usuarioId,
      tipo,
      mensaje,
      leida: false,
      fecha: new Date().toISOString()
    });
  }

  // --- Citas PENDIENTES (futuras, 0 a 6 días) ---
  const pendientes = [
    { pacienteId: 1, medicoId: 1, offsetDias: 1, horaIdx: 2 },
    { pacienteId: 2, medicoId: 2, offsetDias: 2, horaIdx: 4 },
    { pacienteId: 3, medicoId: 4, offsetDias: 3, horaIdx: 1 },
    { pacienteId: 4, medicoId: 6, offsetDias: 5, horaIdx: 6 },
    { pacienteId: 5, medicoId: 8, offsetDias: 4, horaIdx: 3 }
  ];
  pendientes.forEach((c) => {
    const codigo = crearCita({ ...c, estado: 'pendiente', motivo: 'Consulta general', ocupar: true });
    crearNotificacion(c.pacienteId, 'confirmacion', `Tu cita ${codigo} fue registrada y está pendiente de confirmación.`);
  });

  // --- Citas CONFIRMADAS (futuras) ---
  // La primera confirmada queda dentro de las próximas 24h para probar la restricción de cancelación.
  const confirmadas = [
    { pacienteId: 1, medicoId: 1, offsetDias: 0, horaIdx: 0 }, // posible <24h dependiendo de la hora actual
    { pacienteId: 2, medicoId: 3, offsetDias: 2, horaIdx: 2 },
    { pacienteId: 3, medicoId: 5, offsetDias: 3, horaIdx: 5 },
    { pacienteId: 1, medicoId: 7, offsetDias: 6, horaIdx: 0 },
    { pacienteId: 4, medicoId: 9, offsetDias: 4, horaIdx: 7 }
  ];
  confirmadas.forEach((c) => {
    const codigo = crearCita({ ...c, estado: 'confirmada', motivo: 'Consulta de seguimiento', ocupar: true });
    crearNotificacion(c.pacienteId, 'confirmacion', `Tu cita ${codigo} ha sido confirmada.`);
  });

  // --- Citas CANCELADAS ---
  const canceladas = [
    { pacienteId: 2, medicoId: 1, offsetDias: -3 },
    { pacienteId: 3, medicoId: 2, offsetDias: -5 },
    { pacienteId: 5, medicoId: 6, offsetDias: 2 },
    { pacienteId: 1, medicoId: 10, offsetDias: -1 },
    { pacienteId: 4, medicoId: 4, offsetDias: -7 }
  ];
  canceladas.forEach((c, i) => {
    const codigo = crearCita({ ...c, horaIdx: i + 1, estado: 'cancelada', motivo: 'Cancelada por el paciente', ocupar: false });
    crearNotificacion(c.pacienteId, 'cancelacion', `Tu cita ${codigo} fue cancelada.`);
  });

  // --- Citas ATENDIDAS (pasadas) ---
  const atendidas = [
    { pacienteId: 1, medicoId: 1, offsetDias: -10 },
    { pacienteId: 2, medicoId: 2, offsetDias: -12 },
    { pacienteId: 3, medicoId: 3, offsetDias: -8 },
    { pacienteId: 4, medicoId: 5, offsetDias: -15 },
    { pacienteId: 5, medicoId: 7, offsetDias: -20 }
  ];
  const citasAtendidas = atendidas.map((c, i) =>
    crearCita({ ...c, horaIdx: i + 2, estado: 'atendida', motivo: 'Consulta médica', ocupar: false })
  );

  // Recordatorios para citas próximas (mañana)
  crearNotificacion(1, 'recordatorio', 'Recordatorio: tienes una cita programada próximamente. Revisa "Mis citas" para más detalles.');
  crearNotificacion(2, 'recordatorio', 'Recordatorio: tienes una cita programada próximamente. Revisa "Mis citas" para más detalles.');

  return { citas, notificaciones, citasAtendidasCodigos: citasAtendidas };
}

function buildHistoriales(citas) {
  const atendidas = citas.filter((c) => c.estado === 'atendida');
  const historiales = atendidas.map((c, i) => ({
    id: i + 1,
    pacienteId: c.pacienteId,
    medicoId: c.medicoId,
    citaId: c.id,
    fecha: c.fecha,
    diagnostico: [
      'Cuadro viral leve, se indica reposo e hidratación.',
      'Hipertensión arterial controlada, continuar tratamiento.',
      'Control de crecimiento y desarrollo normal.',
      'Dermatitis de contacto, se indica crema tópica.',
      'Migraña tensional, se recomienda manejo de estrés.'
    ][i % 5],
    alergias: ['Ninguna conocida', 'Penicilina', 'Polvo y ácaros', 'Ninguna conocida', 'Mariscos'][i % 5],
    atencionesPrevias: `Paciente con ${1 + (i % 3)} atención(es) previa(s) registrada(s) en el sistema.`
  }));
  return historiales;
}

export function generateSeed() {
  const usuarios = buildUsuarios();
  const medicos = buildMedicos(usuarios);
  const horarios = buildHorarios(medicos);
  const { citas, notificaciones } = buildCitasYNotificaciones(medicos, horarios);
  const historiales = buildHistoriales(citas);

  return {
    usuarios,
    especialidades: ESPECIALIDADES,
    medicos,
    horarios,
    citas,
    historiales,
    notificaciones
  };
}
