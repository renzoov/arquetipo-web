// El visitante es genérico en su resultado (`VisitanteProducto<R>`), así que el mismo `aceptar`
// sirve para visitantes que devuelven números o textos. Al final se muestra la alternativa más
// común en TypeScript: una unión discriminada con un `switch` que el compilador revisa por completo.

export interface VisitanteProducto<R> {
  visitarFisico(p: ProductoFisico): R;
  visitarDigital(p: ProductoDigital): R;
  visitarSuscripcion(p: Suscripcion): R;
}

export interface Producto {
  readonly nombre: string;
  aceptar<R>(visitante: VisitanteProducto<R>): R;
}

export class ProductoFisico implements Producto {
  constructor(readonly nombre: string, readonly precio: number, readonly pesoKg: number) {}
  aceptar<R>(v: VisitanteProducto<R>): R { return v.visitarFisico(this); } // doble despacho
}

export class ProductoDigital implements Producto {
  constructor(readonly nombre: string, readonly precio: number) {}
  aceptar<R>(v: VisitanteProducto<R>): R { return v.visitarDigital(this); }
}

export class Suscripcion implements Producto {
  constructor(readonly nombre: string, readonly precioMensual: number, readonly meses: number) {}
  aceptar<R>(v: VisitanteProducto<R>): R { return v.visitarSuscripcion(this); }
}

class CostoEnvio implements VisitanteProducto<number> {
  visitarFisico(p: ProductoFisico) { return p.pesoKg * 4.5; }
  visitarDigital() { return 0; }
  visitarSuscripcion() { return 0; }
}

class Impuestos implements VisitanteProducto<number> {
  visitarFisico(p: ProductoFisico) { return p.precio * 0.18; }
  visitarDigital(p: ProductoDigital) { return p.precio * 0.18; }
  visitarSuscripcion(p: Suscripcion) { return p.precioMensual * p.meses * 0.18; }
}

class ExportarContable implements VisitanteProducto<string> {
  visitarFisico(p: ProductoFisico) { return `MERCADERIA|${p.nombre}|${p.precio}`; }
  visitarDigital(p: ProductoDigital) { return `SERVICIO-DIGITAL|${p.nombre}|${p.precio}`; }
  visitarSuscripcion(p: Suscripcion) { return `SUSCRIPCION|${p.nombre}|${p.precioMensual * p.meses}`; }
}

// ── Uso ──
const carrito: Producto[] = [
  new ProductoFisico('Teclado', 100, 1.2),
  new ProductoDigital('Curso de patrones', 50),
  new Suscripcion('Plan Pro', 15, 12),
];

const sumar = (v: VisitanteProducto<number>) => carrito.reduce((total, p) => total + p.aceptar(v), 0);

console.log('Envío:', sumar(new CostoEnvio()).toFixed(2));     // 5.40
console.log('Impuestos:', sumar(new Impuestos()).toFixed(2));  // 59.40
console.log(carrito.map((p) => p.aceptar(new ExportarContable())));

// ── Alternativa idiomática en TypeScript: unión discriminada + switch exhaustivo ──
type ItemCarrito =
  | { tipo: 'fisico'; precio: number; pesoKg: number }
  | { tipo: 'digital'; precio: number }
  | { tipo: 'suscripcion'; precioMensual: number; meses: number };

function costoEnvio(item: ItemCarrito): number {
  switch (item.tipo) {
    case 'fisico': return item.pesoKg * 4.5;
    case 'digital':
    case 'suscripcion': return 0;
    default: {
      const sinCubrir: never = item; // error de compilación si falta un caso
      return sinCubrir;
    }
  }
}

console.log(costoEnvio({ tipo: 'fisico', precio: 100, pesoKg: 1.2 }).toFixed(2)); // 5.40
