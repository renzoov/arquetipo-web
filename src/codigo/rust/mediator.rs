// Con el sistema de propiedad de Rust, los componentes no guardan referencias cruzadas entre sí (ni
// hacia el mediador): el mediador es dueño de todos ellos y recibe eventos, que son un `enum`. Cada
// componente solo produce eventos y el mediador decide con `match` qué actualizar.

enum Evento {
    CategoriaElegida(&'static str),
    MarcaElegida(&'static str),
    Limpiar,
}

#[derive(Default)]
struct SelectorCategoria {
    valor: Option<&'static str>,
}

impl SelectorCategoria {
    fn elegir(categoria: &'static str) -> Evento {
        Evento::CategoriaElegida(categoria)
    }
}

#[derive(Default)]
struct SelectorMarca {
    valor: Option<&'static str>,
    opciones: Vec<&'static str>,
}

impl SelectorMarca {
    fn elegir(marca: &'static str) -> Evento {
        Evento::MarcaElegida(marca)
    }
}

#[derive(Default)]
struct PanelFiltros {
    categoria: SelectorCategoria,
    marca: SelectorMarca,
    precio: Option<(u32, u32)>,
    resultados: String,
}

impl PanelFiltros {
    fn notificar(&mut self, evento: Evento) {
        match evento {
            Evento::Limpiar => {
                self.categoria = SelectorCategoria::default();
                self.marca = SelectorMarca::default();
                self.precio = None;
            }
            Evento::CategoriaElegida(categoria) => {
                self.categoria.valor = Some(categoria);
                self.marca = SelectorMarca {
                    valor: None,
                    opciones: match categoria {
                        "laptops" => vec!["Premium", "Económica"],
                        "celulares" => vec!["Premium"],
                        _ => vec![],
                    },
                };
                self.precio = None;
            }
            Evento::MarcaElegida(marca) => {
                self.marca.valor = Some(marca);
                self.precio = Some(if marca == "Premium" {
                    (500, 3000)
                } else {
                    (0, 800)
                });
            }
        }
        let total = match (self.categoria.valor, self.marca.valor) {
            (None, _) => 120,
            (Some(_), None) => 25,
            (Some(_), Some(_)) => 8,
        };
        self.resultados = format!("{total} resultados");
    }
}

fn main() {
    let mut panel = PanelFiltros::default();

    panel.notificar(SelectorCategoria::elegir("laptops"));
    println!("{:?} · {}", panel.marca.opciones, panel.resultados); // ["Premium", "Económica"] · 25 resultados

    panel.notificar(SelectorMarca::elegir("Premium"));
    println!("{:?} · {}", panel.precio, panel.resultados); // Some((500, 3000)) · 8 resultados

    panel.notificar(Evento::Limpiar);
    println!("{}", panel.resultados); // 120 resultados
}
