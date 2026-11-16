// Los suscriptores son `Consumer<Pedido>` (lambdas) guardados en una `CopyOnWriteArrayList`, segura
// si se suscriben o dan de baja durante un aviso. `suscribir` devuelve un `Runnable` para darse de
// baja. (La antigua clase `java.util.Observable` está obsoleta; para flujos reactivos existe `Flow`.)

void main() {
    var pagos = new ServicioPagos();

    pagos.suscribir(p -> IO.println("  correo de confirmación para " + p.id()));
    pagos.suscribir(p -> { throw new IllegalStateException("inventario no disponible"); });
    Runnable cancelarFactura = pagos.suscribir(p -> IO.println("  factura emitida por " + p.total()));

    pagos.pagar(new Pedido("P-1", 250));

    cancelarFactura.run();               // se da de baja
    pagos.pagar(new Pedido("P-2", 90));  // ya no se emite factura
}

record Pedido(String id, int total) {}

final class ServicioPagos {
    private final List<Consumer<Pedido>> suscriptores = new CopyOnWriteArrayList<>();

    Runnable suscribir(Consumer<Pedido> suscriptor) {
        suscriptores.add(suscriptor);
        return () -> suscriptores.remove(suscriptor);
    }

    void pagar(Pedido pedido) {
        IO.println("Pedido " + pedido.id() + " cobrado");
        for (var suscriptor : suscriptores) {
            try {
                suscriptor.accept(pedido);
            } catch (RuntimeException error) {
                IO.println("  ⚠ un suscriptor falló: " + error.getMessage());
            }
        }
    }
}
