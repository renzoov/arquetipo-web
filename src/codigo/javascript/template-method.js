// Sin `abstract`, el paso obligatorio lanza un error en la clase base. Los ganchos son métodos con
// una implementación por defecto, y el paso común es privado (`#`), así que ninguna subclase
// puede alterarlo.

/** @typedef {{ nombre: string, sueldoBase?: number, subvencion?: number, horas?: number, tarifaHora?: number, hijos?: number }} Empleado */

const redondear = (n) => Math.round(n * 100) / 100;

export class CalculoNomina {
  // Método plantilla: el orden de los pasos es siempre el mismo
  /** @param {Empleado} empleado */
  calcularNomina(empleado) {
    const bruto = this.ingresoBruto(empleado);
    const descuentos = this.#descuentosDeLey(bruto);
    const bonificaciones = this.bonificaciones(empleado);
    return { empleado: empleado.nombre, bruto, descuentos, bonificaciones, neto: redondear(bruto - descuentos + bonificaciones) };
  }

  /** @param {Empleado} _empleado @returns {number} */
  ingresoBruto(_empleado) {
    throw new Error(`${this.constructor.name} debe implementar ingresoBruto()`); // paso obligatorio
  }

  /** @param {Empleado} _empleado */
  bonificaciones(_empleado) { return 0; }  // gancho
  aportaPension() { return true; }    // gancho

  #descuentosDeLey(bruto) {          // paso común
    return this.aportaPension() ? redondear(bruto * 0.13) : 0;
  }
}

export class NominaPlanilla extends CalculoNomina {
  ingresoBruto(e) { return e.sueldoBase; }
  bonificaciones(e) { return e.hijos > 0 ? 100 : 0; }
}

export class NominaPracticante extends CalculoNomina {
  ingresoBruto(e) { return e.subvencion; }
  aportaPension() { return false; }
}

export class NominaPorHoras extends CalculoNomina {
  ingresoBruto(e) { return e.horas * e.tarifaHora; }
}

// ── Uso ──
console.log(new NominaPlanilla().calcularNomina({ nombre: 'Ana', sueldoBase: 4000, hijos: 2 }));
console.log(new NominaPracticante().calcularNomina({ nombre: 'Leo', subvencion: 1200 }));
console.log(new NominaPorHoras().calcularNomina({ nombre: 'Rosa', horas: 80, tarifaHora: 25 }));
