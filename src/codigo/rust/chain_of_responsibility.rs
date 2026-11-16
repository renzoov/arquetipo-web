// Cada control es un cierre (closure) que devuelve `Some(motivo)` si rechaza o `None` si deja pasar.
// La cadena es un `Vec` de controles y `find_map` los recorre en orden y se detiene en el primero que
// devuelve `Some`: el corte de la cadena lo hace el propio iterador.

use std::collections::{HashMap, HashSet};

#[derive(Clone)]
struct Pago {
    tarjeta: String,
    cliente: String,
    monto: f64,
    pais_tarjeta: String,
    pais_conexion: String,
}

type Control = Box<dyn Fn(&Pago) -> Option<String>>;

fn lista_bloqueo(bloqueadas: HashSet<&'static str>) -> Control {
    Box::new(move |pago| {
        bloqueadas
            .contains(pago.tarjeta.as_str())
            .then(|| "Tarjeta bloqueada".to_string())
    })
}

fn limite_diario(limite: f64, gastado_hoy: HashMap<&'static str, f64>) -> Control {
    Box::new(move |pago| {
        let total = gastado_hoy
            .get(pago.cliente.as_str())
            .copied()
            .unwrap_or(0.0)
            + pago.monto;
        (total > limite).then(|| "Supera el límite diario".to_string())
    })
}

fn mismo_pais() -> Control {
    Box::new(|pago| {
        (pago.pais_tarjeta != pago.pais_conexion)
            .then(|| "El país de conexión no coincide".to_string())
    })
}

fn revisar(pago: &Pago, cadena: &[Control]) -> Result<(), String> {
    match cadena.iter().find_map(|control| control(pago)) {
        Some(motivo) => Err(motivo),
        None => Ok(()),
    }
}

fn main() {
    // Reordenar o quitar controles es editar esta lista
    let cadena = vec![
        lista_bloqueo(HashSet::from(["4000000000000002"])),
        limite_diario(1000.0, HashMap::from([("cli-1", 900.0)])),
        mismo_pais(),
    ];

    let pago = Pago {
        tarjeta: "4111111111111111".to_string(),
        cliente: "cli-2".to_string(),
        monto: 120.0,
        pais_tarjeta: "PE".to_string(),
        pais_conexion: "PE".to_string(),
    };

    println!("{:?}", revisar(&pago, &cadena)); // Ok(())
    let sobre_limite = Pago {
        cliente: "cli-1".to_string(),
        ..pago.clone()
    };
    println!("{:?}", revisar(&sobre_limite, &cadena)); // Err("Supera el límite diario")
    let otro_pais = Pago {
        pais_conexion: "RU".to_string(),
        ..pago
    };
    println!("{:?}", revisar(&otro_pais, &cadena)); // Err("El país de conexión no coincide")
}
