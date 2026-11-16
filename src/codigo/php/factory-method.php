<?php
// PHP sigue el Factory Method clásico: una clase `abstract` declara el método fábrica y cada subclase
// lo implementa; `#[\Override]` (PHP 8.3) hace que PHP avise si el método no sobrescribe nada. Los
// movimientos son clases `readonly` con promoción de propiedades en el constructor.

declare(strict_types=1);

final readonly class Movimiento
{
    public function __construct(public string $referencia, public float $monto) {}
}

interface LectorExtracto
{
    /** @return list<Movimiento> */
    public function leer(string $contenido): array;
}

final class LectorCsvAndino implements LectorExtracto
{
    #[\Override]
    public function leer(string $contenido): array
    {
        return array_map(function (string $linea): Movimiento {
            [, $referencia, $monto] = explode(';', $linea);
            return new Movimiento($referencia, (float) $monto);
        }, explode("\n", trim($contenido)));
    }
}

final class LectorTxtPacifico implements LectorExtracto
{
    // Ancho fijo: fecha (10) + referencia (8) + monto (resto)
    #[\Override]
    public function leer(string $contenido): array
    {
        return array_map(
            fn (string $linea) => new Movimiento(trim(substr($linea, 10, 8)), (float) substr($linea, 18)),
            explode("\n", trim($contenido)),
        );
    }
}

abstract class Conciliador
{
    // Método fábrica: cada subclase decide qué lector crear
    abstract protected function crearLector(): LectorExtracto;

    /**
     * @param array<string, float> $ventas
     * @return list<string>
     */
    public function conciliar(string $contenido, array $ventas): array
    {
        $diferencias = [];
        foreach ($this->crearLector()->leer($contenido) as $mov) {
            $esperado = $ventas[$mov->referencia] ?? null;
            if ($esperado === null) {
                $diferencias[] = "{$mov->referencia}: banco {$mov->monto}, ventas sin registro";
            } elseif ($esperado !== $mov->monto) {
                $diferencias[] = "{$mov->referencia}: banco {$mov->monto}, ventas {$esperado}";
            }
        }
        return $diferencias;
    }
}

final class ConciliadorBancoAndino extends Conciliador
{
    #[\Override]
    protected function crearLector(): LectorExtracto
    {
        return new LectorCsvAndino();
    }
}

final class ConciliadorBancoPacifico extends Conciliador
{
    #[\Override]
    protected function crearLector(): LectorExtracto
    {
        return new LectorTxtPacifico();
    }
}

$ventas = ['F-001' => 150.0, 'F-002' => 80.0];

print_r((new ConciliadorBancoAndino())->conciliar("2026-11-01;F-001;150\n2026-11-01;F-002;75", $ventas));
// [0] => F-002: banco 75, ventas 80
print_r((new ConciliadorBancoPacifico())->conciliar("2026-11-01F-001   150\n2026-11-02F-003   40", $ventas));
// [0] => F-003: banco 40, ventas sin registro
