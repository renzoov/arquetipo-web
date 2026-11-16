// Resaltado de los fragmentos de código del contenido (TypeScript), con los comentarios en el idioma de la página.
import { codeToHtml } from 'shiki';
import type { Idioma } from '../i18n/idiomas.ts';
import { traducirComentarios } from '../i18n/comentarios.ts';
import { COMENTARIOS_EN } from '../i18n/comentarios/en/index.ts';

export const TEMA_CODIGO = 'tokyo-night';

/** Traduce los comentarios de un fragmento de TypeScript. */
export function traducirCodigoTs(codigo: string, idioma: Idioma): string {
  return idioma === 'en' ? traducirComentarios(codigo, { marcador: '//' }, COMENTARIOS_EN) : codigo;
}

/** HTML resaltado de un fragmento de TypeScript del contenido, con los comentarios traducidos. */
export function resaltarTs(codigo: string, idioma: Idioma): Promise<string> {
  return codeToHtml(traducirCodigoTs(codigo, idioma), { lang: 'typescript', theme: TEMA_CODIGO });
}
