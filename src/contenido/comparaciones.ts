// Contenido de la página "Patrones que se confunden": pares de patrones con estructura parecida
// y propósito distinto. Cada comparación usa un mismo caso resuelto con cada patrón.
import type { Texto } from '../i18n/idiomas.ts';

export interface Solucion {
  patron: string;
  explicacion: Texto;
  codigo: string;
}

export interface Comparacion {
  id: string;
  /** Slugs de los patrones comparados, en el orden de las columnas. */
  patrones: string[];
  idea: Texto;
  caso: Texto;
  filas: { aspecto: Texto; valores: Texto[] }[];
  soluciones: Solucion[];
  pregunta: Texto;
}

export const ENCABEZADO = {
  titulo: { es: 'Patrones que se confunden', en: 'Patterns that get mixed up' },
  intro: {
    es: 'Muchos patrones tienen diagramas casi iguales: una interfaz, una clase que delega en otra, varias implementaciones. Lo que los distingue no es la forma, sino el problema que resuelven. Aquí tienes los pares que más se confunden, con sus diferencias en una tabla y un mismo caso resuelto con cada uno.',
    en: 'Many patterns have almost identical diagrams: an interface, a class that delegates to another, several implementations. What sets them apart is not the shape but the problem they solve. Here are the pairs that get mixed up the most, with their differences in a table and the same case solved with each one.',
  },
  descripcion: {
    es: 'Strategy vs State, Decorator vs Proxy vs Adapter, Facade vs Mediator, Factory Method vs Abstract Factory, Command vs Strategy y Template Method vs Strategy: diferencias y un mismo caso resuelto de cada forma.',
    en: 'Strategy vs State, Decorator vs Proxy vs Adapter, Facade vs Mediator, Factory Method vs Abstract Factory, Command vs Strategy and Template Method vs Strategy: differences and the same case solved each way.',
  },
  elCaso: { es: 'El caso', en: 'The case' },
  diferencias: { es: 'Diferencias clave', en: 'Key differences' },
  aspecto: { es: 'Aspecto', en: 'Aspect' },
  resuelto: { es: 'Resuelto con', en: 'Solved with' },
  pregunta: { es: 'La pregunta para decidir', en: 'The question to decide' },
  verPatron: { es: 'Ver el patrón', en: 'See the pattern' },
} satisfies Record<string, Texto>;

