// Los comandos implementan `IComando` y el historial es una `Stack<T>`, la pila de la biblioteca
// estándar; `TryPop` evita comprobar antes si está vacía. Cada comando guarda en un diccionario lo
// que necesita para deshacerse.

var repo = new RepoProductos();
var panel = new Invocador();

panel.Ejecutar(new AjustarPrecios(repo, "perifericos", 1.1m), "ana");
panel.Ejecutar(new DesactivarProducto(repo, "monitor"), "ana");
Console.WriteLine(repo.Listar()); // teclado 110, mouse 44, monitor 900 (inactivo)

panel.DeshacerUltimo();
panel.DeshacerUltimo();
Console.WriteLine(repo.Listar()); // teclado 100, mouse 40, monitor 900

public record Producto(string Id, string Categoria)
{
    public decimal Precio { get; set; }
    public bool Activo { get; set; } = true;
}

public class RepoProductos
{
    private readonly List<Producto> _productos =
    [
        new("teclado", "perifericos") { Precio = 100 },
        new("mouse", "perifericos") { Precio = 40 },
        new("monitor", "pantallas") { Precio = 900 },
    ];

    public IEnumerable<Producto> DeCategoria(string categoria) => _productos.Where(p => p.Categoria == categoria);

    public Producto Buscar(string id) =>
        _productos.FirstOrDefault(p => p.Id == id) ?? throw new KeyNotFoundException($"No existe el producto {id}");

    public string Listar() =>
        string.Join(", ", _productos.Select(p => $"{p.Id} {p.Precio:0.##}{(p.Activo ? "" : " (inactivo)")}"));
}

public interface IComando
{
    string Descripcion { get; }
    void Ejecutar();
    void Deshacer();
}

public class AjustarPrecios(RepoProductos repo, string categoria, decimal factor) : IComando
{
    private readonly Dictionary<string, decimal> _anteriores = [];

    public string Descripcion => $"Ajustar precios de {categoria} ×{factor}";

    public void Ejecutar()
    {
        foreach (var producto in repo.DeCategoria(categoria))
        {
            _anteriores[producto.Id] = producto.Precio;
            producto.Precio = Math.Round(producto.Precio * factor, 2);
        }
    }

    public void Deshacer()
    {
        foreach (var (id, precio) in _anteriores) repo.Buscar(id).Precio = precio;
    }
}

public class DesactivarProducto(RepoProductos repo, string id) : IComando
{
    public string Descripcion => $"Desactivar {id}";
    public void Ejecutar() => repo.Buscar(id).Activo = false;
    public void Deshacer() => repo.Buscar(id).Activo = true;
}

public class Invocador
{
    private readonly Stack<IComando> _historial = new();

    public void Ejecutar(IComando comando, string usuario)
    {
        comando.Ejecutar();
        _historial.Push(comando);
        Console.WriteLine($"[auditoría] {usuario}: {comando.Descripcion}");
    }

    public void DeshacerUltimo()
    {
        if (_historial.TryPop(out var comando)) comando.Deshacer();
    }
}
