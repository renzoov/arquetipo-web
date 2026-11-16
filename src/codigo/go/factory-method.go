// Go no tiene herencia ni clases abstractas. El "método fábrica" se guarda como un campo de tipo
// función en el conciliador, y cada constructor (`NuevoConciliadorAndino`) decide qué lector crear.
// Las interfaces son implícitas: un lector solo necesita tener el método `Leer`.

package main

import (
	"fmt"
	"strconv"
	"strings"
)

type Movimiento struct {
	Fecha      string
	Referencia string
	Monto      float64
}

type LectorExtracto interface {
	Leer(contenido string) ([]Movimiento, error)
}

type lectorCsvAndino struct{}

func (lectorCsvAndino) Leer(contenido string) ([]Movimiento, error) {
	var movimientos []Movimiento
	for _, linea := range strings.Split(strings.TrimSpace(contenido), "\n") {
		partes := strings.Split(linea, ";")
		if len(partes) != 3 {
			return nil, fmt.Errorf("línea inválida: %q", linea)
		}
		monto, err := strconv.ParseFloat(partes[2], 64)
		if err != nil {
			return nil, fmt.Errorf("monto inválido en %q: %w", linea, err)
		}
		movimientos = append(movimientos, Movimiento{partes[0], partes[1], monto})
	}
	return movimientos, nil
}

type lectorTxtPacifico struct{}

// Ancho fijo: fecha (10) + referencia (8) + monto (resto)
func (lectorTxtPacifico) Leer(contenido string) ([]Movimiento, error) {
	var movimientos []Movimiento
	for _, linea := range strings.Split(strings.TrimSpace(contenido), "\n") {
		if len(linea) < 19 {
			return nil, fmt.Errorf("línea demasiado corta: %q", linea)
		}
		monto, err := strconv.ParseFloat(strings.TrimSpace(linea[18:]), 64)
		if err != nil {
			return nil, fmt.Errorf("monto inválido en %q: %w", linea, err)
		}
		movimientos = append(movimientos, Movimiento{linea[:10], strings.TrimSpace(linea[10:18]), monto})
	}
	return movimientos, nil
}

// Conciliador guarda el método fábrica como una función
type Conciliador struct {
	crearLector func() LectorExtracto
}

func NuevoConciliadorAndino() *Conciliador {
	return &Conciliador{crearLector: func() LectorExtracto { return lectorCsvAndino{} }}
}

func NuevoConciliadorPacifico() *Conciliador {
	return &Conciliador{crearLector: func() LectorExtracto { return lectorTxtPacifico{} }}
}

func (c *Conciliador) Conciliar(contenido string, ventas map[string]float64) ([]string, error) {
	movimientos, err := c.crearLector().Leer(contenido)
	if err != nil {
		return nil, err
	}
	var diferencias []string
	for _, m := range movimientos {
		esperado, existe := ventas[m.Referencia]
		switch {
		case !existe:
			diferencias = append(diferencias, fmt.Sprintf("%s: banco %g, ventas sin registro", m.Referencia, m.Monto))
		case esperado != m.Monto:
			diferencias = append(diferencias, fmt.Sprintf("%s: banco %g, ventas %g", m.Referencia, m.Monto, esperado))
		}
	}
	return diferencias, nil
}

func main() {
	ventas := map[string]float64{"F-001": 150, "F-002": 80}

	diferencias, err := NuevoConciliadorAndino().Conciliar("2026-11-01;F-001;150\n2026-11-01;F-002;75", ventas)
	fmt.Println(diferencias, err) // [F-002: banco 75, ventas 80] <nil>

	diferencias, err = NuevoConciliadorPacifico().Conciliar("2026-11-01F-001   150\n2026-11-02F-003   40", ventas)
	fmt.Println(diferencias, err) // [F-003: banco 40, ventas sin registro] <nil>

	_, err = NuevoConciliadorAndino().Conciliar("2026-11-01;F-009;abc", ventas)
	fmt.Println(err) // monto inválido en "2026-11-01;F-009;abc": strconv.ParseFloat: ...
}
