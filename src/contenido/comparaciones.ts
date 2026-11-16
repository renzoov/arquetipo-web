// Contenido de la página "Patrones que se confunden": pares de patrones con estructura parecida
// y propósito distinto. Cada comparación usa un mismo caso resuelto con cada patrón.

interface Solucion {
  patron: string;
  explicacion: string;
  codigo: string;
}

interface Comparacion {
  id: string;
  /** Slugs de los patrones comparados, en el orden de las columnas. */
  patrones: string[];
  idea: string;
  caso: string;
  filas: { aspecto: string; valores: string[] }[];
  soluciones: Solucion[];
  pregunta: string;
}

export const ENCABEZADO = {
  titulo: 'Patrones que se confunden',
  intro: 'Muchos patrones tienen diagramas casi iguales: una interfaz, una clase que delega en otra, varias implementaciones. Lo que los distingue no es la forma, sino el problema que resuelven. Aquí tienes los pares que más se confunden, con sus diferencias en una tabla y un mismo caso resuelto con cada uno.',
  descripcion: 'Strategy vs State, Decorator vs Proxy vs Adapter, Facade vs Mediator, Factory Method vs Abstract Factory, Command vs Strategy y Template Method vs Strategy: diferencias y un mismo caso resuelto de cada forma.',
  elCaso: 'El caso',
  diferencias: 'Diferencias clave',
  aspecto: 'Aspecto',
  resuelto: 'Resuelto con',
  pregunta: 'La pregunta para decidir',
};

