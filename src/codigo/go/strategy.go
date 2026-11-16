// En Go una estrategia suele ser un tipo función (`type CalculoEnvio func(Pedido) float64`), y las
// estrategias configurables se crean con closures. El catálogo es un slice y no un mapa porque así
// se conserva el orden al recorrerlo.

package main

import (
	"fmt"
	"math"
)

type Pedido struct {
	Subtotal float64
	PesoKg   float64
	Pais     string
}

type CalculoEnvio func(Pedido) float64

func TarifaPlana(monto float64) CalculoEnvio {
	return func(Pedido) float64 { return monto }
}

func PorPeso(precioPorKg float64) CalculoEnvio {
	return func(p Pedido) float64 { return math.Round(p.PesoKg*precioPorKg*100) / 100 }
}

var tarifasPais = map[string]float64{"US": 45, "ES": 60}

func Internacional(p Pedido) float64 {
	if tarifa, existe := tarifasPais[p.Pais]; existe {
		return tarifa
	}
	return 80
}

var modalidades = []struct {
	Nombre   string
	Calcular CalculoEnvio
}{
	{"ciudad", TarifaPlana(10)},
	{"nacional", PorPeso(4.5)},
	{"internacional", Internacional},
	{"campania", TarifaPlana(0)},
}

func TotalConEnvio(p Pedido, calcular CalculoEnvio) float64 {
	return p.Subtotal + calcular(p)
}

func main() {
	pedido := Pedido{Subtotal: 200, PesoKg: 3.2, Pais: "ES"}

	// La modalidad la elige el cliente en tiempo de ejecución
	for _, m := range modalidades {
		fmt.Printf("%-14s %g\n", m.Nombre, TotalConEnvio(pedido, m.Calcular))
	}
	// ciudad 210 · nacional 214.4 · internacional 260 · campania 200
}
