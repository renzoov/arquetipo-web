# El módulo `copy` de la biblioteca estándar resuelve el patrón: `copy.copy` crea un objeto de la
# misma clase (copia superficial) y `copy.deepcopy` copia en profundidad. Lo habitual es combinarlos:
# copiar en profundidad solo lo mutable (las coberturas) y compartir lo inmutable (la tupla de cláusulas).

import copy
from dataclasses import dataclass


@dataclass
class Cobertura:
    nombre: str
    suma_asegurada: float
    deducible: float


class Poliza:
    def __init__(self, producto: str, coberturas: list[Cobertura], clausulas: tuple[str, ...]) -> None:
        self.producto = producto
        self.coberturas = coberturas
        self.clausulas = clausulas  # tupla: inmutable, se puede compartir entre clones

    def clonar(self) -> "Poliza":
        copia = copy.copy(self)                            # misma clase, mismos atributos
        copia.coberturas = copy.deepcopy(self.coberturas)  # copia profunda de lo mutable
        return copia

    def agregar_cobertura(self, cobertura: Cobertura) -> "Poliza":
        self.coberturas.append(cobertura)
        return self

    def resumen(self) -> str:
        nombres = ", ".join(c.nombre for c in self.coberturas)
        return f"{self.producto}: {nombres} ({len(self.clausulas)} cláusulas)"


# Registro de prototipos: plantillas configuradas una sola vez
PLANTILLAS = {
    "auto-total": Poliza(
        "Auto Total",
        [Cobertura("Choque", 30_000, 500), Cobertura("Robo", 30_000, 800)],
        ("Vigencia anual", "Cobertura nacional"),
    ),
}


def cotizar(clave: str) -> Poliza:
    try:
        return PLANTILLAS[clave].clonar()
    except KeyError:
        raise ValueError(f"No existe la plantilla {clave}") from None


if __name__ == "__main__":
    poliza = cotizar("auto-total").agregar_cobertura(Cobertura("Auto de reemplazo", 1_500, 0))

    print(poliza.resumen())                     # Auto Total: Choque, Robo, Auto de reemplazo (2 cláusulas)
    print(PLANTILLAS["auto-total"].resumen())   # Auto Total: Choque, Robo (2 cláusulas)

    # Con una copia superficial, la lista se compartiría y la plantilla cambiaría también
    mal = copy.copy(PLANTILLAS["auto-total"])
    print(mal.coberturas is PLANTILLAS["auto-total"].coberturas)  # True: ¡misma lista!
