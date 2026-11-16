// Banco de preguntas de POO: los 4 pilares y las 4 relaciones entre clases (10 por tema).
import { banco } from './tipos.ts';

export const PREGUNTAS_POO = banco({
  abstraccion: [
    ['¿Qué significa abstraer al modelar una clase?',
      'Quedarse con lo esencial del concepto y omitir los detalles que no importan',
      ['Marcar los atributos como private para que nadie los cambie desde fuera', 'Crear una clase base común de la que hereden todas las demás', 'Reunir en una sola clase todos los datos que existan sobre ese concepto del negocio'],
      'Abstraer es decidir qué importa de un concepto para el problema que resuelves. Ocultar atributos es encapsulamiento y crear una clase base es herencia.'],
    ['Tu aplicación guarda comprobantes en un proveedor de archivos en la nube. ¿Qué interfaz refleja mejor una buena abstracción?',
      'subir(nombre, contenido) y urlDe(id)',
      ['configurarRegion(), firmarPeticion() y reintentar()', 'subirAS3(), subirAGoogle() y subirAAzure()', 'obtenerClienteSdk() para usar el cliente directamente'],
      'Una buena abstracción expresa lo que el código necesita (subir y obtener una URL). Regiones, firmas o el cliente del SDK son detalles de una implementación concreta.'],
    ['¿Con qué herramientas del lenguaje se expresa principalmente una abstracción?',
      'Interfaces y clases abstractas',
      ['Los modificadores private y protected', 'Los constructores y los métodos estáticos', 'Las variables globales y las constantes'],
      'Interfaces y clases abstractas describen qué se puede hacer sin decir cómo. Los modificadores de acceso pertenecen al encapsulamiento.'],
    ['¿Qué gana el código que trabaja con el tipo Notificador en lugar de con NotificadorCorreo?',
      'Puede usar cualquier canal sin saber cómo se envía',
      ['Se ejecuta más rápido porque las interfaces no tienen costo', 'Queda probado automáticamente por la interfaz', 'Garantiza que todos los canales usen SMTP'],
      'Quien depende de la abstracción solo conoce el contrato (enviar). Así se puede cambiar el canal o usar uno falso en pruebas sin tocar ese código.',
      `
interface Notificador {
  enviar(destino: string, mensaje: string): Promise<void>;
}

class NotificadorCorreo implements Notificador { /* SMTP */ }
class NotificadorSms implements Notificador { /* proveedor de SMS */ }`],
    ['¿Cuál es la señal de una abstracción con fugas (leaky abstraction)?',
      'Para usarla hay que conocer detalles de una implementación concreta',
      ['La interfaz tiene muy pocos métodos y no cubre todos los casos posibles', 'La interfaz la implementan varias clases distintas', 'La interfaz tiene un nombre demasiado genérico'],
      'Si para usar la abstracción tienes que saber cómo funciona por dentro una implementación (por ejemplo, pasar el nombre de un bucket de S3), la abstracción deja escapar ese detalle.'],
    ['¿Abstracción y encapsulamiento son lo mismo?',
      'No: una decide qué se muestra y la otra protege el estado',
      ['Sí: son dos nombres para la misma idea de diseño', 'No: la abstracción solo existe en lenguajes funcionales', 'Sí: ambas consisten en ocultar los atributos con private'],
      'Se complementan, pero no son lo mismo: la abstracción trabaja en qué ofrece la interfaz y el encapsulamiento en proteger el estado interno.'],
    ['En un sistema de facturación, la clase Cliente tiene 40 atributos, entre ellos colorFavorito y nombreMascota. ¿Qué pilar se está descuidando?',
      'La abstracción: modela datos que el problema no usa',
      ['El polimorfismo: faltan subclases de Cliente', 'La herencia: Cliente debería extender a Persona', 'El encapsulamiento: los atributos deberían ser privados'],
      'Modelar es elegir. Una clase llena de datos que el problema no usa es una abstracción pobre, aunque sus atributos sean privados.'],
    ['¿Una clase abstracta puede tener métodos con implementación?',
      'Sí: puede combinar métodos implementados y métodos abstractos',
      ['No: una clase abstracta solo puede declarar firmas', 'Sí, pero únicamente si esos métodos son estáticos', 'No: para tener métodos implementados hay que usar una clase normal'],
      'Es justo lo que aprovecha Template Method: la clase abstracta implementa el algoritmo y deja abstractos solo los pasos que varían.'],
    ['¿Por qué depender de la abstracción Almacenamiento facilita las pruebas de GestorComprobantes?',
      'En la prueba se puede pasar una implementación en memoria',
      ['Las interfaces no se prueban, así que hay menos trabajo', 'El compilador genera las pruebas a partir de la interfaz', 'Así ya no hacen falta datos de prueba ni aserciones'],
      'Como GestorComprobantes solo conoce el contrato, cualquier objeto que lo cumpla sirve: uno falso en memoria hace la prueba rápida y sin red.'],
    ['Un mapa del metro muestra estaciones y líneas, pero no las distancias reales ni las calles. ¿Qué concepto ilustra?',
      'Abstracción',
      ['Encapsulamiento', 'Herencia', 'Agregación'],
      'El mapa se queda con lo esencial para viajar en metro y omite lo demás: exactamente lo que hace una buena abstracción.'],
  ],

  encapsulamiento: [
    ['¿Qué es el encapsulamiento?',
      'Ocultar el estado para que solo cambie mediante las operaciones del objeto',
      ['Dividir el programa en muchos archivos y módulos pequeños para ordenarlo mejor', 'Heredar los atributos de una clase base sin repetirlos', 'Modelar solo lo esencial de un concepto del negocio'],
      'El objeto protege su estado: nadie lo cambia sin pasar por sus reglas. Modelar lo esencial es abstracción.'],
    ['¿Qué problema muestra este código?',
      'Cualquiera puede dejar el saldo en un estado inválido',
      ['Falta una clase base de la que herede la cuenta', 'El saldo debería guardarse como texto y no número', 'CuentaBancaria debería declararse como interfaz'],
      'Sin encapsulamiento, cualquier parte del código puede romper la regla "el saldo nunca es negativo" y nadie sabría desde dónde.',
      `
class CuentaBancaria {
  saldo = 0;
}

const cuenta = new CuentaBancaria();
cuenta.saldo = -500; // nadie lo impide`],
    ['¿Qué es una invariante de una clase?',
      'Una regla que el objeto garantiza siempre',
      ['Una variable que nunca cambia de valor', 'Un método que no recibe ningún parámetro', 'Un atributo compartido por todas las instancias'],
      'Por ejemplo, que el saldo nunca sea negativo. El encapsulamiento existe para que nadie pueda saltarse esas reglas.'],
    ['Una clase tiene getter y setter públicos para cada atributo, y los setters aceptan cualquier valor. ¿Está bien encapsulada?',
      'No: el estado sigue expuesto, solo que con otro nombre',
      ['Sí: tener getters y setters ya es encapsulamiento', 'Sí, siempre que se llamen getX y setX por convención', 'No, porque en POO están prohibidos los getters'],
      'Encapsular no es poner métodos delante de los atributos, sino proteger las reglas. Un setter sin validación equivale a un atributo público.'],
    ['¿Qué riesgo tiene este método?',
      'Quien recibe el array puede alterar el historial sin control',
      ['Ninguno: TypeScript impide modificar arrays devueltos por un método', 'El array se vacía después de devolverlo', 'Duplica la memoria en cada llamada'],
      'Devolver una referencia a una colección interna rompe el encapsulamiento. Es mejor devolver una copia o una vista de solo lectura.',
      `
class Cuenta {
  private movimientos: Movimiento[] = [];

  getMovimientos(): Movimiento[] {
    return this.movimientos;
  }
}`],
    ['¿Qué opción respeta mejor el encapsulamiento de una cuenta bancaria?',
      'Exponer retirar(monto), que valida y registra el movimiento',
      ['Hacer público el saldo para simplificar el código', 'Agregar setSaldo(valor) para que cada uno lo ajuste', 'Validar el saldo en cada lugar del código que lo modifique directamente'],
      'La operación con nombre del negocio concentra las reglas en un solo lugar y deja el estado protegido.'],
    ['¿Qué propone el consejo "Tell, don\'t ask" (dile, no le preguntes)?',
      'Pedirle al objeto que actúe en vez de decidir por fuera con sus datos',
      ['Preguntar siempre con un if el estado del objeto antes de llamar a sus métodos', 'Evitar los getters y leer los atributos directamente', 'Usar excepciones en lugar de valores de retorno'],
      'Si la decisión se toma fuera del objeto, la regla queda repartida. Llevarla al objeto la mantiene encapsulada.'],
    ['Este código aparece en un servicio de envíos. ¿Cuál es la mejora?',
      'Llevar la regla a un método pedido.enviar()',
      ['Copiar la condición en cada servicio que la use', 'Convertir el estado en una constante global', 'Mover el if a una clase de utilidades estática'],
      'La regla "solo se envía un pedido pagado y con productos" pertenece al Pedido. Fuera de él se duplica y se olvida.',
      `
if (pedido.estado === 'pagado' && pedido.items.length > 0) {
  pedido.estado = 'enviado';
}`],
    ['En TypeScript, ¿qué opción impide acceder a un atributo desde fuera de la clase, incluso desde sus subclases?',
      'private o un campo privado con #',
      ['protected', 'public', 'readonly (solo lectura desde fuera)'],
      'protected deja ver el atributo a las subclases y readonly impide escribirlo, pero no leerlo. private y # lo restringen a la propia clase.'],
    ['¿Cuál es el beneficio principal del encapsulamiento a largo plazo?',
      'Cambiar la representación interna sin romper a quien usa la clase',
      ['Reducir la memoria que ocupa cada objeto creado', 'Evitar tener que documentar la interfaz pública', 'Permitir que una clase herede de varias clases base al mismo tiempo'],
      'Si el resto del sistema solo usa las operaciones públicas, puedes reorganizar los datos internos con libertad.'],
  ],

  herencia: [
    ['¿Qué es la herencia?',
      'Una clase hija reutiliza y especializa a una clase base',
      ['Un objeto guarda a otros objetos como partes suyas y controla su vida', 'Una clase oculta sus atributos al resto', 'Dos clases se comunican mediante eventos'],
      'La hija obtiene lo que define la base y puede añadir o redefinir comportamiento.'],
    ['¿Por qué se dice que la herencia crea un acoplamiento fuerte?',
      'La hija depende de los detalles internos de la base',
      ['Obliga a declarar interfaces en todo el sistema para poder heredar', 'Impide que las hijas definan métodos propios', 'Hace que los programas se ejecuten más lento'],
      'La hija conoce la implementación de la base, no solo su contrato: un cambio en la base puede romper a todas sus hijas.'],
    ['¿Cuándo tiene sentido usar herencia?',
      'Cuando la hija "es un" caso de la base y puede sustituirla',
      ['Cuando quieres reutilizar un método útil de otra clase', 'Siempre que dos clases compartan algún atributo', 'Cuando una clase supera las doscientas líneas'],
      'La relación "es un" con sustitución segura (Liskov) es la señal correcta. Para solo reutilizar código, conviene la composición.'],
    ['Pedido extiende ListaDeCompras solo para reutilizar agregarItem(). ¿Cuál es el problema?',
      'Pedido no es una lista y hereda métodos que no le corresponden',
      ['Ninguno: reutilizar código es el fin de la herencia', 'TypeScript no permite heredar métodos públicos', 'Pedido también debería heredar de Factura para completar la jerarquía'],
      'Heredar por comodidad expone métodos que no tienen sentido en la hija. Aquí convendría que Pedido guarde una lista y le delegue.'],
    ['¿Qué problema de diseño muestra este código?',
      'Cuadrado rompe lo que esperan quienes usan Rectangulo',
      ['Ninguno: es un uso correcto de la herencia', 'Los atributos deberían ser públicos', 'Rectangulo debería heredar de Cuadrado, que es el caso más general'],
      'Un código que fija ancho 5 y alto 4 espera área 20; con un Cuadrado obtiene 16. La herencia solo es correcta si la hija respeta lo que promete la base.',
      `
class Rectangulo {
  constructor(protected ancho: number, protected alto: number) {}
  setAncho(v: number) { this.ancho = v; }
  setAlto(v: number) { this.alto = v; }
  area() { return this.ancho * this.alto; }
}

class Cuadrado extends Rectangulo {
  setAncho(v: number) { this.ancho = v; this.alto = v; }
  setAlto(v: number) { this.ancho = v; this.alto = v; }
}`],
    ['¿A qué se refiere el problema de la "clase base frágil"?',
      'Cambios en la base rompen subclases que dependían de ella',
      ['A una clase base que no tiene métodos abstractos', 'A una clase base con muy pocos métodos públicos', 'A una clase base que no se puede instanciar por ser abstracta'],
      'Las subclases quedan atadas a la implementación de la base, así que modificarla tiene efectos difíciles de prever.'],
    ['¿Cuál es la alternativa recomendada a la herencia cuando solo quieres reutilizar comportamiento?',
      'Composición: guardar otro objeto y delegarle',
      ['Copiar el método en cada clase que lo use', 'Convertir los métodos compartidos en estáticos', 'Heredar de varias clases a la vez'],
      'Con composición reutilizas sin heredar detalles, y además puedes cambiar el objeto delegado en tiempo de ejecución.'],
    ['¿Para qué sirve super en una clase hija?',
      'Para llamar al constructor o a un método de la base',
      ['Para crear una nueva instancia de la clase hija', 'Para acceder a los atributos privados de la base', 'Para impedir que la clase se siga heredando'],
      'super permite reutilizar lo que hace la base, por ejemplo inicializar sus atributos en el constructor.'],
    ['¿Qué significa que un miembro sea protected?',
      'Lo ven la clase y sus subclases, pero no el exterior',
      ['Lo ve cualquier parte del programa que importe el módulo', 'Solo lo ve la propia clase', 'Solo se puede usar en métodos estáticos'],
      'protected abre el miembro a las subclases. Úsalo con cuidado: también es parte del contrato con ellas.'],
    ['Tu jerarquía tiene 6 niveles de herencia. ¿Qué suele indicar?',
      'Un diseño frágil y difícil de seguir',
      ['Un diseño muy reutilizable que conviene ampliar', 'Que se aplicaron bien los patrones de diseño', 'Que el programa será más eficiente'],
      'Para entender una clase hay que recorrer todos sus ancestros. Conviene revisar si la composición encaja mejor.'],
  ],

  polimorfismo: [
    ['¿Qué es el polimorfismo?',
      'Que objetos distintos respondan a su manera al mismo mensaje',
      ['Que una clase tenga atributos de muchos tipos distintos', 'Convertir un objeto en otro tipo mediante un cast', 'Crear muchas instancias distintas a partir de la misma clase base'],
      'Quien envía el mensaje no necesita saber la clase concreta: cada objeto sabe cómo responder.'],
    ['¿Cómo se aplicaría el polimorfismo a este código?',
      'Que cada medio implemente cobrar() y llamar a medio.cobrar()',
      ['Agregar un case nuevo por cada medio de pago', 'Cambiar el switch por una cadena de if/else más fácil de mantener', 'Guardar los tipos en constantes para no escribirlos mal'],
      'El switch sobre el tipo es la señal clásica de polimorfismo faltante: cada caso se convierte en una clase con la misma interfaz.',
      `
function cobrar(medio: Medio, monto: number) {
  switch (medio.tipo) {
    case 'tarjeta': /* ... */ break;
    case 'billetera': /* ... */ break;
    case 'transferencia': /* ... */ break;
  }
}`],
    ['¿Qué necesita saber el código que envía un mensaje polimórfico?',
      'Solo que el objeto cumple el contrato',
      ['La clase concreta exacta del objeto', 'Cómo está implementado el método por dentro', 'Cuántas instancias existen de cada clase'],
      'Esa ignorancia es la ventaja: el código queda abierto a nuevas implementaciones.'],
    ['¿Cuál de estos grupos de patrones se apoya directamente en el polimorfismo?',
      'Strategy, State y Command',
      ['Singleton, Facade y Flyweight', 'Builder, Prototype y Singleton', 'Ninguno: los patrones lo evitan'],
      'Strategy cambia el algoritmo, State el comportamiento según el estado y Command la acción: siempre detrás de una interfaz común.'],
    ['¿Con qué mecanismo se consigue el polimorfismo en tiempo de ejecución en lenguajes como TypeScript, Java o C#?',
      'Implementando o sobrescribiendo métodos de un tipo común',
      ['Sobrecargando métodos con distintos parámetros', 'Compartiendo variables globales entre clases', 'Declarando las variantes posibles como constantes de un enum'],
      'Qué método se ejecuta se decide según el objeto real. La sobrecarga, en cambio, se resuelve al compilar.'],
    ['El cobro de un pedido recorre sus partes y llama a medio.cobrar(monto). ¿Qué hay que hacer para aceptar pagos con cripto?',
      'Crear la clase PagoCripto; cobrarPedido no cambia',
      ['Modificar cobrarPedido para que reconozca el medio', 'Reescribir los medios de pago que ya existen', 'Agregar un case nuevo en el switch de cobro'],
      'Gracias al polimorfismo, lo nuevo se añade con código nuevo y el código existente no se toca.'],
    ['En JavaScript o Python, ¿hay polimorfismo sin declarar interfaces?',
      'Sí: basta con que el objeto tenga el método (duck typing)',
      ['No: el polimorfismo requiere herencia de clases', 'No: solo existe en lenguajes con tipos estáticos como Java o C#', 'Sí, pero solo si se usan clases abstractas'],
      '"Si camina como un pato y grazna como un pato…": lo que importa es que el objeto responda al mensaje.'],
    ['¿Qué demuestra este código?',
      'Polimorfismo: cada forma calcula su propia área',
      ['Encapsulamiento: area() es un método público', 'Agregación: hay una lista de formas', 'Herencia múltiple entre Circulo y Rect'],
      'El reduce trata igual a todas las formas; cada una responde a area() a su manera, sin preguntar su tipo.',
      `
interface Forma { area(): number; }

class Circulo implements Forma { constructor(private r: number) {} area() { return Math.PI * this.r ** 2; } }
class Rect implements Forma { constructor(private a: number, private b: number) {} area() { return this.a * this.b; } }

const total = formas.reduce((suma, f) => suma + f.area(), 0);`],
    ['¿Cuál es una señal de que en tu código falta polimorfismo?',
      'El mismo switch sobre el tipo se repite en varios lugares',
      ['Hay muchas interfaces pequeñas en el proyecto con un solo método cada una', 'Las clases reciben parámetros en el constructor', 'Se usa composición en lugar de herencia'],
      'Cada switch repetido hay que actualizarlo al agregar un tipo. Con polimorfismo, el comportamiento vive en cada clase.'],
    ['¿Qué relación tiene el polimorfismo con el principio Abierto/Cerrado?',
      'Permite extender con clases nuevas sin modificar a quien las usa',
      ['Ninguna: son ideas completamente independientes', 'Obliga a modificar el código existente cada vez que aparece un caso nuevo', 'Lo reemplaza: con polimorfismo ya no hace falta OCP'],
      'El polimorfismo es la herramienta más común para cumplir OCP: el código queda cerrado a cambios y abierto a extensiones.'],
  ],

  dependencia: [
    ['¿Qué es una relación de dependencia entre clases?',
      'A usa a B durante una operación, sin guardar referencia',
      ['A guarda a B como atributo durante toda su vida', 'A crea a B y controla su ciclo de vida', 'A hereda los métodos públicos de B'],
      'Es el vínculo más débil: B aparece en un método (como parámetro o variable local) y desaparece cuando termina.'],
    ['¿Cómo se dibuja una dependencia en UML?',
      'Línea discontinua con flecha abierta',
      ['Línea continua con rombo relleno', 'Línea continua con rombo hueco', 'Línea continua con triángulo hueco'],
      'La línea discontinua indica un uso temporal. Rombos y triángulos son para agregación, composición y herencia.'],
    ['¿Qué relación hay entre GeneradorFactura y CalculadoraImpuestos?',
      'Dependencia',
      ['Composición', 'Agregación', 'Herencia'],
      'La calculadora llega como parámetro, se usa en emitir() y no se guarda: es una dependencia.',
      `
class GeneradorFactura {
  emitir(items: Item[], pais: string, calculadora: CalculadoraImpuestos): Factura {
    const subtotal = items.reduce((t, i) => t + i.precio, 0);
    return new Factura(subtotal * (1 + calculadora.tasaPara(pais)));
  }
}`],
    ['Comparada con la asociación, la agregación y la composición, ¿cómo es el acoplamiento de una dependencia?',
      'El más débil de las cuatro',
      ['El más fuerte de las cuatro', 'Igual al de la composición', 'Nulo: no genera acoplamiento'],
      'Sigue habiendo acoplamiento (si B cambia, A puede verse afectada), pero es el menor.'],
    ['¿Qué relación muestra este método?',
      'Dependencia: se crea y se usa sin guardarlo',
      ['Composición: el objeto se crea con new', 'Asociación: queda una referencia al objeto', 'Agregación: es una parte del informe'],
      'Que se cree con new no lo convierte en composición: lo que importa es que no se guarda como parte del objeto.',
      `
class Informe {
  fecha(d: Date): string {
    const formato = new FormateadorFecha('es-PE');
    return formato.formatear(d);
  }
}`],
    ['Si cambia la firma de CalculadoraImpuestos.tasaPara(), ¿qué se ve afectado en GeneradorFactura?',
      'El método que la usa, aunque no guarde la referencia',
      ['Nada: una dependencia no genera acoplamiento', 'Solo las pruebas automáticas, porque no hay referencia guardada', 'Todos los atributos de GeneradorFactura'],
      'La dependencia es débil, pero existe: el código que llama al método depende de su firma.'],
    ['¿Qué ventaja tiene recibir la dependencia como parámetro en lugar de crearla dentro del método?',
      'Quien llama elige la implementación, por ejemplo una falsa',
      ['El método se ejecuta más rápido al no usar new', 'Ya no hace falta declarar ninguna interfaz para la calculadora', 'La relación se convierte en una composición'],
      'Es inyección de dependencias en su forma más simple: el método no decide con qué trabaja.'],
    ['¿Cuándo una dependencia se convierte en una asociación?',
      'Cuando la referencia se guarda como atributo',
      ['Cuando el parámetro es de tipo interfaz', 'Cuando el método pasa a ser público', 'Cuando el método se vuelve asíncrono'],
      'La diferencia está en el tiempo: en la asociación, A conoce a B de forma sostenida.'],
    ['Un método estático auditar(evento, registro: Registro) usa el registro recibido para escribir el evento. ¿Qué relación tiene con Registro?',
      'Dependencia',
      ['Asociación', 'Composición', 'Agregación'],
      'El registro llega como parámetro y no se guarda en ningún atributo: es una dependencia.'],
    ['En el diagrama de Factory Method, la flecha "crea" va del creador al producto. ¿Qué relación UML suele usarse?',
      'Dependencia (línea discontinua)',
      ['Composición (rombo relleno)', 'Herencia (triángulo hueco)', 'Agregación (rombo hueco)'],
      'El creador instancia el producto y lo devuelve; no lo guarda como parte suya. Por eso se dibuja como dependencia.'],
  ],

  asociacion: [
    ['¿Qué es una asociación entre clases?',
      'A guarda una referencia a B, pero ambas viven por separado',
      ['A usa a B solo durante un método y la descarta', 'A crea a B en su constructor y B desaparece junto con A', 'A es un caso particular de B y la sustituye'],
      'La asociación es un conocimiento sostenido, sin que una sea parte de la otra.'],
    ['¿Cómo se dibuja una asociación en UML?',
      'Línea continua; la flecha opcional indica quién conoce a quién',
      ['Línea discontinua con una flecha abierta', 'Línea continua con un rombo relleno del lado que conoce a la otra', 'Línea continua con un triángulo hueco'],
      'La línea continua indica una referencia guardada. La flecha marca la navegabilidad.'],
    ['¿Qué relación hay entre CuentaUsuario y PerfilPublico?',
      'Asociación',
      ['Dependencia', 'Composición', 'Herencia'],
      'La cuenta guarda una referencia al perfil y colabora con él, pero ambos viven por separado.',
      `
class CuentaUsuario {
  constructor(private readonly perfil: PerfilPublico) {}

  actualizarBiografia(texto: string) {
    this.perfil.cambiarBiografia(texto);
  }
}`],
    ['En UML, una asociación con flecha de A hacia B significa que…',
      'A conoce a B, pero B no tiene por qué conocer a A',
      ['B hereda los métodos públicos de A y puede sustituirla', 'A crea a B y controla su ciclo de vida', 'B es una parte que pertenece a A'],
      'La flecha indica navegabilidad: desde A se llega a B.'],
    ['¿Qué significa la multiplicidad 1..* en un extremo de una asociación?',
      'Al menos uno y como máximo muchos',
      ['Exactamente uno, ni más ni menos', 'Cero o uno como máximo', 'Cualquier cantidad, incluso ninguno'],
      'La multiplicidad indica cuántos objetos pueden participar: 1..* exige al menos uno. "Cualquier cantidad" sería 0..*.'],
    ['¿Qué riesgo tiene una asociación bidireccional (A conoce a B y B conoce a A)?',
      'Hay que mantener ambas referencias sincronizadas',
      ['Ninguno: siempre es preferible a la unidireccional', 'No se puede representar en un diagrama UML', 'Obliga a que una clase herede de la otra'],
      'Si se actualiza un lado y se olvida el otro, el modelo queda inconsistente. Además aumenta el acoplamiento.'],
    ['Un Médico guarda la lista de Pacientes que atiende; ambos existen por su cuenta y un paciente puede tener varios médicos. ¿Qué relación es?',
      'Asociación de muchos a muchos',
      ['Composición: el médico es dueño del paciente', 'Herencia: Paciente extiende a Médico', 'Dependencia: el médico lo usa un momento'],
      'Ninguno es parte del otro ni controla su ciclo de vida, y la referencia se guarda: es una asociación.'],
    ['¿En qué se diferencia una asociación de una agregación?',
      'La agregación añade el sentido "todo-parte"',
      ['No hay ninguna diferencia entre ambas', 'La agregación se dibuja con línea discontinua', 'La asociación controla el ciclo de vida'],
      'Toda agregación es una asociación, pero con un significado extra: el todo agrupa partes.'],
    ['En el patrón Mediator, cada componente guarda una referencia al mediador para avisarle. ¿Qué relación tiene el componente con el mediador?',
      'Asociación',
      ['Composición', 'Herencia', 'Dependencia'],
      'El componente conoce al mediador de forma sostenida, pero no es su dueño.'],
    ['Si en lugar de guardar la referencia como atributo la recibes como parámetro de un solo método, ¿cómo cambia la relación?',
      'De asociación pasa a dependencia',
      ['De composición pasa a herencia', 'De agregación pasa a composición', 'No cambia: sigue siendo la misma'],
      'Al no guardar la referencia, la clase solo depende de la otra durante esa operación, con menos acoplamiento.'],
  ],

  agregacion: [
    ['¿Qué es una agregación?',
      'Un todo-parte donde las partes pueden existir sin el todo',
      ['Un todo-parte donde las partes se crean y mueren con el todo', 'Un uso temporal de otra clase dentro de un método', 'Una clase que especializa a otra más general'],
      'El todo agrupa partes que no le pertenecen en exclusiva.'],
    ['¿Cómo se dibuja una agregación en UML?',
      'Rombo hueco del lado del todo',
      ['Rombo relleno del lado del todo', 'Rombo hueco del lado de la parte', 'Triángulo hueco del lado del todo'],
      'Rombo hueco: agregación. Rombo relleno: composición. Siempre del lado del todo.'],
    ['¿Qué relación hay entre EquipoDesarrollo e Ingeniero?',
      'Agregación',
      ['Composición', 'Herencia', 'Dependencia'],
      'Los ingenieros llegan desde fuera, existen antes que el equipo y siguen existiendo si el equipo se disuelve.',
      `
class EquipoDesarrollo {
  constructor(private readonly integrantes: Ingeniero[]) {}

  habilidades(): string[] {
    return this.integrantes.flatMap((i) => i.habilidades);
  }
}`],
    ['Una playlist agrupa canciones; si borras la playlist, las canciones siguen en tu biblioteca. ¿Qué relación es?',
      'Agregación',
      ['Composición', 'Herencia', 'Dependencia'],
      'Las canciones no dependen de la playlist para existir y pueden estar en varias.'],
    ['Si un equipo de desarrollo se disuelve, ¿qué pasa con sus ingenieros en una agregación?',
      'Siguen existiendo y pueden unirse a otro equipo',
      ['Se eliminan automáticamente con el equipo', 'Se eliminan también, porque el equipo era su dueño', 'Pasan a formar parte de la clase base'],
      'En la agregación, el ciclo de vida de las partes es independiente del todo.'],
    ['¿Qué pista en el código suele indicar agregación en lugar de composición?',
      'El todo recibe partes ya creadas desde fuera',
      ['El todo crea sus partes con new en el constructor', 'Las partes se declaran como readonly en el todo', 'Las partes se guardan en un atributo privado'],
      'Si el todo recibe partes ya creadas, no es su dueño exclusivo: es la señal típica de agregación.'],
    ['En el patrón Observer, el sujeto mantiene una lista de observadores que existen por su cuenta. ¿Qué relación tiene con ellos?',
      'Agregación',
      ['Composición', 'Herencia', 'Dependencia'],
      'El sujeto agrupa observadores que se suscriben y se dan de baja; no los crea ni controla su vida.'],
    ['¿Cuál de estos ejemplos es una agregación y no una composición?',
      'Un departamento y los profesores que trabajan en él',
      ['Una factura y sus líneas de detalle', 'Una casa y las habitaciones que la forman', 'Un pedido y sus líneas de pedido'],
      'Un profesor puede cambiar de departamento y existir sin él. Las líneas o habitaciones no tienen sentido fuera de su todo.'],
    ['En una agregación, ¿una parte puede pertenecer a varios todos a la vez?',
      'Sí, porque el todo no es su dueño exclusivo',
      ['No: cada parte pertenece a un solo todo', 'Solo si la parte hereda del todo', 'No: en UML cada parte pertenece a un solo todo'],
      'Una canción puede estar en varias playlists. En composición, en cambio, la parte pertenece a un solo todo.'],
    ['¿Cuál es la diferencia práctica más importante entre agregación y composición?',
      'Quién controla el ciclo de vida de las partes',
      ['El lenguaje en que se puede implementar cada una', 'Si las partes se guardan en un arreglo o no', 'Si las partes tienen métodos públicos'],
      'En la agregación, al eliminar el todo las partes siguen existiendo; en la composición desaparecen con él.'],
  ],

  composicion: [
    ['¿Qué es una composición?',
      'Un todo-parte donde el todo es dueño de sus partes',
      ['Un todo-parte donde las partes viven por su cuenta', 'Un uso temporal de otra clase dentro de un método', 'Una clase que hereda de varias a la vez'],
      'El todo crea sus partes y estas no existen fuera de él: es la relación con más acoplamiento.'],
    ['¿Cómo se dibuja una composición en UML?',
      'Rombo relleno del lado del todo',
      ['Rombo hueco del lado del todo', 'Línea discontinua con flecha abierta', 'Triángulo hueco del lado de la base'],
      'El rombo relleno indica propiedad exclusiva.'],
    ['¿Qué relación hay entre OrdenCompra y LineaOrden?',
      'Composición',
      ['Agregación', 'Asociación', 'Dependencia'],
      'La orden crea sus líneas y es su dueña; una línea no tiene sentido fuera de su orden.',
      `
class OrdenCompra {
  private readonly lineas: LineaOrden[] = [];

  agregarProducto(productoId: string, cantidad: number, precio: number) {
    this.lineas.push(new LineaOrden(productoId, cantidad, precio));
  }
}`],
    ['¿Qué relación hay entre una Factura y sus líneas de detalle?',
      'Composición',
      ['Agregación', 'Herencia', 'Dependencia'],
      'Las líneas se crean para esa factura y no tienen sentido fuera de ella.'],
    ['En una composición, si se elimina la orden de compra, ¿qué pasa con sus líneas?',
      'Desaparecen con ella',
      ['Pasan a la siguiente orden', 'Siguen existiendo por separado', 'Quedan guardadas en un historial'],
      'Las partes de una composición comparten el ciclo de vida del todo.'],
    ['¿A qué se refiere el consejo "prefiere la composición a la herencia"?',
      'A reutilizar guardando un objeto y delegándole',
      ['A dibujar siempre rombos rellenos en UML', 'A evitar las interfaces y usar siempre clases concretas', 'A crear todas las partes en el constructor'],
      'Aquí "composición" se usa en sentido amplio: combinar objetos. Es más flexible que heredar y no expone detalles de la base.'],
    ['¿Qué relación muestra este código?',
      'Composición: Auto crea y posee su motor',
      ['Agregación: el motor podría existir solo', 'Herencia: Auto usa los métodos de Motor', 'Dependencia: solo se llama a encender()'],
      'El motor se crea dentro del auto, es privado y nadie más lo comparte.',
      `
class Auto {
  private readonly motor = new Motor();

  arrancar() {
    this.motor.encender();
  }
}`],
    ['¿Por qué en una composición no conviene entregar las partes para que otros objetos las guarden?',
      'Porque el todo pierde la propiedad exclusiva de sus partes',
      ['Porque las partes deben ser siempre abstractas', 'Porque la notación UML no permite dibujarlo', 'Porque las partes se copiarían en memoria cada vez que se entregan'],
      'Otro objeto podría seguir usando la parte cuando el todo ya no existe, y el todo pierde el control sobre sus reglas.'],
    ['¿Cuál es el orden de las relaciones de menor a mayor acoplamiento?',
      'Dependencia, asociación, agregación, composición',
      ['Composición, agregación, asociación, dependencia', 'Asociación, dependencia, composición, agregación', 'Agregación, composición, dependencia, asociación'],
      'De un uso temporal a una propiedad exclusiva: cada paso ata más a las clases.'],
    ['El patrón Decorator añade comportamiento a un objeto sin crear subclases. ¿En qué se apoya?',
      'En la composición de objetos',
      ['En la herencia múltiple', 'En variables globales compartidas', 'En una sola instancia global'],
      'Decorator guarda el objeto envuelto y le delega las llamadas: es el ejemplo clásico de "prefiere la composición a la herencia".'],
  ],
});
