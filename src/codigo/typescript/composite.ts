// Hoja y compuesto comparten una interfaz. El compuesto suma con `reduce` y un generador
// recursivo (`yield*`) permite recorrer todo el árbol sin exponer cómo está guardado.

export interface MiembroOrganizacion {
  readonly nombre: string;
  costoMensual(): number;
  personas(): Generator<Empleado>;
}

export class Empleado implements MiembroOrganizacion {
  constructor(readonly nombre: string, private readonly sueldo: number) {}

  costoMensual(): number { return this.sueldo; }
  *personas(): Generator<Empleado> { yield this; }
}

export class Area implements MiembroOrganizacion {
  readonly #miembros: MiembroOrganizacion[] = [];
  constructor(readonly nombre: string) {}

  agregar(...miembros: MiembroOrganizacion[]): this {
    this.#miembros.push(...miembros);
    return this;
  }

  costoMensual(): number {
    return this.#miembros.reduce((total, m) => total + m.costoMensual(), 0);
  }

  *personas(): Generator<Empleado> {
    for (const m of this.#miembros) yield* m.personas();
  }
}

// ── Uso ──
const tecnologia = new Area('Tecnología').agregar(
  new Empleado('Ana', 5200),
  new Area('Equipo Pagos').agregar(new Empleado('Luis', 4100), new Empleado('Marta', 3900)),
);

console.log(tecnologia.costoMensual());                        // 13200
console.log([...tecnologia.personas()].map((p) => p.nombre));  // [ 'Ana', 'Luis', 'Marta' ]
