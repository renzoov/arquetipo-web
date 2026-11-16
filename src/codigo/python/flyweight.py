# El flyweight es una `dataclass(frozen=True, slots=True)`: inmutable y con poca memoria por
# objeto. La fábrica es una función con `@functools.cache`, que devuelve siempre el mismo objeto
# para los mismos argumentos. `__slots__` en `Celda` también ahorra memoria en millones de celdas.

from dataclasses import FrozenInstanceError, dataclass
from functools import cache


@dataclass(frozen=True, slots=True)
class Formato:
    fuente: str
    tamano: int
    color: str
    formato_numero: str


@cache
def obtener_formato(fuente: str, tamano: int, color: str, formato_numero: str) -> Formato:
    return Formato(fuente, tamano, color, formato_numero)


class Celda:
    __slots__ = ("fila", "columna", "valor", "formato")

    def __init__(self, fila: int, columna: int, valor: str, formato: Formato) -> None:
        self.fila = fila
        self.columna = columna
        self.valor = valor
        self.formato = formato  # referencia a un objeto compartido


if __name__ == "__main__":
    celdas = [
        Celda(fila, columna, "", obtener_formato(
            "Inter", 11,
            "#000000" if fila == 0 else "#333333",
            "@" if columna == 0 else "#,##0.00",
        ))
        for fila in range(1000)
        for columna in range(100)
    ]

    print(f"{len(celdas)} celdas comparten {obtener_formato.cache_info().currsize} formatos")
    # 100000 celdas comparten 4 formatos
    print(celdas[1].formato is celdas[2].formato)  # True

    try:
        celdas[1].formato.color = "#ff0000"  # type: ignore[misc]
    except FrozenInstanceError:
        print("Un formato compartido no se puede modificar")
