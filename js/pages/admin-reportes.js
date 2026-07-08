import { requireRole } from '../services/auth.js';
import { renderNavbar } from '../components/navbar.js';
import { getAll, getById } from '../services/storage.js';
import { escapeHtml } from '../utils/ui.js';

const session = requireRole(['admin', 'recepcionista'], '../login.html');
if (session) {
  renderNavbar(session, '../', 'reportes');

  const citas = getAll('citas');
  const especialidades = getAll('especialidades');
  const medicos = getAll('medicos');

  const porEspecialidad = especialidades.map((e) => ({
    nombre: e.nombre,
    total: citas.filter((c) => c.especialidadId === e.id).length
  })).sort((a, b) => b.total - a.total);

  const ESTADOS = ['pendiente', 'confirmada', 'cancelada', 'atendida'];
  const porEstado = ESTADOS.map((estado) => ({
    estado,
    total: citas.filter((c) => c.estado === estado).length
  }));

  const porMedico = medicos.map((m) => ({
    nombre: m.nombre,
    total: citas.filter((c) => c.medicoId === m.id).length
  })).sort((a, b) => b.total - a.total);

  document.getElementById('tbody-reporte-especialidad').innerHTML = porEspecialidad.map((r) => `
    <tr data-testid="reporte-especialidad-${escapeHtml(r.nombre)}"><td>${escapeHtml(r.nombre)}</td><td>${r.total}</td></tr>
  `).join('');

  document.getElementById('tbody-reporte-estado').innerHTML = porEstado.map((r) => `
    <tr data-testid="reporte-estado-${r.estado}"><td>${r.estado}</td><td>${r.total}</td></tr>
  `).join('');

  document.getElementById('tbody-reporte-medico').innerHTML = porMedico.map((r) => `
    <tr data-testid="reporte-medico-${escapeHtml(r.nombre)}"><td>${escapeHtml(r.nombre)}</td><td>${r.total}</td></tr>
  `).join('');

  const ctx = document.getElementById('chart-citas-especialidad');
  // eslint-disable-next-line no-undef
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: porEspecialidad.map((r) => r.nombre),
      datasets: [{
        label: 'Citas por especialidad',
        data: porEspecialidad.map((r) => r.total),
        backgroundColor: '#0d6efd'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });

  document.getElementById('btn-imprimir-reporte').addEventListener('click', () => {
    window.print();
  });
}
