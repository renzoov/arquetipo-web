# Cada estado es una clase. La clase base rechaza por defecto todas las acciones y cada estado
# sobrescribe solo las que permite. `ClassVar` marca el nombre como dato de la clase, no de cada
# objeto, y como los estados no guardan datos, se puede reutilizar una sola instancia de cada uno.

from typing import ClassVar


class EstadoPedido:
    nombre: ClassVar[str]

    def pagar(self, pedido: "Pedido") -> None:
        self._prohibido("pagar")

    def enviar(self, pedido: "Pedido") -> None:
        self._prohibido("enviar")

    def cancelar(self, pedido: "Pedido") -> None:
        self._prohibido("cancelar")

    def _prohibido(self, accion: str) -> None:
        raise RuntimeError(f"No se puede {accion} un pedido {self.nombre}")


class Pendiente(EstadoPedido):
    nombre = "pendiente"

    def pagar(self, pedido: "Pedido") -> None:
        pedido.cambiar_estado(PAGADO)

    def cancelar(self, pedido: "Pedido") -> None:
        pedido.cambiar_estado(CANCELADO)


class Pagado(EstadoPedido):
    nombre = "pagado"

    def enviar(self, pedido: "Pedido") -> None:
        pedido.cambiar_estado(ENVIADO)

    def cancelar(self, pedido: "Pedido") -> None:
        print(f"  reembolso del pedido {pedido.id}")
        pedido.cambiar_estado(CANCELADO)


class Enviado(EstadoPedido):
    nombre = "enviado"


class Cancelado(EstadoPedido):
    nombre = "cancelado"


# Los estados no tienen datos propios: una instancia de cada uno basta
PENDIENTE, PAGADO, ENVIADO, CANCELADO = Pendiente(), Pagado(), Enviado(), Cancelado()


class Pedido:
    def __init__(self, id: str) -> None:
        self.id = id
        self._estado: EstadoPedido = PENDIENTE

    def cambiar_estado(self, nuevo: EstadoPedido) -> None:
        print(f"  {self.id}: {self._estado.nombre} → {nuevo.nombre}")
        self._estado = nuevo

    def pagar(self) -> None:
        self._estado.pagar(self)

    def enviar(self) -> None:
        self._estado.enviar(self)

    def cancelar(self) -> None:
        self._estado.cancelar(self)


if __name__ == "__main__":
    a = Pedido("A-1")
    a.pagar()
    a.enviar()
    try:
        a.cancelar()
    except RuntimeError as error:
        print(f"  {error}")  # No se puede cancelar un pedido enviado

    b = Pedido("B-2")
    b.pagar()
    b.cancelar()  # reembolsa y cancela
