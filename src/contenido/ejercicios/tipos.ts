// Estructura de los bancos de preguntas de /ejercicios.
// Cada pregunta se escribe como una fila compacta; la alternativa correcta va primero y el orden
// de las alternativas se mezcla en el navegador en cada intento.

/** [pregunta, correcta, [tres incorrectas], explicación, código opcional (TypeScript)] */
export type Fila = [pregunta: string, correcta: string, incorrectas: [string, string, string], explicacion: string, codigo?: string];

export interface Pregunta {
  /** Identificador estable: tema y número (por ejemplo, "srp-04"). */
  id: string;
  tema: string;
  pregunta: string;
  correcta: string;
  incorrectas: [string, string, string];
  explicacion: string;
  codigo?: string;
}

/** Convierte las filas de cada tema en preguntas con id. */
export function banco(temas: Record<string, Fila[]>): Pregunta[] {
  return Object.entries(temas).flatMap(([tema, filas]) =>
    filas.map(([pregunta, correcta, incorrectas, explicacion, codigo], i) => ({
      id: `${tema}-${String(i + 1).padStart(2, '0')}`,
      tema,
      pregunta,
      correcta,
      incorrectas,
      explicacion,
      ...(codigo ? { codigo: codigo.replace(/^\n/, '').trimEnd() } : {}),
    })),
  );
}
