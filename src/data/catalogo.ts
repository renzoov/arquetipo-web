// Catálogo de patrones en el idioma pedido: los textos de patterns.ts (español) o patterns.en.ts (inglés)
// y el código de ejemplo con sus comentarios traducidos.
import type { Idioma } from '../i18n/idiomas.ts';
import { traducirCodigoTs } from '../lib/codigo.ts';
import { PATTERNS, CATEGORIAS, type Categoria, type PatternData } from './patterns.ts';
import { PATRONES_EN, CATEGORIAS_EN } from './patterns.en.ts';

export type { Categoria, PatternData };

const FRECUENCIA_EN: Record<PatternData['frecuenciaUso'], string> = { 'Muy alta': 'Very high', Alta: 'High', Media: 'Medium', Baja: 'Low' };
const COMPLEJIDAD_EN: Record<PatternData['complejidad'], string> = { Baja: 'Low', Media: 'Medium', Alta: 'High' };

export interface Patron extends Omit<PatternData, 'frecuenciaUso' | 'complejidad'> {
  frecuenciaUso: string;
  complejidad: string;
}

/** Los 23 patrones en el orden del catálogo, en el idioma pedido. */
export function patrones(idioma: Idioma): Patron[] {
  return [...PATTERNS]
    .sort((a, b) => a.order - b.order)
    .map((p) => {
      if (idioma === 'es') return p;
      const en = PATRONES_EN[p.slug];
      return {
        ...p,
        ...en,
        categoryLabel: CATEGORIAS_EN[p.category].categoryLabel,
        frecuenciaUso: FRECUENCIA_EN[p.frecuenciaUso],
        complejidad: COMPLEJIDAD_EN[p.complejidad],
        codigoProblematico: traducirCodigoTs(p.codigoProblematico, idioma),
        codigoSolucion: traducirCodigoTs(p.codigoSolucion, idioma),
      };
    });
}

/** Categorías del catálogo en el idioma pedido. */
export function categorias(idioma: Idioma): { id: Categoria; label: string; desc: string }[] {
  return CATEGORIAS.map((c) => (idioma === 'es' ? c : { id: c.id, label: CATEGORIAS_EN[c.id].label, desc: CATEGORIAS_EN[c.id].desc }));
}

/** Nombre de un patrón por su slug (los nombres no se traducen). */
export function nombrePatron(slug: string): string {
  const p = PATTERNS.find((x) => x.slug === slug);
  if (!p) throw new Error(`Patrón desconocido: ${slug}`);
  return p.name;
}

/** Ruta base (sin idioma) de la página de un patrón. */
export function rutaPatron(slug: string): string {
  const p = PATTERNS.find((x) => x.slug === slug);
  if (!p) throw new Error(`Patrón desconocido: ${slug}`);
  return `/patrones/${p.category}/${p.slug}`;
}

/** Colores de cada categoría. */
export const COLOR_CATEGORIA: Record<Categoria, { texto: string; borde: string; fondo: string; punto: string; hover: string }> = {
  creacionales: { texto: 'text-primary-container', borde: 'border-primary-container/30', fondo: 'bg-primary-container/10', punto: 'bg-primary-container', hover: 'hover:border-primary-container/50' },
  estructurales: { texto: 'text-tertiary-fixed-dim', borde: 'border-tertiary-fixed-dim/30', fondo: 'bg-tertiary-fixed-dim/10', punto: 'bg-tertiary-fixed-dim', hover: 'hover:border-tertiary-fixed-dim/50' },
  comportamiento: { texto: 'text-secondary-container', borde: 'border-secondary-container/30', fondo: 'bg-secondary-container/10', punto: 'bg-secondary-container', hover: 'hover:border-secondary-container/50' },
};
