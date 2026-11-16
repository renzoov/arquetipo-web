// Los campos privados `#` guardan el estado del builder, los métodos devuelven `this` para
// encadenar y el producto se entrega congelado (`Object.freeze`) con propiedades `readonly`.
// Los tipos literales (`Orden`) impiden pasar un criterio de orden que no existe.

type Orden = 'relevancia' | 'precio' | 'descuento' | 'novedad';

export interface Busqueda {
  readonly texto?: string;
  readonly precio?: Readonly<{ min: number; max: number }>;
  readonly soloConStock: boolean;
  readonly orden: Orden;
  readonly pagina: number;
}

export class BusquedaBuilder {
  #texto?: string;
  #precio?: { min: number; max: number };
  #soloConStock = false;
  #orden: Orden = 'relevancia';
  #pagina = 1;

  texto(t: string) { this.#texto = t.trim(); return this; }
  precioEntre(min: number, max: number) { this.#precio = { min, max }; return this; }
  soloConStock() { this.#soloConStock = true; return this; }
  ordenarPor(orden: Orden) { this.#orden = orden; return this; }
  pagina(numero: number) { this.#pagina = numero; return this; }

  build(): Busqueda {
    if (this.#precio && this.#precio.min > this.#precio.max) throw new Error('Rango de precio inválido');
    if (this.#pagina < 1) throw new Error('La página empieza en 1');
    return Object.freeze({
      texto: this.#texto,
      precio: this.#precio && Object.freeze({ ...this.#precio }),
      soloConStock: this.#soloConStock,
      orden: this.#orden,
      pagina: this.#pagina,
    });
  }
}

// Director: recetas que siempre ejecutan los mismos pasos
export const Recetas = {
  ofertasDelDia: () => new BusquedaBuilder().soloConStock().ordenarPor('descuento').build(),
  novedades: (texto: string) => new BusquedaBuilder().texto(texto).ordenarPor('novedad').build(),
};

// ── Uso ──
const busqueda = new BusquedaBuilder()
  .texto('  zapatillas ')
  .precioEntre(50, 120)
  .soloConStock()
  .build();
console.log(busqueda);

console.log(Recetas.ofertasDelDia());

try {
  new BusquedaBuilder().precioEntre(200, 100).build();
} catch (error) {
  console.log((error as Error).message); // Rango de precio inválido
}
