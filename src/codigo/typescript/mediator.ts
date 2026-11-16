// Los eventos se tipan con una unión de literales (`'cambio' | 'limpiar'`), y `?.` permite que un
// componente avise aunque todavía no tenga mediador. Solo el mediador conoce a todos.

type Evento = 'cambio' | 'limpiar';

const catalogo: Record<string, string[]> = {
  laptops: ['Premium', 'Económica'],
  celulares: ['Premium'],
};

export interface Mediador {
  notificar(origen: Componente, evento: Evento): void;
}

abstract class Componente {
  mediador?: Mediador;
  protected avisar(evento: Evento = 'cambio') {
    this.mediador?.notificar(this, evento);
  }
}

class SelectorCategoria extends Componente {
  valor = '';
  elegir(categoria: string) { this.valor = categoria; this.avisar(); }
  reiniciar() { this.valor = ''; }
}

class SelectorMarca extends Componente {
  opciones: string[] = [];
  valor = '';
  cargarMarcas(categoria: string) { this.opciones = catalogo[categoria] ?? []; this.valor = ''; }
  elegir(marca: string) { this.valor = marca; this.avisar(); }
  reiniciar() { this.opciones = []; this.valor = ''; }
}

class RangoPrecio extends Componente {
  min = 0;
  max = Infinity;
  ajustarA(marca: string) { [this.min, this.max] = marca === 'Premium' ? [500, 3000] : [0, 800]; }
  reiniciar() { this.min = 0; this.max = Infinity; }
}

class ContadorResultados extends Componente {
  texto = '';
  actualizar(total: number) { this.texto = `${total} resultados`; }
}

class BotonLimpiar extends Componente {
  pulsar() { this.avisar('limpiar'); }
}

export class PanelFiltros implements Mediador {
  constructor(
    readonly categoria = new SelectorCategoria(),
    readonly marca = new SelectorMarca(),
    readonly precio = new RangoPrecio(),
    readonly contador = new ContadorResultados(),
    readonly limpiar = new BotonLimpiar(),
  ) {
    for (const c of [categoria, marca, precio, contador, limpiar]) c.mediador = this;
  }

  notificar(origen: Componente, evento: Evento): void {
    if (evento === 'limpiar') {
      this.categoria.reiniciar();
      this.marca.reiniciar();
      this.precio.reiniciar();
    } else if (origen === this.categoria) {
      this.marca.cargarMarcas(this.categoria.valor);
      this.precio.reiniciar();
    } else if (origen === this.marca) {
      this.precio.ajustarA(this.marca.valor);
    }
    this.contador.actualizar(this.#contarResultados());
  }

  #contarResultados(): number {
    if (!this.categoria.valor) return 120;
    return this.marca.valor ? 8 : 25;
  }
}

// ── Uso ──
const panel = new PanelFiltros();

panel.categoria.elegir('laptops');
console.log(panel.marca.opciones, panel.contador.texto);    // [ 'Premium', 'Económica' ] 25 resultados

panel.marca.elegir('Premium');
console.log(panel.precio.min, panel.precio.max, panel.contador.texto); // 500 3000 8 resultados

panel.limpiar.pulsar();
console.log(panel.contador.texto);                          // 120 resultados
