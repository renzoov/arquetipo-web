// El árbol de la regla es un `enum` recursivo (con `Box` para los hijos) e `interpretar` es un `match`.
// Al implementar los traits `BitAnd` y `BitOr`, las reglas se escriben con `&` y `|`, y el trait
// `Display` las muestra de forma legible.

use std::fmt;
use std::ops::{BitAnd, BitOr};

struct Carrito {
    total: f64,
    cliente_frecuente: bool,
    cupon: Option<&'static str>,
}

enum Expresion {
    TotalMayorQue(f64),
    EsClienteFrecuente,
    CuponIgual(&'static str),
    Y(Box<Expresion>, Box<Expresion>),
    O(Box<Expresion>, Box<Expresion>),
}

impl Expresion {
    fn interpretar(&self, carrito: &Carrito) -> bool {
        match self {
            Self::TotalMayorQue(limite) => carrito.total > *limite,
            Self::EsClienteFrecuente => carrito.cliente_frecuente,
            Self::CuponIgual(codigo) => carrito.cupon == Some(*codigo),
            Self::Y(izquierda, derecha) => {
                izquierda.interpretar(carrito) && derecha.interpretar(carrito)
            }
            Self::O(izquierda, derecha) => {
                izquierda.interpretar(carrito) || derecha.interpretar(carrito)
            }
        }
    }
}

impl BitAnd for Expresion {
    type Output = Expresion;
    fn bitand(self, otra: Expresion) -> Expresion {
        Expresion::Y(Box::new(self), Box::new(otra))
    }
}

impl BitOr for Expresion {
    type Output = Expresion;
    fn bitor(self, otra: Expresion) -> Expresion {
        Expresion::O(Box::new(self), Box::new(otra))
    }
}

impl fmt::Display for Expresion {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::TotalMayorQue(limite) => write!(f, "total > {limite}"),
            Self::EsClienteFrecuente => write!(f, "cliente_frecuente"),
            Self::CuponIgual(codigo) => write!(f, "cupon = \"{codigo}\""),
            Self::Y(izquierda, derecha) => write!(f, "({izquierda} Y {derecha})"),
            Self::O(izquierda, derecha) => write!(f, "({izquierda} O {derecha})"),
        }
    }
}

fn main() {
    // total > 100 Y cliente_frecuente O cupon = "VERANO"
    let regla = (Expresion::TotalMayorQue(100.0) & Expresion::EsClienteFrecuente)
        | Expresion::CuponIgual("VERANO");

    println!("{regla}"); // ((total > 100 Y cliente_frecuente) O cupon = "VERANO")
    let carrito = |total, cliente_frecuente, cupon| Carrito {
        total,
        cliente_frecuente,
        cupon,
    };
    println!("{}", regla.interpretar(&carrito(150.0, true, None))); // true
    println!("{}", regla.interpretar(&carrito(150.0, false, None))); // false
    println!(
        "{}",
        regla.interpretar(&carrito(20.0, false, Some("VERANO")))
    ); // true
}
