// El resultado es una jerarquía de `record` sellados y la traducción de códigos usa una expresión
// `switch`. Quien recibe el resultado lo procesa con patrones de tipo, sin casts. El adaptador
// recibe el SDK con un constructor primario.

IPasarelaPago pasarela = new AdaptadorPagoLocal(new SdkPagoLocal());
var tarjeta = new Tarjeta("4111111111111111", "12/28");

foreach (var monto in new[] { 250m, 1500m })
{
    var mensaje = pasarela.Cobrar(monto, tarjeta) switch
    {
        Aprobado a => $"aprobado → {a.Operacion}",
        Rechazado r => $"rechazado → {r.Motivo}",
        Reintentar => "reintentar más tarde",
        _ => "resultado desconocido",
    };
    Console.WriteLine(mensaje); // aprobado → TX-tok_1111 · rechazado → Código del proveedor 05
}

public record Tarjeta(string Numero, string Vencimiento);

public abstract record ResultadoPago;
public sealed record Aprobado(string Operacion) : ResultadoPago;
public sealed record Rechazado(string Motivo) : ResultadoPago;
public sealed record Reintentar : ResultadoPago;

public interface IPasarelaPago
{
    ResultadoPago Cobrar(decimal monto, Tarjeta tarjeta);
}

// SDK de un tercero: no se puede modificar
public class SdkPagoLocal
{
    public string Tokenizar(Tarjeta tarjeta) => $"tok_{tarjeta.Numero[^4..]}";

    public (string Codigo, string Id) CrearTransaccion(long importeCentimos, string token) =>
        importeCentimos > 100_000 ? ("05", "") : ("00", $"TX-{token}");
}

public class AdaptadorPagoLocal(SdkPagoLocal sdk) : IPasarelaPago
{
    public ResultadoPago Cobrar(decimal monto, Tarjeta tarjeta)
    {
        var (codigo, id) = sdk.CrearTransaccion((long)Math.Round(monto * 100), sdk.Tokenizar(tarjeta));
        return codigo switch
        {
            "00" => new Aprobado(id),
            "91" => new Reintentar(),
            _ => new Rechazado($"Código del proveedor {codigo}"),
        };
    }
}
