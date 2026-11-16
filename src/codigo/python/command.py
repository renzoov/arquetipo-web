# Los comandos son `dataclass` que cumplen un `Protocol` con `ejecutar` y `deshacer`. Los datos
# internos (los precios anteriores) se declaran con `field(init=False)` para que no formen parte del
# constructor. El historial es una lista usada como pila.

from dataclasses import dataclass, field
from typing import Protocol


@dataclass
class Producto:
    id: str
    categoria: str
    precio: float
    activo: bool = True


class RepoProductos:
    def __init__(self) -> None:
        self._productos = {p.id: p for p in [
            Producto("teclado", "perifericos", 100),
            Producto("mouse", "perifericos", 40),
            Producto("monitor", "pantallas", 900),
        ]}

    def de_categoria(self, categoria: str) -> list[Producto]:
        return [p for p in self._productos.values() if p.categoria == categoria]

    def obtener(self, id: str) -> Producto:
        return self._productos[id]

    def listar(self) -> list[str]:
        return [f"{p.id} {p.precio:g}{'' if p.activo else ' (inactivo)'}" for p in self._productos.values()]


class Comando(Protocol):
    @property
    def descripcion(self) -> str: ...
    def ejecutar(self) -> None: ...
    def deshacer(self) -> None: ...


@dataclass
class AjustarPrecios:
    repo: RepoProductos
    categoria: str
    factor: float
    _anteriores: dict[str, float] = field(default_factory=dict, init=False)

    @property
    def descripcion(self) -> str:
        return f"Ajustar precios de {self.categoria} ×{self.factor}"

    def ejecutar(self) -> None:
        for producto in self.repo.de_categoria(self.categoria):
            self._anteriores[producto.id] = producto.precio
            producto.precio = round(producto.precio * self.factor, 2)

    def deshacer(self) -> None:
        for id, precio in self._anteriores.items():
            self.repo.obtener(id).precio = precio


@dataclass
class DesactivarProducto:
    repo: RepoProductos
    id: str

    @property
    def descripcion(self) -> str:
        return f"Desactivar {self.id}"

    def ejecutar(self) -> None:
        self.repo.obtener(self.id).activo = False

    def deshacer(self) -> None:
        self.repo.obtener(self.id).activo = True


class Invocador:
    def __init__(self) -> None:
        self._historial: list[Comando] = []

    def ejecutar(self, comando: Comando, usuario: str) -> None:
        comando.ejecutar()
        self._historial.append(comando)
        print(f"[auditoría] {usuario}: {comando.descripcion}")

    def deshacer_ultimo(self) -> None:
        if self._historial:
            self._historial.pop().deshacer()


if __name__ == "__main__":
    repo = RepoProductos()
    panel = Invocador()

    panel.ejecutar(AjustarPrecios(repo, "perifericos", 1.1), "ana")
    panel.ejecutar(DesactivarProducto(repo, "monitor"), "ana")
    print(repo.listar())  # ['teclado 110', 'mouse 44', 'monitor 900 (inactivo)']

    panel.deshacer_ultimo()
    panel.deshacer_ultimo()
    print(repo.listar())  # ['teclado 100', 'mouse 40', 'monitor 900']
