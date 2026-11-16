// Fuera del configurador, el memento solo existe como la interfaz `Memento` (que muestra la
// etiqueta); su implementación es un `record` privado anidado, así que nadie más puede leer el estado.
// Como el estado también es un `record` inmutable, el memento lo guarda sin copiarlo.

void main() {
    var config = new Configurador();
    var historial = new Historial(config);

    historial.guardar("base");
    config.elegirMotor("electrico");
    historial.guardar("eléctrico");
    config.agregarAccesorio("Techo solar");
    IO.println(config.resumen()); // Sedán electrico/automatica [Techo solar] 29600 USD

    IO.println("Volver a: " + historial.deshacer());
    IO.println(config.resumen()); // Sedán electrico/automatica [] 29000 USD
    IO.println("Volver a: " + historial.deshacer());
    IO.println(config.resumen()); // Sedán gasolina/manual [] 20000 USD
}

interface Memento {
    String etiqueta();
}

final class Configurador {
    private record Estado(String modelo, String motor, String caja, List<String> accesorios, int precio) {}
    private record Instantanea(String etiqueta, Estado estado) implements Memento {}

    private static final Map<String, Integer> RECARGO = Map.of("gasolina", 0, "hibrido", 4000, "electrico", 9000);

    private Estado estado = new Estado("Sedán", "gasolina", "manual", List.of(), 20000);

    void elegirMotor(String motor) {
        if (!RECARGO.containsKey(motor)) throw new IllegalArgumentException("Motor desconocido: " + motor);
        var caja = motor.equals("electrico") ? "automatica" : estado.caja(); // regla: no hay eléctricos manuales
        estado = recalcular(new Estado(estado.modelo(), motor, caja, estado.accesorios(), 0));
    }

    void agregarAccesorio(String accesorio) {
        var accesorios = new ArrayList<>(estado.accesorios());
        accesorios.add(accesorio);
        estado = recalcular(new Estado(estado.modelo(), estado.motor(), estado.caja(), List.copyOf(accesorios), 0));
    }

    Memento guardar(String etiqueta) {
        return new Instantanea(etiqueta, estado);
    }

    void restaurar(Memento memento) {
        if (!(memento instanceof Instantanea instantanea)) {
            throw new IllegalArgumentException("Este memento no pertenece a un configurador");
        }
        estado = instantanea.estado();
    }

    String resumen() {
        return "%s %s/%s %s %d USD".formatted(estado.modelo(), estado.motor(), estado.caja(), estado.accesorios(), estado.precio());
    }

    private static Estado recalcular(Estado e) {
        var precio = 20000 + RECARGO.get(e.motor()) + e.accesorios().size() * 600;
        return new Estado(e.modelo(), e.motor(), e.caja(), e.accesorios(), precio);
    }
}

final class Historial {
    private final Configurador configurador;
    private final Deque<Memento> pila = new ArrayDeque<>();

    Historial(Configurador configurador) {
        this.configurador = configurador;
    }

    void guardar(String etiqueta) {
        pila.push(configurador.guardar(etiqueta));
    }

    String deshacer() {
        var memento = pila.poll();
        if (memento == null) return null;
        configurador.restaurar(memento);
        return memento.etiqueta();
    }
}
