// Contenido de la página "Fundamentos de POO": los 4 pilares y las 4 relaciones entre clases.
import type { Texto } from '../i18n/idiomas.ts';

export interface Pilar {
  id: string;
  nombre: Texto;
  lema: Texto;
  /** Párrafo principal; admite <strong> y <code>. */
  explicacion: Texto;
  codigo: string;
  nota: { titulo: Texto; texto: Texto; tono: 'primario' | 'secundario' | 'aviso' };
  estilo: string;
}

export const ENCABEZADO = {
  titulo: { es: 'Fundamentos de POO', en: 'OOP fundamentals' },
  intro: {
    es: 'Los patrones de diseño están hechos con las piezas básicas de la programación orientada a objetos: cuatro pilares que definen cómo se construye un objeto y cuatro relaciones que definen cómo colaboran entre sí. Si estas piezas están claras, los patrones se entienden mucho más rápido.',
    en: 'Design patterns are built from the basic pieces of object-oriented programming: four pillars that define how an object is built and four relationships that define how objects work together. Once these pieces are clear, patterns become much easier to understand.',
  },
  descripcion: {
    es: 'Abstracción, encapsulamiento, herencia y polimorfismo, y las relaciones entre clases (dependencia, asociación, agregación y composición), con ejemplos de código reales.',
    en: 'Abstraction, encapsulation, inheritance and polymorphism, plus the relationships between classes (dependency, association, aggregation and composition), with real code examples.',
  },
  diagramaPilares: { es: 'Los 4 pilares en un diagrama', en: 'The 4 pillars in one diagram' },
  tituloPilares: { es: '1. Los cuatro pilares', en: '1. The four pillars' },
  diagramaRelaciones: { es: 'Las relaciones en un diagrama UML', en: 'The relationships in a UML diagram' },
  tituloRelaciones: { es: '2. Las cuatro relaciones entre clases', en: '2. The four relationships between classes' },
  ordenRelaciones: { es: 'De menor a mayor acoplamiento', en: 'From weakest to strongest coupling' },
  ademas: {
    es: 'UML también representa la <strong>generalización</strong> (herencia, línea continua con triángulo hueco) y la <strong>realización</strong> (una clase implementa una interfaz, línea discontinua con triángulo hueco). Las verás en los diagramas de casi todos los patrones.',
    en: 'UML also shows <strong>generalization</strong> (inheritance, a solid line with a hollow triangle) and <strong>realization</strong> (a class implements an interface, a dashed line with a hollow triangle). You will see them in the diagrams of almost every pattern.',
  },
  siguiente: { es: 'Siguiente paso: principios de diseño', en: 'Next step: design principles' },
} satisfies Record<string, Texto>;

export const PILARES: Pilar[] = [
  {
    id: 'abstraccion',
    nombre: { es: 'Abstracción', en: 'Abstraction' },
    lema: { es: 'Quedarse con lo esencial', en: 'Keep only what matters' },
    explicacion: {
      es: 'Abstraer es <strong>modelar solo lo que importa</strong> de un concepto para el problema que resuelves y dejar fuera el resto. Un "almacenamiento", para tu aplicación, es algo que guarda un archivo y devuelve una URL; cómo lo hace un proveedor concreto es un detalle. Las clases abstractas y las interfaces son las herramientas con las que se expresa esa idea en el código.',
      en: 'Abstracting means <strong>modeling only what matters</strong> about a concept for the problem you are solving, and leaving the rest out. For your application, "storage" is something that saves a file and returns a URL; how a specific provider does it is a detail. Abstract classes and interfaces are the tools that express this idea in code.',
    },
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
      titulo: { es: 'Por qué importa', en: 'Why it matters' },
      texto: {
        es: 'GestorComprobantes no sabe nada del proveedor. Si mañana cambias de proveedor de almacenamiento, solo escribes otra implementación de <code>Almacenamiento</code>.',
        en: 'GestorComprobantes knows nothing about the provider. If you switch storage providers tomorrow, you only write another implementation of <code>Almacenamiento</code>.',
      },
    },
    estilo: 'bg-primary-container/15 text-primary-container border-primary-container/30',
  },
  {
    id: 'encapsulamiento',
    nombre: { es: 'Encapsulamiento', en: 'Encapsulation' },
    lema: { es: 'Proteger el estado', en: 'Protect the state' },
    explicacion: {
      es: 'Reúne los datos y las operaciones que los modifican dentro del mismo objeto y <strong>oculta los datos</strong> para que solo se puedan cambiar a través de esas operaciones. Así el objeto garantiza sus reglas (invariantes): por ejemplo, que el saldo nunca sea negativo.',
      en: 'It puts the data and the operations that change it inside the same object, and <strong>hides the data</strong> so it can only be changed through those operations. That way the object guarantees its rules (invariants): for example, that the balance is never negative.',
    },
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
      titulo: { es: 'Qué pasa sin él', en: 'What happens without it' },
      texto: {
        es: 'Si el saldo fuera público, cualquier parte del código podría dejarlo en negativo o cambiarlo sin registrar el movimiento, y nadie sabría desde dónde ocurrió.',
        en: 'If the balance were public, any part of the code could make it negative or change it without recording the transaction, and nobody would know where it happened.',
      },
    },
    estilo: 'bg-secondary-container/15 text-secondary-container border-secondary-container/30',
  },
  {
    id: 'herencia',
    nombre: { es: 'Herencia', en: 'Inheritance' },
    lema: { es: 'Especializar', en: 'Specialize' },
    explicacion: {
      es: 'Una clase hija <strong>reutiliza y especializa</strong> el comportamiento de una clase base. Es útil, pero crea uno de los acoplamientos más fuertes que existen: la hija depende de los detalles de la base, y un cambio en la base puede romper a todas sus hijas.',
      en: 'A child class <strong>reuses and specializes</strong> the behavior of a base class. It is useful, but it creates one of the strongest kinds of coupling there is: the child depends on the details of the base, and a change in the base can break every child.',
    },
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
      titulo: { es: 'Regla práctica', en: 'Rule of thumb' },
      texto: {
        es: 'Usa herencia cuando la hija realmente "es un" caso particular de la base y puede usarse en su lugar sin sorpresas (principio de Liskov). Si solo quieres reutilizar código, prefiere la composición.',
        en: 'Use inheritance when the child really "is a" special case of the base and can be used in its place without surprises (the Liskov principle). If you only want to reuse code, prefer composition.',
      },
    },
    estilo: 'bg-tertiary-fixed-dim/15 text-tertiary-fixed-dim border-tertiary-fixed-dim/30',
  },
  {
    id: 'polimorfismo',
    nombre: { es: 'Polimorfismo', en: 'Polymorphism' },
    lema: { es: 'Un mensaje, muchas respuestas', en: 'One message, many answers' },
    explicacion: {
      es: 'Permite enviar <strong>el mismo mensaje</strong> a objetos de clases distintas y que cada uno responda con su propia implementación. Quien envía el mensaje no necesita saber la clase concreta: solo que el objeto cumple el contrato.',
      en: 'It lets you send <strong>the same message</strong> to objects of different classes and have each one respond with its own implementation. The sender does not need to know the concrete class: only that the object honors the contract.',
    },
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
      titulo: { es: 'La base de muchos patrones', en: 'The basis of many patterns' },
      texto: {
        es: 'Strategy, State, Command o Composite se apoyan en el polimorfismo. Es lo que permite reemplazar los <code>switch</code> sobre el tipo de objeto por una sola llamada.',
        en: 'Strategy, State, Command and Composite all rely on polymorphism. It is what lets you replace a <code>switch</code> on the type of an object with a single call.',
      },
    },
    estilo: 'bg-primary-container/15 text-primary-container border-primary-container/30',
  },
];

