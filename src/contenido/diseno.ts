// Contenido de la página "Principios de diseño": las ideas generales que están detrás de SOLID y de los patrones.

interface PrincipioDiseno {
  id: string;
  icono: string;
  nombre: string;
  lema: string;
  definicion: string;
  sintoma: string;
  practica: string;
  /** Slugs de los patrones donde se ve aplicado. */
  patrones: string[];
  antes: string;
  despues: string;
  color: string;
  fondo: string;
}

export const ENCABEZADO = {
  titulo: 'Principios de diseño',
  intro: 'Antes de SOLID y de los patrones hay cinco ideas simples que aparecen una y otra vez. Si las entiendes, los patrones dejan de parecer recetas para memorizar: verás que cada uno es una forma concreta de aplicar estas ideas a un problema que se repite.',
  descripcion: 'Encapsula lo que varía, programa contra interfaces, prefiere la composición, busca un acoplamiento débil y el principio del menor conocimiento, con código antes y después.',
  loVerasEn: 'Lo verás en',
  siguiente: 'Siguiente paso: principios SOLID',
};

export const PRINCIPIOS_DISENO: PrincipioDiseno[] = [
  {
    id: 'encapsular', icono: 'swap_horiz',
    nombre: 'Encapsula lo que varía',
    lema: 'Separa lo que cambia de lo estable',
    definicion: 'Identifica qué partes de tu código cambian con frecuencia y sácalas a su propio lugar, detrás de una forma estable de usarlas. Así, cuando cambien (y van a cambiar), el resto del sistema ni se entera.',
    sintoma: 'Cada campaña comercial obliga a abrir la función que cierra las ventas del mes para tocar la tabla de comisiones. Un cambio de porcentajes termina rompiendo el redondeo del total, que no tenía nada que ver.',
    practica: 'Es el principio detrás de casi todos los patrones: cada uno aísla un tipo de variación distinto (qué objeto se crea, qué algoritmo se usa, qué estado está activo...). Pregúntate siempre: "¿qué va a cambiar aquí y con qué frecuencia?".',
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
    nombre: 'Programa contra interfaces, no contra implementaciones',
    lema: 'Depende de lo que hace, no de quién lo hace',
    definicion: 'Declara tus variables, parámetros y dependencias usando el tipo más general que te sirva (una interfaz o una clase base), no una clase concreta. "Interfaz" aquí significa el contrato: qué operaciones ofrece algo, sin importar cómo las implementa.',
    sintoma: 'El servicio de adjuntos recibe un ClienteS3 y usa métodos propios de ese SDK. Para guardar en disco local durante las pruebas, o migrar a otro proveedor, hay que reescribir el servicio.',
    practica: 'No hace falta crear una interfaz por cada clase. Úsalo donde esperas más de una implementación o donde quieres probar con un sustituto. Es la base práctica del principio de inversión de dependencias (la D de SOLID).',
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
    nombre: 'Prefiere la composición sobre la herencia',
    lema: 'Arma comportamientos, no árboles de clases',
    definicion: 'En lugar de obtener comportamiento heredándolo de una clase padre, obtenlo teniendo otros objetos que lo hacen (y delegando en ellos). La herencia fija las combinaciones al compilar; la composición permite combinarlas libremente, incluso en tiempo de ejecución.',
    sintoma: 'Aparecen clases como ReportePdfFirmado, ReporteExcelFirmado, ReportePdfFirmadoComprimido... Cada nueva opción multiplica las subclases, y un cambio en la clase base afecta a todas a la vez.',
    practica: 'La herencia sigue siendo válida cuando hay una relación "es un" estable y la subclase cumple todo el contrato de la base. El problema aparece cuando la usas solo para reutilizar código o para combinar opciones independientes.',
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
    nombre: 'Busca un acoplamiento débil',
    lema: 'Que los objetos sepan poco unos de otros',
    definicion: 'Dos objetos que colaboran deberían conocer lo mínimo el uno del otro: qué pueden pedirse, no cómo funcionan por dentro. Cuanto menos sabe un objeto de otro, menos le afectan sus cambios.',
    sintoma: 'Para registrar una devolución, el módulo de inventario llama directamente a la contabilidad, al servicio de correo y al panel de métricas. Agregar un cuarto interesado obliga a modificar inventario, y una caída del correo bloquea las devoluciones.',
    practica: 'Acoplamiento débil no es cero acoplamiento: algo tiene que conectar las piezas. La idea es que esa conexión pase por contratos pequeños y estables (una interfaz, un evento) y no por los detalles internos de cada módulo.',
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
    nombre: 'Principio del menor conocimiento',
    lema: 'Habla solo con tus vecinos cercanos',
    definicion: 'También llamado Ley de Demeter. Un método solo debería llamar a métodos de su propio objeto, de los parámetros que recibe, de los objetos que crea y de sus atributos directos. No debería "atravesar" objetos para llegar a los objetos de otros.',
    sintoma: 'Cadenas como pedido.cliente.direccion.distrito.zonaReparto. Si cambia cómo se guarda la dirección, se rompen decenas de lugares que no tenían nada que ver con direcciones.',
    practica: 'No se trata de contar puntos: encadenar métodos de un mismo objeto (un builder, un array con map y filter) no lo incumple. Lo que evita es depender de la estructura interna de objetos ajenos. La solución es pedirle al objeto que tienes que haga el trabajo, o que te dé directamente lo que necesitas.',
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
