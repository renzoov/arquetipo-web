// Los errores son valores: un pago rechazado se devuelve como error. Los errores "centinela"
// (`ErrRechazado`) permiten distinguir el caso con `errors.Is`, aunque el adaptador agregue
// contexto envolviéndolos con `%w`.

package main

import (
	"errors"
	"fmt"
	"math"
)

type Tarjeta struct {
	Numero      string
	Vencimiento string
}

var (
	ErrRechazado  = errors.New("pago rechazado")
	ErrReintentar = errors.New("reintentar más tarde")
)

type PasarelaPago interface {
	Cobrar(monto float64, tarjeta Tarjeta) (operacion string, err error)
}

// SdkPagoLocal es de un tercero: no se puede modificar
type SdkPagoLocal struct{}

func (SdkPagoLocal) Tokenizar(t Tarjeta) string {
	return "tok_" + t.Numero[len(t.Numero)-4:]
}

func (SdkPagoLocal) CrearTransaccion(importeCentimos int, token string) (codigo, id string) {
	if importeCentimos > 100_000 {
		return "05", ""
	}
	return "00", "TX-" + token
}

type AdaptadorPagoLocal struct {
	sdk SdkPagoLocal
}

func (a AdaptadorPagoLocal) Cobrar(monto float64, tarjeta Tarjeta) (string, error) {
	codigo, id := a.sdk.CrearTransaccion(int(math.Round(monto*100)), a.sdk.Tokenizar(tarjeta))
	switch codigo {
	case "00":
		return id, nil
	case "91":
		return "", ErrReintentar
	default:
		return "", fmt.Errorf("%w: código del proveedor %s", ErrRechazado, codigo)
	}
}

func main() {
	var pasarela PasarelaPago = AdaptadorPagoLocal{}
	tarjeta := Tarjeta{"4111111111111111", "12/28"}

	for _, monto := range []float64{250, 1500} {
		operacion, err := pasarela.Cobrar(monto, tarjeta)
		switch {
		case errors.Is(err, ErrRechazado):
			fmt.Println("rechazado →", err) // rechazado → pago rechazado: código del proveedor 05
		case err != nil:
			fmt.Println("error:", err)
		default:
			fmt.Println("aprobado →", operacion) // aprobado → TX-tok_1111
		}
	}
}
