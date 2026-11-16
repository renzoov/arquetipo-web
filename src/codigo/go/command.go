// Los comandos implementan una interfaz pequeña de tres métodos. Como `Ejecutar` y `Deshacer`
// devuelven `error`, el invocador solo guarda en el historial lo que se ejecutó bien, y el error
// llega a quien lo pidió con el contexto añadido por `%w`.

package main

import (
	"fmt"
	"math"
)

type Producto struct {
	ID        string
	Categoria string
	Precio    float64
	Activo    bool
}

type RepoProductos struct{ productos []*Producto }

func NuevoRepo() *RepoProductos {
	return &RepoProductos{[]*Producto{
		{"teclado", "perifericos", 100, true},
		{"mouse", "perifericos", 40, true},
		{"monitor", "pantallas", 900, true},
	}}
}

func (r *RepoProductos) Buscar(id string) (*Producto, error) {
	for _, p := range r.productos {
		if p.ID == id {
			return p, nil
		}
	}
	return nil, fmt.Errorf("no existe el producto %s", id)
}

func (r *RepoProductos) DeCategoria(categoria string) []*Producto {
	var resultado []*Producto
	for _, p := range r.productos {
		if p.Categoria == categoria {
			resultado = append(resultado, p)
		}
	}
	return resultado
}

func (r *RepoProductos) Listar() []string {
	lista := make([]string, len(r.productos))
	for i, p := range r.productos {
		lista[i] = fmt.Sprintf("%s %g", p.ID, p.Precio)
		if !p.Activo {
			lista[i] += " (inactivo)"
		}
	}
	return lista
}

type Comando interface {
	Ejecutar() error
	Deshacer() error
	Descripcion() string
}

type AjustarPrecios struct {
	repo       *RepoProductos
	categoria  string
	factor     float64
	anteriores map[string]float64
}

func (c *AjustarPrecios) Descripcion() string {
	return fmt.Sprintf("Ajustar precios de %s ×%g", c.categoria, c.factor)
}

func (c *AjustarPrecios) Ejecutar() error {
	c.anteriores = map[string]float64{}
	for _, p := range c.repo.DeCategoria(c.categoria) {
		c.anteriores[p.ID] = p.Precio
		p.Precio = math.Round(p.Precio*c.factor*100) / 100
	}
	return nil
}

func (c *AjustarPrecios) Deshacer() error {
	for id, precio := range c.anteriores {
		p, err := c.repo.Buscar(id)
		if err != nil {
			return err
		}
		p.Precio = precio
	}
	return nil
}

type DesactivarProducto struct {
	repo *RepoProductos
	id   string
}

func (c DesactivarProducto) Descripcion() string { return "Desactivar " + c.id }
func (c DesactivarProducto) Ejecutar() error     { return c.cambiar(false) }
func (c DesactivarProducto) Deshacer() error     { return c.cambiar(true) }

func (c DesactivarProducto) cambiar(activo bool) error {
	p, err := c.repo.Buscar(c.id)
	if err != nil {
		return err
	}
	p.Activo = activo
	return nil
}

type Invocador struct{ historial []Comando }

func (i *Invocador) Ejecutar(c Comando, usuario string) error {
	if err := c.Ejecutar(); err != nil {
		return fmt.Errorf("%s: %w", c.Descripcion(), err)
	}
	i.historial = append(i.historial, c)
	fmt.Printf("[auditoría] %s: %s\n", usuario, c.Descripcion())
	return nil
}

func (i *Invocador) DeshacerUltimo() error {
	if len(i.historial) == 0 {
		return nil
	}
	ultimo := i.historial[len(i.historial)-1]
	i.historial = i.historial[:len(i.historial)-1]
	return ultimo.Deshacer()
}

func main() {
	repo := NuevoRepo()
	panel := &Invocador{}

	_ = panel.Ejecutar(&AjustarPrecios{repo: repo, categoria: "perifericos", factor: 1.1}, "ana")
	_ = panel.Ejecutar(DesactivarProducto{repo, "monitor"}, "ana")
	fmt.Println(repo.Listar()) // [teclado 110 mouse 44 monitor 900 (inactivo)]

	_ = panel.DeshacerUltimo()
	_ = panel.DeshacerUltimo()
	fmt.Println(repo.Listar()) // [teclado 100 mouse 40 monitor 900]

	err := panel.Ejecutar(DesactivarProducto{repo, "silla"}, "ana")
	fmt.Println("error:", err) // error: Desactivar silla: no existe el producto silla
}
