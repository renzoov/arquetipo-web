// Contenido de la página "Principios de diseño": las ideas generales que están detrás de SOLID y de los patrones.
import type { Texto } from '../i18n/idiomas.ts';

export interface PrincipioDiseno {
  id: string;
  icono: string;
  nombre: Texto;
  lema: Texto;
  definicion: Texto;
  sintoma: Texto;
  practica: Texto;
  /** Slugs de los patrones donde se ve aplicado. */
  patrones: string[];
  antes: string;
  despues: string;
  color: string;
  fondo: string;
}

export const ENCABEZADO = {
  titulo: { es: 'Principios de diseño', en: 'Design principles' },
  intro: {
    es: 'Antes de SOLID y de los patrones hay cinco ideas simples que aparecen una y otra vez. Si las entiendes, los patrones dejan de parecer recetas para memorizar: verás que cada uno es una forma concreta de aplicar estas ideas a un problema que se repite.',
    en: 'Before SOLID and the patterns there are five simple ideas that show up again and again. Once you understand them, patterns stop looking like recipes to memorize: you will see that each one is a concrete way of applying these ideas to a recurring problem.',
  },
  descripcion: {
    es: 'Encapsula lo que varía, programa contra interfaces, prefiere la composición, busca un acoplamiento débil y el principio del menor conocimiento, con código antes y después.',
    en: 'Encapsulate what varies, program to interfaces, favor composition, aim for loose coupling and the principle of least knowledge, with before-and-after code.',
  },
  loVerasEn: { es: 'Lo verás en', en: 'You will see it in' },
  siguiente: { es: 'Siguiente paso: principios SOLID', en: 'Next step: SOLID principles' },
} satisfies Record<string, Texto>;

