// La clase abstracta declara el método fábrica como `protected abstract`: el compilador obliga a
// cada subclase a implementarlo. Gracias al tipado estructural, un lector solo necesita cumplir
// la forma de `LectorExtracto`.

export interface Movimiento {
  fecha: string;
  referencia: string;
  monto: number;
}

export interface LectorExtracto {
  leer(contenido: string): Movimiento[];
}

class LectorCsvAndino implements LectorExtracto {
  leer(contenido: string): Movimiento[] {
    return contenido.trim().split('\n').map((linea) => {
      const [fecha, referencia, monto] = linea.split(';');
      return { fecha, referencia, monto: Number(monto) };
    });
  }
}

class LectorTxtPacifico implements LectorExtracto {
  // Ancho fijo: fecha (10) + referencia (8) + monto (resto)
  leer(contenido: string): Movimiento[] {
    return contenido.trim().split('\n').map((linea) => ({
      fecha: linea.slice(0, 10),
      referencia: linea.slice(10, 18).trim(),
      monto: Number(linea.slice(18)),
    }));
  }
}

export abstract class Conciliador {
  // Método fábrica: cada subclase decide qué lector crear
  protected abstract crearLector(): LectorExtracto;

  conciliar(contenido: string, ventas: Map<string, number>): string[] {
    const diferencias: string[] = [];
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
  protected crearLector() { return new LectorCsvAndino(); }
}

export class ConciliadorBancoPacifico extends Conciliador {
  protected crearLector() { return new LectorTxtPacifico(); }
}

// ── Uso ──
const ventas = new Map([['F-001', 150], ['F-002', 80]]);

const csvAndino = '2026-11-01;F-001;150\n2026-11-01;F-002;75';
console.log(new ConciliadorBancoAndino().conciliar(csvAndino, ventas));
// [ 'F-002: banco 75, ventas 80' ]

const txtPacifico = '2026-11-01F-001   150\n2026-11-02F-003   40';
console.log(new ConciliadorBancoPacifico().conciliar(txtPacifico, ventas));
// [ 'F-003: banco 40, ventas sin registro' ]
