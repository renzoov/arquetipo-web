<?php
// PHP trae el patrón en el lenguaje: `clone` copia un objeto y el método mágico `__clone()` se
// ejecuta sobre la copia para completar la copia profunda. Los arrays ya se copian por valor, pero los
// objetos que contienen no: `__clone()` clona cada cobertura.

declare(strict_types=1);

final class Cobertura
{
    public function __construct(public string $nombre, public float $deducible) {}
}

final class Poliza
{
    /** @param list<Cobertura> $coberturas @param list<string> $clausulas */
    public function __construct(
        public readonly string $producto,
        private array $coberturas,
        private readonly array $clausulas,
    ) {}

    public function __clone()
    {
        // Copia profunda de lo mutable; las cláusulas son texto inmutable
        $this->coberturas = array_map(fn (Cobertura $c) => clone $c, $this->coberturas);
    }

    public function agregarCobertura(Cobertura $cobertura): static
    {
        $this->coberturas[] = $cobertura;
        return $this;
    }

    public function cobertura(int $indice): Cobertura
    {
        return $this->coberturas[$indice];
    }

    public function resumen(): string
    {
        $nombres = implode(', ', array_map(fn (Cobertura $c) => $c->nombre, $this->coberturas));
        return sprintf('%s: %s (%d cláusulas)', $this->producto, $nombres, count($this->clausulas));
    }
}

// Registro de prototipos: plantillas configuradas una sola vez
$plantillas = [
    'auto-total' => new Poliza(
        'Auto Total',
        [new Cobertura('Choque', 500), new Cobertura('Robo', 800)],
        ['Vigencia anual', 'Cobertura nacional'],
    ),
];

$poliza = clone $plantillas['auto-total'];
$poliza->cobertura(0)->deducible = 0; // descuento para este cliente
$poliza->agregarCobertura(new Cobertura('Auto de reemplazo', 0));

echo $poliza->resumen(), "\n";                     // Auto Total: Choque, Robo, Auto de reemplazo (2 cláusulas)
echo $plantillas['auto-total']->resumen(), "\n";   // Auto Total: Choque, Robo (2 cláusulas)
echo 'Deducible de la plantilla: ', $plantillas['auto-total']->cobertura(0)->deducible, "\n"; // 500
