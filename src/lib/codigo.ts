// Resaltado de código con Shiki.
import { codeToHtml } from 'shiki';

const TEMA_CODIGO = 'tokyo-night';

/** HTML resaltado de un fragmento de código (TypeScript por defecto). */
export function resaltar(codigo: string, lenguaje = 'typescript'): Promise<string> {
  return codeToHtml(codigo, { lang: lenguaje, theme: TEMA_CODIGO });
}
