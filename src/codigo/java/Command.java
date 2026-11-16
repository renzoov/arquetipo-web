// Los comandos implementan una interfaz y el historial es un `ArrayDeque` usado como pila: es lo que
// recomienda la documentación de Java en lugar de la antigua clase `Stack`. Cada comando guarda en
// un `Map` lo que necesita para deshacerse.

void main() {
    var repo = new RepoProductos();
    var panel = new Invocador();

    panel.ejecutar(new AjustarPrecios(repo, "perifericos", 1.1), "ana");
    panel.ejecutar(new DesactivarProducto(repo, "monitor"), "ana");
    IO.println(repo.listar()); // [teclado 110, mouse 44, monitor 900 (inactivo)]

    panel.deshacerUltimo();
    panel.deshacerUltimo();
    IO.println(repo.listar()); // [teclado 100, mouse 40, monitor 900]
}

final class Producto {
    final String id;
    final String categoria;
    double precio;
    boolean activo = true;

    Producto(String id, String categoria, double precio) {
        this.id = id;
        this.categoria = categoria;
        this.precio = precio;
    }
}

final class RepoProductos {
    private final List<Producto> productos = List.of(
            new Producto("teclado", "perifericos", 100),
            new Producto("mouse", "perifericos", 40),
            new Producto("monitor", "pantallas", 900));

    List<Producto> deCategoria(String categoria) {
        return productos.stream().filter(p -> p.categoria.equals(categoria)).toList();
    }

    Producto buscar(String id) {
        return productos.stream().filter(p -> p.id.equals(id)).findFirst()
                .orElseThrow(() -> new NoSuchElementException("No existe el producto " + id));
    }

    List<String> listar() {
        return productos.stream()
                .map(p -> "%s %s%s".formatted(p.id, Math.round(p.precio), p.activo ? "" : " (inactivo)"))
                .toList();
    }
}

interface Comando {
    String descripcion();
    void ejecutar();
    void deshacer();
}

final class AjustarPrecios implements Comando {
    private final RepoProductos repo;
    private final String categoria;
    private final double factor;
    private final Map<String, Double> anteriores = new HashMap<>();

    AjustarPrecios(RepoProductos repo, String categoria, double factor) {
        this.repo = repo;
        this.categoria = categoria;
        this.factor = factor;
    }

    @Override public String descripcion() { return "Ajustar precios de " + categoria + " ×" + factor; }

    @Override public void ejecutar() {
        for (var producto : repo.deCategoria(categoria)) {
            anteriores.put(producto.id, producto.precio);
            producto.precio = Math.round(producto.precio * factor * 100) / 100.0;
        }
    }

    @Override public void deshacer() {
        anteriores.forEach((id, precio) -> repo.buscar(id).precio = precio);
    }
}

final class DesactivarProducto implements Comando {
    private final RepoProductos repo;
    private final String id;

    DesactivarProducto(RepoProductos repo, String id) {
        this.repo = repo;
        this.id = id;
    }

    @Override public String descripcion() { return "Desactivar " + id; }
    @Override public void ejecutar() { repo.buscar(id).activo = false; }
    @Override public void deshacer() { repo.buscar(id).activo = true; }
}

final class Invocador {
    private final Deque<Comando> historial = new ArrayDeque<>();

    void ejecutar(Comando comando, String usuario) {
        comando.ejecutar();
        historial.push(comando);
        IO.println("[auditoría] " + usuario + ": " + comando.descripcion());
    }

    void deshacerUltimo() {
        var comando = historial.poll(); // null si está vacía
        if (comando != null) comando.deshacer();
    }
}
