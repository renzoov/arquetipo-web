// El memento es un objeto congelado que solo muestra su etiqueta; el estado real se guarda en un
// `WeakMap` privado del módulo, la forma clásica de JavaScript de asociar datos ocultos a un
// objeto. Quien guarda los mementos no puede leer ni modificar su contenido.

const estadosGuardados = new WeakMap(); // memento → copia del estado (invisible desde fuera)

const RECARGO = { gasolina: 0, hibrido: 4000, electrico: 9000 };

export function crearConfigurador() {
  let estado = { modelo: 'Sedán', motor: 'gasolina', caja: 'manual', accesorios: [], precio: 20000 };

  const recalcular = () => {
    estado.precio = 20000 + RECARGO[estado.motor] + estado.accesorios.length * 600;
  };

  return {
    elegirMotor(motor) {
      estado.motor = motor;
      if (motor === 'electrico') estado.caja = 'automatica'; // regla: no hay eléctricos manuales
      recalcular();
    },
    agregarAccesorio(accesorio) {
      estado.accesorios.push(accesorio);
      recalcular();
    },
    guardar(etiqueta) {
      const memento = Object.freeze({ etiqueta });
      estadosGuardados.set(memento, structuredClone(estado));
      return memento;
    },
    restaurar(memento) {
      estado = structuredClone(estadosGuardados.get(memento));
    },
    resumen() {
      return `${estado.modelo} ${estado.motor}/${estado.caja} [${estado.accesorios.join(', ')}] ${estado.precio} USD`;
    },
  };
}

export function crearHistorial(configurador) {
  const pila = [];
  return {
    guardar: (etiqueta) => pila.push(configurador.guardar(etiqueta)),
    deshacer() {
      const memento = pila.pop();
      if (memento) configurador.restaurar(memento);
      return memento?.etiqueta;
    },
  };
}

// ── Uso ──
const config = crearConfigurador();
const historial = crearHistorial(config);

historial.guardar('base');
config.elegirMotor('electrico');
historial.guardar('eléctrico');
config.agregarAccesorio('Techo solar');
console.log(config.resumen()); // Sedán electrico/automatica [Techo solar] 29600 USD

console.log('Volver a:', historial.deshacer());
console.log(config.resumen()); // Sedán electrico/automatica [] 29000 USD
console.log('Volver a:', historial.deshacer());
console.log(config.resumen()); // Sedán gasolina/manual [] 20000 USD
