// Cada estado es una clase. La base `EstadoPedido` rechaza por defecto todas las acciones con métodos
// `virtual`, y cada estado solo sobrescribe (`override`) lo que permite. Como los estados no tienen
// datos propios, se reutiliza una sola instancia de cada uno (`static readonly`).

var a = new Pedido("A-1");
a.Pagar();
a.Enviar();
try
{
    a.Cancelar();
}
catch (InvalidOperationException error)
{
    Console.WriteLine($"  {error.Message}"); // No se puede cancelar un pedido enviado
}

var b = new Pedido("B-2");
b.Pagar();
b.Cancelar(); // reembolsa y cancela

public abstract class EstadoPedido(string nombre)
{
    public string Nombre { get; } = nombre;

    public virtual void Pagar(Pedido pedido) => throw Prohibido("pagar");
    public virtual void Enviar(Pedido pedido) => throw Prohibido("enviar");
    public virtual void Cancelar(Pedido pedido) => throw Prohibido("cancelar");

    private InvalidOperationException Prohibido(string accion) => new($"No se puede {accion} un pedido {Nombre}");
}

public sealed class Pendiente() : EstadoPedido("pendiente")
{
    public override void Pagar(Pedido pedido) => pedido.CambiarEstado(Estados.Pagado);
    public override void Cancelar(Pedido pedido) => pedido.CambiarEstado(Estados.Cancelado);
}

public sealed class Pagado() : EstadoPedido("pagado")
{
    public override void Enviar(Pedido pedido) => pedido.CambiarEstado(Estados.Enviado);

    public override void Cancelar(Pedido pedido)
    {
        Console.WriteLine($"  reembolso del pedido {pedido.Id}");
        pedido.CambiarEstado(Estados.Cancelado);
    }
}

public sealed class Enviado() : EstadoPedido("enviado");
public sealed class Cancelado() : EstadoPedido("cancelado");

public static class Estados
{
    public static readonly EstadoPedido Pendiente = new Pendiente();
    public static readonly EstadoPedido Pagado = new Pagado();
    public static readonly EstadoPedido Enviado = new Enviado();
    public static readonly EstadoPedido Cancelado = new Cancelado();
}

public class Pedido(string id)
{
    private EstadoPedido _estado = Estados.Pendiente;

    public string Id { get; } = id;

    public void CambiarEstado(EstadoPedido nuevo)
    {
        Console.WriteLine($"  {Id}: {_estado.Nombre} → {nuevo.Nombre}");
        _estado = nuevo;
    }

    public void Pagar() => _estado.Pagar(this);
    public void Enviar() => _estado.Enviar(this);
    public void Cancelar() => _estado.Cancelar(this);
}
