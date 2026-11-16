<?php
// Los enums de PHP pueden tener métodos, así que cada caso del enum es un estado y las transiciones
// se escriben con `match ($this)`. Si una acción no está permitida, el `default` lanza una excepción.
// Toda la máquina de estados queda en un solo lugar.

declare(strict_types=1);

enum EstadoPedido: string
{
    case Pendiente = 'pendiente';
    case Pagado = 'pagado';
    case Enviado = 'enviado';
    case Cancelado = 'cancelado';

    public function pagar(): self
    {
        return match ($this) {
            self::Pendiente => self::Pagado,
            default => throw $this->prohibido('pagar'),
        };
    }

    public function enviar(): self
    {
        return match ($this) {
            self::Pagado => self::Enviado,
            default => throw $this->prohibido('enviar'),
        };
    }

    public function cancelar(Pedido $pedido): self
    {
        return match ($this) {
            self::Pendiente => self::Cancelado,
            self::Pagado => $pedido->reembolsar(self::Cancelado),
            default => throw $this->prohibido('cancelar'),
        };
    }

    private function prohibido(string $accion): LogicException
    {
        return new LogicException("No se puede {$accion} un pedido {$this->value}");
    }
}

final class Pedido
{
    private EstadoPedido $estado = EstadoPedido::Pendiente;

    public function __construct(public readonly string $id) {}

    public function pagar(): void { $this->cambiar($this->estado->pagar()); }
    public function enviar(): void { $this->cambiar($this->estado->enviar()); }
    public function cancelar(): void { $this->cambiar($this->estado->cancelar($this)); }

    public function reembolsar(EstadoPedido $siguiente): EstadoPedido
    {
        echo "  reembolso del pedido {$this->id}\n";
        return $siguiente;
    }

    private function cambiar(EstadoPedido $nuevo): void
    {
        echo "  {$this->id}: {$this->estado->value} → {$nuevo->value}\n";
        $this->estado = $nuevo;
    }
}

$a = new Pedido('A-1');
$a->pagar();
$a->enviar();
try {
    $a->cancelar();
} catch (LogicException $error) {
    echo "  {$error->getMessage()}\n"; // No se puede cancelar un pedido enviado
}

$b = new Pedido('B-2');
$b->pagar();
$b->cancelar(); // reembolsa y cancela
