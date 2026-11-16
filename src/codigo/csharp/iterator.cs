// `async` + `yield return` crea un `IAsyncEnumerable<T>`: un iterador que espera cada página sin
// bloquear el hilo. El cliente lo recorre con `await foreach`, y si sale del bucle con `break`, no se
// piden más páginas.

var crm = new ApiCrm();
await foreach (var cliente in ClientesCrm.Recorrer(crm))
    Console.WriteLine(cliente.Nombre);
Console.WriteLine($"Peticiones a la API: {crm.Peticiones}"); // 3

var otroCrm = new ApiCrm();
await foreach (var cliente in ClientesCrm.Recorrer(otroCrm))
{
    if (cliente.Id == 2) break;
}
Console.WriteLine($"Peticiones a la API: {otroCrm.Peticiones}"); // 1

public record Cliente(int Id, string Nombre);
public record Pagina(IReadOnlyList<Cliente> Datos, string? SiguienteCursor);

public class ApiCrm
{
    private readonly Cliente[] _clientes = [new(1, "Ana"), new(2, "Luis"), new(3, "Marta"), new(4, "Jorge"), new(5, "Elena")];

    public int Peticiones { get; private set; }

    public async Task<Pagina> ListarClientesAsync(int limite, string? cursor)
    {
        await Task.Yield(); // simula la llamada HTTP
        Peticiones++;
        var desde = cursor is null ? 0 : int.Parse(cursor);
        var hasta = Math.Min(desde + limite, _clientes.Length);
        return new Pagina(_clientes[desde..hasta], hasta < _clientes.Length ? hasta.ToString() : null);
    }
}

public static class ClientesCrm
{
    public static async IAsyncEnumerable<Cliente> Recorrer(ApiCrm api, int limite = 2)
    {
        string? cursor = null;
        do
        {
            var pagina = await api.ListarClientesAsync(limite, cursor);
            foreach (var cliente in pagina.Datos) yield return cliente;
            cursor = pagina.SiguienteCursor;
        } while (cursor is not null);
    }
}
