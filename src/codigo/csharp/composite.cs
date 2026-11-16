// Hoja y compuesto implementan `IMiembroOrganizacion`. El compuesto suma con LINQ (`Sum`) y aplana el
// árbol con `SelectMany`; la hoja usa `yield return`, así que el recorrido es perezoso y no crea
// listas intermedias.

var tecnologia = new Area("Tecnología",
    new Empleado("Ana", 5200),
    new Area("Equipo Pagos", new Empleado("Luis", 4100), new Empleado("Marta", 3900)));

Console.WriteLine(tecnologia.CostoMensual());                                     // 13200
Console.WriteLine(string.Join(", ", tecnologia.Personas().Select(p => p.Nombre))); // Ana, Luis, Marta

public interface IMiembroOrganizacion
{
    decimal CostoMensual();
    IEnumerable<Empleado> Personas();
}

public record Empleado(string Nombre, decimal Sueldo) : IMiembroOrganizacion
{
    public decimal CostoMensual() => Sueldo;

    public IEnumerable<Empleado> Personas()
    {
        yield return this;
    }
}

public class Area(string nombre, params IMiembroOrganizacion[] miembros) : IMiembroOrganizacion
{
    private readonly List<IMiembroOrganizacion> _miembros = [.. miembros];

    public string Nombre { get; } = nombre;

    public void Agregar(IMiembroOrganizacion miembro) => _miembros.Add(miembro);

    public decimal CostoMensual() => _miembros.Sum(m => m.CostoMensual());

    public IEnumerable<Empleado> Personas() => _miembros.SelectMany(m => m.Personas());
}
