// Cada elemento de la gramática es una clase que implementa `Expresion`; los no terminales
// guardan sus subexpresiones con parameter properties. Una alternativa muy habitual en
// TypeScript es modelar el árbol como unión discriminada y evaluarlo con un `switch`.

export interface Carrito {
  total: number;
  clienteFrecuente: boolean;
  cupon?: string;
}

export interface Expresion {
  interpretar(carrito: Carrito): boolean;
  describir(): string;
}

export class TotalMayorQue implements Expresion {
  constructor(private readonly limite: number) {}
  interpretar(carrito: Carrito) { return carrito.total > this.limite; }
  describir() { return `total > ${this.limite}`; }
}

export class EsClienteFrecuente implements Expresion {
  interpretar(carrito: Carrito) { return carrito.clienteFrecuente; }
  describir() { return 'cliente_frecuente'; }
}

export class CuponIgual implements Expresion {
  constructor(private readonly codigo: string) {}
  interpretar(carrito: Carrito) { return carrito.cupon === this.codigo; }
  describir() { return `cupon = "${this.codigo}"`; }
}

export class Y implements Expresion {
  constructor(private readonly izquierda: Expresion, private readonly derecha: Expresion) {}
  interpretar(carrito: Carrito) { return this.izquierda.interpretar(carrito) && this.derecha.interpretar(carrito); }
  describir() { return `(${this.izquierda.describir()} Y ${this.derecha.describir()})`; }
}

export class O implements Expresion {
  constructor(private readonly izquierda: Expresion, private readonly derecha: Expresion) {}
  interpretar(carrito: Carrito) { return this.izquierda.interpretar(carrito) || this.derecha.interpretar(carrito); }
  describir() { return `(${this.izquierda.describir()} O ${this.derecha.describir()})`; }
}

// ── Uso ──
// Árbol de la regla: total > 100 Y cliente_frecuente O cupon = "VERANO"
// (en la aplicación real lo construiría un parser a partir del texto)
const regla = new O(new Y(new TotalMayorQue(100), new EsClienteFrecuente()), new CuponIgual('VERANO'));

console.log(regla.describir());
console.log(regla.interpretar({ total: 150, clienteFrecuente: true }));                  // true
console.log(regla.interpretar({ total: 150, clienteFrecuente: false }));                 // false
console.log(regla.interpretar({ total: 20, clienteFrecuente: false, cupon: 'VERANO' })); // true
