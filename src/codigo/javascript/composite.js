// Hoja y compuesto tienen los mismos métodos (no hace falta declarar una interfaz). Además, ambos
// implementan `[Symbol.iterator]` con un generador, así que cualquier parte del árbol se puede
// recorrer con `for...of` o con el operador de propagación `[...area]`.

export class Empleado {
  constructor(nombre, sueldo) {
    this.nombre = nombre;
    this.sueldo = sueldo;
  }

  costoMensual() { return this.sueldo; }

  *[Symbol.iterator]() { yield this; }
}

export class Area {
  #miembros = [];

  constructor(nombre) { this.nombre = nombre; }

  agregar(...miembros) {
    this.#miembros.push(...miembros);
    return this;
  }

  costoMensual() {
    return this.#miembros.reduce((total, m) => total + m.costoMensual(), 0);
  }

  *[Symbol.iterator]() {
    for (const miembro of this.#miembros) yield* miembro;
  }
}

// ── Uso ──
const tecnologia = new Area('Tecnología').agregar(
  new Empleado('Ana', 5200),
  new Area('Equipo Pagos').agregar(new Empleado('Luis', 4100), new Empleado('Marta', 3900)),
);

console.log(tecnologia.costoMensual());           // 13200
console.log([...tecnologia].map((p) => p.nombre)); // [ 'Ana', 'Luis', 'Marta' ]
