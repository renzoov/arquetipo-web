# `@abstractmethod` marca el paso obligatorio, los métodos con implementación por defecto son
# ganchos, y `@final` (de `typing`) declara que el método plantilla no debe sobrescribirse: los
# verificadores de tipos (mypy, Pyright) avisan si una subclase lo intenta.

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import final


@dataclass(frozen=True)
class Empleado:
    nombre: str
    sueldo_base: float = 0
    subvencion: float = 0
    horas: float = 0
    tarifa_hora: float = 0
    hijos: int = 0


@dataclass(frozen=True)
class Boleta:
    empleado: str
    bruto: float
    descuentos: float
    bonificaciones: float
    neto: float


class CalculoNomina(ABC):
    @final
    def calcular_nomina(self, e: Empleado) -> Boleta:
        """Método plantilla: el orden de los pasos es siempre el mismo."""
        bruto = self.ingreso_bruto(e)
        descuentos = self._descuentos_de_ley(bruto)
        bonificaciones = self.bonificaciones(e)
        return Boleta(e.nombre, bruto, descuentos, bonificaciones, round(bruto - descuentos + bonificaciones, 2))

    @abstractmethod
    def ingreso_bruto(self, e: Empleado) -> float: ...       # paso obligatorio

    def bonificaciones(self, e: Empleado) -> float:            # gancho
        return 0

    def aporta_pension(self) -> bool:                          # gancho
        return True

    def _descuentos_de_ley(self, bruto: float) -> float:       # paso común
        return round(bruto * 0.13, 2) if self.aporta_pension() else 0


class NominaPlanilla(CalculoNomina):
    def ingreso_bruto(self, e: Empleado) -> float:
        return e.sueldo_base

    def bonificaciones(self, e: Empleado) -> float:
        return 100 if e.hijos > 0 else 0


class NominaPracticante(CalculoNomina):
    def ingreso_bruto(self, e: Empleado) -> float:
        return e.subvencion

    def aporta_pension(self) -> bool:
        return False


class NominaPorHoras(CalculoNomina):
    def ingreso_bruto(self, e: Empleado) -> float:
        return e.horas * e.tarifa_hora


if __name__ == "__main__":
    print(NominaPlanilla().calcular_nomina(Empleado("Ana", sueldo_base=4000, hijos=2)))
    print(NominaPracticante().calcular_nomina(Empleado("Leo", subvencion=1200)))
    print(NominaPorHoras().calcular_nomina(Empleado("Rosa", horas=80, tarifa_hora=25)))
