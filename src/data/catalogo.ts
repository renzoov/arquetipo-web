// Catálogo de patrones: orden, nombres, rutas y colores de cada categoría.
import { PATTERNS, type Categoria, type PatternData } from './patterns.ts';

export { CATEGORIAS } from './patterns.ts';
export type { PatternData };

/** Los 23 patrones en el orden del catálogo. */
export const PATRONES: PatternData[] = [...PATTERNS].sort((a, b) => a.order - b.order);

function buscar(slug: string): PatternData {
  const p = PATTERNS.find((x) => x.slug === slug);
  if (!p) throw new Error(`Patrón desconocido: ${slug}`);
  return p;
}

/** Nombre de un patrón por su slug. */
export const nombrePatron = (slug: string) => buscar(slug).name;

/** Ruta de la página de un patrón. */
export function rutaPatron(slug: string): string {
  const p = buscar(slug);
  return `/patrones/${p.category}/${p.slug}`;
}

/** Colores de la categoría de un patrón. */
export const colorPatron = (slug: string) => COLOR_CATEGORIA[buscar(slug).category];

/** Colores de cada categoría. */
export const COLOR_CATEGORIA: Record<Categoria, { texto: string; borde: string; fondo: string; punto: string; hover: string }> = {
  creacionales: { texto: 'text-primary-container', borde: 'border-primary-container/30', fondo: 'bg-primary-container/10', punto: 'bg-primary-container', hover: 'hover:border-primary-container/50' },
  estructurales: { texto: 'text-tertiary-fixed-dim', borde: 'border-tertiary-fixed-dim/30', fondo: 'bg-tertiary-fixed-dim/10', punto: 'bg-tertiary-fixed-dim', hover: 'hover:border-tertiary-fixed-dim/50' },
  comportamiento: { texto: 'text-secondary-container', borde: 'border-secondary-container/30', fondo: 'bg-secondary-container/10', punto: 'bg-secondary-container', hover: 'hover:border-secondary-container/50' },
};
