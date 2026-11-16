# Los suscriptores son simples funciones. `suscribir` devuelve la misma función que recibe, así que
# se puede usar como decorador: `@pagos.suscribir`. Cada suscriptor se ejecuta dentro de un
# try/except para que el fallo de uno no impida que los demás reciban el aviso.

from collections.abc import Callable
from dataclasses import dataclass


@dataclass(frozen=True)
class Pedido:
    id: str
    total: float


Suscriptor = Callable[[Pedido], None]


class ServicioPagos:
    def __init__(self) -> None:
        self._suscriptores: list[Suscriptor] = []

    def suscribir(self, funcion: Suscriptor) -> Suscriptor:
        self._suscriptores.append(funcion)
        return funcion

    def desuscribir(self, funcion: Suscriptor) -> None:
        self._suscriptores.remove(funcion)

    def pagar(self, pedido: Pedido) -> None:
        print(f"Pedido {pedido.id} cobrado")
        for suscriptor in self._suscriptores:
            try:
                suscriptor(pedido)
            except Exception as error:
                print(f"  ⚠ un suscriptor falló: {error}")


pagos = ServicioPagos()


@pagos.suscribir
def enviar_confirmacion(pedido: Pedido) -> None:
    print(f"  correo de confirmación para {pedido.id}")


@pagos.suscribir
def reservar_stock(pedido: Pedido) -> None:
    raise RuntimeError("inventario no disponible")


@pagos.suscribir
def emitir_factura(pedido: Pedido) -> None:
    print(f"  factura emitida por {pedido.total:g}")


if __name__ == "__main__":
    pagos.pagar(Pedido("P-1", 250))

    pagos.desuscribir(emitir_factura)
    pagos.pagar(Pedido("P-2", 90))  # ya no se emite factura
