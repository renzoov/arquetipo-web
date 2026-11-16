<?php
// La implementación es una interfaz y la abstracción una clase `abstract` que la recibe con
// promoción de propiedades (`protected readonly Renderizador $salida`). Para que el ejemplo se pueda
// ejecutar, los formatos son Markdown y CSV; en producción serían PDF o Excel.

declare(strict_types=1);

interface Renderizador
{
    public function titulo(string $texto): void;
    /** @param list<string> $columnas @param list<list<string>> $filas */
    public function tabla(array $columnas, array $filas): void;
    public function generar(): string;
}

final class RenderizadorMarkdown implements Renderizador
{
    /** @var list<string> */
    private array $lineas = [];

    public function titulo(string $texto): void { $this->lineas[] = "# {$texto}"; }

    public function tabla(array $columnas, array $filas): void
    {
        $this->lineas[] = '| ' . implode(' | ', $columnas) . ' |';
        foreach ($filas as $fila) $this->lineas[] = '| ' . implode(' | ', $fila) . ' |';
    }

    public function generar(): string { return implode("\n", $this->lineas); }
}

final class RenderizadorCsv implements Renderizador
{
    /** @var list<string> */
    private array $lineas = [];

    public function titulo(string $texto): void {} // un CSV no tiene título

    public function tabla(array $columnas, array $filas): void
    {
        $this->lineas[] = implode(',', $columnas);
        foreach ($filas as $fila) $this->lineas[] = implode(',', $fila);
    }

    public function generar(): string { return implode("\n", $this->lineas); }
}

// Abstracción: guarda el "puente" hacia la implementación
abstract class Reporte
{
    public function __construct(protected readonly Renderizador $salida) {}

    abstract public function exportar(): string;
}

final class ReporteVentas extends Reporte
{
    public function exportar(): string
    {
        $this->salida->titulo('Ventas de noviembre');
        $this->salida->tabla(['producto', 'unidades'], [['Teclado', '12'], ['Monitor', '4']]);
        return $this->salida->generar();
    }
}

final class ReporteInventario extends Reporte
{
    public function exportar(): string
    {
        $this->salida->titulo('Inventario');
        $this->salida->tabla(['sku', 'stock'], [['TEC-01', '30'], ['MON-02', '0']]);
        return $this->salida->generar();
    }
}

echo (new ReporteVentas(new RenderizadorMarkdown()))->exportar(), "\n";
echo (new ReporteInventario(new RenderizadorCsv()))->exportar(), "\n";
