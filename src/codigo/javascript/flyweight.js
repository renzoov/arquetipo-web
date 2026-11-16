// Los formatos compartidos son objetos congelados con `Object.freeze`: intentar cambiar uno lanza
// un error (los módulos se ejecutan en modo estricto), así que nadie puede afectar a todas las
// celdas. La fábrica es una closure con un `Map` privado que devuelve siempre el mismo objeto.

function crearFabricaFormatos() {
  const cache = new Map();
  return {
    obtener(datos) {
      const clave = `${datos.fuente}|${datos.tamano}|${datos.color}|${datos.formatoNumero}`;
      if (!cache.has(clave)) cache.set(clave, Object.freeze({ ...datos }));
      return cache.get(clave);
    },
    get total() {
      return cache.size;
    },
  };
}

// ── Uso: 100 000 celdas ──
const fabrica = crearFabricaFormatos();
const celdas = [];

for (let fila = 0; fila < 1000; fila++) {
  for (let columna = 0; columna < 100; columna++) {
    const formato = fabrica.obtener({
      fuente: 'Inter',
      tamano: 11,
      color: fila === 0 ? '#000000' : '#333333',
      formatoNumero: columna === 0 ? '@' : '#,##0.00',
    });
    celdas.push({ fila, columna, valor: '', formato }); // estado propio + referencia compartida
  }
}

console.log(`${celdas.length} celdas comparten ${fabrica.total} formatos`); // 100000 celdas comparten 4 formatos
console.log(celdas[1].formato === celdas[2].formato);                      // true

try {
  celdas[1].formato.color = '#ff0000';
} catch (error) {
  console.log(error.constructor.name); // TypeError: los módulos usan modo estricto y el objeto está congelado
}
console.log(celdas[2].formato.color);  // #333333
