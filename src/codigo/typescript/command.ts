// Los comandos implementan una interfaz con métodos `async` y una descripción para la auditoría.
// El historial es un array usado como pila, y `?.` evita comprobar si está vacío al deshacer.

interface Producto {
  id: string;
  categoria: string;
  precio: number;
  activo: boolean;
}

class RepoProductos {
  readonly #productos = new Map<string, Producto>([
    ['teclado', { id: 'teclado', categoria: 'perifericos', precio: 100, activo: true }],
    ['mouse', { id: 'mouse', categoria: 'perifericos', precio: 40, activo: true }],
    ['monitor', { id: 'monitor', categoria: 'pantallas', precio: 900, activo: true }],
  ]);

  async deCategoria(categoria: string): Promise<Producto[]> {
    return [...this.#productos.values()].filter((p) => p.categoria === categoria);
  }

  async actualizar(id: string, cambios: Partial<Producto>): Promise<void> {
    const producto = this.#productos.get(id);
    if (producto) Object.assign(producto, cambios);
  }

  listar(): string[] {
    return [...this.#productos.values()].map((p) => `${p.id} ${p.precio}${p.activo ? '' : ' (inactivo)'}`);
  }
}

export interface Comando {
  readonly descripcion: string;
  ejecutar(): Promise<void>;
  deshacer(): Promise<void>;
}

class AjustarPrecios implements Comando {
  readonly #anteriores = new Map<string, number>();
  constructor(private readonly repo: RepoProductos, private readonly categoria: string, private readonly factor: number) {}

  get descripcion() { return `Ajustar precios de ${this.categoria} ×${this.factor}`; }

  async ejecutar() {
    for (const p of await this.repo.deCategoria(this.categoria)) {
      this.#anteriores.set(p.id, p.precio);
      await this.repo.actualizar(p.id, { precio: Math.round(p.precio * this.factor * 100) / 100 });
    }
  }

  async deshacer() {
    for (const [id, precio] of this.#anteriores) await this.repo.actualizar(id, { precio });
  }
}

class DesactivarProducto implements Comando {
  constructor(private readonly repo: RepoProductos, private readonly id: string) {}

  get descripcion() { return `Desactivar ${this.id}`; }
  async ejecutar() { await this.repo.actualizar(this.id, { activo: false }); }
  async deshacer() { await this.repo.actualizar(this.id, { activo: true }); }
}

export class Invocador {
  readonly #historial: Comando[] = [];

  async ejecutar(comando: Comando, usuario: string): Promise<void> {
    await comando.ejecutar();
    this.#historial.push(comando);
    console.log(`[auditoría] ${usuario}: ${comando.descripcion}`);
  }

  async deshacerUltimo(): Promise<void> {
    await this.#historial.pop()?.deshacer();
  }
}

// ── Uso ──
const repo = new RepoProductos();
const panel = new Invocador();

await panel.ejecutar(new AjustarPrecios(repo, 'perifericos', 1.1), 'ana');
await panel.ejecutar(new DesactivarProducto(repo, 'monitor'), 'ana');
console.log(repo.listar()); // [ 'teclado 110', 'mouse 44', 'monitor 900 (inactivo)' ]

await panel.deshacerUltimo();
await panel.deshacerUltimo();
console.log(repo.listar()); // [ 'teclado 100', 'mouse 40', 'monitor 900' ]
