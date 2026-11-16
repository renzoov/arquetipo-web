// La implementación (el renderizador) se crea con funciones fábrica que guardan su estado en una
// closure; la abstracción (el reporte) es una jerarquía de clases que lo recibe por constructor.
// Basta con que el renderizador tenga `titulo`, `tabla` y `generar` (duck typing).

function crearRenderizadorMarkdown() {
  const lineas = [];
  return {
    titulo: (texto) => lineas.push(`# ${texto}`),
    tabla: (filas) => {
      const columnas = Object.keys(filas[0] ?? {});
      lineas.push(`| ${columnas.join(' | ')} |`, ...filas.map((f) => `| ${columnas.map((c) => f[c]).join(' | ')} |`));
    },
    generar: () => lineas.join('\n'),
  };
}

function crearRenderizadorCsv() {
  const lineas = [];
  return {
    titulo: () => {}, // un CSV no tiene título
    tabla: (filas) => {
      const columnas = Object.keys(filas[0] ?? {});
      lineas.push(columnas.join(','), ...filas.map((f) => columnas.map((c) => f[c]).join(',')));
    },
    generar: () => lineas.join('\n'),
  };
}

class Reporte {
  constructor(salida) {
    this.salida = salida; // el "puente" hacia la implementación
  }
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
console.log(new ReporteVentas(crearRenderizadorMarkdown()).exportar());
console.log(new ReporteInventario(crearRenderizadorCsv()).exportar());
