# Lo más pitónico es no escribir un Singleton: un módulo se importa una sola vez, así que sus objetos
# ya son únicos. Cuando la creación debe ser perezosa, `@functools.cache` sobre una función garantiza
# que se ejecute una sola vez. Es más simple y más fácil de probar que sobrescribir `__new__`.

from functools import cache


class Configuracion:
    def __init__(self) -> None:
        print("Cargando configuración (solo ocurre una vez)...")
        self._flags = {"pagos.billetera": True, "envios.express": False}

    def esta_activa(self, flag: str) -> bool:
        return self._flags.get(flag, False)


@cache
def obtener_configuracion() -> Configuracion:
    return Configuracion()


if __name__ == "__main__":
    desde_pagos = obtener_configuracion()
    desde_envios = obtener_configuracion()

    print(desde_pagos is desde_envios)                 # True
    print(desde_pagos.esta_activa("pagos.billetera"))  # True
    print(desde_envios.esta_activa("envios.express"))  # False

    # En las pruebas se puede reiniciar fácilmente
    obtener_configuracion.cache_clear()
