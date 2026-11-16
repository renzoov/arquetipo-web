// El Builder clásico de Java (el de "Effective Java"): una clase `Builder` anidada con métodos
// encadenados y un `build()` final. El producto es un `record` inmutable cuyo constructor compacto
// valida siempre, se construya como se construya.

void main() {
    var busqueda = Busqueda.builder()
            .texto("  zapatillas ")
            .precioEntre(50, 120)
            .soloConStock()
            .build();
    IO.println(busqueda);

    IO.println(Recetas.ofertasDelDia().orden()); // DESCUENTO

    try {
        Busqueda.builder().precioEntre(200, 100).build();
    } catch (IllegalArgumentException error) {
        IO.println(error.getMessage()); // Rango de precio inválido
    }
}

enum Orden { RELEVANCIA, PRECIO, DESCUENTO, NOVEDAD }

record Busqueda(String texto, Double precioMin, Double precioMax, boolean soloConStock, Orden orden, int pagina) {

    Busqueda { // constructor compacto: valida cualquier instancia
        Objects.requireNonNull(orden, "orden");
        if (precioMin != null && precioMax != null && precioMin > precioMax) {
            throw new IllegalArgumentException("Rango de precio inválido");
        }
        if (pagina < 1) {
            throw new IllegalArgumentException("La página empieza en 1");
        }
    }

    static Builder builder() {
        return new Builder();
    }

    static final class Builder {
        private String texto;
        private Double precioMin;
        private Double precioMax;
        private boolean soloConStock;
        private Orden orden = Orden.RELEVANCIA;
        private int pagina = 1;

        Builder texto(String texto) { this.texto = texto.strip(); return this; }
        Builder precioEntre(double min, double max) { this.precioMin = min; this.precioMax = max; return this; }
        Builder soloConStock() { this.soloConStock = true; return this; }
        Builder ordenarPor(Orden orden) { this.orden = orden; return this; }
        Builder pagina(int pagina) { this.pagina = pagina; return this; }

        Busqueda build() {
            return new Busqueda(texto, precioMin, precioMax, soloConStock, orden, pagina);
        }
    }
}

// Director: recetas que siempre ejecutan los mismos pasos
final class Recetas {
    static Busqueda ofertasDelDia() {
        return Busqueda.builder().soloConStock().ordenarPor(Orden.DESCUENTO).build();
    }
}
