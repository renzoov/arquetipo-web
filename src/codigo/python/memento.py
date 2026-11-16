# Python no tiene campos privados de verdad: se usa la convención del guion bajo (`_estado`) y el
# memento es una `dataclass(frozen=True)` que oculta el estado en su `repr`. `copy.deepcopy` hace
# la copia profunda al guardar y al restaurar.

import copy
from dataclasses import dataclass, field
from typing import Literal

Motor = Literal["gasolina", "hibrido", "electrico"]
RECARGO = {"gasolina": 0, "hibrido": 4000, "electrico": 9000}


@dataclass
class EstadoConfig:
    modelo: str = "Sedán"
    motor: Motor = "gasolina"
    caja: str = "manual"
    accesorios: list[str] = field(default_factory=list)
    precio: int = 20000


@dataclass(frozen=True)
class Memento:
    etiqueta: str
    _estado: EstadoConfig = field(repr=False)  # "privado": solo lo usa el configurador


class Configurador:
    def __init__(self) -> None:
        self._estado = EstadoConfig()

    def elegir_motor(self, motor: Motor) -> None:
        self._estado.motor = motor
        if motor == "electrico":
            self._estado.caja = "automatica"  # regla: no hay eléctricos manuales
        self._recalcular()

    def agregar_accesorio(self, accesorio: str) -> None:
        self._estado.accesorios.append(accesorio)
        self._recalcular()

    def guardar(self, etiqueta: str) -> Memento:
        return Memento(etiqueta, copy.deepcopy(self._estado))

    def restaurar(self, memento: Memento) -> None:
        self._estado = copy.deepcopy(memento._estado)

    def resumen(self) -> str:
        e = self._estado
        return f"{e.modelo} {e.motor}/{e.caja} [{', '.join(e.accesorios)}] {e.precio} USD"

    def _recalcular(self) -> None:
        self._estado.precio = 20000 + RECARGO[self._estado.motor] + len(self._estado.accesorios) * 600


class Historial:
    def __init__(self, configurador: Configurador) -> None:
        self._configurador = configurador
        self._pila: list[Memento] = []

    def guardar(self, etiqueta: str) -> None:
        self._pila.append(self._configurador.guardar(etiqueta))

    def deshacer(self) -> str | None:
        if not self._pila:
            return None
        memento = self._pila.pop()
        self._configurador.restaurar(memento)
        return memento.etiqueta


if __name__ == "__main__":
    config = Configurador()
    historial = Historial(config)

    historial.guardar("base")
    config.elegir_motor("electrico")
    historial.guardar("eléctrico")
    config.agregar_accesorio("Techo solar")
    print(config.resumen())  # Sedán electrico/automatica [Techo solar] 29600 USD

    print("Volver a:", historial.deshacer())
    print(config.resumen())  # Sedán electrico/automatica [] 29000 USD
    print("Volver a:", historial.deshacer())
    print(config.resumen())  # Sedán gasolina/manual [] 20000 USD
    print(config.guardar("prueba"))  # Memento(etiqueta='prueba'): el estado no se muestra
