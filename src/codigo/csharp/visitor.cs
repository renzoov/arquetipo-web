// La sobrecarga de métodos hace natural el doble despacho: cada producto llama a `visitante.Visitar(this)`
// y el compilador elige la sobrecarga según su tipo. El visitante es genérico en su resultado. Al
// final, la alternativa moderna: una expresión `switch` con patrones de tipo.

IProducto[] carrito =
[
    new ProductoFisico("Teclado", 100, 1.2m),
    new ProductoDigital("Curso de patrones", 50),
    new Suscripcion("Plan Pro", 15, 12),
];

Console.WriteLine($"Envío: {carrito.Sum(p => p.Aceptar(new CostoEnvio())):F2}");        // 5.40
Console.WriteLine($"Impuestos: {carrito.Sum(p => p.Aceptar(new Impuestos())):F2}");     // 59.40

foreach (var producto in carrito)
    Console.WriteLine(ExportarContable(producto));

// Alternativa moderna: un switch con patrones de tipo, sin Aceptar ni Visitar
static string ExportarContable(IProducto producto) => producto switch
{
    ProductoFisico p => $"MERCADERIA|{p.Nombre}|{p.Precio}",
    ProductoDigital p => $"SERVICIO-DIGITAL|{p.Nombre}|{p.Precio}",
    Suscripcion s => $"SUSCRIPCION|{s.Nombre}|{s.PrecioMensual * s.Meses}",
    _ => throw new ArgumentOutOfRangeException(nameof(producto)),
};

public interface IVisitante<T>
{
    T Visitar(ProductoFisico producto);
    T Visitar(ProductoDigital producto);
    T Visitar(Suscripcion producto);
}

public interface IProducto
{
    T Aceptar<T>(IVisitante<T> visitante);
}

public record ProductoFisico(string Nombre, decimal Precio, decimal PesoKg) : IProducto
{
    public T Aceptar<T>(IVisitante<T> visitante) => visitante.Visitar(this); // doble despacho
}

public record ProductoDigital(string Nombre, decimal Precio) : IProducto
{
    public T Aceptar<T>(IVisitante<T> visitante) => visitante.Visitar(this);
}

public record Suscripcion(string Nombre, decimal PrecioMensual, int Meses) : IProducto
{
    public T Aceptar<T>(IVisitante<T> visitante) => visitante.Visitar(this);
}

public class CostoEnvio : IVisitante<decimal>
{
    public decimal Visitar(ProductoFisico producto) => producto.PesoKg * 4.5m;
    public decimal Visitar(ProductoDigital producto) => 0;
    public decimal Visitar(Suscripcion producto) => 0;
}

public class Impuestos : IVisitante<decimal>
{
    public decimal Visitar(ProductoFisico producto) => producto.Precio * 0.18m;
    public decimal Visitar(ProductoDigital producto) => producto.Precio * 0.18m;
    public decimal Visitar(Suscripcion producto) => producto.PrecioMensual * producto.Meses * 0.18m;
}
