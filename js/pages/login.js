import { login, getSession, homePathForRole } from '../services/auth.js';
import { showAlert, clearAlerts } from '../utils/ui.js';
import { validateEmail, validateRequired } from '../utils/validators.js';

// Si ya hay una sesión activa, redirigir directamente a su home.
const existing = getSession();
if (existing) {
  window.location.replace(homePathForRole(existing.rol));
}

const form = document.getElementById('form-login');
const emailInput = document.getElementById('input-login-email');
const passwordInput = document.getElementById('input-login-password');
const emailError = document.getElementById('error-login-email');
const passwordError = document.getElementById('error-login-password');

function setFieldError(input, errorEl, result) {
  if (result.valid) {
    input.classList.remove('is-invalid');
    errorEl.textContent = '';
    return true;
  }
  input.classList.add('is-invalid');
  errorEl.textContent = result.message;
  return false;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  clearAlerts('login-alert-container');

  const emailResult = validateEmail(emailInput.value);
  const passwordResult = validateRequired(passwordInput.value, 'La contraseña');

  const emailOk = setFieldError(emailInput, emailError, emailResult);
  const passwordOk = setFieldError(passwordInput, passwordError, passwordResult);

  if (!emailOk || !passwordOk) return;

  const result = login(emailInput.value, passwordInput.value);
  if (!result.success) {
    showAlert('login-alert-container', {
      type: 'danger',
      message: result.message,
      testId: 'alert-login-error'
    });
    return;
  }

  showAlert('login-alert-container', {
    type: 'success',
    message: `Bienvenido/a, ${result.session.nombre}. Redirigiendo...`,
    testId: 'alert-login-success',
    dismissible: false
  });

  setTimeout(() => {
    window.location.href = homePathForRole(result.session.rol);
  }, 600);
});
