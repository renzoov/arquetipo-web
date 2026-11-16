// El builder idiomático de Rust toma `self` por valor en cada paso y lo devuelve
// (`fn texto(mut self, ...) -> Self`), así se encadena sin referencias. `build()` devuelve un
// `Result`, y `#[derive(Default)]` aporta los valores iniciales.

#[derive(Debug, Clone, Copy, Default)]
enum Orden {
    #[default]
    Relevancia,
    Descuento,
    Novedad,
}

struct Busqueda {
    texto: Option<String>,
    precio: Option<(f64, f64)>,
    solo_con_stock: bool,
    orden: Orden,
}

impl Busqueda {
    fn resumen(&self) -> String {
        let precio = self
            .precio
            .map_or("sin rango".to_string(), |(min, max)| format!("{min}-{max}"));
        format!(
            "texto={:?}, precio={precio}, solo_con_stock={}, orden={:?}",
            self.texto, self.solo_con_stock, self.orden
        )
    }
}

#[derive(Default)]
struct BusquedaBuilder {
    texto: Option<String>,
    precio: Option<(f64, f64)>,
    solo_con_stock: bool,
    orden: Orden,
}

impl BusquedaBuilder {
    fn texto(mut self, texto: &str) -> Self {
        self.texto = Some(texto.trim().to_string());
        self
    }

    fn precio_entre(mut self, min: f64, max: f64) -> Self {
        self.precio = Some((min, max));
        self
    }

    fn solo_con_stock(mut self) -> Self {
        self.solo_con_stock = true;
        self
    }

    fn ordenar_por(mut self, orden: Orden) -> Self {
        self.orden = orden;
        self
    }

    fn build(self) -> Result<Busqueda, String> {
        if let Some((min, max)) = self.precio
            && min > max
        {
            return Err("rango de precio inválido".to_string());
        }
        Ok(Busqueda {
            texto: self.texto,
            precio: self.precio,
            solo_con_stock: self.solo_con_stock,
            orden: self.orden,
        })
    }
}

// Director: recetas que siempre ejecutan los mismos pasos
fn ofertas_del_dia() -> Result<Busqueda, String> {
    BusquedaBuilder::default()
        .solo_con_stock()
        .ordenar_por(Orden::Descuento)
        .build()
}

fn novedades(texto: &str) -> Result<Busqueda, String> {
    BusquedaBuilder::default()
        .texto(texto)
        .ordenar_por(Orden::Novedad)
        .build()
}

fn main() -> Result<(), String> {
    let busqueda = BusquedaBuilder::default()
        .texto("  zapatillas ")
        .precio_entre(50.0, 120.0)
        .solo_con_stock()
        .build()?;
    println!("{}", busqueda.resumen());
    // texto=Some("zapatillas"), precio=50-120, solo_con_stock=true, orden=Relevancia

    println!("{:?}", ofertas_del_dia()?.orden); // Descuento
    println!("{:?}", novedades("auriculares")?.orden); // Novedad

    match BusquedaBuilder::default()
        .precio_entre(200.0, 100.0)
        .build()
    {
        Ok(_) => println!("no debería construirse"),
        Err(error) => println!("{error}"), // rango de precio inválido
    }
    Ok(())
}
