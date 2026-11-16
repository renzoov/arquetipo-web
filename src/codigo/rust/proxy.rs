// El proxy implementa el mismo trait que la historia real. `std::cell::OnceCell` guarda el objeto real
// y lo crea solo en el primer acceso, y un acceso denegado se devuelve como `Err`, sin excepciones.
// El operador `?` propaga ese error en una línea.

use std::cell::OnceCell;

trait HistoriaClinica {
    fn diagnosticos(&self) -> Result<Vec<String>, String>;
    fn imagenes(&self) -> Result<Vec<String>, String>;
}

struct HistoriaReal;

impl HistoriaReal {
    fn cargar(paciente_id: &str) -> Self {
        println!("  (cargando la historia {paciente_id} y sus estudios...)");
        HistoriaReal
    }
}

impl HistoriaClinica for HistoriaReal {
    fn diagnosticos(&self) -> Result<Vec<String>, String> {
        Ok(vec!["Hipertensión controlada".to_string()])
    }
    fn imagenes(&self) -> Result<Vec<String>, String> {
        Ok(vec!["resonancia-2026-10.dcm".to_string()])
    }
}

struct Usuario {
    pacientes_asignados: Vec<String>,
}

struct ProxyHistoria<'a> {
    paciente_id: String,
    usuario: &'a Usuario,
    real: OnceCell<HistoriaReal>, // vacío hasta el primer acceso
}

impl ProxyHistoria<'_> {
    fn acceder(&self) -> Result<&HistoriaReal, String> {
        if !self.usuario.pacientes_asignados.contains(&self.paciente_id) {
            return Err(format!(
                "acceso denegado a la historia {}",
                self.paciente_id
            ));
        }
        Ok(self
            .real
            .get_or_init(|| HistoriaReal::cargar(&self.paciente_id)))
    }
}

impl HistoriaClinica for ProxyHistoria<'_> {
    fn diagnosticos(&self) -> Result<Vec<String>, String> {
        self.acceder()?.diagnosticos()
    }
    fn imagenes(&self) -> Result<Vec<String>, String> {
        self.acceder()?.imagenes()
    }
}

fn nuevo_proxy<'a>(paciente_id: &str, usuario: &'a Usuario) -> ProxyHistoria<'a> {
    ProxyHistoria {
        paciente_id: paciente_id.to_string(),
        usuario,
        real: OnceCell::new(),
    }
}

fn main() {
    let medica = Usuario {
        pacientes_asignados: vec!["P-77".to_string()],
    };

    let proxy = nuevo_proxy("P-77", &medica);
    let historia: &dyn HistoriaClinica = &proxy;
    println!("Proxy creado: todavía no se cargó nada");
    println!("{:?}", historia.diagnosticos()); // carga la historia la primera vez
    println!("{:?}", historia.imagenes()); // ya está cargada

    println!("{:?}", nuevo_proxy("P-90", &medica).diagnosticos()); // Err("acceso denegado a la historia P-90")
}
