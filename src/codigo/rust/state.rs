// Rust permite llevar el patrón al sistema de tipos ("typestate"): el estado es un parámetro de tipo,
// `Pedido<Pagado>`, y cada estado solo tiene los métodos que permite. Las transiciones consumen el
// pedido (`self`) y devuelven uno en el nuevo estado, así que cancelar un pedido enviado no compila.

use std::marker::PhantomData;

struct Pendiente;
struct Pagado;
struct Enviado;
struct Cancelado;

struct Pedido<Estado> {
    id: String,
    estado: PhantomData<Estado>, // no ocupa memoria: solo existe para el compilador
}

impl<Estado> Pedido<Estado> {
    fn pasar_a<Nuevo>(self, nombre: &str) -> Pedido<Nuevo> {
        println!("  {} → {nombre}", self.id);
        Pedido {
            id: self.id,
            estado: PhantomData,
        }
    }
}

impl Pedido<Pendiente> {
    fn nuevo(id: &str) -> Self {
        Pedido {
            id: id.to_string(),
            estado: PhantomData,
        }
    }

    fn pagar(self) -> Pedido<Pagado> {
        self.pasar_a("pagado")
    }

    fn cancelar(self) -> Pedido<Cancelado> {
        self.pasar_a("cancelado")
    }
}

impl Pedido<Pagado> {
    fn enviar(self) -> Pedido<Enviado> {
        self.pasar_a("enviado")
    }

    fn cancelar(self) -> Pedido<Cancelado> {
        println!("  reembolso del pedido {}", self.id);
        self.pasar_a("cancelado")
    }
}

impl Pedido<Enviado> {
    fn entregar(self) -> Pedido<Enviado> {
        println!("  {} entregado al cliente", self.id);
        self
    }
}

fn main() {
    let a = Pedido::nuevo("A-1").pagar().enviar().entregar();
    // a.cancelar();  ← no compila: `Pedido<Enviado>` no tiene el método `cancelar`
    let _ = a;

    let _b = Pedido::nuevo("B-2").pagar().cancelar(); // reembolsa y cancela
    let _c = Pedido::nuevo("C-3").cancelar(); // pendiente: se cancela sin reembolso
}
