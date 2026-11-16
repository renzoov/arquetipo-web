<?php
// PHP trae el patrón en su biblioteca estándar: las interfaces `SplSubject` y `SplObserver`, y
// `SplObjectStorage` para guardar los suscriptores sin duplicados. Cada aviso va dentro de un
// try/catch para que el fallo de un suscriptor no afecte a los demás.

declare(strict_types=1);

final class ServicioPagos implements SplSubject
{
    /** @var SplObjectStorage<SplObserver, null> */
    private SplObjectStorage $suscriptores;
    public ?array $ultimoPedido = null;

    public function __construct() { $this->suscriptores = new SplObjectStorage(); }

    public function attach(SplObserver $observer): void { $this->suscriptores->offsetSet($observer); }
    public function detach(SplObserver $observer): void { $this->suscriptores->offsetUnset($observer); }

    public function notify(): void
    {
        foreach ($this->suscriptores as $suscriptor) {
            try {
                $suscriptor->update($this);
            } catch (Throwable $error) {
                echo "  ⚠ un suscriptor falló: {$error->getMessage()}\n";
            }
        }
    }

    public function pagar(string $id, int $total): void
    {
        echo "Pedido {$id} cobrado\n";
        $this->ultimoPedido = ['id' => $id, 'total' => $total];
        $this->notify();
    }
}

final class EnviarConfirmacion implements SplObserver
{
    public function update(SplSubject $subject): void
    {
        assert($subject instanceof ServicioPagos);
        echo "  correo de confirmación para {$subject->ultimoPedido['id']}\n";
    }
}

final class ReservarStock implements SplObserver
{
    public function update(SplSubject $subject): void
    {
        throw new RuntimeException('inventario no disponible');
    }
}

final class EmitirFactura implements SplObserver
{
    public function update(SplSubject $subject): void
    {
        assert($subject instanceof ServicioPagos);
        echo "  factura emitida por {$subject->ultimoPedido['total']}\n";
    }
}

$pagos = new ServicioPagos();
$factura = new EmitirFactura();
$pagos->attach(new EnviarConfirmacion());
$pagos->attach(new ReservarStock());
$pagos->attach($factura);

$pagos->pagar('P-1', 250);

$pagos->detach($factura); // se da de baja
$pagos->pagar('P-2', 90); // ya no se emite factura
