// La implementación es una interfaz y la abstracción una clase `abstract` que la recibe por su
// constructor primario. Para que el ejemplo se pueda ejecutar, los formatos son Markdown y CSV; en
// producción serían PDF o Excel.

using System.Text;

Console.WriteLine(new ReporteVentas(new RenderizadorMarkdown()).Exportar());
Console.WriteLine(new ReporteInventario(new RenderizadorCsv()).Exportar());

public interface IRenderizador
{
    void Titulo(string texto);
    void Tabla(string[] columnas, string[][] filas);
    string Generar();
}

public class RenderizadorMarkdown : IRenderizador
{
    private readonly StringBuilder _sb = new();

    public void Titulo(string texto) => _sb.AppendLine($"# {texto}");

    public void Tabla(string[] columnas, string[][] filas)
    {
        _sb.AppendLine($"| {string.Join(" | ", columnas)} |");
        foreach (var fila in filas) _sb.AppendLine($"| {string.Join(" | ", fila)} |");
    }

    public string Generar() => _sb.ToString().TrimEnd();
}

public class RenderizadorCsv : IRenderizador
{
    private readonly StringBuilder _sb = new();

    public void Titulo(string texto) { } // un CSV no tiene título

    public void Tabla(string[] columnas, string[][] filas)
    {
        _sb.AppendLine(string.Join(",", columnas));
        foreach (var fila in filas) _sb.AppendLine(string.Join(",", fila));
    }

    public string Generar() => _sb.ToString().TrimEnd();
}

// Abstracción: guarda el "puente" hacia la implementación
public abstract class Reporte(IRenderizador salida)
{
    protected IRenderizador Salida { get; } = salida;
    public abstract string Exportar();
}

public class ReporteVentas(IRenderizador salida) : Reporte(salida)
{
    public override string Exportar()
    {
        Salida.Titulo("Ventas de noviembre");
        Salida.Tabla(["producto", "unidades"], [["Teclado", "12"], ["Monitor", "4"]]);
        return Salida.Generar();
    }
}

public class ReporteInventario(IRenderizador salida) : Reporte(salida)
{
    public override string Exportar()
    {
        Salida.Titulo("Inventario");
        Salida.Tabla(["sku", "stock"], [["TEC-01", "30"], ["MON-02", "0"]]);
        return Salida.Generar();
    }
}
