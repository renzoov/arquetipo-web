// Cada eslabón implementa `detectar` de forma asíncrona y devuelve `string | null`. El resultado es
// una unión discriminada: si `aprobado` es false, el compilador sabe que existe `motivo`.
// La cadena se arma encadenando `enlazar`, que devuelve el eslabón añadido.

export interface Pago {
  tarjeta: string;
  cliente: string;
  monto: number;
  paisTarjeta: string;
  paisConexion: string;
}

export type Resultado = { aprobado: true } | { aprobado: false; motivo: string };

export abstract class ControlFraude {
  #siguiente?: ControlFraude;

  enlazar(siguiente: ControlFraude): ControlFraude {
    this.#siguiente = siguiente;
    return siguiente;
  }

  async revisar(pago: Pago): Promise<Resultado> {
    const motivo = await this.detectar(pago);
    if (motivo) return { aprobado: false, motivo };                       // corta la cadena
    return this.#siguiente ? this.#siguiente.revisar(pago) : { aprobado: true };
  }

  protected abstract detectar(pago: Pago): Promise<string | null>;
}

const tarjetasBloqueadas = new Set(['4000000000000002']);
const gastadoHoy = new Map([['cli-1', 900]]);

class ControlListaBloqueo extends ControlFraude {
  protected async detectar(pago: Pago) {
    return tarjetasBloqueadas.has(pago.tarjeta) ? 'Tarjeta bloqueada' : null;
  }
}

class ControlLimiteDiario extends ControlFraude {
  constructor(private readonly limite: number) { super(); }
  protected async detectar(pago: Pago) {
    const total = (gastadoHoy.get(pago.cliente) ?? 0) + pago.monto;
    return total > this.limite ? 'Supera el límite diario' : null;
  }
}

class ControlPais extends ControlFraude {
  protected async detectar(pago: Pago) {
    return pago.paisTarjeta !== pago.paisConexion ? 'El país de conexión no coincide' : null;
  }
}

// ── Uso ──
const cadena = new ControlListaBloqueo();
cadena.enlazar(new ControlLimiteDiario(1000)).enlazar(new ControlPais());

const pago: Pago = { tarjeta: '4111111111111111', cliente: 'cli-2', monto: 120, paisTarjeta: 'PE', paisConexion: 'PE' };
console.log(await cadena.revisar(pago));                            // { aprobado: true }
console.log(await cadena.revisar({ ...pago, cliente: 'cli-1' }));   // límite diario
console.log(await cadena.revisar({ ...pago, paisConexion: 'RU' })); // país
