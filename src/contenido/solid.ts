// Contenido de la página "Principios SOLID".
import type { Texto } from '../i18n/idiomas.ts';

export interface PrincipioSolid {
  id: string;
  letra: string;
  siglas: string;
  ingles: string;
  nombre: Texto;
  lema: Texto;
  /** Resumen corto para la portada. */
  idea: Texto;
  /** Síntoma corto para la portada. */
  sintomaCorto: Texto;
  definicion: Texto;
  sintoma: Texto;
  practica: Texto;
  antes: string;
  despues: string;
  color: string;
  fondo: string;
  borde: string;
}

export const ENCABEZADO = {
  titulo: { es: 'Los 5 principios SOLID', en: 'The 5 SOLID principles' },
  tituloPre: { es: 'Los 5', en: 'The 5' },
  tituloResaltado: { es: 'principios SOLID', en: 'SOLID principles' },
  intro: {
    es: 'Cinco principios de diseño orientado a objetos que ayudan a escribir código fácil de cambiar, de probar y de entender. No son leyes: son guías para tomar decisiones. Cada uno incluye un diagrama, el síntoma que te avisa de que lo estás incumpliendo y el código antes y después.',
    en: 'Five object-oriented design principles that help you write code that is easy to change, test and understand. They are not laws: they are guides for making decisions. Each one includes a diagram, the symptom that tells you that you are breaking it, and the code before and after.',
  },
  descripcion: {
    es: 'Responsabilidad única, abierto/cerrado, Liskov, segregación de interfaces e inversión de dependencias, con síntomas, diagramas y código antes y después.',
    en: 'Single responsibility, open/closed, Liskov, interface segregation and dependency inversion, with symptoms, diagrams and before-and-after code.',
  },
  siguiente: { es: 'Siguiente paso: los 23 patrones', en: 'Next step: the 23 patterns' },
} satisfies Record<string, Texto>;

