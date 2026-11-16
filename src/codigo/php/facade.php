<?php
// Una fachada clásica: una clase con un único método público que orquesta el subsistema. Ojo: las
// "Facades" de Laravel (`Cache::get()`, `Mail::send()`) solo toman el nombre; en realidad son proxies
// estáticos hacia el contenedor de servicios, no este patrón.

declare(strict_types=1);

final readonly class Venta
{
    public function __construct(public string $id, public string $numeroFiscal, public float $total) {}
}

final readonly class Comprobante
{
    public function __construct(public string $serie, public string $constancia) {}
}

// ── Subsistema ──
final class ValidadorFiscal
{
    public function validar(string $numero): void
    {
        if (!preg_match('/^\d{11}$/', $numero)) throw new InvalidArgumentException("Número fiscal inválido: {$numero}");
    }
}

final class GeneradorXml
{
    public function crear(Venta $venta): string
    {
        return sprintf('<Factura id="%s" total="%.2f"/>', $venta->id, $venta->total);
    }
}

final class FirmadorDigital
{
    public function firmar(string $xml): string
    {
        return str_replace('/>', ' firma="a1b2c3"/>', $xml);
    }
}

// ── Fachada ──
final readonly class FacturacionElectronica
{
    private Closure $enviar;

    public function __construct(
        private ValidadorFiscal $validador = new ValidadorFiscal(),
        private GeneradorXml $generador = new GeneradorXml(),
        private FirmadorDigital $firmador = new FirmadorDigital(),
        ?Closure $enviar = null,
    ) {
        $this->enviar = $enviar ?? fn (string $xml): string => 'CONSTANCIA-' . strlen($xml);
    }

    public function emitir(Venta $venta): Comprobante
    {
        $this->validador->validar($venta->numeroFiscal);
        $xmlFirmado = $this->firmador->firmar($this->generador->crear($venta));
        return new Comprobante("F001-{$venta->id}", ($this->enviar)($xmlFirmado));
    }
}

$facturacion = new FacturacionElectronica();
$comprobante = $facturacion->emitir(new Venta('000123', '20123456789', 118));
echo "{$comprobante->serie} · {$comprobante->constancia}\n"; // F001-000123 · CONSTANCIA-52

try {
    $facturacion->emitir(new Venta('000125', '123', 10));
} catch (InvalidArgumentException $error) {
    echo $error->getMessage(), "\n"; // Número fiscal inválido: 123
}

// En una prueba, sin llamar a la autoridad tributaria real (argumentos con nombre)
$prueba = new FacturacionElectronica(enviar: fn (string $xml): string => 'CONSTANCIA-PRUEBA');
echo $prueba->emitir(new Venta('000124', '20123456789', 50))->constancia, "\n";
