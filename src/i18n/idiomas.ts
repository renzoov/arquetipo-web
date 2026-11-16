// Idiomas de la web. El español vive en la raíz (/patrones/...) y el inglés bajo /en (/en/patrones/...).
// Todas las páginas están en src/pages/[...idioma]/: el parámetro vale undefined para español y 'en' para inglés.

export const IDIOMAS = ['es', 'en'] as const;
export type Idioma = (typeof IDIOMAS)[number];
export const IDIOMA_POR_DEFECTO: Idioma = 'es';

/** Un texto en todos los idiomas de la web. */
export type Texto = Record<Idioma, string>;

export const NOMBRE_IDIOMA: Record<Idioma, string> = { es: 'Español', en: 'English' };

/** Parámetro `idioma` de getStaticPaths para cada idioma. */
export const parametroIdioma = (idioma: Idioma) => (idioma === IDIOMA_POR_DEFECTO ? undefined : idioma);

/** Rutas estáticas de una página sin otros parámetros, una por idioma. */
export const rutasPorIdioma = () =>
  IDIOMAS.map((idioma) => ({ params: { idioma: parametroIdioma(idioma) }, props: { idioma } }));

/** Idioma a partir del parámetro de la ruta. */
export function idiomaDe(parametro: string | undefined): Idioma {
  return IDIOMAS.find((i) => i === parametro) ?? IDIOMA_POR_DEFECTO;
}

/** Quita el prefijo de idioma de una ruta: /en/patrones/x → /patrones/x */
export function rutaBase(pathname: string): string {
  for (const idioma of IDIOMAS) {
    if (idioma === IDIOMA_POR_DEFECTO) continue;
    if (pathname === `/${idioma}` || pathname === `/${idioma}/`) return '/';
    if (pathname.startsWith(`/${idioma}/`)) return pathname.slice(idioma.length + 1);
  }
  return pathname || '/';
}

/** Ruta de la web en un idioma: ruta('en', '/patrones/x') → /en/patrones/x. Respeta #fragmentos. */
export function ruta(idioma: Idioma, destino: string): string {
  if (idioma === IDIOMA_POR_DEFECTO || !destino.startsWith('/')) return destino;
  return destino === '/' ? `/${idioma}/` : `/${idioma}${destino}`;
}

/** Elige el texto del idioma pedido. */
export const t = (texto: Texto, idioma: Idioma) => texto[idioma];
