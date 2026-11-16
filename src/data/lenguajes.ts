// Lenguajes de la web y acceso al código de ejemplo de cada patrón.
// El código vive en src/codigo/<lenguaje>/<archivo>: son archivos reales que se compilan y
// ejecutan con `npm run verificar:codigo`. Las primeras líneas de comentario de cada archivo
// explican qué tiene de idiomático y se muestran aparte del código.
import type { Idioma, Texto } from '../i18n/idiomas.ts';
import { traducirComentarios, type Marcador } from '../i18n/comentarios.ts';
import { COMENTARIOS_EN } from '../i18n/comentarios/en/index.ts';

export interface Lenguaje {
  id: string;
  nombre: string;
  shiki: string;
  extension: string;
  comentario: Marcador;
  desc: Texto;
  rasgos: Texto[];
  /** Nombre del archivo de un patrón; cada lenguaje sigue su convención (por defecto, el slug). */
  archivo?: (slug: string) => string;
  /** Línea obligatoria antes de los comentarios iniciales (por ejemplo, `<?php`). */
  encabezado?: string;
}

const pascal = (slug: string) => slug.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('');
const snake = (slug: string) => slug.replaceAll('-', '_');
const r = (es: string, en: string): Texto => ({ es, en });

export const LENGUAJES: Lenguaje[] = [
  {
    id: 'typescript', nombre: 'TypeScript', shiki: 'typescript', extension: 'ts', comentario: '//',
    desc: r('Tipado estructural, uniones discriminadas y funciones como valores.', 'Structural typing, discriminated unions and functions as values.'),
    rasgos: [r('Interfaces y tipado estructural', 'Interfaces and structural typing'), r('Uniones discriminadas', 'Discriminated unions'), r('Campos privados #', 'Private # fields'), r('Generadores y async/await', 'Generators and async/await')],
  },
  {
    id: 'csharp', nombre: 'C# / .NET', shiki: 'csharp', extension: 'cs', comentario: '//',
    desc: r('Records, LINQ, eventos y pattern matching.', 'Records, LINQ, events and pattern matching.'),
    rasgos: [r('Records y with', 'Records and with'), r('LINQ', 'LINQ'), r('Eventos y delegados', 'Events and delegates'), r('Pattern matching', 'Pattern matching')],
  },
  {
    id: 'java', nombre: 'Java', shiki: 'java', extension: 'java', comentario: '//',
    desc: r('Records, interfaces selladas y pattern matching.', 'Records, sealed interfaces and pattern matching.'),
    rasgos: [r('Records', 'Records'), r('Interfaces selladas', 'Sealed interfaces'), r('Pattern matching en switch', 'Pattern matching in switch'), r('Lambdas y streams', 'Lambdas and streams')],
    archivo: (slug) => `${pascal(slug)}.java`,
  },
  {
    id: 'javascript', nombre: 'JavaScript', shiki: 'javascript', extension: 'js', comentario: '//',
    desc: r('Closures, módulos y funciones de primer orden.', 'Closures, modules and first-class functions.'),
    rasgos: [r('Closures', 'Closures'), r('Módulos ES', 'ES modules'), r('Funciones de primer orden', 'First-class functions'), r('Proxy nativo', 'Native Proxy')],
  },
  {
    id: 'python', nombre: 'Python', shiki: 'python', extension: 'py', comentario: '#',
    desc: r('Protocolos, decoradores @ y generadores.', 'Protocols, @ decorators and generators.'),
    rasgos: [r('typing.Protocol', 'typing.Protocol'), r('dataclasses', 'dataclasses'), r('Decoradores @', '@ decorators'), r('Generadores', 'Generators')],
  },
  {
    id: 'go', nombre: 'Go', shiki: 'go', extension: 'go', comentario: '//',
    desc: r('Sin herencia: composición e interfaces implícitas.', 'No inheritance: composition and implicit interfaces.'),
    rasgos: [r('Interfaces implícitas', 'Implicit interfaces'), r('Composición (embedding)', 'Composition (embedding)'), r('Errores como valores', 'Errors as values'), r('Iteradores iter.Seq', 'iter.Seq iterators')],
  },
  {
    id: 'rust', nombre: 'Rust', shiki: 'rust', extension: 'rs', comentario: '//',
    desc: r('Traits, enums y pattern matching.', 'Traits, enums and pattern matching.'),
    rasgos: [r('Traits', 'Traits'), r('Enums con datos', 'Enums with data'), r('Pattern matching', 'Pattern matching'), r('Ownership', 'Ownership')],
    archivo: (slug) => `${snake(slug)}.rs`,
  },
  {
    id: 'php', nombre: 'PHP', shiki: 'php', extension: 'php', comentario: '//',
    desc: r('Clases readonly, enums, match y tipos estrictos.', 'Readonly classes, enums, match and strict types.'),
    rasgos: [r('Clases readonly', 'Readonly classes'), r('Enums', 'Enums'), r('match', 'match'), r('Tipos estrictos', 'Strict types')],
    encabezado: '<?php',
  },
];

export interface EjemploCodigo {
  /** Qué tiene de idiomático este ejemplo en su lenguaje. */
  nota: string;
  codigo: string;
}

const archivos = import.meta.glob('../codigo/*/*.*', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

/** Separa el bloque de comentarios inicial (la nota) del resto del código. */
function separar(contenido: string, comentario: string, encabezado?: string): EjemploCodigo {
  const lineas = contenido.replace(/\r\n/g, '\n').split('\n');
  const nota: string[] = [];
  const conEncabezado = Boolean(encabezado) && lineas[0]?.trim() === encabezado;
  let i = conEncabezado ? 1 : 0;
  while (i < lineas.length && lineas[i].trimStart().startsWith(comentario)) {
    nota.push(lineas[i].trimStart().slice(comentario.length).trim());
    i++;
  }
  while (i < lineas.length && lineas[i].trim() === '') i++;
  const codigo = lineas.slice(i).join('\n').trimEnd();
  return { nota: nota.join(' ').trim(), codigo: conEncabezado ? `${encabezado}\n\n${codigo}` : codigo };
}

/** Nombre del archivo de un patrón en un lenguaje, según su convención. */
export function nombreArchivo(lenguaje: Lenguaje, slug: string): string {
  return lenguaje.archivo ? lenguaje.archivo(slug) : `${slug}.${lenguaje.extension}`;
}

/** Código de ejemplo de un patrón en un lenguaje, con los comentarios en el idioma pedido. */
export function ejemplo(lenguaje: Lenguaje, slug: string, idioma: Idioma): EjemploCodigo {
  const ruta = `../codigo/${lenguaje.id}/${nombreArchivo(lenguaje, slug)}`;
  const contenido = archivos[ruta];
  if (contenido === undefined) throw new Error(`Falta el ejemplo ${ruta}`);
  const opciones = { marcador: lenguaje.comentario, sinComillaSimple: lenguaje.id === 'rust' };
  const traducido = idioma === 'en' ? traducirComentarios(contenido, opciones, COMENTARIOS_EN) : contenido;
  return separar(traducido, lenguaje.comentario, lenguaje.encabezado);
}
