// El proxy cumple la misma interfaz que la historia real. `sync.OnceValues` (Go 1.21) carga el
// objeto real una sola vez y es seguro con goroutines. Los permisos se comprueban antes de cada
// acceso y un acceso denegado se devuelve como error.

package main

import (
	"errors"
	"fmt"
	"slices"
	"sync"
)

type HistoriaClinica interface {
	Diagnosticos() ([]string, error)
	Imagenes() ([]string, error)
}

type historiaReal struct{ pacienteID string }

func cargarHistoria(pacienteID string) (*historiaReal, error) {
	fmt.Printf("  (cargando la historia %s y sus estudios...)\n", pacienteID)
	return &historiaReal{pacienteID}, nil
}

func (h *historiaReal) Diagnosticos() ([]string, error) {
	return []string{"Hipertensión controlada"}, nil
}

func (h *historiaReal) Imagenes() ([]string, error) {
	return []string{"resonancia-2026-10.dcm"}, nil
}

var ErrAccesoDenegado = errors.New("acceso denegado")

type Usuario struct {
	ID                 string
	PacientesAsignados []string
}

type ProxyHistoria struct {
	pacienteID string
	usuario    Usuario
	real       func() (*historiaReal, error) // se ejecuta una sola vez
}

func NuevoProxyHistoria(pacienteID string, usuario Usuario) *ProxyHistoria {
	return &ProxyHistoria{
		pacienteID: pacienteID,
		usuario:    usuario,
		real:       sync.OnceValues(func() (*historiaReal, error) { return cargarHistoria(pacienteID) }),
	}
}

func (p *ProxyHistoria) acceder() (*historiaReal, error) {
	if !slices.Contains(p.usuario.PacientesAsignados, p.pacienteID) {
		return nil, fmt.Errorf("%w a la historia %s", ErrAccesoDenegado, p.pacienteID)
	}
	return p.real()
}

func (p *ProxyHistoria) Diagnosticos() ([]string, error) {
	h, err := p.acceder()
	if err != nil {
		return nil, err
	}
	return h.Diagnosticos()
}

func (p *ProxyHistoria) Imagenes() ([]string, error) {
	h, err := p.acceder()
	if err != nil {
		return nil, err
	}
	return h.Imagenes()
}

func main() {
	medica := Usuario{"dra-rios", []string{"P-77"}}

	var historia HistoriaClinica = NuevoProxyHistoria("P-77", medica)
	fmt.Println("Proxy creado: todavía no se cargó nada")
	fmt.Println(historia.Diagnosticos()) // carga la historia la primera vez
	fmt.Println(historia.Imagenes())     // ya está cargada

	_, err := NuevoProxyHistoria("P-90", medica).Diagnosticos()
	fmt.Println(err, errors.Is(err, ErrAccesoDenegado)) // acceso denegado a la historia P-90 true
}
