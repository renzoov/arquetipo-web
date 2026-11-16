// Como las funciones son valores, una estrategia puede ser simplemente un tipo de función: no hace
// falta una interfaz con una clase por algoritmo. `satisfies` comprueba que cada entrada del
// catálogo es una estrategia válida sin perder los nombres de las claves (`Modalidad`).

export interface Pedido {
  subtotal: number;
  pesoKg: number;
  pais: string;
}

export type CalculoEnvio = (pedido: Pedido) => number;

const tarifaPlana = (monto: number): CalculoEnvio => () => monto;

const porPeso = (precioPorKg: number): CalculoEnvio =>
  (pedido) => Math.round(pedido.pesoKg * precioPorKg * 100) / 100;

const tarifasPais: Record<string, number> = { US: 45, ES: 60 };
const internacional: CalculoEnvio = (pedido) => tarifasPais[pedido.pais] ?? 80;

const modalidades = {
  ciudad: tarifaPlana(10),
  nacional: porPeso(4.5),
  internacional,
  campania: tarifaPlana(0),
} satisfies Record<string, CalculoEnvio>;

export type Modalidad = keyof typeof modalidades;

export class Checkout {
  constructor(private readonly envio: CalculoEnvio) {}
  total(pedido: Pedido): number {
    return pedido.subtotal + this.envio(pedido);
  }
}

// ── Uso: la modalidad la elige el cliente en tiempo de ejecución ──
const pedido: Pedido = { subtotal: 200, pesoKg: 3.2, pais: 'ES' };

for (const modalidad of Object.keys(modalidades) as Modalidad[]) {
  console.log(modalidad.padEnd(14), new Checkout(modalidades[modalidad]).total(pedido));
}
// ciudad 210 · nacional 214.4 · internacional 260 · campania 200
