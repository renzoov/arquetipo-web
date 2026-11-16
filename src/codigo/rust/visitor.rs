// En Rust, una jerarquía cerrada de tipos es un `enum`, y cada operación es un `match` exhaustivo: si
// mañana se añade una variante, el compilador señala cada operación que no la trata. Por eso Visitor
// casi no se usa; la forma clásica aparece en librerías como `syn` (visitar código) o `serde`.

enum Producto {
    Fisico {
        nombre: &'static str,
        precio: f64,
        peso_kg: f64,
    },
    Digital {
        nombre: &'static str,
        precio: f64,
    },
    Suscripcion {
        nombre: &'static str,
        precio_mensual: f64,
        meses: u32,
    },
}

// ── Operación: costo de envío ──
fn costo_envio(producto: &Producto) -> f64 {
    match producto {
        Producto::Fisico { peso_kg, .. } => peso_kg * 4.5,
        Producto::Digital { .. } | Producto::Suscripcion { .. } => 0.0,
    }
}

// ── Operación: impuestos ──
fn impuestos(producto: &Producto) -> f64 {
    match producto {
        Producto::Fisico { precio, .. } | Producto::Digital { precio, .. } => precio * 0.18,
        Producto::Suscripcion {
            precio_mensual,
            meses,
            ..
        } => precio_mensual * f64::from(*meses) * 0.18,
    }
}

// ── Operación: exportar a contabilidad ──
fn exportar_contable(producto: &Producto) -> String {
    match producto {
        Producto::Fisico { nombre, precio, .. } => format!("MERCADERIA|{nombre}|{precio}"),
        Producto::Digital { nombre, precio } => format!("SERVICIO-DIGITAL|{nombre}|{precio}"),
        Producto::Suscripcion {
            nombre,
            precio_mensual,
            meses,
        } => {
            format!(
                "SUSCRIPCION|{nombre}|{}",
                precio_mensual * f64::from(*meses)
            )
        }
    }
}

fn main() {
    let carrito = [
        Producto::Fisico {
            nombre: "Teclado",
            precio: 100.0,
            peso_kg: 1.2,
        },
        Producto::Digital {
            nombre: "Curso de patrones",
            precio: 50.0,
        },
        Producto::Suscripcion {
            nombre: "Plan Pro",
            precio_mensual: 15.0,
            meses: 12,
        },
    ];

    println!("Envío: {:.2}", carrito.iter().map(costo_envio).sum::<f64>()); // 5.40
    println!(
        "Impuestos: {:.2}",
        carrito.iter().map(impuestos).sum::<f64>()
    ); // 59.40
    for producto in &carrito {
        println!("{}", exportar_contable(producto));
    }
}
