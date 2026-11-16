// El método plantilla se declara `final`, así ninguna subclase puede cambiar el orden de los pasos.
// Los pasos obligatorios son `abstract` y los ganchos son métodos `protected` con una implementación
// por defecto que las subclases pueden sobrescribir.

void main() {
    IO.println(new NominaPlanilla().calcularNomina(new Empleado("Ana", 4000, 0, 0, 0, 2)));
    IO.println(new NominaPracticante().calcularNomina(new Empleado("Leo", 0, 1200, 0, 0, 0)));
    IO.println(new NominaPorHoras().calcularNomina(new Empleado("Rosa", 0, 0, 80, 25, 0)));
}

record Empleado(String nombre, double sueldoBase, double subvencion, double horas, double tarifaHora, int hijos) {}

record Boleta(String empleado, double bruto, double descuentos, double bonificaciones, double neto) {}

abstract class CalculoNomina {
    // Método plantilla: `final`, el orden de los pasos no se puede cambiar
    final Boleta calcularNomina(Empleado e) {
        var bruto = ingresoBruto(e);
        var descuentos = aportaPension() ? redondear(bruto * 0.13) : 0;
        var bonificaciones = bonificaciones(e);
        return new Boleta(e.nombre(), bruto, descuentos, bonificaciones, redondear(bruto - descuentos + bonificaciones));
    }

    protected abstract double ingresoBruto(Empleado e);           // paso obligatorio

    protected double bonificaciones(Empleado e) { return 0; }      // gancho

    protected boolean aportaPension() { return true; }             // gancho

    private static double redondear(double valor) {
        return Math.round(valor * 100) / 100.0;
    }
}

class NominaPlanilla extends CalculoNomina {
    @Override protected double ingresoBruto(Empleado e) { return e.sueldoBase(); }
    @Override protected double bonificaciones(Empleado e) { return e.hijos() > 0 ? 100 : 0; }
}

class NominaPracticante extends CalculoNomina {
    @Override protected double ingresoBruto(Empleado e) { return e.subvencion(); }
    @Override protected boolean aportaPension() { return false; }
}

class NominaPorHoras extends CalculoNomina {
    @Override protected double ingresoBruto(Empleado e) { return e.horas() * e.tarifaHora(); }
}
