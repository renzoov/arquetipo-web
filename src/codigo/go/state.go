// Cada estado es un struct que cumple la interfaz `Estado`. Go no tiene herencia, pero sí
// incrustación (embedding): `rechazaTodo` aporta la respuesta por defecto (un error) y cada estado
// lo incrusta y solo define las acciones que permite.

package main

import "fmt"

type Estado interface {
	Nombre() string
	Pagar(*Pedido) error
	Enviar(*Pedido) error
	Cancelar(*Pedido) error
}

type rechazaTodo struct{ nombre string }

func (r rechazaTodo) Nombre() string         { return r.nombre }
func (r rechazaTodo) Pagar(*Pedido) error    { return r.prohibido("pagar") }
func (r rechazaTodo) Enviar(*Pedido) error   { return r.prohibido("enviar") }
func (r rechazaTodo) Cancelar(*Pedido) error { return r.prohibido("cancelar") }
func (r rechazaTodo) prohibido(accion string) error {
	return fmt.Errorf("no se puede %s un pedido %s", accion, r.nombre)
}

type pendiente struct{ rechazaTodo }

func (pendiente) Pagar(p *Pedido) error    { p.cambiar(Pagado); return nil }
func (pendiente) Cancelar(p *Pedido) error { p.cambiar(Cancelado); return nil }

type pagado struct{ rechazaTodo }

func (pagado) Enviar(p *Pedido) error { p.cambiar(Enviado); return nil }
func (pagado) Cancelar(p *Pedido) error {
	fmt.Println("  reembolso del pedido", p.ID)
	p.cambiar(Cancelado)
	return nil
}

// Los estados no guardan datos: basta una instancia de cada uno
var (
	Pendiente Estado = pendiente{rechazaTodo{"pendiente"}}
	Pagado    Estado = pagado{rechazaTodo{"pagado"}}
	Enviado   Estado = rechazaTodo{"enviado"}
	Cancelado Estado = rechazaTodo{"cancelado"}
)

type Pedido struct {
	ID     string
	estado Estado
}

func NuevoPedido(id string) *Pedido { return &Pedido{ID: id, estado: Pendiente} }

func (p *Pedido) cambiar(nuevo Estado) {
	fmt.Printf("  %s: %s → %s\n", p.ID, p.estado.Nombre(), nuevo.Nombre())
	p.estado = nuevo
}

func (p *Pedido) Pagar() error    { return p.estado.Pagar(p) }
func (p *Pedido) Enviar() error   { return p.estado.Enviar(p) }
func (p *Pedido) Cancelar() error { return p.estado.Cancelar(p) }

func main() {
	a := NuevoPedido("A-1")
	for _, accion := range []func() error{a.Pagar, a.Enviar, a.Cancelar} {
		if err := accion(); err != nil {
			fmt.Println("  error:", err) // error: no se puede cancelar un pedido enviado
		}
	}

	b := NuevoPedido("B-2")
	for _, accion := range []func() error{b.Pagar, b.Cancelar} {
		if err := accion(); err != nil {
			fmt.Println("  error:", err)
		}
	}
}
