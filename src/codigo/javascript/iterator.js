// Una función generadora asíncrona (`async function*`) es el iterador: no hace falta ninguna clase.
// El cliente la recorre con `for await`, y el recorrido es perezoso: si sale del bucle antes,
// no se piden más páginas.

function crearApiCrm() {
  const clientes = ['Ana', 'Luis', 'Marta', 'Jorge', 'Elena'].map((nombre, i) => ({ id: i + 1, nombre }));
  const api = {
    peticiones: 0,
    async listarClientes({ limite, cursor }) {
      api.peticiones++;
      const desde = cursor ? Number(cursor) : 0;
      const hasta = desde + limite;
      return {
        datos: clientes.slice(desde, hasta),
        siguienteCursor: hasta < clientes.length ? String(hasta) : undefined,
      };
    },
  };
  return api;
}

export async function* clientesCrm(crm, limite = 2) {
  let cursor;
  do {
    const pagina = await crm.listarClientes({ limite, cursor });
    yield* pagina.datos;
    cursor = pagina.siguienteCursor;
  } while (cursor);
}

// ── Uso ──
const crm = crearApiCrm();
for await (const cliente of clientesCrm(crm)) {
  console.log(cliente.nombre);
}
console.log(`Peticiones a la API: ${crm.peticiones}`); // 3

const otroCrm = crearApiCrm();
for await (const cliente of clientesCrm(otroCrm)) {
  if (cliente.id === 2) break; // perezoso: no se piden más páginas
}
console.log(`Peticiones a la API: ${otroCrm.peticiones}`); // 1
