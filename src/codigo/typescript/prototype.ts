// El clon se crea con el propio constructor para conservar la clase y sus métodos, y
// `structuredClone` copia en profundidad los datos planos mutables (las coberturas).
// Las cláusulas son `readonly string[]`, así que se pueden compartir sin riesgo.

export interface Cobertura {
  nombre: string;
  sumaAsegurada: number;
  deducible: number;
}

export class Poliza {
  constructor(
    readonly producto: string,
    private coberturas: Cobertura[],
    private readonly clausulas: readonly string[],
  ) {}

  clonar(): Poliza {
    return new Poliza(this.producto, structuredClone(this.coberturas), this.clausulas);
  }

  agregarCobertura(cobertura: Cobertura): this {
    this.coberturas.push(cobertura);
    return this;
  }

  resumen(): string {
    return `${this.producto}: ${this.coberturas.map((c) => c.nombre).join(', ')} (${this.clausulas.length} cláusulas)`;
  }
}

// Registro de prototipos: plantillas configuradas una sola vez
const plantillas = new Map<string, Poliza>([
  ['auto-total', new Poliza(
    'Auto Total',
    [
      { nombre: 'Choque', sumaAsegurada: 30000, deducible: 500 },
      { nombre: 'Robo', sumaAsegurada: 30000, deducible: 800 },
    ],
    ['Vigencia anual', 'Cobertura nacional'],
  )],
]);

export function cotizar(clave: string): Poliza {
  const plantilla = plantillas.get(clave);
  if (!plantilla) throw new Error(`No existe la plantilla ${clave}`);
  return plantilla.clonar();
}

// ── Uso ──
const poliza = cotizar('auto-total')
  .agregarCobertura({ nombre: 'Auto de reemplazo', sumaAsegurada: 1500, deducible: 0 });

console.log(poliza.resumen());
// Auto Total: Choque, Robo, Auto de reemplazo (2 cláusulas)
console.log(plantillas.get('auto-total')!.resumen());
// Auto Total: Choque, Robo (2 cláusulas)  ← la plantilla no cambió
