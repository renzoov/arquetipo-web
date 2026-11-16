// Cada estado es un objeto literal congelado con solo las acciones que permite. Si una acción no
// existe en el estado actual, se rechaza con un mensaje claro. Toda la máquina de estados queda
// visible de un vistazo en una tabla.

const ESTADOS = Object.freeze({
  pendiente: {
    pagar: (pedido) => pedido.cambiarEstado('pagado'),
    cancelar: (pedido) => pedido.cambiarEstado('cancelado'),
  },
  pagado: {
    enviar: (pedido) => pedido.cambiarEstado('enviado'),
    cancelar: (pedido) => {
      console.log(`  reembolso del pedido ${pedido.id}`);
      pedido.cambiarEstado('cancelado');
    },
  },
  enviado: {},
  cancelado: {},
});

export class Pedido {
  #estado = 'pendiente';

  constructor(id) { this.id = id; }

  cambiarEstado(nuevo) {
    console.log(`  ${this.id}: ${this.#estado} → ${nuevo}`);
    this.#estado = nuevo;
  }

  pagar() { this.#ejecutar('pagar'); }
  enviar() { this.#ejecutar('enviar'); }
  cancelar() { this.#ejecutar('cancelar'); }

  #ejecutar(accion) {
    const manejador = ESTADOS[this.#estado][accion];
    if (!manejador) throw new Error(`No se puede ${accion} un pedido ${this.#estado}`);
    manejador(this);
  }
}

// ── Uso ──
const a = new Pedido('A-1');
a.pagar();
a.enviar();
try {
  a.cancelar();
} catch (error) {
  console.log(`  ${error.message}`); // No se puede cancelar un pedido enviado
}

const b = new Pedido('B-2');
b.pagar();
b.cancelar(); // reembolsa y cancela
