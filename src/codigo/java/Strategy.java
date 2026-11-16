// Desde Java 8, una estrategia con un solo método es una interfaz funcional y cada algoritmo se escribe
// como lambda o referencia a método, sin una clase por estrategia. El catálogo es una lista de
// `record`. (Para dinero real se usaría `BigDecimal`; aquí `double` simplifica el ejemplo.)

void main() {
    var pedido = new Pedido(200, 3.2, "ES");

    // La modalidad la elige el cliente en tiempo de ejecución
    for (var modalidad : MODALIDADES) {
        IO.println("%-14s %s".formatted(modalidad.nombre(), formatear(new Checkout(modalidad.calculo()).total(pedido))));
    }
    // ciudad 210 · nacional 214.4 · internacional 260 · campania 200
}

record Modalidad(String nombre, CalculoEnvio calculo) {}

final List<Modalidad> MODALIDADES = List.of(
        new Modalidad("ciudad", CalculoEnvio.tarifaPlana(10)),
        new Modalidad("nacional", CalculoEnvio.porPeso(4.5)),
        new Modalidad("internacional", CalculoEnvio::internacional),
        new Modalidad("campania", CalculoEnvio.tarifaPlana(0)));

String formatear(double valor) {
    return BigDecimal.valueOf(valor).stripTrailingZeros().toPlainString();
}

record Pedido(double subtotal, double pesoKg, String pais) {}

@FunctionalInterface
interface CalculoEnvio {
    double calcular(Pedido pedido);

    static CalculoEnvio tarifaPlana(double monto) {
        return pedido -> monto;
    }

    static CalculoEnvio porPeso(double precioPorKg) {
        return pedido -> Math.round(pedido.pesoKg() * precioPorKg * 100) / 100.0;
    }

    static double internacional(Pedido pedido) {
        return Map.of("US", 45.0, "ES", 60.0).getOrDefault(pedido.pais(), 80.0);
    }
}

record Checkout(CalculoEnvio envio) {
    double total(Pedido pedido) {
        return pedido.subtotal() + envio.calcular(pedido);
    }
}
