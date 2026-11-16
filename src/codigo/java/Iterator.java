// La colección implementa `Iterable<Cliente>`, así que se recorre con un `for` normal. El iterador
// guarda la página actual y solo pide la siguiente cuando `hasNext()` llega al final: si el bucle
// sale antes con `break`, no se hacen más peticiones.

void main() {
    var crm = new ApiCrm();
    for (var cliente : new ClientesCrm(crm, 2)) {
        IO.println(cliente.nombre());
    }
    IO.println("Peticiones a la API: " + crm.peticiones()); // 3

    var otroCrm = new ApiCrm();
    for (var cliente : new ClientesCrm(otroCrm, 2)) {
        if (cliente.id() == 2) break;
    }
    IO.println("Peticiones a la API: " + otroCrm.peticiones()); // 1
}

record Cliente(int id, String nombre) {}

record Pagina(List<Cliente> datos, String siguienteCursor) {}

final class ApiCrm {
    private final List<Cliente> clientes = List.of(
            new Cliente(1, "Ana"), new Cliente(2, "Luis"), new Cliente(3, "Marta"),
            new Cliente(4, "Jorge"), new Cliente(5, "Elena"));
    private int peticiones;

    Pagina listarClientes(int limite, String cursor) {
        peticiones++;
        var desde = cursor == null ? 0 : Integer.parseInt(cursor);
        var hasta = Math.min(desde + limite, clientes.size());
        return new Pagina(clientes.subList(desde, hasta), hasta < clientes.size() ? String.valueOf(hasta) : null);
    }

    int peticiones() { return peticiones; }
}

final class ClientesCrm implements Iterable<Cliente> {
    private final ApiCrm api;
    private final int limite;

    ClientesCrm(ApiCrm api, int limite) {
        this.api = api;
        this.limite = limite;
    }

    @Override
    public java.util.Iterator<Cliente> iterator() {
        return new java.util.Iterator<>() {
            private Pagina pagina = api.listarClientes(limite, null);
            private int posicion;

            @Override
            public boolean hasNext() {
                if (posicion < pagina.datos().size()) return true;
                if (pagina.siguienteCursor() == null) return false;
                pagina = api.listarClientes(limite, pagina.siguienteCursor()); // pide la siguiente página
                posicion = 0;
                return !pagina.datos().isEmpty();
            }

            @Override
            public Cliente next() {
                if (!hasNext()) throw new NoSuchElementException();
                return pagina.datos().get(posicion++);
            }
        };
    }
}
