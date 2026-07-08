// Validaciones de formularios para MediCitas

export function validateNombre(valor) {
  const v = (valor || '').trim();
  if (v.length < 3) {
    return { valid: false, message: 'El nombre debe tener al menos 3 caracteres.' };
  }
  if (!/^[A-Za-zÀ-ÿñÑ\s]+$/.test(v)) {
    return { valid: false, message: 'El nombre solo puede contener letras y espacios.' };
  }
  return { valid: true, message: '' };
}

export function validateDNI(valor) {
  const v = (valor || '').trim();
  if (!/^\d{8}$/.test(v)) {
    return { valid: false, message: 'El DNI debe tener exactamente 8 dígitos.' };
  }
  return { valid: true, message: '' };
}

export function validateEmail(valor) {
  const v = (valor || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
    return { valid: false, message: 'Ingresa un correo electrónico válido.' };
  }
  return { valid: true, message: '' };
}

export function validateTelefono(valor) {
  const v = (valor || '').trim();
  if (!/^\d{9}$/.test(v)) {
    return { valid: false, message: 'El teléfono debe tener exactamente 9 dígitos.' };
  }
  return { valid: true, message: '' };
}

export function validatePassword(valor) {
  const v = valor || '';
  if (v.length < 6) {
    return { valid: false, message: 'La contraseña debe tener al menos 6 caracteres.' };
  }
  return { valid: true, message: '' };
}

export function validateRequired(valor, campo = 'Este campo') {
  const v = (valor || '').toString().trim();
  if (!v) {
    return { valid: false, message: `${campo} es obligatorio.` };
  }
  return { valid: true, message: '' };
}
