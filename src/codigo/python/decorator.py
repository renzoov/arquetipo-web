# Los decoradores `@` de Python son exactamente este patrón aplicado a funciones: cada uno envuelve
# a la función y devuelve otra con la misma firma. `functools.wraps` conserva el nombre y la
# documentación de la original. Se aplican de abajo hacia arriba, así que el orden se lee en el código.

import time
from collections.abc import Callable
from functools import wraps

Consulta = Callable[[str], float]


def con_reintentos(intentos: int = 3) -> Callable[[Consulta], Consulta]:
    def decorar(funcion: Consulta) -> Consulta:
        @wraps(funcion)
        def envoltura(moneda: str) -> float:
            for intento in range(1, intentos + 1):
                try:
                    return funcion(moneda)
                except TimeoutError:
                    if intento == intentos:
                        raise
                    print(f"  reintento {intento}...")
            raise AssertionError("inalcanzable")
        return envoltura
    return decorar


def con_cache(ttl_segundos: float) -> Callable[[Consulta], Consulta]:
    def decorar(funcion: Consulta) -> Consulta:
        cache: dict[str, tuple[float, float]] = {}

        @wraps(funcion)
        def envoltura(moneda: str) -> float:
            if moneda in cache and cache[moneda][1] > time.monotonic():
                return cache[moneda][0]
            valor = funcion(moneda)
            cache[moneda] = (valor, time.monotonic() + ttl_segundos)
            return valor
        return envoltura
    return decorar


def con_log(funcion: Consulta) -> Consulta:
    @wraps(funcion)
    def envoltura(moneda: str) -> float:
        print(f"→ consultando {moneda}")
        return funcion(moneda)
    return envoltura


_llamadas = 0


# El orden importa: la caché va por fuera para no registrar ni reintentar lo que ya está guardado
@con_cache(ttl_segundos=300)
@con_log
@con_reintentos(intentos=3)
def obtener_tipo_cambio(moneda: str) -> float:
    """Consulta la API del proveedor de tipos de cambio."""
    global _llamadas
    _llamadas += 1
    if _llamadas == 1:
        raise TimeoutError("Tiempo de espera agotado")  # el proveedor falla a veces
    return 3.75 if moneda == "USD" else 4.05


if __name__ == "__main__":
    print(obtener_tipo_cambio("USD"))  # → consultando USD, reintento 1..., 3.75
    print(obtener_tipo_cambio("USD"))  # 3.75 (desde la caché)
    print(obtener_tipo_cambio.__name__, "-", obtener_tipo_cambio.__doc__)  # wraps conserva los metadatos
