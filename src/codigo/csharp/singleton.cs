// `Lazy<T>` crea la instancia la primera vez que se usa y, por defecto, es seguro con varios hilos.
// En ASP.NET Core lo habitual es no escribir el patrón a mano: se registra el servicio con
// `builder.Services.AddSingleton<Configuracion>()` y el contenedor garantiza la instancia única.

var instancias = await Task.WhenAll(Enumerable.Range(0, 10).Select(_ => Task.Run(() => Configuracion.Instancia)));

Console.WriteLine($"10 hilos, misma instancia: {instancias.All(i => ReferenceEquals(i, instancias[0]))}"); // True
Console.WriteLine(Configuracion.Instancia.EstaActiva("pagos.billetera")); // True
Console.WriteLine(Configuracion.Instancia.EstaActiva("envios.express"));  // False

public sealed class Configuracion
{
    private static readonly Lazy<Configuracion> _instancia = new(() => new Configuracion());
    public static Configuracion Instancia => _instancia.Value;

    private readonly Dictionary<string, bool> _flags;

    private Configuracion()
    {
        Console.WriteLine("Cargando configuración (solo ocurre una vez)...");
        _flags = new() { ["pagos.billetera"] = true, ["envios.express"] = false };
    }

    public bool EstaActiva(string flag) => _flags.GetValueOrDefault(flag);
}
