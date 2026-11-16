// Las interfaces son implícitas y pequeñas: cada producto tiene un solo método. Las fábricas son
// structs vacíos que cumplen `Infraestructura` sin declararlo, y el catálogo es un mapa de
// funciones constructoras. Un entorno desconocido se devuelve como error.

package main

import "fmt"

type Almacenamiento interface{ Subir(nombre string) string }
type Cola interface{ Publicar(mensaje string) string }
type Secretos interface{ Leer(clave string) string }

type Infraestructura interface {
	CrearAlmacenamiento() Almacenamiento
	CrearCola() Cola
	CrearSecretos() Secretos
}

// ── Familia: nube ──
type almacenamientoNube struct{}
type colaGestionada struct{}
type secretosNube struct{}

func (almacenamientoNube) Subir(nombre string) string { return "objetos-nube://facturas/" + nombre }
func (colaGestionada) Publicar(mensaje string) string { return "cola gestionada ← " + mensaje }
func (secretosNube) Leer(clave string) string         { return "gestor-de-secretos:" + clave }

type infraNube struct{}

func (infraNube) CrearAlmacenamiento() Almacenamiento { return almacenamientoNube{} }
func (infraNube) CrearCola() Cola                     { return colaGestionada{} }
func (infraNube) CrearSecretos() Secretos             { return secretosNube{} }

// ── Familia: on-premise ──
type discoEnRed struct{}
type colaRabbit struct{}
type secretosVault struct{}

func (discoEnRed) Subir(nombre string) string     { return "/mnt/nas/facturas/" + nombre }
func (colaRabbit) Publicar(mensaje string) string { return "RabbitMQ ← " + mensaje }
func (secretosVault) Leer(clave string) string    { return "vault:" + clave }

type infraOnPremise struct{}

func (infraOnPremise) CrearAlmacenamiento() Almacenamiento { return discoEnRed{} }
func (infraOnPremise) CrearCola() Cola                     { return colaRabbit{} }
func (infraOnPremise) CrearSecretos() Secretos             { return secretosVault{} }

var fabricas = map[string]func() Infraestructura{
	"nube":       func() Infraestructura { return infraNube{} },
	"on-premise": func() Infraestructura { return infraOnPremise{} },
}

func arrancar(entorno string) error {
	nueva, existe := fabricas[entorno]
	if !existe {
		return fmt.Errorf("entorno desconocido: %s", entorno)
	}
	infra := nueva() // se elige UNA vez; todo lo demás es de la misma familia
	fmt.Printf("[%s]\n", entorno)
	fmt.Println(" ", infra.CrearAlmacenamiento().Subir("F-001.pdf"))
	fmt.Println(" ", infra.CrearCola().Publicar("factura-emitida"))
	fmt.Println(" ", infra.CrearSecretos().Leer("certificado-firma"))
	return nil
}

func main() {
	for _, entorno := range []string{"nube", "on-premise", "marte"} {
		if err := arrancar(entorno); err != nil {
			fmt.Println("error:", err) // error: entorno desconocido: marte
		}
	}
}
