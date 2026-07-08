// Generador de códigos únicos para MediCitas

export function generateCitaCode(citasExistentes) {
  let max = 0;
  for (const c of citasExistentes) {
    const match = /^CITA-(\d+)$/.exec(c.codigo || '');
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > max) max = n;
    }
  }
  const next = max + 1;
  return `CITA-${String(next).padStart(4, '0')}`;
}

export function nextId(items) {
  let max = 0;
  for (const it of items) {
    if (typeof it.id === 'number' && it.id > max) max = it.id;
  }
  return max + 1;
}
