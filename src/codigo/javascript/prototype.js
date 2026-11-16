// JavaScript ya trabaja con prototipos: `Object.create(Object.getPrototypeOf(this))` crea un objeto
// de la misma clase sin llamar al constructor. Ojo: debe ser el prototipo de la clase, no `this`;
// con `Object.create(this)` el clon heredaría del original. `structuredClone` copia en profundidad.

export class Poliza {
  constructor(producto, coberturas, clausulas) {
    this.producto = producto;
    this.coberturas = coberturas;
    this.clausulas = Object.freeze([...clausulas]); // inmutable: se puede compartir entre clones
  }

  clonar() {
    const copia = Object.create(Object.getPrototypeOf(this)); // misma clase, mismos métodos
    return Object.assign(copia, {
      producto: this.producto,
      coberturas: structuredClone(this.coberturas), // copia profunda de lo mutable
      clausulas: this.clausulas,
    });
  }

  agregarCobertura(cobertura) {
    this.coberturas.push(cobertura);
    return this;
  }

  resumen() {
    return `${this.producto}: ${this.coberturas.map((c) => c.nombre).join(', ')} (${this.clausulas.length} cláusulas)`;
  }
}

// Registro de prototipos: plantillas configuradas una sola vez
const plantillas = new Map([
  ['auto-total', new Poliza(
    'Auto Total',
    [{ nombre: 'Choque', sumaAsegurada: 30000, deducible: 500 }, { nombre: 'Robo', sumaAsegurada: 30000, deducible: 800 }],
    ['Vigencia anual', 'Cobertura nacional'],
  )],
]);

export function cotizar(clave) {
  const plantilla = plantillas.get(clave);
  if (!plantilla) throw new Error(`No existe la plantilla ${clave}`);
  return plantilla.clonar();
}

// ── Uso ──
const poliza = cotizar('auto-total').agregarCobertura({ nombre: 'Auto de reemplazo', sumaAsegurada: 1500, deducible: 0 });

console.log(poliza.resumen());                         // Auto Total: Choque, Robo, Auto de reemplazo (2 cláusulas)
console.log(plantillas.get('auto-total').resumen());   // Auto Total: Choque, Robo (2 cláusulas)
console.log(poliza instanceof Poliza);                 // true
