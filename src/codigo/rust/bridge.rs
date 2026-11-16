// La implementación es un trait y cada reporte guarda un `Box<dyn Renderizador>`: el formato se
// elige en tiempo de ejecución y los dos ejes crecen por separado. Para que el ejemplo se pueda
// ejecutar, los formatos son Markdown y CSV; en producción serían PDF o Excel.

trait Renderizador {
    fn titulo(&mut self, texto: &str);
    fn tabla(&mut self, columnas: &[&str], filas: &[&[&str]]);
    fn generar(&self) -> String;
}

#[derive(Default)]
struct RenderizadorMarkdown {
    lineas: Vec<String>,
}

impl Renderizador for RenderizadorMarkdown {
    fn titulo(&mut self, texto: &str) {
        self.lineas.push(format!("# {texto}"));
    }

    fn tabla(&mut self, columnas: &[&str], filas: &[&[&str]]) {
        self.lineas.push(format!("| {} |", columnas.join(" | ")));
        for fila in filas {
            self.lineas.push(format!("| {} |", fila.join(" | ")));
        }
    }

    fn generar(&self) -> String {
        self.lineas.join("\n")
    }
}

#[derive(Default)]
struct RenderizadorCsv {
    lineas: Vec<String>,
}

impl Renderizador for RenderizadorCsv {
    fn titulo(&mut self, _texto: &str) {} // un CSV no tiene título

    fn tabla(&mut self, columnas: &[&str], filas: &[&[&str]]) {
        self.lineas.push(columnas.join(","));
        for fila in filas {
            self.lineas.push(fila.join(","));
        }
    }

    fn generar(&self) -> String {
        self.lineas.join("\n")
    }
}

// Abstracción: cada reporte guarda el "puente" hacia la implementación
trait Reporte {
    fn exportar(&mut self) -> String;
}

struct ReporteVentas {
    salida: Box<dyn Renderizador>,
}

impl Reporte for ReporteVentas {
    fn exportar(&mut self) -> String {
        self.salida.titulo("Ventas de noviembre");
        self.salida.tabla(
            &["producto", "unidades"],
            &[&["Teclado", "12"], &["Monitor", "4"]],
        );
        self.salida.generar()
    }
}

struct ReporteInventario {
    salida: Box<dyn Renderizador>,
}

impl Reporte for ReporteInventario {
    fn exportar(&mut self) -> String {
        self.salida.titulo("Inventario");
        self.salida
            .tabla(&["sku", "stock"], &[&["TEC-01", "30"], &["MON-02", "0"]]);
        self.salida.generar()
    }
}

fn main() {
    let mut ventas = ReporteVentas {
        salida: Box::new(RenderizadorMarkdown::default()),
    };
    let mut inventario = ReporteInventario {
        salida: Box::new(RenderizadorCsv::default()),
    };
    println!("{}", ventas.exportar());
    println!("{}", inventario.exportar());
}
