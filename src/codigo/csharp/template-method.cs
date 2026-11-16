// En C# los métodos no son `virtual` por defecto: el método plantilla es un método normal y las
// subclases no pueden sobrescribirlo. Los pasos obligatorios son `abstract` y los ganchos `virtual`,
// con una implementación por defecto que cada subclase puede cambiar.

Console.WriteLine(new NominaPlanilla().CalcularNomina(new Empleado("Ana") { SueldoBase = 4000, Hijos = 2 }));
Console.WriteLine(new NominaPracticante().CalcularNomina(new Empleado("Leo") { Subvencion = 1200 }));
Console.WriteLine(new NominaPorHoras().CalcularNomina(new Empleado("Rosa") { Horas = 80, TarifaHora = 25 }));

public record Empleado(string Nombre)
{
    public decimal SueldoBase { get; init; }
    public decimal Subvencion { get; init; }
    public decimal Horas { get; init; }
    public decimal TarifaHora { get; init; }
    public int Hijos { get; init; }
}

public record Boleta(string Empleado, decimal Bruto, decimal Descuentos, decimal Bonificaciones, decimal Neto);

public abstract class CalculoNomina
{
    // Método plantilla: no es virtual, así que el orden de los pasos no se puede cambiar
    public Boleta CalcularNomina(Empleado e)
    {
        var bruto = IngresoBruto(e);
        var descuentos = AportaPension ? Math.Round(bruto * 0.13m, 2) : 0;
        var bonificaciones = Bonificaciones(e);
        return new Boleta(e.Nombre, bruto, descuentos, bonificaciones, bruto - descuentos + bonificaciones);
    }

    protected abstract decimal IngresoBruto(Empleado e);         // paso obligatorio
    protected virtual decimal Bonificaciones(Empleado e) => 0;   // gancho
    protected virtual bool AportaPension => true;                // gancho
}

public class NominaPlanilla : CalculoNomina
{
    protected override decimal IngresoBruto(Empleado e) => e.SueldoBase;
    protected override decimal Bonificaciones(Empleado e) => e.Hijos > 0 ? 100 : 0;
}

public class NominaPracticante : CalculoNomina
{
    protected override decimal IngresoBruto(Empleado e) => e.Subvencion;
    protected override bool AportaPension => false;
}

public class NominaPorHoras : CalculoNomina
{
    protected override decimal IngresoBruto(Empleado e) => e.Horas * e.TarifaHora;
}
