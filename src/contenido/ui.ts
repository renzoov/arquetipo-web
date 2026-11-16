// Textos de la interfaz que se repiten en varias páginas (menú, pie, buscador, bloques de código…).
// El contenido propio de cada página vive en los demás módulos de src/contenido.

export const ui = {
  // Marca y navegación
  marcaSubtitulo: 'patrones de diseño de software',
  irAlInicio: 'Arquetipo, ir al inicio',
  navPoo: 'POO',
  navDiseno: 'Diseño',
  navSolid: 'SOLID',
  navPatrones: 'Patrones',
  navLenguajes: 'Lenguajes',
  navMas: 'Más',
  navComparar: 'Patrones que se confunden',
  navAntipatrones: 'Antipatrones',
  navEjercicios: 'Ejercicios',
  secciones: 'Secciones',
  abrirMenu: 'Abrir menú',
  inicio: 'Inicio',
  ruta: 'Ruta',
  pasoDeLaRuta: 'Paso {n} de la ruta',


  // Buscador
  buscar: 'Buscar',
  buscarPlaceholder: 'Busca un patrón, principio o problema…',
  buscarSinResultados: 'Sin resultados para',
  buscarAyuda: 'Escribe para buscar en toda la guía',
  buscarNavegar: 'para moverte',
  buscarAbrir: 'para abrir',
  buscarCerrar: 'para cerrar',
  tipoPatron: 'Patrón',
  tipoPrincipio: 'Principio',
  tipoPilar: 'POO',
  tipoComparacion: 'Comparación',
  tipoAntipatron: 'Antipatrón',
  tipoLenguaje: 'Lenguaje',
  tipoEjercicios: 'Ejercicios',
  tipoPagina: 'Página',

  // Pie de página
  pieDescripcion: 'Guía de diseño de software: POO, SOLID y patrones.',
  pieNav: 'Pie de página',
  pieLibre: 'Libre y sin registro',

  // Bloques "antes / después"
  antesIncumple: 'Antes: lo incumple',
  despuesCumple: 'Después: lo cumple',
  queDice: 'Qué dice.',
  comoReconocer: 'Cómo reconocer que lo incumples.',
  enLaPractica: 'En la práctica:',
  diagramaDe: 'Diagrama de clases: {x}',
  ademas: 'Además:',

  // Página de un patrón
  patrones: 'Patrones',
  uso: 'Uso',
  complejidad: 'Complejidad',
  casoReal: 'El caso real',
  problemaSinPatron: 'El problema sin el patrón',
  comoLoResuelve: 'Cómo lo resuelve el patrón',
  diagramaClases: 'Diagrama de clases',
  diagramaAyuda: 'Diagrama interactivo: puedes acercar, mover el lienzo y pasar el cursor sobre cada clase para ver su detalle.',
  codigoAntesDespues: 'El código, antes y después',
  sinPatron: 'Sin el patrón',
  conPatron: 'Con el patrón',
  antes: 'ANTES',
  despues: 'DESPUÉS',
  notaEjemplosTs: 'Ejemplos en TypeScript, simplificados para mostrar la idea: los tipos auxiliares (Pedido, Cliente…) se omiten.',
  matiz: 'Matiz importante',
  cuandoUsarlo: 'Cuándo usarlo',
  cuandoNoUsarlo: 'Cuándo no usarlo',
  principiosEnJuego: 'Principios en juego',
  relacionados: 'Patrones relacionados',
  seConfundeCon: 'Se suele confundir con',
  enTuLenguaje: '{x} en tu lenguaje',
  enTuLenguajeIntro: 'El mismo caso, implementado completo y de forma idiomática. Se puede copiar y ejecutar.',
  verLos23En: 'Ver los 23 patrones en {x} →',
  anterior: '← Anterior',
  siguiente: 'Siguiente →',
  alFinal: 'Has llegado al final',
  volverCatalogo: 'Volver al catálogo',
  otrosPatrones: 'Otros patrones',
  lenguaje: 'Lenguaje',

  // Página de un lenguaje
  lenguajeTitulo: 'Los 23 patrones en',
  lenguajeIntro: 'El mismo caso real de cada patrón, escrito como lo haría alguien que domina {x}. Son programas completos que se compilan y se ejecutan; los comentarios del final muestran lo que imprimen.',
  lenguajeDescripcion: 'Los 23 patrones de diseño implementados de forma idiomática en {x}, con programas completos que compilan y se ejecutan.',
  patron: 'Patrón',
  deTotal: '{i} de {n}',
  verExplicacion: 'Ver la explicación →',
  anteriorSiguiente: 'Patrón anterior y siguiente',

  // Bloque de código
  loIdiomatico: 'LO IDIOMÁTICO EN {x}:',
  lineas: '{n} líneas',
  copiar: 'Copiar',
  copiado: 'Copiado',
  noSeCopio: 'No se pudo copiar',
  verCompleto: 'Ver completo ({n} líneas)',

  // Página 404
  noEncontradaTitulo: 'Página no encontrada',
  noEncontradaTexto: 'Esta página no existe o cambió de lugar. Prueba con el buscador o vuelve al inicio.',
  volverInicio: 'Volver al inicio',
};

/** Reemplaza {marcadores} en un texto: formato('Paso {n}', { n: '02' }) → 'Paso 02'. */
export function formato(texto: string, valores: Record<string, string | number>): string {
  return texto.replace(/\{(\w+)\}/g, (_, clave) => String(valores[clave] ?? `{${clave}}`));
}
