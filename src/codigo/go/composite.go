// La interfaz `Miembro` es implícita: empleados y áreas la cumplen sin declararlo. Para recorrer el
// árbol, cada miembro devuelve un iterador `iter.Seq` (Go 1.23), que se usa directamente con
// `for range` y se detiene si el bucle hace `break`.

package main

import (
	"fmt"
	"iter"
)

type Miembro interface {
	CostoMensual() float64
	Personas() iter.Seq[Empleado]
}

type Empleado struct {
	Nombre string
	Sueldo float64
}

func (e Empleado) CostoMensual() float64 { return e.Sueldo }

func (e Empleado) Personas() iter.Seq[Empleado] {
	return func(yield func(Empleado) bool) { yield(e) }
}

type Area struct {
	Nombre   string
	miembros []Miembro
}

func NuevaArea(nombre string, miembros ...Miembro) *Area {
	return &Area{Nombre: nombre, miembros: miembros}
}

func (a *Area) CostoMensual() float64 {
	total := 0.0
	for _, m := range a.miembros {
		total += m.CostoMensual()
	}
	return total
}

func (a *Area) Personas() iter.Seq[Empleado] {
	return func(yield func(Empleado) bool) {
		for _, m := range a.miembros {
			for persona := range m.Personas() {
				if !yield(persona) {
					return
				}
			}
		}
	}
}

func main() {
	tecnologia := NuevaArea("Tecnología",
		Empleado{"Ana", 5200},
		NuevaArea("Equipo Pagos", Empleado{"Luis", 4100}, Empleado{"Marta", 3900}),
	)

	fmt.Println(tecnologia.CostoMensual()) // 13200
	for persona := range tecnologia.Personas() {
		fmt.Println(persona.Nombre) // Ana, Luis, Marta
	}
}
