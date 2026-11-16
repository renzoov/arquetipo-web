// Los suscriptores son cierres guardados como `Box<dyn Fn(&Pedido) -> Result<(), String>>`, junto a un
// identificador para poder darse de baja. `pagar` avisa a todos y reúne los fallos sin interrumpir a
// nadie. (Para avisos entre hilos, lo idiomático son los canales de `std::sync::mpsc`.)

struct Pedido {
    id: &'static str,
    total: u32,
}

type Suscriptor = Box<dyn Fn(&Pedido) -> Result<(), String>>;

#[derive(Default)]
struct ServicioPagos {
    suscriptores: Vec<(u32, Suscriptor)>,
    ultimo_id: u32,
}

impl ServicioPagos {
    fn suscribir(&mut self, suscriptor: impl Fn(&Pedido) -> Result<(), String> + 'static) -> u32 {
        self.ultimo_id += 1;
        self.suscriptores
            .push((self.ultimo_id, Box::new(suscriptor)));
        self.ultimo_id
    }

    fn desuscribir(&mut self, id: u32) {
        self.suscriptores.retain(|(otro, _)| *otro != id);
    }

    fn pagar(&self, pedido: &Pedido) -> Result<(), Vec<String>> {
        println!("Pedido {} cobrado", pedido.id);
        let fallos: Vec<String> = self
            .suscriptores
            .iter()
            .filter_map(|(_, s)| s(pedido).err())
            .collect();
        if fallos.is_empty() {
            Ok(())
        } else {
            Err(fallos)
        }
    }
}

fn main() {
    let mut pagos = ServicioPagos::default();

    pagos.suscribir(|p| {
        println!("  correo de confirmación para {}", p.id);
        Ok(())
    });
    pagos.suscribir(|_| Err("inventario no disponible".to_string()));
    let factura = pagos.suscribir(|p| {
        println!("  factura emitida por {}", p.total);
        Ok(())
    });

    if let Err(fallos) = pagos.pagar(&Pedido {
        id: "P-1",
        total: 250,
    }) {
        println!("  ⚠ fallos: {fallos:?}");
    }

    pagos.desuscribir(factura); // se da de baja
    if let Err(fallos) = pagos.pagar(&Pedido {
        id: "P-2",
        total: 90,
    }) {
        println!("  ⚠ fallos: {fallos:?}"); // ya no se emite factura
    }
}
