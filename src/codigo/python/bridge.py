# La implementación (el renderizador) es un `Protocol` y la abstracción (el reporte) una clase
# abstracta con `ABC`. Para que el ejemplo se pueda ejecutar, los formatos son Markdown y CSV; en
# producción serían PDF o Excel.

from abc import ABC, abstractmethod
from typing import Protocol

Fila = dict[str, str | int]


class Renderizador(Protocol):
    def titulo(self, texto: str) -> None: ...
    def tabla(self, filas: list[Fila]) -> None: ...
    def generar(self) -> str: ...


class RenderizadorMarkdown:
    def __init__(self) -> None:
        self._lineas: list[str] = []

    def titulo(self, texto: str) -> None:
        self._lineas.append(f"# {texto}")

    def tabla(self, filas: list[Fila]) -> None:
        columnas = list(filas[0]) if filas else []
        self._lineas.append("| " + " | ".join(columnas) + " |")
        self._lineas += ["| " + " | ".join(str(f[c]) for c in columnas) + " |" for f in filas]

    def generar(self) -> str:
        return "\n".join(self._lineas)


class RenderizadorCsv:
    def __init__(self) -> None:
        self._lineas: list[str] = []

    def titulo(self, texto: str) -> None:
        pass  # un CSV no tiene título

    def tabla(self, filas: list[Fila]) -> None:
        columnas = list(filas[0]) if filas else []
        self._lineas.append(",".join(columnas))
        self._lineas += [",".join(str(f[c]) for c in columnas) for f in filas]

    def generar(self) -> str:
        return "\n".join(self._lineas)


class Reporte(ABC):
    def __init__(self, salida: Renderizador) -> None:
        self._salida = salida  # el "puente" hacia la implementación

    @abstractmethod
    def exportar(self) -> str: ...


class ReporteVentas(Reporte):
    def exportar(self) -> str:
        self._salida.titulo("Ventas de noviembre")
        self._salida.tabla([{"producto": "Teclado", "unidades": 12}, {"producto": "Monitor", "unidades": 4}])
        return self._salida.generar()


class ReporteInventario(Reporte):
    def exportar(self) -> str:
        self._salida.titulo("Inventario")
        self._salida.tabla([{"sku": "TEC-01", "stock": 30}, {"sku": "MON-02", "stock": 0}])
        return self._salida.generar()


if __name__ == "__main__":
    print(ReporteVentas(RenderizadorMarkdown()).exportar())
    print(ReporteInventario(RenderizadorCsv()).exportar())
