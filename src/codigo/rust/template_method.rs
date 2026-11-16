// En Rust, el método plantilla es un método provisto de un trait (con implementación por defecto) que
// llama a un método requerido (el paso obligatorio) y a otros provistos (los ganchos). A diferencia de
// Java o C#, no se puede impedir que una implementación lo sobrescriba: se documenta.

use std::fmt;

#[derive(Default)]
struct Empleado {
    nombre: &'static str,
    sueldo_base: f64,
    subvencion: f64,
    horas: f64,
    tarifa_hora: f64,
    hijos: u32,
}

struct Boleta {
    empleado: &'static str,
    bruto: f64,
    descuentos: f64,
    bonificaciones: f64,
    neto: f64,
}

impl fmt::Display for Boleta {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "{}: bruto {}, descuentos {}, bonificaciones {}, neto {}",
            self.empleado, self.bruto, self.descuentos, self.bonificaciones, self.neto
        )
    }
}

fn redondear(valor: f64) -> f64 {
    (valor * 100.0).round() / 100.0
}

trait CalculoNomina {
    fn ingreso_bruto(&self, e: &Empleado) -> f64; // paso obligatorio

    fn bonificaciones(&self, _e: &Empleado) -> f64 {
        0.0 // gancho
    }

    fn aporta_pension(&self) -> bool {
        true // gancho
    }

    // Método plantilla: el orden de los pasos es siempre el mismo (no lo sobrescribas)
    fn calcular_nomina(&self, e: &Empleado) -> Boleta {
        let bruto = self.ingreso_bruto(e);
        let descuentos = if self.aporta_pension() {
            redondear(bruto * 0.13)
        } else {
            0.0
        };
        let bonificaciones = self.bonificaciones(e);
        Boleta {
            empleado: e.nombre,
            bruto,
            descuentos,
            bonificaciones,
            neto: redondear(bruto - descuentos + bonificaciones),
        }
    }
}

struct NominaPlanilla;
impl CalculoNomina for NominaPlanilla {
    fn ingreso_bruto(&self, e: &Empleado) -> f64 {
        e.sueldo_base
    }
    fn bonificaciones(&self, e: &Empleado) -> f64 {
        if e.hijos > 0 { 100.0 } else { 0.0 }
    }
}

struct NominaPracticante;
impl CalculoNomina for NominaPracticante {
    fn ingreso_bruto(&self, e: &Empleado) -> f64 {
        e.subvencion
    }
    fn aporta_pension(&self) -> bool {
        false
    }
}

struct NominaPorHoras;
impl CalculoNomina for NominaPorHoras {
    fn ingreso_bruto(&self, e: &Empleado) -> f64 {
        e.horas * e.tarifa_hora
    }
}

fn main() {
    let ana = Empleado {
        nombre: "Ana",
        sueldo_base: 4000.0,
        hijos: 2,
        ..Default::default()
    };
    let leo = Empleado {
        nombre: "Leo",
        subvencion: 1200.0,
        ..Default::default()
    };
    let rosa = Empleado {
        nombre: "Rosa",
        horas: 80.0,
        tarifa_hora: 25.0,
        ..Default::default()
    };

    println!("{}", NominaPlanilla.calcular_nomina(&ana)); // Ana: bruto 4000, descuentos 520, bonificaciones 100, neto 3580
    println!("{}", NominaPracticante.calcular_nomina(&leo)); // Leo: bruto 1200, descuentos 0, ... neto 1200
    println!("{}", NominaPorHoras.calcular_nomina(&rosa)); // Rosa: bruto 2000, descuentos 260, ... neto 1740
}
