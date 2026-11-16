<?php
// En PHP los arrays se copian por valor, así que guardar el estado en un array es ya una copia segura.
// Como PHP no tiene clases anidadas, el estado del memento es privado y solo el configurador lo lee, a
// través de un closure ligado a la clase del memento (`Closure::bind`).

declare(strict_types=1);

final readonly class Memento
{
    /** @param array<string, mixed> $estado */
    public function __construct(public string $etiqueta, private array $estado) {}
}

final class Configurador
{
    private const RECARGO = ['gasolina' => 0, 'hibrido' => 4000, 'electrico' => 9000];

    /** @var array{modelo: string, motor: string, caja: string, accesorios: list<string>, precio: int} */
    private array $estado = ['modelo' => 'Sedán', 'motor' => 'gasolina', 'caja' => 'manual', 'accesorios' => [], 'precio' => 20000];

    public function elegirMotor(string $motor): void
    {
        if (!isset(self::RECARGO[$motor])) throw new InvalidArgumentException("Motor desconocido: {$motor}");
        $this->estado['motor'] = $motor;
        if ($motor === 'electrico') $this->estado['caja'] = 'automatica'; // regla: no hay eléctricos manuales
        $this->recalcular();
    }

    public function agregarAccesorio(string $accesorio): void
    {
        $this->estado['accesorios'][] = $accesorio;
        $this->recalcular();
    }

    public function guardar(string $etiqueta): Memento
    {
        return new Memento($etiqueta, $this->estado); // el array se copia
    }

    public function restaurar(Memento $memento): void
    {
        // Solo el configurador sabe leer el estado privado del memento
        $this->estado = Closure::bind(fn () => $this->estado, $memento, Memento::class)();
    }

    public function resumen(): string
    {
        ['modelo' => $modelo, 'motor' => $motor, 'caja' => $caja, 'accesorios' => $accesorios, 'precio' => $precio] = $this->estado;
        return sprintf('%s %s/%s [%s] %d USD', $modelo, $motor, $caja, implode(', ', $accesorios), $precio);
    }

    private function recalcular(): void
    {
        $this->estado['precio'] = 20000 + self::RECARGO[$this->estado['motor']] + count($this->estado['accesorios']) * 600;
    }
}

$config = new Configurador();
$historial = [];

$historial[] = $config->guardar('base');
$config->elegirMotor('electrico');
$historial[] = $config->guardar('eléctrico');
$config->agregarAccesorio('Techo solar');
echo $config->resumen(), "\n"; // Sedán electrico/automatica [Techo solar] 29600 USD

while ($memento = array_pop($historial)) {
    $config->restaurar($memento);
    echo "Volver a {$memento->etiqueta}: {$config->resumen()}\n";
}
// Volver a eléctrico: Sedán electrico/automatica [] 29000 USD
// Volver a base: Sedán gasolina/manual [] 20000 USD