export interface Relacion {
  nombre: Texto;
  subtitulo: Texto;
  uml: Texto;
  etiqueta: Texto;
  texto: Texto;
  codigo: string;
  destacado: boolean;
}

export const RELACIONES: Relacion[] = [
  {
    nombre: { es: 'Dependencia', en: 'Dependency' },
    subtitulo: { es: 'Uso temporal', en: 'Temporary use' },
    uml: { es: 'Línea discontinua con flecha abierta ( - - -> )', en: 'Dashed line with an open arrow ( - - -> )' },
    etiqueta: { es: 'Acoplamiento más débil', en: 'Weakest coupling' },
    texto: {
      es: 'La clase A usa a la clase B solo durante una operación: B llega como parámetro o se crea dentro de un método. Cuando el método termina, A ya no guarda ninguna referencia a B.',
      en: 'Class A uses class B only during one operation: B arrives as a parameter or is created inside a method. When the method ends, A keeps no reference to B.',
    },
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
    nombre: { es: 'Asociación', en: 'Association' },
    subtitulo: { es: 'Conocimiento sostenido', en: 'Lasting knowledge' },
    uml: { es: 'Línea continua; la flecha (opcional) indica quién conoce a quién', en: 'Solid line; the (optional) arrow shows who knows whom' },
    etiqueta: { es: 'Referencia guardada', en: 'Stored reference' },
    texto: {
      es: 'La clase A guarda una referencia a la clase B como atributo y colabora con ella durante su vida. Cada objeto existe de forma independiente.',
      en: 'Class A keeps a reference to class B as a field and works with it throughout its life. Each object exists independently.',
    },
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
    nombre: { es: 'Agregación', en: 'Aggregation' },
    subtitulo: { es: 'Todo-parte débil', en: 'Weak whole-part' },
    uml: { es: 'Línea con rombo hueco en el lado del todo ( ◇— )', en: 'Line with a hollow diamond on the whole side ( ◇— )' },
    etiqueta: { es: 'Partes independientes', en: 'Independent parts' },
    texto: {
      es: 'Un tipo especial de asociación "todo-parte": el todo agrupa partes que pueden existir sin él. Suelen llegar desde fuera, por ejemplo por el constructor.',
      en: 'A special kind of "whole-part" association: the whole groups parts that can exist without it. They usually come from outside, for example through the constructor.',
    },
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
    nombre: { es: 'Composición', en: 'Composition' },
    subtitulo: { es: 'Todo-parte fuerte', en: 'Strong whole-part' },
    uml: { es: 'Línea con rombo relleno en el lado del todo ( ◆— )', en: 'Line with a filled diamond on the whole side ( ◆— )' },
    etiqueta: { es: 'Dueño del ciclo de vida', en: 'Owns the lifecycle' },
    texto: {
      es: 'El todo crea sus partes y es responsable de ellas. Las partes no se comparten y no tienen sentido fuera del todo: si el todo desaparece, ellas también.',
      en: 'The whole creates its parts and is responsible for them. The parts are not shared and make no sense outside the whole: if the whole goes away, so do they.',
    },
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
