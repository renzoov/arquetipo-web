# En Python una estrategia es simplemente una función (o cualquier "llamable"). Las estrategias
# configurables se crean con `functools.partial`, que fija algunos argumentos de una función, y el
# catálogo es un diccionario de funciones.

from collections.abc import Callable
from dataclasses import dataclass
from functools import partial


@dataclass(frozen=True)
class Pedido:
    subtotal: float
    peso_kg: float
    pais: str


CalculoEnvio = Callable[[Pedido], float]


def tarifa_plana(pedido: Pedido, monto: float) -> float:
    return monto


def por_peso(pedido: Pedido, precio_por_kg: float) -> float:
    return round(pedido.peso_kg * precio_por_kg, 2)


def internacional(pedido: Pedido) -> float:
    return {"US": 45, "ES": 60}.get(pedido.pais, 80)


MODALIDADES: dict[str, CalculoEnvio] = {
    "ciudad": partial(tarifa_plana, monto=10),
    "nacional": partial(por_peso, precio_por_kg=4.5),
    "internacional": internacional,
    "campania": partial(tarifa_plana, monto=0),
}


def total_con_envio(pedido: Pedido, calcular_envio: CalculoEnvio) -> float:
    return pedido.subtotal + calcular_envio(pedido)


if __name__ == "__main__":
    pedido = Pedido(subtotal=200, peso_kg=3.2, pais="ES")

    # La modalidad la elige el cliente en tiempo de ejecución
    for nombre, calcular in MODALIDADES.items():
        print(f"{nombre:<14} {total_con_envio(pedido, calcular):g}")
    # ciudad 210 · nacional 214.4 · internacional 260 · campania 200