export const COMPARACIONES: Comparacion[] = [
  {
    id: 'strategy-state',
    patrones: ['strategy', 'state'],
    idea: {
      es: 'Los dos delegan en un objeto intercambiable. En Strategy lo elige quien usa el objeto; en State el objeto cambia solo según lo que le pasa.',
      en: 'Both delegate to an interchangeable object. In Strategy, whoever uses the object picks it; in State, the object changes it by itself depending on what happens to it.',
    },
    caso: {
      es: 'Un estacionamiento emite un ticket a cada auto que entra. Hay dos cosas que varían: la tarifa (por hora, plana de día completo o de abonado) y la etapa del ticket (abierto, pagado o cerrado). Son dos problemas distintos dentro del mismo objeto.',
      en: 'A parking lot issues a ticket to every car that comes in. Two things vary: the rate (hourly, flat full-day or subscriber) and the stage of the ticket (open, paid or closed). They are two different problems inside the same object.',
    },
    filas: [
      {
        aspecto: { es: 'Quién elige el objeto auxiliar', en: 'Who picks the helper object' },
        valores: [
          { es: 'El cliente, desde fuera (al crear el ticket se elige la tarifa).', en: 'The client, from outside (the rate is chosen when the ticket is created).' },
          { es: 'El propio objeto o sus estados, a medida que ocurren eventos.', en: 'The object itself or its states, as events happen.' },
        ],
      },
      {
        aspecto: { es: '¿Se conocen entre sí?', en: 'Do they know each other?' },
        valores: [
          { es: 'No: cada estrategia es independiente.', en: 'No: each strategy is independent.' },
          { es: 'Sí: cada estado sabe a qué estado pasar después.', en: 'Yes: each state knows which state comes next.' },
        ],
      },
      {
        aspecto: { es: 'Qué representan', en: 'What they represent' },
        valores: [
          { es: 'Formas distintas de hacer lo mismo (calcular el monto).', en: 'Different ways of doing the same thing (calculating the amount).' },
          { es: 'Etapas de un ciclo de vida, cada una con reglas propias.', en: 'Stages of a lifecycle, each with its own rules.' },
        ],
      },
      {
        aspecto: { es: 'Cuándo cambia', en: 'When it changes' },
        valores: [
          { es: 'Rara vez; normalmente una vez por objeto.', en: 'Rarely; usually once per object.' },
          { es: 'Constantemente, como parte del flujo normal.', en: 'All the time, as part of the normal flow.' },
        ],
      },
    ],
    soluciones: [
      {
        patron: 'strategy',
        explicacion: {
          es: 'La tarifa se elige al entrar y no cambia: es una estrategia. El ticket no sabe cuál le tocó, solo le pide el monto.',
          en: 'The rate is picked at the entrance and does not change: it is a strategy. The ticket does not know which one it got; it just asks it for the amount.',
        },
        codigo: `interface Tarifa {
  monto(minutos: number): number;
}

const porHora: Tarifa = { monto: (min) => Math.ceil(min / 60) * 5 };
const diaCompleto: Tarifa = { monto: () => 30 };
const abonado: Tarifa = { monto: () => 0 }; // ya pagó su mensualidad

class Ticket {
  constructor(private readonly tarifa: Tarifa, private readonly entrada: Date) {}

  aPagar(ahora: Date): number {
    const minutos = (ahora.getTime() - this.entrada.getTime()) / 60_000;
    return this.tarifa.monto(minutos); // no sabe qué tarifa es
  }
}

// La elige quien crea el ticket, según el cliente
const ticket = new Ticket(esAbonado ? abonado : porHora, new Date());`,
      },
      {
        patron: 'state',
        explicacion: {
          es: 'La etapa sí cambia sola: al pagar, el ticket pasa a "pagado"; al salir, a "cerrado". Cada estado decide qué se permite y cuál es el siguiente.',
          en: 'The stage does change by itself: after paying, the ticket becomes "paid"; after leaving, "closed". Each state decides what is allowed and which state comes next.',
        },
        codigo: `interface EtapaTicket {
  pagar(ticket: Ticket): void;
  salir(ticket: Ticket): void;
}

const abierto: EtapaTicket = {
  pagar: (t) => { t.cobrar(); t.etapa = pagado; },     // pasa a "pagado"
  salir: () => { throw new Error('Primero debe pagar'); },
};

const pagado: EtapaTicket = {
  pagar: () => { throw new Error('El ticket ya está pagado'); },
  salir: (t) => { t.abrirBarrera(); t.etapa = cerrado; }, // pasa a "cerrado"
};

const cerrado: EtapaTicket = {
  pagar: () => { throw new Error('Ticket cerrado'); },
  salir: () => { throw new Error('Ticket cerrado'); },
};

class Ticket {
  etapa: EtapaTicket = abierto;
  pagar() { this.etapa.pagar(this); }
  salir() { this.etapa.salir(this); }
  cobrar() { /* ... */ }
  abrirBarrera() { /* ... */ }
}`,
      },
    ],
    pregunta: {
      es: '¿El objeto auxiliar lo elige alguien de fuera y casi no cambia (Strategy), o cambia por sí solo a medida que el objeto avanza por su ciclo de vida (State)?',
      en: 'Is the helper object picked by someone outside and barely changes (Strategy), or does it change by itself as the object moves through its lifecycle (State)?',
    },
  },
  {
    id: 'decorator-proxy-adapter',
    patrones: ['decorator', 'proxy', 'adapter'],
    idea: {
      es: 'Los tres envuelven a otro objeto. Adapter cambia la interfaz, Decorator añade comportamiento con la misma interfaz y Proxy controla el acceso al objeto real.',
      en: 'All three wrap another object. Adapter changes the interface, Decorator adds behavior with the same interface and Proxy controls access to the real object.',
    },
    caso: {
      es: 'Una tienda online cotiza sus envíos con una empresa de mensajería externa. Su SDK trabaja en gramos y dólares, cada consulta tarda y cuesta dinero, y el negocio quiere sumar recargos (combustible, seguro) según la campaña.',
      en: 'An online store gets shipping quotes from an external courier company. Its SDK works in grams and dollars, each request is slow and costs money, and the business wants to add surcharges (fuel, insurance) depending on the campaign.',
    },
    filas: [
      {
        aspecto: { es: 'Interfaz que ofrece', en: 'Interface it offers' },
        valores: [
          { es: 'La misma que el objeto envuelto.', en: 'The same as the wrapped object.' },
          { es: 'La misma que el objeto real.', en: 'The same as the real object.' },
          { es: 'Una distinta: la que espera tu código.', en: 'A different one: the one your code expects.' },
        ],
      },
      {
        aspecto: { es: 'Para qué sirve', en: 'What it is for' },
        valores: [
          { es: 'Añadir responsabilidades.', en: 'Adding responsibilities.' },
          { es: 'Controlar el acceso: caché, permisos, carga diferida.', en: 'Controlling access: caching, permissions, lazy loading.' },
          { es: 'Hacer compatible algo que no lo es.', en: 'Making something compatible that is not.' },
        ],
      },
      {
        aspecto: { es: 'Quién lo arma', en: 'Who assembles it' },
        valores: [
          { es: 'El cliente, combinando capas a su gusto.', en: 'The client, combining layers as it likes.' },
          { es: 'Normalmente el propio proxy o la configuración; el cliente no lo nota.', en: 'Usually the proxy itself or the configuration; the client does not notice.' },
          { es: 'La capa de integración con el tercero.', en: 'The integration layer with the third party.' },
        ],
      },
      {
        aspecto: { es: '¿Se apilan?', en: 'Do they stack?' },
        valores: [
          { es: 'Sí, es su gracia: varias capas una sobre otra.', en: 'Yes, that is the point: several layers on top of each other.' },
          { es: 'Es posible, pero no es lo habitual.', en: 'It is possible, but not usual.' },
          { es: 'No: envuelve un objeto para traducirlo.', en: 'No: it wraps one object to translate it.' },
        ],
      },
    ],
    soluciones: [
      {
        patron: 'adapter',
        explicacion: {
          es: 'El SDK habla en gramos y dólares; tu tienda, en kilos y soles. El adaptador traduce para que el resto del código use tu propia interfaz.',
          en: 'The SDK speaks grams and dollars; your store speaks kilos and soles. The adapter translates so the rest of the code uses your own interface.',
        },
        codigo: `// Tu interfaz
interface Cotizador {
  cotizar(paquete: { kilos: number; destino: string }): Promise<number>; // en soles
}

// Adapter: traduce tu interfaz a la del SDK externo
class CotizadorMensajeria implements Cotizador {
  constructor(private readonly sdk: SdkMensajeria, private readonly tipoCambio: number) {}

  async cotizar({ kilos, destino }: { kilos: number; destino: string }) {
    const r = await this.sdk.getQuote({ weightGrams: kilos * 1000, zip: destino });
    return r.priceUsd * this.tipoCambio;
  }
}`,
      },
      {
        patron: 'decorator',
        explicacion: {
          es: 'Los recargos son capas que el negocio combina según la campaña. Cada una tiene la misma interfaz y se suma sobre la anterior.',
          en: 'The surcharges are layers the business combines depending on the campaign. Each one has the same interface and adds on top of the previous one.',
        },
        codigo: `class ConRecargoCombustible implements Cotizador {
  constructor(private readonly interno: Cotizador) {}
  async cotizar(p: Paquete) { return (await this.interno.cotizar(p)) * 1.08; }
}

class ConSeguro implements Cotizador {
  constructor(private readonly interno: Cotizador, private readonly valorDeclarado: number) {}
  async cotizar(p: Paquete) { return (await this.interno.cotizar(p)) + this.valorDeclarado * 0.01; }
}

// El cliente arma las capas que necesita
const cotizador = new ConSeguro(new ConRecargoCombustible(base), 500);`,
      },
      {
        patron: 'proxy',
        explicacion: {
          es: 'Cada consulta cuesta dinero. El proxy guarda en caché las cotizaciones repetidas; quien lo usa no sabe que existe.',
          en: 'Every request costs money. The proxy caches repeated quotes; whoever uses it does not know it is there.',
        },
        codigo: `class CotizadorConCache implements Cotizador {
  private cache = new Map<string, { monto: number; vence: number }>();

  constructor(private readonly real: Cotizador) {}

  async cotizar(p: Paquete) {
    const clave = \`\${p.kilos}-\${p.destino}\`;
    const guardado = this.cache.get(clave);
    if (guardado && guardado.vence > Date.now()) return guardado.monto; // no llama al servicio

    const monto = await this.real.cotizar(p);
    this.cache.set(clave, { monto, vence: Date.now() + 10 * 60_000 });
    return monto;
  }
}`,
      },
    ],
    pregunta: {
      es: '¿Necesitas otra interfaz (Adapter), más comportamiento con la misma interfaz (Decorator) o controlar cuándo y cómo se llega al objeto real (Proxy)?',
      en: 'Do you need a different interface (Adapter), more behavior with the same interface (Decorator) or control over when and how the real object is reached (Proxy)?',
    },
  },
  {
    id: 'facade-mediator',
    patrones: ['facade', 'mediator'],
    idea: {
      es: 'Los dos ponen un objeto en medio de muchos otros. Facade simplifica el uso de un subsistema que no la conoce; Mediator coordina a componentes que solo hablan con él.',
      en: 'Both put one object in the middle of many others. Facade simplifies the use of a subsystem that does not know about it; Mediator coordinates components that only talk to it.',
    },
    caso: {
      es: 'Recursos humanos da de alta a una persona nueva. En el servidor hay que tocar planilla, accesos, correo corporativo y equipos. En la pantalla, el formulario tiene campos que dependen unos de otros: el área limita los cargos y el cargo fija el rango de sueldo.',
      en: 'HR onboards a new hire. On the server, payroll, access control, corporate email and equipment have to be updated. On the screen, the form has fields that depend on each other: the department limits the job titles and the job title sets the salary range.',
    },
    filas: [
      {
        aspecto: { es: 'Dirección de la comunicación', en: 'Direction of communication' },
        valores: [
          { es: 'De una sola vía: el cliente usa la fachada y la fachada usa el subsistema.', en: 'One way: the client uses the facade and the facade uses the subsystem.' },
          { es: 'En las dos vías: los componentes avisan al mediador y el mediador les responde.', en: 'Both ways: components notify the mediator and the mediator answers them.' },
        ],
      },
      {
        aspecto: { es: '¿Las piezas lo conocen?', en: 'Do the pieces know about it?' },
        valores: [
          { es: 'No: el subsistema funciona igual sin la fachada.', en: 'No: the subsystem works the same without the facade.' },
          { es: 'Sí: cada componente solo conoce al mediador.', en: 'Yes: each component only knows the mediator.' },
        ],
      },
      {
        aspecto: { es: '¿Añade comportamiento?', en: 'Does it add behavior?' },
        valores: [
          { es: 'No, ofrece un atajo a lo que ya existe.', en: 'No, it offers a shortcut to what already exists.' },
          { es: 'Sí: contiene las reglas de colaboración.', en: 'Yes: it holds the collaboration rules.' },
        ],
      },
    ],
    soluciones: [
      {
        patron: 'facade',
        explicacion: {
          es: 'En el servidor, una fachada ofrece una sola operación de alta. Los servicios de planilla o accesos no saben que existe y se pueden seguir usando por separado.',
          en: 'On the server, a facade offers a single onboarding operation. The payroll or access services do not know it exists and can still be used on their own.',
        },
        codigo: `class AltaEmpleado {
  constructor(
    private readonly planilla: ServicioPlanilla,
    private readonly accesos: ServicioAccesos,
    private readonly correo: ServicioCorreoCorporativo,
    private readonly equipos: ServicioEquipos,
  ) {}

  // Una sola llamada en lugar de cuatro, en el orden correcto
  async registrar(persona: NuevoEmpleado) {
    const codigo = await this.planilla.inscribir(persona);
    await this.correo.crearCuenta(codigo, persona.nombre);
    await this.accesos.otorgarPerfil(codigo, persona.cargo);
    await this.equipos.asignarKitInicial(codigo, persona.area);
    return codigo;
  }
}`,
      },
      {
        patron: 'mediator',
        explicacion: {
          es: 'En la pantalla, los campos no se llaman entre sí: avisan al mediador cuando cambian, y él decide qué actualizar.',
          en: 'On the screen, the fields do not call each other: they notify the mediator when they change, and it decides what to update.',
        },
        codigo: `class FormularioAlta {
  constructor(
    private readonly area: Selector,
    private readonly cargo: Selector,
    private readonly sueldo: CampoNumero,
    private readonly guardar: Boton,
  ) {
    area.alCambiar(() => this.notificar('area'));
    cargo.alCambiar(() => this.notificar('cargo'));
    sueldo.alCambiar(() => this.notificar('sueldo'));
  }

  // Las reglas entre campos viven aquí, no en cada campo
  private notificar(origen: 'area' | 'cargo' | 'sueldo') {
    if (origen === 'area') this.cargo.opciones(cargosDe(this.area.valor));
    if (origen === 'cargo') this.sueldo.rango(rangoSalarial(this.cargo.valor));
    this.guardar.habilitado = this.sueldo.esValido();
  }
}`,
      },
    ],
    pregunta: {
      es: '¿Quieres esconder la complejidad de un subsistema detrás de una entrada simple (Facade), o coordinar a varias piezas que hoy se llaman entre sí (Mediator)?',
      en: 'Do you want to hide the complexity of a subsystem behind a simple entry point (Facade), or coordinate several pieces that currently call each other (Mediator)?',
    },
  },
  {
    id: 'factory-method-abstract-factory',
    patrones: ['factory-method', 'abstract-factory'],
    idea: {
      es: 'Los dos ocultan qué clase concreta se crea. Factory Method crea un producto y la variación está en una subclase; Abstract Factory crea una familia de productos que deben combinar entre sí.',
      en: 'Both hide which concrete class gets created. Factory Method creates one product, and the variation lives in a subclass; Abstract Factory creates a family of products that must match each other.',
    },
    caso: {
      es: 'Una distribuidora vende en Perú y en Chile. Cada país tiene su formato de factura electrónica, pero además su guía de despacho y su nota de crédito, y los tres documentos de una venta deben ser del mismo país.',
      en: 'A distributor sells in Peru and in Chile. Each country has its own e-invoice format, plus its own shipping guide and credit note, and the three documents of one sale must all belong to the same country.',
    },
    filas: [
      {
        aspecto: { es: 'Cuántos productos crea', en: 'How many products it creates' },
        valores: [
          { es: 'Uno.', en: 'One.' },
          { es: 'Varios, relacionados entre sí.', en: 'Several, related to each other.' },
        ],
      },
      {
        aspecto: { es: 'Cómo varía', en: 'How it varies' },
        valores: [
          { es: 'Herencia: una subclase sobrescribe el método de creación.', en: 'Inheritance: a subclass overrides the creation method.' },
          { es: 'Composición: el cliente recibe un objeto fábrica completo.', en: 'Composition: the client receives a whole factory object.' },
        ],
      },
      {
        aspecto: { es: 'Qué garantiza', en: 'What it guarantees' },
        valores: [
          { es: 'Que el proceso no dependa de la clase concreta.', en: 'That the process does not depend on the concrete class.' },
          { es: 'Además, que no se mezclen productos de familias distintas.', en: 'Also, that products from different families are not mixed.' },
        ],
      },
    ],
    soluciones: [
      {
        patron: 'factory-method',
        explicacion: {
          es: 'Si solo variara la factura, basta un método fábrica: el proceso de venta es el mismo y cada subclase crea la factura de su país.',
          en: 'If only the invoice varied, one factory method is enough: the sales process is the same and each subclass creates its country\'s invoice.',
        },
        codigo: `abstract class ProcesoVenta {
  protected abstract crearFactura(venta: Venta): Factura; // método fábrica

  cerrar(venta: Venta) {
    const factura = this.crearFactura(venta);
    factura.firmar();
    return factura.enviarAlFisco();
  }
}

class ProcesoVentaPeru extends ProcesoVenta {
  protected crearFactura(venta: Venta) { return new FacturaSunat(venta); }
}

class ProcesoVentaChile extends ProcesoVenta {
  protected crearFactura(venta: Venta) { return new FacturaSii(venta); }
}`,
      },
      {
        patron: 'abstract-factory',
        explicacion: {
          es: 'Como son tres documentos que deben ser del mismo país, conviene una fábrica por país que cree la familia completa. Es imposible mezclar una factura peruana con una guía chilena.',
          en: 'Since there are three documents that must belong to the same country, a factory per country that creates the whole family works better. Mixing a Peruvian invoice with a Chilean shipping guide becomes impossible.',
        },
        codigo: `interface DocumentosPais {
  factura(venta: Venta): Factura;
  guiaDespacho(venta: Venta): GuiaDespacho;
  notaCredito(venta: Venta, motivo: string): NotaCredito;
}

const documentosPeru: DocumentosPais = {
  factura: (v) => new FacturaSunat(v),
  guiaDespacho: (v) => new GuiaRemisionSunat(v),
  notaCredito: (v, m) => new NotaCreditoSunat(v, m),
};

// El proceso recibe la familia entera; nunca mezcla países
function despachar(venta: Venta, documentos: DocumentosPais) {
  return [documentos.factura(venta), documentos.guiaDespacho(venta)];
}`,
      },
    ],
    pregunta: {
      es: '¿Varía un solo objeto (Factory Method), o varios objetos que siempre tienen que ir juntos (Abstract Factory)?',
      en: 'Does a single object vary (Factory Method), or several objects that always have to go together (Abstract Factory)?',
    },
  },
  {
    id: 'command-strategy',
    patrones: ['command', 'strategy'],
    idea: {
      es: 'Los dos convierten un comportamiento en un objeto. Strategy son formas distintas de hacer lo mismo; Command son acciones distintas que se pueden guardar, encolar o deshacer.',
      en: 'Both turn behavior into an object. Strategy is different ways of doing the same thing; Command is different actions that can be stored, queued or undone.',
    },
    caso: {
      es: 'Un panel de e-commerce procesa las fotos de los productos. Por un lado, la imagen final se puede comprimir en WebP, AVIF o JPEG. Por otro, el usuario aplica ediciones (recortar, rotar, poner marca de agua) y quiere poder deshacerlas.',
      en: 'An e-commerce dashboard processes product photos. On one hand, the final image can be compressed as WebP, AVIF or JPEG. On the other, the user applies edits (crop, rotate, add a watermark) and wants to be able to undo them.',
    },
    filas: [
      {
        aspecto: { es: 'Qué representa el objeto', en: 'What the object represents' },
        valores: [
          { es: 'Una solicitud: qué hacer, sobre qué y con qué datos.', en: 'A request: what to do, on what, and with which data.' },
          { es: 'Un algoritmo: cómo hacer una tarea concreta.', en: 'An algorithm: how to perform a specific task.' },
        ],
      },
      {
        aspecto: { es: '¿Hacen lo mismo?', en: 'Do they do the same thing?' },
        valores: [
          { es: 'No: cada comando es una acción distinta.', en: 'No: each command is a different action.' },
          { es: 'Sí: todas las estrategias logran el mismo resultado de otra forma.', en: 'Yes: all strategies achieve the same result in a different way.' },
        ],
      },
      {
        aspecto: { es: 'Qué permite', en: 'What it enables' },
        valores: [
          { es: 'Historial, deshacer, colas, reintentos, ejecución diferida.', en: 'History, undo, queues, retries, deferred execution.' },
          { es: 'Cambiar el algoritmo sin tocar a quien lo usa.', en: 'Swapping the algorithm without touching whoever uses it.' },
        ],
      },
    ],
    soluciones: [
      {
        patron: 'command',
        explicacion: {
          es: 'Cada edición es un objeto con todo lo necesario para aplicarse y revertirse. El editor solo guarda la pila de comandos.',
          en: 'Each edit is an object with everything it needs to be applied and reverted. The editor only keeps the stack of commands.',
        },
        codigo: `interface Edicion {
  aplicar(): void;
  deshacer(): void;
}

class Rotar implements Edicion {
  constructor(private readonly imagen: Imagen, private readonly grados: number) {}
  aplicar() { this.imagen.rotar(this.grados); }
  deshacer() { this.imagen.rotar(-this.grados); }
}

class EditorImagen {
  private historial: Edicion[] = [];

  ejecutar(edicion: Edicion) {
    edicion.aplicar();
    this.historial.push(edicion);
  }

  deshacer() {
    this.historial.pop()?.deshacer();
  }
}`,
      },
      {
        patron: 'strategy',
        explicacion: {
          es: 'Comprimir siempre produce el mismo resultado (un archivo listo para publicar); solo cambia el algoritmo. No hay nada que deshacer ni encolar.',
          en: 'Compressing always produces the same result (a file ready to publish); only the algorithm changes. There is nothing to undo or queue.',
        },
        codigo: `interface Compresor {
  comprimir(imagen: Imagen): Uint8Array;
}

const webp: Compresor = { comprimir: (img) => codificarWebp(img, { calidad: 80 }) };
const avif: Compresor = { comprimir: (img) => codificarAvif(img, { calidad: 60 }) };

function publicar(imagen: Imagen, compresor: Compresor) {
  return subirACdn(compresor.comprimir(imagen)); // no sabe qué formato usa
}

publicar(foto, navegadorSoportaAvif ? avif : webp);`,
      },
    ],
    pregunta: {
      es: '¿Necesitas tratar la acción como un dato (guardarla, deshacerla, encolarla) — Command — o elegir entre varias maneras de hacer la misma tarea — Strategy?',
      en: 'Do you need to treat the action as data (store it, undo it, queue it) — Command — or choose between several ways of doing the same task — Strategy?',
    },
  },
  {
    id: 'template-method-strategy',
    patrones: ['template-method', 'strategy'],
    idea: {
      es: 'Los dos permiten variar partes de un algoritmo. Template Method lo hace con herencia (la subclase completa pasos); Strategy con composición (se le pasa un objeto).',
      en: 'Both let you vary parts of an algorithm. Template Method does it with inheritance (the subclass fills in steps); Strategy does it with composition (an object is passed in).',
    },
    caso: {
      es: 'Un sistema importa listas de precios de proveedores. Todas las importaciones siguen los mismos pasos (leer, validar, guardar y avisar), pero cada proveedor envía un formato distinto: CSV, Excel o JSON.',
      en: 'A system imports price lists from suppliers. Every import follows the same steps (read, validate, save and notify), but each supplier sends a different format: CSV, Excel or JSON.',
    },
    filas: [
      {
        aspecto: { es: 'Mecanismo', en: 'Mechanism' },
        valores: [
          { es: 'Herencia: la base fija el orden y la subclase completa pasos.', en: 'Inheritance: the base fixes the order and the subclass fills in steps.' },
          { es: 'Composición: el contexto recibe el algoritmo como objeto.', en: 'Composition: the context receives the algorithm as an object.' },
        ],
      },
      {
        aspecto: { es: 'Cuándo se decide', en: 'When it is decided' },
        valores: [
          { es: 'Al compilar: al elegir la subclase.', en: 'At compile time: when picking the subclass.' },
          { es: 'En tiempo de ejecución, y se puede cambiar.', en: 'At runtime, and it can change.' },
        ],
      },
      {
        aspecto: { es: 'Qué tanto varía', en: 'How much varies' },
        valores: [
          { es: 'Algunos pasos de un proceso fijo.', en: 'Some steps of a fixed process.' },
          { es: 'El algoritmo entero de una tarea.', en: 'The whole algorithm for a task.' },
        ],
      },
    ],
    soluciones: [
      {
        patron: 'template-method',
        explicacion: {
          es: 'La clase base define el proceso completo y nadie puede cambiar su orden. Cada proveedor solo implementa cómo se leen las filas.',
          en: 'The base class defines the whole process and nobody can change its order. Each supplier only implements how rows are read.',
        },
        codigo: `abstract class ImportacionPrecios {
  // Método plantilla: el orden de los pasos no cambia
  importar(archivo: Uint8Array) {
    const filas = this.leerFilas(archivo);
    const validas = filas.filter((f) => f.precio > 0);
    guardarPrecios(validas);
    avisarCompras(validas.length);
  }

  protected abstract leerFilas(archivo: Uint8Array): FilaPrecio[];
}

class ImportacionCsv extends ImportacionPrecios {
  protected leerFilas(archivo: Uint8Array) { return leerCsv(archivo); }
}`,
      },
      {
        patron: 'strategy',
        explicacion: {
          es: 'Con Strategy, el lector es una pieza que se pasa al importador. Se puede elegir en tiempo de ejecución, por ejemplo según la extensión del archivo subido.',
          en: 'With Strategy, the reader is a piece passed to the importer. It can be chosen at runtime, for example based on the extension of the uploaded file.',
        },
        codigo: `type LectorPrecios = (archivo: Uint8Array) => FilaPrecio[];

const lectores: Record<string, LectorPrecios> = { csv: leerCsv, xlsx: leerExcel, json: leerJson };

function importar(archivo: Uint8Array, leer: LectorPrecios) {
  const validas = leer(archivo).filter((f) => f.precio > 0);
  guardarPrecios(validas);
  avisarCompras(validas.length);
}

importar(archivo, lectores[extension]); // se decide al subir el archivo`,
      },
    ],
    pregunta: {
      es: '¿Hay un proceso fijo donde solo cambian algunos pasos y te sirve la herencia (Template Method), o prefieres pasar el algoritmo como pieza y poder cambiarlo en ejecución (Strategy)?',
      en: 'Is there a fixed process where only some steps change and inheritance works for you (Template Method), or would you rather pass the algorithm in as a piece and be able to swap it at runtime (Strategy)?',
    },
  },
];
