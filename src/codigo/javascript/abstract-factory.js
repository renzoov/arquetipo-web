// Una fábrica puede ser un simple objeto con funciones que crean cada producto de la familia, sin
// clases. `Object.freeze` evita que alguien reemplace una pieza de la familia en tiempo de
// ejecución, y un objeto literal hace de catálogo de fábricas.

const infraNube = Object.freeze({
  crearAlmacenamiento: () => ({ subir: (nombre) => `objetos-nube://facturas/${nombre}` }),
  crearCola: () => ({ publicar: (mensaje) => `cola gestionada ← ${mensaje}` }),
  crearSecretos: () => ({ leer: (clave) => `gestor-de-secretos:${clave}` }),
});

const infraOnPremise = Object.freeze({
  crearAlmacenamiento: () => ({ subir: (nombre) => `/mnt/nas/facturas/${nombre}` }),
  crearCola: () => ({ publicar: (mensaje) => `RabbitMQ ← ${mensaje}` }),
  crearSecretos: () => ({ leer: (clave) => `vault:${clave}` }),
});

const fabricas = { 'nube': infraNube, 'on-premise': infraOnPremise };

export function arrancar(entorno) {
  const infra = fabricas[entorno]; // se elige UNA vez
  if (!infra) throw new Error(`Entorno desconocido: ${entorno}`);

  console.log(`[${entorno}]`);
  console.log(' ', infra.crearAlmacenamiento().subir('F-001.pdf'));
  console.log(' ', infra.crearCola().publicar('factura-emitida'));
  console.log(' ', infra.crearSecretos().leer('certificado-firma'));
}

// ── Uso ──
arrancar('nube');
arrancar('on-premise');

try {
  arrancar('marte');
} catch (error) {
  console.log(error.message); // Entorno desconocido: marte
}
