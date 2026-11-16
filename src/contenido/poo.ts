// Contenido de la página "Fundamentos de POO": los 4 pilares y las 4 relaciones entre clases.

interface Pilar {
  id: string;
  nombre: string;
  lema: string;
  /** Párrafo principal; admite <strong> y <code>. */
  explicacion: string;
  codigo: string;
  nota: { titulo: string; texto: string; tono: 'primario' | 'secundario' | 'aviso' };
  estilo: string;
}

export const ENCABEZADO = {
  titulo: 'Fundamentos de POO',
  intro: 'Los patrones de diseño están hechos con las piezas básicas de la programación orientada a objetos: cuatro pilares que definen cómo se construye un objeto y cuatro relaciones que definen cómo colaboran entre sí. Si estas piezas están claras, los patrones se entienden mucho más rápido.',
  descripcion: 'Abstracción, encapsulamiento, herencia y polimorfismo, y las relaciones entre clases (dependencia, asociación, agregación y composición), con ejemplos de código reales.',
  diagramaPilares: 'Los 4 pilares en un diagrama',
  tituloPilares: '1. Los cuatro pilares',
  diagramaRelaciones: 'Las relaciones en un diagrama UML',
  tituloRelaciones: '2. Las cuatro relaciones entre clases',
  ordenRelaciones: 'De menor a mayor acoplamiento',
  ademas: 'UML también representa la <strong>generalización</strong> (herencia, línea continua con triángulo hueco) y la <strong>realización</strong> (una clase implementa una interfaz, línea discontinua con triángulo hueco). Las verás en los diagramas de casi todos los patrones.',
  siguiente: 'Siguiente paso: principios de diseño',
};

export const PILARES: Pilar[] = [
  {
    id: 'abstraccion',
    nombre: 'Abstracción',
    lema: 'Quedarse con lo esencial',
    explicacion: 'Abstraer es <strong>modelar solo lo que importa</strong> de un concepto para el problema que resuelves y dejar fuera el resto. Un "almacenamiento", para tu aplicación, es algo que guarda un archivo y devuelve una URL; cómo lo hace un proveedor concreto es un detalle. Las clases abstractas y las interfaces son las herramientas con las que se expresa esa idea en el código.',
    codigo: `// El modelo esencial: para la aplicación, "almacenar" es
// subir un archivo y obtener su URL. Nada más.
export interface Almacenamiento {
  subir(nombre: string, contenido: Buffer): Promise<string>;
  urlDe(id: string): string;
}

// Quien lo usa trabaja con esa idea simple, no con los detalles
// (regiones, firmas, reintentos) de un proveedor concreto.
export class GestorComprobantes {
  constructor(private readonly almacenamiento: Almacenamiento) {}

  guardar(nombre: string, pdf: Buffer): Promise<string> {
    return this.almacenamiento.subir(nombre, pdf);
  }
}`,
    nota: {
      tono: 'primario',
      titulo: 'Por qué importa',
      texto: 'GestorComprobantes no sabe nada del proveedor. Si mañana cambias de proveedor de almacenamiento, solo escribes otra implementación de <code>Almacenamiento</code>.',
    },
    estilo: 'bg-primary-container/15 text-primary-container border-primary-container/30',
  },
  {
    id: 'encapsulamiento',
    nombre: 'Encapsulamiento',
    lema: 'Proteger el estado',
    explicacion: 'Reúne los datos y las operaciones que los modifican dentro del mismo objeto y <strong>oculta los datos</strong> para que solo se puedan cambiar a través de esas operaciones. Así el objeto garantiza sus reglas (invariantes): por ejemplo, que el saldo nunca sea negativo.',
    codigo: `export class CuentaBancaria {
  // Estado privado: nadie desde fuera puede cambiar el saldo a su antojo
  private saldo: number;
  private movimientos: { fecha: Date; monto: number }[] = [];

  constructor(saldoInicial: number) {
    if (saldoInicial < 0) throw new Error('El saldo inicial no puede ser negativo.');
    this.saldo = saldoInicial;
  }

  // La única forma de modificar el saldo pasa por las reglas del negocio
  retirar(monto: number): void {
    if (monto <= 0) throw new Error('El monto debe ser positivo.');
    if (monto > this.saldo) throw new Error('Fondos insuficientes.');
    this.saldo -= monto;
    this.movimientos.push({ fecha: new Date(), monto: -monto });
  }

  obtenerSaldo(): number {
    return this.saldo; // se puede leer, no escribir
  }
}`,
    nota: {
      tono: 'secundario',
      titulo: 'Qué pasa sin él',
      texto: 'Si el saldo fuera público, cualquier parte del código podría dejarlo en negativo o cambiarlo sin registrar el movimiento, y nadie sabría desde dónde ocurrió.',
    },
    estilo: 'bg-secondary-container/15 text-secondary-container border-secondary-container/30',
  },
  {
    id: 'herencia',
    nombre: 'Herencia',
    lema: 'Especializar',
    explicacion: 'Una clase hija <strong>reutiliza y especializa</strong> el comportamiento de una clase base. Es útil, pero crea uno de los acoplamientos más fuertes que existen: la hija depende de los detalles de la base, y un cambio en la base puede romper a todas sus hijas.',
    codigo: `// Clase base con lo común a todos los notificadores
export abstract class Notificador {
  protected formatear(titulo: string, cuerpo: string): string {
    return '[' + new Date().toISOString() + '] ' + titulo.toUpperCase() + ': ' + cuerpo;
  }

  abstract enviar(destino: string, mensaje: string): Promise<void>;
}

// La subclase reutiliza el formato y especializa el envío
export class NotificadorSlack extends Notificador {
  constructor(private readonly webhookUrl: string) {
    super();
  }

  async enviar(canal: string, texto: string): Promise<void> {
    const cuerpo = this.formatear('Alerta del sistema', texto);
    await fetch(this.webhookUrl, { method: 'POST', body: JSON.stringify({ canal, cuerpo }) });
  }
}`,
    nota: {
      tono: 'aviso',
      titulo: 'Regla práctica',
      texto: 'Usa herencia cuando la hija realmente "es un" caso particular de la base y puede usarse en su lugar sin sorpresas (principio de Liskov). Si solo quieres reutilizar código, prefiere la composición.',
    },
    estilo: 'bg-tertiary-fixed-dim/15 text-tertiary-fixed-dim border-tertiary-fixed-dim/30',
  },
  {
    id: 'polimorfismo',
    nombre: 'Polimorfismo',
    lema: 'Un mensaje, muchas respuestas',
    explicacion: 'Permite enviar <strong>el mismo mensaje</strong> a objetos de clases distintas y que cada uno responda con su propia implementación. Quien envía el mensaje no necesita saber la clase concreta: solo que el objeto cumple el contrato.',
    codigo: `export interface MedioDePago {
  cobrar(monto: number): Promise<void>;
}

export class PagoTarjeta implements MedioDePago {
  async cobrar(monto: number) { /* autoriza con la pasarela de tarjetas */ }
}

export class PagoSaldo implements MedioDePago {
  async cobrar(monto: number) { /* descuenta del saldo a favor del cliente */ }
}

// Pago dividido: cada parte se cobra con su propio medio.
// El mismo mensaje (cobrar) y cada objeto responde a su manera.
export async function cobrarPedido(partes: { medio: MedioDePago; monto: number }[]) {
  for (const { medio, monto } of partes) {
    await medio.cobrar(monto);
  }
}

await cobrarPedido([
  { medio: new PagoTarjeta(), monto: 70 },
  { medio: new PagoSaldo(), monto: 30 },
]);`,
    nota: {
      tono: 'secundario',
      titulo: 'La base de muchos patrones',
      texto: 'Strategy, State, Command o Composite se apoyan en el polimorfismo. Es lo que permite reemplazar los <code>switch</code> sobre el tipo de objeto por una sola llamada.',
    },
    estilo: 'bg-primary-container/15 text-primary-container border-primary-container/30',
  },
];

