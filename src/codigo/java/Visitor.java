// Desde Java 21, las interfaces `sealed` y el `switch` con patrones sustituyen al Visitor clásico: cada
// operación es un método con un `case` por tipo de producto, y como la jerarquía está sellada, el
// compilador avisa si falta un caso. Ya no hacen falta los métodos `aceptar` ni el doble despacho.

void main() {
    List<Producto> carrito = List.of(
            new ProductoFisico("Teclado", 100, 1.2),
            new ProductoDigital("Curso de patrones", 50),
            new Suscripcion("Plan Pro", 15, 12));

    IO.println(String.format(Locale.ROOT, "Envío: %.2f", carrito.stream().mapToDouble(Operaciones::costoEnvio).sum()));     // 5.40
    IO.println(String.format(Locale.ROOT, "Impuestos: %.2f", carrito.stream().mapToDouble(Operaciones::impuestos).sum())); // 59.40
    carrito.forEach(p -> IO.println(Operaciones.exportarContable(p)));
}

sealed interface Producto permits ProductoFisico, ProductoDigital, Suscripcion {}
record ProductoFisico(String nombre, double precio, double pesoKg) implements Producto {}
record ProductoDigital(String nombre, double precio) implements Producto {}
record Suscripcion(String nombre, double precioMensual, int meses) implements Producto {}

final class Operaciones {
    static double costoEnvio(Producto producto) {
        return switch (producto) {
            case ProductoFisico p -> p.pesoKg() * 4.5;
            case ProductoDigital p -> 0;
            case Suscripcion s -> 0;
        };
    }

    static double impuestos(Producto producto) {
        return switch (producto) {
            case ProductoFisico p -> p.precio() * 0.18;
            case ProductoDigital p -> p.precio() * 0.18;
            case Suscripcion s -> s.precioMensual() * s.meses() * 0.18;
        };
    }

    static String exportarContable(Producto producto) {
        return switch (producto) {
            case ProductoFisico(var nombre, var precio, var peso) -> "MERCADERIA|%s|%.0f".formatted(nombre, precio);
            case ProductoDigital(var nombre, var precio) -> "SERVICIO-DIGITAL|%s|%.0f".formatted(nombre, precio);
            case Suscripcion(var nombre, var mensual, var meses) -> "SUSCRIPCION|%s|%.0f".formatted(nombre, mensual * meses);
        };
    }
}
