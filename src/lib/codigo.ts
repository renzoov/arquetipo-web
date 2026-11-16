// Resaltado de código con Shiki.
import { codeToHtml } from 'shiki';

const TEMA_CODIGO = 'tokyo-night';

// El gris de los comentarios del tema (#51597d) no alcanza el contraste mínimo (4,5:1) sobre el fondo oscuro
const REEMPLAZOS_COLOR = { '#51597d': '#7a82ab' };

/** HTML resaltado de un fragmento de código (TypeScript por defecto). */
export function resaltar(codigo: string, lenguaje = 'typescript'): Promise<string> {
  return codeToHtml(codigo, { lang: lenguaje, theme: TEMA_CODIGO, colorReplacements: REEMPLAZOS_COLOR });
}
