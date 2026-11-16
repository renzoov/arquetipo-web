// En Go, copiar un struct (`copia := *p`) ya copia sus campos, pero los slices y mapas siguen
// apuntando a los mismos datos: es una copia superficial. `Clonar` copia el struct y además
// duplica el slice de coberturas con `slices.Clone`.

package main

import (
	"fmt"
	"slices"
	"strings"
)

type Cobertura struct {
	Nombre        string
	SumaAsegurada float64
	Deducible     float64
}

type Poliza struct {
	Producto   string
	Coberturas []Cobertura
	Clausulas  []string // no se modifican: se pueden compartir entre clones
}

func (p *Poliza) Clonar() *Poliza {
	copia := *p                                   // copia superficial de todos los campos
	copia.Coberturas = slices.Clone(p.Coberturas) // copia propia de lo que sí cambia
	return &copia
}

func (p *Poliza) Resumen() string {
	nombres := make([]string, len(p.Coberturas))
	for i, c := range p.Coberturas {
		nombres[i] = c.Nombre
	}
	return fmt.Sprintf("%s: %s (%d cláusulas)", p.Producto, strings.Join(nombres, ", "), len(p.Clausulas))
}

// Registro de prototipos: plantillas configuradas una sola vez
var plantillas = map[string]*Poliza{
	"auto-total": {
		Producto:   "Auto Total",
		Coberturas: []Cobertura{{"Choque", 30_000, 500}, {"Robo", 30_000, 800}},
		Clausulas:  []string{"Vigencia anual", "Cobertura nacional"},
	},
}

func Cotizar(clave string) (*Poliza, error) {
	plantilla, existe := plantillas[clave]
	if !existe {
		return nil, fmt.Errorf("no existe la plantilla %s", clave)
	}
	return plantilla.Clonar(), nil
}

func main() {
	poliza, _ := Cotizar("auto-total")
	poliza.Coberturas[0].Deducible = 0 // descuento para este cliente
	poliza.Coberturas = append(poliza.Coberturas, Cobertura{"Auto de reemplazo", 1_500, 0})

	plantilla := plantillas["auto-total"]
	fmt.Println(poliza.Resumen())                                                // Auto Total: Choque, Robo, Auto de reemplazo (2 cláusulas)
	fmt.Println(plantilla.Resumen())                                             // Auto Total: Choque, Robo (2 cláusulas)
	fmt.Println("Deducible de la plantilla:", plantilla.Coberturas[0].Deducible) // 500: no cambió

	// Con una copia superficial, la plantilla se modificaría
	mal := *plantilla
	mal.Coberturas[0].Deducible = 0
	fmt.Println("Tras una copia superficial:", plantilla.Coberturas[0].Deducible) // 0: ¡cambió la plantilla!
}
