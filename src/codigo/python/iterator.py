# Una función generadora (`yield`) es el iterador: Python la recorre con `for` y la ejecuta de forma
# perezosa, pidiendo una página nueva solo cuando hace falta. `yield from` entrega los elementos de
# cada página e `itertools.islice` toma los primeros sin recorrer todo.

from collections.abc import Iterator
from dataclasses import dataclass
from itertools import islice


@dataclass(frozen=True)
class Cliente:
    id: int
    nombre: str


@dataclass(frozen=True)
class Pagina:
    datos: list[Cliente]
    siguiente_cursor: str | None


class ApiCrm:
    def __init__(self) -> None:
        self._clientes = [Cliente(i, n) for i, n in enumerate(["Ana", "Luis", "Marta", "Jorge", "Elena"], start=1)]
        self.peticiones = 0

    def listar_clientes(self, limite: int, cursor: str | None = None) -> Pagina:
        self.peticiones += 1
        desde = int(cursor) if cursor else 0
        hasta = desde + limite
        siguiente = str(hasta) if hasta < len(self._clientes) else None
        return Pagina(self._clientes[desde:hasta], siguiente)


def clientes_crm(crm: ApiCrm, limite: int = 2) -> Iterator[Cliente]:
    cursor: str | None = None
    while True:
        pagina = crm.listar_clientes(limite, cursor)
        yield from pagina.datos
        if (cursor := pagina.siguiente_cursor) is None:
            return


if __name__ == "__main__":
    crm = ApiCrm()
    for cliente in clientes_crm(crm):
        print(cliente.nombre)
    print(f"Peticiones a la API: {crm.peticiones}")  # 3

    otro_crm = ApiCrm()
    primeros = [c.nombre for c in islice(clientes_crm(otro_crm), 2)]
    print(primeros, f"· peticiones: {otro_crm.peticiones}")  # ['Ana', 'Luis'] · peticiones: 1
