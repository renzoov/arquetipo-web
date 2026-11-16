<?php
// Hoja y compuesto implementan la misma interfaz. El recorrido usa generadores: `yield` en la hoja y
// `yield from` en el compuesto, que delega en cada hijo. El resultado se puede recorrer con `foreach`
// sin construir listas intermedias.

declare(strict_types=1);

interface MiembroOrganizacion
{
    public function costoMensual(): int;
    /** @return iterable<Empleado> */
    public function personas(): iterable;
}

final readonly class Empleado implements MiembroOrganizacion
{
    public function __construct(public string $nombre, private int $sueldo) {}

    public function costoMensual(): int { return $this->sueldo; }

    public function personas(): iterable { yield $this; }
}

final class Area implements MiembroOrganizacion
{
    /** @var list<MiembroOrganizacion> */
    private array $miembros;

    public function __construct(public readonly string $nombre, MiembroOrganizacion ...$miembros)
    {
        $this->miembros = $miembros;
    }

    public function agregar(MiembroOrganizacion $miembro): void { $this->miembros[] = $miembro; }

    public function costoMensual(): int
    {
        return array_sum(array_map(fn (MiembroOrganizacion $m) => $m->costoMensual(), $this->miembros));
    }

    public function personas(): iterable
    {
        foreach ($this->miembros as $miembro) yield from $miembro->personas();
    }
}

$tecnologia = new Area('Tecnología',
    new Empleado('Ana', 5200),
    new Area('Equipo Pagos', new Empleado('Luis', 4100), new Empleado('Marta', 3900)),
);

echo $tecnologia->costoMensual(), "\n"; // 13200
foreach ($tecnologia->personas() as $persona) {
    echo $persona->nombre, "\n"; // Ana, Luis, Marta
}
