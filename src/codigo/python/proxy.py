# `__getattr__` se llama cuando un atributo no existe en el proxy, así que se puede reenviar todo al
# objeto real sin escribir un método por operación. `functools.cached_property` crea el objeto real
# solo la primera vez que se necesita (proxy virtual).

from dataclasses import dataclass
from functools import cached_property
from typing import Any


class HistoriaClinica:
    def __init__(self, paciente_id: str) -> None:
        print(f"  (cargando la historia {paciente_id} y sus estudios...)")
        self.paciente_id = paciente_id

    def diagnosticos(self) -> list[str]:
        return ["Hipertensión controlada"]

    def imagenes(self) -> list[str]:
        return ["resonancia-2026-10.dcm"]


@dataclass(frozen=True)
class Usuario:
    id: str
    pacientes_asignados: tuple[str, ...]


class ProxyHistoriaClinica:
    def __init__(self, paciente_id: str, usuario: Usuario) -> None:
        self._paciente_id = paciente_id
        self._usuario = usuario

    @cached_property
    def _real(self) -> HistoriaClinica:  # se crea al primer uso
        return HistoriaClinica(self._paciente_id)

    def __getattr__(self, nombre: str) -> Any:
        if self._paciente_id not in self._usuario.pacientes_asignados:
            raise PermissionError(f"Acceso denegado a la historia {self._paciente_id}")
        return getattr(self._real, nombre)


if __name__ == "__main__":
    medica = Usuario("dra-rios", ("P-77",))

    historia = ProxyHistoriaClinica("P-77", medica)
    print("Proxy creado: todavía no se cargó nada")
    print(historia.diagnosticos())    # carga la historia la primera vez
    print(len(historia.imagenes()))   # ya está cargada

    ajena = ProxyHistoriaClinica("P-90", medica)
    try:
        ajena.diagnosticos()
    except PermissionError as error:
        print(error)  # Acceso denegado a la historia P-90
