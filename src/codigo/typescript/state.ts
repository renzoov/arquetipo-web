// Cada estado es una clase. Una clase base abstracta rechaza por defecto todas las acciones
// (el método privado devuelve `never` porque siempre lanza un error), y cada estado solo
// sobrescribe lo que permite. El nombre del estado es un tipo literal.

type NombreEstado = 'pendiente' | 'pagado' | 'enviado' | 'cancelado';

export interface EstadoPedido {
  readonly nombre: NombreEstado;
  pagar(pedido: Pedido): void;
  enviar(pedido: Pedido): void;
  cancelar(pedido: Pedido): void;
}

abstract class EstadoBase implements EstadoPedido {
  abstract readonly nombre: NombreEstado;
  pagar(_pedido: Pedido): void { this.#prohibido('pagar'); }
  enviar(_pedido: Pedido): void { this.#prohibido('enviar'); }
  cancelar(_pedido: Pedido): void { this.#prohibido('cancelar'); }

  #prohibido(accion: string): never {
    throw new Error(`No se puede ${accion} un pedido ${this.nombre}`);
  }
}

class Pendiente extends EstadoBase {
  readonly nombre = 'pendiente';
  pagar(pedido: Pedido) { pedido.cambiarEstado(new Pagado()); }
  cancelar(pedido: Pedido) { pedido.cambiarEstado(new Cancelado()); }
}

class Pagado extends EstadoBase {
  readonly nombre = 'pagado';
  enviar(pedido: Pedido) { pedido.cambiarEstado(new Enviado()); }
  cancelar(pedido: Pedido) {
    console.log(`  reembolso del pedido ${pedido.id}`);
    pedido.cambiarEstado(new Cancelado());
  }
}

class Enviado extends EstadoBase {
  readonly nombre = 'enviado';
}

class Cancelado extends EstadoBase {
  readonly nombre = 'cancelado';
}

export class Pedido {
  #estado: EstadoPedido = new Pendiente();
  constructor(readonly id: string) {}

  cambiarEstado(nuevo: EstadoPedido): void {
    console.log(`  ${this.id}: ${this.#estado.nombre} → ${nuevo.nombre}`);
    this.#estado = nuevo;
  }

  pagar() { this.#estado.pagar(this); }
  enviar() { this.#estado.enviar(this); }
  cancelar() { this.#estado.cancelar(this); }
}

// ── Uso ──
const a = new Pedido('A-1');
a.pagar();
a.enviar();
try {
  a.cancelar();
} catch (error) {
  console.log(`  ${(error as Error).message}`); // No se puede cancelar un pedido enviado
}

const b = new Pedido('B-2');
b.pagar();
b.cancelar(); // reembolsa y cancela
