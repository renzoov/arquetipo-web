// Como JavaScript permite acceder a un método por su nombre, el doble despacho se resuelve con
// `visitante[producto.tipo](producto)`. Los visitantes son objetos literales con un método por
// tipo, y una comprobación avisa si a un visitante le falta algún caso.

const TIPOS = ['fisico', 'digital', 'suscripcion'];

export function visitar(producto, visitante) {
  const operacion = visitante[producto.tipo];
  if (!operacion) throw new Error(`El visitante no sabe tratar productos de tipo "${producto.tipo}"`);
  return operacion(producto);
}

const definirVisitante = (metodos) => {
  const faltan = TIPOS.filter((tipo) => !(tipo in metodos));
  if (faltan.length) throw new Error(`Falta tratar: ${faltan.join(', ')}`);
  return Object.freeze(metodos);
};

const costoEnvio = definirVisitante({
  fisico: (p) => p.pesoKg * 4.5,
  digital: () => 0,
  suscripcion: () => 0,
});

const impuestos = definirVisitante({
  fisico: (p) => p.precio * 0.18,
  digital: (p) => p.precio * 0.18,
  suscripcion: (p) => p.precioMensual * p.meses * 0.18,
});

const exportarContable = definirVisitante({
  fisico: (p) => `MERCADERIA|${p.nombre}|${p.precio}`,
  digital: (p) => `SERVICIO-DIGITAL|${p.nombre}|${p.precio}`,
  suscripcion: (p) => `SUSCRIPCION|${p.nombre}|${p.precioMensual * p.meses}`,
});

// ── Uso ──
const carrito = [
  { tipo: 'fisico', nombre: 'Teclado', precio: 100, pesoKg: 1.2 },
  { tipo: 'digital', nombre: 'Curso de patrones', precio: 50 },
  { tipo: 'suscripcion', nombre: 'Plan Pro', precioMensual: 15, meses: 12 },
];

const sumar = (visitante) => carrito.reduce((total, p) => total + visitar(p, visitante), 0);

console.log('Envío:', sumar(costoEnvio).toFixed(2));    // 5.40
console.log('Impuestos:', sumar(impuestos).toFixed(2)); // 59.40
console.log(carrito.map((p) => visitar(p, exportarContable)));

try {
  definirVisitante({ fisico: () => 0 });
} catch (error) {
  console.log(error.message); // Falta tratar: digital, suscripcion
}
