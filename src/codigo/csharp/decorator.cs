// Cada decorador es una clase que implementa la misma interfaz y recibe al envuelto por su constructor
// primario. Es el mismo diseño de `DelegatingHandler` en `HttpClient`, donde librerías como Polly
// añaden reintentos o caché como capas. El filtro de excepciones `when` decide si se reintenta.

IFuenteTiposCambio fuente = new ConCache(new ConLog(new ConReintentos(new ApiTiposCambio())), TimeSpan.FromMinutes(5));

Console.WriteLine(await fuente.ObtenerAsync("USD")); // → consultando USD, reintento 1..., 3.75
Console.WriteLine(await fuente.ObtenerAsync("USD")); // 3.75 (desde la caché)

public interface IFuenteTiposCambio
{
    Task<decimal> ObtenerAsync(string moneda);
}

public class ApiTiposCambio : IFuenteTiposCambio
{
    private int _llamadas;

    public Task<decimal> ObtenerAsync(string moneda)
    {
        if (++_llamadas == 1) throw new TimeoutException("Tiempo de espera agotado"); // el proveedor falla a veces
        return Task.FromResult(moneda == "USD" ? 3.75m : 4.05m);
    }
}

public class ConReintentos(IFuenteTiposCambio interno, int intentos = 3) : IFuenteTiposCambio
{
    public async Task<decimal> ObtenerAsync(string moneda)
    {
        for (var intento = 1; ; intento++)
        {
            try
            {
                return await interno.ObtenerAsync(moneda);
            }
            catch (TimeoutException) when (intento < intentos)
            {
                Console.WriteLine($"  reintento {intento}...");
            }
        }
    }
}

public class ConCache(IFuenteTiposCambio interno, TimeSpan duracion) : IFuenteTiposCambio
{
    private readonly Dictionary<string, (decimal Valor, DateTime Expira)> _cache = [];

    public async Task<decimal> ObtenerAsync(string moneda)
    {
        if (_cache.TryGetValue(moneda, out var guardado) && guardado.Expira > DateTime.UtcNow)
            return guardado.Valor;

        var valor = await interno.ObtenerAsync(moneda);
        _cache[moneda] = (valor, DateTime.UtcNow + duracion);
        return valor;
    }
}

public class ConLog(IFuenteTiposCambio interno) : IFuenteTiposCambio
{
    public Task<decimal> ObtenerAsync(string moneda)
    {
        Console.WriteLine($"→ consultando {moneda}");
        return interno.ObtenerAsync(moneda);
    }
}
