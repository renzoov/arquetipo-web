// El proxy es una clase que implementa la misma interfaz que el objeto real; `??=` resuelve la
// carga perezosa en una línea. JavaScript también ofrece el objeto nativo `Proxy`, útil para
// interceptar cualquier propiedad de forma genérica, pero una clase explícita es más clara y tipada.

interface Usuario { id: string; pacientesAsignados: string[] }
interface Imagen { nombre: string; megas: number }

export interface HistoriaClinica {
  readonly pacienteId: string;
  diagnosticos(): string[];
  imagenes(): Promise<Imagen[]>;
}

class HistoriaClinicaReal implements HistoriaClinica {
  constructor(readonly pacienteId: string) {}

  diagnosticos(): string[] {
    return ['Hipertensión controlada'];
  }

  async imagenes(): Promise<Imagen[]> {
    console.log('  (descargando estudios del almacenamiento...)');
    return [{ nombre: 'resonancia-2026-10.dcm', megas: 340 }];
  }
}

export class ProxyHistoriaClinica implements HistoriaClinica {
  #imagenes?: Imagen[];

  constructor(private readonly real: HistoriaClinica, private readonly usuario: Usuario) {}

  get pacienteId(): string {
    return this.real.pacienteId;
  }

  diagnosticos(): string[] {
    this.#verificarAcceso();
    return this.real.diagnosticos();
  }

  async imagenes(): Promise<Imagen[]> {
    this.#verificarAcceso();
    return (this.#imagenes ??= await this.real.imagenes()); // solo se descarga la primera vez
  }

  #verificarAcceso(): void {
    if (!this.usuario.pacientesAsignados.includes(this.real.pacienteId)) {
      throw new Error(`Acceso denegado a la historia ${this.real.pacienteId}`);
    }
  }
}

// ── Uso ──
const medica: Usuario = { id: 'dra-rios', pacientesAsignados: ['P-77'] };
const historia: HistoriaClinica = new ProxyHistoriaClinica(new HistoriaClinicaReal('P-77'), medica);

console.log(historia.diagnosticos());             // no descarga imágenes
console.log((await historia.imagenes()).length);  // descarga
console.log((await historia.imagenes()).length);  // reutiliza lo ya cargado

const ajena = new ProxyHistoriaClinica(new HistoriaClinicaReal('P-90'), medica);
try {
  ajena.diagnosticos();
} catch (error) {
  console.log((error as Error).message); // Acceso denegado a la historia P-90
}
