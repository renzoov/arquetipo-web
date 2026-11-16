// Go 1.23 trae el paquete `unique`, que implementa justo este patrón (lo llama "interning"):
// `unique.Make` devuelve un `Handle`, y dos valores iguales comparten el mismo handle y una sola
// copia en memoria. Comparar handles es tan barato como comparar punteros.

package main

import (
	"fmt"
	"unique"
)

type Formato struct {
	Fuente        string
	Tamano        int
	Color         string
	FormatoNumero string
}

type Celda struct {
	Fila, Columna int
	Valor         string
	Formato       unique.Handle[Formato] // referencia al formato compartido
}

func main() {
	celdas := make([]Celda, 0, 100_000)
	distintos := map[unique.Handle[Formato]]bool{}

	for fila := range 1000 {
		for columna := range 100 {
			f := Formato{Fuente: "Inter", Tamano: 11, Color: "#333333", FormatoNumero: "#,##0.00"}
			if fila == 0 {
				f.Color = "#000000" // encabezado
			}
			if columna == 0 {
				f.FormatoNumero = "@" // texto
			}
			handle := unique.Make(f)
			distintos[handle] = true
			celdas = append(celdas, Celda{Fila: fila, Columna: columna, Formato: handle})
		}
	}

	fmt.Printf("%d celdas comparten %d formatos\n", len(celdas), len(distintos)) // 100000 celdas comparten 4 formatos
	fmt.Println(celdas[101].Formato == celdas[102].Formato)                      // true

	// Value() devuelve una copia: nadie puede modificar el formato compartido
	copia := celdas[101].Formato.Value()
	copia.Color = "#ff0000"
	fmt.Println(celdas[102].Formato.Value().Color) // #333333
}
