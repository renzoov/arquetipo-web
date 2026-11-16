// El mediador extiende `EventTarget`, la misma API de eventos del navegador (también disponible en
// Node). Los componentes solo emiten eventos hacia el panel con `dispatchEvent`; el panel escucha
// y decide qué actualizar. Ningún componente conoce a otro.

const catalogo = { laptops: ['Premium', 'Económica'], celulares: ['Premium'] };

class Componente {
  constructor(panel) { this.panel = panel; }
  avisar(tipo = 'cambio') {
    this.panel.dispatchEvent(new CustomEvent(tipo, { detail: this }));
  }
}

class SelectorCategoria extends Componente {
  valor = '';
  elegir(categoria) { this.valor = categoria; this.avisar(); }
}

class SelectorMarca extends Componente {
  opciones = [];
  valor = '';
  elegir(marca) { this.valor = marca; this.avisar(); }
}

class RangoPrecio extends Componente {
  min = 0;
  max = Infinity;
}

export class PanelFiltros extends EventTarget {
  constructor() {
    super();
    this.categoria = new SelectorCategoria(this);
    this.marca = new SelectorMarca(this);
    this.precio = new RangoPrecio(this);
    this.resultados = '';

    this.addEventListener('cambio', (evento) => {
      const origen = /** @type {CustomEvent} */ (evento).detail;
      if (origen === this.categoria) {
        this.marca.opciones = catalogo[this.categoria.valor] ?? [];
        this.marca.valor = '';
        [this.precio.min, this.precio.max] = [0, Infinity];
      } else if (origen === this.marca) {
        [this.precio.min, this.precio.max] = this.marca.valor === 'Premium' ? [500, 3000] : [0, 800];
      }
      this.#actualizarResultados();
    });

    this.addEventListener('limpiar', () => {
      this.categoria.valor = '';
      this.marca.valor = '';
      this.marca.opciones = [];
      [this.precio.min, this.precio.max] = [0, Infinity];
      this.#actualizarResultados();
    });
  }

  limpiar() { this.dispatchEvent(new Event('limpiar')); }

  #actualizarResultados() {
    const total = !this.categoria.valor ? 120 : this.marca.valor ? 8 : 25;
    this.resultados = `${total} resultados`;
  }
}

// ── Uso ──
const panel = new PanelFiltros();

panel.categoria.elegir('laptops');
console.log(panel.marca.opciones, panel.resultados);                 // [ 'Premium', 'Económica' ] 25 resultados

panel.marca.elegir('Premium');
console.log(panel.precio.min, panel.precio.max, panel.resultados);   // 500 3000 8 resultados

panel.limpiar();
console.log(panel.resultados);                                       // 120 resultados
