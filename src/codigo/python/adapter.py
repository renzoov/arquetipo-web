# La interfaz esperada es un `Protocol` y el resultado es una unión de `dataclass`. La traducción de
# los códigos del proveedor usa `match` (pattern matching, desde Python 3.10), que deja cada caso
# claro y con un `case _` para lo desconocido.

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class Tarjeta:
    numero: str
    vencimiento: str


@dataclass(frozen=True)
class Aprobado:
    operacion: str


@dataclass(frozen=True)
class Rechazado:
    motivo: str


@dataclass(frozen=True)
class Reintentar:
    pass


ResultadoPago = Aprobado | Rechazado | Reintentar


class PasarelaPago(Protocol):
    def cobrar(self, monto: float, tarjeta: Tarjeta) -> ResultadoPago: ...


class SdkPagoLocal:
    """SDK de un tercero: no se puede modificar."""

    def tokenizar(self, tarjeta: Tarjeta) -> str:
        return f"tok_{tarjeta.numero[-4:]}"

    def crear_transaccion(self, importe_centimos: int, token: str) -> dict[str, str]:
        return {"codigo": "05" if importe_centimos > 100_000 else "00", "id": f"TX-{token}"}


class AdaptadorPagoLocal:
    def __init__(self, sdk: SdkPagoLocal) -> None:
        self._sdk = sdk

    def cobrar(self, monto: float, tarjeta: Tarjeta) -> ResultadoPago:
        token = self._sdk.tokenizar(tarjeta)
        respuesta = self._sdk.crear_transaccion(round(monto * 100), token)
        match respuesta["codigo"]:
            case "00":
                return Aprobado(respuesta["id"])
            case "91":
                return Reintentar()
            case codigo:
                return Rechazado(f"Código del proveedor {codigo}")


if __name__ == "__main__":
    pasarela: PasarelaPago = AdaptadorPagoLocal(SdkPagoLocal())
    tarjeta = Tarjeta("4111111111111111", "12/28")

    print(pasarela.cobrar(250, tarjeta))   # Aprobado(operacion='TX-tok_1111')
    print(pasarela.cobrar(1500, tarjeta))  # Rechazado(motivo='Código del proveedor 05')
