// Secciones de /ejercicios: banco de preguntas, temas y cuántas preguntas salen por intento.
// En cada intento el navegador reparte las preguntas entre los temas según las "cuotas"
// (para que salgan todos los temas) y prioriza las que no salieron en los últimos intentos.
import type { Pregunta } from './tipos.ts';
import { PREGUNTAS_POO } from './poo.ts';
import { PREGUNTAS_SOLID } from './solid.ts';
import { PREGUNTAS_CREACIONALES } from './creacionales.ts';
import { PREGUNTAS_ESTRUCTURALES } from './estructurales.ts';
import { PREGUNTAS_COMPORTAMIENTO } from './comportamiento.ts';
import { PILARES, RELACIONES } from '../poo.ts';
import { PRINCIPIOS_SOLID } from '../solid.ts';
import { CATEGORIAS, PATRONES, nombrePatron, rutaPatron } from '../../data/catalogo.ts';

export type { Pregunta };

interface Tema {
  id: string;
  nombre: string;
  href: string;
}

export interface Seccion {
  id: 'poo' | 'solid' | 'patrones';
  titulo: string;
  descripcion: string;
  icono: string;
  color: string;
  borde: string;
  porIntento: number;
  temas: Tema[];
  /** Cuántas preguntas salen de cada grupo de temas en un intento. */
  cuotas: { temas: string[]; cantidad: number }[];
  preguntas: Pregunta[];
}

const temasPoo: Tema[] = [
  ...PILARES.map((p) => ({ id: p.id, nombre: p.nombre, href: `/fundamentos/poo#${p.id}` })),
  ...RELACIONES.map((r) => ({ id: r.id, nombre: r.nombre, href: `/fundamentos/poo#${r.id}` })),
];
const temasSolid: Tema[] = PRINCIPIOS_SOLID.map((p) => ({ id: p.id, nombre: `${p.letra} · ${p.nombre}`, href: `/principios/solid#${p.id}` }));
const temasPatrones: Tema[] = PATRONES.map((p) => ({ id: p.slug, nombre: nombrePatron(p.slug), href: rutaPatron(p.slug) }));

export const SECCIONES: Seccion[] = [
  {
    id: 'poo',
    titulo: 'Fundamentos de POO',
    descripcion: 'Los 4 pilares y las 4 relaciones entre clases: reconocerlos en código y en casos reales.',
    icono: 'account_tree',
    color: 'text-secondary-container',
    borde: 'hover:border-secondary-container/50',
    porIntento: 10,
    temas: temasPoo,
    cuotas: [{ temas: temasPoo.map((t) => t.id), cantidad: 10 }],
    preguntas: PREGUNTAS_POO,
  },
  {
    id: 'solid',
    titulo: 'Principios SOLID',
    descripcion: 'Qué principio se incumple, cómo se nota y cómo se corrige. Dos preguntas de cada principio.',
    icono: 'memory',
    color: 'text-primary-container',
    borde: 'hover:border-primary-container/50',
    porIntento: 10,
    temas: temasSolid,
    cuotas: [{ temas: temasSolid.map((t) => t.id), cantidad: 10 }],
    preguntas: PREGUNTAS_SOLID,
  },
  {
    id: 'patrones',
    titulo: 'Patrones de diseño',
    descripcion: '¿Qué patrón usarías? Casos reales, código y diferencias entre patrones parecidos. Cinco de cada categoría.',
    icono: 'category',
    color: 'text-tertiary-fixed-dim',
    borde: 'hover:border-tertiary-fixed-dim/50',
    porIntento: 15,
    temas: temasPatrones,
    cuotas: CATEGORIAS.map((c) => ({ temas: PATRONES.filter((p) => p.category === c.id).map((p) => p.slug), cantidad: 5 })),
    preguntas: [...PREGUNTAS_CREACIONALES, ...PREGUNTAS_ESTRUCTURALES, ...PREGUNTAS_COMPORTAMIENTO],
  },
];

/** Preguntas de un patrón (para el bloque de ejercicios de su página). */
export const preguntasDePatron = (slug: string) =>
  SECCIONES.find((s) => s.id === 'patrones')!.preguntas.filter((p) => p.tema === slug);

// Comprobaciones al compilar: un banco mal escrito detiene el build en lugar de llegar a la web
for (const s of SECCIONES) {
  const ids = new Set<string>();
  const temas = new Set(s.temas.map((t) => t.id));
  for (const p of s.preguntas) {
    if (ids.has(p.id)) throw new Error(`Pregunta repetida: ${s.id}/${p.id}`);
    ids.add(p.id);
    if (!temas.has(p.tema)) throw new Error(`Tema desconocido en ${s.id}: ${p.tema}`);
    const opciones = [p.correcta, ...p.incorrectas];
    if (new Set(opciones).size !== 4) throw new Error(`Alternativas repetidas en ${s.id}/${p.id}`);
  }
  for (const t of temas) {
    if (!s.preguntas.some((p) => p.tema === t)) throw new Error(`Tema sin preguntas en ${s.id}: ${t}`);
  }
  const total = s.cuotas.reduce((n, c) => n + c.cantidad, 0);
  if (total !== s.porIntento) throw new Error(`Las cuotas de ${s.id} no suman ${s.porIntento}`);
}
