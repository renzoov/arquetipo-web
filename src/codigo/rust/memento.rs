// La privacidad de Rust es por módulo: fuera de `mod configurador`, el campo `estado` del `Memento` no
// se puede leer ni construir, solo su etiqueta. `#[derive(Clone)]` copia el estado al guardar y al
// restaurar, y el `Vec` de mementos hace de historial.

mod configurador {
    #[derive(Clone)]
    struct Estado {
        modelo: &'static str,
        motor: &'static str,
        caja: &'static str,
        accesorios: Vec<String>,
        precio: u32,
    }

    pub struct Memento {
        pub etiqueta: String,
        estado: Estado, // privado: solo el configurador lo usa
    }

    pub struct Configurador {
        estado: Estado,
    }

    impl Default for Configurador {
        fn default() -> Self {
            Self {
                estado: Estado {
                    modelo: "Sedán",
                    motor: "gasolina",
                    caja: "manual",
                    accesorios: Vec::new(),
                    precio: 20_000,
                },
            }
        }
    }

    impl Configurador {
        pub fn elegir_motor(&mut self, motor: &'static str) -> Result<(), String> {
            if !matches!(motor, "gasolina" | "hibrido" | "electrico") {
                return Err(format!("motor desconocido: {motor}"));
            }
            self.estado.motor = motor;
            if motor == "electrico" {
                self.estado.caja = "automatica"; // regla: no hay eléctricos manuales
            }
            self.recalcular();
            Ok(())
        }

        pub fn agregar_accesorio(&mut self, accesorio: &str) {
            self.estado.accesorios.push(accesorio.to_string());
            self.recalcular();
        }

        pub fn guardar(&self, etiqueta: &str) -> Memento {
            Memento {
                etiqueta: etiqueta.to_string(),
                estado: self.estado.clone(),
            }
        }

        pub fn restaurar(&mut self, memento: &Memento) {
            self.estado = memento.estado.clone();
        }

        pub fn resumen(&self) -> String {
            let e = &self.estado;
            format!(
                "{} {}/{} {:?} {} USD",
                e.modelo, e.motor, e.caja, e.accesorios, e.precio
            )
        }

        fn recalcular(&mut self) {
            let recargo = match self.estado.motor {
                "hibrido" => 4_000,
                "electrico" => 9_000,
                _ => 0,
            };
            let accesorios = u32::try_from(self.estado.accesorios.len()).unwrap_or(u32::MAX);
            self.estado.precio = 20_000 + recargo + accesorios * 600;
        }
    }
}

use configurador::{Configurador, Memento};

fn main() -> Result<(), String> {
    let mut config = Configurador::default();
    let mut historial: Vec<Memento> = Vec::new();

    historial.push(config.guardar("base"));
    config.elegir_motor("electrico")?;
    historial.push(config.guardar("eléctrico"));
    config.agregar_accesorio("Techo solar");
    println!("{}", config.resumen()); // Sedán electrico/automatica ["Techo solar"] 29600 USD

    while let Some(memento) = historial.pop() {
        config.restaurar(&memento);
        println!("Volver a {}: {}", memento.etiqueta, config.resumen());
    }
    // Volver a eléctrico: Sedán electrico/automatica [] 29000 USD
    // Volver a base: Sedán gasolina/manual [] 20000 USD
    Ok(())
}
