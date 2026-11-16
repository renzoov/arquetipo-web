// C# es muy cercano al Factory Method clásico: una clase `abstract` declara el método fábrica como
// `abstract` y el compilador obliga a cada subclase a implementarlo con `override`. Los datos van en
// `record` (inmutables, con igualdad por valor) y los lectores transforman las líneas con LINQ.

using System.Globalization;

var ventas = new Dictionary<string, decimal> { ["F-001"] = 150m, ["F-002"] = 80m };

foreach (var diferencia in new ConciliadorBancoAndino().Conciliar("2026-11-01;F-001;150\n2026-11-01;F-002;75", ventas))
    Console.WriteLine(diferencia); // F-002: banco 75, ventas 80

foreach (var diferencia in new ConciliadorBancoPacifico().Conciliar("2026-11-01F-001   150\n2026-11-02F-003   40", ventas))
    Console.WriteLine(diferencia); // F-003: banco 40, ventas sin registro

public record Movimiento(string Fecha, string Referencia, decimal Monto);

public interface ILectorExtracto
{
    IEnumerable<Movimiento> Leer(string contenido);
}

public class LectorCsvAndino : ILectorExtracto
{
    public IEnumerable<Movimiento> Leer(string contenido) =>
        from linea in contenido.Trim().Split('\n')
        let partes = linea.Split(';')
        select new Movimiento(partes[0], partes[1], decimal.Parse(partes[2], CultureInfo.InvariantCulture));
}

public class LectorTxtPacifico : ILectorExtracto
{
    // Ancho fijo: fecha (10) + referencia (8) + monto (resto)
    public IEnumerable<Movimiento> Leer(string contenido) =>
        contenido.Trim().Split('\n').Select(linea => new Movimiento(
            linea[..10], linea[10..18].Trim(), decimal.Parse(linea[18..], CultureInfo.InvariantCulture)));
}

public abstract class Conciliador
{
    // Método fábrica: cada subclase decide qué lector crear
    protected abstract ILectorExtracto CrearLector();

    public IEnumerable<string> Conciliar(string contenido, IReadOnlyDictionary<string, decimal> ventas)
    {
        foreach (var mov in CrearLector().Leer(contenido))
        {
            if (!ventas.TryGetValue(mov.Referencia, out var esperado))
                yield return $"{mov.Referencia}: banco {mov.Monto}, ventas sin registro";
            else if (esperado != mov.Monto)
                yield return $"{mov.Referencia}: banco {mov.Monto}, ventas {esperado}";
        }
    }
}

public class ConciliadorBancoAndino : Conciliador
{
    protected override ILectorExtracto CrearLector() => new LectorCsvAndino();
}

public class ConciliadorBancoPacifico : Conciliador
{
    protected override ILectorExtracto CrearLector() => new LectorTxtPacifico();
}
