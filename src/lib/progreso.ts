// Progreso de estudio guardado en el navegador: qué páginas marcó el usuario como estudiadas.
// Claves: 'poo', 'diseno', 'solid' y 'patron:<slug>'. Al cambiar, se emite el evento 'arquetipo:progreso'.

const CLAVE = 'arquetipo-progreso';
export const EVENTO_PROGRESO = 'arquetipo:progreso';

export function leerProgreso(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(CLAVE) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}

function guardar(progreso: Set<string>) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify([...progreso]));
  } catch {
    /* sin almacenamiento disponible: el progreso no se recuerda */
  }
  document.dispatchEvent(new CustomEvent(EVENTO_PROGRESO));
}

export function marcar(id: string, estudiado: boolean) {
  const progreso = leerProgreso();
  if (estudiado) progreso.add(id);
  else progreso.delete(id);
  guardar(progreso);
}

/** Borra solo las marcas de los ids indicados (por ejemplo, los 23 patrones). */
export function reiniciar(ids: string[]) {
  const progreso = leerProgreso();
  ids.forEach((id) => progreso.delete(id));
  guardar(progreso);
}
