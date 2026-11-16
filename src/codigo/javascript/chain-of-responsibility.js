// La forma idiomática en JavaScript es la de los middlewares de Express o Koa: cada control es una
// función `(pago, siguiente)` que responde o llama a `siguiente()`. `componer` arma la cadena
// a partir de un array, así que reordenar o quitar controles es editar una lista.

const tarjetasBloqueadas = new Set(['4000000000000002']);
const gastadoHoy = new Map([['cli-1', 900]]);

const listaBloqueo = async (pago, siguiente) =>
  tarjetasBloqueadas.has(pago.tarjeta) ? { aprobado: false, motivo: 'Tarjeta bloqueada' } : siguiente();

const limiteDiario = (limite) => async (pago, siguiente) =>
  (gastadoHoy.get(pago.cliente) ?? 0) + pago.monto > limite
    ? { aprobado: false, motivo: 'Supera el límite diario' }
    : siguiente();

const mismoPais = async (pago, siguiente) =>
  pago.paisTarjeta !== pago.paisConexion ? { aprobado: false, motivo: 'El país de conexión no coincide' } : siguiente();

export function componer(controles) {
  return (pago) => {
    const ejecutar = (i) => (i < controles.length ? controles[i](pago, () => ejecutar(i + 1)) : { aprobado: true });
    return ejecutar(0);
  };
}

// ── Uso ──
const revisarPago = componer([listaBloqueo, limiteDiario(1000), mismoPais]);

const pago = { tarjeta: '4111111111111111', cliente: 'cli-2', monto: 120, paisTarjeta: 'PE', paisConexion: 'PE' };
console.log(await revisarPago(pago));                            // { aprobado: true }
console.log(await revisarPago({ ...pago, cliente: 'cli-1' }));   // límite diario
console.log(await revisarPago({ ...pago, paisConexion: 'RU' })); // país
