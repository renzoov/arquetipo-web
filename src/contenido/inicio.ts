// Contenido de la página de inicio.
import type { Texto } from '../i18n/idiomas.ts';

export const META = {
  titulo: { es: 'Arquetipo · Patrones de diseño de software', en: 'Arquetipo · Software design patterns' },
  descripcion: {
    es: 'Guía gratuita de POO, principios de diseño, SOLID y los 23 patrones de diseño clásicos, con casos reales, diagramas y código en 8 lenguajes.',
    en: 'A free guide to OOP, design principles, SOLID and the 23 classic design patterns, with real cases, diagrams and code in 8 languages.',
  },
} satisfies Record<string, Texto>;

export const HERO = {
  etiqueta: { es: 'Guía de diseño de software', en: 'Software design guide' },
  titulo: { es: 'Escribe código que se pueda cambiar sin miedo', en: 'Write code you can change without fear' },
  texto: {
    es: 'POO, principios de diseño, SOLID y los 23 patrones de diseño clásicos, explicados con casos reales, diagramas y código. Pensado para quien ya programa y quiere diseñar mejor.',
    en: 'OOP, design principles, SOLID and the 23 classic design patterns, explained with real cases, diagrams and code. Made for people who already code and want to design better.',
  },
  verRuta: { es: 'Ver la ruta de aprendizaje', en: 'See the learning path' },
  irPatrones: { es: 'Ir a los patrones', en: 'Go to the patterns' },
  acoplado: { es: 'Acoplado', en: 'Coupled' },
  desacoplado: { es: 'Desacoplado', en: 'Decoupled' },
  comentarioAcoplado: { es: '// decide él mismo con qué trabaja', en: '// decides by itself what it works with' },
  notaAcoplado: {
    es: 'Cambiar de base de datos o probar la clase sin una real obliga a modificarla.',
    en: 'Switching databases or testing the class without a real one means modifying it.',
  },
  notaDesacoplado: {
    es: 'Recibe desde fuera lo que necesita: se cambia o se prueba sin tocarla.',
    en: 'It receives what it needs from outside: you can swap or test it without touching it.',
  },
} satisfies Record<string, Texto>;

export const RUTA = {
  etiqueta: { es: 'Por dónde empezar', en: 'Where to start' },
  titulo: { es: 'Ruta de aprendizaje', en: 'Learning path' },
  empezar: { es: 'Empezar →', en: 'Start →' },
  pasos: [
    { n: '01', transicion: 'titulo-poo', href: '/fundamentos/poo', icono: 'account_tree', color: 'text-secondary-container', fondo: 'bg-secondary-container/15 border-secondary-container/30',
      titulo: { es: 'Fundamentos de POO', en: 'OOP fundamentals' },
      texto: { es: 'Los 4 pilares y cómo se relacionan los objetos. La base de todo lo demás.', en: 'The 4 pillars and how objects relate to each other. The basis for everything else.' } },
    { n: '02', transicion: 'titulo-diseno', href: '/principios/diseno', icono: 'lightbulb', color: 'text-secondary-fixed', fondo: 'bg-secondary-container/10 border-secondary-container/25',
      titulo: { es: 'Principios de diseño', en: 'Design principles' },
      texto: { es: 'Cinco ideas que están detrás de SOLID y de todos los patrones.', en: 'Five ideas behind SOLID and every pattern.' } },
    { n: '03', transicion: 'titulo-solid', href: '/principios/solid', icono: 'memory', color: 'text-primary-container', fondo: 'bg-primary-container/15 border-primary-container/30',
      titulo: { es: 'Principios SOLID', en: 'SOLID principles' },
      texto: { es: 'Cinco guías para escribir código que se pueda cambiar sin miedo.', en: 'Five guidelines for writing code you can change without fear.' } },
    { n: '04', transicion: undefined, href: '/#patrones', icono: 'category', color: 'text-tertiary-fixed-dim', fondo: 'bg-tertiary-fixed-dim/15 border-tertiary-fixed-dim/30',
      titulo: { es: '23 patrones de diseño', en: '23 design patterns' },
      texto: { es: 'Soluciones probadas a problemas que se repiten, con casos reales.', en: 'Proven solutions to recurring problems, with real cases.' } },
    { n: '05', transicion: undefined, href: '/#lenguajes', icono: 'code_blocks', color: 'text-amber-300', fondo: 'bg-amber-400/10 border-amber-400/25',
      titulo: { es: 'En tu lenguaje', en: 'In your language' },
      texto: { es: 'Cada patrón aplicado de forma idiomática en 8 lenguajes.', en: 'Every pattern applied idiomatically in 8 languages.' } },
  ],
};

