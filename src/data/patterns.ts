// Contenido de los 23 patrones de diseño clásicos.
// Los casos y el código son ejemplos propios, pensados para situaciones reales de trabajo.

export type Categoria = 'creacionales' | 'estructurales' | 'comportamiento';

export interface PatternData {
  slug: string;
  category: Categoria;
  categoryLabel: string;
  name: string;
  aka: string;
  purpose: string;
  /** El problema que resuelve, dicho como lo diría quien lo sufre. */
  problema: string;
  order: number;
  frecuenciaUso: 'Muy alta' | 'Alta' | 'Media' | 'Baja';
  complejidad: 'Baja' | 'Media' | 'Alta';
  historiaReal: string;
  dolorIngenuo: string;
  solucionPatron: string;
  codigoProblematico: string;
  codigoSolucion: string;
  /** Matiz teórico que suele confundirse. */
  nota?: string;
  principiosClave: string[];
  cuandoUsarlo: string[];
  cuandoNoUsarlo: string[];
  relaciones: string[];
}

/** Quita el salto de línea inicial y los espacios finales de un bloque de código. */
const t = (s: string) => s.replace(/^\n/, '').trimEnd();

const CREACIONALES = { category: 'creacionales', categoryLabel: 'Patrones creacionales' } as const;
const ESTRUCTURALES = { category: 'estructurales', categoryLabel: 'Patrones estructurales' } as const;
const COMPORTAMIENTO = { category: 'comportamiento', categoryLabel: 'Patrones de comportamiento' } as const;

