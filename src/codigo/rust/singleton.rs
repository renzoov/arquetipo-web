// `std::sync::LazyLock` inicializa un valor `static` la primera vez que se usa, de forma segura entre
// hilos. Rust no permite estado global mutable sin sincronización: el singleton es inmutable o se
// protege con un `Mutex`, y el compilador lo exige.

use std::collections::HashMap;
use std::sync::LazyLock;
use std::thread;

struct Configuracion {
    flags: HashMap<&'static str, bool>,
}

impl Configuracion {
    fn esta_activa(&self, flag: &str) -> bool {
        self.flags.get(flag).copied().unwrap_or(false)
    }
}

static CONFIGURACION: LazyLock<Configuracion> = LazyLock::new(|| {
    println!("Cargando configuración (solo ocurre una vez)...");
    Configuracion {
        flags: HashMap::from([("pagos.billetera", true), ("envios.express", false)]),
    }
});

fn main() {
    // Diez hilos la piden a la vez
    let instancias: Vec<&'static Configuracion> = thread::scope(|s| {
        let hilos: Vec<_> = (0..10).map(|_| s.spawn(|| &*CONFIGURACION)).collect();
        hilos
            .into_iter()
            .map(|h| h.join().expect("el hilo terminó con error"))
            .collect()
    });

    let misma = instancias.iter().all(|i| std::ptr::eq(*i, instancias[0]));
    println!("10 hilos, misma instancia: {misma}"); // true
    println!("{}", CONFIGURACION.esta_activa("pagos.billetera")); // true
    println!("{}", CONFIGURACION.esta_activa("envios.express")); // false
}
