// El modificador `file` (C# 11) hace que las clases del subsistema solo sean visibles dentro de este
// archivo: desde fuera solo existe la fachada `FacturacionElectronica`. Su constructor primario acepta,
// de forma opcional, otra función de envío para usarla en las pruebas.

using System.Text.RegularExpressions;

var facturacion = new FacturacionElectronica();
Console.WriteLine(await facturacion.EmitirAsync(new Venta("000123", "20123456789", 118m)));
// Comprobante { Serie = F001-000123, Constancia = CONSTANCIA-52 }

try
{
    await facturacion.EmitirAsync(new Venta("000125", "123", 10m));
}
catch (ArgumentException error)
{
    Console.WriteLine(error.Message); // Número fiscal inválido: 123
}

// En una prueba, sin llamar a la autoridad tributaria real
var prueba = new FacturacionElectronica(enviar: _ => Task.FromResult("CONSTANCIA-PRUEBA"));
Console.WriteLine(await prueba.EmitirAsync(new Venta("000124", "20123456789", 50m)));

public record Venta(string Id, string NumeroFiscal, decimal Total);
public record Comprobante(string Serie, string Constancia);

// La fachada: lo único público
public class FacturacionElectronica(Func<string, Task<string>>? enviar = null)
{
    public async Task<Comprobante> EmitirAsync(Venta venta)
    {
        ValidadorFiscal.Validar(venta.NumeroFiscal);
        var xmlFirmado = FirmadorDigital.Firmar(GeneradorXml.Crear(venta));
        var constancia = await (enviar ?? AutoridadTributaria.EnviarAsync)(xmlFirmado);
        return new Comprobante($"F001-{venta.Id}", constancia);
    }
}

// ── Subsistema: invisible fuera de este archivo ──
file static class ValidadorFiscal
{
    public static void Validar(string numero)
    {
        if (!Regex.IsMatch(numero, @"^\d{11}$"))
            throw new ArgumentException($"Número fiscal inválido: {numero}");
    }
}

file static class GeneradorXml
{
    public static string Crear(Venta venta) => $"""<Factura id="{venta.Id}" total="{venta.Total:F2}"/>""";
}

file static class FirmadorDigital
{
    public static string Firmar(string xml) => xml.Replace("/>", """ firma="a1b2c3"/>""");
}

file static class AutoridadTributaria
{
    public static Task<string> EnviarAsync(string xmlFirmado) => Task.FromResult($"CONSTANCIA-{xmlFirmado.Length}");
}
