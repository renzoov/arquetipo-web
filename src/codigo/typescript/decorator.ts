// Cada decorador es una clase pequeña que implementa la misma interfaz y recibe al envuelto por
// constructor. Ojo: no confundir con los decoradores `@` de TypeScript, que son otra cosa
// (anotaciones sobre clases y métodos).

export interface FuenteTiposCambio {
  obtener(moneda: string): Promise<number>;
}

class ApiTiposCambio implements FuenteTiposCambio {
  #llamadas = 0;
  async obtener(moneda: string): Promise<number> {
    this.#llamadas++;
    if (this.#llamadas === 1) throw new Error('Tiempo de espera agotado'); // el proveedor falla a veces
    return moneda === 'USD' ? 3.75 : 4.05;
  }
}

class ConReintentos implements FuenteTiposCambio {
  constructor(private readonly interno: FuenteTiposCambio, private readonly intentos = 3) {}

  async obtener(moneda: string): Promise<number> {
    for (let intento = 1; ; intento++) {
      try {
        return await this.interno.obtener(moneda);
      } catch (error) {
        if (intento >= this.intentos) throw error;
        console.log(`  reintento ${intento}...`);
      }
    }
  }
}

class ConCache implements FuenteTiposCambio {
  readonly #cache = new Map<string, { valor: number; expira: number }>();
  constructor(private readonly interno: FuenteTiposCambio, private readonly ttlMs = 5 * 60_000) {}

  async obtener(moneda: string): Promise<number> {
    const guardado = this.#cache.get(moneda);
    if (guardado && guardado.expira > Date.now()) return guardado.valor;
    const valor = await this.interno.obtener(moneda);
    this.#cache.set(moneda, { valor, expira: Date.now() + this.ttlMs });
    return valor;
  }
}

class ConLog implements FuenteTiposCambio {
  constructor(private readonly interno: FuenteTiposCambio) {}

  async obtener(moneda: string): Promise<number> {
    console.log(`→ consultando ${moneda}`);
    return this.interno.obtener(moneda);
  }
}

// ── Uso ──
// El orden importa: la caché va por fuera para no registrar ni reintentar lo que ya está guardado.
const fuente = new ConCache(new ConLog(new ConReintentos(new ApiTiposCambio())));

console.log(await fuente.obtener('USD')); // → consultando USD, reintento 1..., 3.75
console.log(await fuente.obtener('USD')); // 3.75 (desde la caché, sin llamar a la API)
