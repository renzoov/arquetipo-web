# Cada elemento de la gramática es una `dataclass`, y la clase base sobrecarga los operadores `&` y
# `|` (`__and__` y `__or__`). Así las reglas se escriben en Python casi como en el mini-lenguaje:
# `(TotalMayorQue(100) & EsClienteFrecuente()) | CuponIgual("VERANO")`.

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True)
class Carrito:
    total: float
    cliente_frecuente: bool
    cupon: str | None = None


class Expresion(ABC):
    @abstractmethod
    def interpretar(self, carrito: Carrito) -> bool: ...

    def __and__(self, otra: "Expresion") -> "Expresion":
        return Y(self, otra)

    def __or__(self, otra: "Expresion") -> "Expresion":
        return O(self, otra)


@dataclass(frozen=True)
class TotalMayorQue(Expresion):
    limite: float

    def interpretar(self, carrito: Carrito) -> bool:
        return carrito.total > self.limite


@dataclass(frozen=True)
class EsClienteFrecuente(Expresion):
    def interpretar(self, carrito: Carrito) -> bool:
        return carrito.cliente_frecuente


@dataclass(frozen=True)
class CuponIgual(Expresion):
    codigo: str

    def interpretar(self, carrito: Carrito) -> bool:
        return carrito.cupon == self.codigo


@dataclass(frozen=True)
class Y(Expresion):
    izquierda: Expresion
    derecha: Expresion

    def interpretar(self, carrito: Carrito) -> bool:
        return self.izquierda.interpretar(carrito) and self.derecha.interpretar(carrito)


@dataclass(frozen=True)
class O(Expresion):
    izquierda: Expresion
    derecha: Expresion

    def interpretar(self, carrito: Carrito) -> bool:
        return self.izquierda.interpretar(carrito) or self.derecha.interpretar(carrito)


if __name__ == "__main__":
    # total > 100 Y cliente_frecuente O cupon = "VERANO"
    regla = (TotalMayorQue(100) & EsClienteFrecuente()) | CuponIgual("VERANO")

    print(regla)  # el árbol, gracias al repr de las dataclasses
    print(regla.interpretar(Carrito(150, cliente_frecuente=True)))                    # True
    print(regla.interpretar(Carrito(150, cliente_frecuente=False)))                   # False
    print(regla.interpretar(Carrito(20, cliente_frecuente=False, cupon="VERANO")))   # True
