// Cada expresión de la gramática se crea con una pequeña función que devuelve un objeto con
// `interpretar` y `describir`. Las expresiones compuestas (`y`, `o`) cierran sobre sus partes,
// así que el árbol se arma combinando funciones, como si fuera el propio lenguaje de reglas.

const totalMayorQue = (limite) => ({
  interpretar: (carrito) => carrito.total > limite,
  describir: () => `total > ${limite}`,
});

const esClienteFrecuente = () => ({
  interpretar: (carrito) => carrito.clienteFrecuente,
  describir: () => 'cliente_frecuente',
});

const cuponIgual = (codigo) => ({
  interpretar: (carrito) => carrito.cupon === codigo,
  describir: () => `cupon = "${codigo}"`,
});

const y = (izquierda, derecha) => ({
  interpretar: (carrito) => izquierda.interpretar(carrito) && derecha.interpretar(carrito),
  describir: () => `(${izquierda.describir()} Y ${derecha.describir()})`,
});

const o = (izquierda, derecha) => ({
  interpretar: (carrito) => izquierda.interpretar(carrito) || derecha.interpretar(carrito),
  describir: () => `(${izquierda.describir()} O ${derecha.describir()})`,
});

// ── Uso ──
// Árbol de: total > 100 Y cliente_frecuente O cupon = "VERANO"
// (en la aplicación real lo construiría un parser a partir del texto)
const regla = o(y(totalMayorQue(100), esClienteFrecuente()), cuponIgual('VERANO'));

console.log(regla.describir());
console.log(regla.interpretar({ total: 150, clienteFrecuente: true }));                  // true
console.log(regla.interpretar({ total: 150, clienteFrecuente: false }));                 // false
console.log(regla.interpretar({ total: 20, clienteFrecuente: false, cupon: 'VERANO' })); // true
