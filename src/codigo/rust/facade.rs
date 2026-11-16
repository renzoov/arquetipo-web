// La privacidad de Rust es por módulo: dentro de `mod facturacion`, solo lo marcado con `pub` se ve
// desde fuera. El subsistema vive en un submódulo privado, así que el resto del programa únicamente
// puede usar la fachada. La función de envío es un puntero a función para poder sustituirla en pruebas.

mod facturacion {
    pub struct Venta {
        pub id: String,
        pub numero_fiscal: String,
        pub total: f64,
    }

    pub struct Comprobante {
        pub serie: String,
        pub constancia: String,
    }

    // La fachada
    pub struct FacturacionElectronica {
        enviar: fn(&str) -> String,
    }

    impl Default for FacturacionElectronica {
        fn default() -> Self {
            Self {
                enviar: subsistema::enviar_a_autoridad,
            }
        }
    }

    impl FacturacionElectronica {
        pub fn con_envio(enviar: fn(&str) -> String) -> Self {
            Self { enviar }
        }

        pub fn emitir(&self, venta: &Venta) -> Result<Comprobante, String> {
            subsistema::validar_numero_fiscal(&venta.numero_fiscal)?;
            let xml_firmado = subsistema::firmar(&subsistema::generar_xml(venta));
            Ok(Comprobante {
                serie: format!("F001-{}", venta.id),
                constancia: (self.enviar)(&xml_firmado),
            })
        }
    }

    // Subsistema: módulo privado, invisible fuera de `facturacion`
    mod subsistema {
        use super::Venta;

        pub fn validar_numero_fiscal(numero: &str) -> Result<(), String> {
            if numero.len() == 11 && numero.chars().all(|c| c.is_ascii_digit()) {
                Ok(())
            } else {
                Err(format!("número fiscal inválido: {numero}"))
            }
        }

        pub fn generar_xml(venta: &Venta) -> String {
            format!(r#"<Factura id="{}" total="{:.2}"/>"#, venta.id, venta.total)
        }

        pub fn firmar(xml: &str) -> String {
            xml.replace("/>", r#" firma="a1b2c3"/>"#)
        }

        pub fn enviar_a_autoridad(xml_firmado: &str) -> String {
            format!("CONSTANCIA-{}", xml_firmado.len())
        }
    }
}

use facturacion::{Comprobante, FacturacionElectronica, Venta};

fn venta(id: &str, numero_fiscal: &str, total: f64) -> Venta {
    Venta {
        id: id.to_string(),
        numero_fiscal: numero_fiscal.to_string(),
        total,
    }
}

fn mostrar(resultado: Result<Comprobante, String>) {
    match resultado {
        Ok(c) => println!("{} · {}", c.serie, c.constancia),
        Err(error) => println!("error: {error}"),
    }
}

fn main() {
    let facturacion = FacturacionElectronica::default();
    mostrar(facturacion.emitir(&venta("000123", "20123456789", 118.0))); // F001-000123 · CONSTANCIA-52
    mostrar(facturacion.emitir(&venta("000125", "123", 10.0))); // error: número fiscal inválido: 123

    // En una prueba, sin llamar a la autoridad tributaria real
    let prueba = FacturacionElectronica::con_envio(|_| "CONSTANCIA-PRUEBA".to_string());
    mostrar(prueba.emitir(&venta("000124", "20123456789", 50.0)));
}
