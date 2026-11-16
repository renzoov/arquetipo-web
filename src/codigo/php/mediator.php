<?php
// El mediador decide qué hacer con `match (true)` y comprobaciones `instanceof`, una forma muy usada
// en PHP para despachar según el tipo del componente que avisó. Cada componente solo conoce al
// mediador, que recibe con promoción de propiedades.

declare(strict_types=1);

interface Mediador
{
    public function notificar(object $origen): void;
}

abstract class Componente
{
    public function __construct(protected readonly Mediador $mediador) {}
}

final class SelectorCategoria extends Componente
{
    public string $valor = '';
    public function elegir(string $categoria): void { $this->valor = $categoria; $this->mediador->notificar($this); }
}

final class SelectorMarca extends Componente
{
    public string $valor = '';
    /** @var list<string> */
    public array $opciones = [];
    public function elegir(string $marca): void { $this->valor = $marca; $this->mediador->notificar($this); }
}

final class BotonLimpiar extends Componente
{
    public function pulsar(): void { $this->mediador->notificar($this); }
}

final class PanelFiltros implements Mediador
{
    private const CATALOGO = ['laptops' => ['Premium', 'Económica'], 'celulares' => ['Premium']];

    public readonly SelectorCategoria $categoria;
    public readonly SelectorMarca $marca;
    public readonly BotonLimpiar $limpiar;
    /** @var array{0: int, 1: int}|null */
    public ?array $precio = null;
    public string $resultados = '';

    public function __construct()
    {
        $this->categoria = new SelectorCategoria($this);
        $this->marca = new SelectorMarca($this);
        $this->limpiar = new BotonLimpiar($this);
    }

    public function notificar(object $origen): void
    {
        match (true) {
            $origen instanceof BotonLimpiar => $this->reiniciar(),
            $origen instanceof SelectorCategoria => $this->alCambiarCategoria($origen->valor),
            $origen instanceof SelectorMarca => $this->precio = $origen->valor === 'Premium' ? [500, 3000] : [0, 800],
            default => null,
        };
        $total = $this->categoria->valor === '' ? 120 : ($this->marca->valor === '' ? 25 : 8);
        $this->resultados = "{$total} resultados";
    }

    private function alCambiarCategoria(string $categoria): void
    {
        $this->marca->opciones = self::CATALOGO[$categoria] ?? [];
        $this->marca->valor = '';
        $this->precio = null;
    }

    private function reiniciar(): void
    {
        $this->categoria->valor = $this->marca->valor = '';
        $this->marca->opciones = [];
        $this->precio = null;
    }
}

$panel = new PanelFiltros();

$panel->categoria->elegir('laptops');
echo implode(', ', $panel->marca->opciones), " · {$panel->resultados}\n"; // Premium, Económica · 25 resultados

$panel->marca->elegir('Premium');
echo implode('-', $panel->precio ?? []), " · {$panel->resultados}\n";      // 500-3000 · 8 resultados

$panel->limpiar->pulsar();
echo $panel->resultados, "\n";                                            // 120 resultados