export const COMPARACIONES: Comparacion[] = [
  {
    id: 'strategy-state',
    patrones: ['strategy', 'state'],
    idea: 'Los dos delegan en un objeto intercambiable. En Strategy lo elige quien usa el objeto; en State el objeto cambia solo según lo que le pasa.',
    caso: 'Un estacionamiento emite un ticket a cada auto que entra. Hay dos cosas que varían: la tarifa (por hora, plana de día completo o de abonado) y la etapa del ticket (abierto, pagado o cerrado). Son dos problemas distintos dentro del mismo objeto.',
    filas: [
      {
        aspecto: 'Quién elige el objeto auxiliar',
        valores: [
          'El cliente, desde fuera (al crear el ticket se elige la tarifa).',
          'El propio objeto o sus estados, a medida que ocurren eventos.',
        ],
      },
      {
        aspecto: '¿Se conocen entre sí?',
        valores: [
          'No: cada estrategia es independiente.',
          'Sí: cada estado sabe a qué estado pasar después.',
        ],
      },
      {
        aspecto: 'Qué representan',
        valores: [
          'Formas distintas de hacer lo mismo (calcular el monto).',
          'Etapas de un ciclo de vida, cada una con reglas propias.',
        ],
      },
      {
        aspecto: 'Cuándo cambia',
        valores: [
          'Rara vez; normalmente una vez por objeto.',
          'Constantemente, como parte del flujo normal.',
        ],
      },
    ],
    soluciones: [
      {
        patron: 'strategy',
        explicacion: 'La tarifa se elige al entrar y no cambia: es una estrategia. El ticket no sabe cuál le tocó, solo le pide el monto.',
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
        explicacion: 'La etapa sí cambia sola: al pagar, el ticket pasa a "pagado"; al salir, a "cerrado". Cada estado decide qué se permite y cuál es el siguiente.',
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
    pregunta: '¿El objeto auxiliar lo elige alguien de fuera y casi no cambia (Strategy), o cambia por sí solo a medida que el objeto avanza por su ciclo de vida (State)?',
  },
  {
    id: 'decorator-proxy-adapter',
    patrones: ['decorator', 'proxy', 'adapter'],
    idea: 'Los tres envuelven a otro objeto. Adapter cambia la interfaz, Decorator añade comportamiento con la misma interfaz y Proxy controla el acceso al objeto real.',
    caso: 'Una tienda online cotiza sus envíos con una empresa de mensajería externa. Su SDK trabaja en gramos y dólares, cada consulta tarda y cuesta dinero, y el negocio quiere sumar recargos (combustible, seguro) según la campaña.',
    filas: [
      {
        aspecto: 'Interfaz que ofrece',
        valores: [
          'La misma que el objeto envuelto.',
          'La misma que el objeto real.',
          'Una distinta: la que espera tu código.',
        ],
      },
      {
        aspecto: 'Para qué sirve',
        valores: [
          'Añadir responsabilidades.',
          'Controlar el acceso: caché, permisos, carga diferida.',
          'Hacer compatible algo que no lo es.',
        ],
      },
      {
        aspecto: 'Quién lo arma',
        valores: [
          'El cliente, combinando capas a su gusto.',
          'Normalmente el propio proxy o la configuración; el cliente no lo nota.',
          'La capa de integración con el tercero.',
        ],
      },
      {
        aspecto: '¿Se apilan?',
        valores: [
          'Sí, es su gracia: varias capas una sobre otra.',
          'Es posible, pero no es lo habitual.',
          'No: envuelve un objeto para traducirlo.',
        ],
      },
    ],
    soluciones: [
      {
        patron: 'adapter',
        explicacion: 'El SDK habla en gramos y dólares; tu tienda, en kilos y soles. El adaptador traduce para que el resto del código use tu propia interfaz.',
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
        explicacion: 'Los recargos son capas que el negocio combina según la campaña. Cada una tiene la misma interfaz y se suma sobre la anterior.',
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
        explicacion: 'Cada consulta cuesta dinero. El proxy guarda en caché las cotizaciones repetidas; quien lo usa no sabe que existe.',
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
    pregunta: '¿Necesitas otra interfaz (Adapter), más comportamiento con la misma interfaz (Decorator) o controlar cuándo y cómo se llega al objeto real (Proxy)?',
  },
  {
    id: 'facade-mediator',
    patrones: ['facade', 'mediator'],
    idea: 'Los dos ponen un objeto en medio de muchos otros. Facade simplifica el uso de un subsistema que no la conoce; Mediator coordina a componentes que solo hablan con él.',
    caso: 'Recursos humanos da de alta a una persona nueva. En el servidor hay que tocar planilla, accesos, correo corporativo y equipos. En la pantalla, el formulario tiene campos que dependen unos de otros: el área limita los cargos y el cargo fija el rango de sueldo.',
    filas: [
      {
        aspecto: 'Dirección de la comunicación',
        valores: [
          'De una sola vía: el cliente usa la fachada y la fachada usa el subsistema.',
          'En las dos vías: los componentes avisan al mediador y el mediador les responde.',
        ],
      },
      {
        aspecto: '¿Las piezas lo conocen?',
        valores: [
          'No: el subsistema funciona igual sin la fachada.',
          'Sí: cada componente solo conoce al mediador.',
        ],
      },
      {
        aspecto: '¿Añade comportamiento?',
        valores: [
          'No, ofrece un atajo a lo que ya existe.',
          'Sí: contiene las reglas de colaboración.',
        ],
      },
    ],
    soluciones: [
      {
        patron: 'facade',
        explicacion: 'En el servidor, una fachada ofrece una sola operación de alta. Los servicios de planilla o accesos no saben que existe y se pueden seguir usando por separado.',
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
        explicacion: 'En la pantalla, los campos no se llaman entre sí: avisan al mediador cuando cambian, y él decide qué actualizar.',
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
    pregunta: '¿Quieres esconder la complejidad de un subsistema detrás de una entrada simple (Facade), o coordinar a varias piezas que hoy se llaman entre sí (Mediator)?',
  },
  {
    id: 'factory-method-abstract-factory',
    patrones: ['factory-method', 'abstract-factory'],
    idea: 'Los dos ocultan qué clase concreta se crea. Factory Method crea un producto y la variación está en una subclase; Abstract Factory crea una familia de productos que deben combinar entre sí.',
    caso: 'Una distribuidora vende en Perú y en Chile. Cada país tiene su formato de factura electrónica, pero además su guía de despacho y su nota de crédito, y los tres documentos de una venta deben ser del mismo país.',
    filas: [
      {
        aspecto: 'Cuántos productos crea',
        valores: [
          'Uno.',
          'Varios, relacionados entre sí.',
        ],
      },
      {
        aspecto: 'Cómo varía',
        valores: [
          'Herencia: una subclase sobrescribe el método de creación.',
          'Composición: el cliente recibe un objeto fábrica completo.',
        ],
      },
      {
        aspecto: 'Qué garantiza',
        valores: [
          'Que el proceso no dependa de la clase concreta.',
          'Además, que no se mezclen productos de familias distintas.',
        ],
      },
    ],
    soluciones: [
      {
        patron: 'factory-method',
        explicacion: 'Si solo variara la factura, basta un método fábrica: el proceso de venta es el mismo y cada subclase crea la factura de su país.',
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
        explicacion: 'Como son tres documentos que deben ser del mismo país, conviene una fábrica por país que cree la familia completa. Es imposible mezclar una factura peruana con una guía chilena.',
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
    pregunta: '¿Varía un solo objeto (Factory Method), o varios objetos que siempre tienen que ir juntos (Abstract Factory)?',
  },
  {
    id: 'command-strategy',
    patrones: ['command', 'strategy'],
    idea: 'Los dos convierten un comportamiento en un objeto. Strategy son formas distintas de hacer lo mismo; Command son acciones distintas que se pueden guardar, encolar o deshacer.',
    caso: 'Un panel de e-commerce procesa las fotos de los productos. Por un lado, la imagen final se puede comprimir en WebP, AVIF o JPEG. Por otro, el usuario aplica ediciones (recortar, rotar, poner marca de agua) y quiere poder deshacerlas.',
    filas: [
      {
        aspecto: 'Qué representa el objeto',
        valores: [
          'Una solicitud: qué hacer, sobre qué y con qué datos.',
          'Un algoritmo: cómo hacer una tarea concreta.',
        ],
      },
      {
        aspecto: '¿Hacen lo mismo?',
        valores: [
          'No: cada comando es una acción distinta.',
          'Sí: todas las estrategias logran el mismo resultado de otra forma.',
        ],
      },
      {
        aspecto: 'Qué permite',
        valores: [
          'Historial, deshacer, colas, reintentos, ejecución diferida.',
          'Cambiar el algoritmo sin tocar a quien lo usa.',
        ],
      },
    ],
    soluciones: [
      {
        patron: 'command',
        explicacion: 'Cada edición es un objeto con todo lo necesario para aplicarse y revertirse. El editor solo guarda la pila de comandos.',
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
        explicacion: 'Comprimir siempre produce el mismo resultado (un archivo listo para publicar); solo cambia el algoritmo. No hay nada que deshacer ni encolar.',
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
    pregunta: '¿Necesitas tratar la acción como un dato (guardarla, deshacerla, encolarla) — Command — o elegir entre varias maneras de hacer la misma tarea — Strategy?',
  },
  {
    id: 'template-method-strategy',
    patrones: ['template-method', 'strategy'],
    idea: 'Los dos permiten variar partes de un algoritmo. Template Method lo hace con herencia (la subclase completa pasos); Strategy con composición (se le pasa un objeto).',
    caso: 'Un sistema importa listas de precios de proveedores. Todas las importaciones siguen los mismos pasos (leer, validar, guardar y avisar), pero cada proveedor envía un formato distinto: CSV, Excel o JSON.',
    filas: [
      {
        aspecto: 'Mecanismo',
        valores: [
          'Herencia: la base fija el orden y la subclase completa pasos.',
          'Composición: el contexto recibe el algoritmo como objeto.',
        ],
      },
      {
        aspecto: 'Cuándo se decide',
        valores: [
          'Al compilar: al elegir la subclase.',
          'En tiempo de ejecución, y se puede cambiar.',
        ],
      },
      {
        aspecto: 'Qué tanto varía',
        valores: [
          'Algunos pasos de un proceso fijo.',
          'El algoritmo entero de una tarea.',
        ],
      },
    ],
    soluciones: [
      {
        patron: 'template-method',
        explicacion: 'La clase base define el proceso completo y nadie puede cambiar su orden. Cada proveedor solo implementa cómo se leen las filas.',
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
        explicacion: 'Con Strategy, el lector es una pieza que se pasa al importador. Se puede elegir en tiempo de ejecución, por ejemplo según la extensión del archivo subido.',
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
    pregunta: '¿Hay un proceso fijo donde solo cambian algunos pasos y te sirve la herencia (Template Method), o prefieres pasar el algoritmo como pieza y poder cambiarlo en ejecución (Strategy)?',
  },
];
