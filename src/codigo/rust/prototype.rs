// En Rust el patrón es el trait `Clone`: `#[derive(Clone)]` genera la copia, y para un `Vec` copia
// también sus elementos (copia profunda). Lo inmutable se comparte con `Rc`: clonar un `Rc` solo
// incrementa un contador, así que las cláusulas no se duplican.

use std::collections::HashMap;
use std::rc::Rc;

#[derive(Clone)]
struct Cobertura {
    nombre: String,
    deducible: f64,
}

#[derive(Clone)]
struct Poliza {
    producto: String,
    coberturas: Vec<Cobertura>, // se copia en cada clon
    clausulas: Rc<[String]>,    // inmutable: se comparte entre clones
}

impl Poliza {
    fn resumen(&self) -> String {
        let nombres: Vec<&str> = self.coberturas.iter().map(|c| c.nombre.as_str()).collect();
        format!(
            "{}: {} ({} cláusulas)",
            self.producto,
            nombres.join(", "),
            self.clausulas.len()
        )
    }
}

fn cobertura(nombre: &str, deducible: f64) -> Cobertura {
    Cobertura {
        nombre: nombre.to_string(),
        deducible,
    }
}

fn main() {
    // Registro de prototipos: plantillas configuradas una sola vez
    let plantillas = HashMap::from([(
        "auto-total",
        Poliza {
            producto: "Auto Total".to_string(),
            coberturas: vec![cobertura("Choque", 500.0), cobertura("Robo", 800.0)],
            clausulas: Rc::from(vec![
                "Vigencia anual".to_string(),
                "Cobertura nacional".to_string(),
            ]),
        },
    )]);

    let plantilla = &plantillas["auto-total"];
    let mut poliza = plantilla.clone();
    poliza.coberturas[0].deducible = 0.0; // descuento para este cliente
    poliza.coberturas.push(cobertura("Auto de reemplazo", 0.0));

    println!("{}", poliza.resumen()); // Auto Total: Choque, Robo, Auto de reemplazo (2 cláusulas)
    println!("{}", plantilla.resumen()); // Auto Total: Choque, Robo (2 cláusulas)
    println!(
        "Deducible de la plantilla: {}",
        plantilla.coberturas[0].deducible
    ); // 500
    println!(
        "Cláusulas compartidas: {}",
        Rc::ptr_eq(&poliza.clausulas, &plantilla.clausulas)
    ); // true
}
