// El estilo de los middlewares de `net/http`: cada control recibe el siguiente manejador y devuelve
// uno nuevo. Si detecta un problema devuelve un error y no llama al siguiente, así que la cadena se
// corta sola. `Encadenar` arma la cadena a partir de una lista de controles.

package main

import (
	"errors"
	"fmt"
)

type Pago struct {
	Tarjeta      string
	Cliente      string
	Monto        float64
	PaisTarjeta  string
	PaisConexion string
}

type Manejador func(Pago) error
type Control func(siguiente Manejador) Manejador

var tarjetasBloqueadas = map[string]bool{"4000000000000002": true}
var gastadoHoy = map[string]float64{"cli-1": 900}

func ListaBloqueo(siguiente Manejador) Manejador {
	return func(p Pago) error {
		if tarjetasBloqueadas[p.Tarjeta] {
			return errors.New("tarjeta bloqueada")
		}
		return siguiente(p)
	}
}

func LimiteDiario(limite float64) Control {
	return func(siguiente Manejador) Manejador {
		return func(p Pago) error {
			if gastadoHoy[p.Cliente]+p.Monto > limite {
				return errors.New("supera el límite diario")
			}
			return siguiente(p)
		}
	}
}

func MismoPais(siguiente Manejador) Manejador {
	return func(p Pago) error {
		if p.PaisTarjeta != p.PaisConexion {
			return errors.New("el país de conexión no coincide")
		}
		return siguiente(p)
	}
}

// Encadenar envuelve el manejador final con los controles, del último al primero
func Encadenar(final Manejador, controles ...Control) Manejador {
	for i := len(controles) - 1; i >= 0; i-- {
		final = controles[i](final)
	}
	return final
}

func main() {
	aprobar := func(p Pago) error {
		fmt.Println("  pago aprobado por", p.Monto)
		return nil
	}
	revisar := Encadenar(aprobar, ListaBloqueo, LimiteDiario(1000), MismoPais)

	pago := Pago{"4111111111111111", "cli-2", 120, "PE", "PE"}
	fmt.Println("resultado:", revisar(pago)) // pago aprobado por 120 · resultado: <nil>

	sobreLimite := pago
	sobreLimite.Cliente = "cli-1"
	fmt.Println("resultado:", revisar(sobreLimite)) // resultado: supera el límite diario

	otroPais := pago
	otroPais.PaisConexion = "RU"
	fmt.Println("resultado:", revisar(otroPais)) // resultado: el país de conexión no coincide
}
