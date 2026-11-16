# `functools.singledispatch` es el Visitor de Python: una función genérica elige la implementación
# según el tipo del argumento, sin métodos `aceptar` en los productos. Cada operación nueva es una
# función nueva y los productos (simples `dataclass`) no cambian.

from dataclasses import dataclass
from functools import singledispatch


@dataclass(frozen=True)
class ProductoFisico:
    nombre: str
    precio: float
    peso_kg: float


@dataclass(frozen=True)
class ProductoDigital:
    nombre: str
    precio: float


@dataclass(frozen=True)
class Suscripcion:
    nombre: str
    precio_mensual: float
    meses: int


Producto = ProductoFisico | ProductoDigital | Suscripcion


# ── Operación: costo de envío ──
@singledispatch
def costo_envio(producto: object) -> float:
    raise TypeError(f"Tipo de producto no soportado: {type(producto).__name__}")


@costo_envio.register
def _(producto: ProductoFisico) -> float:
    return producto.peso_kg * 4.5


@costo_envio.register
def _(producto: ProductoDigital | Suscripcion) -> float:  # varios tipos con la misma lógica
    return 0


# ── Operación: impuestos ──
@singledispatch
def impuestos(producto: object) -> float:
    raise TypeError(f"Tipo de producto no soportado: {type(producto).__name__}")


@impuestos.register
def _(producto: ProductoFisico | ProductoDigital) -> float:
    return producto.precio * 0.18


@impuestos.register
def _(producto: Suscripcion) -> float:
    return producto.precio_mensual * producto.meses * 0.18


if __name__ == "__main__":
    carrito: list[Producto] = [
        ProductoFisico("Teclado", 100, 1.2),
        ProductoDigital("Curso de patrones", 50),
        Suscripcion("Plan Pro", 15, 12),
    ]

    print(f"Envío: {sum(costo_envio(p) for p in carrito):.2f}")    # 5.40
    print(f"Impuestos: {sum(impuestos(p) for p in carrito):.2f}")  # 59.40

    # Con `match` también se puede despachar por tipo, todo en una función
    for p in carrito:
        match p:
            case ProductoFisico(nombre=n, precio=precio):
                print(f"MERCADERIA|{n}|{precio:g}")
            case ProductoDigital(nombre=n, precio=precio):
                print(f"SERVICIO-DIGITAL|{n}|{precio:g}")
            case Suscripcion(nombre=n, precio_mensual=mensual, meses=meses):
                print(f"SUSCRIPCION|{n}|{mensual * meses:g}")
