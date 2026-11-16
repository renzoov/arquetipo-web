// En Java, una máquina de estados se escribe muy bien con un `enum` cuyas constantes sobrescriben
// métodos: cada estado es un objeto único, el conjunto está cerrado y las transiciones quedan juntas.
// Por defecto, una acción no permitida lanza una excepción.

void main() {
    var a = new Pedido("A-1");
    a.pagar();
    a.enviar();
    try {
        a.cancelar();
    } catch (IllegalStateException error) {
        IO.println("  " + error.getMessage()); // No se puede cancelar un pedido enviado
    }

    var b = new Pedido("B-2");
    b.pagar();
    b.cancelar(); // reembolsa y cancela
}

enum EstadoPedido {
    PENDIENTE {
        @Override EstadoPedido pagar(Pedido p) { return PAGADO; }
        @Override EstadoPedido cancelar(Pedido p) { return CANCELADO; }
    },
    PAGADO {
        @Override EstadoPedido enviar(Pedido p) { return ENVIADO; }
        @Override EstadoPedido cancelar(Pedido p) {
            IO.println("  reembolso del pedido " + p.id());
            return CANCELADO;
        }
    },
    ENVIADO,
    CANCELADO;

    // Cada método devuelve el siguiente estado; por defecto, la acción no está permitida
    EstadoPedido pagar(Pedido p) { throw prohibido("pagar"); }
    EstadoPedido enviar(Pedido p) { throw prohibido("enviar"); }
    EstadoPedido cancelar(Pedido p) { throw prohibido("cancelar"); }

    private IllegalStateException prohibido(String accion) {
        return new IllegalStateException("No se puede " + accion + " un pedido " + name().toLowerCase());
    }
}

final class Pedido {
    private final String id;
    private EstadoPedido estado = EstadoPedido.PENDIENTE;

    Pedido(String id) {
        this.id = id;
    }

    String id() { return id; }

    void pagar() { cambiar(estado.pagar(this)); }
    void enviar() { cambiar(estado.enviar(this)); }
    void cancelar() { cambiar(estado.cancelar(this)); }

    private void cambiar(EstadoPedido nuevo) {
        IO.println("  %s: %s → %s".formatted(id, estado.name().toLowerCase(), nuevo.name().toLowerCase()));
        estado = nuevo;
    }
}
