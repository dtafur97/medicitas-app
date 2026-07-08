// Utilidades de fecha y hora para MediCitas

export function pad2(n) {
  return String(n).padStart(2, '0');
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function addDaysISO(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

export function formatDateLong(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DIAS[dt.getDay()]}, ${dt.getDate()} de ${MESES[dt.getMonth()]} de ${dt.getFullYear()}`;
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${pad2(d)}/${pad2(m)}/${y}`;
}

export function combineDateTime(fecha, hora) {
  const [y, m, d] = fecha.split('-').map(Number);
  const [hh, mm] = hora.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0);
}

export function diffHoursFromNow(fecha, hora) {
  const target = combineDateTime(fecha, hora);
  const now = new Date();
  return (target.getTime() - now.getTime()) / (1000 * 60 * 60);
}

export function isMoreThan24h(fecha, hora) {
  return diffHoursFromNow(fecha, hora) > 24;
}

export function generarFranjas(horaInicio, horaFin, stepMin = 30) {
  const franjas = [];
  const [hi, mi] = horaInicio.split(':').map(Number);
  const [hf, mf] = horaFin.split(':').map(Number);
  let cursor = hi * 60 + mi;
  const fin = hf * 60 + mf;
  while (cursor < fin) {
    franjas.push(`${pad2(Math.floor(cursor / 60))}:${pad2(cursor % 60)}`);
    cursor += stepMin;
  }
  return franjas;
}

export function nowISODateTime() {
  return new Date().toISOString();
}

export function formatDateTimeLegible(isoString) {
  if (!isoString) return '';
  const dt = new Date(isoString);
  return `${pad2(dt.getDate())}/${pad2(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
}
