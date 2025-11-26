/**
 * Formatea un número de cédula al formato #-####-####
 * @param {string} value - Valor ingresado
 * @returns {string} Cédula formateada
 */
export function formatCedula(value) {
  // Remover todo lo que no sea número
  const numbers = value.replace(/\D/g, '');
  
  // Limitar a 9 dígitos
  const limited = numbers.slice(0, 9);
  
  // Aplicar formato
  if (limited.length <= 1) {
    return limited;
  } else if (limited.length <= 5) {
    return `${limited[0]}-${limited.slice(1)}`;
  } else {
    return `${limited[0]}-${limited.slice(1, 5)}-${limited.slice(5)}`;
  }
}

/**
 * Valida que una cédula esté completa (9 dígitos)
 * @param {string} cedula - Cédula a validar
 * @returns {boolean} True si es válida
 */
export function validarCedula(cedula) {
  const numbers = cedula.replace(/\D/g, '');
  return numbers.length === 9;
}

/**
 * Formatea un número de teléfono al formato ####-####
 * @param {string} value - Valor ingresado
 * @returns {string} Teléfono formateado
 */
export function formatTelefono(value) {
  // Remover todo lo que no sea número
  const numbers = value.replace(/\D/g, '');
  
  // Limitar a 8 dígitos
  const limited = numbers.slice(0, 8);
  
  // Aplicar formato
  if (limited.length <= 4) {
    return limited;
  } else {
    return `${limited.slice(0, 4)}-${limited.slice(4)}`;
  }
}

/**
 * Valida que un teléfono esté completo (8 dígitos)
 * @param {string} telefono - Teléfono a validar
 * @returns {boolean} True si es válido
 */
export function validarTelefono(telefono) {
  if (!telefono) return true; // Es opcional
  const numbers = telefono.replace(/\D/g, '');
  return numbers.length === 8;
}

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
export function validarEmail(email) {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Extrae solo los números de una cadena con formato
 * @param {string} formatted - Cadena formateada
 * @returns {string} Solo números
 */
export function extraerNumeros(formatted) {
  return formatted.replace(/\D/g, '');
}
