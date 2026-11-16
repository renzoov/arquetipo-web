// Desde Go 1.23 se puede recorrer una función con `for range` (range-over-func). El iterador es un
// `iter.Seq2` que entrega cada cliente junto con un posible error; si el bucle hace `break`, `yield`
// devuelve false y el iterador deja de pedir páginas.

package main

import (
	"fmt"
	"iter"
	"strconv"
)

type Cliente struct {
	ID     int
	Nombre string
}

type Pagina struct {
	Datos           []Cliente
	SiguienteCursor string
}

type ApiCrm struct {
	clientes   []Cliente
	Peticiones int
}

func NuevaApiCrm() *ApiCrm {
	api := &ApiCrm{}
	for i, nombre := range []string{"Ana", "Luis", "Marta", "Jorge", "Elena"} {
		api.clientes = append(api.clientes, Cliente{i + 1, nombre})
	}
	return api
}

func (a *ApiCrm) ListarClientes(limite int, cursor string) (Pagina, error) {
	a.Peticiones++
	desde := 0
	if cursor != "" {
		var err error
		if desde, err = strconv.Atoi(cursor); err != nil {
			return Pagina{}, fmt.Errorf("cursor inválido: %w", err)
		}
	}
	hasta := min(desde+limite, len(a.clientes))
	pagina := Pagina{Datos: a.clientes[desde:hasta]}
	if hasta < len(a.clientes) {
		pagina.SiguienteCursor = strconv.Itoa(hasta)
	}
	return pagina, nil
}

func ClientesCrm(api *ApiCrm, limite int) iter.Seq2[Cliente, error] {
	return func(yield func(Cliente, error) bool) {
		cursor := ""
		for {
			pagina, err := api.ListarClientes(limite, cursor)
			if err != nil {
				yield(Cliente{}, err)
				return
			}
			for _, cliente := range pagina.Datos {
				if !yield(cliente, nil) {
					return // el cliente salió del bucle: no se piden más páginas
				}
			}
			if pagina.SiguienteCursor == "" {
				return
			}
			cursor = pagina.SiguienteCursor
		}
	}
}

func main() {
	api := NuevaApiCrm()
	for cliente, err := range ClientesCrm(api, 2) {
		if err != nil {
			fmt.Println("error:", err)
			break
		}
		fmt.Println(cliente.Nombre)
	}
	fmt.Println("Peticiones a la API:", api.Peticiones) // 3

	otra := NuevaApiCrm()
	for cliente := range ClientesCrm(otra, 2) {
		if cliente.ID == 2 {
			break
		}
	}
	fmt.Println("Peticiones a la API:", otra.Peticiones) // 1
}
