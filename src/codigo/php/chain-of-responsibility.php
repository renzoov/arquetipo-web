<?php
// Es la técnica del `Pipeline` de Laravel y de los middlewares PSR-15: cada control es un closure
// `fn (Pago $pago, Closure $siguiente)`, y `array_reduce` los envuelve uno dentro de otro, del último
// al primero. Reordenar la cadena es reordenar el array.

declare(strict_types=1);

final readonly class Pago
{
    public function __construct(
        public string $tarjeta,
        public string $cliente,
        public float $monto,
        public string $paisTarjeta,
        public string $paisConexion,
    ) {}
}

$tarjetasBloqueadas = ['4000000000000002'];
$gastadoHoy = ['cli-1' => 900.0];

$listaBloqueo = fn (Pago $p, Closure $siguiente): string =>
    in_array($p->tarjeta, $tarjetasBloqueadas, true) ? 'rechazado: Tarjeta bloqueada' : $siguiente($p);

$limiteDiario = fn (float $limite): Closure => fn (Pago $p, Closure $siguiente): string =>
    ($gastadoHoy[$p->cliente] ?? 0.0) + $p->monto > $limite ? 'rechazado: Supera el límite diario' : $siguiente($p);

$mismoPais = fn (Pago $p, Closure $siguiente): string =>
    $p->paisTarjeta !== $p->paisConexion ? 'rechazado: El país de conexión no coincide' : $siguiente($p);

/** @param list<Closure> $controles */
function encadenar(array $controles): Closure
{
    return array_reduce(
        array_reverse($controles),
        fn (Closure $resto, Closure $control): Closure => fn (Pago $p): string => $control($p, $resto),
        fn (Pago $p): string => 'aprobado', // final: todo en orden
    );
}

$revisar = encadenar([$listaBloqueo, $limiteDiario(1000), $mismoPais]);

echo $revisar(new Pago('4111111111111111', 'cli-2', 120, 'PE', 'PE')), "\n"; // aprobado
echo $revisar(new Pago('4111111111111111', 'cli-1', 120, 'PE', 'PE')), "\n"; // rechazado: Supera el límite diario
echo $revisar(new Pago('4111111111111111', 'cli-2', 120, 'PE', 'RU')), "\n"; // rechazado: El país de conexión no coincide
