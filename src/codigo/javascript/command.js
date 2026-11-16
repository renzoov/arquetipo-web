// Cada comando es un objeto creado por una función fábrica: la closure guarda los datos que
// necesita y los valores anteriores para poder deshacer. El invocador solo exige que el objeto
// tenga `ejecutar`, `deshacer` y `descripcion`.

function crearRepoProductos() {
  const productos = new Map([
    ['teclado', { id: 'teclado', categoria: 'perifericos', precio: 100, activo: true }],
    ['mouse', { id: 'mouse', categoria: 'perifericos', precio: 40, activo: true }],
    ['monitor', { id: 'monitor', categoria: 'pantallas', precio: 900, activo: true }],
  ]);
  return {
    deCategoria: async (categoria) => [...productos.values()].filter((p) => p.categoria === categoria),
    actualizar: async (id, cambios) => Object.assign(productos.get(id), cambios),
    listar: () => [...productos.values()].map((p) => `${p.id} ${p.precio}${p.activo ? '' : ' (inactivo)'}`),
  };
}

const ajustarPrecios = (repo, categoria, factor) => {
  const anteriores = new Map();
  return {
    descripcion: `Ajustar precios de ${categoria} ×${factor}`,
    async ejecutar() {
      for (const p of await repo.deCategoria(categoria)) {
        anteriores.set(p.id, p.precio);
        await repo.actualizar(p.id, { precio: Math.round(p.precio * factor * 100) / 100 });
      }
    },
    async deshacer() {
      for (const [id, precio] of anteriores) await repo.actualizar(id, { precio });
    },
  };
};

const desactivarProducto = (repo, id) => ({
  descripcion: `Desactivar ${id}`,
  ejecutar: () => repo.actualizar(id, { activo: false }),
  deshacer: () => repo.actualizar(id, { activo: true }),
});

export function crearInvocador() {
  const historial = [];
  return {
    async ejecutar(comando, usuario) {
      await comando.ejecutar();
      historial.push(comando);
      console.log(`[auditoría] ${usuario}: ${comando.descripcion}`);
    },
    async deshacerUltimo() {
      await historial.pop()?.deshacer();
    },
  };
}

// ── Uso ──
const repo = crearRepoProductos();
const panel = crearInvocador();

await panel.ejecutar(ajustarPrecios(repo, 'perifericos', 1.1), 'ana');
await panel.ejecutar(desactivarProducto(repo, 'monitor'), 'ana');
console.log(repo.listar()); // [ 'teclado 110', 'mouse 44', 'monitor 900 (inactivo)' ]

await panel.deshacerUltimo();
await panel.deshacerUltimo();
console.log(repo.listar()); // [ 'teclado 100', 'mouse 40', 'monitor 900' ]
