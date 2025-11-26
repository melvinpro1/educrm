// Script de prueba para validar las funciones de validación
// Ejecutar con: node test-validaciones.js

// Simulación de las funciones (copiar de validaciones.js)
function extraerNumeros(texto) {
  return texto.replace(/\D/g, '');
}

function formatCedula(valor) {
  const numeros = extraerNumeros(valor);
  const limitado = numeros.slice(0, 9);
  
  if (limitado.length <= 1) return limitado;
  if (limitado.length <= 5) return `${limitado[0]}-${limitado.slice(1)}`;
  return `${limitado[0]}-${limitado.slice(1, 5)}-${limitado.slice(5)}`;
}

function formatTelefono(valor) {
  const numeros = extraerNumeros(valor);
  const limitado = numeros.slice(0, 8);
  
  if (limitado.length <= 4) return limitado;
  return `${limitado.slice(0, 4)}-${limitado.slice(4)}`;
}

function validarCedula(cedula) {
  const numeros = extraerNumeros(cedula);
  return numeros.length === 9;
}

function validarTelefono(telefono) {
  const numeros = extraerNumeros(telefono);
  return numeros.length === 8;
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// PRUEBAS
console.log('=== PRUEBAS DE VALIDACIÓN ===\n');

// Pruebas de Cédula
console.log('--- Formateo de Cédula ---');
console.log('Input: "123456789" → Output:', formatCedula('123456789'));
console.log('Input: "1-2345-6789" → Output:', formatCedula('1-2345-6789'));
console.log('Input: "1234" → Output:', formatCedula('1234'));
console.log('Input: "12" → Output:', formatCedula('12'));
console.log('Input: "1" → Output:', formatCedula('1'));

console.log('\n--- Validación de Cédula ---');
console.log('Cédula "1-2345-6789" válida?', validarCedula('1-2345-6789'));
console.log('Cédula "123456789" válida?', validarCedula('123456789'));
console.log('Cédula "1-2345" válida?', validarCedula('1-2345'));
console.log('Cédula "12345678901" válida?', validarCedula('12345678901')); // Más de 9

// Pruebas de Teléfono
console.log('\n--- Formateo de Teléfono ---');
console.log('Input: "12345678" → Output:', formatTelefono('12345678'));
console.log('Input: "1234-5678" → Output:', formatTelefono('1234-5678'));
console.log('Input: "1234" → Output:', formatTelefono('1234'));
console.log('Input: "123" → Output:', formatTelefono('123'));

console.log('\n--- Validación de Teléfono ---');
console.log('Teléfono "1234-5678" válido?', validarTelefono('1234-5678'));
console.log('Teléfono "12345678" válido?', validarTelefono('12345678'));
console.log('Teléfono "1234" válido?', validarTelefono('1234'));
console.log('Teléfono "123456789" válido?', validarTelefono('123456789')); // Más de 8

// Pruebas de Email
console.log('\n--- Validación de Email ---');
console.log('Email "test@example.com" válido?', validarEmail('test@example.com'));
console.log('Email "usuario@universidad.edu" válido?', validarEmail('usuario@universidad.edu'));
console.log('Email "test@" válido?', validarEmail('test@'));
console.log('Email "test" válido?', validarEmail('test'));
console.log('Email "@example.com" válido?', validarEmail('@example.com'));
console.log('Email "test@example" válido?', validarEmail('test@example'));

console.log('\n=== FIN DE PRUEBAS ===');