export const PRINCIPIOS_DISENO: PrincipioDiseno[] = [
  {
    id: 'encapsular', icono: 'swap_horiz',
    nombre: { es: 'Encapsula lo que varía', en: 'Encapsulate what varies' },
    lema: { es: 'Separa lo que cambia de lo estable', en: 'Separate what changes from what stays' },
    definicion: {
      es: 'Identifica qué partes de tu código cambian con frecuencia y sácalas a su propio lugar, detrás de una forma estable de usarlas. Así, cuando cambien (y van a cambiar), el resto del sistema ni se entera.',
      en: 'Find the parts of your code that change often and move them to their own place, behind a stable way of using them. That way, when they change (and they will), the rest of the system does not even notice.',
    },
    sintoma: {
      es: 'Cada campaña comercial obliga a abrir la función que cierra las ventas del mes para tocar la tabla de comisiones. Un cambio de porcentajes termina rompiendo el redondeo del total, que no tenía nada que ver.',
      en: 'Every sales campaign forces someone to open the month-end closing function to edit the commission table. A change in percentages ends up breaking the rounding of the total, which had nothing to do with it.',
    },
    practica: {
      es: 'Es el principio detrás de casi todos los patrones: cada uno aísla un tipo de variación distinto (qué objeto se crea, qué algoritmo se usa, qué estado está activo...). Pregúntate siempre: "¿qué va a cambiar aquí y con qué frecuencia?".',
      en: 'It is the principle behind almost every pattern: each one isolates a different kind of variation (which object is created, which algorithm is used, which state is active...). Always ask yourself: "what is going to change here, and how often?".',
    },
    patrones: ['strategy', 'state', 'factory-method', 'template-method'],
    antes: `// ❌ La regla que cambia cada campaña vive dentro del cierre de mes
export function cerrarMes(ventas: Venta[]) {
  let comisiones = 0;
  for (const venta of ventas) {
    // Marketing cambia estos números cada trimestre
    if (venta.monto > 10_000) comisiones += venta.monto * 0.05;
    else if (venta.categoria === 'servicios') comisiones += venta.monto * 0.08;
    else comisiones += venta.monto * 0.03;
  }
  return { total: sumar(ventas), comisiones: redondear(comisiones) };
}`,
    despues: `// ✅ La regla variable tiene su propio lugar
export interface ReglaComision {
  calcular(venta: Venta): number;
}

export function cerrarMes(ventas: Venta[], regla: ReglaComision) {
  const comisiones = ventas.reduce((acc, v) => acc + regla.calcular(v), 0);
  return { total: sumar(ventas), comisiones: redondear(comisiones) };
}

// Cada campaña es una regla nueva; el cierre de mes no se toca
export const reglaVerano: ReglaComision = {
  calcular: (v) => v.monto * (v.categoria === 'servicios' ? 0.1 : 0.04),
};`,
    color: 'text-secondary-container', fondo: 'bg-secondary-container/20 border-secondary-container/30',
  },
  {
    id: 'interfaces', icono: 'cable',
    nombre: { es: 'Programa contra interfaces, no contra implementaciones', en: 'Program to an interface, not an implementation' },
    lema: { es: 'Depende de lo que hace, no de quién lo hace', en: 'Depend on what it does, not on who does it' },
    definicion: {
      es: 'Declara tus variables, parámetros y dependencias usando el tipo más general que te sirva (una interfaz o una clase base), no una clase concreta. "Interfaz" aquí significa el contrato: qué operaciones ofrece algo, sin importar cómo las implementa.',
      en: 'Declare your variables, parameters and dependencies using the most general type that works for you (an interface or a base class), not a concrete class. "Interface" here means the contract: which operations something offers, no matter how it implements them.',
    },
    sintoma: {
      es: 'El servicio de adjuntos recibe un ClienteS3 y usa métodos propios de ese SDK. Para guardar en disco local durante las pruebas, o migrar a otro proveedor, hay que reescribir el servicio.',
      en: 'The attachments service receives a ClienteS3 and uses methods specific to that SDK. To save to local disk during tests, or to move to another provider, you have to rewrite the service.',
    },
    practica: {
      es: 'No hace falta crear una interfaz por cada clase. Úsalo donde esperas más de una implementación o donde quieres probar con un sustituto. Es la base práctica del principio de inversión de dependencias (la D de SOLID).',
      en: 'You do not need an interface for every class. Use it where you expect more than one implementation or where you want to test with a stand-in. It is the practical basis of the dependency inversion principle (the D in SOLID).',
    },
    patrones: ['adapter', 'bridge', 'proxy', 'abstract-factory'],
    antes: `// ❌ Atado a un proveedor concreto
export class ServicioAdjuntos {
  constructor(private readonly s3: ClienteS3) {}

  async adjuntar(ticketId: string, archivo: Archivo) {
    await this.s3.putObject({ Bucket: 'tickets', Key: ticketId, Body: archivo.datos });
  }
}`,
    despues: `// ✅ Atado solo a lo que necesita: guardar un archivo
export interface AlmacenArchivos {
  guardar(ruta: string, datos: Uint8Array): Promise<void>;
}

export class ServicioAdjuntos {
  constructor(private readonly almacen: AlmacenArchivos) {}

  async adjuntar(ticketId: string, archivo: Archivo) {
    await this.almacen.guardar(\`tickets/\${ticketId}\`, archivo.datos);
  }
}

// En producción: new AlmacenS3(...). En pruebas: new AlmacenEnMemoria().`,
    color: 'text-primary-container', fondo: 'bg-primary-container/20 border-primary-container/30',
  },
  {
    id: 'composicion', icono: 'extension',
    nombre: { es: 'Prefiere la composición sobre la herencia', en: 'Favor composition over inheritance' },
    lema: { es: 'Arma comportamientos, no árboles de clases', en: 'Assemble behavior, not class trees' },
    definicion: {
      es: 'En lugar de obtener comportamiento heredándolo de una clase padre, obtenlo teniendo otros objetos que lo hacen (y delegando en ellos). La herencia fija las combinaciones al compilar; la composición permite combinarlas libremente, incluso en tiempo de ejecución.',
      en: 'Instead of getting behavior by inheriting it from a parent class, get it by holding other objects that do the work (and delegating to them). Inheritance fixes the combinations at compile time; composition lets you combine them freely, even at runtime.',
    },
    sintoma: {
      es: 'Aparecen clases como ReportePdfFirmado, ReporteExcelFirmado, ReportePdfFirmadoComprimido... Cada nueva opción multiplica las subclases, y un cambio en la clase base afecta a todas a la vez.',
      en: 'Classes like ReportePdfFirmado, ReporteExcelFirmado, ReportePdfFirmadoComprimido start to appear... Every new option multiplies the subclasses, and a change in the base class affects all of them at once.',
    },
    practica: {
      es: 'La herencia sigue siendo válida cuando hay una relación "es un" estable y la subclase cumple todo el contrato de la base. El problema aparece cuando la usas solo para reutilizar código o para combinar opciones independientes.',
      en: 'Inheritance is still valid when there is a stable "is a" relationship and the subclass honors the whole contract of the base. The problem appears when you use it just to reuse code or to combine independent options.',
    },
    patrones: ['decorator', 'strategy', 'bridge', 'composite'],
    antes: `// ❌ Una subclase por cada combinación de opciones
class Reporte { /* ... */ }
class ReportePdf extends Reporte { /* ... */ }
class ReportePdfFirmado extends ReportePdf { /* ... */ }
class ReporteExcel extends Reporte { /* ... */ }
class ReporteExcelFirmado extends ReporteExcel { /* ... */ }
// ¿Y si además hay que comprimir? Duplica todo otra vez.`,
    despues: `// ✅ Cada opción es una pieza que se combina
export interface Formato { generar(datos: Fila[]): Uint8Array; }
export interface PasoFinal { aplicar(archivo: Uint8Array): Uint8Array; }

export class Reporte {
  constructor(
    private readonly formato: Formato,
    private readonly pasos: PasoFinal[] = [],
  ) {}

  exportar(datos: Fila[]) {
    return this.pasos.reduce((archivo, paso) => paso.aplicar(archivo), this.formato.generar(datos));
  }
}

new Reporte(new FormatoPdf(), [new Firma(certificado), new Compresion()]);`,
    color: 'text-tertiary-fixed-dim', fondo: 'bg-tertiary-fixed-dim/20 border-tertiary-fixed-dim/30',
  },
  {
    id: 'acoplamiento', icono: 'link_off',
    nombre: { es: 'Busca un acoplamiento débil', en: 'Aim for loose coupling' },
    lema: { es: 'Que los objetos sepan poco unos de otros', en: 'Objects should know little about each other' },
    definicion: {
      es: 'Dos objetos que colaboran deberían conocer lo mínimo el uno del otro: qué pueden pedirse, no cómo funcionan por dentro. Cuanto menos sabe un objeto de otro, menos le afectan sus cambios.',
      en: 'Two objects that work together should know as little as possible about each other: what they can ask of each other, not how they work inside. The less one object knows about another, the less its changes affect it.',
    },
    sintoma: {
      es: 'Para registrar una devolución, el módulo de inventario llama directamente a la contabilidad, al servicio de correo y al panel de métricas. Agregar un cuarto interesado obliga a modificar inventario, y una caída del correo bloquea las devoluciones.',
      en: 'To record a return, the inventory module calls accounting, the email service and the metrics dashboard directly. Adding a fourth interested party means changing inventory, and an email outage blocks returns.',
    },
    practica: {
      es: 'Acoplamiento débil no es cero acoplamiento: algo tiene que conectar las piezas. La idea es que esa conexión pase por contratos pequeños y estables (una interfaz, un evento) y no por los detalles internos de cada módulo.',
      en: 'Loose coupling is not zero coupling: something has to connect the pieces. The idea is that the connection goes through small, stable contracts (an interface, an event) and not through the internal details of each module.',
    },
    patrones: ['observer', 'mediator', 'facade', 'chain-of-responsibility'],
    antes: `// ❌ Inventario conoce a todos los que reaccionan a una devolución
export class Inventario {
  registrarDevolucion(item: Item) {
    this.stock.sumar(item);
    new Contabilidad().emitirNotaCredito(item);
    new ServicioCorreo().avisarCliente(item.pedidoId);
    new PanelMetricas().incrementar('devoluciones');
  }
}`,
    despues: `// ✅ Inventario solo anuncia lo que pasó
export class Inventario {
  constructor(private readonly eventos: BusEventos) {}

  registrarDevolucion(item: Item) {
    this.stock.sumar(item);
    this.eventos.publicar({ tipo: 'devolucion-registrada', item });
  }
}

// Cada interesado se suscribe por su cuenta, sin tocar Inventario
eventos.suscribir('devolucion-registrada', (e) => contabilidad.emitirNotaCredito(e.item));`,
    color: 'text-amber-300', fondo: 'bg-amber-500/20 border-amber-500/30',
  },
  {
    id: 'demeter', icono: 'forum',
    nombre: { es: 'Principio del menor conocimiento', en: 'Principle of least knowledge' },
    lema: { es: 'Habla solo con tus vecinos cercanos', en: 'Only talk to your close neighbors' },
    definicion: {
      es: 'También llamado Ley de Demeter. Un método solo debería llamar a métodos de su propio objeto, de los parámetros que recibe, de los objetos que crea y de sus atributos directos. No debería "atravesar" objetos para llegar a los objetos de otros.',
      en: 'Also called the Law of Demeter. A method should only call methods on its own object, on the parameters it receives, on the objects it creates and on its direct fields. It should not "reach through" objects to get to other objects\' objects.',
    },
    sintoma: {
      es: 'Cadenas como pedido.cliente.direccion.distrito.zonaReparto. Si cambia cómo se guarda la dirección, se rompen decenas de lugares que no tenían nada que ver con direcciones.',
      en: 'Chains like pedido.cliente.direccion.distrito.zonaReparto. If the way the address is stored changes, dozens of places that had nothing to do with addresses break.',
    },
    practica: {
      es: 'No se trata de contar puntos: encadenar métodos de un mismo objeto (un builder, un array con map y filter) no lo incumple. Lo que evita es depender de la estructura interna de objetos ajenos. La solución es pedirle al objeto que tienes que haga el trabajo, o que te dé directamente lo que necesitas.',
      en: 'It is not about counting dots: chaining methods on the same object (a builder, an array with map and filter) does not break it. What it avoids is depending on the internal structure of other objects. The fix is to ask the object you have to do the work, or to give you exactly what you need.',
    },
    patrones: ['facade', 'mediator', 'iterator'],
    antes: `// ❌ El despacho conoce cómo está armado el pedido por dentro
export function asignarRepartidor(pedido: Pedido) {
  const zona = pedido.cliente.direccion.distrito.zonaReparto;
  return repartidores.disponiblesEn(zona);
}`,
    despues: `// ✅ Se le pregunta al pedido lo que se necesita
export class Pedido {
  constructor(private readonly cliente: Cliente) {}

  zonaReparto(): Zona {
    return this.cliente.zonaReparto(); // y Cliente delega en su dirección
  }
}

export function asignarRepartidor(pedido: Pedido) {
  return repartidores.disponiblesEn(pedido.zonaReparto());
}`,
    color: 'text-secondary-container', fondo: 'bg-secondary-container/20 border-secondary-container/30',
  },
];
