// Contenido de la página "Antipatrones y code smells": soluciones que parecen razonables al principio
// y se vuelven un problema, con el principio o patrón que las corrige.
import type { Texto } from '../i18n/idiomas.ts';

export interface Principio {
  nombre: Texto;
  /** Ruta base (sin idioma) de la página que lo explica. */
  href: string;
}

export interface Antipatron {
  id: string;
  icono: string;
  nombre: Texto;
  /** Otros nombres con los que se conoce. */
  alias: string;
  sintoma: Texto;
  porQueDuele: Texto;
  correccion: Texto;
  antes: string;
  despues: string;
  principios: Principio[];
  patrones: string[];
}

export const ENCABEZADO = {
  titulo: { es: 'Antipatrones y code smells', en: 'Anti-patterns and code smells' },
  intro: {
    es: 'Un antipatrón es una solución que parece razonable al principio pero que, con el tiempo, cuesta más de lo que aporta. Un "code smell" es la señal en el código que te avisa de que algo así está pasando. Reconocerlos a tiempo es la mejor forma de saber cuándo aplicar un principio o un patrón.',
    en: 'An anti-pattern is a solution that looks reasonable at first but, over time, costs more than it gives. A "code smell" is the sign in the code that warns you that something like this is happening. Spotting them early is the best way to know when to apply a principle or a pattern.',
  },
  descripcion: {
    es: 'Objeto dios, condicionales que crecen, Singleton como variable global, explosión de subclases, herencia rechazada, obsesión por primitivos, cirugía de escopeta y patronitis: cómo reconocerlos y cómo corregirlos.',
    en: 'God object, growing conditionals, Singleton as a global variable, subclass explosion, refused bequest, primitive obsession, shotgun surgery and patternitis: how to spot them and how to fix them.',
  },
  tambienLlamado: { es: 'También llamado', en: 'Also known as' },
  sintoma: { es: 'Cómo reconocerlo', en: 'How to spot it' },
  porQueDuele: { es: 'Por qué duele', en: 'Why it hurts' },
  correccion: { es: 'Cómo corregirlo', en: 'How to fix it' },
  antes: { es: 'Antes: con el problema', en: 'Before: with the problem' },
  despues: { es: 'Después: corregido', en: 'After: fixed' },
  loCorrigen: { es: 'Lo corrigen', en: 'Fixed by' },
} satisfies Record<string, Texto>;

const SRP: Principio = { nombre: { es: 'Responsabilidad única', en: 'Single responsibility' }, href: '/principios/solid#srp' };
const OCP: Principio = { nombre: { es: 'Abierto/Cerrado', en: 'Open/Closed' }, href: '/principios/solid#ocp' };
const LSP: Principio = { nombre: { es: 'Sustitución de Liskov', en: 'Liskov substitution' }, href: '/principios/solid#lsp' };
const DIP: Principio = { nombre: { es: 'Inversión de dependencias', en: 'Dependency inversion' }, href: '/principios/solid#dip' };
const ENCAPSULAR: Principio = { nombre: { es: 'Encapsula lo que varía', en: 'Encapsulate what varies' }, href: '/principios/diseno#encapsular' };
const COMPOSICION: Principio = { nombre: { es: 'Composición sobre herencia', en: 'Composition over inheritance' }, href: '/principios/diseno#composicion' };
const ENCAPSULAMIENTO: Principio = { nombre: { es: 'Encapsulamiento', en: 'Encapsulation' }, href: '/fundamentos/poo#encapsulamiento' };
const POLIMORFISMO: Principio = { nombre: { es: 'Polimorfismo', en: 'Polymorphism' }, href: '/fundamentos/poo#polimorfismo' };
const CUANDO_NO: Principio = { nombre: { es: '"Cuándo no usarlo" de cada patrón', en: 'Each pattern\'s "when not to use it"' }, href: '/#patrones' };

