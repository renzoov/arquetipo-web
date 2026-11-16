// La interfaz `sealed` limita los nodos del árbol a `Empleado` (hoja) y `Area` (compuesto). El
// compuesto suma con un `Stream` y aplana el árbol con `flatMap`, de forma recursiva y perezosa.

void main() {
    var tecnologia = new Area("Tecnología",
            new Empleado("Ana", 5200),
            new Area("Equipo Pagos", new Empleado("Luis", 4100), new Empleado("Marta", 3900)));

    IO.println(tecnologia.costoMensual());                                 // 13200
    IO.println(tecnologia.personas().map(Empleado::nombre).toList());      // [Ana, Luis, Marta]
}

sealed interface MiembroOrganizacion permits Empleado, Area {
    int costoMensual();
    Stream<Empleado> personas();
}

record Empleado(String nombre, int sueldo) implements MiembroOrganizacion {
    @Override public int costoMensual() { return sueldo; }
    @Override public Stream<Empleado> personas() { return Stream.of(this); }
}

final class Area implements MiembroOrganizacion {
    private final String nombre;
    private final List<MiembroOrganizacion> miembros;

    Area(String nombre, MiembroOrganizacion... miembros) {
        this.nombre = nombre;
        this.miembros = new ArrayList<>(List.of(miembros));
    }

    String nombre() { return nombre; }

    void agregar(MiembroOrganizacion miembro) { miembros.add(miembro); }

    @Override public int costoMensual() {
        return miembros.stream().mapToInt(MiembroOrganizacion::costoMensual).sum();
    }

    @Override public Stream<Empleado> personas() {
        return miembros.stream().flatMap(MiembroOrganizacion::personas);
    }
}
