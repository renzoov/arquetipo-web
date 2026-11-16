// Cada decorador es un `struct` genérico sobre lo que envuelve (`ConCache<F: FuenteTiposCambio>`): el
// compilador conoce toda la pila de capas y no hay llamadas dinámicas, así que decorar no cuesta nada
// en tiempo de ejecución. Los fallos viajan en `Result`.

use std::collections::HashMap;
use std::time::{Duration, Instant};

trait FuenteTiposCambio {
    fn obtener(&mut self, moneda: &str) -> Result<f64, String>;
}

struct ApiTiposCambio {
    llamadas: u32,
}

impl FuenteTiposCambio for ApiTiposCambio {
    fn obtener(&mut self, moneda: &str) -> Result<f64, String> {
        self.llamadas += 1;
        if self.llamadas == 1 {
            return Err("tiempo de espera agotado".to_string()); // el proveedor falla a veces
        }
        Ok(if moneda == "USD" { 3.75 } else { 4.05 })
    }
}

struct ConReintentos<F> {
    interno: F,
    intentos: u32,
}

impl<F: FuenteTiposCambio> FuenteTiposCambio for ConReintentos<F> {
    fn obtener(&mut self, moneda: &str) -> Result<f64, String> {
        let mut intento = 1;
        loop {
            match self.interno.obtener(moneda) {
                Ok(valor) => return Ok(valor),
                Err(error) if intento >= self.intentos => {
                    return Err(format!("tras {intento} intentos: {error}"));
                }
                Err(_) => {
                    println!("  reintento {intento}...");
                    intento += 1;
                }
            }
        }
    }
}

struct ConCache<F> {
    interno: F,
    duracion: Duration,
    cache: HashMap<String, (f64, Instant)>,
}

impl<F: FuenteTiposCambio> FuenteTiposCambio for ConCache<F> {
    fn obtener(&mut self, moneda: &str) -> Result<f64, String> {
        if let Some(&(valor, expira)) = self.cache.get(moneda)
            && expira > Instant::now()
        {
            return Ok(valor);
        }
        let valor = self.interno.obtener(moneda)?;
        self.cache
            .insert(moneda.to_string(), (valor, Instant::now() + self.duracion));
        Ok(valor)
    }
}

struct ConLog<F>(F);

impl<F: FuenteTiposCambio> FuenteTiposCambio for ConLog<F> {
    fn obtener(&mut self, moneda: &str) -> Result<f64, String> {
        println!("→ consultando {moneda}");
        self.0.obtener(moneda)
    }
}

fn main() {
    // El orden importa: la caché va por fuera para no registrar ni reintentar lo que ya está guardado
    let mut fuente = ConCache {
        interno: ConLog(ConReintentos {
            interno: ApiTiposCambio { llamadas: 0 },
            intentos: 3,
        }),
        duracion: Duration::from_secs(5 * 60),
        cache: HashMap::new(),
    };

    println!("{:?}", fuente.obtener("USD")); // → consultando USD, reintento 1..., Ok(3.75)
    println!("{:?}", fuente.obtener("USD")); // Ok(3.75) desde la caché
}
