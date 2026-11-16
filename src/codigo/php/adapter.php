<?php
// El adaptador implementa la interfaz propia con promoción de propiedades en el constructor y traduce
// los códigos del proveedor con `match`, que es una expresión: compara con `===` y lanza
// `UnhandledMatchError` si falta un caso, salvo que haya un `default`.

declare(strict_types=1);

final readonly class Tarjeta
{
    public function __construct(public string $numero, public string $vencimiento) {}
}

enum EstadoPago: string
{
    case Aprobado = 'aprobado';
    case Rechazado = 'rechazado';
    case Reintentar = 'reintentar';
}

final readonly class ResultadoPago
{
    public function __construct(public EstadoPago $estado, public string $detalle = '') {}
}

interface PasarelaPago
{
    public function cobrar(float $monto, Tarjeta $tarjeta): ResultadoPago;
}

// SDK de un tercero: no se puede modificar
final class SdkPagoLocal
{
    public function tokenizar(Tarjeta $tarjeta): string
    {
        return 'tok_' . substr($tarjeta->numero, -4);
    }

    /** @return array{codigo: string, id: string} */
    public function crearTransaccion(int $importeCentimos, string $token): array
    {
        return $importeCentimos > 100_000 ? ['codigo' => '05', 'id' => ''] : ['codigo' => '00', 'id' => "TX-{$token}"];
    }
}

final readonly class AdaptadorPagoLocal implements PasarelaPago
{
    public function __construct(private SdkPagoLocal $sdk) {}

    #[\Override]
    public function cobrar(float $monto, Tarjeta $tarjeta): ResultadoPago
    {
        $respuesta = $this->sdk->crearTransaccion((int) round($monto * 100), $this->sdk->tokenizar($tarjeta));
        return match ($respuesta['codigo']) {
            '00' => new ResultadoPago(EstadoPago::Aprobado, $respuesta['id']),
            '91' => new ResultadoPago(EstadoPago::Reintentar),
            default => new ResultadoPago(EstadoPago::Rechazado, "código del proveedor {$respuesta['codigo']}"),
        };
    }
}

$pasarela = new AdaptadorPagoLocal(new SdkPagoLocal());
$tarjeta = new Tarjeta('4111111111111111', '12/28');

foreach ([250, 1500] as $monto) {
    $resultado = $pasarela->cobrar($monto, $tarjeta);
    echo "{$resultado->estado->value} → {$resultado->detalle}\n";
}
// aprobado → TX-tok_1111 · rechazado → código del proveedor 05
