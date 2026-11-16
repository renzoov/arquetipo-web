// Fuera del configurador, el memento solo existe como la interfaz pública `IMemento` (que muestra la
// etiqueta); la clase real es privada y está anidada dentro de él, así que nadie más puede leer el
// estado. Como el estado es un `record` inmutable, el memento puede guardarlo sin copiarlo.

var config = new Configurador();
var historial = new Historial(config);

historial.Guardar("base");
config.ElegirMotor("electrico");
historial.Guardar("eléctrico");
config.AgregarAccesorio("Techo solar");
Console.WriteLine(config.Resumen()); // Sedán electrico/automatica [Techo solar] 29600 USD

Console.WriteLine($"Volver a: {historial.Deshacer()}");
Console.WriteLine(config.Resumen()); // Sedán electrico/automatica [] 29000 USD
Console.WriteLine($"Volver a: {historial.Deshacer()}");
Console.WriteLine(config.Resumen()); // Sedán gasolina/manual [] 20000 USD

public interface IMemento
{
    string Etiqueta { get; }
}

public class Configurador
{
    private sealed record Estado(string Modelo, string Motor, string Caja, IReadOnlyList<string> Accesorios, int Precio);
    private sealed record Instantanea(string Etiqueta, Estado Estado) : IMemento;

    private static readonly Dictionary<string, int> Recargo = new() { ["gasolina"] = 0, ["hibrido"] = 4000, ["electrico"] = 9000 };

    private Estado _estado = new("Sedán", "gasolina", "manual", [], 20000);

    public void ElegirMotor(string motor)
    {
        if (!Recargo.ContainsKey(motor)) throw new ArgumentException($"Motor desconocido: {motor}");
        var caja = motor == "electrico" ? "automatica" : _estado.Caja; // regla: no hay eléctricos manuales
        _estado = Recalcular(_estado with { Motor = motor, Caja = caja });
    }

    public void AgregarAccesorio(string accesorio) =>
        _estado = Recalcular(_estado with { Accesorios = [.. _estado.Accesorios, accesorio] });

    public IMemento Guardar(string etiqueta) => new Instantanea(etiqueta, _estado);

    public void Restaurar(IMemento memento) =>
        _estado = memento is Instantanea instantanea
            ? instantanea.Estado
            : throw new ArgumentException("Este memento no pertenece a un configurador");

    public string Resumen() =>
        $"{_estado.Modelo} {_estado.Motor}/{_estado.Caja} [{string.Join(", ", _estado.Accesorios)}] {_estado.Precio} USD";

    private static Estado Recalcular(Estado e) => e with { Precio = 20000 + Recargo[e.Motor] + e.Accesorios.Count * 600 };
}

public class Historial(Configurador configurador)
{
    private readonly Stack<IMemento> _pila = new();

    public void Guardar(string etiqueta) => _pila.Push(configurador.Guardar(etiqueta));

    public string? Deshacer()
    {
        if (!_pila.TryPop(out var memento)) return null;
        configurador.Restaurar(memento);
        return memento.Etiqueta;
    }
}
