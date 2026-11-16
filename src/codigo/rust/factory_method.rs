// Rust no tiene herencia: el "creador" es un trait con un método requerido (`crear_lector`, el método
// fábrica) y un método provisto (`conciliar`) que lo usa. Los errores de lectura se devuelven con
// `Result` y se propagan con el operador `?`, sin excepciones.

use std::collections::HashMap;

struct Movimiento {
    referencia: String,
    monto: f64,
}

trait LectorExtracto {
    fn leer(&self, contenido: &str) -> Result<Vec<Movimiento>, String>;
}

struct LectorCsvAndino;

impl LectorExtracto for LectorCsvAndino {
    fn leer(&self, contenido: &str) -> Result<Vec<Movimiento>, String> {
        contenido
            .trim()
            .lines()
            .map(|linea| {
                let partes: Vec<&str> = linea.split(';').collect();
                let [_fecha, referencia, monto] = partes.as_slice() else {
                    return Err(format!("línea inválida: {linea}"));
                };
                let monto = monto
                    .parse()
                    .map_err(|e| format!("monto inválido en {linea}: {e}"))?;
                Ok(Movimiento {
                    referencia: referencia.to_string(),
                    monto,
                })
            })
            .collect()
    }
}

struct LectorTxtPacifico;

impl LectorExtracto for LectorTxtPacifico {
    // Ancho fijo: fecha (10) + referencia (8) + monto (resto)
    fn leer(&self, contenido: &str) -> Result<Vec<Movimiento>, String> {
        contenido
            .trim()
            .lines()
            .map(|linea| {
                let monto = linea[18..]
                    .trim()
                    .parse()
                    .map_err(|e| format!("monto inválido en {linea}: {e}"))?;
                Ok(Movimiento {
                    referencia: linea[10..18].trim().to_string(),
                    monto,
                })
            })
            .collect()
    }
}

trait Conciliador {
    // Método fábrica: cada implementación decide qué lector crear
    fn crear_lector(&self) -> Box<dyn LectorExtracto>;

    fn conciliar(
        &self,
        contenido: &str,
        ventas: &HashMap<&str, f64>,
    ) -> Result<Vec<String>, String> {
        let mut diferencias = Vec::new();
        for mov in self.crear_lector().leer(contenido)? {
            match ventas.get(mov.referencia.as_str()) {
                None => diferencias.push(format!(
                    "{}: banco {}, ventas sin registro",
                    mov.referencia, mov.monto
                )),
                Some(esperado) if (esperado - mov.monto).abs() > f64::EPSILON => {
                    diferencias.push(format!(
                        "{}: banco {}, ventas {esperado}",
                        mov.referencia, mov.monto
                    ));
                }
                Some(_) => {}
            }
        }
        Ok(diferencias)
    }
}

struct ConciliadorBancoAndino;

impl Conciliador for ConciliadorBancoAndino {
    fn crear_lector(&self) -> Box<dyn LectorExtracto> {
        Box::new(LectorCsvAndino)
    }
}

struct ConciliadorBancoPacifico;

impl Conciliador for ConciliadorBancoPacifico {
    fn crear_lector(&self) -> Box<dyn LectorExtracto> {
        Box::new(LectorTxtPacifico)
    }
}

fn main() {
    let ventas = HashMap::from([("F-001", 150.0), ("F-002", 80.0)]);

    println!(
        "{:?}",
        ConciliadorBancoAndino.conciliar("2026-11-01;F-001;150\n2026-11-01;F-002;75", &ventas)
    );
    // Ok(["F-002: banco 75, ventas 80"])
    println!(
        "{:?}",
        ConciliadorBancoPacifico.conciliar("2026-11-01F-001   150\n2026-11-02F-003   40", &ventas)
    );
    // Ok(["F-003: banco 40, ventas sin registro"])
    println!(
        "{:?}",
        ConciliadorBancoAndino.conciliar("2026-11-01;F-009;abc", &ventas)
    );
    // Err("monto inválido en 2026-11-01;F-009;abc: invalid float literal")
}
