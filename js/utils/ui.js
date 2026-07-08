// Helpers de interfaz: alertas persistentes en el DOM (nunca alert() nativo)

let alertCounter = 0;

/**
 * Inserta una alerta Bootstrap visible y permanente en el DOM dentro del contenedor indicado.
 * @param {string} containerId - id del elemento contenedor donde se insertará la alerta.
 * @param {Object} opts
 * @param {'success'|'danger'|'warning'|'info'} opts.type
 * @param {string} opts.message
 * @param {string} opts.testId - data-testid estable para la alerta (ej. 'alert-cita-confirmada')
 * @param {boolean} [opts.dismissible=true]
 */
export function showAlert(containerId, { type = 'info', message, testId, dismissible = true }) {
  const container = document.getElementById(containerId);
  if (!container) return;
  alertCounter += 1;
  const elId = `${testId || 'alert'}-${alertCounter}`;
  const div = document.createElement('div');
  div.className = `alert alert-${type} ${dismissible ? 'alert-dismissible' : ''} fade show`;
  div.setAttribute('role', 'alert');
  div.id = elId;
  div.setAttribute('data-testid', testId || 'alert-mensaje');
  div.innerHTML = `<span>${message}</span>` + (dismissible
    ? `<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar" data-testid="${testId || 'alert'}-btn-cerrar"></button>`
    : '');
  container.appendChild(div);
  return div;
}

export function clearAlerts(containerId) {
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = '';
}

export function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function estadoBadgeClass(estado) {
  switch (estado) {
    case 'pendiente': return 'bg-warning text-dark';
    case 'confirmada': return 'bg-success';
    case 'cancelada': return 'bg-danger';
    case 'atendida': return 'bg-secondary';
    default: return 'bg-light text-dark';
  }
}

export function horarioBadgeClass(estado) {
  switch (estado) {
    case 'disponible': return 'bg-success';
    case 'bloqueado': return 'bg-warning text-dark';
    case 'ocupado': return 'bg-secondary';
    default: return 'bg-light text-dark';
  }
}
