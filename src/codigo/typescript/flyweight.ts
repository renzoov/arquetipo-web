// El flyweight es un objeto congelado con `Object.freeze` y tipado como `Readonly<...>`, así que
// nadie puede modificar un formato compartido. La fábrica usa un `Map` con una clave compuesta.

export type Formato = Readonly<{
  fuente: string;
  tamano: number;
  color: string;
  formatoNumero: string;
}>;

export class FabricaFormatos {
  readonly #cache = new Map<string, Formato>();

  obtener(datos: Formato): Formato {
    const clave = `${datos.fuente}|${datos.tamano}|${datos.color}|${datos.formatoNumero}`;
    let formato = this.#cache.get(clave);
    if (!formato) {
      formato = Object.freeze({ ...datos });
      this.#cache.set(clave, formato);
    }
    return formato;
  }

  get total(): number {
    return this.#cache.size;
  }
}

export class Celda {
  constructor(
    readonly fila: number,
    readonly columna: number,
    public valor: string,
    public formato: Formato, // referencia a un objeto compartido
  ) {}
}

// ── Uso: 100 000 celdas ──
const fabrica = new FabricaFormatos();
const celdas: Celda[] = [];

for (let fila = 0; fila < 1000; fila++) {
  for (let columna = 0; columna < 100; columna++) {
    const formato = fabrica.obtener({
      fuente: 'Inter',
      tamano: 11,
      color: fila === 0 ? '#000000' : '#333333',      // encabezado o datos
      formatoNumero: columna === 0 ? '@' : '#,##0.00', // texto o monto
    });
    celdas.push(new Celda(fila, columna, '', formato));
  }
}

console.log(`${celdas.length} celdas comparten ${fabrica.total} formatos`);
// 100000 celdas comparten 4 formatos
console.log(celdas[1]!.formato === celdas[2]!.formato); // true: es el mismo objeto
