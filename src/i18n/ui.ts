// Textos de la interfaz que se repiten en varias páginas (menú, pie, buscador, bloques de código…).
// El contenido propio de cada página vive en src/contenido.
import type { Idioma, Texto } from './idiomas.ts';

const UI = {
  // Marca y navegación
  marcaSubtitulo: { es: 'patrones de diseño de software', en: 'software design patterns' },
  irAlInicio: { es: 'Arquetipo, ir al inicio', en: 'Arquetipo, go to home page' },
  navPoo: { es: 'POO', en: 'OOP' },
  navDiseno: { es: 'Diseño', en: 'Design' },
  navSolid: { es: 'SOLID', en: 'SOLID' },
  navPatrones: { es: 'Patrones', en: 'Patterns' },
  navLenguajes: { es: 'Lenguajes', en: 'Languages' },
  navMas: { es: 'Más', en: 'More' },
  navComparar: { es: 'Patrones que se confunden', en: 'Patterns that get mixed up' },
  navAntipatrones: { es: 'Antipatrones', en: 'Anti-patterns' },
  secciones: { es: 'Secciones', en: 'Sections' },
  empezar: { es: 'Empezar', en: 'Start' },
  abrirMenu: { es: 'Abrir menú', en: 'Open menu' },
  inicio: { es: 'Inicio', en: 'Home' },
  ruta: { es: 'Ruta', en: 'Breadcrumb' },
  pasoDeLaRuta: { es: 'Paso {n} de la ruta', en: 'Step {n} of the path' },

  // Idioma
  idioma: { es: 'Idioma', en: 'Language' },
  cambiarIdioma: { es: 'Read this page in English', en: 'Leer esta página en español' },

  // Buscador
  buscar: { es: 'Buscar', en: 'Search' },
  buscarPlaceholder: { es: 'Busca un patrón, principio o problema…', en: 'Search for a pattern, principle or problem…' },
  buscarSinResultados: { es: 'Sin resultados para', en: 'No results for' },
  buscarAyuda: { es: 'Escribe para buscar en toda la guía', en: 'Type to search the whole guide' },
  buscarNavegar: { es: 'para moverte', en: 'to move' },
  buscarAbrir: { es: 'para abrir', en: 'to open' },
  buscarCerrar: { es: 'para cerrar', en: 'to close' },
  tipoPatron: { es: 'Patrón', en: 'Pattern' },
  tipoPrincipio: { es: 'Principio', en: 'Principle' },
  tipoPilar: { es: 'POO', en: 'OOP' },
  tipoComparacion: { es: 'Comparación', en: 'Comparison' },
  tipoAntipatron: { es: 'Antipatrón', en: 'Anti-pattern' },
  tipoLenguaje: { es: 'Lenguaje', en: 'Language' },
  tipoPagina: { es: 'Página', en: 'Page' },

  // Pie de página
  pieDescripcion: { es: 'Guía de diseño de software: POO, SOLID y patrones.', en: 'A software design guide: OOP, SOLID and patterns.' },
  pieNav: { es: 'Pie de página', en: 'Footer' },
  pieLibre: { es: 'Libre y sin registro', en: 'Free, no sign-up' },

  // Bloques "antes / después"
  antesIncumple: { es: 'Antes: lo incumple', en: 'Before: breaks it' },
  despuesCumple: { es: 'Después: lo cumple', en: 'After: follows it' },
  queDice: { es: 'Qué dice.', en: 'What it says.' },
  comoReconocer: { es: 'Cómo reconocer que lo incumples.', en: 'How to tell you are breaking it.' },
  enLaPractica: { es: 'En la práctica:', en: 'In practice:' },
  diagramaDe: { es: 'Diagrama de clases: {x}', en: 'Class diagram: {x}' },
  ademas: { es: 'Además:', en: 'Also:' },

  // Página de un patrón
  patrones: { es: 'Patrones', en: 'Patterns' },
  uso: { es: 'Uso', en: 'Usage' },
  complejidad: { es: 'Complejidad', en: 'Complexity' },
  casoReal: { es: 'El caso real', en: 'The real case' },
  problemaSinPatron: { es: 'El problema sin el patrón', en: 'The problem without the pattern' },
  comoLoResuelve: { es: 'Cómo lo resuelve el patrón', en: 'How the pattern solves it' },
  diagramaClases: { es: 'Diagrama de clases', en: 'Class diagram' },
  diagramaAyuda: {
    es: 'Diagrama interactivo: puedes acercar, mover el lienzo y pasar el cursor sobre cada clase para ver su detalle.',
    en: 'Interactive diagram: you can zoom, pan the canvas and hover over each class to see its details.',
  },
  codigoAntesDespues: { es: 'El código, antes y después', en: 'The code, before and after' },
  sinPatron: { es: 'Sin el patrón', en: 'Without the pattern' },
  conPatron: { es: 'Con el patrón', en: 'With the pattern' },
  antes: { es: 'ANTES', en: 'BEFORE' },
  despues: { es: 'DESPUÉS', en: 'AFTER' },
  notaEjemplosTs: {
    es: 'Ejemplos en TypeScript, simplificados para mostrar la idea: los tipos auxiliares (Pedido, Cliente…) se omiten.',
    en: 'TypeScript examples, simplified to show the idea: helper types (Pedido, Cliente…) are omitted.',
  },
  notaIdentificadores: {
    es: '',
    en: 'Class and variable names are kept in Spanish, as in the original code; the comments are translated.',
  },
  matiz: { es: 'Matiz importante', en: 'Important nuance' },
  cuandoUsarlo: { es: 'Cuándo usarlo', en: 'When to use it' },
  cuandoNoUsarlo: { es: 'Cuándo no usarlo', en: 'When not to use it' },
  principiosEnJuego: { es: 'Principios en juego', en: 'Principles at play' },
  relacionados: { es: 'Patrones relacionados', en: 'Related patterns' },
  seConfundeCon: { es: 'Se suele confundir con', en: 'Often confused with' },
  enTuLenguaje: { es: '{x} en tu lenguaje', en: '{x} in your language' },
  enTuLenguajeIntro: {
    es: 'El mismo caso, implementado completo y de forma idiomática. Se puede copiar y ejecutar.',
    en: 'The same case, fully implemented in an idiomatic way. You can copy it and run it.',
  },
  verLos23En: { es: 'Ver los 23 patrones en {x} →', en: 'See all 23 patterns in {x} →' },
  anterior: { es: '← Anterior', en: '← Previous' },
  siguiente: { es: 'Siguiente →', en: 'Next →' },
  alFinal: { es: 'Has llegado al final', en: 'You reached the end' },
  volverCatalogo: { es: 'Volver al catálogo', en: 'Back to the catalog' },
  otrosPatrones: { es: 'Otros patrones', en: 'Other patterns' },
  lenguaje: { es: 'Lenguaje', en: 'Language' },

  // Página de un lenguaje
  lenguajeTitulo: { es: 'Los 23 patrones en', en: 'The 23 patterns in' },
  lenguajeIntro: {
    es: 'El mismo caso real de cada patrón, escrito como lo haría alguien que domina {x}. Son programas completos que se compilan y se ejecutan; los comentarios del final muestran lo que imprimen.',
    en: 'The same real case for each pattern, written the way someone fluent in {x} would write it. They are complete programs that compile and run; the comments at the end show what they print.',
  },
  lenguajeDescripcion: {
    es: 'Los 23 patrones de diseño implementados de forma idiomática en {x}, con programas completos que compilan y se ejecutan.',
    en: 'The 23 design patterns implemented idiomatically in {x}, with complete programs that compile and run.',
  },
  patron: { es: 'Patrón', en: 'Pattern' },
  deTotal: { es: '{i} de {n}', en: '{i} of {n}' },
  verExplicacion: { es: 'Ver la explicación →', en: 'See the explanation →' },
  anteriorSiguiente: { es: 'Patrón anterior y siguiente', en: 'Previous and next pattern' },

  // Bloque de código
  loIdiomatico: { es: 'LO IDIOMÁTICO EN {x}:', en: 'WHAT IS IDIOMATIC IN {x}:' },
  lineas: { es: '{n} líneas', en: '{n} lines' },
  copiar: { es: 'Copiar', en: 'Copy' },
  copiado: { es: 'Copiado', en: 'Copied' },
  noSeCopio: { es: 'No se pudo copiar', en: 'Could not copy' },
  verCompleto: { es: 'Ver completo ({n} líneas)', en: 'Show all ({n} lines)' },

  // Página 404
  noEncontradaTitulo: { es: 'Página no encontrada', en: 'Page not found' },
  noEncontradaTexto: {
    es: 'Esta página no existe o cambió de lugar. Prueba con el buscador o vuelve al inicio.',
    en: 'This page does not exist or has moved. Try the search or go back to the home page.',
  },
  volverInicio: { es: 'Volver al inicio', en: 'Back to home' },
} satisfies Record<string, Texto>;

export type ClaveUi = keyof typeof UI;
export type TextosUi = Record<ClaveUi, string>;

/** Todos los textos de la interfaz en un idioma. */
export function textosUi(idioma: Idioma): TextosUi {
  return Object.fromEntries(Object.entries(UI).map(([clave, texto]) => [clave, texto[idioma]])) as TextosUi;
}

/** Reemplaza {marcadores} en un texto: formato('Paso {n}', { n: '02' }) → 'Paso 02'. */
export function formato(texto: string, valores: Record<string, string | number>): string {
  return texto.replace(/\{(\w+)\}/g, (_, clave) => String(valores[clave] ?? `{${clave}}`));
}
