# En Python el módulo puede ser la fachada: las piezas del subsistema llevan un guion bajo inicial
# (por convención, "privadas del módulo") y solo `emitir_factura` es la interfaz pública. Un
# argumento con nombre y valor por defecto permite reemplazar una pieza en las pruebas.

import re
from collections.abc import Callable
from dataclasses import dataclass


@dataclass(frozen=True)
class Venta:
    id: str
    numero_fiscal: str
    total: float


@dataclass(frozen=True)
class Comprobante:
    serie: str
    constancia: str


def _validar_numero_fiscal(numero: str) -> None:
    if not re.fullmatch(r"\d{11}", numero):
        raise ValueError(f"Número fiscal inválido: {numero}")


def _generar_xml(venta: Venta) -> str:
    return f'<Factura id="{venta.id}" total="{venta.total:.2f}"/>'


def _firmar(xml: str) -> str:
    return xml.replace("/>", ' firma="a1b2c3"/>')


def _enviar_a_autoridad(xml_firmado: str) -> str:
    return f"CONSTANCIA-{len(xml_firmado)}"


def _guardar(venta: Venta, constancia: str) -> Comprobante:
    return Comprobante(f"F001-{venta.id}", constancia)


# La fachada: una sola función pública
def emitir_factura(venta: Venta, *, enviar: Callable[[str], str] = _enviar_a_autoridad) -> Comprobante:
    _validar_numero_fiscal(venta.numero_fiscal)
    constancia = enviar(_firmar(_generar_xml(venta)))
    return _guardar(venta, constancia)


if __name__ == "__main__":
    print(emitir_factura(Venta("000123", "20123456789", 118)))
    # Comprobante(serie='F001-000123', constancia='CONSTANCIA-52')

    # En una prueba, sin llamar a la autoridad tributaria real
    print(emitir_factura(Venta("000124", "20123456789", 50), enviar=lambda _: "CONSTANCIA-PRUEBA"))
