# Productos y fábrica se describen con `Protocol`: cualquier clase con los métodos correctos sirve,
# sin herencia. Las clases se pueden usar directamente como fábricas (son "llamables"), así que el
# catálogo es un diccionario de clases, y el entorno se tipa con `Literal`.

from collections.abc import Callable
from typing import Literal, Protocol


class Almacenamiento(Protocol):
    def subir(self, nombre: str) -> str: ...


class Cola(Protocol):
    def publicar(self, mensaje: str) -> str: ...


class Secretos(Protocol):
    def leer(self, clave: str) -> str: ...


class Infraestructura(Protocol):
    def crear_almacenamiento(self) -> Almacenamiento: ...
    def crear_cola(self) -> Cola: ...
    def crear_secretos(self) -> Secretos: ...


# ── Familia: nube ──
class AlmacenamientoNube:
    def subir(self, nombre: str) -> str:
        return f"objetos-nube://facturas/{nombre}"


class ColaGestionada:
    def publicar(self, mensaje: str) -> str:
        return f"cola gestionada ← {mensaje}"


class SecretosNube:
    def leer(self, clave: str) -> str:
        return f"gestor-de-secretos:{clave}"


class InfraNube:
    def crear_almacenamiento(self) -> Almacenamiento:
        return AlmacenamientoNube()

    def crear_cola(self) -> Cola:
        return ColaGestionada()

    def crear_secretos(self) -> Secretos:
        return SecretosNube()


# ── Familia: on-premise ──
class DiscoEnRed:
    def subir(self, nombre: str) -> str:
        return f"/mnt/nas/facturas/{nombre}"


class ColaRabbit:
    def publicar(self, mensaje: str) -> str:
        return f"RabbitMQ ← {mensaje}"


class SecretosVault:
    def leer(self, clave: str) -> str:
        return f"vault:{clave}"


class InfraOnPremise:
    def crear_almacenamiento(self) -> Almacenamiento:
        return DiscoEnRed()

    def crear_cola(self) -> Cola:
        return ColaRabbit()

    def crear_secretos(self) -> Secretos:
        return SecretosVault()


Entorno = Literal["nube", "on-premise"]

FABRICAS: dict[str, Callable[[], Infraestructura]] = {
    "nube": InfraNube,
    "on-premise": InfraOnPremise,
}


def arrancar(entorno: Entorno) -> None:
    infra = FABRICAS[entorno]()  # se elige UNA vez; todo lo demás es de la misma familia
    print(f"[{entorno}]")
    print(" ", infra.crear_almacenamiento().subir("F-001.pdf"))
    print(" ", infra.crear_cola().publicar("factura-emitida"))
    print(" ", infra.crear_secretos().leer("certificado-firma"))


if __name__ == "__main__":
    arrancar("nube")
    arrancar("on-premise")
