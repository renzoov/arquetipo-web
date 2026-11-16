// En JavaScript el propio módulo es el singleton: se evalúa una sola vez y todos los `import`
// reciben lo mismo. La variable `instancia` es privada del módulo (no se exporta) y `??=` la crea
// solo la primera vez que alguien la pide. No hace falta ninguna clase.

let instancia; // privada del módulo

function cargarConfiguracion() {
  console.log('Cargando configuración (solo ocurre una vez)...');
  const flags = new Map([
    ['pagos.billetera', true],
    ['envios.express', false],
  ]);
  return Object.freeze({
    estaActiva: (flag) => flags.get(flag) ?? false,
  });
}

export function obtenerConfiguracion() {
  return (instancia ??= cargarConfiguracion());
}

// ── Uso ──
const desdePagos = obtenerConfiguracion();
const desdeEnvios = obtenerConfiguracion();

console.log(desdePagos === desdeEnvios);              // true
console.log(desdePagos.estaActiva('pagos.billetera')); // true
console.log(desdeEnvios.estaActiva('envios.express')); // false
