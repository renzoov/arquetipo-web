// En Go, los campos en minúscula no son visibles fuera del paquete: el `Memento` exporta solo su
// etiqueta y guarda el estado en un campo privado. `slices.Clone` copia los accesorios para que el
// memento no comparta el slice con el configurador.

package main

import (
	"fmt"
	"slices"
)

type estadoConfig struct {
	modelo, motor, caja string
	accesorios          []string
	precio              int
}

func (e estadoConfig) copiar() estadoConfig {
	e.accesorios = slices.Clone(e.accesorios)
	return e
}

type Memento struct {
	Etiqueta string
	estado   estadoConfig // privado: fuera del paquete nadie puede leerlo
}

var recargo = map[string]int{"gasolina": 0, "hibrido": 4000, "electrico": 9000}

type Configurador struct{ estado estadoConfig }

func NuevoConfigurador() *Configurador {
	return &Configurador{estadoConfig{modelo: "Sedán", motor: "gasolina", caja: "manual", precio: 20000}}
}

func (c *Configurador) ElegirMotor(motor string) error {
	if _, existe := recargo[motor]; !existe {
		return fmt.Errorf("motor desconocido: %s", motor)
	}
	c.estado.motor = motor
	if motor == "electrico" {
		c.estado.caja = "automatica" // regla: no hay eléctricos manuales
	}
	c.recalcular()
	return nil
}

func (c *Configurador) AgregarAccesorio(accesorio string) {
	c.estado.accesorios = append(c.estado.accesorios, accesorio)
	c.recalcular()
}

func (c *Configurador) Guardar(etiqueta string) Memento { return Memento{etiqueta, c.estado.copiar()} }
func (c *Configurador) Restaurar(m Memento)             { c.estado = m.estado.copiar() }

func (c *Configurador) Resumen() string {
	e := c.estado
	return fmt.Sprintf("%s %s/%s %v %d USD", e.modelo, e.motor, e.caja, e.accesorios, e.precio)
}

func (c *Configurador) recalcular() {
	c.estado.precio = 20000 + recargo[c.estado.motor] + len(c.estado.accesorios)*600
}

type Historial struct {
	configurador *Configurador
	pila         []Memento
}

func (h *Historial) Guardar(etiqueta string) {
	h.pila = append(h.pila, h.configurador.Guardar(etiqueta))
}

func (h *Historial) Deshacer() (string, bool) {
	if len(h.pila) == 0 {
		return "", false
	}
	ultimo := h.pila[len(h.pila)-1]
	h.pila = h.pila[:len(h.pila)-1]
	h.configurador.Restaurar(ultimo)
	return ultimo.Etiqueta, true
}

func main() {
	config := NuevoConfigurador()
	historial := &Historial{configurador: config}

	historial.Guardar("base")
	_ = config.ElegirMotor("electrico")
	historial.Guardar("eléctrico")
	config.AgregarAccesorio("Techo solar")
	fmt.Println(config.Resumen()) // Sedán electrico/automatica [Techo solar] 29600 USD

	etiqueta, _ := historial.Deshacer()
	fmt.Println("Volver a:", etiqueta)
	fmt.Println(config.Resumen()) // Sedán electrico/automatica [] 29000 USD

	etiqueta, _ = historial.Deshacer()
	fmt.Println("Volver a:", etiqueta)
	fmt.Println(config.Resumen()) // Sedán gasolina/manual [] 20000 USD
}
