// El mediador decide con un `switch` de patrones de tipo (`case SelectorCategoria c`) qué hacer según
// quién avisó. Ojo: librerías como MediatR toman el nombre, pero funcionan como un despachador de
// mensajes; esto es el Mediator clásico, que coordina componentes que colaboran entre sí.

var panel = new PanelFiltros();

panel.Categoria.Elegir("laptops");
Console.WriteLine($"{string.Join(", ", panel.Marca.Opciones)} · {panel.Resultados}"); // Premium, Económica · 25 resultados

panel.Marca.Elegir("Premium");
Console.WriteLine($"{panel.Precio} · {panel.Resultados}"); // (500, 3000) · 8 resultados

panel.Limpiar.Pulsar();
Console.WriteLine(panel.Resultados); // 120 resultados

public interface IMediador
{
    void Notificar(object origen);
}

public abstract class Componente(IMediador mediador)
{
    protected void Avisar() => mediador.Notificar(this);
}

public class SelectorCategoria(IMediador mediador) : Componente(mediador)
{
    public string Valor { get; set; } = "";
    public void Elegir(string categoria) { Valor = categoria; Avisar(); }
}

public class SelectorMarca(IMediador mediador) : Componente(mediador)
{
    public string Valor { get; set; } = "";
    public string[] Opciones { get; set; } = [];
    public void Elegir(string marca) { Valor = marca; Avisar(); }
}

public class BotonLimpiar(IMediador mediador) : Componente(mediador)
{
    public void Pulsar() => Avisar();
}

public class PanelFiltros : IMediador
{
    private static readonly Dictionary<string, string[]> Catalogo = new()
    {
        ["laptops"] = ["Premium", "Económica"],
        ["celulares"] = ["Premium"],
    };
    private static readonly (decimal Min, decimal Max) SinLimite = (0, decimal.MaxValue);

    public SelectorCategoria Categoria { get; }
    public SelectorMarca Marca { get; }
    public BotonLimpiar Limpiar { get; }
    public (decimal Min, decimal Max) Precio { get; private set; } = SinLimite;
    public string Resultados { get; private set; } = "";

    public PanelFiltros()
    {
        Categoria = new SelectorCategoria(this);
        Marca = new SelectorMarca(this);
        Limpiar = new BotonLimpiar(this);
    }

    public void Notificar(object origen)
    {
        switch (origen)
        {
            case BotonLimpiar:
                Categoria.Valor = Marca.Valor = "";
                Marca.Opciones = [];
                Precio = SinLimite;
                break;
            case SelectorCategoria categoria:
                Marca.Opciones = Catalogo.GetValueOrDefault(categoria.Valor, []);
                Marca.Valor = "";
                Precio = SinLimite;
                break;
            case SelectorMarca marca:
                Precio = marca.Valor == "Premium" ? (500, 3000) : (0, 800);
                break;
        }
        var total = Categoria.Valor == "" ? 120 : Marca.Valor == "" ? 25 : 8;
        Resultados = $"{total} resultados";
    }
}
