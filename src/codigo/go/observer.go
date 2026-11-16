// Los suscriptores son funciones que devuelven `error`. `Suscribir` devuelve la función para darse
// de baja y `Pagar` avisa a todos aunque alguno falle, reuniendo los fallos con `errors.Join`.
// Para avisos asíncronos, lo idiomático sería enviar el evento por un canal a cada suscriptor.

package main

import (
	"errors"
	"fmt"
	"slices"
)

type Pedido struct {
	ID    string
	Total float64
}

type Suscriptor func(Pedido) error

type suscripcion struct {
	id int
	fn Suscriptor
}

// ServicioPagos no es seguro para varias goroutines; en ese caso, protegerlo con un sync.Mutex
type ServicioPagos struct {
	suscripciones []suscripcion
	ultimoID      int
}

func (s *ServicioPagos) Suscribir(fn Suscriptor) (cancelar func()) {
	s.ultimoID++
	id := s.ultimoID
	s.suscripciones = append(s.suscripciones, suscripcion{id, fn})
	return func() {
		s.suscripciones = slices.DeleteFunc(s.suscripciones, func(x suscripcion) bool { return x.id == id })
	}
}

func (s *ServicioPagos) Pagar(p Pedido) error {
	fmt.Printf("Pedido %s cobrado\n", p.ID)
	var fallos []error
	for _, sub := range s.suscripciones {
		if err := sub.fn(p); err != nil {
			fallos = append(fallos, err)
		}
	}
	return errors.Join(fallos...)
}

func main() {
	pagos := &ServicioPagos{}

	pagos.Suscribir(func(p Pedido) error {
		fmt.Println("  correo de confirmación para", p.ID)
		return nil
	})
	pagos.Suscribir(func(Pedido) error {
		return errors.New("inventario no disponible")
	})
	cancelarFactura := pagos.Suscribir(func(p Pedido) error {
		fmt.Println("  factura emitida por", p.Total)
		return nil
	})

	if err := pagos.Pagar(Pedido{"P-1", 250}); err != nil {
		fmt.Println("  ⚠ fallos:", err)
	}

	cancelarFactura() // se da de baja
	if err := pagos.Pagar(Pedido{"P-2", 90}); err != nil {
		fmt.Println("  ⚠ fallos:", err) // ya no se emite factura
	}
}
