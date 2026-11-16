// Los `record` traen la clonación incorporada: la expresión `with` crea una copia con algunos cambios.
// Pero es una copia superficial: la lista de coberturas seguiría compartida, así que `Clonar` la copia
// explícitamente con una expresión de colección (`[.. Coberturas]`).

var poliza = Plantillas.Cotizar("auto-total").AgregarCobertura(new Cobertura("Auto de reemplazo", 1_500, 0));

Console.WriteLine(poliza.Resumen());                          // Auto Total: Choque, Robo, Auto de reemplazo (2 cláusulas)
Console.WriteLine(Plantillas.Obtener("auto-total").Resumen()); // Auto Total: Choque, Robo (2 cláusulas)

// Con `with` sin más, la lista se compartiría con la plantilla
var superficial = Plantillas.Obtener("auto-total") with { };
Console.WriteLine(ReferenceEquals(superficial.Coberturas, Plantillas.Obtener("auto-total").Coberturas)); // True

public record Cobertura(string Nombre, decimal SumaAsegurada, decimal Deducible);

public record Poliza(string Producto, List<Cobertura> Coberturas, IReadOnlyList<string> Clausulas)
{
    public Poliza Clonar() => this with { Coberturas = [.. Coberturas] };

    public Poliza AgregarCobertura(Cobertura cobertura)
    {
        Coberturas.Add(cobertura);
        return this;
    }

    public string Resumen() =>
        $"{Producto}: {string.Join(", ", Coberturas.Select(c => c.Nombre))} ({Clausulas.Count} cláusulas)";
}

// Registro de prototipos: plantillas configuradas una sola vez
public static class Plantillas
{
    private static readonly Dictionary<string, Poliza> _plantillas = new()
    {
        ["auto-total"] = new("Auto Total",
            [new("Choque", 30_000, 500), new("Robo", 30_000, 800)],
            ["Vigencia anual", "Cobertura nacional"]),
    };

    public static Poliza Obtener(string clave) => _plantillas[clave];

    public static Poliza Cotizar(string clave) =>
        _plantillas.TryGetValue(clave, out var plantilla)
            ? plantilla.Clonar()
            : throw new KeyNotFoundException($"No existe la plantilla {clave}");
}
