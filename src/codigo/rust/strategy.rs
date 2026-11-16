// En Rust una estrategia puede ser cualquier cierre: aquí, `Box<dyn Fn(&Pedido) -> f64>`. Las
// estrategias configurables son funciones que devuelven cierres `move`, que se quedan con sus
// parámetros. Un `Vec` de pares conserva el orden del catálogo.

struct Pedido {
    subtotal: f64,
    peso_kg: f64,
    pais: &'static str,
}

type CalculoEnvio = Box<dyn Fn(&Pedido) -> f64>;

fn tarifa_plana(monto: f64) -> CalculoEnvio {
    Box::new(move |_| monto)
}

fn por_peso(precio_por_kg: f64) -> CalculoEnvio {
    Box::new(move |pedido| (pedido.peso_kg * precio_por_kg * 100.0).round() / 100.0)
}

fn internacional(pedido: &Pedido) -> f64 {
    match pedido.pais {
        "US" => 45.0,
        "ES" => 60.0,
        _ => 80.0,
    }
}

fn total_con_envio(pedido: &Pedido, calcular_envio: &dyn Fn(&Pedido) -> f64) -> f64 {
    pedido.subtotal + calcular_envio(pedido)
}

fn main() {
    let modalidades: Vec<(&str, CalculoEnvio)> = vec![
        ("ciudad", tarifa_plana(10.0)),
        ("nacional", por_peso(4.5)),
        ("internacional", Box::new(internacional)),
        ("campania", tarifa_plana(0.0)),
    ];

    let pedido = Pedido {
        subtotal: 200.0,
        peso_kg: 3.2,
        pais: "ES",
    };

    // La modalidad la elige el cliente en tiempo de ejecución
    for (nombre, calcular) in &modalidades {
        println!(
            "{nombre:<14} {}",
            total_con_envio(&pedido, calcular.as_ref())
        );
    }
    // ciudad 210 · nacional 214.4 · internacional 260 · campania 200
}
