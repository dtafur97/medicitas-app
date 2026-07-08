# MediCitas – Sistema de Gestión de Citas Médicas

Aplicación web multipágina (HTML5 + CSS3 + JavaScript ES6+ con módulos) para la
gestión de citas médicas. No utiliza frameworks, backend ni base de datos: toda
la información es data dummy generada en `js/data/seed.js` y persistida en
`localStorage` del navegador.

## Cómo ejecutar el proyecto

Esta aplicación usa módulos ES (`type="module"`), por lo que **no puede abrirse
directamente con `file://`** (los navegadores bloquean los imports de módulos
en ese esquema). Debe servirse mediante un servidor HTTP local.

### Opción 1: Live Server (VS Code)

1. Instala la extensión "Live Server" en Visual Studio Code.
2. Abre la carpeta del proyecto en VS Code.
3. Clic derecho sobre `login.html` (o `index.html`) → "Open with Live Server".
4. Configura el puerto sugerido **5500** (por defecto en Live Server).

### Opción 2: npx serve

```bash
npx serve -l 5500
```

Luego abre `http://localhost:5500/index.html` en tu navegador.

> Al cargar cualquier página por primera vez, el sistema detecta que
> `localStorage` está vacío y se auto-inicializa con los datos semilla
> (`js/services/storage.js` → `seedIfNeeded()`).

## Credenciales de demostración

| Rol             | Correo                | Contraseña |
|------------------|------------------------|------------|
| Paciente         | paciente@demo.com      | 123456     |
| Médico           | medico@demo.com        | 123456     |
| Recepcionista    | recepcion@demo.com     | 123456     |
| Administrador    | admin@demo.com         | 123456     |

También puedes crear una nueva cuenta de paciente desde `register.html`.

## Mapa de páginas

```
index.html                        → redirige a login.html
login.html                        → inicio de sesión (muestra credenciales demo)
register.html                     → registro de nuevos pacientes

paciente/dashboard.html           → panel con estadísticas y accesos rápidos
paciente/especialidades.html      → búsqueda y filtro de especialidades
paciente/reservar.html            → reserva de citas (grilla de horarios de 30 min)
paciente/mis-citas.html           → listado, cancelación y reprogramación de citas
paciente/notificaciones.html      → centro de notificaciones (confirmación, cancelación, recordatorio)

medico/dashboard.html             → panel con estadísticas del médico
medico/agenda.html                → agenda diaria de citas con datos del paciente
medico/horarios.html              → creación, bloqueo y eliminación de franjas horarias
medico/historial.html?citaId=N    → historial clínico del paciente asociado a una cita

admin/dashboard.html              → panel general del sistema
admin/monitoreo.html              → monitoreo de todas las citas con filtros
admin/medicos.html                → activar/desactivar disponibilidad de médicos
admin/reportes.html                → reportes por especialidad, estado y médico (tablas + gráfico) e impresión
```

## Estructura de carpetas

```
/css                  Estilos personalizados (styles.css) sobre Bootstrap 5
/js/data              Generador de datos semilla (seed.js)
/js/services           storage.js (CRUD sobre localStorage) y auth.js (sesión)
/js/components         navbar.js (navbar dinámico según rol)
/js/utils              validators.js, dates.js, codes.js, ui.js
/js/pages               Un módulo JS por página HTML
/paciente, /medico, /admin   Páginas HTML agrupadas por rol
```

## Datos semilla

Se generan automáticamente al primer acceso e incluyen:

- 10 especialidades médicas
- 10 médicos (uno de ellos con la cuenta demo `medico@demo.com`)
- 5 pacientes (uno de ellos con la cuenta demo `paciente@demo.com`)
- Horarios de atención (franjas de 30 min) para los próximos 7 días por médico
- 20 citas distribuidas en distintos estados (pendiente, confirmada,
  cancelada, atendida)
- 5 historiales clínicos asociados a citas atendidas
- Notificaciones de confirmación, cancelación y recordatorio

Puedes reiniciar los datos en cualquier momento ejecutando en la consola del
navegador:

```js
import('./js/services/storage.js').then(m => m.resetData());
```

## Notas para pruebas automatizadas (Selenium)

- Todos los campos, botones, filas y mensajes de validación/confirmación
  cuentan con atributos `id` y `data-testid` estables y descriptivos
  (ej. `data-testid="btn-reservar-cita"`, `data-testid="input-login-email"`,
  `data-testid="alert-cita-confirmada"`, `data-testid="row-cita-CITA-0001"`).
- Los mensajes de validación, error y éxito se muestran siempre como alertas
  Bootstrap visibles en el DOM (nunca `alert()` nativo ni notificaciones que
  desaparecen automáticamente).
- El navbar cambia según el rol de la sesión activa
  (`data-testid="nav-paciente"`, `"nav-medico"`, `"nav-admin"`) e incluye el
  botón de cierre de sesión (`data-testid="btn-logout"`).
