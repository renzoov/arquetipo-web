// Los componentes guardan una referencia a la interfaz `Mediador`, y el mediador decide qué hacer con
// un "type switch" (`switch o := origen.(type)`), que distingue el tipo concreto del componente que
// avisó. Ningún componente conoce a otro.

package main

import (
	"fmt"
	"math"
)

var catalogo = map[string][]string{"laptops": {"Premium", "Económica"}, "celulares": {"Premium"}}

type Mediador interface{ Notificar(origen any) }

type SelectorCategoria struct {
	mediador Mediador
	Valor    string
}

func (s *SelectorCategoria) Elegir(categoria string) {
	s.Valor = categoria
	s.mediador.Notificar(s)
}

type SelectorMarca struct {
	mediador Mediador
	Valor    string
	Opciones []string
}

func (s *SelectorMarca) Elegir(marca string) {
	s.Valor = marca
	s.mediador.Notificar(s)
}

type BotonLimpiar struct{ mediador Mediador }

func (b *BotonLimpiar) Pulsar() { b.mediador.Notificar(b) }

type RangoPrecio struct{ Min, Max float64 }

var sinLimite = RangoPrecio{0, math.Inf(1)}

type PanelFiltros struct {
	Categoria  *SelectorCategoria
	Marca      *SelectorMarca
	Limpiar    *BotonLimpiar
	Precio     RangoPrecio
	Resultados string
}

func NuevoPanel() *PanelFiltros {
	p := &PanelFiltros{Precio: sinLimite}
	p.Categoria = &SelectorCategoria{mediador: p}
	p.Marca = &SelectorMarca{mediador: p}
	p.Limpiar = &BotonLimpiar{mediador: p}
	return p
}

func (p *PanelFiltros) Notificar(origen any) {
	switch o := origen.(type) {
	case *BotonLimpiar:
		p.Categoria.Valor, p.Marca.Valor, p.Marca.Opciones = "", "", nil
		p.Precio = sinLimite
	case *SelectorCategoria:
		p.Marca.Opciones, p.Marca.Valor = catalogo[o.Valor], ""
		p.Precio = sinLimite
	case *SelectorMarca:
		if o.Valor == "Premium" {
			p.Precio = RangoPrecio{500, 3000}
		} else {
			p.Precio = RangoPrecio{0, 800}
		}
	}
	p.actualizarResultados()
}

func (p *PanelFiltros) actualizarResultados() {
	total := 120
	if p.Categoria.Valor != "" {
		total = 25
		if p.Marca.Valor != "" {
			total = 8
		}
	}
	p.Resultados = fmt.Sprintf("%d resultados", total)
}

func main() {
	panel := NuevoPanel()

	panel.Categoria.Elegir("laptops")
	fmt.Println(panel.Marca.Opciones, panel.Resultados) // [Premium Económica] 25 resultados

	panel.Marca.Elegir("Premium")
	fmt.Println(panel.Precio, panel.Resultados) // {500 3000} 8 resultados

	panel.Limpiar.Pulsar()
	fmt.Println(panel.Resultados) // 120 resultados
}