export const PATTERNS: PatternData[] = [
  // ───────────────────────────── CREACIONALES ─────────────────────────────
  {
    ...CREACIONALES,
    slug: 'factory-method',
    name: 'Factory Method',
    aka: 'Método fábrica · Constructor virtual',
    purpose: 'Define un método para crear un objeto, pero deja que las subclases decidan qué clase concreta instanciar.',
    problema: 'Tengo un switch que decide qué clase crear y crece con cada tipo nuevo.',
    order: 1,
    frecuenciaUso: 'Muy alta',
    complejidad: 'Baja',
    historiaReal: 'Tu fintech concilia los movimientos bancarios de sus clientes con sus ventas. Cada banco entrega el extracto en su propio formato: uno envía un CSV separado por punto y coma, otro un TXT de ancho fijo y otro expone una API JSON. El proceso de conciliación (leer los movimientos, cruzarlos con las ventas y marcar diferencias) es siempre el mismo; lo único que cambia es cómo se lee el extracto.',
    dolorIngenuo: 'El servicio de conciliación tiene un switch(banco) que crea el lector correcto, y ese mismo switch aparece en el proceso nocturno, en la carga manual de archivos y en las pruebas. Sumar un banco obliga a modificar todos esos lugares y es fácil olvidar uno.',
    solucionPatron: 'La clase base Conciliador define el proceso y delega la creación del lector en un método fábrica abstracto, crearLector(). Cada subclase (ConciliadorBancoAndino, ConciliadorBancoPacifico) decide qué lector concreto crear. Sumar un banco es sumar una subclase, sin tocar el proceso.',
    codigoProblematico: t(`
class ServicioConciliacion {
  conciliar(banco: string, archivo: string) {
    let lector: LectorExtracto;
    switch (banco) {
      case 'andino':   lector = new LectorCsvAndino(); break;
      case 'pacifico': lector = new LectorTxtPacifico(); break;
      default: throw new Error('Banco no soportado: ' + banco);
    }
    const movimientos = lector.leer(archivo);
    // ...cruzar con ventas y reportar diferencias
  }
}`),
    codigoSolucion: t(`
abstract class Conciliador {
  // Método fábrica: cada subclase decide qué lector crear
  protected abstract crearLector(): LectorExtracto;

  conciliar(archivo: string): Diferencia[] {
    const movimientos = this.crearLector().leer(archivo);
    return cruzarConVentas(movimientos);
  }
}

class ConciliadorBancoAndino extends Conciliador {
  protected crearLector() { return new LectorCsvAndino(); }
}

class ConciliadorBancoPacifico extends Conciliador {
  protected crearLector() { return new LectorTxtPacifico(); }
}`),
    nota: 'En el código actual es muy común reemplazar la herencia por inyección: se pasa al constructor una fábrica o una función que crea el lector. La idea es la misma: el proceso no decide qué clase concreta se instancia. Además, el método fábrica no está obligado a crear siempre un objeto nuevo: puede devolver uno que ya existe (de una caché o de un pool) y quien lo llama no nota la diferencia.',
    principiosClave: [
      'Abierto/Cerrado: un banco nuevo es una subclase nueva, no un case más.',
      'Inversión de dependencias: el proceso depende de la interfaz LectorExtracto, no de los lectores concretos.',
    ],
    cuandoUsarlo: [
      'Una clase tiene un proceso estable, pero el objeto concreto con el que trabaja varía según el caso.',
      'Quieres que quien extienda tu código (subclases, plugins) decida qué objeto se crea.',
      'Quieres reutilizar objetos costosos (lectores ya configurados, conexiones) en lugar de crearlos cada vez: el método fábrica puede devolver uno existente.',
    ],
    cuandoNoUsarlo: [
      'Solo hay un tipo concreto y no se prevé otro: un new directo es más claro.',
      'Si la variación no justifica una jerarquía de clases, basta con inyectar el objeto o una función que lo cree.',
      'Cada producto nuevo exige también un creador nuevo: con muchos productos, la jerarquía crece más de lo que aporta.',
    ],
    relaciones: [
      'Abstract Factory: suele implementarse con varios métodos fábrica, uno por producto.',
      'Template Method: el método fábrica suele ser uno de los pasos que la subclase completa.',
      'Prototype: alternativa que crea objetos clonando en vez de usar subclases.',
    ],
  },
  {
    ...CREACIONALES,
    slug: 'abstract-factory',
    name: 'Abstract Factory',
    aka: 'Fábrica abstracta · Kit',
    purpose: 'Ofrece una interfaz para crear familias de objetos relacionados sin especificar sus clases concretas.',
    problema: 'Necesito crear varios objetos que deben combinar entre sí (misma familia).',
    order: 2,
    frecuenciaUso: 'Alta',
    complejidad: 'Media',
    historiaReal: 'Tu producto SaaS se vende en la nube y también instalado en el centro de datos del cliente (on-premise). En la nube usas almacenamiento de objetos, una cola gestionada y un gestor de secretos; on-premise usas un disco en red, RabbitMQ y Vault. Lo crítico es que los tres servicios de un mismo entorno vayan juntos: mezclar la cola de la nube con el almacenamiento local rompe permisos y redes.',
    dolorIngenuo: 'Cada módulo crea sus servicios con if (entorno === "nube"). Basta con que alguien olvide un if para que en producción convivan piezas de entornos distintos, y el error solo aparece en la instalación del cliente.',
    solucionPatron: 'Una fábrica abstracta, Infraestructura, declara crearAlmacenamiento(), crearCola() y crearSecretos(). Hay una fábrica concreta por entorno. Al arrancar se elige una sola fábrica, y todo lo que crea pertenece, por construcción, a la misma familia.',
    codigoProblematico: t(`
const almacenamiento = entorno === 'nube' ? new AlmacenamientoNube() : new DiscoEnRed();
const cola = entorno === 'nube' ? new ColaGestionada() : new ColaRabbit();

// En otro archivo, alguien olvidó el if:
const secretos = new SecretosNube(); // ❌ on-premise no tiene este servicio`),
    codigoSolucion: t(`
interface Infraestructura {
  crearAlmacenamiento(): Almacenamiento;
  crearCola(): Cola;
  crearSecretos(): Secretos;
}

class InfraNube implements Infraestructura {
  crearAlmacenamiento() { return new AlmacenamientoNube(); }
  crearCola() { return new ColaGestionada(); }
  crearSecretos() { return new SecretosNube(); }
}

class InfraOnPremise implements Infraestructura {
  crearAlmacenamiento() { return new DiscoEnRed(); }
  crearCola() { return new ColaRabbit(); }
  crearSecretos() { return new SecretosVault(); }
}

// Se elige UNA vez, al arrancar la aplicación
const infra: Infraestructura = entorno === 'nube' ? new InfraNube() : new InfraOnPremise();`),
    principiosClave: [
      'Inversión de dependencias: los módulos usan interfaces (Cola, Almacenamiento), nunca clases de un proveedor.',
      'Consistencia: la fábrica garantiza que los productos de una familia se usan juntos.',
    ],
    cuandoUsarlo: [
      'Debes crear varios objetos que tienen que ser compatibles entre sí.',
      'Tu producto existe en variantes (proveedor, plataforma, tema visual) que cambian varias piezas a la vez.',
    ],
    cuandoNoUsarlo: [
      'Solo creas un tipo de objeto: un Factory Method o una inyección simple es suficiente.',
      'Las familias cambian de productos a menudo: añadir un producto obliga a modificar la interfaz y todas las fábricas.',
      'Solo existe una familia: las interfaces y clases adicionales no se justifican.',
    ],
    relaciones: [
      'Factory Method: cada método de la fábrica abstracta suele ser un método fábrica.',
      'Singleton: normalmente hay una sola fábrica concreta activa en toda la aplicación.',
      'Facade: una fachada puede usar una fábrica abstracta para ocultar cómo se crean los objetos del subsistema.',
      'Bridge: cuando ciertas abstracciones solo funcionan con ciertas implementaciones, una fábrica abstracta puede crear las parejas correctas y ocultar esa regla.',
    ],
  },
  {
    ...CREACIONALES,
    slug: 'builder',
    name: 'Builder',
    aka: 'Constructor paso a paso',
    purpose: 'Separa la construcción de un objeto complejo de su representación, para construirlo paso a paso y validar el resultado antes de entregarlo.',
    problema: 'Mi constructor tiene demasiados parámetros opcionales y nadie sabe en qué orden van.',
    order: 3,
    frecuenciaUso: 'Muy alta',
    complejidad: 'Media',
    historiaReal: 'El buscador de tu marketplace acepta texto, categoría, rango de precios, marcas, "solo con stock", orden y paginación. Casi todo es opcional, pero hay reglas: el precio mínimo no puede superar al máximo y la página empieza en 1. Además, marketing quiere búsquedas predefinidas, como "Ofertas del día" o "Novedades".',
    dolorIngenuo: 'new Busqueda("zapatillas", null, null, 100, null, true, "precio", 2, 20): nadie recuerda qué es cada argumento, se pueden intercambiar valores sin que el compilador lo note y las validaciones quedan repartidas por los controladores.',
    solucionPatron: 'Un BusquedaBuilder recibe los datos paso a paso, con métodos que tienen nombre. Al final, build() valida todas las reglas y entrega un objeto Busqueda inmutable. Las búsquedas predefinidas se escriben como recetas (el Director) que siempre ejecutan los mismos pasos.',
    codigoProblematico: t(`
// ¿Qué es cada null? ¿100 es el precio mínimo o el máximo?
const busqueda = new Busqueda('zapatillas', null, null, 100, null, true, 'precio', 2, 20);`),
    codigoSolucion: t(`
class BusquedaBuilder {
  private filtros: Partial<FiltrosBusqueda> = {};

  texto(t: string) { this.filtros.texto = t; return this; }
  precioEntre(min: number, max: number) { this.filtros.precio = { min, max }; return this; }
  soloConStock() { this.filtros.soloConStock = true; return this; }
  ordenarPor(campo: Orden) { this.filtros.orden = campo; return this; }

  build(): Busqueda {
    const { precio } = this.filtros;
    if (precio && precio.min > precio.max) throw new Error('Rango de precio inválido');
    return new Busqueda({ pagina: 1, ...this.filtros }); // objeto inmutable y válido
  }
}

// Director: recetas que siempre siguen los mismos pasos
const ofertasDelDia = (b: BusquedaBuilder) =>
  b.soloConStock().ordenarPor('descuento').build();`),
    nota: 'Hay dos variantes. El Builder original de GoF separa un Director, que define el orden de los pasos, de varios builders concretos que producen representaciones distintas (por ejemplo, el mismo documento en HTML o en PDF). El builder "fluido", con métodos encadenados, se popularizó después para evitar constructores con demasiados parámetros. El ejemplo combina ambos: un builder fluido y recetas que actúan como Director.',
    principiosClave: [
      'Responsabilidad única: armar y validar el objeto es trabajo del builder, no de los controladores.',
      'Inmutabilidad: el objeto final nace completo y válido.',
    ],
    cuandoUsarlo: [
      'Un objeto tiene muchos parámetros opcionales o combinaciones que validar.',
      'Quieres construir el objeto por etapas (por ejemplo, a medida que se leen los filtros de la URL).',
      'El mismo proceso de construcción debe producir representaciones distintas.',
    ],
    cuandoNoUsarlo: [
      'El objeto tiene pocos campos: un constructor o un objeto de opciones con nombre (new Busqueda({ texto, orden })) es suficiente.',
      'No hay reglas que validar ni pasos que ordenar: el builder solo añade código.',
    ],
    relaciones: [
      'Abstract Factory: entrega objetos terminados en una sola llamada; Builder los arma paso a paso.',
      'Composite: los builders son muy útiles para construir árboles complejos.',
      'Bridge: el Director puede hacer de abstracción y cada builder concreto, de implementación.',
      'Singleton: un Director o un builder compartido puede ser una instancia única.',
    ],
  },
  {
    ...CREACIONALES,
    slug: 'prototype',
    name: 'Prototype',
    aka: 'Prototipo · Clonación',
    purpose: 'Crea objetos nuevos copiando un objeto existente, sin que el código dependa de su clase concreta ni exponga su estado interno.',
    problema: 'Crear el objeto desde cero es caro; prefiero copiar uno ya configurado.',
    order: 4,
    frecuenciaUso: 'Media',
    complejidad: 'Baja',
    historiaReal: 'Una aseguradora vende pólizas a partir de plantillas como "Auto Básico", "Auto Total" u "Hogar Premium". Cada plantilla trae coberturas, deducibles y cláusulas que el área técnica configura con reglas almacenadas en base de datos. El asesor parte de una plantilla y solo ajusta lo propio del cliente: el vehículo, la suma asegurada o un descuento.',
    dolorIngenuo: 'Para crear la póliza, el código copia campo por campo desde la plantilla. Cada vez que el área técnica añade un campo, alguien olvida copiarlo. Peor aún: la lista de coberturas se copia por referencia, así que modificar la póliza de un cliente modifica también la plantilla para todos.',
    solucionPatron: 'Cada póliza sabe clonarse con clonar(). Como el propio objeto tiene acceso a sus campos privados, decide qué copiar en profundidad (las coberturas, que son mutables) y qué puede compartirse (datos inmutables). Un registro de prototipos guarda las plantillas listas para clonar.',
    codigoProblematico: t(`
const poliza = new Poliza();
poliza.producto = plantilla.producto;
poliza.coberturas = plantilla.coberturas; // ❌ misma lista: se comparte la referencia
poliza.deducible = plantilla.deducible;
// ...¿y las cláusulas? alguien las olvidó

poliza.coberturas.push(coberturaExtra);   // 💥 también cambia la plantilla`),
    codigoSolucion: t(`
class Poliza {
  constructor(
    readonly producto: string,
    private coberturas: Cobertura[],
    private readonly clausulas: readonly string[],
  ) {}

  clonar(): Poliza {
    // Copia profunda de lo mutable; lo inmutable se puede compartir
    const coberturas = this.coberturas.map((c) => ({ ...c }));
    return new Poliza(this.producto, coberturas, this.clausulas);
  }

  agregarCobertura(c: Cobertura) { this.coberturas.push(c); }
}

const plantillas = new Map<string, Poliza>(); // registro de prototipos

const poliza = plantillas.get('auto-total')!.clonar();
poliza.agregarCobertura(coberturaExtra); // la plantilla no cambia`),
    nota: 'La clave del patrón es decidir qué se copia en profundidad. Una copia superficial ({ ...obj } u Object.assign) solo copia el primer nivel: las listas y objetos internos siguen compartidos. JavaScript tiene structuredClone(), pero no conserva los métodos ni la clase del objeto; por eso el objeto suele implementar su propio clonar().',
    principiosClave: [
      'Encapsulamiento: el objeto se copia a sí mismo sin exponer sus campos.',
      'Independencia de clases concretas: el cliente clona sin saber qué subclase de póliza tiene.',
    ],
    cuandoUsarlo: [
      'Creas objetos a partir de configuraciones costosas de armar (reglas, consultas, cálculos).',
      'Tienes muchas variantes preconfiguradas y prefieres copiarlas antes que crear una subclase por cada una.',
    ],
    cuandoNoUsarlo: [
      'El objeto es sencillo de construir: clonar no aporta nada.',
      'El objeto tiene referencias circulares o recursos externos (conexiones, archivos abiertos) que no tiene sentido copiar.',
    ],
    relaciones: [
      'Abstract Factory: puede guardar prototipos y clonarlos en vez de instanciar clases.',
      'Memento: en objetos simples, un clon puede servir como instantánea del estado.',
      'Composite y Decorator: clonar estructuras complejas suele ser más fácil que reconstruirlas.',
    ],
  },
  {
    ...CREACIONALES,
    slug: 'singleton',
    name: 'Singleton',
    aka: 'Instancia única',
    purpose: 'Garantiza que una clase tenga una única instancia y ofrece un punto de acceso a ella.',
    problema: 'Debe existir una sola instancia compartida (configuración, caché del proceso).',
    order: 5,
    frecuenciaUso: 'Media',
    complejidad: 'Baja',
    historiaReal: 'Tu API carga al arrancar la configuración y las feature flags (qué funcionalidades están activas en cada país) desde un archivo y un servicio remoto. La carga tarda medio segundo y debe hacerse una sola vez: si cada módulo tiene su propia copia, unos verán una funcionalidad activa y otros no.',
    dolorIngenuo: 'Cada servicio hace new Configuracion() y vuelve a leer el archivo y a llamar al servicio remoto. Además, cuando las flags se refrescan, unas copias quedan actualizadas y otras no, y el comportamiento de la API depende de qué copia usó cada petición.',
    solucionPatron: 'La clase Configuracion tiene el constructor privado y un método estático que crea la instancia la primera vez y después devuelve siempre la misma. Hoy lo habitual es delegar esa garantía al contenedor de dependencias, registrando la clase con ciclo de vida singleton.',
    codigoProblematico: t(`
class ServicioPagos {
  private config = new Configuracion(); // vuelve a leer archivo y red
}

class ServicioEnvios {
  private config = new Configuracion(); // otra copia, quizá con otras flags
}`),
    codigoSolucion: t(`
class Configuracion {
  private static instancia?: Configuracion;
  private flags = new Map<string, boolean>();

  private constructor() {
    // carga costosa: archivo + servicio remoto
  }

  static obtener(): Configuracion {
    return (Configuracion.instancia ??= new Configuracion());
  }

  estaActiva(flag: string) { return this.flags.get(flag) ?? false; }
}

// Alternativa recomendada: el contenedor garantiza la instancia única
// y la inyecta como cualquier otra dependencia.
// contenedor.registrarSingleton(Configuracion);`),
    nota: 'Singleton resuelve dos cosas a la vez (instancia única y acceso global), y por eso se considera a menudo un antipatrón: el acceso global oculta dependencias y complica las pruebas. En frameworks como ASP.NET Core, Spring o NestJS se registra el servicio como singleton en el contenedor: la instancia sigue siendo única, pero se inyecta y se puede sustituir en los tests. En entornos con varios hilos, la creación perezosa debe sincronizarse.',
    principiosClave: [
      'Instancia única controlada: todas las partes ven el mismo estado.',
      'Inicialización perezosa: el costo se paga solo la primera vez que se usa.',
    ],
    cuandoUsarlo: [
      'Un recurso debe existir una sola vez por proceso: configuración, caché en memoria, registro de métricas.',
      'Crear la instancia es costoso y su estado tiene que ser coherente para todos.',
    ],
    cuandoNoUsarlo: [
      'Lo usas como variable global para no pasar dependencias: oculta el acoplamiento y complica las pruebas.',
      'Necesitas instancias distintas por prueba, por usuario o por petición.',
      'Para conexiones a base de datos: lo que puede ser único es el punto de acceso que administra un pool de conexiones, no una conexión compartida por todo el sistema.',
    ],
    relaciones: [
      'Abstract Factory, Builder y Prototype: sus fábricas o registros suelen ser instancias únicas.',
      'Facade: muchas veces basta con una sola fachada.',
      'Flyweight: ambos comparten instancias, pero un Singleton es una sola instancia que puede cambiar de estado, mientras que los flyweights son muchas instancias y siempre inmutables.',
    ],
  },

  // ───────────────────────────── ESTRUCTURALES ─────────────────────────────
  {
    ...ESTRUCTURALES,
    slug: 'adapter',
    name: 'Adapter',
    aka: 'Adaptador · Wrapper',
    purpose: 'Convierte la interfaz de una clase en otra que el cliente espera, para que colaboren clases con interfaces incompatibles.',
    problema: 'Una librería externa no encaja con la interfaz que usa mi código.',
    order: 6,
    frecuenciaUso: 'Muy alta',
    complejidad: 'Baja',
    historiaReal: 'Tu e-commerce cobra a través de una interfaz propia, PasarelaPago, con un método cobrar(monto, tarjeta). El negocio contrata un procesador de pagos local con mejores comisiones, pero su SDK funciona distinto: trabaja en céntimos, recibe un token en lugar de la tarjeta y responde con códigos numéricos en vez de lanzar errores. No puedes modificar el SDK porque es de un tercero.',
    dolorIngenuo: 'Las conversiones (pasar a céntimos, interpretar que el código "05" es rechazo y el "91" es reintentar) se copian en el checkout, en las suscripciones y en los reembolsos. Cuando el proveedor cambia un código, hay que buscarlo por todo el proyecto.',
    solucionPatron: 'Un AdaptadorPagoLocal implementa PasarelaPago y envuelve al SDK. Traduce la llamada (monto a céntimos, tarjeta a token) y la respuesta (códigos a resultados). El resto del sistema sigue usando PasarelaPago sin saber que hay un proveedor nuevo.',
    codigoProblematico: t(`
// En el checkout (y copiado en suscripciones y reembolsos)
const token = await sdkLocal.tokenizar(tarjeta);
const r = await sdkLocal.crearTransaccion({ importeCentimos: Math.round(total * 100), token });
if (r.codigo === '05') throw new PagoRechazado();
if (r.codigo === '91') { /* reintentar... */ }`),
    codigoSolucion: t(`
interface PasarelaPago {
  cobrar(monto: number, tarjeta: Tarjeta): Promise<ResultadoPago>;
}

class AdaptadorPagoLocal implements PasarelaPago {
  constructor(private readonly sdk: SdkPagoLocal) {}

  async cobrar(monto: number, tarjeta: Tarjeta): Promise<ResultadoPago> {
    const token = await this.sdk.tokenizar(tarjeta);
    const r = await this.sdk.crearTransaccion({
      importeCentimos: Math.round(monto * 100),
      token,
    });
    return traducirCodigo(r.codigo); // '00' → aprobado, '05' → rechazado...
  }
}

// El checkout no cambia: sigue recibiendo una PasarelaPago
const checkout = new Checkout(new AdaptadorPagoLocal(sdkLocal));`),
    principiosClave: [
      'Responsabilidad única: la traducción entre interfaces vive en un solo lugar.',
      'Abierto/Cerrado: integras un proveedor nuevo sin modificar el código que cobra.',
    ],
    cuandoUsarlo: [
      'Quieres usar una clase existente (SDK, librería, sistema heredado) cuya interfaz no coincide con la que espera tu código.',
      'Quieres aislar tu dominio de un proveedor externo para poder cambiarlo en el futuro.',
      'Varias subclases existentes necesitan una misma capacidad que no puedes añadir a su clase base: en lugar de repetirla en cada una, la pones en un adaptador que las envuelve.',
    ],
    cuandoNoUsarlo: [
      'Controlas ambas interfaces y puedes alinearlas directamente.',
      'El adaptador empieza a acumular lógica de negocio: su trabajo es solo traducir.',
    ],
    relaciones: [
      'Bridge: se diseña desde el inicio para separar dos jerarquías; Adapter se aplica después para que encaje lo que ya existe.',
      'Decorator: mantiene la interfaz y añade comportamiento; Adapter cambia la interfaz.',
      'Facade: crea una interfaz nueva y más simple para todo un subsistema; Adapter adapta una interfaz existente.',
      'Proxy: ofrece la misma interfaz que el objeto real; Adapter ofrece una distinta.',
    ],
  },
  {
    ...ESTRUCTURALES,
    slug: 'bridge',
    name: 'Bridge',
    aka: 'Puente',
    purpose: 'Desacopla una abstracción de su implementación para que ambas puedan variar de forma independiente.',
    problema: 'Tengo dos ejes que varían y las subclases se multiplican (M × N).',
    order: 7,
    frecuenciaUso: 'Media',
    complejidad: 'Media',
    historiaReal: 'Tu sistema de gestión genera reportes de Ventas, Inventario y Cobranzas, y cada uno se puede exportar a PDF, a Excel o enviar como HTML por correo. Hay dos cosas que cambian por separado: qué reporte es (su contenido) y en qué formato se dibuja.',
    dolorIngenuo: 'Con herencia terminas con ReporteVentasPdf, ReporteVentasExcel, ReporteInventarioPdf... 3 reportes × 3 formatos = 9 clases. Un formato nuevo (CSV) obliga a crear 3 clases más, y un reporte nuevo, otras 3. El número de clases crece de forma multiplicativa (M × N).',
    solucionPatron: 'Se separan dos jerarquías: la abstracción (Reporte y sus variantes) y la implementación (Renderizador: PDF, Excel, HTML). Cada reporte guarda una referencia a un renderizador y le delega cómo dibujar títulos y tablas. Ahora son 3 + 3 clases, y cada eje crece por su cuenta.',
    codigoProblematico: t(`
class ReporteVentasPdf { /* consulta ventas + dibuja PDF */ }
class ReporteVentasExcel { /* consulta ventas + dibuja Excel */ }
class ReporteInventarioPdf { /* consulta inventario + dibuja PDF */ }
// ...9 clases, y cada formato nuevo suma 3 más`),
    codigoSolucion: t(`
interface Renderizador {           // implementación
  titulo(texto: string): void;
  tabla(filas: Fila[]): void;
  generar(): Buffer;
}

abstract class Reporte {            // abstracción
  constructor(protected readonly salida: Renderizador) {}
  abstract exportar(): Buffer;
}

class ReporteVentas extends Reporte {
  exportar() {
    this.salida.titulo('Ventas del mes');
    this.salida.tabla(consultarVentas());
    return this.salida.generar();
  }
}

// El usuario elige el formato; el reporte no cambia
new ReporteVentas(new RenderizadorExcel()).exportar();`),
    nota: 'En Bridge, "implementación" no significa "la clase que implementa una interfaz". Se refiere a la jerarquía de bajo nivel que hace el trabajo dependiente de la plataforma (aquí, dibujar en PDF o Excel). La "abstracción" es la capa de alto nivel que usa el cliente (el reporte).',
    principiosClave: [
      'Composición sobre herencia: el reporte tiene un renderizador en vez de heredar de él.',
      'Abierto/Cerrado: añades un reporte o un formato sin tocar el otro eje.',
    ],
    cuandoUsarlo: [
      'Una clase varía en dos o más dimensiones independientes y la herencia multiplica las subclases.',
      'Quieres cambiar la implementación en tiempo de ejecución (por ejemplo, el formato que elige el usuario).',
    ],
    cuandoNoUsarlo: [
      'Solo hay una dimensión de variación: basta con una interfaz y sus implementaciones.',
      'Las dos jerarquías siempre cambian juntas: separarlas no aporta nada.',
    ],
    relaciones: [
      'Adapter: hace compatibles clases que ya existen; Bridge se diseña de antemano.',
      'Strategy: estructura parecida; Bridge separa dos jerarquías completas, Strategy intercambia un algoritmo.',
      'Abstract Factory: puede crear las combinaciones correctas de abstracción e implementación.',
    ],
  },
  {
    ...ESTRUCTURALES,
    slug: 'composite',
    name: 'Composite',
    aka: 'Objeto compuesto · Árbol',
    purpose: 'Compone objetos en estructuras de árbol para representar jerarquías parte-todo, y permite tratar igual a los elementos individuales y a los grupos.',
    problema: 'Trabajo con árboles y quiero tratar igual a una hoja y a un grupo.',
    order: 8,
    frecuenciaUso: 'Alta',
    complejidad: 'Media',
    historiaReal: 'Recursos humanos necesita el costo mensual de planilla de cualquier parte de la empresa: un equipo, una gerencia o la compañía completa. Una gerencia contiene áreas, las áreas contienen equipos, y en cualquier nivel puede haber empleados directos.',
    dolorIngenuo: 'La función que calcula el costo pregunta en cada nivel si el elemento es un empleado o un área y recorre recursivamente con if/instanceof. El mismo recorrido se repite para contar personas, listar correos o calcular bonos.',
    solucionPatron: 'Empleado (hoja) y Area (compuesto) implementan la misma interfaz, MiembroOrganizacion, con costoMensual(). El empleado devuelve su sueldo; el área suma el costo de sus miembros, sean personas u otras áreas. Quien pide el costo no necesita saber qué tiene delante.',
    codigoProblematico: t(`
function costo(nodo: Empleado | Area): number {
  if (nodo instanceof Empleado) return nodo.sueldo;
  let total = 0;
  for (const hijo of nodo.hijos) total += costo(hijo);
  return total; // y el mismo recorrido, copiado en cada reporte
}`),
    codigoSolucion: t(`
interface MiembroOrganizacion {
  costoMensual(): number;
}

class Empleado implements MiembroOrganizacion {
  constructor(readonly nombre: string, private sueldo: number) {}
  costoMensual() { return this.sueldo; }
}

class Area implements MiembroOrganizacion {
  private miembros: MiembroOrganizacion[] = [];
  constructor(readonly nombre: string) {}

  agregar(m: MiembroOrganizacion) { this.miembros.push(m); return this; }
  costoMensual() {
    return this.miembros.reduce((total, m) => total + m.costoMensual(), 0);
  }
}

const tecnologia = new Area('Tecnología')
  .agregar(new Empleado('Ana', 5200))
  .agregar(new Area('Equipo Pagos').agregar(new Empleado('Luis', 4100)));
tecnologia.costoMensual(); // 9300`),
    principiosClave: [
      'Polimorfismo: la hoja y el compuesto responden al mismo mensaje.',
      'Abierto/Cerrado: un tipo de nodo nuevo (por ejemplo, un contratista) no cambia el código cliente.',
    ],
    cuandoUsarlo: [
      'Tus datos forman un árbol parte-todo: organigramas, menús, categorías, carpetas, paquetes de productos.',
      'Quieres que el cliente trate igual a un elemento individual y a un grupo.',
    ],
    cuandoNoUsarlo: [
      'La estructura no es jerárquica.',
      'Hojas y compuestos tienen operaciones muy distintas: forzar una interfaz común obliga a métodos que no aplican.',
    ],
    relaciones: [
      'Iterator: permite recorrer el árbol sin exponer su estructura.',
      'Visitor: permite añadir operaciones nuevas sobre todo el árbol.',
      'Decorator: también envuelve objetos con la misma interfaz, pero tiene un solo hijo y añade comportamiento.',
      'Chain of Responsibility: una petición puede subir desde una hoja hasta sus padres.',
    ],
  },
  {
    ...ESTRUCTURALES,
    slug: 'decorator',
    name: 'Decorator',
    aka: 'Decorador · Envoltorio',
    purpose: 'Añade responsabilidades a un objeto de forma dinámica, envolviéndolo en otros objetos que tienen la misma interfaz.',
    problema: 'Quiero sumar comportamiento (logs, reintentos, caché) sin tocar la clase.',
    order: 9,
    frecuenciaUso: 'Muy alta',
    complejidad: 'Media',
    historiaReal: 'Tu servicio consulta la API de un proveedor de tipos de cambio. Con el tiempo te piden registrar cada llamada en los logs, reintentar cuando el proveedor falla y guardar las respuestas en caché. No todos los usos necesitan todo: los reportes nocturnos no quieren caché y las pruebas no quieren reintentos.',
    dolorIngenuo: 'Los logs, los reintentos y la caché terminan dentro de ClienteTiposCambio, controlados con flags (usarCache, reintentar, log). La clase crece, cada combinación se prueba a mano y, para otra API, hay que copiar todo.',
    solucionPatron: 'Cada capacidad es un decorador que implementa la misma interfaz que el cliente y envuelve a otro objeto: ConCache(ConReintentos(ApiTiposCambio)). Cada decorador hace su parte y delega en el que envuelve. Las combinaciones se arman al configurar la aplicación.',
    codigoProblematico: t(`
class ClienteTiposCambio {
  constructor(private usarCache: boolean, private reintentar: boolean, private log: boolean) {}

  async obtener(moneda: string) {
    if (this.usarCache && cache.has(moneda)) return cache.get(moneda);
    if (this.log) console.log('GET', moneda);
    // bucle de reintentos + llamada HTTP + guardar en caché... todo mezclado
  }
}`),
    codigoSolucion: t(`
interface FuenteTiposCambio {
  obtener(moneda: string): Promise<number>;
}

class ConReintentos implements FuenteTiposCambio {
  constructor(private interno: FuenteTiposCambio, private intentos = 3) {}
  async obtener(moneda: string) {
    for (let i = 1; ; i++) {
      try { return await this.interno.obtener(moneda); }
      catch (error) { if (i >= this.intentos) throw error; }
    }
  }
}

class ConCache implements FuenteTiposCambio {
  private cache = new Map<string, number>();
  constructor(private interno: FuenteTiposCambio) {}
  async obtener(moneda: string) {
    if (!this.cache.has(moneda)) this.cache.set(moneda, await this.interno.obtener(moneda));
    return this.cache.get(moneda)!;
  }
}

// Cada contexto arma la combinación que necesita
const fuente = new ConCache(new ConReintentos(new ApiTiposCambio()));`),
    principiosClave: [
      'Responsabilidad única: cada decorador hace una sola cosa.',
      'Abierto/Cerrado: sumas comportamiento sin modificar la clase original.',
      'Composición sobre herencia: las combinaciones se arman en tiempo de ejecución, no con subclases.',
    ],
    cuandoUsarlo: [
      'Quieres añadir responsabilidades transversales (logs, caché, reintentos, métricas, permisos) sin cambiar el objeto.',
      'Necesitas combinar esas capacidades de formas distintas según el contexto.',
    ],
    cuandoNoUsarlo: [
      'El orden de los decoradores importa y es difícil de controlar: ConCache(ConReintentos(x)) no se comporta igual que ConReintentos(ConCache(x)).',
      'Necesitas quitar o consultar un decorador concreto de en medio de la pila: el patrón no lo facilita.',
      'Solo hay una combinación posible: una clase simple es más clara.',
    ],
    relaciones: [
      'Adapter: cambia la interfaz; Decorator la mantiene y añade comportamiento.',
      'Proxy: misma estructura, pero controla el acceso al objeto; los decoradores los elige y combina el cliente.',
      'Chain of Responsibility: parecido, pero en la cadena cualquier eslabón puede cortar el flujo; un decorador normalmente siempre delega.',
      'Composite: también envuelve objetos, pero agrupa varios hijos en lugar de uno.',
    ],
  },
  {
    ...ESTRUCTURALES,
    slug: 'facade',
    name: 'Facade',
    aka: 'Fachada',
    purpose: 'Ofrece una interfaz simple y unificada para un conjunto de clases de un subsistema complejo.',
    problema: 'Usar un subsistema exige conocer diez clases y su orden correcto.',
    order: 10,
    frecuenciaUso: 'Muy alta',
    complejidad: 'Baja',
    historiaReal: 'Emitir una factura electrónica implica validar el número fiscal del cliente, calcular impuestos, generar el XML con el formato oficial, firmarlo con el certificado digital, enviarlo a la autoridad tributaria, esperar la constancia de recepción y guardar el PDF. Lo hacen el checkout, el panel de ventas y el proceso de facturación recurrente.',
    dolorIngenuo: 'Esos tres lugares conocen las seis clases del subsistema y el orden exacto de las llamadas. Cuando la autoridad tributaria cambia el formato del XML, hay que corregir tres flujos casi iguales.',
    solucionPatron: 'Una FacturacionElectronica (la fachada) expone una sola operación, emitir(venta), que orquesta el subsistema por dentro. Los clientes dependen solo de la fachada; las clases internas siguen disponibles para quien necesite algo avanzado.',
    codigoProblematico: t(`
// Repetido en el checkout, el panel de ventas y la facturación recurrente
await validadorFiscal.validar(venta.cliente.numeroFiscal);
const xml = generadorXml.crear(venta, calculadoraImpuestos.calcular(venta));
const firmado = firmador.firmar(xml, certificado);
const constancia = await clienteAutoridad.enviar(firmado);
await almacen.guardarPdf(venta, constancia);`),
    codigoSolucion: t(`
class FacturacionElectronica {
  constructor(
    private validador: ValidadorFiscal,
    private generador: GeneradorXml,
    private firmador: FirmadorDigital,
    private autoridad: ClienteAutoridadTributaria,
    private almacen: AlmacenComprobantes,
  ) {}

  async emitir(venta: Venta): Promise<Comprobante> {
    await this.validador.validar(venta.cliente.numeroFiscal);
    const firmado = this.firmador.firmar(this.generador.crear(venta));
    const constancia = await this.autoridad.enviar(firmado);
    return this.almacen.guardar(venta, constancia);
  }
}

// En el checkout: una sola línea
await facturacion.emitir(venta);`),
    principiosClave: [
      'Bajo acoplamiento: los clientes dependen de una clase en vez de seis.',
      'Ocultamiento de información: los detalles del subsistema quedan en un solo lugar.',
    ],
    cuandoUsarlo: [
      'Un subsistema complejo se usa siempre de la misma forma desde varios lugares.',
      'Quieres separar tu aplicación en capas y ofrecer un punto de entrada claro a cada una.',
    ],
    cuandoNoUsarlo: [
      'La fachada empieza a acumular lógica de negocio de todo el sistema y se convierte en una clase Dios.',
      'Los clientes casi siempre necesitan el control fino del subsistema: la fachada solo estorba.',
    ],
    relaciones: [
      'Adapter: hace que una interfaz existente encaje con otra; Facade crea una interfaz nueva y más simple.',
      'Mediator: también centraliza, pero los objetos coordinados conocen al mediador; el subsistema no sabe que la fachada existe.',
      'Abstract Factory: puede usarse junto a una fachada para crear los objetos del subsistema.',
      'Singleton: muchas veces basta con una única fachada.',
    ],
  },
  {
    ...ESTRUCTURALES,
    slug: 'flyweight',
    name: 'Flyweight',
    aka: 'Peso ligero · Estado compartido',
    purpose: 'Permite manejar una gran cantidad de objetos de forma eficiente compartiendo la parte de su estado que es común e inmutable.',
    problema: 'Tengo miles de objetos casi iguales y la memoria no alcanza.',
    order: 11,
    frecuenciaUso: 'Baja',
    complejidad: 'Alta',
    historiaReal: 'Construyes una hoja de cálculo que funciona en el navegador. Un archivo típico de finanzas tiene 2 millones de celdas y cada celda tiene formato: fuente, tamaño, color, borde, alineación y formato numérico. Sin embargo, en todo el archivo solo hay unas 40 combinaciones de formato distintas.',
    dolorIngenuo: 'Si cada celda guarda su propio objeto de formato (unos 200 bytes), solo los formatos ocupan cerca de 400 MB. La pestaña del navegador se vuelve lenta y termina cerrándose.',
    solucionPatron: 'Se separa el estado intrínseco, compartido e inmutable (el formato), del extrínseco, propio de cada celda (fila, columna y valor). Una fábrica de formatos devuelve siempre el mismo objeto para la misma combinación, y las celdas solo guardan una referencia: 40 objetos de formato en lugar de 2 millones.',
    codigoProblematico: t(`
class Celda {
  constructor(
    public fila: number, public columna: number, public valor: string,
    // repetido en cada una de los 2 millones de celdas:
    public fuente: string, public tamano: number, public color: string,
    public borde: string, public formatoNumero: string,
  ) {}
}`),
    codigoSolucion: t(`
class Formato {                    // flyweight: inmutable y compartido
  constructor(
    readonly fuente: string, readonly tamano: number,
    readonly color: string, readonly formatoNumero: string,
  ) {}
}

class FabricaFormatos {
  private cache = new Map<string, Formato>();

  obtener(fuente: string, tamano: number, color: string, formatoNumero: string) {
    const clave = [fuente, tamano, color, formatoNumero].join('|');
    if (!this.cache.has(clave)) {
      this.cache.set(clave, new Formato(fuente, tamano, color, formatoNumero));
    }
    return this.cache.get(clave)!;
  }
}

class Celda {                      // estado extrínseco: propio de cada celda
  constructor(
    readonly fila: number, readonly columna: number,
    public valor: string, public formato: Formato,
  ) {}
}`),
    principiosClave: [
      'Inmutabilidad: el estado compartido no puede cambiar, porque afectaría a todos los que lo usan.',
      'Separación del estado intrínseco (compartido) y extrínseco (propio de cada objeto).',
    ],
    cuandoUsarlo: [
      'La aplicación crea una cantidad enorme de objetos y la memoria es un problema medido, no supuesto.',
      'Gran parte del estado de esos objetos se repite y puede extraerse como inmutable.',
    ],
    cuandoNoUsarlo: [
      'La memoria no es un cuello de botella: el patrón añade complejidad sin beneficio.',
      'El estado que se repite cambia a menudo en cada objeto: no se puede compartir.',
      'Compartir tiene un costo: el estado propio de cada objeto hay que pasarlo o recalcularlo en cada llamada, así que cambias memoria por tiempo de CPU y el código se vuelve más difícil de entender.',
    ],
    relaciones: [
      'Composite: las hojas compartidas de un árbol pueden implementarse como flyweights.',
      'Singleton: Singleton es una única instancia; Flyweight son muchas instancias inmutables compartidas.',
      'Factory Method: la fábrica de flyweights decide si crea un objeto nuevo o reutiliza uno existente.',
    ],
  },
  {
    ...ESTRUCTURALES,
    slug: 'proxy',
    name: 'Proxy',
    aka: 'Sustituto · Intermediario',
    purpose: 'Proporciona un sustituto de otro objeto para controlar el acceso a él: carga perezosa, permisos, caché o acceso remoto.',
    problema: 'Necesito controlar el acceso a un objeto: carga perezosa, permisos o caché.',
    order: 12,
    frecuenciaUso: 'Alta',
    complejidad: 'Media',
    historiaReal: 'El sistema de una red de clínicas muestra la historia clínica de cada paciente: datos, diagnósticos y estudios de imagen que pesan cientos de megas en un almacenamiento externo. Hay dos reglas: solo el médico tratante puede ver la historia, y las imágenes no deben descargarse hasta que alguien las abra.',
    dolorIngenuo: 'El repositorio descarga todo al cargar al paciente, aunque el médico solo mire los datos generales. Y la verificación de permisos está copiada en cada controlador: basta que un endpoint nuevo la olvide para exponer datos sensibles.',
    solucionPatron: 'Un ProxyHistoriaClinica implementa la misma interfaz que la historia real. Comprueba los permisos antes de cada acceso (proxy de protección) y no descarga las imágenes hasta que se piden (proxy virtual). El resto del sistema no distingue el proxy del objeto real.',
    codigoProblematico: t(`
// Repetido en cada controlador
if (!usuario.esMedicoTratante(pacienteId)) throw new AccesoDenegado();
const historia = await repo.cargarCompleta(pacienteId); // descarga también las imágenes
return historia.diagnosticos();`),
    codigoSolucion: t(`
interface HistoriaClinica {
  diagnosticos(): Diagnostico[];
  imagenes(): Promise<Imagen[]>;
}

class ProxyHistoriaClinica implements HistoriaClinica {
  private cache?: Imagen[];
  constructor(private real: HistoriaClinicaReal, private usuario: Usuario) {}

  diagnosticos() {
    this.verificarAcceso();
    return this.real.diagnosticos();
  }

  async imagenes() {
    this.verificarAcceso();
    return (this.cache ??= await this.real.imagenes()); // carga perezosa
  }

  private verificarAcceso() {
    if (!this.usuario.esMedicoTratante(this.real.pacienteId)) throw new AccesoDenegado();
  }
}`),
    principiosClave: [
      'Responsabilidad única: el control de acceso y la carga perezosa salen del objeto real.',
      'Abierto/Cerrado: añades controles sin modificar la clase real ni a sus clientes.',
    ],
    cuandoUsarlo: [
      'Proxy virtual: el objeto es costoso de crear o cargar y no siempre se usa.',
      'Proxy de protección: el acceso depende de los permisos de quien lo pide.',
      'Proxy remoto, de caché o de registro: el objeto vive en otro servicio, sus respuestas se pueden reutilizar o quieres dejar constancia de cada llamada.',
      'Referencia inteligente: liberar un objeto costoso cuando ya nadie lo está usando.',
    ],
    cuandoNoUsarlo: [
      'El objeto es barato y no necesita ningún control: el proxy solo añade una capa.',
      'La latencia es crítica y cada indirección cuenta.',
    ],
    relaciones: [
      'Decorator: misma forma, pero el decorador añade comportamiento que elige el cliente y el proxy controla el acceso.',
      'Adapter: ofrece una interfaz distinta; Proxy ofrece la misma.',
      'Facade: también se coloca delante de algo, pero para simplificar un subsistema completo.',
    ],
  },

  // ─────────────────────────── COMPORTAMIENTO ───────────────────────────
  {
    ...COMPORTAMIENTO,
    slug: 'chain-of-responsibility',
    name: 'Chain of Responsibility',
    aka: 'Cadena de responsabilidad',
    purpose: 'Pasa una petición a lo largo de una cadena de manejadores; cada uno decide si la procesa, la rechaza o la pasa al siguiente.',
    problema: 'Una petición pasa por varios filtros y cualquiera puede cortarla.',
    order: 13,
    frecuenciaUso: 'Alta',
    complejidad: 'Media',
    historiaReal: 'Antes de aprobar un pago con tarjeta, tu fintech aplica controles antifraude en orden: lista de tarjetas bloqueadas, límite diario del cliente, país de la conexión frente al país de la tarjeta y un puntaje de riesgo calculado por un modelo externo. Cualquier control puede rechazar el pago y cortar el resto. El equipo de riesgo cambia el orden y añade controles cada pocas semanas.',
    dolorIngenuo: 'Un método validarPago() de 200 líneas tiene todos los controles en if encadenados. Cambiar el orden, o desactivar un control para un país, obliga a modificar y volver a probar el método entero.',
    solucionPatron: 'Cada control es un manejador con la misma interfaz y una referencia al siguiente. Si detecta un problema, rechaza el pago; si no, lo pasa al siguiente eslabón. La cadena se arma al configurar la aplicación y puede ser distinta en cada país.',
    codigoProblematico: t(`
async function validarPago(pago: Pago) {
  if (await listaBloqueo.contiene(pago.tarjeta)) return rechazar('Tarjeta bloqueada');
  if ((await totalDelDia(pago.cliente)) + pago.monto > LIMITE) return rechazar('Límite diario');
  if (paisConexion(pago) !== pago.tarjeta.pais) return rechazar('País no coincide');
  if ((await modeloRiesgo.puntuar(pago)) > 0.8) return rechazar('Riesgo alto');
  return aprobar();
}`),
    codigoSolucion: t(`
abstract class ControlFraude {
  private siguiente?: ControlFraude;

  enlazar(control: ControlFraude) { this.siguiente = control; return control; }

  async revisar(pago: Pago): Promise<Resultado> {
    const motivo = await this.detectar(pago);
    if (motivo) return { aprobado: false, motivo };          // corta la cadena
    return this.siguiente ? this.siguiente.revisar(pago) : { aprobado: true };
  }

  protected abstract detectar(pago: Pago): Promise<string | null>;
}

class ControlListaBloqueo extends ControlFraude {
  protected async detectar(pago: Pago) {
    return (await listaBloqueo.contiene(pago.tarjeta)) ? 'Tarjeta bloqueada' : null;
  }
}

const cadena = new ControlListaBloqueo();
cadena.enlazar(new ControlLimiteDiario()).enlazar(new ControlPais()).enlazar(new ControlRiesgo());
await cadena.revisar(pago);`),
    nota: 'Define siempre qué ocurre si la petición llega al final sin que nadie la atienda: en este ejemplo se aprueba, en otros casos conviene un manejador por defecto. Los middlewares de Express, ASP.NET Core o Laravel son una variante de este patrón.',
    principiosClave: [
      'Responsabilidad única: cada control vive en su propia clase.',
      'Abierto/Cerrado: añades, quitas o reordenas controles sin modificar los existentes.',
    ],
    cuandoUsarlo: [
      'Una petición debe pasar por varios pasos de validación o procesamiento y cualquiera puede detenerla.',
      'El orden o el conjunto de pasos cambia según la configuración o el contexto.',
    ],
    cuandoNoUsarlo: [
      'Los pasos son pocos y fijos: una secuencia de llamadas es más fácil de leer.',
      'La cadena es larga y no registras qué eslabón decidió: depurar un rechazo se vuelve difícil.',
    ],
    relaciones: [
      'Decorator: estructura parecida, pero el decorador siempre delega; en la cadena cualquier eslabón puede cortar.',
      'Command: las peticiones que recorren la cadena pueden representarse como comandos.',
      'Composite: un evento puede subir de un componente a su contenedor como si fuera una cadena.',
    ],
  },
  {
    ...COMPORTAMIENTO,
    slug: 'command',
    name: 'Command',
    aka: 'Comando · Acción · Transacción',
    purpose: 'Convierte una petición en un objeto con toda la información necesaria, para poder encolarla, registrarla, programarla o deshacerla.',
    problema: 'Quiero encolar, registrar o deshacer acciones del usuario.',
    order: 14,
    frecuenciaUso: 'Alta',
    complejidad: 'Media',
    historiaReal: 'En el panel de administración de una tienda, el equipo comercial aplica cambios masivos: subir los precios de una categoría un 10 %, mover productos de categoría o desactivarlos. Necesitan deshacer el último cambio, dejar registro de quién hizo qué para auditoría y programar algunos cambios para la medianoche en que empieza una campaña.',
    dolorIngenuo: 'Cada botón del panel modifica la base de datos directamente. No queda registro de los valores anteriores, así que deshacer es imposible, y programar un cambio obliga a duplicar la lógica en una tarea aparte.',
    solucionPatron: 'Cada acción se convierte en un objeto comando con ejecutar() y deshacer(), que guarda los datos que necesita y, al ejecutarse, los valores anteriores para poder revertir. Un invocador ejecuta los comandos, los apila en un historial y los registra; un planificador puede guardar el mismo comando para ejecutarlo más tarde.',
    codigoProblematico: t(`
botonSubirPrecios.onClick = async () => {
  await db.query('UPDATE productos SET precio = precio * 1.10 WHERE categoria = ?', [categoria]);
  // ¿cuáles eran los precios anteriores? ¿quién lo hizo? ¿cómo se programa?
};`),
    codigoSolucion: t(`
interface Comando {
  ejecutar(): Promise<void>;
  deshacer(): Promise<void>;
}

class AjustarPrecios implements Comando {
  private anteriores = new Map<string, number>();
  constructor(private repo: RepoProductos, private categoria: string, private factor: number) {}

  async ejecutar() {
    for (const p of await this.repo.deCategoria(this.categoria)) {
      this.anteriores.set(p.id, p.precio);
      await this.repo.cambiarPrecio(p.id, p.precio * this.factor);
    }
  }

  async deshacer() {
    for (const [id, precio] of this.anteriores) await this.repo.cambiarPrecio(id, precio);
  }
}

class Invocador {
  private historial: Comando[] = [];

  async ejecutar(comando: Comando, usuario: string) {
    await comando.ejecutar();
    this.historial.push(comando);
    auditoria.registrar(usuario, comando);
  }

  async deshacerUltimo() { await this.historial.pop()?.deshacer(); }
}`),
    nota: 'Como un comando es un objeto con todos sus datos, también se puede serializar: guardarlo en la base de datos para ejecutarlo más tarde, reintentarlo si falla o enviarlo a otro servicio para que lo ejecute allí.',
    principiosClave: [
      'Responsabilidad única: quien dispara la acción (botón, tarea, API) no sabe cómo se ejecuta.',
      'Abierto/Cerrado: una acción nueva es una clase nueva.',
    ],
    cuandoUsarlo: [
      'Necesitas deshacer y rehacer, auditar, encolar o programar acciones.',
      'La misma acción se dispara desde varios lugares (botón, atajo de teclado, API, tarea programada).',
      'Quieres tratar las operaciones como datos: guardarlas, reintentarlas o enviarlas a una cola.',
      'Quieres agrupar varios comandos simples en uno compuesto (una "macro") que se ejecuta y se deshace como una sola acción.',
    ],
    cuandoNoUsarlo: [
      'La acción es simple, se dispara desde un solo lugar y no necesita historial: una función basta.',
    ],
    relaciones: [
      'Memento: un comando puede guardar un memento del estado previo para poder deshacer.',
      'Chain of Responsibility: los comandos pueden pasar por una cadena de manejadores.',
      'Strategy: ambos convierten comportamiento en objetos; el comando representa una operación concreta con sus datos, la estrategia una forma de hacer algo.',
    ],
  },
  {
    ...COMPORTAMIENTO,
    slug: 'interpreter',
    name: 'Interpreter',
    aka: 'Intérprete',
    purpose: 'Define cómo representar la gramática de un lenguaje sencillo como objetos y cómo evaluar frases de ese lenguaje.',
    problema: 'Mis usuarios escriben reglas en un mini-lenguaje que debo evaluar.',
    order: 15,
    frecuenciaUso: 'Baja',
    complejidad: 'Alta',
    historiaReal: 'Tu e-commerce permite que el equipo de marketing escriba sus propias reglas de promoción sin pedir un despliegue, por ejemplo: total > 100 Y cliente_frecuente O cupon = "VERANO". Cada regla debe evaluarse contra cada carrito durante el checkout.',
    dolorIngenuo: 'La regla se evalúa con expresiones regulares y comparaciones de texto o, peor, con eval(), que permite ejecutar código arbitrario. Cada operador nuevo complica más el código y los errores aparecen en producción.',
    solucionPatron: 'Se define una clase por cada elemento de la gramática: expresiones terminales (una comparación, una condición) y no terminales (Y, O, NO). La regla se representa como un árbol de esos objetos, y evaluarla consiste en pedirle a la raíz que se interprete con los datos del carrito.',
    codigoProblematico: t(`
// Frágil y peligroso: eval ejecuta cualquier código
const aplica = eval(regla.replace('Y', '&&').replace('O', '||'));`),
    codigoSolucion: t(`
interface Expresion {
  interpretar(carrito: Carrito): boolean;
}

class TotalMayorQue implements Expresion {
  constructor(private limite: number) {}
  interpretar(c: Carrito) { return c.total > this.limite; }
}

class EsClienteFrecuente implements Expresion {
  interpretar(c: Carrito) { return c.cliente.frecuente; }
}

class Y implements Expresion {
  constructor(private izquierda: Expresion, private derecha: Expresion) {}
  interpretar(c: Carrito) {
    return this.izquierda.interpretar(c) && this.derecha.interpretar(c);
  }
}

// Árbol que construye el parser a partir del texto de la regla
const regla = new Y(new TotalMayorQue(100), new EsClienteFrecuente());
regla.interpretar(carrito);`),
    nota: 'Interpreter no incluye el análisis del texto (parsing). El patrón parte de que ya tienes el árbol de expresiones; convertir "total > 100 Y ..." en ese árbol es trabajo de un parser, que se construye aparte.',
    principiosClave: [
      'Composición: las expresiones complejas se forman combinando expresiones simples.',
      'Abierto/Cerrado: un operador nuevo es una clase nueva.',
    ],
    cuandoUsarlo: [
      'Tienes un lenguaje pequeño y estable (reglas de negocio, filtros, fórmulas) que se evalúa muchas veces.',
      'Quieres que personas no técnicas definan reglas sin tocar el código.',
    ],
    cuandoNoUsarlo: [
      'La gramática es grande o cambia mucho: usa un generador de parsers (ANTLR, Tree-sitter) o un motor de reglas existente.',
      'El rendimiento es crítico: interpretar un árbol de objetos es más lento que compilar la regla.',
    ],
    relaciones: [
      'Composite: el árbol de expresiones es un Composite.',
      'Visitor: permite añadir operaciones al árbol (validar, imprimir, optimizar) sin cambiar las expresiones.',
      'Flyweight: las expresiones terminales que se repiten pueden compartirse.',
    ],
  },
  {
    ...COMPORTAMIENTO,
    slug: 'iterator',
    name: 'Iterator',
    aka: 'Iterador · Cursor',
    purpose: 'Permite recorrer los elementos de una colección uno a uno sin exponer cómo está organizada por dentro.',
    problema: 'Quiero recorrer una colección sin exponer cómo está guardada.',
    order: 16,
    frecuenciaUso: 'Muy alta',
    complejidad: 'Baja',
    historiaReal: 'Tu sistema sincroniza todos los clientes de un CRM externo. La API del CRM devuelve los clientes de 100 en 100 y, para pedir la página siguiente, hay que enviar el cursor que llegó en la respuesta anterior. Varios procesos necesitan recorrer todos los clientes: la sincronización, una exportación y un informe mensual.',
    dolorIngenuo: 'Cada proceso repite el mismo bucle de paginación: pedir una página, leer el cursor y detectar el final. Si el CRM cambia su forma de paginar, hay que corregir todos los bucles.',
    solucionPatron: 'Un iterador encapsula el recorrido: quien lo usa solo pide "el siguiente cliente" hasta que no quedan más. Cómo se piden las páginas y se maneja el cursor queda oculto. En TypeScript se implementa de forma natural con un generador asíncrono.',
    codigoProblematico: t(`
let cursor: string | undefined;
do {
  const pagina = await crm.listarClientes({ limite: 100, cursor });
  for (const cliente of pagina.datos) await sincronizar(cliente);
  cursor = pagina.siguienteCursor; // el mismo bucle, copiado en cada proceso
} while (cursor);`),
    codigoSolucion: t(`
class ClientesCrm implements AsyncIterable<Cliente> {
  constructor(private crm: ApiCrm) {}

  async *[Symbol.asyncIterator]() {
    let cursor: string | undefined;
    do {
      const pagina = await this.crm.listarClientes({ limite: 100, cursor });
      yield* pagina.datos;
      cursor = pagina.siguienteCursor;
    } while (cursor);
  }
}

// Cualquier proceso recorre los clientes sin saber nada de páginas ni cursores
for await (const cliente of new ClientesCrm(crm)) {
  await sincronizar(cliente);
}`),
    nota: 'La mayoría de lenguajes modernos traen el patrón integrado: Symbol.iterator y generadores en JavaScript y TypeScript, IEnumerable y yield return en C#, Iterator en Java y generadores en Python. Rara vez hace falta escribir hasNext() y next() a mano.',
    principiosClave: [
      'Responsabilidad única: el recorrido se separa de la colección y de quien la usa.',
      'Ocultamiento de información: el cliente no conoce la estructura interna (páginas, árbol, grafo).',
    ],
    cuandoUsarlo: [
      'La colección tiene una estructura interna compleja (páginas, árbol, grafo) que no quieres exponer.',
      'Necesitas varias formas de recorrer la misma colección, o un recorrido perezoso que carga a medida que avanza.',
      'Necesitas varios recorridos a la vez sobre la misma colección, o pausar uno y retomarlo más tarde: cada iterador guarda su propia posición.',
    ],
    cuandoNoUsarlo: [
      'Es una lista o un array simple: los bucles del lenguaje ya usan iteradores.',
      'Necesitas acceso aleatorio por posición más que un recorrido secuencial.',
      'En colecciones muy especializadas, un iterador genérico puede ser más lento que acceder directamente a sus elementos.',
    ],
    relaciones: [
      'Composite: los iteradores permiten recorrer un árbol sin conocer su estructura.',
      'Factory Method: una colección puede devolver el iterador adecuado mediante un método fábrica.',
      'Memento: se puede guardar la posición de un recorrido para continuarlo después.',
    ],
  },
  {
    ...COMPORTAMIENTO,
    slug: 'mediator',
    name: 'Mediator',
    aka: 'Mediador',
    purpose: 'Reduce las dependencias entre objetos haciendo que se comuniquen a través de un objeto mediador en vez de directamente.',
    problema: 'Mis componentes se llaman todos entre sí y ya es una telaraña.',
    order: 17,
    frecuenciaUso: 'Media',
    complejidad: 'Media',
    historiaReal: 'El panel de filtros de un marketplace tiene categoría, marca, rango de precio, envío gratis, un contador de resultados y un botón "Limpiar". Al elegir una categoría cambian las marcas disponibles; al elegir una marca se ajusta el rango de precios; cualquier cambio actualiza el contador; "Limpiar" reinicia todo.',
    dolorIngenuo: 'Cada componente conoce y llama directamente a los demás. Con seis componentes hay decenas de conexiones cruzadas, y reutilizar el selector de marcas en otra pantalla es imposible porque arrastra a todos los demás.',
    solucionPatron: 'Los componentes no se hablan entre sí: avisan al mediador (PanelFiltros) cuando algo cambia. El mediador conoce a todos y decide qué actualizar. Cada componente depende solo del mediador y se puede reutilizar en otro panel.',
    codigoProblematico: t(`
selectorCategoria.onChange = (categoria) => {
  selectorMarca.cargarMarcas(categoria);
  rangoPrecio.reiniciar();
  contador.actualizar();        // la categoría conoce a todos...
};

selectorMarca.onChange = (marca) => {
  rangoPrecio.ajustarA(marca);
  contador.actualizar();        // ...y la marca también
};`),
    codigoSolucion: t(`
interface Mediador {
  notificar(origen: Componente, evento: string): void;
}

class PanelFiltros implements Mediador {
  constructor(
    private categoria: SelectorCategoria,
    private marca: SelectorMarca,
    private precio: RangoPrecio,
    private contador: ContadorResultados,
  ) {}

  notificar(origen: Componente, evento: string) {
    if (evento === 'limpiar') [this.categoria, this.marca, this.precio].forEach((c) => c.reiniciar());
    if (origen === this.categoria) {
      this.marca.cargarMarcas(this.categoria.valor);
      this.precio.reiniciar();
    }
    if (origen === this.marca) this.precio.ajustarA(this.marca.valor);
    this.contador.actualizar();
  }
}

// Cada componente solo conoce al mediador
selectorMarca.onChange = () => panel.notificar(selectorMarca, 'cambio');`),
    nota: 'Librerías como MediatR (.NET) toman el nombre, pero funcionan más bien como un despachador de mensajes dentro del proceso (cada petición va a su manejador) que como el Mediator clásico, que coordina a objetos que colaboran entre sí.',
    principiosClave: [
      'Bajo acoplamiento: los componentes dependen del mediador, no unos de otros.',
      'Responsabilidad única: la coordinación vive en un solo lugar.',
    ],
    cuandoUsarlo: [
      'Muchos objetos se comunican de formas complejas y cambiar uno obliga a tocar varios.',
      'Quieres reutilizar componentes que hoy están atados a otros.',
    ],
    cuandoNoUsarlo: [
      'Solo hay dos o tres objetos con relaciones simples.',
      'El mediador crece hasta saberlo todo: vigílalo para que no se convierta en una clase Dios.',
    ],
    relaciones: [
      'Observer: los componentes suelen avisar al mediador mediante eventos; Observer difunde avisos, Mediator coordina.',
      'Facade: también centraliza, pero el subsistema no conoce a la fachada; aquí los componentes sí conocen al mediador.',
      'Chain of Responsibility y Command: son otras formas de conectar a quien envía con quien recibe.',
    ],
  },
  {
    ...COMPORTAMIENTO,
    slug: 'memento',
    name: 'Memento',
    aka: 'Recuerdo · Instantánea',
    purpose: 'Captura el estado interno de un objeto para poder restaurarlo más tarde, sin romper su encapsulamiento.',
    problema: 'Necesito guardar y restaurar el estado de un objeto sin exponer sus datos internos.',
    order: 18,
    frecuenciaUso: 'Baja',
    complejidad: 'Media',
    historiaReal: 'Un concesionario tiene un configurador web de autos: modelo, color, motor, paquete de equipamiento y accesorios. Cada elección cambia el precio y desactiva las opciones incompatibles. Los clientes quieren deshacer cambios y comparar dos configuraciones guardadas antes de pedir la cotización.',
    dolorIngenuo: 'Para guardar una versión, el historial copia los campos del configurador desde fuera, lo que obliga a hacerlos públicos. Así cualquier parte del código puede dejar el configurador en un estado inválido, como un motor eléctrico con caja manual.',
    solucionPatron: 'El propio Configurador (el originador) crea un Memento con una instantánea de su estado y sabe restaurarse a partir de él. El Historial (el cuidador) guarda los mementos sin interpretarlos. El estado del configurador sigue siendo privado.',
    codigoProblematico: t(`
// El historial necesita que todo sea público
historial.push({ modelo: config.modelo, motor: config.motor, accesorios: config.accesorios });

config.motor = 'electrico'; // cualquiera puede saltarse las reglas`),
    codigoSolucion: t(`
class Memento {                      // instantánea opaca para quien la guarda
  constructor(readonly estado: Readonly<EstadoConfig>, readonly fecha = new Date()) {}
}

class Configurador {                 // originador
  private estado: EstadoConfig = configuracionBase();

  elegirMotor(motor: Motor) { /* valida compatibilidad y recalcula el precio */ }

  guardar(): Memento { return new Memento(structuredClone(this.estado)); }
  restaurar(m: Memento) { this.estado = structuredClone(m.estado); }
}

class Historial {                    // cuidador: guarda, pero no interpreta
  private pila: Memento[] = [];
  constructor(private config: Configurador) {}

  guardar() { this.pila.push(this.config.guardar()); }
  deshacer() {
    const memento = this.pila.pop();
    if (memento) this.config.restaurar(memento);
  }
}`),
    nota: 'En lenguajes con clases anidadas privadas (Java, C#) el memento puede ser una clase interna del originador, y nadie más puede leer su contenido. En TypeScript se aproxima marcando el estado como de solo lectura y no usándolo fuera del originador.',
    principiosClave: [
      'Encapsulamiento: el estado se guarda y se restaura sin exponerlo.',
      'Responsabilidad única: el historial gestiona las versiones; el configurador, sus reglas.',
    ],
    cuandoUsarlo: [
      'Necesitas deshacer cambios, guardar versiones o puntos de restauración de un objeto.',
      'Quieres volver al estado anterior si una operación de varios pasos falla a mitad de camino.',
      'Copiar el estado desde fuera obligaría a exponer campos privados.',
    ],
    cuandoNoUsarlo: [
      'El estado es grande y se guarda muy a menudo: la memoria crece rápido (considera guardar solo los cambios).',
      'El estado incluye recursos que no se pueden copiar, como conexiones o archivos abiertos.',
      'Nadie se encarga de descartar los mementos que ya no sirven: el cuidador debe controlar cuántos guarda y cuándo los borra, o el historial crecerá sin límite.',
    ],
    relaciones: [
      'Command: un comando puede guardar un memento antes de ejecutarse para poder deshacer.',
      'Prototype: en objetos simples, un clon puede funcionar como memento.',
      'Iterator: un memento puede guardar la posición de un recorrido.',
    ],
  },
  {
    ...COMPORTAMIENTO,
    slug: 'observer',
    name: 'Observer',
    aka: 'Observador · Publicador-suscriptor',
    purpose: 'Define una relación de uno a muchos: cuando un objeto cambia o emite un evento, todos sus suscriptores reciben el aviso.',
    problema: 'Cuando algo pasa, varias partes del sistema deben enterarse.',
    order: 19,
    frecuenciaUso: 'Muy alta',
    complejidad: 'Baja',
    historiaReal: 'Cuando se paga un pedido en tu e-commerce deben pasar varias cosas: enviar el correo de confirmación, reservar el stock, generar la factura y avisar al almacén para preparar el envío. Cada trimestre, marketing o logística piden reaccionar a ese mismo evento de alguna forma nueva.',
    dolorIngenuo: 'El servicio de pagos llama directamente a correo, inventario, facturación y almacén. Cada requisito nuevo obliga a modificarlo, y termina conociendo a medio sistema.',
    solucionPatron: 'El servicio de pagos (el sujeto) mantiene una lista de suscriptores y, cuando un pedido se paga, les notifica el evento. Cada servicio se suscribe por su cuenta. Para añadir una reacción nueva se crea un suscriptor nuevo; el servicio de pagos no cambia.',
    codigoProblematico: t(`
class ServicioPagos {
  pagar(pedido: Pedido) {
    // ...lógica del pago
    correo.enviarConfirmacion(pedido);
    inventario.reservar(pedido);
    facturacion.emitir(pedido);
    almacen.prepararEnvio(pedido); // cada requisito nuevo modifica esta clase
  }
}`),
    codigoSolucion: t(`
interface SuscriptorPagos {
  pedidoPagado(pedido: Pedido): void;
}

class ServicioPagos {
  private suscriptores: SuscriptorPagos[] = [];

  suscribir(s: SuscriptorPagos) { this.suscriptores.push(s); }
  desuscribir(s: SuscriptorPagos) {
    this.suscriptores = this.suscriptores.filter((x) => x !== s);
  }

  pagar(pedido: Pedido) {
    // ...lógica del pago
    for (const s of this.suscriptores) s.pedidoPagado(pedido);
  }
}

class EnviarConfirmacion implements SuscriptorPagos {
  pedidoPagado(pedido: Pedido) { correo.enviarConfirmacion(pedido); }
}

pagos.suscribir(new EnviarConfirmacion());
pagos.suscribir(new ReservarStock());`),
    nota: 'En su forma básica la notificación es síncrona: si un suscriptor lanza una excepción, puede interrumpir a los demás e incluso al pago. Para aislar los fallos, se captura el error de cada suscriptor o se publica el evento en una cola (RabbitMQ, Kafka, SQS) para que cada servicio lo procese por separado.',
    principiosClave: [
      'Abierto/Cerrado: añades reacciones nuevas sin modificar al sujeto.',
      'Bajo acoplamiento: el sujeto solo conoce una interfaz de suscriptor.',
    ],
    cuandoUsarlo: [
      'Un cambio en un objeto debe provocar reacciones en otros, y no sabes de antemano cuántos ni cuáles.',
      'Quieres separar el núcleo del negocio de sus efectos secundarios (correos, métricas, integraciones).',
    ],
    cuandoNoUsarlo: [
      'Las reacciones deben ejecutarse en un orden garantizado: con Observer el orden no debería importar.',
      'El flujo se vuelve difícil de seguir: al leer pagar() ya no ves todo lo que ocurre.',
      'Los suscriptores no se dan de baja: se acumulan referencias y aparecen fugas de memoria.',
    ],
    relaciones: [
      'Mediator: suele usar Observer para recibir avisos; Observer difunde, Mediator coordina.',
      'Chain of Responsibility: la petición la atiende uno; en Observer la reciben todos.',
      'Command: los eventos pueden encolarse como comandos para procesarlos más tarde.',
    ],
  },
  {
    ...COMPORTAMIENTO,
    slug: 'state',
    name: 'State',
    aka: 'Estado · Máquina de estados',
    purpose: 'Permite que un objeto cambie su comportamiento cuando cambia su estado interno, como si cambiara de clase.',
    problema: 'El objeto se comporta distinto según su estado y todo es un if gigante.',
    order: 20,
    frecuenciaUso: 'Alta',
    complejidad: 'Media',
    historiaReal: 'Un pedido pasa por Pendiente de pago, Pagado, Enviado, Entregado y Cancelado. Las mismas acciones se comportan distinto según el estado: cancelar un pedido pendiente solo lo anula; cancelar uno pagado lo anula y devuelve el dinero; uno enviado ya no se puede cancelar.',
    dolorIngenuo: 'Cada método del pedido (pagar, enviar, cancelar, entregar) es un switch sobre this.estado. Añadir el estado "En reparto" obliga a revisar todos los switch, y basta olvidar uno para permitir una transición inválida.',
    solucionPatron: 'Cada estado es una clase que implementa la misma interfaz con las acciones del pedido. El pedido delega en su estado actual, y es el estado quien decide qué hacer y a qué estado pasar.',
    codigoProblematico: t(`
cancelar() {
  if (this.estado === 'pendiente') { this.estado = 'cancelado'; }
  else if (this.estado === 'pagado') { reembolsar(this); this.estado = 'cancelado'; }
  else if (this.estado === 'enviado') { throw new Error('No se puede cancelar'); }
  // ...y el mismo switch en pagar(), enviar() y entregar()
}`),
    codigoSolucion: t(`
interface EstadoPedido {
  pagar(p: Pedido): void;
  cancelar(p: Pedido): void;
}

class Pendiente implements EstadoPedido {
  pagar(p: Pedido) { p.cambiarEstado(new Pagado()); }
  cancelar(p: Pedido) { p.cambiarEstado(new Cancelado()); }
}

class Pagado implements EstadoPedido {
  pagar() { throw new Error('El pedido ya está pagado'); }
  cancelar(p: Pedido) { reembolsar(p); p.cambiarEstado(new Cancelado()); }
}

class Enviado implements EstadoPedido {
  pagar() { throw new Error('El pedido ya está pagado'); }
  cancelar() { throw new Error('Un pedido enviado no se puede cancelar'); }
}

class Pedido {
  private estado: EstadoPedido = new Pendiente();
  cambiarEstado(e: EstadoPedido) { this.estado = e; }
  pagar() { this.estado.pagar(this); }
  cancelar() { this.estado.cancelar(this); }
}`),
    nota: 'En lenguajes con uniones discriminadas o enums con datos (Rust, Kotlin, TypeScript) también es habitual modelar la máquina de estados con un tipo por estado y un switch o match exhaustivo: el compilador avisa si olvidas un estado.',
    principiosClave: [
      'Responsabilidad única: el comportamiento de cada estado vive en su clase.',
      'Abierto/Cerrado: un estado nuevo es una clase nueva, sin revisar todos los switch.',
    ],
    cuandoUsarlo: [
      'Un objeto cambia de comportamiento según su estado y tiene muchos estados o transiciones.',
      'Los condicionales sobre el estado se repiten en muchos métodos.',
    ],
    cuandoNoUsarlo: [
      'Hay dos o tres estados con poca lógica: un enum y un switch son más claros.',
      'Las transiciones son pocas y casi nunca cambian.',
    ],
    relaciones: [
      'Strategy: estructura casi idéntica; en State los estados se conocen y provocan transiciones, mientras que las estrategias son independientes y las elige el cliente.',
      'Flyweight y Singleton: si los estados no guardan datos propios, pueden compartirse como instancias únicas.',
    ],
  },
  {
    ...COMPORTAMIENTO,
    slug: 'strategy',
    name: 'Strategy',
    aka: 'Estrategia · Política',
    purpose: 'Define una familia de algoritmos intercambiables, encapsula cada uno en su propia clase y permite elegir cuál usar en tiempo de ejecución.',
    problema: 'Tengo varias formas de hacer lo mismo y quiero elegir una en tiempo de ejecución.',
    order: 21,
    frecuenciaUso: 'Muy alta',
    complejidad: 'Baja',
    historiaReal: 'Tu tienda calcula el costo de envío de forma distinta según la modalidad: tarifa plana dentro de la ciudad, por peso para el resto del país, con la tabla del operador para envíos internacionales y gratis durante las campañas. El cliente elige la modalidad en el checkout, y el negocio añade nuevas cada temporada.',
    dolorIngenuo: 'calcularEnvio() es un switch con todos los algoritmos mezclados, cada uno con sus llamadas a las APIs de los operadores. Probar uno implica preparar datos para todos, y cada modalidad nueva modifica la misma función.',
    solucionPatron: 'Cada forma de calcular es una estrategia que implementa la interfaz CalculoEnvio. El checkout recibe la estrategia elegida y delega el cálculo en ella, sin saber cuál es.',
    codigoProblematico: t(`
function calcularEnvio(modalidad: string, pedido: Pedido): number {
  switch (modalidad) {
    case 'ciudad':        return 10;
    case 'nacional':      return pedido.pesoKg * 4.5;
    case 'internacional': return tablaOperador.consultar(pedido.pais, pedido.pesoKg);
    case 'campania':      return 0;
    default: throw new Error('Modalidad desconocida');
  }
}`),
    codigoSolucion: t(`
interface CalculoEnvio {
  calcular(pedido: Pedido): number;
}

class TarifaPlana implements CalculoEnvio {
  constructor(private monto: number) {}
  calcular() { return this.monto; }
}

class PorPeso implements CalculoEnvio {
  constructor(private precioPorKg: number) {}
  calcular(p: Pedido) { return p.pesoKg * this.precioPorKg; }
}

class Checkout {
  constructor(private envio: CalculoEnvio) {}
  total(p: Pedido) { return p.subtotal + this.envio.calcular(p); }
}

const modalidades: Record<string, CalculoEnvio> = {
  ciudad: new TarifaPlana(10),
  nacional: new PorPeso(4.5),
  campania: new TarifaPlana(0),
};
new Checkout(modalidades[modalidadElegida]).total(pedido);`),
    principiosClave: [
      'Abierto/Cerrado: una modalidad nueva es una estrategia nueva.',
      'Composición sobre herencia: el checkout tiene una estrategia, no hereda de ella.',
    ],
    cuandoUsarlo: [
      'Hay varias formas de hacer lo mismo y se elige una en tiempo de ejecución.',
      'Quieres aislar algoritmos con detalles propios (APIs, tablas, reglas) del código que los usa y probarlos por separado.',
    ],
    cuandoNoUsarlo: [
      'Solo hay uno o dos algoritmos simples que casi nunca cambian.',
      'En lenguajes con funciones de primera clase, a menudo basta con pasar una función en lugar de crear una interfaz y varias clases.',
      'Quien elige no sabe distinguir las opciones: el cliente tiene que conocer las diferencias entre estrategias para escoger la adecuada.',
    ],
    relaciones: [
      'State: misma estructura, pero los estados cambian solos; la estrategia la elige el cliente.',
      'Template Method: varía partes de un algoritmo mediante herencia; Strategy cambia el algoritmo completo mediante composición.',
      'Decorator: añade comportamiento alrededor del objeto; Strategy cambia cómo hace su trabajo por dentro.',
    ],
  },
  {
    ...COMPORTAMIENTO,
    slug: 'template-method',
    name: 'Template Method',
    aka: 'Método plantilla',
    purpose: 'Define el esqueleto de un algoritmo en una clase base y deja que las subclases redefinan algunos pasos sin cambiar su estructura.',
    problema: 'Varios procesos siguen los mismos pasos y solo cambia uno o dos.',
    order: 22,
    frecuenciaUso: 'Alta',
    complejidad: 'Baja',
    historiaReal: 'Tu sistema de recursos humanos calcula la nómina mensual de empleados en planilla, practicantes y trabajadores por horas. El proceso siempre es el mismo: calcular el ingreso bruto, aplicar los descuentos de ley, sumar bonificaciones, obtener el neto y emitir la boleta. Lo que cambia según el contrato es cómo se calcula el bruto y qué bonificaciones corresponden.',
    dolorIngenuo: 'Hay tres funciones casi idénticas de 80 líneas, una por tipo de contrato. Cuando cambia el porcentaje de un descuento de ley hay que corregirlo en las tres, y alguna siempre se queda atrás.',
    solucionPatron: 'Una clase base define el método plantilla calcularNomina() con los pasos en un orden fijo. Los pasos comunes se implementan una sola vez; los que varían son métodos abstractos (el bruto) o ganchos con un valor por defecto (las bonificaciones) que cada subclase completa.',
    codigoProblematico: t(`
function nominaPlanilla(e: Empleado) { /* bruto + descuentos de ley + bonos + boleta */ }
function nominaPracticante(e: Empleado) { /* casi lo mismo, copiado */ }
function nominaPorHoras(e: Empleado) { /* casi lo mismo, copiado otra vez */ }`),
    codigoSolucion: t(`
abstract class CalculoNomina {
  // Método plantilla: el orden de los pasos no cambia
  calcularNomina(e: Empleado): Boleta {
    const bruto = this.ingresoBruto(e);
    const neto = bruto - this.descuentosDeLey(bruto) + this.bonificaciones(e);
    return { empleadoId: e.id, bruto, neto };
  }

  protected abstract ingresoBruto(e: Empleado): number;          // paso obligatorio
  protected bonificaciones(_e: Empleado): number { return 0; }   // gancho opcional
  private descuentosDeLey(bruto: number) { return bruto * 0.13; } // común a todos
}

class NominaPorHoras extends CalculoNomina {
  protected ingresoBruto(e: Empleado) { return e.horas * e.tarifaHora; }
}

class NominaPlanilla extends CalculoNomina {
  protected ingresoBruto(e: Empleado) { return e.sueldoBase; }
  protected bonificaciones(e: Empleado) { return e.hijos > 0 ? 100 : 0; }
}`),
    principiosClave: [
      'Principio de Hollywood ("no nos llames, nosotros te llamamos"): la clase base llama a las subclases.',
      'No te repitas: los pasos comunes se escriben una sola vez.',
    ],
    cuandoUsarlo: [
      'Varios procesos siguen los mismos pasos y solo cambian algunos.',
      'Quieres fijar el orden de un proceso y permitir extender solo puntos concretos.',
    ],
    cuandoNoUsarlo: [
      'Los pasos varían tanto que la plantilla se llena de ganchos.',
      'Necesitas combinar variantes en tiempo de ejecución: la herencia es rígida y Strategy encaja mejor.',
      'Una subclase necesita "apagar" un paso que la base da por hecho: al anularlo puede romper lo que la base promete y violar el principio de sustitución de Liskov.',
      'La plantilla tiene muchos pasos: cuantos más hay, más difícil es entenderla y mantenerla.',
    ],
    relaciones: [
      'Strategy: cambia el algoritmo completo por composición; Template Method cambia partes por herencia.',
      'Factory Method: suele ser uno de los pasos de un método plantilla.',
    ],
  },
  {
    ...COMPORTAMIENTO,
    slug: 'visitor',
    name: 'Visitor',
    aka: 'Visitante · Doble despacho',
    purpose: 'Permite añadir operaciones nuevas a una jerarquía de clases sin modificarlas, separando las operaciones de los objetos sobre los que actúan.',
    problema: 'Quiero añadir operaciones nuevas a una jerarquía sin modificar sus clases.',
    order: 23,
    frecuenciaUso: 'Baja',
    complejidad: 'Alta',
    historiaReal: 'Tu tienda vende productos físicos, digitales (libros electrónicos y cursos) y suscripciones. Sobre el carrito necesitas varias operaciones que tratan distinto a cada tipo: calcular impuestos, calcular el costo de envío (los digitales no pagan envío) y exportar la venta a contabilidad. Contabilidad y el área tributaria piden operaciones nuevas cada pocos meses.',
    dolorIngenuo: 'Cada operación nueva añade un método a las tres clases de producto: calcularImpuesto(), costoEnvio(), exportarContable()... Las entidades se llenan de lógica que no les corresponde, o la operación se escribe con if (producto instanceof ...) repetidos por todo el código.',
    solucionPatron: 'Cada operación es un visitante con un método por tipo de producto (visitarFisico, visitarDigital, visitarSuscripcion). Los productos solo implementan aceptar(visitante), que llama al método correcto (doble despacho). Una operación nueva es un visitante nuevo, y los productos no cambian.',
    codigoProblematico: t(`
class ProductoFisico {
  calcularImpuesto() { /* ... */ }
  costoEnvio() { /* ... */ }
  exportarContable() { /* ... */ } // cada operación nueva toca las tres clases
}`),
    codigoSolucion: t(`
interface VisitanteProducto<R> {
  visitarFisico(p: ProductoFisico): R;
  visitarDigital(p: ProductoDigital): R;
  visitarSuscripcion(p: Suscripcion): R;
}

interface Producto {
  aceptar<R>(v: VisitanteProducto<R>): R;
}

class ProductoFisico implements Producto {
  constructor(readonly precio: number, readonly pesoKg: number) {}
  aceptar<R>(v: VisitanteProducto<R>) { return v.visitarFisico(this); } // doble despacho
}

class CostoEnvio implements VisitanteProducto<number> {
  visitarFisico(p: ProductoFisico) { return p.pesoKg * 4.5; }
  visitarDigital() { return 0; }
  visitarSuscripcion() { return 0; }
}

const envio = carrito.items.reduce((total, item) => total + item.aceptar(new CostoEnvio()), 0);`),
    nota: 'En lenguajes con uniones discriminadas y pattern matching exhaustivo (TypeScript, Rust, Kotlin, C# moderno) muchas veces se reemplaza Visitor por un switch sobre el tipo de producto: el compilador avisa si falta un caso y no hace falta el doble despacho.',
    principiosClave: [
      'Responsabilidad única: cada operación vive en su visitante, no en las entidades.',
      'Abierto/Cerrado para operaciones: añades operaciones sin tocar los productos.',
    ],
    cuandoUsarlo: [
      'La jerarquía de clases es estable, pero las operaciones sobre ella cambian a menudo.',
      'Recorres estructuras con elementos de distinto tipo (árboles de sintaxis, documentos, carritos) aplicando una lógica distinta a cada uno.',
      'Quieres calcular algo mientras recorres una estructura (totales, estadísticas): el visitante puede ir acumulando resultados en su propio estado.',
    ],
    cuandoNoUsarlo: [
      'Añades tipos nuevos a menudo: cada tipo obliga a modificar todos los visitantes.',
      'Los visitantes necesitan datos privados de las clases: tendrías que exponerlos.',
    ],
    relaciones: [
      'Composite: Visitor permite ejecutar una operación sobre todo un árbol Composite.',
      'Iterator: se combinan para recorrer una estructura y visitar cada elemento.',
      'Interpreter: los visitantes son una forma habitual de añadir operaciones a un árbol de expresiones.',
    ],
  },
];

export const CATEGORIAS: { id: Categoria; label: string; desc: string }[] = [
  { id: 'creacionales', label: 'Creacionales', desc: 'Cómo se crean los objetos' },
  { id: 'estructurales', label: 'Estructurales', desc: 'Cómo se combinan clases y objetos' },
  { id: 'comportamiento', label: 'Comportamiento', desc: 'Cómo se reparten responsabilidades y se comunican los objetos' },
];
