// La fábrica declara sus productos como tipos asociados (`type Almacenamiento`), así la consistencia
// de la familia la comprueba el compilador: con `InfraNube` es imposible obtener una cola de RabbitMQ.
// La función genérica `arrancar` se resuelve en compilación, sin objetos dinámicos (`dyn`).

trait Almacenamiento {
    fn subir(&self, nombre: &str) -> String;
}

trait Cola {
    fn publicar(&self, mensaje: &str) -> String;
}

trait Secretos {
    fn leer(&self, clave: &str) -> String;
}

trait Infraestructura {
    type Almacenamiento: Almacenamiento;
    type Cola: Cola;
    type Secretos: Secretos;

    fn crear_almacenamiento(&self) -> Self::Almacenamiento;
    fn crear_cola(&self) -> Self::Cola;
    fn crear_secretos(&self) -> Self::Secretos;
}

// ── Familia: nube ──
struct AlmacenamientoNube;
struct ColaGestionada;
struct SecretosNube;

impl Almacenamiento for AlmacenamientoNube {
    fn subir(&self, nombre: &str) -> String {
        format!("objetos-nube://facturas/{nombre}")
    }
}
impl Cola for ColaGestionada {
    fn publicar(&self, mensaje: &str) -> String {
        format!("cola gestionada ← {mensaje}")
    }
}
impl Secretos for SecretosNube {
    fn leer(&self, clave: &str) -> String {
        format!("gestor-de-secretos:{clave}")
    }
}

struct InfraNube;

impl Infraestructura for InfraNube {
    type Almacenamiento = AlmacenamientoNube;
    type Cola = ColaGestionada;
    type Secretos = SecretosNube;

    fn crear_almacenamiento(&self) -> AlmacenamientoNube {
        AlmacenamientoNube
    }
    fn crear_cola(&self) -> ColaGestionada {
        ColaGestionada
    }
    fn crear_secretos(&self) -> SecretosNube {
        SecretosNube
    }
}

// ── Familia: on-premise ──
struct DiscoEnRed;
struct ColaRabbit;
struct SecretosVault;

impl Almacenamiento for DiscoEnRed {
    fn subir(&self, nombre: &str) -> String {
        format!("/mnt/nas/facturas/{nombre}")
    }
}
impl Cola for ColaRabbit {
    fn publicar(&self, mensaje: &str) -> String {
        format!("RabbitMQ ← {mensaje}")
    }
}
impl Secretos for SecretosVault {
    fn leer(&self, clave: &str) -> String {
        format!("vault:{clave}")
    }
}

struct InfraOnPremise;

impl Infraestructura for InfraOnPremise {
    type Almacenamiento = DiscoEnRed;
    type Cola = ColaRabbit;
    type Secretos = SecretosVault;

    fn crear_almacenamiento(&self) -> DiscoEnRed {
        DiscoEnRed
    }
    fn crear_cola(&self) -> ColaRabbit {
        ColaRabbit
    }
    fn crear_secretos(&self) -> SecretosVault {
        SecretosVault
    }
}

fn arrancar<I: Infraestructura>(nombre: &str, infra: &I) {
    println!("[{nombre}]");
    println!("  {}", infra.crear_almacenamiento().subir("F-001.pdf"));
    println!("  {}", infra.crear_cola().publicar("factura-emitida"));
    println!("  {}", infra.crear_secretos().leer("certificado-firma"));
}

fn main() {
    // El entorno se elige UNA vez; a partir de ahí, todo es de la misma familia
    for entorno in ["nube", "on-premise", "marte"] {
        match entorno {
            "nube" => arrancar(entorno, &InfraNube),
            "on-premise" => arrancar(entorno, &InfraOnPremise),
            otro => println!("error: entorno desconocido: {otro}"),
        }
    }
}
