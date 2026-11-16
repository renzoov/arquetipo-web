// `abstract` marca el paso obligatorio, los métodos `protected` con implementación por defecto
// son ganchos que las subclases pueden sobrescribir, y el paso común es privado (`#`), así que
// ninguna subclase puede alterarlo.

export interface Empleado {
  nombre: string;
  sueldoBase?: number;
  subvencion?: number;
  horas?: number;
  tarifaHora?: number;
  hijos?: number;
}

export interface Boleta {
  empleado: string;
  bruto: number;
  descuentos: number;
  bonificaciones: number;
  neto: number;
}

const redondear = (n: number) => Math.round(n * 100) / 100;

export abstract class CalculoNomina {
  // Método plantilla: el orden de los pasos es siempre el mismo
  calcularNomina(e: Empleado): Boleta {
    const bruto = this.ingresoBruto(e);
    const descuentos = this.#descuentosDeLey(bruto);
    const bonificaciones = this.bonificaciones(e);
    return { empleado: e.nombre, bruto, descuentos, bonificaciones, neto: redondear(bruto - descuentos + bonificaciones) };
  }

  protected abstract ingresoBruto(e: Empleado): number;        // paso obligatorio
  protected bonificaciones(_e: Empleado): number { return 0; }  // gancho
  protected aportaPension(): boolean { return true; }           // gancho

  #descuentosDeLey(bruto: number): number {                      // paso común
    return this.aportaPension() ? redondear(bruto * 0.13) : 0;
  }
}

export class NominaPlanilla extends CalculoNomina {
  protected ingresoBruto(e: Empleado) { return e.sueldoBase ?? 0; }
  protected bonificaciones(e: Empleado) { return (e.hijos ?? 0) > 0 ? 100 : 0; }
}

export class NominaPracticante extends CalculoNomina {
  protected ingresoBruto(e: Empleado) { return e.subvencion ?? 0; }
  protected aportaPension() { return false; }
}

export class NominaPorHoras extends CalculoNomina {
  protected ingresoBruto(e: Empleado) { return (e.horas ?? 0) * (e.tarifaHora ?? 0); }
}

// ── Uso ──
console.log(new NominaPlanilla().calcularNomina({ nombre: 'Ana', sueldoBase: 4000, hijos: 2 }));
console.log(new NominaPracticante().calcularNomina({ nombre: 'Leo', subvencion: 1200 }));
console.log(new NominaPorHoras().calcularNomina({ nombre: 'Rosa', horas: 80, tarifaHora: 25 }));
