// Motor de los ejercicios (se ejecuta en el navegador): sorteo de preguntas, mezcla de alternativas,
// memoria de las preguntas recientes y dibujo de una pregunta con su corrección inmediata.

export interface PreguntaCliente {
  id: string;
  tema: string;
  pregunta: string;
  correcta: string;
  incorrectas: string[];
  explicacion: string;
  /** Código ya resaltado al compilar (HTML de confianza generado por Shiki). */
  codigoHtml?: string;
}

export interface TemaCliente {
  id: string;
  nombre: string;
  href: string;
}

export interface Cuota {
  temas: string[];
  cantidad: number;
}

/** Copia mezclada al azar (Fisher-Yates). */
export function barajar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Elige las preguntas de un intento: reparte cada cuota entre sus temas (en orden aleatorio, para que
 * todos salgan parejo) y dentro de cada tema prioriza las preguntas que no salieron hace poco.
 */
export function sortear(preguntas: PreguntaCliente[], cuotas: Cuota[], recientes: Set<string>): PreguntaCliente[] {
  const elegidas: PreguntaCliente[] = [];
  for (const cuota of cuotas) {
    const temas = barajar(cuota.temas);
    const base = Math.floor(cuota.cantidad / temas.length);
    let sobrantes = cuota.cantidad % temas.length;
    for (const tema of temas) {
      const cantidad = base + (sobrantes > 0 ? 1 : 0);
      if (sobrantes > 0) sobrantes--;
      if (!cantidad) continue;
      const delTema = barajar(preguntas.filter((p) => p.tema === tema));
      const nuevas = delTema.filter((p) => !recientes.has(p.id));
      const vistas = delTema.filter((p) => recientes.has(p.id));
      elegidas.push(...[...nuevas, ...vistas].slice(0, cantidad));
    }
  }
  return barajar(elegidas);
}

