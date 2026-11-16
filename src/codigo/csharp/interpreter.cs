// Las expresiones son `record` y la clase base sobrecarga los operadores `&` y `|`, así que una regla
// se escribe en C# casi igual que en el mini-lenguaje de promociones:
// `(new TotalMayorQue(100) & new EsClienteFrecuente()) | new CuponIgual("VERANO")`.

var regla = (new TotalMayorQue(100) & new EsClienteFrecuente()) | new CuponIgual("VERANO");

Console.WriteLine(regla.Describir());                                                // ((total > 100 Y cliente_frecuente) O cupon = "VERANO")
Console.WriteLine(regla.Interpretar(new Carrito(150, ClienteFrecuente: true)));      // True
Console.WriteLine(regla.Interpretar(new Carrito(150, ClienteFrecuente: false)));     // False
Console.WriteLine(regla.Interpretar(new Carrito(20, false, Cupon: "VERANO")));       // True

public record Carrito(decimal Total, bool ClienteFrecuente, string? Cupon = null);

public abstract record Expresion
{
    public abstract bool Interpretar(Carrito carrito);
    public abstract string Describir();

    public static Expresion operator &(Expresion izquierda, Expresion derecha) => new Y(izquierda, derecha);
    public static Expresion operator |(Expresion izquierda, Expresion derecha) => new O(izquierda, derecha);
}

public sealed record TotalMayorQue(decimal Limite) : Expresion
{
    public override bool Interpretar(Carrito carrito) => carrito.Total > Limite;
    public override string Describir() => $"total > {Limite}";
}

public sealed record EsClienteFrecuente : Expresion
{
    public override bool Interpretar(Carrito carrito) => carrito.ClienteFrecuente;
    public override string Describir() => "cliente_frecuente";
}

public sealed record CuponIgual(string Codigo) : Expresion
{
    public override bool Interpretar(Carrito carrito) => carrito.Cupon == Codigo;
    public override string Describir() => $"cupon = \"{Codigo}\"";
}

public sealed record Y(Expresion Izquierda, Expresion Derecha) : Expresion
{
    public override bool Interpretar(Carrito carrito) => Izquierda.Interpretar(carrito) && Derecha.Interpretar(carrito);
    public override string Describir() => $"({Izquierda.Describir()} Y {Derecha.Describir()})";
}

public sealed record O(Expresion Izquierda, Expresion Derecha) : Expresion
{
    public override bool Interpretar(Carrito carrito) => Izquierda.Interpretar(carrito) || Derecha.Interpretar(carrito);
    public override string Describir() => $"({Izquierda.Describir()} O {Derecha.Describir()})";
}
