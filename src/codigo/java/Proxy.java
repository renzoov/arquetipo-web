// El proxy implementa la misma interfaz que la historia real y la crea solo en el primer acceso. Un
// acceso sin permiso lanza una excepción propia. (Java también trae `java.lang.reflect.Proxy` para
// crear proxies dinámicos, que es lo que usan Spring y Hibernate por debajo.)

void main() {
    var medica = new Usuario("dra-rios", Set.of("P-77"));

    HistoriaClinica historia = new ProxyHistoriaClinica("P-77", medica);
    IO.println("Proxy creado: todavía no se cargó nada");
    IO.println(historia.diagnosticos());      // carga la historia la primera vez
    IO.println(historia.imagenes().size());   // ya está cargada

    try {
        new ProxyHistoriaClinica("P-90", medica).diagnosticos();
    } catch (AccesoDenegado error) {
        IO.println(error.getMessage()); // Acceso denegado a la historia P-90
    }
}

record Usuario(String id, Set<String> pacientesAsignados) {}

class AccesoDenegado extends RuntimeException {
    @Serial private static final long serialVersionUID = 1L;

    AccesoDenegado(String mensaje) { super(mensaje); }
}

interface HistoriaClinica {
    List<String> diagnosticos();
    List<String> imagenes();
}

class HistoriaClinicaReal implements HistoriaClinica {
    HistoriaClinicaReal(String pacienteId) {
        IO.println("  (cargando la historia " + pacienteId + " y sus estudios...)");
    }

    @Override public List<String> diagnosticos() { return List.of("Hipertensión controlada"); }
    @Override public List<String> imagenes() { return List.of("resonancia-2026-10.dcm"); }
}

class ProxyHistoriaClinica implements HistoriaClinica {
    private final String pacienteId;
    private final Usuario usuario;
    private HistoriaClinicaReal real; // se crea en el primer acceso

    ProxyHistoriaClinica(String pacienteId, Usuario usuario) {
        this.pacienteId = pacienteId;
        this.usuario = usuario;
    }

    @Override public List<String> diagnosticos() { return real().diagnosticos(); }
    @Override public List<String> imagenes() { return real().imagenes(); }

    private HistoriaClinicaReal real() {
        if (!usuario.pacientesAsignados().contains(pacienteId)) {
            throw new AccesoDenegado("Acceso denegado a la historia " + pacienteId);
        }
        if (real == null) real = new HistoriaClinicaReal(pacienteId);
        return real;
    }
}
