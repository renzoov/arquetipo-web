// El adaptador es una función que recibe el SDK y devuelve un objeto con la forma que espera tu
// código (`cobrar`). Las closures guardan el SDK sin necesidad de clases, y un objeto literal
// traduce los códigos del proveedor.

// SDK de un tercero: no se puede modificar
const sdkPagoLocal = {
  async tokenizar(tarjeta) {
    return `tok_${tarjeta.numero.slice(-4)}`;
  },
  async crearTransaccion({ importeCentimos, token }) {
    return { codigo: importeCentimos > 100_000 ? '05' : '00', id: `TX-${token}` };
  },
};

const CODIGOS = {
  '00': (r) => ({ estado: 'aprobado', operacion: r.id }),
  '91': () => ({ estado: 'reintentar' }),
};

export function crearAdaptadorPagoLocal(sdk) {
  return {
    async cobrar(monto, tarjeta) {
      const token = await sdk.tokenizar(tarjeta);
      const respuesta = await sdk.crearTransaccion({ importeCentimos: Math.round(monto * 100), token });
      const traducir = CODIGOS[respuesta.codigo] ?? (() => ({ estado: 'rechazado', motivo: `Código del proveedor ${respuesta.codigo}` }));
      return traducir(respuesta);
    },
  };
}

// ── Uso: el checkout solo sabe que la pasarela tiene un método cobrar ──
const pasarela = crearAdaptadorPagoLocal(sdkPagoLocal);
const tarjeta = { numero: '4111111111111111', vencimiento: '12/28' };

console.log(await pasarela.cobrar(250, tarjeta));  // { estado: 'aprobado', operacion: 'TX-tok_1111' }
console.log(await pasarela.cobrar(1500, tarjeta)); // { estado: 'rechazado', motivo: 'Código del proveedor 05' }
