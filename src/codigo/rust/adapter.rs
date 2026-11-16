// El resultado del pago es un `enum` con datos en cada variante, y el adaptador traduce los códigos
// del proveedor con `match`. Quien recibe el resultado también usa `match`, y el compilador lo obliga
// a tratar todas las variantes.

struct Tarjeta {
    numero: String,
}

enum ResultadoPago {
    Aprobado { operacion: String },
    Rechazado { motivo: String },
    Reintentar,
}

trait PasarelaPago {
    fn cobrar(&self, monto: f64, tarjeta: &Tarjeta) -> ResultadoPago;
}

// SDK de un tercero: no se puede modificar
struct SdkPagoLocal;

impl SdkPagoLocal {
    fn tokenizar(&self, tarjeta: &Tarjeta) -> String {
        format!("tok_{}", &tarjeta.numero[tarjeta.numero.len() - 4..])
    }

    fn crear_transaccion(&self, importe_centimos: u64, token: &str) -> (&'static str, String) {
        if importe_centimos > 100_000 {
            ("05", String::new())
        } else {
            ("00", format!("TX-{token}"))
        }
    }
}

struct AdaptadorPagoLocal {
    sdk: SdkPagoLocal,
}

impl PasarelaPago for AdaptadorPagoLocal {
    fn cobrar(&self, monto: f64, tarjeta: &Tarjeta) -> ResultadoPago {
        let centimos = (monto * 100.0).round() as u64;
        match self
            .sdk
            .crear_transaccion(centimos, &self.sdk.tokenizar(tarjeta))
        {
            ("00", id) => ResultadoPago::Aprobado { operacion: id },
            ("91", _) => ResultadoPago::Reintentar,
            (codigo, _) => ResultadoPago::Rechazado {
                motivo: format!("código del proveedor {codigo}"),
            },
        }
    }
}

fn main() {
    let pasarela: &dyn PasarelaPago = &AdaptadorPagoLocal { sdk: SdkPagoLocal };
    let tarjeta = Tarjeta {
        numero: "4111111111111111".to_string(),
    };

    for monto in [250.0, 1500.0] {
        match pasarela.cobrar(monto, &tarjeta) {
            ResultadoPago::Aprobado { operacion } => println!("aprobado → {operacion}"),
            ResultadoPago::Rechazado { motivo } => println!("rechazado → {motivo}"),
            ResultadoPago::Reintentar => println!("reintentar más tarde"),
        }
    }
    // aprobado → TX-tok_1111 · rechazado → código del proveedor 05
}
