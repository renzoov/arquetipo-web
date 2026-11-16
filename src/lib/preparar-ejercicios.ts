// Prepara las preguntas para enviarlas al navegador: el código de cada pregunta se resalta al compilar.
import type { Pregunta } from '../contenido/ejercicios/index.ts';
import type { PreguntaCliente } from './ejercicios.ts';
import { resaltar } from './codigo.ts';

export function prepararPreguntas(preguntas: Pregunta[]): Promise<PreguntaCliente[]> {
  return Promise.all(
    preguntas.map(async ({ codigo, ...resto }) => (codigo ? { ...resto, codigoHtml: await resaltar(codigo) } : resto)),
  );
}
