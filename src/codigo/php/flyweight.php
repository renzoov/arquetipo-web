<?php
// El formato compartido es una clase `readonly`: una vez creado, nadie puede cambiarlo. La fábrica
// guarda los formatos en un array asociativo con una clave compuesta y `??=` crea cada uno solo la
// primera vez. `memory_get_usage()` permite comprobar el ahorro.

declare(strict_types=1);

final readonly class Formato
{
    public function __construct(
        public string $fuente,
        public int $tamano,
        public string $color,
        public string $formatoNumero,
    ) {}
}

final class FabricaFormatos
{
    /** @var array<string, Formato> */
    private array $cache = [];

    public function obtener(string $fuente, int $tamano, string $color, string $formatoNumero): Formato
    {
        $clave = "{$fuente}|{$tamano}|{$color}|{$formatoNumero}";
        return $this->cache[$clave] ??= new Formato($fuente, $tamano, $color, $formatoNumero);
    }

    public function total(): int
    {
        return count($this->cache);
    }
}

final class Celda
{
    public function __construct(public int $fila, public int $columna, public string $valor, public Formato $formato) {}
}

$fabrica = new FabricaFormatos();
$celdas = [];
for ($fila = 0; $fila < 1000; $fila++) {
    for ($columna = 0; $columna < 100; $columna++) {
        $formato = $fabrica->obtener('Inter', 11, $fila === 0 ? '#000000' : '#333333', $columna === 0 ? '@' : '#,##0.00');
        $celdas[] = new Celda($fila, $columna, '', $formato);
    }
}

echo count($celdas), " celdas comparten {$fabrica->total()} formatos\n"; // 100000 celdas comparten 4 formatos
var_dump($celdas[101]->formato === $celdas[102]->formato);           // bool(true): el mismo objeto

try {
    $celdas[101]->formato->color = '#ff0000';
} catch (Error $error) {
    echo $error->getMessage(), "\n"; // Cannot modify readonly property Formato::$color
}
