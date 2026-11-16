// En Rust, un árbol se modela de forma natural con un `enum` recursivo: cada nodo es una hoja o un
// compuesto, y `match` trata los dos casos. El recorrido devuelve un iterador perezoso
// (`Box<dyn Iterator>`) que se aplana de forma recursiva con `flat_map`.

enum Miembro {
    Empleado {
        nombre: String,
        sueldo: u32,
    },
    Area {
        nombre: String,
        miembros: Vec<Miembro>,
    },
}

impl Miembro {
    fn empleado(nombre: &str, sueldo: u32) -> Self {
        Self::Empleado {
            nombre: nombre.to_string(),
            sueldo,
        }
    }

    fn area(nombre: &str, miembros: Vec<Miembro>) -> Self {
        Self::Area {
            nombre: nombre.to_string(),
            miembros,
        }
    }

    fn nombre(&self) -> &str {
        match self {
            Self::Empleado { nombre, .. } | Self::Area { nombre, .. } => nombre,
        }
    }

    fn costo_mensual(&self) -> u32 {
        match self {
            Self::Empleado { sueldo, .. } => *sueldo,
            Self::Area { miembros, .. } => miembros.iter().map(Miembro::costo_mensual).sum(),
        }
    }

    fn personas(&self) -> Box<dyn Iterator<Item = &str> + '_> {
        match self {
            Self::Empleado { nombre, .. } => Box::new(std::iter::once(nombre.as_str())),
            Self::Area { miembros, .. } => Box::new(miembros.iter().flat_map(Miembro::personas)),
        }
    }
}

fn main() {
    let tecnologia = Miembro::area(
        "Tecnología",
        vec![
            Miembro::empleado("Ana", 5200),
            Miembro::area(
                "Equipo Pagos",
                vec![
                    Miembro::empleado("Luis", 4100),
                    Miembro::empleado("Marta", 3900),
                ],
            ),
        ],
    );

    println!("{}: {}", tecnologia.nombre(), tecnologia.costo_mensual()); // Tecnología: 13200
    println!("{:?}", tecnologia.personas().collect::<Vec<_>>()); // ["Ana", "Luis", "Marta"]
}
