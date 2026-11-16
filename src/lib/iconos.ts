// Íconos de Material Symbols que usa la web, extraídos del código fuente al compilar.
// Así se descarga una fuente con solo esos íconos (unos pocos KB) en lugar de la completa (más de 1 MB),
// y un ícono nuevo se incluye solo, sin mantener una lista a mano.

const fuentes = import.meta.glob(['/src/**/*.astro', '/src/**/*.ts', '!/src/codigo/**'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const PATRONES = [
  /material-symbols-outlined[^>]*>([a-z_]+)</g, // <span class="material-symbols-outlined …">nombre</span>
  /\b(?:icono|icon|i): '([a-z_]+)'/g, // datos: { icono: 'nombre' }
];

const nombres = new Set<string>();
for (const texto of Object.values(fuentes)) {
  for (const patron of PATRONES) for (const [, nombre] of texto.matchAll(patron)) nombres.add(nombre);
}
if (!nombres.size) throw new Error('No se encontró ningún ícono de Material Symbols en el código');

/** URL de Google Fonts con solo los íconos usados (la API exige la lista en orden alfabético). */
export const URL_ICONOS = `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=${[...nombres].sort().join(',')}&display=block`;
