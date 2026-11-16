// Los componentes forman una interfaz `sealed`, así que el mediador puede decidir con un `switch` de
// patrones de tipo (`case SelectorCategoria c`) y el compilador comprueba que trata todos los casos.
// Cada componente solo conoce al mediador.

void main() {
    var panel = new PanelFiltros();

    panel.categoria.elegir("laptops");
    IO.println(panel.marca.opciones + " · " + panel.resultados); // [Premium, Económica] · 25 resultados

    panel.marca.elegir("Premium");
    IO.println(panel.precio + " · " + panel.resultados);         // RangoPrecio[min=500.0, max=3000.0] · 8 resultados

    panel.limpiar.pulsar();
    IO.println(panel.resultados);                                // 120 resultados
}

interface Mediador {
    void notificar(Componente origen);
}

sealed interface Componente permits SelectorCategoria, SelectorMarca, BotonLimpiar {}

final class SelectorCategoria implements Componente {
    private final Mediador mediador;
    String valor = "";

    SelectorCategoria(Mediador mediador) { this.mediador = mediador; }

    void elegir(String categoria) { valor = categoria; mediador.notificar(this); }
}

final class SelectorMarca implements Componente {
    private final Mediador mediador;
    String valor = "";
    List<String> opciones = List.of();

    SelectorMarca(Mediador mediador) { this.mediador = mediador; }

    void elegir(String marca) { valor = marca; mediador.notificar(this); }
}

final class BotonLimpiar implements Componente {
    private final Mediador mediador;

    BotonLimpiar(Mediador mediador) { this.mediador = mediador; }

    void pulsar() { mediador.notificar(this); }
}

record RangoPrecio(double min, double max) {
    static final RangoPrecio SIN_LIMITE = new RangoPrecio(0, Double.MAX_VALUE);
}

final class PanelFiltros implements Mediador {
    private static final Map<String, List<String>> CATALOGO =
            Map.of("laptops", List.of("Premium", "Económica"), "celulares", List.of("Premium"));

    final SelectorCategoria categoria = new SelectorCategoria(this);
    final SelectorMarca marca = new SelectorMarca(this);
    final BotonLimpiar limpiar = new BotonLimpiar(this);
    RangoPrecio precio = RangoPrecio.SIN_LIMITE;
    String resultados = "";

    @Override
    public void notificar(Componente origen) {
        switch (origen) {
            case BotonLimpiar b -> {
                categoria.valor = marca.valor = "";
                marca.opciones = List.of();
                precio = RangoPrecio.SIN_LIMITE;
            }
            case SelectorCategoria c -> {
                marca.opciones = CATALOGO.getOrDefault(c.valor, List.of());
                marca.valor = "";
                precio = RangoPrecio.SIN_LIMITE;
            }
            case SelectorMarca m -> precio = m.valor.equals("Premium") ? new RangoPrecio(500, 3000) : new RangoPrecio(0, 800);
        }
        var total = categoria.valor.isEmpty() ? 120 : marca.valor.isEmpty() ? 25 : 8;
        resultados = total + " resultados";
    }
}
