// La implementación es una interfaz pequeña y la abstracción un struct que la contiene. Go no tiene
// herencia: los reportes concretos reciben el campo `salida` incrustando (embedding) el struct base
// `reporte`. Las filas son slices, no mapas, porque en Go el orden de un mapa no está garantizado.

package main

import (
	"fmt"
	"strings"
)

type Renderizador interface {
	Titulo(texto string)
	Tabla(columnas []string, filas [][]string)
	Generar() string
}

type renderizadorMarkdown struct{ b strings.Builder }

func (r *renderizadorMarkdown) Titulo(texto string) { fmt.Fprintf(&r.b, "# %s\n", texto) }
func (r *renderizadorMarkdown) Tabla(columnas []string, filas [][]string) {
	fmt.Fprintf(&r.b, "| %s |\n", strings.Join(columnas, " | "))
	for _, fila := range filas {
		fmt.Fprintf(&r.b, "| %s |\n", strings.Join(fila, " | "))
	}
}
func (r *renderizadorMarkdown) Generar() string { return strings.TrimSpace(r.b.String()) }

type renderizadorCsv struct{ b strings.Builder }

func (r *renderizadorCsv) Titulo(string) {} // un CSV no tiene título
func (r *renderizadorCsv) Tabla(columnas []string, filas [][]string) {
	fmt.Fprintln(&r.b, strings.Join(columnas, ","))
	for _, fila := range filas {
		fmt.Fprintln(&r.b, strings.Join(fila, ","))
	}
}
func (r *renderizadorCsv) Generar() string { return strings.TrimSpace(r.b.String()) }

// reporte es la base de la abstracción: contiene el "puente" hacia la implementación
type reporte struct{ salida Renderizador }

type ReporteVentas struct{ reporte }

func (r ReporteVentas) Exportar() string {
	r.salida.Titulo("Ventas de noviembre")
	r.salida.Tabla([]string{"producto", "unidades"}, [][]string{{"Teclado", "12"}, {"Monitor", "4"}})
	return r.salida.Generar()
}

type ReporteInventario struct{ reporte }

func (r ReporteInventario) Exportar() string {
	r.salida.Titulo("Inventario")
	r.salida.Tabla([]string{"sku", "stock"}, [][]string{{"TEC-01", "30"}, {"MON-02", "0"}})
	return r.salida.Generar()
}

func main() {
	fmt.Println(ReporteVentas{reporte{&renderizadorMarkdown{}}}.Exportar())
	fmt.Println(ReporteInventario{reporte{&renderizadorCsv{}}}.Exportar())
}
