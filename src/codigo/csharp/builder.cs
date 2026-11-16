// En C#, las propiedades `init` y los inicializadores de objeto (`new Busqueda { Texto = ... }`) ya
// evitan el constructor telescópico. El builder fluido (como `StringBuilder` o
// `WebApplication.CreateBuilder`) aporta cuando hay que construir por pasos o validar el conjunto.
// Por dentro, cada paso crea una copia modificada del `record` con `with`.

var busqueda = new BusquedaBuilder()
    .Texto("  zapatillas ")
    .PrecioEntre(50, 120)
    .SoloConStock()
    .Build();
Console.WriteLine(busqueda);

Console.WriteLine(Recetas.OfertasDelDia().Orden); // Descuento

// Con todos los datos a mano, basta un inicializador de objeto
Console.WriteLine(new Busqueda { Texto = "auriculares", Orden = Orden.Novedad });

try
{
    new BusquedaBuilder().PrecioEntre(200, 100).Build();
}
catch (ArgumentException error)
{
    Console.WriteLine(error.Message); // Rango de precio inválido
}

public enum Orden { Relevancia, Precio, Descuento, Novedad }

public record Busqueda
{
    public string? Texto { get; init; }
    public (decimal Min, decimal Max)? Precio { get; init; }
    public bool SoloConStock { get; init; }
    public Orden Orden { get; init; } = Orden.Relevancia;
    public int Pagina { get; init; } = 1;
}

public class BusquedaBuilder
{
    private Busqueda _busqueda = new();

    public BusquedaBuilder Texto(string texto) { _busqueda = _busqueda with { Texto = texto.Trim() }; return this; }
    public BusquedaBuilder PrecioEntre(decimal min, decimal max) { _busqueda = _busqueda with { Precio = (min, max) }; return this; }
    public BusquedaBuilder SoloConStock() { _busqueda = _busqueda with { SoloConStock = true }; return this; }
    public BusquedaBuilder OrdenarPor(Orden orden) { _busqueda = _busqueda with { Orden = orden }; return this; }

    public Busqueda Build()
    {
        if (_busqueda.Precio is { Min: var min, Max: var max } && min > max)
            throw new ArgumentException("Rango de precio inválido");
        return _busqueda;
    }
}

// Director: recetas que siempre ejecutan los mismos pasos
public static class Recetas
{
    public static Busqueda OfertasDelDia() => new BusquedaBuilder().SoloConStock().OrdenarPor(Orden.Descuento).Build();
}
