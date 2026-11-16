// C# tiene el patrón dentro del lenguaje: `event` con `EventHandler<T>`. Suscribirse es `+=` y darse
// de baja `-=`. Para que el fallo de un suscriptor no impida avisar a los demás, se recorre
// `GetInvocationList()` y se llama a cada uno dentro de un try/catch.

var pagos = new ServicioPagos();
EventHandler<Pedido> emitirFactura = (_, pedido) => Console.WriteLine($"  factura emitida por {pedido.Total}");

pagos.PedidoPagado += (_, pedido) => Console.WriteLine($"  correo de confirmación para {pedido.Id}");
pagos.PedidoPagado += (_, _) => throw new InvalidOperationException("inventario no disponible");
pagos.PedidoPagado += emitirFactura;

pagos.Pagar(new Pedido("P-1", 250m));

pagos.PedidoPagado -= emitirFactura; // se da de baja
pagos.Pagar(new Pedido("P-2", 90m)); // ya no se emite factura

public record Pedido(string Id, decimal Total);

public class ServicioPagos
{
    public event EventHandler<Pedido>? PedidoPagado;

    public void Pagar(Pedido pedido)
    {
        Console.WriteLine($"Pedido {pedido.Id} cobrado");
        var suscriptores = PedidoPagado?.GetInvocationList().Cast<EventHandler<Pedido>>() ?? [];
        foreach (var suscriptor in suscriptores)
        {
            try
            {
                suscriptor(this, pedido);
            }
            catch (Exception error)
            {
                Console.WriteLine($"  ⚠ un suscriptor falló: {error.Message}");
            }
        }
    }
}
