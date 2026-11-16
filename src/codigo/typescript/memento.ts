// El estado vive en un campo privado `#` que nadie puede leer desde fuera. El memento expone el
// estado como `Readonly` y `structuredClone` hace la copia profunda al guardar y al restaurar.

type Motor = 'gasolina' | 'hibrido' | 'electrico';
type Caja = 'manual' | 'automatica';

interface EstadoConfig {
  modelo: string;
  motor: Motor;
  caja: Caja;
  accesorios: string[];
  precio: number;
}

export class Memento {
  constructor(readonly estado: Readonly<EstadoConfig>, readonly etiqueta: string) {}
}

export class Configurador {
  #estado: EstadoConfig = { modelo: 'Sedán', motor: 'gasolina', caja: 'manual', accesorios: [], precio: 20000 };

  elegirMotor(motor: Motor): void {
    this.#estado.motor = motor;
    if (motor === 'electrico') this.#estado.caja = 'automatica'; // regla: no hay eléctricos manuales
    this.#recalcular();
  }

  agregarAccesorio(accesorio: string): void {
    this.#estado.accesorios.push(accesorio);
    this.#recalcular();
  }

  guardar(etiqueta: string): Memento {
    return new Memento(structuredClone(this.#estado), etiqueta);
  }

  restaurar(memento: Memento): void {
    this.#estado = structuredClone(memento.estado);
  }

  resumen(): string {
    const e = this.#estado;
    return `${e.modelo} ${e.motor}/${e.caja} [${e.accesorios.join(', ')}] ${e.precio} USD`;
  }

  #recalcular(): void {
    const recargo = { gasolina: 0, hibrido: 4000, electrico: 9000 }[this.#estado.motor];
    this.#estado.precio = 20000 + recargo + this.#estado.accesorios.length * 600;
  }
}

export class Historial {
  readonly #pila: Memento[] = [];
  constructor(private readonly config: Configurador) {}

  guardar(etiqueta: string): void {
    this.#pila.push(this.config.guardar(etiqueta));
  }

  deshacer(): string | undefined {
    const memento = this.#pila.pop();
    if (memento) this.config.restaurar(memento);
    return memento?.etiqueta;
  }
}

// ── Uso ──
const config = new Configurador();
const historial = new Historial(config);

historial.guardar('base');
config.elegirMotor('electrico');
historial.guardar('eléctrico');
config.agregarAccesorio('Techo solar');
console.log(config.resumen()); // Sedán electrico/automatica [Techo solar] 29600 USD

console.log('Volver a:', historial.deshacer());
console.log(config.resumen()); // Sedán electrico/automatica [] 29000 USD
console.log('Volver a:', historial.deshacer());
console.log(config.resumen()); // Sedán gasolina/manual [] 20000 USD
