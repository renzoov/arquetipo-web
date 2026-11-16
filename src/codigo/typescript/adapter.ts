// El adaptador implementa la interfaz propia y traduce los tipos del proveedor. Una unión
// discriminada (`ResultadoPago`) reemplaza los códigos numéricos: el compilador obliga a
// quien la usa a tratar cada caso.

export interface Tarjeta {
  numero: string;
  vencimiento: string;
}

export type ResultadoPago =
  | { estado: 'aprobado'; operacion: string }
  | { estado: 'rechazado'; motivo: string }
  | { estado: 'reintentar' };

export interface PasarelaPago {
  cobrar(monto: number, tarjeta: Tarjeta): Promise<ResultadoPago>;
}

// SDK de un tercero: no se puede modificar
class SdkPagoLocal {
  async tokenizar(tarjeta: Tarjeta): Promise<string> {
    return `tok_${tarjeta.numero.slice(-4)}`;
  }
  async crearTransaccion(datos: { importeCentimos: number; token: string }): Promise<{ codigo: string; id: string }> {
    return { codigo: datos.importeCentimos > 100_000 ? '05' : '00', id: `TX-${datos.token}` };
  }
}

export class AdaptadorPagoLocal implements PasarelaPago {
  constructor(private readonly sdk: SdkPagoLocal) {}

  async cobrar(monto: number, tarjeta: Tarjeta): Promise<ResultadoPago> {
    const token = await this.sdk.tokenizar(tarjeta);
    const r = await this.sdk.crearTransaccion({ importeCentimos: Math.round(monto * 100), token });
    switch (r.codigo) {
      case '00': return { estado: 'aprobado', operacion: r.id };
      case '91': return { estado: 'reintentar' };
      default: return { estado: 'rechazado', motivo: `Código del proveedor ${r.codigo}` };
    }
  }
}

// ── Uso: el checkout solo conoce PasarelaPago ──
const pasarela: PasarelaPago = new AdaptadorPagoLocal(new SdkPagoLocal());
const tarjeta = { numero: '4111111111111111', vencimiento: '12/28' };

console.log(await pasarela.cobrar(250, tarjeta));
// { estado: 'aprobado', operacion: 'TX-tok_1111' }
console.log(await pasarela.cobrar(1500, tarjeta));
// { estado: 'rechazado', motivo: 'Código del proveedor 05' }
