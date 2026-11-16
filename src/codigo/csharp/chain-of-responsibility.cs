// Así funciona el pipeline de middlewares de ASP.NET Core: cada control es un delegado que recibe el
// pago y la función `siguiente`. Si detecta un problema devuelve el rechazo sin llamar a `siguiente`,
// y `Pipeline.Construir` arma la cadena a partir de una lista de controles.

var revisar = Pipeline.Construir(
    Controles.ListaBloqueo,
    Controles.LimiteDiario(1000m),
    Controles.MismoPais);

var pago = new Pago("4111111111111111", "cli-2", 120m, "PE", "PE");
Console.WriteLine(revisar(pago));                               // Resultado { Aprobado = True, Motivo =  }
Console.WriteLine(revisar(pago with { Cliente = "cli-1" }));    // Motivo = Supera el límite diario
Console.WriteLine(revisar(pago with { PaisConexion = "RU" }));  // Motivo = El país de conexión no coincide

public record Pago(string Tarjeta, string Cliente, decimal Monto, string PaisTarjeta, string PaisConexion);
public record Resultado(bool Aprobado, string? Motivo = null);

public delegate Resultado Control(Pago pago, Func<Pago, Resultado> siguiente);

public static class Controles
{
    private static readonly HashSet<string> TarjetasBloqueadas = ["4000000000000002"];
    private static readonly Dictionary<string, decimal> GastadoHoy = new() { ["cli-1"] = 900m };

    public static Resultado ListaBloqueo(Pago pago, Func<Pago, Resultado> siguiente) =>
        TarjetasBloqueadas.Contains(pago.Tarjeta) ? new(false, "Tarjeta bloqueada") : siguiente(pago);

    public static Control LimiteDiario(decimal limite) => (pago, siguiente) =>
        GastadoHoy.GetValueOrDefault(pago.Cliente) + pago.Monto > limite
            ? new(false, "Supera el límite diario")
            : siguiente(pago);

    public static Resultado MismoPais(Pago pago, Func<Pago, Resultado> siguiente) =>
        pago.PaisTarjeta != pago.PaisConexion ? new(false, "El país de conexión no coincide") : siguiente(pago);
}

public static class Pipeline
{
    public static Func<Pago, Resultado> Construir(params Control[] controles)
    {
        Func<Pago, Resultado> cadena = _ => new Resultado(true); // final: todo en orden
        for (var i = controles.Length - 1; i >= 0; i--)
        {
            var control = controles[i];
            var siguiente = cadena;
            cadena = pago => control(pago, siguiente);
        }
        return cadena;
    }
}
