// El borrow checker no deja que cada comando guarde una referencia mutable al repositorio mientras
// está en el historial, así que el diseño idiomático es pasar el repositorio (`&mut`) al ejecutar y al
// deshacer. Los comandos son `Box<dyn Comando>` dentro de un `Vec` usado como pila.

struct Producto {
    id: &'static str,
    categoria: &'static str,
    precio: f64,
    activo: bool,
}

struct Repo {
    productos: Vec<Producto>,
}

impl Repo {
    fn buscar(&mut self, id: &str) -> Result<&mut Producto, String> {
        self.productos
            .iter_mut()
            .find(|p| p.id == id)
            .ok_or(format!("no existe el producto {id}"))
    }

    fn listar(&self) -> Vec<String> {
        self.productos
            .iter()
            .map(|p| {
                format!(
                    "{} {}{}",
                    p.id,
                    p.precio,
                    if p.activo { "" } else { " (inactivo)" }
                )
            })
            .collect()
    }
}

trait Comando {
    fn descripcion(&self) -> String;
    fn ejecutar(&mut self, repo: &mut Repo) -> Result<(), String>;
    fn deshacer(&mut self, repo: &mut Repo) -> Result<(), String>;
}

struct AjustarPrecios {
    categoria: &'static str,
    factor: f64,
    anteriores: Vec<(&'static str, f64)>,
}

impl Comando for AjustarPrecios {
    fn descripcion(&self) -> String {
        format!("Ajustar precios de {} ×{}", self.categoria, self.factor)
    }

    fn ejecutar(&mut self, repo: &mut Repo) -> Result<(), String> {
        for producto in repo
            .productos
            .iter_mut()
            .filter(|p| p.categoria == self.categoria)
        {
            self.anteriores.push((producto.id, producto.precio));
            producto.precio = (producto.precio * self.factor * 100.0).round() / 100.0;
        }
        Ok(())
    }

    fn deshacer(&mut self, repo: &mut Repo) -> Result<(), String> {
        for (id, precio) in self.anteriores.drain(..) {
            repo.buscar(id)?.precio = precio;
        }
        Ok(())
    }
}

struct DesactivarProducto {
    id: &'static str,
}

impl Comando for DesactivarProducto {
    fn descripcion(&self) -> String {
        format!("Desactivar {}", self.id)
    }

    fn ejecutar(&mut self, repo: &mut Repo) -> Result<(), String> {
        repo.buscar(self.id)?.activo = false;
        Ok(())
    }

    fn deshacer(&mut self, repo: &mut Repo) -> Result<(), String> {
        repo.buscar(self.id)?.activo = true;
        Ok(())
    }
}

#[derive(Default)]
struct Invocador {
    historial: Vec<Box<dyn Comando>>,
}

impl Invocador {
    fn ejecutar(
        &mut self,
        mut comando: Box<dyn Comando>,
        repo: &mut Repo,
        usuario: &str,
    ) -> Result<(), String> {
        comando.ejecutar(repo)?;
        println!("[auditoría] {usuario}: {}", comando.descripcion());
        self.historial.push(comando);
        Ok(())
    }

    fn deshacer_ultimo(&mut self, repo: &mut Repo) -> Result<(), String> {
        match self.historial.pop() {
            Some(mut comando) => comando.deshacer(repo),
            None => Ok(()),
        }
    }
}

fn main() -> Result<(), String> {
    let mut repo = Repo {
        productos: vec![
            Producto {
                id: "teclado",
                categoria: "perifericos",
                precio: 100.0,
                activo: true,
            },
            Producto {
                id: "mouse",
                categoria: "perifericos",
                precio: 40.0,
                activo: true,
            },
            Producto {
                id: "monitor",
                categoria: "pantallas",
                precio: 900.0,
                activo: true,
            },
        ],
    };
    let mut panel = Invocador::default();

    let ajuste = AjustarPrecios {
        categoria: "perifericos",
        factor: 1.1,
        anteriores: Vec::new(),
    };
    panel.ejecutar(Box::new(ajuste), &mut repo, "ana")?;
    panel.ejecutar(
        Box::new(DesactivarProducto { id: "monitor" }),
        &mut repo,
        "ana",
    )?;
    println!("{:?}", repo.listar()); // ["teclado 110", "mouse 44", "monitor 900 (inactivo)"]

    panel.deshacer_ultimo(&mut repo)?;
    panel.deshacer_ultimo(&mut repo)?;
    println!("{:?}", repo.listar()); // ["teclado 100", "mouse 40", "monitor 900"]

    let error = panel.ejecutar(
        Box::new(DesactivarProducto { id: "silla" }),
        &mut repo,
        "ana",
    );
    println!("{error:?}"); // Err("no existe el producto silla")
    Ok(())
}
