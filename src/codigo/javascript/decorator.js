// En JavaScript las funciones son valores, así que un decorador suele ser una función de orden
// superior: recibe una función y devuelve otra con la misma firma y comportamiento añadido.
// Las capas se combinan anidando llamadas, sin clases.

let llamadas = 0;
async function obtenerDeApi(moneda) {
  llamadas++;
  if (llamadas === 1) throw new Error('Tiempo de espera agotado'); // el proveedor falla a veces
  return moneda === 'USD' ? 3.75 : 4.05;
}

export const conReintentos = (fn, intentos = 3) => async (...args) => {
  for (let intento = 1; ; intento++) {
    try {
      return await fn(...args);
    } catch (error) {
      if (intento >= intentos) throw error;
      console.log(`  reintento ${intento}...`);
    }
  }
};

export const conCache = (fn, ttlMs = 5 * 60_000) => {
  const cache = new Map();
  return async (clave) => {
    const guardado = cache.get(clave);
    if (guardado && guardado.expira > Date.now()) return guardado.valor;
    const valor = await fn(clave);
    cache.set(clave, { valor, expira: Date.now() + ttlMs });
    return valor;
  };
};

export const conLog = (fn) => async (...args) => {
  console.log(`→ consultando ${args.join(', ')}`);
  return fn(...args);
};

// ── Uso ──
// El orden importa: la caché va por fuera para no registrar ni reintentar lo que ya está guardado.
const obtenerTipoCambio = conCache(conLog(conReintentos(obtenerDeApi)));

console.log(await obtenerTipoCambio('USD')); // → consultando USD, reintento 1..., 3.75
console.log(await obtenerTipoCambio('USD')); // 3.75 (desde la caché)
