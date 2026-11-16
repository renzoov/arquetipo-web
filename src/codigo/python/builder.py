# En Python, los argumentos con nombre y una `dataclass(frozen=True, kw_only=True)` ya resuelven el
# constructor con demasiados parámetros, y `__post_init__` valida el resultado. El builder aporta
# cuando el objeto se arma por pasos (por ejemplo, leyendo filtros de la URL) o con recetas fijas.

from dataclasses import dataclass
from typing import Literal, Self

Orden = Literal["relevancia", "precio", "descuento", "novedad"]


@dataclass(frozen=True, kw_only=True)
class Busqueda:
    texto: str | None = None
    precio: tuple[float, float] | None = None
    solo_con_stock: bool = False
    orden: Orden = "relevancia"
    pagina: int = 1

    def __post_init__(self) -> None:
        if self.precio and self.precio[0] > self.precio[1]:
            raise ValueError("Rango de precio inválido")
        if self.pagina < 1:
            raise ValueError("La página empieza en 1")


class BusquedaBuilder:
    def __init__(self) -> None:
        self._texto: str | None = None
        self._precio: tuple[float, float] | None = None
        self._solo_con_stock = False
        self._orden: Orden = "relevancia"

    def texto(self, texto: str) -> Self:
        self._texto = texto.strip()
        return self

    def precio_entre(self, minimo: float, maximo: float) -> Self:
        self._precio = (minimo, maximo)
        return self

    def solo_con_stock(self) -> Self:
        self._solo_con_stock = True
        return self

    def ordenar_por(self, orden: Orden) -> Self:
        self._orden = orden
        return self

    def build(self) -> Busqueda:
        return Busqueda(texto=self._texto, precio=self._precio,
                        solo_con_stock=self._solo_con_stock, orden=self._orden)


# Director: recetas que siempre ejecutan los mismos pasos
def ofertas_del_dia() -> Busqueda:
    return BusquedaBuilder().solo_con_stock().ordenar_por("descuento").build()


if __name__ == "__main__":
    # Construcción por pasos, por ejemplo a partir de los filtros de una URL
    filtros = {"q": "  zapatillas ", "min": "50", "max": "120", "stock": "1"}
    builder = BusquedaBuilder()
    if "q" in filtros:
        builder.texto(filtros["q"])
    if "min" in filtros and "max" in filtros:
        builder.precio_entre(float(filtros["min"]), float(filtros["max"]))
    if filtros.get("stock") == "1":
        builder.solo_con_stock()
    print(builder.build())

    print(ofertas_del_dia().orden)  # descuento

    # Cuando ya tienes todos los datos, basta con argumentos con nombre
    print(Busqueda(texto="auriculares", orden="novedad"))

    try:
        BusquedaBuilder().precio_entre(200, 100).build()
    except ValueError as error:
        print(error)  # Rango de precio inválido
