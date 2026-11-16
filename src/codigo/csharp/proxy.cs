// El proxy implementa la misma interfaz y usa `Lazy<T>` para crear la historia real solo en el primer
// acceso. Un acceso sin permiso lanza `UnauthorizedAccessException`. (.NET también ofrece
// `DispatchProxy` para crear proxies dinámicos, útil para registro o métricas genéricas.)

var medica = new Usuario("dra-rios", ["P-77"]);

IHistoriaClinica historia = new ProxyHistoriaClinica("P-77", medica);
Console.WriteLine("Proxy creado: todavía no se cargó nada");
Console.WriteLine(string.Join(", ", historia.Diagnosticos())); // carga la historia la primera vez
Console.WriteLine(historia.Imagenes().Count);                  // ya está cargada

try
{
    new ProxyHistoriaClinica("P-90", medica).Diagnosticos();
}
catch (UnauthorizedAccessException error)
{
    Console.WriteLine(error.Message); // Acceso denegado a la historia P-90
}

public record Usuario(string Id, IReadOnlyList<string> PacientesAsignados);

public interface IHistoriaClinica
{
    IReadOnlyList<string> Diagnosticos();
    IReadOnlyList<string> Imagenes();
}

public class HistoriaClinica : IHistoriaClinica
{
    public HistoriaClinica(string pacienteId) =>
        Console.WriteLine($"  (cargando la historia {pacienteId} y sus estudios...)");

    public IReadOnlyList<string> Diagnosticos() => ["Hipertensión controlada"];
    public IReadOnlyList<string> Imagenes() => ["resonancia-2026-10.dcm"];
}

public class ProxyHistoriaClinica : IHistoriaClinica
{
    private readonly string _pacienteId;
    private readonly Usuario _usuario;
    private readonly Lazy<HistoriaClinica> _real;

    public ProxyHistoriaClinica(string pacienteId, Usuario usuario)
    {
        _pacienteId = pacienteId;
        _usuario = usuario;
        _real = new Lazy<HistoriaClinica>(() => new HistoriaClinica(pacienteId)); // aún no se crea
    }

    public IReadOnlyList<string> Diagnosticos() => Real.Diagnosticos();
    public IReadOnlyList<string> Imagenes() => Real.Imagenes();

    private HistoriaClinica Real => _usuario.PacientesAsignados.Contains(_pacienteId)
        ? _real.Value
        : throw new UnauthorizedAccessException($"Acceso denegado a la historia {_pacienteId}");
}