export const PILARES_RESUMEN = {
  paso: { es: 'Paso 01', en: 'Step 01' },
  titulo: { es: 'Los 4 pilares de la POO', en: 'The 4 pillars of OOP' },
  verGuia: { es: 'Ver guía completa →', en: 'See the full guide →' },
  regla: { es: 'REGLA PRÁCTICA:', en: 'RULE OF THUMB:' },
  reglaTexto: {
    es: 'prefiere la composición a la herencia cuando solo quieres reutilizar código.',
    en: 'prefer composition over inheritance when you only want to reuse code.',
  },
  pilares: [
    { id: 'encapsulamiento', icono: 'lock', color: 'text-secondary-container', fondo: 'bg-secondary-container/15',
      nombre: { es: 'Encapsulamiento', en: 'Encapsulation' },
      idea: { es: 'El objeto protege su estado: nadie lo cambia sin pasar por sus reglas.', en: 'The object protects its state: nobody changes it without going through its rules.' } },
    { id: 'abstraccion', icono: 'schema', color: 'text-primary-container', fondo: 'bg-primary-container/15',
      nombre: { es: 'Abstracción', en: 'Abstraction' },
      idea: { es: 'Modelar solo lo esencial de algo y ocultar los detalles que no importan a quien lo usa.', en: 'Model only what is essential about something and hide the details that do not matter to whoever uses it.' } },
    { id: 'herencia', icono: 'account_tree', color: 'text-tertiary-fixed-dim', fondo: 'bg-tertiary-fixed-dim/15',
      nombre: { es: 'Herencia', en: 'Inheritance' },
      idea: { es: 'Una clase reutiliza y especializa a otra. Es útil, pero crea un acoplamiento fuerte.', en: 'One class reuses and specializes another. It is useful, but it creates strong coupling.' } },
    { id: 'polimorfismo', icono: 'swap_horiz', color: 'text-secondary-container', fondo: 'bg-secondary-container/15',
      nombre: { es: 'Polimorfismo', en: 'Polymorphism' },
      idea: { es: 'El mismo mensaje produce una respuesta distinta según el objeto que lo recibe.', en: 'The same message produces a different response depending on the object that receives it.' } },
  ],
};

export const SOLID_RESUMEN = {
  paso: { es: 'Paso 03', en: 'Step 03' },
  titulo: { es: 'Los 5 principios SOLID', en: 'The 5 SOLID principles' },
  verTodos: { es: 'Ver los 5 con código →', en: 'See all 5 with code →' },
  sintoma: { es: 'Síntoma:', en: 'Symptom:' },
} satisfies Record<string, Texto>;

export const CATALOGO = {
  paso: { es: 'Paso 04', en: 'Step 04' },
  titulo: { es: '23 patrones de diseño', en: '23 design patterns' },
  texto: { es: 'Busca por el problema que tienes, no por el nombre del patrón.', en: 'Search by the problem you have, not by the name of the pattern.' },
  todos: { es: 'Todos', en: 'All' },
  filtrar: { es: 'Filtrar por categoría', en: 'Filter by category' },
} satisfies Record<string, Texto>;

export const PROFUNDIZAR = {
  etiqueta: { es: 'Para profundizar', en: 'Going deeper' },
  titulo: { es: 'Después de los patrones', en: 'After the patterns' },
  tarjetas: [
    { href: '/comparaciones', icono: 'compare_arrows', color: 'text-primary-container', borde: 'hover:border-primary-container/50',
      titulo: { es: 'Patrones que se confunden', en: 'Patterns that get mixed up' },
      texto: { es: 'Strategy o State, Decorator o Proxy, Facade o Mediator… Las diferencias en una tabla y el mismo caso resuelto con cada uno.', en: 'Strategy or State, Decorator or Proxy, Facade or Mediator… The differences in a table and the same case solved with each one.' },
      accion: { es: 'Comparar →', en: 'Compare →' } },
  ],
};

export const LENGUAJES_INICIO = {
  paso: { es: 'Paso 05', en: 'Step 05' },
  titulo: { es: 'Los patrones en tu lenguaje', en: 'Patterns in your language' },
  texto: {
    es: 'Cada lenguaje tiene su forma natural de aplicar un patrón. Los 23, con código completo que compila y se ejecuta.',
    en: 'Every language has its own natural way of applying a pattern. All 23, with complete code that compiles and runs.',
  },
  insignia: { es: '23 patrones', en: '23 patterns' },
  verCodigo: { es: 'Ver código →', en: 'See code →' },
} satisfies Record<string, Texto>;
