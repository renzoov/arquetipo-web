// Traducción de los comentarios del código de ejemplo.
//
// El código se escribe una sola vez (en español) y se verifica con `npm run verificar:codigo`.
// Para mostrarlo en otro idioma solo se reemplazan sus comentarios usando un diccionario
// "texto en español → texto traducido". Los nombres de clases, variables y textos del programa no cambian.
//
// Unidades que se traducen:
//   - Un bloque de comentarios de línea completa seguidos (mismo sangrado): se traduce como un todo;
//     las líneas se unen con "\n" y la traducción puede tener su propio número de líneas.
//   - Un comentario al final de una línea de código:  x = 1; // texto
//   - Un comentario de bloque en una línea:  /* texto */  o  /** texto */
//   - Una línea de JSDoc con texto:  * texto   (las etiquetas @param, @type… no se tocan)
//   - Un docstring de Python en una línea:  """texto"""
//
// `npm run verificar:traducciones` avisa de cualquier comentario que no tenga traducción.

export type Marcador = '//' | '#';
export type Diccionario = Record<string, string>;

/** Posición del marcador de comentario fuera de cadenas de texto, o -1 si no hay. */
function inicioComentario(linea: string, marcador: Marcador, sinComillaSimple: boolean): number {
  let desde = 0;
  for (;;) {
    const i = linea.indexOf(marcador, desde);
    if (i < 0) return -1;
    const previo = linea.slice(0, i);
    const pares = (c: string) => previo.split(c).length % 2 === 1;
    const fuera = pares('"') && pares('`') && (sinComillaSimple || pares("'"));
    // `#[...]` en PHP/Rust es un atributo, no un comentario; `://` es parte de una URL
    if (fuera && !(marcador === '#' && linea[i + 1] === '[') && linea[i - 1] !== ':') return i;
    desde = i + marcador.length;
  }
}

interface Opciones {
  marcador: Marcador;
  /** En Rust la comilla simple marca lifetimes ('a), no cadenas. */
  sinComillaSimple?: boolean;
}

type Visitante = (texto: string) => string;

/** Recorre todas las unidades de comentario del código; `visitar` devuelve el texto que las reemplaza. */
function recorrer(codigo: string, { marcador, sinComillaSimple = false }: Opciones, visitar: Visitante): string {
  const lineas = codigo.replace(/\r\n/g, '\n').split('\n');
  const marca = marcador === '//' ? '\\/\\/\\/?' : '#';
  const lineaComentario = new RegExp(`^(\\s*)(${marca})(?!\\[)( ?)(.*)$`);
  const salida: string[] = [];

  for (let i = 0; i < lineas.length; i++) {
    const m = lineas[i].match(lineaComentario);
    if (m) {
      // Bloque de comentarios de línea completa con el mismo sangrado y marcador
      const [, sangria, simbolo, espacio] = m;
      const textos = [m[4]];
      while (i + 1 < lineas.length) {
        const s = lineas[i + 1].match(lineaComentario);
        if (!s || s[1] !== sangria || s[2] !== simbolo) break;
        textos.push(s[4]);
        i++;
      }
      const original = textos.join('\n');
      const traducido = original.trim() ? visitar(original) : original;
      for (const texto of traducido.split('\n')) salida.push(`${sangria}${simbolo}${espacio}${texto}`.trimEnd());
      continue;
    }

    let linea = lineas[i];

    // JSDoc: " * texto" (sin etiquetas @)
    const jsdoc = linea.match(/^(\s*\*\s+)([^@].*)$/);
    if (jsdoc) {
      salida.push(jsdoc[1] + visitar(jsdoc[2]));
      continue;
    }

    // /* texto */ y /** texto */ dentro de la línea (sin etiquetas @)
    linea = linea.replace(/\/\*(\*?)\s+([^@*][^*]*?)\s+\*\//g, (_, doble, texto) => `/*${doble} ${visitar(texto)} */`);

    // """texto""" de Python en una sola línea
    linea = linea.replace(/"""(.+?)"""/g, (_, texto) => `"""${visitar(texto)}"""`);

    // Comentario al final de una línea de código
    const inicio = inicioComentario(linea, marcador, sinComillaSimple);
    if (inicio > 0) {
      const resto = linea.slice(inicio + marcador.length);
      const texto = resto.trim();
      if (texto) {
        const espacioAntes = resto.slice(0, resto.length - resto.trimStart().length);
        linea = linea.slice(0, inicio + marcador.length) + espacioAntes + visitar(texto);
      }
    }
    salida.push(linea);
  }
  return salida.join('\n');
}

/** Todos los textos de comentario de un código (para revisar qué falta traducir). */
export function textosDeComentarios(codigo: string, opciones: Opciones): string[] {
  const textos: string[] = [];
  recorrer(codigo, opciones, (texto) => {
    textos.push(texto);
    return texto;
  });
  return textos;
}

/** Reemplaza los comentarios por su traducción; los que no estén en el diccionario quedan igual. */
export function traducirComentarios(codigo: string, opciones: Opciones, diccionario: Diccionario | undefined): string {
  if (!diccionario) return codigo;
  return recorrer(codigo, opciones, (texto) => diccionario[texto] ?? texto);
}