interface Relacion {
  nombre: string;
  subtitulo: string;
  uml: string;
  etiqueta: string;
  texto: string;
  codigo: string;
  destacado: boolean;
}

export const RELACIONES: Relacion[] = [
  {
    nombre: 'Dependencia',
    subtitulo: 'Uso temporal',
    uml: 'Línea discontinua con flecha abierta ( - - -> )',
    etiqueta: 'Acoplamiento más débil',
    texto: 'La clase A usa a la clase B solo durante una operación: B llega como parámetro o se crea dentro de un método. Cuando el método termina, A ya no guarda ninguna referencia a B.',
    codigo: `export class GeneradorFactura {
  // Dependencia: la calculadora llega como parámetro y solo se usa aquí
  emitir(items: Item[], pais: string, calculadora: CalculadoraImpuestos): Factura {
    const subtotal = items.reduce((total, i) => total + i.precio, 0);
    return new Factura(subtotal * (1 + calculadora.tasaPara(pais)));
  }
}`,
    destacado: false,
  },
  {
    nombre: 'Asociación',
    subtitulo: 'Conocimiento sostenido',
    uml: 'Línea continua; la flecha (opcional) indica quién conoce a quién',
    etiqueta: 'Referencia guardada',
    texto: 'La clase A guarda una referencia a la clase B como atributo y colabora con ella durante su vida. Cada objeto existe de forma independiente.',
    codigo: `export class CuentaUsuario {
  // Asociación: guarda una referencia al perfil, pero ambos viven por separado
  constructor(private readonly perfil: PerfilPublico) {}

  actualizarBiografia(texto: string): void {
    // Le pide al perfil que cambie; no toca sus datos directamente
    this.perfil.cambiarBiografia(texto);
  }
}`,
    destacado: false,
  },
  {
    nombre: 'Agregación',
    subtitulo: 'Todo-parte débil',
    uml: 'Línea con rombo hueco en el lado del todo ( ◇— )',
    etiqueta: 'Partes independientes',
    texto: 'Un tipo especial de asociación "todo-parte": el todo agrupa partes que pueden existir sin él. Suelen llegar desde fuera, por ejemplo por el constructor.',
    codigo: `export class EquipoDesarrollo {
  // Agregación: los ingenieros existen antes que el equipo
  // y siguen existiendo si el equipo se disuelve
  constructor(private readonly integrantes: Ingeniero[]) {}

  habilidades(): string[] {
    return this.integrantes.flatMap((i) => i.habilidades);
  }
}`,
    destacado: false,
  },
  {
    nombre: 'Composición',
    subtitulo: 'Todo-parte fuerte',
    uml: 'Línea con rombo relleno en el lado del todo ( ◆— )',
    etiqueta: 'Dueño del ciclo de vida',
    texto: 'El todo crea sus partes y es responsable de ellas. Las partes no se comparten y no tienen sentido fuera del todo: si el todo desaparece, ellas también.',
    codigo: `export class OrdenCompra {
  // Composición: la orden crea y es dueña de sus líneas.
  // Las líneas no tienen sentido fuera de su orden.
  private readonly lineas: LineaOrden[] = [];

  agregarProducto(productoId: string, cantidad: number, precio: number): void {
    this.lineas.push(new LineaOrden(productoId, cantidad, precio));
  }
}`,
    destacado: true,
  },
];
