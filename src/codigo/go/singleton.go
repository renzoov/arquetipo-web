// `sync.OnceValue` (Go 1.21) envuelve una función para que se ejecute una sola vez, aunque la
// llamen muchas goroutines a la vez, y devuelve siempre el mismo resultado. Es seguro con
// concurrencia sin escribir ningún mutex.

package main

import (
	"fmt"
	"sync"
)

type Configuracion struct {
	flags map[string]bool
}

func (c *Configuracion) EstaActiva(flag string) bool {
	return c.flags[flag]
}

var ObtenerConfiguracion = sync.OnceValue(func() *Configuracion {
	fmt.Println("Cargando configuración (solo ocurre una vez)...")
	return &Configuracion{flags: map[string]bool{"pagos.billetera": true, "envios.express": false}}
})

func main() {
	// Diez goroutines la piden a la vez
	var wg sync.WaitGroup
	resultados := make([]*Configuracion, 10)
	for i := range resultados {
		wg.Go(func() { resultados[i] = ObtenerConfiguracion() })
	}
	wg.Wait()

	todasIguales := true
	for _, r := range resultados {
		todasIguales = todasIguales && r == resultados[0]
	}
	fmt.Println("10 goroutines, misma instancia:", todasIguales)      // true
	fmt.Println(ObtenerConfiguracion().EstaActiva("pagos.billetera")) // true
	fmt.Println(ObtenerConfiguracion().EstaActiva("envios.express"))  // false
}
