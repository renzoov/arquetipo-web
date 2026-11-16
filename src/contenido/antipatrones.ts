// Contenido de la página "Antipatrones y code smells": soluciones que parecen razonables al principio
// y se vuelven un problema, con el principio o patrón que las corrige.

interface Principio {
  nombre: string;
  /** Ruta de la página que lo explica. */
  href: string;
}

interface Antipatron {
  id: string;
  icono: string;
  nombre: string;
  /** Otros nombres con los que se conoce. */
  alias: string;
  sintoma: string;
  porQueDuele: string;
  correccion: string;
  antes: string;
  despues: string;
  principios: Principio[];
  patrones: string[];
}

export const ENCABEZADO = {
  titulo: 'Antipatrones y code smells',
  intro: 'Un antipatrón es una solución que parece razonable al principio pero que, con el tiempo, cuesta más de lo que aporta. Un "code smell" es la señal en el código que te avisa de que algo así está pasando. Reconocerlos a tiempo es la mejor forma de saber cuándo aplicar un principio o un patrón.',
  descripcion: 'Objeto dios, condicionales que crecen, Singleton como variable global, explosión de subclases, herencia rechazada, obsesión por primitivos, cirugía de escopeta y patronitis: cómo reconocerlos y cómo corregirlos.',
  tambienLlamado: 'También llamado',
  sintoma: 'Cómo reconocerlo',
  porQueDuele: 'Por qué duele',
  correccion: 'Cómo corregirlo',
  antes: 'Antes: con el problema',
  despues: 'Después: corregido',
  loCorrigen: 'Lo corrigen',
};

const SRP: Principio = { nombre: 'Responsabilidad única', href: '/principios/solid#srp' };
const OCP: Principio = { nombre: 'Abierto/Cerrado', href: '/principios/solid#ocp' };
const LSP: Principio = { nombre: 'Sustitución de Liskov', href: '/principios/solid#lsp' };
const DIP: Principio = { nombre: 'Inversión de dependencias', href: '/principios/solid#dip' };
const ENCAPSULAR: Principio = { nombre: 'Encapsula lo que varía', href: '/principios/diseno#encapsular' };
const COMPOSICION: Principio = { nombre: 'Composición sobre herencia', href: '/principios/diseno#composicion' };
const ENCAPSULAMIENTO: Principio = { nombre: 'Encapsulamiento', href: '/fundamentos/poo#encapsulamiento' };
const POLIMORFISMO: Principio = { nombre: 'Polimorfismo', href: '/fundamentos/poo#polimorfismo' };
const CUANDO_NO: Principio = { nombre: '"Cuándo no usarlo" de cada patrón', href: '/#patrones' };

