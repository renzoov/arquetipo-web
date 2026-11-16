// JavaScript no tiene clases abstractas: el método fábrica de la clase base lanza un error claro si
// una subclase olvida sobrescribirlo. Los lectores no declaran ninguna interfaz; basta con que
// tengan un método `leer` (duck typing), así que pueden ser simples objetos literales.

/**
 * @typedef {{ fecha: string, referencia: string, monto: number }} Movimiento
 * @typedef {{ leer(contenido: string): Movimiento[] }} LectorExtracto
 */

/** @type {LectorExtracto} */
const lectorCsvAndino = {
  leer: (contenido) => contenido.trim().split('\n').map((linea) => {
    const [fecha, referencia, monto] = linea.split(';');
    return { fecha, referencia, monto: Number(monto) };
  }),
};

/** @type {LectorExtracto} */
const lectorTxtPacifico = {
  // Ancho fijo: fecha (10) + referencia (8) + monto (resto)
  leer: (contenido) => contenido.trim().split('\n').map((linea) => ({
    fecha: linea.slice(0, 10),
    referencia: linea.slice(10, 18).trim(),
    monto: Number(linea.slice(18)),
  })),
};

export class Conciliador {
  /**
   * Método fábrica: las subclases deciden qué lector usar
   * @returns {LectorExtracto}
   */
  crearLector() {
    throw new Error(`${this.constructor.name} debe implementar crearLector()`);
  }

  /** @param {string} contenido @param {Map<string, number>} ventas */
  conciliar(contenido, ventas) {
    const diferencias = [];
    for (const mov of this.crearLector().leer(contenido)) {
      const esperado = ventas.get(mov.referencia);
      if (esperado !== mov.monto) {
        diferencias.push(`${mov.referencia}: banco ${mov.monto}, ventas ${esperado ?? 'sin registro'}`);
      }
    }
    return diferencias;
  }
}

export class ConciliadorBancoAndino extends Conciliador {
  crearLector() { return lectorCsvAndino; }
}

export class ConciliadorBancoPacifico extends Conciliador {
  crearLector() { return lectorTxtPacifico; }
}

// ── Uso ──
const ventas = new Map([['F-001', 150], ['F-002', 80]]);

console.log(new ConciliadorBancoAndino().conciliar('2026-11-01;F-001;150\n2026-11-01;F-002;75', ventas));
// [ 'F-002: banco 75, ventas 80' ]
console.log(new ConciliadorBancoPacifico().conciliar('2026-11-01F-001   150\n2026-11-02F-003   40', ventas));
// [ 'F-003: banco 40, ventas sin registro' ]

class ConciliadorIncompleto extends Conciliador {}
try {
  new ConciliadorIncompleto().conciliar('', ventas);
} catch (error) {
  console.log(error.message); // ConciliadorIncompleto debe implementar crearLector()
}
