import { getAll, create } from '../services/storage.js';
import { showAlert, clearAlerts } from '../utils/ui.js';
import { validateNombre, validateDNI, validateEmail, validateTelefono, validatePassword } from '../utils/validators.js';

const form = document.getElementById('form-register');
const fields = {
  nombre: {
    input: document.getElementById('input-register-nombre'),
    error: document.getElementById('error-register-nombre'),
    validate: validateNombre
  },
  dni: {
    input: document.getElementById('input-register-dni'),
    error: document.getElementById('error-register-dni'),
    validate: validateDNI
  },
  telefono: {
    input: document.getElementById('input-register-telefono'),
    error: document.getElementById('error-register-telefono'),
    validate: validateTelefono
  },
  email: {
    input: document.getElementById('input-register-email'),
    error: document.getElementById('error-register-email'),
    validate: validateEmail
  },
  password: {
    input: document.getElementById('input-register-password'),
    error: document.getElementById('error-register-password'),
    validate: validatePassword
  }
};
const confirmInput = document.getElementById('input-register-confirm-password');
const confirmError = document.getElementById('error-register-confirm-password');

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
  clearAlerts('register-alert-container');

  let allValid = true;
  const values = {};
  for (const key of Object.keys(fields)) {
    const { input, error, validate } = fields[key];
    const result = validate(input.value);
    values[key] = input.value.trim();
    if (!setFieldError(input, error, result)) allValid = false;
  }

  let confirmValid = true;
  if (confirmInput.value !== fields.password.input.value) {
    confirmInput.classList.add('is-invalid');
    confirmError.textContent = 'Las contraseñas no coinciden.';
    confirmValid = false;
  } else {
    confirmInput.classList.remove('is-invalid');
    confirmError.textContent = '';
  }

  if (!allValid || !confirmValid) return;

  const usuarios = getAll('usuarios');
  const emailTaken = usuarios.some((u) => u.email.toLowerCase() === values.email.toLowerCase());
  if (emailTaken) {
    showAlert('register-alert-container', {
      type: 'danger',
      message: 'Ya existe una cuenta registrada con ese correo electrónico.',
      testId: 'alert-register-email-duplicado'
    });
    return;
  }
  const dniTaken = usuarios.some((u) => u.dni === values.dni);
  if (dniTaken) {
    showAlert('register-alert-container', {
      type: 'danger',
      message: 'Ya existe una cuenta registrada con ese DNI.',
      testId: 'alert-register-dni-duplicado'
    });
    return;
  }

  create('usuarios', {
    nombre: values.nombre,
    dni: values.dni,
    telefono: values.telefono,
    email: values.email,
    password: fields.password.input.value,
    rol: 'paciente'
  });

  showAlert('register-alert-container', {
    type: 'success',
    message: 'Cuenta creada exitosamente. Ya puedes iniciar sesión.',
    testId: 'alert-register-success',
    dismissible: false
  });

  form.reset();
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1200);
});
