// La "implementación" es una interfaz y la "abstracción" una clase abstracta que la recibe por
// constructor con `protected readonly` (parameter properties). Para que el ejemplo se pueda
// ejecutar, los formatos son Markdown y CSV; en producción serían PDF o Excel.

export type Fila = Record<string, string | number>;

export interface Renderizador {
  titulo(texto: string): void;
  tabla(filas: Fila[]): void;
  generar(): string;
}

class RenderizadorMarkdown implements Renderizador {
  #lineas: string[] = [];
  titulo(texto: string) { this.#lineas.push(`# ${texto}`); }
  tabla(filas: Fila[]) {
    const columnas = Object.keys(filas[0] ?? {});
    this.#lineas.push(
      `| ${columnas.join(' | ')} |`,
      ...filas.map((f) => `| ${columnas.map((c) => f[c]).join(' | ')} |`),
    );
  }
  generar() { return this.#lineas.join('\n'); }
}

class RenderizadorCsv implements Renderizador {
  #lineas: string[] = [];
  titulo() { /* un CSV no tiene título */ }
  tabla(filas: Fila[]) {
    const columnas = Object.keys(filas[0] ?? {});
    this.#lineas.push(columnas.join(','), ...filas.map((f) => columnas.map((c) => f[c]).join(',')));
  }
  generar() { return this.#lineas.join('\n'); }
}

export abstract class Reporte {
  constructor(protected readonly salida: Renderizador) {}
  abstract exportar(): string;
}

export class ReporteVentas extends Reporte {
  exportar() {
    this.salida.titulo('Ventas de noviembre');
    this.salida.tabla([{ producto: 'Teclado', unidades: 12 }, { producto: 'Monitor', unidades: 4 }]);
    return this.salida.generar();
  }
}

export class ReporteInventario extends Reporte {
  exportar() {
    this.salida.titulo('Inventario');
    this.salida.tabla([{ sku: 'TEC-01', stock: 30 }, { sku: 'MON-02', stock: 0 }]);
    return this.salida.generar();
  }
}

// ── Uso: cualquier reporte con cualquier formato ──
console.log(new ReporteVentas(new RenderizadorMarkdown()).exportar());
console.log(new ReporteInventario(new RenderizadorCsv()).exportar());