export const PRINCIPIOS_SOLID: PrincipioSolid[] = [
  {
    id: 'srp', letra: 'S', siglas: 'SRP', ingles: 'Single Responsibility Principle',
    nombre: { es: 'Responsabilidad Única', en: 'Single Responsibility' },
    lema: { es: 'Un solo motivo para cambiar', en: 'One reason to change' },
    idea: {
      es: 'Una clase debe tener un solo motivo para cambiar: responder ante un único actor o área del negocio.',
      en: 'A class should have only one reason to change: it answers to a single actor or business area.',
    },
    sintomaCorto: {
      es: 'Una clase que valida, guarda en la base de datos y envía correos.',
      en: 'A class that validates, saves to the database and sends emails.',
    },
    definicion: {
      es: 'Una clase debe tener un único motivo para cambiar. En la práctica, eso significa que debe responder ante un solo actor: una persona, un área o un rol del negocio que pide cambios sobre ella.',
      en: 'A class should have only one reason to change. In practice, this means it should answer to a single actor: a person, a department or a business role that asks for changes to it.',
    },
    sintoma: {
      es: 'Una misma clase valida datos, escribe SQL y envía correos. Cuando marketing pide cambiar el texto del correo de bienvenida, alguien toca la clase y rompe sin querer la validación que pidió el área legal.',
      en: 'One class validates data, writes SQL and sends emails. When marketing asks to change the welcome email text, someone edits the class and accidentally breaks the validation that the legal team asked for.',
    },
    practica: {
      es: 'SRP no significa "una clase, un método". UsuarioServicio todavía coordina tres pasos, pero su único motivo para cambiar es el flujo de registro; los detalles de validar, guardar y avisar cambian en sus propias clases.',
      en: 'SRP does not mean "one class, one method". UsuarioServicio still coordinates three steps, but its only reason to change is the sign-up flow; the details of validating, saving and notifying change in their own classes.',
    },
    antes: `// ❌ Mezcla reglas de negocio, persistencia y envío de correos
export class UsuarioServicio {
  async registrar(datos: DatosUsuario) {
    if (!datos.email.includes('@')) throw new Error('Email inválido');      // validación
    await db.query('INSERT INTO usuarios (email) VALUES (?)', [datos.email]); // SQL
    await smtp.enviar(datos.email, '¡Bienvenido!');                          // correo
  }
}`,
    despues: `// ✅ Cada detalle cambia en su propia clase
export class UsuarioServicio {
  constructor(
    private readonly validador: ValidadorUsuario,
    private readonly repositorio: RepositorioUsuarios,
    private readonly bienvenida: NotificadorBienvenida,
  ) {}

  async registrar(datos: DatosUsuario) {
    this.validador.validar(datos);
    const usuario = await this.repositorio.guardar(datos);
    await this.bienvenida.enviar(usuario);
  }
}`,
    color: 'text-secondary-container', fondo: 'bg-secondary-container/20 border-secondary-container/30', borde: 'hover:border-secondary-container/50',
  },
  {
    id: 'ocp', letra: 'O', siglas: 'OCP', ingles: 'Open/Closed Principle',
    nombre: { es: 'Abierto / Cerrado', en: 'Open / Closed' },
    lema: { es: 'Extender sin modificar', en: 'Extend without modifying' },
    idea: {
      es: 'Añadir comportamiento nuevo sin modificar el código que ya funciona.',
      en: 'Add new behavior without modifying code that already works.',
    },
    sintomaCorto: {
      es: 'Cada medio de pago nuevo es otro else if en la misma función.',
      en: 'Every new payment method is another else if in the same function.',
    },
    definicion: {
      es: 'El código debe estar abierto a la extensión y cerrado a la modificación: para añadir comportamiento nuevo, escribes código nuevo en lugar de cambiar el que ya funciona y está probado.',
      en: 'Code should be open for extension and closed for modification: to add new behavior, you write new code instead of changing code that already works and is tested.',
    },
    sintoma: {
      es: 'Cada vez que el negocio agrega un medio de pago, alguien abre la función de cobro y añade otro else if. Cada cambio vuelve a poner en riesgo los medios que ya funcionaban.',
      en: 'Every time the business adds a payment method, someone opens the charging function and adds another else if. Every change puts the methods that already worked at risk again.',
    },
    practica: {
      es: 'Ningún código está cerrado a todos los cambios. OCP se aplica sobre los ejes de cambio que conoces o que se repiten (aquí, los medios de pago), no sobre cualquier posibilidad imaginable.',
      en: 'No code is closed to every change. OCP applies to the axes of change you know about or that keep coming back (here, payment methods), not to every possibility you can imagine.',
    },
    antes: `// ❌ Cada medio de pago nuevo modifica esta función
export function cobrar(medio: string, monto: number) {
  if (medio === 'tarjeta') {
    /* llamadas a la pasarela de tarjetas */
  } else if (medio === 'billetera') {
    /* llamadas a la billetera digital */
  } else if (medio === 'transferencia') {
    /* generar orden de transferencia */
  }
}`,
    despues: `// ✅ Un medio nuevo es una clase nueva que se registra
export interface MedioPago {
  cobrar(monto: number): Promise<void>;
}

export class ProcesadorPagos {
  private medios = new Map<string, MedioPago>();

  registrar(nombre: string, medio: MedioPago) { this.medios.set(nombre, medio); }

  cobrar(nombre: string, monto: number) {
    const medio = this.medios.get(nombre);
    if (!medio) throw new Error('Medio de pago no disponible');
    return medio.cobrar(monto);
  }
}

procesador.registrar('billetera', new PagoBilletera()); // sin tocar ProcesadorPagos`,
    color: 'text-secondary-container', fondo: 'bg-secondary-container/20 border-secondary-container/30', borde: 'hover:border-secondary-container/50',
  },
  {
    id: 'lsp', letra: 'L', siglas: 'LSP', ingles: 'Liskov Substitution Principle',
    nombre: { es: 'Sustitución de Liskov', en: 'Liskov Substitution' },
    lema: { es: 'Las subclases cumplen el contrato', en: 'Subclasses honor the contract' },
    idea: {
      es: 'Una subclase debe poder usarse donde se espera su clase base sin romper nada.',
      en: 'A subclass must be usable wherever its base class is expected without breaking anything.',
    },
    sintomaCorto: {
      es: 'Una subclase que lanza "operación no soportada".',
      en: 'A subclass that throws "operation not supported".',
    },
    definicion: {
      es: 'Si S es un subtipo de T, cualquier código que funcione con un T debe seguir funcionando correctamente si recibe un S. Una subclase no puede exigir más (precondiciones más estrictas), garantizar menos (postcondiciones más débiles), romper las reglas que la clase base siempre mantiene (sus invariantes, como "el saldo nunca es negativo") ni lanzar errores que la clase base no anuncia.',
      en: 'If S is a subtype of T, any code that works with a T must keep working correctly when it receives an S. A subclass cannot demand more (stricter preconditions), promise less (weaker postconditions), break the rules the base class always keeps (its invariants, such as "the balance is never negative") or throw errors the base class does not announce.',
    },
    sintoma: {
      es: 'Subclases que sobrescriben un método para lanzar "operación no soportada" o para no hacer nada. El código que usa la clase base empieza a llenarse de if (cuenta instanceof CuentaPlazoFijo).',
      en: 'Subclasses that override a method to throw "operation not supported" or to do nothing. The code that uses the base class starts filling up with if (cuenta instanceof CuentaPlazoFijo).',
    },
    practica: {
      es: 'La pregunta no es "¿es un?" en el mundo real, sino "¿se comporta como?" en el código. Un depósito a plazo fijo es una cuenta, pero no se comporta como una cuenta de la que se puede retirar en cualquier momento.',
      en: 'The question is not "is it a?" in the real world, but "does it behave like?" in the code. A fixed-term deposit is an account, but it does not behave like an account you can withdraw from at any time.',
    },
    antes: `// ❌ La subclase rompe lo que promete la clase base
export class Cuenta {
  protected saldo = 0;
  retirar(monto: number): void { this.saldo -= monto; }
}

export class CuentaPlazoFijo extends Cuenta {
  retirar(monto: number): void {
    // Quien usa una Cuenta espera poder retirar
    throw new Error('No se puede retirar antes del vencimiento');
  }
}`,
    despues: `// ✅ Cada tipo promete solo lo que puede cumplir
export interface Cuenta {
  saldo(): number;
}

export interface CuentaConRetiros extends Cuenta {
  retirar(monto: number): void;
}

export class CuentaAhorro implements CuentaConRetiros { /* saldo y retirar */ }
export class CuentaPlazoFijo implements Cuenta { /* solo saldo */ }

// Solo acepta cuentas que de verdad permiten retirar
function pagarConCuenta(cuenta: CuentaConRetiros, monto: number) {
  cuenta.retirar(monto);
}`,
    color: 'text-amber-300', fondo: 'bg-amber-500/20 border-amber-500/30', borde: 'hover:border-amber-400/50',
  },
  {
    id: 'isp', letra: 'I', siglas: 'ISP', ingles: 'Interface Segregation Principle',
    nombre: { es: 'Segregación de Interfaces', en: 'Interface Segregation' },
    lema: { es: 'Interfaces pequeñas y por rol', en: 'Small, role-based interfaces' },
    idea: {
      es: 'Nadie debería depender de métodos que no usa.',
      en: 'Nobody should depend on methods they do not use.',
    },
    sintomaCorto: {
      es: 'Implementar métodos vacíos solo para cumplir con una interfaz.',
      en: 'Implementing empty methods just to satisfy an interface.',
    },
    definicion: {
      es: 'Ningún cliente debería verse obligado a depender de métodos que no usa. Es mejor tener varias interfaces pequeñas, pensadas para cada tipo de cliente, que una interfaz grande que lo abarca todo.',
      en: 'No client should be forced to depend on methods it does not use. Several small interfaces, each designed for one kind of client, are better than one large interface that covers everything.',
    },
    sintoma: {
      es: 'Una interfaz con muchos métodos obliga a sus implementaciones a dejar métodos vacíos o lanzar errores, y cualquier cambio en un método que no usas te obliga a recompilar o a revisar tu código.',
      en: 'An interface with many methods forces its implementations to leave methods empty or throw errors, and any change to a method you do not use forces you to recompile or review your code.',
    },
    practica: {
      es: 'ISP se piensa desde quien usa la interfaz, no desde quien la implementa: cada cliente declara la interfaz que necesita. Una misma clase puede implementar varias.',
      en: 'ISP is designed from the point of view of whoever uses the interface, not whoever implements it: each client declares the interface it needs. A single class can implement several.',
    },
    antes: `// ❌ El archivo histórico es de solo lectura, pero la interfaz lo obliga a todo
export interface AlmacenDocumentos {
  leer(id: string): Promise<Documento>;
  guardar(doc: Documento): Promise<void>;
  eliminar(id: string): Promise<void>;
  generarMiniatura(id: string): Promise<Buffer>;
}

export class ArchivoHistorico implements AlmacenDocumentos {
  leer(id: string) { return this.desdeCintaDeRespaldo(id); }
  guardar(): Promise<void> { throw new Error('Solo lectura'); }    // forzado
  eliminar(): Promise<void> { throw new Error('Solo lectura'); }   // forzado
  generarMiniatura(): Promise<Buffer> { throw new Error('No soportado'); }
}`,
    despues: `// ✅ Interfaces por rol: cada cliente depende solo de lo que usa
export interface LectorDocumentos {
  leer(id: string): Promise<Documento>;
}

export interface EscritorDocumentos {
  guardar(doc: Documento): Promise<void>;
  eliminar(id: string): Promise<void>;
}

export class ArchivoHistorico implements LectorDocumentos {
  leer(id: string) { return this.desdeCintaDeRespaldo(id); }
}

export class AlmacenNube implements LectorDocumentos, EscritorDocumentos { /* ... */ }

// El visor solo necesita leer: acepta cualquiera de los dos
export class VisorDocumentos {
  constructor(private readonly lector: LectorDocumentos) {}
}`,
    color: 'text-primary-container', fondo: 'bg-primary-container/20 border-primary-container/30', borde: 'hover:border-primary-container/50',
  },
  {
    id: 'dip', letra: 'D', siglas: 'DIP', ingles: 'Dependency Inversion Principle',
    nombre: { es: 'Inversión de Dependencias', en: 'Dependency Inversion' },
    lema: { es: 'Depender de abstracciones', en: 'Depend on abstractions' },
    idea: {
      es: 'La lógica de negocio depende de abstracciones, no de la base de datos ni del framework.',
      en: 'Business logic depends on abstractions, not on the database or the framework.',
    },
    sintomaCorto: {
      es: 'Un caso de uso que hace new MySQLDriver().',
      en: 'A use case that calls new MySQLDriver().',
    },
    definicion: {
      es: 'Los módulos de alto nivel (las reglas del negocio) no deben depender de los módulos de bajo nivel (base de datos, frameworks, servicios externos); ambos deben depender de abstracciones. Además, las abstracciones no deben depender de los detalles: los detalles dependen de las abstracciones.',
      en: 'High-level modules (the business rules) should not depend on low-level modules (database, frameworks, external services); both should depend on abstractions. Also, abstractions should not depend on details: details depend on abstractions.',
    },
    sintoma: {
      es: 'El caso de uso crea su propio driver de MySQL con las credenciales dentro. No se puede probar sin una base de datos real, y cambiar de motor obliga a reescribir la lógica de negocio.',
      en: 'The use case creates its own MySQL driver with the credentials inside. It cannot be tested without a real database, and switching engines means rewriting the business logic.',
    },
    practica: {
      es: 'No hay que confundir tres ideas: DIP es el principio (de qué dependes); la inyección de dependencias es una técnica para cumplirlo (recibir las dependencias desde fuera); y un contenedor IoC es una herramienta que automatiza esa inyección. Puedes cumplir DIP sin ningún contenedor.',
      en: 'Do not mix up three ideas: DIP is the principle (what you depend on); dependency injection is a technique to follow it (receiving dependencies from outside); and an IoC container is a tool that automates that injection. You can follow DIP without any container.',
    },
    antes: `// ❌ La lógica de negocio depende del detalle de infraestructura
export class EmitirFactura {
  private db = new MySQLDriver('localhost', 'root', 'secreto'); // acoplamiento directo

  async ejecutar(factura: Factura) {
    await this.db.insert('facturas', factura);
  }
}`,
    despues: `// ✅ El negocio define la abstracción que necesita (el "puerto")
export interface RepositorioFacturas {
  guardar(factura: Factura): Promise<void>;
}

export class EmitirFactura {
  constructor(private readonly repositorio: RepositorioFacturas) {}

  async ejecutar(factura: Factura) {
    await this.repositorio.guardar(factura);
  }
}

// La infraestructura implementa la abstracción del negocio
export class RepositorioFacturasMySQL implements RepositorioFacturas { /* ... */ }

// En las pruebas se usa una implementación en memoria
new EmitirFactura(new RepositorioFacturasEnMemoria());`,
    color: 'text-tertiary-fixed-dim', fondo: 'bg-tertiary-fixed-dim/20 border-tertiary-fixed-dim/30', borde: 'hover:border-tertiary-fixed-dim/50',
  },
];
