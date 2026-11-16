// Igual que los middlewares de `net/http`: un decorador es una función que recibe una función y
// devuelve otra con la misma firma. Las capas se combinan anidando llamadas y los errores viajan
// como valores, envueltos con `%w` para no perder la causa original.

package main

import (
	"errors"
	"fmt"
	"time"
)

type Consulta func(moneda string) (float64, error)

func ConReintentos(intentos int) func(Consulta) Consulta {
	return func(siguiente Consulta) Consulta {
		return func(moneda string) (float64, error) {
			var err error
			for intento := 1; intento <= intentos; intento++ {
				var valor float64
				if valor, err = siguiente(moneda); err == nil {
					return valor, nil
				}
				if intento < intentos {
					fmt.Printf("  reintento %d...\n", intento)
				}
			}
			return 0, fmt.Errorf("tras %d intentos: %w", intentos, err)
		}
	}
}

func ConCache(ttl time.Duration) func(Consulta) Consulta {
	type entrada struct {
		valor  float64
		expira time.Time
	}
	return func(siguiente Consulta) Consulta {
		cache := map[string]entrada{} // con varias goroutines, habría que protegerlo con un sync.Mutex
		return func(moneda string) (float64, error) {
			if e, existe := cache[moneda]; existe && time.Now().Before(e.expira) {
				return e.valor, nil
			}
			valor, err := siguiente(moneda)
			if err != nil {
				return 0, err
			}
			cache[moneda] = entrada{valor, time.Now().Add(ttl)}
			return valor, nil
		}
	}
}

func ConLog(siguiente Consulta) Consulta {
	return func(moneda string) (float64, error) {
		fmt.Println("→ consultando", moneda)
		return siguiente(moneda)
	}
}

func main() {
	llamadas := 0
	api := func(moneda string) (float64, error) {
		llamadas++
		if llamadas == 1 {
			return 0, errors.New("tiempo de espera agotado") // el proveedor falla a veces
		}
		if moneda == "USD" {
			return 3.75, nil
		}
		return 4.05, nil
	}

	// El orden importa: la caché va por fuera para no registrar ni reintentar lo que ya está guardado
	obtener := ConCache(5 * time.Minute)(ConLog(ConReintentos(3)(api)))

	fmt.Println(obtener("USD")) // → consultando USD, reintento 1..., 3.75 <nil>
	fmt.Println(obtener("USD")) // 3.75 <nil> (desde la caché)
}