// ── Memoria en el navegador (puede no estar disponible: modo privado, cookies bloqueadas…) ──
export function leerJson<T>(clave: string, porDefecto: T): T {
  try {
    const texto = localStorage.getItem(clave);
    return texto ? (JSON.parse(texto) as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}

export function guardarJson(clave: string, valor: unknown): void {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    /* sin almacenamiento: el intento funciona igual, solo no se recuerda */
  }
}

export const claveRecientes = (seccion: string) => `arquetipo-ejercicios-recientes-${seccion}`;
export const claveMejor = (seccion: string) => `arquetipo-ejercicios-mejor-${seccion}`;

export interface Resultado {
  aciertos: number;
  total: number;
}

// ── Dibujo de una pregunta ──
const LETRAS = ['A', 'B', 'C', 'D'];

export const escapar = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const codigo = (s: string) => `<code class="font-code text-[0.9em] text-primary-container">${s}</code>`;

/**
 * Escapa el texto y muestra el código con fuente monoespaciada: lo que va entre `acentos graves`
 * y las llamadas como retirar(monto) o Integer.valueOf().
 */
export function conCodigo(s: string): string {
  return s
    .split(/(`[^`]+`)/)
    .map((parte) =>
      parte.startsWith('`') && parte.endsWith('`') && parte.length > 1
        ? codigo(escapar(parte.slice(1, -1)))
        : escapar(parte).replace(/\b[\w.#]+\([^()]*\)/g, (llamada) => codigo(llamada)),
    )
    .join('');
}

interface OpcionesDibujo {
  /** Tema de la pregunta: se muestra solo después de responder, para no delatar la respuesta. */
  tema?: TemaCliente;
  /** Texto encima de la pregunta (por ejemplo, "Pregunta 3 de 10"). */
  encabezado?: string;
  alResponder: (acerto: boolean, elegida: string) => void;
}

/** Crea el bloque de una pregunta. Al elegir una alternativa se bloquea y muestra la corrección. */
export function dibujarPregunta(p: PreguntaCliente, { tema, encabezado, alResponder }: OpcionesDibujo): HTMLElement {
  const alternativas = barajar([p.correcta, ...p.incorrectas]);
  const caja = document.createElement('div');
  caja.className = 'pregunta flex flex-col gap-4';
  caja.innerHTML = `
    ${encabezado ? `<span class="font-telemetry text-xs text-on-surface-variant">${escapar(encabezado)}</span>` : ''}
    <p class="font-body text-base sm:text-lg text-slate-100 leading-relaxed">${conCodigo(p.pregunta)}</p>
    ${p.codigoHtml ? `<div class="shiki-wrapper shiki-plano rounded-lg border border-surface-container-high overflow-hidden">${p.codigoHtml}</div>` : ''}
    <div class="alternativas grid gap-2" role="group" aria-label="Alternativas">
      ${alternativas
        .map(
          (a, i) => `<button type="button" data-alternativa="${i}" class="alternativa group flex items-start gap-3 w-full text-left px-4 py-3 rounded-lg border border-surface-container-high bg-surface-container-low hover:border-primary-container/50 transition-colors disabled:cursor-default">
            <span class="letra shrink-0 w-6 h-6 rounded font-code text-xs font-bold flex items-center justify-center bg-surface-container-high text-on-surface-variant">${LETRAS[i]}</span>
            <span class="font-body text-sm text-slate-200 leading-relaxed">${conCodigo(a)}</span>
          </button>`,
        )
        .join('')}
    </div>
    <div class="correccion hidden p-4 rounded-lg border font-body text-sm text-slate-200 leading-relaxed" aria-live="polite"></div>`;

  const botones = [...caja.querySelectorAll<HTMLButtonElement>('.alternativa')];
  const correccion = caja.querySelector<HTMLElement>('.correccion')!;

  const responder = (indice: number) => {
    if (caja.dataset.respondida) return;
    caja.dataset.respondida = 'true';
    const elegida = alternativas[indice];
    const acerto = elegida === p.correcta;
    botones.forEach((b, i) => {
      b.disabled = true;
      const letra = b.querySelector<HTMLElement>('.letra')!;
      if (alternativas[i] === p.correcta) {
        b.classList.add('border-secondary-container/70', 'bg-secondary-container/10');
        letra.className = 'letra shrink-0 w-6 h-6 rounded font-code text-xs font-bold flex items-center justify-center bg-secondary-container text-on-secondary';
        letra.textContent = '✓';
      } else if (i === indice) {
        b.classList.add('border-rose-400/70', 'bg-rose-400/10');
        letra.className = 'letra shrink-0 w-6 h-6 rounded font-code text-xs font-bold flex items-center justify-center bg-rose-400 text-slate-950';
        letra.textContent = '✕';
      } else {
        b.classList.add('opacity-60');
      }
    });
    correccion.classList.remove('hidden');
    correccion.classList.add(acerto ? 'border-secondary-container/40' : 'border-rose-400/40', acerto ? 'bg-secondary-container/5' : 'bg-rose-400/5');
    correccion.innerHTML = `
      <strong class="${acerto ? 'text-secondary-container' : 'text-rose-300'}">${acerto ? '¡Correcto!' : 'No es correcto.'}</strong>
      ${conCodigo(p.explicacion)}
      ${tema ? `<a href="${escapar(tema.href)}" class="block mt-2 font-badge text-[11px] uppercase tracking-wider text-primary-container hover:text-primary-fixed">Repasar: ${escapar(tema.nombre)} →</a>` : ''}`;
    alResponder(acerto, elegida);
  };

  botones.forEach((b, i) => b.addEventListener('click', () => responder(i)));
  // Atajos de teclado: 1-4 o A-D eligen una alternativa mientras la pregunta está visible
  caja.addEventListener('keydown', (evento) => {
    const tecla = evento.key.toUpperCase();
    const indice = ['1', '2', '3', '4'].indexOf(tecla) >= 0 ? Number(tecla) - 1 : LETRAS.indexOf(tecla);
    if (indice >= 0 && indice < botones.length) responder(indice);
  });
  return caja;
}
