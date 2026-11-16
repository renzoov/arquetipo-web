<?php
// El método plantilla se declara `final public`, así ninguna subclase puede cambiar el orden de los
// pasos. Los pasos obligatorios son `abstract protected` y los ganchos son métodos `protected` con
// una implementación por defecto.

declare(strict_types=1);

final readonly class Empleado
{
    public function __construct(
        public string $nombre,
        public float $sueldoBase = 0,
        public float $subvencion = 0,
        public float $horas = 0,
        public float $tarifaHora = 0,
        public int $hijos = 0,
    ) {}
}

abstract class CalculoNomina
{
    // Método plantilla: `final`, el orden de los pasos no se puede cambiar
    final public function calcularNomina(Empleado $e): string
    {
        $bruto = $this->ingresoBruto($e);
        $descuentos = $this->aportaPension() ? round($bruto * 0.13, 2) : 0.0;
        $bonificaciones = $this->bonificaciones($e);
        $neto = round($bruto - $descuentos + $bonificaciones, 2);
        return "{$e->nombre}: bruto {$bruto}, descuentos {$descuentos}, bonificaciones {$bonificaciones}, neto {$neto}";
    }

    abstract protected function ingresoBruto(Empleado $e): float;          // paso obligatorio

    protected function bonificaciones(Empleado $e): float { return 0.0; }   // gancho

    protected function aportaPension(): bool { return true; }               // gancho
}

final class NominaPlanilla extends CalculoNomina
{
    protected function ingresoBruto(Empleado $e): float { return $e->sueldoBase; }
    protected function bonificaciones(Empleado $e): float { return $e->hijos > 0 ? 100.0 : 0.0; }
}

final class NominaPracticante extends CalculoNomina
{
    protected function ingresoBruto(Empleado $e): float { return $e->subvencion; }
    protected function aportaPension(): bool { return false; }
}

final class NominaPorHoras extends CalculoNomina
{
    protected function ingresoBruto(Empleado $e): float { return $e->horas * $e->tarifaHora; }
}

echo (new NominaPlanilla())->calcularNomina(new Empleado('Ana', sueldoBase: 4000, hijos: 2)), "\n";
echo (new NominaPracticante())->calcularNomina(new Empleado('Leo', subvencion: 1200)), "\n";
echo (new NominaPorHoras())->calcularNomina(new Empleado('Rosa', horas: 80, tarifaHora: 25)), "\n";
// Ana: bruto 4000, descuentos 520, bonificaciones 100, neto 3580 · ...
