# Cada control es una función que devuelve el motivo del rechazo o `None`. La cadena es una simple
# lista, y `next()` sobre un generador con el operador morsa (`:=`) recorre los controles en orden
# y se detiene en el primero que rechaza: el corte de la cadena sale gratis.

from collections.abc import Callable
from dataclasses import dataclass, replace


@dataclass(frozen=True)
class Pago:
    tarjeta: str
    cliente: str
    monto: float
    pais_tarjeta: str
    pais_conexion: str


Control = Callable[[Pago], str | None]

TARJETAS_BLOQUEADAS = {"4000000000000002"}
GASTADO_HOY = {"cli-1": 900}


def lista_bloqueo(pago: Pago) -> str | None:
    return "Tarjeta bloqueada" if pago.tarjeta in TARJETAS_BLOQUEADAS else None


def limite_diario(limite: float) -> Control:
    def control(pago: Pago) -> str | None:
        total = GASTADO_HOY.get(pago.cliente, 0) + pago.monto
        return "Supera el límite diario" if total > limite else None
    return control


def mismo_pais(pago: Pago) -> str | None:
    return "El país de conexión no coincide" if pago.pais_tarjeta != pago.pais_conexion else None


def revisar(pago: Pago, cadena: list[Control]) -> str:
    motivo = next((m for control in cadena if (m := control(pago))), None)
    return f"rechazado: {motivo}" if motivo else "aprobado"


if __name__ == "__main__":
    cadena = [lista_bloqueo, limite_diario(1000), mismo_pais]  # reordenar = editar la lista
    pago = Pago("4111111111111111", "cli-2", 120, "PE", "PE")

    print(revisar(pago, cadena))                                  # aprobado
    print(revisar(replace(pago, cliente="cli-1"), cadena))        # rechazado: Supera el límite diario
    print(revisar(replace(pago, pais_conexion="RU"), cadena))     # rechazado: El país de conexión no coincide
