// En Go, lo que empieza con minúscula no se exporta fuera del paquete: las piezas del subsistema son
// funciones privadas y la fachada es un struct con un único método público, `Emitir`. La dependencia
// que conviene sustituir en pruebas se guarda como un campo de tipo función.

package main

import (
	"fmt"
	"regexp"
	"strings"
)

type Venta struct {
	ID           string
	NumeroFiscal string
	Total        float64
}

type Comprobante struct {
	Serie      string
	Constancia string
}

var numeroFiscalValido = regexp.MustCompile(`^\d{11}$`)

func validarNumeroFiscal(numero string) error {
	if !numeroFiscalValido.MatchString(numero) {
		return fmt.Errorf("número fiscal inválido: %s", numero)
	}
	return nil
}

func generarXML(v Venta) string {
	return fmt.Sprintf(`<Factura id="%s" total="%.2f"/>`, v.ID, v.Total)
}

func firmar(xml string) string {
	return strings.Replace(xml, "/>", ` firma="a1b2c3"/>`, 1)
}

func enviarAAutoridad(xmlFirmado string) (string, error) {
	return fmt.Sprintf("CONSTANCIA-%d", len(xmlFirmado)), nil
}

// Facturacion es la fachada
type Facturacion struct {
	enviar func(xmlFirmado string) (string, error)
}

func NuevaFacturacion() *Facturacion {
	return &Facturacion{enviar: enviarAAutoridad}
}

func (f *Facturacion) Emitir(v Venta) (Comprobante, error) {
	if err := validarNumeroFiscal(v.NumeroFiscal); err != nil {
		return Comprobante{}, err
	}
	constancia, err := f.enviar(firmar(generarXML(v)))
	if err != nil {
		return Comprobante{}, fmt.Errorf("envío a la autoridad tributaria: %w", err)
	}
	return Comprobante{Serie: "F001-" + v.ID, Constancia: constancia}, nil
}

func main() {
	comprobante, err := NuevaFacturacion().Emitir(Venta{"000123", "20123456789", 118})
	fmt.Printf("%+v %v\n", comprobante, err) // {Serie:F001-000123 Constancia:CONSTANCIA-52} <nil>

	_, err = NuevaFacturacion().Emitir(Venta{"000125", "123", 10})
	fmt.Println(err) // número fiscal inválido: 123

	// En una prueba, sin llamar a la autoridad tributaria real
	prueba := &Facturacion{enviar: func(string) (string, error) { return "CONSTANCIA-PRUEBA", nil }}
	comprobante, _ = prueba.Emitir(Venta{"000124", "20123456789", 50})
	fmt.Printf("%+v\n", comprobante)
}
