<?php
// PHP no tiene sobrecarga de métodos, así que el despacho por tipo se hace con `match (true)` e
// `instanceof`: cada operación es una función con un caso por tipo de producto. Los totales se
// calculan con el operador pipe `|>` de PHP 8.5, que encadena funciones de izquierda a derecha.

declare(strict_types=1);

final readonly class ProductoFisico { public function __construct(public string $nombre, public float $precio, public float $pesoKg) {} }
final readonly class ProductoDigital { public function __construct(public string $nombre, public float $precio) {} }
final readonly class Suscripcion { public function __construct(public string $nombre, public float $precioMensual, public int $meses) {} }

// ── Operación: costo de envío ──
function costoEnvio(object $producto): float
{
    return match (true) {
        $producto instanceof ProductoFisico => $producto->pesoKg * 4.5,
        $producto instanceof ProductoDigital, $producto instanceof Suscripcion => 0.0,
        default => throw new InvalidArgumentException('Producto no soportado: ' . $producto::class),
    };
}

// ── Operación: impuestos ──
function impuestos(object $producto): float
{
    return match (true) {
        $producto instanceof ProductoFisico, $producto instanceof ProductoDigital => $producto->precio * 0.18,
        $producto instanceof Suscripcion => $producto->precioMensual * $producto->meses * 0.18,
        default => throw new InvalidArgumentException('Producto no soportado: ' . $producto::class),
    };
}

// ── Operación: exportar a contabilidad ──
function exportarContable(object $producto): string
{
    return match (true) {
        $producto instanceof ProductoFisico => "MERCADERIA|{$producto->nombre}|{$producto->precio}",
        $producto instanceof ProductoDigital => "SERVICIO-DIGITAL|{$producto->nombre}|{$producto->precio}",
        $producto instanceof Suscripcion => "SUSCRIPCION|{$producto->nombre}|" . ($producto->precioMensual * $producto->meses),
        default => throw new InvalidArgumentException('Producto no soportado: ' . $producto::class),
    };
}

$carrito = [
    new ProductoFisico('Teclado', 100, 1.2),
    new ProductoDigital('Curso de patrones', 50),
    new Suscripcion('Plan Pro', 15, 12),
];

$envio = array_map(costoEnvio(...), $carrito) |> array_sum(...);
$totalImpuestos = array_map(impuestos(...), $carrito) |> array_sum(...);

printf("Envío: %.2f\n", $envio);              // 5.40
printf("Impuestos: %.2f\n", $totalImpuestos); // 59.40
echo implode("\n", array_map(exportarContable(...), $carrito)), "\n";
