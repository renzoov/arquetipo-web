// Cada expresión cumple la interfaz `Expresion`. Las terminales son tipos definidos sobre tipos
// básicos (`type TotalMayorQue float64`), algo muy propio de Go. Al implementar también `String()`
// (la interfaz `fmt.Stringer`), `fmt.Println` muestra la regla de forma legible.

package main

import "fmt"

type Carrito struct {
	Total            float64
	ClienteFrecuente bool
	Cupon            string
}

type Expresion interface {
	Interpretar(Carrito) bool
	fmt.Stringer
}

type TotalMayorQue float64

func (t TotalMayorQue) Interpretar(c Carrito) bool { return c.Total > float64(t) }
func (t TotalMayorQue) String() string             { return fmt.Sprintf("total > %g", float64(t)) }

type EsClienteFrecuente struct{}

func (EsClienteFrecuente) Interpretar(c Carrito) bool { return c.ClienteFrecuente }
func (EsClienteFrecuente) String() string             { return "cliente_frecuente" }

type CuponIgual string

func (cupon CuponIgual) Interpretar(c Carrito) bool { return c.Cupon == string(cupon) }
func (cupon CuponIgual) String() string             { return fmt.Sprintf("cupon = %q", string(cupon)) }

type Y struct{ Izquierda, Derecha Expresion }

func (y Y) Interpretar(c Carrito) bool { return y.Izquierda.Interpretar(c) && y.Derecha.Interpretar(c) }
func (y Y) String() string             { return fmt.Sprintf("(%v Y %v)", y.Izquierda, y.Derecha) }

type O struct{ Izquierda, Derecha Expresion }

func (o O) Interpretar(c Carrito) bool { return o.Izquierda.Interpretar(c) || o.Derecha.Interpretar(c) }
func (o O) String() string             { return fmt.Sprintf("(%v O %v)", o.Izquierda, o.Derecha) }

func main() {
	// total > 100 Y cliente_frecuente O cupon = "VERANO"
	// (en la aplicación real, este árbol lo construiría un parser a partir del texto)
	var regla Expresion = O{Y{TotalMayorQue(100), EsClienteFrecuente{}}, CuponIgual("VERANO")}

	fmt.Println(regla)                                                           // ((total > 100 Y cliente_frecuente) O cupon = "VERANO")
	fmt.Println(regla.Interpretar(Carrito{Total: 150, ClienteFrecuente: true}))  // true
	fmt.Println(regla.Interpretar(Carrito{Total: 150, ClienteFrecuente: false})) // false
	fmt.Println(regla.Interpretar(Carrito{Total: 20, Cupon: "VERANO"}))          // true
}
