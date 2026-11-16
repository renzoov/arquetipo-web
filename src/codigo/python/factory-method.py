# `ABC` y `@abstractmethod` hacen que Python impida instanciar una subclase que no implemente el
# método fábrica. Los lectores se describen con `typing.Protocol` (tipado estructural: no necesitan
# heredar de nada) y los movimientos son `dataclass` inmutables.

from abc import ABC, abstractmethod
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class Movimiento:
    fecha: str
    referencia: str
    monto: float


class LectorExtracto(Protocol):
    def leer(self, contenido: str) -> list[Movimiento]: ...


class LectorCsvAndino:
    def leer(self, contenido: str) -> list[Movimiento]:
        movimientos = []
        for linea in contenido.strip().splitlines():
            fecha, referencia, monto = linea.split(";")
            movimientos.append(Movimiento(fecha, referencia, float(monto)))
        return movimientos


class LectorTxtPacifico:
    def leer(self, contenido: str) -> list[Movimiento]:
        # Ancho fijo: fecha (10) + referencia (8) + monto (resto)
        return [
            Movimiento(linea[:10], linea[10:18].strip(), float(linea[18:]))
            for linea in contenido.strip().splitlines()
        ]


class Conciliador(ABC):
    @abstractmethod
    def crear_lector(self) -> LectorExtracto:
        """Método fábrica: cada subclase decide qué lector crear."""

    def conciliar(self, contenido: str, ventas: Mapping[str, float]) -> list[str]:
        diferencias = []
        for mov in self.crear_lector().leer(contenido):
            esperado = ventas.get(mov.referencia)
            if esperado != mov.monto:
                en_ventas = "sin registro" if esperado is None else f"{esperado:g}"
                diferencias.append(f"{mov.referencia}: banco {mov.monto:g}, ventas {en_ventas}")
        return diferencias


class ConciliadorBancoAndino(Conciliador):
    def crear_lector(self) -> LectorExtracto:
        return LectorCsvAndino()


class ConciliadorBancoPacifico(Conciliador):
    def crear_lector(self) -> LectorExtracto:
        return LectorTxtPacifico()


if __name__ == "__main__":
    ventas = {"F-001": 150, "F-002": 80}

    print(ConciliadorBancoAndino().conciliar("2026-11-01;F-001;150\n2026-11-01;F-002;75", ventas))
    # ['F-002: banco 75, ventas 80']
    print(ConciliadorBancoPacifico().conciliar("2026-11-01F-001   150\n2026-11-02F-003   40", ventas))
    # ['F-003: banco 40, ventas sin registro']

    class ConciliadorIncompleto(Conciliador):
        pass

    try:
        ConciliadorIncompleto()  # type: ignore[abstract]
    except TypeError as error:
        print(error)  # Can't instantiate abstract class ConciliadorIncompleto ...
