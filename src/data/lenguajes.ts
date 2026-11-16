// Lenguajes de la web y acceso al código de ejemplo de cada patrón.
// El código vive en src/codigo/<lenguaje>/<archivo>: son archivos reales que se compilan y
// ejecutan con `npm run verificar:codigo`. Las primeras líneas de comentario de cada archivo
// explican qué tiene de idiomático y se muestran aparte del código.

export interface Lenguaje {
  id: string;
  nombre: string;
  shiki: string;
  extension: string;
  comentario: '//' | '#';
  desc: string;
  rasgos: string[];
  /** Nombre del archivo de un patrón; cada lenguaje sigue su convención (por defecto, el slug). */
  archivo?: (slug: string) => string;
  /** Línea obligatoria antes de los comentarios iniciales (por ejemplo, `<?php`). */
  encabezado?: string;
}

const pascal = (slug: string) => slug.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('');
const snake = (slug: string) => slug.replaceAll('-', '_');

export const LENGUAJES: Lenguaje[] = [
  {
    id: 'typescript', nombre: 'TypeScript', shiki: 'typescript', extension: 'ts', comentario: '//',
    desc: 'Tipado estructural, uniones discriminadas y funciones como valores.',
    rasgos: ['Interfaces y tipado estructural', 'Uniones discriminadas', 'Campos privados #', 'Generadores y async/await'],
  },
  {
    id: 'csharp', nombre: 'C# / .NET', shiki: 'csharp', extension: 'cs', comentario: '//',
    desc: 'Records, LINQ, eventos y pattern matching.',
    rasgos: ['Records y with', 'LINQ', 'Eventos y delegados', 'Pattern matching'],
  },
  {
    id: 'java', nombre: 'Java', shiki: 'java', extension: 'java', comentario: '//',
    desc: 'Records, interfaces selladas y pattern matching.',
    rasgos: ['Records', 'Interfaces selladas', 'Pattern matching en switch', 'Lambdas y streams'],
    archivo: (slug) => `${pascal(slug)}.java`,
  },
  {
    id: 'javascript', nombre: 'JavaScript', shiki: 'javascript', extension: 'js', comentario: '//',
    desc: 'Closures, módulos y funciones de primer orden.',
    rasgos: ['Closures', 'Módulos ES', 'Funciones de primer orden', 'Proxy nativo'],
  },
  {
    id: 'python', nombre: 'Python', shiki: 'python', extension: 'py', comentario: '#',
    desc: 'Protocolos, decoradores @ y generadores.',
    rasgos: ['typing.Protocol', 'dataclasses', 'Decoradores @', 'Generadores'],
  },
  {
    id: 'go', nombre: 'Go', shiki: 'go', extension: 'go', comentario: '//',
    desc: 'Sin herencia: composición e interfaces implícitas.',
    rasgos: ['Interfaces implícitas', 'Composición (embedding)', 'Errores como valores', 'Iteradores iter.Seq'],
  },
  {
    id: 'rust', nombre: 'Rust', shiki: 'rust', extension: 'rs', comentario: '//',
    desc: 'Traits, enums y pattern matching.',
    rasgos: ['Traits', 'Enums con datos', 'Pattern matching', 'Ownership'],
    archivo: (slug) => `${snake(slug)}.rs`,
  },
  {
    id: 'php', nombre: 'PHP', shiki: 'php', extension: 'php', comentario: '//',
    desc: 'Clases readonly, enums, match y tipos estrictos.',
    rasgos: ['Clases readonly', 'Enums', 'match', 'Tipos estrictos'],
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

/** Código de ejemplo de un patrón en un lenguaje. */
export function ejemplo(lenguaje: Lenguaje, slug: string): EjemploCodigo {
  const ruta = `../codigo/${lenguaje.id}/${nombreArchivo(lenguaje, slug)}`;
  const contenido = archivos[ruta];
  if (contenido === undefined) throw new Error(`Falta el ejemplo ${ruta}`);
  return separar(contenido, lenguaje.comentario, lenguaje.encabezado);
}
