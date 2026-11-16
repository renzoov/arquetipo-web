// Es el patrón con el que está construido `java.io`: `new BufferedReader(new InputStreamReader(...))`.
// Cada decorador implementa la misma interfaz y recibe al envuelto en el constructor. Los fallos del
// proveedor son una excepción no comprobada (`RuntimeException`) propia.

void main() {
    FuenteTiposCambio fuente = new ConCache(new ConLog(new ConReintentos(new ApiTiposCambio(), 3)), Duration.ofMinutes(5));

    IO.println(fuente.obtener("USD")); // → consultando USD, reintento 1..., 3.75
    IO.println(fuente.obtener("USD")); // 3.75 (desde la caché)
}

interface FuenteTiposCambio {
    double obtener(String moneda);
}

class ProveedorNoDisponible extends RuntimeException {
    @Serial private static final long serialVersionUID = 1L;

    ProveedorNoDisponible(String mensaje) { super(mensaje); }
}

class ApiTiposCambio implements FuenteTiposCambio {
    private int llamadas;

    @Override
    public double obtener(String moneda) {
        if (++llamadas == 1) throw new ProveedorNoDisponible("Tiempo de espera agotado"); // el proveedor falla a veces
        return moneda.equals("USD") ? 3.75 : 4.05;
    }
}

class ConReintentos implements FuenteTiposCambio {
    private final FuenteTiposCambio interno;
    private final int intentos;

    ConReintentos(FuenteTiposCambio interno, int intentos) {
        this.interno = interno;
        this.intentos = intentos;
    }

    @Override
    public double obtener(String moneda) {
        for (var intento = 1; ; intento++) {
            try {
                return interno.obtener(moneda);
            } catch (ProveedorNoDisponible error) {
                if (intento >= intentos) throw error;
                IO.println("  reintento " + intento + "...");
            }
        }
    }
}

class ConCache implements FuenteTiposCambio {
    private record Entrada(double valor, Instant expira) {}

    private final FuenteTiposCambio interno;
    private final Duration duracion;
    private final Map<String, Entrada> cache = new ConcurrentHashMap<>();

    ConCache(FuenteTiposCambio interno, Duration duracion) {
        this.interno = interno;
        this.duracion = duracion;
    }

    @Override
    public double obtener(String moneda) {
        var guardado = cache.get(moneda);
        if (guardado != null && guardado.expira().isAfter(Instant.now())) return guardado.valor();
        var valor = interno.obtener(moneda);
        cache.put(moneda, new Entrada(valor, Instant.now().plus(duracion)));
        return valor;
    }
}

class ConLog implements FuenteTiposCambio {
    private final FuenteTiposCambio interno;

    ConLog(FuenteTiposCambio interno) {
        this.interno = interno;
    }

    @Override
    public double obtener(String moneda) {
        IO.println("→ consultando " + moneda);
        return interno.obtener(moneda);
    }
}
