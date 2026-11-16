// JavaScript trae el patrón incorporado: el objeto nativo `Proxy` intercepta cualquier acceso a
// las propiedades de otro objeto. Aquí el `get` verifica permisos (proxy de protección) y crea la
// historia real solo la primera vez que se usa (proxy virtual), sin escribir un método por cada operación.

class HistoriaClinica {
  constructor(pacienteId) {
    console.log(`  (cargando la historia ${pacienteId} y sus estudios...)`);
    this.pacienteId = pacienteId;
  }
  diagnosticos() { return ['Hipertensión controlada']; }
  imagenes() { return [{ nombre: 'resonancia-2026-10.dcm', megas: 340 }]; }
}

/**
 * @param {string} pacienteId
 * @param {{ id: string, pacientesAsignados: string[] }} usuario
 * @returns {HistoriaClinica}  para quien lo usa, es una historia clínica normal
 */
export function crearHistoriaProtegida(pacienteId, usuario) {
  let real; // se crea al primer uso

  return /** @type {HistoriaClinica} */ (new Proxy({}, {
    get(_objetivo, propiedad) {
      if (!usuario.pacientesAsignados.includes(pacienteId)) {
        throw new Error(`Acceso denegado a la historia ${pacienteId}`);
      }
      real ??= new HistoriaClinica(pacienteId);
      const valor = real[propiedad];
      return typeof valor === 'function' ? valor.bind(real) : valor;
    },
  }));
}

// ── Uso ──
const medica = { id: 'dra-rios', pacientesAsignados: ['P-77'] };

const historia = crearHistoriaProtegida('P-77', medica);
console.log('Proxy creado: todavía no se cargó nada');
console.log(historia.diagnosticos());    // carga la historia la primera vez
console.log(historia.imagenes().length); // ya está cargada

const ajena = crearHistoriaProtegida('P-90', medica);
try {
  ajena.diagnosticos();
} catch (error) {
  console.log(error.message); // Acceso denegado a la historia P-90
}
