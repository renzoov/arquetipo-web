// Los formatos se comparten con `Rc` (un puntero con conteo de referencias): cada celda guarda un
// `Rc<Formato>` y clonarlo no copia el formato. Como `Formato` deriva `Hash` y `Eq`, sirve de clave en
// el `HashMap` de la fábrica. Además, Rust no permite modificar un valor compartido por un `Rc`.

use std::collections::HashMap;
use std::rc::Rc;

#[derive(Clone, PartialEq, Eq, Hash)]
struct Formato {
    fuente: &'static str,
    tamano: u8,
    color: &'static str,
    formato_numero: &'static str,
}

impl Formato {
    fn describir(&self) -> String {
        format!(
            "{} {}pt {} {}",
            self.fuente, self.tamano, self.color, self.formato_numero
        )
    }
}

#[derive(Default)]
struct FabricaFormatos {
    cache: HashMap<Formato, Rc<Formato>>,
}

impl FabricaFormatos {
    fn obtener(&mut self, formato: Formato) -> Rc<Formato> {
        Rc::clone(
            self.cache
                .entry(formato.clone())
                .or_insert_with(|| Rc::new(formato)),
        )
    }
}

struct Celda {
    fila: u32,
    columna: u32,
    formato: Rc<Formato>, // referencia al formato compartido
}

fn main() {
    let mut fabrica = FabricaFormatos::default();
    let mut celdas = Vec::with_capacity(100_000);

    for fila in 0..1000 {
        for columna in 0..100 {
            let formato = fabrica.obtener(Formato {
                fuente: "Inter",
                tamano: 11,
                color: if fila == 0 { "#000000" } else { "#333333" },
                formato_numero: if columna == 0 { "@" } else { "#,##0.00" },
            });
            celdas.push(Celda {
                fila,
                columna,
                formato,
            });
        }
    }

    println!(
        "{} celdas comparten {} formatos",
        celdas.len(),
        fabrica.cache.len()
    ); // 100000 celdas comparten 4 formatos
    let (a, b) = (&celdas[101], &celdas[102]);
    println!(
        "({},{}) y ({},{}) comparten formato: {}",
        a.fila,
        a.columna,
        b.fila,
        b.columna,
        Rc::ptr_eq(&a.formato, &b.formato)
    );
    println!(
        "{} · usado por {} celdas",
        a.formato.describir(),
        Rc::strong_count(&a.formato) - 1
    );
}