export const ANTIPATRONES: Antipatron[] = [
  {
    id: 'objeto-dios', icono: 'crown',
    nombre: 'Objeto dios',
    alias: 'God Object · God Class · Blob',
    sintoma: 'Una clase con cientos de líneas y decenas de métodos que no tienen relación entre sí: GestorTienda crea pedidos, calcula impuestos, envía correos y exporta reportes. Casi todos los cambios del sistema pasan por ese archivo.',
    porQueDuele: 'Varios equipos la modifican a la vez, cada cambio puede romper algo que no tiene nada que ver y es imposible probarla por partes. Además, todo el sistema depende de ella.',
    correccion: 'Agrupa los métodos según el motivo por el que cambian y llévalos a clases propias. Si muchos lugares usaban la clase grande como punto de entrada, una fachada pequeña puede mantener esa comodidad sin concentrar la lógica.',
    antes: `// ❌ Una clase que sabe y hace de todo
class GestorTienda {
  crearPedido(carrito: Carrito) { /* ... */ }
  calcularImpuestos(pedido: Pedido) { /* ... */ }
  aplicarCupon(pedido: Pedido, codigo: string) { /* ... */ }
  enviarCorreoConfirmacion(pedido: Pedido) { /* ... */ }
  exportarVentasExcel(mes: number) { /* ... */ }
  sincronizarStockConAlmacen() { /* ... */ }
  // ...y 40 métodos más
}`,
    despues: `// ✅ Cada clase cambia por un solo motivo
class ServicioPedidos { crear(carrito: Carrito) { /* ... */ } }
class CalculadoraImpuestos { calcular(pedido: Pedido) { /* ... */ } }
class Promociones { aplicarCupon(pedido: Pedido, codigo: string) { /* ... */ } }
class NotificacionesCliente { confirmarPedido(pedido: Pedido) { /* ... */ } }
class ReportesVentas { exportarExcel(mes: number) { /* ... */ } }`,
    principios: [SRP],
    patrones: ['facade'],
  },
  {
    id: 'condicional-creciente', icono: 'alt_route',
    nombre: 'El condicional que no para de crecer',
    alias: 'Switch statements · Type code',
    sintoma: 'Un switch o una cadena de if/else que pregunta por el tipo de algo ("si es tarjeta…, si es billetera…") y se repite en varios lugares. Cada caso nuevo obliga a buscar y modificar todos esos switch.',
    porQueDuele: 'Es fácil olvidar uno de los switch al agregar un caso, y el código que ya funcionaba se vuelve a tocar en cada cambio. Las funciones crecen sin límite.',
    correccion: 'Convierte cada caso en una clase (o función) que cumple una misma interfaz y deja que el polimorfismo elija. Si el caso es un algoritmo, es Strategy; si es una etapa que cambia sola, es State.',
    antes: `// ❌ El mismo switch aparece en el cobro, el reembolso y los reportes
function comision(medio: string, monto: number) {
  switch (medio) {
    case 'tarjeta': return monto * 0.035;
    case 'billetera': return monto * 0.02;
    case 'transferencia': return 1.5;
    default: throw new Error('Medio desconocido');
  }
}`,
    despues: `// ✅ Cada medio sabe calcular su comisión
interface MedioPago {
  comision(monto: number): number;
}

const tarjeta: MedioPago = { comision: (m) => m * 0.035 };
const billetera: MedioPago = { comision: (m) => m * 0.02 };
const transferencia: MedioPago = { comision: () => 1.5 };

// Un medio nuevo es un objeto nuevo: ningún switch que actualizar
const total = monto + medio.comision(monto);`,
    principios: [OCP, POLIMORFISMO],
    patrones: ['strategy', 'state', 'factory-method'],
  },
  {
    id: 'singleton-global', icono: 'public',
    nombre: 'Singleton como variable global',
    alias: 'Singletonitis · Global state',
    sintoma: 'Clases que llaman a Algo.instancia() desde cualquier parte del código para leer o cambiar datos. Las pruebas fallan o pasan según el orden en que se ejecutan.',
    porQueDuele: 'Las dependencias quedan ocultas: mirando la firma de una clase no sabes que usa la configuración o la caché. El estado compartido cambia sin aviso y no se puede reemplazar por un doble en las pruebas.',
    correccion: 'Crea la instancia única una sola vez al arrancar la aplicación y pásala por el constructor a quien la necesite. Sigue habiendo una sola instancia, pero ahora la dependencia es visible y reemplazable.',
    antes: `// ❌ La dependencia está escondida dentro del método
class CalculadoraEnvio {
  costo(pedido: Pedido) {
    const tarifa = Configuracion.instancia().get('tarifaBase'); // ¿de dónde sale?
    return tarifa + pedido.peso * 2;
  }
}`,
    despues: `// ✅ La dependencia se ve en el constructor y se puede reemplazar
class CalculadoraEnvio {
  constructor(private readonly config: LectorConfiguracion) {}

  costo(pedido: Pedido) {
    return this.config.numero('tarifaBase') + pedido.peso * 2;
  }
}

// Una sola instancia, creada al arrancar la aplicación
const config = new ConfiguracionDesdeEntorno(process.env);
const calculadora = new CalculadoraEnvio(config);`,
    principios: [DIP],
    patrones: ['singleton'],
  },
  {
    id: 'explosion-subclases', icono: 'account_tree',
    nombre: 'Explosión de subclases',
    alias: 'Combinatorial explosion · Deep hierarchy',
    sintoma: 'Una jerarquía con clases que combinan opciones independientes: NotificacionCorreoUrgente, NotificacionSmsUrgente, NotificacionCorreoUrgenteConCopia… Cada opción nueva multiplica el número de clases.',
    porQueDuele: 'Con 3 canales y 3 opciones ya son 9 clases o más, casi todas con código repetido. Un cambio en la clase base afecta a toda la jerarquía.',
    correccion: 'Separa cada dimensión independiente y combínalas por composición: el canal como una pieza y cada opción como una capa que envuelve al canal.',
    antes: `// ❌ Una clase por cada combinación
class Notificacion { /* ... */ }
class NotificacionCorreo extends Notificacion { /* ... */ }
class NotificacionCorreoUrgente extends NotificacionCorreo { /* ... */ }
class NotificacionSms extends Notificacion { /* ... */ }
class NotificacionSmsUrgente extends NotificacionSms { /* ... */ }
// …y otra rama entera para "con copia al supervisor"`,
    despues: `// ✅ Canal y opciones se combinan libremente
interface Canal { enviar(mensaje: Mensaje): Promise<void>; }

class Urgente implements Canal {
  constructor(private readonly canal: Canal) {}
  enviar(m: Mensaje) { return this.canal.enviar({ ...m, asunto: '[URGENTE] ' + m.asunto }); }
}

class ConCopiaSupervisor implements Canal {
  constructor(private readonly canal: Canal, private readonly supervisor: string) {}
  async enviar(m: Mensaje) {
    await this.canal.enviar(m);
    await this.canal.enviar({ ...m, para: this.supervisor });
  }
}

const canal = new ConCopiaSupervisor(new Urgente(new CanalSms()), 'jefa@empresa.com');`,
    principios: [COMPOSICION],
    patrones: ['decorator', 'bridge', 'strategy'],
  },
  {
    id: 'herencia-rechazada', icono: 'block',
    nombre: 'Herencia rechazada',
    alias: 'Refused Bequest',
    sintoma: 'Una subclase hereda métodos que no le sirven y los sobrescribe para lanzar un error o no hacer nada. El código que usa la clase base tiene que preguntar por el tipo antes de llamarlos.',
    porQueDuele: 'La subclase no se puede usar donde se espera la base: rompe el contrato y los errores aparecen en producción, lejos del lugar donde está el problema.',
    correccion: 'Si la subclase no puede cumplir todo lo que promete la base, no debería heredar de ella. Divide la base en interfaces más pequeñas y que cada clase implemente solo las que puede cumplir.',
    antes: `// ❌ El producto digital hereda algo que no puede hacer
class Producto {
  calcularEnvio(destino: string): number { /* tarifa por peso */ return 10; }
}

class LibroDigital extends Producto {
  calcularEnvio(): number {
    throw new Error('Un libro digital no se envía');
  }
}`,
    despues: `// ✅ Solo implementa el envío quien realmente se envía
interface Producto {
  precio(): number;
}

interface ProductoEnviable extends Producto {
  calcularEnvio(destino: string): number;
}

class LibroImpreso implements ProductoEnviable { /* precio y calcularEnvio */ }
class LibroDigital implements Producto { /* solo precio */ }`,
    principios: [LSP],
    patrones: [],
  },
  {
    id: 'obsesion-primitivos', icono: 'pin',
    nombre: 'Obsesión por los tipos primitivos',
    alias: 'Primitive Obsession',
    sintoma: 'Montos como number, monedas como string, correos y documentos como string sueltos. Las mismas validaciones ("¿es un correo válido?", "¿son de la misma moneda?") se repiten por todo el código.',
    porQueDuele: 'Nada impide sumar soles con dólares o pasar un número de documento donde iba un teléfono. Las reglas del dominio quedan desperdigadas y cada lugar las aplica a su manera.',
    correccion: 'Crea objetos pequeños (objetos valor) que encapsulen el dato y sus reglas: un Dinero que no permite mezclar monedas, un Correo que solo existe si es válido.',
    antes: `// ❌ Nada impide mezclar monedas
function totalPedido(lineas: { precio: number; moneda: string }[]) {
  return lineas.reduce((total, l) => total + l.precio, 0); // ¿y si hay USD y PEN?
}`,
    despues: `// ✅ El dinero sabe sumarse correctamente
class Dinero {
  private constructor(readonly centimos: number, readonly moneda: 'PEN' | 'USD') {}

  static de(monto: number, moneda: 'PEN' | 'USD') {
    return new Dinero(Math.round(monto * 100), moneda);
  }

  sumar(otro: Dinero): Dinero {
    if (otro.moneda !== this.moneda) throw new Error('No se pueden sumar monedas distintas');
    return new Dinero(this.centimos + otro.centimos, this.moneda);
  }
}`,
    principios: [ENCAPSULAMIENTO],
    patrones: [],
  },
  {
    id: 'cirugia-escopeta', icono: 'scatter_plot',
    nombre: 'Cirugía de escopeta',
    alias: 'Shotgun Surgery',
    sintoma: 'Un cambio pequeño del negocio ("ahora el IGV se calcula distinto para exportaciones") obliga a tocar muchos archivos distintos: el carrito, la factura, el reporte, la API móvil…',
    porQueDuele: 'La misma regla está copiada en varios lugares y es fácil olvidar uno. El sistema termina mostrando montos distintos en pantallas distintas.',
    correccion: 'Identifica la regla que cambia y dale un único lugar. Todos los que la necesitan la usan desde ahí, así un cambio se hace una sola vez.',
    antes: `// ❌ La misma regla, copiada en tres lugares
// carrito.ts
const igv = esExportacion ? 0 : subtotal * 0.18;
// factura.ts
const impuesto = cliente.pais !== 'PE' ? 0 : base * 0.18;
// reporte.ts
const igvMes = ventas.filter((v) => v.pais === 'PE').reduce((t, v) => t + v.monto * 0.18, 0);`,
    despues: `// ✅ Un solo lugar para la regla de impuestos
export class ReglaIgv {
  static readonly TASA = 0.18;

  calcular(venta: { monto: number; esExportacion: boolean }): number {
    return venta.esExportacion ? 0 : venta.monto * ReglaIgv.TASA;
  }
}

// carrito, factura y reporte usan la misma regla
const igv = reglaIgv.calcular({ monto: subtotal, esExportacion });`,
    principios: [ENCAPSULAR, SRP],
    patrones: [],
  },
  {
    id: 'patronitis', icono: 'construction',
    nombre: 'Patronitis',
    alias: 'Over-engineering · Speculative generality',
    sintoma: 'Interfaces con una sola implementación "por si acaso", fábricas que crean un único tipo, capas que solo pasan la llamada a la siguiente. Entender un flujo simple obliga a abrir diez archivos.',
    porQueDuele: 'Cada patrón añade clases e indirección. Si no resuelve un problema real, solo agrega costo: más código que leer, mantener y probar, a cambio de una flexibilidad que nadie usa.',
    correccion: 'Empieza por lo simple y aplica un patrón cuando aparece el problema que resuelve: el segundo caso, el switch que se repite, la prueba que no puedes escribir. Refactorizar hacia un patrón a tiempo es mejor que diseñar para necesidades imaginarias.',
    antes: `// ❌ Tres piezas para algo que no varía
interface ICalculadoraSaludo { saludo(nombre: string): string; }
class CalculadoraSaludoImpl implements ICalculadoraSaludo {
  saludo(nombre: string) { return 'Hola, ' + nombre; }
}
class FabricaCalculadoraSaludo {
  static crear(): ICalculadoraSaludo { return new CalculadoraSaludoImpl(); }
}`,
    despues: `// ✅ Lo simple, hasta que haga falta otra cosa
export function saludo(nombre: string) {
  return 'Hola, ' + nombre;
}`,
    principios: [CUANDO_NO],
    patrones: [],
  },
];
