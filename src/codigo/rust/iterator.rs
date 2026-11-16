// Implementar el trait `Iterator` (solo el método `next`) da gratis todos sus adaptadores: `map`,
// `filter`, `take`... Los iteradores de Rust son perezosos, así que `take(2)` solo provoca la petición
// de la primera página.

#[derive(Clone, Copy)]
struct Cliente {
    id: u32,
    nombre: &'static str,
}

struct Pagina {
    datos: Vec<Cliente>,
    siguiente_cursor: Option<usize>,
}

struct ApiCrm {
    clientes: Vec<Cliente>,
    peticiones: u32,
}

impl ApiCrm {
    fn new() -> Self {
        let nombres = ["Ana", "Luis", "Marta", "Jorge", "Elena"];
        let clientes = (1..)
            .zip(nombres)
            .map(|(id, nombre)| Cliente { id, nombre })
            .collect();
        Self {
            clientes,
            peticiones: 0,
        }
    }

    fn listar_clientes(&mut self, limite: usize, cursor: usize) -> Pagina {
        self.peticiones += 1;
        let hasta = (cursor + limite).min(self.clientes.len());
        Pagina {
            datos: self.clientes[cursor..hasta].to_vec(),
            siguiente_cursor: (hasta < self.clientes.len()).then_some(hasta),
        }
    }
}

struct ClientesCrm<'a> {
    api: &'a mut ApiCrm,
    limite: usize,
    pagina: std::vec::IntoIter<Cliente>,
    siguiente: Option<usize>,
}

impl<'a> ClientesCrm<'a> {
    fn new(api: &'a mut ApiCrm, limite: usize) -> Self {
        Self {
            api,
            limite,
            pagina: Vec::new().into_iter(),
            siguiente: Some(0),
        }
    }
}

impl Iterator for ClientesCrm<'_> {
    type Item = Cliente;

    fn next(&mut self) -> Option<Cliente> {
        loop {
            if let Some(cliente) = self.pagina.next() {
                return Some(cliente);
            }
            let cursor = self.siguiente?; // no hay más páginas: el iterador termina
            let pagina = self.api.listar_clientes(self.limite, cursor);
            self.siguiente = pagina.siguiente_cursor;
            self.pagina = pagina.datos.into_iter();
        }
    }
}

fn main() {
    let mut crm = ApiCrm::new();
    for cliente in ClientesCrm::new(&mut crm, 2) {
        println!("{} {}", cliente.id, cliente.nombre);
    }
    println!("Peticiones a la API: {}", crm.peticiones); // 3

    let mut otro_crm = ApiCrm::new();
    let primeros: Vec<&str> = ClientesCrm::new(&mut otro_crm, 2)
        .take(2)
        .map(|c| c.nombre)
        .collect();
    println!("{primeros:?} · peticiones: {}", otro_crm.peticiones); // ["Ana", "Luis"] · peticiones: 1
}
