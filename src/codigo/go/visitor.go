// En Go, el Visitor clásico (con `Aceptar` y doble despacho) casi siempre se sustituye por un "type
// switch": cada operación es una función con un `case` por tipo. La interfaz `Producto` es "sellada"
// con un método privado, así nadie fuera del paquete añade tipos. (La biblioteca estándar sí usa la
// forma clásica en `go/ast`, con `ast.Visitor` y `ast.Walk`.)

package main

import "fmt"

type Producto interface{ esProducto() }

type ProductoFisico struct {
	Nombre string
	Precio float64
	PesoKg float64
}

type ProductoDigital struct {
	Nombre string
	Precio float64
}

type Suscripcion struct {
	Nombre        string
	PrecioMensual float64
	Meses         int
}

func (ProductoFisico) esProducto()  {}
func (ProductoDigital) esProducto() {}
func (Suscripcion) esProducto()     {}

// ── Operación: costo de envío ──
func CostoEnvio(p Producto) float64 {
	switch p := p.(type) {
	case ProductoFisico:
		return p.PesoKg * 4.5
	case ProductoDigital, Suscripcion:
		return 0
	default:
		panic(fmt.Sprintf("tipo de producto no soportado: %T", p))
	}
}

// ── Operación: impuestos ──
func Impuestos(p Producto) float64 {
	switch p := p.(type) {
	case ProductoFisico:
		return p.Precio * 0.18
	case ProductoDigital:
		return p.Precio * 0.18
	case Suscripcion:
		return p.PrecioMensual * float64(p.Meses) * 0.18
	default:
		panic(fmt.Sprintf("tipo de producto no soportado: %T", p))
	}
}

// ── Operación: exportar a contabilidad ──
func ExportarContable(p Producto) string {
	switch p := p.(type) {
	case ProductoFisico:
		return fmt.Sprintf("MERCADERIA|%s|%g", p.Nombre, p.Precio)
	case ProductoDigital:
		return fmt.Sprintf("SERVICIO-DIGITAL|%s|%g", p.Nombre, p.Precio)
	case Suscripcion:
		return fmt.Sprintf("SUSCRIPCION|%s|%g", p.Nombre, p.PrecioMensual*float64(p.Meses))
	default:
		panic(fmt.Sprintf("tipo de producto no soportado: %T", p))
	}
}

func main() {
	carrito := []Producto{
		ProductoFisico{"Teclado", 100, 1.2},
		ProductoDigital{"Curso de patrones", 50},
		Suscripcion{"Plan Pro", 15, 12},
	}

	envio, impuestos := 0.0, 0.0
	for _, p := range carrito {
		envio += CostoEnvio(p)
		impuestos += Impuestos(p)
	}
	fmt.Printf("Envío: %.2f\n", envio)         // 5.40
	fmt.Printf("Impuestos: %.2f\n", impuestos) // 59.40

	for _, p := range carrito {
		fmt.Println(ExportarContable(p))
	}
}
