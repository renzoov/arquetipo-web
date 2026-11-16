<?php
// Cada decorador implementa la misma interfaz y recibe al envuelto con promoción de propiedades
// (`private FuenteTiposCambio $interno`). Es el mismo diseño de los clientes HTTP compatibles con PSR-18,
// que se envuelven para añadir reintentos, caché o registro.

declare(strict_types=1);

interface FuenteTiposCambio
{
    public function obtener(string $moneda): float;
}

final class ApiTiposCambio implements FuenteTiposCambio
{
    private int $llamadas = 0;

    public function obtener(string $moneda): float
    {
        if (++$this->llamadas === 1) throw new RuntimeException('Tiempo de espera agotado'); // el proveedor falla a veces
        return $moneda === 'USD' ? 3.75 : 4.05;
    }
}

final readonly class ConReintentos implements FuenteTiposCambio
{
    public function __construct(private FuenteTiposCambio $interno, private int $intentos = 3) {}

    public function obtener(string $moneda): float
    {
        for ($intento = 1; ; $intento++) {
            try {
                return $this->interno->obtener($moneda);
            } catch (RuntimeException $error) {
                if ($intento >= $this->intentos) throw $error;
                echo "  reintento {$intento}...\n";
            }
        }
    }
}

final class ConCache implements FuenteTiposCambio
{
    /** @var array<string, array{valor: float, expira: int}> */
    private array $cache = [];

    public function __construct(private readonly FuenteTiposCambio $interno, private readonly int $segundos = 300) {}

    public function obtener(string $moneda): float
    {
        $guardado = $this->cache[$moneda] ?? null;
        if ($guardado !== null && $guardado['expira'] > time()) return $guardado['valor'];

        $valor = $this->interno->obtener($moneda);
        $this->cache[$moneda] = ['valor' => $valor, 'expira' => time() + $this->segundos];
        return $valor;
    }
}

final readonly class ConLog implements FuenteTiposCambio
{
    public function __construct(private FuenteTiposCambio $interno) {}

    public function obtener(string $moneda): float
    {
        echo "→ consultando {$moneda}\n";
        return $this->interno->obtener($moneda);
    }
}

// El orden importa: la caché va por fuera para no registrar ni reintentar lo que ya está guardado
$fuente = new ConCache(new ConLog(new ConReintentos(new ApiTiposCambio())));

echo $fuente->obtener('USD'), "\n"; // → consultando USD, reintento 1..., 3.75
echo $fuente->obtener('USD'), "\n"; // 3.75 (desde la caché)
