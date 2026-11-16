# El mediador decide qué hacer con `match` sobre la pareja (evento, origen): los patrones de clase
# como `SelectorCategoria()` comprueban el tipo del componente que avisó. Los componentes solo
# conocen al mediador, a través de un `Protocol`.

from typing import Protocol

CATALOGO = {"laptops": ("Premium", "Económica"), "celulares": ("Premium",)}


class Mediador(Protocol):
    def notificar(self, origen: object, evento: str) -> None: ...


class Componente:
    def __init__(self, mediador: Mediador) -> None:
        self._mediador = mediador

    def avisar(self, evento: str = "cambio") -> None:
        self._mediador.notificar(self, evento)


class SelectorCategoria(Componente):
    valor = ""

    def elegir(self, categoria: str) -> None:
        self.valor = categoria
        self.avisar()


class SelectorMarca(Componente):
    valor = ""
    opciones: tuple[str, ...] = ()  # tupla: un atributo de clase mutable se compartiría entre instancias

    def elegir(self, marca: str) -> None:
        self.valor = marca
        self.avisar()


class RangoPrecio(Componente):
    rango: tuple[float, float] = (0, float("inf"))


class BotonLimpiar(Componente):
    def pulsar(self) -> None:
        self.avisar("limpiar")


class PanelFiltros:
    def __init__(self) -> None:
        self.categoria = SelectorCategoria(self)
        self.marca = SelectorMarca(self)
        self.precio = RangoPrecio(self)
        self.limpiar = BotonLimpiar(self)
        self.resultados = ""

    def notificar(self, origen: object, evento: str) -> None:
        match evento, origen:
            case "limpiar", _:
                self.categoria.valor = self.marca.valor = ""
                self.marca.opciones = ()
                self.precio.rango = (0, float("inf"))
            case "cambio", SelectorCategoria(valor=categoria):
                self.marca.opciones = CATALOGO.get(categoria, ())
                self.marca.valor = ""
                self.precio.rango = (0, float("inf"))
            case "cambio", SelectorMarca(valor=marca):
                self.precio.rango = (500, 3000) if marca == "Premium" else (0, 800)
        self._actualizar_resultados()

    def _actualizar_resultados(self) -> None:
        total = 120 if not self.categoria.valor else 8 if self.marca.valor else 25
        self.resultados = f"{total} resultados"


if __name__ == "__main__":
    panel = PanelFiltros()

    panel.categoria.elegir("laptops")
    print(panel.marca.opciones, panel.resultados)  # ('Premium', 'Económica') 25 resultados

    panel.marca.elegir("Premium")
    print(panel.precio.rango, panel.resultados)    # (500, 3000) 8 resultados

    panel.limpiar.pulsar()
    print(panel.resultados)                        # 120 resultados
