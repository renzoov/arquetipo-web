// Go no tiene herencia, así que el método plantilla es una función que recibe los pasos variables
// como una interfaz. Los ganchos con comportamiento por defecto se obtienen incrustando el struct
// `pasosPorDefecto`, y cada tipo de contrato solo define lo que cambia.

package main

import (
	"fmt"
	"math"
)

type Empleado struct {
	Nombre                                    string
	SueldoBase, Subvencion, Horas, TarifaHora float64
	Hijos                                     int
}

type Boleta struct {
	Empleado                                string
	Bruto, Descuentos, Bonificaciones, Neto float64
}

type PasosNomina interface {
	IngresoBruto(Empleado) float64   // paso obligatorio
	Bonificaciones(Empleado) float64 // gancho
	AportaPension() bool             // gancho
}

// pasosPorDefecto aporta los ganchos a quien lo incruste
type pasosPorDefecto struct{}

func (pasosPorDefecto) Bonificaciones(Empleado) float64 { return 0 }
func (pasosPorDefecto) AportaPension() bool             { return true }

func redondear(n float64) float64 { return math.Round(n*100) / 100 }

// CalcularNomina es el método plantilla: el orden de los pasos es siempre el mismo
func CalcularNomina(e Empleado, pasos PasosNomina) Boleta {
	bruto := pasos.IngresoBruto(e)
	descuentos := 0.0
	if pasos.AportaPension() {
		descuentos = redondear(bruto * 0.13)
	}
	bonificaciones := pasos.Bonificaciones(e)
	return Boleta{e.Nombre, bruto, descuentos, bonificaciones, redondear(bruto - descuentos + bonificaciones)}
}

type NominaPlanilla struct{ pasosPorDefecto }

func (NominaPlanilla) IngresoBruto(e Empleado) float64 { return e.SueldoBase }
func (NominaPlanilla) Bonificaciones(e Empleado) float64 {
	if e.Hijos > 0 {
		return 100
	}
	return 0
}

type NominaPracticante struct{ pasosPorDefecto }

func (NominaPracticante) IngresoBruto(e Empleado) float64 { return e.Subvencion }
func (NominaPracticante) AportaPension() bool             { return false }

type NominaPorHoras struct{ pasosPorDefecto }

func (NominaPorHoras) IngresoBruto(e Empleado) float64 { return e.Horas * e.TarifaHora }

func main() {
	fmt.Printf("%+v\n", CalcularNomina(Empleado{Nombre: "Ana", SueldoBase: 4000, Hijos: 2}, NominaPlanilla{}))
	fmt.Printf("%+v\n", CalcularNomina(Empleado{Nombre: "Leo", Subvencion: 1200}, NominaPracticante{}))
	fmt.Printf("%+v\n", CalcularNomina(Empleado{Nombre: "Rosa", Horas: 80, TarifaHora: 25}, NominaPorHoras{}))
}
