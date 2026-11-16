// Contenido de la página "Principios SOLID".

interface PrincipioSolid {
  id: string;
  letra: string;
  siglas: string;
  ingles: string;
  nombre: string;
  lema: string;
  /** Resumen corto para la portada. */
  idea: string;
  /** Síntoma corto para la portada. */
  sintomaCorto: string;
  definicion: string;
  sintoma: string;
  practica: string;
  antes: string;
  despues: string;
  color: string;
  fondo: string;
  borde: string;
}

export const ENCABEZADO = {
  titulo: 'Los 5 principios SOLID',
  tituloPre: 'Los 5',
  tituloResaltado: 'principios SOLID',
  intro: 'Cinco principios de diseño orientado a objetos que ayudan a escribir código fácil de cambiar, de probar y de entender. No son leyes: son guías para tomar decisiones. Cada uno incluye un diagrama, el síntoma que te avisa de que lo estás incumpliendo y el código antes y después.',
  descripcion: 'Responsabilidad única, abierto/cerrado, Liskov, segregación de interfaces e inversión de dependencias, con síntomas, diagramas y código antes y después.',
  siguiente: 'Siguiente paso: los 23 patrones',
};

export const PRINCIPIOS_SOLID: PrincipioSolid[] = [
  {
    id: 'srp', letra: 'S', siglas: 'SRP', ingles: 'Single Responsibility Principle',
    nombre: 'Responsabilidad Única',
    lema: 'Un solo motivo para cambiar',
    idea: 'Una clase debe tener un solo motivo para cambiar: responder ante un único actor o área del negocio.',
    sintomaCorto: 'Una clase que valida, guarda en la base de datos y envía correos.',
    definicion: 'Una clase debe tener un único motivo para cambiar. En la práctica, eso significa que debe responder ante un solo actor: una persona, un área o un rol del negocio que pide cambios sobre ella.',
    sintoma: 'Una misma clase valida datos, escribe SQL y envía correos. Cuando marketing pide cambiar el texto del correo de bienvenida, alguien toca la clase y rompe sin querer la validación que pidió el área legal.',
    practica: 'SRP no significa "una clase, un método". UsuarioServicio todavía coordina tres pasos, pero su único motivo para cambiar es el flujo de registro; los detalles de validar, guardar y avisar cambian en sus propias clases.',
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
    nombre: 'Abierto / Cerrado',
    lema: 'Extender sin modificar',
    idea: 'Añadir comportamiento nuevo sin modificar el código que ya funciona.',
    sintomaCorto: 'Cada medio de pago nuevo es otro else if en la misma función.',
    definicion: 'El código debe estar abierto a la extensión y cerrado a la modificación: para añadir comportamiento nuevo, escribes código nuevo en lugar de cambiar el que ya funciona y está probado.',
    sintoma: 'Cada vez que el negocio agrega un medio de pago, alguien abre la función de cobro y añade otro else if. Cada cambio vuelve a poner en riesgo los medios que ya funcionaban.',
    practica: 'Ningún código está cerrado a todos los cambios. OCP se aplica sobre los ejes de cambio que conoces o que se repiten (aquí, los medios de pago), no sobre cualquier posibilidad imaginable.',
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
    color: 'text-pink-400', fondo: 'bg-pink-500/15 border-pink-400/30', borde: 'hover:border-pink-400/50',
  },
  {
    id: 'lsp', letra: 'L', siglas: 'LSP', ingles: 'Liskov Substitution Principle',
    nombre: 'Sustitución de Liskov',
    lema: 'Las subclases cumplen el contrato',
    idea: 'Una subclase debe poder usarse donde se espera su clase base sin romper nada.',
    sintomaCorto: 'Una subclase que lanza "operación no soportada".',
    definicion: 'Si S es un subtipo de T, cualquier código que funcione con un T debe seguir funcionando correctamente si recibe un S. Una subclase no puede exigir más (precondiciones más estrictas), garantizar menos (postcondiciones más débiles), romper las reglas que la clase base siempre mantiene (sus invariantes, como "el saldo nunca es negativo") ni lanzar errores que la clase base no anuncia.',
    sintoma: 'Subclases que sobrescriben un método para lanzar "operación no soportada" o para no hacer nada. El código que usa la clase base empieza a llenarse de if (cuenta instanceof CuentaPlazoFijo).',
    practica: 'La pregunta no es "¿es un?" en el mundo real, sino "¿se comporta como?" en el código. Un depósito a plazo fijo es una cuenta, pero no se comporta como una cuenta de la que se puede retirar en cualquier momento.',
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
    nombre: 'Segregación de Interfaces',
    lema: 'Interfaces pequeñas y por rol',
    idea: 'Nadie debería depender de métodos que no usa.',
    sintomaCorto: 'Implementar métodos vacíos solo para cumplir con una interfaz.',
    definicion: 'Ningún cliente debería verse obligado a depender de métodos que no usa. Es mejor tener varias interfaces pequeñas, pensadas para cada tipo de cliente, que una interfaz grande que lo abarca todo.',
    sintoma: 'Una interfaz con muchos métodos obliga a sus implementaciones a dejar métodos vacíos o lanzar errores, y cualquier cambio en un método que no usas te obliga a recompilar o a revisar tu código.',
    practica: 'ISP se piensa desde quien usa la interfaz, no desde quien la implementa: cada cliente declara la interfaz que necesita. Una misma clase puede implementar varias.',
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
    nombre: 'Inversión de Dependencias',
    lema: 'Depender de abstracciones',
    idea: 'La lógica de negocio depende de abstracciones, no de la base de datos ni del framework.',
    sintomaCorto: 'Un caso de uso que hace new MySQLDriver().',
    definicion: 'Los módulos de alto nivel (las reglas del negocio) no deben depender de los módulos de bajo nivel (base de datos, frameworks, servicios externos); ambos deben depender de abstracciones. Además, las abstracciones no deben depender de los detalles: los detalles dependen de las abstracciones.',
    sintoma: 'El caso de uso crea su propio driver de MySQL con las credenciales dentro. No se puede probar sin una base de datos real, y cambiar de motor obliga a reescribir la lógica de negocio.',
    practica: 'No hay que confundir tres ideas: DIP es el principio (de qué dependes); la inyección de dependencias es una técnica para cumplirlo (recibir las dependencias desde fuera); y un contenedor IoC es una herramienta que automatiza esa inyección. Puedes cumplir DIP sin ningún contenedor.',
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
