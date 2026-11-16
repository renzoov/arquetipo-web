// Comments in the TypeScript examples (src/codigo/typescript). Comments that show what the program
// prints are kept as they are, because the program's output is in Spanish.
import type { Diccionario } from '../../comentarios.ts';

const igual = (...textos: string[]) => Object.fromEntries(textos.map((t) => [t, t]));

export default {
  ...igual(
    '1', '3', '13200', '120 resultados', '5.40', '59.40', 'true', 'false',
    '→ consultando USD, reintento 1..., 3.75',
    'Sedán electrico/automatica [Techo solar] 29600 USD',
    'Sedán electrico/automatica [] 29000 USD',
    'Sedán gasolina/manual [] 20000 USD',
    'Auto Total: Choque, Robo, Auto de reemplazo (2 cláusulas)',
    'Acceso denegado a la historia P-90',
    'No se puede cancelar un pedido enviado',
    'ciudad 210 · nacional 214.4 · internacional 260 · campania 200',
    "{ estado: 'aprobado', operacion: 'TX-tok_1111' }",
    "{ estado: 'rechazado', motivo: 'Código del proveedor 05' }",
    '{ aprobado: true }',
    "[ 'teclado 110', 'mouse 44', 'monitor 900 (inactivo)' ]",
    "[ 'teclado 100', 'mouse 40', 'monitor 900' ]",
    "[ 'Ana', 'Luis', 'Marta' ]",
    "{ serie: 'F001-000123', constancia: 'CONSTANCIA-52' }",
    "[ 'F-002: banco 75, ventas 80' ]",
    "[ 'F-003: banco 40, ventas sin registro' ]",
    "[ 'Premium', 'Económica' ] 25 resultados",
    '500 3000 8 resultados',
  ),
  'SDK de un tercero: no se puede modificar': 'Third-party SDK: it cannot be modified',
  'un CSV no tiene título': 'a CSV has no title',
  'Rango de precio inválido': 'Invalid price range',
  'Director: recetas que siempre ejecutan los mismos pasos': 'Director: recipes that always run the same steps',
  'el proveedor falla a veces': 'the provider sometimes fails',
  'Ancho fijo: fecha (10) + referencia (8) + monto (resto)': 'Fixed width: date (10) + reference (8) + amount (rest)',
  '100000 celdas comparten 4 formatos': '100000 cells share 4 formats',
  'regla: no hay eléctricos manuales': 'rule: there are no manual electric cars',
  'ya no se emite factura': 'no invoice is issued anymore',
  'Registro de prototipos: plantillas configuradas una sola vez': 'Prototype registry: templates configured only once',
  'reembolsa y cancela': 'refunds and cancels',
  'gancho': 'hook',
  'se elige UNA vez; todo lo demás es de la misma familia': 'chosen ONCE; everything else belongs to the same family',
  '── Uso ──': '── Usage ──',
  '── Uso: cualquier reporte con cualquier formato ──': '── Usage: any report with any format ──',
  'límite diario': 'daily limit',
  'país': 'country',
  '── Uso ──\nEl orden importa: la caché va por fuera para no registrar ni reintentar lo que ya está guardado.':
    '── Usage ──\nOrder matters: the cache goes on the outside so it does not log or retry what is already stored.',
  '── Uso: 100 000 celdas ──': '── Usage: 100,000 cells ──',
  '── Uso: la modalidad la elige el cliente en tiempo de ejecución ──': '── Usage: the customer picks the shipping method at runtime ──',
  'Método plantilla: el orden de los pasos es siempre el mismo': 'Template method: the order of the steps is always the same',
  'paso común': 'common step',
  'referencia a un objeto compartido': 'reference to a shared object',
  'Las familias se describen con interfaces y cada fábrica devuelve objetos literales que cumplen\nesas interfaces. La fábrica se elige con un `Record<Entorno, ...>` tipado en lugar de un switch:\nsi añades un entorno al tipo, el compilador te obliga a registrar su fábrica.':
    'The families are described with interfaces, and each factory returns object literals that satisfy\nthose interfaces. The factory is picked with a typed `Record<Entorno, ...>` instead of a switch:\nif you add an environment to the type, the compiler forces you to register its factory.',
  'El adaptador implementa la interfaz propia y traduce los tipos del proveedor. Una unión\ndiscriminada (`ResultadoPago`) reemplaza los códigos numéricos: el compilador obliga a\nquien la usa a tratar cada caso.':
    'The adapter implements our own interface and translates the provider\'s types. A discriminated\nunion (`ResultadoPago`) replaces the numeric codes: the compiler forces whoever uses it\nto handle every case.',
  '── Uso: el checkout solo conoce PasarelaPago ──': '── Usage: checkout only knows PasarelaPago ──',
  'La "implementación" es una interfaz y la "abstracción" una clase abstracta que la recibe por\nconstructor con `protected readonly` (parameter properties). Para que el ejemplo se pueda\nejecutar, los formatos son Markdown y CSV; en producción serían PDF o Excel.':
    'The "implementation" is an interface and the "abstraction" an abstract class that receives it through\nthe constructor with `protected readonly` (parameter properties). So the example can run,\nthe formats are Markdown and CSV; in production they would be PDF or Excel.',
  'Los campos privados `#` guardan el estado del builder, los métodos devuelven `this` para\nencadenar y el producto se entrega congelado (`Object.freeze`) con propiedades `readonly`.\nLos tipos literales (`Orden`) impiden pasar un criterio de orden que no existe.':
    'The private `#` fields hold the builder\'s state, the methods return `this` for chaining\nand the product is handed over frozen (`Object.freeze`) with `readonly` properties.\nLiteral types (`Orden`) prevent passing a sort order that does not exist.',
  'Cada eslabón implementa `detectar` de forma asíncrona y devuelve `string | null`. El resultado es\nuna unión discriminada: si `aprobado` es false, el compilador sabe que existe `motivo`.\nLa cadena se arma encadenando `enlazar`, que devuelve el eslabón añadido.':
    'Each link implements `detectar` asynchronously and returns `string | null`. The result is\na discriminated union: if `aprobado` is false, the compiler knows that `motivo` exists.\nThe chain is built by chaining `enlazar`, which returns the link just added.',
  'Los comandos implementan una interfaz con métodos `async` y una descripción para la auditoría.\nEl historial es un array usado como pila, y `?.` evita comprobar si está vacío al deshacer.':
    'The commands implement an interface with `async` methods and a description for the audit log.\nThe history is an array used as a stack, and `?.` avoids checking whether it is empty when undoing.',
  'Hoja y compuesto comparten una interfaz. El compuesto suma con `reduce` y un generador\nrecursivo (`yield*`) permite recorrer todo el árbol sin exponer cómo está guardado.':
    'Leaf and composite share an interface. The composite adds up with `reduce`, and a recursive\ngenerator (`yield*`) walks the whole tree without exposing how it is stored.',
  'Cada decorador es una clase pequeña que implementa la misma interfaz y recibe al envuelto por\nconstructor. Ojo: no confundir con los decoradores `@` de TypeScript, que son otra cosa\n(anotaciones sobre clases y métodos).':
    'Each decorator is a small class that implements the same interface and receives the wrapped\nobject through the constructor. Careful: do not confuse it with TypeScript\'s `@` decorators,\nwhich are something else (annotations on classes and methods).',
  '3.75 (desde la caché, sin llamar a la API)': '3.75 (from the cache, without calling the API)',
  'La fachada recibe el subsistema por constructor (con valores por defecto, así es fácil de usar\ny de sustituir en pruebas) y expone una única función `async`. Las clases del subsistema no\nse exportan: fuera de este módulo solo se ve la fachada.':
    'The facade receives the subsystem through the constructor (with default values, so it is easy to use\nand to replace in tests) and exposes a single `async` function. The subsystem\'s classes are not\nexported: outside this module only the facade is visible.',
  '── Uso: una sola línea en cada cliente ──': '── Usage: a single line in each client ──',
  'La clase abstracta declara el método fábrica como `protected abstract`: el compilador obliga a\ncada subclase a implementarlo. Gracias al tipado estructural, un lector solo necesita cumplir\nla forma de `LectorExtracto`.':
    'The abstract class declares the factory method as `protected abstract`: the compiler forces\nevery subclass to implement it. Thanks to structural typing, a reader only needs to match\nthe shape of `LectorExtracto`.',
  'El flyweight es un objeto congelado con `Object.freeze` y tipado como `Readonly<...>`, así que\nnadie puede modificar un formato compartido. La fábrica usa un `Map` con una clave compuesta.':
    'The flyweight is an object frozen with `Object.freeze` and typed as `Readonly<...>`, so\nnobody can change a shared format. The factory uses a `Map` with a composite key.',
  'encabezado o datos': 'header or data',
  'texto o monto': 'text or amount',
  'true: es el mismo objeto': 'true: it is the same object',
  'Cada elemento de la gramática es una clase que implementa `Expresion`; los no terminales\nguardan sus subexpresiones con parameter properties. Una alternativa muy habitual en\nTypeScript es modelar el árbol como unión discriminada y evaluarlo con un `switch`.':
    'Each element of the grammar is a class that implements `Expresion`; the non-terminals\nstore their subexpressions with parameter properties. A very common alternative in\nTypeScript is to model the tree as a discriminated union and evaluate it with a `switch`.',
  '── Uso ──\nÁrbol de la regla: total > 100 Y cliente_frecuente O cupon = "VERANO"\n(en la aplicación real lo construiría un parser a partir del texto)':
    '── Usage ──\nTree for the rule: total > 100 Y cliente_frecuente O cupon = "VERANO"\n(in the real application a parser would build it from the text)',
  'Un generador asíncrono (`async *`) implementa `AsyncIterable` y el cliente lo recorre con\n`for await`: no hace falta escribir `next()` a mano. Además el recorrido es perezoso: si el\ncliente sale del bucle antes, no se piden más páginas.':
    'An async generator (`async *`) implements `AsyncIterable` and the client walks it with\n`for await`: there is no need to write `next()` by hand. The traversal is also lazy: if the\nclient leaves the loop early, no more pages are requested.',
  'API simulada que devuelve los clientes de dos en dos': 'Simulated API that returns the customers two at a time',
  'Perezoso: si se corta antes, no se piden más páginas': 'Lazy: if it stops early, no more pages are requested',
  'Los eventos se tipan con una unión de literales (`\'cambio\' | \'limpiar\'`), y `?.` permite que un\ncomponente avise aunque todavía no tenga mediador. Solo el mediador conoce a todos.':
    'Events are typed as a union of literals (`\'cambio\' | \'limpiar\'`), and `?.` lets a component\nnotify even if it does not have a mediator yet. Only the mediator knows everyone.',
  'El estado vive en un campo privado `#` que nadie puede leer desde fuera. El memento expone el\nestado como `Readonly` y `structuredClone` hace la copia profunda al guardar y al restaurar.':
    'The state lives in a private `#` field that nobody can read from outside. The memento exposes the\nstate as `Readonly`, and `structuredClone` makes the deep copy when saving and restoring.',
  '`suscribir` devuelve la función para darse de baja (el estilo habitual en JavaScript), los\nsuscriptores se guardan en un `Set` y cada uno se ejecuta en un try/catch para que un fallo\nno impida que los demás reciban el aviso.':
    '`suscribir` returns the function to unsubscribe (the usual JavaScript style), the\nsubscribers are kept in a `Set` and each one runs inside a try/catch so that one failure\ndoes not stop the others from being notified.',
  'El clon se crea con el propio constructor para conservar la clase y sus métodos, y\n`structuredClone` copia en profundidad los datos planos mutables (las coberturas).\nLas cláusulas son `readonly string[]`, así que se pueden compartir sin riesgo.':
    'The clone is created with the object\'s own constructor to keep the class and its methods, and\n`structuredClone` deep-copies the mutable plain data (the coverages).\nThe clauses are `readonly string[]`, so they can be shared safely.',
  'Auto Total: Choque, Robo (2 cláusulas)  ← la plantilla no cambió': 'Auto Total: Choque, Robo (2 cláusulas)  ← the template did not change',
  'El proxy es una clase que implementa la misma interfaz que el objeto real; `??=` resuelve la\ncarga perezosa en una línea. JavaScript también ofrece el objeto nativo `Proxy`, útil para\ninterceptar cualquier propiedad de forma genérica, pero una clase explícita es más clara y tipada.':
    'The proxy is a class that implements the same interface as the real object; `??=` handles\nlazy loading in one line. JavaScript also offers the native `Proxy` object, useful for\nintercepting any property generically, but an explicit class is clearer and typed.',
  'solo se descarga la primera vez': 'only downloaded the first time',
  'no descarga imágenes': 'does not download images',
  'descarga': 'downloads',
  'reutiliza lo ya cargado': 'reuses what was already loaded',
  'Un módulo ES se evalúa una sola vez, así que exportar una instancia (`export const config = ...`)\nya funciona como singleton. La clase con constructor privado y un campo estático privado `#`\nse usa cuando la creación debe ser perezosa. `??=` crea la instancia solo la primera vez.':
    'An ES module is evaluated only once, so exporting an instance (`export const config = ...`)\nalready works as a singleton. The class with a private constructor and a private static `#` field\nis used when creation must be lazy. `??=` creates the instance only the first time.',
  'new Configuracion();  ← error de compilación: el constructor es privado': 'new Configuracion();  ← compile error: the constructor is private',
  'Cada estado es una clase. Una clase base abstracta rechaza por defecto todas las acciones\n(el método privado devuelve `never` porque siempre lanza un error), y cada estado solo\nsobrescribe lo que permite. El nombre del estado es un tipo literal.':
    'Each state is a class. An abstract base class rejects every action by default\n(the private method returns `never` because it always throws), and each state only\noverrides what it allows. The state\'s name is a literal type.',
  'Como las funciones son valores, una estrategia puede ser simplemente un tipo de función: no hace\nfalta una interfaz con una clase por algoritmo. `satisfies` comprueba que cada entrada del\ncatálogo es una estrategia válida sin perder los nombres de las claves (`Modalidad`).':
    'Since functions are values, a strategy can simply be a function type: there is no need\nfor an interface with one class per algorithm. `satisfies` checks that every entry in the\ncatalog is a valid strategy without losing the key names (`Modalidad`).',
  '`abstract` marca el paso obligatorio, los métodos `protected` con implementación por defecto\nson ganchos que las subclases pueden sobrescribir, y el paso común es privado (`#`), así que\nninguna subclase puede alterarlo.':
    '`abstract` marks the required step, the `protected` methods with a default implementation\nare hooks that subclasses can override, and the common step is private (`#`), so\nno subclass can change it.',
  'El visitante es genérico en su resultado (`VisitanteProducto<R>`), así que el mismo `aceptar`\nsirve para visitantes que devuelven números o textos. Al final se muestra la alternativa más\ncomún en TypeScript: una unión discriminada con un `switch` que el compilador revisa por completo.':
    'The visitor is generic in its result (`VisitanteProducto<R>`), so the same `aceptar`\nworks for visitors that return numbers or text. At the end you can see the most common\nalternative in TypeScript: a discriminated union with a `switch` the compiler checks exhaustively.',
  '── Alternativa idiomática en TypeScript: unión discriminada + switch exhaustivo ──': '── Idiomatic alternative in TypeScript: discriminated union + exhaustive switch ──',
  'error de compilación si falta un caso': 'compile error if a case is missing',
} satisfies Diccionario;
