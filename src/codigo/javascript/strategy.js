// En JavaScript una estrategia es simplemente una función. Las estrategias configurables se crean
// con funciones que devuelven funciones (closures), y el catálogo es un objeto literal que mapea
// el nombre de la modalidad a su función.

const tarifaPlana = (monto) => () => monto;
const porPeso = (precioPorKg) => (pedido) => Math.round(pedido.pesoKg * precioPorKg * 100) / 100;

const tarifasPais = { US: 45, ES: 60 };
const internacional = (pedido) => tarifasPais[pedido.pais] ?? 80;

const modalidades = {
  ciudad: tarifaPlana(10),
  nacional: porPeso(4.5),
  internacional,
  campania: tarifaPlana(0),
};

export function totalConEnvio(pedido, calcularEnvio) {
  return pedido.subtotal + calcularEnvio(pedido);
}

// ── Uso: la modalidad la elige el cliente en tiempo de ejecución ──
const pedido = { subtotal: 200, pesoKg: 3.2, pais: 'ES' };

for (const [nombre, calcular] of Object.entries(modalidades)) {
  console.log(nombre.padEnd(14), totalConEnvio(pedido, calcular));
}
// ciudad 210 · nacional 214.4 · internacional 260 · campania 200