export const ANTIPATRONES: Antipatron[] = [
  {
    id: 'objeto-dios', icono: 'crown',
    nombre: { es: 'Objeto dios', en: 'God object' },
    alias: 'God Object · God Class · Blob',
    sintoma: {
      es: 'Una clase con cientos de líneas y decenas de métodos que no tienen relación entre sí: GestorTienda crea pedidos, calcula impuestos, envía correos y exporta reportes. Casi todos los cambios del sistema pasan por ese archivo.',
      en: 'A class with hundreds of lines and dozens of unrelated methods: GestorTienda creates orders, calculates taxes, sends emails and exports reports. Almost every change in the system goes through that file.',
    },
    porQueDuele: {
      es: 'Varios equipos la modifican a la vez, cada cambio puede romper algo que no tiene nada que ver y es imposible probarla por partes. Además, todo el sistema depende de ella.',
      en: 'Several teams edit it at the same time, every change can break something unrelated and it cannot be tested piece by piece. On top of that, the whole system depends on it.',
    },
    correccion: {
      es: 'Agrupa los métodos según el motivo por el que cambian y llévalos a clases propias. Si muchos lugares usaban la clase grande como punto de entrada, una fachada pequeña puede mantener esa comodidad sin concentrar la lógica.',
      en: 'Group the methods by the reason they change and move them to their own classes. If many places used the big class as an entry point, a small facade can keep that convenience without piling up the logic.',
    },
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
    nombre: { es: 'El condicional que no para de crecer', en: 'The conditional that keeps growing' },
    alias: 'Switch statements · Type code',
    sintoma: {
      es: 'Un switch o una cadena de if/else que pregunta por el tipo de algo ("si es tarjeta…, si es billetera…") y se repite en varios lugares. Cada caso nuevo obliga a buscar y modificar todos esos switch.',
      en: 'A switch or a chain of if/else that asks about the type of something ("if it is a card…, if it is a wallet…") and is repeated in several places. Every new case forces you to find and change all those switches.',
    },
    porQueDuele: {
      es: 'Es fácil olvidar uno de los switch al agregar un caso, y el código que ya funcionaba se vuelve a tocar en cada cambio. Las funciones crecen sin límite.',
      en: 'It is easy to forget one of the switches when adding a case, and code that already worked gets touched again with every change. The functions grow without limit.',
    },
    correccion: {
      es: 'Convierte cada caso en una clase (o función) que cumple una misma interfaz y deja que el polimorfismo elija. Si el caso es un algoritmo, es Strategy; si es una etapa que cambia sola, es State.',
      en: 'Turn each case into a class (or function) that follows the same interface and let polymorphism do the choosing. If the case is an algorithm, it is Strategy; if it is a stage that changes by itself, it is State.',
    },
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
    nombre: { es: 'Singleton como variable global', en: 'Singleton as a global variable' },
    alias: 'Singletonitis · Global state',
    sintoma: {
      es: 'Clases que llaman a Algo.instancia() desde cualquier parte del código para leer o cambiar datos. Las pruebas fallan o pasan según el orden en que se ejecutan.',
      en: 'Classes that call Something.instance() from anywhere in the code to read or change data. Tests pass or fail depending on the order in which they run.',
    },
    porQueDuele: {
      es: 'Las dependencias quedan ocultas: mirando la firma de una clase no sabes que usa la configuración o la caché. El estado compartido cambia sin aviso y no se puede reemplazar por un doble en las pruebas.',
      en: 'Dependencies become hidden: looking at a class signature you cannot tell that it uses the configuration or the cache. Shared state changes without warning and cannot be replaced with a test double.',
    },
    correccion: {
      es: 'Crea la instancia única una sola vez al arrancar la aplicación y pásala por el constructor a quien la necesite. Sigue habiendo una sola instancia, pero ahora la dependencia es visible y reemplazable.',
      en: 'Create the single instance once when the application starts and pass it through the constructor to whoever needs it. There is still only one instance, but now the dependency is visible and replaceable.',
    },
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
    nombre: { es: 'Explosión de subclases', en: 'Subclass explosion' },
    alias: 'Combinatorial explosion · Deep hierarchy',
    sintoma: {
      es: 'Una jerarquía con clases que combinan opciones independientes: NotificacionCorreoUrgente, NotificacionSmsUrgente, NotificacionCorreoUrgenteConCopia… Cada opción nueva multiplica el número de clases.',
      en: 'A hierarchy whose classes combine independent options: NotificacionCorreoUrgente, NotificacionSmsUrgente, NotificacionCorreoUrgenteConCopia… Every new option multiplies the number of classes.',
    },
    porQueDuele: {
      es: 'Con 3 canales y 3 opciones ya son 9 clases o más, casi todas con código repetido. Un cambio en la clase base afecta a toda la jerarquía.',
      en: 'With 3 channels and 3 options you already have 9 classes or more, almost all of them with repeated code. A change in the base class affects the whole hierarchy.',
    },
    correccion: {
      es: 'Separa cada dimensión independiente y combínalas por composición: el canal como una pieza y cada opción como una capa que envuelve al canal.',
      en: 'Separate each independent dimension and combine them through composition: the channel as one piece and each option as a layer that wraps the channel.',
    },
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
    nombre: { es: 'Herencia rechazada', en: 'Refused bequest' },
    alias: 'Refused Bequest',
    sintoma: {
      es: 'Una subclase hereda métodos que no le sirven y los sobrescribe para lanzar un error o no hacer nada. El código que usa la clase base tiene que preguntar por el tipo antes de llamarlos.',
      en: 'A subclass inherits methods it has no use for and overrides them to throw an error or do nothing. The code that uses the base class has to check the type before calling them.',
    },
    porQueDuele: {
      es: 'La subclase no se puede usar donde se espera la base: rompe el contrato y los errores aparecen en producción, lejos del lugar donde está el problema.',
      en: 'The subclass cannot be used where the base is expected: it breaks the contract, and the errors show up in production, far from where the problem actually is.',
    },
    correccion: {
      es: 'Si la subclase no puede cumplir todo lo que promete la base, no debería heredar de ella. Divide la base en interfaces más pequeñas y que cada clase implemente solo las que puede cumplir.',
      en: 'If the subclass cannot do everything the base promises, it should not inherit from it. Split the base into smaller interfaces and let each class implement only the ones it can honor.',
    },
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
    nombre: { es: 'Obsesión por los tipos primitivos', en: 'Primitive obsession' },
    alias: 'Primitive Obsession',
    sintoma: {
      es: 'Montos como number, monedas como string, correos y documentos como string sueltos. Las mismas validaciones ("¿es un correo válido?", "¿son de la misma moneda?") se repiten por todo el código.',
      en: 'Amounts as number, currencies as string, emails and IDs as loose strings. The same checks ("is this a valid email?", "are these the same currency?") are repeated all over the code.',
    },
    porQueDuele: {
      es: 'Nada impide sumar soles con dólares o pasar un número de documento donde iba un teléfono. Las reglas del dominio quedan desperdigadas y cada lugar las aplica a su manera.',
      en: 'Nothing stops you from adding soles to dollars or passing an ID number where a phone number was expected. The domain rules end up scattered, and each place applies them its own way.',
    },
    correccion: {
      es: 'Crea objetos pequeños (objetos valor) que encapsulen el dato y sus reglas: un Dinero que no permite mezclar monedas, un Correo que solo existe si es válido.',
      en: 'Create small objects (value objects) that encapsulate the data and its rules: a Dinero that does not allow mixing currencies, a Correo that only exists if it is valid.',
    },
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
    nombre: { es: 'Cirugía de escopeta', en: 'Shotgun surgery' },
    alias: 'Shotgun Surgery',
    sintoma: {
      es: 'Un cambio pequeño del negocio ("ahora el IGV se calcula distinto para exportaciones") obliga a tocar muchos archivos distintos: el carrito, la factura, el reporte, la API móvil…',
      en: 'A small business change ("export sales now calculate VAT differently") forces you to edit many different files: the cart, the invoice, the report, the mobile API…',
    },
    porQueDuele: {
      es: 'La misma regla está copiada en varios lugares y es fácil olvidar uno. El sistema termina mostrando montos distintos en pantallas distintas.',
      en: 'The same rule is copied in several places and it is easy to forget one. The system ends up showing different amounts on different screens.',
    },
    correccion: {
      es: 'Identifica la regla que cambia y dale un único lugar. Todos los que la necesitan la usan desde ahí, así un cambio se hace una sola vez.',
      en: 'Find the rule that changes and give it a single home. Everyone who needs it uses it from there, so a change is made only once.',
    },
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
    nombre: { es: 'Patronitis', en: 'Patternitis' },
    alias: 'Over-engineering · Speculative generality',
    sintoma: {
      es: 'Interfaces con una sola implementación "por si acaso", fábricas que crean un único tipo, capas que solo pasan la llamada a la siguiente. Entender un flujo simple obliga a abrir diez archivos.',
      en: 'Interfaces with a single implementation "just in case", factories that create a single type, layers that only pass the call on to the next one. Understanding a simple flow means opening ten files.',
    },
    porQueDuele: {
      es: 'Cada patrón añade clases e indirección. Si no resuelve un problema real, solo agrega costo: más código que leer, mantener y probar, a cambio de una flexibilidad que nadie usa.',
      en: 'Every pattern adds classes and indirection. If it does not solve a real problem, it only adds cost: more code to read, maintain and test, in exchange for flexibility nobody uses.',
    },
    correccion: {
      es: 'Empieza por lo simple y aplica un patrón cuando aparece el problema que resuelve: el segundo caso, el switch que se repite, la prueba que no puedes escribir. Refactorizar hacia un patrón a tiempo es mejor que diseñar para necesidades imaginarias.',
      en: 'Start simple and apply a pattern when the problem it solves shows up: the second case, the repeated switch, the test you cannot write. Refactoring toward a pattern at the right time beats designing for imaginary needs.',
    },
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
