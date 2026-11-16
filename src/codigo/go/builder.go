// Go no tiene sobrecarga ni argumentos con nombre, así que el patrón idiomático es el de las
// "opciones funcionales": cada opción es una función que modifica la configuración, y el
// constructor las aplica en orden y devuelve un error si el resultado no es válido.

package main

import (
	"errors"
	"fmt"
	"slices"
	"strings"
)

type Busqueda struct {
	Texto        string
	PrecioMin    float64
	PrecioMax    float64
	SoloConStock bool
	Orden        string
	Pagina       int
}

type Opcion func(*Busqueda)

func ConTexto(texto string) Opcion {
	return func(b *Busqueda) { b.Texto = strings.TrimSpace(texto) }
}

func PrecioEntre(minimo, maximo float64) Opcion {
	return func(b *Busqueda) { b.PrecioMin, b.PrecioMax = minimo, maximo }
}

func SoloConStock() Opcion {
	return func(b *Busqueda) { b.SoloConStock = true }
}

func OrdenarPor(orden string) Opcion {
	return func(b *Busqueda) { b.Orden = orden }
}

var ordenesValidos = map[string]bool{"relevancia": true, "precio": true, "descuento": true, "novedad": true}

func NuevaBusqueda(opciones ...Opcion) (Busqueda, error) {
	b := Busqueda{Orden: "relevancia", Pagina: 1} // valores por defecto
	for _, opcion := range opciones {
		opcion(&b)
	}
	switch {
	case b.PrecioMax > 0 && b.PrecioMin > b.PrecioMax:
		return Busqueda{}, errors.New("rango de precio inválido")
	case !ordenesValidos[b.Orden]:
		return Busqueda{}, fmt.Errorf("orden desconocido: %s", b.Orden)
	}
	return b, nil
}

// Director: las recetas son listas de opciones
var OfertasDelDia = []Opcion{SoloConStock(), OrdenarPor("descuento")}

func main() {
	busqueda, err := NuevaBusqueda(ConTexto("  zapatillas "), PrecioEntre(50, 120), SoloConStock())
	fmt.Printf("%+v %v\n", busqueda, err)

	// Las recetas se combinan con más opciones
	ofertasLaptops, _ := NuevaBusqueda(slices.Concat(OfertasDelDia, []Opcion{ConTexto("laptop")})...)
	fmt.Println(ofertasLaptops.Texto, ofertasLaptops.Orden) // laptop descuento

	_, err = NuevaBusqueda(PrecioEntre(200, 100))
	fmt.Println(err) // rango de precio inválido
}
