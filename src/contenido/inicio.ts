// Contenido de la página de inicio.

export const META = {
  titulo: 'Arquetipo · Patrones de diseño de software',
  descripcion: 'Guía gratuita de POO, principios de diseño, SOLID y los 23 patrones de diseño clásicos, con casos reales, diagramas y código en 8 lenguajes.',
};

export const HERO = {
  etiqueta: 'Guía de diseño de software',
  titulo: 'Escribe código que se pueda cambiar sin miedo',
  texto: 'POO, principios de diseño, SOLID y los 23 patrones de diseño clásicos, explicados con casos reales, diagramas y código. Pensado para quien ya programa y quiere diseñar mejor.',
  verRuta: 'Ver la ruta de aprendizaje',
  irPatrones: 'Ir a los patrones',
  acoplado: 'Acoplado',
  desacoplado: 'Desacoplado',
  comentarioAcoplado: '// decide él mismo con qué trabaja',
  notaAcoplado: 'Cambiar de base de datos o probar la clase sin una real obliga a modificarla.',
  notaDesacoplado: 'Recibe desde fuera lo que necesita: se cambia o se prueba sin tocarla.',
};

export const RUTA = {
  etiqueta: 'Por dónde empezar',
  titulo: 'Ruta de aprendizaje',
  empezar: 'Empezar →',
  pasos: [
    { n: '01', transicion: 'titulo-poo', href: '/fundamentos/poo', icono: 'account_tree', color: 'text-secondary-container', fondo: 'bg-secondary-container/15 border-secondary-container/30',
      titulo: 'Fundamentos de POO',
      texto: 'Los 4 pilares y cómo se relacionan los objetos. La base de todo lo demás.' },
    { n: '02', transicion: 'titulo-diseno', href: '/principios/diseno', icono: 'lightbulb', color: 'text-secondary-fixed', fondo: 'bg-secondary-container/10 border-secondary-container/25',
      titulo: 'Principios de diseño',
      texto: 'Cinco ideas que están detrás de SOLID y de todos los patrones.' },
    { n: '03', transicion: 'titulo-solid', href: '/principios/solid', icono: 'memory', color: 'text-primary-container', fondo: 'bg-primary-container/15 border-primary-container/30',
      titulo: 'Principios SOLID',
      texto: 'Cinco guías para escribir código que se pueda cambiar sin miedo.' },
    { n: '04', transicion: undefined, href: '/#patrones', icono: 'category', color: 'text-tertiary-fixed-dim', fondo: 'bg-tertiary-fixed-dim/15 border-tertiary-fixed-dim/30',
      titulo: '23 patrones de diseño',
      texto: 'Soluciones probadas a problemas que se repiten, con casos reales.' },
    { n: '05', transicion: undefined, href: '/#lenguajes', icono: 'code_blocks', color: 'text-amber-300', fondo: 'bg-amber-400/10 border-amber-400/25',
      titulo: 'En tu lenguaje',
      texto: 'Cada patrón aplicado de forma idiomática en 8 lenguajes.' },
  ],
};

export const PILARES_RESUMEN = {
  paso: 'Paso 01',
  titulo: 'Los 4 pilares de la POO',
  verGuia: 'Ver guía completa →',
  regla: 'REGLA PRÁCTICA:',
  reglaTexto: 'prefiere la composición a la herencia cuando solo quieres reutilizar código.',
  pilares: [
    { id: 'encapsulamiento', icono: 'lock', color: 'text-secondary-container', fondo: 'bg-secondary-container/15',
      nombre: 'Encapsulamiento',
      idea: 'El objeto protege su estado: nadie lo cambia sin pasar por sus reglas.' },
    { id: 'abstraccion', icono: 'schema', color: 'text-primary-container', fondo: 'bg-primary-container/15',
      nombre: 'Abstracción',
      idea: 'Modelar solo lo esencial de algo y ocultar los detalles que no importan a quien lo usa.' },
    { id: 'herencia', icono: 'account_tree', color: 'text-tertiary-fixed-dim', fondo: 'bg-tertiary-fixed-dim/15',
      nombre: 'Herencia',
      idea: 'Una clase reutiliza y especializa a otra. Es útil, pero crea un acoplamiento fuerte.' },
    { id: 'polimorfismo', icono: 'swap_horiz', color: 'text-secondary-container', fondo: 'bg-secondary-container/15',
      nombre: 'Polimorfismo',
      idea: 'El mismo mensaje produce una respuesta distinta según el objeto que lo recibe.' },
  ],
};

export const SOLID_RESUMEN = {
  paso: 'Paso 03',
  titulo: 'Los 5 principios SOLID',
  verTodos: 'Ver los 5 con código →',
  sintoma: 'Síntoma:',
};

export const CATALOGO = {
  paso: 'Paso 04',
  titulo: '23 patrones de diseño',
  texto: 'Busca por el problema que tienes, no por el nombre del patrón.',
  todos: 'Todos',
  filtrar: 'Filtrar por categoría',
};

export const PROFUNDIZAR = {
  etiqueta: 'Para profundizar',
  titulo: 'Después de los patrones',
  tarjetas: [
    { href: '/comparaciones', icono: 'compare_arrows', color: 'text-primary-container', borde: 'hover:border-primary-container/50',
      titulo: 'Patrones que se confunden',
      texto: 'Strategy o State, Decorator o Proxy, Facade o Mediator… Las diferencias en una tabla y el mismo caso resuelto con cada uno.',
      accion: 'Comparar →' },
    { href: '/antipatrones', icono: 'report', color: 'text-amber-300', borde: 'hover:border-amber-400/50',
      titulo: 'Antipatrones y code smells',
      texto: 'Objeto dios, condicionales que no paran de crecer, patronitis… Cómo reconocer lo que sale mal y qué principio o patrón lo corrige.',
      accion: 'Ver antipatrones →' },
  ],
};

export const LENGUAJES_INICIO = {
  paso: 'Paso 05',
  titulo: 'Los patrones en tu lenguaje',
  texto: 'Cada lenguaje tiene su forma natural de aplicar un patrón. Los 23, con código completo que compila y se ejecuta.',
  insignia: '23 patrones',
  verCodigo: 'Ver código →',
};
