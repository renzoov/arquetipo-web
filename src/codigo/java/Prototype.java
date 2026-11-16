// En Java se evita `Cloneable` y `clone()`, que tienen un diseño problemático ("Effective Java",
// ítem 13). Lo idiomático es un constructor de copia: copia en profundidad lo mutable (la lista de
// coberturas) y comparte lo inmutable (`List.copyOf` y los `record`). La póliza también es un `record`.

void main() {
    var poliza = Plantillas.cotizar("auto-total")
            .agregarCobertura(new Cobertura("Auto de reemplazo", 1_500, 0));

    IO.println(poliza.resumen());                          // Auto Total: Choque, Robo, Auto de reemplazo (2 cláusulas)
    IO.println(Plantillas.obtener("auto-total").resumen()); // Auto Total: Choque, Robo (2 cláusulas)
}

record Cobertura(String nombre, double sumaAsegurada, double deducible) {}

record Poliza(String producto, List<Cobertura> coberturas, List<String> clausulas) {

    Poliza {
        coberturas = new ArrayList<>(coberturas); // mutable: cada póliza necesita la suya
        clausulas = List.copyOf(clausulas);       // inmutable: se puede compartir
    }

    // Constructor de copia
    Poliza(Poliza otra) {
        this(otra.producto, otra.coberturas, otra.clausulas);
    }

    Poliza clonar() {
        return new Poliza(this);
    }

    Poliza agregarCobertura(Cobertura cobertura) {
        coberturas.add(cobertura);
        return this;
    }

    String resumen() {
        var nombres = coberturas.stream().map(Cobertura::nombre).collect(Collectors.joining(", "));
        return "%s: %s (%d cláusulas)".formatted(producto, nombres, clausulas.size());
    }
}

// Registro de prototipos: plantillas configuradas una sola vez
final class Plantillas {
    private static final Map<String, Poliza> PLANTILLAS = Map.of(
            "auto-total", new Poliza("Auto Total",
                    List.of(new Cobertura("Choque", 30_000, 500), new Cobertura("Robo", 30_000, 800)),
                    List.of("Vigencia anual", "Cobertura nacional")));

    static Poliza obtener(String clave) {
        return PLANTILLAS.get(clave);
    }

    static Poliza cotizar(String clave) {
        var plantilla = PLANTILLAS.get(clave);
        if (plantilla == null) throw new NoSuchElementException("No existe la plantilla " + clave);
        return plantilla.clonar();
    }
}
