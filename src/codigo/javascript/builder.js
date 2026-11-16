// Campos privados `#` para el estado del builder, métodos que devuelven `this` para encadenar y
// un producto congelado con `Object.freeze`. Sin tipos, la validación de `build()` es la única
// defensa: por eso también comprueba que el orden sea uno de los permitidos.

const ORDENES = new Set(['relevancia', 'precio', 'descuento', 'novedad']);

export class BusquedaBuilder {
  #texto;
  #precio;
  #soloConStock = false;
  #orden = 'relevancia';
  #pagina = 1;

  texto(t) { this.#texto = t.trim(); return this; }
  precioEntre(min, max) { this.#precio = { min, max }; return this; }
  soloConStock() { this.#soloConStock = true; return this; }
  ordenarPor(orden) { this.#orden = orden; return this; }
  pagina(numero) { this.#pagina = numero; return this; }

  build() {
    if (this.#precio && this.#precio.min > this.#precio.max) throw new Error('Rango de precio inválido');
    if (!ORDENES.has(this.#orden)) throw new Error(`Orden desconocido: ${this.#orden}`);
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
export const recetas = {
  ofertasDelDia: () => new BusquedaBuilder().soloConStock().ordenarPor('descuento').build(),
  novedades: (texto) => new BusquedaBuilder().texto(texto).ordenarPor('novedad').build(),
};

// ── Uso ──
const busqueda = new BusquedaBuilder().texto('  zapatillas ').precioEntre(50, 120).soloConStock().build();
console.log(busqueda);
console.log(Object.isFrozen(busqueda)); // true: nadie puede modificarla

console.log(recetas.novedades('auriculares').orden); // novedad

try {
  new BusquedaBuilder().ordenarPor('popularidad').build();
} catch (error) {
  console.log(error.message); // Orden desconocido: popularidad
}
