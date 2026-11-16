// Un módulo ES se evalúa una sola vez, así que exportar una instancia (`export const config = ...`)
// ya funciona como singleton. La clase con constructor privado y un campo estático privado `#`
// se usa cuando la creación debe ser perezosa. `??=` crea la instancia solo la primera vez.

export class Configuracion {
  static #instancia?: Configuracion;
  readonly #flags: ReadonlyMap<string, boolean>;

  private constructor() {
    console.log('Cargando configuración (solo ocurre una vez)...');
    this.#flags = new Map([
      ['pagos.billetera', true],
      ['envios.express', false],
    ]);
  }

  static obtener(): Configuracion {
    return (Configuracion.#instancia ??= new Configuracion());
  }

  estaActiva(flag: string): boolean {
    return this.#flags.get(flag) ?? false;
  }
}

// ── Uso ──
const desdePagos = Configuracion.obtener();
const desdeEnvios = Configuracion.obtener();

console.log(desdePagos === desdeEnvios);              // true
console.log(desdePagos.estaActiva('pagos.billetera')); // true
console.log(desdeEnvios.estaActiva('envios.express')); // false
// new Configuracion();  ← error de compilación: el constructor es privado
