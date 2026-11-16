<?php
// En PHP una estrategia puede ser cualquier `callable`: closures (`fn`), funciones normales tomadas con
// la sintaxis de "first-class callable" (`internacional(...)`) o funciones que devuelven closures para
// las estrategias configurables. El catálogo es un array asociativo, que conserva el orden.

declare(strict_types=1);

final readonly class Pedido
{
    public function __construct(public float $subtotal, public float $pesoKg, public string $pais) {}
}

function tarifaPlana(float $monto): Closure
{
    return fn (Pedido $pedido): float => $monto;
}

function porPeso(float $precioPorKg): Closure
{
    return fn (Pedido $pedido): float => round($pedido->pesoKg * $precioPorKg, 2);
}

function internacional(Pedido $pedido): float
{
    return match ($pedido->pais) {
        'US' => 45.0,
        'ES' => 60.0,
        default => 80.0,
    };
}

/** @param callable(Pedido): float $calcularEnvio */
function totalConEnvio(Pedido $pedido, callable $calcularEnvio): float
{
    return $pedido->subtotal + $calcularEnvio($pedido);
}

$modalidades = [
    'ciudad' => tarifaPlana(10),
    'nacional' => porPeso(4.5),
    'internacional' => internacional(...),
    'campania' => tarifaPlana(0),
];

$pedido = new Pedido(subtotal: 200, pesoKg: 3.2, pais: 'ES');

// La modalidad la elige el cliente en tiempo de ejecución
foreach ($modalidades as $nombre => $calcular) {
    printf("%-14s %s\n", $nombre, totalConEnvio($pedido, $calcular));
}
// ciudad 210 · nacional 214.4 · internacional 260 · campania 200
