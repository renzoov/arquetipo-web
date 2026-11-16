# Hoja y compuesto cumplen el mismo `Protocol`. El compuesto suma con `sum()` sobre un generador y
# ambos implementan `__iter__`, así que cualquier parte del árbol se recorre con un simple `for`.
# `yield from` delega el recorrido en cada hijo.

from collections.abc import Iterator
from dataclasses import dataclass
from typing import Protocol


class MiembroOrganizacion(Protocol):
    nombre: str
    def costo_mensual(self) -> float: ...
    def __iter__(self) -> Iterator["Empleado"]: ...


@dataclass
class Empleado:
    nombre: str
    sueldo: float

    def costo_mensual(self) -> float:
        return self.sueldo

    def __iter__(self) -> Iterator["Empleado"]:
        yield self


class Area:
    def __init__(self, nombre: str, *miembros: MiembroOrganizacion) -> None:
        self.nombre = nombre
        self._miembros = list(miembros)

    def agregar(self, miembro: MiembroOrganizacion) -> None:
        self._miembros.append(miembro)

    def costo_mensual(self) -> float:
        return sum(m.costo_mensual() for m in self._miembros)

    def __iter__(self) -> Iterator[Empleado]:
        for miembro in self._miembros:
            yield from miembro


if __name__ == "__main__":
    tecnologia = Area(
        "Tecnología",
        Empleado("Ana", 5200),
        Area("Equipo Pagos", Empleado("Luis", 4100), Empleado("Marta", 3900)),
    )

    print(tecnologia.costo_mensual())          # 13200
    print([p.nombre for p in tecnologia])      # ['Ana', 'Luis', 'Marta']
